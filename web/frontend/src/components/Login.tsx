import React from 'react';
import './Login.css';

const Login: React.FC = () => {
  const handleGitLabLogin = () => {
    // Redirect to GitLab OAuth
    window.location.href = '/api/auth/gitlab';
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🏭 AI Assistant</h1>
        <p>Industrial AI Assistant for Automation and PLC Development</p>
        
        <div className="auth-entry">
          <button onClick={handleGitLabLogin} className="gitlab-button">
            🔗 Login with GitLab
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;