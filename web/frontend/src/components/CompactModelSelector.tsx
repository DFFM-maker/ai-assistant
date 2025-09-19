import React, { useState, useEffect, useRef } from 'react';
import { EnhancedOllamaModel, MODEL_CATEGORIES } from '../services/ollama_models';
import { ollamaService } from '../services/ollamaService';
import './CompactModelSelector.css';

interface CompactModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

const CompactModelSelector: React.FC<CompactModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<(EnhancedOllamaModel & { available: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const selectedModelData = getSelectedModel();

  // Group models by tier for better organization
  const groupedByTier = models.reduce((acc, model) => {
    const tier = MODEL_CATEGORIES[model.categoria]?.tier || 'versatile';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  const tierLabels = {
    fast: 'Fast and cost-efficient',
    versatile: 'Versatile and highly intelligent', 
    powerful: 'Most powerful at complex task'
  };

  return (
    <div className={`compact-model-selector ${className}`} ref={dropdownRef}>
      <button
        className="compact-model-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedModelData ? `${selectedModelData.name} - ${MODEL_CATEGORIES[selectedModelData.categoria]?.description}` : 'Select Model'}
      >
        <span className="model-icon">
          {selectedModelData ? MODEL_CATEGORIES[selectedModelData.categoria]?.icon : '🤖'}
        </span>
        <span className="model-name-compact">
          {selectedModelData?.name || 'Select Model'}
        </span>
        <span className="dropdown-arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="compact-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-title">AI Models</span>
            <button 
              className="refresh-button-compact"
              onClick={loadModels}
              disabled={loading}
              title="Refresh models"
            >
              {loading ? '⟳' : '🔄'}
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state-compact">Loading models...</div>
          ) : (
            <div className="models-list-compact">
              {Object.entries(tierLabels).map(([tier, label]) => {
                const tierModels = groupedByTier[tier] || [];
                if (tierModels.length === 0) return null;

                return (
                  <div key={tier} className="tier-group">
                    <div className="tier-header">
                      <span className="tier-label">{label}</span>
                      <span className="tier-count">({tierModels.length})</span>
                    </div>
                    {tierModels.map((model) => (
                      <div
                        key={model.id}
                        className={`model-option-compact ${
                          model.id === selectedModel ? 'selected' : ''
                        } ${!model.available ? 'unavailable' : ''}`}
                        onClick={() => model.available && handleModelSelect(model.id)}
                      >
                        <div className="model-info-compact">
                          <div className="model-header-compact">
                            <span className="model-icon-small">
                              {MODEL_CATEGORIES[model.categoria]?.icon}
                            </span>
                            <span className="model-name-small">{model.name}</span>
                            <span className={`availability-status-small ${model.available ? 'available' : 'unavailable'}`}>
                              {model.available ? '●' : '○'}
                            </span>
                          </div>
                          {model.size && (
                            <div className="model-size-small">{model.size}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactModelSelector;