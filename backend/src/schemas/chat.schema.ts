import S from 'fluent-json-schema'

export const joinChatSchema = S.object()
	.prop('connectionId', S.integer().required())
	.prop('userId', S.integer().required())
	.prop('username', S.string().required());
	

export const sendMessSchema = S.object()
	.prop('connectionId', S.integer().required())
	.prop('message', S.string().required());

