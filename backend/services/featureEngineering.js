const { normalize, average } = require('../utils/mathHelpers');

/**
 * Build a normalized feature vector from raw student performance data.
 * GPA: 0-10 → normalized to [0,1]
 * Attendance: 0-100 → normalized to [0,1]
 * Behavior: 1-5 → normalized to [0,1]
 * Marks: computed as average percentage across subjects
 */
const buildFeatureVector = (performance) => {
  const { gpa, attendancePercentage, behaviorScore, subjects } = performance;

  const normalizedGpa = normalize(gpa || 0, 0, 10);
  const normalizedAttendance = normalize(attendancePercentage || 0, 0, 100);
  const normalizedBehavior = normalize(behaviorScore || 3, 1, 5);

  let averageMarksPercent = 0;
  if (subjects && subjects.length > 0) {
    const percentages = subjects.map((s) =>
      s.totalMarks > 0 ? (s.marksObtained / s.totalMarks) * 100 : 0
    );
    averageMarksPercent = average(percentages);
  }
  const normalizedMarks = normalize(averageMarksPercent, 0, 100);

  return {
    normalizedGpa,
    normalizedAttendance,
    normalizedBehavior,
    normalizedMarks,
    averageMarksPercent,
    // Inverted features for risk (low gpa = high risk)
    riskFeatures: {
      gpa: 1 - normalizedGpa,
      attendance: 1 - normalizedAttendance,
      behavior: 1 - normalizedBehavior,
      marks: 1 - normalizedMarks,
    },
  };
};

module.exports = { buildFeatureVector };