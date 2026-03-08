const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const StudentPerformance = require('../models/StudentPerformance');
const { parseCSV, detectFormat, mergeThreeFiles } = require('../utils/csvParser');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const csvFilter = (req, file, cb) => {
  if (path.extname(file.originalname) !== '.csv') return cb(new Error('Only CSV files are allowed'));
  cb(null, true);
};
const upload      = multer({ storage, fileFilter: csvFilter });
const uploadMulti = multer({ storage, fileFilter: csvFilter });

// @desc    Upload semester CSV data
// @route   POST /api/faculty/upload-csv
// @access  Faculty
const uploadCSV = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }

  const { semester, academicYear } = req.body;
  const rows = await parseCSV(req.file.path);

  const results = [];
  for (const row of rows) {
    const student = await User.findOne({ studentId: row.studentId, role: 'student' });
    if (!student) { results.push({ studentId: row.studentId, status: 'not_found' }); continue; }

    let perf = await StudentPerformance.findOne({ student: student._id, semester, academicYear });
    if (!perf) {
      perf = new StudentPerformance({ student: student._id, uploadedBy: req.user._id, semester, academicYear, subjects: [], gpa: row.gpa, attendancePercentage: row.attendance, behaviorScore: row.behavior });
    }

    // Upsert subject
    const existingSubjectIdx = perf.subjects.findIndex((s) => s.name === row.subject);
    const subjectData = { name: row.subject, marksObtained: row.marksObtained, totalMarks: row.totalMarks };
    if (existingSubjectIdx >= 0) perf.subjects[existingSubjectIdx] = subjectData;
    else perf.subjects.push(subjectData);

    perf.gpa = row.gpa;
    perf.attendancePercentage = row.attendance;
    perf.behaviorScore = row.behavior;
    await perf.save();
    results.push({ studentId: row.studentId, status: 'updated', performanceId: perf._id });
  }

  res.json({ success: true, processed: rows.length, results });
});

// @desc    Manually enter behavioral score & remarks
// @route   PUT /api/faculty/behavioral/:performanceId
// @access  Faculty
const updateBehavioral = asyncHandler(async (req, res) => {
  const { behaviorScore, remarks } = req.body;
  const perf = await StudentPerformance.findById(req.params.performanceId);
  if (!perf) { res.status(404); throw new Error('Performance record not found'); }

  perf.behaviorScore = behaviorScore;
  perf.remarks = remarks;
  await perf.save();

  res.json({ success: true, message: 'Behavioral data updated', performance: perf });
});

// @desc    Get all students with their latest performance
// @route   GET /api/faculty/students
// @access  Faculty
const getStudentPerformances = asyncHandler(async (req, res) => {
  const { semester, academicYear, department } = req.query;
  const filter = {};
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  const performances = await StudentPerformance.find(filter)
    .populate({ path: 'student', match: department ? { department } : {}, select: 'name studentId department semester' })
    .sort({ createdAt: -1 });

  const filtered = performances.filter((p) => p.student !== null);
  res.json({ success: true, count: filtered.length, performances: filtered });
});


// @desc    Upload three separate CSV files (marks + attendance + gpa) and merge
// @route   POST /api/faculty/upload-multi-csv
// @access  Faculty
const uploadMultiCSV = asyncHandler(async (req, res) => {
  const files = req.files || {};
  if (!files.marks || !files.attendance || !files.gpa) {
    res.status(400);
    throw new Error('Please upload all three files: marks, attendance, and gpa');
  }

  const { semester = 4, academicYear = '2024-25' } = req.body;

  // Parse all three files
  const [marksRows, attendanceRows, gpaRows] = await Promise.all([
    parseCSV(files.marks[0].path),
    parseCSV(files.attendance[0].path),
    parseCSV(files.gpa[0].path),
  ]);

  // Merge into per-student records
  const merged = mergeThreeFiles(marksRows, attendanceRows, gpaRows);
  const studentIds = Object.keys(merged);

  let inserted = 0, updated = 0;
  const errors = [];

  for (const studentId of studentIds) {
    const record = merged[studentId];
    const student = await User.findOne({ studentId, role: 'student' });
    if (!student) { errors.push(`Student ${studentId} not found`); continue; }

    let perf = await StudentPerformance.findOne({ student: student._id, semester, academicYear });
    const isNew = !perf;

    if (!perf) {
      perf = new StudentPerformance({
        student:              student._id,
        uploadedBy:           req.user._id,
        semester:             Number(semester),
        academicYear,
        subjects:             [],
        gpa:                  0,
        attendancePercentage: 75,
        behaviorScore:        3,
      });
    }

    perf.gpa                  = record.gpa ?? perf.gpa;
    perf.attendancePercentage = record.attendancePercentage ?? perf.attendancePercentage;
    perf.behaviorScore        = record.behaviorScore ?? perf.behaviorScore;

    // Upsert subjects
    for (const subj of record.subjects) {
      const idx = perf.subjects.findIndex(s => s.name === subj.name);
      if (idx >= 0) perf.subjects[idx] = subj;
      else perf.subjects.push(subj);
    }

    await perf.save();
    if (isNew) inserted++; else updated++;
  }

  res.json({
    success:   true,
    processed: studentIds.length,
    inserted,
    updated,
    errors,
    message:   `${inserted} new records created, ${updated} updated${errors.length ? `, ${errors.length} skipped` : ''}`,
  });
});

module.exports = { uploadCSV, uploadMultiCSV, updateBehavioral, getStudentPerformances, upload, uploadMulti };