const mongoose = require('mongoose');

const remedialSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // in minutes
    location: { type: String },
    isOnline: { type: Boolean, default: false },
    meetingLink: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    attendance: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        attended: { type: Boolean, default: false },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.RemedialSession || mongoose.model('RemedialSession', remedialSessionSchema);