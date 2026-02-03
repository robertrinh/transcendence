import { arenaHeight } from "./lib"

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

    moveUp() {
        let newY = this.y - this.yVector

        if (newY < 0) {
            newY = 0
        }
        this.y = newY
    }

    moveDown() {
        let newY = this.y + this.yVector
        if (newY + this.height > arenaHeight) {
            newY = arenaHeight - this.height
        }
        this.y = newY
    }

    update() {
        if (this.downPressed) {
            this.moveDown()
        }
        if (this.upPressed) {
            this.moveUp()
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
