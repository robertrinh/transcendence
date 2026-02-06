import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from './profile';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';

interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    display_name?: string;
    avatar_url?: string;
    two_factor_enabled?: boolean; // Add this field
}

interface SettingsProps {
    user: User | null;
    onUserUpdate?: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [show2FASetup, setShow2FASetup] = useState(false); // New state for showing 2FA setup
    const [show2FADisable, setShow2FADisable] = useState(false); // ✅ New state for disable modal
    const [disableCode, setDisableCode] = useState('');

    // ...existing code (profileForm, passwordForm, avatarFile, previewUrl, editingField states)...
    const [profileForm, setProfileForm] = useState({
        display_name: '',
        nickname: '',
        email: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setProfileForm({
                display_name: user.display_name || '',
                nickname: user.nickname || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const updateData: Partial<typeof profileForm> = {};
            if (editingField === 'display_name') {
                updateData.display_name = profileForm.display_name;
            } else if (editingField === 'nickname') {
                updateData.nickname = profileForm.nickname;
            } else if (editingField === 'email') {
                updateData.email = profileForm.email;
            }

            const response = await fetch('/api/users/profile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            
            if (response.ok) {
            showMessage('success', 'Profile updated successfully!');
            setEditingField(null);
            
                // ✅ Update the user with the complete profile data from the response
                if (onUserUpdate && data.profile) {
                    onUserUpdate(data.profile);
                }
                
                // ✅ Update the form with the complete data
                if (data.profile) {
                    setProfileForm({
                        display_name: data.profile.display_name || '',
                        nickname: data.profile.nickname || '',
                        email: data.profile.email || ''
                    });
                }
            } else {
                showMessage('error', data.error || 'Failed to update profile');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            showMessage('error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Password changed successfully!');
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                setEditingField(null);
            } else {
                showMessage('error', data.error || 'Failed to change password');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', avatarFile);

            const response = await fetch('/api/users/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Avatar updated successfully!');
                setAvatarFile(null);
                setPreviewUrl(null);
                if (onUserUpdate && user) {
                    onUserUpdate({ ...user, avatar_url: data.avatar_url });
                }
            } else {
                showMessage('error', data.error || 'Failed to upload avatar');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
                showMessage('error', 'Please select a JPG or PNG image');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'File size must be less than 5MB');
                return;
            }

            setAvatarFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Are you sure you want to delete your avatar?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/profile/avatar', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showMessage('success', 'Avatar deleted successfully!');
                if (onUserUpdate && user) {
                    onUserUpdate({ ...user, avatar_url: undefined });
                }
            } else {
                showMessage('error', 'Failed to delete avatar');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // New handler for disabling 2FA
    const handleDisable2FA = async (e: React.FormEvent) => {
      e.preventDefault();
        
        if (disableCode.length !== 6) {
            showMessage('error', 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: disableCode })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                showMessage('success', '2FA disabled successfully!');
                setShow2FADisable(false);
                setDisableCode('');
                if (onUserUpdate && user) {
                    onUserUpdate({ ...user, two_factor_enabled: false });
                }
        } else {
            showMessage('error', data.error || 'Failed to disable 2FA');
        }
    } catch (error) {
        showMessage('error', 'Network error. Please try again.');
    } finally {
        setLoading(false);
    }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Authentication Required</h2>
                    <p className="text-yellow-700">Please log in to access settings.</p>
                </div>
            </div>
        );
    }

    const avatarUrl = getAvatarUrl(user.avatar_url);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
                </div>
            </div>

            {/* Message Banner */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {message.text}
                        </span>
                    </div>
                </div>
            )}

