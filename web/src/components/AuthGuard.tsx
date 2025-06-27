import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, isLoggingOut } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;

  const isOnLoginPage = location.pathname.startsWith('/login');

  if (isLoggingOut && !isOnLoginPage) {
    return <Navigate to="/login?redirect=/files" replace />;
  }

  if (isLoggingOut) {
    return <Loader />;
  }

  if (!isAuthenticated && !isOnLoginPage) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
