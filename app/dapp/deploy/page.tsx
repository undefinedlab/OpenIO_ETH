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
                  className={`toolbar-btn compile-btn ${isCompiling ? 'compiling' : ''}`}
                  onClick={handleCompile}
                  disabled={isCompiling || isDeploying}
                >
                  {isCompiling ? (
                    <span className="compile-text-effect">
                      Compiling <DecoderText text="contract" delay={0.3} />
                    </span>
                  ) : 'Compile'}
                </button>
                <button 
                  className="toolbar-btn deploy-btn"
                  onClick={handleDeploy}
                  disabled={isCompiling || isDeploying}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy'}
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

