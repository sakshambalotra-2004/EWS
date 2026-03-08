const { RISK_CATEGORIES } = require('../utils/constants');

/**
 * Generate human-readable explanation and suggestions based on risk data.
 */
const generateRecommendations = (riskScore, riskCategory, featureContributions) => {
  const suggestions = [];
  const { gpa, attendance, behavior, marks } = featureContributions;

  // GPA-based suggestions
  if (gpa > 30) {
    suggestions.push('Focus on improving your GPA through consistent study and revision.');
    suggestions.push('Seek academic help from faculty during office hours.');
  }

  // Attendance-based suggestions
  if (attendance > 25) {
    suggestions.push('Your attendance is a key risk factor. Aim for at least 75% attendance.');
    suggestions.push('Inform faculty in advance if you need to miss classes.');
  }

  // Behavior-based suggestions
  if (behavior > 20) {
    suggestions.push('Engage more actively in class activities and discussions.');
    suggestions.push('Consider speaking with a counselor about any challenges you are facing.');
  }

  // Marks-based suggestions
  if (marks > 25) {
    suggestions.push('Practice past exam papers and seek feedback from faculty on weak subjects.');
    suggestions.push('Form study groups with high-performing peers.');
  }

  // Category-level suggestions
  if (riskCategory === RISK_CATEGORIES.CRITICAL) {
    suggestions.unshift('⚠️ Immediate counselor intervention recommended. Please visit the academic support center.');
  } else if (riskCategory === RISK_CATEGORIES.HIGH) {
    suggestions.unshift('Your academic performance requires urgent attention. A remedial class has been suggested.');
  }

  const explanation = buildExplanation(riskScore, riskCategory, featureContributions);

  return { suggestions, explanation };
};

const buildExplanation = (riskScore, riskCategory, contributions) => {
  const topFactor = Object.entries(contributions).sort((a, b) => b[1] - a[1])[0];
  return (
    `Your current risk score is ${(riskScore * 100).toFixed(1)}% (${riskCategory.toUpperCase()}). ` +
    `The primary contributing factor is your ${topFactor[0].toUpperCase()} (${topFactor[1]}% contribution). ` +
    `Addressing this area first will have the greatest positive impact on your academic standing.`
  );
};

module.exports = { generateRecommendations };