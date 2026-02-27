import { useState, useRef, useEffect, useCallback } from "react"
import GameUI from "../components/game/gameUI.tsx"
import { fetchWithAuth } from '../config/api'
import type { GameMode, Screen } from "../components/game/types.ts"

interface GameResult {
  gameMode: string
  winnerLabel: string
  scorePlayer1: number
  scorePlayer2: number
  player1Label: string
  player2Label: string
}

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
  const currentUserRef = useRef<any>(null)
  const isTournamentMatchRef = useRef(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const gameModeRef = useRef<GameMode>("none")
  const [oppName, setOppName] = useState<string>('UNKNOWN')
  const [websocketState, setWebsocketState] = useState<number>(WebSocket.CONNECTING)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw Error('Missing JWT token')
    }
    const host = window.location.hostname
    const port = window.location.port
    const wsUrl = `wss://${host}:${port}/ws/${token}`
    websocket.current = new WebSocket(wsUrl)
    websocket.current.onopen = () => {
      setWebsocketState(WebSocket.OPEN)
    }
    websocket.current.onerror = () => {
      setWebsocketState(WebSocket.CLOSED)
    }
    websocket.current.onclose = (event: CloseEvent) => {
      if (event.reason.length > 0) {
        setError(event.reason)
      }
      setWebsocketState(WebSocket.CLOSED)
    }
    return () => {
      if (!websocket.current) {
        return
      }
      websocket.current.close()
    }
  }, [])

  useEffect(() => {
    switch (websocketState) {
      case WebSocket.CLOSED:
        if (error) {
          setScreen('error')
        }
        else {
          setScreen('websocket-closed')
        }
        break
      case WebSocket.CONNECTING:
        setScreen('websocket-connecting')
        break
      case WebSocket.OPEN:
        setScreen('main')
        break
    }
  }, [websocketState])

  // Keep refs in sync
  useEffect(() => {
    gameModeRef.current = gameMode
  }, [gameMode])
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

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
  
  useEffect(() => {
    if (!gameData || !currentUser) {
      return
    }
    const getOppUserName = async () => {
      const oppID = currentUser.id === gameData.player1_id ? gameData.player2_id: gameData.player1_id
      const response = await fetchWithAuth(`/api/users/username/${oppID}`)
      if (!response.ok) {
        return
      }
      const data = await response.json()
      setOppName(data.username)
    }
    getOppUserName()
  }, [gameData, currentUser])

  // Listen for game-over events from the pong game
  useEffect(() => {
      const handleGameOver = (event: Event) => {
      const detail = (event as CustomEvent).detail
      console.log('🏁 Game over event received:', detail)
      console.log('🏆 isTournamentMatch (ref):', isTournamentMatchRef.current)
 
      if (isTournamentMatchRef.current) {
        console.log('🏆 Returning to tournament bracket...')
        setScreen('tournament-bracket')
        setGameMode('none')
        setGameData(null)
        return
      }

      // Build result for display
      if (detail.winnerLabel) {
        // Offline game (singleplayer / multiplayer) — detail already has labels
        setGameResult({
          gameMode: detail.gameMode || gameModeRef.current,
          winnerLabel: detail.winnerLabel,
          scorePlayer1: detail.scorePlayer1,
          scorePlayer2: detail.scorePlayer2,
          player1Label: detail.player1Label,
          player2Label: detail.player2Label,
        })
      } else if (detail.error) {
        // Error
        setGameResult({
          gameMode: 'online',
          winnerLabel: 'ERROR',
          scorePlayer1: 0,
          scorePlayer2: 0,
          player1Label: '-',
          player2Label: '-',
        })
      } else if (detail.winnerId !== undefined && gameData) {
        // Online game — normal finish
        const myId = currentUserRef.current?.id
        const iWon = Number(detail.winnerId) === Number(myId)
        const scoreMe = gameData.player1_id === myId ? detail.scorePlayer1: detail.scorePlayer2
        const scoreOpponent = gameData.player1_id === myId ? detail.scorePlayer2: detail.scorePlayer1
        const labelMe = 'YOU'
        const labelOpponent = oppName;
       setGameResult({
          gameMode: 'online',
          winnerLabel: iWon ? 'YOU WIN!' : 'YOU LOST!',
          scorePlayer1: scoreOpponent,
          scorePlayer2: scoreMe,
          player1Label: labelOpponent,
          player2Label: labelMe,
        })
      } else {
        // Fallback
        setGameMode('none')
        setScreen('main')
        setGameData(null)
        resetPlayerStatus()
        return
      }

      setScreen('game-results')
      setGameData(null)
    }

    window.addEventListener('game-over', handleGameOver)
    return () => {
      window.removeEventListener('game-over', handleGameOver)
    }
  }, [gameData, oppName])

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
    }).finally(() => {
      // Refresh currentUser so the frontend has the updated status ('idle')
      fetchWithAuth('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentUser(data.data)
            console.log('🔄 User status refreshed:', data.data.status)
          }
        })
        .catch(err => console.error('Failed to refresh user:', err))
    })
  }

  const handleBackToMenu = useCallback(() => {
    setGameResult(null)
    setGameMode('none')
    setScreen('main')
    setGameData(null)
    resetPlayerStatus()
  }, [])

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
          gameResult={gameResult}
          oppName={oppName}
          ownName={currentUser ? currentUser.username : 'UNKNOWN'}
          handleBackToMenu={handleBackToMenu}

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