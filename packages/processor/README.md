# Message Processor - Integration Service

A Python application that simulates third-party integration services in the DevOps training lab. This service demonstrates asynchronous message processing and external system integration patterns.

## Service Role in Training Lab

This processor service simulates integration with external audit and compliance systems:

- **Message Consumption**: Demonstrates asynchronous microservices communication
- **Third-party Integration**: Simulates sending data to external systems (currently saves to filesystem)
- **Event Processing**: Handles all expense lifecycle events for audit trails
- **Scalable Architecture**: Shows how to process messages independently of main application flow

## DevOps Learning Objectives

- **Python Containerization**: Learn to containerize Python applications with virtual environments
- **Message Queue Integration**: Understand service-to-service communication patterns
- **Persistent Storage**: Configure volume mounts for data persistence
- **Scaling Patterns**: Deploy multiple instances for high-throughput processing
- **Monitoring**: Implement health checks and message processing metrics

## Installation

1. Navigate to the processor directory:
   ```bash
   cd packages/processor
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Create a `.env` file or set environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `RABBITMQ_URL` | RabbitMQ connection URL | amqp://localhost |
| `RABBITMQ_VHOST` | RabbitMQ virtual host | / |
| `RABBITMQ_EXCHANGE` | Exchange name to consume from | expenses_exchange |
| `OUTPUT_FOLDER` | Directory to save message files | ./messages |

## Running the Application

1. Activate the virtual environment (if not already active):
   ```bash
   source venv/bin/activate
   ```

2. Start the message processor:
   ```bash
   python processor.py
   ```

3. To stop and deactivate:
   ```bash
   # Press Ctrl+C to stop the processor
   deactivate
   ```

The application will:
1. Connect to RabbitMQ
2. Create a temporary queue bound to the exchange
3. Listen for all expense messages (expense.*)
4. Save each message to a timestamped JSON file

## Output Format

Messages are saved as JSON files with the naming pattern:
```
YYYYMMDD_HHMMSS_microseconds_routing_key.json
```

Example: `20241201_143022_123456_expense.created.json`

## Message Structure

Each file contains the message payload from the backend:
```json
{
  "action": "created|updated|deleted",
  "entity": "expense",
  "data": {
    "_id": "expense_id",
    "title": "Expense Title",
    "comment": "Description",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-02T00:00:00.000Z",
    "status": "Pending",
    "attachment": "path/to/file"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Testing

Run the test suite:

```bash
# Activate virtual environment first
source venv/bin/activate

# Install test dependencies (if not already installed)
pip install -r requirements.txt

# Run tests
pytest
```

Run tests with verbose output:

```bash
pytest -v
```

The tests cover:
- Message processing functionality
- RabbitMQ connection handling
- File writing operations
- Error handling scenarios

## Dependencies

- **pika 1.3.2** - RabbitMQ client library
- **python-dotenv 1.0.0** - Environment variable loader

### Dev Dependencies
- **pytest 7.4.3** - Testing framework
- **pytest-mock 3.12.0** - Mocking utilities

## Lab Exercise Notes

**For Docker**: Students should manage Python dependencies, virtual environments, and persistent volume mounts for message storage.
**For Kubernetes**: Configure as a Deployment with multiple replicas, persistent volumes, and proper resource limits.
**For CI/CD**: Implement testing for message processing logic and integration with RabbitMQ.

## Real-world Simulation

In production, this service would:
- Send audit data to compliance systems
- Trigger workflows in external business process management tools
- Forward events to analytics platforms
- Integrate with third-party APIs for data enrichment

The filesystem storage simulates these integrations for training purposes.

## Usage

1. Ensure RabbitMQ is running and configured
2. Start the backend application (message publisher)
3. Start the processor application
4. Perform operations in the frontend to generate messages
5. Check the output folder for saved message files (simulating third-party integration)

## Stopping the Application

Press `Ctrl+C` to gracefully stop the consumer and close the connection.

To deactivate the virtual environment:
```bash
deactivate
```

## Future Runs

For subsequent runs, only activate the virtual environment:
```bash
cd packages/processor
source venv/bin/activate
python processor.py
```