            {/* ✅ Disable 2FA Modal */}
            {show2FADisable && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h2 className="text-2xl font-bold text-center mb-2 text-red-600">
                            Disable Two-Factor Authentication
                        </h2>

                        <p className="text-gray-600 text-center mb-6">
                            Enter your authenticator code to confirm disabling 2FA
                        </p>

                        <form onSubmit={handleDisable2FA} className="space-y-4">
                            <input
                                type="text"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                autoFocus
                            />

                            <button
                                type="submit"
                                disabled={loading || disableCode.length !== 6}
                                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setShow2FADisable(false);
                                    setDisableCode('');
                                }}
                                className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            >
                                ← Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation - keep existing code */}
                <div className="lg:col-span-1">
                    <nav className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full px-4 py-3 text-left transition-colors border-l-4 ${
                                activeTab === 'profile'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">Profile</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full px-4 py-3 text-left transition-colors border-l-4 ${
                                activeTab === 'security'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="font-medium">Security & Privacy</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Profile Tab - keep existing profile tab code */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar Section */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        {/* <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden relative group">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : user.avatar_url ? (
                                                <img src={avatarUrl || undefined} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-white">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div> */}
                                    </div>
                                    <div className="flex-1">
                                        <label className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors">
                                            Choose New Picture
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        {avatarFile && (
                                            <div className="mt-3">
                                                <p className="text-sm text-gray-600 mb-2">Selected: {avatarFile.name}</p>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={handleAvatarUpload}
                                                        disabled={loading}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                                                    >
                                                        {loading ? 'Uploading...' : 'Upload'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAvatarFile(null);
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {user.avatar_url && !avatarFile && (
                                            <button
                                                onClick={handleDeleteAvatar}
                                                disabled={loading}
                                                className="mt-2 text-red-600 hover:text-red-800 text-sm disabled:opacity-50 transition-colors"
                                            >
                                                Remove Picture
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">JPG Max size 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                </div>
                                
                                {/* Username - Read Only */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                                            <div className="text-gray-900 font-medium">{user.username}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Cannot be changed</div>
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                                            {editingField === 'display_name' ? (
                                                <form onSubmit={handleProfileUpdate} className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={profileForm.display_name}
                                                        onChange={(e) => setProfileForm({...profileForm, display_name: e.target.value})}
                                                        placeholder="Your display name"
                                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50 transition-colors text-sm"
                                                        >
                                                            {loading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingField(null);
                                                                setProfileForm({...profileForm, display_name: user.display_name || ''});
                                                            }}
                                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="text-gray-900">{user.display_name || <span className="text-gray-400 italic">Not set</span>}</div>
                                            )}
                                        </div>
                                        {editingField !== 'display_name' && (
                                            <button
                                                onClick={() => setEditingField('display_name')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Nickname */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Nickname</label>
                                            {editingField === 'nickname' ? (
                                                <form onSubmit={handleProfileUpdate} className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={profileForm.nickname}
                                                        onChange={(e) => setProfileForm({...profileForm, nickname: e.target.value})}
                                                        placeholder="Your nickname"
                                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50 transition-colors text-sm"
                                                        >
                                                            {loading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingField(null);
                                                                setProfileForm({...profileForm, nickname: user.nickname || ''});
                                                            }}
                                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="text-gray-900">{user.nickname || <span className="text-gray-400 italic">Not set</span>}</div>
                                            )}
                                        </div>
                                        {editingField !== 'nickname' && (
                                            <button
                                                onClick={() => setEditingField('nickname')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                                            {editingField === 'email' ? (
                                                <form onSubmit={handleProfileUpdate} className="space-y-2">
                                                    <input
                                                        type="email"
                                                        value={profileForm.email}
                                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                                        placeholder="your.email@example.com"
                                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50 transition-colors text-sm"
                                                        >
                                                            {loading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingField(null);
                                                                setProfileForm({...profileForm, email: user.email || ''});
                                                            }}
                                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="text-gray-900">{user.email || <span className="text-gray-400 italic">Not set</span>}</div>
                                            )}
                                        </div>
                                        {editingField !== 'email' && (
                                            <button
                                                onClick={() => setEditingField('email')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Change Password */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                                    <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                                </div>
                                
                                <div className="p-4">
                                    {editingField === 'password' ? (
                                        <form onSubmit={handlePasswordChange} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.current_password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.new_password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                                    required
                                                    minLength={8}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter new password"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirm_password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
                                                >
                                                    {loading ? 'Changing Password...' : 'Change Password'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingField(null);
                                                        setPasswordForm({
                                                            current_password: '',
                                                            new_password: '',
                                                            confirm_password: ''
                                                        });
                                                    }}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-gray-900 font-medium mb-1">Password</div>
                                                <div className="text-gray-500 text-sm">••••••••••••</div>
                                            </div>
                                            <button
                                                onClick={() => setEditingField('password')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Two-Factor Authentication Section */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                                </div>
                                
                                <div className="p-4">
                                    {user.two_factor_enabled ? (
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-green-100 p-2 rounded-lg">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-gray-900 font-medium">2FA is Enabled</div>
                                                    <div className="text-sm text-gray-600 mt-1">Your account is protected with two-factor authentication</div>
                                                </div>
                                            </div>
                                            {/* ✅ Updated button to show modal */}
                                            <button
                                                onClick={() => setShow2FADisable(true)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                Disable
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {!show2FASetup ? (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-gray-100 p-2 rounded-lg">
                                                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-900 font-medium">2FA is Disabled</div>
                                                            <div className="text-sm text-gray-600 mt-1">Enable 2FA for enhanced account security</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShow2FASetup(true)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                                    >
                                                        Enable
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <TwoFactorSetup 
                                                        onSuccess={() => {
                                                            showMessage('success', '2FA enabled successfully!');
                                                            setShow2FASetup(false);
                                                            if (onUserUpdate && user) {
                                                                onUserUpdate({ ...user, two_factor_enabled: true });
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => setShow2FASetup(false)}
                                                        className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
                                                    >
                                                        ← Cancel Setup
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Security Tips */}
                            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-blue-900 font-semibold mb-2">Security Tips</h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Use a strong, unique password for your account</li>
                                            <li>• Change your password regularly</li>
                                            <li>• Never share your account credentials with anyone</li>
                                            <li>• Enable two-factor authentication for maximum security</li>
                                        </ul>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;