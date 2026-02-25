import {useEffect} from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'
import { GameMode } from './types.js'

interface GameCanvas {
    mode: GameMode
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
