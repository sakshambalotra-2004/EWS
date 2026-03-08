const mongoose = require('mongoose');

const riskAnalysisSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performance: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentPerformance' },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Risk output from model
    riskScore: { type: Number, min: 0, max: 1, required: true },
    riskCategory: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },

    // Feature breakdown (explainability)
    featureContributions: {
      gpa: { type: Number },
      attendance: { type: Number },
      behavior: { type: Number },
      marks: { type: Number },
    },

    // Trend
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    previousRiskScore: { type: Number },

    // Prediction explanations shown to student
    explanation: { type: String },
    suggestions: [{ type: String }],

    // Status
    isReviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.RiskAnalysis || mongoose.model('RiskAnalysis', riskAnalysisSchema);