import { useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'
import GameCanvas from './gameCanvas.js'
import MainMenu from '../util/gameMenuUtil.js'
import SinglePlayerMenu from '../util/singlePlayerUtil.js'
import MultiplayerMenu from '../util/multiPlayerUtil.js'
import HostLobby from '../util/hostLobby.js'
import JoinLobby from '../util/joinLobby.js'
import ReadyRoom from '../util/readyRoomUtil.js'
import SearchingScreen from './searchingScreen.js';
import { TimeoutScreen } from './timeoutScreen.js';
import { Screen, GameMode } from './types.js'
import TournamentCreate from '../util/tournamentCreate.js'
import TournamentJoin from '../util/tournamentJoin.js'
import TournamentLobby from '../util/tournamentLobby.js'
import TournamentBracket from '../util/tournamentBracket.js'
import CountdownScreen from '../util/countDownUtil.js'
import GameResults from "../util/gameResultUtil.tsx"

interface gameProps {
    screen: Screen;
    gameMode: GameMode;
    lobbyId: string;
    error: string | null;
    websocket: React.RefObject<WebSocket | null>;
    gameData: any;
    tournamentId: number | null;
    selectedBracketSize: number;
    currentUser: any;
    isTournamentMatch: boolean;
    gameResult: {
        gameMode: string;
        winnerLabel: string;
        scorePlayer1: number;
        scorePlayer2: number;
        player1Label: string;
        player2Label: string;
    } | null;
    handleBackToMenu: () => void;

    setScreen(screen: Screen): void
    setGameMode(mode: GameMode): void
    setTournamentId(id: number | null): void
    setGameData(data: any): void
    setError(error: string | null): void

    handleRandomPlayer(): void
    handleHostReq(): void
    joinLobbyReq(lobbyId: string): void
    resetPlayerStatus(): void

    handleTournamentPlayMatch(gameId: number): void
    handleTournamentFinished(): void

    onTournamentJoined(toId: number, maxParticipants: number): void
    onTournamentCreated(toId: number, maxParticipants: number): void
    onTournamentStarted(): void
    onTournamentLeft(): void
    onCreateTournament(): void
    onBackFromCreate(): void
    onBackFromJoin(): void
}

function resizeGameUI(gameUI: HTMLElement) {
    const oldDisplay = gameUI.style.display
    const widthRatio = 0.75
    gameUI.setAttribute("style", `height:${gameUI.offsetWidth * widthRatio}px`)
    gameUI.setAttribute("style", `display:${oldDisplay}`)
    gameUI.style.height = String(gameUI.offsetWidth * widthRatio) + "px"
}

export default function GameUI({
    screen, gameMode, lobbyId, error, websocket, setScreen, setGameMode,
    handleRandomPlayer, handleHostReq, joinLobbyReq, resetPlayerStatus, gameData, 
    tournamentId, selectedBracketSize, currentUser, isTournamentMatch: _isTournamentMatch,
    gameResult, handleBackToMenu,
    setTournamentId: _setTournamentId, setGameData, setError: _setError,
    handleTournamentPlayMatch, handleTournamentFinished,
    onTournamentJoined, onTournamentCreated, onTournamentStarted,
    onTournamentLeft, onCreateTournament, onBackFromCreate, onBackFromJoin
}: gameProps) {
    
    useEffect(() => {
        const gameUI = document.getElementById("game-ui")
        if (gameUI === null) {
            return
        }
        resizeGameUI(gameUI)
        window.addEventListener("resize", () => {
            resizeGameUI(gameUI)
        })
        return () => {
            removeEventListener("resize", () => {
                resizeGameUI(gameUI)
            })
        }
    }, [])

    const validateThen = async (next: () => void) => {
        const res = await fetchWithAuth('/api/auth/validate')
        if (res.ok) next()
    }

    switch (screen) {
        case 'main':
            return <MainMenu
                        onModeSelect={(mode) => {
                            if (mode === 'singleplayer') {
                                setScreen('local')
                            } else if (mode === 'multiplayer') {
                                validateThen(() => setScreen('online'))
                            } else if (mode === 'tournament') {
                                validateThen(() => setScreen('tournament'))
                            }
                        }}
                    />
        case 'local': 
            return <SinglePlayerMenu
                        onSinglePlayer={() => {setGameMode('singleplayer'); setScreen('countdown')}}
                        onMultiPlayer={() => {setGameMode('multiplayer'); setScreen('countdown')}}
                        onBack={() => {setGameMode('none'); setScreen('main')}}
                    />
        case 'online':
            return <MultiplayerMenu
                        onPlayRandom={handleRandomPlayer}
                        onHostLobby={() => {handleHostReq()}}
                        onJoinLobby={() => setScreen('join-lobby')}
                        onTournament={() => setScreen('tournament')}
                        onBack={() => setScreen('main')}
                    />
        case 'host-lobby':
            return <HostLobby
                        lobbyId={lobbyId}
                        onGameCreated={(data: any) => {
                            setGameData(data)
                            setGameMode('online')
                            setScreen('ready-room')
                        }}
                        onBack={() => { setScreen('online'); resetPlayerStatus() }}
                    />
        case 'join-lobby':
            return <JoinLobby
                        onJoin={(id: string) => joinLobbyReq(id)}
                        onBack={() => setScreen('online')}
                    />
        case 'ready-room':
            return <ReadyRoom
                        gameData={gameData}
                        websocket={websocket}
                        gameMode={gameMode}
                        lobbyId={lobbyId}
                        currentUser={currentUser}
                        onBothReady={() => setScreen('countdown')}
                        onBack={() => { setScreen('online'); resetPlayerStatus() }}
                    />
        case 'tournament':
            return <TournamentJoin
                        tournamentId={tournamentId}
                        onTournamentJoined={onTournamentJoined}
                        onCreateNew={onCreateTournament}
                        onBack={onBackFromJoin}
                    />
        case 'create-tournament':
            return <TournamentCreate
                        onTournamentCreated={onTournamentCreated}
                        onBack={onBackFromCreate}
                    />
        case 'tournament-lobby':
            return <TournamentLobby
                        tournamentId={tournamentId}
                        maxParticipants={selectedBracketSize}
                        websocket={websocket}
                        onStartTournament={onTournamentStarted}
                        onLeaveTournament={onTournamentLeft}
                    />
        case 'tournament-bracket':
            return <TournamentBracket
                        tournamentId={tournamentId}
                        onPlayMatch={handleTournamentPlayMatch}
                        onTournamentFinished={handleTournamentFinished}
                        currentUserId={currentUser?.id}
                    />
        case 'countdown':
            return <CountdownScreen
                        gameData={gameData}
                        websocket={websocket}
                        onCountdownComplete={() => setScreen('game')}
                        gameMode={gameMode}
                        currentUserId={currentUser?.id}
                    />
        case 'searching':
            return <SearchingScreen
                        onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
                        onGameFound={(gameData: any) => {
                            setGameData(gameData)
                            setGameMode('online')
                            setScreen('ready-room')
                        }}
                    />
        case 'game':
            return <GameCanvas mode={gameMode} websocket={websocket}/>
        case 'timeout':
            return <TimeoutScreen
                        onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
                        onRetry={async () => { await resetPlayerStatus(); handleRandomPlayer()}}
                    />
        case 'error':
            return <div className="flex items-center justify-center min-h-screen bg-red-900">
                        <div className="text-center">
                            <p className="text-white text-2xl mb-4">{error}</p>
                            <button 
                                onClick={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Return to Main Menu
                            </button>
                        </div>
                    </div>
        case 'websocket-connecting':
            return <div className="flex items-center justify-center min-h-screen bg-black">
                        <p className="text-cyan-400 text-2xl font-arcade animate-pulse">CONNECTING TO SERVER...</p>
                    </div>
        case 'websocket-closed':
            return <div className="flex items-center justify-center min-h-screen bg-black">
                        <div className="text-center">
                            <p className="text-red-400 text-2xl font-arcade mb-4">CONNECTION LOST</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Reconnect
                            </button>
                        </div>
                    </div>
        case 'game-results':
            if (gameResult) {
                return <GameResults
                    gameMode={gameResult.gameMode}
                    winnerLabel={gameResult.winnerLabel}
                    scorePlayer1={gameResult.scorePlayer1}
                    scorePlayer2={gameResult.scorePlayer2}
                    player1Label={gameResult.player1Label}
                    player2Label={gameResult.player2Label}
                    onBackToMenu={handleBackToMenu}
                />
            }
            return <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-white text-xl">No results available</p>
            </div>
    }
}


// What’s Working
// Tournament mode: Players are correctly returned to the bracket after each match.
// Winner display: After each game (1vsBot, 1vs1 local, online), a results screen shows the winner, scores, and a “Back to Menu” button.
// Online matchmaking: The results screen always shows “YOU” and “OPPONENT” with the correct scores and win/loss message, regardless of which player you were.
// Singleplayer (1vsBot): Correctly displays “YOU WIN!” or “YOU LOST!” based on the actual winner.
// TypeScript errors: All unused variable errors have been resolved.
// What’s Left / What To Ask Next
// Player identification in local multiplayer: If you want to show “YOU” for the local player, you’ll need a way to select or indicate which side is “you” in local mode.
// Edge cases: Test for disconnects, errors, and tournament finals to ensure the winner display always works.
// UI/UX polish: You may want to improve the look of the results screen or add animations/sounds.
// Backend consistency: Make sure the backend always sends player1Id and player2Id for online games.
// Testing: Try all game modes and transitions to ensure no state leaks or stale data.
// Refactoring: Consider cleaning up repeated logic in the results handler and making the winner display more reusable.
// What To Ask Tomorrow
// How to handle “YOU”/“OPPONENT” in local multiplayer?
// How to add rematch or “Play Again” functionality?
// How to show more detailed stats or a match summary?
// How to handle edge cases (disconnects, errors) more gracefully?
// How to add sound effects or animations to the results screen?
// Any further TypeScript or code structure improvements?