import React, { useState, useRef, useEffect } from 'react';
import { OllamaMessage, ollamaService, INDUSTRIAL_MODELS, IndustrialAIModel } from '../services/ollamaService';
import { getRecommendedModelForQuery, ENHANCED_OLLAMA_MODELS } from '../services/ollama_models';
import { useChat } from '../hooks/useChat';
import { ChatMessage as ChatMessageType } from '../types/Chat';
import CompactModelSelector from './CompactModelSelector';
import SidePanel from './SidePanel';
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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [latestGeneratedCode, setLatestGeneratedCode] = useState<string | null>(null);
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

  // Function to detect code blocks in text
  const detectCodeBlocks = (text: string): boolean => {
    // Check for code block patterns: ```code```, `inline code`, or common programming keywords
    const codeBlockPatterns = [
      /```[\s\S]*?```/g,  // Multi-line code blocks
      /`[^`\n]+`/g,       // Inline code blocks
      /\b(function|class|def|import|export|const|let|var|if|for|while|return)\b/gi, // Programming keywords
      /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/gi, // SQL keywords
      /\b(public|private|static|void|int|string|boolean|float|double)\b/gi, // Common data types
      /<[^>]+>/g,         // HTML/XML tags
      /\{[\s\S]*?\}/g,    // JSON-like objects
      /\(\s*\)\s*=>/g,    // Arrow functions
      /\#include|import\s+|from\s+/gi, // Include/import statements
    ];
    
    return codeBlockPatterns.some(pattern => pattern.test(text));
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
      
      // Auto-open side panel if the response contains code
      if (detectCodeBlocks(response.message.content)) {
        setLatestGeneratedCode(response.message.content);
        setTimeout(() => {
          setIsSidePanelOpen(true);
        }, 500); // Small delay to let the message render first
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorContent: string;
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
          // Get current model info for speed recommendations
          const currentModel = ENHANCED_OLLAMA_MODELS.find(m => m.ollama_model_name === selectedModel);
          const fasterModels = ENHANCED_OLLAMA_MODELS.filter(m => 
            m.recommended && 
            m.ollama_model_name !== selectedModel &&
            (m.size === '3.8GB' || m.size === '4.4GB') // Smaller, faster models
          );
          
          const modelSuggestion = fasterModels.length > 0 
            ? fasterModels.map(m => m.name).join(', ')
            : 'Magicoder, DeepSeek Coder';
            
          errorContent = selectedLanguage === 'it'
            ? `⏱️ Timeout: Il modello ${currentModel?.name || selectedModel} ha impiegato troppo tempo per rispondere.\n\n💡 Suggerimento: Prova un modello più veloce come ${modelSuggestion} oppure riduci la complessità della richiesta.`
            : `⏱️ Timeout: The ${currentModel?.name || selectedModel} model took too long to respond.\n\n💡 Suggestion: Try a faster model like ${modelSuggestion} or simplify your request.`;
        } else if (error.message.includes('ERR_NAME_NOT_RESOLVED') || error.message.includes('404')) {
          errorContent = selectedLanguage === 'it'
            ? '🔌 Errore di connessione: Impossibile raggiungere il servizio Ollama. Verifica che sia in esecuzione su localhost:11434'
            : '🔌 Connection Error: Unable to reach Ollama service. Make sure it\'s running on localhost:11434';
        } else if (error.message.includes('fetch')) {
          errorContent = selectedLanguage === 'it'
            ? '🌐 Errore di rete: Problema di connessione al servizio AI. Controlla la connessione internet.'
            : '🌐 Network Error: Connection problem with AI service. Check your internet connection.';
        } else {
          errorContent = selectedLanguage === 'it'
            ? `❌ Errore: ${error.message}`
            : `❌ Error: ${error.message}`;
        }
      } else {
        errorContent = selectedLanguage === 'it'
          ? '❌ Errore sconosciuto durante l\'invio del messaggio'
          : '❌ Unknown error occurred while sending message';
      }
      
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'assistant',
        content: errorContent,
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
    <>
      <div className={`chat-panel ${className} ${isSidePanelOpen ? 'side-panel-open' : ''}`}>
        {/* Simplified Header - Removed Model Selector */}
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
            <div className="input-actions">
              <CompactModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                className="input-model-selector"
              />
              <button
                type="submit"
                className="send-button"
                disabled={!inputValue.trim() || isLoading || !isConnected}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Side Panel for Version Control */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onToggle={() => setIsSidePanelOpen(!isSidePanelOpen)}
        prDetails={{
          title: "Frontend Refactoring PR",
          description: "Miglioramento dropdown modelli AI, rimozione barra superiore, implementazione chat stile Copilot, gestione errori migliorata, e aggiunta SidePanel per versioning.",
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
          author: "AI Assistant",
          branch: "copilot/frontend-refactoring",
          targetBranch: "main"
        }}
        fileDiffs={[
          // Add generated code as the first item if available
          ...(latestGeneratedCode ? [{
            path: "generated-code.txt",
            status: "added" as const,
            additions: latestGeneratedCode.split('\n').length,
            deletions: 0,
            patch: latestGeneratedCode
          }] : []),
          {
            path: "web/frontend/src/components/ModelSelector.css",
            status: "modified" as const,
            additions: 15,
            deletions: 8,
            patch: "Enhanced model selector sizing and readability improvements"
          },
          {
            path: "web/frontend/src/components/ChatPanel.css",
            status: "modified" as const,
            additions: 25,
            deletions: 12,
            patch: "Copilot-style layout improvements with fixed input form"
          },
          {
            path: "web/frontend/src/components/SidePanel.tsx",
            status: "added" as const,
            additions: 280,
            deletions: 0,
            patch: "New side panel component for PR and diff viewing"
          },
          {
            path: "web/frontend/src/components/Layout.tsx",
            status: "modified" as const,
            additions: 2,
            deletions: 5,
            patch: "Removed header component from layout"
          },
          {
            path: "web/frontend/public/favicon.svg",
            status: "added" as const,
            additions: 20,
            deletions: 0,
            patch: "Added AI-themed SVG favicon"
          }
        ]}
      />
    </>
  );
};

export default ChatPanel;