import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const ProtectedRoute = ({ children, allowedRoles }) => {

    
  const { user } = useUserStore();

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
