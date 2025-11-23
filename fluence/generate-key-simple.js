/**
 * Simple SSH Key Generator for Fluence Network
 * Uses ssh-keygen to generate proper OpenSSH format keys
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const keySize = process.argv[2] || 2048;
const outputDir = process.argv[3] || './keys';
const keyName = `fluence-ssh-key-${Date.now()}`;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const keyPath = path.join(outputDir, keyName);

console.log('🔑 Generating SSH key pair for Fluence Network...');
console.log(`Key size: ${keySize} bits`);
console.log(`Output: ${keyPath}\n`);

try {
  // Generate key using ssh-keygen
  execSync(
    `ssh-keygen -t rsa -b ${keySize} -f "${keyPath}" -q -N "" -C "fluence-key"`,
    { stdio: 'inherit' }
  );

  // Read the public key
  const publicKey = fs.readFileSync(`${keyPath}.pub`, 'utf8').trim();

  console.log('\n✅ SSH key pair generated successfully!');
  console.log(`\n📁 Files:`);
  console.log(`   Public key:  ${keyPath}.pub`);
  console.log(`   Private key: ${keyPath}`);
  console.log(`\n📋 Public Key (copy this to Fluence dashboard):`);
  console.log('─'.repeat(80));
  console.log(publicKey);
  console.log('─'.repeat(80));
  console.log('\n⚠️  IMPORTANT: Keep your private key secure and never share it!');
  console.log(`\n💡 To use this key with Fluence, copy the public key above and paste it in the Fluence dashboard.`);

} catch (error) {
  console.error('❌ Error generating key:', error.message);
  console.error('\nMake sure ssh-keygen is installed and available in your PATH.');
  process.exit(1);
}

