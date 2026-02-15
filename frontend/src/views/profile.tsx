import { useState, useEffect } from 'react';
import { User, fetchUserProfile, getAvatarUrl } from '../components/util/profileUtils';

interface ProfileProps {
    user: User | null;
}
const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
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
    if (!displayUser) {
        return <div className="p-6 text-center text-gray-500">No user data available</div>;
    }
    const avatarUrl = getAvatarUrl(displayUser.avatar_url);

    return (
        <div className="p-6">
            {/* Profile Header - ALWAYS SHOW FULL DATA */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-3xl font-bold">
                                    {displayUser.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* User Info - FULL DATA */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {displayUser.display_name || displayUser.username}
                        </h2>
                        {displayUser.nickname && (
                            <p className="text-gray-600 text-lg mt-1">@{displayUser.nickname}</p>
                        )}
                        <p className="text-gray-500 mt-1">Username: {displayUser.username}</p>
                        {displayUser.email && (
                            <p className="text-gray-500 mt-1">{displayUser.email}</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Stats Grid - FULL DATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Statistics */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Game Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="text-gray-700 font-medium">Wins</span>
                            <span className="text-green-600 font-bold text-xl">{displayUser.wins || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                            <span className="text-gray-700 font-medium">Losses</span>
                            <span className="text-red-600 font-bold text-xl">{displayUser.losses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="text-gray-700 font-medium">Total Games</span>
                            <span className="text-blue-600 font-bold text-xl">{displayUser.total_games || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="text-gray-700 font-medium">Win Rate</span>
                            <span className="text-purple-600 font-bold text-xl">{displayUser.winRate || '0%'}</span>
                        </div>
                    </div>
                    {(displayUser.total_games || 0) === 0 && (
                        <p className="text-center text-gray-500 mt-4 text-sm">No games played yet</p>
                    )}
                </div>

                {/* Account Information - FULL DATA */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">User ID</div>
                            <div className="font-mono text-gray-900">{displayUser.id}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">Username</div>
                            <div className="font-medium text-gray-900">{displayUser.username}</div>
                        </div>
                        {displayUser.email && (
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">Email</div>
                                <div className="font-medium text-gray-900">{displayUser.email}</div>
                            </div>
                        )}
                        {displayUser.nickname && (
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">Nickname</div>
                                <div className="font-medium text-gray-900">@{displayUser.nickname}</div>
                            </div>
                        )}
                        {displayUser.display_name && (
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">Display Name</div>
                                <div className="font-medium text-gray-900">{displayUser.display_name}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
