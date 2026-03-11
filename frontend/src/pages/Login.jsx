import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, LogIn } from 'lucide-react';
import { authAPI } from '../services/api';
import '../styles/attendance.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    teacherId: '',
    rollNumber: '',
    password: '',
    role: 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      username: '',
      teacherId: '',
      rollNumber: '',
      password: '',
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      const credentials = {
        password: formData.password,
      };

      switch (formData.role) {
        case 'admin':
          credentials.username = formData.username;
          response = await authAPI.login(credentials);
          break;
        case 'teacher':
          credentials.teacherId = formData.teacherId;
          response = await authAPI.teacherLogin(credentials);
          break;
        case 'student':
          credentials.rollNumber = formData.rollNumber;
          response = await authAPI.studentLogin(credentials);
          break;
        default:
          throw new Error('Invalid role selected');
      }

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response[formData.role]));

      // Show success message with login credentials for teacher
      if (formData.role === 'teacher' && response.teacher) {
        console.log(`Teacher Login Successful!`);
        console.log(`Teacher ID: ${response.teacher.teacherId}`);
        console.log(`Default Password: Teacher@123`);
      }

      // Call onLogin callback
      onLogin(response[formData.role]);

      // Redirect to intended page or dashboard
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      
      navigate(from === '/' ? roleRoutes[formData.role] : from, { replace: true });
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (formData.role) {
      case 'admin':
        return 'Enter username';
      case 'teacher':
        return 'Enter teacher ID';
      case 'student':
        return 'Enter roll number';
      default:
        return 'Enter identifier';
    }
  };

  const getIdentifierName = () => {
    switch (formData.role) {
      case 'admin':
        return 'username';
      case 'teacher':
        return 'teacherId';
      case 'student':
        return 'rollNumber';
      default:
        return 'identifier';
    }
  };

  const getIdentifierValue = () => {
    switch (formData.role) {
      case 'admin':
        return formData.username;
      case 'teacher':
        return formData.teacherId;
      case 'student':
        return formData.rollNumber;
      default:
        return '';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <BookOpen className="login-icon" />
          <h1>College Attendance Portal</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Role Selection */}
        <div className="role-selector">
          <div className="role-tabs">
            {['admin', 'teacher', 'student'].map((role) => (
              <button
                key={role}
                className={`role-tab ${formData.role === role ? 'active' : ''}`}
                onClick={() => handleRoleChange(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor={getIdentifierName()}>
              {getIdentifierName().charAt(0).toUpperCase() + getIdentifierName().slice(1)}
            </label>
            <input
              type="text"
              id={getIdentifierName()}
              name={getIdentifierName()}
              value={getIdentifierValue()}
              onChange={handleInputChange}
              placeholder={getIdentifierPlaceholder()}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {formData.role === 'admin' && 'Default: admin / admin123'}
            {formData.role === 'teacher' && 'Use your Teacher ID and password'}
            {formData.role === 'student' && 'Use your Roll Number and password'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
