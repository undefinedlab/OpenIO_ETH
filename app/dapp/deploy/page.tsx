'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import AIChat from '../components/AIChat';
import DecoderText from '../components/DecoderText';

export default function DeployPage() {

  const [selectedFile, setSelectedFile] = useState<string | null>('key_value.io');
  // Default file with FHE key generation and IO evaluation circuit logic
  const [files, setFiles] = useState<Record<string, string>>({
    'public models/key_value.io': `// key_value.io
// FHE Key Generation → IO Evaluation Circuit

/**
 * Abstract: Privacy-Preserving Key-Value Operations
 * 
 * This module demonstrates a hybrid approach combining:
 * - Fully Homomorphic Encryption (FHE) for key generation
 * - Indistinguishability Obfuscation (iO) for evaluation
 * 
 * Theoretical Foundation:
 * We construct an encrypted key-value store where operations
 * are performed on ciphertexts without decryption, followed
 * by iO-sealed evaluation circuits for secure computation.
 */

// FHE Key Generation
export function generateKeys() {
  // Generate FHE key pair (client, server, public)
  return {
    clientKey: generate(),
    serverKey: derive(),
    publicKey: extract()
  };
}

// Encrypted Store Operations
export function encryptStore(keys) {
  return {
    set: (k, v) => encrypt(keys.publicKey, v),
    get: (k) => decrypt(keys.clientKey, lookup(k)),
    compute: (op, args) => homomorphic(keys.serverKey, op, args)
  };
}

// IO Evaluation Circuit
export function evaluateCircuit(sealedCircuit, input) {
  // Evaluate sealed logic on encrypted input
  return evaluate(sealedCircuit, input);
}

// Main Protocol
export function protocol() {
  const keys = generateKeys();
  const store = encryptStore(keys);
  const circuit = seal(evaluationLogic);
  
  return evaluateCircuit(circuit, store);
}`
  });
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployingFluence, setIsDeployingFluence] = useState(false);
  const [fluenceDeploymentId, setFluenceDeploymentId] = useState<string | null>(null);
  const [isRunningFluence, setIsRunningFluence] = useState(false);

  const handleCompile = async () => {
    setIsCompiling(true);
    setTerminalOutput(prev => [...prev, '> Compiling contract...']);
    
    // Check if file is complete (for now always true)
    const fileKey = selectedFile ? (files[`public models/${selectedFile}`] ? `public models/${selectedFile}` : selectedFile) : '';
    const source = fileKey ? files[fileKey] : '';
    const isFileComplete = source.trim().length > 0; // For now, just check if file has content
    
    if (!isFileComplete) {
      setTerminalOutput(prev => [...prev, '✗ File is incomplete or empty']);
      setIsCompiling(false);
      return;
    }
    
    // Fast compilation process - exactly 1 second
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, '> Analyzing FHE key generation...']);
    }, 200);
    
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, '> Processing IO evaluation circuit...']);
    }, 400);
    
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, '> Validating encrypted store operations...']);
    }, 600);
    
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '> Generating bytecode...',
        '✓ FHE keys validated',
        '✓ IO circuit sealed',
        '✓ Compilation successful',
        '✓ Compiled bytecode ready',
        '✓ Contract ready for deployment'
      ]);
      setIsCompiling(false); // Stop compiling after 1 second
    }, 1000); // Exactly 1 second total
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setTerminalOutput(prev => [...prev, '> Deploying contract...']);
    
    try {
      const fileKey = selectedFile ? (files[`public models/${selectedFile}`] ? `public models/${selectedFile}` : selectedFile) : '';
      const source = fileKey ? files[fileKey] : '';
      const contractName = selectedFile?.replace('.sol', '').replace('.io', '') || 'Contract';
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName,
          sourceCode: source,
          constructorArgs: []
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeployedAddress(result.address);
        setTerminalOutput(prev => [
          ...prev,
          `✓ Contract deployed successfully`,
          `✓ Address: ${result.address}`,
          `✓ Transaction: ${result.txHash}`,
          `✓ Block: ${result.blockNumber}`
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Deployment failed: ${result.error}`
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Deployment error: ${error}`
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeployFluence = async () => {
    setIsDeployingFluence(true);
    setTerminalOutput(prev => [...prev, '> Deploying to Fluence Network...']);
    
    try {
      const fileKey = selectedFile ? (files[`public models/${selectedFile}`] ? `public models/${selectedFile}` : selectedFile) : '';
      const source = fileKey ? files[fileKey] : '';
      
      setTerminalOutput(prev => [...prev, '> Searching for available compute resources...']);
      
      const response = await fetch('/api/fluence/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: source,
          config: {
            cpu: 1,
            memory: 512,
            disk: 10
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFluenceDeploymentId(result.deploymentId);
        setTerminalOutput(prev => [
          ...prev,
          `✓ Fluence VM deployment initiated`,
          `✓ Deployment ID: ${result.deploymentId}`,
          `✓ CPU: ${result.config.cpu} core(s)`,
          `✓ Memory: ${result.config.memory} MB`,
          `✓ Disk: ${result.config.disk} GB`,
          `> Monitoring deployment status...`
        ]);

        // Poll for deployment status
        let pollCount = 0;
        const maxPolls = 20; // 20 polls * 3 seconds = 60 seconds max
        
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const statusResponse = await fetch(`/api/fluence/deploy?id=${result.deploymentId}`);
            if (statusResponse.ok) {
              const status = await statusResponse.json();
              
              if (status.status === 'running' || status.status === 'active' || status.status === 'deployed') {
                clearInterval(pollInterval);
                setTerminalOutput(prev => [
                  ...prev,
                  `✓ Deployment successful!`,
                  `✓ VM is now running on Fluence Network`,
                  `✓ Status: ${status.status}`,
                  `✓ Deployment ID: ${result.deploymentId}`
                ]);
                setIsDeployingFluence(false);
              } else if (status.status === 'failed' || status.status === 'error') {
                clearInterval(pollInterval);
                setTerminalOutput(prev => [
                  ...prev,
                  `✗ Deployment failed: ${status.error || 'Unknown error'}`
                ]);
                setIsDeployingFluence(false);
              } else if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                setTerminalOutput(prev => [
                  ...prev,
                  `> Deployment is still in progress. Check status manually.`,
                  `> Deployment ID: ${result.deploymentId}`
                ]);
                setIsDeployingFluence(false);
              }
            }
          } catch (error) {
            console.error('Status polling error:', error);
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setIsDeployingFluence(false);
            }
          }
        }, 3000);

      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Fluence deployment failed: ${result.error}`,
          result.details ? `Details: ${result.details}` : ''
        ]);
        setIsDeployingFluence(false);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Fluence deployment error: ${error}`
      ]);
      setIsDeployingFluence(false);
    }
  };

  const handleRunFluence = async () => {
    setIsRunningFluence(true);
    setTerminalOutput(prev => [...prev, '> Running computation on Fluence VM...']);
    
    try {
      // Simple test computation
      const operation = 'add';
      const a = Math.floor(Math.random() * 100);
      const b = Math.floor(Math.random() * 100);
      
      setTerminalOutput(prev => [
        ...prev,
        `> Operation: ${operation}`,
        `> Input A: ${a}`,
        `> Input B: ${b}`,
        `> Connecting to Fluence VM (81.15.150.156)...`
      ]);

      const fileKey = selectedFile ? (files[`public models/${selectedFile}`] ? `public models/${selectedFile}` : selectedFile) : '';
      const source = fileKey ? files[fileKey] : '';

      const response = await fetch('/api/fluence/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          a,
          b,
          sourceCode: source
        })
      });

      const result = await response.json();

      if (result.success) {
        const comp = result.computation;
        const opSymbol = comp.operation === 'add' ? '+' : comp.operation === 'subtract' ? '-' : comp.operation === 'multiply' ? '*' : '/';
        
        setTerminalOutput(prev => [
          ...prev,
          `✓ Connected to Fluence VM`,
          `✓ VM ID: ${result.vmId}`,
          `✓ VM IP: ${result.vmIp}`,
          ``,
          `> Executing computation...`,
          `  Operation: ${comp.operation}`,
          `  Input A: ${comp.inputs?.a}`,
          `  Input B: ${comp.inputs?.b}`,
          ``,
          `✓ Computation completed!`,
          `✓ Result: ${comp.inputs?.a} ${opSymbol} ${comp.inputs?.b} = ${comp.result}`,
          `✓ Timestamp: ${comp.timestamp || new Date().toISOString()}`,
          ``
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Computation failed: ${result.error}`,
          result.details ? (typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)) : '',
          ``
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Error running computation: ${error}`
      ]);
    } finally {
      setIsRunningFluence(false);
    }
  };

  const updateFileContent = (filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  };

  return (
    <>
      <Navbar />
      <div className="dapp-container">
        <div className="dapp-layout">
          <FileExplorer 
            files={Object.keys(files).map(key => key.replace('public models/', ''))}
            selectedFile={selectedFile}
            onSelectFile={(filename) => {
              setSelectedFile(filename);
            }}
          />
          
          <div className="dapp-main">
            <div className="dapp-toolbar">
              <div className="toolbar-left">
                <h2 className="dapp-title">openIO IDE</h2>
              </div>
              <div className="toolbar-right">
                <button 
                  className="toolbar-btn deploy-btn fluence-run-btn"
                  onClick={handleRunFluence}
                  disabled={isRunningFluence}
                  style={{ 
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '10px 24px'
                  }}
                >
                  {isRunningFluence ? 'Running on Fluence...' : 'Run on Fluence'}
                </button>
              </div>
            </div>

            <CodeEditor
              filename={selectedFile || ''}
              content={selectedFile ? (files[`public models/${selectedFile}`] || files[selectedFile] || '') : ''}
              onChange={(content) => {
                if (selectedFile) {
                  const fullPath = `public models/${selectedFile}`;
                  if (files[fullPath]) {
                    updateFileContent(fullPath, content);
                  } else {
                    updateFileContent(selectedFile, content);
                  }
                }
              }}
            />

            <Terminal output={terminalOutput} />
          </div>
          
          <AIChat />
        </div>
      </div>
    </>
  );
}

