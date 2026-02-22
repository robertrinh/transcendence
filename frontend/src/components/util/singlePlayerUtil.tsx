// darkmode
// import { useState } from 'react'

// interface SinglePlayerMenuProps {
//   onBack: () => void
//   onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void
// }

// export default function SinglePlayerMenu({ onBack, onStartGame }: SinglePlayerMenuProps) {
//   const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

//   const difficultyInfo = {
//     easy: { description: 'AI moves slower, easier to beat', speed: 'Slow' },
//     medium: { description: 'Balanced difficulty, good challenge', speed: 'Normal' },
//     hard: { description: 'AI moves faster, very challenging', speed: 'Fast' }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
//       <div className="w-full max-w-md">
//         <button
//           onClick={onBack}
//           className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
//         >
//           ← Back to Menu
//         </button>

//         <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
//           <h2 className="text-3xl font-bold text-white mb-2">Single Player</h2>
//           <p className="text-gray-400 mb-8">Choose your difficulty level</p>

//           <div className="space-y-4 mb-8">
//             {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
//               <button
//                 key={difficulty}
//                 onClick={() => setSelectedDifficulty(difficulty)}
//                 className={`w-full p-4 rounded-lg transition-all duration-200 text-left ${
//                   selectedDifficulty === difficulty
//                     ? 'bg-blue-600 border-2 border-blue-400 shadow-lg'
//                     : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-white font-bold capitalize">{difficulty}</h3>
//                     <p className="text-sm text-gray-300">{difficultyInfo[difficulty].description}</p>
//                   </div>
//                   <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
//                     selectedDifficulty === difficulty
//                       ? 'bg-blue-400 border-blue-400'
//                       : 'border-gray-500'
//                   }`}>
//                     {selectedDifficulty === difficulty && <div className="w-2 h-2 bg-white rounded-full"></div>}
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>

//           {/* Info Box */}
//           <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-8">
//             <p className="text-blue-200 text-sm">
//               <strong>Speed:</strong> {difficultyInfo[selectedDifficulty].speed}
//             </p>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4">
//             <button
//               onClick={onBack}
//               className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => onStartGame(selectedDifficulty)}
//               className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg"
//             >
//               Start Game
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// retro mode
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