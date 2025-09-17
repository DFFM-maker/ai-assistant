import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = 'http://192.168.1.250:4000/api/auth/gitlab';
  };

  const handleDemoMode = () => {
    // Set a demo user in localStorage
    const demoUser = {
      id: 'demo-user',
      username: 'demo',
      name: 'Demo User',
      avatar: 'https://via.placeholder.com/36/3b82f6/ffffff?text=DU'
    };
    
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    window.location.reload(); // Reload to trigger auth check
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>AI Assistant</h1>
        <p>Please log in to access the AI Assistant.</p>
        
        <div className="login-options">
          <button onClick={handleLogin} className="login-button">
            Login con GitLab
          </button>
          
          <div className="demo-section">
            <p className="demo-text">Or try the demo mode:</p>
            <button onClick={handleDemoMode} className="demo-button">
              🚀 Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;