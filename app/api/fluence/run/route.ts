import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Client } from 'ssh2';

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

// Helper function to execute SSH commands using ssh2
async function executeSSHCommand(
  host: string,
  username: string,
  privateKey: string,
  command: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';

    conn.on('ready', () => {
      conn.exec(command, (err: Error | undefined, stream: any) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        stream.on('close', (code: number) => {
          conn.end();
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}: ${errorOutput || output}`));
          } else {
            resolve(output);
          }
        });

        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });
      });
    });

    conn.on('error', (err: Error) => {
      reject(err);
    });

    conn.connect({
      host,
      username,
      privateKey,
      readyTimeout: 20000,
    });
  });
}

// Helper function to write file to remote server using ssh2
async function writeFileToRemote(
  host: string,
  username: string,
  privateKey: string,
  remotePath: string,
  content: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      conn.sftp((err: Error | undefined, sftp: any) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        sftp.writeFile(remotePath, content, (writeErr: Error | undefined) => {
          conn.end();
          if (writeErr) {
            reject(writeErr);
          } else {
            resolve();
          }
        });
      });
    });

    conn.on('error', (err: Error) => {
      reject(err);
    });

    conn.connect({
      host,
      username,
      privateKey,
      readyTimeout: 20000,
    });
  });
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
      
      console.log(`Using SSH key: ${sshKeyPath}`);
      console.log(`Copying script to remote: ${remoteScriptPath}`);
      
      // Read the private key
      const privateKey = readFileSync(sshKeyPath, 'utf8');
      
      // Step 1: Copy script to VM using ssh2
      try {
        await writeFileToRemote(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, remoteScriptPath, computeScript);
        console.log('Script copied successfully');
      } catch (copyError: any) {
        console.error('File copy error:', copyError.message);
        
        // Return detailed error
        return NextResponse.json({
          success: false,
          error: `Failed to copy script to VM: ${copyError.message}`,
          details: {
            keyPath: sshKeyPath,
            keyExists: fs.existsSync(sshKeyPath),
            suggestion: 'Make sure the SSH key is added to the Fluence dashboard. The public key must match the private key being used.'
          }
        }, { status: 500 });
      }

      // Step 2: Execute script on VM
      // First check if Node.js is available, if not, install it or use alternative
      let nodeAvailable = true;
      try {
        const nodeCheck = await executeSSHCommand(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, 'which node || echo "NODE_NOT_FOUND"');
        if (nodeCheck.trim() === 'NODE_NOT_FOUND' || nodeCheck.trim() === '') {
          nodeAvailable = false;
        }
      } catch {}

      let output: string;
      if (nodeAvailable) {
        try {
          output = await executeSSHCommand(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, `node ${remoteScriptPath}`);
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
        const pythonRemotePath = `/tmp/test-${Date.now()}.py`;
        
        try {
          await writeFileToRemote(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, pythonRemotePath, pythonScript);
        } catch (copyError: any) {
          throw new Error(`Failed to copy Python script: ${copyError.message}`);
        }
        
        try {
          output = await executeSSHCommand(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, `python3 ${pythonRemotePath}`);
        } catch (sshError: any) {
          throw new Error(`Python execution failed: ${sshError.message}`);
        }
        
        // Clean up remote Python script
        try {
          await executeSSHCommand(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, `rm ${pythonRemotePath}`);
        } catch {}
      }

      // Step 3: Clean up remote script
      try {
        await executeSSHCommand(FLUENCE_VM_IP, FLUENCE_VM_USER, privateKey, `rm ${remoteScriptPath}`);
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

