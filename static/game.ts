import { Ball } from './ball.js'
import { PlayerPaddle, player_paddle } from './playerPaddle.js'
import { Point, Vector2, assertIsNotNull, lineLineIntersection } from './lib.js'
import { Player } from './player.js'

function handleKeyDown(key: KeyboardEvent) {
    switch (key.key) {
        case "ArrowDown":
            playerOne.downPressed = true
            break
        case "ArrowUp":
            playerOne.upPressed = true
            break
        case "s":
            playerTwo.downPressed = true
            break
        case "w":
            playerTwo.upPressed = true
            break
    }
    key.preventDefault()
}

function handleKeyUp(key: KeyboardEvent) {
    switch (key.key) {
        case "ArrowDown":
            playerOne.downPressed = false
            break
        case "ArrowUp":
            playerOne.upPressed = false
            break
        case "s":
            playerTwo.downPressed = false
            break
        case "w":
            playerTwo.upPressed = false
            break
    }
    key.preventDefault()
}

function getRandomDegreeOffset(maxDegreeOffset: number) {
    const radian = Math.PI / 180
    const randInt = getRandomInt(maxDegreeOffset * 2)

    if (randInt > maxDegreeOffset) {
        return randInt * -radian
    }
    return randInt * radian
}

function setPaddleBounceVectorPlayerOne(hitY: number, hit: player_paddle.hitSide, paddle: PlayerPaddle, ball: Ball) {
    const paddleHeightThird = paddle.height / 3
    const degrees45 = 1 / Math.sqrt(2)

    if (hit === player_paddle.hitSide.Bottom || (hitY > paddle.y + paddleHeightThird * 2 && hitY <= paddle.y + paddle.height)) {
        ball.dirVector.x = -degrees45
        ball.dirVector.y = degrees45 + getRandomDegreeOffset(15)
    }
    else if (hit === player_paddle.hitSide.Top || (hitY >= paddle.y && hitY < paddle.y + paddleHeightThird)) {
        ball.dirVector.x = -degrees45
        ball.dirVector.y = -(degrees45 + getRandomDegreeOffset(15))
    } else {
        ball.dirVector.y = getRandomDegreeOffset(3)
        ball.dirVector.x = -1
    }
}

function setPaddleBounceVectorPlayerTwo(hitY: number, hit: player_paddle.hitSide, paddle: PlayerPaddle, ball: Ball) {
    const paddleHeightThird = paddle.height / 3
    const degrees45 = 1 / Math.sqrt(2)

    if (hit === player_paddle.hitSide.Bottom || (hitY > paddle.y + paddleHeightThird * 2 && hitY <= paddle.y + paddle.height)) {
        ball.dirVector.x = degrees45
        ball.dirVector.y = degrees45 + getRandomDegreeOffset(15)
    }
    else if (hit === player_paddle.hitSide.Top || (hitY >= paddle.y && hitY < paddle.y + paddleHeightThird)) {
        ball.dirVector.x = degrees45
        ball.dirVector.y = -(degrees45 + getRandomDegreeOffset(15))
    } else {
        ball.dirVector.y = getRandomDegreeOffset(3)
        ball.dirVector.x = 1
    }
}
function ballInVerticalBounds(canvas: HTMLCanvasElement, ball: Ball): boolean {
	if (
		ball.y + (ball.dirVector.y * ball.movementSpeed) > canvas.height - ball.radius * 2 ||
		ball.y + (ball.dirVector.y * ball.movementSpeed) < 0
	) {
		return true
	}
	return false
}

function applyBallVerticalBounce(canvas: HTMLCanvasElement, ball: Ball): void {
	if (ballInVerticalBounds(canvas, ball)) {
		ball.dirVector.y = -ball.dirVector.y
	}
}



function moveBall(canvas: HTMLCanvasElement, ball: Ball, playerOne: PlayerPaddle, playerTwo: PlayerPaddle): void {
    applyBallVerticalBounce(canvas, ball)
    if (hasPlayerOneCollision(ball, playerOne) || hasPlayerTwoCollision(ball, playerTwo)) {
        ball.increaseSpeed()
    }
    ball.dirVector = normalizeVector2(ball.dirVector)
	ball.x += ball.dirVector.x * ball.movementSpeed
	ball.y += ball.dirVector.y * ball.movementSpeed
}

function getXHitboxOffset(dirVector: Vector2, hitboxWidth: number) {
    if (dirVector.x === 0 ) {
        return 0
    }
    else if (dirVector.x < 0) {
        return (hitboxWidth / -2)
    }
    else {
        return (hitboxWidth / 2)
    }
}

function getYHitboxOffset(dirVector: Vector2, hitboxHeight: number) {
    if (dirVector.y === 0 ) {
        return 0
    }
    else if (dirVector.y < 0) {
        return (hitboxHeight / -2)
    }
    else {
        return (hitboxHeight / 2)
    }
}

