import {useEffect, useState} from 'react'
import gameInit from '../../static/game.js'
import { resetState } from '../../static/lib.js'
import useGameStore from '../util/gameStore.ts'
import Button from './button.tsx'

interface GameCanvas {
    mode: string
	websocket: React.RefObject<null | WebSocket>
}

export default function GameCanvas({mode, websocket}:GameCanvas) {
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
    async function wrapper() {
        await gameInit(mode, websocket.current!)
    }
    wrapper()
    const setTrue = () => setShowMenu(true)
    const setFalse = () => setShowMenu(false)

    window.addEventListener("gameOfflineEnd", setTrue)
    window.addEventListener("gameOfflineResume", setFalse)
    return () => {
      resetState()
      window.removeEventListener("gameOfflineEnd", setTrue)
      window.removeEventListener("gameOfflineResume", setFalse)
    }
  }, [])
  return (
    <div className="relative m-auto w-full my-8">
        <canvas id="game-canvas" className="block mx-auto bg-white border-4 border-indigo-500" />
        {showMenu && (
          <div className="absolute inset-x flex justify-center" style={{top: '83%', left: '50%'}}>
            <Button
              id="btn-main-menu"
              className={"bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-8 uppercase rounded-xl"}
			        buttonName='Back to Game Menu'
              onClick={() => {useGameStore.getState().setScreen('main'); useGameStore.getState().setGameMode('none')}}
            />
          </div>
        )}
    </div>
  )
}