import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    username: string;
    nickname?: string;
    display_name?: string;
    avatar_url?: string;
    wins?: number;
    losses?: number;
    total_games?: number;
    winRate?: string;
    is_anonymous?: boolean;
    anonymized_at?: string;
}

interface UserProfileProps {
    username: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/profile/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfileData(data.profile);
            } else if (response.status === 404) {
                alert('User not found');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (avatarPath?: string): string | undefined => {
        if (!avatarPath) return undefined;
        
        if (avatarPath.includes('/uploads/avatars/')) {
            const filename = avatarPath.split('/').pop();
            return `/api/avatars/${filename}`;
        }
        
        if (!avatarPath.includes('/')) {
            return `/api/avatars/${avatarPath}`;
        }
        
        return `/api/avatars/${avatarPath}`;
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse">
                    <div className="bg-gray-200 h-8 w-48 mx-auto mb-4 rounded"></div>
                    <div className="bg-gray-200 h-20 w-20 mx-auto mb-4 rounded-full"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading profile...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Profile not found</p>
            </div>
        );
    }

    // CHECK IF USER IS ANONYMOUS - Show limited profile
    if (profileData.is_anonymous) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-900">Anonymous User</h2>
                            <p className="text-yellow-700">This user has chosen to keep their profile private</p>
                        </div>
                    </div>
                    {profileData.anonymized_at && (
                        <p className="text-sm text-yellow-600 mt-2">
                            Anonymized on: {new Date(profileData.anonymized_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Show only game stats for anonymous users */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Game Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-green-600">{profileData.wins || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">Wins</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-red-600">{profileData.losses || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">Losses</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-blue-600">{profileData.total_games || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Games</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-purple-600">{profileData.winRate || '0%'}</div>
                            <div className="text-sm text-gray-600 mt-1">Win Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // NORMAL PROFILE - Show full data for non-anonymous users
    const avatarUrl = getAvatarUrl(profileData.avatar_url);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {profileData.username}'s Profile
                </h1>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                            {profileData.avatar_url ? (
                                <img 
                                    src={avatarUrl || undefined} 
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {profileData.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {profileData.display_name || profileData.username}
                        </h2>
                        {profileData.nickname && (
                            <p className="text-lg text-gray-600">@{profileData.nickname}</p>
                        )}
                        <p className="text-gray-500">Username: {profileData.username}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Game Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="font-medium text-green-700">Wins</span>
                            <span className="text-2xl font-bold text-green-600">{profileData.wins || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                            <span className="font-medium text-red-700">Losses</span>
                            <span className="text-2xl font-bold text-red-600">{profileData.losses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="font-medium text-blue-700">Total Games</span>
                            <span className="text-2xl font-bold text-blue-600">{profileData.total_games || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="font-medium text-purple-700">Win Rate</span>
                            <span className="text-2xl font-bold text-purple-600">{profileData.winRate || '0%'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">User Information</h3>
                    <div className="space-y-3">
                        <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">Username</span>
                            <p className="font-medium">{profileData.username}</p>
                        </div>
                        {profileData.nickname && (
                            <div className="border-b pb-2">
                                <span className="text-sm text-gray-500">Nickname</span>
                                <p className="font-medium">@{profileData.nickname}</p>
                            </div>
                        )}
                        {profileData.display_name && (
                            <div className="border-b pb-2">
                                <span className="text-sm text-gray-500">Display Name</span>
                                <p className="font-medium">{profileData.display_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;