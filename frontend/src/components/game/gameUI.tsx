// import { useEffect } from 'react'
// import { fetchWithAuth } from '../../config/api'
// import GameCanvas from './gameCanvas.js'
// import { HostLobby, JoinLobby, LocalMenu, MainMenu, OnlineMenu } from './gameMenus.js';
// // import {MainMenuTournament, MenuCreateTournament} from './tournamentMenus.js'
// import SearchingScreen from './searchingScreen.js';
// import  { TimeoutScreen, ErrorScreen } from './timeoutScreen.js';
// import { WebSocketConnectingScreen, WebSocketClosedScreen } 
// from './webSocketWaitScreen.js';
// import { Screen, GameMode } from './types.js'

// type gameProps = {
// 	lobbyId: string;
// 	gameMode: GameMode;
// 	screen: Screen;
// 	error: string | null;
// 	websocket: React.RefObject<null | WebSocket>

// 	setScreen(screen: Screen): void
// 	setGameMode(gameMode: GameMode): void

// 	handleRandomPlayer(): void
// 	handleHostReq(): void
// 	joinLobbyReq(lobbyId: string): void
// 	resetPlayerStatus(): void
// }

// function validateJoinLobby(lobbyID: string): string {
//     const lobbyEle = document.getElementById(lobbyID) as HTMLInputElement | null
//     if (lobbyEle === null) {
//         throw Error("lobbyEle cannot be null")
//     }
//     if (lobbyEle.value.length === 0) {
//         throw Error("lobby ID cannot be empty")
//     }
//     return lobbyEle.value
// }

// function resizeGameUI(gameUI: HTMLElement) {
//         const oldDisplay = gameUI.style.display
//         const widthRatio = 0.75 // 4:3
//         gameUI.setAttribute("style", `height:${gameUI.offsetWidth * widthRatio}px`)
//         gameUI.setAttribute("style", `display:${oldDisplay}`)
//         gameUI.style.height = String(gameUI.offsetWidth * widthRatio) + "px"
// }

// export default function GameUI({
// 	screen, gameMode, lobbyId, error, websocket, setScreen, setGameMode,
// 	handleRandomPlayer, handleHostReq, joinLobbyReq, resetPlayerStatus}:gameProps) {
// 	useEffect(() => {
// 		const gameUI = document.getElementById("game-ui")
// 		if (gameUI === null) {
// 			return
// 		}
// 		resizeGameUI(gameUI)
// 		window.addEventListener("resize", () => {
// 			resizeGameUI(gameUI)
// 		})
// 		return () => {
// 			removeEventListener("resize", () => {
// 				resizeGameUI(gameUI)
// 			})
// 		}
// 	}, [])
// 	const validateThen = async (next: () => void) => {
// 		const res = await fetchWithAuth('/api/auth/validate')
// 		if (res.ok) next()
// 	}

