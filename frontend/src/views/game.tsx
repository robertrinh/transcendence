import {useState} from 'react'
import GameUI from '../components/gameUI.js'
import GameCanvas from '../components/gameCanvas.js'

export default function Game() {
  const [gameMode, setGameMode] = useState("none")
  const [socket, setSocket] = useState<WebSocket | null>(null)

  function updateGameMode(gameMode: string) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  function connectToServer(jsonMessage: any) {
    if (socket !== null) {
      return
    }
    const ws = new WebSocket("ws://localhost:8081")
    setSocket(ws)

    ws.onopen = function() {
      console.log("[connection opened]\n")
      ws.send(jsonMessage)
    }
    ws.onclose = function() {
      console.log("[connection closed]\n")
    }
    ws.onmessage = function(ev) {
      console.log(`[message received] ${ev.data}\n`)
      const JSONObject = JSON.parse(ev.data)
      console.log(JSONObject)
      switch (JSONObject.type) {
        case "LOBBY_ID":
          // paste the lobby id to the page
          const inputEle = document.getElementById("req-lobby-id") as HTMLInputElement | null
          if (inputEle === null) {
            throw Error("inputEle cannot be null")
          }
          inputEle.value = JSONObject.lobby_id
      }
    }
    ws.onerror = function(ev) {
      console.log(`[error] ${ev}\n`)
    }
  }

  return (
    <main className='w-80% m-auto my-4' id='main'>
      <h1 className="text-4xl font-bold text-center mb-8">Pong Game</h1>
      <GameUI onGameModeSelect={updateGameMode} onConnectToServer={connectToServer} socket={socket}></GameUI>
      {gameMode !== "none" && <GameCanvas mode={gameMode} socket={socket}></GameCanvas>}
    </main>
  )
}
