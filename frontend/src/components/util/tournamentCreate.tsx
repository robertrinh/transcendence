import { useState } from 'react'
import { fetchWithAuth } from '../../config/api'

interface TournamentCreateProps {
    onTournamentCreated: (tournamentId: number, maxParticipants: number) => void
    onBack: () => void
}

export default function TournamentCreate({ onTournamentCreated, onBack }: TournamentCreateProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [maxParticipants, setMaxParticipants] = useState(4)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Tournament name is required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetchWithAuth('/api/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    max_participants: maxParticipants
                })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Failed to create tournament')
            }

            const data = await response.json()
            console.log('✅ Tournament created:', data.data.id)
            
            // ✅ Pass tournament ID back to parent
            onTournamentCreated(data.data.id, data.data.max_participants)
        } catch (err: any) {
            setError(err.message)
            console.error('❌ Failed to create tournament:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-900 border-4 border-cyan-400 rounded-xl p-10 shadow-2xl shadow-cyan-500/20">
                
                <h1 className="text-4xl font-bold text-cyan-400 text-center mb-8 uppercase tracking-widest font-arcade">
                    CREATE TOURNAMENT
                </h1>

                {error && (
                    <div className="bg-red-500/10 border-2 border-red-500 text-red-400 p-4 rounded-lg mb-6 font-arcade text-center text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Tournament Name */}
                    <div>
                        <label className="block text-cyan-400 font-bold mb-2 uppercase font-arcade text-sm">
                            Tournament Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full bg-gray-800 border-2 border-cyan-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:bg-gray-700 font-arcade disabled:opacity-50"
                            placeholder="Enter tournament name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-cyan-400 font-bold mb-2 uppercase font-arcade text-sm">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            className="w-full bg-gray-800 border-2 border-cyan-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:bg-gray-700 font-arcade h-20 disabled:opacity-50"
                            placeholder="Enter tournament description"
                        />
                    </div>

                    {/* Max Participants */}
                    <div>
                        <label className="block text-cyan-400 font-bold mb-2 uppercase font-arcade text-sm">
                            Max Players
                        </label>
                        <select
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                            disabled={loading}
                            className="w-full bg-gray-800 border-2 border-cyan-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:bg-gray-700 font-arcade disabled:opacity-50"
                        >
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleCreate}
                        disabled={loading || !name.trim()}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade border-2 border-cyan-500"
                    >
                        {loading ? 'CREATING...' : 'CREATE'}
                    </button>
                    <button
                        onClick={onBack}
                        disabled={loading}
                        className="flex-1 bg-transparent border-2 border-gray-500 text-gray-400 hover:border-gray-400 hover:text-gray-300 font-bold py-3 px-4 rounded-lg transition-all duration-200 uppercase tracking-wide font-arcade disabled:opacity-50"
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
    )
}