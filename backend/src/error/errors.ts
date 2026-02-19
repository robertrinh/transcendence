
//inherits from Error class, super, the parent class constructor
export class ApiError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public code?: string,
		public details?: unknown
	) {
		super(message);
		this.name = this.constructor.name; //changes from Error to apiError in the log 
		Error.captureStackTrace(this, this.constructor);
	}
}

export class validationError extends ApiError {
	constructor(public message: string)
	{
		super(403, message);
	}
}
