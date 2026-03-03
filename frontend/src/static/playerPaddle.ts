import { arenaHeight, isCollidingBallPaddle, Point } from "./lib"
import { type Ball } from "./ball"

export class PlayerPaddle
{
    x: number
    y: number
    width: number
    height: number
    yVector: number
    color: string
    upPressed = false
    downPressed = false

    constructor(x: number, y: number, width: number, height: number, yVector: number, color: string) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.yVector = yVector
        this.color = color
    }

    moveUp(ball: Ball) {
        let newY = this.y - this.yVector

        if (newY < 0) {
            newY = 0
        }
        const ballCenterX = ball.x + ball.radius
        const ballCenterY = ball.y + ball.radius
        if (isCollidingBallPaddle(ballCenterX, ballCenterY, ball.radius, this.x, newY,
            this.width, this.height) !== null) {
            return
        }
        this.y = newY
    }

    moveDown(ball: Ball) {
        let newY = this.y + this.yVector
        if (newY + this.height > arenaHeight) {
            newY = arenaHeight - this.height
        }
        const ballCenterX = ball.x + ball.radius
        const ballCenterY = ball.y + ball.radius
        if (isCollidingBallPaddle(ballCenterX, ballCenterY, ball.radius, this.x, newY,
            this.width, this.height) !== null) {
            return
        }
        this.y = newY
    }

    update(ball: Ball) {
        if (this.downPressed) {
            this.moveDown(ball)
        }
        if (this.upPressed) {
            this.moveUp(ball)
        }
    }

    draw(canvasCtx: CanvasRenderingContext2D) {
        canvasCtx.fillStyle = this.color
        canvasCtx.fillRect(this.x, this.y, this.width, this.height)
    }
}

export namespace player_paddle
{
    export enum hitSide
    {
        Top,
        Bottom,
        Left,
        Right,
        None
    } 
}
