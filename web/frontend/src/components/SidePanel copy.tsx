import React, { useState, useEffect } from 'react';
import './SidePanel.css';

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
  beforeContent?: string;
  afterContent?: string;
}

interface PRDetails {
  title: string;
  description: string;
  status: 'draft' | 'open' | 'merged' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  branch: string;
  targetBranch: string;
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  prDetails?: PRDetails | null;
  fileDiffs?: FileDiff[];
  isLoading?: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  onToggle,
  prDetails,
  fileDiffs = [],
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'diff' | 'details'>('files');
  const [selectedFile, setSelectedFile] = useState<FileDiff | null>(null);
  const [diffView, setDiffView] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    if (fileDiffs.length > 0 && !selectedFile) {
      setSelectedFile(fileDiffs[0]);
    }
  }, [fileDiffs, selectedFile]);

  const formatFileStatus = (status: string) => {
    switch (status) {
      case 'added': return { icon: '➕', text: 'Added', color: '#238636' };
      case 'modified': return { icon: '📝', text: 'Modified', color: '#d1912f' };
      case 'deleted': return { icon: '🗑️', text: 'Deleted', color: '#da3633' };
      case 'renamed': return { icon: '📄', text: 'Renamed', color: '#8b5cf6' };
      default: return { icon: '📄', text: 'Unknown', color: '#6b7280' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <button
        className="side-panel-toggle"
        onClick={onToggle}
        title="Open Version Control Panel"
      >
        <span className="toggle-icon">📊</span>
        <span className="toggle-text">PR Details</span>
      </button>
    );
  }

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <div className="side-panel-header">
          <h3>🔧 Version Control</h3>
          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={() => window.location.reload()}
              title="Refresh"
            >
              🔄
            </button>
            <button
              className="close-button"
              onClick={onClose}
              title="Close Panel"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="side-panel-tabs">
          <button
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            📁 Files ({fileDiffs.length})
          </button>
          <button
            className={`tab ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
            disabled={!selectedFile}
          >
            📊 Diff
          </button>
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📝 PR Details
          </button>
        </div>

        <div className="side-panel-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Loading changes...</p>
            </div>
          ) : (
            <>
              {activeTab === 'files' && (
                <div className="files-tab">
                  <div className="files-summary">
                    <span className="summary-item">
                      📄 {fileDiffs.length} files changed
                    </span>
                    <span className="summary-item">
                      ➕ {fileDiffs.reduce((sum, f) => sum + f.additions, 0)} additions
                    </span>
                    <span className="summary-item">
                      ➖ {fileDiffs.reduce((sum, f) => sum + f.deletions, 0)} deletions
                    </span>
                  </div>
                  
                  <div className="files-list">
                    {fileDiffs.map((file, index) => {
                      const status = formatFileStatus(file.status);
                      return (
                        <div
                          key={index}
                          className={`file-item ${selectedFile === file ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedFile(file);
                            setActiveTab('diff');
                          }}
                        >
                          <div className="file-header">
                            <span className="file-status" style={{ color: status.color }}>
                              {status.icon}
                            </span>
                            <span className="file-path">{file.path}</span>
                          </div>
                          <div className="file-stats">
                            <span className="status-text" style={{ color: status.color }}>
                              {status.text}
                            </span>
                            {file.additions > 0 && (
                              <span className="additions">+{file.additions}</span>
                            )}
                            {file.deletions > 0 && (
                              <span className="deletions">-{file.deletions}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'diff' && selectedFile && (
                <div className="diff-tab">
                  <div className="diff-header">
                    <div className="file-info">
                      <span className="file-name">{selectedFile.path}</span>
                      <span className="diff-stats">
                        +{selectedFile.additions} -{selectedFile.deletions}
                      </span>
                    </div>
                    <div className="diff-controls">
                      <button
                        className={`view-toggle ${diffView === 'split' ? 'active' : ''}`}
                        onClick={() => setDiffView('split')}
                      >
                        Split
                      </button>
                      <button
                        className={`view-toggle ${diffView === 'unified' ? 'active' : ''}`}
                        onClick={() => setDiffView('unified')}
                      >
                        Unified
                      </button>
                    </div>
                  </div>
                  
                  <div className="diff-content">
                    {selectedFile.patch ? (
                      <pre className="diff-patch">{selectedFile.patch}</pre>
                    ) : (
                      <div className="no-diff">
                        <p>No diff content available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="details-tab">
                  {prDetails ? (
                    <>
                      <div className="pr-header">
                        <h4>{prDetails.title}</h4>
                        <span className={`pr-status ${prDetails.status}`}>
                          {prDetails.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="pr-meta">
                        <div className="meta-item">
                          <span className="meta-label">Author:</span>
                          <span className="meta-value">👤 {prDetails.author}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Branch:</span>
                          <span className="meta-value">🌿 {prDetails.branch} → {prDetails.targetBranch}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Created:</span>
                          <span className="meta-value">📅 {formatDate(prDetails.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Updated:</span>
                          <span className="meta-value">🕒 {formatDate(prDetails.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="pr-description">
                        <h5>Description</h5>
                        <div className="description-content">
                          {prDetails.description.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-pr">
                      <div className="no-pr-icon">📝</div>
                      <h4>No PR Generated</h4>
                      <p>Generate a PR to see details and file changes here.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;