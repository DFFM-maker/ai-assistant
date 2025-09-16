// Ollama API service for industrial code generation
export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OllamaResponse {
  response: string;
  done: boolean;
  model: string;
  created_at: string;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateCode(prompt: string, model: string = 'codellama:13b-instruct'): Promise<string> {
    try {
      const request: OllamaRequest = {
        model,
        prompt: `Generate industrial automation code for SysmacStudio Omron PLC:\n\n${prompt}`,
        stream: false,
        temperature: 0.1 // Lower temperature for more deterministic code generation
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error('Failed to generate code. Please check if Ollama is running.');
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Predefined prompts for common PLC programming tasks
  static getCommonPrompts(language: 'it' | 'en' = 'it') {
    const prompts = {
      it: {
        nj5_opcua: "Come configurare OPC UA Server su PLC Omron NJ5-1500 con SysmacStudio? Includi: configurazione hardware, setup comunicazione EtherNet/IP, abilitazione OPC UA Server, configurazione certificati, pubblicazione variabili e test connessione.",
        conveyor_fb: "Crea Function Block in Structured Text per controllo nastro trasportatore con sensori presenza, pulsanti start/stop e gestione emergenza.",
        safety_timer: "Implementa timer di sicurezza con logica fail-safe per arresto di emergenza in Structured Text.",
        motor_control: "Crea controllo motore trifase con soft-start, monitoraggio corrente e protezioni termiche."
      },
      en: {
        nj5_opcua: "How to configure OPC UA Server on Omron NJ5-1500 PLC with SysmacStudio? Include: hardware configuration, EtherNet/IP communication setup, OPC UA Server enabling, certificate configuration, variable publishing and connection testing.",
        conveyor_fb: "Create Function Block in Structured Text for conveyor belt control with presence sensors, start/stop buttons and emergency management.",
        safety_timer: "Implement safety timer with fail-safe logic for emergency stop in Structured Text.",
        motor_control: "Create three-phase motor control with soft-start, current monitoring and thermal protection."
      }
    };
    
    return prompts[language];
  }
}

export { OllamaService };
export default new OllamaService();