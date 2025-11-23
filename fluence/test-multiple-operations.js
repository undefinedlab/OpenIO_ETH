/**
 * Test multiple compute operations on Fluence VM
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

const VM_IP = '81.15.150.156';
const VM_USER = 'ubuntu';
const KEY_PATH = path.join(__dirname, 'keys', 'fluence-ssh-key-1763905419611').replace(/\\/g, '/');

console.log('🧪 Testing multiple compute operations on Fluence VM...\n');
console.log(`VM: ${VM_USER}@${VM_IP}\n`);

const tests = [
  { operation: 'add', a: 25, b: 17, expected: 42 },
  { operation: 'subtract', a: 50, b: 23, expected: 27 },
  { operation: 'multiply', a: 6, b: 7, expected: 42 },
  { operation: 'divide', a: 84, b: 2, expected: 42 },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`\n📊 Test: ${test.operation}(${test.a}, ${test.b})`);
  console.log(`   Expected: ${test.expected}`);
  
  const pythonScript = `
import json
from datetime import datetime

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

result = compute('${test.operation}', ${test.a}, ${test.b})
print(json.dumps({
    'success': result is not None,
    'result': result,
    'operation': '${test.operation}',
    'inputs': {'a': ${test.a}, 'b': ${test.b}},
    'timestamp': datetime.now().isoformat()
}))
`;

  const tempFile = path.join(tmpdir(), `test-${test.operation}-${Date.now()}.py`);
  fs.writeFileSync(tempFile, pythonScript);
  const normalizedTempFile = tempFile.replace(/\\/g, '/');
  const remotePath = `/tmp/compute-${test.operation}-${Date.now()}.py`;

  try {
    // Copy script
    const scpCommand = `scp -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${normalizedTempFile}" ${VM_USER}@${VM_IP}:${remotePath}`;
    execSync(scpCommand, { stdio: 'ignore', timeout: 15000 });

    // Execute
    const sshCommand = `ssh -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VM_USER}@${VM_IP} "python3 ${remotePath}"`;
    const output = execSync(sshCommand, { encoding: 'utf8', stdio: 'pipe', timeout: 30000 });
    
    const result = JSON.parse(output.trim());
    
    if (result.result === test.expected) {
      console.log(`   ✅ Result: ${result.result} - PASSED`);
      passed++;
    } else {
      console.log(`   ❌ Result: ${result.result} - FAILED (expected ${test.expected})`);
      failed++;
    }

    // Cleanup
    try {
      execSync(`ssh -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${VM_USER}@${VM_IP} "rm ${remotePath}"`, { stdio: 'ignore', timeout: 5000 });
    } catch {}
    fs.unlinkSync(tempFile);

  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    failed++;
    try {
      fs.unlinkSync(tempFile);
    } catch {}
  }
}

console.log('\n' + '='.repeat(60));
console.log(`📈 Test Summary:`);
console.log(`   ✅ Passed: ${passed}/${tests.length}`);
console.log(`   ❌ Failed: ${failed}/${tests.length}`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 All tests PASSED! Fluence compute is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Check the output above.');
  process.exit(1);
}

