import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();
        setProfile(response.profile);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username || 'Gardener'}!</h1>
        <p>Manage your garden and track your plants from here.</p>
      </div>
      
      <div className="dashboard-content">
        <div className="profile-card">
          <h2>Garden Profile</h2>
          {profile && (
            <div className="profile-details">
              <div className="profile-section">
                <h3>Location</h3>
                <p>Hardiness Zone: {profile.location.zone || 'Not set'}</p>
                <p>Climate: {profile.location.climate || 'Not set'}</p>
              </div>
              
              <div className="profile-section">
                <h3>Garden Details</h3>
                <p>Size: {profile.garden.size || 'Not set'}</p>
                <p>Soil Type: {profile.garden.soilType || 'Not set'}</p>
                <p>Sun Exposure: {profile.garden.sunExposure || 'Not set'}</p>
              </div>
              
              <div className="profile-section">
                <h3>Experience</h3>
                <p>Level: {profile.experienceLevel || 'Beginner'}</p>
              </div>
              
              <div className="profile-section">
                <h3>Preferred Plants</h3>
                {profile.preferredPlants && profile.preferredPlants.length > 0 ? (
                  <ul>
                    {profile.preferredPlants.map((plant, index) => (
                      <li key={index}>{plant}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No preferred plants set</p>
                )}
              </div>
            </div>
          )}
          <button className="edit-profile-button">Edit Profile</button>
        </div>
        
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">Create Garden Plan</button>
            <button className="action-button">Add Plants</button>
            <button className="action-button">Record Activity</button>
            <button className="action-button">View Calendar</button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>Today's Weather</h3>
          <p>Weather information would appear here</p>
        </div>
        <div className="card">
          <h3>Recent Activities</h3>
          <p>No recent activities</p>
        </div>
        <div className="card">
          <h3>Upcoming Tasks</h3>
          <p>No upcoming tasks</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 