import nlp from 'compromise';
import { positive, negative } from '../sentimentKeywords.js';
import natural from 'natural';
import trainingData from './trainingData.json' assert { type: "json" };

// Text Cleaning Function
function cleanText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

// 🧠 Initialize and Train Classifier
const classifier = new natural.LogisticRegressionClassifier();
trainingData.forEach(data => classifier.addDocument(cleanText(data.text), data.category));
classifier.train();

/**
 * Categorizes content using ML (Logistic Regression).
 * @param {string} content - The text to categorize.
 * @return {string} The predicted category.
 */
export function categorizeArticleML(content) {
  const cleaned = cleanText(content);
  const classifications = classifier.getClassifications(cleaned);
  const topPrediction = classifications[0];
  return topPrediction ? topPrediction.label : 'misc'; 
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
