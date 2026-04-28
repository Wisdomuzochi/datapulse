output "ec2_public_ip" {
  description = "Public IP of the DataPulse EC2 instance"
  value       = aws_instance.main.public_ip
}

output "frontend_url" {
  description = "DataPulse frontend URL"
  value       = "http://${aws_instance.main.public_ip}"
}

output "api_url" {
  description = "DataPulse API URL"
  value       = "http://${aws_instance.main.public_ip}:8000"
}

output "grafana_url" {
  description = "Grafana monitoring URL"
  value       = "http://${aws_instance.main.public_ip}:3000"
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.main.bucket
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.address
  sensitive   = true
}