/**
 * Test SSH connection to Fluence VM
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VM_IP = '81.15.150.156';
const VM_USER = 'ubuntu';
const keysDir = path.join(__dirname, 'keys');

// Find SSH keys
const keyFiles = fs.readdirSync(keysDir).filter(f => 
  f.startsWith('fluence-ssh-key') && !f.endsWith('.pub')
);

if (keyFiles.length === 0) {
  console.error('No SSH keys found in keys directory');
  process.exit(1);
}

console.log('🔑 Found SSH keys:');
keyFiles.forEach((key, i) => {
  console.log(`  ${i + 1}. ${key}`);
});

// Try each key
for (const keyFile of keyFiles) {
  const keyPath = path.join(keysDir, keyFile);
  const normalizedPath = keyPath.replace(/\\/g, '/');
  
  console.log(`\n🔍 Testing key: ${keyFile}`);
  console.log(`   Path: ${normalizedPath}`);
  
  try {
    // Test connection
    const testCommand = `ssh -i "${normalizedPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 ${VM_USER}@${VM_IP} "echo 'Connection successful!'"`;
    
    const output = execSync(testCommand, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    });
    
    console.log(`✅ SUCCESS! Key ${keyFile} works!`);
    console.log(`   Output: ${output.trim()}`);
    console.log(`\n💡 Use this key: ${normalizedPath}`);
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.stderr) {
      console.log(`   Error: ${error.stderr.toString()}`);
    }
  }
}

console.log('\n❌ None of the keys worked. Make sure:');
console.log('   1. The public key is added to Fluence dashboard');
console.log('   2. The key file has correct permissions (chmod 600)');
console.log('   3. The VM is accessible from your network');

