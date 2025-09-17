export interface ChatGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  language: 'it' | 'en';
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  language?: 'it' | 'en';
}

export interface CreateChatRequest {
  title: string;
  model: string;
  language: 'it' | 'en';
  groupId: string;
}

export interface UpdateChatRequest {
  title?: string;
  model?: string;
  language?: 'it' | 'en';
  groupId?: string;
}

export interface ChatContextType {
  sessions: ChatSession[];
  groups: ChatGroup[];
  currentSession: ChatSession | null;
  createSession: (request: CreateChatRequest) => Promise<ChatSession>;
  updateSession: (id: string, request: UpdateChatRequest) => Promise<ChatSession>;
  deleteSession: (id: string) => Promise<void>;
  switchSession: (id: string) => void;
  createGroup: (name: string, color: string, description?: string) => Promise<ChatGroup>;
  updateGroup: (id: string, updates: Partial<ChatGroup>) => Promise<ChatGroup>;
  deleteGroup: (id: string) => Promise<void>;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  loading: boolean;
}