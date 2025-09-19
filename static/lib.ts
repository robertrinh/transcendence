export interface Vector2
{
	x: number
	y: number
}

export interface CollisionBox {
    x: number,
    y: number,
    width: number,
    height: number
}

export function assertIsNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val === null) {
        throw new Error("val cannot be null")
    }
}