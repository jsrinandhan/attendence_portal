// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. User not authenticated.' });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is accessing their own resource
    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    if (req.user.id === resourceId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You can only access your own resources.',
    });
  };
};

// Check if teacher is assigned to the class/subject
const authorizeTeacherAssignment = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher role required.' });
    }

    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    const { classId, subjectId } = req.body || req.query;

    // Check if teacher is assigned to the class
    if (classId && !teacher.assignedClasses.includes(classId)) {
      return res.status(403).json({ message: 'Access denied. Not assigned to this class.' });
    }

    // Check if teacher is assigned to the subject
    if (subjectId && !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Access denied. Not assigned to this subject.' });
    }

    next();
  } catch (error) {
    console.error('Teacher authorization error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  authorize,
  authorizeOwnerOrAdmin,
  authorizeTeacherAssignment,
};
