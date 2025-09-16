import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
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
        
        <div className="sidebar-footer">
          <div className="app-info">
            <div className="app-logo">🏭</div>
            <div className="app-details">
              <div className="app-name">AI Assistant</div>
              <div className="app-version">v1.0.0</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

