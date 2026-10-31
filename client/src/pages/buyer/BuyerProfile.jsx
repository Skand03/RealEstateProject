import { useState, useRef } from 'react';
import { Camera, User, Lock, Save } from 'lucide-react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../features/auth/authSlice';
import { authService } from '../../services/auth.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BuyerProfile = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const fileInputRef = useRef(null);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('fullName', profileForm.fullName.trim());
      if (profileForm.phone) fd.append('phone', profileForm.phone.trim());
      if (avatarFile) fd.append('avatar', avatarFile);

      const result = await dispatch(updateProfile(fd));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        toast.error(result.payload || 'Failed to update profile.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const currentAvatar = avatarPreview || user?.avatar;
  const initials = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="page-container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-heading">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and password.</p>
      </div>

      {/* Profile Info Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                  <span className="text-primary-700 text-2xl font-bold">{initials}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF. Max 5 MB.</p>
              {avatarFile && (
                <p className="text-xs text-primary-600 mt-1">
                  New file selected: {avatarFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="input-field"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="label" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className="input-field"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={savingProfile}>
              {savingProfile ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-5">
          <div>
            <label className="label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="input-field"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              className="input-field"
              value={passwordForm.confirmNewPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))
              }
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={savingPassword}>
              {savingPassword ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {savingPassword ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerProfile;
