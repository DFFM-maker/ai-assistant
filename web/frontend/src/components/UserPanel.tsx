import React from 'react';
import { User } from '../types/User';
import { useUserSettings } from '../hooks/useUserSettings';

interface UserPanelProps {
  user: User | null;
  loading: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, loading }) => {
  const { settings } = useUserSettings();

  const getUserAvatar = () => {
    return settings.avatar || user?.avatar || '';
  };

  const getUserName = () => {
    return settings.name || user?.name || 'User';
  };

  const getUserEmail = () => {
    return settings.email || user?.email || user?.username || '';
  };
  if (loading) {
    return (
      <div className="user-panel">
        <div className="user-panel-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="user-panel">
      {user ? (
        <div className="user-panel-authenticated">
          <div className="user-info">
            <img
              src={getUserAvatar() || 'https://via.placeholder.com/36/3b82f6/ffffff?text=U'}
              alt={`${getUserName()} avatar`}
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{getUserName()}</span>
              <span className="user-username">{getUserEmail() ? getUserEmail() : `@${user?.username}`}</span>
            </div>
          </div>
          <a href="http://192.168.1.250:4000/api/auth/logout" className="logout-link">
            <button className="logout-button" type="button">
              Logout
            </button>
          </a>
        </div>
      ) : (
        <div className="user-panel-unauthenticated">
          <button
            className="login-button"
            type="button"
            onClick={() => window.location.href = 'http://192.168.1.250:4000/api/auth/gitlab'}
          >
            Login con GitLab
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
