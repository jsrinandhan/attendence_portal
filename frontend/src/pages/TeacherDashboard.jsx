import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { teacherAPI } from '../services/api';

const TeacherDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [assignedData, setAssignedData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    todayMarked: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, assignedDataResult] = await Promise.all([
        teacherAPI.getProfile(),
        teacherAPI.getAssignedClassesAndSubjects(),
      ]);

      setProfile(profileData.teacher);
      setAssignedData(assignedDataResult.assignedData);
      
      // Calculate stats
      const totalClasses = assignedDataResult.assignedData.length;
      const totalSubjects = assignedDataResult.allSubjects.length;
      
      setStats(prev => ({
        ...prev,
        totalClasses,
        totalSubjects,
      }));

      // Fetch today's attendance for first class/subject if available
      if (assignedDataResult.assignedData.length > 0) {
        const firstClass = assignedDataResult.assignedData[0];
        if (firstClass.subjects.length > 0) {
          try {
            const todayData = await teacherAPI.getTodayAttendance({
              classId: firstClass.class._id,
              subjectId: firstClass.subjects[0]._id,
            });
            setTodayAttendance(todayData.attendance);
            
            const markedCount = todayData.attendance.length;
            const presentCount = todayData.attendance.filter(a => 
              a.status === 'present' || a.status === 'late'
            ).length;
            const rate = markedCount > 0 ? (presentCount / markedCount * 100).toFixed(1) : 0;
            
            setStats(prev => ({
              ...prev,
              todayMarked: markedCount,
              attendanceRate: parseFloat(rate),
            }));
          } catch (attendanceError) {
            console.log('No attendance data for today');
          }
        }
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="status-icon present" />;
      case 'absent':
        return <XCircle className="status-icon absent" />;
      case 'late':
        return <CheckCircle className="status-icon late" />;
      default:
        return <XCircle className="status-icon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back, {profile?.firstName}!</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-header">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-value">{stats.totalClasses}</div>
          </div>
          <div className="stat-card-content">
            <h3>Assigned Classes</h3>
            <p>Classes you teach</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <div className="stat-icon">
              <BookOpen />
            </div>
            <div className="stat-value">{stats.totalSubjects}</div>
          </div>
          <div className="stat-card-content">
            <h3>Subjects</h3>
            <p>Subjects you handle</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <div className="stat-icon">
              <Calendar />
            </div>
            <div className="stat-value">{stats.todayMarked}</div>
          </div>
          <div className="stat-card-content">
            <h3>Today's Attendance</h3>
            <p>Records marked today</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <div className="stat-icon">
              <BarChart3 />
            </div>
            <div className="stat-value">{stats.attendanceRate}%</div>
          </div>
          <div className="stat-card-content">
            <h3>Attendance Rate</h3>
            <p>Today's average</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button 
            className="action-card" 
            onClick={() => window.location.href = '/teacher/mark-attendance'}
          >
            <Calendar className="action-icon" />
            <div className="action-content">
              <h3>Mark Attendance</h3>
              <p>Record today's attendance</p>
            </div>
          </button>
          
          <button 
            className="action-card" 
            onClick={() => window.location.href = '/teacher/reports'}
          >
            <BarChart3 className="action-icon" />
            <div className="action-content">
              <h3>View Reports</h3>
              <p>Attendance analytics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Assigned Classes and Subjects */}
      <div className="assigned-section">
        <h2>Your Classes and Subjects</h2>
        <div className="classes-grid">
          {assignedData.map((classData, index) => (
            <div key={index} className="class-card">
              <div className="class-header">
                <h3>{classData.class.name}</h3>
                <span className="class-grade">Grade {classData.class.grade}</span>
              </div>
              <div className="subjects-list">
                <h4>Subjects:</h4>
                {classData.subjects.map((subject, subjectIndex) => (
                  <div key={subjectIndex} className="subject-item">
                    <BookOpen className="subject-icon" />
                    <span>{subject.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Attendance Preview */}
      {todayAttendance.length > 0 && (
        <div className="today-attendance">
          <h2>Today's Attendance Preview</h2>
          <div className="attendance-preview">
            <div className="attendance-summary">
              <div className="summary-item">
                <CheckCircle className="summary-icon present" />
                <span>Present: {todayAttendance.filter(a => a.status === 'present').length}</span>
              </div>
              <div className="summary-item">
                <XCircle className="summary-icon absent" />
                <span>Absent: {todayAttendance.filter(a => a.status === 'absent').length}</span>
              </div>
            </div>
            
            <div className="recent-attendance-list">
              {todayAttendance.slice(0, 5).map((record, index) => (
                <div key={index} className="attendance-item">
                  <span className="student-name">
                    {record.student.firstName} {record.student.lastName}
                  </span>
                  <span className="roll-number">{record.student.rollNumber}</span>
                  {getAttendanceStatusIcon(record.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
