import React, { useState, useRef } from 'react';
import { useUserSettings } from '../hooks/useUserSettings';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any; // Current authenticated user data
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, user }) => {
  const { settings, updateAvatar, updateEmail, updateName } = useUserSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [localEmail, setLocalEmail] = useState(settings.email || user?.email || '');
  const [localName, setLocalName] = useState(settings.name || user?.name || '');
  const [isUploading, setIsUploading] = useState(false);

  // Sync local state when settings or user changes
  React.useEffect(() => {
    setLocalEmail(settings.email || user?.email || '');
    setLocalName(settings.name || user?.name || '');
  }, [settings, user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for localStorage storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        setPreviewImage(base64Result);
        updateAvatar(base64Result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveEmail = () => {
    updateEmail(localEmail.trim());
  };

  const handleSaveName = () => {
    updateName(localName.trim());
  };

  const handleRemoveAvatar = () => {
    updateAvatar('');
    setPreviewImage(null);
  };

  const getCurrentAvatar = () => {
    return previewImage || settings.avatar || user?.avatar || '';
  };

  const getCurrentName = () => {
    return settings.name || user?.name || 'User';
  };

  const getCurrentEmail = () => {
    return settings.email || user?.email || '';
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>User Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Profile Section */}
          <div className="section">
            <div className="section-header">
              <h3>👤 Profile</h3>
            </div>

            {/* Avatar Upload */}
            <div className="profile-section">
              <div className="avatar-upload-section">
                <label className="section-label">Profile Picture</label>
                <div className="avatar-upload-container">
                  <div 
                    className="avatar-preview" 
                    onClick={handleAvatarClick}
                    title="Click to change avatar"
                  >
                    {getCurrentAvatar() ? (
                      <img 
                        src={getCurrentAvatar()} 
                        alt="Profile" 
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <span className="avatar-icon">👤</span>
                        <span className="avatar-text">Upload Photo</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="avatar-loading">
                        <span>⏳</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="avatar-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                    >
                      📁 Choose File
                    </button>
                    {getCurrentAvatar() && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                
                <p className="help-text">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {/* Name Field */}
              <div className="form-group">
                <label className="section-label">Display Name</label>
                <div className="input-with-action">
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="text-input"
                    placeholder="Enter your display name"
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveName}
                    disabled={localName.trim() === (settings.name || user?.name || '')}
                  >
                    Save
                  </button>
                </div>
                <p className="help-text">
                  This name will be displayed in the sidebar and throughout the app
                </p>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="section-label">Email Address</label>
                <div className="input-with-action">
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className="text-input"
                    placeholder="Enter your email address"
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveEmail}
                    disabled={localEmail.trim() === (settings.email || user?.email || '')}
                  >
                    Save
                  </button>
                </div>
                <p className="help-text">
                  Email will be used for future notification features
                </p>
              </div>
            </div>
          </div>

          {/* Future Extensions Section */}
          <div className="section">
            <div className="section-header">
              <h3>⚙️ Preferences</h3>
            </div>
            <div className="coming-soon">
              <p>🚧 Additional preferences coming soon...</p>
              <ul className="feature-list">
                <li>• Theme customization</li>
                <li>• Notification settings</li>
                <li>• Language preferences</li>
                <li>• Privacy controls</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;