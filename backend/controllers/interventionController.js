const asyncHandler = require('express-async-handler');
const Intervention = require('../models/Intervention');
const RemedialSession = require('../models/RemedialSession');
const User = require('../models/User');
const { sendEmail, buildInterventionEmail } = require('../utils/sendEmail');
const { sendSMS, buildInterventionSMS } = require('../utils/sendSMS');

// @desc    Create an intervention
// @route   POST /api/interventions
// @access  Counselor
const createIntervention = asyncHandler(async (req, res) => {
  const { studentId, riskAnalysisId, type, title, description, scheduledAt } = req.body;

  const student = await User.findById(studentId);
  if (!student) { res.status(404); throw new Error('Student not found'); }

  const intervention = await Intervention.create({
    student: studentId,
    riskAnalysis: riskAnalysisId,
    initiatedBy: req.user._id,
    type,
    title,
    description,
    scheduledAt,
    status: 'pending',
  });

  // Send notifications
  try {
    if (student.email) {
      await sendEmail(student.email, `Smart EWS: ${title}`, buildInterventionEmail(student.name, type, description));
      intervention.emailSent = true;
    }
    if (student.phone) {
      await sendSMS(student.phone, buildInterventionSMS(student.name, type));
      intervention.smsSent = true;
    }
    await intervention.save();
  } catch (e) {
    console.error('Notification failed:', e.message);
  }

  res.status(201).json({ success: true, intervention });
});

// @desc    Update intervention status/outcome
// @route   PUT /api/interventions/:id
// @access  Counselor
const updateIntervention = asyncHandler(async (req, res) => {
  const intervention = await Intervention.findById(req.params.id);
  if (!intervention) { res.status(404); throw new Error('Intervention not found'); }

  const { status, outcome, followUpRequired, followUpDate, completedAt } = req.body;
  if (status) intervention.status = status;
  if (outcome) intervention.outcome = outcome;
  if (followUpRequired !== undefined) intervention.followUpRequired = followUpRequired;
  if (followUpDate) intervention.followUpDate = followUpDate;
  if (completedAt) intervention.completedAt = completedAt;

  await intervention.save();
  res.json({ success: true, intervention });
});

// @desc    Get all interventions
// @route   GET /api/interventions
// @access  Counselor, Admin
const getAllInterventions = asyncHandler(async (req, res) => {
  const { status, type, studentId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (studentId) filter.student = studentId;

  const interventions = await Intervention.find(filter)
    .populate('student', 'name studentId department')
    .populate('initiatedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: interventions.length, interventions });
});

// @desc    Create remedial session
// @route   POST /api/interventions/remedial-session
// @access  Counselor, Faculty
const createRemedialSession = asyncHandler(async (req, res) => {
  const { title, subject, studentIds, scheduledAt, duration, location, isOnline, meetingLink, notes } = req.body;

  const session = await RemedialSession.create({
    title, subject,
    conductor: req.user._id,
    students: studentIds,
    scheduledAt, duration, location, isOnline, meetingLink, notes,
    attendance: studentIds.map((id) => ({ student: id, attended: false })),
  });

  // Notify all students
  const students = await User.find({ _id: { $in: studentIds } });
  for (const student of students) {
    try {
      if (student.email) {
        await sendEmail(
          student.email,
          `Smart EWS: Remedial Class - ${subject}`,
          buildInterventionEmail(student.name, 'remedial_class', `You have been enrolled in a remedial session: ${title} on ${new Date(scheduledAt).toLocaleString()}`)
        );
      }
    } catch (e) { console.error(e.message); }
  }

  res.status(201).json({ success: true, session });
});

// @desc    Mark remedial session attendance
// @route   PUT /api/interventions/remedial-session/:id/attendance
// @access  Faculty, Counselor
const markAttendance = asyncHandler(async (req, res) => {
  const { attendance } = req.body; // [{ student: id, attended: bool }]
  const session = await RemedialSession.findById(req.params.id);
  if (!session) { res.status(404); throw new Error('Session not found'); }

  session.attendance = attendance;
  session.status = 'completed';
  await session.save();
  res.json({ success: true, session });
});

module.exports = { createIntervention, updateIntervention, getAllInterventions, createRemedialSession, markAttendance };