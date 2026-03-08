const mongoose = require('mongoose');

const studentPerformanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },

    // Academic metrics
    subjects: [
      {
        name: { type: String },
        marksObtained: { type: Number },
        totalMarks: { type: Number },
        grade: { type: String },
      },
    ],
    gpa: { type: Number, min: 0, max: 10 },
    attendancePercentage: { type: Number, min: 0, max: 100 },

    // Behavioral score (1-5 scale entered by faculty)
    behaviorScore: { type: Number, min: 1, max: 5 },
    remarks: { type: String },

    // Computed feature vector
    featureVector: {
      normalizedGpa: { type: Number },
      normalizedAttendance: { type: Number },
      normalizedBehavior: { type: Number },
      averageMarksPercent: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StudentPerformance || mongoose.model('StudentPerformance', studentPerformanceSchema);