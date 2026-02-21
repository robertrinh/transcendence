import { useEffect } from 'react'
import { fetchWithAuth } from '../../config/api'
import GameCanvas from './gameCanvas.js'
import { HostLobby, JoinLobby, LocalMenu, MainMenu, OnlineMenu } from './gameMenus.js';
import {MainMenuTournament, MenuCreateTournament} from './tournamentMenus.js'
import SearchingScreen from './searchingScreen.js';
import  { TimeoutScreen, InfoScreen } from './timeoutScreen.js';
import { Screen, GameMode } from './types.js'
import { infoBoxType } from './infoBox.js';
import  useGameStore  from '../util/gameStore.js';

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

export default function GameUI({
	lobbyId, error, websocket,
	handleRandomPlayer, handleHostReq, joinLobbyReq, resetPlayerStatus}:gameProps) {

    const screen = useGameStore(set => set.screen)
    const gameMode = useGameStore(set => set.gameMode)
    const setScreen = useGameStore(set => set.setScreen)
    const setGameMode = useGameStore(set => set.setGameMode)

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
			return 	<MainMenu
						onPlayLocal={() => validateThen(() => setScreen('local'))}
						onPlayOnline={() => validateThen(() => setScreen('online'))}
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
						onTournament={() => setScreen('tournament')}
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
							setGameMode('online')
							setScreen('searching-private')
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
		case 'tournament':
			return <MainMenuTournament 
						onCreateTour={() => setScreen('create-tournament')}
					/>
		case 'create-tournament':
			return <MenuCreateTournament 
						onCreate={() => alert('create tournament and put you in a waiting room') } //handleTournamentCreation()}
					/>
		case 'searching':
			return 	<SearchingScreen
						message='Searching for match...'
						onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
					/>
		case 'searching-private':
			return 	<SearchingScreen
						message='Waiting for your opponent to join...'
						onCancel={() => {setGameMode('none'); setScreen('online'); resetPlayerStatus()}}
					/>
		case 'game':
			return <GameCanvas mode={gameMode} websocket={websocket}/>
		case 'timeout':
			return <TimeoutScreen
						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
						onRetry={async () => { await resetPlayerStatus(); handleRandomPlayer()}}
					/>
		case 'info-bad':
			return <InfoScreen
						screenType={infoBoxType.Bad}
						message={error!}
						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
					/>
		case 'info-neutral':
			return <InfoScreen
						screenType={infoBoxType.Neutral}
						message={error!}
						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
					/>
		case 'info-good':
			return <InfoScreen
						screenType={infoBoxType.Good}
						message={error!}
						onExit={() => {setGameMode('none'); setScreen('main'); resetPlayerStatus()}}
					/>
	}
  }
