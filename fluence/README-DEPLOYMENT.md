# Fluence VM Deployment Guide

## VM Information

- **VM ID:** `019ab0f5-2c17-7b53-a36b-2cb73ac5bddc`
- **IPv4:** `81.15.150.156`
- **User:** `ubuntu`
- **SSH Command:** `ssh ubuntu@81.15.150.156`

## Quick Start

### 1. Generate SSH Key

```bash
cd fluence
node generate-key-simple.js 2048
```

Copy the public key and add it to Fluence dashboard.

### 2. Test Connection

```bash
ssh -i keys/fluence-ssh-key ubuntu@81.15.150.156
```

### 3. Deploy Compute Application

```bash
bash deploy-compute.sh
```

### 4. Run Computation from UI

1. Navigate to `/dapp/deploy`
2. Click "▶ Run on Fluence" button
3. Watch the terminal for results

## API Usage

### Run Computation

```bash
curl -X POST http://localhost:3000/api/fluence/run \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "add",
    "a": 10,
    "b": 5
  }'
```

### Response

```json
{
  "success": true,
  "vmId": "019ab0f5-2c17-7b53-a36b-2cb73ac5bddc",
  "vmIp": "81.15.150.156",
  "computation": {
    "success": true,
    "result": 15,
    "operation": "add",
    "inputs": { "a": 10, "b": 5 },
    "timestamp": "2025-01-23T12:00:00.000Z"
  }
}
```

## Environment Variables

Add to `.env.local`:

```env
FLUENCE_VM_IP=81.15.150.156
FLUENCE_VM_USER=ubuntu
FLUENCE_VM_ID=019ab0f5-2c17-7b53-a36b-2cb73ac5bddc
FLUENCE_SSH_KEY_PATH=fluence/keys/fluence-ssh-key
```

## Supported Operations

- `add` - Addition
- `subtract` - Subtraction
- `multiply` - Multiplication
- `divide` - Division

## Troubleshooting

### SSH Connection Issues

1. Make sure SSH key is added to Fluence dashboard
2. Check key permissions: `chmod 600 keys/fluence-ssh-key`
3. Test connection manually: `ssh -i keys/fluence-ssh-key ubuntu@81.15.150.156`

### Node.js Not Found

The API will automatically fallback to Python3 if Node.js is not available on the VM.

### Permission Denied

Make sure the SSH key has correct permissions:
```bash
chmod 600 fluence/keys/fluence-ssh-key
```

