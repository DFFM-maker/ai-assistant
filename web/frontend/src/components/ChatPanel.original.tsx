import React, { useState, useRef, useEffect } from 'react';
import { OllamaMessage, ollamaService, INDUSTRIAL_MODELS, IndustrialAIModel } from '../services/ollamaService';
import './ChatPanel.css';

interface ChatMessage extends OllamaMessage {
  id: string;
  timestamp: Date;
  model?: string;
  language?: 'it' | 'en';
}

interface ChatPanelProps {
  className?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('industrial-ai');
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'en'>('en');
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check Ollama connection on mount
  useEffect(() => {
    checkConnection();
    loadAvailableModels();
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkConnection = async () => {
    try {
      const healthy = await ollamaService.checkHealth();
      setIsConnected(healthy);
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setIsConnected(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const models = await ollamaService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading available models:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || !isConnected) {
      return;
    }

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      model: selectedModel,
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationMessages: OllamaMessage[] = messages
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      conversationMessages.push({ role: 'user', content: userMessage.content });

      // Send to Ollama
      const response = await ollamaService.sendMessage(
        selectedModel,
        conversationMessages,
        selectedLanguage
      );

      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(),
        model: selectedModel,
        language: selectedLanguage
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: selectedLanguage === 'it' 
          ? `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
          : `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        model: selectedModel,
        language: selectedLanguage
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const generateDocumentation = async (type: 'api' | 'user' | 'technical' | 'installation') => {
    if (!isConnected) return;

    const prompt = selectedLanguage === 'it' 
      ? `Genera documentazione ${type} per il sistema AI Assistant industriale.`
      : `Generate ${type} documentation for the industrial AI Assistant system.`;

    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const getIndustrialModel = (modelId: string): IndustrialAIModel | undefined => {
    return INDUSTRIAL_MODELS.find(model => model.id === modelId);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-panel ${className}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>AI Industrial Assistant</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-indicator"></span>
            {isConnected 
              ? (selectedLanguage === 'it' ? 'Connesso' : 'Connected')
              : (selectedLanguage === 'it' ? 'Disconnesso' : 'Disconnected')
            }
          </div>
        </div>

        <div className="chat-controls">
          {/* Language Selector */}
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value as 'it' | 'en')}
            className="language-selector"
          >
            <option value="en">🇬🇧 English</option>
            <option value="it">🇮🇹 Italiano</option>
          </select>

          {/* Model Selector */}
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-selector"
          >
            {INDUSTRIAL_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>

          {/* Clear Chat Button */}
          <button 
            onClick={clearChat} 
            className="clear-button"
            disabled={messages.length === 0}
          >
            {selectedLanguage === 'it' ? 'Pulisci' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Documentation Generation Shortcuts */}
      <div className="documentation-shortcuts">
        <span className="shortcuts-label">
          {selectedLanguage === 'it' ? 'Genera documentazione:' : 'Generate documentation:'}
        </span>
        <button onClick={() => generateDocumentation('api')} className="doc-shortcut">API</button>
        <button onClick={() => generateDocumentation('user')} className="doc-shortcut">
          {selectedLanguage === 'it' ? 'Utente' : 'User'}
        </button>
        <button onClick={() => generateDocumentation('technical')} className="doc-shortcut">
          {selectedLanguage === 'it' ? 'Tecnica' : 'Technical'}
        </button>
        <button onClick={() => generateDocumentation('installation')} className="doc-shortcut">
          {selectedLanguage === 'it' ? 'Installazione' : 'Installation'}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h4>{selectedLanguage === 'it' ? 'Assistente AI Industriale' : 'Industrial AI Assistant'}</h4>
            <p>
              {selectedLanguage === 'it' 
                ? 'Chiedi qualsiasi cosa sui sistemi di automazione industriale, PLC, HMI e molto altro.'
                : 'Ask anything about industrial automation systems, PLCs, HMIs, and more.'}
            </p>
            {!isConnected && (
              <div className="connection-warning">
                <p>
                  {selectedLanguage === 'it' 
                    ? '⚠️ Servizio Ollama non disponibile. Verifica che sia in esecuzione su localhost:11434'
                    : '⚠️ Ollama service not available. Make sure it\'s running on localhost:11434'}
                </p>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-header">
              <span className="message-role">
                {message.role === 'user' ? '👤' : '🤖'} 
                {message.role === 'user' 
                  ? (selectedLanguage === 'it' ? 'Tu' : 'You')
                  : getIndustrialModel(message.model || '')?.name || 'AI Assistant'
                }
              </span>
              <span className="message-timestamp">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className="message-content">
              {message.content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="message-header">
              <span className="message-role">🤖 AI Assistant</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedLanguage === 'it' 
                ? 'Scrivi il tuo messaggio... (Enter per inviare, Shift+Enter per nuova riga)'
                : 'Type your message... (Enter to send, Shift+Enter for new line)'
            }
            className="chat-input"
            rows={1}
            disabled={!isConnected}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading || !isConnected}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;