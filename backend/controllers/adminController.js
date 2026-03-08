const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const StudentPerformance = require('../models/StudentPerformance');
const { getInstitutionAnalytics } = require('../services/analyticsService');
const { trainModel } = require('../services/modelTrainer');
const { parseCSV, parseGPAFile } = require('../utils/csvParser');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploadGPA = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') return cb(new Error('Only CSV files are allowed'));
    cb(null, true);
  },
});


// @desc    Create a new user account
// @route   POST /api/admin/users
// @access  Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, semester, batch, studentId, facultyId, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ name, email, password, role, department, semester, batch, studentId, facultyId, phone });

  await AuditLog.create({
    performedBy: req.user._id,
    action: 'CREATE_USER',
    targetModel: 'User',
    targetId: user._id,
    details: { role, email },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

// @desc    Get institution analytics dashboard
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getInstitutionAnalytics();
  res.json({ success: true, data });
});

// @desc    Trigger model retraining
// @route   POST /api/admin/retrain
// @access  Admin
const retrainModel = asyncHandler(async (req, res) => {
  const result = await trainModel();
  await AuditLog.create({
    performedBy: req.user._id,
    action: 'RETRAIN_MODEL',
    details: result,
    ipAddress: req.ip,
  });
  res.json({ success: true, result });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('performedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, logs });
});


// @desc    Upload gpa.csv — sets previousGPA on existing StudentPerformance records
// @route   POST /api/admin/upload-gpa
// @access  Admin
const uploadGPAData = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }

  const { semester = 4, academicYear = '2024-25' } = req.body;
  const rows   = await parseCSV(req.file.path);
  const gpaMap = parseGPAFile(rows);
  const ids    = Object.keys(gpaMap);

  let updated = 0, skippedNoUser = 0, skippedNoPerf = 0;
  const errors = [];

  for (const studentId of ids) {
    const student = await User.findOne({ studentId, role: 'student' });
    if (!student) { skippedNoUser++; errors.push(`${studentId}: student not found`); continue; }

    const perf = await StudentPerformance.findOne({ student: student._id, semester, academicYear });
    if (!perf) {
      // Create a skeleton record so GPA is stored even before faculty uploads marks
      await StudentPerformance.create({
        student:      student._id,
        uploadedBy:   req.user._id,
        semester:     Number(semester),
        academicYear,
        gpa:          gpaMap[studentId],
        subjects:             [],
        attendancePercentage: 75,
        behaviorScore:        3,
      });
      updated++;
      continue;
    }

    perf.gpa = gpaMap[studentId];
    await perf.save();
    updated++;
  }

  await AuditLog.create({
    performedBy: req.user._id,
    action:      'UPLOAD_GPA',
    targetModel: 'StudentPerformance',
    details:     { semester, academicYear, updated, skippedNoUser, skippedNoPerf },
    ipAddress:   req.ip,
  });

  res.json({
    success:  true,
    processed: ids.length,
    updated,
    errors,
    message: `GPA updated for ${updated} students${errors.length ? `, ${errors.length} skipped` : ''}`,
  });
});

module.exports = {
  uploadGPAData, uploadGPA, createUser, getAllUsers, toggleUserStatus, getAnalytics, retrainModel, getAuditLogs };