import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import i18nService, { Language } from "../i18n";

const Sidebar: React.FC = () => {
  const [language, setLanguage] = useState<Language>(i18nService.getCurrentLanguage());
  const location = useLocation();

  useEffect(() => {
    const handleLanguageChange = (newLanguage: Language) => {
      setLanguage(newLanguage);
    };
    
    i18nService.addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      i18nService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const t = i18nService.getTranslations();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>AI Assistant</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link 
              to="/chat" 
              className={location.pathname === '/chat' ? 'active' : ''}
            >
              {t.nav.chat}
            </Link>
          </li>
          <li>
            <Link 
              to="/version" 
              className={location.pathname === '/version' ? 'active' : ''}
            >
              {t.nav.version}
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="language-switcher">
          <button 
            onClick={() => i18nService.setLanguage('it')}
            className={language === 'it' ? 'active' : ''}
          >
            IT
          </button>
          <button 
            onClick={() => i18nService.setLanguage('en')}
            className={language === 'en' ? 'active' : ''}
          >
            EN
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

