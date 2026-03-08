const RiskAnalysis = require('../models/Riskanalysis');
const StudentPerformance = require('../models/StudentPerformance');
const User = require('../models/User');
const Intervention = require('../models/Intervention');

/**
 * Institution-level analytics for admin dashboard.
 */
const getInstitutionAnalytics = async () => {
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });

  const riskDistribution = await RiskAnalysis.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$student',
        latestCategory: { $first: '$riskCategory' },
        latestScore: { $first: '$riskScore' },
      },
    },
    {
      $group: {
        _id: '$latestCategory',
        count: { $sum: 1 },
      },
    },
  ]);

  const interventionStats = await Intervention.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const avgRiskScore = await RiskAnalysis.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$student', score: { $first: '$riskScore' } } },
    { $group: { _id: null, avg: { $avg: '$score' } } },
  ]);

  const trendStats = await RiskAnalysis.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$student', trend: { $first: '$trend' } } },
    { $group: { _id: '$trend', count: { $sum: 1 } } },
  ]);

  return {
    totalStudents,
    riskDistribution,
    interventionStats,
    avgRiskScore: avgRiskScore[0]?.avg?.toFixed(3) || 0,
    trendStats,
  };
};

/**
 * Department-level analytics.
 */
const getDepartmentAnalytics = async (department) => {
  const students = await User.find({ role: 'student', department, isActive: true }).select('_id');
  const studentIds = students.map((s) => s._id);

  const riskData = await RiskAnalysis.find({ student: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .populate('student', 'name studentId');

  return riskData;
};

module.exports = { getInstitutionAnalytics, getDepartmentAnalytics };