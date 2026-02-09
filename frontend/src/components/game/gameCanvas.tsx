import {useEffect} from 'react'
import gameInit from '../../static/game.js'
import { gameInstance } from '../../static/game.js'

interface GameCanvas {
    mode: string
    socket: WebSocket | undefined | null
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
    <canvas 
      id="game-canvas" className="m-auto my-8 bg-white border-4 border-indigo-500"
      width="1024"
      height="768"
      tabIndex={0}
      >
    </canvas>
  )
}