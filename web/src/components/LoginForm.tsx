import { useState } from 'react';
import styled from 'styled-components';
import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import { login } from '@/api/auth';
import { APIError } from '@/api/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const Error = styled.p`
  color: red;
  font-size: 0.9rem;
  text-align: center;
  margin-top: -8px;
  word-break: break-word;
  max-width: 200px;
  white-space: pre-wrap;
`;

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { setAuthenticated, logoutMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/files';

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await login(username, password);
      setUsername(res.username);
      setAuthenticated(true);
      await navigate(redirect, { replace: true });
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Unexpected error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        // Added this void to fix lint issue: @typescript-eslint/no-floating-promises
        void handleLogin();
      }}
    >
      <Box mb="12px" display="flex" flexDirection="column">
        <Label>Username</Label>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </Box>
      <Box display="flex" flexDirection="column">
        <Label>Password</Label>
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </Box>
      <Box mt="20px" display="flex" flexDirection="column" alignItems="center">
        {(error || logoutMessage) && <Error>{error || logoutMessage}</Error>}
        <Button disabled={submitting} type="submit">
          Log In
        </Button>
      </Box>
    </Form>
  );
};

export default LoginForm;
