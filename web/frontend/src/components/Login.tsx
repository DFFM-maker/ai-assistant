import React from 'react';
import './Login.css';

const Login: React.FC = () => {
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
        <h1>🏭 AI Assistant</h1>
        <p>Industrial AI Assistant for Automation and PLC Development</p>
        
        <div className="demo-entry">
          <button onClick={handleDemoMode} className="demo-button">
            🚀 Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;