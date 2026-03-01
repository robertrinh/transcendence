import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'

interface HostLobbyProps {
  lobbyId: string
  onGameCreated: (gameData: any) => void
  onTimeout: () => void
  onBack: () => void
}

export default function HostLobby({ lobbyId, onTimeout, onGameCreated, onBack }: HostLobbyProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(lobbyId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Poll for opponent joining the lobby
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetchWithAuth('/api/games/joinlobby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lobby_id: lobbyId }),
        })
        const data = await response.json()

        if (data.success && data.data?.id) {
          console.log('Opponent joined! Game:', data.data)
          clearInterval(interval)
          onGameCreated(data.data)
        }
		else if (data.status === 'idle') {
			console.log('player timed out')
        	clearInterval(interval)
			onTimeout()
		}
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [lobbyId])

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
        <h1 className="text-4xl font-bold text-center mb-8 uppercase" style={{
          fontFamily: 'monospace',
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
        }}>
          🏠 HOST LOBBY
        </h1>

        <div className="bg-gray-900 border-4 border-cyan-400 rounded-xl p-8" style={{
          boxShadow: '0 0 30px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.05)'
        }}>
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2 uppercase" style={{ fontFamily: 'monospace' }}>
              Lobby Code
            </p>
            <div className="bg-black border-2 border-cyan-600 rounded-lg p-4 flex items-center justify-between">
              <span className="text-cyan-300 text-2xl font-bold tracking-widest" style={{
                fontFamily: 'monospace',
                textShadow: '0 0 5px #00ffff'
              }}>
                {lobbyId}
              </span>
              <button
                onClick={handleCopy}
                className="ml-4 px-4 py-2 rounded-lg font-bold transition-all duration-200"
                style={{
                  fontFamily: 'monospace',
                  backgroundColor: copied ? '#22c55e' : '#0891b2',
                  color: 'white',
                  boxShadow: copied ? '0 0 15px rgba(34,197,94,0.5)' : '0 0 15px rgba(8,145,178,0.5)'
                }}
              >
                {copied ? '✓ COPIED!' : '📋 COPY'}
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="animate-pulse">
              <span className="text-yellow-400 text-xl" style={{
                fontFamily: 'monospace',
                textShadow: '0 0 10px #ffff00'
              }}>
                ⏳ WAITING FOR OPPONENT...
              </span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm" style={{ fontFamily: 'monospace' }}>
              📌 Share the code above with your friend.
            </p>
            <p className="text-gray-300 text-sm mt-1" style={{ fontFamily: 'monospace' }}>
              📌 They join using <span className="text-cyan-400">Join Lobby</span>.
            </p>
            <p className="text-gray-300 text-sm mt-1" style={{ fontFamily: 'monospace' }}>
              📌 Game starts when both players are ready.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#dc2626',
              color: 'white',
              boxShadow: '0 0 15px rgba(220,38,38,0.5)',
              border: '2px solid #ef4444'
            }}
          >
            ✖ CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}