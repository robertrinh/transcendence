import { assertIsNotNull } from './lib.js'
import { gameOnlineLobby } from './gameOnline.js'
import { gameOfflineLobby } from './gameOffline.js'

export default async function gameInit (gameMode: string, socket?: WebSocket) {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null
    assertIsNotNull(canvas)
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