import React from 'react';
import { User } from '../types/User';

interface UserPanelProps {
  user: User | null;
  loading: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, loading }) => {
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
              src={user.avatar}
              alt={`${user.username} avatar`}
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-username">@{user.username}</span>
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
