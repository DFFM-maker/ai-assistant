import { ChatSession, ChatGroup, ChatMessage, CreateChatRequest, UpdateChatRequest } from '../types/Chat';

const STORAGE_KEYS = {
  CHAT_SESSIONS: 'ai_assistant_chat_sessions',
  CHAT_GROUPS: 'ai_assistant_chat_groups',
  CURRENT_SESSION: 'ai_assistant_current_session',
} as const;

export class ChatStorageService {
  // Chat Sessions
  getSessions(): ChatSession[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!stored) return [];
    
    try {
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Error parsing chat sessions:', error);
      return [];
    }
  }

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  createSession(request: CreateChatRequest): ChatSession {
    const sessions = this.getSessions();
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: request.title,
      model: request.model,
      language: request.language,
      groupId: request.groupId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    sessions.push(newSession);
    this.saveSessions(sessions);
    return newSession;
  }

  updateSession(id: string, updates: UpdateChatRequest): ChatSession | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) return null;

    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date(),
    };

    sessions[sessionIndex] = updatedSession;
    this.saveSessions(sessions);
    return updatedSession;
  }

  deleteSession(id: string): boolean {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    
    if (filteredSessions.length === sessions.length) return false;
    
    this.saveSessions(filteredSessions);
    
    // Clear current session if it was deleted
    if (this.getCurrentSessionId() === id) {
      this.setCurrentSessionId(null);
    }
    
    return true;
  }

  addMessage(sessionId: string, message: ChatMessage): boolean {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;

    sessions[sessionIndex].messages.push(message);
    sessions[sessionIndex].updatedAt = new Date();
    this.saveSessions(sessions);
    return true;
  }

  // Chat Groups
  getGroups(): ChatGroup[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_GROUPS);
    if (!stored) {
      // Return default groups if none exist
      const defaultGroups = this.createDefaultGroups();
      this.saveGroups(defaultGroups);
      return defaultGroups;
    }
    
    try {
      const groups = JSON.parse(stored);
      return groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
      }));
    } catch (error) {
      console.error('Error parsing chat groups:', error);
      const defaultGroups = this.createDefaultGroups();
      this.saveGroups(defaultGroups);
      return defaultGroups;
    }
  }

  private createDefaultGroups(): ChatGroup[] {
    return [
      {
        id: 'group_general',
        name: 'General',
        color: '#3b82f6',
        description: 'General purpose conversations',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'group_automation',
        name: 'Automation',
        color: '#10b981',
        description: 'Industrial automation and PLC related chats',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'group_documentation',
        name: 'Documentation',
        color: '#f59e0b',
        description: 'Documentation generation and technical writing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  saveGroups(groups: ChatGroup[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving chat groups:', error);
    }
  }

  createGroup(name: string, color: string, description?: string): ChatGroup {
    const groups = this.getGroups();
    const newGroup: ChatGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  }

  updateGroup(id: string, updates: Partial<ChatGroup>): ChatGroup | null {
    const groups = this.getGroups();
    const groupIndex = groups.findIndex(g => g.id === id);
    
    if (groupIndex === -1) return null;

    const updatedGroup = {
      ...groups[groupIndex],
      ...updates,
      updatedAt: new Date(),
    };

    groups[groupIndex] = updatedGroup;
    this.saveGroups(groups);
    return updatedGroup;
  }

  deleteGroup(id: string): boolean {
    const groups = this.getGroups();
    const filteredGroups = groups.filter(g => g.id !== id);
    
    if (filteredGroups.length === groups.length) return false;
    
    // Don't allow deleting if there are sessions using this group
    const sessions = this.getSessions();
    const hasSessionsInGroup = sessions.some(s => s.groupId === id);
    
    if (hasSessionsInGroup) {
      throw new Error('Cannot delete group with existing chat sessions');
    }
    
    this.saveGroups(filteredGroups);
    return true;
  }

  // Current Session Management
  getCurrentSessionId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  setCurrentSessionId(sessionId: string | null): void {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }

  getCurrentSession(): ChatSession | null {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) return null;
    
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // Utility methods
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_GROUPS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  exportData(): string {
    return JSON.stringify({
      sessions: this.getSessions(),
      groups: this.getGroups(),
      currentSessionId: this.getCurrentSessionId(),
    });
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.sessions) this.saveSessions(parsed.sessions);
      if (parsed.groups) this.saveGroups(parsed.groups);
      if (parsed.currentSessionId) this.setCurrentSessionId(parsed.currentSessionId);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatStorageService = new ChatStorageService();