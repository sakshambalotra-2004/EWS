const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, toggleUserStatus, getAnalytics, retrainModel, getAuditLogs, uploadGPAData, uploadGPA } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.post('/users', createUser);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/analytics', getAnalytics);
router.post('/retrain', retrainModel);
router.get('/audit-logs', getAuditLogs);
router.post('/upload-gpa', uploadGPA.single('gpa'), uploadGPAData);

module.exports = router;