import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Generate SSH key pair for Fluence Network instances using ssh-keygen
 * This ensures proper OpenSSH format that Fluence accepts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keySize = body.keySize || 2048;

    // Validate key size
    if (![1024, 2048, 4096].includes(keySize)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid key size. Must be 1024, 2048, or 4096 bits',
      }, { status: 400 });
    }

    // Generate unique key ID
    const keyId = `fluence-key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Use temp directory for key generation
    const tempDir = tmpdir();
    const tempKeyPath = join(tempDir, keyId);

    try {
      // Use ssh-keygen to generate proper OpenSSH format keys
      // -t rsa: RSA key type
      // -b: bits
      // -f: output file
      // -q: quiet mode (suppress output)
      // -N "": empty passphrase
      // -C: comment
      execSync(
        `ssh-keygen -t rsa -b ${keySize} -f "${tempKeyPath}" -q -N "" -C "fluence-key"`,
        { stdio: 'pipe' }
      );

      // Read the generated keys
      const publicKey = readFileSync(`${tempKeyPath}.pub`, 'utf8').trim();
      const privateKey = readFileSync(tempKeyPath, 'utf8');

      // Clean up temp files
      unlinkSync(`${tempKeyPath}.pub`);
      unlinkSync(tempKeyPath);

      const keyPair = {
        keyId,
        publicKey: publicKey, // Already in proper OpenSSH format
        privateKey: privateKey,
        publicKeyPEM: publicKey, // OpenSSH format
        keySize,
        createdAt: new Date().toISOString(),
        algorithm: 'RSA'
      };

      return NextResponse.json({
        success: true,
        keyPair,
        message: 'SSH key pair generated successfully in OpenSSH format'
      });

    } catch (sshError) {
      // Clean up on error
      try {
        if (readFileSync(`${tempKeyPath}.pub`)) unlinkSync(`${tempKeyPath}.pub`);
        if (readFileSync(tempKeyPath)) unlinkSync(tempKeyPath);
      } catch {}

      return NextResponse.json({
        success: false,
        error: `ssh-keygen failed: ${sshError instanceof Error ? sshError.message : 'Unknown error'}. Make sure ssh-keygen is installed.`,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating SSH key pair:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

