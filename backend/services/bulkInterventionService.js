const RiskAnalysis = require('../models/Riskanalysis');
const Intervention = require('../models/Intervention');
const User = require('../models/User');
const { sendEmail, buildInterventionEmail } = require('../utils/sendEmail');
const { sendSMS, buildInterventionSMS } = require('../utils/sendSMS');
const { RISK_CATEGORIES } = require('../utils/constants');

/**
 * Auto-trigger bulk interventions for all high/critical risk students.
 * Called after model scoring or on counselor request.
 */
const triggerBulkInterventions = async (counselorId) => {
  const highRiskAnalyses = await RiskAnalysis.find({
    riskCategory: { $in: [RISK_CATEGORIES.HIGH, RISK_CATEGORIES.CRITICAL] },
    isReviewed: false,
  }).populate('student');

  const results = [];

  for (const analysis of highRiskAnalyses) {
    const { student, riskCategory } = analysis;
    if (!student) continue;

    const interventionType = riskCategory === RISK_CATEGORIES.CRITICAL ? 'meeting' : 'alert';
    const title =
      riskCategory === RISK_CATEGORIES.CRITICAL
        ? 'Urgent Academic Counseling Meeting'
        : 'Academic Performance Alert';

    const intervention = await Intervention.create({
      student: student._id,
      riskAnalysis: analysis._id,
      initiatedBy: counselorId,
      type: interventionType,
      title,
      description: analysis.explanation,
      status: 'pending',
    });

    // Send notifications
    try {
      if (student.email) {
        await sendEmail(
          student.email,
          `Smart EWS: ${title}`,
          buildInterventionEmail(student.name, interventionType, analysis.explanation)
        );
        intervention.emailSent = true;
      }
      if (student.phone) {
        await sendSMS(student.phone, buildInterventionSMS(student.name, interventionType));
        intervention.smsSent = true;
      }
      await intervention.save();
    } catch (notifyErr) {
      console.error(`Notification error for ${student.email}:`, notifyErr.message);
    }

    results.push({ student: student.name, interventionType, status: 'created' });
  }

  return results;
};

module.exports = { triggerBulkInterventions };