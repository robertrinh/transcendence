import React from 'react'
import Button from '../components/button.jsx'

const ws = new WebSocket("ws://localhost:8081")
ws.onopen = function(ev) {
  console.log("[connection opened]\n")
}
ws.onclose = function(ev) {
  console.log("[connection closed]\n")
}
ws.onmessage = function(ev) {
  console.log(`[message received] ${ev.data}\n`)
  const JSONObject = JSON.parse(ev.data)
  console.log(JSONObject)
}
ws.onerror = function(ev) {
  console.log(`[error] ${ev}\n`)
}

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
  return (
    <main className='w-80 m-auto my-4'>
      <h1 className=" text-4xl font-bold font-montserrat">Game Page</h1>
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
      </div>
    </main>
  )
}
