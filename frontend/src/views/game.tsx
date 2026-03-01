import { useState, useRef, useEffect, useCallback } from "react"
import GameUI from "../components/game/gameUI.tsx"
import { fetchWithAuth } from '../config/api'
import type { GameMode, Screen } from "../components/game/types.ts"
import { getAvatarUrl } from "../components/util/profileUtils.tsx"

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
  const tournamentIdRef = useRef(tournamentId)
  const [selectedBracketSize, setSelectedBracketSize] = useState<number>(4)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const currentUserRef = useRef<any>(null)
  const isTournamentMatchRef = useRef(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const gameModeRef = useRef<GameMode>("none")
  const [oppName, setOppName] = useState<string>('UNKNOWN')
  const [oppAvatar, setOppAvatar] = useState<string | undefined>(undefined)
  const [websocketState, setWebsocketState] = useState<number>(WebSocket.CONNECTING)

  useEffect(() => {
	return () => {
		stateKiller()
	}
  }, [])

  useEffect(() => {
	tournamentIdRef.current = tournamentId
  }, [tournamentId])

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
        const user = data.profile || data.data || data
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
      const response = await fetchWithAuth(`/api/users/avatar/${oppID}`)
      if (!response.ok) {
        return
      }
      const data = await response.json()
      setOppName(data.username)
      setOppAvatar(getAvatarUrl(data.avatar_url))
    }
    getOppUserName()
  }, [gameData, currentUser])

  // Listen for game-over events from the pong game
  useEffect(() => {
      const handleGameOver = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (isTournamentMatchRef.current) {
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
	  stateKiller()
      event.preventDefault();
      event.returnValue = '';
      return (event.returnValue);
    }
    window.addEventListener('beforeunload', handleOnBeforeUnload, {capture : true})
    return () =>{
      window.removeEventListener('beforeunload', handleOnBeforeUnload, {capture : true})
    }
  },[])

	function stateKiller() {
		if (!tournamentIdRef.current) {
			return
		}
        fetchWithAuth(`/api/tournaments/${tournamentIdRef.current}/leave`,
          {method: 'DELETE', keepalive: true})
        fetchWithAuth('/api/matchmaking/cancel', {method: 'PUT', keepalive: true})
		fetchWithAuth('/api/tournaments/extreme', {method: 'POST', keepalive: true})
  }

  async function handleRandomPlayer() {
    setGameMode("online")
    setScreen("searching")
    try {
      await fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
    } catch {
      //* ignore cancel errors
    }
    try {
      const response = await fetchWithAuth('/api/games/matchmaking', { method: 'POST' })
      if (!response.ok) 
		throw new Error('Failed matchmaking')
      const data = await response.json()
      if (data.data) {
        setGameData(data.data)
        setScreen('ready-room')
      } else {
        setScreen("searching")
      }
    } catch (err) {
      console.error('Matchmaking failed err:', err)
      setScreen("main")
      setGameMode("none")
    }
  }

  async function handleHostReq() {
    setGameMode("online")
    setScreen("searching")
    try {
      await fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
    } catch {
      //* ignore cancel errors
    }
    try {
      const response = await fetchWithAuth('/api/games/host', { method: 'POST' })
      if (!response.ok) 
		throw new Error('Failed hosting')
      const data = await response.json()
      setLobbyId(data.data.lobby_id)
      setScreen("host-lobby")
    } catch (err) {
      console.error('Hosting failed err:', err)
      setScreen("main")
      setGameMode("none")
    }
  }

  async function joinLobbyReq(lobbyId: string) {
    setGameMode("online")
    setScreen("searching")
    try {
      const response = await fetchWithAuth('/api/games/joinlobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobby_id: lobbyId }),
      })
      if (!response.ok) 
		throw new Error('Failed to join lobby')
      const data = await response.json()
      console.log('Joined lobby response:', data)
      setGameData(data.data)
      setScreen("ready-room")
    } catch (err) {
      console.error('Join lobby failed err:', err)
      setScreen("main")
      setGameMode("none")
    }
  }

  async function resetPlayerStatus() {
    try {
      const response = await fetchWithAuth('/api/games/matchmaking/cancel', { method: 'PUT' })
      if (!response.ok) 
		throw new Error('Failed to cancel matchmaking')
      console.log('Matchmaking cancelled')
    } catch (err) {
      console.error('Cancel matchmaking failed:', err)
    }
    // Refresh currentUser so the frontend has the updated status ('idle')
    try {
      const res = await fetchWithAuth('/api/users/me')
      const data = await res.json()
      if (data.success) {
        setCurrentUser(data.data)
      }
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
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
    setTournamentId(toId)
    setSelectedBracketSize(maxParticipants)
    setScreen('tournament-lobby')
  }, [])

  const handleTournamentJoined = useCallback((toId: number, maxParticipants: number) => {
    setTournamentId(toId)
    setSelectedBracketSize(maxParticipants)
    setScreen('tournament-lobby')
  }, [])

  const handleTournamentStarted = useCallback(() => {
    setScreen('tournament-bracket')
  }, [])

  const handleTournamentLeft = useCallback(() => {
    setTournamentId(null)
    isTournamentMatchRef.current = false
    setScreen('main')
    setGameMode('none')
  }, [])

  // Play a tournament match
  const handleTournamentPlayMatch = useCallback(async (gameId: number) => {
    isTournamentMatchRef.current = true
    try {
      const response = await fetchWithAuth(`/api/games/${gameId}`)
      if (!response.ok) throw new Error('Failed to fetch game data')
      const data = await response.json()
      setGameData(data.data)
      setGameMode('online')
      setScreen('ready-room')
    } catch (err) {
      console.error('Failed to start tournament match:', err)
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
          oppAvatar={oppAvatar}
          ownName={currentUser ? currentUser.username : 'UNKNOWN'}
          ownAvatar={getAvatarUrl(currentUser?.avatar_url)}
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