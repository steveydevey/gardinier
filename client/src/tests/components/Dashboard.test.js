import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../components/Dashboard';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';

// Mock dependencies
jest.mock('../../context/AuthContext');
jest.mock('../../services/user.service');

describe('Dashboard Component', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  };
  
  const mockProfile = {
    profile: {
      location: {
        zone: '7b',
        climate: 'Temperate'
      },
      garden: {
        size: 'Medium (20-100 sq ft)',
        soilType: 'Clay loam',
        sunExposure: 'Partial sun'
      },
      experienceLevel: 'Intermediate',
      preferredPlants: [
        'Tomatoes',
        'Basil',
        'Roses'
      ]
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock implementation
    useAuth.mockReturnValue({
      user: mockUser
    });
  });
  
  it('should show loading state initially', () => {
    userService.getProfile.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<Dashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('should fetch and display user profile data', async () => {
    userService.getProfile.mockResolvedValueOnce(mockProfile);
    
    render(<Dashboard />);
    
    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check that we see the welcome message with the username
    expect(screen.getByText(/welcome, testuser!/i)).toBeInTheDocument();
    
    // Check that profile data is displayed
    expect(screen.getByText(/hardiness zone: 7b/i)).toBeInTheDocument();
    expect(screen.getByText(/climate: temperate/i)).toBeInTheDocument();
    expect(screen.getByText(/size: medium \(20-100 sq ft\)/i)).toBeInTheDocument();
    expect(screen.getByText(/soil type: clay loam/i)).toBeInTheDocument();
    expect(screen.getByText(/sun exposure: partial sun/i)).toBeInTheDocument();
    expect(screen.getByText(/level: intermediate/i)).toBeInTheDocument();
    
    // Check for preferred plants list
    expect(screen.getByText('Tomatoes')).toBeInTheDocument();
    expect(screen.getByText('Basil')).toBeInTheDocument();
    expect(screen.getByText('Roses')).toBeInTheDocument();
    
    // Quick action buttons should be present
    expect(screen.getByText('Create Garden Plan')).toBeInTheDocument();
    expect(screen.getByText('Add Plants')).toBeInTheDocument();
    expect(screen.getByText('Record Activity')).toBeInTheDocument();
    expect(screen.getByText('View Calendar')).toBeInTheDocument();
  });
  
  it('should show error message if profile fetch fails', async () => {
    userService.getProfile.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load profile. Please try again later.')).toBeInTheDocument();
    });
  });
  
  it('should use default username if user is not available', async () => {
    userService.getProfile.mockResolvedValueOnce(mockProfile);
    useAuth.mockReturnValue({ user: null });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/welcome, gardener!/i)).toBeInTheDocument();
  });
  
  it('should handle missing profile details gracefully', async () => {
    // Mock empty profile
    userService.getProfile.mockResolvedValueOnce({
      profile: {
        location: {},
        garden: {},
        preferredPlants: []
      }
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/hardiness zone: not set/i)).toBeInTheDocument();
    expect(screen.getByText(/climate: not set/i)).toBeInTheDocument();
    expect(screen.getByText(/size: not set/i)).toBeInTheDocument();
    expect(screen.getByText(/soil type: not set/i)).toBeInTheDocument();
    expect(screen.getByText(/sun exposure: not set/i)).toBeInTheDocument();
    expect(screen.getByText(/level: beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/no preferred plants set/i)).toBeInTheDocument();
  });
}); 