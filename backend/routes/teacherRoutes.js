const express = require('express');
const router = express.Router();
const {
  teacherLogin,
  getTeacherProfile,
  getAssignedClassesAndSubjects,
  getStudentsForAttendance,
  markAttendance,
  getAttendanceRecords,
  getTodayAttendance,
  getAttendanceStatistics,
} = require('../controllers/teacherController');
const authenticate = require('../middleware/authMiddleware');
const { authorize, authorizeTeacherAssignment } = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', teacherLogin);

// Protected routes - Teacher only
router.use(authenticate);
router.use(authorize('teacher'));

// Profile
router.get('/profile', getTeacherProfile);

// Assigned classes and subjects
router.get('/assigned', getAssignedClassesAndSubjects);

// Attendance management
router.get('/students', getStudentsForAttendance);
router.post('/attendance/mark', markAttendance);
router.get('/attendance', getAttendanceRecords);
router.get('/attendance/today', getTodayAttendance);
router.get('/attendance/statistics', getAttendanceStatistics);

module.exports = router;
