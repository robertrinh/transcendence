import { useEffect, useState } from 'react'

interface CountdownScreenProps {
  gameData: any
  websocket: React.MutableRefObject<WebSocket | null>
  onCountdownComplete: () => void
  gameMode: string
  currentUserId?: number
}

export default function CountdownScreen({ 
  gameData,
  websocket,
  onCountdownComplete, 
  gameMode,
  currentUserId,
}: CountdownScreenProps) {
  const [count, setCount] = useState(3)

  const getModeLabel = () => {
    switch (gameMode) {
      case 'singleplayer': return '🤖 VS BOT'
      case 'multiplayer': return '🎮 LOCAL PVP'
      case 'online': return '🌐 ONLINE MATCH'
      default: return '🏓 PONG'
    }
  }

  // Connect WebSocket for online games
  useEffect(() => {
    if (!websocket.current) {
      throw Error("Missing WebSocket connection in CountdownScreen component")
    }
    if (gameMode !== 'online' || !gameData?.id) {
      return
    }
    // Buffer any messages received during countdown so GameCanvas can replay them
    const bufferedMessages: MessageEvent[] = []
    websocket.current.onmessage = (event) => {
      bufferedMessages.push(event)
    }
    // Attach buffer to websocket so GameCanvas can access it
    (websocket.current as any).__bufferedMessages = bufferedMessages
    websocket.current!.send(JSON.stringify({
      type: 'START_GAME',
      game_id: gameData.id,
      player1_id: gameData.player1_id,
      player2_id: gameData.player2_id
    }))
    return () => {
      // Don't close — GameCanvas needs it
    }
  }, [gameMode, gameData, currentUserId, websocket])

  // Countdown timer
  useEffect(() => {
    if (count <= 0) {
      const goTimer = setTimeout(() => {
        onCountdownComplete()
      }, 500)
      return () => clearTimeout(goTimer)
    }

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onCountdownComplete])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
      backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 20px'
    }}>
      <div className="relative z-10 text-center">
        <p className="text-cyan-400 text-2xl font-bold mb-8 uppercase" style={{
          fontFamily: 'monospace',
          textShadow: '0 0 10px #00ffff'
        }}>
          {getModeLabel()}
        </p>

        {!wsReady && gameMode === 'online' ? (
          <div className="text-yellow-300 text-3xl font-bold animate-pulse" style={{
            fontFamily: 'monospace',
            textShadow: '0 0 10px #ffff00'
          }}>
            CONNECTING TO SERVER...
          </div>
        ) : (
          <div className="text-9xl font-black mb-8" style={{
            color: count === 1 ? '#ff0000' : count === 0 ? '#00ffff' : '#00ff00',
            textShadow: count === 1 
              ? '0 0 30px #ff0000, 0 0 60px #ff0000' 
              : '0 0 30px #00ff00, 0 0 60px #00ff00',
            fontFamily: 'monospace',
            animation: count === 0 ? 'none' : 'pulse 1s infinite'
          }}>
            {count > 0 ? count : 'GO!'}
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  )
}