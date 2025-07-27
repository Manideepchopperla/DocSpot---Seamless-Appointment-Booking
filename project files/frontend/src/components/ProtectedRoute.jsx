import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 1. Check for token and user info
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user's role is allowed for this route
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  // 3. If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;