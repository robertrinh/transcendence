import { assertIsNotNull, resetState } from './lib'
import { gameOnlineLobby } from './gameOnline'
import { gameOfflineLobby } from './gameOffline'
import { GameMode } from '../components/game/types'

export default async function gameInit (
    gameMode: GameMode, websocket: WebSocket, ownName: string, oppName: string
) {
    resetState()
    let canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null
    if (canvas === null) {
        console.error('Canvas element not found! GameCanvas component must render first.')
        return
    }
    
    const ctx = canvas.getContext("2d", {alpha: false})
    assertIsNotNull(ctx)
    
    const drawCanvas = document.createElement("canvas")
    assertIsNotNull(drawCanvas)
    
    canvas.setAttribute("tabindex", "0")
    canvas.setAttribute("width", "1024")
    canvas.setAttribute("height", "768")
    
    drawCanvas.width = canvas.width
    drawCanvas.height = canvas.height
    
    const drawCtx = drawCanvas.getContext("2d", {alpha: false})
    assertIsNotNull(drawCtx)
    canvas.focus()
    switch (gameMode) {
        case "singleplayer":
        case "multiplayer":
            await gameOfflineLobby(
                gameMode, canvas, ctx, drawCanvas, drawCtx, ownName)
            break
        case "online":
            await gameOnlineLobby(
                canvas, ctx, drawCanvas, drawCtx, websocket, ownName, oppName)
    }
}