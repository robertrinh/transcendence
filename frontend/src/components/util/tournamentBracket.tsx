import { useState, useEffect } from 'react'
import Button from '../game/button'

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
    player1_id: number
    player2_id: number
    winner_id: number | null
    status: string
}

interface Player {
    id: number
    username: string
    display_name: string
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
    const [players, setPlayers] = useState<Map<number, Player>>(new Map())

    // Fetch tournament games
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch(`/api/tournaments/${tournamentId}/games`)
                if (!response.ok) throw new Error('Failed to fetch games')
                
                const data = await response.json()
                console.log('🎮 Fetched games:', data.data)
                setGames(data.data || [])
                setLoading(false)

                // Fetch player info
                const playerIds = new Set<number>()
                data.data?.forEach((game: Game) => {
                    playerIds.add(game.player1_id)
                    playerIds.add(game.player2_id)
                })

                const playerMap = new Map<number, Player>()
                for (const playerId of Array.from(playerIds)) {
                    try {
                        const playerResponse = await fetch(`/api/users/${playerId}`)
                        const playerData = await playerResponse.json()
                        if (playerData.data) {
                            playerMap.set(playerId, playerData.data)
                        }
                    } catch (err) {
                        console.error('Failed to fetch player:', err)
                    }
                }
                setPlayers(playerMap)
            } catch (err) {
                console.error('Failed to fetch games:', err)
            }
        }

        fetchGames()
        const interval = setInterval(fetchGames, 2000)
        return () => clearInterval(interval)
    }, [tournamentId])

    const currentRoundGames = games.filter(g => g.round === round)
    const maxRound = Math.max(...games.map(g => g.round), 1)
    const allRoundsFinished = games.every(g => g.status === 'finished')

    const getPlayerName = (playerId: number) => {
        return players.get(playerId)?.display_name || `Player ${playerId}`
    }

    const handlePlayMatch = (game: Game) => {
        console.log('🎯 Play match clicked - Game ID:', game.id, 'Status:', game.status)
        onPlayMatch(game.id)
    }   

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <p className="text-cyan-400 text-xl animate-pulse font-arcade">LOADING BRACKET...</p>
            </div>
        )
    }

    if (allRoundsFinished) {
        const winner = games.find(g => g.round === maxRound)?.winner_id
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
                <div className="w-full max-w-md bg-gray-900 border-4 border-green-400 rounded-xl p-10 text-center shadow-2xl">
                    <h1 className="text-4xl font-bold text-green-400 mb-4 font-arcade">TOURNAMENT FINISHED!</h1>
                    <p className="text-xl text-white mb-6 font-arcade">
                        🏆 CHAMPION: {getPlayerName(winner || 0)}
                    </p>
                    <Button
                        id='btn-return-menu'
                        onClick={() => onTournamentFinished(winner || 0)}
                        buttonName="RETURN TO MENU"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg font-arcade"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-2xl bg-gray-900 border-4 border-cyan-400 rounded-xl p-10 shadow-2xl">
                
                {/* Header */}
                <h1 className="text-4xl font-bold text-cyan-400 text-center mb-8 uppercase font-arcade">
                    TOURNAMENT BRACKET
                </h1>

                {/* Round indicator */}
                <div className="bg-cyan-500/10 border-2 border-cyan-400/30 rounded-lg p-4 mb-8 text-center">
                    <p className="text-cyan-400 font-arcade font-bold text-xl">
                        ROUND {round} OF {maxRound}
                    </p>
                </div>
                {/* Matches */}
                <div className="space-y-4 mb-8">
                    {currentRoundGames.length === 0 ? (
                        <p className="text-gray-400 text-center font-arcade">NO MATCHES THIS ROUND</p>
                    ) : (
                        currentRoundGames.map((game) => (
                            <div 
                                key={game.id}
                                className="bg-black/50 border-2 border-cyan-400/30 rounded-lg p-6 font-arcade"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-lg">
                                            {getPlayerName(game.player1_id)}
                                        </p>
                                        <p className="text-gray-500 text-sm">Player 1</p>
                                    </div>
                                    
                                    <div className="text-cyan-400 font-bold text-2xl mx-4">VS</div>
                                    
                                    <div className="flex-1 text-right">
                                        <p className="text-white font-bold text-lg">
                                            {getPlayerName(game.player2_id)}
                                        </p>
                                        <p className="text-gray-500 text-sm">Player 2</p>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    {game.status === 'finished' && game.winner_id ? (
                                        <p className="text-green-400 font-bold">
                                            ✓ WINNER: {getPlayerName(game.winner_id)}
                                        </p>
                                    ) : game.status === 'ongoing' ? (
                                        <p className="text-yellow-400 font-bold animate-pulse">
                                            ⚡ MATCH IN PROGRESS...
                                        </p>
                                    ) : (
                                        <p className="text-gray-400">
                                            Ready to play (status: {game.status})
                                        </p>
                                    )}
                                </div>

                                {/* ✅ ONLY SHOW PLAY BUTTON IF CURRENT USER IS IN THIS GAME */}
                                {game.status === 'ready' && 
                                 (game.player1_id === currentUserId || game.player2_id === currentUserId) && (
                                    <Button
                                        id={`btn-play-match-${game.id}`}
                                        onClick={() => handlePlayMatch(game)}
                                        buttonName="PLAY MATCH"
                                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg"
                                    />
                                )}

                                {/* Show status if not ready or user not assigned */}
                                {(game.status !== 'ready' || (game.player1_id !== currentUserId && game.player2_id !== currentUserId)) && (
                                    <p className="text-center text-gray-500 text-xs">Status: {game.status}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Round navigation */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setRound(Math.max(1, round - 1))}
                        disabled={round === 1}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-arcade font-bold"
                    >
                        PREV ROUND
                    </button>
                    <button
                        onClick={() => setRound(Math.min(maxRound, round + 1))}
                        disabled={round === maxRound}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-arcade font-bold"
                    >
                        NEXT ROUND
                    </button>
                </div>
            </div>
        </div>
    )
}