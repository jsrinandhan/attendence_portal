import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Check if required role matches
        if (requiredRole && parsedUser.role !== requiredRole) {
          setIsLoading(false);
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const parsedUser = JSON.parse(userData);
    
    // Check if required role matches
    if (requiredRole && parsedUser.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      
      const redirectPath = roleRoutes[parsedUser.role] || '/login';
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
