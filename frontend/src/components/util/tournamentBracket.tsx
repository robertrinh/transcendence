import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'

interface TournamentBracketProps {
    tournamentId: number | null
    onPlayMatch: (gameId: number) => void
    onTournamentFinished: (winnerId: number) => void
    currentUserId?: number
}

interface Game {
    id: number
    tournament_id: number
    round: number
    player1_id: number | null
    player2_id: number | null
    winner_id: number | null
    status: string
    score_player1: number | null
    score_player2: number | null
}

export interface TournamentParticipant {
	id: number;
	tournament_id: number;
	user_id: number;
	joined_at: string;
    username: string
}

export default function TournamentBracket({
    tournamentId,
    onPlayMatch,
    onTournamentFinished,
    currentUserId
}: TournamentBracketProps) {
    const [games, setGames] = useState<Game[]>([])
    const [round, setRound] = useState(1)
    const [loading, setLoading] = useState(true)
    const [gamesFound, setGamesFound] = useState(false)
    const [userNames, setUserNames] = useState<Map<number, string> | null>(null)

    // Fetch games with polling
    useEffect(() => {
        if (!tournamentId) return

        const fetchGames = async () => {
            try {
                const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/games`)
                if (!response.ok) throw new Error('Failed to fetch games')
                const data = await response.json()
                console.log('🏟️ Bracket games data:', data)
                if (data.games.length > 0) {
                    setGames(data.games)
                    setGamesFound(true)
                }
                else {
                    setGames([])
                }
                setLoading(false)
            } catch (err) {
                console.error('Failed to fetch games:', err)
            }
        }

        fetchGames()
        const interval = setInterval(fetchGames, 3000)
        return () => clearInterval(interval)
    }, [tournamentId])

    useEffect(() => {
        if (!gamesFound) {
            return
        }
        const getParticipants = async () => {
            const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/participants`)
            if (!response.ok) {
                throw new Error('Failed to fetch tournament participants')
            }
            const data = await response.json()
            const usernameMap = new Map<number, string>()
            for (const row of data.participants as TournamentParticipant[]) {
                usernameMap.set(row.user_id, row.username)
            }
            setUserNames(usernameMap)
        }
        getParticipants()
    }, [gamesFound])

    const currentRoundGames = games.filter(g => g.round === round)
    const maxRound = games.length > 0 ? Math.max(...games.map(g => g.round!)) : 1
    const allRoundsFinished = games.length > 0 && games.every(g => g.status === 'finished')

    // Auto-advance to the current active round
    useEffect(() => {
        if (games.length === 0) return
        // Find the earliest round that still has unfinished games
        for (let r = 1; r <= maxRound; r++) {
            const roundGames = games.filter(g => g.round === r)
            const hasUnfinished = roundGames.some(g => g.status !== 'finished')
            if (hasUnfinished) {
                setRound(r)
                return
            }
        }
        // All finished — show the final round
        setRound(maxRound)
    }, [games, maxRound])

    const getPlayerName = (playerId: number | null | undefined) => {
        if (typeof playerId !== 'number') {
            return '???'
        }
        if (playerId === currentUserId) {
            return 'YOU'
        }
        if (!userNames) {
            return '???'
        }
        return userNames.get(playerId)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black" style={{
                backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }}>
                <p className="text-yellow-300 text-2xl animate-pulse font-bold" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #ffff00'
                }}>
                    LOADING BRACKET...
                </p>
            </div>
        )
    }

    // Tournament finished
    if (allRoundsFinished) {
        const finalGame = games.find(g => g.round === maxRound)
        const winner = finalGame?.winner_id
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
                backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
                }}></div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <h1 className="text-5xl font-black mb-4" style={{
                        color: '#ffff00',
                        textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 40px #ffff00, 3px 3px 0 #ff00ff',
                        fontFamily: 'monospace'
                    }}>
                        🏆 CHAMPION 🏆
                    </h1>

                    <div className="border-4 p-8 bg-gray-900 mb-6" style={{
                        borderColor: '#ffff00',
                        boxShadow: '0 0 30px rgba(255,255,0,0.6), inset 0 0 20px rgba(255,255,0,0.2)'
                    }}>
                        <p className="text-4xl font-black text-white mb-4" style={{
                            fontFamily: 'monospace',
                            textShadow: '0 0 10px #fff, 2px 2px 0 #ff00ff'
                        }}>
                            {getPlayerName(winner)}
                        </p>
                        <p className="text-green-400 font-bold text-lg" style={{
                            fontFamily: 'monospace',
                            textShadow: '0 0 10px #00ff00'
                        }}>
                            TOURNAMENT COMPLETE!
                        </p>
                    </div>

                    <button
                        onClick={() => onTournamentFinished(winner || 0)}
                        className="w-full p-4 bg-yellow-600 hover:bg-yellow-500 border-4 border-yellow-300 font-black text-yellow-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                        style={{
                            fontFamily: 'monospace',
                            boxShadow: '0 0 20px rgba(255,255,0,0.6)',
                            textShadow: '2px 2px 0 #000'
                        }}
                    >
                        RETURN TO MENU
                    </button>
                </div>
            </div>
        )
    }

    const roundName = (r: number) => {
        if (r === maxRound) return '🏆 FINAL'
        if (r === maxRound - 1) return '⚔️ SEMI-FINALS'
        return `⚔️ ROUND ${r}`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
            backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
        }}>
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
            }}></div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl font-black text-center mb-2" style={{
                    color: '#ffff00',
                    textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
                    TOURNAMENT BRACKET
                </h1>

                {/* All Rounds Overview */}
                <div className="flex justify-center gap-2 mb-6">
                    {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
                        const roundGames = games.filter(g => g.round === r)
                        const allFinished = roundGames.every(g => g.status === 'finished')
                        const hasActive = roundGames.some(g => g.status === 'ready' || g.status === 'ongoing')
                        const isPending = roundGames.every(g => g.status === 'pending')

                        return (
                            <button
                                key={r}
                                onClick={() => setRound(r)}
                                className={`px-4 py-2 border-4 font-black uppercase transition-all duration-200 ${
                                    round === r ? 'transform scale-110' : ''
                                }`}
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    backgroundColor: round === r ? '#1a1a2e' : '#000',
                                    borderColor: allFinished ? '#00ff00'
                                        : hasActive ? '#ffff00'
                                        : isPending ? '#666'
                                        : round === r ? '#00ffff' : '#444',
                                    color: allFinished ? '#00ff00'
                                        : hasActive ? '#ffff00'
                                        : isPending ? '#666'
                                        : '#00ffff',
                                    boxShadow: round === r
                                        ? `0 0 15px ${allFinished ? 'rgba(0,255,0,0.5)' : hasActive ? 'rgba(255,255,0,0.5)' : 'rgba(0,255,255,0.3)'}`
                                        : 'none',
                                    textShadow: isPending ? 'none' : `0 0 5px currentColor`
                                }}
                            >
                                {r === maxRound ? 'FINAL' : `R${r}`}
                                {allFinished && ' ✓'}
                            </button>
                        )
                    })}
                </div>

                <div className="border-4 p-8 bg-gray-900" style={{
                    borderColor: '#ff00ff',
                    boxShadow: 'inset 0 0 10px rgba(255,0,255,0.3), 0 0 20px rgba(255,0,255,0.5)'
                }}>
                    {/* Round indicator */}
                    <div className="bg-black border-4 border-cyan-400 p-4 mb-8 text-center" style={{
                        boxShadow: '0 0 15px rgba(0,255,255,0.4)',
                        fontFamily: 'monospace'
                    }}>
                        <p className="text-cyan-400 font-black text-xl uppercase" style={{
                            textShadow: '0 0 10px #00ffff'
                        }}>
                            {roundName(round)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            {currentRoundGames.length} MATCH{currentRoundGames.length !== 1 ? 'ES' : ''}
                        </p>
                    </div>

                    {/* Matches */}
                    <div className="space-y-4 mb-8">
                        {currentRoundGames.map((game) => {
                            const isMyMatch = game.player1_id === currentUserId || game.player2_id === currentUserId
                            const isFinished = game.status === 'finished'
                            const isOngoing = game.status === 'ongoing'
                            const isReady = game.status === 'ready'
                            const isPending = game.status === 'pending'
                            console.log(`🎮 Game ${game.id}: status=${game.status}, p1=${game.player1_id}, p2=${game.player2_id}, currentUserId=${currentUserId}, isMyMatch=${isMyMatch}, isReady=${isReady}`)

                            return (
                                <div
                                    key={game.id}
                                    className="bg-black border-4 p-6"
                                    style={{
                                        fontFamily: 'monospace',
                                        borderColor: isFinished ? '#00ff00'
                                            : isReady && isMyMatch ? '#ffff00'
                                            : isOngoing ? '#ff6b6b'
                                            : isPending ? '#444'
                                            : '#666',
                                        boxShadow: isFinished
                                            ? '0 0 10px rgba(0,255,0,0.3)'
                                            : isReady && isMyMatch
                                                ? '0 0 15px rgba(255,255,0,0.4)'
                                                : isOngoing
                                                    ? '0 0 15px rgba(255,107,107,0.4)'
                                                    : 'none',
                                        opacity: isPending ? 0.5 : 1
                                    }}
                                >
                                    {/* VS Layout */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            <p className={`font-black text-lg ${
                                                game.winner_id === game.player1_id ? 'text-green-400'
                                                : isPending && !game.player1_id ? 'text-gray-600'
                                                : 'text-white'
                                            }`} style={{
                                                textShadow: game.winner_id === game.player1_id ? '0 0 10px #00ff00' : 'none'
                                            }}>
                                                {game.winner_id === game.player1_id && '👑 '}
                                                {getPlayerName(game.player1_id)}
                                            </p>
                                            {isFinished && game.score_player1 !== null && (
                                                <p className="text-cyan-400 text-sm font-bold">
                                                    SCORE: {game.score_player1}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mx-4">
                                            <span className="font-black text-2xl" style={{
                                                color: isPending ? '#444' : '#ff6b6b',
                                                textShadow: isPending ? 'none' : '0 0 10px #ff6b6b, 0 0 20px #ff6b6b'
                                            }}>
                                                VS
                                            </span>
                                        </div>

                                        <div className="flex-1 text-right">
                                            <p className={`font-black text-lg ${
                                                game.winner_id === game.player2_id ? 'text-green-400'
                                                : isPending && !game.player2_id ? 'text-gray-600'
                                                : 'text-white'
                                            }`} style={{
                                                textShadow: game.winner_id === game.player2_id ? '0 0 10px #00ff00' : 'none'
                                            }}>
                                                {getPlayerName(game.player2_id)}
                                                {game.winner_id === game.player2_id && ' 👑'}
                                            </p>
                                            {isFinished && game.score_player2 !== null && (
                                                <p className="text-cyan-400 text-sm font-bold">
                                                    SCORE: {game.score_player2}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="text-center mb-4">
                                        {isFinished && game.winner_id ? (
                                            <p className="text-green-400 font-black text-sm" style={{
                                                textShadow: '0 0 5px #00ff00'
                                            }}>
                                                ✓ WINNER: {getPlayerName(game.winner_id)}
                                            </p>
                                        ) : isOngoing ? (
                                            <p className="text-red-400 font-black text-sm animate-pulse" style={{
                                                textShadow: '0 0 10px #ff6b6b'
                                            }}>
                                                ⚡ MATCH IN PROGRESS...
                                            </p>
                                        ) : isPending ? (
                                            <p className="text-gray-600 font-bold text-xs">
                                                ⏳ WAITING FOR PREVIOUS ROUND
                                            </p>
                                        ) : isReady ? (
                                            <p className="text-yellow-300 font-black text-sm" style={{
                                                textShadow: '0 0 5px #ffff00'
                                            }}>
                                                ⚔️ READY TO PLAY
                                            </p>
                                        ) : (
                                            <p className="text-gray-500 text-xs uppercase">
                                                STATUS: {game.status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Play Button — only for ready games where current user is a participant */}
                                    {isReady && isMyMatch && (
                                        <button
                                            onClick={() => onPlayMatch(game.id)}
                                            className="w-full p-3 bg-cyan-700 hover:bg-cyan-600 border-4 border-cyan-400 font-black text-cyan-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                                            style={{
                                                fontFamily: 'monospace',
                                                boxShadow: '0 0 15px rgba(0,255,255,0.5)',
                                                textShadow: '2px 2px 0 #000'
                                            }}
                                        >
                                            ⚔️ PLAY MATCH
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Round Navigation */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setRound(Math.max(1, round - 1))}
                            disabled={round === 1}
                            className="px-6 py-3 border-4 font-black uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:transform-none"
                            style={{
                                fontFamily: 'monospace',
                                backgroundColor: round === 1 ? '#333' : '#1a1a2e',
                                borderColor: round === 1 ? '#555' : '#00ffff',
                                color: round === 1 ? '#555' : '#00ffff',
                                boxShadow: round === 1 ? 'none' : '0 0 10px rgba(0,255,255,0.3)',
                                textShadow: round === 1 ? 'none' : '0 0 5px #00ffff'
                            }}
                        >
                            &lt;&lt; PREV
                        </button>
                        <button
                            onClick={() => setRound(Math.min(maxRound, round + 1))}
                            disabled={round === maxRound}
                            className="px-6 py-3 border-4 font-black uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:transform-none"
                            style={{
                                fontFamily: 'monospace',
                                backgroundColor: round === maxRound ? '#333' : '#1a1a2e',
                                borderColor: round === maxRound ? '#555' : '#00ffff',
                                color: round === maxRound ? '#555' : '#00ffff',
                                boxShadow: round === maxRound ? 'none' : '0 0 10px rgba(0,255,255,0.3)',
                                textShadow: round === maxRound ? 'none' : '0 0 5px #00ffff'
                            }}
                        >
                            NEXT &gt;&gt;
                        </button>
                    </div>
                </div>

                <p className="text-green-400 font-bold text-sm text-center mt-6" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #00ff00'
                }}>
                    &gt;&gt;&gt; FIGHT YOUR WAY TO THE TOP &lt;&lt;&lt;
                </p>
            </div>
        </div>
    )
}
