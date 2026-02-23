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
                if (!response.ok) throw new Error('Failed to fetch tournaments')
                
                const data = await response.json()
                console.log('📋 Available tournaments:', data.data)
                
                // ✅ Filter only OPEN tournaments
                const openTournaments = data.data.filter((t: Tournament) => t.status === 'open')
                setTournaments(openTournaments)
                setError(null)
            } catch (err) {
                console.error('❌ Failed to fetch tournaments:', err)
                setError(String(err))
            } finally {
                setLoading(false)
            }
        }

        fetchTournaments()
        
        // Poll every 3 seconds for new tournaments
        const interval = setInterval(fetchTournaments, 3000)
        return () => clearInterval(interval)
    }, [])

    // ✅ AUTO-JOIN IF tournamentId IS PROVIDED
    useEffect(() => {
        if (tournamentId) {
            console.log('🎯 Auto-joining tournament:', tournamentId)
            handleJoinTournament(tournamentId)
        }
    }, [tournamentId])

    const handleJoinTournament = async (tournamentId: number) => {
        setJoining(tournamentId)
        
        try {
            const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})  // ✅ ADD THIS - Send empty object
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Failed to join tournament')
            }

            const data = await response.json()
            console.log('✅ Joined tournament:', data)
            
            const tourResponse = await fetch(`/api/tournaments/${tournamentId}`)
            const tourData = await tourResponse.json()
            onTournamentJoined(tournamentId, tourData.data.max_participants)
        } catch (err: any) {
            console.error('❌ Failed to join:', err)
            setError(err.message)
            setJoining(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <p className="text-cyan-400 text-xl animate-pulse font-arcade">SEARCHING FOR TOURNAMENTS...</p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-2xl">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-cyan-400 uppercase tracking-widest font-arcade mb-2">
                        TOURNAMENTS
                    </h1>
                    <p className="text-gray-400 text-sm font-arcade">Join an existing tournament or create your own</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border-2 border-red-500 text-red-400 p-4 rounded-lg mb-8 font-arcade text-center text-sm">
                        {error}
                    </div>
                )}

                {/* Create Button */}
                <div className="mb-12">
                    <button
                        onClick={onCreateNew}
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade border-2 border-cyan-400"
                    >
                        + CREATE NEW TOURNAMENT
                    </button>
                </div>

                {/* Tournaments List */}
                <div>
                    <h2 className="text-2xl font-bold text-cyan-400 uppercase mb-6 tracking-wider font-arcade">
                        OPEN TOURNAMENTS ({tournaments.length})
                    </h2>

                    {tournaments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900 border-4 border-cyan-400/20 rounded-xl">
                            <p className="text-gray-400 text-lg font-arcade mb-6">No open tournaments available</p>
                            <p className="text-gray-500 text-sm font-arcade">Be the first to create one!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tournaments.map((tournament) => (
                                <div
                                    key={tournament.id}
                                    className="bg-gray-900 border-4 border-cyan-400 rounded-lg p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white mb-2 font-arcade">
                                                {tournament.name}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-3 font-arcade">
                                                {tournament.description || 'No description'}
                                            </p>
                                            <div className="flex gap-4 text-xs font-arcade">
                                                <span className="text-cyan-400 font-bold">
                                                    {tournament.max_participants}-PLAYER TOURNAMENT
                                                </span>
                                                <span className="text-green-400 font-bold">
                                                    STATUS: OPEN
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleJoinTournament(tournament.id)}
                                            disabled={joining === tournament.id}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade border-2 border-green-500 whitespace-nowrap"
                                        >
                                            {joining === tournament.id ? 'JOINING...' : 'JOIN'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <button
                        onClick={onBack}
                        className="w-full bg-transparent border-2 border-gray-500 text-gray-400 hover:border-gray-400 hover:text-gray-300 font-bold py-3 px-4 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade"
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
    )
}