import { useEffect, useState } from 'react'
import { fetchWithAuth } from '../../config/api'

interface CountdownScreenProps {
  gameData: any
  websocket: React.RefObject<WebSocket | null>
  onCountdownComplete: () => void
  gameMode: string
  currentUserId?: number
}

export default function CountdownScreen({ 
  gameData,
  websocket,
  onCountdownComplete, 
  gameMode,
  currentUserId
}: CountdownScreenProps) {
  const [count, setCount] = useState(3)
  const [player1Ready, setPlayer1Ready] = useState(false)
  const [player2Ready, setPlayer2Ready] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ DETERMINE WHICH PLAYER IS THE CURRENT USER
  const isPlayer1 = currentUserId === gameData?.player1_id
  const isPlayer2 = currentUserId === gameData?.player2_id

  // ✅ CHECK IF USER IS ASSIGNED TO THIS GAME
  useEffect(() => {
    if (!gameData || !currentUserId) return;

    if (gameData.player1_id !== currentUserId && gameData.player2_id !== currentUserId) {
      setError('❌ You are not assigned to this game!');
      console.error('User not authorized for this game');
    }
  }, [gameData, currentUserId]);

  // ✅ LISTEN FOR READY STATUS FROM WEBSOCKET
  useEffect(() => {
    if (!websocket?.current) return;

    const handleReadyEvent = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'player_ready') {
          console.log('🎮 Player ready status:', data);
          setPlayer1Ready(data.player1_ready);
          setPlayer2Ready(data.player2_ready);
          
          // ✅ If both ready, start countdown
          if (data.player1_ready && data.player2_ready) {
            console.log('✅ Both players ready! Starting countdown...');
            setShowCountdown(true);
          }
        }
      } catch (err) {
        console.error('Failed to parse ready event:', err);
      }
    };

    websocket.current.addEventListener('message', handleReadyEvent);
    return () => websocket.current?.removeEventListener('message', handleReadyEvent);
  }, [websocket]);

  // ✅ COUNTDOWN TIMER
  useEffect(() => {
    if (!showCountdown || count <= 0) {
      if (count <= 0 && showCountdown) {
        onCountdownComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, showCountdown, onCountdownComplete]);

  // ✅ HANDLE READY BUTTON CLICK
  const handleReadyClick = async () => {
    try {
      const response = await fetchWithAuth(`/api/games/${gameData.id}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark as ready');
      }
      
      setIsReady(true);
      console.log('✅ You marked as ready');
    } catch (err) {
      setError(`❌ ${String(err)}`);
      console.error('Failed to mark ready:', err);
    }
  };

  // ✅ SHOW ERROR IF NOT AUTHORIZED
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md bg-gray-900 border-4 border-red-500 rounded-xl p-10 text-center">
          <p className="text-red-400 text-xl font-arcade">{error}</p>
        </div>
      </div>
    );
  }

  // ✅ IF NOT BOTH READY YET, SHOW READY SCREEN
  if (!showCountdown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
        backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px'
      }}>
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
        }}></div>

        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-4xl font-bold text-cyan-400 text-center mb-8 font-arcade">GET READY!</h1>
          
          {/* ✅ ONLY SHOW YOUR BUTTON */}
          <div className="mb-6 p-4 bg-cyan-500/10 border-2 border-cyan-400 rounded-lg">
            <p className="text-white font-bold mb-2 font-arcade">
              {isPlayer1 ? 'YOU (Player 1)' : isPlayer2 ? 'YOU (Player 2)' : 'YOU'}
            </p>
            <button
              onClick={handleReadyClick}
              disabled={isReady}
              className={`w-full font-bold py-3 rounded-lg font-arcade transition-all ${
                isReady 
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {isReady ? '✓ READY' : 'CLICK TO BE READY'}
            </button>
          </div>

          {/* ✅ SHOW OPPONENT'S STATUS */}
          <div className="mb-8 p-4 bg-gray-800 border-2 border-gray-600 rounded-lg">
            <p className="text-gray-400 font-bold mb-2 font-arcade">
              {isPlayer1 ? 'OPPONENT (Player 2)' : isPlayer2 ? 'OPPONENT (Player 1)' : 'OPPONENT'}
            </p>
            {isPlayer1 && player2Ready ? (
              <p className="text-green-400 font-arcade font-bold">✓ READY</p>
            ) : isPlayer2 && player1Ready ? (
              <p className="text-green-400 font-arcade font-bold">✓ READY</p>
            ) : (
              <p className="text-yellow-400 font-arcade animate-pulse">⏳ WAITING...</p>
            )}
          </div>

          <p className="text-gray-400 text-sm font-arcade text-center">
            Both players must click READY to start
          </p>
        </div>
      </div>
    );
  }

  // ✅ SHOW COUNTDOWN (after both ready)
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{
      backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e), linear-gradient(45deg, #1a1a2e 25%, transparent 25%, transparent 75%, #1a1a2e 75%, #1a1a2e)',
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 20px'
    }}>
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
      }}></div>

      <div className="relative z-10 text-center">
        <p className="text-cyan-400 text-2xl font-bold mb-8 uppercase" style={{
          fontFamily: 'monospace',
          textShadow: '0 0 10px #00ffff'
        }}>
          {gameMode === 'singleplayer' ? '🤖 Preparing AI Opponent' : '👥 Game Starting'}
        </p>

        <div className="text-9xl font-black mb-8" style={{
          color: count === 1 ? '#ff0000' : '#00ff00',
          textShadow: count === 1 
            ? '0 0 30px #ff0000, 0 0 60px #ff0000' 
            : '0 0 30px #00ff00, 0 0 60px #00ff00',
          fontFamily: 'monospace',
          transition: 'all 0.3s ease',
          animation: count === 0 ? 'none' : 'pulse 1s infinite'
        }}>
          {count > 0 ? count : 'GO!'}
        </div>

        <div className="border-4 border-green-400 p-8 bg-gray-900 inline-block" style={{
          boxShadow: '0 0 20px rgba(0,255,0,0.5)'
        }}>
          <p className="text-green-400 font-bold uppercase" style={{
            fontFamily: 'monospace',
            textShadow: '0 0 10px #00ff00'
          }}>
            Get Ready!
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
}