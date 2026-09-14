import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext.jsx';

function ProtectedRoute() {
  const { user, isLoading } = useContext(UserContext);

  if (isLoading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;