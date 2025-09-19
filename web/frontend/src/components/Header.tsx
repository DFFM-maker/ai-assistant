import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useUserSettings } from '../hooks/useUserSettings';
import './Header.css';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useUserSettings();

  const getUserAvatar = () => {
    return settings.avatar || 'https://via.placeholder.com/32/3b82f6/ffffff?text=AI';
  };

  const getUserName = () => {
    return settings.name || 'AI Assistant';
  };

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
              src={getUserAvatar()}
              alt={`${getUserName()} avatar`}
              className="user-avatar"
            />
            <span className="user-name">{getUserName()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;