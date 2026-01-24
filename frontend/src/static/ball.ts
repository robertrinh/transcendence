import { assertIsNotNull, Vector2 } from './lib.js'

export class Ball
{
	x: number
	y: number
	dirVector: Vector2
	radius: number
	movementSpeed: number
	color: string
	speedX: number
	maxSpeed: number

	constructor(x: number, y: number, dirVector: Vector2, radius: number,
		movementSpeed: number, color: string, speedX: number, maxSpeed: number
	) {
		this.x = x
		this.y = y
		this.dirVector = dirVector
		this.radius	 = radius
		this.movementSpeed = movementSpeed
		this.color = color
		this.speedX = speedX
		this.maxSpeed = maxSpeed
	}

	draw(ctx: CanvasRenderingContext2D) {
		assertIsNotNull(ctx)
		if (this.dirVector.x > 0) {
			this.color = "#B8383B"
		} else if (this.dirVector.x < 0) {
			this.color = "#5885A2"
		}
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x + this.radius, this.y + this.radius, 
			this.radius, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fill()
	}

	drawHitbox(ctx: CanvasRenderingContext2D, color: string) {
		assertIsNotNull(ctx)
		ctx.strokeStyle = color
		ctx.strokeRect(this.x, this.y, this.radius * 2, this.radius * 2)
	}
	
	increaseSpeed() {
		if (this.movementSpeed < this.maxSpeed) {
			this.movementSpeed += 0.5 * Math.pow(1.2, this.speedX)
			this.speedX += 1
		}
		if (this.movementSpeed > this.maxSpeed) {
			this.movementSpeed = this.maxSpeed
		}
	}
}
