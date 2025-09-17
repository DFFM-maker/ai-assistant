import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatGroup } from '../types/Chat';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { groups, createGroup, updateGroup, deleteGroup } = useChat();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const predefinedColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
  ];

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await createGroup(newGroupName.trim(), newGroupColor, newGroupDescription.trim() || undefined);
      setNewGroupName('');
      setNewGroupColor('#3b82f6');
      setNewGroupDescription('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleUpdateGroup = async (group: ChatGroup) => {
    try {
      await updateGroup(group.id, {
        name: group.name,
        color: group.color,
        description: group.description,
      });
      setEditingGroupId(null);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      try {
        await deleteGroup(groupId);
      } catch (error) {
        alert('Cannot delete group: ' + (error as Error).message);
      }
    }
  };

  const startEditing = (group: ChatGroup) => {
    setEditingGroupId(group.id);
  };

  const cancelEditing = () => {
    setEditingGroupId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Chat Groups Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Create New Group */}
          <div className="section">
            <div className="section-header">
              <h3>Create New Group</h3>
              <button
                className={`toggle-btn ${isCreating ? 'active' : ''}`}
                onClick={() => setIsCreating(!isCreating)}
              >
                {isCreating ? '✕' : '+'}
              </button>
            </div>

            {isCreating && (
              <div className="create-group-form">
                <div className="form-row">
                  <label>Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <label>Color</label>
                  <div className="color-picker">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${newGroupColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewGroupColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter description"
                    className="form-input"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                  >
                    Create Group
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Groups */}
          <div className="section">
            <h3>Existing Groups ({groups.length})</h3>
            
            <div className="groups-list">
              {groups.map(group => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isEditing={editingGroupId === group.id}
                  onEdit={() => startEditing(group)}
                  onSave={(updatedGroup) => handleUpdateGroup(updatedGroup)}
                  onCancel={cancelEditing}
                  onDelete={() => handleDeleteGroup(group.id, group.name)}
                  predefinedColors={predefinedColors}
                />
              ))}
            </div>

            {groups.length === 0 && (
              <div className="empty-groups">
                <p>No groups created yet. Create your first group above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface GroupItemProps {
  group: ChatGroup;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (group: ChatGroup) => void;
  onCancel: () => void;
  onDelete: () => void;
  predefinedColors: string[];
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  predefinedColors
}) => {
  const [editedGroup, setEditedGroup] = useState<ChatGroup>(group);

  React.useEffect(() => {
    setEditedGroup(group);
  }, [group]);

  const handleSave = () => {
    onSave(editedGroup);
  };

  if (isEditing) {
    return (
      <div className="group-item editing">
        <div className="group-edit-form">
          <div className="form-row">
            <label>Name</label>
            <input
              type="text"
              value={editedGroup.name}
              onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label>Color</label>
            <div className="color-picker">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  className={`color-option ${editedGroup.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditedGroup({ ...editedGroup, color })}
                />
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <input
              type="text"
              value={editedGroup.description || ''}
              onChange={(e) => setEditedGroup({ ...editedGroup, description: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="group-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-item">
      <div className="group-info">
        <div className="group-color" style={{ backgroundColor: group.color }}></div>
        <div className="group-details">
          <h4 className="group-name">{group.name}</h4>
          {group.description && (
            <p className="group-description">{group.description}</p>
          )}
          <div className="group-meta">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="group-actions">
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default Settings;