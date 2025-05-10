import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/Login';
import { useAuth } from '../../context/AuthContext';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the auth context
jest.mock('../../context/AuthContext');

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    useAuth.mockReturnValue({
      login: mockLogin,
      error: null
    });
  });
  
  const renderLoginComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };
  
  it('should render login form correctly', () => {
    renderLoginComponent();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });
  
  it('should show validation error when form is submitted without values', async () => {
    renderLoginComponent();
    
    // Submit form without entering data
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/please enter both username and password/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  it('should toggle password visibility when show/hide button is clicked', async () => {
    renderLoginComponent();
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show/i });
    
    // Password field should initially be of type "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button
    fireEvent.click(toggleButton);
    
    // Password field should now be of type "text"
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveTextContent(/hide/i);
    
    // Click the toggle button again
    fireEvent.click(toggleButton);
    
    // Password field should be back to type "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent(/show/i);
  });
  
  it('should call login function with entered credentials', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLoginComponent();
    
    // Enter username and password
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if login was called with correct parameters
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });
  
  it('should navigate to dashboard after successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLoginComponent();
    
    // Enter username and password
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('should show error message when login fails', async () => {
    const errorMessage = 'Invalid username or password';
    const error = new Error(errorMessage);
    error.response = { data: { message: errorMessage } };
    
    mockLogin.mockRejectedValueOnce(error);
    renderLoginComponent();
    
    // Enter username and password
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('should update UI state during login process', async () => {
    mockLogin.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({}), 100);
      });
    });
    
    renderLoginComponent();
    
    // Enter username and password
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Button should show loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 