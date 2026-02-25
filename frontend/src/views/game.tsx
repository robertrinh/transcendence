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

  // Listen for game-over events from the pong game
  useEffect(() => {
    const handleGameOver = (event: Event) => {
      const detail = (event as CustomEvent).detail

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
      } else if (detail.disconnect) {
        // Online game — opponent disconnected
        setGameResult({
          gameMode: 'online',
          winnerLabel: 'YOU WIN!',
          scorePlayer1: 0,
          scorePlayer2: 0,
          player1Label: 'OPPONENT',
          player2Label: 'YOU',
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
      } else if (detail.winnerId !== undefined) {
        // Online game — normal finish
        const myId = currentUserRef.current?.id
        const iWon = Number(detail.winnerId) === Number(myId)
        let scoreMe, scoreOpponent, labelMe, labelOpponent;
        // Make sure player1Id/player2Id are present in detail
        if (Number(detail.player1Id) === Number(myId)) {
          scoreMe = detail.scorePlayer1 ?? 0;
          scoreOpponent = detail.scorePlayer2 ?? 0;
          labelMe = 'YOU';
          labelOpponent = 'OPPONENT';
        } else {
          scoreMe = detail.scorePlayer2 ?? 0;
          scoreOpponent = detail.scorePlayer1 ?? 0;
          labelMe = 'YOU';
          labelOpponent = 'OPPONENT';
        }
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
  }, [])

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
        }).catch(() => {
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
        }).catch(() => {
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
      setGameData(data.data)
      setScreen("ready-room")
    }).catch(() => {
      setScreen("main")
      setGameMode("none")
    })
  }

  function resetPlayerStatus() {
    fetchWithAuth('/api/games/matchmaking/cancel', {
      method: 'PUT'
    }).then(response => {
      if (!response.ok) throw new Error('Failed to cancel matchmaking')
    }).catch(() => {})
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
      isTournamentMatchRef.current = false
      setError(String(err))
    }
  }, [])

  const handleTournamentFinished = useCallback(() => {
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
          gameResult={gameResult}
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