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

    private hasVerticalCollision(newY: number): boolean {
        if (
            newY < 0 ||
            newY + this.height > arenaHeight
        ) {
            return true
        }
        return false
    }

    moveUp(deltaTimeSeconds: number) {
        const newY = this.y - this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(newY)) {
            return
        }
        this.y = newY
    }

    moveDown(deltaTimeSeconds: number) {
        const newY = this.y + this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(newY)) {
            return
        }
        this.y = newY
    }

    update(deltaTimeSeconds: number) {
        if (this.downPressed) {
            this.moveDown(deltaTimeSeconds)
        }
        if (this.upPressed) {
            this.moveUp(deltaTimeSeconds)
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
