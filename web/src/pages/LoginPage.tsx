import styled from 'styled-components';
import LoginForm from '@/components/LoginForm';
import TeleportLogo from '@/assets/teleport_logo.svg?react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const LoginPageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25vh;
  background: linear-gradient(135deg, #e6e6fa, #d8b4f8, #c084fc);
`;

// This could definitely be created into a resuable styled component
// but for now, we will keep it simple since this is the only place we are using it
const Card = styled.div`
  padding: 10px 50px 40px 50px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const LoginPage = () => {
  const { isAuthenticated, isLoggingOut } = useAuth();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');
  const safeRedirect = redirect?.startsWith('/') ? redirect : '/files';

  if (isAuthenticated && !isLoggingOut) {
    return <Navigate to={safeRedirect} replace />;
  }

  return (
    <LoginPageContainer>
      <TeleportLogo width={200} height={150} />
      <Card>
        <h2>Login</h2>
        <LoginForm />
      </Card>
    </LoginPageContainer>
  );
};

export default LoginPage;
