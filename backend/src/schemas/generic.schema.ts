import S from 'fluent-json-schema';

export const IDSchema = S.object()
	.prop('id', S.integer().minimum(1).required());

export const successResponseSchema = S.object()
	.prop('success', S.boolean().required())
	.prop('message', S.string())
	.prop('data', S.anyOf([S.object(), S.array(), S.null()]));