function getSquaredDistance(pointA: Point, pointB: Point) {
    return (Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
}

function getHitSide(leftPoint: Point | null, rightPoint: Point | null, upPoint: Point | null, downPoint: Point | null, paddleCentre: Point): player_paddle.hitSide {
    const distMap = new Map<player_paddle.hitSide, number>()

    if (leftPoint !== null) {
        distMap.set(player_paddle.hitSide.Left, getSquaredDistance(paddleCentre, leftPoint))
    }
    if (rightPoint !== null) {
        distMap.set(player_paddle.hitSide.Right, getSquaredDistance(paddleCentre, rightPoint))
    }
    if (upPoint !== null) {
        distMap.set(player_paddle.hitSide.Top, getSquaredDistance(paddleCentre, upPoint))
    }
    if (downPoint !== null) {
        distMap.set(player_paddle.hitSide.Bottom, getSquaredDistance(paddleCentre, downPoint))
    }
    const sortedMap = new Map([...distMap.entries()].sort((a, b) => b[1] - a[1]))
    const shortest = sortedMap.entries().next().value

    if (shortest === undefined) {
        throw Error("Shortest should not be undefined")
    }
    return shortest[0]
}

function normalizeVector2(vector: Vector2): Vector2 {
    const magnitude = Math.pow(vector.x, 2) + Math.pow(vector.y, 2)
    return {x: vector.x / magnitude, y: vector.y / magnitude}
}

function hasPlayerOneCollision(ball: Ball, playerOne: PlayerPaddle) {
    const ballCenterPoint: Vector2 = {x: ball.x + ball.radius, y: ball.y + ball.radius}
    const newX = ball.dirVector.x * ball.movementSpeed + ballCenterPoint.x + getXHitboxOffset(ball.dirVector, ball.radius * 2)
    const newY = ball.dirVector.y * ball.movementSpeed + ballCenterPoint.y + getYHitboxOffset(ball.dirVector, ball.radius * 2)
    const leftPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerOne.x, y: playerOne.y}, {x: playerOne.x, y: playerOne.y + playerOne.height})
    const rightPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerOne.x + playerOne.width, y: playerOne.y}, {x: playerOne.x + playerOne.width, y: playerOne.y + playerOne.height})
    const upPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerOne.x, y: playerOne.y}, {x: playerOne.x + playerOne.width, y: playerOne.y})
    const downPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerOne.x, y: playerOne.y + playerOne.height}, {x: playerOne.x + playerOne.width, y: playerOne.y + playerOne.height})
    
    if (leftPoint === null && rightPoint === null && upPoint === null && downPoint === null) {
        return false
    }
    const hitside = getHitSide(leftPoint, rightPoint, upPoint, downPoint, {x: playerOne.x + playerOne.width / 2, y: playerOne.y + playerOne.height / 2})
    switch (hitside) {
        case player_paddle.hitSide.Left:
            assertIsNotNull(leftPoint)
            setPaddleBounceVectorPlayerOne(leftPoint.y, player_paddle.hitSide.Left, playerOne, ball)
            break
        case player_paddle.hitSide.Right:
            assertIsNotNull(rightPoint)
            setPaddleBounceVectorPlayerOne(rightPoint.y, player_paddle.hitSide.Right, playerOne, ball)
            break
        case player_paddle.hitSide.Top:
            assertIsNotNull(upPoint)
            setPaddleBounceVectorPlayerOne(upPoint.y, player_paddle.hitSide.Top, playerOne, ball)
            break
        case player_paddle.hitSide.Bottom:
            assertIsNotNull(downPoint)
            setPaddleBounceVectorPlayerOne(downPoint.y, player_paddle.hitSide.Bottom, playerOne, ball)
            break
    }
    return true
}

function hasPlayerTwoCollision(ball: Ball, playerTwo: PlayerPaddle) {
    const ballCenterPoint: Vector2 = {x: ball.x + ball.radius, y: ball.y + ball.radius}
    const newX = ball.dirVector.x * ball.movementSpeed + ballCenterPoint.x + getXHitboxOffset(ball.dirVector, ball.radius * 2)
    const newY = ball.dirVector.y * ball.movementSpeed + ballCenterPoint.y + getYHitboxOffset(ball.dirVector, ball.radius * 2)
    const leftPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerTwo.x, y: playerTwo.y}, {x: playerTwo.x, y: playerTwo.y + playerTwo.height})
    const rightPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerTwo.x + playerTwo.width, y: playerTwo.y}, {x: playerTwo.x + playerTwo.width, y: playerTwo.y + playerTwo.height})
    const upPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerTwo.x, y: playerTwo.y}, {x: playerTwo.x + playerTwo.width, y: playerTwo.y})
    const downPoint = lineLineIntersection(ballCenterPoint, {x: newX, y: newY}, {x: playerTwo.x, y: playerTwo.y + playerTwo.height}, {x: playerTwo.x + playerTwo.width, y: playerTwo.y + playerTwo.height})
    
    if (leftPoint === null && rightPoint === null && upPoint === null && downPoint === null) {
        return false
    }
    const hitside = getHitSide(leftPoint, rightPoint, upPoint, downPoint, {x: playerTwo.x + playerTwo.width / 2, y: playerTwo.y + playerTwo.height / 2})
    switch (hitside) {
        case player_paddle.hitSide.Left:
            assertIsNotNull(leftPoint)
            setPaddleBounceVectorPlayerTwo(leftPoint.y, player_paddle.hitSide.Left, playerTwo, ball)
            break
        case player_paddle.hitSide.Right:
            assertIsNotNull(rightPoint)
            setPaddleBounceVectorPlayerTwo(rightPoint.y, player_paddle.hitSide.Right, playerTwo, ball)
            break
        case player_paddle.hitSide.Top:
            assertIsNotNull(upPoint)
            setPaddleBounceVectorPlayerTwo(upPoint.y, player_paddle.hitSide.Top, playerTwo, ball)
            break
        case player_paddle.hitSide.Bottom:
            assertIsNotNull(downPoint)
            setPaddleBounceVectorPlayerTwo(downPoint.y, player_paddle.hitSide.Bottom, playerTwo, ball)
            break
    }
    return true
}


