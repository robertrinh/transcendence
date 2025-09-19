import { Ball } from './ball.js'
import { PlayerPaddle, player_paddle } from './playerPaddle.js'
import { CollisionBox, assertIsNotNull } from './lib.js'

function handleKeyDown(key: KeyboardEvent) {
    console.log(key.key)
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

function rectangleCollideRectangle(rec1: CollisionBox, rec2: CollisionBox): boolean {
    if (
        rec1.x + rec1.width >= rec2.x &&
        rec1.x <= rec2.x + rec2.width &&
        rec1.y + rec1.height >= rec2.y &&
        rec1.y <= rec2.y + rec2.height
    ) {
        return true
    }
    return false
}

function getRandomDegreeOffset(maxDegreeOffset: number) {
    const radian = Math.PI / 180
    const randInt = getRandomInt(maxDegreeOffset * 2)

    if (randInt > maxDegreeOffset) {
        return randInt * -radian
    }
    return randInt * radian
}

function setPaddleBounceVector(hitY: number, hit: player_paddle.hitSide, paddle: PlayerPaddle, ball: Ball) {
    const paddleHeightThird = paddle.height / 3
    const degrees45 = 1 / Math.sqrt(2)

    if (hit === player_paddle.hitSide.Bottom || (hitY > paddle.y + paddleHeightThird * 2 && hitY <= paddle.y + paddle.height)) {
        if (ball.dirVector.x < 0) {
            ball.dirVector.x = degrees45
        }
        else {
            ball.dirVector.x = -degrees45
        }
        ball.dirVector.y = degrees45 + getRandomDegreeOffset(15)
    }
    else if (hit === player_paddle.hitSide.Top || (hitY >= paddle.y && hitY < paddle.y + paddleHeightThird)) {
        if (ball.dirVector.x < 0) {
            ball.dirVector.x = degrees45
        }
        else {
            ball.dirVector.x = -degrees45
        }
        ball.dirVector.x = -degrees45 + getRandomDegreeOffset(15)
    } else {
        ball.dirVector.y = getRandomDegreeOffset(3)
        ball.dirVector.x = -1
    }
}

function ballInVerticalBounds(canvas: HTMLCanvasElement, ball: Ball): boolean {
	if (
		ball.y + ball.dirVector.y > canvas.height - ball.radius ||
		ball.y + ball.dirVector.y < ball.radius
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
	checkPaddleCollision(ball, playerOne, playerTwo)
	ball.x += ball.dirVector.x * ball.movementSpeed
	ball.y += ball.dirVector.y * ball.movementSpeed
}

function checkPaddleCollision(ball: Ball, playerOne: PlayerPaddle, playerTwo: PlayerPaddle) {
    const newX = ball.dirVector.x * ball.movementSpeed + ball.radius / 2
    const newY = ball.dirVector.y * ball.movementSpeed + ball.radius / 2
    const hypotenuse = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2)) // the ball will travel this distance
    const angle = Math.atan2(ball.dirVector.y, ball.dirVector.x)
    const maxRayDistance = Math.sqrt(Math.pow(canvas.height, 2) + Math.pow(canvas.width, 2))
    const rayIncrement = 1

    assertIsNotNull(ctx)
    // ctx.beginPath()
    // ctx.moveTo(ball.x, ball.y)
    let rayDistance = 0
    let x = ball.x
    let y = ball.y
    while (rayDistance < maxRayDistance) {
        const ballBox: CollisionBox = {x: ball.x, y: ball.y, width: ball.radius, height: ball.radius}
		const hitX = x + ball.radius / 2      
		const hitY = y + ball.radius / 2
        if (rectangleCollideRectangle(
            ballBox,
            {x: playerOne.x, y: playerOne.y, width: playerOne.width, height: playerOne.height}
        )) {
            if (hypotenuse > rayDistance) {
				drawPoint(5, x, y, "#000000")
                const hitSide = playerOne.getHitSide(ballBox)
                // push ball out of paddle
                while (rectangleCollideRectangle(
                    {x: x, y: y, width: ball.radius, height: ball.radius},
                    {x: playerOne.x, y: playerOne.y, width: playerOne.width, height: playerOne.height}) ||
                    ballInVerticalBounds(canvas, ball)) {
					drawPoint(5, x, y, "#fa45be")
                    x -= rayIncrement * Math.cos(angle)
                    y -= rayIncrement * Math.sin(angle)
                }
                ball.x = x + ball.radius / 2
                ball.y = y + ball.radius / 2
                if (hitSide === player_paddle.hitSide.Top || hitSide === player_paddle.hitSide.Bottom) {
                    ball.dirVector.y = -ball.dirVector.y
                }
                setPaddleBounceVector(hitY, hitSide, playerOne, ball)
                ball.movementSpeed *= 1.1
            }
            break
        }
        // if (rectangleCollideRectangle(
        //     ballBox,
        //     {x: playerTwo.x, y: playerTwo.y, width: playerTwo.width, height: playerTwo.height}
        // )) {
        //     if (hypotenuse > rayDistance) {
        //         const hitSide = playerTwo.getHitSide(ballBox)
        //         // push ball out of paddle
        //         while (rectangleCollideRectangle(
        //             {x: x, y: y, width: ball.radius, height: ball.radius},
        //             {x: playerTwo.x, y: playerTwo.y, width: playerTwo.width, height: playerTwo.height}) ||
        //             hasVerticalCollision()) {
        //             x -= rayIncrement * Math.cos(angle)
        //             y -= rayIncrement * Math.sin(angle)
        //         }
        //         ball.x = x + ball.radius / 2
        //         ball.y = y + ball.radius / 2
        //         if (hitSide === playerPaddle.hitSide.Top || hitSide === playerPaddle.hitSide.Bottom) {
        //             ball.yVector = -ball.yVector
        //         }
        //         setPaddleBounceVector(hitY, hitSide, playerTwo)
        //         ball.movementSpeed *= 1.1
        //     }
        //     break
        // }

        x += rayIncrement * Math.cos(angle)
        y += rayIncrement * Math.sin(angle)
        rayDistance += rayIncrement
    }
    // ctx.lineTo(x, y)
    // ctx.closePath()
    // ctx.stroke()
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
async function initRound(playerOne: PlayerPaddle, playerTwo: PlayerPaddle, startingBallSpeed: number) {
    const horizontalOffset = 50
    const verticalOffset = (canvas.height - playerOne.height) / 2

    playerOne.x = canvas.width - horizontalOffset - playerOne.width
    playerOne.y = verticalOffset
    playerTwo.x = horizontalOffset
    playerTwo.y = verticalOffset

    ball.movementSpeed = startingBallSpeed
    ball.x = canvas.width / 2
    ball.y = getRandomInt(canvas.height - ball.radius)
    ball.dirVector.x = Math.random() < 0.5 ? -1: 1
    ball.dirVector.y = Math.random() < 0.5 ? -1: 1
    draw()
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
    while (true) {
        const newTimestamp = performance.now()
        deltaTimeSeconds = (newTimestamp - timestamp) / 1000
        timestamp = newTimestamp

        if (state === gameState.Start || state === gameState.RoundEnd) {
            await initRound(playerOne, playerTwo, startingBallSpeed)
            state = gameState.ActiveRound
        }
        draw()
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

function drawPoint(radius: number, x: number, y: number, color: string) {
	assertIsNotNull(ctx)
	ctx.beginPath()
	ctx.arc(x, y, radius, 0, Math.PI * 2, true)
	ctx.closePath()
	ctx.fillStyle = color
	ctx.fill()
}

function draw() {
    assertIsNotNull(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ball.draw(ctx)
	ball.drawHitbox(ctx, "#000000")
    // ball.drawHitbox()
    // drawRay()
    playerOne.draw(canvas, ctx, deltaTimeSeconds)
    playerTwo.draw(canvas, ctx, deltaTimeSeconds)
}

async function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    )
}

let timestamp = performance.now()
let deltaTimeSeconds: number = 0
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

const ball = new Ball(0, 0, {x: 1, y: 1}, 15, 3.5, "#a31621")
const playerTwo = new PlayerPaddle(40, 40, 20, 150, 1000, "#08A4BD")
const playerOne = new PlayerPaddle(canvas.width - 40, 40, 20, 150, 1000, "#08A4BD") 
let state = gameState.Start

assertIsNotNull(main)
main.insertAdjacentElement('afterend', canvas)
await game(state)
