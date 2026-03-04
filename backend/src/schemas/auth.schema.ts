import S from 'fluent-json-schema';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../auth/password.js';

export const loginBodySchema = S.object()
	.additionalProperties(false)
	.prop('username', S.string().minLength(1).maxLength(15).required())
	.prop('password', S.string().minLength(1).maxLength(MAX_PASSWORD_LENGTH).required());

export const registerBodySchema = S.object()
	.additionalProperties(false)
	.prop('username', S.string().minLength(3).maxLength(15).required())
	.prop('isGuest', S.boolean())
	.prop('password', S.string().minLength(MIN_PASSWORD_LENGTH).maxLength(MAX_PASSWORD_LENGTH))
	.prop('email', S.string().maxLength(65));

export const twofaCodeBodySchema = S.object()
	.additionalProperties(false)
	.prop('code', S.string().pattern('^[0-9]{6}$').required());
