import {useEffect} from 'react'
import gameInit from '../static/game.js'
import { gameInstance } from '../static/game.js'

interface GameCanvas {
    mode: string
}

export default function GameCanvas({mode}:GameCanvas) {
    useEffect(() => {
    async function wrapper() {
        await gameInit(mode)
    }
    gameInstance.startGame()
    wrapper()
    return () => {
      gameInstance.stopGame()
    }
  }, [mode])
  return (
    <canvas id="game-canvas" className="m-auto my-8 overflow-hidden bg-white border-4 border-indigo-500">
    </canvas>
  )
}