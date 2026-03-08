const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    riskAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskAnalysis' },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: ['remedial_class', 'meeting', 'alert', 'notification', 'counseling'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },

    title: { type: String, required: true },
    description: { type: String },
    scheduledAt: { type: Date },
    completedAt: { type: Date },

    // Outcome tracking
    outcome: { type: String },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },

    // Notification flags
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Intervention || mongoose.model('Intervention', interventionSchema);