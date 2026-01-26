import S from 'fluent-json-schema'

export const loginSchema = S.object()
	.prop('username', S.string().required())
	.prop('password', S.string().required());

//same as the userSchema is createUser ever called? if not we can delete that endpoint 
export const registerSchema = S.object
	.prop('username', S.string().minLength(3).required())
	.prop('email', S.string().format(S.FORMATS.EMAIL).required())
	.prop('password', S.string().minLength(6).required());
