import {useEffect} from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'

interface GameCanvas {
    mode: string
}

export default function GameCanvas({mode}:GameCanvas) {
    useEffect(() => {
    async function wrapper() {
        await gameInit(mode)
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
    <canvas id="game-canvas" className="m-auto my-8 overflow-hidden bg-white border-4 border-indigo-500">
    </canvas>
  )
}