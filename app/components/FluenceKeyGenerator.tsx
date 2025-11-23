'use client';

import { useState } from 'react';

interface KeyPair {
  keyId: string;
  publicKey: string;
  privateKey: string;
  publicKeyPEM: string;
  keySize: number;
  createdAt: string;
  algorithm: string;
}

export default function FluenceKeyGenerator() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keySize, setKeySize] = useState(2048);
  const [error, setError] = useState<string | null>(null);

  const generateKeyPair = async () => {
    setIsGenerating(true);
    setError(null);
    setKeyPair(null);

    try {
      // Call API to generate key pair (server-side for better security)
      const response = await fetch('/api/fluence/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keySize }),
      });

      const result = await response.json();

      if (result.success) {
        setKeyPair(result.keyPair);
      } else {
        setError(result.error || 'Failed to generate key pair');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPublicKey = () => {
    if (!keyPair) return;
    const blob = new Blob([keyPair.publicKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyPair.keyId}.pub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPrivateKey = () => {
    if (!keyPair) return;
    const blob = new Blob([keyPair.privateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = keyPair.keyId;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fluence-key-generator" style={{
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      maxWidth: '800px',
      margin: '20px auto'
    }}>
      <h2 style={{ marginTop: 0, color: '#333' }}>🔑 Fluence SSH Key Generator</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Generate SSH key pairs for secure access to your Fluence Network instances
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Key Size (bits):
        </label>
        <select
          value={keySize}
          onChange={(e) => setKeySize(Number(e.target.value))}
          disabled={isGenerating}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '200px'
          }}
        >
          <option value={1024}>1024 bits (Fast, less secure)</option>
          <option value={2048}>2048 bits (Recommended)</option>
          <option value={4096}>4096 bits (Most secure, slower)</option>
        </select>
      </div>

      <button
        onClick={generateKeyPair}
        disabled={isGenerating}
        style={{
          padding: '12px 24px',
          backgroundColor: isGenerating ? '#ccc' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate SSH Key Pair'}
      </button>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33',
          marginBottom: '20px'
        }}>
          ✗ {error}
        </div>
      )}

      {keyPair && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>✓ Key Pair Generated Successfully</h3>
            <p><strong>Key ID:</strong> {keyPair.keyId}</p>
            <p><strong>Algorithm:</strong> {keyPair.algorithm}</p>
            <p><strong>Key Size:</strong> {keyPair.keySize} bits</p>
            <p><strong>Created:</strong> {new Date(keyPair.createdAt).toLocaleString()}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                onClick={downloadPublicKey}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📥 Download Public Key
              </button>
              <button
                onClick={downloadPrivateKey}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📥 Download Private Key
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#999' }}>
              ⚠️ Keep your private key secure and never share it!
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Public Key (OpenSSH format):
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                readOnly
                value={keyPair.publicKey}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={() => copyToClipboard(keyPair.publicKey)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Private Key (PEM format):
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                readOnly
                value={keyPair.privateKey}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'vertical',
                  backgroundColor: '#fff9e6'
                }}
              />
              <button
                onClick={() => copyToClipboard(keyPair.privateKey)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Copy
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#c33', marginTop: '8px' }}>
              ⚠️ SECURITY WARNING: Never share your private key or commit it to version control!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

