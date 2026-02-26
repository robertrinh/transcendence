import React from 'react';
import { type User } from '../types/database.interfaces';

interface TournamentsProps {
    user: User | null;
}

const Tournaments: React.FC<TournamentsProps> = ({ user }) => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Tournaments</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Tournaments</h2>
                    <div className="space-y-3">
                        <div className="p-3 border border-gray-100 rounded-lg">
                            <h3 className="font-medium">Weekly Championship</h3>
                            <p className="text-sm text-gray-600">8 players • Starts in 2 hours</p>
                            <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                Join Tournament
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Tournaments</h2>
                    {user ? (
                        <div className="text-gray-500 text-center py-8">
                            <p>You haven't joined any tournaments yet.</p>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-8">
                            <p>Please log in to view your tournaments.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tournaments;