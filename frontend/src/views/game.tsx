import React, {useState} from 'react'
import Button from '../components/button.jsx'
import gameInit from '../static/game.js'
import GameUI from '../components/gameUI.js'
import GameCanvas from '../components/gameCanvas.js'



function onClick() {

}

function changeVisibilityById(elementId: string, visibility: string) {
  const element = document.getElementById(elementId)
  if (element === null) {
    return
  }
  element.style.visibility = visibility
}

function removeElementById(elementId: string) {
  const element = document.getElementById(elementId)
  if (element === null) {
    return
  }
  element.remove()
}

export default function Game() {
  const [gameMode, setGameMode] = useState("none")
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lobbyID, setLobbyID] = useState("none")

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

    ws.onopen = function(ev) {
      console.log("[connection opened]\n")
      ws.send(jsonMessage)
    }
    ws.onclose = function(ev) {
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
      <GameUI onGameModeSelect={updateGameMode} onConnectToServer={connectToServer} socket={socket}></GameUI>
      {gameMode !== "none" && <GameCanvas mode={gameMode} socket={socket}></GameCanvas>}
      {/* <h1 className=" text-4xl font-bold font-montserrat">Game Page</h1>
      <div id='lobby-menu'>
        <div className='py-4'>
          <Button
          className={
            "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
          }
          buttonName='host lobby'
          onClick={() => {
            console.log("User wants to join a lobby")
            removeElementById('lobby-menu')
            changeVisibilityById('lobby-host', 'visible')
          }}
          />
        </div>
        <div>
          <Button
          className={
            "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
          }
          buttonName='join lobby'
          onClick={() => {
            console.log("User wants to join a lobby")
            removeElementById('lobby-menu')
            changeVisibilityById('lobby-join', 'visible')
          }}
          />
        </div>
      </div>
      <div id='lobby-host' className='invisible'>
        <Button
        className={
          "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
        }
        buttonName='create lobby'
        onClick={() => {
          const message = {type: "REQ_LOBBY"}
          ws.send(JSON.stringify(message))
        }}
        />
      </div>
      <div id='lobby-join' className='invisible'>
        <label htmlFor="lobby-input">Enter lobby id:</label>
        <input id="lobby-input" className="block border border-black" type="text" placeholder="AB23F"></input>
        <Button
        className={
          "bg-indigo-500 text-white py-2 px-8 uppercase rounded-xl"
        }
        buttonName='connect'
        onClick={() => {
          const message = {type: "JOIN_LOBBY", lobby_id: "ABCDEF"}
          ws.send(JSON.stringify(message))
        }}
        />
      </div> */}
    </main>
  )
}
