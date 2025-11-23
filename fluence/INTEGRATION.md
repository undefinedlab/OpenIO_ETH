# Fluence Network Integration

This folder contains the Fluence Network integration for OpenIO, allowing deployment of compute instances to the decentralized Fluence compute marketplace.

## Structure

- `test-compute.js` - Simple test computing application that performs basic arithmetic operations
- `package.json` - Node.js package configuration
- `test.js` - Test suite for the compute application
- `README.md` - Documentation for the test compute application

## API Integration

The Fluence API integration is located at:
- `app/api/fluence/deploy/route.ts` - API route for deploying VMs to Fluence Network

## API Key

The API key is currently hardcoded in the deployment route. For production use, it should be moved to environment variables:

```env
FLUENCE_API_KEY=98d46caf-914b-4143-b5ce-e9f2a8f2135b
```

## Usage

### From the Deploy Page

1. Navigate to `/dapp/deploy`
2. Write or select your code
3. Click "Deploy to Fluence" button
4. The system will:
   - Search for available compute resources
   - Deploy a VM with default configuration (1 CPU, 512MB RAM, 10GB disk)
   - Monitor deployment status
   - Display results in the terminal

### API Endpoints

#### POST `/api/fluence/deploy`
Deploy a new VM instance.

Request body:
```json
{
  "sourceCode": "optional source code",
  "config": {
    "cpu": 1,
    "memory": 512,
    "disk": 10,
    "region": "us-east-1"
  }
}
```

Response:
```json
{
  "success": true,
  "deploymentId": "vm-123",
  "config": { ... },
  "statusUrl": "..."
}
```

#### GET `/api/fluence/deploy?id={deploymentId}`
Get deployment status.

Response:
```json
{
  "success": true,
  "deploymentId": "vm-123",
  "status": "running",
  "deployment": { ... }
}
```

## Test Compute Application

The test compute application supports the following operations:
- `add` - Addition
- `subtract` - Subtraction
- `multiply` - Multiplication
- `divide` - Division

Example request:
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

Example response:
```json
{
  "success": true,
  "result": 15,
  "operation": "add",
  "inputs": { "a": 10, "b": 5 },
  "timestamp": "2025-01-23T12:00:00.000Z"
}
```

## Resources

- [Fluence Console Documentation](https://fluence.dev/docs/build/overview)
- [Fluence Console](https://console.fluence.network)

