import { assertIsNotNull, Vector2, Point, arenaWidth, arenaHeight } from './lib'

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
	private trailPos: Array<Point>
	private trailLen = 9
	private trailColors: Array<string>

	constructor(x: number, y: number, dirVector: Vector2, radius: number,
		movementSpeed: number, color: string, speedX: number, maxSpeed: number,
		trailColors: Array<string>
	) {
		this.x = x
		this.y = y
		this.dirVector = dirVector
		this.radius	 = radius
		this.movementSpeed = movementSpeed
		this.color = color
		this.speedX = speedX
		this.maxSpeed = maxSpeed
		this.trailPos = new Array<Vector2>(this.trailLen)
		this.trailColors = trailColors
	}

	private drawTrail(ctx: CanvasRenderingContext2D) {
		const colorStep = this.trailLen / this.trailColors.length
		let colorI = 0
		let i = 0
		while (i < this.trailLen) {
			const pos = this.trailPos[i]
			if (pos !== undefined) {
				this.drawHelper(ctx, this.trailColors[colorI],
					pos.x + this.radius, pos.y + this.radius,
					this.radius * (i/this.trailLen))
				if (i % colorStep - 1 === 0) {
					colorI++
				}
			}
			i++
		}
	}

	// the last pos is the most recent
	appendPos(pos: Point) {
		this.trailPos.shift()
		this.trailPos[this.trailLen-1] = pos
	}

	private drawHelper(ctx: CanvasRenderingContext2D, color: string, x: number,
		y: number, radius: number) {
		ctx.fillStyle = color
		ctx.beginPath()
		ctx.arc(x, y, radius, 0, Math.PI * 2, true)
		ctx.closePath()
		ctx.fill()
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.drawTrail(ctx)
		this.drawHelper(ctx, this.color, this.x + this.radius, this.y + this.radius, this.radius)
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
