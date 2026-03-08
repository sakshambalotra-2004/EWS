const express = require('express');
const router = express.Router();
const { getMyRisk, getMyRiskHistory, getMyPerformance, getMySuggestions, requestHelp, getMyInterventions } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('student'));

router.get('/my-risk', getMyRisk);
router.get('/my-risk-history', getMyRiskHistory);
router.get('/my-performance', getMyPerformance);
router.get('/my-suggestions', getMySuggestions);
router.post('/request-help', requestHelp);
router.get('/my-interventions', getMyInterventions);

module.exports = router;