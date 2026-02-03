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
export const paddleMoveUnits = 30
const targetFPS = 60
export const clientTick = 1000 / targetFPS
export const ball = new Ball(
    0, 0, {x: 1, y: 1}, ballRadius, 5, "#160f29", 0, 7.5,
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
}

export interface Point
{
    x: number
    y: number
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
