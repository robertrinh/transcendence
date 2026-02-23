import {useState, useEffect, useRef} from 'react'
import { fetchWithAuth } from '../config/api'
import GameUI from '../components/game/gameUI.js'
import useGameStore from '../components/util/gameStore.js'
import { GameMode } from '../components/game/types.js'

const intervalMilliseconds = 3000

export default function Game() {
  const gameMode = useGameStore(set => set.gameMode)
  const screen = useGameStore(set => set.screen)
  const setScreen = useGameStore(set => set.setScreen)
  const setGameMode = useGameStore(set => set.setGameMode)
  const [gameData, setGameData] = useState<any>(null)
  const [lobbyId, setLobbyId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [wsReadyState, setWsReadyState] = useState<Number>(WebSocket.CONNECTING)
  const websocket = useRef<WebSocket|null>(null)

	useEffect(() => {
		const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME
		const nginxPort = import.meta.env.VITE_NGINX_PORT
    const token = localStorage.getItem('token')
    websocket.current = new WebSocket(
      `wss://${serverHostname}:${nginxPort}/ws/${token}`)
		websocket.current.onopen = () => {
      setError("Waiting for connection with the gameserver...")
			setWsReadyState(WebSocket.OPEN)
			console.log(`[connection opened]`)
		}

		websocket.current.onclose = (ev: CloseEvent) => {
			setWsReadyState(WebSocket.CLOSED)
      if (ev.reason !== "") {
        setError(ev.reason)
        console.log(`[connection closed]: ${ev.reason}`)
      }
      else {
        setError("Gameserver connection closed, the gameserver could be down")
        console.log(`[connection closed]`)
      }
		}

		websocket.current.onerror = () => {
			setWsReadyState(WebSocket.CLOSED)
			console.log(`[error on connection]`)
		}
		return () => {
			// cleanup, should also reset player state in db
      if (websocket.current === null) {
        return
      }
      if (websocket.current.readyState === WebSocket.CLOSED || 
        websocket.current.readyState === WebSocket.CLOSING) {
        return
      }
      websocket.current!.close()
		}
	}, [])

  useEffect(() => {
    switch (wsReadyState) {
      case WebSocket.CONNECTING: {
        setScreen('info-neutral')
        break
      }
      case WebSocket.OPEN: {
        setScreen('main')
        break
      }
      default: {
        setScreen('info-bad')
        break
      }
    }
  }, [wsReadyState])

  // this hook is for the random queue
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
            setScreen('info-bad')
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
    }, intervalMilliseconds)
    return () => clearInterval(interval);
  }, [screen])

  // this hook is for private lobbies
  useEffect(() => {
    if (screen !== 'searching-private') {
      return
    }
    const interval = setInterval(async () => {
      try {
        // hacking
        const lobby_id = lobbyId
        const response = await fetchWithAuth('/api/games/joinlobby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lobby_id })
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => {})
          console.error('error: LOBBY POLL: ', errorData)
          if (errorData?.message) {
            if (errorData.message === 'Waiting for opponent') {
              console.log('pass')
              return
            }
            setError(errorData.message)
            setScreen('info-bad')
            throw new Error('failed to poll lobby status')
          }
        }
        const data = await response.json()
        if (!data.success) {
          console.log(data.message)
          return
        }
        if (data.data?.id) {
          console.log('i get here, the gamedata is here and im setting gameMode to online', data)
          setGameData(data.data)
          updateGameMode('online')
          setScreen('game')
        }
      }
      catch (error: any) {
        console.error(error)
      }
    }, intervalMilliseconds)
    return () => clearInterval(interval)
  }, [screen])

  useEffect(() => {
    if (gameMode == 'online' && gameData) {
      console.log(`sending game data to server, lobby_id: ${lobbyId}`)
      const game = JSON.stringify({
        type: 'START_GAME',
        game_id: gameData.id,
        player1_id: gameData.player1_id,
        player2_id: gameData.player2_id
      })
      websocket.current!.send(game);
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
          setScreen('info-bad')
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
          setScreen('info-bad')
          throw new Error('failed to create lobbyId')
        }
      }
      const data = await response.json()
      console.log(`data: `, data)
      setLobbyId(data.data.lobby_id);
      setScreen('searching-private')
      try {
        await navigator.clipboard.writeText(data.data.lobby_id)
        alert(`Copied lobby \"${data.data.lobby_id}\" to clipboard, send it to a friend`)
      }
      catch (err: any) {
        alert(`Failed to copy lobby to clipboard, are you using http?`)
      }
      }
      catch (err: any) {
        console.log(err)
        updateGameMode('none')
      }
  }

  async function joinLobbyReq (lobby_id: string){
    setScreen('searching-private')
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

