import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VersionPanel from './components/VersionPanel';
import ChatPage from './pages/ChatPage';
import VersionPage from './pages/VersionPage';
import LoginGitlab from './LoginGitlab';
import './styles/styles.css';

interface User {
  name: string;
  username: string;
  avatar: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('ai-assistant-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check authentication status
    fetch('/api/user', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="loading-indicator">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="main-content">
          <h1>AI Assistant</h1>
          <LoginGitlab />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Sidebar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/version" element={<VersionPage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </main>
        
        <VersionPanel />
      </div>
    </Router>
  );
}

export default App;
