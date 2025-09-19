import React, { useState, useEffect } from 'react';
import './UserManagement.css';

interface WhitelistUser {
  id: string;
  email: string;
  name?: string;
  addedAt: Date;
  addedBy: string;
}

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = '' }) => {
  const [whitelist, setWhitelist] = useState<WhitelistUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser] = useState({
    id: 'admin-1',
    email: 'admin@ai-assistant.local',
    name: 'AI Assistant Admin',
    role: 'admin'
  });

  // Load whitelist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_assistant_user_whitelist');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWhitelist(parsed.map((user: any) => ({
          ...user,
          addedAt: new Date(user.addedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading user whitelist:', error);
    }
  }, []);

  // Save whitelist to localStorage
  const saveWhitelist = (newWhitelist: WhitelistUser[]) => {
    try {
      localStorage.setItem('ai_assistant_user_whitelist', JSON.stringify(newWhitelist));
      setWhitelist(newWhitelist);
    } catch (error) {
      console.error('Error saving user whitelist:', error);
    }
  };

  const addUser = () => {
    if (!newEmail.trim()) return;

    // Check if email already exists
    if (whitelist.some(user => user.email.toLowerCase() === newEmail.toLowerCase())) {
      alert('Email already exists in whitelist');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newUser: WhitelistUser = {
        id: `user-${Date.now()}`,
        email: newEmail.trim(),
        name: newName.trim() || undefined,
        addedAt: new Date(),
        addedBy: currentUser.name
      };

      const updatedWhitelist = [...whitelist, newUser];
      saveWhitelist(updatedWhitelist);
      
      setNewEmail('');
      setNewName('');
      setIsLoading(false);
    }, 500);
  };

  const removeUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user from the whitelist?')) {
      const updatedWhitelist = whitelist.filter(user => user.id !== userId);
      saveWhitelist(updatedWhitelist);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser();
  };

  return (
    <div className={`user-management ${className}`}>
      <div className="user-management-header">
        <h3>👥 User Management</h3>
        <p className="header-subtitle">Manage whitelist for standard users</p>
      </div>

      <div className="add-user-section">
        <h4>Add User to Whitelist</h4>
        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name (optional)</label>
              <input
                id="name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="add-button"
              disabled={!newEmail.trim() || isLoading}
            >
              {isLoading ? '⏳' : '➕'} Add User
            </button>
          </div>
        </form>
      </div>

      <div className="whitelist-section">
        <div className="section-header">
          <h4>Current Whitelist ({whitelist.length} users)</h4>
        </div>
        
        {whitelist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No users in whitelist</p>
            <span>Add users above to grant them access</span>
          </div>
        ) : (
          <div className="users-list">
            {whitelist.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="user-details">
                    <span className="user-email">{user.email}</span>
                    {user.name && <span className="user-name">{user.name}</span>}
                  </div>
                  <div className="user-meta">
                    <span className="added-info">
                      Added by {user.addedBy} on {formatDate(user.addedAt)}
                    </span>
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => removeUser(user.id)}
                  title="Remove from whitelist"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="management-info">
        <div className="info-card">
          <h5>ℹ️ Information</h5>
          <ul>
            <li>Only administrators can manage the user whitelist</li>
            <li>Whitelist data is stored locally in browser storage</li>
            <li>Users must be on the whitelist to access standard features</li>
            <li>Admins always have full access regardless of whitelist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;