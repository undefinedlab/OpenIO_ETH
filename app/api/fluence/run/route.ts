import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Fluence VM Configuration
const FLUENCE_VM_IP = process.env.FLUENCE_VM_IP || '81.15.150.156';
const FLUENCE_VM_USER = process.env.FLUENCE_VM_USER || 'ubuntu';
const FLUENCE_VM_ID = process.env.FLUENCE_VM_ID || '019ab0f5-2c17-7b53-a36b-2cb73ac5bddc';
const FLUENCE_SSH_KEY_PATH = process.env.FLUENCE_SSH_KEY_PATH || 'fluence/keys/fluence-ssh-key';

interface ComputeRequest {
  operation: string;
  a: number;
  b: number;
  sourceCode?: string;
}

/**
 * Run computation on Fluence VM via SSH
 */
export async function POST(request: NextRequest) {
  try {
    const body: ComputeRequest = await request.json();
    const { operation, a, b, sourceCode } = body;

    // Validate input
    if (!operation || a === undefined || b === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: operation, a, b'
      }, { status: 400 });
    }

    // Create test compute script
    const computeScript = sourceCode || `
// Simple test computation
function compute(operation, a, b) {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return b !== 0 ? a / b : null;
    default: return null;
  }
}

const result = compute('${operation}', ${a}, ${b});
console.log(JSON.stringify({
  success: result !== null,
  result: result,
  operation: '${operation}',
  inputs: { a: ${a}, b: ${b} },
  timestamp: new Date().toISOString()
}));
`;

    // Write script to temp file
    const tempDir = tmpdir();
    const tempScriptPath = join(tempDir, `test-${Date.now()}.js`);
    writeFileSync(tempScriptPath, computeScript);

    try {
      // Find SSH key (try multiple locations)
      const fs = require('fs');
      let sshKeyPath: string | null = null;
      
      const possibleKeyPaths = [
        FLUENCE_SSH_KEY_PATH,
        // Prioritize the working key first (this is the one that works!)
        join(process.cwd(), 'fluence', 'keys', 'fluence-ssh-key-1763905419611'),
        // Try other keys as fallback
        join(process.cwd(), 'fluence', 'keys', 'fluence-ssh-key'),
        join(process.cwd(), 'fluence', 'keys', 'fluence-ssh-key-1763905267717-az34rdu4l'),
      ];

      // Also search for any fluence-ssh-key files, but prioritize the working one
      const keysDir = join(process.cwd(), 'fluence', 'keys');
      if (fs.existsSync(keysDir)) {
        const keyFiles = fs.readdirSync(keysDir);
        const sshKeyFiles = keyFiles.filter((f: string) => 
          f.startsWith('fluence-ssh-key') && !f.endsWith('.pub')
        );
        // Sort to put the working key first
        sshKeyFiles.sort((a: string, b: string) => {
          if (a.includes('1763905419611')) return -1;
          if (b.includes('1763905419611')) return 1;
          return 0;
        });
        sshKeyFiles.forEach((keyFile: string) => {
          const keyPath = join(keysDir, keyFile);
          if (!possibleKeyPaths.includes(keyPath)) {
            possibleKeyPaths.push(keyPath);
          }
        });
      }

      // First, try to find the working key specifically (this is the verified working key)
      const workingKeyPath = join(process.cwd(), 'fluence', 'keys', 'fluence-ssh-key-1763905419611');
      if (fs.existsSync(workingKeyPath)) {
        try {
          const stats = fs.statSync(workingKeyPath);
          if (!stats.isDirectory()) {
            sshKeyPath = workingKeyPath;
            console.log(`✓ Using verified working SSH key: ${workingKeyPath}`);
          }
        } catch (statError) {
          console.warn(`Could not stat working key: ${statError}`);
        }
      }
      
      // If working key not found, try other keys
      if (!sshKeyPath) {
        console.log('Working key not found, searching for alternatives...');
        for (const path of possibleKeyPaths) {
          try {
            if (fs.existsSync(path)) {
              const stats = fs.statSync(path);
              if (!stats.isDirectory()) {
                sshKeyPath = path;
                console.log(`Found SSH key at: ${path}`);
                break;
              }
            }
          } catch (err) {
            // Continue searching
          }
        }
      }

      if (!sshKeyPath) {
        return NextResponse.json({
          success: false,
          error: 'SSH key not found. Please generate a key first or set FLUENCE_SSH_KEY_PATH environment variable.',
          searchedPaths: possibleKeyPaths
        }, { status: 400 });
      }

      // Copy script to VM and execute
      const remoteScriptPath = `/tmp/test-${Date.now()}.js`;
      
      // Normalize Windows path for SSH (convert backslashes to forward slashes)
      const normalizedKeyPath = sshKeyPath.replace(/\\/g, '/');
      const normalizedScriptPath = tempScriptPath.replace(/\\/g, '/');
      
      console.log(`Using SSH key: ${normalizedKeyPath}`);
      console.log(`Copying script: ${normalizedScriptPath}`);
      
      // Step 1: Copy script to VM with proper SSH key
      const scpCommand = `scp -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${normalizedScriptPath}" ${FLUENCE_VM_USER}@${FLUENCE_VM_IP}:${remoteScriptPath}`;
      
      try {
        execSync(scpCommand, { stdio: 'pipe', timeout: 15000 });
        console.log('Script copied successfully');
      } catch (scpError: any) {
        console.error('SCP error:', scpError.message);
        console.error('STDERR:', scpError.stderr?.toString());
        console.error('STDOUT:', scpError.stdout?.toString());
        
        // Return detailed error
        return NextResponse.json({
          success: false,
          error: `Failed to copy script to VM: ${scpError.message}`,
          details: {
            command: scpCommand,
            keyPath: normalizedKeyPath,
            keyExists: fs.existsSync(sshKeyPath),
            stderr: scpError.stderr?.toString(),
            stdout: scpError.stdout?.toString(),
            suggestion: 'Make sure the SSH key is added to the Fluence dashboard. The public key must match the private key being used.'
          }
        }, { status: 500 });
      }

      // Step 2: Execute script on VM
      // First check if Node.js is available, if not, install it or use alternative
      const checkNodeCommand = `ssh -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${FLUENCE_VM_USER}@${FLUENCE_VM_IP} "which node || echo 'NODE_NOT_FOUND'"`;
      
      let nodeAvailable = true;
      try {
        const nodeCheck = execSync(checkNodeCommand, { encoding: 'utf8', stdio: 'pipe', timeout: 5000 }).toString().trim();
        if (nodeCheck === 'NODE_NOT_FOUND' || nodeCheck === '') {
          nodeAvailable = false;
        }
      } catch {}

      let output: string;
      if (nodeAvailable) {
        const sshCommand = `ssh -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${FLUENCE_VM_USER}@${FLUENCE_VM_IP} "node ${remoteScriptPath}"`;
        
        try {
          output = execSync(sshCommand, { 
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 30000 
          }).toString();
        } catch (sshError: any) {
          throw new Error(`SSH execution failed: ${sshError.message}`);
        }
      } else {
        // Use Python as fallback if Node.js is not available
        const pythonScript = `
import json
import sys

def compute(operation, a, b):
    if operation == 'add':
        return a + b
    elif operation == 'subtract':
        return a - b
    elif operation == 'multiply':
        return a * b
    elif operation == 'divide':
        return a / b if b != 0 else None
    return None

result = compute('${operation}', ${a}, ${b})
print(json.dumps({
    'success': result is not None,
    'result': result,
    'operation': '${operation}',
    'inputs': {'a': ${a}, 'b': ${b}},
    'timestamp': __import__('datetime').datetime.now().isoformat()
}))
`;
        const pythonScriptPath = join(tmpdir(), `test-${Date.now()}.py`);
        writeFileSync(pythonScriptPath, pythonScript);
        
        // Copy Python script
        const pythonRemotePath = `/tmp/test-${Date.now()}.py`;
        const scpPythonCommand = `scp -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${pythonScriptPath}" ${FLUENCE_VM_USER}@${FLUENCE_VM_IP}:${pythonRemotePath}`;
        
        try {
          execSync(scpPythonCommand, { stdio: 'pipe', timeout: 10000 });
        } catch (scpError: any) {
          throw new Error(`Failed to copy Python script: ${scpError.message}`);
        }
        
        const sshPythonCommand = `ssh -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${FLUENCE_VM_USER}@${FLUENCE_VM_IP} "python3 ${pythonRemotePath}"`;
        
        try {
          output = execSync(sshPythonCommand, { encoding: 'utf8', stdio: 'pipe', timeout: 30000 }).toString();
        } catch (sshError: any) {
          throw new Error(`Python execution failed: ${sshError.message}`);
        }
        
        // Clean up remote Python script
        try {
          const cleanupPythonCommand = `ssh -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${FLUENCE_VM_USER}@${FLUENCE_VM_IP} "rm ${pythonRemotePath}"`;
          execSync(cleanupPythonCommand, { stdio: 'pipe', timeout: 5000 });
        } catch {}
        
        unlinkSync(pythonScriptPath);
      }

      // Step 3: Clean up remote script
      try {
        const cleanupCommand = `ssh -i "${normalizedKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${FLUENCE_VM_USER}@${FLUENCE_VM_IP} "rm ${remoteScriptPath}"`;
        execSync(cleanupCommand, { stdio: 'pipe', timeout: 5000 });
      } catch {}

      // Clean up local temp file
      unlinkSync(tempScriptPath);

      // Parse output
      let result;
      try {
        result = JSON.parse(output.trim());
      } catch {
        result = {
          success: true,
          result: output.trim(),
          rawOutput: output
        };
      }

      return NextResponse.json({
        success: true,
        vmId: FLUENCE_VM_ID,
        vmIp: FLUENCE_VM_IP,
        computation: result,
        message: 'Computation executed successfully on Fluence VM'
      });

    } catch (execError: any) {
      // Clean up on error
      try {
        unlinkSync(tempScriptPath);
      } catch {}

      return NextResponse.json({
        success: false,
        error: `Failed to execute on VM: ${execError.message}`,
        details: execError.stdout || execError.stderr
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error running computation on Fluence:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

