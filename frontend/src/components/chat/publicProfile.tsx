import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../config/api';
import { getAvatarUrl, calculateWinRate } from '../util/profileUtils';

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
            const response = await fetchWithAuth(`/api/users/profile/${username}`);

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

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse">
                    <div className="bg-slate-600 h-8 w-48 mx-auto mb-4 rounded-lg" />
                    <div className="bg-slate-600 h-20 w-20 mx-auto mb-4 rounded-full" />
                    <div className="bg-slate-600 h-4 w-32 mx-auto mb-2 rounded-lg" />
                </div>
                <p className="text-slate-400 mt-4">Loading profile...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="p-6 text-center text-slate-400">Profile not found</div>
        );
    }

    // CHECK IF USER IS ANONYMOUS - Show limited profile
    if (profileData.is_anonymous) {
        const winRate = profileData.winRate || calculateWinRate(profileData.wins || 0, profileData.total_games || 0);
        return (
            <div className="p-6">
                <div className="bg-slate-800 rounded-lg border border-slate-600/70 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Anonymous User</h2>
                            <p className="text-slate-400">This user has chosen to keep their profile private</p>
                            {profileData.anonymized_at && (
                                <p className="text-sm text-slate-500 mt-1">
                                    Anonymized on: {new Date(profileData.anonymized_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-600/70">
                    <h3 className="text-xl font-semibold mb-4 text-white">Game Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-700/60 rounded-lg border border-slate-600/50 text-center">
                            <div className="text-2xl font-bold text-brand-acidGreen">{profileData.wins || 0}</div>
                            <div className="text-sm text-slate-400 mt-1">Wins</div>
                        </div>
                        <div className="p-4 bg-slate-700/60 rounded-lg border border-slate-600/50 text-center">
                            <div className="text-2xl font-bold text-brand-red">{profileData.losses || 0}</div>
                            <div className="text-sm text-slate-400 mt-1">Losses</div>
                        </div>
                        <div className="p-4 bg-slate-700/60 rounded-lg border border-slate-600/50 text-center">
                            <div className="text-2xl font-bold text-brand-hotPink">{profileData.total_games || 0}</div>
                            <div className="text-sm text-slate-400 mt-1">Total Games</div>
                        </div>
                        <div className="p-4 bg-slate-700/60 rounded-lg border border-slate-600/50 text-center">
                            <div className="text-2xl font-bold text-brand-purple">{winRate}</div>
                            <div className="text-sm text-slate-400 mt-1">Win Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // NORMAL PROFILE - Slate + brand colours (match own profile)
    const avatarUrl = getAvatarUrl(profileData.avatar_url);
    const winRate = profileData.winRate || calculateWinRate(profileData.wins || 0, profileData.total_games || 0);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">
                {profileData.username}'s Profile
            </h1>

            {/* Profile Header */}
            <div className="bg-slate-800 rounded-lg border border-slate-600/70 p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-magenta to-brand-hotPink rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-hotPink/60">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-3xl font-bold">
                                    {profileData.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white">
                            {profileData.display_name || profileData.username}
                        </h2>
                        {profileData.nickname && (
                            <p className="text-slate-300 text-lg mt-1">@{profileData.nickname}</p>
                        )}
                        <p className="text-slate-400 mt-1">Username: {profileData.username}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Statistics */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-600/70">
                    <h3 className="text-xl font-semibold mb-4 text-white">Game Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Wins</span>
                            <span className="text-brand-acidGreen font-bold text-xl">{profileData.wins || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Losses</span>
                            <span className="text-brand-red font-bold text-xl">{profileData.losses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Total Games</span>
                            <span className="text-brand-hotPink font-bold text-xl">{profileData.total_games || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Win Rate</span>
                            <span className="text-brand-purple font-bold text-xl">{winRate}</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-600/50">
                        Game statistics consists of completed online games only.
                    </p>
                    {(profileData.total_games || 0) === 0 && (
                        <p className="text-center text-slate-500 mt-4 text-sm">No games played yet</p>
                    )}
                </div>

                {/* User Information */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-600/70">
                    <h3 className="text-xl font-semibold mb-4 text-white">User Information</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <div className="text-sm text-slate-400">Username</div>
                            <div className="font-medium text-slate-200">{profileData.username}</div>
                        </div>
                        {profileData.nickname && (
                            <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                <div className="text-sm text-slate-400">Nickname</div>
                                <div className="font-medium text-slate-200">@{profileData.nickname}</div>
                            </div>
                        )}
                        {profileData.display_name && (
                            <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                <div className="text-sm text-slate-400">Display Name</div>
                                <div className="font-medium text-slate-200">{profileData.display_name}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;