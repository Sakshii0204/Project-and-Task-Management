import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Authenticating secure session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(currentUser?.role) &&
    !allowedRoles.includes(currentUser?.rawRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
