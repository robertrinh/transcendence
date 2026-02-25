interface MainMenuProps {
  onModeSelect: (mode: 'singleplayer' | 'multiplayer' | 'tournament') => void
}

export default function MainMenu({ onModeSelect }: MainMenuProps) {
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
        {/* Game Title */}
        <h1 className="text-7xl font-black mb-2 text-center" style={{
          color: '#00ff00',
          textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 3px 3px 0 #ff00ff',
          fontFamily: 'monospace',
          letterSpacing: '4px'
        }}>
          PONG
        </h1>
        
        <div className="border-4 border-yellow-300 p-8 mb-8 bg-gray-900" style={{
          boxShadow: 'inset 0 0 10px rgba(255,255,0,0.3), 0 0 20px rgba(255,0,255,0.5)'
        }}>
          <p className="text-yellow-300 text-2xl mb-4 font-bold" style={{
            textShadow: '2px 2px 0 #ff00ff',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            SELECT YOUR GAME MODE
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Single Player */}
            <button
              onClick={() => onModeSelect('singleplayer')}
              className="group relative p-6 bg-blue-900 hover:bg-blue-700 border-4 border-cyan-400 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-5xl mb-3">🤖</div>
              <h2 className="text-2xl font-black text-cyan-300 mb-2 uppercase" style={{fontFamily: 'monospace'}}>
                Single
              </h2>
              <p className="text-cyan-200 text-sm font-bold uppercase" style={{fontFamily: 'monospace'}}>
                vs AI
              </p>
              <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400" style={{boxShadow: '0 0 10px #00ffff'}}></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400" style={{boxShadow: '0 0 10px #00ffff'}}></div>
            </button>

            {/* Multiplayer */}
            <button
              onClick={() => onModeSelect('multiplayer')}
              className="group relative p-6 bg-red-900 hover:bg-red-700 border-4 border-red-400 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(255,0,0,0.3), 0 0 20px rgba(255,0,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-5xl mb-3">👥</div>
              <h2 className="text-2xl font-black text-red-300 mb-2 uppercase" style={{fontFamily: 'monospace'}}>
                Multi
              </h2>
              <p className="text-red-200 text-sm font-bold uppercase" style={{fontFamily: 'monospace'}}>
                2 Players
              </p>
              <div className="absolute top-0 left-0 w-2 h-2 bg-red-400" style={{boxShadow: '0 0 10px #ff0000'}}></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-400" style={{boxShadow: '0 0 10px #ff0000'}}></div>
            </button>

            {/* Tournament */}
            <button
              onClick={() => onModeSelect('tournament')}
              className="group relative p-6 bg-yellow-900 hover:bg-yellow-700 border-4 border-yellow-300 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(255,255,0,0.3), 0 0 20px rgba(255,255,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-2xl font-black text-yellow-300 mb-2 uppercase" style={{fontFamily: 'monospace'}}>
                Tourney
              </h2>
              <p className="text-yellow-200 text-sm font-bold uppercase" style={{fontFamily: 'monospace'}}>
                Online
              </p>
              <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400" style={{boxShadow: '0 0 10px #ffff00'}}></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-400" style={{boxShadow: '0 0 10px #ffff00'}}></div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-green-400 font-bold text-sm" style={{fontFamily: 'monospace', textShadow: '0 0 10px #00ff00'}}>
          &gt;&gt;&gt; INSERT COIN TO CONTINUE &lt;&lt;&lt;
        </p>
      </div>
    </div>
  )
}