function ballExitsLeftSide(): boolean {
    if (ball.x < (playerTwo.x + playerTwo.width / 2)) {
        return true
    }
    return false
}

function ballExitsRightSide(): boolean {
    if (ball.x > (playerOne.x + playerOne.width / 2)) {
        return true
    }
    return false
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max)
}

/**
 * 
 * @param playerOne starts on the right side, this is always a human controlled player
 * @param playerTwo starts on the left side
 */
async function initRound(playerOne: PlayerPaddle, playerTwo: PlayerPaddle, startingBallSpeed: number, ctx: CanvasRenderingContext2D, ball: Ball) {
    const horizontalOffset = 50
    const verticalOffset = (canvas.height - playerOne.height) / 2

    playerOne.x = canvas.width - horizontalOffset - playerOne.width
    playerOne.y = verticalOffset
    playerTwo.x = horizontalOffset
    playerTwo.y = verticalOffset

    ball.movementSpeed = startingBallSpeed
    ball.speedX = 0
    ball.x = canvas.width / 2
    ball.y = getRandomInt(canvas.height - ball.radius)
    ball.dirVector.x = Math.random() < 0.5 ? -1: 1
    ball.dirVector.y = Math.random() < 0.5 ? -1: 1
    draw(ctx, ball, playerOne)
    await sleep(500)
}

enum gameState {
    Start,
    RoundEnd,
    GameEnd,
    ActiveRound
}

async function game(state: gameState) {
    const startingBallSpeed = ball.movementSpeed

    assertIsNotNull(ctx)
    while (true) {
        const newTimestamp = performance.now()
        deltaTimeSeconds = (newTimestamp - timestamp) / 1000
        timestamp = newTimestamp

        if (state === gameState.Start || state === gameState.RoundEnd) {
            await initRound(playerOne, playerTwo, startingBallSpeed, ctx, ball)
            state = gameState.ActiveRound
        }
        draw(ctx, ball, playerOne)
        moveBall(canvas, ball, playerOne, playerTwo)
        if (ballExitsLeftSide()) {
            console.log("GOAL FOR PLAYER ONE")
            state = gameState.RoundEnd
        }
        if (ballExitsRightSide()) {
            console.log("GOAL FOR PLAYER TWO")
            state = gameState.RoundEnd
        }
        await new Promise(resolve => {
            requestAnimationFrame(resolve)
        })
    }
}

function draw(ctx: CanvasRenderingContext2D, ball: Ball, playerOne: PlayerPaddle) {
    assertIsNotNull(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ball.draw(ctx)
    playerOne.draw(canvas, ctx, deltaTimeSeconds)
    playerTwo.draw(canvas, ctx, deltaTimeSeconds)
}

async function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    )
}

let timestamp = performance.now()
let deltaTimeSeconds = 0
const canvas = document.createElement('canvas')
const ctx = canvas.getContext("2d")
assertIsNotNull(ctx)
canvas.setAttribute("id", "canvas")
canvas.setAttribute("tabindex", "0")
canvas.setAttribute("class", "m-auto my-8 overflow-hidden bg-white")
canvas.setAttribute("width", "1024")
canvas.setAttribute("height", "768")
canvas.addEventListener("keydown", handleKeyDown)
canvas.addEventListener("keyup", handleKeyUp)
const main = document.getElementById('main')

const ball = new Ball(0, 0, {x: 1, y: 1}, 15, 2, "#a31621", 0, 7.5)
const playerTwo = new PlayerPaddle(40, 40, 20, 150, 1000, "#08A4BD")
const playerOne = new PlayerPaddle(canvas.width - 40, 40, 20, 150, 1000, "#08A4BD") 
const state = gameState.Start

assertIsNotNull(main)
main.insertAdjacentElement('afterend', canvas)
await game(state)
