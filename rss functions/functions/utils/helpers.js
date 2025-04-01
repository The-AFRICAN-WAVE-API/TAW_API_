// utils/helpers.js
const crypto = require("crypto");

/**
 * Generates a unique key from title and link.
 * @param {string} title - The article title.
 * @param {string} link - The article link.
 * @return {string} The unique key.
 */
function getUniqueKey(title, link) {
  return crypto.createHash("sha256").update(title + link).digest("hex");
}

module.exports = {getUniqueKey};
