import React, { useState, useEffect } from 'react';
import i18nService, { Language } from '../i18n';

interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  current: string;
  tracking: string | null;
  files: {
    modified: string[];
    created: string[];
    deleted: string[];
    renamed: string[];
    staged: string[];
  };
  isClean: boolean;
}

const VersionPage: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(i18nService.getCurrentLanguage());

  useEffect(() => {
    // Load git status
    loadGitStatus();
    
    // Listen for language changes
    const handleLanguageChange = (newLanguage: Language) => {
      setLanguage(newLanguage);
    };
    
    i18nService.addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      i18nService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const loadGitStatus = async () => {
    setIsLoading(true);
    try {
      // Mock git status for now - in real implementation, this would call a backend API
      // or use simple-git library if running in Node.js environment
      const mockStatus: GitStatus = {
        branch: 'main',
        ahead: 0,
        behind: 0,
        current: 'main',
        tracking: 'origin/main',
        files: {
          modified: ['src/components/ChatPage.tsx', 'src/services/ollamaService.ts'],
          created: ['src/pages/VersionPage.tsx'],
          deleted: [],
          renamed: [],
          staged: []
        },
        isClean: false
      };
      
      setGitStatus(mockStatus);
    } catch (error) {
      console.error('Failed to load git status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || !gitStatus) return;

    setIsLoading(true);
    try {
      // Mock commit operation - in real implementation, this would call backend API
      console.log('Committing with message:', commitMessage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCommitMessage('');
      await loadGitStatus();
      
      alert(i18nService.t('common.success'));
    } catch (error) {
      console.error('Failed to commit:', error);
      alert(`${i18nService.t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    if (!gitStatus) return;

    setIsLoading(true);
    try {
      // Mock push operation - in real implementation, this would call backend API
      console.log('Pushing to remote...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadGitStatus();
      
      alert(i18nService.t('common.success'));
    } catch (error) {
      console.error('Failed to push:', error);
      alert(`${i18nService.t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullRequest = async () => {
    if (!gitStatus) return;

    setIsLoading(true);
    try {
      // Mock pull request creation - in real implementation, this would call GitLab API
      console.log('Creating pull request...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(i18nService.t('common.success'));
    } catch (error) {
      console.error('Failed to create pull request:', error);
      alert(`${i18nService.t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const t = i18nService.getTranslations();

  if (isLoading && !gitStatus) {
    return (
      <div className="version-page">
        <div className="loading-indicator">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="version-page">
      <h1>{t.version.title}</h1>
      
      {gitStatus && (
        <>
          <div className="git-status-card">
            <h2>{t.version.status}</h2>
            <div className="status-info">
              <div className="status-item">
                <strong>Branch:</strong> {gitStatus.branch}
                {gitStatus.tracking && (
                  <span className="tracking-info">
                    → {gitStatus.tracking}
                  </span>
                )}
              </div>
              
              {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
                <div className="status-item">
                  {gitStatus.ahead > 0 && (
                    <span className="ahead">↑ {gitStatus.ahead} ahead</span>
                  )}
                  {gitStatus.behind > 0 && (
                    <span className="behind">↓ {gitStatus.behind} behind</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="file-changes-card">
            <h3>
              {gitStatus.isClean ? t.version.noChanges : 
                `${Object.values(gitStatus.files).flat().length} ${t.version.changes}`}
            </h3>
            
            {!gitStatus.isClean && (
              <div className="file-lists">
                {gitStatus.files.modified.length > 0 && (
                  <div className="file-list">
                    <h4>Modified:</h4>
                    <ul>
                      {gitStatus.files.modified.map(file => (
                        <li key={file} className="file-modified">{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {gitStatus.files.created.length > 0 && (
                  <div className="file-list">
                    <h4>Created:</h4>
                    <ul>
                      {gitStatus.files.created.map(file => (
                        <li key={file} className="file-created">{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {gitStatus.files.deleted.length > 0 && (
                  <div className="file-list">
                    <h4>Deleted:</h4>
                    <ul>
                      {gitStatus.files.deleted.map(file => (
                        <li key={file} className="file-deleted">{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {!gitStatus.isClean && (
            <div className="commit-section">
              <div className="commit-input">
                <label htmlFor="commit-message">{t.version.commitMessage}:</label>
                <textarea
                  id="commit-message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Enter commit message..."
                  rows={3}
                  className="commit-textarea"
                />
              </div>
              
              <button 
                onClick={handleCommit}
                disabled={isLoading || !commitMessage.trim()}
                className="btn btn-primary"
              >
                {isLoading ? t.common.loading : t.version.commit}
              </button>
            </div>
          )}

          <div className="git-actions">
            <button 
              onClick={handlePush}
              disabled={isLoading || gitStatus.ahead === 0}
              className="btn btn-secondary"
            >
              {isLoading ? t.common.loading : t.version.push}
            </button>
            
            <button 
              onClick={handlePullRequest}
              disabled={isLoading}
              className="btn btn-outline"
            >
              {isLoading ? t.common.loading : t.version.pullRequest}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VersionPage;