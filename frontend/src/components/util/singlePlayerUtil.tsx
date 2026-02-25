interface SinglePlayerMenuProps {
  onSinglePlayer: () => void
  onMultiPlayer: () => void
  onBack: () => void
}

export default function SinglePlayerMenu({ onSinglePlayer, onMultiPlayer, onBack }: SinglePlayerMenuProps) {
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

      <div className="relative z-10 text-center max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 px-6 py-2 border-2 border-green-400 bg-black hover:bg-green-900 text-green-400 font-bold uppercase transition-all"
          style={{
            fontFamily: 'monospace',
            textShadow: '0 0 10px #00ff00',
            boxShadow: '0 0 15px rgba(0,255,0,0.5)'
          }}
        >
          &lt;&lt; BACK
        </button>

        {/* Title */}
        <h1 className="text-6xl font-black mb-2 text-center" style={{
          color: '#00ff00',
          textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 3px 3px 0 #ff00ff',
          fontFamily: 'monospace',
          letterSpacing: '4px'
        }}>
          LOCAL PLAY
        </h1>

        <div className="border-4 border-cyan-400 p-8 mb-8 bg-gray-900" style={{
          boxShadow: 'inset 0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.5)'
        }}>
          <p className="text-cyan-300 text-xl mb-8 font-bold" style={{
            textShadow: '2px 2px 0 #ff00ff',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            CHOOSE YOUR GAME MODE
          </p>

          <div className="space-y-6">
            {/* Single Player vs AI */}
            <button
              onClick={onSinglePlayer}
              className="w-full p-6 bg-blue-900 hover:bg-blue-700 border-4 border-cyan-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">🤖</div>
              <h2 className="text-2xl font-black text-cyan-300 uppercase" style={{fontFamily: 'monospace'}}>
                Single Player
              </h2>
              <p className="text-cyan-200 text-sm font-bold mt-2" style={{fontFamily: 'monospace'}}>
                PLAY AGAINST AI
              </p>
            </button>

            {/* Multiplayer Local */}
            <button
              onClick={onMultiPlayer}
              className="w-full p-6 bg-red-900 hover:bg-red-700 border-4 border-red-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(255,0,0,0.3), 0 0 20px rgba(255,0,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">👥</div>
              <h2 className="text-2xl font-black text-red-300 uppercase" style={{fontFamily: 'monospace'}}>
                Multiplayer
              </h2>
              <p className="text-red-200 text-sm font-bold mt-2" style={{fontFamily: 'monospace'}}>
                PLAY WITH FRIEND
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-green-400 font-bold text-sm" style={{fontFamily: 'monospace', textShadow: '0 0 10px #00ff00'}}>
          &gt;&gt;&gt; PRESS START &lt;&lt;&lt;
        </p>
      </div>
    </div>
  )
}