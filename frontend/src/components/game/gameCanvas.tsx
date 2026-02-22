import {useEffect} from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'

interface GameCanvas {
    mode: string
	websocket: React.RefObject<null | WebSocket>
}

export default function GameCanvas({mode, websocket}:GameCanvas) {
    useEffect(() => {
        async function wrapper() {
            await gameInit(mode, websocket.current!)
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
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <canvas id="game-canvas" className="border-4 border-indigo-500 bg-white"></canvas>
        </div>
      )
}

// import { useEffect, useRef } from 'react'
// import gameInit from '../../static/game.js'
// import { resetState } from '../../static/lib.js'

// interface GameCanvas {
//     mode: string
//     websocket: React.RefObject<null | WebSocket>
// }

// export default function GameCanvas({mode, websocket}:GameCanvas) {
//     const canvasRef = useRef<HTMLCanvasElement>(null)
//     const gameInitialized = useRef(false)
    
//     useEffect(() => {
//         if (!canvasRef.current || !websocket.current) return

//         // Don't reinitialize if already running
//         if (gameInitialized.current) return

//         // Auto-focus canvas for keyboard input
//         canvasRef.current.focus()
//         console.log('🎮 Initializing game with mode:', mode)

//         async function initGame() {
//             try {
//                 gameInitialized.current = true
//                 await gameInit(mode, websocket.current!)
//                 console.log('✅ Game started')
//             } catch (error) {
//                 console.error('Game initialization failed:', error)
//                 gameInitialized.current = false
//             }
//         }

//         initGame()

//         return () => {
//             gameInitialized.current = false
//             resetState()
//             // Clear canvas
//             if (canvasRef.current) {
//                 const ctx = canvasRef.current.getContext('2d')
//                 if (ctx) {
//                     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
//                 }
//             }
//         }
//     }, [mode, websocket])

//     return (
//         <div className="w-full h-full flex items-center justify-center bg-gray-900">
//             <canvas 
//                 ref={canvasRef}
//                 id="game-canvas" 
//                 className="border-4 border-indigo-500 bg-white"
//                 width={1024}
//                 height={768}
//                 tabIndex={0}
//             />
//         </div>
//     )
// }