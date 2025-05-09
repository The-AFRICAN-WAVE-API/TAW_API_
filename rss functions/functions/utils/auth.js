// utils/auth.js
const API_KEY = process.env.API_KEY;

// Ensure API_KEY is defined during application startup
if (!API_KEY) {
  console.error("API_KEY is not defined in the environment variables.");
  process.exit(1);
}

/**
 * Middleware to validate the API key.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The callback to pass control to the next middleware.
 * @return {void}
 */
function checkApiKey(req, res, next) {
  const apiKeyHeader = req.headers["x-api-key"] || req.headers["X-API-KEY"];

  if (!apiKeyHeader) {
    return res
      .status(401)
      .json({ success: false, message: "API key required" });
  }
  if (apiKeyHeader !== API_KEY) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid API key" });
  }
  next();
}

export default checkApiKey;
