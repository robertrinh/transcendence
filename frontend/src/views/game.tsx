import {useState, useEffect} from 'react'
import GameUI from '../components/game/gameUI.js'
import websocket from '../static/websocket.js'

type Screen = 'main' | 'online' | 'local' | 'host-lobby' | 'join-lobby' | 'searching' | 'game' | 'timeout' | 'error'
type GameMode = 'none' | 'singleplayer' | 'multiplayer' | 'online'

export default function Game() {
  const [gameMode, setGameMode] = useState<GameMode>("none")
  const [screen, setScreen] = useState<Screen>("main") 
  const [gameData, setGameData] = useState<any>(null)
  const [lobbyId, setLobbyId] = useState("")
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    if (screen !== 'searching')
        return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/games/matchmaking', {
          headers: {'Authorization': `Bearer ${token}`}
        })
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
      const game = JSON.stringify({
        type: 'START_GAME',
        game_id: gameData.id,
        player1_id: gameData.player1_id,
        player2_id: gameData.player2_id
      })
      websocket.send(game);
	  console.log('game data sent to gameserver')
    }
  }, [gameMode])

  function updateGameMode(gameMode: GameMode) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  const handleRandomPlayer = async () => {
	  setScreen('searching')
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/matchmaking', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
      })
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/host', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
      })
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
      try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/joinlobby', {
        method: 'POST',
        headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
        body: JSON.stringify({ lobby_id }),
      })
      if (!response.ok) {
        const errordata = await response.json().catch(() => {})
        console.log('errordata: ', errordata)
        if (errordata?.message) {
          setError(errordata.message)
          setScreen('error')
          throw new Error('failed to join lobby')
        }
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
        console.log(err)
        updateGameMode('none')
      }
  }

  async function resetPlayerStatus() {
    console.log('resetting the player_status to none')
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/matchmaking/cancel', {
        method: 'PUT',
        headers: {'Authorization': `Bearer ${token}`}
      })
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

