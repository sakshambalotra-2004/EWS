const asyncHandler = require('express-async-handler');
const RiskAnalysis = require('../models/Riskanalysis');
const StudentPerformance = require('../models/StudentPerformance');
const Intervention = require('../models/Intervention');
const { getRiskHistory } = require('../services/trendAnalyzer');

// @desc    Get my latest risk score & trend
// @route   GET /api/student/my-risk
// @access  Student
const getMyRisk = asyncHandler(async (req, res) => {
  const latest = await RiskAnalysis.findOne({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('performance', 'semester academicYear gpa attendancePercentage');

  if (!latest) {
    return res.json({ success: true, message: 'No risk analysis available yet.' });
  }
  res.json({ success: true, analysis: latest });
});

// @desc    Get my risk history for chart
// @route   GET /api/student/my-risk-history
// @access  Student
const getMyRiskHistory = asyncHandler(async (req, res) => {
  const history = await getRiskHistory(req.user._id);
  res.json({ success: true, history });
});

// @desc    Get my performance records
// @route   GET /api/student/my-performance
// @access  Student
const getMyPerformance = asyncHandler(async (req, res) => {
  const records = await StudentPerformance.find({ student: req.user._id })
    .sort({ semester: -1, createdAt: -1 });
  res.json({ success: true, records });
});

// @desc    Get my suggestions from latest analysis
// @route   GET /api/student/my-suggestions
// @access  Student
const getMySuggestions = asyncHandler(async (req, res) => {
  const latest = await RiskAnalysis.findOne({ student: req.user._id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ success: true, suggestions: [], explanation: null });
  res.json({ success: true, suggestions: latest.suggestions, explanation: latest.explanation, riskScore: latest.riskScore, riskCategory: latest.riskCategory });
});

// @desc    Request help (triggers counselor notification)
// @route   POST /api/student/request-help
// @access  Student
const requestHelp = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const intervention = await Intervention.create({
    student: req.user._id,
    initiatedBy: req.user._id,
    type: 'counseling',
    title: 'Student Help Request',
    description: message || 'Student has requested counselor support via the portal.',
    status: 'pending',
  });

  res.status(201).json({ success: true, message: 'Help request sent to your counselor.', intervention });
});

// @desc    Get my interventions
// @route   GET /api/student/my-interventions
// @access  Student
const getMyInterventions = asyncHandler(async (req, res) => {
  const interventions = await Intervention.find({ student: req.user._id })
    .populate('initiatedBy', 'name role')
    .sort({ createdAt: -1 });
  res.json({ success: true, interventions });
});

module.exports = { getMyRisk, getMyRiskHistory, getMyPerformance, getMySuggestions, requestHelp, getMyInterventions };