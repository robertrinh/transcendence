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

    private hasVerticalCollision(canvas: HTMLCanvasElement, newY: number): boolean {
        if (
            newY < 0 ||
            newY + this.height > canvas.height
        ) {
            return true
        }
        return false
    }

    moveUp(canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        const newY = this.y - this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(canvas, newY)) {
            return
        }
        this.y = newY
    }

    moveDown(canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        const newY = this.y + this.yVector * deltaTimeSeconds

        if (this.hasVerticalCollision(canvas, newY)) {
            return
        }
        this.y = newY
    }

    update(canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        if (this.downPressed) {
            this.moveDown(canvas, deltaTimeSeconds)
        }
        if (this.upPressed) {
            this.moveUp(canvas, deltaTimeSeconds)
        }
    }

    draw(canvasCtx: CanvasRenderingContext2D) {
        canvasCtx.fillStyle = this.color
        canvasCtx.fillRect(this.x, this.y, this.width, this.height)
        canvasCtx.fillStyle = "#ffffff"
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
