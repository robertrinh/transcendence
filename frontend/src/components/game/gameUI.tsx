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
// import { HostLobby, JoinLobby } from './gameMenus.js';
import SearchingScreen from './searchingScreen.js';
import { TimeoutScreen, ErrorScreen } from './timeoutScreen.js';
import { WebSocketConnectingScreen, WebSocketClosedScreen } from './webSocketWaitScreen.js';
import { Screen, GameMode } from './types.js'
import  MainMenu  from '../util/gameMenuUtil.js';
import SinglePlayerMenu from '../util/singlePlayerUtil.js'
import MultiplayerMenu from '../util/multiPlayerUtil.js' 
import TournamentMenu from '../util/tournamentUtil.js'
import CountdownScreen from '../util/countDownUtil.js';

type gameProps = {
    lobbyId: string;
    gameMode: GameMode;
    screen: Screen;
    error: string | null;
    websocket: React.RefObject<null | WebSocket>

    setScreen(screen: Screen): void
    setGameMode(gameMode: GameMode): void

    handleRandomPlayer(): void
    handleHostReq(): void
    joinLobbyReq(lobbyId: string): void
    resetPlayerStatus(): void
}

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

function resizeGameUI(gameUI: HTMLElement) {
    const widthRatio = 0.75
    gameUI.style.height = String(gameUI.offsetWidth * widthRatio) + "px"
}

// joinLobbyReq, lobbyId,

export default function GameUI({
    screen, gameMode, error, websocket, setScreen, setGameMode,
    handleRandomPlayer, handleHostReq, resetPlayerStatus}:gameProps) {
    
    useEffect(() => {
        const gameUI = document.getElementById("game-ui")
        if (gameUI === null) {
            return
        }
        resizeGameUI(gameUI)
        const handleResize = () => {
            resizeGameUI(gameUI)
        }
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    const validateThen = async (next: () => void) => {
        const res = await fetchWithAuth('/api/auth/validate')
        if (res.ok) next()
    }

    const renderScreen = () => {
        switch (screen) {
            case 'main':
                return  <MainMenu
                            onModeSelect={(mode) => {
								validateThen(() => {
								if (mode === 'singleplayer') {
									setScreen('local')
								} else if (mode === 'multiplayer') {
									setScreen('online')
								} else if (mode === 'tournament') {
									setScreen('tournament')
								}
							})
                        }}
                    />
            case 'countdown':
                return  <CountdownScreen 
                            gameMode={gameMode}
                            onCountdownComplete={() => setScreen('game')}
                        />
           case 'local': 
                return  <SinglePlayerMenu
                            onBack={() => {setGameMode('none'); setScreen('main')}}
                            onSinglePlayer={() => validateThen(() => {setGameMode('singleplayer'); setScreen('countdown')})}
                            onMultiPlayer={() => validateThen(() => {setGameMode('multiplayer'); setScreen('countdown')})}
                        />
            case 'online':
                return  <MultiplayerMenu
                            onBack={() => setScreen('main')}
                            onPlayRandom={() => {
                                console.log('🎲 Play Random clicked')
                                validateThen(() => {
                                    console.log('✅ Validation passed, calling handleRandomPlayer')
                                    setGameMode('online')
                                    handleRandomPlayer() 
                                })
                            }}
                            onHostLobby={() => validateThen(handleHostReq)}
                            onJoinLobby={() => setScreen('join-lobby')}
                            onTournament={() => setScreen('tournament')}
                        />
            case 'tournament':
                return  <TournamentMenu
                            onBack={() => setScreen('main')}
                            onStartTournament={(playerCount: number) => {
                                setGameMode('online')
                                setScreen('game')
                                console.log('Starting tournament with', playerCount, 'players')
                            }}
                        />
            // case 'host-lobby':
            //     return  <HostLobby
            //                 lobbyId={lobbyId}
            //                 onCopyLobby={() => {
            //                     const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
            //                     if (lobbyElement === null) {return}
            //                     navigator.clipboard.writeText(lobbyElement.value)
            //                 }}
            //                 onJoinOwn={() => {
            //                     websocket.current!.send(
            //                         JSON.stringify({
            //                             "type": "HOST_LOBBY",
            //                             "lobby_id": lobbyId
            //                         })
            //                     )
            //                     setGameMode('online')
            //                     setScreen('game')
            //                 }}
            //             />
            // case 'join-lobby':
            //     return  <JoinLobby
            //                 onJoin={() => {
            //                     let lobbyID = null
            //                     try {
            //                         lobbyID = validateJoinLobby("input-lobby-id")
            //                     }
            //                     catch (e) {
            //                         alert(e)
            //                         return
            //                     }
            //                     joinLobbyReq(lobbyID)
            //                 }}
            //             />
            case 'searching':
                return  <SearchingScreen
                            onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
                        />
            case 'timeout':
                return <TimeoutScreen
                            onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
                            onRetry={async () => { await resetPlayerStatus(); handleRandomPlayer()}}
                        />
            case 'error':
                return <ErrorScreen
                            error={error}
                            onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
                        />
            case 'websocket-connecting':
                return <WebSocketConnectingScreen/>
            case 'websocket-closed':
                return <WebSocketClosedScreen/>
        }
    }

    return (
        <div id="game-ui" className="relative w-full h-full overflow-hidden">
            {/* Game layer */}
            <div className="absolute inset-0 z-0">
                {screen === 'game' && <GameCanvas mode={gameMode} websocket={websocket}/>}
            </div>
            
            {/* Menu/Countdown layer - show everything except game */}
            {screen !== 'game' && (
                <div className="absolute inset-0 z-10">
                    {renderScreen()}
                </div>
            )}
        </div>
    )
}