import { FastifyInstance } from 'fastify'
import { ApiError } from './errors.js';

export function registerErrorHandler(server: FastifyInstance) {
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
	//fastify validation errors
	
	//handle unexpected errors
    return "From setErrorHandler: error handling the request"
})
}

//handle 404 (route not found), with setNotFoundHandler
