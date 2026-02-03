import { Ball } from './ball'
import { Point, Vector2, lineLineIntersection, arenaHeight, arenaWidth,
    ballRadius } from './lib'
import { PlayerPaddle } from './playerPaddle'

export enum DifficultyLevel {
    Easy,
    Normal,
    Hard
}


// The AI is on the left side of the game
export class AI
{
    timeSinceLastAction = 0
    centreY = 0
    targetY = 0
    lastBallXDir: number = 1
    lastBallY = 0
    difficultyLevel: DifficultyLevel

    private levelModifier: number

    constructor(paddle: PlayerPaddle, difficultyLevel: DifficultyLevel) {
        this.centreY = (arenaHeight / 2) - (paddle.height / 2)
        this.difficultyLevel = difficultyLevel
        switch (this.difficultyLevel) {
            case DifficultyLevel.Easy:
                this.levelModifier = 0.2
                break
            case DifficultyLevel.Normal:
                this.levelModifier = 0.6
                break
            case DifficultyLevel.Hard:
                this.levelModifier = 0.8
                break
        }

    }

    private moveTo(targetY: number, paddle: PlayerPaddle, canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        if (this.coversCentreTargetY(targetY, paddle)) {
            return
        }
        const deltaY = targetY - (paddle.y + paddle.height / 2)
        // const deltaY = targetY - paddle.y - paddle.height / 2
        if (deltaY < 0) {
            paddle.moveUp(canvas, deltaTimeSeconds)
        }
        else {
            paddle.moveDown(canvas, deltaTimeSeconds)
        }
    }

    private coversCentreTargetY(y: number, paddle: PlayerPaddle) {
        const paddleHeightThird = paddle.height * (1/3)
        if ((y > (paddle.y + paddleHeightThird)) && (y < (paddle.y + paddleHeightThird * 2))) {
            return true
        }
        return false
    }

    private moveToTargetPoint(paddle: PlayerPaddle, canvas: HTMLCanvasElement, deltaTimeSeconds: number) {
        this.moveTo(this.targetY, paddle, canvas, deltaTimeSeconds)
    }

    private getTargetPoint(ball: Ball, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, paddle: PlayerPaddle) {
        const maxRayDistance = Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)
        const maxIters = 5
        let targetPoint: Point | null = null
        let beginPoint = {x: ball.x + ball.radius, y: ball.y + ball.radius}
        let dirVector: Vector2 = {x: ball.dirVector.x, y: ball.dirVector.y}
        let endPoint: Point = {x: beginPoint.x, y: beginPoint.y}
        let i = 0

        while (i < maxIters && targetPoint === null) {
            const angle = Math.atan2(dirVector.y, dirVector.x)
            endPoint.x += Math.cos(angle) * maxRayDistance
            endPoint.y += Math.sin(angle) * maxRayDistance
            ctx.strokeStyle = "#36454F"
            ctx.beginPath()
            ctx.moveTo(beginPoint.x, beginPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)
            ctx.closePath()
            ctx.stroke()
            const pointTop = lineLineIntersection(beginPoint, endPoint, {x: 0, y: ball.radius}, {x: canvas.width, y: ball.radius})
            const pointBottom = lineLineIntersection(beginPoint, endPoint, {x: 0, y: canvas.height - ball.radius}, {x: canvas.width, y: canvas.height - ball.radius})
            targetPoint = lineLineIntersection(beginPoint, endPoint, {x: paddle.x + paddle.width, y: 0}, {x: paddle.x + paddle.width, y: canvas.height})
            if (targetPoint !== null) {
                break
            }
            if (pointTop === null) {
                assertIsNotNull(pointBottom)
                beginPoint = pointBottom
            }
            else {
                beginPoint = pointTop
            }
            endPoint = {x: beginPoint.x, y: beginPoint.y}
            dirVector.y = -dirVector.y
            i++
        }
        if (targetPoint === null) {
            return null
        }
        /*
        The chance for the ai to make a mistake is higher on lower difficulties.
        Two more random rolls are done after to decide:
        1. If the offset needs to apply up or down
        2. The actual offset amount
        */
        const hasRandOffset = Math.random() > this.levelModifier ? true: false
        if (!hasRandOffset) {
            return targetPoint.y
        }
        const upOffset = Math.random() > 0.5 ? true: false
        const offset = Math.random() * (paddle.height * 2)
        if (upOffset) {
            return targetPoint.y - offset
        }
        return targetPoint.y + offset
    }

    update(deltaTimeSeconds: number, ball: Ball, canvas: HTMLCanvasElement, paddle: PlayerPaddle, ctx: CanvasRenderingContext2D) {
        this.moveToTargetPoint(paddle, canvas, deltaTimeSeconds)
        this.timeSinceLastAction += deltaTimeSeconds
        if (this.timeSinceLastAction < 1) {
            if (this.lastBallXDir > 0) {
                this.targetY = ball.y + ball.radius
            }
            return
        }
        this.lastBallXDir = ball.dirVector.x
        this.lastBallY = ball.y
        this.timeSinceLastAction = 0
        // ball is moving towards the AI
        if (ball.dirVector.x < 0) {
            const target = this.getTargetPoint(ball, canvas, ctx, paddle)
            if (target === null) {
                this.targetY = ball.y + ball.radius
            }
            else {
                this.targetY = target
            }
        }
    }
}