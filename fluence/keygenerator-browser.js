/**
 * Browser-compatible SSH Key Generator for Fluence Network
 * Uses Web Crypto API for key generation in the browser
 */

/**
 * Generate SSH key pair using Web Crypto API (browser)
 * @param {number} keySize - Key size in bits (default: 2048)
 * @returns {Promise<Object>} Object containing publicKey, privateKey, and keyId
 */
async function generateSSHKeyPairBrowser(keySize = 2048) {
  try {
    // Generate RSA key pair using Web Crypto API
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    // Export keys
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    // Convert to base64
    const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer);
    const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer);

    // Convert to PEM format
    const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${chunkString(publicKeyBase64, 64)}\n-----END PUBLIC KEY-----`;
    const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${chunkString(privateKeyBase64, 64)}\n-----END PRIVATE KEY-----`;

    // Generate OpenSSH format public key
    const sshPublicKey = `ssh-rsa ${publicKeyBase64} fluence-key`;

    // Generate unique key ID
    const keyId = `fluence-key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      keyId,
      publicKey: sshPublicKey,
      privateKey: privateKeyPEM,
      publicKeyPEM: publicKeyPEM,
      keySize,
      createdAt: new Date().toISOString(),
      algorithm: 'RSA'
    };
  } catch (error) {
    throw new Error(`Failed to generate SSH key pair: ${error.message}`);
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Chunk string into lines of specified length
 */
function chunkString(str, length) {
  const chunks = [];
  for (let i = 0; i < str.length; i += length) {
    chunks.push(str.substr(i, length));
  }
  return chunks.join('\n');
}

/**
 * Download key as file
 */
function downloadKey(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save key to localStorage
 */
function saveKeyToStorage(keyPair) {
  try {
    const keys = JSON.parse(localStorage.getItem('fluence-keys') || '[]');
    keys.push({
      keyId: keyPair.keyId,
      publicKey: keyPair.publicKey,
      createdAt: keyPair.createdAt,
      // Don't store private key in localStorage for security
    });
    localStorage.setItem('fluence-keys', JSON.stringify(keys));
    return true;
  } catch (error) {
    console.error('Failed to save key to storage:', error);
    return false;
  }
}

/**
 * Get all saved keys from localStorage
 */
function getSavedKeys() {
  try {
    return JSON.parse(localStorage.getItem('fluence-keys') || '[]');
  } catch (error) {
    console.error('Failed to get saved keys:', error);
    return [];
  }
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.FluenceKeyGenerator = {
    generateSSHKeyPair: generateSSHKeyPairBrowser,
    downloadKey,
    saveKeyToStorage,
    getSavedKeys
  };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateSSHKeyPair: generateSSHKeyPairBrowser,
    downloadKey,
    saveKeyToStorage,
    getSavedKeys
  };
}

