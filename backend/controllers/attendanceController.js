const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');

// Get Attendance Report (Admin)
const getAttendanceReport = async (req, res) => {
  try {
    const { type, classId, subjectId, startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let matchQuery = {
      date: { $gte: start, $lte: end },
    };

    if (classId) {
      matchQuery.class = classId;
    }

    if (subjectId) {
      matchQuery.subject = subjectId;
    }

    let attendanceData;

    if (type === 'class-wise') {
      // Class-wise attendance report
      attendanceData = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'classes',
            localField: 'class',
            foreignField: '_id',
            as: 'classInfo',
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo',
          },
        },
        {
          $unwind: '$classInfo',
        },
        {
          $unwind: '$studentInfo',
        },
        {
          $group: {
            _id: {
              class: '$class',
              className: '$classInfo.name',
              student: '$student',
              studentName: {
                $concat: [
                  '$studentInfo.firstName',
                  ' ',
                  '$studentInfo.lastName',
                ],
              },
              rollNumber: '$studentInfo.rollNumber',
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
          $group: {
            _id: '$_id.class',
            className: { $first: '$_id.className' },
            students: {
              $push: {
                studentId: '$_id.student',
                studentName: '$_id.studentName',
                rollNumber: '$_id.rollNumber',
                totalPeriods: '$totalPeriods',
                presentPeriods: '$presentPeriods',
                absentPeriods: '$absentPeriods',
                latePeriods: '$latePeriods',
                attendancePercentage: { $round: ['$attendancePercentage', 2] },
              },
            },
            totalStudents: { $sum: 1 },
            classAverage: {
              $avg: '$attendancePercentage',
            },
          },
        },
        {
          $addFields: {
            classAverage: { $round: ['$classAverage', 2] },
          },
        },
        {
          $sort: { className: 1 },
        },
      ]);
    } else if (type === 'subject-wise') {
      // Subject-wise attendance report
      attendanceData = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subject',
            foreignField: '_id',
            as: 'subjectInfo',
          },
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'class',
            foreignField: '_id',
            as: 'classInfo',
          },
        },
        {
          $unwind: '$subjectInfo',
        },
        {
          $unwind: '$classInfo',
        },
        {
          $group: {
            _id: {
              subject: '$subject',
              subjectName: '$subjectInfo.name',
              subjectCode: '$subjectInfo.code',
              class: '$class',
              className: '$classInfo.name',
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
            absentPeriods: {
              $sum: {
                $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
              },
            },
            uniqueStudents: { $addToSet: '$student' },
          },
        },
        {
          $addFields: {
            uniqueStudentCount: { $size: '$uniqueStudents' },
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
            uniqueStudents: 0,
          },
        },
        {
          $addFields: {
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
          },
        },
        {
          $sort: { '_id.subjectName': 1, '_id.className': 1 },
        },
      ]);
    } else {
      // Overall attendance report
      attendanceData = await Attendance.aggregate([
        { $match: matchQuery },
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
            uniqueStudents: { $addToSet: '$student' },
          },
        },
        {
          $addFields: {
            uniqueStudentCount: { $size: '$uniqueStudents' },
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
            uniqueStudents: 0,
          },
        },
        {
          $addFields: {
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
          },
        },
      ]);
    }

    res.status(200).json({
      message: 'Attendance report retrieved successfully',
      report: attendanceData,
      reportType: type,
      dateRange: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Low Attendance Students
const getLowAttendanceStudents = async (req, res) => {
  try {
    const { threshold = 75, startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const lowAttendanceStudents = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $unwind: '$studentInfo',
      },
      {
        $unwind: '$classInfo',
      },
      {
        $group: {
          _id: '$student',
          studentName: {
            $concat: [
              '$studentInfo.firstName',
              ' ',
              '$studentInfo.lastName',
            ],
          },
          rollNumber: '$studentInfo.rollNumber',
          className: '$classInfo.name',
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
        $match: {
          attendancePercentage: { $lt: parseFloat(threshold) },
        },
      },
      {
        $project: {
          studentId: '$_id',
          studentName: 1,
          rollNumber: 1,
          className: 1,
          totalPeriods: 1,
          presentPeriods: 1,
          absentPeriods: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
        },
      },
      {
        $sort: { attendancePercentage: 1 },
      },
    ]);

    res.status(200).json({
      message: 'Low attendance students retrieved successfully',
      students: lowAttendanceStudents,
      threshold,
    });
  } catch (error) {
    console.error('Get low attendance students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Attendance Analytics
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        };
        break;
      case 'week':
        groupFormat = {
          year: { $year: '$date' },
          week: { $week: '$date' },
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
        };
        break;
      default:
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        };
    }

    const analytics = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: groupFormat,
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
          uniqueStudents: { $addToSet: '$student' },
        },
      },
      {
        $addFields: {
          uniqueStudentCount: { $size: '$uniqueStudents' },
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
          uniqueStudents: 0,
        },
      },
      {
        $addFields: {
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    res.status(200).json({
      message: 'Attendance analytics retrieved successfully',
      analytics,
      groupBy,
    });
  } catch (error) {
    console.error('Get attendance analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Export Attendance Data
const exportAttendanceData = async (req, res) => {
  try {
    const { type, classId, subjectId, startDate, endDate, format = 'json' } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let matchQuery = {
      date: { $gte: start, $lte: end },
    };

    if (classId) {
      matchQuery.class = classId;
    }

    if (subjectId) {
      matchQuery.subject = subjectId;
    }

    const attendanceData = await Attendance.find(matchQuery)
      .populate('student', 'rollNumber firstName lastName email')
      .populate('class', 'name grade section')
      .populate('subject', 'name code')
      .populate('teacher', 'firstName lastName')
      .sort({ date: 1, periodNumber: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Period,Roll Number,Student Name,Class,Subject,Teacher,Status,Remarks\n';
      const csvData = attendanceData.map(record => {
        const date = new Date(record.date).toLocaleDateString();
        const studentName = `${record.student.firstName} ${record.student.lastName}`;
        const teacherName = `${record.teacher.firstName} ${record.teacher.lastName}`;
        const className = `${record.class.name} (${record.class.grade}-${record.class.section})`;
        
        return `${date},${record.periodNumber},${record.student.rollNumber},"${studentName}","${className}","${record.subject.name}","${teacherName}",${record.status},"${record.remarks || ''}"`;
      }).join('\n');

      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_${startDate}_to_${endDate}.csv`);
      res.status(200).send(csv);
    } else {
      // Return JSON format
      res.status(200).json({
        message: 'Attendance data exported successfully',
        data: attendanceData,
        exportType: type,
        dateRange: {
          startDate,
          endDate,
        },
        totalRecords: attendanceData.length,
      });
    }
  } catch (error) {
    console.error('Export attendance data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAttendanceReport,
  getLowAttendanceStudents,
  getAttendanceAnalytics,
  exportAttendanceData,
};
