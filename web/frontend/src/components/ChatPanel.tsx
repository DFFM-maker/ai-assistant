import React, { useState, useRef, useEffect } from 'react';
import { OllamaMessage, ollamaService, INDUSTRIAL_MODELS, IndustrialAIModel } from '../services/ollamaService';
import { getRecommendedModelForQuery } from '../services/ollama_models';
import { useChat } from '../hooks/useChat';
import { ChatMessage as ChatMessageType } from '../types/Chat';
import ModelSelector from './ModelSelector';
import './ChatPanel.css';

interface ChatPanelProps {
  className?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ className = '' }) => {
  const { currentSession, addMessage, updateSession } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama2-chat'); // Default to enhanced model
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'en'>('en');
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from current session and localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ai-assistant-language') as 'it' | 'en';
    if (savedLanguage && (savedLanguage === 'it' || savedLanguage === 'en')) {
      setSelectedLanguage(savedLanguage);
    }

    if (currentSession) {
      setSelectedModel(currentSession.model);
      if (!savedLanguage) {
        setSelectedLanguage(currentSession.language);
      }
    }
  }, [currentSession]);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ai-assistant-language', selectedLanguage);
  }, [selectedLanguage]);

  // Check Ollama connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await ollamaService.checkHealth();
        setIsConnected(health);
        if (health) {
          const models = await ollamaService.getAvailableModels();
          setAvailableModels(models);
        }
      } catch (error) {
        console.error('Error checking Ollama connection:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // FIX UPDATE DEPTH
  // Aggiorna session solo se davvero serve, e non se è già allineata!
  useEffect(() => {
    if (
      currentSession &&
      (
        currentSession.model !== selectedModel ||
        currentSession.language !== selectedLanguage
      )
    ) {
      updateSession(currentSession.id, {
        model: selectedModel,
        language: selectedLanguage,
      });
    }
  }, [selectedModel, selectedLanguage, updateSession, currentSession?.id]);

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isConnected || !currentSession) {
      return;
    }
    let modelToUse = selectedModel;
    if (selectedModel === 'llama2-chat' || selectedModel === 'industrial-ai') {
      const recommendedModel = getRecommendedModelForQuery(inputValue);
      if (recommendedModel) {
        modelToUse = recommendedModel.id;
        setSelectedModel(modelToUse);
      }
    }
    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      model: modelToUse,
      language: selectedLanguage
    };
    addMessage(currentSession.id, userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationMessages: OllamaMessage[] = currentSession.messages
        .slice(-10)
        .map(msg => ({ role: msg.role, content: msg.content }));
      conversationMessages.push({ role: 'user', content: userMessage.content });
      const ollamaModelName = ollamaService.getOllamaModelName(modelToUse);
      const response = await ollamaService.sendMessage(
        ollamaModelName,
        conversationMessages,
        selectedLanguage
      );
      const aiMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(),
        model: modelToUse,
        language: selectedLanguage
      };
      addMessage(currentSession.id, aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'assistant',
        content: selectedLanguage === 'it'
          ? `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
          : `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        model: selectedModel,
        language: selectedLanguage
      };
      addMessage(currentSession.id, errorMessage);
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

  const getIndustrialModel = (modelId: string): IndustrialAIModel | undefined => {
    return INDUSTRIAL_MODELS.find(model => model.id === modelId);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentSession) {
    return (
      <div className={`chat-panel ${className}`}>
        <div className="no-session-state">
          <div className="no-session-icon">💬</div>
          <h3>No Chat Session Selected</h3>
          <p>Select a chat session from the sidebar or create a new one to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-panel ${className}`}>
      {/* Enhanced Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>{currentSession.title}</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-indicator"></span>
            {isConnected
              ? (selectedLanguage === 'it' ? 'Connesso' : 'Connected')
              : (selectedLanguage === 'it' ? 'Disconnesso' : 'Disconnected')
            }
          </div>
        </div>
        <div className="chat-controls">
          <div className="control-group">
            <label>Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'it' | 'en')}
              className="language-selector"
            >
              <option value="en">🇬🇧 English</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>
          </div>
          <div className="control-group model-selector-group">
            <label>AI Model</label>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              className="chat-model-selector"
            />
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {!isConnected && (
          <div className="connection-warning">
            <div className="warning-content">
              <span className="warning-icon">⚠️</span>
              <p>
                {selectedLanguage === 'it'
                  ? '⚠️ Servizio Ollama non disponibile. Verifica che sia in esecuzione su localhost:11434'
                  : '⚠️ Ollama service not available. Make sure it\'s running on localhost:11434'}
              </p>
            </div>
          </div>
        )}
        {currentSession.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h4>
              {selectedLanguage === 'it' ? 'Inizia una conversazione' : 'Start a conversation'}
            </h4>
            <p>
              {selectedLanguage === 'it'
                ? 'Digita un messaggio qui sotto per iniziare a chattare con l\'AI Assistant industriale.'
                : 'Type a message below to start chatting with the industrial AI Assistant.'}
            </p>
          </div>
        ) : (
          currentSession.messages.map((message) => (
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
                  {formatTimestamp(new Date(message.timestamp))}
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
          ))
        )}
        {isLoading && (
          <div className="message loading">
            <div className="message-header">
              <span className="message-role">
                🤖 {getIndustrialModel(selectedModel)?.name || 'AI Assistant'}
              </span>
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