import { create } from 'zustand'
import { Screen, GameMode } from '../game/types.ts'

type GameStore = {
    screen: Screen
    gameMode: GameMode

    setScreen: (screen: Screen) => void
    setGameMode: (gameMode: GameMode) => void

}

const useGameStore = create<GameStore>((set) => ({
    screen: 'main',
    gameMode: 'none',

    setScreen: (screen: Screen) => set({ screen }),
    setGameMode: (mode: GameMode) => set({ gameMode: mode })
}))

export default useGameStore;