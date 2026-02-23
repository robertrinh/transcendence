import { ApiError } from './errors.js';
export function registerErrorHandler(server) {
    server.setErrorHandler(async (error, request, reply) => {
        //log the error with fastify logger, how to make this a bit more readable...
        request.log.error({
            err: error,
            request: {
                method: request.method,
                url: request.url,
                params: request.params,
                query: request.query,
            }
        });
        //send accurate error response based on the custom error classes
        if (error instanceof ApiError) {
            return reply.code(error.statusCode).send({
                statusCode: error.statusCode,
                error: error.name,
                message: error.message,
                code: error.code,
                details: error.details
            });
        }
        if (error.validation) {
            return reply.code(400).send({
                statusCode: 400,
                error: 'Fastify validation erorr',
                message: error.message,
                validation: error.validation
            });
        }
        return reply.code(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'From setErrorHandler: An unexpected error occurred'
        });
    });
}
//handle 404 (route not found), with setNotFoundHandler
