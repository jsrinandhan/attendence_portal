const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getLowAttendanceStudents,
  getAttendanceAnalytics,
  exportAttendanceData,
} = require('../controllers/attendanceController');
const authenticate = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protected routes - Admin and Teacher
router.use(authenticate);
router.use(authorize('admin', 'teacher'));

// Attendance reports and analytics
router.get('/report', getAttendanceReport);
router.get('/low-attendance', getLowAttendanceStudents);
router.get('/analytics', getAttendanceAnalytics);
router.get('/export', exportAttendanceData);

module.exports = router;
