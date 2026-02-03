import { PlayerPaddle } from './playerPaddle'
import { AI, DifficultyLevel } from './ai'

export class Player
{
    paddle: PlayerPaddle
    roundScore = 0
    gameScore = 0
    humanControlled: boolean
    ai: AI

    constructor(x: number, y: number, width: number, height: number, yVector: number, color: string, 
        humanControlled: boolean, canvas: HTMLCanvasElement
    ) {
        this.paddle = new PlayerPaddle(x, y, width, height, yVector, color)
        this.humanControlled = humanControlled
        this.ai = new AI(canvas, this.paddle)
    }
}
