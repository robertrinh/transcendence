import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'
import Button from '../game/button'

interface TournamentLobbyProps {
    tournamentId: number | null
    maxParticipants: number
    onStartTournament: () => void
    onLeaveTournament: () => void
    websocket: React.RefObject<WebSocket | null>  // ✅ Fixed type
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

    // ✅ LISTEN FOR WEBSOCKET TOURNAMENT_STARTED EVENT
    useEffect(() => {
        if (!websocket?.current) {
            console.log('⚠️ WebSocket not available, will use polling fallback')
            return
        }

        const handleWebSocketMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data)
                
                if (data.type === 'tournament_started' && data.tournamentId === tournamentId) {
                    console.log('🎯 WebSocket: Tournament started event received!')
                    console.log('✅ Moving all users to bracket...')
                    onStartTournament()  // All users move to bracket instantly
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

    // ✅ POLLING FALLBACK - fetch every 2 seconds
    useEffect(() => {
        if (!tournamentId) return

        const fetchTournamentStatus = async () => {
            try {
                const response = await fetch(`/api/tournaments/${tournamentId}`)
                if (!response.ok) throw new Error('Failed to fetch tournament')
                
                const data = await response.json()
                console.log('📊 Tournament data:', data)
                
                setTournament(data.data)
                setParticipants(data.participants || [])
                setError(null)
                setLoading(false)

                // ✅ Fallback: if status changed to ongoing, move to bracket
                if (data.data.status === 'ongoing') {
                    console.log('📊 Polling: Tournament status is ongoing, moving to bracket...')
                    onStartTournament()
                }
            } catch (err) {
                console.error('❌ Failed to fetch tournament status:', err)
                setError(String(err))
            }
        }

        // Initial fetch
        fetchTournamentStatus()

        // Poll every 2 seconds
        const interval = setInterval(fetchTournamentStatus, 2000)
        return () => clearInterval(interval)
    }, [tournamentId, onStartTournament])

    // ✅ START TOURNAMENT - Manual button click
    const handleStartTournament = async () => {
        try {
            if (!tournamentId) throw new Error('Tournament ID is required');
            if (participants.length < 2) throw new Error('Need at least 2 participants');
            
            console.log('🎯 Starting tournament with participants:', participants);
            
            const response = await fetchWithAuth(
                `/api/tournaments/${parseInt(String(tournamentId))}/start`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                }
            );
            
            const result = await response.json();
            console.log('📊 Start response:', result);  // ✅ ADD THIS
            
            if (!response.ok) {
                console.error('❌ Server error:', result);
                throw new Error(result.error || 'Failed to start tournament');
            }
            
            console.log('✅ Tournament started successfully');
            onStartTournament();
        } catch (err) {
            console.error('❌ Failed to start tournament:', err);
            setError(String(err));
        }
    };

    // ✅ LEAVE TOURNAMENT - DELETE request
    const handleLeaveTournament = async () => {
        try {
            const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/leave`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error('Failed to leave tournament')
            
            console.log('✅ Left tournament')
            onLeaveTournament()
        } catch (err) {
            console.error('❌ Failed to leave tournament:', err)
            setError(String(err))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <p className="text-cyan-400 text-xl animate-pulse font-arcade mb-4">LOADING TOURNAMENT...</p>
                    <p className="text-gray-400 text-sm">Tournament ID: {tournamentId}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center bg-red-500/10 border-2 border-red-500 p-8 rounded-lg">
                    <p className="text-red-400 text-lg font-arcade mb-4">ERROR</p>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    const isFull = participants.length === maxParticipants
    const spotsRemaining = maxParticipants - participants.length

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-2xl bg-gray-900 border-4 border-cyan-400 rounded-xl p-10 shadow-2xl shadow-cyan-500/20">
                
                {/* Header */}
                <h1 className="text-4xl font-bold text-cyan-400 text-center mb-2 uppercase tracking-widest font-arcade">
                    TOURNAMENT LOBBY
                </h1>
                <p className="text-center text-gray-400 text-sm mb-8 font-arcade">ID: {tournamentId}</p>

                {/* Tournament Info */}
                {tournament && (
                    <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 border-2 border-cyan-400/30 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-3 font-arcade">{tournament.name}</h2>
                        <div className="flex justify-between items-center">
                            <p className="text-cyan-400 font-semibold text-lg font-arcade">{maxParticipants}-PLAYER TOURNAMENT</p>
                            <p className="text-sm text-gray-400 font-arcade">
                                STATUS: <span className="text-cyan-400 font-bold">{tournament.status.toUpperCase()}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Participants */}
                <div className="mb-8">
                    <h3 className="text-cyan-400 text-lg font-bold uppercase mb-4 tracking-wide font-arcade">
                        PARTICIPANTS ({participants.length}/{maxParticipants})
                    </h3>
                    
                    <div className="bg-black/50 border-2 border-cyan-400/30 rounded-lg max-h-96 overflow-y-auto">
                        {participants.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 font-arcade">
                                Waiting for players to join...
                            </div>
                        ) : (
                            <>
                                {/* Joined participants */}
                                {participants.map((participant, index) => (
                                    <div 
                                        key={participant.user_id} 
                                        className="flex items-center gap-4 px-4 py-3 border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors font-arcade"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-cyan-400 text-gray-900 rounded font-bold text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="flex-1 text-white font-bold">
                                            {participant.display_name || participant.username}
                                        </span>
                                        <span className="text-green-400 text-xs font-bold">✓ JOINED</span>
                                    </div>
                                ))}

                                {/* Empty slots */}
                                {Array.from({ length: spotsRemaining }).map((_, index) => (
                                    <div 
                                        key={`empty-${index}`} 
                                        className="flex items-center gap-4 px-4 py-3 border-b border-cyan-400/10 opacity-40 font-arcade"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-700 text-gray-500 rounded font-bold text-sm flex-shrink-0">
                                            {participants.length + index + 1}
                                        </div>
                                        <span className="flex-1 text-gray-500 italic">
                                            WAITING FOR PLAYER...
                                        </span>
                                        <span className="text-gray-700 text-xs">—</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Status Message */}
                <div className={`rounded-lg p-4 mb-8 border-l-4 font-arcade font-bold text-center ${
                    isFull 
                        ? 'bg-green-500/10 border-green-500 text-green-400' 
                        : 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                }`}>
                    {isFull 
                        ? '🎉 TOURNAMENT FULL! READY TO START' 
                        : `⏳ WAITING FOR ${spotsRemaining} MORE PLAYER${spotsRemaining !== 1 ? 'S' : ''}...`
                    }
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    {/* ✅ START button only shows when FULL */}
                    {isFull && (
                        <Button 
                            id='btn-start-tournament'
                            onClick={handleStartTournament}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade border-2 border-green-500"
                            buttonName="START TOURNAMENT"
                        />
                    )}
                    
                    {/* ✅ LEAVE button always shown */}
                    <Button 
                        id='btn-leave-tournament'
                        onClick={handleLeaveTournament}
                        className={`${isFull ? 'flex-1' : 'w-full'} bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold py-3 px-4 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade`}
                        buttonName="LEAVE TOURNAMENT"
                    />
                </div>
            </div>
        </div>
    )
}