import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/User';
import { useTheme } from '../hooks/useTheme';
import { useUserSettings } from '../hooks/useUserSettings';
import './Header.css';

interface HeaderProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useUserSettings();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const getUserAvatar = () => {
    return settings.avatar || user?.avatar || '';
  };

  const getUserName = () => {
    return settings.name || user?.name || 'User';
  };

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="app-title">AI Assistant</h2>
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <div className="user-info">
            <img
              src={getUserAvatar() || 'https://via.placeholder.com/32/3b82f6/ffffff?text=U'}
              alt={`${getUserName()} avatar`}
              className="user-avatar"
            />
            <span className="user-name">{getUserName()}</span>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;