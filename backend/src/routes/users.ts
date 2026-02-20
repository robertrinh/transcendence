import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { userController } from '../controllers/userController.js'
import { IDSchema } from '../schemas/generic.schema.js'
import { userBody, userParamSchema } from '../schemas/users.schema.js'
import { authenticate } from '../auth/middleware.js'
import { anonymizeResponseSchema } from '../schemas/users.schema.js'

export default async function usersRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {

    //willl we use it?? for leaderboard maybe? otherwise delete!
    fastify.get('/', {
        schema: {
            tags: ['users'],
            summary: 'Get all users',
        }}, userController.getAllUsers);

    fastify.post('/anonymize', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users', 'privacy'],
            summary: 'Anonymize user profile (permanent action)',
            description: 'Permanently anonymize user profile. This action cannot be undone.',
            response: {
                200: anonymizeResponseSchema
            }
        }, 
        preHandler: [authenticate]
    }, userController.anonymizeProfile);
    
    fastify.get('/profile/me', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Get user with token'
        }, preHandler: [authenticate] }, userController.getMyProfile);
    
    fastify.get('/profile/:username', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Get user profile by username',
            params: userParamSchema
        }, preHandler: [authenticate] }, userController.getUserProfileByUsername);    

    fastify.post('/', {
        schema: {
            tags: ['users'],
            summary: 'Create new user',
            body: userBody
        }}, userController.createUser);

    fastify.post('/profile/avatar', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Upload an avatar',
        }, preHandler: [authenticate]} , userController.uploadAvatar);

            
    fastify.put('/profile/me', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Update user',
        }, preHandler: [authenticate]} , userController.updateProfile);

    fastify.delete('/me', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users', 'privacy'],
            summary: 'Delete user',
        }, preHandler: [authenticate] }, userController.deleteUser);

}