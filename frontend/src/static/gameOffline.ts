import { Ball } from './ball'
import { PlayerPaddle } from './playerPaddle'
import { playerOne, playerTwo, ball,
    applyBallHorizontalBounce, drawPlayerScores, arenaWidth, clientTick,
    roundMax, assertIsNotNull, textColor,
    isCollidingBallPaddle
} from './lib'
import { DifficultyLevel } from './ai'
import { GameMode } from '../components/game/types'

export async function gameOfflineLobby(
    gameMode: GameMode, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
    drawCanvas: HTMLCanvasElement, drawCtx: CanvasRenderingContext2D, ownName: string
) {
    const p1Name = 'P1'
    const p2Name = 'P2'
    let deltaTimeMS: number
    let then: number, now: number

    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.downPressed = true
                }
                else {
                    playerTwo.paddle.downPressed = true
                }
                break
            case "ArrowUp":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.upPressed = true
                }
                else {
                    playerTwo.paddle.upPressed = true
                }
                break
            case "s":
                playerOne.paddle.downPressed = true
                break
            case "w":
                playerOne.paddle.upPressed = true
                break
        }
        key.preventDefault()
    }

    function handleKeyUp(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.downPressed = false
                }
                else {
                    playerTwo.paddle.downPressed = false
                }
                break
            case "ArrowUp":
                if (gameMode === 'singleplayer') {
                    playerOne.paddle.upPressed = false
                }
                else {
                    playerTwo.paddle.upPressed = false
                }
                break
            case "s":
                playerOne.paddle.downPressed = false
                break
            case "w":
                playerOne.paddle.upPressed = false
                break
        }
        key.preventDefault()
    }

    function moveBall(ball: Ball, playerOne: PlayerPaddle, playerTwo: PlayerPaddle): void {
        const oldBallX = ball.x + ball.radius
        const oldBallY = ball.y + ball.radius
        const newBallX = oldBallX + ball.dirVector.x * ball.movementSpeed
        const newBallY = oldBallY + ball.dirVector.y * ball.movementSpeed
        ball.appendPos([ball.x, ball.y])
        ball.x = newBallX - ball.radius
        ball.y = newBallY - ball.radius
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
        const closestSide = isCollidingBallPaddle(newBallX, newBallY, ball.radius, 
            paddle.x, paddle.y, paddle.width, paddle.height
        )
        if (closestSide === null) {
            applyBallHorizontalBounce(ball)
            return
        }
        if (closestSide === 'hor') {
            ball.dirVector.y *= -1
            ball.y = oldBallY - ball.radius
        }
        else {
            ball.dirVector.x *= -1
            ball.x = oldBallX - ball.radius
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

    enum gameState {
        Start,
        RoundEnd,
        GameEnd,
        ActiveRound
    }

    function endGame() {
        const p1Won = playerOne.roundScore > playerTwo.roundScore
        let detail: any
        switch (gameMode) {
            case 'singleplayer':
                detail = {
                    gameMode: gameMode,
                    winnerLabel: p1Won ? 'YOU WIN!' : 'YOU LOST!',
                    resultLabel: p1Won ? 'win' : 'loss',
                    scorePlayer1: playerOne.roundScore,
                    scorePlayer2: playerTwo.roundScore,
                    player1Label: 'YOU',
                    player2Label: 'BOT',
                }
                break
            case 'multiplayer':
                detail = {
                    gameMode: gameMode,
                    winnerLabel: p1Won ? `${p1Name} WINS!` : `${p2Name} WINS!`,
                    resultLabel: 'win',
                    scorePlayer1: playerOne.roundScore,
                    scorePlayer2: playerTwo.roundScore,
                    player1Label: p1Name,
                    player2Label: p2Name,
                }
                break
        }
        window.dispatchEvent(new CustomEvent('game-over', {
            detail
        }));
    }

    function update() {
        now = performance.now()
        if (then === undefined) {
            then = now
        }
        deltaTimeMS = now - then
        if (deltaTimeMS < clientTick) {
            return
        }
        then = now - (deltaTimeMS % clientTick)
        if (app.state === gameState.RoundEnd) {
            return
        }
        moveBall(ball, playerOne.paddle, playerTwo.paddle)
        playerOne.paddle.update(ball)
        if (playerTwo.humanControlled) {
            playerTwo.paddle.update(ball)
        }
        else {
            assertIsNotNull(playerTwo.ai)
            playerTwo.ai.update(deltaTimeMS, ball, playerTwo.paddle)
        }
        if (ballExitsLeftSide()) {
            playerTwo.roundScore++
            app.state = gameState.RoundEnd
        }
        if (ballExitsRightSide()) {
            playerOne.roundScore++
            app.state = gameState.RoundEnd
        }
        if (app.state === gameState.RoundEnd) {
            ball.setRandomStart()
            app.state = gameState.ActiveRound
        }
        if (playerOne.roundScore === roundMax || playerTwo.roundScore === 
            roundMax) {
            // we could upload the game results here (if we want to track
            // offline games too)
            app.state = gameState.RoundEnd
            endGame()
        }
    }

    function draw() {
        if (!globalThis.gameRunning) {
            return
        }
        requestAnimationFrame(draw)
        update()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.fillStyle = "#050510"
        drawCtx.fillRect(0, 0, canvas.width, canvas.height)
        ball.draw(drawCtx)
        playerOne.paddle.draw(drawCtx)
        playerTwo.paddle.draw(drawCtx)
        // if (playerTwo.humanControlled === false) {
        //     playerTwo.ai?.drawRays(drawCtx)
        // }
        if (gameMode === 'singleplayer') {
            drawPlayerScores(canvas, drawCtx, 48, textColor, "sans-serif",
            playerTwo.roundScore, playerOne.roundScore, ownName, 'Totally Not A Bot')
        }
        if (gameMode === 'multiplayer') {
            drawPlayerScores(canvas, drawCtx, 48, textColor, "sans-serif",
            playerTwo.roundScore, playerOne.roundScore, p1Name, p2Name)
        }
        ctx.drawImage(drawCanvas, 0, 0)
    }
    removeEventListener("keydown", handleKeyDown)
    removeEventListener("keyup", handleKeyUp)
    canvas.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("keyup", handleKeyUp)
    if (gameMode === 'singleplayer') {
        playerTwo.setAI(DifficultyLevel.Normal)
    }
    const app = {state: gameState.Start}
    ball.setRandomStart()
    globalThis.gameRunning = true
    requestAnimationFrame(draw)
}
