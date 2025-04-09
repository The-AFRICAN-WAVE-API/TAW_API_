// utils/auth.js
import functions from 'firebase-functions'; // Option A: using functions.config()
const API_KEY = functions.config().api ? functions.config().api.key : null;

// Alternatively, if using Option B, import from your config file:
// const { API_KEY } = require('../config/config');

/**
 * Middleware to validate the API key.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The callback to pass control to the next middleware.
 * @return {void}
 */
function checkApiKey(req, res, next) {
  const apiKeyHeader = req.headers['x-api-key'];
  if (!apiKeyHeader) {
    return res.status(401).json({error: 'API key required'});
  }
  if (apiKeyHeader !== API_KEY) {
    return res.status(401).json({error: 'Unauthorized: Invalid API key'});
  }
  next();
}

export default checkApiKey;
