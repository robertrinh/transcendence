import { useState, useRef, useEffect, useCallback } from "react"
import GameUI from "../components/game/gameUI.tsx"
import { fetchWithAuth } from '../config/api'
import type { GameMode, Screen } from "../components/game/types.ts"

export default function Game() {
  const [gameMode, setGameMode] = useState<GameMode>("none")
  const [screen, setScreen] = useState<Screen>("main")
  const [lobbyId, setLobbyId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [gameData, setGameData] = useState<any>(null)
  const websocket = useRef<WebSocket | null>(null)
  const [tournamentId, setTournamentId] = useState<number | null>(null)
  const [selectedBracketSize, setSelectedBracketSize] = useState<number>(4)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const isTournamentMatchRef = useRef(false)

  const stateKiller = () => {
      if (websocket.current) {
        const ws = websocket.current
        ws.onmessage = null
        ws.onclose = null
        ws.onerror = null
        ws.close()
        websocket.current = null
      }
      setScreen('main')
      setGameMode('none')
      setGameData(null)
      setError(null)
  }

  useEffect(() => {
    return () => {
      stateKiller(); 
      if (screen != 'game' && screen != 'countdown') {
        resetPlayerStatus()
      }
    }
  }, [])

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth('/api/users/profile/me')
        const data = await response.json()
        console.log('👤 Full API response:', JSON.stringify(data))
        const user = data.profile || data.data || data
        console.log('👤 User object:', JSON.stringify(user), 'id:', user.id)
        setCurrentUser(user)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [])

  // Listen for game-over events from the pong game
  useEffect(() => {
      const handleGameOver = (event: Event) => {
      const detail = (event as CustomEvent).detail
      console.log('🏁 Game over event received:', detail)
      console.log('🏆 isTournamentMatch (ref):', isTournamentMatchRef.current)
      
      // Close websocket before state changes to prevent disconnect events
      if (websocket.current) {
        const ws = websocket.current
        ws.onmessage = null
        ws.onclose = null
        ws.onerror = null
        ws.close()
        websocket.current = null
      }

      if (isTournamentMatchRef.current) {
        console.log('🏆 Returning to tournament bracket...')
        setScreen('tournament-bracket')
        setGameMode('none')
        setGameData(null)
      } else {
        setGameMode('none')
        setScreen('main')
        setGameData(null)
        resetPlayerStatus()
      }
    }

    window.addEventListener('game-over', handleGameOver)
    return () => {
      window.removeEventListener('game-over', handleGameOver)
    }
  }, [])

  useEffect(() => {
    const handleOnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return (event.returnValue);
    }
    window.addEventListener('beforeunload', handleOnBeforeUnload, {capture : true})
    return () =>{
      window.removeEventListener('beforeunload', handleOnBeforeUnload, {capture : true})
    }
  },[])
  
  function handleRandomPlayer() {
    setGameMode("online")
    setScreen("searching")
    fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
      .catch(() => {})
      .finally(() => {
        fetchWithAuth('/api/games/matchmaking', {
          method: 'POST',
        }).then(response => {
          if (!response.ok) throw new Error('Failed matchmaking')
          return response.json()
        }).then(data => {
          if (data.data) {
            setGameData(data.data)
            setScreen('ready-room')
          } else {
            setScreen("searching")
          }
        }).catch(err => {
          console.error('Matchmaking failed err:', err)
          setScreen("main")
          setGameMode("none")
        })
      })
  }

  function handleHostReq() {
    setGameMode("online")
    setScreen("searching")
    fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
      .catch(() => {})
      .finally(() => {
        fetchWithAuth('/api/games/host', {
          method: 'POST',
        }).then(response => {
          if(response.ok)
            return response.json()
          throw new Error('Failed hosting')
        }).then(data => {
          setLobbyId(data.data.lobby_id)
          setScreen("host-lobby")
        }).catch(err => {
          console.error('Hosting failed err:', err)
          setScreen("main")
          setGameMode("none")
        })
      })
  }

  function joinLobbyReq(lobbyId: string) {
    setGameMode("online")
    setScreen("searching")
    fetchWithAuth('/api/games/joinlobby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lobby_id: lobbyId }),
    }).then(response => {
      if(response.ok)
        return response.json()
      throw new Error('Failed to join lobby')
    }).then(data => {
      console.log('Joined lobby response:', data)
      setGameData(data.data)
      setScreen("ready-room")
    }).catch(err => {
      console.error('Join lobby failed err:', err)
      setScreen("main")
      setGameMode("none")
    })
  }

  function resetPlayerStatus() {
    fetchWithAuth('/api/games/matchmaking/cancel', {
      method: 'PUT'
    }).then(response => {
      if (!response.ok) throw new Error('Failed to cancel matchmaking')
      console.log('Matchmaking cancelled')
    }).catch(err => {
      console.error('Cancel matchmaking failed:', err)
    })
  }

  // Tournament handlers
  const handleTournamentCreated = useCallback((toId: number, maxParticipants: number) => {
    console.log('🏟️ Tournament created:', toId, 'Max:', maxParticipants)
    setTournamentId(toId)
    setSelectedBracketSize(maxParticipants)
    setScreen('tournament-lobby')
  }, [])

  const handleTournamentJoined = useCallback((toId: number, maxParticipants: number) => {
    console.log('🏟️ Joined tournament:', toId, 'Max:', maxParticipants)
    setTournamentId(toId)
    setSelectedBracketSize(maxParticipants)
    setScreen('tournament-lobby')
  }, [])

  const handleTournamentStarted = useCallback(() => {
    console.log('🏟️ Tournament started!')
    setScreen('tournament-bracket')
  }, [])

  const handleTournamentLeft = useCallback(() => {
    console.log('🏟️ Left tournament')
    setTournamentId(null)
    isTournamentMatchRef.current = false
    setScreen('main')
    setGameMode('none')
  }, [])

  // Play a tournament match
  const handleTournamentPlayMatch = useCallback(async (gameId: number) => {
    console.log('🎯 Playing tournament match - Game ID:', gameId)
    // Set ref FIRST, before any async work or state updates
    isTournamentMatchRef.current = true
    console.log('🏆 Set isTournamentMatchRef to TRUE')
    try {
      const response = await fetchWithAuth(`/api/games/${gameId}`)
      if (!response.ok) throw new Error('Failed to fetch game data')
      const data = await response.json()
      console.log('📦 Tournament game data:', data.data)
      setGameData(data.data)
      setGameMode('online')
      setScreen('ready-room')
    } catch (err) {
      console.error('❌ Failed to start tournament match:', err)
      isTournamentMatchRef.current = false
      setError(String(err))
    }
  }, [])

  const handleTournamentFinished = useCallback(() => {
    console.log('🏆 Tournament finished!')
    if (websocket.current) {
      websocket.current.onmessage = null
      websocket.current.onclose = null
      websocket.current.close()
      websocket.current = null
    }
    setTournamentId(null)
    isTournamentMatchRef.current = false
    setGameMode('none')
    setGameData(null)
    setScreen('main')
  }, [])

  return (
    <>
        <GameUI
          lobbyId={lobbyId}
          gameMode={gameMode}
          screen={screen}
          error={error}
          websocket={websocket}
          gameData={gameData}
          tournamentId={tournamentId}
          selectedBracketSize={selectedBracketSize}
          currentUser={currentUser}
          isTournamentMatch={isTournamentMatchRef.current}

          setScreen={setScreen}
          setGameMode={setGameMode}
          setTournamentId={setTournamentId}
          setGameData={setGameData}
          setError={setError}

          handleRandomPlayer={handleRandomPlayer}
          handleHostReq={handleHostReq}
          joinLobbyReq={joinLobbyReq}
          resetPlayerStatus={resetPlayerStatus}

          handleTournamentPlayMatch={handleTournamentPlayMatch}
          handleTournamentFinished={handleTournamentFinished}

          onTournamentJoined={handleTournamentJoined}
          onTournamentCreated={handleTournamentCreated}
          onTournamentStarted={handleTournamentStarted}
          onTournamentLeft={handleTournamentLeft}
          onCreateTournament={() => setScreen('create-tournament')}
          onBackFromCreate={() => setScreen('tournament')}
          onBackFromJoin={() => { setScreen('main'); setGameMode('none') }}
        />
    </>
  )
}