import { CollisionBox } from './game.js'

export class playerPaddle
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

    private hasVerticalCollision(canvas: HTMLCanvasElement, newY: number): boolean {
        if (
            newY < 0 ||
            newY + this.height > canvas.height
        ) {
            return true
        }
        return false
    }

    private moveUp(canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        const newY = this.y - this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(canvas, newY)) {
            return
        }
        this.y = newY
    }

    private moveDown(canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        const newY = this.y + this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(canvas, newY)) {
            return
        }
        this.y = newY
    }

    public pointInBox(x: number, y: number): boolean {
        if (
            x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height
        ) {
            return true
        }
        return false
    }

    public getHitSide(ball: CollisionBox): playerPaddle.hitSide {
        const deltaX = (ball.x + ball.width / 2) - (this.x + this.width / 2)
        const deltaY = (ball.y + ball.height / 2) - (this.y + this.height / 2)

        console.log(deltaX)
        console.log(deltaY)
        if (deltaX === deltaY) {
            return playerPaddle.hitSide.Error
        }
        if (deltaX > deltaY) {
            if (Math.abs(deltaY) > deltaY) {
                return playerPaddle.hitSide.Top
            }
            return playerPaddle.hitSide.Bottom
        }
        else
        {
            if (Math.abs(deltaX) > deltaX) {
                return playerPaddle.hitSide.Left
            }
            return playerPaddle.hitSide.Right
        }
    }

    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, deltaTimeSeconds: number) {
        canvasCtx.fillStyle = this.color
        canvasCtx.fillRect(this.x, this.y, this.width, this.height)
        canvasCtx.fillStyle = "#ffffff"
        if (this.downPressed) {
            this.moveDown(canvas, deltaTimeSeconds)
        }
        if (this.upPressed) {
            this.moveUp(canvas, deltaTimeSeconds)
        }
    }
}

export namespace playerPaddle
{
    export enum hitSide
    {
        Top,
        Bottom,
        Left,
        Right,
        Error
    } 
}