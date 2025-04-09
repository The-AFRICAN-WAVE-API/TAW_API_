// utils/analysis.js
import nlp from 'compromise';
import { positive, negative } from '../sentimentKeywords.js';
import categoryKeywords from '../categoryKeywords.js';

/**
 * Categorizes content based on rule-based keyword matching.
 * @param {string} content - The text to categorize.
 * @return {string} The assigned category.
 */
export function categorizeArticleRuleBased(content) {
  const lowerContent = content.toLowerCase();
  let maxScore = 0;
  let assignedCategory = 'Other';
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    keywords.forEach((keyword) => {
      if (lowerContent.includes(keyword.toLowerCase())) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      assignedCategory = category;
    }
  }
  return assignedCategory;
}

/**
 * Analyzes sentiment based on positive and negative keywords.
 * @param {string} content - The text to analyze.
 * @return {string} The sentiment: Positive, Negative, or Neutral.
 */
export function analyzeSentiment(content) {
  const lowerContent = content.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  positive.forEach((keyword) => {
    if (lowerContent.includes(keyword.toLowerCase())) positiveScore++;
  });
  negative.forEach((keyword) => {
    if (lowerContent.includes(keyword.toLowerCase())) negativeScore++;
  });
  if (positiveScore > negativeScore && positiveScore > 0) return 'Positive';
  else if (negativeScore > positiveScore && negativeScore > 0) return 'Negative';
  else return 'Neutral';
}

/**
 * Extracts entities (people, places, organizations) from text.
 * @param {string} text - The text to analyze.
 * @return {Promise<Object>} An object with arrays for people, places, and organizations.
 */
export async function analyzeEntities(text) {
  const doc = nlp(text);
  return {
    people: doc.people().out('array'),
    places: doc.places().out('array'),
    organizations: doc.organizations().out('array'),
  };
}

