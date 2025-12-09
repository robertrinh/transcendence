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

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ball.draw(ctx)
        requestAnimationFrame(draw)
    }

    socket.onmessage = function(ev) {
      const JSONObject = JSON.parse(ev.data)
      switch (JSONObject.type) {
        case "STATE":
            ball.x = JSONObject.ball.x
            ball.y = JSONObject.ball.y
      }
    }
    
    canvas.addEventListener("keydown", handleKeyDown)
    const ball = new Ball(0, 0, {x: 1, y: 1}, 15, 2, "#a31621", 0, 7.5)
    requestAnimationFrame(draw)
}