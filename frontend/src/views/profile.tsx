import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, fetchUserProfile, getAvatarUrl } from '../components/util/profileUtils';

interface ProfileProps {
    user: User | null;
}
const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && !user.is_guest) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        setLoading(true);
        const profile = await fetchUserProfile();
        console.log('Profile response:', profile);
        if (profile) {
            setProfileData(profile);
        }
        setLoading(false);
    };

    if (user?.is_guest) {
        return <Navigate to="/" replace />;
    }

    if (loading && !profileData) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse">
                    <div className="bg-slate-600 h-8 w-48 mx-auto mb-4 rounded-lg"></div>
                    <div className="bg-slate-600 h-20 w-20 mx-auto mb-4 rounded-full"></div>
                    <div className="bg-slate-600 h-4 w-32 mx-auto mb-2 rounded-lg"></div>
                </div>
                <p className="text-slate-400 mt-4">Loading profile...</p>
            </div>
        );
    }

    const displayUser = profileData || user;
    if (!displayUser) {
        return <div className="p-6 text-center text-slate-400">No user data available</div>;
    }
    const avatarUrl = getAvatarUrl(displayUser.avatar_url);

    return (
        <div className="p-6">
            {/* Profile Header */}
            <div className="bg-slate-800 rounded-lg border border-slate-600/70 p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-brand-cyan/80 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-600">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-3xl font-bold">
                                    {displayUser.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-brand-yellow">
                            {displayUser.display_name || displayUser.username}
                        </h2>
                        {displayUser.nickname && (
                            <p className="text-slate-300 text-lg mt-1">@{displayUser.nickname}</p>
                        )}
                        <p className="text-slate-400 mt-1">Username: {displayUser.username}</p>
                        {displayUser.email && (
                            <p className="text-slate-400 mt-1">{displayUser.email}</p>
                        )}
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
                            <span className="text-brand-acidGreen font-bold text-xl">{displayUser.wins || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Losses</span>
                            <span className="text-brand-red font-bold text-xl">{displayUser.losses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Total Games</span>
                            <span className="text-brand-hotPink font-bold text-xl">{displayUser.total_games || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <span className="text-slate-300 font-medium">Win Rate</span>
                            <span className="text-brand-purple font-bold text-xl">{displayUser.winRate || '0%'}</span>
                        </div>
                    </div>
                    {(displayUser.total_games || 0) === 0 && (
                        <p className="text-center text-slate-500 mt-4 text-sm">No games played yet</p>
                    )}
                </div>

                {/* Account Information */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-600/70">
                    <h3 className="text-xl font-semibold mb-4 text-white">Account Information</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <div className="text-sm text-slate-400">User ID</div>
                            <div className="font-mono text-slate-200">{displayUser.id}</div>
                        </div>
                        <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                            <div className="text-sm text-slate-400">Username</div>
                            <div className="font-medium text-slate-200">{displayUser.username}</div>
                        </div>
                        {displayUser.email && (
                            <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                <div className="text-sm text-slate-400">Email</div>
                                <div className="font-medium text-slate-200">{displayUser.email}</div>
                            </div>
                        )}
                        {displayUser.nickname && (
                            <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                <div className="text-sm text-slate-400">Nickname</div>
                                <div className="font-medium text-slate-200">@{displayUser.nickname}</div>
                            </div>
                        )}
                        {displayUser.display_name && (
                            <div className="p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                <div className="text-sm text-slate-400">Display Name</div>
                                <div className="font-medium text-slate-200">{displayUser.display_name}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
