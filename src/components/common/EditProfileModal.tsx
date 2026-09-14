import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  User,
  Camera,
  Trash2,
  Building,
  Save,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PROFILE_DEPARTMENT_PRESETS, ProfileCode } from '../../types';

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

interface EditProfileModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen = true, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    currentUser?.avatarUrl || PRESET_AVATARS[0]
  );
  const [department, setDepartment] = useState<string>(
    currentUser?.department || 'IT Team'
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarMode, setAvatarMode] = useState<'presets' | 'upload' | 'url'>('presets');

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setAvatarUrl(currentUser.avatarUrl || PRESET_AVATARS[0]);
      setDepartment(currentUser.department || 'IT Team');
      setCustomUrlInput('');
    }
  }, [currentUser, isOpen]);

  // Defensive: if closed or no user, do not render
  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File Type', 'Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        addToast('success', 'Photo Selected', 'Image preview ready. Click Save Profile to apply.');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      addToast('error', 'Upload Error', 'Could not read the selected image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      addToast('error', 'Missing URL', 'Please enter a valid image URL.');
      return;
    }
    setAvatarUrl(trimmed);
    addToast('success', 'Avatar URL Applied', 'Preview updated. Click Save to finalize.');
    setCustomUrlInput('');
  };

  const handleResetToDefault = () => {
    setAvatarUrl(PRESET_AVATARS[0]);
    addToast('info', 'Reset', 'Reset to default avatar preset.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Name Required', 'Please enter your display name.');
      return;
    }

    updateCurrentUserProfile({
      name: name.trim(),
      avatarUrl: avatarUrl || PRESET_AVATARS[0],
      department,
      updatedAt: new Date().toISOString(),
    });

    addToast('success', 'Profile Updated', 'Your profile picture and details have been saved successfully.');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-[#e2ebd9] bg-[#f8faf6] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/30">
              <Camera className="w-5 h-5 text-[#598327]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#101010]">
                Edit Profile & Profile Picture
              </h3>
              <p className="text-xs text-[#666666]">
                Update your avatar, photo, and account details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          {/* Avatar Preview & Quick Changer */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#8cc540]/50 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-center p-1"
                title="Upload Photo from Device"
              >
                <Camera className="w-5 h-5 mb-0.5 text-[#8cc540]" />
                <span className="text-[10px] font-bold">Change Photo</span>
              </button>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h4 className="text-sm font-black text-[#101010]">
                {name || currentUser.name}
              </h4>
              <p className="text-xs text-[#598327] font-mono font-bold">
                {currentUser.userId}
              </p>
              <p className="text-[11px] text-[#666666]">{currentUser.email}</p>

              <div className="flex flex-wrap gap-2 pt-1.5 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8cc540]/15 text-[#3d591d] border border-[#8cc540]/30 hover:bg-[#8cc540]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#598327]" />
                  <span>{isUploading ? 'Reading image...' : 'Upload from Device'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#666666] hover:text-[#101010] hover:bg-white border border-transparent hover:border-[#e2ebd9] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset to default avatar"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Picture Option Selector Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#101010] uppercase tracking-wider">
                Choose Profile Photo Option
              </label>
              <div className="flex gap-1 bg-[#f0f4ec] p-1 rounded-xl border border-[#e2ebd9]">
                <button
                  type="button"
                  onClick={() => setAvatarMode('presets')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'presets'
                      ? 'bg-white text-[#101010] shadow-xs'
                      : 'text-[#666666] hover:text-[#101010]'
                  }`}
                >
                  Preset Avatars
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'upload'
                      ? 'bg-white text-[#101010] shadow-xs'
                      : 'text-[#666666] hover:text-[#101010]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'url'
                      ? 'bg-white text-[#101010] shadow-xs'
                      : 'text-[#666666] hover:text-[#101010]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            {avatarMode === 'presets' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9] max-h-48 overflow-y-auto">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative rounded-xl overflow-hidden ring-2 transition-all cursor-pointer aspect-square ${
                      avatarUrl === url
                        ? 'ring-[#8cc540] scale-105 shadow-md'
                        : 'ring-transparent opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`preset-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-[#8cc540]/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#101010] drop-shadow-sm font-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Upload File Zone */}
            {avatarMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#8cc540]/60 hover:border-[#8cc540] hover:bg-[#8cc540]/5 rounded-2xl p-6 text-center bg-[#f8faf6] cursor-pointer transition-colors space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#8cc540]/20 text-[#598327] flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#101010]">
                  Click or drag image file here to upload
                </p>
                <p className="text-[10px] text-[#666666]">
                  Supports PNG, JPG, WEBP up to 5MB (stored securely in profile)
                </p>
              </div>
            )}

            {/* Direct Image URL */}
            {avatarMode === 'url' && (
              <div className="space-y-2 bg-[#f8faf6] p-3.5 rounded-2xl border border-[#e2ebd9]">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.example.com/my-photo.jpg"
                      value={customUrlInput || ''}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full bg-white border border-[#e2ebd9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101010] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Name & Department Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                Full Display Name *
              </label>
              <input
                type="text"
                required
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                Department Designation
              </label>
              <select
                value={department || ''}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium cursor-pointer"
              >
                {(['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[]).map((code) => (
                  <optgroup key={code} label={`${code} Profile Presets`}>
                    {(PROFILE_DEPARTMENT_PRESETS[code] || []).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {department &&
                  !Object.values(PROFILE_DEPARTMENT_PRESETS).flat().includes(department) && (
                    <option value={department}>📌 Current: {department}</option>
                  )}
              </select>
            </div>
          </div>
          </div>

          {/* Footer Actions (Pinned) */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#e2ebd9] bg-[#f8faf6] z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:text-[#101010] hover:bg-[#edf3e7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center gap-1.5 shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#101010]" />
              <span>Save Profile & Avatar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
