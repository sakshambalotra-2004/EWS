const StudentPerformance = require('../models/StudentPerformance');
const RiskAnalysis = require('../models/Riskanalysis');
const { buildFeatureVector } = require('./featureEngineering');
const { sigmoid } = require('../utils/mathHelpers');
const { MODEL_WEIGHTS } = require('../utils/constants');

/**
 * Simple online logistic regression training using gradient descent.
 * Uses historical labeled data (riskCategory mapped to binary label).
 * Updates MODEL_WEIGHTS in memory (for a production system, persist weights to DB).
 */
const LEARNING_RATE = 0.01;
const EPOCHS = 100;

const categoryToLabel = (category) => {
  return category === 'low' ? 0 : 1;
};

const trainModel = async () => {
  const analyses = await RiskAnalysis.find({ isReviewed: true }).populate('performance');
  if (analyses.length < 10) {
    return { message: 'Not enough labeled data for retraining (need at least 10 reviewed analyses).' };
  }

  const weights = { ...MODEL_WEIGHTS };

  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    let totalLoss = 0;

    for (const record of analyses) {
      if (!record.performance) continue;
      const { riskFeatures } = buildFeatureVector(record.performance);
      const label = categoryToLabel(record.riskCategory);

      // Forward pass
      const z =
        riskFeatures.gpa * weights.gpa +
        riskFeatures.attendance * weights.attendance +
        riskFeatures.behavior * weights.behavior +
        riskFeatures.marks * weights.marks +
        weights.bias;

      const prediction = sigmoid(z);
      const error = prediction - label;
      totalLoss += Math.pow(error, 2);

      // Gradient descent update
      weights.gpa -= LEARNING_RATE * error * riskFeatures.gpa;
      weights.attendance -= LEARNING_RATE * error * riskFeatures.attendance;
      weights.behavior -= LEARNING_RATE * error * riskFeatures.behavior;
      weights.marks -= LEARNING_RATE * error * riskFeatures.marks;
      weights.bias -= LEARNING_RATE * error;
    }

    if (epoch % 10 === 0) {
      console.log(`Epoch ${epoch} | Loss: ${(totalLoss / analyses.length).toFixed(6)}`);
    }
  }

  // Update in-memory weights
  Object.assign(MODEL_WEIGHTS, weights);
  console.log('Model retrained. New weights:', MODEL_WEIGHTS);

  return { message: 'Model retrained successfully.', weights: MODEL_WEIGHTS };
};

module.exports = { trainModel };