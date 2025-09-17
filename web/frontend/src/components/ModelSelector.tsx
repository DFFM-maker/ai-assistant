import React, { useState, useEffect, useRef } from 'react';
import { EnhancedOllamaModel, MODEL_CATEGORIES } from '../services/ollama_models';
import { ollamaService } from '../services/ollamaService';
import './ModelSelector.css';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
  showAvailabilityStatus?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className = '',
  showAvailabilityStatus = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<(EnhancedOllamaModel & { available: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const modelsWithAvailability = await ollamaService.getEnhancedModelsWithAvailability();
      setModels(modelsWithAvailability);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedModel = () => {
    return models.find(m => m.id === selectedModel) || models[0];
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedModels = Object.entries(MODEL_CATEGORIES).reduce((acc, [category, categoryInfo]) => {
    const categoryModels = filteredModels.filter(m => m.categoria === category);
    if (categoryModels.length > 0) {
      acc[category] = { info: categoryInfo, models: categoryModels };
    }
    return acc;
  }, {} as Record<string, { info: typeof MODEL_CATEGORIES[keyof typeof MODEL_CATEGORIES], models: typeof filteredModels }>);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedModelData = getSelectedModel();

  return (
    <div className={`model-selector ${className}`} ref={dropdownRef}>
      <div 
        className="model-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-model">
          <div className="model-info">
            <span className="model-name">{selectedModelData?.name || 'Select Model'}</span>
            {selectedModelData && (
              <span className="model-category">
                {MODEL_CATEGORIES[selectedModelData.categoria]?.icon} {MODEL_CATEGORIES[selectedModelData.categoria]?.label}
              </span>
            )}
          </div>
          {showAvailabilityStatus && selectedModelData && (
            <div className={`availability-status ${selectedModelData.available ? 'available' : 'unavailable'}`}>
              {selectedModelData.available ? '✅' : '❌'}
            </div>
          )}
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </div>

      {isOpen && (
        <div className="model-dropdown">
          <div className="dropdown-header">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="model-search"
              />
              <span className="search-icon">🔍</span>
            </div>
            {!loading && (
              <button 
                className="refresh-button"
                onClick={loadModels}
                title="Refresh model availability"
              >
                🔄
              </button>
            )}
          </div>

          <div className="models-list">
            {loading ? (
              <div className="loading-state">
                <span>⏳ Loading models...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="no-results">
                <span>No models found</span>
              </div>
            ) : (
              Object.entries(groupedModels).map(([category, { info, models: categoryModels }]) => (
                <div key={category} className="model-category">
                  <div className="category-header">
                    <span className="category-icon">{info.icon}</span>
                    <span className="category-label">{info.label}</span>
                    <span className="category-count">({categoryModels.length})</span>
                  </div>
                  
                  {categoryModels.map(model => (
                    <div
                      key={model.id}
                      className={`model-option ${model.id === selectedModel ? 'selected' : ''} ${!model.available ? 'unavailable' : ''}`}
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <div className="model-option-main">
                        <div className="model-option-header">
                          <span className="model-option-name">{model.name}</span>
                          <div className="model-badges">
                            {model.recommended && <span className="badge recommended">⭐ Recommended</span>}
                            {showAvailabilityStatus && (
                              <span className={`badge availability ${model.available ? 'available' : 'unavailable'}`}>
                                {model.available ? '✅ Available' : '❌ Not Installed'}
                              </span>
                            )}
                            {model.size && <span className="badge size">{model.size}</span>}
                          </div>
                        </div>
                        <p className="model-description">{model.description}</p>
                        
                        {!model.available && model.ollama_model_name && (
                          <div className="install-suggestion">
                            <span className="install-text">Install with: </span>
                            <code className="install-command">ollama pull {model.ollama_model_name}</code>
                          </div>
                        )}
                        
                        <div className="model-tags">
                          {model.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;