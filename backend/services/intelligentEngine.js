const { calculateRiskScore, getRiskCategory, getFeatureContributions } = require('./riskCalculator');
const { analyzeTrend } = require('./trendAnalyzer');
const { generateRecommendations } = require('./recommendationEngine');
const RiskAnalysis = require('../models/Riskanalysis');
const StudentPerformance = require('../models/StudentPerformance');
const { buildFeatureVector } = require('./featureEngineering');

/**
 * Full risk analysis pipeline for a student.
 * 1. Build feature vector
 * 2. Calculate risk score (logistic regression)
 * 3. Categorize risk
 * 4. Analyze trend
 * 5. Generate explanation & suggestions
 * 6. Persist RiskAnalysis document
 */
const runRiskAnalysis = async (performanceId, triggeredBy) => {
  const performance = await StudentPerformance.findById(performanceId);
  if (!performance) throw new Error('Performance record not found');

  // Step 1 & 2: Feature vector + Risk score
  const { riskScore, featureData } = calculateRiskScore(performance);

  // Step 3: Category
  const riskCategory = getRiskCategory(riskScore);

  // Step 4: Feature contributions
  const featureContributions = getFeatureContributions(featureData.riskFeatures);

  // Step 5: Trend
  const { trend, previousScore } = await analyzeTrend(performance.student, riskScore);

  // Step 6: Recommendations
  const { suggestions, explanation } = generateRecommendations(
    riskScore,
    riskCategory,
    featureContributions
  );

  // Step 7: Save feature vector back to performance
  performance.featureVector = {
    normalizedGpa: featureData.normalizedGpa,
    normalizedAttendance: featureData.normalizedAttendance,
    normalizedBehavior: featureData.normalizedBehavior,
    averageMarksPercent: featureData.averageMarksPercent,
  };
  await performance.save();

  // Step 8: Persist risk analysis
  const analysis = await RiskAnalysis.create({
    student: performance.student,
    performance: performanceId,
    triggeredBy,
    riskScore,
    riskCategory,
    featureContributions,
    trend,
    previousRiskScore: previousScore,
    explanation,
    suggestions,
  });

  return analysis;
};

module.exports = { runRiskAnalysis };