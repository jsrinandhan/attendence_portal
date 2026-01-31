const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { generateToken } = require('../config/auth');

// Student Login
const studentLogin = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    // Find student by rollNumber
    const student = await Student.findOne({ rollNumber, isActive: true })
      .populate('class', 'name grade section academicYear');

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: student._id,
      role: 'student',
      rollNumber: student.rollNumber,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        fullName: student.fullName,
        class: student.class,
        role: student.role,
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('class', 'name grade section academicYear');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student profile retrieved successfully',
      student,
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Overall Attendance
const getOverallAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all attendance records for the student
    const attendanceRecords = await Attendance.find({
      student: studentId,
      date: { $gte: start, $lte: end },
    })
      .populate('subject', 'name code')
      .sort({ date: 1 });

    // Calculate statistics
    const totalPeriods = attendanceRecords.length;
    const presentPeriods = attendanceRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    const absentPeriods = attendanceRecords.filter(record => 
      record.status === 'absent'
    ).length;
    const latePeriods = attendanceRecords.filter(record => 
      record.status === 'late'
    ).length;
    const excusedPeriods = attendanceRecords.filter(record => 
      record.status === 'excused'
    ).length;

    const attendancePercentage = totalPeriods > 0 ? (presentPeriods / totalPeriods) * 100 : 0;

    res.status(200).json({
      message: 'Overall attendance retrieved successfully',
      attendance: {
        totalPeriods,
        presentPeriods,
        absentPeriods,
        latePeriods,
        excusedPeriods,
        attendancePercentage: attendancePercentage.toFixed(2),
        records: attendanceRecords,
      },
    });
  } catch (error) {
    console.error('Get overall attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Subject-wise Attendance
const getSubjectWiseAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get attendance grouped by subject
    const subjectAttendance = await Attendance.aggregate([
      {
        $match: {
          student: studentId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      {
        $unwind: '$subjectInfo',
      },
      {
        $group: {
          _id: '$subject',
          subjectName: { $first: '$subjectInfo.name' },
          subjectCode: { $first: '$subjectInfo.code' },
          totalPeriods: { $sum: 1 },
          presentPeriods: {
            $sum: {
              $cond: [
                { $in: ['$status', ['present', 'late']] },
                1,
                0,
              ],
            },
          },
          absentPeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
            },
          },
          latePeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
            },
          },
          excusedPeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'excused'] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [
              {
                $divide: ['$presentPeriods', '$totalPeriods'],
              },
              100,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          subjectName: 1,
          subjectCode: 1,
          totalPeriods: 1,
          presentPeriods: 1,
          absentPeriods: 1,
          latePeriods: 1,
          excusedPeriods: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
        },
      },
      {
        $sort: { subjectName: 1 },
      },
    ]);

    res.status(200).json({
      message: 'Subject-wise attendance retrieved successfully',
      subjectAttendance,
    });
  } catch (error) {
    console.error('Get subject-wise attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Period-wise Attendance
const getPeriodWiseAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get attendance grouped by period
    const periodAttendance = await Attendance.aggregate([
      {
        $match: {
          student: studentId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      {
        $unwind: '$subjectInfo',
      },
      {
        $group: {
          _id: '$periodNumber',
          totalPeriods: { $sum: 1 },
          presentPeriods: {
            $sum: {
              $cond: [
                { $in: ['$status', ['present', 'late']] },
                1,
                0,
              ],
            },
          },
          absentPeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
            },
          },
          latePeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
            },
          },
          excusedPeriods: {
            $sum: {
              $cond: [{ $eq: ['$status', 'excused'] }, 1, 0],
            },
          },
          subjects: { $addToSet: '$subjectInfo.name' },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [
              {
                $divide: ['$presentPeriods', '$totalPeriods'],
              },
              100,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          periodNumber: '$_id',
          totalPeriods: 1,
          presentPeriods: 1,
          absentPeriods: 1,
          latePeriods: 1,
          excusedPeriods: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
          subjects: 1,
        },
      },
      {
        $sort: { periodNumber: 1 },
      },
    ]);

    res.status(200).json({
      message: 'Period-wise attendance retrieved successfully',
      periodAttendance,
    });
  } catch (error) {
    console.error('Get period-wise attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Date Range Attendance
const getDateRangeAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      student: studentId,
      date: { $gte: start, $lte: end },
    })
      .populate('subject', 'name code')
      .populate('class', 'name grade section')
      .sort({ date: 1, periodNumber: 1 });

    // Group by date
    const groupedByDate = {};
    attendanceRecords.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = {
          date: dateStr,
          records: [],
          totalPeriods: 0,
          presentPeriods: 0,
          absentPeriods: 0,
        };
      }
      groupedByDate[dateStr].records.push(record);
      groupedByDate[dateStr].totalPeriods++;
      if (record.status === 'present' || record.status === 'late') {
        groupedByDate[dateStr].presentPeriods++;
      }
      if (record.status === 'absent') {
        groupedByDate[dateStr].absentPeriods++;
      }
    });

    // Calculate daily percentages
    Object.keys(groupedByDate).forEach(date => {
      const dayData = groupedByDate[date];
      dayData.attendancePercentage = dayData.totalPeriods > 0 
        ? ((dayData.presentPeriods / dayData.totalPeriods) * 100).toFixed(2)
        : 0;
    });

    const dailyAttendance = Object.values(groupedByDate);

    res.status(200).json({
      message: 'Date range attendance retrieved successfully',
      dailyAttendance,
      summary: {
        totalDays: dailyAttendance.length,
        totalPeriods: attendanceRecords.length,
        presentPeriods: attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length,
        absentPeriods: attendanceRecords.filter(r => r.status === 'absent').length,
      },
    });
  } catch (error) {
    console.error('Get date range attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Attendance Summary
const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get current academic year attendance
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const [
      overallStats,
      subjectStats,
      monthlyStats,
    ] = await Promise.all([
      // Overall statistics
      Attendance.aggregate([
        {
          $match: {
            student: studentId,
            date: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: null,
            totalPeriods: { $sum: 1 },
            presentPeriods: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['present', 'late']] },
                  1,
                  0,
                ],
              },
            },
            absentPeriods: {
              $sum: {
                $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
              },
            },
          },
        },
      ]),
      // Subject-wise statistics
      Attendance.aggregate([
        {
          $match: {
            student: studentId,
            date: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subject',
            foreignField: '_id',
            as: 'subjectInfo',
          },
        },
        {
          $unwind: '$subjectInfo',
        },
        {
          $group: {
            _id: '$subject',
            subjectName: { $first: '$subjectInfo.name' },
            totalPeriods: { $sum: 1 },
            presentPeriods: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['present', 'late']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $addFields: {
            attendancePercentage: {
              $multiply: [
                {
                  $divide: ['$presentPeriods', '$totalPeriods'],
                },
                100,
              ],
            },
          },
        },
        {
          $project: {
            subjectName: 1,
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
          },
        },
        {
          $sort: { subjectName: 1 },
        },
      ]),
      // Monthly statistics
      Attendance.aggregate([
        {
          $match: {
            student: studentId,
            date: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            totalPeriods: { $sum: 1 },
            presentPeriods: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['present', 'late']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $addFields: {
            attendancePercentage: {
              $multiply: [
                {
                  $divide: ['$presentPeriods', '$totalPeriods'],
                },
                100,
              ],
            },
          },
        },
        {
          $project: {
            month: '$_id.month',
            year: '$_id.year',
            totalPeriods: 1,
            presentPeriods: 1,
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
          },
        },
        {
          $sort: { year: 1, month: 1 },
        },
      ]),
    ]);

    const overall = overallStats[0] || { totalPeriods: 0, presentPeriods: 0, absentPeriods: 0 };
    const overallPercentage = overall.totalPeriods > 0 
      ? ((overall.presentPeriods / overall.totalPeriods) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      message: 'Attendance summary retrieved successfully',
      summary: {
        overall: {
          totalPeriods: overall.totalPeriods,
          presentPeriods: overall.presentPeriods,
          absentPeriods: overall.absentPeriods,
          attendancePercentage: overallPercentage,
        },
        subjectWise: subjectStats,
        monthlyTrend: monthlyStats,
      },
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  studentLogin,
  getStudentProfile,
  getOverallAttendance,
  getSubjectWiseAttendance,
  getPeriodWiseAttendance,
  getDateRangeAttendance,
  getAttendanceSummary,
};
