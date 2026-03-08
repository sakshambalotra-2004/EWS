const RiskAnalysis = require('../models/Riskanalysis');

/**
 * Analyze trend for a student by comparing recent risk scores.
 * Returns 'improving', 'stable', or 'declining'.
 */
const analyzeTrend = async (studentId, currentScore) => {
  const recent = await RiskAnalysis.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('riskScore');

  if (!recent.length) return { trend: 'stable', previousScore: null };

  const previousScore = recent[0].riskScore;
  const delta = currentScore - previousScore;

  let trend = 'stable';
  if (delta < -0.05) trend = 'improving';
  else if (delta > 0.05) trend = 'declining';

  // Compute rolling average if enough history
  let rollingAvg = null;
  if (recent.length >= 2) {
    const scores = recent.map((r) => r.riskScore);
    rollingAvg = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4));
  }

  return { trend, previousScore, rollingAvg };
};

/**
 * Get historical risk scores for chart rendering.
 */
const getRiskHistory = async (studentId, limit = 10) => {
  const history = await RiskAnalysis.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('riskScore riskCategory createdAt trend');
  return history.reverse();
};

module.exports = { analyzeTrend, getRiskHistory };