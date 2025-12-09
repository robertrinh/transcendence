import React from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface ProfileProps {
    user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.username}</h2>
                        <p className="text-gray-600">{user.email || 'No email provided'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-2">Game Statistics</h3>
                    <p className="text-gray-600">Wins: 0</p>
                    <p className="text-gray-600">Losses: 0</p>
                    <p className="text-gray-600">Win Rate: 0%</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-gray-600">User ID: {user.id}</p>
                    <p className="text-gray-600">Member since: Today</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;