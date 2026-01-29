import { Ball } from "./ball"

function ballInHorizontalBounds(canvas: HTMLCanvasElement, ball: Ball): boolean {
        if (
            ball.y + (ball.dirVector.y * ball.movementSpeed) > canvas.height - ball.radius * 2 ||
            ball.y + (ball.dirVector.y * ball.movementSpeed) < 0
        ) {
            return true
        }
        return false
    }

function ballInVerticalBounds(canvas: HTMLCanvasElement, ball: Ball): boolean {
        if (
            ball.x + (ball.dirVector.x * ball.movementSpeed) > canvas.width - ball.radius * 2 ||
            ball.x + (ball.dirVector.x * ball.movementSpeed) < 0
        ) {
            return true
        }
        return false
    }

export function applyBallHorizontalBounce(canvas: HTMLCanvasElement, ball: Ball): void {
        if (ballInHorizontalBounds(canvas, ball)) {
            ball.dirVector.y = -ball.dirVector.y
        }
    }

export function applyBallVerticalBounce(canvas: HTMLCanvasElement, ball: Ball): void {
    if (ballInVerticalBounds(canvas, ball)) {
        ball.dirVector.x = -ball.dirVector.x
    }
}

export function printText(ctx: CanvasRenderingContext2D, fontSizePX: number,
    x: number, y: number, color: string, textStyle: string, text: Array<string>) {
    const oldColor = ctx.fillStyle
    let i = 0
    for (const str of text) {
        ctx.fillStyle = color
        ctx.font = `${fontSizePX}px ${textStyle}`
        ctx.fillText(str, x, y + (i * fontSizePX * 1.1))
        i++
    }
    ctx.fillStyle = color
}

export function drawPlayerScores(
    canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
    fontSizePX: number, color: string, textStyle: string,
    playerOneRoundScore: number, playerTwoRoundScore: number) {
        ctx.font = `${fontSizePX}px ${textStyle}`
        ctx.textAlign = "center"
        ctx.fillStyle = color
        ctx.fillText(
            playerTwoRoundScore.toString(), canvas.width * 0.25,
            canvas.height * 0.1
        )
        ctx.fillText(
            playerOneRoundScore.toString(), canvas.width * 0.75,
            canvas.height * 0.1
        )
        ctx.fillStyle = oldColor
        ctx.textAlign = oldTextAlign
    }
