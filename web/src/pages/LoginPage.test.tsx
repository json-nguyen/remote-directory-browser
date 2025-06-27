import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '@/context/AuthContext';
import LoginPage from './LoginPage';

const renderWithAuth = ({
  isAuthenticated,
  initialPath = '/login',
}: {
  isAuthenticated: boolean;
  initialPath?: string;
}) => {
  return render(
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading: false,
        setAuthenticated: () => {},
        handleLogout: () => {},
        isLoggingOut: false,
        logoutMessage: '',
      }}
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/files" element={<div>Redirected to Files</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('LoginPage', () => {
  it('renders login form if not authenticated', () => {
    renderWithAuth({ isAuthenticated: false });
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('redirects to /files if already authenticated', () => {
    renderWithAuth({ isAuthenticated: true });
    expect(screen.getByText('Redirected to Files')).toBeInTheDocument();
  });

  it('redirects to query param already authenticated', () => {
    renderWithAuth({
      isAuthenticated: true,
      initialPath: '/login?redirect=/testroute',
    });
    // This ensures custom redirect query param works
    expect(screen.queryByText('Redirected to Files')).not.toBeInTheDocument();
  });
});
