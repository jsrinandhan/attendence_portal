const express = require('express');
const router = express.Router();
const {
  studentLogin,
  getStudentProfile,
  getOverallAttendance,
  getSubjectWiseAttendance,
  getPeriodWiseAttendance,
  getDateRangeAttendance,
  getAttendanceSummary,
} = require('../controllers/studentController');
const authenticate = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', studentLogin);

// Protected routes - Student only
router.use(authenticate);
router.use(authorize('student'));

// Profile
router.get('/profile', getStudentProfile);

// Attendance views
router.get('/attendance/overall', getOverallAttendance);
router.get('/attendance/subject-wise', getSubjectWiseAttendance);
router.get('/attendance/period-wise', getPeriodWiseAttendance);
router.get('/attendance/date-range', getDateRangeAttendance);
router.get('/attendance/summary', getAttendanceSummary);

module.exports = router;
