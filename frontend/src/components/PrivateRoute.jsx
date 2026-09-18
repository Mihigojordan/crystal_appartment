import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0d13', color: '#b7bcc9' }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
