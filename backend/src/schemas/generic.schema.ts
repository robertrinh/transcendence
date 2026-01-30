import S from 'fluent-json-schema';

export const IDSchema = S.object()
	.prop('id', S.integer().required());

export const successResponseSchema = S.object()
	.prop('success', S.boolean().required())
	.prop('message', S.string())
	.prop('data', S.anyOf([S.object(), S.array(), S.null()]));

export const basicResponseSchema = S.object()
	.prop('success', S.boolean().default(true))
	.prop('message', S.string());

export const ApiErrorSchema = S.object()
	.prop('statusCode', S.integer())
	.prop('code', S.string())
	.prop('error', S.string())
	.prop('message', S.string());