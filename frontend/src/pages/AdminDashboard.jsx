import React, { useState, useEffect } from 'react';
import { Users, BookOpen, UserCheck, GraduationCap, TrendingUp, Plus } from 'lucide-react';
import { adminAPI } from '../services/api';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: Users,
      color: 'blue',
      description: 'Active classes in the system',
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'green',
      description: 'Subjects being taught',
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      color: 'purple',
      description: 'Teachers in the system',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'orange',
      description: 'Students enrolled across all classes',
    },
  ];

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
        <h1>Admin Dashboard</h1>
        <p>Manage your college's attendance system</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-card-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div className="stat-card-content">
                <h3>{stat.title}</h3>
                <p>{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button className="action-card" onClick={() => window.location.href = '/admin/classes'}>
            <Plus className="action-icon" />
            <div className="action-content">
              <h3>Add New Class</h3>
              <p>Create a new class</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => window.location.href = '/admin/subjects'}>
            <Plus className="action-icon" />
            <div className="action-content">
              <h3>Add New Subject</h3>
              <p>Add a new subject to the curriculum</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => window.location.href = '/admin/teachers'}>
            <Plus className="action-icon" />
            <div className="action-content">
              <h3>Add New Teacher</h3>
              <p>Register a new teacher in the system</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>System Overview</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <h3>Academic Year {new Date().getFullYear()}</h3>
            <div className="activity-stats">
              <div className="activity-stat">
                <span className="stat-label">Active Classes:</span>
                <span className="stat-value">{stats.activeClasses}</span>
              </div>
              <div className="activity-stat">
                <span className="stat-label">Total Students:</span>
                <span className="stat-value">{stats.totalStudents}</span>
              </div>
              <div className="activity-stat">
                <span className="stat-label">Total Teachers:</span>
                <span className="stat-value">{stats.totalTeachers}</span>
              </div>
            </div>
          </div>
          
          <div className="activity-card">
            <h3>System Health</h3>
            <div className="health-indicators">
              <div className="health-indicator">
                <div className="indicator-dot indicator-green" />
                <span>All systems operational</span>
              </div>
              <div className="health-indicator">
                <div className="indicator-dot indicator-green" />
                <span>Database connected</span>
              </div>
              <div className="health-indicator">
                <div className="indicator-dot indicator-green" />
                <span>API services running</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
