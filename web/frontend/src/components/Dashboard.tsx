import React from 'react';
import { User } from '../types/User';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="dashboard">
      <h1>AI Assistant</h1>
      <p>Welcome back, {user.name}!</p>
      {/* Main application content goes here */}
    </div>
  );
};

export default Dashboard;