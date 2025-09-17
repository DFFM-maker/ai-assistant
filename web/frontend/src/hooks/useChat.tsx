import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatSession, ChatGroup, ChatMessage, CreateChatRequest, UpdateChatRequest, ChatContextType } from '../types/Chat';
import { chatStorageService } from '../services/chatStorageService';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize data from localStorage
  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedSessions = chatStorageService.getSessions();
        const storedGroups = chatStorageService.getGroups();
        const currentSessionData = chatStorageService.getCurrentSession();

        setSessions(storedSessions);
        setGroups(storedGroups);
        setCurrentSession(currentSessionData);
      } catch (error) {
        console.error('Error initializing chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const createSession = async (request: CreateChatRequest): Promise<ChatSession> => {
    try {
      const newSession = chatStorageService.createSession(request);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const updateSession = async (id: string, updates: UpdateChatRequest): Promise<ChatSession> => {
    try {
      const updatedSession = chatStorageService.updateSession(id, updates);
      if (!updatedSession) {
        throw new Error('Session not found');
      }

      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));
      
      if (currentSession?.id === id) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };

  const deleteSession = async (id: string): Promise<void> => {
    try {
      const success = chatStorageService.deleteSession(id);
      if (!success) {
        throw new Error('Session not found');
      }

      setSessions(prev => prev.filter(s => s.id !== id));
      
      if (currentSession?.id === id) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  const switchSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSession(session);
      chatStorageService.setCurrentSessionId(id);
    }
  };

  const createGroup = async (name: string, color: string, description?: string): Promise<ChatGroup> => {
    try {
      const newGroup = chatStorageService.createGroup(name, color, description);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const updateGroup = async (id: string, updates: Partial<ChatGroup>): Promise<ChatGroup> => {
    try {
      const updatedGroup = chatStorageService.updateGroup(id, updates);
      if (!updatedGroup) {
        throw new Error('Group not found');
      }

      setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
      return updatedGroup;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const deleteGroup = async (id: string): Promise<void> => {
    try {
      const success = chatStorageService.deleteGroup(id);
      if (!success) {
        throw new Error('Group not found or has existing sessions');
      }

      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const addMessage = (sessionId: string, message: ChatMessage) => {
    const success = chatStorageService.addMessage(sessionId, message);
    if (success) {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, message], updatedAt: new Date() }
          : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: new Date()
        } : null);
      }
    }
  };

  const contextValue: ChatContextType = {
    sessions,
    groups,
    currentSession,
    createSession,
    updateSession,
    deleteSession,
    switchSession,
    createGroup,
    updateGroup,
    deleteGroup,
    addMessage,
    loading,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};