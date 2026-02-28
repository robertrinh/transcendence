import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'

interface TournamentJoinProps {
    tournamentId: number | null
    onTournamentJoined: (toId: number, maxParticipants: number) => void
    onCreateNew: () => void
    onBack: () => void
}

interface Tournament {
    id: number
    name: string
    description: string
    max_participants: number
    status: string
}

export default function TournamentJoin({
    tournamentId,
    onTournamentJoined,
    onCreateNew,
    onBack
}: TournamentJoinProps) {
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [joining, setJoining] = useState<number | null>(null)

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch('/api/tournaments')
				switch (response.status) {
					case 404:
						return
					case 200:
						break
					default:
						throw new Error('Failed to fetch tournaments')
				}
                const data = await response.json()
                const openTournaments = data.data.filter((t: Tournament) => t.status === 'open')
                setTournaments(openTournaments)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch tournaments:', err)
                setError(String(err))
            } finally {
                setLoading(false)
            }
        }

        fetchTournaments()
        const interval = setInterval(fetchTournaments, 3000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (tournamentId) {
            handleJoinTournament(tournamentId)
        }
    }, [tournamentId])

    const handleJoinTournament = async (tId: number) => {
        setJoining(tId)

        try {
            const response = await fetchWithAuth(`/api/tournaments/${tId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Failed to join tournament')
            }

            await response.json()
            const tourResponse = await fetch(`/api/tournaments/${tId}`)
            const tourData = await tourResponse.json()
            onTournamentJoined(tId, tourData.data.max_participants)
        } catch (err: any) {
            console.error('Failed to join:', err)
            setError(err.message)
            setJoining(null)
        }
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
                    SEARCHING FOR TOURNAMENTS...
                </p>
            </div>
        )
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
                <h1 className="text-5xl font-black text-center mb-2" style={{
                    color: '#ffff00',
                    textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
                    TOURNAMENTS
                </h1>
                <p className="text-center text-purple-300 text-sm mb-8 font-bold" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 5px #ff00ff'
                }}>
                    JOIN AN EXISTING TOURNAMENT OR CREATE YOUR OWN
                </p>

                {error && (
                    <div className="bg-red-900 border-4 border-red-400 p-4 mb-6 text-center" style={{
                        fontFamily: 'monospace',
                        boxShadow: '0 0 15px rgba(255,0,0,0.5)'
                    }}>
                        <p className="text-red-300 font-bold text-sm uppercase">{error}</p>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={onCreateNew}
                    className="w-full p-4 mb-8 bg-yellow-600 hover:bg-yellow-500 border-4 border-yellow-300 font-black text-yellow-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                    style={{
                        fontFamily: 'monospace',
                        boxShadow: '0 0 20px rgba(255,255,0,0.6)',
                        textShadow: '2px 2px 0 #000',
                        letterSpacing: '2px'
                    }}
                >
                    + CREATE NEW TOURNAMENT
                </button>

                {/* Tournaments List */}
                <div className="border-4 p-6 bg-gray-900" style={{
                    borderColor: '#ff00ff',
                    boxShadow: 'inset 0 0 10px rgba(255,0,255,0.3), 0 0 20px rgba(255,0,255,0.5)'
                }}>
                    <h2 className="text-2xl font-black text-center mb-6 uppercase" style={{
                        color: '#ff00ff',
                        textShadow: '0 0 10px #ff00ff',
                        fontFamily: 'monospace',
                        letterSpacing: '3px'
                    }}>
                        OPEN TOURNAMENTS ({tournaments.length})
                    </h2>

                    {tournaments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                                NO OPEN TOURNAMENTS
                            </p>
                            <p className="text-gray-600 text-sm" style={{ fontFamily: 'monospace' }}>
                                BE THE FIRST TO CREATE ONE!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tournaments.map((tournament) => (
                                <div
                                    key={tournament.id}
                                    className="bg-black border-4 border-cyan-400 p-6 transition-all duration-200 hover:border-yellow-300"
                                    style={{
                                        boxShadow: '0 0 10px rgba(0,255,255,0.3)',
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-white mb-1" style={{
                                                textShadow: '0 0 5px #fff'
                                            }}>
                                                {tournament.name}
                                            </h3>
                                            <p className="text-gray-500 text-xs mb-2 uppercase">
                                                {tournament.description || 'NO DESCRIPTION'}
                                            </p>
                                            <div className="flex gap-4 text-xs">
                                                <span className="text-cyan-400 font-bold">
                                                    ⚔️ {tournament.max_participants}-PLAYER
                                                </span>
                                                <span className="text-green-400 font-bold">
                                                    🟢 OPEN
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleJoinTournament(tournament.id)}
                                            disabled={joining === tournament.id}
                                            className="px-6 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 border-4 border-green-400 disabled:border-gray-600 font-black text-green-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                                            style={{
                                                fontFamily: 'monospace',
                                                boxShadow: joining === tournament.id ? 'none' : '0 0 15px rgba(0,255,0,0.5)',
                                                textShadow: '2px 2px 0 #000'
                                            }}
                                        >
                                            {joining === tournament.id ? '...' : 'JOIN'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="w-full mt-6 p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                    style={{
                        fontFamily: 'monospace',
                        boxShadow: '0 0 15px rgba(255,0,0,0.5)',
                        textShadow: '2px 2px 0 #000'
                    }}
                >
                    &lt;&lt; BACK
                </button>

                <p className="text-green-400 font-bold text-sm text-center mt-6" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #00ff00'
                }}>
                    &gt;&gt;&gt; CHOOSE YOUR BATTLE &lt;&lt;&lt;
                </p>
            </div>
        </div>
    )
}