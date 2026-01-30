import S from 'fluent-json-schema';
import { ApiErrorSchema, IDSchema } from './generic.schema.js';

const userName = S.string().minLength(3).maxLength(20)
const email = S.string().format(S.FORMATS.EMAIL)
const password = S.string().minLength(6)
const token = S.string().minLength(10)
const timeStamp = S.string().format('date-time')

export const fullUserSchema = S.object()
	.prop('id', S.integer())
	.prop('username', userName)
	.prop('nickname', S.string())
	.prop('display_name', S.string())
	.prop('password', password)
	.prop('created_at', timeStamp)
	.prop('avatar_url', S.string())
	.prop('email', email)
	.prop('last_login', timeStamp)
	.prop('wins', S.number())
	.prop('losses', S.number())
	.prop('total_games', S.number())
	.prop('winRate', S.string());

export const publicProfileSchema = fullUserSchema.without(['password', 'last_login', 'email', 'created_at', ]);
export const userSchema = fullUserSchema.only(['id', 'username']);
export const userParamSchema = fullUserSchema.only(['username']);
export const updateUser = fullUserSchema.only(['nickname', 'display_name', 'email', 'password'])

export const userBody = S.object()
	.prop('username', userName.required())
	.prop('email', email.required())
	.prop('password', password.required());

export const loginSchema = userBody.without(['email']);

export const tokenSchema = S.object()
	.prop('token', token);


//RESPONSES
const errorResponseSchema = S.object()
	.prop('success', S.boolean().default(false))
	.prop('error', S.string())
	.prop('message', S.string());

export const getUsersResponse = S.object()
	.prop('success', S.boolean().default(true))
	.prop('data', S.array().items(publicProfileSchema))
	.prop('message', S.string());

export const getUserResponse = S.object()
	.prop('success', S.boolean().default(true))
	.prop('data', publicProfileSchema)
	.prop('message', S.string());


//COMPLETE SCHEMAS
export const getAllUsersSchema = {
	tags: ['users'],
	summary: 'Get all users',
	response: {
		200: getUsersResponse,
		400: ApiErrorSchema
	}}

export const getUserSchema = {
	tags: ['users'],
	summary: 'Get user by ID',
	params: IDSchema,
	response: {
		200: getUsersResponse,
		400: ApiErrorSchema
	}}


  /*

Can have a schema and then create other schemas with just some things...
const S = require('fluent-json-schema')
const userSchema = S.object()
  .prop('username', S.string())
  .prop('password', S.string())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const loginSchema = userSchema.only(['username', 'password'])

...or all things except the things you exclude!
const S = require('fluent-json-schema')
const personSchema = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const bodySchema = personSchema.without(['createdAt', 'updatedAt'])

*/
	