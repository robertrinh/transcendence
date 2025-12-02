import React, {useEffect} from 'react'
import gameInit from '../static/game.js'

interface GameCanvas {
    mode: string
    socket: WebSocket | undefined | null
}

export default function GameCanvas({mode, socket}:GameCanvas) {
    useEffect(() => {
    async function wrapper() {
      if (socket === null || socket === undefined) {
        await gameInit(mode, undefined)
      }
      else {
        await gameInit(mode, socket)
      }
    }
    wrapper()
  }, [mode])
  return (
    <canvas id="game-canvas" className="m-auto my-8 overflow-hidden bg-white border-4 border-indigo-500">
    </canvas>
  )
}