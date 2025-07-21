import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isLoaded } = useUserStore();

  if (!isLoaded) return null; // or a loading spinner

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
