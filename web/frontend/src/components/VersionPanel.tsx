import React, { useState, useEffect } from 'react';
import './VersionPanel.css';

interface GitStatus {
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  not_added: string[];
  conflicted: string[];
  created: string[];
  deleted: string[];
  renamed: string[];
  files: Array<{
    path: string;
    index: string;
    working_dir: string;
  }>;
}

interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

const VersionPanel: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [recentCommits, setRecentCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    refreshGitStatus();
    loadRecentCommits();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshGitStatus();
      loadRecentCommits();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshGitStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/git/status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const status = await response.json();
      setGitStatus(status);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching git status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentCommits = async () => {
    try {
      const response = await fetch('/api/git/commits?limit=5', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const commits = await response.json();
        setRecentCommits(commits);
      }
    } catch (err) {
      console.error('Error fetching commits:', err);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || isCommitting) return;
    
    setIsCommitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/git/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: commitMessage.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Commit failed');
      }
      
      setCommitMessage('');
      await refreshGitStatus();
      await loadRecentCommits();
    } catch (err) {
      console.error('Error committing:', err);
      setError(err instanceof Error ? err.message : 'Commit failed');
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/git/push', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Push failed');
      }
      
      await refreshGitStatus();
    } catch (err) {
      console.error('Error pushing:', err);
      setError(err instanceof Error ? err.message : 'Push failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/git/pull', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Pull failed');
      }
      
      await refreshGitStatus();
      await loadRecentCommits();
    } catch (err) {
      console.error('Error pulling:', err);
      setError(err instanceof Error ? err.message : 'Pull failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'M': return '📝'; // Modified
      case 'A': return '➕'; // Added
      case 'D': return '🗑️'; // Deleted
      case 'R': return '📝'; // Renamed
      case '??': return '❓'; // Untracked
      default: return '📄';
    }
  };

  const getFileStatusText = (status: string) => {
    switch (status) {
      case 'M': return 'Modified';
      case 'A': return 'Added';
      case 'D': return 'Deleted';
      case 'R': return 'Renamed';
      case '??': return 'Untracked';
      default: return 'Unknown';
    }
  };

  const hasChanges = gitStatus && (
    gitStatus.staged.length > 0 ||
    gitStatus.modified.length > 0 ||
    gitStatus.not_added.length > 0 ||
    gitStatus.created.length > 0 ||
    gitStatus.deleted.length > 0
  );

  return (
    <div className="version-panel">
      <div className="version-header">
        <h3>🔧 Version Control</h3>
        <button 
          onClick={refreshGitStatus}
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? '⏳' : '🔄'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {/* Branch Information */}
      {gitStatus && (
        <div className="branch-info">
          <div className="current-branch">
            <span className="branch-icon">🌿</span>
            <span className="branch-name">{gitStatus.current || 'Unknown'}</span>
          </div>
          
          {gitStatus.tracking && (
            <div className="tracking-info">
              <span className="tracking-text">↗️ {gitStatus.tracking}</span>
              {gitStatus.ahead > 0 && (
                <span className="ahead-count">+{gitStatus.ahead}</span>
              )}
              {gitStatus.behind > 0 && (
                <span className="behind-count">-{gitStatus.behind}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Changes */}
      <div className="changes-section">
        <h4>📁 Changes</h4>
        
        {hasChanges ? (
          <div className="changes-list">
            {/* Staged files */}
            {gitStatus?.staged.map((file, index) => (
              <div key={`staged-${index}`} className="file-item staged">
                <span className="file-status">✅</span>
                <span className="file-name">{file}</span>
                <span className="file-status-text">Staged</span>
              </div>
            ))}
            
            {/* Modified files */}
            {gitStatus?.modified.map((file, index) => (
              <div key={`modified-${index}`} className="file-item modified">
                <span className="file-status">📝</span>
                <span className="file-name">{file}</span>
                <span className="file-status-text">Modified</span>
              </div>
            ))}
            
            {/* Untracked files */}
            {gitStatus?.not_added.map((file, index) => (
              <div key={`untracked-${index}`} className="file-item untracked">
                <span className="file-status">❓</span>
                <span className="file-name">{file}</span>
                <span className="file-status-text">Untracked</span>
              </div>
            ))}
            
            {/* Created files */}
            {gitStatus?.created.map((file, index) => (
              <div key={`created-${index}`} className="file-item created">
                <span className="file-status">➕</span>
                <span className="file-name">{file}</span>
                <span className="file-status-text">New</span>
              </div>
            ))}
            
            {/* Deleted files */}
            {gitStatus?.deleted.map((file, index) => (
              <div key={`deleted-${index}`} className="file-item deleted">
                <span className="file-status">🗑️</span>
                <span className="file-name">{file}</span>
                <span className="file-status-text">Deleted</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-changes">
            <span>✨ No changes</span>
          </div>
        )}
      </div>

      {/* Commit Section */}
      {hasChanges && (
        <div className="commit-section">
          <h4>💾 Commit Changes</h4>
          <div className="commit-form">
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="commit-input"
              rows={2}
            />
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isCommitting}
              className="commit-button"
            >
              {isCommitting ? '⏳ Committing...' : '💾 Commit'}
            </button>
          </div>
        </div>
      )}

      {/* Git Actions */}
      <div className="git-actions">
        <h4>🚀 Actions</h4>
        <div className="action-buttons">
          <button 
            onClick={handlePull}
            disabled={isLoading}
            className="action-button pull"
          >
            ⬇️ Pull
          </button>
          <button 
            onClick={handlePush}
            disabled={isLoading || (gitStatus?.ahead || 0) === 0}
            className="action-button push"
          >
            ⬆️ Push {gitStatus?.ahead ? `(${gitStatus.ahead})` : ''}
          </button>
        </div>
      </div>

      {/* Recent Commits */}
      <div className="commits-section">
        <h4>📝 Recent Commits</h4>
        {recentCommits.length > 0 ? (
          <div className="commits-list">
            {recentCommits.map((commit, index) => (
              <div key={commit.hash} className="commit-item">
                <div className="commit-header">
                  <span className="commit-hash">#{commit.hash.slice(0, 7)}</span>
                  <span className="commit-date">{formatDate(commit.date)}</span>
                </div>
                <div className="commit-message">{commit.message}</div>
                <div className="commit-author">👤 {commit.author_name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-commits">
            <span>📝 No recent commits</span>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="status-footer">
        <span className="last-refresh">
          🕒 Updated: {lastRefresh.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
};

export default VersionPanel;