const asyncHandler = require('express-async-handler');
const StudentPerformance = require('../models/StudentPerformance');
const RiskAnalysis = require('../models/Riskanalysis');
const { runRiskAnalysis } = require('../services/intelligentEngine');
const { getRiskHistory } = require('../services/trendAnalyzer');
const { triggerBulkInterventions } = require('../services/bulkInterventionService');
const { getDepartmentAnalytics } = require('../services/analyticsService');

// @desc    Trigger risk analysis for a single student
// @route   POST /api/counselor/analyze/:performanceId
// @access  Counselor
const analyzeStudent = asyncHandler(async (req, res) => {
  const analysis = await runRiskAnalysis(req.params.performanceId, req.user._id);
  res.status(201).json({ success: true, analysis });
});

// @desc    Trigger bulk risk analysis for all students with performance data
// @route   POST /api/counselor/analyze-all
// @access  Counselor
const analyzeAll = asyncHandler(async (req, res) => {
  const { semester, academicYear } = req.body;
  const performances = await StudentPerformance.find({ semester, academicYear });

  const results = [];
  for (const perf of performances) {
    try {
      const analysis = await runRiskAnalysis(perf._id, req.user._id);
      results.push({ student: perf.student, riskScore: analysis.riskScore, category: analysis.riskCategory });
    } catch (e) {
      results.push({ student: perf.student, error: e.message });
    }
  }
  res.json({ success: true, processed: results.length, results });
});

// @desc    Get all risk analyses (with filters)
// @route   GET /api/counselor/risk-scores
// @access  Counselor
const getRiskScores = asyncHandler(async (req, res) => {
  const { category, trend } = req.query;
  const filter = {};
  if (category) filter.riskCategory = category;
  if (trend) filter.trend = trend;

  const analyses = await RiskAnalysis.find(filter)
    .populate('student', 'name studentId department semester')
    .sort({ riskScore: -1, createdAt: -1 });

  res.json({ success: true, count: analyses.length, analyses });
});

// @desc    Get risk history for a student
// @route   GET /api/counselor/risk-history/:studentId
// @access  Counselor
const getStudentRiskHistory = asyncHandler(async (req, res) => {
  const history = await getRiskHistory(req.params.studentId);
  res.json({ success: true, history });
});

// @desc    Mark analysis as reviewed
// @route   PUT /api/counselor/review/:analysisId
// @access  Counselor
const reviewAnalysis = asyncHandler(async (req, res) => {
  const analysis = await RiskAnalysis.findById(req.params.analysisId);
  if (!analysis) { res.status(404); throw new Error('Analysis not found'); }

  analysis.isReviewed = true;
  analysis.reviewedBy = req.user._id;
  analysis.reviewedAt = new Date();
  await analysis.save();

  res.json({ success: true, message: 'Analysis marked as reviewed' });
});

// @desc    Trigger bulk interventions for high/critical risk students
// @route   POST /api/counselor/bulk-intervene
// @access  Counselor
const bulkIntervene = asyncHandler(async (req, res) => {
  const results = await triggerBulkInterventions(req.user._id);
  res.json({ success: true, triggered: results.length, results });
});

// @desc    Department analytics
// @route   GET /api/counselor/analytics
// @access  Counselor
const getAnalytics = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const data = await getDepartmentAnalytics(department);
  res.json({ success: true, data });
});

module.exports = { analyzeStudent, analyzeAll, getRiskScores, getStudentRiskHistory, reviewAnalysis, bulkIntervene, getAnalytics };