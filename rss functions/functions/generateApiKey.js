// generateApiKey.js
const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('Generated API Key:', apiKey);
