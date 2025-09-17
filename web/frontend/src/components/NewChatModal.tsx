import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { INDUSTRIAL_MODELS } from '../services/ollamaService';
import ModelSelector from './ModelSelector';
import './NewChatModal.css';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (sessionId: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onChatCreated }) => {
  const { groups, createSession } = useChat();
  const [title, setTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama2-chat');
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'en'>('en');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  React.useEffect(() => {
    if (isOpen && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [isOpen, groups, selectedGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedGroupId || isCreating) return;

    setIsCreating(true);
    try {
      const newSession = await createSession({
        title: title.trim(),
        model: selectedModel,
        language: selectedLanguage,
        groupId: selectedGroupId,
      });

      onChatCreated(newSession.id);
      handleClose();
    } catch (error) {
      console.error('Error creating chat session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedModel('llama2-chat');
    setSelectedLanguage('en');
    setSelectedGroupId(groups.length > 0 ? groups[0].id : '');
    onClose();
  };

  const getModelByType = (category: string) => {
    return INDUSTRIAL_MODELS.filter(model => model.category === category);
  };

  const getGroupById = (groupId: string) => {
    return groups.find(g => g.id === groupId);
  };

  if (!isOpen) return null;

  return (
    <div className="new-chat-overlay" onClick={handleClose}>
      <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Chat Session</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label htmlFor="chat-title">Chat Title *</label>
            <input
              id="chat-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your chat"
              className="form-control"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="chat-group">Group *</label>
            <select
              id="chat-group"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {selectedGroupId && (
              <div className="group-preview">
                <div 
                  className="group-color-indicator"
                  style={{ backgroundColor: getGroupById(selectedGroupId)?.color }}
                ></div>
                <span className="group-description">
                  {getGroupById(selectedGroupId)?.description || 'No description'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="chat-language">Language</label>
            <div className="language-selector">
              <button
                type="button"
                className={`language-option ${selectedLanguage === 'en' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('en')}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                className={`language-option ${selectedLanguage === 'it' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('it')}
              >
                🇮🇹 Italiano
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="chat-model">AI Model</label>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              className="new-chat-model-selector"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !selectedGroupId || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;