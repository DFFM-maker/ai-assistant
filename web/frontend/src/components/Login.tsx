import React from 'react';
import './Login.css';

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = 'http://192.168.1.250:4000/api/auth/gitlab';
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>AI Assistant</h1>
        <p>Please log in to access the AI Assistant.</p>
        <button onClick={handleLogin} className="login-button">
          Login con GitLab
        </button>
      </div>
    </div>
  );
};

export default Login;