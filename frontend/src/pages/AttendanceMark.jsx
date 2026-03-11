import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
import { teacherAPI } from '../services/api';
import '../styles/attendance.css';

const AttendanceMark = () => {
  const [assignedData, setAssignedData] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignedData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents();
    }
  }, [selectedClass, selectedSubject]);

  const fetchAssignedData = async () => {
    try {
      const data = await teacherAPI.getAssignedClassesAndSubjects();
      setAssignedData(data.assignedData);
    } catch (error) {
      setError('Failed to load assigned classes and subjects');
      console.error('Assigned data error:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSubject) return;
    
    setIsLoading(true);
    try {
      const data = await teacherAPI.getStudentsForAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
      });
      
      setStudents(data.students);
      
      // Initialize attendance data
      const initialAttendance = data.students.map(student => ({
        studentId: student._id,
        status: 'present',
        remarks: '',
      }));
      setAttendanceData(initialAttendance);
    } catch (error) {
      setError('Failed to load students');
      console.error('Students error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleMarkAll = (status) => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, status, remarks: '' }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !selectedDate) {
      setError('Please select class, subject, and date');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await teacherAPI.markAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        periodNumber: selectedPeriod,
        attendanceData,
      });

      setSuccess('Attendance marked successfully!');
      
      // Clear form after successful submission
      setTimeout(() => {
        setSelectedClass('');
        setSelectedSubject('');
        setStudents([]);
        setAttendanceData([]);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to mark attendance');
      console.error('Mark attendance error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="status-icon present" />;
      case 'absent':
        return <XCircle className="status-icon absent" />;
      case 'late':
        return <Clock className="status-icon late" />;
      default:
        return null;
    }
  };

  const getSelectedClassData = () => {
    return assignedData.find(item => item.class._id === selectedClass);
  };

  const getAvailableSubjects = () => {
    const classData = getSelectedClassData();
    return classData ? classData.subjects : [];
  };

  return (
    <div className="attendance-mark-container">
      <div className="attendance-mark-header">
        <h1>Mark Attendance</h1>
        <p>Record attendance for your classes</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="attendance-form">
        {/* Selection Controls */}
        <div className="selection-controls">
          <div className="form-group">
            <label htmlFor="class">Select Class</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
              }}
              className="form-select"
              required
            >
              <option value="">Choose a class...</option>
              {assignedData.map((item) => (
                <option key={item.class._id} value={item.class._id}>
                  {item.class.name} - Grade {item.class.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Select Subject</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
              required
              disabled={!selectedClass}
            >
              <option value="">Choose a subject...</option>
              {getAvailableSubjects().map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="period">Period</label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="form-select"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                <option key={period} value={period}>
                  Period {period}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        {students.length > 0 && (
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="quick-action-btn present-btn"
              >
                <CheckCircle />
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="quick-action-btn absent-btn"
              >
                <XCircle />
                Mark All Absent
              </button>
            </div>
          </div>
        )}

        {/* Students List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-content">
              <div className="spinner" />
              <p>Loading students...</p>
            </div>
          </div>
        ) : students.length > 0 ? (
          <div className="students-list">
            <div className="list-header">
              <h3>Students ({students.length})</h3>
              <div className="header-actions">
                <span>Present: {attendanceData.filter(a => a.status === 'present').length}</span>
                <span>Absent: {attendanceData.filter(a => a.status === 'absent').length}</span>
                <span>Late: {attendanceData.filter(a => a.status === 'late').length}</span>
              </div>
            </div>
            
            <div className="attendance-grid">
              {students.map((student, index) => {
                const attendance = attendanceData.find(a => a.studentId === student._id);
                return (
                  <div key={student._id} className="attendance-item">
                    <div className="student-info">
                      <div className="student-avatar">
                        <Users />
                      </div>
                      <div className="student-details">
                        <h4>{student.firstName} {student.lastName}</h4>
                        <p>{student.rollNumber}</p>
                      </div>
                    </div>
                    
                    <div className="attendance-controls">
                      <div className="status-buttons">
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleAttendanceChange(student._id, 'status', status)}
                            className={`status-btn ${attendance?.status === status ? status : ''}`}
                          >
                            {getAttendanceIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Remarks (optional)"
                        value={attendance?.remarks || ''}
                        onChange={(e) => handleAttendanceChange(student._id, 'remarks', e.target.value)}
                        className="remarks-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedClass && selectedSubject ? (
          <div className="no-students">
            <Users className="no-data-icon" />
            <p>No students found for this class</p>
          </div>
        ) : null}

        {/* Submit Button */}
        {students.length > 0 && (
          <div className="submit-section">
            <button
              type="submit"
              disabled={isSaving}
              className="submit-btn"
            >
              {isSaving ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save />
                  Mark Attendance
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AttendanceMark;
