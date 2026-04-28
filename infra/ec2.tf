data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/id_ed25519.pub")
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.main.key_name

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  user_data = <<-USERDATA
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get upgrade -y
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
    apt-get install -y docker-compose-plugin git awscli
    cd /home/ubuntu
    git clone https://github.com/Wisdomuzochi/datapulse.git
    cd datapulse
    cat > .env << 'ENVFILE'
    POSTGRES_USER=${var.db_username}
    POSTGRES_PASSWORD=${var.db_password}
    POSTGRES_DB=datapulse_db
    POSTGRES_HOST=${aws_db_instance.main.address}
    POSTGRES_PORT=5432
    REDIS_URL=redis://redis:6379/0
    APP_ENV=production
    DEBUG=false
    ENVFILE
    docker compose up -d --build
  USERDATA

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}