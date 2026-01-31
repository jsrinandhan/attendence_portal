const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { generateTeacherId, generateRollNumber, generateClassId, generateSubjectId } = require('../utils/generateId');
const { generateToken } = require('../config/auth');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: admin._id,
      role: 'admin',
      username: admin.username,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Class
const createClass = async (req, res) => {
  try {
    const { name, grade, section, academicYear, maxStudents, classTeacher } = req.body;

    // Generate unique class ID
    const classId = generateClassId();

    const newClass = new Class({
      classId,
      name,
      grade,
      section,
      academicYear,
      maxStudents,
      classTeacher,
    });

    await newClass.save();
    await newClass.populate('classTeacher', 'firstName lastName email');

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error) {
    console.error('Create class error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Class ID already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('classTeacher', 'firstName lastName email')
      .populate('subjects', 'name code')
      .sort({ grade: 1, section: 1 });

    res.status(200).json({
      message: 'Classes retrieved successfully',
      classes,
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classTeacher', 'firstName lastName email');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Subject
const createSubject = async (req, res) => {
  try {
    const { name, code, description, type, credits, grades, totalPeriodsPerWeek } = req.body;

    // Generate unique subject ID
    const subjectId = generateSubjectId();

    const newSubject = new Subject({
      subjectId,
      name,
      code,
      description,
      type,
      credits,
      grades,
      totalPeriodsPerWeek,
    });

    await newSubject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject: newSubject,
    });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('assignedTeachers', 'firstName lastName email')
      .populate('assignedClasses', 'name grade section')
      .sort({ name: 1 });

    res.status(200).json({
      message: 'Subjects retrieved successfully',
      subjects,
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Teacher
const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, qualification, experience } = req.body;

    // Generate unique teacher ID
    const teacherId = generateTeacherId();

    const newTeacher = new Teacher({
      teacherId,
      firstName,
      lastName,
      email,
      password,
      phone,
      qualification,
      experience,
    });

    await newTeacher.save();

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: newTeacher,
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('assignedClasses', 'name grade section')
      .populate('assignedSubjects', 'name code')
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      message: 'Teachers retrieved successfully',
      teachers,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Student
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      class: classId,
      admissionYear,
      parentName,
      parentPhone,
    } = req.body;

    // Get class details for roll number generation
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Generate unique roll number
    const rollNumber = generateRollNumber(classData.name, admissionYear);

    const newStudent = new Student({
      rollNumber,
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      class: classId,
      admissionYear,
      parentName,
      parentPhone,
    });

    await newStudent.save();
    await newStudent.populate('class', 'name grade section');

    // Update class student count
    await Class.findByIdAndUpdate(classId, {
      $inc: { currentStudents: 1 },
    });

    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent,
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or roll number already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('class', 'name grade section')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      message: 'Students retrieved successfully',
      students,
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign Subject to Teacher
const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;

    // Update teacher
    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $addToSet: { assignedSubjects: subjectId } },
      { new: true }
    ).populate('assignedSubjects', 'name code');

    // Update subject
    await Subject.findByIdAndUpdate(
      subjectId,
      { $addToSet: { assignedTeachers: teacherId } }
    );

    res.status(200).json({
      message: 'Subject assigned to teacher successfully',
      teacher,
    });
  } catch (error) {
    console.error('Assign subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign Teacher to Class
const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    // Update teacher
    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $addToSet: { assignedClasses: classId } },
      { new: true }
    ).populate('assignedClasses', 'name grade section');

    // Update class
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { subjects: { $each: teacher.assignedSubjects } } }
    );

    res.status(200).json({
      message: 'Teacher assigned to class successfully',
      teacher,
    });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalClasses,
      totalSubjects,
      totalTeachers,
      totalStudents,
      activeClasses,
    ] = await Promise.all([
      Class.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true, academicYear: new Date().getFullYear().toString() }),
    ]);

    res.status(200).json({
      message: 'Dashboard stats retrieved successfully',
      stats: {
        totalClasses,
        totalSubjects,
        totalTeachers,
        totalStudents,
        activeClasses,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
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
};
