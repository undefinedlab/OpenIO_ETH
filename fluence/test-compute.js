// Simple test computing application for Fluence Network
// This performs basic arithmetic operations as a test

/**
 * Test Compute Application
 * Performs simple arithmetic operations to test Fluence deployment
 */

function compute(operation, a, b) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      return b !== 0 ? a / b : null;
    default:
      return null;
  }
}

function processRequest(request) {
  try {
    const { operation, a, b } = request;
    
    if (!operation || a === undefined || b === undefined) {
      return {
        success: false,
        error: 'Missing required parameters: operation, a, b'
      };
    }

    const result = compute(operation, Number(a), Number(b));
    
    if (result === null) {
      return {
        success: false,
        error: 'Invalid operation or division by zero'
      };
    }

    return {
      success: true,
      result: result,
      operation: operation,
      inputs: { a, b },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { compute, processRequest };
}

// For browser/worker environment
if (typeof window !== 'undefined') {
  window.FluenceCompute = { compute, processRequest };
}

