import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as authApi from '@/api/auth';
import { MemoryRouter } from 'react-router-dom';

function TestComponent() {
  const { isAuthenticated, loading, setAuthenticated, handleLogout } =
    useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {loading
          ? 'loading'
          : isAuthenticated
            ? 'authenticated'
            : 'unauthenticated'}
      </div>
      <button onClick={() => setAuthenticated(true)}>Fake Login</button>
      <button onClick={() => handleLogout()}>Fake Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('Properly toggles authenticated state', async () => {
    vi.spyOn(authApi, 'validateSession').mockRejectedValueOnce(
      new Error('unauthenticated')
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for session check to complete
    await waitFor(() => {
      const status = screen.getByTestId('auth-status').textContent;
      return status !== 'loading';
    });

    // Should be unauthenticated by default if validateSession fails
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'unauthenticated'
    );

    // Click fake login button
    await userEvent.click(screen.getByText('Fake Login'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    );

    // Click fake logout button
    await userEvent.click(screen.getByText('Fake Logout'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated'
      )
    );
  });
});
