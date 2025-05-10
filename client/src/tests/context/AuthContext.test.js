import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service');

// Test component that uses the auth context
const TestComponent = () => {
  const { 
    user, 
    loading, 
    error, 
    register, 
    login, 
    logout, 
    isAuthenticated 
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no user'}</div>
      <div data-testid="authenticated">{isAuthenticated().toString()}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('testuser', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register('newuser', 'new@example.com', 'password', 'New User')}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com'
    },
    token: 'mock-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load user from local storage on initial render', async () => {
    authService.getCurrentUser.mockReturnValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial loading state
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser.user));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should not set user if not found in localStorage', async () => {
    authService.getCurrentUser.mockReturnValueOnce(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('no user');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('should handle login successfully', async () => {
    authService.login.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-btn'));
    });

    // Should be loading during login
    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser.user));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('error').textContent).toBe('no error');
  });

  it('should handle login failure', async () => {
    const error = new Error('Invalid credentials');
    error.response = { data: { message: 'Invalid credentials' }};
    authService.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(screen.getByTestId('user').textContent).toBe('no user');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
  });

  it('should handle register successfully', async () => {
    authService.register.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click register button
    await act(async () => {
      userEvent.click(screen.getByTestId('register-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(authService.register).toHaveBeenCalledWith(
      'newuser', 
      'new@example.com', 
      'password', 
      'New User'
    );
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser.user));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('should handle logout', async () => {
    // Setup initial state with logged in user
    authService.getCurrentUser.mockReturnValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    // Click logout button
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-btn'));
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user').textContent).toBe('no user');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });
}); 