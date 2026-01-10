import S from 'fluent-json-schema';

export const userSchema = S.object()
	.prop('id', S.number())
	.prop('username', S.string());

export const userBody = S.object()
	.prop('username', S.string().minLength(3).required())
	.prop('password', S.string().minLength(6).required());


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
	