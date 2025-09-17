/**
 * Enhanced Ollama Models Configuration
 * New structure with use-case mapping, categories, and descriptions
 */

export interface EnhancedOllamaModel {
  id: string;
  name: string;
  description: string;
  tags: string[];
  use_case: string[];
  categoria: 'coding' | 'general' | 'automation' | 'plc' | 'hmi' | 'documentation';
  lingua: 'it' | 'en' | 'both';
  ollama_model_name?: string; // Actual ollama model name for mapping
  size?: string; // Model size info
  recommended?: boolean; // Is this a recommended model
}

// Enhanced model definitions with use-case mapping
export const ENHANCED_OLLAMA_MODELS: EnhancedOllamaModel[] = [
  // Coding Models
  {
    id: 'magicoder',
    name: 'Magicoder',
    description: 'Fast and efficient code generation model optimized for programming tasks',
    tags: ['coding', 'fast', 'lightweight'],
    use_case: ['code-generation', 'debugging', 'refactoring', 'api-development'],
    categoria: 'coding',
    lingua: 'both',
    ollama_model_name: 'magicoder:7b-s-cl',
    size: '3.8GB',
    recommended: true
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'Advanced coding model with excellent PLC and automation expertise',
    tags: ['coding', 'plc', 'automation', 'quality'],
    use_case: ['plc-programming', 'automation-scripts', 'system-integration', 'troubleshooting'],
    categoria: 'automation',
    lingua: 'both',
    ollama_model_name: 'deepseek-coder:6.7b',
    size: '3.8GB',
    recommended: true
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    description: 'Meta\'s specialized coding model with strong reasoning capabilities',
    tags: ['coding', 'reasoning', 'complex-logic'],
    use_case: ['complex-algorithms', 'system-design', 'code-review', 'architecture'],
    categoria: 'coding',
    lingua: 'en',
    ollama_model_name: 'codellama:13b-instruct',
    size: '7.4GB'
  },

  // General Models
  {
    id: 'llama2-chat',
    name: 'Llama 2 Chat',
    description: 'General purpose conversational AI with broad knowledge base',
    tags: ['general', 'chat', 'reasoning', 'knowledge'],
    use_case: ['general-questions', 'explanations', 'brainstorming', 'documentation'],
    categoria: 'general',
    lingua: 'both',
    ollama_model_name: 'llama2:13b-chat',
    size: '7.4GB',
    recommended: true
  },
  {
    id: 'mistral-instruct',
    name: 'Mistral Instruct',
    description: 'Balanced model good for both technical and general conversations',
    tags: ['general', 'technical', 'balanced'],
    use_case: ['technical-writing', 'documentation', 'general-qa', 'research'],
    categoria: 'general',
    lingua: 'both',
    ollama_model_name: 'mistral:7b-instruct',
    size: '4.4GB'
  },

  // Automation Specialized Models
  {
    id: 'sysmacstudio-specialist',
    name: 'SysmacStudio Specialist',
    description: 'Specialized in Omron SysmacStudio programming and configuration',
    tags: ['omron', 'sysmacstudio', 'plc', 'automation'],
    use_case: ['omron-programming', 'sysmacstudio-config', 'ladder-logic', 'structured-text'],
    categoria: 'automation',
    lingua: 'both',
    ollama_model_name: 'deepseek-coder:6.7b' // Maps to available model
  },
  {
    id: 'rockwell-expert',
    name: 'Rockwell Expert',
    description: 'Expert in Allen-Bradley PLCs and Studio 5000 development',
    tags: ['rockwell', 'allen-bradley', 'studio5000', 'plc'],
    use_case: ['rockwell-programming', 'studio5000-config', 'rslogix', 'factorytalk'],
    categoria: 'plc',
    lingua: 'both',
    ollama_model_name: 'magicoder:7b-s-cl' // Maps to available model
  },
  {
    id: 'siemens-specialist',
    name: 'Siemens TIA Portal',
    description: 'Specialized in Siemens S7 PLCs and TIA Portal development',
    tags: ['siemens', 'tia-portal', 's7', 'plc'],
    use_case: ['siemens-programming', 'tia-portal-config', 's7-scl', 'step7'],
    categoria: 'automation',
    lingua: 'both',
    ollama_model_name: 'deepseek-coder:6.7b' // Maps to available model
  },

  // HMI Models
  {
    id: 'hmi-designer',
    name: 'HMI Designer',
    description: 'Specialized in HMI/SCADA design and user interface development',
    tags: ['hmi', 'scada', 'ui-design', 'visualization'],
    use_case: ['hmi-development', 'scada-config', 'ui-design', 'data-visualization'],
    categoria: 'hmi',
    lingua: 'both',
    ollama_model_name: 'llama2:13b-chat' // Maps to available model
  },

  // Documentation Models
  {
    id: 'doc-generator',
    name: 'Documentation Generator',
    description: 'Specialized in creating technical documentation and manuals',
    tags: ['documentation', 'technical-writing', 'manuals'],
    use_case: ['api-docs', 'user-manuals', 'technical-specs', 'installation-guides'],
    categoria: 'documentation',
    lingua: 'both',
    ollama_model_name: 'mistral:7b-instruct' // Maps to available model
  }
];

