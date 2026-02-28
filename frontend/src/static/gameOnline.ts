import { Ball } from './ball'
import { playerOne, playerTwo, ball, clientTick, drawPlayerScores,
    intervals, heartbeatFrequencyMS, resetState } from './lib'

interface MoveTS {
    type: string,
    timestamp: number
}

export async function gameOnlineLobby(canvas: HTMLCanvasElement, 
        ctx: CanvasRenderingContext2D, drawCanvas: HTMLCanvasElement,
        drawCtx: CanvasRenderingContext2D, websocket: WebSocket,
        ownName: string, oppName: string) {
    const serverTick = 1000 / 66
    let firstStateReceived = false
    let lastHearbeatSent = 0

    let p1Score = 0
    let p2Score = 0

    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                playerOne.paddle.downPressed = true
                break
            case "ArrowUp":
                playerOne.paddle.upPressed = true
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
                playerOne.paddle.downPressed = false
                break
            case "ArrowUp":
                playerOne.paddle.upPressed = false
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

    function processMovement() {
        const timestamp = +new Date()
        if (playerOne.paddle.downPressed) {
            const moveObj = {type: "MOVE_DOWN", timestamp: timestamp} as MoveTS
            playerOne.paddle.moveDown()
            websocket.send(JSON.stringify(moveObj))
            pendingMoves.push(moveObj)
        }
        if (playerOne.paddle.upPressed) {
            const moveObj = {type: "MOVE_UP", timestamp: timestamp} as MoveTS
            playerOne.paddle.moveUp()
            websocket.send(JSON.stringify(moveObj))
            pendingMoves.push(moveObj)
        }
    }

    class Point {
        x: number
        y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }

    function pointSubtract(a: Point, b: Point): Point {
        return new Point((a.x - b.x), (a.y - b.y))
    }

    function moveBall(ball: Ball): void {
        if (interpVelocityBall === undefined) {
            return
        }
        const updateDelta = clientTick * (1 + (deltaTimeMS / 1000))
        ball.appendPos(new Point(ball.x, ball.y))
        ball.x += interpVelocityBall.x * updateDelta
        ball.y += interpVelocityBall.y * updateDelta
    }

    function interpEnemy() {
        if (interpVelocityEnemy === undefined) {
            return
        }
        const updateDelta = clientTick * (1 + (deltaTimeMS / 1000))
        playerTwo.paddle.y += interpVelocityEnemy.y * updateDelta
    }

    let deltaTimeMS: number, now: number, then: number | undefined
    let gameRunning = true

    function update() {
        now = performance.now()
        if (then === undefined) {
            then = now
        }
        deltaTimeMS = now - then
        if (deltaTimeMS > clientTick) {
            processMovement()
            interpEnemy()
            then = now - (deltaTimeMS % clientTick)
            moveBall(ball)
        }
        const dateNow = Date.now()
        if (lastHearbeatSent === 0 || dateNow - lastHearbeatSent > heartbeatFrequencyMS) {
            websocket.send(JSON.stringify(
                {'type': 'HEARTBEAT', 'timestamp': dateNow}
            ))
            lastHearbeatSent = dateNow
        }
    }

    function draw() {
        if (!gameRunning) return
        requestAnimationFrame(draw)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.clearRect(0, 0, canvas.width, canvas.height)
        drawCtx.fillStyle = "#050510"
        drawCtx.fillRect(0, 0, canvas.width, canvas.height)
        ball.draw(drawCtx)
        playerOne.paddle.draw(drawCtx)
        playerTwo.paddle.draw(drawCtx)
        if (playerID === 2) {
            drawPlayerScores(canvas, drawCtx, 48, "#36454f", "sans-serif",
            p2Score, p1Score, oppName, ownName)
        }
        else {
            drawPlayerScores(canvas, drawCtx, 48, "#36454f", "sans-serif",
            p2Score, p1Score, ownName, oppName)
        }
        ctx.drawImage(drawCanvas, 0, 0)
    }

    let interpVelocityBall = new Point(0, 0)
    let interpVelocityEnemy = new Point(0, 0)
    let pendingMoves = new Array<MoveTS>()

    function updatePendingMoves(lastServerTime: number) {
        let i = 0
        if (pendingMoves.length === 0) {
            return
        }
        while (i < pendingMoves.length) {
            const movePair = pendingMoves[i]
            if (movePair.timestamp >= lastServerTime) {
                break
            }
            if (movePair.type === 'MOVE_UP') {
                playerOne.paddle.moveUp()
            }
            else if (movePair.type === 'MOVE_DOWN') {
                playerOne.paddle.moveDown()
            }
            i++
        }
        pendingMoves.splice(0, i)
    }

    let playerID = 0
    let scoreReceived = false
    let scoreCounter = 0

    function cleanup() {
        resetState()
        interpVelocityBall.x = 0
        interpVelocityBall.y = 0
        interpVelocityEnemy.x = 0
        interpVelocityEnemy.y = 0
        playerID = 0
        scoreReceived = false
        gameRunning = false
        pendingMoves = new Array<MoveTS>()
        firstStateReceived = false
        lastHearbeatSent = 0
        p1Score = 0
        p2Score = 0
        deltaTimeMS = 0
        now = 0
        then = undefined
        scoreCounter = 0

        canvas.removeEventListener("keydown", handleKeyDown)
        canvas.removeEventListener("keyup", handleKeyUp)
    }

    async function gameSockOnMessage(event: MessageEvent) {
        const JSONObject = JSON.parse(event.data)
        const p1Server = JSONObject.p1
        const p2Server = JSONObject.p2
        const ballServer = JSONObject.ball
        switch (JSONObject.type) {
            case "STATE":
                if (!firstStateReceived) {
                    canvas.addEventListener("keydown", handleKeyDown)
                    canvas.addEventListener("keyup", handleKeyUp)
                    firstStateReceived = true
                }
                interpVelocityBall = pointSubtract(new Point(ballServer.x, ballServer.y), new Point(ball.x, ball.y))
                interpVelocityBall.x /= serverTick
                interpVelocityBall.y /= serverTick
                if (scoreReceived) {
                    scoreCounter++
                }
                if (scoreCounter === 2) {
                    interpVelocityBall.x = 0
                    interpVelocityBall.y = 0
                    ball.x = ballServer.x
                    ball.y = ballServer.y
                    scoreCounter = 0
                    scoreReceived = false
                }
                if (playerID === 1) {
                    interpVelocityEnemy = pointSubtract(
                        new Point(p2Server.x, p2Server.y),
                        new Point(playerTwo.paddle.x, playerTwo.paddle.y)
                    )
                    playerOne.paddle.x = p1Server.x
                    playerOne.paddle.y = p1Server.y
                    updatePendingMoves(p1Server.last_ts)
                }
                else {
                    interpVelocityEnemy = pointSubtract(
                        new Point(p1Server.x, p1Server.y),
                        new Point(playerTwo.paddle.x, playerTwo.paddle.y)
                    )
                    playerOne.paddle.x = p2Server.x
                    playerOne.paddle.y = p2Server.y
                    updatePendingMoves(p2Server.last_ts)
                }
                interpVelocityEnemy.y /= serverTick
                break
            case "LOBBY_WAIT":
                console.log("Waiting for other players to connect...")
                break
            case "ID":
                playerID = JSONObject.player_id as number
                if (playerID === 2) {
                    const p1Color = playerOne.paddle.color
                    playerOne.paddle.x = canvas.width-playerOne.paddle.width
                    playerOne.paddle.y = 0
                    playerOne.paddle.color = playerTwo.paddle.color
                    playerTwo.paddle.x = 0
                    playerTwo.paddle.y = 0
                    playerTwo.paddle.color = p1Color
                }
                console.log(`You are player ${playerID}`)
                break
            case "SCORE":
                scoreReceived = true
                switch (JSONObject.scored_by) {
                    case "p1":
                        p1Score++
                        break
                    case "p2":
                        p2Score++
                        break
                }
                break
            case "GAME_END":
                console.log(`🏁 Game ended! Winner: ${JSONObject.winner_id}, Score: ${JSONObject.score_player1}-${JSONObject.score_player2}`)
                cleanup()
                window.dispatchEvent(new CustomEvent('game-over', {
                    detail: {
                        winnerId: JSONObject.winner_id,
                        scorePlayer1: JSONObject.score_player1,
                        scorePlayer2: JSONObject.score_player2
                    }
                }))
                break
            case "OPPONENT_DISCONNECT":
                console.log('❌ Opponent disconnected')
                cleanup()
                break
            case "ERROR":
                console.error('🚨 Game error:', JSONObject.message)
                cleanup()
                window.dispatchEvent(new CustomEvent('game-over', {
                    detail: { error: JSONObject.message }
                }))
                break
            default:
                console.log(`Unrecognized message type: ${JSONObject.type}`)
        }
    }
    removeEventListener("keydown", handleKeyDown)
    removeEventListener("keyup", handleKeyUp)
    websocket.onmessage = gameSockOnMessage
    const buffered = (websocket as any).__bufferedMessages as MessageEvent[] | undefined
    if (buffered && buffered.length > 0) {
        console.log(`🔄 Replaying ${buffered.length} buffered messages`)
        for (const msg of buffered) {
            await gameSockOnMessage(msg)
        }
        buffered.length = 0
    }
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    requestAnimationFrame(draw)
    intervals.gameOnlineUpdate = setInterval(update, clientTick)
}