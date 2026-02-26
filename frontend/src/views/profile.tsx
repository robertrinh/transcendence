import { useState, useEffect } from 'react';
import { User, fetchUserProfile, getAvatarUrl, fetchUserGameHistory,
    GameHistoryItem, calculateWinRate } from '../components/util/profileUtils';
import { Navigate } from 'react-router-dom';

interface ProfileProps {
    user: User | null;
}
type StatsTab = 'stats' | 'history' | 'graphs';

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [statsTab, setStatsTab] = useState<StatsTab>('stats');

    useEffect(() => {
        if (user && !user.is_guest) {
            loadProfile();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadGameHistory();
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

    const loadGameHistory = async () => {
        setGamesLoading(true);
        const history = await fetchUserGameHistory();
        setGameHistory(history);
        setGamesLoading(false);
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
    const wins = displayUser.wins ?? 0;
    const losses = displayUser.losses ?? 0;
    const totalGames = displayUser.total_games ?? wins + losses;
    const winRate = calculateWinRate(wins, totalGames);
    const avatarUrl = getAvatarUrl(displayUser.avatar_url);

    return (
        <div className="p-6">
            {/* Profile Header */}
            <div className="bg-slate-800 rounded-lg border border-slate-600/70 p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-magenta to-brand-hotPink rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-hotPink/60">
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
                        <h2 className="text-3xl font-bold text-white">
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

            {/* Middle: Account (left) | Game statistics (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                <div className="bg-slate-800 rounded-lg border border-slate-600/70 overflow-hidden flex flex-col">
                    <div className="flex border-b border-slate-600/50">
                        {(['stats', 'history', 'graphs'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setStatsTab(tab)}
                                className={`flex-1 px-3 py-3 text-sm font-medium ${statsTab === tab ? 'text-brand-magenta border-b-2 border-brand-magenta bg-slate-700/40' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {tab === 'stats' ? 'Game statistics' : tab === 'history' ? 'Match history' : 'Graphs'}
                                {statsTab === tab && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-white" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 min-h-0 max-h-[360px]">
                        {statsTab === 'stats' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-300 font-medium">Wins</span>
                                    <span className="text-brand-acidGreen font-bold text-xl">{wins}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-300 font-medium">Losses</span>
                                    <span className="text-brand-red font-bold text-xl">{losses}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-300 font-medium">Total Games</span>
                                    <span className="text-brand-hotPink font-bold text-xl">{totalGames}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-300 font-medium">Win Rate</span>
                                    <span className="text-brand-purple font-bold text-xl">{winRate}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-600/50">
                                    Game statistics consists of completed online games only.
                                </p>
                                {totalGames === 0 && (
                                    <p className="text-center text-slate-500 mt-3 text-sm">No games played yet</p>
                                )}
            </div>
                        )}
                        {statsTab === 'history' && (
                            <>
                {gamesLoading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-slate-700/60 rounded-lg" />
                        ))}
                    </div>
                ) : gameHistory.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No games played yet</p>
                ) : (
                    <ul className="divide-y divide-slate-600/50">
                        {gameHistory.map((game: GameHistoryItem) => {
                            const isWinner = game.username_winner === displayUser.username;
                                            const displayScoreOwn = game.score_own ?? '?';
                            const diplayScoreOpp = game.score_opponent ?? '?';
                            const dateStr = game.finished_at
                                ? new Date(game.finished_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                : game.created_at
                                    ? new Date(game.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                    : '—';
                            return (
                                                <li key={game.id} className="py-3 flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-slate-200 truncate block text-sm">
                                            vs {game.username_opponent ?? 'Unknown'}
                                        </span>
                                                        <span className="text-xs text-slate-500">{dateStr}</span>
                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-slate-300 font-mono text-sm">
                                            {displayScoreOwn} – {diplayScoreOpp}
                                        </span>
                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                isWinner ? 'bg-brand-acidGreen/20 text-brand-acidGreen' : 'bg-brand-red/20 text-brand-red'
                                            }`}
                                        >
                                            {isWinner ? 'Win' : 'Loss'}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-600/50">
                    Match history consists of completed online games only.
                </p>
            </div>
        </div>
    );
};

export default Profile;
