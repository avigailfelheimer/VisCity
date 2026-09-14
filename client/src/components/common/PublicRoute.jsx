import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext.jsx';

function PublicRoute() {
  const { user, isLoading } = useContext(UserContext);

  if (isLoading) return null;
  return user ? <Navigate to="/places" replace /> : <Outlet />;
}

export default PublicRoute;