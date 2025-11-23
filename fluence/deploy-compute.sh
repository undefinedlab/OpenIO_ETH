#!/bin/bash
# Deploy compute application to Fluence VM

VM_IP="${FLUENCE_VM_IP:-81.15.150.156}"
VM_USER="${FLUENCE_VM_USER:-ubuntu}"
SSH_KEY="${FLUENCE_SSH_KEY:-fluence/keys/fluence-ssh-key}"

echo "🚀 Deploying compute application to Fluence VM..."
echo "VM: ${VM_USER}@${VM_IP}"

# Copy test compute application
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no fluence/test-compute.js ${VM_USER}@${VM_IP}:/tmp/test-compute.js

# Make it executable and test
ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} << 'EOF'
chmod +x /tmp/test-compute.js
node /tmp/test-compute.js
EOF

echo "✅ Compute application deployed!"

