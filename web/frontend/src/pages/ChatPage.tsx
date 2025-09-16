import React, { useState, useEffect } from 'react';
import ollamaService from '../services/ollamaService';
import { OllamaService } from '../services/ollamaService';
import i18nService, { Language } from '../i18n';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('codellama:13b-instruct');
  const [language, setLanguage] = useState<Language>(i18nService.getCurrentLanguage());

  useEffect(() => {
    // Load available models
    loadModels();
    
    // Listen for language changes
    const handleLanguageChange = (newLanguage: Language) => {
      setLanguage(newLanguage);
    };
    
    i18nService.addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      i18nService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const loadModels = async () => {
    try {
      const availableModels = await ollamaService.listModels();
      setModels(availableModels);
      
      // Set default model if available
      if (availableModels.length > 0) {
        const preferredModels = ['codellama:13b-instruct', 'magicoder:7b-s-cl', 'deepseek-coder:6.7b'];
        const availablePreferred = preferredModels.find(model => availableModels.includes(model));
        if (availablePreferred) {
          setSelectedModel(availablePreferred);
        } else {
          setSelectedModel(availableModels[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await ollamaService.generateCode(inputText, selectedModel);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `${i18nService.t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommonPrompt = (promptKey: string) => {
    const prompts = OllamaService.getCommonPrompts(language);
    const prompt = (prompts as any)[promptKey];
    if (prompt) {
      setInputText(prompt);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const t = i18nService.getTranslations();

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>{t.chat.title}</h1>
        <div className="chat-controls">
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            <option value="">{t.chat.modelSelect}</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <button onClick={clearChat} className="btn btn-secondary">
            {t.chat.clear}
          </button>
        </div>
      </div>

      <div className="common-prompts">
        <h3>{t.chat.commonPrompts}</h3>
        <div className="prompt-buttons">
          <button onClick={() => handleCommonPrompt('nj5_opcua')} className="btn btn-outline">
            OPC UA NJ5
          </button>
          <button onClick={() => handleCommonPrompt('conveyor_fb')} className="btn btn-outline">
            Conveyor FB
          </button>
          <button onClick={() => handleCommonPrompt('safety_timer')} className="btn btn-outline">
            Safety Timer
          </button>
          <button onClick={() => handleCommonPrompt('motor_control')} className="btn btn-outline">
            Motor Control
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div className="message-header">
              <span className="message-type">
                {message.type === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">
              <pre>{message.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-header">
              <span className="message-type">AI Assistant</span>
            </div>
            <div className="message-content">
              <div className="loading-indicator">{t.common.loading}</div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.chat.placeholder}
          className="chat-textarea"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSendMessage();
            }
          }}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputText.trim()}
          className="btn btn-primary"
        >
          {t.chat.send}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;