import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'

interface TournamentLobbyProps {
    tournamentId: number | null
    maxParticipants: number
    onStartTournament: () => void
    onLeaveTournament: () => void
    websocket: React.RefObject<WebSocket | null>
}

interface Participant {
    user_id: number
    username: string
    display_name: string
    joined_at: string
}

interface Tournament {
    id: number
    name: string
    max_participants: number
    status: string
    created_at: string
}

export default function TournamentLobby({
    tournamentId,
    maxParticipants,
    onStartTournament,
    onLeaveTournament,
    websocket
}: TournamentLobbyProps) {
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [starting, setStarting] = useState(false)

    // WebSocket listener
    useEffect(() => {
        if (!websocket?.current) return

        const handleWebSocketMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'tournament_started' && data.tournamentId === tournamentId) {
                    onStartTournament()
                }
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err)
            }
        }

        websocket.current.addEventListener('message', handleWebSocketMessage)
        return () => {
            websocket.current?.removeEventListener('message', handleWebSocketMessage)
        }
    }, [tournamentId, onStartTournament, websocket])

    // Polling
    useEffect(() => {
        if (!tournamentId) return

        const fetchTournamentStatus = async () => {
            try {
                const response = await fetch(`/api/tournaments/${tournamentId}`)
                if (!response.ok) throw new Error('Failed to fetch tournament')

                const data = await response.json()
                console.log('🔄 Tournament poll:', data)
                setTournament(data.data)
                setParticipants(data.participants || [])
                setError(null)
                setLoading(false)

                // If tournament already started (another player clicked start), go to bracket
                if (data.data.status === 'ongoing') {
                    onStartTournament()
                }
            } catch (err) {
                console.error('❌ Failed to fetch tournament status:', err)
                setError(String(err))
            }
        }

        fetchTournamentStatus()
        const interval = setInterval(fetchTournamentStatus, 2000)
        return () => clearInterval(interval)
    }, [tournamentId, onStartTournament])

    const handleStartTournament = async () => {
        try {
            if (!tournamentId) throw new Error('Tournament ID is required')
            setStarting(true)
            setError(null)

            const response = await fetchWithAuth(
                `/api/tournaments/${tournamentId}/start`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                }
            )

            const result = await response.json()
            if (!response.ok) throw new Error(result.message || result.error || 'Failed to start tournament')

            console.log('✅ Tournament started:', result)
            onStartTournament()
        } catch (err: any) {
            console.error('❌ Failed to start tournament:', err)
            setError(err.message)
            setStarting(false)
        }
    }

    const handleLeaveTournament = async () => {
        try {
            const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/leave`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || data.error || 'Failed to leave tournament')
            }
            onLeaveTournament()
        } catch (err: any) {
            console.error('❌ Failed to leave tournament:', err)
            setError(err.message)
        }
    }

    const isFull = participants.length >= maxParticipants
    const spotsRemaining = Math.max(0, maxParticipants - participants.length)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black" style={{
                backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }}>
                <div className="text-center">
                    <p className="text-yellow-300 text-2xl animate-pulse font-bold" style={{
                        fontFamily: 'monospace',
                        textShadow: '0 0 10px #ffff00'
                    }}>
                        LOADING TOURNAMENT...
                    </p>
                    <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: 'monospace' }}>
                        ID: {tournamentId}
                    </p>
                </div>
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
                <h1 className="text-4xl font-black text-center mb-1" style={{
                    color: '#ffff00',
                    textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
                    TOURNAMENT LOBBY
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6" style={{ fontFamily: 'monospace' }}>
                    ID: {tournamentId}
                </p>

                {error && (
                    <div className="bg-red-900 border-4 border-red-400 p-4 mb-6 text-center" style={{
                        fontFamily: 'monospace',
                        boxShadow: '0 0 15px rgba(255,0,0,0.5)'
                    }}>
                        <p className="text-red-300 font-bold text-sm uppercase">{error}</p>
                    </div>
                )}

                <div className="border-4 p-8 bg-gray-900" style={{
                    borderColor: '#ff00ff',
                    boxShadow: 'inset 0 0 10px rgba(255,0,255,0.3), 0 0 20px rgba(255,0,255,0.5)'
                }}>
                    {/* Tournament Info */}
                    {tournament && (
                        <div className="bg-black border-4 border-cyan-400 p-4 mb-6" style={{
                            boxShadow: '0 0 10px rgba(0,255,255,0.3)',
                            fontFamily: 'monospace'
                        }}>
                            <h2 className="text-2xl font-black text-white mb-2" style={{
                                textShadow: '0 0 5px #fff'
                            }}>
                                {tournament.name}
                            </h2>
                            <div className="flex justify-between items-center">
                                <span className="text-cyan-400 font-bold text-sm">
                                    ⚔️ {maxParticipants}-PLAYER TOURNAMENT
                                </span>
                                <span className="text-purple-300 font-bold text-sm">
                                    STATUS: <span style={{ color: '#ffff00', textShadow: '0 0 5px #ffff00' }}>
                                        {tournament.status.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Participants Header */}
                    <h3 className="text-lg font-black mb-4 uppercase" style={{
                        color: '#00ffff',
                        textShadow: '0 0 10px #00ffff',
                        fontFamily: 'monospace',
                        letterSpacing: '2px'
                    }}>
                        PLAYERS ({participants.length}/{maxParticipants})
                    </h3>

                    {/* Participants List */}
                    <div className="bg-black border-4 border-gray-700 mb-6 max-h-80 overflow-y-auto">
                        {participants.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-600 font-bold animate-pulse" style={{ fontFamily: 'monospace' }}>
                                    WAITING FOR PLAYERS...
                                </p>
                            </div>
                        ) : (
                            <>
                                {participants.map((participant, index) => (
                                    <div
                                        key={participant.user_id}
                                        className="flex items-center gap-4 px-4 py-3 border-b-2 border-gray-800"
                                        style={{ fontFamily: 'monospace' }}
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-600 border-2 border-yellow-300 text-black font-black text-sm flex-shrink-0" style={{
                                            boxShadow: '0 0 10px rgba(255,255,0,0.4)'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span className="flex-1 text-white font-bold" style={{
                                            textShadow: '0 0 3px #fff'
                                        }}>
                                            {participant.display_name || participant.username}
                                        </span>
                                        <span className="text-green-400 text-xs font-bold" style={{
                                            textShadow: '0 0 5px #00ff00'
                                        }}>
                                            ✓ JOINED
                                        </span>
                                    </div>
                                ))}

                                {/* Empty slots */}
                                {Array.from({ length: spotsRemaining }).map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className="flex items-center gap-4 px-4 py-3 border-b-2 border-gray-800 opacity-30"
                                        style={{ fontFamily: 'monospace' }}
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-800 border-2 border-gray-600 text-gray-600 font-black text-sm flex-shrink-0">
                                            {participants.length + index + 1}
                                        </div>
                                        <span className="flex-1 text-gray-600 italic font-bold">
                                            WAITING...
                                        </span>
                                        <span className="text-gray-700 text-xs">—</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Status */}
                    <div className="p-4 mb-6 text-center border-4" style={{
                        fontFamily: 'monospace',
                        backgroundColor: isFull ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,0,0.1)',
                        borderColor: isFull ? '#00ff00' : '#ffff00',
                        boxShadow: isFull ? '0 0 15px rgba(0,255,0,0.4)' : '0 0 15px rgba(255,255,0,0.4)'
                    }}>
                        <p className="font-black text-lg uppercase" style={{
                            color: isFull ? '#00ff00' : '#ffff00',
                            textShadow: isFull ? '0 0 10px #00ff00' : '0 0 10px #ffff00'
                        }}>
                            {isFull
                                ? '🎉 TOURNAMENT FULL! READY TO START'
                                : `⏳ WAITING FOR ${spotsRemaining} MORE PLAYER${spotsRemaining !== 1 ? 'S' : ''}...`
                            }
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        {isFull && (
                            <button
                                onClick={handleStartTournament}
                                disabled={starting}
                                className="flex-1 p-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:border-gray-600 border-4 border-green-400 font-black text-green-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                                style={{
                                    fontFamily: 'monospace',
                                    boxShadow: starting ? 'none' : '0 0 20px rgba(0,255,0,0.6)',
                                    textShadow: '2px 2px 0 #000',
                                    letterSpacing: '2px'
                                }}
                            >
                                {starting ? 'STARTING...' : 'START TOURNAMENT'}
                            </button>
                        )}

                        <button
                            onClick={handleLeaveTournament}
                            className={`${isFull ? 'flex-1' : 'w-full'} p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95`}
                            style={{
                                fontFamily: 'monospace',
                                boxShadow: '0 0 15px rgba(255,0,0,0.5)',
                                textShadow: '2px 2px 0 #000'
                            }}
                        >
                            LEAVE TOURNAMENT
                        </button>
                    </div>
                </div>

                <p className="text-green-400 font-bold text-sm text-center mt-6" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #00ff00'
                }}>
                    &gt;&gt;&gt; GATHERING WARRIORS &lt;&lt;&lt;
                </p>
            </div>
        </div>
    )
}