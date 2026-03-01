import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { userController } from '../controllers/userController.js'
import { IDSchema } from '../schemas/generic.schema.js'
import { userBody, userParamSchema } from '../schemas/users.schema.js'
import { authenticate, requireNonGuest } from '../auth/middleware.js'
import { anonymizeResponseSchema } from '../schemas/users.schema.js'
import { MIN_PASSWORD_LENGTH } from '../auth/password.js'

export default async function usersRoutes (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {

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
        preHandler: [authenticate, requireNonGuest]
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
        }, preHandler: [authenticate, requireNonGuest]
    }, userController.uploadAvatar);

            
    fastify.put('/profile/me', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Update user',
        }, preHandler: [authenticate, requireNonGuest]
    }, userController.updateProfile);

    fastify.post('/change-password', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: 'Change password',
            body: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: {
                    current_password: { type: 'string' },
                    new_password: { type: 'string', minLength: MIN_PASSWORD_LENGTH }
                }
            }
        }, preHandler: [authenticate, requireNonGuest]
    }, userController.changePassword);

    fastify.get('/username/:id', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: "Get the username from a user by id or 'Anonymous' if the user is anonymized"
        }, preHandler: [authenticate]
    }, userController.getUserNameByID)

    fastify.get('/avatar/:id', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users'],
            summary: "Get the username and avatar from a user by id"
        }, preHandler: [authenticate]
    }, userController.getUserAvatar)

    fastify.delete('/me', {
        schema: {
            security: [{ bearerAuth: [] }],
            tags: ['users', 'privacy'],
            summary: 'Delete user',
        }, preHandler: [authenticate, requireNonGuest]
    }, userController.deleteUser);

}