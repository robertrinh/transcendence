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
            onTournamentCreated(data.data.id, data.data.max_participants)
        } catch (err: any) {
            setError(err.message)
            console.error('Failed to create tournament:', err)
        } finally {
            setLoading(false)
        }
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

            <div className="relative z-10 w-full max-w-md">
                <h1 className="text-4xl font-black text-center mb-2" style={{
                    color: '#ffff00',
                    textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 3px 3px 0 #ff00ff',
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}>
                    CREATE TOURNAMENT
                </h1>

                <div className="border-4 p-8 bg-gray-900" style={{
                    borderColor: '#ffff00',
                    boxShadow: 'inset 0 0 10px rgba(255,255,0,0.3), 0 0 20px rgba(255,255,0,0.5)'
                }}>
                    {error && (
                        <div className="bg-red-900 border-4 border-red-400 p-4 mb-6 text-center" style={{
                            fontFamily: 'monospace',
                            boxShadow: '0 0 15px rgba(255,0,0,0.5)'
                        }}>
                            <p className="text-red-300 font-bold text-sm uppercase">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Tournament Name */}
                        <div>
                            <label className="block text-yellow-300 font-bold mb-2 uppercase text-sm" style={{
                                fontFamily: 'monospace',
                                textShadow: '0 0 5px #ffff00'
                            }}>
                                &gt; TOURNAMENT NAME
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="w-full bg-black border-4 border-purple-500 text-green-400 px-4 py-3 focus:outline-none focus:border-yellow-300 disabled:opacity-50"
                                style={{
                                    fontFamily: 'monospace',
                                    boxShadow: '0 0 10px rgba(168,85,247,0.3)',
                                    textShadow: '0 0 5px #00ff00'
                                }}
                                placeholder="ENTER NAME..."
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-yellow-300 font-bold mb-2 uppercase text-sm" style={{
                                fontFamily: 'monospace',
                                textShadow: '0 0 5px #ffff00'
                            }}>
                                &gt; DESCRIPTION (OPTIONAL)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                className="w-full bg-black border-4 border-purple-500 text-green-400 px-4 py-3 focus:outline-none focus:border-yellow-300 disabled:opacity-50 h-20 resize-none"
                                style={{
                                    fontFamily: 'monospace',
                                    boxShadow: '0 0 10px rgba(168,85,247,0.3)',
                                    textShadow: '0 0 5px #00ff00'
                                }}
                                placeholder="ENTER DESCRIPTION..."
                            />
                        </div>

                        {/* Max Participants */}
                        <div>
                            <label className="block text-yellow-300 font-bold mb-3 uppercase text-sm" style={{
                                fontFamily: 'monospace',
                                textShadow: '0 0 5px #ffff00'
                            }}>
                                &gt; MAX PLAYERS
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[4, 8, 16].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setMaxParticipants(num)}
                                        disabled={loading}
                                        className={`p-4 font-black text-xl uppercase border-4 transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                                            maxParticipants === num
                                                ? 'bg-yellow-600 border-yellow-300 text-yellow-300'
                                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-yellow-300'
                                        }`}
                                        style={{
                                            fontFamily: 'monospace',
                                            boxShadow: maxParticipants === num
                                                ? '0 0 20px rgba(255,255,0,0.6), inset 0 0 10px rgba(255,255,0,0.3)'
                                                : 'none',
                                            textShadow: maxParticipants === num ? '2px 2px 0 #000' : 'none'
                                        }}
                                    >
                                        {num}
                                        <div className="text-xs mt-1">PLAYERS</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleCreate}
                            disabled={loading || !name.trim()}
                            className="flex-1 p-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:border-gray-600 border-4 border-yellow-300 font-black text-yellow-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                            style={{
                                fontFamily: 'monospace',
                                boxShadow: loading || !name.trim() ? 'none' : '0 0 20px rgba(255,255,0,0.6)',
                                textShadow: '2px 2px 0 #000'
                            }}
                        >
                            {loading ? 'CREATING...' : 'CREATE'}
                        </button>
                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="flex-1 p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
                            style={{
                                fontFamily: 'monospace',
                                boxShadow: '0 0 15px rgba(255,0,0,0.5)',
                                textShadow: '2px 2px 0 #000'
                            }}
                        >
                            BACK
                        </button>
                    </div>
                </div>

                <p className="text-green-400 font-bold text-sm text-center mt-6" style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #00ff00'
                }}>
                    &gt;&gt;&gt; BUILD YOUR ARENA &lt;&lt;&lt;
                </p>
            </div>
        </div>
    )
}