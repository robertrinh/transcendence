import {useEffect, useState} from 'react'
import GameUI from '../components/game/gameUI.js'
import GameCanvas from '../components/game/gameCanvas.js'
import { HostLobby, JoinLobby, JoinOwnLobby, LocalMenu, MainMenu, OnlineMenu } from '../components/game/gameMenus.js';
import SearchingScreen from '../components/game/searchingScreen.js';
import TimeoutScreen from '../components/game/timeoutScreen.js';
import {validateJoinLobby} from '../components/game/gameUI.js'
import { match } from 'assert';


export default function Game() {
  const [screen, setScreen] = useState("main") //can also be local, online and maybe host-lobby join-lobby
  const [matchState, setMatchState] = useState("idle") //can also be searching, matched, timeout

  const [gameMode, setGameMode] = useState("none")
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [gameData, setGameData] = useState<any>(null)
  const [lobbyId, setLobbyId] = useState<string>("")

  useEffect(() => {
    if (matchState !== 'searching')
        return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/games/matchmaking', {
          headers: {'Authorization': `Bearer ${token}`}
        })
        if (!response.ok)
            throw new Error('failed poll matchmaking status')

        const data = await response.json()
        if (data.data?.id) {
          console.log('i get here, the gamedata is here and im setting status to matched')
          console.log(data)
          setGameData(data.data)
          setMatchState('matched')
        }
        else if (data.data?.status === 'idle') {
          console.log('data is idle.... TIMEOUT PROBABLY OCCURED')
          setMatchState('timeout')
        }
      } catch (error: any) {
          console.error(error);
        }
    }, 2000)
    return () => clearInterval(interval);
  }, [matchState] )

  useEffect(() => {
    if (!socket)
      connectToServer();
    if (matchState === 'matched' || matchState == 'private-game' && gameData) {
      const game = JSON.stringify({
        type: 'START_GAME',
        game_id: gameData.id,
        player1_id: gameData.player1_id,
        player2_id: gameData.player2_id
      })
      sendToServer(game);
    }
  }, [matchState])

  function sendToServer(message: any) {
    if (!socket) return
    socket.send(message)
  }

  function updateGameMode(gameMode: string) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  async function resetPlayerStatus() {
    console.log('resetting the player_status to idle')
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/matchmaking/cancel', {
        method: 'PUT',
        headers: {'Authorization': `Bearer ${token}`}
      })
      if (!response.ok)
          throw new Error('could not reset user status.')
    } catch (error: any) {
      console.error(error);
    }
  }

  const handleRandomPlayer = async () => {
	  setMatchState('searching')
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/matchmaking', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
      })
      if (!response.ok)
        throw new Error('failed to join queue')
      }
      catch (err: any) {
        console.log(err)
        setMatchState('idle')
      }
  }

  async function handleHostReq() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/host', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
      })
      if (!response.ok)
        throw new Error('failed to create lobbyId')
      const data = await response.json()

      console.log(`lobbyid: `, data.data.lobby_id)

      setLobbyId(data.data.lobby_id);
      navigator.clipboard.writeText(data.data.lobby_id)
      setScreen('host-lobby')
      }
      catch (err: any) {
        console.log(err)
        setMatchState('idle')
      }
  }

  async function joinLobbyReq (lobbyid: string){
      try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/joinlobby', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyid }),
      })
      if (!response.ok)
        throw new Error('failed to create lobbyId')
      const data = await response.json()
        if (data.data?.id) {
          console.log('i get here, the gamedata is here and im setting status to online, private-game')
          console.log(data)
          setGameData(data.data)
          updateGameMode('online')
          setScreen('private-game')
        }
      }
      catch (err: any) {
        console.log(err)
        setMatchState('idle')
      }
  }

  function connectToServer() {
    if (socket) return
    const ws = new WebSocket("ws://localhost:8081")
    setSocket(ws)

    //here send JWT token??? but is it for the gameserver? will it be its own token to use for communication with the backend
    ws.onopen = function() { 
      console.log("[connection opened]\n")
      // ws.send(gameInfo)
    }

    ws.onclose = function() {
      console.log("[connection closed]\n")
      setSocket(null)
      setGameMode('none')
      setMatchState('idle')
      setScreen('main')
    }

    ws.onmessage = function(ev) {
      console.log(`[message received] ${ev.data}\n`)
      const JSONObject = JSON.parse(ev.data)
      console.log(JSONObject)
      switch (JSONObject.type) {
        case "LOBBY_ID":
          // paste the lobby id to the page
          setLobbyId(JSONObject.lobby_id)
          const inputEle = document.getElementById("req-lobby-id") as HTMLInputElement | null
          if (inputEle === null) {
            throw Error("inputEle cannot be null")
          }
          inputEle.value = JSONObject.lobby_id
          break
        case "GAME_ENDED":
          getGameResult(JSONObject)
          break
      }
    }
    ws.onerror = function(ev) {
      console.log(`[error] ${ev}\n`)
    }

  function getGameResult(gameResult: any) {
    console.log(`game results from server: ${gameResult}`)
  }
  }

  

  return (
    <main className='w-80% m-auto my-4' id='main'>
      <h1 className="text-4xl font-bold text-center mb-8">Pong Game</h1>
    <div>
      {matchState === 'idle' && (
        <>
        {screen === 'main' && (
        <MainMenu
          onPlayLocal={() => setScreen('local')}
          onPlayOnline={() => setScreen('online')}
        />
      )}

      {screen === 'online' && (
          <OnlineMenu
            onPlayRandom={handleRandomPlayer}
            // onHostLobby={() => {connectToServer(JSON.stringify({type: "REQ_LOBBY"})); setScreen('host-lobby')}}
            onHostLobby={() => {handleHostReq()}}
            onJoinLobby={() => setScreen('join-lobby')}
            onBack={() => setScreen('main')}
          />
      )}

      {screen === 'host-lobby' && (
        <HostLobby
          onCopyLobby={() => {
          const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
          if (lobbyElement === null) {return}
          navigator.clipboard.writeText(lobbyElement.value)
          setScreen('join-own-lobby')
          }}
        />
      )}

      {screen === 'join-own-lobby' && (
        <JoinOwnLobby
          onJoinOwn={() => {
            // if (!lobbyId || lobbyId.length === 0) {
            //   alert("Lobby ID is empty")
            //   return
            // }
            // if (socket === null) {
            //   throw Error("socket cannot be null")
            // }
            // sendToServer(JSON.stringify({type: "JOIN_LOBBY", lobby_id: lobbyId}))
            updateGameMode('online')
            setScreen('private-game')
          }}
        />
      )}

      {screen === 'join-lobby' && (
        <JoinLobby
          onJoin={() => {
            let lobbyID = null
            try {
                lobbyID = validateJoinLobby("input-lobby-id")
            }
            catch (e) {
              alert(e)
                return
            }
            joinLobbyReq(lobbyID)
            // connectToServer(JSON.stringify({type: "JOIN_LOBBY", lobby_id: lobbyID}))
            updateGameMode('online')
            setScreen('private-game')
          }}
          />
      )}

        {screen === 'local' && 
          (
            <LocalMenu
              onSinglePlayer={() => {updateGameMode('singleplayer'); setScreen('playing-locally')}}
              onMultiPlayer={() => {updateGameMode('multiplayer'); setScreen('playing-locally')}}
              onBack={() => {updateGameMode('none'); setScreen('main')}}
            />
          )} 

          {screen === 'playing-locally' || screen === 'private-game' && gameMode !== "none" && (
            <GameCanvas mode={gameMode} socket={socket}/>
          )}
        </>
      )}

      {matchState === 'searching' && (
        <SearchingScreen
          onCancel={() => {setMatchState('idle'); setScreen('online'); resetPlayerStatus()}}
        />
      )} 

      {/* connect gameserver and render gameCanvas */}
      {matchState === 'matched' && (
        // <GameCanvas mode={'online'} socket={socket}></GameCanvas>
        <div>player is matched and game will start!</div>
      )}

      {matchState === 'timeout' && (
        <TimeoutScreen
          onExit={() => {setMatchState('idle'); setScreen('main'); resetPlayerStatus()}}
          onRetry={async() => { await resetPlayerStatus(); handleRandomPlayer()}}
        />
      )}
    </div>
  </main>
  )
}

