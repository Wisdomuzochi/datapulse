resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "15.17"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "datapulse_db"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible     = false
  skip_final_snapshot     = true
  backup_retention_period = 0
  multi_az                = false

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}