import { assertIsNotNull, Vector2 } from './lib.js'

export class Ball
{
	x: number
	y: number
	dirVector: Vector2
	radius: number
	movementSpeed: number
	color: string

	constructor(x: number, y: number, dirVector: Vector2, radius: number,
		movementSpeed: number, color: string
	) {
		this.x = x
		this.y = y
		this.dirVector = dirVector
		this.radius	 = radius
		this.movementSpeed = movementSpeed
		this.color = color
	}

	draw(ctx: CanvasRenderingContext2D) {
		assertIsNotNull(ctx)
        ctx.beginPath()
        ctx.arc(this.x + this.radius, this.y + this.radius, 
			this.radius, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fillStyle = this.color
        ctx.fill()
	}

	drawHitbox(ctx: CanvasRenderingContext2D, color: string) {
		assertIsNotNull(ctx)
		ctx.strokeStyle = color
		ctx.strokeRect(this.x, this.y, this.radius * 2, this.radius * 2)
	}
}
