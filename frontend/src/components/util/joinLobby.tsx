import { useState } from 'react'

interface JoinLobbyProps {
  onJoin: (lobbyId: string) => void
  onBack: () => void
}

export default function JoinLobby({ onJoin, onBack }: JoinLobbyProps) {
  const [lobbyInput, setLobbyInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleJoin = () => {
    const trimmed = lobbyInput.trim()
    if (trimmed.length === 0) {
      setError('Please enter a lobby code')
      return
    }
    setError(null)
    onJoin(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin()
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
        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-8 uppercase" style={{
          fontFamily: 'monospace',
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
        }}>
          🎮 JOIN LOBBY
        </h1>

        {/* Join Card */}
        <div className="bg-gray-900 border-4 border-cyan-400 rounded-xl p-8" style={{
          boxShadow: '0 0 30px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.05)'
        }}>
          {/* Input Label */}
          <p className="text-gray-400 text-sm mb-2 uppercase" style={{ fontFamily: 'monospace' }}>
            Enter Lobby Code
          </p>

          {/* Input Field */}
          <input
            type="text"
            value={lobbyInput}
            onChange={(e) => { setLobbyInput(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. abc123"
            autoFocus
            className="w-full bg-black border-2 border-cyan-600 rounded-lg p-4 text-cyan-300 text-xl font-bold tracking-widest text-center mb-4 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 placeholder-gray-600 transition-all"
            style={{
              fontFamily: 'monospace',
              textShadow: '0 0 5px #00ffff'
            }}
          />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'monospace' }}>
                ❌ {error}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm" style={{ fontFamily: 'monospace' }}>
              📌 Ask your friend for the lobby code.
            </p>
            <p className="text-gray-300 text-sm mt-1" style={{ fontFamily: 'monospace' }}>
              📌 Enter the code above and press <span className="text-green-400">JOIN</span>.
            </p>
            <p className="text-gray-300 text-sm mt-1" style={{ fontFamily: 'monospace' }}>
              📌 Press <span className="text-cyan-400">Enter</span> to quick join.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: 'monospace',
                backgroundColor: '#dc2626',
                color: 'white',
                boxShadow: '0 0 15px rgba(220,38,38,0.5)',
                border: '2px solid #ef4444'
              }}
            >
              ✖ BACK
            </button>
            <button
              onClick={handleJoin}
              className="flex-1 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: 'monospace',
                backgroundColor: lobbyInput.trim().length > 0 ? '#22c55e' : '#374151',
                color: 'white',
                boxShadow: lobbyInput.trim().length > 0 ? '0 0 15px rgba(34,197,94,0.5)' : 'none',
                border: lobbyInput.trim().length > 0 ? '2px solid #4ade80' : '2px solid #4b5563'
              }}
            >
              ▶ JOIN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}