import { Button } from '@/components/ui/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #666;
  margin-bottom: 24px;
`;

const Details = styled.pre`
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  color: #333;
  max-width: 600px;
  overflow-x: auto;
`;

interface ErrorState {
  message?: string;
  status?: number;
}

export default function ErrorPage() {
  const location = useLocation();
  const state = location.state as ErrorState;

  const navigate = useNavigate();
  return (
    <Container>
      <Title>Something went wrong</Title>
      <Subtitle>
        {state?.message ||
          'An unexpected error occurred. Please try again later.'}
      </Subtitle>
      {state?.status && <Details>{`Error Code: ${state.status}`}</Details>}
      <Button onClick={() => void navigate('/login')}>Go Home</Button>
    </Container>
  );
}
