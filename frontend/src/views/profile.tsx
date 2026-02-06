import React, { useState, useEffect } from 'react';
import { User, fetchUserProfile, getAvatarUrl } from '../components/util/profileUtils';

// interface User {
//     id: string;
//     username: string;
//     email?: string;
//     nickname?: string;
//     display_name?: string;
//     avatar_url?: string;
//     wins?: number;
//     losses?: number;
//     total_games?: number;
//     winRate?: string;
// }

interface ProfileProps {
    user: User | null;
}

// Helper function to get avatar URL
// const getAvatarUrl = (avatarPath?: string): string | undefined => {
//     if (!avatarPath) return undefined;
    
//     // Extract filename from path if it contains /uploads/avatars/
//     if (avatarPath.includes('/uploads/avatars/')) {
//         const filename = avatarPath.split('/').pop();
//         return `/api/avatars/${filename}`;
//     }
    
//     // If it's already just a filename
//     if (!avatarPath.includes('/')) {
//         return `/api/avatars/${avatarPath}`;
//     }
    
//     return `/api/avatars/${avatarPath}`;
// };

// export const fetchProfile = async (token: string) => {
//     try {
//         const response = await fetch('/api/users/profile/me', {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
        
//         if (response.ok) {
//             const data = await response.json();
//             return data.profile;
//         } else if (response.status === 401) {
//             localStorage.removeItem('token');
//             alert('Session expired. Please log in again.');
//             return null;
//         }
//     } catch (error) {
//         console.error('Failed to fetch profile:', error);
//         return null;
//     }
// };

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

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

       const loadProfile = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            setLoading(false);
            return;
        }
        
        const profile = await fetchUserProfile(token);
        if (profile) {
            setProfileData(profile);
        }
        setLoading(false);
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
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                            {displayUser.avatar_url ? (
                                <img 
                                    src={avatarUrl || undefined} 
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-white">
                                    {displayUser.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {displayUser.display_name || displayUser.username}
                        </h2>
                        {displayUser.nickname && (
                            <p className="text-xl text-gray-600 mt-1">@{displayUser.nickname}</p>
                        )}
                        <p className="text-gray-500 mt-1">
                            <span className="font-medium">Username:</span> {displayUser.username}
                        </p>
                        {displayUser.email && (
                            <p className="text-gray-600 mt-1">{displayUser.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Statistics */}
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
                        <div className="mt-4 text-center p-4 bg-gray-50 rounded">
                            <p className="text-gray-600 font-medium">No games played yet!</p>
                            <p className="text-sm text-gray-500 mt-1">Start playing to see your statistics here.</p>
                        </div>
                    )}
                </div>

                {/* Account Information */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
                    <div className="space-y-3">
                        <div className="border-b pb-3">
                            <span className="text-sm text-gray-500 block mb-1">User ID</span>
                            <p className="font-medium text-gray-900">{displayUser.id}</p>
                        </div>
                        <div className="border-b pb-3">
                            <span className="text-sm text-gray-500 block mb-1">Username</span>
                            <p className="font-medium text-gray-900">{displayUser.username}</p>
                        </div>
                        {displayUser.display_name && (
                            <div className="border-b pb-3">
                                <span className="text-sm text-gray-500 block mb-1">Display Name</span>
                                <p className="font-medium text-gray-900">{displayUser.display_name}</p>
                            </div>
                        )}
                        {displayUser.nickname && (
                            <div className="border-b pb-3">
                                <span className="text-sm text-gray-500 block mb-1">Nickname</span>
                                <p className="font-medium text-gray-900">@{displayUser.nickname}</p>
                            </div>
                        )}
                        <div className="pb-3">
                            <span className="text-sm text-gray-500 block mb-1">Email</span>
                            <p className="font-medium text-gray-900">{displayUser.email || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;