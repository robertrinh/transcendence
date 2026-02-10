import { Ball } from "./ball"
import { Player } from "./player"
import { PlayerPaddle } from "./playerPaddle"

/**
 * Globals
 */
export const arenaWidth = 1024
export const arenaHeight = 768
export const roundMax = 3
export const ballRadius = 15
export const ballSize = ballRadius * 2
// physics, the speeds need to be equal to the server
const targetFPS = 60
export const clientTick = 1000 / targetFPS
const ballSpeedPerTick = 0.25
const paddleSpeedPerTick = 0.5
const ballSpeed = ballSpeedPerTick * clientTick
export const paddleMoveUnits = paddleSpeedPerTick * clientTick
export const ball = new Ball(
    0, 0, {x: 1, y: 1}, ballRadius, ballSpeed, "#160f29", 0, 7.5,
    new Array("#ffffff", "#cdc3e9", "#9c88d3"))
export const playerOne = new Player(
    0, 0, ballSize, ballSize * 4, paddleMoveUnits, "#5885a2")
export const playerTwo = new Player(
    arenaWidth - ballSize, 0, ballSize, ballSize * 4, paddleMoveUnits,
    "#b8383b")
export const textColor = "#36454f"

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

export function lineLineIntersection(
    p1: Point, p2: Point, p3: Point, p4: Point, side: string): 
    null | [Point, string] {
    const denom = ((p2.x - p1.x) * (p4.y - p3.y)) - ((p2.y - p1.y) * (p4.x - p3.x))
    if (denom === 0) {
        return null
    }
    const dist1 = (((p1.y - p3.y) * (p4.x - p3.x)) - ((p1.x - p3.x) * (p4.y - p3.y))) / denom
    const dist2 = (((p1.y - p3.y) * (p2.x - p1.x)) - ((p1.x - p3.x) * (p2.y - p1.y))) / denom
    if ((dist1 >= 0 && dist1 <= 1) && (dist2 >= 0 && dist2 <= 1)) {
        const intersect_x = p1.x + (dist1 * (p2.x - p1.x))
        const intersect_y = p1.y + (dist1 * (p2.y - p1.y))
        return [new Point(intersect_x, intersect_y), side]
    }
    return null
}
export function handlePaddleCollision(
        oldBallPos: Point, newBallPos: Point, playerPaddle: PlayerPaddle,
        ball: Ball
    ): null | [Point, string] {
        let intersect = null
        if (ball.dirVector.x < 0) {
            intersect = lineLineIntersection(
                oldBallPos,
                newBallPos,
                new Point(
                    playerPaddle.x + playerPaddle.width + ball.radius,
                    playerPaddle.y - ball.radius
                    ),
                new Point(
                    playerPaddle.x + playerPaddle.width + ball.radius,
                    playerPaddle.y + playerPaddle.height + ball.radius
                ),
                "right"
            )
        }
        else if (ball.dirVector.x > 0) {
            intersect = lineLineIntersection(
                oldBallPos,
                newBallPos,
                new Point(
                    playerPaddle.x - ball.radius,
                    playerPaddle.y - ball.radius
                    ),
                new Point(
                    playerPaddle.x - ball.radius,
                    playerPaddle.y + playerPaddle.height + ball.radius
                ),
                "left"
            )
        }
        if (intersect === null) {
            if (ball.dirVector.y < 0) {
                intersect = lineLineIntersection(
                    oldBallPos,
                    newBallPos,
                    new Point(
                        playerPaddle.x - ball.radius,
                        playerPaddle.y + playerPaddle.height + ball.radius
                        ),
                    new Point(
                        playerPaddle.x + playerPaddle.width + ball.radius,
                        playerPaddle.y + playerPaddle.height + ball.radius
                    ),
                    "bottom"
                )
            }
            else if (ball.dirVector.y > 0) {
                intersect = lineLineIntersection(
                    oldBallPos,
                    newBallPos,
                    new Point(
                        playerPaddle.x - ball.radius,
                        playerPaddle.y - ball.radius
                        ),
                    new Point(
                        playerPaddle.x + playerPaddle.width + ball.radius,
                        playerPaddle.y + playerPaddle.width - ball.radius
                    ),
                    "top"
                )
            }
        }
        return intersect
    }

function ballInHorizontalBounds(ball: Ball): boolean {
        if (
            ball.y + (ball.dirVector.y * ball.movementSpeed) > arenaHeight - ball.radius * 2 ||
            ball.y + (ball.dirVector.y * ball.movementSpeed) < 0
        ) {
            return true
        }
        return false
    }

function ballInVerticalBounds(ball: Ball): boolean {
        if (
            ball.x + (ball.dirVector.x * ball.movementSpeed) > arenaWidth - ball.radius * 2 ||
            ball.x + (ball.dirVector.x * ball.movementSpeed) < 0
        ) {
            return true
        }
        return false
    }

export function applyBallHorizontalBounce(ball: Ball): void {
        if (ballInHorizontalBounds(ball)) {
            ball.dirVector.y = -ball.dirVector.y
        }
    }

export function applyBallVerticalBounce(ball: Ball): void {
    if (ballInVerticalBounds(ball)) {
        ball.dirVector.x = -ball.dirVector.x
    }
}

export function printText(ctx: CanvasRenderingContext2D, fontSizePX: number,
    x: number, y: number, color: string, textStyle: string, text: Array<string>) {
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
