
# Expenses API - Backend Service

A Node.js Express REST API service that forms the core of the DevOps training lab's B2B expense management simulation. This service demonstrates modern API design, authentication, and microservices communication patterns.

## Service Role in Training Lab

This backend service simulates a B2B expense management platform and demonstrates:

- **API Design**: RESTful endpoints with proper HTTP methods and status codes
- **Authentication**: JWT tokens for users and service-to-service communication
- **Data Persistence**: MongoDB integration with document-based storage
- **Event Publishing**: RabbitMQ integration for asynchronous microservices communication
- **File Management**: Upload/download capabilities for document attachments
- **Configuration Management**: Environment-based configuration for different deployment environments

## DevOps Learning Objectives

- **Containerization**: Students will create Dockerfiles for Node.js applications
- **Service Dependencies**: Learn to manage database and message queue connections
- **Environment Configuration**: Understand configuration management across environments
- **Health Checks**: Implement readiness and liveness probes for Kubernetes
- **Security**: Manage secrets and authentication in containerized environments

## Installation

1. Navigate to the backend directory:
   ```bash
   cd packages/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Ensure MongoDB and RabbitMQ are running
2. Configure environment variables (see below)
3. Start the application:
   ```bash
   npm start
   ```

The server will start on port 3000 (or the port specified in PORT environment variable).

## Environment Variables

The application uses the following environment variables:

| Variable           | Description                                       | Default Value        |
|--------------------|---------------------------------------------------|----------------------|
| `PORT`             | The port on which the server will run.           | 3000                 |
| `MONGO_URI`        | The connection string for the MongoDB database.  | -                    |
| `UPLOAD_PATH`      | The path to the directory where uploaded files will be stored. | -     |
| `RABBITMQ_URL`     | The RabbitMQ connection URL.                      | amqp://localhost     |
| `RABBITMQ_VHOST`   | The RabbitMQ virtual host.                        | /                    |
| `RABBITMQ_EXCHANGE`| The RabbitMQ exchange name for publishing messages. | expenses_exchange |
| `JWT_SECRET`       | Secret key for JWT token signing.                    | expenses-secret-key |

Create a `.env` file in the `packages/backend` directory and add the environment variables.

## Lab Exercise Notes

**For Docker**: Students should configure environment variables via container environment or mounted config files.
**For Kubernetes**: Use ConfigMaps for non-sensitive data and Secrets for authentication tokens.
**For CI/CD**: Environment variables should be managed through GitHub Secrets and deployment-specific configurations.

## Authentication

The API uses JWT-based authentication. Users and service tokens are configured in `auth.json`:

```json
{
  "users": [
    { "username": "admin", "password": "admin123" },
    { "username": "user", "password": "user123" }
  ],
  "tokens": [
    "lakepublisher-token-2024"
  ]
}
```

### Authentication Methods:
- **JWT Tokens**: For frontend users via `/api/auth/login`
- **Service Tokens**: For service-to-service communication (C# app)

### Usage:
```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token in requests
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/expenses
```

## RabbitMQ Integration

The application publishes messages to RabbitMQ for the following events:
- **expense.created** - When a new expense is created
- **expense.updated** - When an expense is updated
- **expense.deleted** - When an expense is deleted

Messages are published to a topic exchange with routing keys following the pattern `expense.{action}`. Each message contains:
```json
{
  "action": "created|updated|deleted",
  "entity": "expense",
  "data": { /* expense data */ },
  "timestamp": "ISO date string"
}
```

## File Management

Uploaded files are stored in the directory specified by `UPLOAD_PATH`. Files can be downloaded via the `/api/download/:filename` endpoint.

## API Endpoints

The following API endpoints are available:

| Method | Endpoint          | Description                | Auth Required |
|--------|-------------------|----------------------------|---------------|
| POST   | `/api/auth/login`   | User authentication.       | No            |
| GET    | `/api/expenses`     | Get all expenses.          | Yes           |
| POST   | `/api/expenses`     | Create a new expense.      | Yes           |
| GET    | `/api/expenses/:id` | Get a single expense.      | Yes           |
| PUT    | `/api/expenses/:id` | Update an expense.         | Yes           |
| DELETE | `/api/expenses/:id` | Delete an expense.         | Yes           |
| GET    | `/api/download/:filename` | Download uploaded file. | Yes           |

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The tests cover:
- API endpoint functionality
- RabbitMQ service integration
- Error handling scenarios

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **multer** - File upload middleware
- **amqplib** - RabbitMQ client
- **cors** - Cross-origin resource sharing
- **jsonwebtoken** - JWT token generation and verification
- **dotenv** - Environment variable loader

### Dev Dependencies
- **jest** - Testing framework
- **supertest** - HTTP assertion library
