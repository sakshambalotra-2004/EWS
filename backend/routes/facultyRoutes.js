const express = require('express');
const router = express.Router();
const { uploadCSV, uploadMultiCSV, updateBehavioral, getStudentPerformances, upload, uploadMulti } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('faculty', 'admin'));

router.post('/upload-csv',       upload.single('file'),                      uploadCSV);
router.post('/upload-multi-csv',  uploadMulti.fields([{name:'marks'},{name:'attendance'},{name:'gpa'}]), uploadMultiCSV);
router.put('/behavioral/:performanceId', updateBehavioral);
router.get('/students', getStudentPerformances);

module.exports = router;