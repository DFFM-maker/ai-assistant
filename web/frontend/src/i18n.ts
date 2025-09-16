// Internationalization support for IT/EN languages
export type Language = 'it' | 'en';

export interface Translations {
  nav: {
    chat: string;
    version: string;
    dashboard: string;
  };
  chat: {
    title: string;
    placeholder: string;
    send: string;
    clear: string;
    modelSelect: string;
    commonPrompts: string;
  };
  version: {
    title: string;
    status: string;
    commit: string;
    push: string;
    pullRequest: string;
    commitMessage: string;
    noChanges: string;
    changes: string;
  };
  theme: {
    light: string;
    dark: string;
    toggle: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
  };
}

const translations: Record<Language, Translations> = {
  it: {
    nav: {
      chat: 'Chat',
      version: 'Versioning',
      dashboard: 'Dashboard'
    },
    chat: {
      title: 'AI Assistant - Generazione Codice Industriale',
      placeholder: 'Inserisci la tua richiesta per generare codice PLC...',
      send: 'Invia',
      clear: 'Pulisci',
      modelSelect: 'Seleziona Modello',
      commonPrompts: 'Prompt Comuni'
    },
    version: {
      title: 'Controllo Versione',
      status: 'Stato Git',
      commit: 'Commit',
      push: 'Push',
      pullRequest: 'Pull Request',
      commitMessage: 'Messaggio di commit',
      noChanges: 'Nessuna modifica',
      changes: 'modifiche'
    },
    theme: {
      light: 'Chiaro',
      dark: 'Scuro',
      toggle: 'Cambia Tema'
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      cancel: 'Annulla',
      confirm: 'Conferma'
    }
  },
  en: {
    nav: {
      chat: 'Chat',
      version: 'Versioning',
      dashboard: 'Dashboard'
    },
    chat: {
      title: 'AI Assistant - Industrial Code Generation',
      placeholder: 'Enter your request to generate PLC code...',
      send: 'Send',
      clear: 'Clear',
      modelSelect: 'Select Model',
      commonPrompts: 'Common Prompts'
    },
    version: {
      title: 'Version Control',
      status: 'Git Status',
      commit: 'Commit',
      push: 'Push',
      pullRequest: 'Pull Request',
      commitMessage: 'Commit message',
      noChanges: 'No changes',
      changes: 'changes'
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      toggle: 'Toggle Theme'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm'
    }
  }
};

class I18nService {
  private currentLanguage: Language = 'it';
  private listeners: Array<(language: Language) => void> = [];

  constructor() {
    // Initialize from localStorage or browser language
    const savedLanguage = localStorage.getItem('ai-assistant-language') as Language;
    if (savedLanguage && (savedLanguage === 'it' || savedLanguage === 'en')) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      this.currentLanguage = browserLang.startsWith('it') ? 'it' : 'en';
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('ai-assistant-language', language);
    this.notifyListeners();
  }

  getTranslations(): Translations {
    return translations[this.currentLanguage];
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  addLanguageChangeListener(callback: (language: Language) => void): void {
    this.listeners.push(callback);
  }

  removeLanguageChangeListener(callback: (language: Language) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

export default new I18nService();