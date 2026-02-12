const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME as string
const gameServerPort = import.meta.env.VITE_GAME_SERVER_PORT as string
const websocket = new WebSocket(`ws://${serverHostname}:${gameServerPort}`)
export default websocket
