import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AttendanceMark from './pages/AttendanceMark';
import './styles/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <Sidebar 
            user={user} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
          
          <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/teacher/mark-attendance"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <AttendanceMark />
                  </ProtectedRoute>
                }
              />
              
              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect based on role */}
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate
                      to={
                        user.role === 'admin'
                          ? '/admin/dashboard'
                          : user.role === 'teacher'
                          ? '/teacher/dashboard'
                          : '/student/dashboard'
                      }
                      replace
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              
              {/* Login Route */}
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate
                      to={
                        user.role === 'admin'
                          ? '/admin/dashboard'
                          : user.role === 'teacher'
                          ? '/teacher/dashboard'
                          : '/student/dashboard'
                      }
                      replace
                    />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              
              {/* Catch all route */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      user
                        ? user.role === 'admin'
                          ? '/admin/dashboard'
                          : user.role === 'teacher'
                          ? '/teacher/dashboard'
                          : '/student/dashboard'
                        : '/login'
                    }
                    replace
                  />
                }
              />
            </Routes>
          </main>
          
          {/* Mobile menu overlay */}
          {isSidebarOpen && (
            <div 
              className="mobile-menu-overlay" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
