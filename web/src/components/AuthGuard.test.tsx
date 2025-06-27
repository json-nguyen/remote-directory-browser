import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '@/context/AuthContext';
import AuthGuard from './AuthGuard';

const TestComponent = () => <div>Protected Content</div>;

const renderWithContext = ({
  isAuthenticated,
  loading,
}: {
  isAuthenticated: boolean;
  loading: boolean;
}) => {
  return render(
    <AuthContext.Provider
      value={{ isAuthenticated, loading, setAuthenticated: () => {} }}
    >
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <TestComponent />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('AuthGuard', () => {
  it('renders loader when loading is true', () => {
    renderWithContext({ isAuthenticated: false, loading: true });
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithContext({ isAuthenticated: true, loading: false });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderWithContext({ isAuthenticated: false, loading: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
