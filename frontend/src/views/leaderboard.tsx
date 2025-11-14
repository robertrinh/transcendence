// import React from 'react'

// export default function Leaderboard() {
//   return (
//     <div className="p-4">
//       <h1 className="text-4xl font-bold font-montserrat">Leaderboard Page</h1>
//     </div>
//   )
// }

import React from 'react';

export const Leaderboard: React.FC = () => {
    // Sample data - replace with real API call later
    const samplePlayers = [
        { id: 1, username: 'Player1', wins: 15, losses: 3, rank: 1 },
        { id: 2, username: 'Player2', wins: 12, losses: 5, rank: 2 },
        { id: 3, username: 'Player3', wins: 10, losses: 7, rank: 3 },
        { id: 4, username: 'Player4', wins: 8, losses: 9, rank: 4 },
        { id: 5, username: 'Player5', wins: 6, losses: 11, rank: 5 },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold">Top Players</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Player
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Wins
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Losses
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Win Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {samplePlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{player.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {player.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {player.wins}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            {player.losses}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;