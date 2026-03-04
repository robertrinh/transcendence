import S from 'fluent-json-schema';

export const chatStreamQuerySchema = S.object()
	.additionalProperties(false)
	.prop('token', S.string().minLength(1).required());

export const chatJoinBodySchema = S.object()
	.additionalProperties(false)
	.prop('connectionId', S.string().minLength(1).required());

export const chatSendBodySchema = S.object()
	.additionalProperties(false)
	.prop('connectionId', S.string().minLength(1).required())
	.prop('message', S.string().minLength(1).maxLength(255).required())
	.prop('isPrivate', S.boolean())
	.prop('toUser', S.string().minLength(1).maxLength(15));
