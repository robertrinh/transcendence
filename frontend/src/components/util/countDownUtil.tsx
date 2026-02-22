import { useEffect, useState } from 'react'

interface CountdownScreenProps {
  onCountdownComplete: () => void
  gameMode: string
}

export default function CountdownScreen({ onCountdownComplete, gameMode }: CountdownScreenProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count <= 0) {
      onCountdownComplete()
      return
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
  )
}