import { playerPaddle } from './playerPaddle.js'

let raf
let timestamp = performance.now()
let deltaTimeSeconds: number = 0

function assertIsNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val === null) {
        throw new Error("val cannot be null")
    }
}

function handleKeyDown(key: KeyboardEvent) {
    if (key.key === "ArrowDown") {
        playerOne.downPressed = true
    } else if (key.key === "ArrowUp") {
        playerOne.upPressed = true
    }
    key.preventDefault()
}

function handleKeyUp(key: KeyboardEvent) {
    if (key.key === "ArrowDown") {
        playerOne.downPressed = false
    } else if (key.key === "ArrowUp") {
        playerOne.upPressed = false
    }
    key.preventDefault()
}

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
    xVector: 4,
    yVector: 2,
    radius: 15,
    color: "#A31621",
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

const playerOne = new playerPaddle(40, 40, 20, 150, 1000, "#08A4BD")

function checkVerticalCollision() {
    if (
        ball.y + ball.yVector > canvas.height - ball.radius ||
        ball.y + ball.yVector < ball.radius
    ) {
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

function drawRay() {
    assertIsNotNull(ctx)
    const angle = Math.atan2(ball.yVector, ball.xVector)
    const maxRayDistance = Math.sqrt(Math.pow(canvas.height, 2) + Math.pow(canvas.width, 2))
    const rayDistance = 1

    ctx.beginPath()
    ctx.moveTo(ball.x, ball.y)
    let i = 0
    let x = ball.x
    let y = ball.y
    while (i < maxRayDistance) {
        if (playerOne.pointInBox(x, y)) {
            console.log("Collision!!!")
            break
        }
        x += rayDistance * Math.cos(angle)
        y += rayDistance * Math.sin(angle)
        i++
    }
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
}

function draw() {
    assertIsNotNull(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ball.draw()
    drawRay()
    playerOne.draw(canvas, ctx, deltaTimeSeconds)
    checkHorizontalCollision()
    checkVerticalCollision()
    ball.x += ball.xVector
    ball.y += ball.yVector
    const newTimestamp = performance.now()
    deltaTimeSeconds = (newTimestamp - timestamp) / 1000
    timestamp = newTimestamp
    raf = window.requestAnimationFrame(draw)
}

assertIsNotNull(main)
main.insertAdjacentElement('afterend', canvas)
ball.draw()
playerOne.draw(canvas, ctx, deltaTimeSeconds)
raf = window.requestAnimationFrame(draw)
