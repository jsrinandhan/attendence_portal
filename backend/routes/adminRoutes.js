const express = require('express');
const router = express.Router();
const {
  adminLogin,
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
  createSubject,
  getAllSubjects,
  createTeacher,
  getAllTeachers,
  createStudent,
  getAllStudents,
  assignSubjectToTeacher,
  assignTeacherToClass,
  getDashboardStats,
} = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', adminLogin);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Class management
router.post('/classes', createClass);
router.get('/classes', getAllClasses);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

// Subject management
router.post('/subjects', createSubject);
router.get('/subjects', getAllSubjects);

// Teacher management
router.post('/teachers', createTeacher);
router.get('/teachers', getAllTeachers);

// Student management
router.post('/students', createStudent);
router.get('/students', getAllStudents);

// Assignment management
router.post('/assign-subject', assignSubjectToTeacher);
router.post('/assign-teacher', assignTeacherToClass);

module.exports = router;
