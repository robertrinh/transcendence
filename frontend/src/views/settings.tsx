import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../config/api';
import { getAvatarUrl } from '../components/util/profileUtils';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';
import PrivacyPolicy from './privacy';

interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    display_name?: string;
    avatar_url?: string;
    two_factor_enabled?: boolean;
    is_anonymous?: boolean;
}

interface SettingsProps {
    user: User | null;
    onUserUpdate?: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [show2FADisable, setShow2FADisable] = useState(false);
    const [disableCode, setDisableCode] = useState('');
    const [showAnonymousConfirm, setShowAnonymousConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

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
            const updateData: Partial<typeof profileForm> = {};
            if (editingField === 'display_name') {
                updateData.display_name = profileForm.display_name;
            } else if (editingField === 'nickname') {
                updateData.nickname = profileForm.nickname;
            } else if (editingField === 'email') {
                updateData.email = profileForm.email;
            }

            const response = await fetchWithAuth('/api/users/profile/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Profile updated successfully');
                setEditingField(null);
                if (onUserUpdate) {
                    onUserUpdate({ ...user!, ...updateData });
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
            const response = await fetchWithAuth('/api/users/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Password changed successfully');
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
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
            const formData = new FormData();
            formData.append('file', avatarFile);

            const response = await fetchWithAuth('/api/users/profile/avatar', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Avatar uploaded successfully');
                setAvatarFile(null);
                setPreviewUrl(null);
                if (onUserUpdate) {
                    onUserUpdate({ ...user!, avatar_url: data.avatar_url });
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
        if (!file) return;

        if (file.type !== 'image/jpg') {
            showMessage('error', 'Only JPG files are allowed');
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'File size must be less than 5MB');
            event.target.value = '';
            return;
        }

        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (disableCode.length !== 6) {
            showMessage('error', 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchWithAuth('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: disableCode })
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', '2FA disabled successfully');
                setShow2FADisable(false);
                setDisableCode('');
                if (onUserUpdate) {
                    onUserUpdate({ ...user!, two_factor_enabled: false });
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

const handleAnonymizeProfile = async () => {
    console.log('🔴 handleAnonymizeProfile called'); 
    setLoading(true);
    try {
        console.log('🔴 Sending request to /api/users/anonymize');
        const response = await fetchWithAuth('/api/users/anonymize', { method: 'POST' });

        console.log('🔴 Response status:', response.status); 
        const data = await response.json();
        console.log('🔴 Response data:', data); 
        
        if (response.ok) {
           showMessage('success', 'Profile anonymized successfully. Logging out...');
           if (onUserUpdate) {
                onUserUpdate({ ...user!, is_anonymous: true });
            }
        } else {
            showMessage('error', data.error || 'Failed to anonymize profile');
        }
    } catch (error) {
        console.error('🔴 Error:', error);
        showMessage('error', 'Network error. Please try again.');
    } finally {
        setLoading(false);
        setShowAnonymousConfirm(false);
    }
};

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!deletePassword) {
            showMessage('error', 'Please enter your password to confirm deletion');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchWithAuth('/api/users/me', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword })
            });

            if (response.ok) {
                showMessage('success', 'Account deleted. Redirecting...');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }, 2000);
            } else {
                const data = await response.json();
                showMessage('error', data.error || 'Failed to delete account');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeletePassword('');
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Authentication Required</h2>
                    <p className="text-yellow-700 mb-4">Please log in to access settings.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const avatarUrl = getAvatarUrl(user.avatar_url);

    return (
        <div className="p-6">
            {/* Message Banner */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <PrivacyPolicy isModal lightMode onClose={() => setShowPrivacyModal(false)} />
            )}

            {/* Delete Account Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-red-600 mb-2">!FINAL WARNING!</p>
                            <h2 className="text-2xl font-bold text-red-600 mb-2">Delete Account</h2>
                            <p className="text-gray-600 text-sm">This action is permanent and cannot be undone</p>
                        </div>
                        
                        <div className="bg-red-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-red-900 mb-3">This will permanently:</h3>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Delete your account and all data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Remove all game history</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Clear all profile information</span>
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    If you are still absolutely sure, enter your password to confirm
                                </label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Your password"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || !deletePassword}
                                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Deleting...' : 'Delete Account'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                    }}
                                    disabled={loading}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Anonymous Confirmation Modal */}
            {showAnonymousConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-red-600 mb-2">
                                Anonymize Profile
                            </h2>
                            <p className="text-gray-600 text-sm">This action is permanent and cannot be undone</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">This will:</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Hide your personal information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Permanently restrict chat access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Keep your game statistics</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-red-800 text-sm font-semibold text-center">
                                ⚠️ This cannot be reversed!
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAnonymizeProfile}
                                disabled={loading}
                                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Processing...' : 'Yes, Anonymize'}
                            </button>
                            <button
                                onClick={() => setShowAnonymousConfirm(false)}
                                disabled={loading}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {show2FASetup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Enable Two-Factor Authentication</h2>
                            <button
                                onClick={() => setShow2FASetup(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <TwoFactorSetup 
                            onSuccess={() => {
                                setShow2FASetup(false);
                                showMessage('success', '2FA enabled successfully!');
                                if (onUserUpdate && user) {
                                    onUserUpdate({ ...user, two_factor_enabled: true });
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 2FA Disable Modal */}
            {show2FADisable && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Disable Two-Factor Authentication</h2>
                        <form onSubmit={handleDisable2FA}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter your 6-digit code
                                </label>
                                <input
                                    type="text"
                                    value={disableCode}
                                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || disableCode.length !== 6}
                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShow2FADisable(false);
                                        setDisableCode('');
                                    }}
                                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
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
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                                <span className="font-medium">Security</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`w-full px-4 py-3 text-left transition-colors border-l-4 ${
                                activeTab === 'privacy'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <span className="font-medium">Privacy & Data</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Avatar</h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-2xl font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept=".jpg,image/jpg"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                            <label
                                                htmlFor="avatar-upload"
                                                className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-pointer transition-colors"
                                            >
                                                Choose File
                                            </label>
                                            {avatarFile && (
                                                <button
                                                    onClick={handleAvatarUpload}
                                                    disabled={loading}
                                                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                                >
                                                    {loading ? 'Uploading...' : 'Upload'}
                                                </button>
                                            )}
                                            <p className="text-sm text-gray-500 mt-2">
                                                JPG Max 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Display Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Name
                                        </label>
                                        {editingField === 'display_name' ? (
                                            <form onSubmit={handleProfileUpdate} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={profileForm.display_name}
                                                    onChange={(e) => setProfileForm({...profileForm, display_name: e.target.value})}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingField(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900">{user.display_name || 'Not set'}</span>
                                                <button
                                                    onClick={() => setEditingField('display_name')}
                                                    className="text-blue-500 hover:text-blue-600 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nickname */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nickname
                                        </label>
                                        {editingField === 'nickname' ? (
                                            <form onSubmit={handleProfileUpdate} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={profileForm.nickname}
                                                    onChange={(e) => setProfileForm({...profileForm, nickname: e.target.value})}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingField(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900">{user.nickname || 'Not set'}</span>
                                                <button
                                                    onClick={() => setEditingField('nickname')}
                                                    className="text-blue-500 hover:text-blue-600 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        {editingField === 'email' ? (
                                            <form onSubmit={handleProfileUpdate} className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingField(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900">{user.email || 'Not set'}</span>
                                                <button
                                                    onClick={() => setEditingField('email')}
                                                    className="text-blue-500 hover:text-blue-600 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Username (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-900">{user.username}</span>
                                            <span className="text-xs text-gray-500">Cannot be changed</span>
                                        </div>
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
                                </div>
                                <div className="p-4">
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            {loading ? 'Changing Password...' : 'Change Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <div className="p-4">
                                    {user.two_factor_enabled ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">2FA Enabled</p>
                                                    <p className="text-sm text-gray-600">Your account is protected</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShow2FADisable(true)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Disable
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">2FA Disabled</p>
                                                    <p className="text-sm text-gray-600">Enable for better security</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShow2FASetup(true)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Enable
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                   {/* Privacy Tab */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Privacy policy Ft_transcendence</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        If you want to read the privacy policy,{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowPrivacyModal(true)}
                                            className="text-sm text-blue-600 hover:text-blue-500 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                                        >
                                            click here
                                        </button>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Anonymous Mode</h3>
                                </div>
                                
                                <div className="p-6">
                                    {user.is_anonymous ? (
                                        <div className="space-y-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex gap-3">
                                                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <div>
                                                        <h4 className="text-green-900 font-semibold mb-2">✓ Anonymous Mode Enabled</h4>
                                                        <p className="text-sm text-green-800 leading-relaxed">
                                                            Your profile is now in anonymous mode. Your personal information has been hidden and chat access is permanently restricted.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">Current Status:</h4>
                                                <ul className="space-y-2 text-sm text-gray-700">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-500 font-bold">✓</span>
                                                        <span>Personal information is hidden</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-500 font-bold">✓</span>
                                                        <span>Chat access is permanently restricted</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-500 font-bold">→</span>
                                                        <span>Game statistics are preserved</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-500 font-bold">→</span>
                                                        <span>You can still play games</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-red-800 text-sm text-center font-semibold">
                                                    ⚠️ This action cannot be reversed
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                                <div className="flex gap-3">
                                                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <div>
                                                        <h4 className="text-yellow-900 font-semibold mb-2">Warning: Permanent Action</h4>
                                                        <p className="text-sm text-yellow-800 leading-relaxed">
                                                            Enabling anonymous mode is <strong>permanent and cannot be reversed</strong>. Your profile will be hidden, personal information removed, and chat access will be permanently restricted.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                                <h4 className="font-semibold text-gray-900 mb-3">What happens:</h4>
                                                <ul className="space-y-2 text-sm text-gray-700">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-500 font-bold">✗</span>
                                                        <span>Personal information (email, display name) will be removed</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-500 font-bold">✗</span>
                                                        <span>Chat access will be permanently restricted</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-500 font-bold">✓</span>
                                                        <span>Game statistics will be preserved</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-500 font-bold">✓</span>
                                                        <span>You can still play games</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <button
                                                onClick={() => setShowAnonymousConfirm(true)}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Enable Anonymous Mode
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Delete Account Section */}
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-900">Delete Account</h4>
                                </div>
                                <div className="p-6">
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <p className="text-sm text-red-800 mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p> 
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;