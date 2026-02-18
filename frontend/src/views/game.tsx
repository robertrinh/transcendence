import {useState, useEffect, useRef} from 'react'
import { fetchWithAuth } from '../config/api'
import GameUI from '../components/game/gameUI.js'
import { Screen, GameMode } from '../components/game/types.js'

export default function Game() {
  const [gameMode, setGameMode] = useState<GameMode>("none")
  const [screen, setScreen] = useState<Screen>("main") 
  const [gameData, setGameData] = useState<any>(null)
  const [lobbyId, setLobbyId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [wsReadyState, setWsReadyState] = useState<Number>(WebSocket.CONNECTING)
  const websocket = useRef<WebSocket|null>(null)

	useEffect(() => {
		const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME
		const gameServerPort = import.meta.env.VITE_GAME_SERVER_PORT
		const nginxPort = import.meta.env.VITE_NGINX_PORT
		// A little bit illegal because it's similar to this: 
		// https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production#why-is-node_env-considered-an-antipattern
		const useWSS = Number(import.meta.env.VITE_USE_WSS)
		let url = `ws://${serverHostname}:${gameServerPort}`
		if (useWSS === 1) {
			url = `wss://${serverHostname}:${nginxPort}/ws/`
		}
		websocket.current = new WebSocket(url)
		websocket.current.onopen = () => {
			setWsReadyState(WebSocket.OPEN)
			console.log(`[connection opened]`)
		}

		websocket.current.onclose = () => {
			setWsReadyState(WebSocket.CLOSED)
			console.log(`[connection closed]`)
		}

		websocket.current.onerror = () => {
			setWsReadyState(WebSocket.CLOSED)
			console.log(`[error on connection]`)
		}
		return () => {
			// cleanup, should also reset player state in db
			websocket.current!.close()
		}
	}, [])

  useEffect(() => {
    switch (wsReadyState) {
      case WebSocket.CONNECTING: {
        setScreen('websocket-connecting')
        break
      }
      case WebSocket.OPEN: {
        setScreen('main')
        break
      }
      default: {
        setScreen('websocket-closed')
        break
      }
    }
  }, [wsReadyState])

  useEffect(() => {
    if (screen !== 'searching')
        return;
        const interval = setInterval(async () => {
      try {
        const response = await fetchWithAuth('/api/games/matchmaking')
        if (!response.ok) {
          const errorData = await response.json().catch(() => {})
          console.error('error: MATCHMAKING POLL: ', errorData)
          if (errorData?.message) {
            setError(errorData.message)
            setScreen('error')
            throw new Error('failed to poll matchmaking status')
          }
        }
        const data = await response.json()
        if (data.data?.id) {
          console.log('i get here, the gamedata is here and im setting gameMode to online', data)
          setGameData(data.data)
          updateGameMode('online')
		  setScreen('game')
        }
        else if (data.data?.status === 'idle') {
          console.log('data is idle.... TIMEOUT PROBABLY OCCURED')
          setScreen('timeout')
        }
      } catch (error: any) {
          console.error(error);
        }
    }, 5000)
    return () => clearInterval(interval);
  }, [screen])

  useEffect(() => {
    if (gameMode == 'online' && gameData) {
      console.log(`sending game data to server, lobby_id: ${lobbyId}`)
      // we are joining a random match
      if (lobbyId === "") {
        const game = JSON.stringify({
          type: 'START_GAME',
          game_id: gameData.id,
          player1_id: gameData.player1_id,
          player2_id: gameData.player2_id
        })
        websocket.current!.send(game);
      }
      // we are joining a private lobby
      else {
        websocket.current!.send(JSON.stringify({
          type: 'START_GAME',
          game_id: gameData.id,
          player1_id: gameData.player1_id,
          player2_id: gameData.player2_id,
          lobby_id: lobbyId
        }))
      }
      console.log('game data sent to gameserver')
    }
  }, [gameMode, lobbyId, gameData])

  function updateGameMode(gameMode: GameMode) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  const handleRandomPlayer = async () => {
	  setScreen('searching')
    try {
      const response = await fetchWithAuth('/api/games/matchmaking', { method: 'POST' })
      if (!response.ok) {
        const errordata = await response.json().catch(() => {})
        console.log('errordata: ', errordata)
        if (errordata?.message) {
          setError(errordata.message)
          setScreen('error')
          throw new Error('failed to join queue')
        }
      }
    }
      catch (err: any) {
        console.log(err)
        updateGameMode('none')
      }
  }

  async function handleHostReq() {
    try {
      const response = await fetchWithAuth('/api/games/host', { method: 'POST' })
      if (!response.ok) {
        const errordata = await response.json().catch(() => {})
        console.log('errordata: ', errordata)
        if (errordata?.message) {
          setError(errordata.message)
          setScreen('error')
          throw new Error('failed to create lobbyId')
        }
      }
      const data = await response.json()
      console.log(`data: `, data)
      setLobbyId(data.data.lobby_id);
      setScreen('host-lobby')
      }
      catch (err: any) {
        console.log(err)
        updateGameMode('none')
      }
  }

  async function joinLobbyReq (lobby_id: string){
    setLobbyId(lobby_id)
      try {
      const response = await fetchWithAuth('/api/games/joinlobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobby_id }),
      })
      if (!response.ok) {
        const errordata = await response.json().catch(() => {})
        if (errordata?.message) {
          alert(errordata.message)
        }
        throw new Error('failed to join lobby')
      }
      const data = await response.json()
        if (data.data?.id) {
          console.log(data)
          setGameData(data.data)
          updateGameMode('online')
          setScreen('game')
        }
      }
      catch (err: any) {
        console.error(err)
        updateGameMode('none')
      }
  }

  async function resetPlayerStatus() {
    console.log('resetting the player_status to none')
    try {
      const response = await fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
      if (!response.ok)
        throw new Error('could not reset user status on backend..')
	  setGameMode('none')
	  setScreen('online')
    } catch (error: any) {
      	console.error(error);
		setGameMode('none')
		setScreen('online')
    }
  }


return (
    <main className='w-80% m-auto my-4' id='main'>
      <h1 className="text-4xl font-bold text-center mb-8">Pong Game</h1>
		<GameUI
			screen={screen}
			gameMode={gameMode}
			lobbyId={lobbyId}
			error={error}
			websocket={websocket}
			setScreen={setScreen}
			setGameMode={setGameMode}
			handleRandomPlayer={handleRandomPlayer}
			handleHostReq={handleHostReq}
			joinLobbyReq={joinLobbyReq}
			resetPlayerStatus={resetPlayerStatus}
      	/>
    </main>
  )
}

