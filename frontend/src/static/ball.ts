import { assertIsNotNull, Vector2, arenaWidth, arenaHeight } from './lib'

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
	private trailPos: Array<[number, number]>
	private trailLen = 27
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
		this.trailPos = new Array(this.trailLen)
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
					pos[0] + this.radius, pos[1] + this.radius,
					this.radius * (i/this.trailLen))
				if (i % colorStep - 1 === 0) {
					colorI++
				}
			}
			i++
		}
	}

	// the last pos is the most recent
	appendPos(point: [number, number]) {
		this.trailPos.shift()
		this.trailPos[this.trailLen-1] = point
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

	setStart(dirVect: Vector2) {
		this.x = (arenaWidth / 2) - this.radius
		this.y = (arenaHeight / 2) - this.radius
		this.dirVector = dirVect
	}

	reset() {
		this.trailPos = new Array(this.trailLen)
	}
}
