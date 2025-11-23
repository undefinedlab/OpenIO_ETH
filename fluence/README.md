# Fluence Test Compute Application

Simple test computing application for Fluence Network deployment.

## Features

- Basic arithmetic operations (add, subtract, multiply, divide)
- Simple request/response processing
- Error handling
- Timestamp tracking

## Usage

The application processes compute requests with the following format:

```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

Supported operations:
- `add` - Addition
- `subtract` - Subtraction
- `multiply` - Multiplication
- `divide` - Division

## Response Format

```json
{
  "success": true,
  "result": 15,
  "operation": "add",
  "inputs": { "a": 10, "b": 5 },
  "timestamp": "2025-01-23T12:00:00.000Z"
}
```

