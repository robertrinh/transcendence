import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'

interface ReadyRoomProps {
  gameData: any
  gameMode: string
  currentUser: any
  onBothReady: () => void
  onBack: () => void
}

export default function ReadyRoom({
  gameData,
  gameMode,
  currentUser,
  onBothReady,
  onBack
}: ReadyRoomProps) {
  const [myReady, setMyReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [bothReady, setBothReady] = useState(false)

  const isPlayer1 = Number(currentUser?.id) === Number(gameData?.player1_id)
  const myName = currentUser?.username || currentUser?.display_name || (isPlayer1 ? 'Player 1' : 'Player 2')
  const opponentId = isPlayer1 ? gameData?.player2_id : gameData?.player1_id
  const opponentName = `Player #${opponentId}`

  // Debug logging
  useEffect(() => {
    console.log('🔍 ReadyRoom DEBUG:')
    console.log('  currentUser?.id:', currentUser?.id, typeof currentUser?.id)
    console.log('  gameData?.player1_id:', gameData?.player1_id, typeof gameData?.player1_id)
    console.log('  gameData?.player2_id:', gameData?.player2_id, typeof gameData?.player2_id)
    console.log('  isPlayer1:', isPlayer1)
  }, [currentUser, gameData, isPlayer1])

  // For local games, skip ready room
  const isLocalGame = gameMode === 'singleplayer' || gameMode === 'multiplayer'
  useEffect(() => {
    if (isLocalGame) {
      onBothReady()
    }
  }, [isLocalGame, onBothReady])

  // Loading state - wait for currentUser
  if (!currentUser && !isLocalGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-cyan-400 text-2xl animate-pulse" style={{ fontFamily: 'monospace' }}>
          Loading player data...
        </p>
      </div>
    )
  }

  // Send ready to backend
  const handleReady = async () => {
    try {
      const response = await fetchWithAuth('/api/games/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameData.id }),
      })
      const data = await response.json()
      console.log('🟢 Ready response:', data)
      if (data.success) {
        setMyReady(true)
        if (data.data.all_ready) {
          setOpponentReady(true)
          setBothReady(true)
        }
      }
    } catch (err) {
      console.error('Failed to set ready:', err)
    }
  }

  // Poll for opponent ready status after clicking ready
  useEffect(() => {
    if (!myReady || bothReady || !gameData?.id) return

    const interval = setInterval(async () => {
      try {
        const response = await fetchWithAuth(`/api/games/${gameData.id}/ready`)
        const data = await response.json()
        console.log('🔄 Ready poll:', data)

        if (data.success && data.data) {
          const { player1_ready, player2_ready, all_ready } = data.data

          if (isPlayer1) {
            setOpponentReady(player2_ready)
          } else {
            setOpponentReady(player1_ready)
          }

          if (all_ready) {
            setBothReady(true)
            clearInterval(interval)
          }
        }
      } catch (err) {
        console.error('Ready poll error:', err)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [myReady, bothReady, gameData, isPlayer1])

  // When both ready, proceed to countdown
  useEffect(() => {
    if (bothReady) {
      const timer = setTimeout(() => {
        onBothReady()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [bothReady, onBothReady])

  if (isLocalGame) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
      backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 20px'
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
      }}></div>

      <div className="relative z-10 w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center mb-2 uppercase" style={{
          fontFamily: 'monospace',
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
        }}>
          ⚔️ MATCH FOUND
        </h1>
        <p className="text-gray-400 text-center mb-8" style={{ fontFamily: 'monospace' }}>
          Both players must be ready to start
        </p>

        <div className="bg-gray-900 border-4 border-cyan-400 rounded-xl p-8" style={{
          boxShadow: '0 0 30px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.05)'
        }}>
          {/* VS Layout */}
          <div className="flex items-center justify-between gap-4 mb-8">

            {/* You */}
            <div className="flex-1 text-center">
              <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                myReady
                  ? 'border-green-400 bg-green-900/30'
                  : 'border-cyan-600 bg-cyan-900/20'
              }`} style={{
                boxShadow: myReady ? '0 0 20px rgba(74,222,128,0.4)' : '0 0 10px rgba(0,255,255,0.2)'
              }}>
                <div className="text-4xl mb-3">
                  {myReady ? '✅' : '🎮'}
                </div>
                <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'monospace' }}>
                  {myName}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'monospace' }}>
                  (YOU)
                </p>
                <p className="text-sm mt-2" style={{
                  fontFamily: 'monospace',
                  color: myReady ? '#4ade80' : '#fbbf24'
                }}>
                  {myReady ? 'READY!' : 'NOT READY'}
                </p>
              </div>
            </div>

            {/* VS */}
            <div className="flex-shrink-0">
              <span className="text-3xl font-black" style={{
                fontFamily: 'monospace',
                color: '#ff6b6b',
                textShadow: '0 0 10px #ff6b6b, 0 0 20px #ff6b6b'
              }}>
                VS
              </span>
            </div>

            {/* Opponent */}
            <div className="flex-1 text-center">
              <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                opponentReady
                  ? 'border-green-400 bg-green-900/30'
                  : 'border-gray-600 bg-gray-800/50'
              }`} style={{
                boxShadow: opponentReady ? '0 0 20px rgba(74,222,128,0.4)' : 'none'
              }}>
                <div className="text-4xl mb-3">
                  {opponentReady ? '✅' : '⏳'}
                </div>
                <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'monospace' }}>
                  {opponentName}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'monospace' }}>
                  (OPPONENT)
                </p>
                <p className="text-sm mt-2" style={{
                  fontFamily: 'monospace',
                  color: opponentReady ? '#4ade80' : '#fbbf24'
                }}>
                  {opponentReady ? 'READY!' : 'WAITING...'}
                </p>
              </div>
            </div>
          </div>

          {/* Game Info */}
          {gameData?.id && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 text-center">
              <p className="text-gray-400 text-xs" style={{ fontFamily: 'monospace' }}>
                GAME #{gameData.id}
              </p>
            </div>
          )}

          {/* Both Ready */}
          {bothReady && (
            <div className="text-center mb-6 animate-pulse">
              <p className="text-green-400 text-2xl font-bold" style={{
                fontFamily: 'monospace',
                textShadow: '0 0 15px #4ade80'
              }}>
                🚀 BOTH READY — STARTING!
              </p>
            </div>
          )}

          {/* Waiting for opponent */}
          {myReady && !bothReady && (
            <div className="text-center mb-6">
              <p className="text-green-400 font-bold mb-3" style={{ fontFamily: 'monospace' }}>
                ✅ You are ready!
              </p>
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-yellow-400 text-sm" style={{ fontFamily: 'monospace' }}>
                Waiting for opponent...
              </p>
            </div>
          )}

          {/* Ready Button */}
          {!myReady && !bothReady && (
            <button
              onClick={handleReady}
              className="w-full py-4 rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'monospace',
                backgroundColor: '#22c55e',
                color: 'white',
                boxShadow: '0 0 20px rgba(34,197,94,0.5)',
                border: '3px solid #4ade80',
                textShadow: '0 0 5px rgba(0,0,0,0.5)'
              }}
            >
              ✋ I'M READY!
            </button>
          )}

          {/* Leave Button */}
          {!bothReady && (
            <button
              onClick={onBack}
              className="w-full mt-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: 'monospace',
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '2px solid #ef4444'
              }}
            >
              ✖ LEAVE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}