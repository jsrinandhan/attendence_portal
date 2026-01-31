import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, User, BookOpen, Users, BarChart3 } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/admin/classes', label: 'Classes', icon: Users },
          { path: '/admin/subjects', label: 'Subjects', icon: BookOpen },
          { path: '/admin/teachers', label: 'Teachers', icon: User },
          { path: '/admin/students', label: 'Students', icon: Users },
          { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/teacher/mark-attendance', label: 'Mark Attendance', icon: BookOpen },
          { path: '/teacher/reports', label: 'Reports', icon: BarChart3 },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/student/attendance', label: 'My Attendance', icon: BookOpen },
          { path: '/student/reports', label: 'Reports', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <BookOpen className="brand-icon" />
            <span>Attendance Portal</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <div className="user-info">
            <User className="user-icon" />
            <span className="user-name">
              {user?.fullName || user?.firstName || 'User'}
            </span>
            <span className="user-role">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <User className="user-icon" />
                <div>
                  <div className="user-name">
                    {user?.fullName || user?.firstName || 'User'}
                  </div>
                  <div className="user-role">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut className="logout-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
