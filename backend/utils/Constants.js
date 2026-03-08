const RISK_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.55,
  HIGH: 0.75,
  // above HIGH = critical
};

const RISK_CATEGORIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const INTERVENTION_TYPES = {
  REMEDIAL_CLASS: 'remedial_class',
  MEETING: 'meeting',
  ALERT: 'alert',
  NOTIFICATION: 'notification',
  COUNSELING: 'counseling',
};

// Logistic regression weights — calibrated for:
// GPA: 0-10 scale (featureEngineering normalises to 0-1 then inverts)
// Attendance: 0-100% (normalised to 0-1 then inverted)
// Behavior: 1-5 scale (normalised to 0-1 then inverted)
//   NOTE: raw CSV behaviour (1-10) is scaled to 1-5 in csvParser.mergeThreeFiles
// Marks: subject avg % (normalised 0-1 then inverted)
const MODEL_WEIGHTS = {
  gpa:        1.8,   // GPA is the strongest predictor (0-10 scale, already handled in featureEngineering)
  attendance: 2.0,   // attendance slightly upweighted — most actionable signal
  behavior:   0.9,
  marks:      1.4,   // internal marks (out of 30) carry good signal
  bias:       -3.5,  // recalibrated so median student (~65% att, GPA 7, avg marks 17) scores ~medium
};

module.exports = { RISK_THRESHOLDS, RISK_CATEGORIES, INTERVENTION_TYPES, MODEL_WEIGHTS };