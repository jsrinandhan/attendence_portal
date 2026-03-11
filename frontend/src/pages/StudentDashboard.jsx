import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BookOpen, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { studentAPI } from '../services/api';
import '../styles/dashboard.css';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState({
    overall: { totalPeriods: 0, presentPeriods: 0, absentPeriods: 0, attendancePercentage: 0 },
    subjectWise: [],
    monthlyTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, summaryData] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getAttendanceSummary(),
      ]);

      setProfile(profileData.student);
      setAttendanceSummary(summaryData.summary);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'green' };
    if (percentage >= 75) return { status: 'Good', color: 'blue' };
    if (percentage >= 60) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  };

  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || 'Unknown';
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

  const overallStatus = getAttendanceStatus(attendanceSummary.overall.attendancePercentage);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back, {profile?.firstName}!</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Student Info Card */}
      <div className="student-info-card">
        <div className="student-avatar">
          <User className="avatar-icon" />
        </div>
        <div className="student-details">
          <h2>{profile?.firstName} {profile?.lastName}</h2>
          <p>Roll Number: {profile?.rollNumber}</p>
          <p>Class: {profile?.class?.name} (Grade {profile?.class?.grade})</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-header">
            <div className="stat-icon">
              <Calendar />
            </div>
            <div className="stat-value">{attendanceSummary.overall.totalPeriods}</div>
          </div>
          <div className="stat-card-content">
            <h3>Total Periods</h3>
            <p>This academic year</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-value">{attendanceSummary.overall.presentPeriods}</div>
          </div>
          <div className="stat-card-content">
            <h3>Present</h3>
            <p>Periods attended</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-card-header">
            <div className="stat-icon">
              <XCircle />
            </div>
            <div className="stat-value">{attendanceSummary.overall.absentPeriods}</div>
          </div>
          <div className="stat-card-content">
            <h3>Absent</h3>
            <p>Periods missed</p>
          </div>
        </div>

        <div className={`stat-card stat-card-${overallStatus.color}`}>
          <div className="stat-card-header">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-value">{attendanceSummary.overall.attendancePercentage}%</div>
          </div>
          <div className="stat-card-content">
            <h3>Attendance Rate</h3>
            <p>Status: {overallStatus.status}</p>
          </div>
        </div>
      </div>

      {/* Attendance Warning */}
      {attendanceSummary.overall.attendancePercentage < 75 && (
        <div className="attendance-warning">
          <AlertTriangle className="warning-icon" />
          <div className="warning-content">
            <h3>Low Attendance Warning</h3>
            <p>Your attendance is below 75%. Please improve your attendance to maintain good academic standing.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button 
            className="action-card" 
            onClick={() => window.location.href = '/student/attendance'}
          >
            <Calendar className="action-icon" />
            <div className="action-content">
              <h3>View Attendance</h3>
              <p>Detailed attendance records</p>
            </div>
          </button>
          
          <button 
            className="action-card" 
            onClick={() => window.location.href = '/student/reports'}
          >
            <TrendingUp className="action-icon" />
            <div className="action-content">
              <h3>View Reports</h3>
              <p>Attendance analytics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      <div className="subject-attendance">
        <h2>Subject-wise Attendance</h2>
        <div className="subject-grid">
          {attendanceSummary.subjectWise.map((subject, index) => {
            const subjectStatus = getAttendanceStatus(subject.attendancePercentage);
            return (
              <div key={index} className="subject-card">
                <div className="subject-header">
                  <BookOpen className="subject-icon" />
                  <h3>{subject.subjectName}</h3>
                </div>
                <div className="subject-stats">
                  <div className="stat-row">
                    <span>Attendance:</span>
                    <span className={`percentage percentage-${subjectStatus.color}`}>
                      {subject.attendancePercentage}%
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Status:</span>
                    <span className={`status status-${subjectStatus.color}`}>
                      {subjectStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      {attendanceSummary.monthlyTrend.length > 0 && (
        <div className="monthly-trend">
          <h2>Monthly Attendance Trend</h2>
          <div className="trend-chart">
            <div className="trend-bars">
              {attendanceSummary.monthlyTrend.slice(-6).map((month, index) => (
                <div key={index} className="trend-bar-container">
                  <div 
                    className={`trend-bar ${
                      month.attendancePercentage >= 90 ? 'excellent' :
                      month.attendancePercentage >= 75 ? 'good' :
                      month.attendancePercentage >= 60 ? 'average' : 'poor'
                    }`}
                    style={{ height: `${Math.min(month.attendancePercentage, 100)}%` }}
                  >
                    <span className="trend-value">{month.attendancePercentage}%</span>
                  </div>
                  <span className="trend-label">
                    {getMonthName(month.month)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
