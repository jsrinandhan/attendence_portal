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

// Change Admin Password
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.user.id; // From auth middleware

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Class
const createClass = async (req, res) => {
  try {
    const { grade, section } = req.body;

    // Generate unique class ID and name
    const classId = generateClassId();
    const name = `${grade} Year - Section ${section}`;

    const newClass = new Class({
      classId,
      name,
      grade,
      section,
    });

    await newClass.save();

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
    const classes = await Class.find()
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
    const { grade, section } = req.body;

    // Check if another class with same grade and section exists
    const existingClass = await Class.findOne({ 
      grade, 
      section, 
      _id: { $ne: id } 
    });

    if (existingClass) {
      return res.status(400).json({ 
        message: 'A class with this grade and section already exists' 
      });
    }

    // Generate new name if grade or section changed
    const updateData = { grade, section };
    if (grade || section) {
      updateData.name = `${grade} Year - Section ${section}`;
    }

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error) {
    console.error('Update class error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A class with this grade and section already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndDelete(id);

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
    const { name, code } = req.body;

    // Generate unique subject ID
    const subjectId = generateSubjectId();

    const newSubject = new Subject({
      subjectId,
      name,
      code,
    });

    await newSubject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject: newSubject,
    });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject name or code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    // Check if another subject with same name or code exists
    const existingSubject = await Subject.findOne({
      $or: [
        { name, _id: { $ne: id } },
        { code, _id: { $ne: id } }
      ]
    });

    if (existingSubject) {
      return res.status(400).json({ 
        message: 'A subject with this name or code already exists' 
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json({
      message: 'Subject updated successfully',
      subject: updatedSubject,
    });
  } catch (error) {
    console.error('Update subject error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A subject with this name or code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
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
    const { firstName, lastName, phone } = req.body;

    // Generate unique teacher ID based on name
    const teacherId = await generateTeacherId(firstName, lastName);
    const password = 'Teacher@123'; // Default password

    const newTeacher = new Teacher({
      teacherId,
      firstName,
      lastName,
      password,
      phone,
    });

    await newTeacher.save();

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: newTeacher,
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Teacher with this name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone } = req.body;

    // Find the current teacher
    const currentTeacher = await Teacher.findById(id);
    if (!currentTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if another teacher with same name exists
    const existingTeacher = await Teacher.findOne({
      firstName, 
      lastName, 
      _id: { $ne: id } 
    });

    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'A teacher with this name already exists' 
      });
    }

    const updateData = {};
    let shouldRegenerateId = false;

    // Check if name is being changed
    if (firstName && firstName !== currentTeacher.firstName) {
      updateData.firstName = firstName;
      shouldRegenerateId = true;
    }
    if (lastName && lastName !== currentTeacher.lastName) {
      updateData.lastName = lastName;
      shouldRegenerateId = true;
    }
    if (phone) updateData.phone = phone;

    // Regenerate teacher ID if name changed
    if (shouldRegenerateId) {
      const newTeacherId = await generateTeacherId(
        updateData.firstName || currentTeacher.firstName,
        updateData.lastName || currentTeacher.lastName
      );
      updateData.teacherId = newTeacherId;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: shouldRegenerateId 
        ? 'Teacher updated successfully with new ID'
        : 'Teacher updated successfully',
      teacher: updatedTeacher,
      idRegenerated: shouldRegenerateId,
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A teacher with this name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
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
      Class.countDocuments(),
      Subject.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Class.countDocuments({ grade: { $gte: 1, $lte: 4 } }), // Active classes are those with valid grades
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

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json({
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  changeAdminPassword,
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
  createTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  createStudent,
  getAllStudents,
  assignSubjectToTeacher,
  assignTeacherToClass,
  getDashboardStats,
};
