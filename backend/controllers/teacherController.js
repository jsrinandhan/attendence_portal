const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { generateToken } = require('../config/auth');

// Teacher Login
const teacherLogin = async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    // Find teacher by teacherId
    const teacher = await Teacher.findOne({ teacherId, isActive: true });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: teacher._id,
      role: 'teacher',
      teacherId: teacher.teacherId,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      teacher: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        fullName: teacher.fullName,
        role: teacher.role,
      },
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Teacher Profile
const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id)
      .populate('assignedClasses', 'name grade section academicYear')
      .populate('assignedSubjects', 'name code type credits');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({
      message: 'Teacher profile retrieved successfully',
      teacher,
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Assigned Classes and Subjects
const getAssignedClassesAndSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id)
      .populate({
        path: 'assignedClasses',
        populate: {
          path: 'subjects',
          model: 'Subject',
        },
      })
      .populate('assignedSubjects');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Filter subjects that the teacher is assigned to teach
    const assignedData = teacher.assignedClasses.map(classItem => ({
      class: classItem,
      subjects: classItem.subjects.filter(subject =>
        teacher.assignedSubjects.some(assignedSubject =>
          assignedSubject._id.toString() === subject._id.toString()
        )
      ),
    }));

    res.status(200).json({
      message: 'Assigned classes and subjects retrieved successfully',
      assignedData,
      allSubjects: teacher.assignedSubjects,
    });
  } catch (error) {
    console.error('Get assigned classes and subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Students for Attendance
const getStudentsForAttendance = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    // Verify teacher is assigned to this class and subject
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher.assignedClasses.includes(classId) || !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this class/subject' });
    }

    // Get students in the class
    const students = await Student.find({ 
      class: classId, 
      isActive: true 
    })
      .select('rollNumber firstName lastName email')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      message: 'Students retrieved successfully',
      students,
    });
  } catch (error) {
    console.error('Get students for attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark Attendance
const markAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, periodNumber, attendanceData } = req.body;

    // Verify teacher is assigned to this class and subject
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher.assignedClasses.includes(classId) || !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this class/subject' });
    }

    const attendanceDate = new Date(date);
    const attendancePromises = [];

    for (const studentData of attendanceData) {
      const { studentId, status, remarks } = studentData;

      // Check if attendance already exists for this student, class, subject, date, and period
      const existingAttendance = await Attendance.findOne({
        student: studentId,
        class: classId,
        subject: subjectId,
        date: attendanceDate,
        periodNumber,
      });

      if (existingAttendance) {
        // Update existing attendance
        attendancePromises.push(
          Attendance.findByIdAndUpdate(
            existingAttendance._id,
            {
              status,
              remarks,
              isEdited: true,
              editedBy: req.user.id,
              editedAt: new Date(),
              editReason: 'Updated by teacher',
            },
            { new: true }
          )
        );
      } else {
        // Create new attendance record
        attendancePromises.push(
          new Attendance({
            student: studentId,
            class: classId,
            subject: subjectId,
            teacher: req.user.id,
            date: attendanceDate,
            periodNumber,
            status,
            remarks,
            markedBy: req.user.id,
          }).save()
        );
      }
    }

    const savedAttendance = await Promise.all(attendancePromises);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: savedAttendance,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Attendance Records
const getAttendanceRecords = async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;

    // Verify teacher is assigned to this class and subject
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher.assignedClasses.includes(classId) || !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this class/subject' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      class: classId,
      subject: subjectId,
      date: { $gte: start, $lte: end },
    })
      .populate('student', 'rollNumber firstName lastName')
      .populate('class', 'name grade section')
      .populate('subject', 'name code')
      .sort({ date: 1, periodNumber: 1 });

    res.status(200).json({
      message: 'Attendance records retrieved successfully',
      attendance,
    });
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Today's Attendance
const getTodayAttendance = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Verify teacher is assigned to this class and subject
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher.assignedClasses.includes(classId) || !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this class/subject' });
    }

    const attendance = await Attendance.find({
      class: classId,
      subject: subjectId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('student', 'rollNumber firstName lastName')
      .sort({ periodNumber: 1, 'student.rollNumber': 1 });

    res.status(200).json({
      message: "Today's attendance retrieved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Get today's attendance error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Attendance Statistics
const getAttendanceStatistics = async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;

    // Verify teacher is assigned to this class and subject
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher.assignedClasses.includes(classId) || !teacher.assignedSubjects.includes(subjectId)) {
      return res.status(403).json({ message: 'Not authorized to view statistics for this class/subject' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get total students in class
    const totalStudents = await Student.countDocuments({ 
      class: classId, 
      isActive: true 
    });

    // Get attendance statistics
    const [
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
    ] = await Promise.all([
      Attendance.countDocuments({
        class: classId,
        subject: subjectId,
        date: { $gte: start, $lte: end },
        status: 'present',
      }),
      Attendance.countDocuments({
        class: classId,
        subject: subjectId,
        date: { $gte: start, $lte: end },
        status: 'absent',
      }),
      Attendance.countDocuments({
        class: classId,
        subject: subjectId,
        date: { $gte: start, $lte: end },
        status: 'late',
      }),
      Attendance.countDocuments({
        class: classId,
        subject: subjectId,
        date: { $gte: start, $lte: end },
        status: 'excused',
      }),
    ]);

    const totalRecords = totalPresent + totalAbsent + totalLate + totalExcused;
    const attendancePercentage = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    res.status(200).json({
      message: 'Attendance statistics retrieved successfully',
      statistics: {
        totalStudents,
        totalRecords,
        totalPresent,
        totalAbsent,
        totalLate,
        totalExcused,
        attendancePercentage: attendancePercentage.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get attendance statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  teacherLogin,
  getTeacherProfile,
  getAssignedClassesAndSubjects,
  getStudentsForAttendance,
  markAttendance,
  getAttendanceRecords,
  getTodayAttendance,
  getAttendanceStatistics,
};
