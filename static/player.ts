import { PlayerPaddle } from './playerPaddle.js'

export class Player
{
    paddle: PlayerPaddle
    roundScore = 0
    gameScore = 0

    constructor(x: number, y: number, width: number, height: number, yVector: number, color: string) {
        this.paddle = new PlayerPaddle(x, y, width, height, yVector, color)
    }
}
