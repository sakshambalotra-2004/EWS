const express = require('express');
const router = express.Router();
const { createIntervention, updateIntervention, getAllInterventions, createRemedialSession, markAttendance } = require('../controllers/interventionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('counselor', 'admin', 'faculty'));

router.post('/', createIntervention);
router.put('/:id', updateIntervention);
router.get('/', getAllInterventions);
router.post('/remedial-session', createRemedialSession);
router.put('/remedial-session/:id/attendance', markAttendance);

module.exports = router;