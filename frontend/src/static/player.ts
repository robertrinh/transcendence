import { PlayerPaddle } from './playerPaddle.js'
import { AI } from './ai.js'

export class Player
{
    paddle: PlayerPaddle
    roundScore = 0
    gameScore = 0
    humanControlled: boolean
    ai: AI | undefined

    constructor(
            x: number, y: number, width: number, height: number,
            yVector: number, color: string) {
        this.paddle = new PlayerPaddle(x, y, width, height, yVector, color)
        this.humanControlled = true
        this.ai = undefined
    }

    setAI() {
        this.humanControlled = false
        this.ai = new AI(this.paddle)
    }
}
