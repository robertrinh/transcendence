import { Ball } from './ball'
import { PlayerPaddle } from './playerPaddle'
import { playerOne, playerTwo, ball, Point, Vector2,
    applyBallHorizontalBounce, drawPlayerScores, arenaWidth, clientTick,
    roundMax, handlePaddleCollision, assertIsNotNull, printText, 
    arenaHeight, textColor, intervals } from './lib'
import { DifficultyLevel } from './ai'
import { GameMode } from '../components/game/types'

export async function gameOfflineLobby(
    gameMode: GameMode, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
    drawCanvas: HTMLCanvasElement, drawCtx: CanvasRenderingContext2D) {
    let deltaTimeMS: number
    let then: number, now: number
    let spacePressed = false

    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                playerOne.paddle.downPressed = true
                break
            case "ArrowUp":
                playerOne.paddle.upPressed = true
                break
            case "s":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.downPressed = true
                }
                else {
                    playerTwo.paddle.downPressed = true
                }
                break
            case "w":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.upPressed = true
                }
                else {
                    playerTwo.paddle.upPressed = true
                }
                break
            case " ":
                if (app.state !== gameState.RoundEnd) {
                    break
                }
                spacePressed = true
                break
        }
        key.preventDefault()
    }

    function handleKeyUp(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                playerOne.paddle.downPressed = false
                break
            case "ArrowUp":
                playerOne.paddle.upPressed = false
                break
            case "s":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.downPressed = false
                }
                else {
                    playerTwo.paddle.downPressed = false
                }
                break
            case "w":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.upPressed = false
                }
                else {
                    playerTwo.paddle.upPressed = false
                }
                break
            case " ":
                if (app.state !== gameState.RoundEnd) {
                    break
                }
                spacePressed = false
        }
        key.preventDefault()
    }

    function moveBall(ball: Ball, playerOne: PlayerPaddle, playerTwo: PlayerPaddle): void {
        const oldBallPos = new Point(ball.x + ball.radius, ball.y + ball.radius)
        const newBallPos = new Point(
            oldBallPos.x + ball.dirVector.x * ball.movementSpeed,
            oldBallPos.y + ball.dirVector.y * ball.movementSpeed
        )
        ball.appendPos(new Point(ball.x, ball.y))
        ball.x = newBallPos.x - ball.radius
        ball.y = newBallPos.y - ball.radius
        let paddle = null
        if (ball.dirVector.x < 0) {
            paddle = playerOne
        }
        else if (ball.dirVector.x > 0) {
            paddle = playerTwo
        }
        if (paddle === null) {
            return
        }
        const paddleIntersect = handlePaddleCollision(
            oldBallPos, newBallPos, paddle, ball
        )
        if (paddleIntersect === null) {
            applyBallHorizontalBounce(ball)
            return
        }
        const paddleHitPoint = paddleIntersect[0]
        const paddleHitSide = paddleIntersect[1]
        switch (paddleHitSide) {
            case "left":
            case "right":
                ball.dirVector.x *= -1
                ball.x = paddleHitPoint.x - ball.radius
                break
            case "bottom":
            case "top":
                ball.dirVector.y *= -1
                ball.y = paddleHitPoint.y - ball.radius
                break
        }
    }

    function ballExitsLeftSide(): boolean {
        if ((ball.x + ball.radius * 4) < 0) {
            return true
        }
        return false
    }

    function ballExitsRightSide(): boolean {
        if ((ball.x - ball.radius * 4) > arenaWidth) {
            return true
        }
        return false
    }

    function getRandomStartVec(): Vector2 {
        return new Vector2(
            Math.random() < 0.5 ? -1: 1,
            Math.random() < 0.5 ? -1: 1
        )
    }

    enum gameState {
        Start,
        RoundEnd,
        GameEnd,
        ActiveRound
    }

    function update() {
        now = performance.now()
        if (then === undefined) {
            then = now
        }
        deltaTimeMS = now - then
        if (deltaTimeMS > clientTick) {
            then = now - (deltaTimeMS % clientTick)
            if (app.state === gameState.RoundEnd) {
                if (spacePressed) {
                    app.state = gameState.ActiveRound
                    playerOne.roundScore = 0
                    playerTwo.roundScore = 0
                    ball.movementSpeed = 5
                    spacePressed = false
                }
                else {
                    return
                }
            }
            moveBall(ball, playerOne.paddle, playerTwo.paddle)
            playerOne.paddle.update()
            if (playerTwo.humanControlled) {
                playerTwo.paddle.update()
            }
            else {
                assertIsNotNull(playerTwo.ai)
                playerTwo.ai.update(deltaTimeMS, ball, playerTwo.paddle)
            }
            if (ballExitsLeftSide()) {
                playerOne.roundScore++
                app.state = gameState.RoundEnd
            }
            if (ballExitsRightSide()) {
                playerTwo.roundScore++
                app.state = gameState.RoundEnd
            }
            if (app.state === gameState.RoundEnd) {
                ball.setStart(getRandomStartVec())
                app.state = gameState.ActiveRound
            }
            if (playerOne.roundScore === roundMax || playerTwo.roundScore === 
                roundMax) {
                // we could upload the game results here (if we want to track
                // offline games too)
                app.state = gameState.RoundEnd
            }
        }
    }

    function draw() {
        requestAnimationFrame(draw)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.fillStyle = "white"
        drawCtx.fillRect(0, 0, canvas.width, canvas.height)
        ball.draw(drawCtx)
        playerOne.paddle.draw(drawCtx)
        playerTwo.paddle.draw(drawCtx)
        // if (playerTwo.humanControlled === false) {
        //     playerTwo.ai?.drawRays(drawCtx)
        // }
        drawPlayerScores(canvas, drawCtx, 48, textColor, "sans-serif",
        playerOne.roundScore, playerTwo.roundScore)
        if (app.state === gameState.RoundEnd) {
            drawCtx.textAlign = "center"
            printText(drawCtx, 48, arenaWidth/2, arenaHeight * 0.8,
                textColor, "sans-serif", Array("Press spacebar to continue..."))
        }
        ctx.drawImage(drawCanvas, 0, 0)
    }

    canvas.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("keyup", handleKeyUp)
    if (gameMode === 'singleplayer') {
        playerTwo.setAI(DifficultyLevel.Normal)
    }
    const app = {state: gameState.Start}
    ball.setStart(getRandomStartVec())
    requestAnimationFrame(draw)
    intervals.gameOfflineUpdate = setInterval(update, clientTick)
}
