import React, { useState, useEffect } from 'react';
import { fetchLeaderBoard, LeaderBoard } from '../components/util/leaderBoardUtils'

export const Leaderboard: React.FC = () => {

    const [leaderboardData, setLeaderBoard] = useState<LeaderBoard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderBoard()
    }, [])

    const loadLeaderBoard = async () => {
        setLoading(true);
        const leaderBoard = await fetchLeaderBoard(); 
        if (leaderBoard === null)
            throw Error('very bad')
        console.log('leaderboard response:', leaderBoard);
        if (leaderBoard) {
            setLeaderBoard(leaderBoard);
        }
        setLoading(false);
    };

    if (loading && !leaderboardData) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse">
                    <div className="bg-gray-200 h-8 w-48 mx-auto mb-4 rounded"></div>
                    <div className="bg-gray-200 h-20 w-20 mx-auto mb-4 rounded-full"></div>
                    <div className="bg-gray-200 h-4 w-32 mx-auto mb-2 rounded"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading Leaderboard...</p>
            </div>
        );
    }
    if (!leaderboardData) {
        return <div className="p-6 text-center text-gray-500">Leaderboard is not available</div>;
    }
    if (leaderboardData.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-4xl font-bold text-center mb-8 text-brand-acidGreen">Leaderboard</h1>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-600/70 shadow-lg">
                        <div className="bg-slate-700/80 px-6 py-4 border-b border-slate-600/70">
                            <h2 className="text-xl font-semibold text-white">Top Players</h2>
                        </div>
                        <div className="px-6 py-12 text-center">
                            <p className="text-slate-300 text-lg">No players in the leaderboard yet. Go battle!</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold text-center mb-8 text-brand-acidGreen">Leaderboard</h1>
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-600/70 shadow-lg">
                    <div className="bg-slate-700/80 px-6 py-4 border-b border-slate-600/70">
                        <h2 className="text-xl font-semibold text-white">Top Players</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/60">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Player</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Wins</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Losses</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Win Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {leaderboardData.map((player, index) => (
                                    <tr key={player.username} className="hover:bg-white/20 backdrop-blur-sm">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{player.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-acidGreen">{player.wins}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-red">{player.losses}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-purple">
                                            {player.wins + player.losses == 0 ? '0.0' : ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%
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