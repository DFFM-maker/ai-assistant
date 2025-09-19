import {
  ENHANCED_OLLAMA_MODELS,
  EnhancedOllamaModel,
  getAvailableModelMapping,
  getRecommendedModelForQuery
} from './ollama_models';

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface OllamaResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface IndustrialAIModel {
  id: string;
  name: string;
  description: string;
  category: 'automation' | 'plc' | 'hmi' | 'general';
  language: 'it' | 'en' | 'both';
}

// Legacy models for backward compatibility
export const INDUSTRIAL_MODELS: IndustrialAIModel[] = [
  {
    id: 'sysmacstudio',
    name: 'SysmacStudio Assistant',
    description: 'Specialized in Omron SysmacStudio programming and configuration',
    category: 'automation',
    language: 'both'
  },
  {
    id: 'rockwell',
    name: 'Rockwell Automation Helper',
    description: 'Expert in Allen-Bradley PLCs and Studio 5000',
    category: 'plc',
    language: 'both'
  },
  {
    id: 'omron',
    name: 'Omron PLC Expert',
    description: 'Specialized in Omron PLC programming and troubleshooting',
    category: 'plc',
    language: 'both'
  },
  {
    id: 'siemens',
    name: 'Siemens TIA Portal Assistant',
    description: 'Expert in Siemens S7 PLCs and TIA Portal',
    category: 'automation',
    language: 'both'
  },
  {
    id: 'hmi-designer',
    name: 'HMI Design Assistant',
    description: 'Specialized in HMI/SCADA design and user interface development',
    category: 'hmi',
    language: 'both'
  },
  {
    id: 'industrial-ai',
    name: 'Industrial AI General',
    description: 'General purpose industrial automation and AI assistant',
    category: 'general',
    language: 'both'
  }
];

// Helper function to get legacy model from enhanced model
export function getIndustrialModel(id: string): IndustrialAIModel | undefined {
  return INDUSTRIAL_MODELS.find(model => model.id === id);
}

