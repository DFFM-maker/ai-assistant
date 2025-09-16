import React, { useState, useEffect } from "react";
import i18nService, { Language } from "../i18n";

interface GitSummary {
  branch: string;
  changedFiles: number;
  lastCommit?: string;
  isClean: boolean;
}

const VersionPanel: React.FC = () => {
  const [gitSummary, setGitSummary] = useState<GitSummary | null>(null);
  const [language, setLanguage] = useState<Language>(i18nService.getCurrentLanguage());
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('ai-assistant-theme') as 'light' | 'dark' || 'dark'
  );

  useEffect(() => {
    // Load git summary
    loadGitSummary();
    
    // Listen for language changes
    const handleLanguageChange = (newLanguage: Language) => {
      setLanguage(newLanguage);
    };
    
    i18nService.addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      i18nService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const loadGitSummary = async () => {
    try {
      // Mock git summary - in real implementation, this would call backend API
      const mockSummary: GitSummary = {
        branch: 'main',
        changedFiles: 3,
        lastCommit: 'feat: add React skeleton app',
        isClean: false
      };
      
      setGitSummary(mockSummary);
    } catch (error) {
      console.error('Failed to load git summary:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ai-assistant-theme', newTheme);
    
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Apply theme on component mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = i18nService.getTranslations();

  return (
    <div className="version-panel">
      <div className="panel-header">
        <h3>{t.version.title}</h3>
      </div>
      
      {gitSummary && (
        <div className="git-summary">
          <div className="summary-item">
            <span className="label">Branch:</span>
            <span className="value">{gitSummary.branch}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">{t.version.status}:</span>
            <span className={`value ${gitSummary.isClean ? 'clean' : 'dirty'}`}>
              {gitSummary.isClean ? t.version.noChanges : 
                `${gitSummary.changedFiles} ${t.version.changes}`}
            </span>
          </div>
          
          {gitSummary.lastCommit && (
            <div className="summary-item">
              <span className="label">Last:</span>
              <span className="value commit-message">{gitSummary.lastCommit}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="panel-actions">
        <button className="panel-btn" disabled={gitSummary?.isClean}>
          {t.version.commit}
        </button>
        <button className="panel-btn" disabled={gitSummary?.isClean}>
          {t.version.push}
        </button>
        <button className="panel-btn">
          {t.version.pullRequest}
        </button>
      </div>
      
      <div className="panel-footer">
        <div className="theme-toggle">
          <button onClick={toggleTheme} className="theme-btn" title={t.theme.toggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="theme-label">
            {theme === 'light' ? t.theme.light : t.theme.dark}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VersionPanel;
