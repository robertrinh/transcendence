import { playerPaddle } from './playerPaddle.js'

function assertIsNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val === null) {
        throw new Error("val cannot be null")
    }
}

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

function hasVerticalCollision(): boolean {
    if (
        ball.y + ball.yVector > canvas.height - ball.radius ||
        ball.y + ball.yVector < ball.radius
    ) {
        return true
    }
   return false
}

function checkVerticalCollision() {
    if (hasVerticalCollision()) {
        ball.yVector = -ball.yVector
    }
}

function checkHorizontalCollision() {
    if (
        ball.x + ball.xVector > canvas.width - ball.radius ||
        ball.x + ball.xVector < ball.radius
    ) {
        ball.xVector = -ball.xVector
    }
}

export interface CollisionBox {
    x: number,
    y: number,
    width: number,
    height: number
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

function setPaddleBounceVector(hitY: number, hit: playerPaddle.hitSide, paddle: playerPaddle) {
    const paddleHeightThird = paddle.height / 3
    const randomDegreesMax = 15
    const radian = Math.PI / 180
    const randomOffset = getRandomInt(randomDegreesMax * 2)
    const degrees45 = 1 / Math.sqrt(2)
    let randomized45 = degrees45

    if (randomOffset > randomDegreesMax) {
        randomized45 += randomOffset * radian
    } else {
        randomized45 -= randomOffset * radian
    }
    if (hit === playerPaddle.hitSide.Bottom || (hitY > paddle.y + paddleHeightThird * 2 && hitY <= paddle.y + paddle.height)) {
        if (ball.xVector < 0) {
            ball.xVector = degrees45
        }
        else {
            ball.xVector = -degrees45
        }
        ball.yVector = degrees45 + getRandomDegreeOffset(15)
    }
    else if (hit === playerPaddle.hitSide.Top || (hitY >= paddle.y && hitY < paddle.y + paddleHeightThird)) {
        if (ball.xVector < 0) {
            ball.xVector = degrees45
        }
        else {
            ball.xVector = -degrees45
        }
        ball.yVector = -degrees45 + getRandomDegreeOffset(15)
    } else {
        ball.yVector = getRandomDegreeOffset(3)
        ball.xVector = -1
    }
}

function checkPaddleCollision() {
    const newX = ball.xVector * ball.movementSpeed + ball.radius / 2
    const newY = ball.yVector * ball.movementSpeed + ball.radius / 2
    const hypotenuse = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2)) // the ball will travel this distance
    const angle = Math.atan2(ball.yVector, ball.xVector)
    const maxRayDistance = Math.sqrt(Math.pow(canvas.height, 2) + Math.pow(canvas.width, 2))
    const rayIncrement = 1

    assertIsNotNull(ctx)
    // ctx.beginPath()
    // ctx.moveTo(ball.x, ball.y)
    let rayDistance = 0
    let x = ball.x
    let y = ball.y
    while (rayDistance < maxRayDistance) {
        const ballBox: CollisionBox = {x: ball.x - ball.radius / 2, y: ball.y - ball.radius / 2, width: ball.radius, height: ball.radius}
        const hitY = y + ball.radius / 2
        if (rectangleCollideRectangle(
            ballBox,
            {x: playerOne.x, y: playerOne.y, width: playerOne.width, height: playerOne.height}
        )) {
            if (hypotenuse > rayDistance) {
                const hitSide = playerOne.getHitSide(ballBox)
                // push ball out of paddle
                while (rectangleCollideRectangle(
                    {x: x, y: y, width: ball.radius, height: ball.radius},
                    {x: playerOne.x, y: playerOne.y, width: playerOne.width, height: playerOne.height}) ||
                    hasVerticalCollision()) {
                    x -= rayIncrement * Math.cos(angle)
                    y -= rayIncrement * Math.sin(angle)
                }
                ball.x = x + ball.radius / 2
                ball.y = y + ball.radius / 2
                if (hitSide === playerPaddle.hitSide.Top || hitSide === playerPaddle.hitSide.Bottom) {
                    ball.yVector = -ball.yVector
                }
                setPaddleBounceVector(hitY, hitSide, playerOne)
                ball.movementSpeed *= 1.1
            }
            break
        }
        if (rectangleCollideRectangle(
            ballBox,
            {x: playerTwo.x, y: playerTwo.y, width: playerTwo.width, height: playerTwo.height}
        )) {
            if (hypotenuse > rayDistance) {
                const hitSide = playerTwo.getHitSide(ballBox)
                // push ball out of paddle
                while (rectangleCollideRectangle(
                    {x: x, y: y, width: ball.radius, height: ball.radius},
                    {x: playerTwo.x, y: playerTwo.y, width: playerTwo.width, height: playerTwo.height}) ||
                    hasVerticalCollision()) {
                    x -= rayIncrement * Math.cos(angle)
                    y -= rayIncrement * Math.sin(angle)
                }
                ball.x = x + ball.radius / 2
                ball.y = y + ball.radius / 2
                if (hitSide === playerPaddle.hitSide.Top || hitSide === playerPaddle.hitSide.Bottom) {
                    ball.yVector = -ball.yVector
                }
                setPaddleBounceVector(hitY, hitSide, playerTwo)
                ball.movementSpeed *= 1.1
            }
            break
        }

        x += rayIncrement * Math.cos(angle)
        y += rayIncrement * Math.sin(angle)
        rayDistance += rayIncrement
    }
    // ctx.lineTo(x, y)
    // ctx.closePath()
    // ctx.stroke()
}

function updateBall() {
    // checkHorizontalCollision()
    checkVerticalCollision()
    checkPaddleCollision()
    ball.x += ball.xVector * ball.movementSpeed
    ball.y += ball.yVector * ball.movementSpeed
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
async function initRound(playerOne: playerPaddle, playerTwo: playerPaddle, startingBallSpeed: number) {
    const horizontalOffset = 50
    const verticalOffset = (canvas.height - playerOne.height) / 2

    playerOne.x = canvas.width - horizontalOffset - playerOne.width
    playerOne.y = verticalOffset
    playerTwo.x = horizontalOffset
    playerTwo.y = verticalOffset

    ball.movementSpeed = startingBallSpeed
    ball.x = canvas.width / 2
    ball.y = getRandomInt(canvas.height - ball.radius)
    ball.xVector = Math.random() < 0.5 ? -1: 1
    ball.yVector = Math.random() < 0.5 ? -1: 1
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
        updateBall()
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

function draw() {
    assertIsNotNull(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ball.draw()
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

const ball = {
    x: 100,
    y: 100,
    xVector: 1,
    yVector: 1,
    radius: 15,
    movementSpeed: 3.5,
    color: "#A31621",
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fillStyle = this.color
        ctx.fill()
    },
    drawHitbox() {
        ctx.strokeRect(this.x, this.y, this.radius * 2, this.radius * 2)
    }
}

const playerTwo = new playerPaddle(40, 40, 20, 150, 1000, "#08A4BD")
const playerOne = new playerPaddle(canvas.width - 40, 40, 20, 150, 1000, "#08A4BD") 
let state = gameState.Start

assertIsNotNull(main)
main.insertAdjacentElement('afterend', canvas)
await game(state)