export class OllamaService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://192.168.1.250:11434', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Send a prompt to the Ollama API with enhanced timeout handling and diagnostics
   */
  async sendMessage(
    model: string,
    messages: OllamaMessage[],
    language: 'it' | 'en' = 'en',
    options?: OllamaRequest['options']
  ): Promise<OllamaResponse> {
    const startTime = Date.now();
    const controller = new AbortController();
    
    // Enhanced timeout with detailed logging
    const timeoutId = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      console.warn(`⏱️ Request timeout after ${elapsedTime}ms for model: ${model}`);
      console.warn(`📊 Timeout details:`, {
        model,
        timeout: this.timeout,
        baseUrl: this.baseUrl,
        messageCount: messages.length,
        elapsedTime
      });
      controller.abort();
    }, this.timeout);

    try {
      console.log(`🚀 Starting request to model: ${model} (timeout: ${this.timeout}ms)`);
      
      // Add language context to system message if not already present
      const systemMessage = messages.find(m => m.role === 'system');
      const languageContext = language === 'it'
        ? 'Rispondi sempre in italiano. Fornisci spiegazioni dettagliate e tecniche quando necessario.'
        : 'Always respond in English. Provide detailed technical explanations when necessary.';

      const enhancedMessages = systemMessage
        ? messages
        : [{ role: 'system' as const, content: languageContext }, ...messages];

      const requestData: OllamaRequest = {
        model,
        messages: enhancedMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
          ...options
        }
      };

      console.log(`📤 Request payload:`, {
        model,
        messageCount: enhancedMessages.length,
        options: requestData.options,
        url: `${this.baseUrl}/api/chat`
      });

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      const responseTime = Date.now() - startTime;
      console.log(`📥 Response received in ${responseTime}ms for model: ${model}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Ollama API error:`, {
          status: response.status,
          statusText: response.statusText,
          model,
          responseTime,
          errorText
        });
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: OllamaResponse = await response.json();
      console.log(`✅ Request completed successfully:`, {
        model,
        responseTime,
        totalDuration: data.total_duration,
        evalCount: data.eval_count,
        promptEvalCount: data.prompt_eval_count
      });
      
      return data;
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏱️ Request timeout for model ${model} after ${elapsedTime}ms`);
        const suggestedModel = this.getSuggestedModelForTimeout(model);
        const timeoutMessage = language === 'it'
          ? `Timeout del modello ${model} dopo ${elapsedTime}ms. Prova con un modello più veloce: ${suggestedModel}`
          : `Timeout for model ${model} after ${elapsedTime}ms. Try a faster model: ${suggestedModel}`;
        throw new Error(timeoutMessage);
      }
      
      console.error(`❌ Request failed for model ${model}:`, {
        error: error instanceof Error ? error.message : error,
        elapsedTime,
        model,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Suggest a faster model when timeout occurs
   */
  private getSuggestedModelForTimeout(currentModel: string): string {
    // Map to faster alternatives based on current model
    const fasterAlternatives: Record<string, string> = {
      'llama2:13b-chat': 'magicoder:7b-s-cl',
      'deepseek-coder:6.7b': 'magicoder:7b-s-cl',
      'codellama:13b-instruct': 'magicoder:7b-s-cl',
      'mistral:7b-instruct': 'magicoder:7b-s-cl'
    };
    
    return fasterAlternatives[currentModel] || 'magicoder:7b-s-cl';
  }

  /**
   * Check if Ollama service is available with enhanced diagnostics
   */
  async checkHealth(): Promise<boolean> {
    const startTime = Date.now();
    try {
      console.log(`🏥 Checking Ollama health at: ${this.baseUrl}`);
      
      // Use AbortController for timeout instead of timeout option
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      console.log(`🏥 Health check result:`, {
        healthy: isHealthy,
        responseTime,
        status: response.status,
        url: this.baseUrl
      });
      
      return isHealthy;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Health check failed:`, {
        error: error instanceof Error ? error.message : error,
        responseTime,
        url: this.baseUrl
      });
      return false;
    }
  }

  /**
   * Get list of available models with enhanced error handling
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      console.log(`📋 Fetching available models from: ${this.baseUrl}/api/tags`);
      
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        console.error(`❌ Failed to fetch models:`, {
          status: response.status,
          statusText: response.statusText,
          url: this.baseUrl
        });
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      const models = data.models?.map((model: any) => model.name) || [];
      
      console.log(`📋 Available models found:`, {
        count: models.length,
        models: models.slice(0, 5), // Log first 5 models
        total: models.length
      });
      
      return models;
    } catch (error) {
      console.error('❌ Error fetching available models:', error);
      return [];
    }
  }

  /**
   * Diagnostic method to test model availability and performance
   */
  async diagnoseModel(modelName: string): Promise<{
    available: boolean;
    responseTime?: number;
    error?: string;
    suggestion?: string;
  }> {
    try {
      console.log(`🔍 Diagnosing model: ${modelName}`);
      
      const startTime = Date.now();
      const testMessage: OllamaMessage[] = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];
      
      await this.sendMessage(modelName, testMessage, 'en');
      const responseTime = Date.now() - startTime;
      
      return {
        available: true,
        responseTime,
        suggestion: responseTime > 15000 ? 'Consider using a faster model for better performance' : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Model diagnosis failed for ${modelName}:`, errorMessage);
      
      return {
        available: false,
        error: errorMessage,
        suggestion: this.getSuggestedModelForTimeout(modelName)
      };
    }
  }

  /**
   * Generate documentation using AI
   */
  async generateDocumentation(
    code: string,
    documentationType: 'api' | 'user' | 'technical' | 'installation',
    language: 'it' | 'en' = 'en',
    model: string = 'industrial-ai'
  ): Promise<string> {
    const prompts = {
      it: {
        api: 'Genera documentazione API completa in formato Markdown per il seguente codice:',
        user: 'Genera documentazione utente in formato Markdown per il seguente codice:',
        technical: 'Genera documentazione tecnica dettagliata in formato Markdown per il seguente codice:',
        installation: 'Genera guida di installazione e configurazione in formato Markdown per il seguente codice:'
      },
      en: {
        api: 'Generate comprehensive API documentation in Markdown format for the following code:',
        user: 'Generate user documentation in Markdown format for the following code:',
        technical: 'Generate detailed technical documentation in Markdown format for the following code:',
        installation: 'Generate installation and configuration guide in Markdown format for the following code:'
      }
    };

    const prompt = prompts[language][documentationType];
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: language === 'it'
          ? 'Sei un esperto in documentazione tecnica industriale. Genera documentazione chiara, strutturata e professionale in formato Markdown.'
          : 'You are an expert in industrial technical documentation. Generate clear, structured, and professional documentation in Markdown format.'
      },
      {
        role: 'user',
        content: `${prompt}\n\n\`\`\`\n${code}\n\`\`\``
      }
    ];

    const response = await this.sendMessage(model, messages, language);
    return response.message.content;
  }

  /**
   * Get enhanced models with availability status
   */
  async getEnhancedModelsWithAvailability(): Promise<(EnhancedOllamaModel & { available: boolean })[]> {
    try {
      const installedModels = await this.getAvailableModels();

      return ENHANCED_OLLAMA_MODELS.map(model => ({
        ...model,
        available: model.ollama_model_name ? installedModels.includes(model.ollama_model_name) : false
      }));
    } catch (error) {
      console.error('Error fetching enhanced models:', error);
      return ENHANCED_OLLAMA_MODELS.map(model => ({ ...model, available: false }));
    }
  }

  /**
   * Get only available enhanced models
   */
  async getAvailableEnhancedModels(): Promise<EnhancedOllamaModel[]> {
    try {
      const installedModels = await this.getAvailableModels();
      return getAvailableModelMapping(installedModels);
    } catch (error) {
      console.error('Error fetching available enhanced models:', error);
      return [];
    }
  }

  /**
   * Get model recommendations based on query type (enhanced version)
   */
  getRecommendedModelEnhanced(query: string): EnhancedOllamaModel {
    return getRecommendedModelForQuery(query);
  }

  /**
   * Get the actual Ollama model name to use for API calls
   */
  getOllamaModelName(enhancedModelId: string): string {
    const enhancedModel = ENHANCED_OLLAMA_MODELS.find(m => m.id === enhancedModelId);
    if (enhancedModel?.ollama_model_name) {
      return enhancedModel.ollama_model_name;
    }

    // Fallback to legacy mapping or default
    return this.getRecommendedModel(enhancedModelId);
  }

  /**
   * Legacy method for backward compatibility
   */
  getRecommendedModel(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('sysmac') || queryLower.includes('omron')) {
      return 'deepseek-coder:6.7b';
    }
    if (queryLower.includes('rockwell') || queryLower.includes('allen-bradley') || queryLower.includes('studio 5000')) {
      return 'magicoder:7b-s-cl';
    }
    if (queryLower.includes('siemens') || queryLower.includes('tia portal') || queryLower.includes('s7')) {
      return 'deepseek-coder:6.7b';
    }
    if (queryLower.includes('hmi') || queryLower.includes('scada') || queryLower.includes('interface')) {
      return 'llama2:13b-chat';
    }
    if (queryLower.includes('code') || queryLower.includes('programming')) {
      return 'magicoder:7b-s-cl';
    }

    return 'llama2:13b-chat';
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();