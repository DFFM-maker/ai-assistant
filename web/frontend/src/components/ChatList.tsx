import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatSession, ChatGroup } from '../types/Chat';
import './ChatList.css';

interface ChatListProps {
  onNewChat: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onNewChat }) => {
  const { sessions, groups, currentSession, switchSession, deleteSession } = useChat();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Filter sessions by selected group
  const filteredSessions = selectedGroupId 
    ? sessions.filter(session => session.groupId === selectedGroupId)
    : sessions;

  // Group sessions by group for display
  const sessionsByGroup = React.useMemo(() => {
    const grouped: Record<string, ChatSession[]> = {};
    
    filteredSessions.forEach(session => {
      if (!grouped[session.groupId]) {
        grouped[session.groupId] = [];
      }
      grouped[session.groupId].push(session);
    });

    // Sort sessions within each group by updatedAt (most recent first)
    Object.keys(grouped).forEach(groupId => {
      grouped[groupId].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });

    return grouped;
  }, [filteredSessions]);

  const handleSessionClick = (session: ChatSession) => {
    switchSession(session.id);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleRenameSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    setNewTitle(session?.title || '');
  };

  const saveRename = async (sessionId: string) => {
    if (newTitle.trim()) {
      try {
        // This would call updateSession from context
        setEditingSessionId(null);
        setNewTitle('');
      } catch (error) {
        console.error('Error renaming session:', error);
      }
    }
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setNewTitle('');
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getGroupById = (groupId: string): ChatGroup | undefined => {
    return groups.find(g => g.id === groupId);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chat Sessions</h3>
        <button className="new-chat-btn" onClick={onNewChat} title="New Chat">
          <span className="icon">+</span>
        </button>
      </div>

      {/* Group Filter */}
      <div className="group-filter">
        <select
          value={selectedGroupId || ''}
          onChange={(e) => setSelectedGroupId(e.target.value || null)}
          className="group-select"
        >
          <option value="">All Groups</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      <div className="sessions-container">
        {Object.keys(sessionsByGroup).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No chat sessions yet</p>
            <button className="create-first-chat" onClick={onNewChat}>
              Create your first chat
            </button>
          </div>
        ) : (
          Object.entries(sessionsByGroup).map(([groupId, groupSessions]) => {
            const group = getGroupById(groupId);
            if (!group || groupSessions.length === 0) return null;

            return (
              <div key={groupId} className="group-section">
                <div className="group-header">
                  <div 
                    className="group-indicator" 
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <span className="group-name">{group.name}</span>
                  <span className="session-count">({groupSessions.length})</span>
                </div>

                <div className="group-sessions">
                  {groupSessions.map(session => (
                    <div
                      key={session.id}
                      className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                      onClick={() => handleSessionClick(session)}
                    >
                      <div className="session-content">
                        {editingSessionId === session.id ? (
                          <div className="session-edit" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(session.id);
                                if (e.key === 'Escape') cancelRename();
                              }}
                              onBlur={() => saveRename(session.id)}
                              autoFocus
                              className="session-title-input"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="session-header">
                              <h4 className="session-title">{session.title}</h4>
                              <div className="session-actions">
                                <button
                                  className="action-btn rename-btn"
                                  onClick={(e) => handleRenameSession(session.id, e)}
                                  title="Rename"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={(e) => handleDeleteSession(session.id, e)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <div className="session-meta">
                              <span className="session-model">{session.model}</span>
                              <span className="session-language">
                                {session.language === 'it' ? '🇮🇹' : '🇬🇧'}
                              </span>
                              <span className="session-time">
                                {formatRelativeTime(new Date(session.updatedAt))}
                              </span>
                            </div>
                            {session.messages.length > 0 && (
                              <div className="session-preview">
                                {session.messages[session.messages.length - 1]?.content.substring(0, 60)}
                                {session.messages[session.messages.length - 1]?.content.length > 60 && '...'}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;