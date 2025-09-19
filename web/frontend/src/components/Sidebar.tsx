import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatList from "./ChatList";
import Settings from "./Settings";
import SettingsPanel from "./SettingsPanel";
import NewChatModal from "./NewChatModal";
import { useChat } from "../hooks/useChat";
import { useUserSettings } from "../hooks/useUserSettings";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { switchSession } = useChat();
  const { settings } = useUserSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleUserProfileClick = () => {
    setShowUserSettings(true);
  };

  const getUserAvatar = () => {
    return settings.avatar || 'https://via.placeholder.com/40/3b82f6/ffffff?text=AI';
  };

  const getUserName = () => {
    return settings.name || 'AI Assistant';
  };

  const getUserEmail = () => {
    return settings.email || 'ai-bot@dffm.it';
  };

  const handleChatCreated = (sessionId: string) => {
    switchSession(sessionId);
    setShowNewChatModal(false);
  };

  const isChatPage = location.pathname === '/chat';

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="app-logo-section">
          <div className="app-logo">
            {/* Using a wood/factory icon for Defra Wood Maker - could be replaced with actual logo */}
            🏭
          </div>
          <div className="app-name">Defra Wood Maker</div>
        </div>
      </div>

      {/* Navigation or Chat List */}
      <div className="sidebar-content">
        {isChatPage ? (
          <ChatList onNewChat={handleNewChat} />
        ) : (
          <nav className="sidebar-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') || isActive('/') ? 'active' : ''}`}
                >
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/chat" 
                  className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                >
                  <span className="nav-icon">🤖</span>
                  <span className="nav-text">AI Chat</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/versioning" 
                  className={`nav-link ${isActive('/versioning') ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔧</span>
                  <span className="nav-text">Version Control</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/documentation" 
                  className={`nav-link ${isActive('/documentation') ? 'active' : ''}`}
                >
                  <span className="nav-icon">📚</span>
                  <span className="nav-text">Documentation</span>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
      
      {/* Footer with Settings and User Profile */}
      <div className="sidebar-footer">
        {isChatPage && (
          <div className="sidebar-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Manage Groups"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Groups</span>
            </button>
          </div>
        )}
        
        {/* AI Bot User Profile */}
        <div 
          className="user-profile clickable" 
          onClick={handleUserProfileClick}
          title="Click to open user settings"
        >
          <img 
            src={getUserAvatar() || 'https://via.placeholder.com/40/3b82f6/ffffff?text=AI'} 
            alt={getUserName()}
            className="user-avatar"
          />
          <div className="user-details">
            <div className="user-name">{getUserName()}</div>
            <div className="user-username">{getUserEmail()}</div>
          </div>
        </div>
        
        <div className="app-version">
          <span>AI Assistant v1.0.0</span>
        </div>
      </div>

      {/* Modals */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      <SettingsPanel
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        user={null}
      />
      
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </aside>
  );
};

export default Sidebar;

