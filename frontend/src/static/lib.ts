import { Ball } from "./ball"
import { Player } from "./player"

/**
 * Globals
 */
export const arenaWidth = 1024
export const arenaHeight = 768
export const ballRadius = 15
export const ballSize = ballRadius * 2
export const paddleMoveUnits = 30
const targetFPS = 60
export const clientTick = 1000 / targetFPS
export const ball = new Ball(
    0, 0, {x: 1, y: 1}, ballRadius, 2, "#160f29", 0, 7.5,
    new Array("#ffffff", "#cdc3e9", "#9c88d3"))
export const playerOne = new Player(
    0, 0, ballSize, ballSize * 4, paddleMoveUnits, "#5885a2")
export const playerTwo = new Player(
    arenaWidth - ballSize, 0, ballSize, ballSize * 4, paddleMoveUnits,
    "#b8383b")

export class Vector2
{
	x: number
	y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export function assertIsNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val === null) {
        throw new Error("val cannot be null")
    }
}

export function lineLineIntersection(lineAStart: Point, lineAEnd: Point, lineBStart: Point, lineBEnd: Point): Point | null {
    const distA = ((lineBEnd.x - lineBStart.x) * (lineAStart.y - lineBStart.y) - (lineBEnd.y - lineBStart.y) * (lineAStart.x - lineBStart.x)) /
    ((lineBEnd.y - lineBStart.y) * (lineAEnd.x - lineAStart.x) - (lineBEnd.x - lineBStart.x) * (lineAEnd.y - lineAStart.y))
    const distB = ((lineAEnd.x - lineAStart.x) * (lineAStart.y - lineBStart.y) - (lineAEnd.y - lineAStart.y) * (lineAStart.x - lineBStart.x)) /
    ((lineBEnd.y-lineBStart.y) * (lineAEnd.x - lineAStart.x) - (lineBEnd.x - lineBStart.x) * (lineAEnd.y - lineAStart.y))
    
    if (distA >= 0 && distA <= 1 && distB >= 0 && distB <= 1) {
        const intersectionX = lineAStart.x + (distA * (lineAEnd.x - lineAStart.x))
        const intersectionY = lineAStart.y + (distA * (lineAEnd.y - lineAStart.y))
        return {x: intersectionX, y: intersectionY}
    }
    return null
}

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
    }