// 	switch (screen) {
// 		case 'main':
// 			return 	<MainMenu
// 						onPlayLocal={() => validateThen(() => setScreen('local'))}
// 						onPlayOnline={() => validateThen(() => setScreen('online'))}
// 					/>
// 		case 'local': 
// 			return 	<LocalMenu
// 						onSinglePlayer={() => {setGameMode('singleplayer'); setScreen('game')}}
// 						onMultiPlayer={() => {setGameMode('multiplayer'); setScreen('game')}}
// 						onBack={() => {setGameMode('none'); setScreen('main')}}
// 					/>
// 		case 'online':
// 			return 	<OnlineMenu
// 						onPlayRandom={handleRandomPlayer}
// 						onHostLobby={() => {handleHostReq()}}
// 						onJoinLobby={() => setScreen('join-lobby')}
// 						onTournament={() => setScreen('tournament')}
// 						onBack={() => setScreen('main')}
// 					/>
// 		case 'host-lobby':
// 			return 	<HostLobby
// 						lobbyId={lobbyId}
// 						onCopyLobby={() => {
// 							const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
// 							if (lobbyElement === null) {return}
// 							navigator.clipboard.writeText(lobbyElement.value)
// 						}}
// 						onJoinOwn={() => {
// 							websocket.current!.send(
// 								JSON.stringify({
// 									"type": "HOST_LOBBY",
// 									"lobby_id": lobbyId
// 								})
// 							)
// 							setGameMode('online')
// 							setScreen('game')
// 						}}
// 					/>
// 		case 'join-lobby':
// 			return 	<JoinLobby
// 						onJoin={() => {
// 							let lobbyID = null
// 							try {
// 								lobbyID = validateJoinLobby("input-lobby-id")
// 							}
// 							catch (e) {
// 								alert(e)
// 								return
// 							}
// 							joinLobbyReq(lobbyID)
// 						}}
// 					/>
// 		// case 'tournament':
// 		// 	return <MainMenuTournament 
// 		// 				onCreateTour={() => setScreen('create-tournament')}
// 		// 			/>
// 		// case 'create-tournament':
// 		// 	return <MenuCreateTournament 
// 		// 				onCreate={() => alert('create tournament and put you in a waiting room') } //handleTournamentCreation()}
// 		// 			/>
// 		case 'searching':
// 			return 	<SearchingScreen
// 						onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
// 					/>
// 		case 'game':
// 			return <GameCanvas mode={gameMode} websocket={websocket}/>
// 		case 'timeout':
// 			return <TimeoutScreen
// 						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
// 						onRetry={async () => { await resetPlayerStatus(); handleRandomPlayer()}}
// 					/>
// 		case 'error':
// 			return <ErrorScreen
// 						error={error}
// 						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
// 					/>
// 		case 'websocket-connecting':
// 			return <WebSocketConnectingScreen/>
// 		case 'websocket-closed':
// 			return <WebSocketClosedScreen/>
// 	}
//   }
import { useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'
import GameCanvas from './gameCanvas.js'
import { HostLobby, JoinLobby, LocalMenu, MainMenu, OnlineMenu } from './gameMenus.js';
import SearchingScreen from './searchingScreen.js';
import { TimeoutScreen } from './timeoutScreen.js';
// import { WebSocketConnectingScreen, WebSocketClosedScreen } from './webSocketWaitScreen.js';
import { Screen, GameMode } from './types.js'
import TournamentCreate from '../util/tournamentCreate.js'
import TournamentJoin from '../util/tournamentJoin.js'
import TournamentLobby from '../util/tournamentLobby.js'
import TournamentBracket from '../util/tournamentBracket.js'
import CountdownScreen from '../util/countDownUtil.js'

type gameProps = {
    lobbyId: string;
    gameMode: GameMode;
    screen: Screen;
    error: string | null;
    websocket: React.RefObject<null | WebSocket>
    gameData: any
    tournamentId: number | null
    selectedBracketSize: number
    currentUser: any

    setScreen(screen: Screen): void
    setGameMode(gameMode: GameMode): void
    setTournamentId(id: number | null): void
    setGameData(data: any): void
    setError(error: string | null): void
    setSelectedBracketSize(size: number): void

    handleRandomPlayer(): void
    handleHostReq(): void
    joinLobbyReq(lobbyId: string): void
    resetPlayerStatus(): void
    
    onTournamentMenu: () => void
    onTournamentJoined: (toId: number) => void
    onTournamentCreated: (toId: number) => void
    onTournamentStarted: () => void
    onTournamentLeft: () => void
    onCreateTournament: () => void
    onBackFromCreate: () => void
    onBackFromJoin: () => void
}

function validateJoinLobby(lobbyID: string): string {
    const lobbyEle = document.getElementById(lobbyID) as HTMLInputElement | null
    if (lobbyEle === null) {
        throw Error("lobbyEle cannot be null")
    }
    if (lobbyEle.value.length === 0) {
        throw Error("lobby ID cannot be empty")
    }
    return lobbyEle.value
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
    tournamentId, selectedBracketSize, currentUser,
    setTournamentId, setGameData, setError,  // ✅ Removed setSelectedBracketSize
    onTournamentMenu, onTournamentJoined, onTournamentCreated, onTournamentStarted,
    onTournamentLeft, onCreateTournament, onBackFromCreate  // ✅ Removed onBackFromJoin
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
                        onPlayLocal={() => validateThen(() => setScreen('local'))}
                        onPlayOnline={() => validateThen(() => setScreen('online'))}
                    />
        case 'local': 
            return <LocalMenu
                        onSinglePlayer={() => {setGameMode('singleplayer'); setScreen('game')}}
                        onMultiPlayer={() => {setGameMode('multiplayer'); setScreen('game')}}
                        onBack={() => {setGameMode('none'); setScreen('main')}}
                    />
        case 'online':
            return <OnlineMenu
                        onPlayRandom={handleRandomPlayer}
                        onHostLobby={() => {handleHostReq()}}
                        onJoinLobby={() => setScreen('join-lobby')}
                        onTournament={() => setScreen('tournament')}
                        onBack={() => setScreen('main')}
                    />
        case 'host-lobby':
            return <HostLobby
                        lobbyId={lobbyId}
                        onCopyLobby={() => {
                            const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
                            if (lobbyElement === null) {return}
                            navigator.clipboard.writeText(lobbyElement.value)
                        }}
                        onJoinOwn={() => {
                            websocket.current!.send(
                                JSON.stringify({
                                    "type": "HOST_LOBBY",
                                    "lobby_id": lobbyId
                                })
                            )
                            setGameMode('online')
                            setScreen('game')
                        }}
                    />
        case 'join-lobby':
            return <JoinLobby
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
                        }}
                    />
        case 'tournament':
            return <TournamentJoin
                        tournamentId={tournamentId}
                        onTournamentJoined={onTournamentJoined}
                        onCreateNew={onCreateTournament}
                        onBack={onTournamentMenu}
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
                        onPlayMatch={async (gameId) => {
                            console.log('🎯 Playing tournament match - Game ID:', gameId)
                            
                            try {
                                const response = await fetchWithAuth(`/api/games/${gameId}`)
                                if (!response.ok) throw new Error('Failed to fetch game')
                                
                                const gameResponse = await response.json()
                                console.log('Game data:', gameResponse.data)
                                
                                setGameMode('online')
                                setGameData(gameResponse.data)
                                setScreen('countdown')
                            } catch (err) {
                                console.error('Failed to start match:', err)
                                setError(String(err))
                                setScreen('error')
                            }
                        }}
                        onTournamentFinished={() => {
                            setGameMode('none')
                            setTournamentId(null)
                            setScreen('main')
                            resetPlayerStatus()
                        }}
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
    }
}
