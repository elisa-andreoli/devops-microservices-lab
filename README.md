# Expenses Management System - DevOps Training Lab

A microservices-based expense management application designed as a comprehensive DevOps training lab. This solution demonstrates modern containerization, orchestration, and CI/CD practices using different technology stacks.

## Architecture Overview

This lab simulates a real-world microservices architecture with multiple technology stacks:

- **Frontend** (React) - B2B web application with authentication and expense management
- **Backend** (Node.js/Express) - REST API service with JWT authentication and message publishing
- **Processor** (Python) - Integration service simulating third-party data processing
- **Lake Publisher** (C#) - Data lake integration service for analytics workflows
- **Database** (MongoDB) - Document-based data persistence
- **Message Queue** (RabbitMQ) - Asynchronous communication between services

## Training Objectives

Students will learn to:

1. **Containerization**: Create Dockerfiles and .dockerignore files for each service
2. **Local Orchestration**: Build docker-compose configuration for local development
3. **Kubernetes Deployment**: Design Helm charts for multi-environment deployments
4. **CI/CD Pipeline**: Implement GitHub Actions for automated testing, building, and deployment
5. **Microservices Patterns**: Understand service communication, data consistency, and integration patterns

## Prerequisites

Install the following on your system:

- **Node.js** (v16+) and npm
- **Python** (v3.8+) and pip
- **.NET 9.0 SDK** or later
- **MongoDB** (running on default port 27017)
- **RabbitMQ** (running on default port 5672)

## Quick Start

### 1. Backend API
```bash
cd packages/backend
npm install
npm start
```
Runs on: http://localhost:3000

### 2. Frontend Application
```bash
cd packages/frontend
npm install
npm start
```
Runs on: http://localhost:3030

### 3. Message Processor
```bash
cd packages/processor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python processor.py
```

### 4. Lake Publisher (Optional)
```bash
cd packages/lakepublisher
dotnet restore
dotnet run
```

## Features

### Frontend
- User authentication with username/password login
- Create, view, edit, delete expenses with exported status
- File attachment upload/download
- Modal-based expense details with inline editing
- Export status tracking and display
- Responsive design

### Backend
- JWT-based authentication with configurable users
- RESTful API with full CRUD operations
- File upload and secure download endpoints
- RabbitMQ message publishing for all operations
- MongoDB integration with Mongoose ODM
- Exported field management for data lake integration

### Processor
- Consumes RabbitMQ messages from backend
- Saves all expense events to JSON files
- Configurable output directory
- Graceful error handling

### Lake Publisher
- Token-based API authentication for secure access
- Exports approved expenses to Apache Parquet format
- Hierarchical date-based folder structure (yyyy/mm/dd)
- Updates exported status to prevent duplicates
- Configurable filtering and output paths

## Configuration

Each component uses environment variables:

- **Backend**: `packages/backend/.env`
- **Processor**: `packages/processor/.env`
- **Lake Publisher**: `packages/lakepublisher/.env`
- **Frontend**: Runtime configuration via `public/config.js`

## Lab Exercises

### Phase 1: Containerization
- Create Dockerfiles for each service (frontend, backend, processor, lakepublisher)
- Configure .dockerignore files to optimize build contexts
- Build and test individual container images

### Phase 2: Local Orchestration
- Design docker-compose.yml with all services, MongoDB, and RabbitMQ
- Configure service networking and environment variables
- Implement health checks and dependency management

### Phase 3: Kubernetes Deployment
- Create Helm charts for multi-environment deployment
- Configure ConfigMaps, Secrets, and persistent volumes
- Implement service discovery and load balancing
- Set up ingress controllers and SSL termination

### Phase 4: CI/CD Pipeline
- Build GitHub Actions workflows for automated testing
- Implement multi-stage builds and security scanning
- Configure automated deployment to staging and production
- Set up monitoring and alerting

## Development Workflow

1. Start MongoDB and RabbitMQ services
2. Start backend API server
3. Start frontend development server
4. Start message processor (simulates third-party integration)
5. Run lake publisher (simulates data lake integration)
6. Access application at http://localhost:3030

## Message Flow

```
Frontend → Backend API → MongoDB
                    ↓
                RabbitMQ → Processor → JSON Files
                    ↓
            Lake Publisher → Parquet Files
```

## Project Structure

```
packages/
├── backend/          # Node.js API server
├── frontend/         # React application
├── processor/        # Python message consumer
└── lakepublisher/    # C# data lake publisher
```

## Service Simulation Details

- **Frontend + Backend**: Simulates a B2B expense management platform
- **Python Processor**: Simulates integration with external audit systems (saves to filesystem but could send to third-party APIs)
- **C# Lake Publisher**: Simulates data lake integration for analytics and reporting workflows

## Expected Deliverables

1. **Dockerfiles** for each service with optimized layers
2. **.dockerignore** files to minimize build contexts
3. **docker-compose.yml** for local development environment
4. **Helm charts** for Kubernetes deployment across environments
5. **GitHub Actions workflows** for CI/CD automation
6. **Documentation** explaining architectural decisions and deployment strategies

For detailed setup and configuration of individual services, see README files in each package directory.