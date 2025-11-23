// Test file for Fluence test compute application

const { compute, processRequest } = require('./test-compute');

// Test cases
console.log('Testing Fluence Compute Application\n');

// Test 1: Addition
const test1 = processRequest({ operation: 'add', a: 10, b: 5 });
console.log('Test 1 - Addition (10 + 5):', test1);
console.assert(test1.success && test1.result === 15, 'Addition test failed');

// Test 2: Subtraction
const test2 = processRequest({ operation: 'subtract', a: 10, b: 5 });
console.log('Test 2 - Subtraction (10 - 5):', test2);
console.assert(test2.success && test2.result === 5, 'Subtraction test failed');

// Test 3: Multiplication
const test3 = processRequest({ operation: 'multiply', a: 10, b: 5 });
console.log('Test 3 - Multiplication (10 * 5):', test3);
console.assert(test3.success && test3.result === 50, 'Multiplication test failed');

// Test 4: Division
const test4 = processRequest({ operation: 'divide', a: 10, b: 5 });
console.log('Test 4 - Division (10 / 5):', test4);
console.assert(test4.success && test4.result === 2, 'Division test failed');

// Test 5: Division by zero
const test5 = processRequest({ operation: 'divide', a: 10, b: 0 });
console.log('Test 5 - Division by zero (10 / 0):', test5);
console.assert(!test5.success, 'Division by zero should fail');

// Test 6: Invalid operation
const test6 = processRequest({ operation: 'invalid', a: 10, b: 5 });
console.log('Test 6 - Invalid operation:', test6);
console.assert(!test6.success, 'Invalid operation should fail');

console.log('\nAll tests completed!');

