import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRouteProps } from '../../types';
import AccessDenied from '../AccessDenied/AccessDenied';
import { authService } from '../../services/authService';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if user has it
  if (requiredRole && !authService.hasRole(currentUser, requiredRole)) {
    return <AccessDenied requiredRole={requiredRole} userRole={currentUser.role} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
