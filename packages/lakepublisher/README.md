# Lake Publisher - Data Lake Integration Service

A C# console application that simulates data lake integration workflows in the DevOps training lab. This service demonstrates batch processing, data transformation, and analytics pipeline patterns.

## Service Role in Training Lab

This lake publisher service simulates data lake and analytics integration:

- **Batch Processing**: Demonstrates scheduled data export workflows
- **Data Transformation**: Converts operational data to analytics-ready format (Parquet)
- **API Integration**: Shows service-to-service authentication and data retrieval
- **Data Partitioning**: Implements hierarchical folder structures for efficient querying
- **Idempotency**: Prevents duplicate processing with status tracking
- **Analytics Pipeline**: Simulates feeding data to business intelligence systems

## DevOps Learning Objectives

- **.NET Containerization**: Learn to containerize .NET applications with proper base images
- **Scheduled Jobs**: Configure as Kubernetes CronJobs for automated execution
- **Data Persistence**: Manage persistent volumes for data lake storage
- **Service Authentication**: Handle API tokens and service-to-service security
- **Monitoring**: Implement job completion tracking and failure alerting

## Prerequisites

- **.NET 9.0 SDK** or later
- **Expenses API** running and accessible

## Installation

1. Navigate to the lakepublisher directory:
   ```bash
   cd packages/lakepublisher
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

## Configuration

Set environment variables or modify the `.env` file:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `API_BASE_URL` | Base URL of the Expenses API | http://localhost:3000 |
| `TARGET_STATUS` | Status of expenses to export | Approved |
| `BASE_PATH` | Base directory for data lake structure | ./data |
| `API_TOKEN` | Authentication token for API access | lakepublisher-token-2024 |

## Running the Application

### Using dotnet run:
```bash
dotnet run
```

### Using environment variables:
```bash
export API_BASE_URL=http://localhost:3000
export TARGET_STATUS=Approved
export BASE_PATH=/data/lake
export API_TOKEN=your-service-token
dotnet run
```

### Building and running executable:
```bash
dotnet build
dotnet publish -c Release
./bin/Release/net9.0/lakepublisher
```

## Application Flow

1. **Connect to API**: Establishes authenticated connection to the Expenses API
2. **Fetch All Expenses**: Retrieves complete list of expenses via GET /api/expenses with token authentication
3. **Filter Data**: Applies filters:
   - Status matches `TARGET_STATUS` environment variable
   - End date equals previous day (yesterday)
   - Exported flag is false (not previously exported)
4. **Export to Parquet**: Saves filtered data in Apache Parquet format
5. **Update Status**: Marks exported expenses as exported=true
6. **Exit**: Application terminates after successful export

## Output Format

The Parquet file contains the following columns:
- **id** (string) - Expense ID
- **title** (string) - Expense title
- **comment** (string) - Expense description
- **startDate** (DateTime) - Start date
- **endDate** (DateTime?) - End date (nullable)
- **status** (string) - Expense status
- **attachment** (string) - Attachment file path
- **exported** (boolean) - Export status flag

## File Structure

The application creates a hierarchical folder structure:
```
BASE_PATH/
└── yyyy/           # Year folder
    └── mm/         # Month folder
        └── dd/     # Day folder
            └── expenses.parquet
```

Example: `./data/2024/12/01/expenses.parquet`

## Example Output

```
Fetching expenses with status: Approved
Target date: 2024-12-01
Output path: ./data/2024/12/01/expenses.parquet
Matching expense IDs:
  - 507f1f77bcf86cd799439011
  - 507f191e810c19729de860ea
  - 507f191e810c19729de860eb
Found 3 matching expenses
Created directory: ./data/2024/12/01
Data exported to ./data/2024/12/01/expenses.parquet
  Updated exported status for: 507f1f77bcf86cd799439011
  Updated exported status for: 507f191e810c19729de860ea
  Updated exported status for: 507f191e810c19729de860eb
Updated exported status for all expenses
```

## Lab Exercise Notes

**For Docker**: Students should use multi-stage builds with .NET SDK for building and runtime images for execution.
**For Kubernetes**: Deploy as CronJob with persistent volume claims for data storage and proper resource limits.
**For CI/CD**: Implement testing for data transformation logic and integration testing with API endpoints.

## Real-world Simulation

In production, this service would:
- Export data to cloud data lakes (AWS S3, Azure Data Lake, GCP BigQuery)
- Trigger downstream analytics workflows
- Feed data warehouses and business intelligence platforms
- Generate reports for compliance and auditing

The local Parquet files simulate these data lake integrations for training purposes.

## Batch Processing Pattern

This service demonstrates the batch processing pattern common in data engineering:
- **Scheduled Execution**: Runs on a daily schedule to process previous day's data
- **Incremental Processing**: Only processes new/unprocessed records
- **Data Partitioning**: Organizes output by date for efficient querying
- **Status Tracking**: Maintains processing state to ensure data consistency

## Dependencies

- **Parquet.Net 5.2.0** - Apache Parquet file format support
- **Newtonsoft.Json 13.0.4** - JSON serialization/deserialization

## Error Handling

The application handles common errors:
- API connection failures
- Authentication failures (invalid token)
- Invalid JSON responses
- File system write permissions
- Missing environment variables

Exit codes:
- **0** - Success
- **1** - Error occurred