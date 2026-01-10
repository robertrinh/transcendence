import { Ball } from './ball.js'
import { PlayerPaddle, player_paddle } from './playerPaddle.js'
import { Point, Vector2, assertIsNotNull, lineLineIntersection } from './lib.js'
import { Player } from './player.js'
import { gameInstance } from './game.js'

export async function gameOfflineLobby(gameMode: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    function handleKeyDown(key: KeyboardEvent) {
        switch (key.key) {
            case "ArrowDown":
                playerOne.paddle.downPressed = true
                break
            case "ArrowUp":
                playerOne.paddle.upPressed = true
                break
            case "s":
                playerTwo.paddle.downPressed = true
                break
            case "w":
                playerTwo.paddle.upPressed = true
                break
            case " ":
                spacePressed = true
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
                playerTwo.paddle.downPressed = false
                break
            case "w":
                playerTwo.paddle.upPressed = false
                break
            case " ":
                spacePressed = false
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

    // draw three rays: top, middle, bottom
    function castRayToPaddle(startPoint: Point, paddle: PlayerPaddle, ball: Ball): [Point, player_paddle.hitSide]{
        const newX = ball.dirVector.x * ball.movementSpeed + startPoint.x + getXHitboxOffset(ball.dirVector, ball.radius * 2)
        const newY = ball.dirVector.y * ball.movementSpeed + startPoint.y + getYHitboxOffset(ball.dirVector, ball.radius * 2)
        const leftPoint = lineLineIntersection(startPoint, {x: newX, y: newY}, {x: paddle.x, y: paddle.y}, {x: paddle.x, y: paddle.y + paddle.height})
        const rightPoint = lineLineIntersection(startPoint, {x: newX, y: newY}, {x: paddle.x + paddle.width, y: paddle.y}, {x: paddle.x + paddle.width, y: paddle.y + paddle.height})
        const upPoint = lineLineIntersection(startPoint, {x: newX, y: newY}, {x: paddle.x, y: paddle.y}, {x: paddle.x + paddle.width, y: paddle.y})
        const downPoint = lineLineIntersection(startPoint, {x: newX, y: newY}, {x: paddle.x, y: paddle.y + paddle.height}, {x: paddle.x + paddle.width, y: paddle.y + paddle.height})
        
        if (leftPoint === null && rightPoint === null && upPoint === null && downPoint === null) {
            return [{x: 0, y: 0}, player_paddle.hitSide.None]
        }
        const hitside = getHitSide(leftPoint, rightPoint, upPoint, downPoint, {x: paddle.x + paddle.width / 2, y: paddle.y + paddle.height / 2})
        switch (hitside) {
            case player_paddle.hitSide.Left:
                assertIsNotNull(leftPoint)
                return [leftPoint, hitside]
            case player_paddle.hitSide.Right:
                assertIsNotNull(rightPoint)
                return [rightPoint, hitside]
            case player_paddle.hitSide.Top:
                assertIsNotNull(upPoint)
                return [upPoint, hitside]
            case player_paddle.hitSide.Bottom:
                assertIsNotNull(downPoint)
                return [downPoint, hitside]
            default:
                throw Error("Ball must have hit a paddle")
        }
    }

    function hasPlayerOneCollision(ball: Ball, playerOne: PlayerPaddle) {
        const ballCenterPoint: Vector2 = {x: ball.x + ball.radius, y: ball.y + ball.radius}
        const collisionCentre = castRayToPaddle(ballCenterPoint, playerOne, ball)
        const collisionTop = castRayToPaddle({x: ball.x + ball.radius, y: ball.y}, playerOne, ball)
        const collisionBottom = castRayToPaddle({x: ball.x + ball.radius, y: ball.y + ball.radius * 2}, playerOne, ball)

        if (collisionCentre[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerOne(collisionCentre[0].y, collisionCentre[1], playerOne, ball)
            return true
        }
        if (collisionTop[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerOne(collisionTop[0].y, collisionTop[1], playerOne, ball)
            return true
        }
        if (collisionBottom[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerOne(collisionBottom[0].y, collisionBottom[1], playerOne, ball)
            return true
        }
        return false
    }

    function hasPlayerTwoCollision(ball: Ball, playerTwo: PlayerPaddle) {
        const ballCenterPoint: Vector2 = {x: ball.x + ball.radius, y: ball.y + ball.radius}
        const collisionCentre = castRayToPaddle(ballCenterPoint, playerTwo, ball)
        const collisionTop = castRayToPaddle({x: ball.x + ball.radius, y: ball.y}, playerTwo, ball)
        const collisionBottom = castRayToPaddle({x: ball.x + ball.radius, y: ball.y + ball.radius * 2}, playerTwo, ball)

        if (collisionCentre[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerTwo(collisionCentre[0].y, collisionCentre[1], playerTwo, ball)
            return true
        }
        if (collisionTop[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerTwo(collisionTop[0].y, collisionTop[1], playerTwo, ball)
            return true
        }
        if (collisionBottom[1] !== player_paddle.hitSide.None) {
            setPaddleBounceVectorPlayerTwo(collisionBottom[0].y, collisionBottom[1], playerTwo, ball)
            return true
        }
        return false
    }

    function ballExitsLeftSide(): boolean {
        if (ball.x < (playerTwo.paddle.x + playerTwo.paddle.width / 2)) {
            return true
        }
        return false
    }

    function ballExitsRightSide(): boolean {
        if (ball.x > (playerOne.paddle.x + playerOne.paddle.width / 2)) {
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
    async function initRound(canvas: HTMLCanvasElement, playerOne: Player, playerTwo: Player, startingBallSpeed: number, 
        ctx: CanvasRenderingContext2D, ball: Ball) {
        const horizontalOffset = canvas.width * 0.05
        const verticalOffset = (canvas.height - playerOne.paddle.height) / 2

        playerOne.paddle.x = canvas.width - horizontalOffset - playerOne.paddle.width
        playerOne.paddle.y = verticalOffset
        playerTwo.paddle.x = horizontalOffset
        playerTwo.paddle.y = verticalOffset

        ball.movementSpeed = startingBallSpeed
        ball.speedX = 0
        ball.x = canvas.width / 2
        ball.y = getRandomInt(canvas.height - ball.radius)
        ball.dirVector.x = Math.random() < 0.5 ? -1: 1
        ball.dirVector.y = Math.random() < 0.5 ? -1: 1
        draw(canvas, ctx, ball, playerOne, playerTwo)
        await sleep(500)
    }

    enum gameState {
        Start,
        RoundEnd,
        GameEnd,
        ActiveRound
    }

    function drawPlayerScores(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, playerOneRoundScore: number, playerTwoRoundScore: number) {
        ctx.font = "48px sans-serif"
        ctx.textAlign = "center"
        ctx.fillStyle = "#36454F"
        ctx.fillText(playerTwoRoundScore.toString(), canvas.width * 0.25, canvas.height * 0.1)
        ctx.fillText(playerOneRoundScore.toString(), canvas.width * 0.75, canvas.height * 0.1)
    }

    function waitGameStart(spacePressed: boolean, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
        playerOne: Player, playerTwo: Player
    ) {
        ctx.font = "48px sans-serif"
        ctx.textAlign = "center"
        ctx.fillStyle = "#36454F"
        ctx.fillText("Press space bar to start...", canvas.width * 0.5, canvas.height * 0.9)

        if (!spacePressed) {
            return
        }
        spacePressed = false
        app.state = gameState.RoundEnd
        playerOne.roundScore = 0
        playerTwo.roundScore = 0
    }

    async function game() {
        const startingBallSpeed = ball.movementSpeed
        const roundMax = 3

        assertIsNotNull(ctx)
        while (gameInstance.runGame === true) {
            const newTimestamp = performance.now()
            deltaTimeSeconds = (newTimestamp - timestamp) / 1000
            timestamp = newTimestamp

            if (app.state === gameState.GameEnd || app.state === gameState.Start) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                waitGameStart(spacePressed, canvas, ctx, playerOne, playerTwo)
            }
            if (app.state === gameState.RoundEnd) {
                await initRound(canvas, playerOne, playerTwo, startingBallSpeed, ctx, ball)
                app.state = gameState.ActiveRound
            }
            if (app.state === gameState.ActiveRound) {
                draw(canvas, ctx, ball, playerOne, playerTwo)
                if (!playerTwo.humanControlled) {
                    playerTwo.ai.update(deltaTimeSeconds, ball, canvas, playerTwo.paddle, ctx)
                }
                moveBall(canvas, ball, playerOne.paddle, playerTwo.paddle)
                if (ballExitsLeftSide()) {
                    playerOne.roundScore++
                    app.state = gameState.RoundEnd
                }
                if (ballExitsRightSide()) {
                    playerTwo.roundScore++
                    app.state = gameState.RoundEnd
                }
                if (playerOne.roundScore === roundMax || playerTwo.roundScore === roundMax) {
                    app.state = gameState.GameEnd
                }
            }
            await new Promise(resolve => {
                requestAnimationFrame(resolve)
            })
        }
    }

    function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ball: Ball, playerOne: Player, playerTwo: Player) {
        assertIsNotNull(ctx)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ball.draw(ctx)
        playerOne.paddle.draw(canvas, ctx, deltaTimeSeconds)
        playerTwo.paddle.draw(canvas, ctx, deltaTimeSeconds)
        drawPlayerScores(canvas, ctx, playerOne.roundScore, playerTwo.roundScore)
    }

    async function sleep(ms: number): Promise<void> {
        return new Promise(
            (resolve) => setTimeout(resolve, ms)
        )
    }

    let timestamp = performance.now()
    let deltaTimeSeconds = 0
    let spacePressed = false
    canvas.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("keyup", handleKeyUp)
    const ball = new Ball(0, 0, {x: 1, y: 1}, 15, 2, "#a31621", 0, 7.5)
    const humanControlled = gameMode === 'multiplayer'
    const playerTwo = new Player(40, 40, 20, 150, 1000, "#08A4BD", humanControlled, canvas)
    const playerOne = new Player(canvas.width - 40, 40, 20, 150, 1000, "#08A4BD", true, canvas) 
    const app = {state: gameState.Start}

    await game()
}
