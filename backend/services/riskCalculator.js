const { sigmoid, dotProduct } = require('../utils/mathHelpers');
const { MODEL_WEIGHTS, RISK_THRESHOLDS, RISK_CATEGORIES } = require('../utils/constants');
const { buildFeatureVector } = require('./featureEngineering');

/**
 * Calculate risk score using Logistic Regression (Perceptron Logic).
 * Returns score between 0 (safe) and 1 (at-risk).
 */
const calculateRiskScore = (performance) => {
  const featureData = buildFeatureVector(performance);
  const { riskFeatures } = featureData;

  const z = dotProduct(riskFeatures, MODEL_WEIGHTS);
  const riskScore = sigmoid(z);

  return { riskScore: parseFloat(riskScore.toFixed(4)), featureData };
};

/**
 * Map numeric risk score to a category label.
 */
const getRiskCategory = (riskScore) => {
  if (riskScore < RISK_THRESHOLDS.LOW) return RISK_CATEGORIES.LOW;
  if (riskScore < RISK_THRESHOLDS.MEDIUM) return RISK_CATEGORIES.MEDIUM;
  if (riskScore < RISK_THRESHOLDS.HIGH) return RISK_CATEGORIES.HIGH;
  return RISK_CATEGORIES.CRITICAL;
};

/**
 * Compute feature contributions as percentages for explainability.
 */
const getFeatureContributions = (riskFeatures) => {
  const weights = MODEL_WEIGHTS;
  const raw = {
    gpa: riskFeatures.gpa * weights.gpa,
    attendance: riskFeatures.attendance * weights.attendance,
    behavior: riskFeatures.behavior * weights.behavior,
    marks: riskFeatures.marks * weights.marks,
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  return {
    gpa: parseFloat(((raw.gpa / total) * 100).toFixed(1)),
    attendance: parseFloat(((raw.attendance / total) * 100).toFixed(1)),
    behavior: parseFloat(((raw.behavior / total) * 100).toFixed(1)),
    marks: parseFloat(((raw.marks / total) * 100).toFixed(1)),
  };
};

module.exports = { calculateRiskScore, getRiskCategory, getFeatureContributions };