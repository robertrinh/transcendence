import {useEffect} from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'
import { GameMode } from './types.js'

interface GameCanvas {
    mode: GameMode
    websocket: React.RefObject<null | WebSocket>
    ownName: string
    oppName: string
    ownAvatar?: string
    oppAvatar?: string
}

export default function GameCanvas({mode, websocket, ownName, oppName, ownAvatar, oppAvatar}:GameCanvas) {
    const displayOppName = (oppName === 'UNKNOWN' || mode === 'singleplayer') ? 'BOT' : oppName
    useEffect(() => {
        async function wrapper() {
            await gameInit(mode, websocket.current!, ownName, oppName)
        }
        wrapper()
        return () => {
              const gameCanvas = document.getElementById("game-canvas")
              if (gameCanvas !== null) {
                gameCanvas.remove()
              }
              resetState()
        }
      }, [])
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
            {/* Avatar bar — same width as canvas (1024px) with thin border */}
            <div className="flex justify-between items-center px-4 py-2"
                style={{
                    width: '1024px',
                    border: '3px solid rgb(255, 255, 255)',
                    borderRadius: '8px 8px 8px 8px',
                    backgroundColor: 'rgba(0,0,0,0.4)'
                }}
            >
                {/* Player 1 — Left */}
                <div className="flex items-center gap-3">
                    <div className="rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                            width: '130px',
                            height: '60px',
                            minWidth: '120px',
                            minHeight: '50px',
                            background: '#00d4ff',
                            border: '2px solid #00d4ff',
                            boxShadow: '0 0 10px #00d4ff'
                        }}
                    >
                        {ownAvatar ? (
                            <img
                                src={ownAvatar}
                                // alt={ownName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-2xl font-bold">
                                {ownName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <p className="font-bold text-xl" style={{
                        fontFamily: 'monospace',
                        color: '#00d4ff',
                        textShadow: '0 0 12px #00d4ff'
                    }}>
                        {ownName}
                    </p>
                </div>

                <p className="font-bold text-xl" style={{
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.6)',
                }}>
                    VS
                </p>

                {/* Player 2 — Right */}
                <div className="flex items-center gap-3">
                    <p className="font-bold text-xl" style={{
                        fontFamily: 'monospace',
                        color: '#ff6600',
                        textShadow: '0 0 12px #ff6600'
                    }}>
                        {displayOppName}
                    </p>
                    <div className="rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                            width: '130px',
                            height: '60px',
                            minWidth: '120px',
                            minHeight: '50px',
                            background: '#ff6600',
                            border: '2px solid #ff6600',
                            boxShadow: '0 0 10px #ff6600'
                        }}
                    >
                        {oppAvatar ? (
                            <img
                                src={oppAvatar}
                                // alt={displayOppName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-2xl font-bold">
                                {displayOppName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <br></br><br></br>
            {/* Game Canvas */}
            <canvas id="game-canvas" className="border-4 border-indigo-500 bg-white"></canvas>
        </div>
      )
    //   return (
    //     <div className="w-full h-full border-full flex flex-col items-center justify-center bg-gray-900">
    //         {/* Avatar bar above canvas */}
    //         <div className="w-[1024] h-full flex flex-col items-center justify-center bg-gray-900 border-2 border-white rounded-xl">
    //             {/* Player 1 — Left */}
    //             <div className="flex items-center gap-3">
    //                 <div className="rounded-xl overflow-hidden flex items-center justify-center"
    //                         style={{
    //                             width: '140px',
    //                             height: '70px',
    //                             minWidth: '130px',
    //                             minHeight: '60px',
    //                             background: '#00d4ff',
    //                             border: '2px solid #00d4ff',
    //                             boxShadow: '0 0 10px #00d4ff'
    //                         }}
    //                     >
    //                     {ownAvatar ? (
    //                     <img
    //                         src={ownAvatar}
    //                         alt={ownName}
    //                         // className="w-20 h-15 rounded-xl object-cover"
    //                         style={{
    //                             border: '2px solid #00d4ff',
    //                             boxShadow: '0 0 10px rgba(0,212,255,0.5)'
    //                         }}
    //                     />
    //                     ) : (
    //                         <div className="w-20 h-15 rounded-xl object-cover">
    //                                 <span className="text-white text-3xl font-bold">
    //                                     {ownName.charAt(0).toUpperCase()}
    //                                 </span>
    //                             </div>
    //                     )}
    //                 </div>
    //                 <br></br>
    //                 <p className="font-bold text-3xl" style={{
    //                     fontFamily: 'monospace',
    //                     color: '#00d4ff',
    //                     textShadow: '0 0 18px #00d4ff'
    //                 }}>
    //                     {ownName}
    //                 </p>
    //             </div>

    //             <p className="font-bold text-2xl" style={{
    //                 fontFamily: 'monospace',
    //                 color: '#fffbfbd6',
    //             }}>
    //                 VS
    //             </p>

    //             {/* Player 2 — Right */}
    //             <div className="flex items-center gap-3">
    //                 <p className="font-bold text-3xl" style={{
    //                     fontFamily: 'monospace',
    //                     color: '#ff6600',
    //                     textShadow: '0 0 18px #ff6600'
    //                 }}>
    //                     {displayOppName}
    //                 </p>
    //                 <br></br>
    //                 {oppAvatar ? (
    //                 <img
    //                     src={oppAvatar}
    //                     alt={oppName}
    //                     className="rounded-xl overflow-hidden flex items-center justify-center"
    //                     style={{
    //                         border: '2px solid #ff6600',
    //                         boxShadow: '0 0 10px#ff6600'
    //                     }}
    //                 /> ) : (
    //                     <div className="rounded-xl overflow-hidden flex items-center justify-center"
    //                         style={{
    //                             width: '140px',
    //                             height: '70px',
    //                             minWidth: '130px',
    //                             minHeight: '60px',
    //                             background: '#ff6600',
    //                             border: '2px solid #ff6600',
    //                             boxShadow: '0 0 10px #ff6600'
    //                         }}
    //                     >
    //                         <span className="text-white text-3xl font-bold">
    //                             {displayOppName.charAt(0).toUpperCase()}
    //                         </span>
    //                     </div>
    //                 )}
    //             </div>
    //         </div>
    //         <br></br>

    //         {/* Game Canvas — untouched */}
    //         <canvas id="game-canvas" className="border-4 border-indigo-500 bg-white"></canvas>
    //     </div>
    //   )
}