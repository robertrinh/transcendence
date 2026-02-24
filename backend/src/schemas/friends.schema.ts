import S from 'fluent-json-schema';

export const friendUsernameBody = S.object()
	.prop('username', S.string().required());

export const friendItemSchema = S.object()
	.prop('id', S.number())
	.prop('username', S.string());

export const friendsListResponseSchema = S.object()
	.prop('friends', S.array().items(friendItemSchema));

export const friendSuccessResponseSchema = S.object()
	.prop('success', S.boolean());

export const friendErrorResponseSchema = S.object()
	.prop('error', S.string());

export const blockedItemSchema = S.object()
	.prop('id', S.number())
	.prop('username', S.string());

export const blockedListResponseSchema = S.object()
	.prop('blocked', S.array().items(blockedItemSchema));
