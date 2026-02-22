// dark mode
// import { useState } from 'react'

// interface MultiplayerMenuProps {
//   onBack: () => void
//   onRandomPlayer: () => Promise<void>
//   onHostLobby: () => Promise<void>
//   onJoinLobby: (lobbyId: string) => Promise<void>
// }

// export default function MultiplayerMenu({
//   onBack,
//   onRandomPlayer,
//   onHostLobby,
//   onJoinLobby,
// }: MultiplayerMenuProps) {
//   const [showJoinLobby, setShowJoinLobby] = useState(false)
//   const [lobbyIdInput, setLobbyIdInput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const handleRandomClick = async () => {
//     setIsLoading(true)
//     try {
//       await onRandomPlayer()
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleHostClick = async () => {
//     setIsLoading(true)
//     try {
//       await onHostLobby()
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleJoinClick = async () => {
//     if (!lobbyIdInput.trim()) {
//       alert('Please enter a lobby ID')
//       return
//     }
//     setIsLoading(true)
//     try {
//       await onJoinLobby(lobbyIdInput)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
//       <div className="w-full max-w-md">
//         <button
//           onClick={() => showJoinLobby ? setShowJoinLobby(false) : onBack}
//           className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
//         >
//           ← Back to Menu
//         </button>

//         <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
//           {!showJoinLobby ? (
//             <>
//               <h2 className="text-3xl font-bold text-white mb-2">Multiplayer</h2>
//               <p className="text-gray-400 mb-8">Choose how to play</p>

//               <div className="space-y-4">
//                 {/* Play with Random Player */}
//                 <button
//                   onClick={handleRandomClick}
//                   disabled={isLoading}
//                   className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin">⟳</div>
//                       Connecting...
//                     </>
//                   ) : (
//                     <>
//                       🎲
//                       Play with Random Player
//                     </>
//                   )}
//                 </button>

//                 {/* Host Private Lobby */}
//                 <button
//                   onClick={handleHostClick}
//                   disabled={isLoading}
//                   className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin">⟳</div>
//                       Creating Lobby...
//                     </>
//                   ) : (
//                     <>
//                       🏠
//                       Host Private Lobby
//                     </>
//                   )}
//                 </button>

//                 {/* Join Private Lobby */}
//                 <button
//                   onClick={() => setShowJoinLobby(true)}
//                   className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
//                 >
//                   🔗
//                   Join Private Lobby
//                 </button>
//               </div>
//             </>
//           ) : (
//             <>
//               <h2 className="text-3xl font-bold text-white mb-2">Join Lobby</h2>
//               <p className="text-gray-400 mb-8">Enter your friend's lobby ID</p>

//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   value={lobbyIdInput}
//                   onChange={(e) => setLobbyIdInput(e.target.value.toUpperCase())}
//                   placeholder="Enter lobby ID (e.g., ABC123)"
//                   className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-200"
//                 />

//                 <div className="flex gap-4">
//                   <button
//                     onClick={() => setShowJoinLobby(false)}
//                     className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={handleJoinClick}
//                     disabled={isLoading}
//                     className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg"
//                   >
//                     {isLoading ? 'Joining...' : 'Join'}
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// retro mode
interface MultiplayerMenuProps {
  onPlayRandom: () => void
  onHostLobby: () => void
  onJoinLobby: () => void
  onTournament: () => void
  onBack: () => void
}

export default function MultiplayerMenu({
  onPlayRandom,
  onHostLobby,
  onJoinLobby,
  onTournament,
  onBack,
}: MultiplayerMenuProps) {
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

      <div className="relative z-10 text-center max-w-3xl">
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
          color: '#ff00ff',
          textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 3px 3px 0 #00ffff',
          fontFamily: 'monospace',
          letterSpacing: '4px'
        }}>
          ONLINE ARENA
        </h1>

        <div className="border-4 border-magenta-400 p-8 mb-8 bg-gray-900" style={{
          boxShadow: 'inset 0 0 10px rgba(255,0,255,0.3), 0 0 20px rgba(255,0,255,0.5)',
          borderColor: '#ff00ff'
        }}>
          <p className="text-pink-300 text-xl mb-8 font-bold" style={{
            textShadow: '2px 2px 0 #00ffff',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            SELECT BATTLE MODE
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Play Random */}
            <button
              onClick={onPlayRandom}
              className="p-6 bg-green-900 hover:bg-green-700 border-4 border-green-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0,255,0,0.3), 0 0 20px rgba(0,255,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">🎲</div>
              <h2 className="text-2xl font-black text-green-300 uppercase" style={{fontFamily: 'monospace'}}>
                Random Match
              </h2>
              <p className="text-green-200 text-xs font-bold mt-2" style={{fontFamily: 'monospace'}}>
                FIND OPPONENT
              </p>
            </button>

            {/* Host Lobby */}
            <button
              onClick={onHostLobby}
              className="p-6 bg-blue-900 hover:bg-blue-700 border-4 border-blue-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0,150,255,0.3), 0 0 20px rgba(0,150,255,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">🏠</div>
              <h2 className="text-2xl font-black text-blue-300 uppercase" style={{fontFamily: 'monospace'}}>
                Host Lobby
              </h2>
              <p className="text-blue-200 text-xs font-bold mt-2" style={{fontFamily: 'monospace'}}>
                CREATE PRIVATE ROOM
              </p>
            </button>

            {/* Join Lobby */}
            <button
              onClick={onJoinLobby}
              className="p-6 bg-purple-900 hover:bg-purple-700 border-4 border-purple-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">🔗</div>
              <h2 className="text-2xl font-black text-purple-300 uppercase" style={{fontFamily: 'monospace'}}>
                Join Lobby
              </h2>
              <p className="text-purple-200 text-xs font-bold mt-2" style={{fontFamily: 'monospace'}}>
                ENTER ROOM CODE
              </p>
            </button>

            {/* Tournament */}
            <button
              onClick={onTournament}
              className="p-6 bg-yellow-900 hover:bg-yellow-700 border-4 border-yellow-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                boxShadow: 'inset 0 0 10px rgba(255,255,0,0.3), 0 0 20px rgba(255,255,0,0.5)',
                textShadow: '2px 2px 0 #000'
              }}
            >
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-black text-yellow-300 uppercase" style={{fontFamily: 'monospace'}}>
                Tournament
              </h2>
              <p className="text-yellow-200 text-xs font-bold mt-2" style={{fontFamily: 'monospace'}}>
                COMPETE FOR GLORY
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-green-400 font-bold text-sm" style={{fontFamily: 'monospace', textShadow: '0 0 10px #00ff00'}}>
          &gt;&gt;&gt; CHOOSE YOUR DESTINY &lt;&lt;&lt;
        </p>
      </div>
    </div>
  )
}