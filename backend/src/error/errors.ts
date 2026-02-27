
export class ApiError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public code?: string,
		public details?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
