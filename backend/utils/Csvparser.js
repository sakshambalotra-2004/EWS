const csv = require('csv-parser');
const fs  = require('fs');

/**
 * Parse any CSV file and return raw row objects.
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end',  () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

/**
 * Merge marks.csv + attendance.csv (uploaded by Faculty).
 * Returns Map<studentId, partialRecord> — gpa is NOT set here.
 *
 * marks.csv columns:     studentId, subject, internalMarks, assignmentSubmitted, behaviourScore
 * attendance.csv columns: studentId, subject, totalClasses, attendedClasses
 *
 * Output shape per student:
 * {
 *   studentId, subjects[{name,marksObtained,totalMarks}],
 *   attendancePercentage, behaviorScore, assignmentRate
 * }
 */
const mergeFacultyFiles = (marksRows, attendanceRows) => {
  const students = {};

  // ── Marks + behaviour ────────────────────────────────────────────────────
  for (const row of marksRows) {
    const id  = row.studentId?.trim();
    const sub = row.subject?.trim();
    if (!id || !sub) continue;
    if (!students[id]) students[id] = { studentId: id, subjects: [], _attBySubject: {}, _behScores: [], _assignCount: { yes: 0, total: 0 } };

    students[id].subjects.push({
      name:          sub,
      marksObtained: parseInt(row.internalMarks) || 0,
      totalMarks:    30,
    });

    // Behaviour: CSV uses 1-10 scale → scale down to 1-5 for model
    students[id]._behScores.push(parseInt(row.behaviourScore) || 5);

    students[id]._assignCount.total++;
    if (row.assignmentSubmitted?.trim().toLowerCase() === 'true') students[id]._assignCount.yes++;
  }

  // ── Attendance ───────────────────────────────────────────────────────────
  for (const row of attendanceRows) {
    const id  = row.studentId?.trim();
    const sub = row.subject?.trim();
    if (!id || !sub) continue;
    if (!students[id]) students[id] = { studentId: id, subjects: [], _attBySubject: {}, _behScores: [], _assignCount: { yes: 0, total: 0 } };

    const total    = parseInt(row.totalClasses)    || 1;
    const attended = parseInt(row.attendedClasses) || 0;
    students[id]._attBySubject[sub] = (attended / total) * 100;
  }

  // ── Finalise ─────────────────────────────────────────────────────────────
  for (const id of Object.keys(students)) {
    const s = students[id];

    const attVals = Object.values(s._attBySubject);
    s.attendancePercentage = attVals.length
      ? Math.round(attVals.reduce((a, b) => a + b, 0) / attVals.length * 10) / 10
      : 75;

    // Average raw behaviour (1-10) → scale to 1-5
    s.behaviorScore = s._behScores.length
      ? Math.round(((s._behScores.reduce((a, b) => a + b, 0) / s._behScores.length) / 10) * 5 * 10) / 10
      : 3;

    s.assignmentRate = s._assignCount.total > 0
      ? Math.round((s._assignCount.yes / s._assignCount.total) * 100) / 100
      : 0.5;

    delete s._attBySubject;
    delete s._behScores;
    delete s._assignCount;
  }

  return students;
};

/**
 * Merge gpa.csv (uploaded by Admin) into existing StudentPerformance records.
 * Returns Map<studentId, { gpa: number }>
 *
 * gpa.csv columns: studentId, previousGPA  (0-10 scale)
 */
const parseGPAFile = (gpaRows) => {
  const gpaMap = {};
  for (const row of gpaRows) {
    const id = row.studentId?.trim();
    if (!id) continue;
    gpaMap[id] = parseFloat(row.previousGPA) || 0;
  }
  return gpaMap;
};

module.exports = { parseCSV, mergeFacultyFiles, parseGPAFile };