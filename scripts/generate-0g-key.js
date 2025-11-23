const { ethers } = require('ethers');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('\n=== 0G Storage Wallet Generated ===\n');
console.log('Private Key (add to .env.local as ZG_PRIVATE_KEY):');
console.log(wallet.privateKey);
console.log('\nAddress (send testnet tokens to this address):');
console.log(wallet.address);
console.log('\n=== Save the private key securely! ===\n');

