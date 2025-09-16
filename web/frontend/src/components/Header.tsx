import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/User';
import './Header.css';

interface HeaderProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          <img
            src={user.avatar}
            alt={`${user.username} avatar`}
            className="user-avatar"
          />
          <span className="user-name">{user.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;