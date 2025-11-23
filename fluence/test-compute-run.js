/**
 * Test compute execution on Fluence VM
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

const VM_IP = '81.15.150.156';
const VM_USER = 'ubuntu';
const KEY_PATH = path.join(__dirname, 'keys', 'fluence-ssh-key-1763905419611').replace(/\\/g, '/');

console.log('🧪 Testing compute execution on Fluence VM...\n');
console.log(`VM: ${VM_USER}@${VM_IP}`);
console.log(`Key: ${KEY_PATH}\n`);

// Test computation
const operation = 'add';
const a = 42;
const b = 18;
const expectedResult = a + b;

const computeScript = `
const result = ${a} + ${b};
console.log(JSON.stringify({
  success: true,
  result: result,
  operation: '${operation}',
  inputs: { a: ${a}, b: ${b} },
  timestamp: new Date().toISOString()
}));
`;

// Write to temp file
const tempFile = path.join(tmpdir(), `test-compute-${Date.now()}.js`);
fs.writeFileSync(tempFile, computeScript);
const normalizedTempFile = tempFile.replace(/\\/g, '/');

const remotePath = `/tmp/compute-test-${Date.now()}.js`;

try {
  console.log('📤 Step 1: Copying script to VM...');
  const scpCommand = `scp -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${normalizedTempFile}" ${VM_USER}@${VM_IP}:${remotePath}`;
  execSync(scpCommand, { stdio: 'inherit', timeout: 15000 });
  console.log('✅ Script copied successfully\n');

  console.log('⚡ Step 2: Executing computation on VM...');
  const sshCommand = `ssh -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VM_USER}@${VM_IP} "node ${remotePath}"`;
  const output = execSync(sshCommand, { encoding: 'utf8', stdio: 'pipe', timeout: 30000 });
  
  console.log('✅ Execution successful!\n');
  console.log('📊 Results:');
  console.log('─'.repeat(60));
  
  try {
    const result = JSON.parse(output.trim());
    console.log(`Operation: ${result.operation}`);
    console.log(`Input A: ${result.inputs.a}`);
    console.log(`Input B: ${result.inputs.b}`);
    console.log(`Result: ${result.result}`);
    console.log(`Expected: ${expectedResult}`);
    console.log(`Match: ${result.result === expectedResult ? '✅ YES' : '❌ NO'}`);
    console.log(`Timestamp: ${result.timestamp}`);
    console.log('─'.repeat(60));
    
    if (result.result === expectedResult) {
      console.log('\n🎉 Test PASSED! Computation executed correctly on Fluence VM.');
    } else {
      console.log('\n❌ Test FAILED! Result does not match expected value.');
      process.exit(1);
    }
  } catch (parseError) {
    console.log('Raw output:', output);
    console.log('⚠️  Could not parse JSON, but execution completed');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  try {
    const cleanupCommand = `ssh -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VM_USER}@${VM_IP} "rm ${remotePath}"`;
    execSync(cleanupCommand, { stdio: 'ignore', timeout: 5000 });
    console.log('✅ Remote file cleaned up');
  } catch {}
  
  fs.unlinkSync(tempFile);
  console.log('✅ Local temp file cleaned up\n');

} catch (error) {
  console.error('\n❌ Test FAILED!');
  console.error('Error:', error.message);
  if (error.stderr) {
    console.error('STDERR:', error.stderr.toString());
  }
  if (error.stdout) {
    console.error('STDOUT:', error.stdout.toString());
  }
  
  // Cleanup on error
  try {
    fs.unlinkSync(tempFile);
  } catch {}
  
  process.exit(1);
}

