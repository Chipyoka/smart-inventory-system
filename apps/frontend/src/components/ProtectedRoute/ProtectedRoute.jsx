import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoaded } = useUserStore((state) => ({
    user: state.user,
    isLoaded: state.isLoaded,
  }));

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/not-found" replace />;

  return children;
};

export default ProtectedRoute;
