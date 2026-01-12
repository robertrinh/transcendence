import { Ball } from './ball.js'

export async function gameOnlineLobby(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, socket: WebSocket) {
    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                socket.send(JSON.stringify({type: "MOVE_DOWN"}))
                break
            case "ArrowUp":
                socket.send(JSON.stringify({type: "MOVE_UP"}))
                break
        }
        key.preventDefault()
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

    function moveBall(canvas: HTMLCanvasElement, ball: Ball): void {
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
            then = now - (deltaTimeMS % fpsInterval)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ball.draw(ctx)
            moveBall(canvas, ball)
        }
    }

    let interpVelocity: Point

    function gameSockOnMessage(event: MessageEvent) {
        const JSONObject = JSON.parse(event.data)
        console.log(JSONObject.type)
        switch (JSONObject.type) {
            case "STATE":
                interpVelocity = pointSubtract(new Point(JSONObject.ball.x, JSONObject.ball.y), new Point(ball.x, ball.y))
                interpVelocity.x /= serverTick
                interpVelocity.y /= serverTick
                break
            case "LOBBY_WAIT":
                console.log("Waiting for other players to connect...")
                break
            default:
                console.log(`Unrecognized message type: ${JSONObject.type}`)
        }
    }

    function gameSockOnOpen() {
        gameSocket.send(JSON.stringify({type: 'READY'}))
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
    const ball = new Ball(canvas.width / 2, canvas.height / 2, {x: 1, y: 1}, 15, 2, "#a31621", 0, 7.5)
    startAnimate(60)
}
