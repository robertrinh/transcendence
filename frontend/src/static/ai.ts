import { Ball } from './ball'
import { Point, Vector2, lineLineIntersection, arenaHeight, arenaWidth,
    ballRadius } from './lib'
import { PlayerPaddle } from './playerPaddle'

export enum DifficultyLevel {
    Easy,
    Normal,
    Hard
}

function getFirstHit(beginPoint: Point, endPoint: Point) {
    let intersect = null
    intersect = lineLineIntersection(
        beginPoint, endPoint, {x: arenaWidth-ballRadius, y: -ballRadius},
        {x: arenaWidth-ballRadius, y: arenaHeight+ballRadius}, "right"
    )
    if (intersect !== null) {
        return intersect
    }
    intersect = lineLineIntersection(
        beginPoint, endPoint, {x: ballRadius, y: -ballRadius},
        {x: ballRadius, y: arenaHeight + ballRadius}, "left")
    if (intersect !== null) {
        return intersect
    }
    intersect = lineLineIntersection(
        beginPoint, endPoint, {x: 0, y: ballRadius},
        {x: arenaWidth, y: ballRadius}, "top")
    if (intersect !== null) {
        return intersect
    }
    intersect = lineLineIntersection(
        beginPoint, endPoint, {x: 0, y: arenaHeight - ballRadius},
        {x: arenaWidth, y: arenaHeight - ballRadius}, "bottom")
    return intersect
} 

export class AI
{
    msSinceLastAction = 0
    centreY = 0
    targetY = 0
    lastBallXDir: number = 1
    lastBallY = 0
    difficultyLevel: DifficultyLevel

    private levelModifier: number
    private rayPoints = new Array<Point>()
    private maxRayDistance = Math.sqrt(
        Math.pow(arenaWidth, 2) + Math.pow(arenaHeight, 2)
    )
    private maxRayIters = 10

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

    private moveTo(targetY: number, paddle: PlayerPaddle) {
        if (this.coversCentreTargetY(targetY, paddle)) {
            return
        }
        const deltaY = targetY - (paddle.y + paddle.height / 2)
        if (deltaY < 0) {
            paddle.moveUp()
        }
        else {
            paddle.moveDown()
        }
    }

    private coversCentreTargetY(y: number, paddle: PlayerPaddle) {
        const paddleHeightThird = paddle.height * (1/3)
        if ((y > (paddle.y + paddleHeightThird)) && (y < (paddle.y + paddleHeightThird * 2))) {
            return true
        }
        return false
    }

    private moveToTargetPoint(paddle: PlayerPaddle) {
        this.moveTo(this.targetY, paddle)
    }

    private getTargetPoint(ball: Ball, paddle: PlayerPaddle) {
        let targetIntersection: null | Point = null
        let beginPoint = new Point(ball.x + ball.radius, ball.y + ball.radius)
        let dirVector = new Vector2(ball.dirVector.x, ball.dirVector.y)
        let endPoint = new Point(beginPoint.x, beginPoint.y)
        let i = 0
        this.rayPoints = []
        this.rayPoints.push(beginPoint)
        while (i < this.maxRayIters && targetIntersection === null) {
            const angle = Math.atan2(dirVector.y, dirVector.x)
            endPoint.x += Math.cos(angle) * this.maxRayDistance
            endPoint.y += Math.sin(angle) * this.maxRayDistance
            this.rayPoints.push(endPoint)
            const nextIntersect = getFirstHit(beginPoint, endPoint)
            if (nextIntersect === null) {
                return null
            }
            switch (nextIntersect[1]) {
                case "bottom":
                case "top":
                    dirVector.y = -dirVector.y
                    break
                case "left":
                    dirVector.x = -dirVector.x
                    break
                case "right":
                    targetIntersection = nextIntersect[0]
                    break
            }
            beginPoint = nextIntersect[0]
            this.rayPoints.push(beginPoint)
            endPoint = {x: beginPoint.x, y: beginPoint.y}
            i++
        }
        if (targetIntersection === null) {
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
            return targetIntersection.y
        }
        const upOffset = Math.random() > 0.5 ? true: false
        const offset = Math.random() * (paddle.height * 2)
        if (upOffset) {
            return targetIntersection.y - offset
        }
        return targetIntersection.y + offset
    }

    update(deltaTimeMS: number, ball: Ball, paddle: PlayerPaddle) {
        this.moveToTargetPoint(paddle)
        this.msSinceLastAction += deltaTimeMS
        if (this.msSinceLastAction < 1000) {
           return
        }
        this.lastBallXDir = ball.dirVector.x
        this.lastBallY = ball.y
        this.msSinceLastAction = 0
        const target = this.getTargetPoint(ball, paddle)
        if (target === null) {
            this.targetY = ball.y + ball.radius
        }
        else {
            this.targetY = target
        }
    }

    drawRays(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "black"
        let i = 0
        if (this.rayPoints.length === 0) {
            return
        }
        ctx.moveTo(this.rayPoints[0].x, this.rayPoints[0].y)
        i++
        while (i < this.rayPoints.length) {
            const pt = this.rayPoints[i]
            ctx.lineTo(pt.x, pt.y)
            i++
        }
        ctx.stroke()
    }
}