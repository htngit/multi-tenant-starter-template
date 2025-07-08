// Simple test to verify jose CommonJS import
const { jwtVerify } = require('./node_modules/jose/dist/node/cjs/index.js');

console.log('Jose CommonJS import successful:', typeof jwtVerify);
console.log('jwtVerify function:', jwtVerify.toString().substring(0, 100) + '...');