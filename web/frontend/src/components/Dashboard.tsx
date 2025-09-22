import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ollamaService } from '../services/ollamaService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Simulate admin user - in a real app this would come from auth context
  const [currentUser] = useState({
    id: 'admin-1',
    email: 'admin@ai-assistant.local',
    name: 'AI Assistant Admin',
    role: 'admin' as const
  });

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const isHealthy = await ollamaService.checkHealth();
      if (isHealthy) {
        setOllamaStatus('connected');
        const models = await ollamaService.getAvailableModels();
        setAvailableModels(models);
      } else {
        setOllamaStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaStatus('disconnected');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏭 Industrial AI Assistant</h1>
        <p>Welcome to the AI Assistant!</p>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <div className="status-header">
            <h3>🤖 AI Service</h3>
            <div className={`status-indicator ${ollamaStatus}`}>
              {ollamaStatus === 'checking' && '⏳'}
              {ollamaStatus === 'connected' && '✅'}
              {ollamaStatus === 'disconnected' && '❌'}
            </div>
          </div>
          <div className="status-content">
            {ollamaStatus === 'checking' && <p>Checking connection...</p>}
            {ollamaStatus === 'connected' && (
              <>
                <p>✅ Ollama service is running</p>
                <p>🎯 {availableModels.length} models available</p>
              </>
            )}
            {ollamaStatus === 'disconnected' && (
              <>
                <p>❌ Ollama service unavailable</p>
                <p>Make sure Ollama is running on localhost:11434</p>
              </>
            )}
          </div>
        </div>

        <div className="status-card">
          <div className="status-header">
            <h3>🤖 AI Bot</h3>
            <div className="status-indicator connected">✅</div>
          </div>
          <div className="status-content">
            <p>✅ Running as ai-bot</p>
            <p>🔐 No authentication required</p>
            <p>🤖 AI Assistant ready</p>
          </div>
        </div>

        <div className="status-card">
          <div className="status-header">
            <h3>🔧 Version Control</h3>
            <div className="status-indicator connected">✅</div>
          </div>
          <div className="status-content">
            <p>✅ ai-bot Git integration active</p>
            <p>📊 Automated versioning</p>
            <p>🚀 Auto-sync enabled</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/chat" className="action-card">
            <div className="action-icon">🤖</div>
            <h3>Start AI Chat</h3>
            <p>Interact with industrial AI models for automation, PLC programming, and technical assistance.</p>
          </Link>

          <div className="action-card disabled">
            <div className="action-icon">📚</div>
            <h3>Generate Documentation</h3>
            <p>Create technical documentation, API guides, and user manuals using AI.</p>
          </div>

          <div className="action-card disabled">
            <div className="action-icon">🔧</div>
            <h3>Version Control</h3>
            <p>Manage Git repositories, commit changes, and collaborate with team members.</p>
          </div>

          <div className="action-card disabled">
            <div className="action-icon">⚙️</div>
            <h3>System Settings</h3>
            <p>Configure AI models, update preferences, and manage system integrations.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>📈 Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🤖</span>
            <div className="activity-content">
              <p><strong>AI Chat Session</strong></p>
              <p>Industrial automation query processed</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div className="activity-content">
              <p><strong>Documentation Generated</strong></p>
              <p>API documentation for PLC interface</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <span className="activity-icon">🔧</span>
            <div className="activity-content">
              <p><strong>Git Commit</strong></p>
              <p>Updated automation scripts</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;