//inherits from Error class, super, the parent class constructor
export class ApiError extends Error {
    statusCode;
    message;
    code;
    details;
    constructor(statusCode, message, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name; //changes from Error to apiError in the log 
        Error.captureStackTrace(this, this.constructor);
    }
}
export class validationError extends ApiError {
    message;
    constructor(message) {
        super(403, message);
        this.message = message;
    }
}
