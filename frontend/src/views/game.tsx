import {useState, useEffect, useRef} from 'react'
import { fetchWithAuth } from '../config/api'
import GameUI from '../components/game/gameUI.js'
import { Screen, GameMode } from '../components/game/types.js'

export default function Game() {
  const [gameMode, setGameMode] = useState<GameMode>("none")
  const [screen, setScreen] = useState<Screen>("websocket-connecting") 
  const [gameData, setGameData] = useState<any>(null)
  const [lobbyId, setLobbyId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const websocket = useRef<WebSocket|null>(null)
  const [tournamentId, setTournamentId] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ✅ FETCH CURRENT USER
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetchWithAuth('/api/users/profile/me');
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setCurrentUser(data.data || data);
        console.log('✅ Current user loaded:', data);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // ✅ WEBSOCKET CONNECTION
  useEffect(() => {
    const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME
    const gameServerPort = import.meta.env.VITE_GAME_SERVER_PORT
    const nginxPort = import.meta.env.VITE_NGINX_PORT
    const useWSS = Number(import.meta.env.VITE_USE_WSS)
    
    const token = localStorage.getItem('token') || ''
    
    let url: string
    if (window.location.protocol === 'https:' || useWSS === 1) {
      url = `wss://${serverHostname}:${nginxPort}/ws/${token}`
    } else {
      url = `ws://${serverHostname}:${gameServerPort}`
    }
    
    console.log('🔌 WebSocket connecting to:', url)
    websocket.current = new WebSocket(url)
    websocket.current.onopen = () => {
      setScreen('main')
      console.log(`[connection opened]`)
    }
    websocket.current.onclose = () => {
      setScreen('websocket-closed')
      console.log(`[connection closed]`)
    }
    websocket.current.onerror = () => {
      setScreen('websocket-closed')
      console.log(`[error on connection]`)
    }
    return () => {
      websocket.current!.close()
    }
  }, [])

  // ✅ MATCHMAKING POLL
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
          console.log('Match found! Going to ready room', data)
          setGameData(data.data)
          updateGameMode('online')
          setScreen('ready-room')  // ✅ GO TO READY ROOM FIRST
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

  // ✅ SEND GAME DATA TO WEBSOCKET - ONLY when screen becomes 'game'
  // ...existing code...

  // Send START_GAME to gameserver ONLY when game screen loads
  const startGameSent = useRef(false)
  useEffect(() => {
    if (screen === 'game' && gameMode === 'online' && gameData && !startGameSent.current) {
      startGameSent.current = true
      console.log('🎮 Sending START_GAME:', gameData.id)
      websocket.current!.send(JSON.stringify({
        type: 'START_GAME',
        game_id: gameData.id,
        player1_id: gameData.player1_id,
        player2_id: gameData.player2_id
      }))
    }
    if (screen === 'main' || screen === 'online') {
      startGameSent.current = false
    }
  }, [screen, gameMode, gameData])

  function updateGameMode(gameMode: GameMode) {
    console.log("Selected mode: ", gameMode)
    setGameMode(gameMode)
  }

  // ✅ GAME HANDLERS
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

  async function joinLobbyReq(lobby_id: string) {
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
        setScreen('ready-room')  // ✅ GO TO READY ROOM FIRST
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

  // ✅ TOURNAMENT HANDLERS
  const handleTournamentJoined = (tId: number) => {
    console.log('✅ Joined tournament:', tId)
    setTournamentId(tId)
    setScreen('tournament-lobby')
  }

  const handleTournamentCreated = (tId: number) => {
    console.log('✅ Created tournament:', tId)
    setTournamentId(tId)
    setScreen('tournament-lobby')
  }

  const handleTournamentStarted = () => {
    console.log('✅ Tournament started')
    setScreen('tournament-bracket')
  }

  const handleTournamentLeft = () => {
    console.log('❌ Left tournament')
    setTournamentId(null)
    setScreen('online')
  }

  const handleCreateTournament = () => {
    setScreen('create-tournament')
  }

  const handleBackFromCreate = () => {
    setScreen('tournament')
  }

  const handleBackFromJoin = () => {
    setScreen('tournament')
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
        gameData={gameData}
        tournamentId={tournamentId}
        selectedBracketSize={0}
        currentUser={currentUser}

        setScreen={setScreen}
        setGameMode={setGameMode}
        setTournamentId={setTournamentId}
        setGameData={setGameData}
        setError={setError}

        handleRandomPlayer={handleRandomPlayer}
        handleHostReq={handleHostReq}
        joinLobbyReq={joinLobbyReq}
        resetPlayerStatus={resetPlayerStatus}

        onTournamentJoined={handleTournamentJoined}
        onTournamentCreated={handleTournamentCreated}
        onTournamentStarted={handleTournamentStarted}
        onTournamentLeft={handleTournamentLeft}
        onCreateTournament={handleCreateTournament}
        onBackFromCreate={handleBackFromCreate}
        onBackFromJoin={handleBackFromJoin}
      />
    </main>
  )
}