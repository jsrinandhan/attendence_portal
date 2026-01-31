import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  User, 
  Calendar,
  FileText,
  Settings,
  Home
} from 'lucide-react';

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();

  const getSidebarItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
          { path: '/admin/classes', label: 'Classes', icon: Users },
          { path: '/admin/subjects', label: 'Subjects', icon: BookOpen },
          { path: '/admin/teachers', label: 'Teachers', icon: User },
          { path: '/admin/students', label: 'Students', icon: Users },
          { path: '/admin/reports', label: 'Reports', icon: FileText },
          { path: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard', icon: Home },
          { path: '/teacher/mark-attendance', label: 'Mark Attendance', icon: Calendar },
          { path: '/teacher/reports', label: 'Reports', icon: FileText },
          { path: '/teacher/profile', label: 'Profile', icon: User },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: Home },
          { path: '/student/attendance', label: 'My Attendance', icon: Calendar },
          { path: '/student/reports', label: 'Reports', icon: FileText },
          { path: '/student/profile', label: 'Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <BookOpen className="brand-icon" />
            <span>Menu</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon className="sidebar-nav-icon" />
                    <span className="sidebar-nav-text">{item.label}</span>
                    {isActive && <div className="sidebar-nav-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-avatar">
              <User className="avatar-icon" />
            </div>
            <div className="user-details">
              <div className="user-name">
                {user?.fullName || user?.firstName || 'User'}
              </div>
              <div className="user-role">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
