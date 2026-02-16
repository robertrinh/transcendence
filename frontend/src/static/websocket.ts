const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME
const gameServerPort = import.meta.env.VITE_GAME_SERVER_PORT
// A little bit illegal because it's similar to this: 
// https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production#why-is-node_env-considered-an-antipattern
const useWSS = Number(import.meta.env.VITE_USE_WSS)
let url = `ws://${serverHostname}:${gameServerPort}`
if (useWSS === 1) {
    url = `wss://${serverHostname}/ws/`
}
const websocket = new WebSocket(url)
export default websocket
