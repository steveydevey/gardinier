import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../utils/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the auth context
jest.mock('../../context/AuthContext');

describe('ProtectedRoute', () => {
  const DashboardComponent = () => <div>Dashboard Content</div>;
  const LoginComponent = () => <div>Login Page</div>;

  const renderProtectedRoute = () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render loading indicator when loading is true', () => {
    useAuth.mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(true),
      loading: true
    });

    renderProtectedRoute();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render child route when user is authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(true),
      loading: false
    });

    renderProtectedRoute();

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(false),
      loading: false
    });

    renderProtectedRoute();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
}); 