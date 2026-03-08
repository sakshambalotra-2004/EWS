const express = require('express');
const router = express.Router();
const { analyzeStudent, analyzeAll, getRiskScores, getStudentRiskHistory, reviewAnalysis, bulkIntervene, getAnalytics } = require('../controllers/counselorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('counselor', 'admin'));

router.post('/analyze/:performanceId', analyzeStudent);
router.post('/analyze-all', analyzeAll);
router.get('/risk-scores', getRiskScores);
router.get('/risk-history/:studentId', getStudentRiskHistory);
router.put('/review/:analysisId', reviewAnalysis);
router.post('/bulk-intervene', bulkIntervene);
router.get('/analytics', getAnalytics);

module.exports = router;