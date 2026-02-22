// dark mode
// import { useState } from 'react'

// interface TournamentMenuProps {
//   onBack: () => void
//   onStartTournament: (playerCount: number) => void
// }

// export default function TournamentMenu({ onBack, onStartTournament }: TournamentMenuProps) {
//   const [playerCount, setPlayerCount] = useState(4)

//   const tournamentInfo = {
//     4: { rounds: 2, matches: 3, description: 'Quick tournament' },
//     8: { rounds: 3, matches: 7, description: 'Standard tournament' },
//     16: { rounds: 4, matches: 15, description: 'Full tournament' }
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
//           <h2 className="text-3xl font-bold text-white mb-2">Tournament</h2>
//           <p className="text-gray-400 mb-8">Create a tournament bracket</p>

//           {/* Player Count Selection */}
//           <div className="mb-8">
//             <h3 className="text-white font-bold mb-4">Number of Players</h3>
//             <div className="grid grid-cols-3 gap-3">
//               {[4, 8, 16].map((num) => (
//                 <button
//                   key={num}
//                   onClick={() => setPlayerCount(num)}
//                   className={`p-4 rounded-lg font-bold transition-all duration-200 ${
//                     playerCount === num
//                       ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg border-2 border-purple-400'
//                       : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
//                   }`}
//                 >
//                   {num}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Tournament Info */}
//           <div className="bg-purple-900 border border-purple-700 rounded-lg p-4 mb-8 space-y-2">
//             <p className="text-purple-200">
//               <strong>Format:</strong> Single Elimination
//             </p>
//             <p className="text-purple-200">
//               <strong>Rounds:</strong> {tournamentInfo[playerCount as keyof typeof tournamentInfo].rounds}
//             </p>
//             <p className="text-purple-200">
//               <strong>Total Matches:</strong> {tournamentInfo[playerCount as keyof typeof tournamentInfo].matches}
//             </p>
//             <p className="text-purple-300 text-sm mt-3">
//               {tournamentInfo[playerCount as keyof typeof tournamentInfo].description}
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
//               onClick={() => onStartTournament(playerCount)}
//               className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg"
//             >
//               Start Tournament
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// retro mode
import { useState } from 'react'

interface TournamentMenuProps {
  onBack: () => void
  onStartTournament: (playerCount: number) => void
}

export default function TournamentMenu({ onBack, onStartTournament }: TournamentMenuProps) {
  const [playerCount, setPlayerCount] = useState(4)

  const tournamentInfo = {
    4: { rounds: 2, matches: 3, description: 'QUICK TOURNAMENT' },
    8: { rounds: 3, matches: 7, description: 'STANDARD TOURNAMENT' },
    16: { rounds: 4, matches: 15, description: 'FULL TOURNAMENT' }
  }

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
          color: '#ffff00',
          textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 3px 3px 0 #ff00ff',
          fontFamily: 'monospace',
          letterSpacing: '4px'
        }}>
          TOURNAMENT
        </h1>

        <div className="border-4 border-yellow-300 p-8 mb-8 bg-gray-900" style={{
          boxShadow: 'inset 0 0 10px rgba(255,255,0,0.3), 0 0 20px rgba(255,255,0,0.5)',
          borderColor: '#ffff00'
        }}>
          <p className="text-yellow-300 text-xl mb-8 font-bold" style={{
            textShadow: '2px 2px 0 #ff00ff',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            SELECT BRACKET SIZE
          </p>

          {/* Player Count Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4">
              {[4, 8, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={`p-6 font-black text-2xl uppercase border-4 transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                    playerCount === num
                      ? 'bg-yellow-600 border-yellow-300 text-yellow-300'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-yellow-300'
                  }`}
                  style={{
                    fontFamily: 'monospace',
                    boxShadow: playerCount === num 
                      ? '0 0 20px rgba(255,255,0,0.6), inset 0 0 10px rgba(255,255,0,0.3)' 
                      : 'none',
                    textShadow: playerCount === num ? '2px 2px 0 #000' : 'none'
                  }}
                >
                  {num}
                  <div className="text-xs mt-2">PLAYERS</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tournament Info */}
          <div className="bg-purple-900 border-4 border-purple-500 rounded-none p-6 mb-8" style={{
            boxShadow: '0 0 15px rgba(168,85,247,0.5)',
            fontFamily: 'monospace'
          }}>
            <p className="text-purple-200 text-sm font-bold mb-2 uppercase">
              📊 FORMAT: SINGLE ELIMINATION
            </p>
            <p className="text-purple-200 text-sm font-bold mb-2 uppercase">
              🔄 ROUNDS: {tournamentInfo[playerCount as keyof typeof tournamentInfo].rounds}
            </p>
            <p className="text-purple-200 text-sm font-bold mb-3 uppercase">
              ⚔️ TOTAL MATCHES: {tournamentInfo[playerCount as keyof typeof tournamentInfo].matches}
            </p>
            <p className="text-purple-300 text-sm font-bold uppercase" style={{
              textShadow: '0 0 10px #ff00ff'
            }}>
              &gt;&gt;&gt; {tournamentInfo[playerCount as keyof typeof tournamentInfo].description} &lt;&lt;&lt;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <button
              onClick={onBack}
              className="flex-1 p-4 bg-red-900 hover:bg-red-700 border-4 border-red-400 font-black text-red-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'monospace',
                boxShadow: '0 0 15px rgba(255,0,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              CANCEL
            </button>
            <button
              onClick={() => onStartTournament(playerCount)}
              className="flex-1 p-4 bg-yellow-600 hover:bg-yellow-500 border-4 border-yellow-300 font-black text-yellow-300 uppercase transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'monospace',
                boxShadow: '0 0 20px rgba(255,255,0,0.6)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              START TOURNAMENT
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-green-400 font-bold text-sm" style={{fontFamily: 'monospace', textShadow: '0 0 10px #00ff00'}}>
          &gt;&gt;&gt; MAY THE BEST PLAYER WIN &lt;&lt;&lt;
        </p>
      </div>
    </div>
  )
}