// Helper functions for model management
export function getModelsByCategory(categoria: EnhancedOllamaModel['categoria']): EnhancedOllamaModel[] {
  return ENHANCED_OLLAMA_MODELS.filter(model => model.categoria === categoria);
}

export function getModelsByUseCase(useCase: string): EnhancedOllamaModel[] {
  return ENHANCED_OLLAMA_MODELS.filter(model => 
    model.use_case.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  );
}

export function getRecommendedModels(): EnhancedOllamaModel[] {
  return ENHANCED_OLLAMA_MODELS.filter(model => model.recommended);
}

export function findModelById(id: string): EnhancedOllamaModel | undefined {
  return ENHANCED_OLLAMA_MODELS.find(model => model.id === id);
}

export function getAvailableModelMapping(installedOllamaModels: string[]): EnhancedOllamaModel[] {
  return ENHANCED_OLLAMA_MODELS.filter(model => 
    model.ollama_model_name && installedOllamaModels.includes(model.ollama_model_name)
  );
}

// Auto-selection logic based on query content
export function getRecommendedModelForQuery(query: string): EnhancedOllamaModel {
  const queryLower = query.toLowerCase();
  
  // Coding related keywords
  const codingKeywords = ['code', 'function', 'class', 'variable', 'loop', 'if', 'else', 'debug', 'error', 'syntax', 'programming', 'development'];
  const isCoding = codingKeywords.some(keyword => queryLower.includes(keyword));
  
  // PLC/Automation keywords
  const plcKeywords = ['plc', 'ladder', 'structured text', 'function block', 'omron', 'siemens', 'rockwell', 'allen-bradley', 'automation', 'scada', 'hmi'];
  const isPlc = plcKeywords.some(keyword => queryLower.includes(keyword));
  
  // Specific brand detection
  if (queryLower.includes('omron') || queryLower.includes('sysmac')) {
    return findModelById('sysmacstudio-specialist') || findModelById('deepseek-coder') || findModelById('magicoder') || ENHANCED_OLLAMA_MODELS[0];
  }
  if (queryLower.includes('rockwell') || queryLower.includes('allen-bradley') || queryLower.includes('studio 5000')) {
    return findModelById('rockwell-expert') || findModelById('magicoder') || findModelById('deepseek-coder') || ENHANCED_OLLAMA_MODELS[0];
  }
  if (queryLower.includes('siemens') || queryLower.includes('tia portal')) {
    return findModelById('siemens-specialist') || findModelById('deepseek-coder') || findModelById('magicoder') || ENHANCED_OLLAMA_MODELS[0];
  }
  if (queryLower.includes('hmi') || queryLower.includes('scada')) {
    return findModelById('hmi-designer') || findModelById('llama2-chat') || findModelById('mistral-instruct') || ENHANCED_OLLAMA_MODELS[0];
  }
  
  // General category selection
  if (isPlc || isCoding) {
    return findModelById('deepseek-coder') || findModelById('magicoder') || findModelById('llama2-chat') || ENHANCED_OLLAMA_MODELS[0];
  }
  
  // Default to general conversation model
  return findModelById('llama2-chat') || findModelById('mistral-instruct') || ENHANCED_OLLAMA_MODELS[0];
}

// Categories for UI grouping
export const MODEL_CATEGORIES = {
  coding: {
    label: 'Coding & Development',
    icon: '💻',
    description: 'Models specialized in code generation and programming'
  },
  general: {
    label: 'General Purpose',
    icon: '🤖',
    description: 'Versatile models for general conversations and tasks'
  },
  automation: {
    label: 'Industrial Automation',
    icon: '🏭',
    description: 'Specialized in industrial automation and control systems'
  },
  plc: {
    label: 'PLC Programming',
    icon: '⚙️',
    description: 'Expert in PLC programming and configuration'
  },
  hmi: {
    label: 'HMI & SCADA',
    icon: '📊',
    description: 'Human-Machine Interface and SCADA development'
  },
  documentation: {
    label: 'Documentation',
    icon: '📚',
    description: 'Technical writing and documentation generation'
  }
};