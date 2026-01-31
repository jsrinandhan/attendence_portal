const { verifyToken } = require('../config/auth');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user based on role
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await Admin.findById(decoded.id);
        break;
      case 'teacher':
        user = await Teacher.findById(decoded.id);
        break;
      case 'student':
        user = await Student.findById(decoded.id);
        break;
      default:
        return res.status(401).json({ message: 'Invalid token role.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = {
      id: user._id,
      role: decoded.role,
      ...decoded,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = authenticate;
