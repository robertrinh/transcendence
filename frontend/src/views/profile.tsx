import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    display_name?: string;
    avatar_url?: string;
    wins?: number;
    losses?: number;
    total_games?: number;
    winRate?: string;
}

interface ProfileProps {
    user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nickname: '',
        display_name: '',
        email: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Early return for non-authenticated users
    if (!user) {
        return (
            <div className="p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Authentication Required</h2>
                    <p className="text-yellow-700 mb-4">Please log in to view your profile.</p>
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

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                setLoading(false);
                return;
            }
            
            const response = await fetch('/api/users/profile/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfileData(data.profile);
                setFormData({
                    nickname: data.profile.nickname || '',
                    display_name: data.profile.display_name || '',
                    email: data.profile.email || ''
                });
            } else if (response.status === 401) {
                // Token might be expired
                localStorage.removeItem('token');
                alert('Session expired. Please log in again.');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/profile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                await fetchProfile(); // Refresh profile data   
                setEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Network error. Please try again.');
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile || !user) return;

        setUploading(true);
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
                setAvatarFile(null);
                setPreviewUrl(null);
                await fetchProfile(); // Refresh profile to show new avatar
                // alert('Avatar updated successfully!');
            } else {
                alert(data.error || 'Failed to upload avatar');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Network error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
                alert('Please select a JPG image');
                return;
            }
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            setAvatarFile(file);
            
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // Helper function to get avatar URL
    const getAvatarUrl = (avatarPath?: string): string | null => {
        if (!avatarPath) return null;
        
        // Extract filename from path if it contains /uploads/avatars/
        if (avatarPath.includes('/uploads/avatars/')) {
            const filename = avatarPath.split('/').pop();
            return `/api/avatars/${filename}`;
        }
        
        // If it's already just a filename
        if (!avatarPath.includes('/')) {
            return `/api/avatars/${avatarPath}`;
        }
        
        return `/api/avatars/${avatarPath}`;
    };

    // Loading state display
    if (loading && !profileData) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse">
                    <div className="bg-gray-200 h-8 w-48 mx-auto mb-4 rounded"></div>
                    <div className="bg-gray-200 h-20 w-20 mx-auto mb-4 rounded-full"></div>
                    <div className="bg-gray-200 h-4 w-32 mx-auto mb-2 rounded"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading profile...</p>
            </div>
        );
    }

    const displayUser = profileData || user;
    const avatarUrl = getAvatarUrl(displayUser.avatar_url);

    return (
        <div className="p-6">
            {/* Edit button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <button
                    onClick={() => setEditing(!editing)}
                    className={`px-4 py-2 rounded ${editing 
                        ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    {editing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-6">
                    {/* Enhanced avatar with upload functionality */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden relative group">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Avatar Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : displayUser.avatar_url ? (
                                <img 
                                    src={avatarUrl} 
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {displayUser.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                            
                            {/* Upload overlay when editing */}
                            {editing && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer text-white text-xs text-center">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        Change<br/>Photo
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Upload controls when editing and file is selected */}
                        {editing && avatarFile && (
                            <div className="mt-3 text-center">
                                <p className="text-sm text-gray-600 mb-2">Selected: {avatarFile.name}</p>
                                <div className="space-x-2">
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploading}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Avatar'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAvatarFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        {/* Enhanced user info display */}
                        {editing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username (cannot be changed)
                                    </label>
                                    <input
                                        type="text"
                                        value={displayUser.username}
                                        disabled
                                        className="block w-full p-2 border border-gray-300 rounded bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                                        placeholder="Your full name"
                                        className="block w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nickname
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                        placeholder="Choose a unique nickname"
                                        className="block w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="your.email@example.com"
                                        className="block w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {displayUser.display_name || displayUser.username}
                                </h2>
                                {displayUser.nickname && (
                                    <p className="text-lg text-gray-600">@{displayUser.nickname}</p>
                                )}
                                <p className="text-gray-500">Username: {displayUser.username}</p>
                                <p className="text-gray-600">{displayUser.email || 'No email provided'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Game Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="font-medium text-green-700">Wins</span>
                            <span className="text-2xl font-bold text-green-600">{displayUser.wins || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                            <span className="font-medium text-red-700">Losses</span>
                            <span className="text-2xl font-bold text-red-600">{displayUser.losses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="font-medium text-blue-700">Total Games</span>
                            <span className="text-2xl font-bold text-blue-600">{displayUser.total_games || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="font-medium text-purple-700">Win Rate</span>
                            <span className="text-2xl font-bold text-purple-600">{displayUser.winRate || '0%'}</span>
                        </div>
                    </div>
                    {(displayUser.total_games || 0) === 0 && (
                        <div className="mt-4 text-center text-gray-500">
                            <p>No games played yet!</p>
                            <p className="text-sm">Start playing to see your statistics here.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
                    <div className="space-y-3">
                        <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">User ID</span>
                            <p className="font-medium">{displayUser.id}</p>
                        </div>
                        <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">Username</span>
                            <p className="font-medium">{displayUser.username}</p>
                        </div>
                        {displayUser.nickname && (
                            <div className="border-b pb-2">
                                <span className="text-sm text-gray-500">Nickname</span>
                                <p className="font-medium">@{displayUser.nickname}</p>
                            </div>
                        )}
                        <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">Email</span>
                            <p className="font-medium">{displayUser.email || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
