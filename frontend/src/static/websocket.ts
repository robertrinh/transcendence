const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME as string
const gameServerPort = import.meta.env.VITE_GAME_SERVER_PORT as string
const websocket = new WebSocket(`ws://${serverHostname}:${gameServerPort}`)

websocket.onclose = () => {
    console.log(`[connection closed]`)
}

websocket.onopen = () => {
    console.log(`[connection opened]`)
}

websocket.onerror = () => {
    console.log(`[error on connection]`)
}

export default websocket
