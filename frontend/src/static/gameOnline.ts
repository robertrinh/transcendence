import { Ball } from './ball.js'
import { PlayerPaddle } from './playerPaddle.js'

export async function gameOnlineLobby(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, socket: WebSocket) {
    const p1Color = "#5885A2"
    const p2Color = "#B8383B"
    const ballRadius = 15
    const ballSize = ballRadius * 2

    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                playerOne.downPressed = true
                break
            case "ArrowUp":
                playerOne.upPressed = true
                break
            case "s":
                playerOne.downPressed = true
                break
            case "w":
                playerOne.upPressed = true
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
                playerOne.downPressed = false
                break
            case "w":
                playerOne.upPressed = false
                break
        }
        key.preventDefault()
    }

    function processMovement(deltaTimeSeconds: number) {
        const timestamp = +new Date()
        if (playerOne.downPressed) {
            const moveObj = {type: "MOVE_DOWN", ts: timestamp}
            playerOne.moveDown(canvas, deltaTimeSeconds)
            gameSocket.send(JSON.stringify(moveObj))
            pendingMoves.push(moveObj)
        }
        if (playerOne.upPressed) {
            const moveObj = {type: "MOVE_UP", ts: timestamp}
            playerOne.moveUp(canvas, deltaTimeSeconds)
            gameSocket.send(JSON.stringify(moveObj))
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

    const serverTick = 1000 / 10
    const clientTick = 1000 / 60

    function moveBall(ball: Ball): void {
        if (interpVelocity === undefined) {
            return
        }
        const updateDelta = clientTick * (1 + (deltaTimeMS / 1000))
        ball.x += interpVelocity.x * updateDelta
        ball.y += interpVelocity.y * updateDelta
    }

    let deltaTimeMS: number
    let fpsInterval: number, startTime, now, then: number

    function startAnimate(fps: number) {
        fpsInterval = 1000 / fps
        then = window.performance.now()
        startTime = then
        draw(startTime)
    }

    function draw(newTime: DOMHighResTimeStamp) {
        requestAnimationFrame(draw)
        now = newTime
        deltaTimeMS = now - then
        if (deltaTimeMS > fpsInterval) {
            processMovement(1 + (deltaTimeMS / 1000))
            then = now - (deltaTimeMS % fpsInterval)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            moveBall(ball)
            ball.draw(ctx)
            playerOne.draw(ctx)
            playerTwo.draw(ctx)
        }
    }

    let interpVelocity: Point
    let pendingMoves = new Array<MoveTS>()

    interface MoveTS {
        type: string,
        timestamp: number
    }

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
                playerOne.moveUp(canvas, 1)
            }
            else if (movePair.type === 'MOVE_DOWN') {
                playerOne.moveDown(canvas, 1)
            }
            i++
        }
        pendingMoves.splice(0, i)
    }

    let playerID = 0 // playerID given by server

    function gameSockOnMessage(event: MessageEvent) {
        const JSONObject = JSON.parse(event.data)
        const p1Server = JSONObject.p1
        const p2Server = JSONObject.p2
        const ballServer = JSONObject.ball
        switch (JSONObject.type) {
            case "STATE":
                interpVelocity = pointSubtract(new Point(ballServer.x, ballServer.y), new Point(ball.x, ball.y))
                interpVelocity.x /= serverTick
                interpVelocity.y /= serverTick
                if (playerID === 1) {
                    playerOne.x = p1Server.x
                    playerOne.y = p1Server.y
                    updatePendingMoves(p1Server.last_ts)
                }
                else {
                    playerOne.x = p2Server.x
                    playerOne.y = p2Server.y
                    updatePendingMoves(p2Server.last_ts)
                }
                break
            case "LOBBY_WAIT":
                console.log("Waiting for other players to connect...")
                break
            case "ID":
                playerID = JSONObject.player_id as number
                // move paddle to the right side
                if (playerID === 2) {
                    playerOne.x = canvas.width-playerOne.width
                    playerOne.y = 0
                    playerTwo.x = 0
                    playerTwo.y = 0
                }
                console.log(`You are player ${playerID}`)
                gameSocket.send(JSON.stringify({type: 'READY'}))
                break
            default:
                console.log(`Unrecognized message type: ${JSONObject.type}`)
        }
    }

    function gameSockOnOpen() {
        gameSocket.send(JSON.stringify({type: 'WHOAMI'}))
    }

    let gameSocket: WebSocket

    socket.onmessage = function(ev) {
        const JSONObject = JSON.parse(ev.data)
        console.log(`Message received: ${JSONObject}`)
        console.log(JSONObject.type)
        switch (JSONObject.type) {
            case "REDIRECT":
                socket.close()
                console.log(`Creating a new socket to connect ${JSONObject.ip}:${JSONObject.port}`)
                gameSocket = new WebSocket(`ws://${JSONObject.ip}:${JSONObject.port}`)
                gameSocket.onmessage = gameSockOnMessage
                gameSocket.onopen = gameSockOnOpen
                break
            default:
      }
    }
    
    canvas.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("keyup", handleKeyUp)
    const paddleMoveUnits = 30
    const ball = new Ball(canvas.width / 2, canvas.height / 2, {x: 1, y: 1}, 15, 2, "#a31621", 0, 7.5)
    const playerOne = new PlayerPaddle(0, 0, ballSize, ballSize * 4, paddleMoveUnits, p1Color)
    const playerTwo = new PlayerPaddle(canvas.width - ballSize, 0, ballSize, ballSize * 4, paddleMoveUnits, p2Color) 
    startAnimate(60)
}
