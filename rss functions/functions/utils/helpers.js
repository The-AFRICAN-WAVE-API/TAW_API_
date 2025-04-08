// utils/helpers.js
import { createHash } from 'crypto';

/**
 * Generates a unique key from title and link.
 * @param {string} title - The article title.
 * @param {string} link - The article link.
 * @return {string} The unique key.
 */
export function getUniqueKey(title, link) {
  return createHash('sha256').update(title + link).digest('hex');
}
