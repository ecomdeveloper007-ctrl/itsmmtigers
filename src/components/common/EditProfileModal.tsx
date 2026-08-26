import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  User,
  Sparkles,
  Camera,
  Trash2,
  Lock,
  Building,
  Save,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File Type', 'Please upload a valid image (PNG, JPG, WEBP).');
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
        addToast('success', 'Profile Photo Uploaded', 'Your custom photo preview is ready.');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      addToast('error', 'Upload Failed', 'Could not process the selected image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      addToast('error', 'Missing URL', 'Please enter a valid image URL.');
      return;
    }
    setAvatarUrl(customUrlInput.trim());
    addToast('success', 'Avatar URL Applied');
    setCustomUrlInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Name Required', 'Please enter your name.');
      return;
    }

    updateCurrentUserProfile({
      name: name.trim(),
      avatarUrl: avatarUrl || PRESET_AVATARS[0],
      department,
      updatedAt: new Date().toISOString(),
    });

    addToast('success', 'Profile Updated', 'Your profile and avatar have been saved successfully.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Profile & Avatar</h3>
              <p className="text-xs text-slate-400">Update your photo and profile details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Avatar Preview & Quick Changer */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-orange-500/40 shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-center p-1"
              >
                <Camera className="w-5 h-5 mb-0.5 text-orange-400" />
                <span className="text-[10px] font-bold">Change Photo</span>
              </button>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h4 className="text-sm font-bold text-white">{name || currentUser.name}</h4>
              <p className="text-xs text-orange-400 font-mono font-semibold">{currentUser.userId}</p>
              <p className="text-[11px] text-slate-400">{currentUser.email}</p>

              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Processing...' : 'Upload Device Image'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Source Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Choose Profile Picture Option
              </label>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAvatarMode('presets')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'presets'
                      ? 'bg-orange-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'upload'
                      ? 'bg-orange-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarMode === 'url'
                      ? 'bg-orange-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {avatarMode === 'presets' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative rounded-xl overflow-hidden ring-2 transition-all cursor-pointer aspect-square ${
                      avatarUrl === url ? 'ring-orange-500 scale-105 shadow-md' : 'ring-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-orange-400 drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {avatarMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl p-6 text-center bg-slate-950 cursor-pointer transition-colors space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">Click or drag image file here to upload</p>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}

            {avatarMode === 'url' && (
              <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="IT Team">💻 IT Team</option>
                <option value="SMM Team">📱 SMM Team</option>
                <option value="Operations">⚙️ Operations</option>
                <option value="Leadership & Ops">👑 Leadership & Ops</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Avatar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
