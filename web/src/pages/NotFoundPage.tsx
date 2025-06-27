import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 18px;
  margin-bottom: 24px;
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>404</Title>
      <Message>Sorry, the page you’re looking for doesn’t exist.</Message>
      <Button onClick={() => void navigate('/login')}>Go Home</Button>
    </Container>
  );
};

export default NotFound;
