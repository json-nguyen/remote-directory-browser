import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from './ui/Loader';

const IndexRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;

  return <Navigate to={isAuthenticated ? '/files' : '/login'} replace />;
};

export default IndexRedirect;
