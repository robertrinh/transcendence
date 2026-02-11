import { useEffect } from 'react'
import GameCanvas from './gameCanvas.js'
import { HostLobby, JoinLobby, LocalMenu, MainMenu, OnlineMenu } from './gameMenus.js';
import SearchingScreen from './searchingScreen.js';
import  { TimeoutScreen, ErrorScreen } from './timeoutScreen.js';
import websocket from '../../static/websocket.js';

type Screen = 'main' | 'online' | 'local' | 'host-lobby' | 'join-lobby' | 'searching' | 'game' | 'timeout' | 'error'
type GameMode = 'none' | 'singleplayer' | 'multiplayer' | 'online'

type gameProps = {
	lobbyId: string;
	gameMode: GameMode;
	screen: Screen;
	error: string | null;

	setScreen(screen: Screen): void
	setGameMode(gameMode: GameMode): void

	handleRandomPlayer(): void
	handleHostReq(): void
	joinLobbyReq(lobbyId: string): void
	resetPlayerStatus(): void
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
        const widthRatio = 0.75 // 4:3
        gameUI.setAttribute("style", `height:${gameUI.offsetWidth * widthRatio}px`)
        gameUI.setAttribute("style", `display:${oldDisplay}`)
        gameUI.style.height = String(gameUI.offsetWidth * widthRatio) + "px"
}

export default function GameUI({screen, gameMode, lobbyId, error, setScreen, setGameMode, handleRandomPlayer, handleHostReq, joinLobbyReq, resetPlayerStatus}:gameProps) {
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
	switch (screen) {
		case 'main':
			return 	<MainMenu
						onPlayLocal={() => setScreen('local')}
						onPlayOnline={() => setScreen('online')}
					/>
		case 'local': 
			return 	<LocalMenu
						onSinglePlayer={() => {setGameMode('singleplayer'); setScreen('game')}}
						onMultiPlayer={() => {setGameMode('multiplayer'); setScreen('game')}}
						onBack={() => {setGameMode('none'); setScreen('main')}}
					/>
		case 'online':
			return 	<OnlineMenu
						onPlayRandom={handleRandomPlayer}
						onHostLobby={() => {handleHostReq()}}
						onJoinLobby={() => setScreen('join-lobby')}
						onBack={() => setScreen('main')}
					/>
		case 'host-lobby':
			return 	<HostLobby
						lobbyId={lobbyId}
						onCopyLobby={() => {
							const lobbyElement = document.getElementById("req-lobby-id") as HTMLInputElement | null
							if (lobbyElement === null) {return}
							navigator.clipboard.writeText(lobbyElement.value)
						}}
						onJoinOwn={() => {
							websocket.send(
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
			return 	<JoinLobby
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
		case 'searching':
			return 	<SearchingScreen
						onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
					/>
		case 'game':
			return <GameCanvas mode={gameMode}/>
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
	}
  }