import { assertIsNotNull } from './lib'
import { gameOnlineLobby } from './gameOnline'
import { gameOfflineLobby } from './gameOffline'

class GameState {
    runGame = true

    stopGame() {
        this.runGame = false
        console.log("Stopping game...")
        const canvasEle = document.getElementById("game-canvas")
        if (canvasEle !== null) {
            canvasEle.remove()
        }
    }

    startGame() {
        this.runGame = true
        console.log("Starting game...")
    }
}

export const gameInstance = new GameState

export default async function gameInit (gameMode: string, socket?: WebSocket) {
    let canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null
    if (canvas === null) {
        canvas = document.createElement("canvas")
        assertIsNotNull(canvas)
        canvas.setAttribute("id", "game-canvas")
        canvas.setAttribute("class", "m-auto my-8 overflow-hidden bg-white border-4 border-indigo-500 w-[60%]")
    }
    const ctx = canvas.getContext("2d")
    assertIsNotNull(ctx)
    canvas.setAttribute("tabindex", "0")
    canvas.setAttribute("width", "1024")
    canvas.setAttribute("height", "768")
    const main = document.getElementById('main')
    assertIsNotNull(main)
    main.insertAdjacentElement('afterend', canvas)
    console.log(`GAMING MODE: ${gameMode}`)
    if (socket === undefined) {
        await gameOfflineLobby(gameMode, canvas, ctx)
    }
    else {
        await gameOnlineLobby(canvas, ctx, socket)
    }
}