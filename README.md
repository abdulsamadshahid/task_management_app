# Task Management Application — AWS, Docker & Kubernetes

A containerized task management application deployed using AWS, Terraform, Docker, and Kubernetes. This project demonstrates Infrastructure as Code (IaC), CI/CD automation, container orchestration, and hands-on troubleshooting across application deployment environments.

## Architecture

The application consists of a React frontend, a Node.js/Express backend, and a PostgreSQL database.

The application was containerized with Docker and deployed using Docker Compose and Kubernetes (Kind) on AWS infrastructure.

## Tech Stack

- **Cloud:** AWS EC2, VPC, IAM, Amazon ECR
- **Infrastructure as Code:** Terraform
- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes (Kind)
- **CI/CD:** GitHub Actions
- **Authentication:** AWS IAM, OpenID Connect (OIDC)
- **Frontend:** React, Vite, Nginx
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Version Control:** Git, GitHub

## DevOps Implementation

### 1. AWS Infrastructure with Terraform

- Provisioned AWS infrastructure using Terraform for repeatable, version-controlled resource creation.
- Configured networking and security rules required for application access and connectivity.
- Used Infrastructure as Code to simplify infrastructure management and deployment.

### 2. Docker Containerization

- Containerized the frontend and backend application components.
- Configured PostgreSQL as the application's database service.
- Used Docker Compose to define application services and their connectivity.

### 3. CI/CD with GitHub Actions

- Automated Docker image builds and publishing to private Amazon ECR repositories.
- Configured GitHub Actions to authenticate with AWS through OIDC and IAM roles, avoiding long-lived AWS access keys.
- Automated deployment steps to reduce manual build-and-deploy operations.

### 4. Kubernetes Deployment with Kind

- Deployed the containerized application to a Kubernetes cluster running on an AWS EC2 instance using Kind.
- Used Kubernetes Deployments and Services to manage application workloads and service discovery.
- Configured application components to communicate through Kubernetes networking.
- Managed application configuration and sensitive values using Kubernetes ConfigMaps and Secrets where applicable.
- Investigated and resolved image pull failures, Service connectivity problems, configuration errors, and application health issues.

### 5. Troubleshooting and Validation

Worked through deployment issues involving:

- AWS security group and networking configuration.
- Docker container health and application connectivity.
- Kubernetes image pulls and workload configuration.
- Service selectors, ports, and application networking.
- Application health checks and backend-to-database connectivity.

Validated application functionality through health checks and API requests.

## Application Endpoints

| Endpoint | Purpose |
|---|---|
| `/health` | Backend health check |
| `/api/tasks` | Task management API |

## Key Learnings

- Provisioning AWS infrastructure using Terraform.
- Containerizing applications using Docker.
- Automating build and deployment workflows with GitHub Actions.
- Integrating AWS IAM OIDC authentication into CI/CD.
- Deploying containerized applications to a Kind Kubernetes cluster.
- Troubleshooting Kubernetes workloads, networking, configuration, and service discovery.
