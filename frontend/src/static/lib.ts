export interface Vector2
{
	x: number
	y: number
}

export interface Point
{
    x: number
    y: number
}

export function assertIsNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val === null) {
        throw new Error("val cannot be null")
    }
}

export function lineLineIntersection(lineAStart: Point, lineAEnd: Point, lineBStart: Point, lineBEnd: Point): Point | null {
    const distA = ((lineBEnd.x - lineBStart.x) * (lineAStart.y - lineBStart.y) - (lineBEnd.y - lineBStart.y) * (lineAStart.x - lineBStart.x)) /
    ((lineBEnd.y - lineBStart.y) * (lineAEnd.x - lineAStart.x) - (lineBEnd.x - lineBStart.x) * (lineAEnd.y - lineAStart.y))
    const distB = ((lineAEnd.x - lineAStart.x) * (lineAStart.y - lineBStart.y) - (lineAEnd.y - lineAStart.y) * (lineAStart.x - lineBStart.x)) /
    ((lineBEnd.y-lineBStart.y) * (lineAEnd.x - lineAStart.x) - (lineBEnd.x - lineBStart.x) * (lineAEnd.y - lineAStart.y))
    
    if (distA >= 0 && distA <= 1 && distB >= 0 && distB <= 1) {
        const intersectionX = lineAStart.x + (distA * (lineAEnd.x - lineAStart.x))
        const intersectionY = lineAStart.y + (distA * (lineAEnd.y - lineAStart.y))
        return {x: intersectionX, y: intersectionY}
    }
    return null
}
