import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext.jsx';

function AdminProtectedRoute() {
  const { user, isLoading } = useContext(UserContext);

  if (isLoading) return null;

  // בדיקה נקייה בהתבסס על התיקון שלך (role מהטוקן או user_type מהמסד)
  const isAdmin = user && (user.role === 'admin' || user.user_type === 'admin');

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/home" replace />;
}

export default AdminProtectedRoute;