import {useState} from 'react'
import GameUI from '../components/gameUI.js'
import GameCanvas from '../components/gameCanvas.js'
import websocket from '../static/websocket.js'

export default function Game() {
  const [gameMode, setGameMode] = useState("none")

  function updateGameMode(gameMode: string) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  websocket.onmessage = function(ev) {
    console.log(`[message received] ${ev.data}\n`)
    const JSONObject = JSON.parse(ev.data)
    console.log(JSONObject)
    switch (JSONObject.type) {
      case "LOBBY_ID":
        // paste the lobby id to the page
        const inputEle = document.getElementById("req-lobby-id") as
        HTMLInputElement | null
        if (inputEle === null) {
          throw Error("inputEle cannot be null")
        }
        inputEle.value = JSONObject.lobby_id
    }
  }

  return (
    <main className='w-80% m-auto my-4' id='main'>
      <h1 className="text-4xl font-bold text-center mb-8">Pong Game</h1>
      <GameUI onGameModeSelect={updateGameMode}></GameUI>
      {gameMode !== "none" && <GameCanvas mode={gameMode}></GameCanvas>}
    </main>
  )
}
