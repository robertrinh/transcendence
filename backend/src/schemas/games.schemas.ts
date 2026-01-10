import S from 'fluent-json-schema';

export const postGameSchemaBody = S.object()
	.prop('player1_id', S.integer().required())
	.prop('player2_id', S.integer().required());

	
export const finishGameSchema = S.object()
	.prop('winner_id', S.integer().required())
	.prop('score_player1', S.integer().minimum(0).required())
	.prop('score_player2', S.integer().minimum(0).required())
	.prop('finished_at', S.string().format('date-time').required());

export const updateScoreSchema = finishGameSchema.only(['score_player1', 'score_player2'])

//response
// export const gameResponseSchema = S.object()
// 	.prop('id', S.integer())
// 	.prop('player1_id', S.integer().nullable())
// 	.prop('player2_id', S.integer().nullable())
// 	.prop('winner_id', S.integer().nullable())
// 	.prop('score_player1', S.integer())
// 	.prop('score_player2', S.integer())
// 	.prop('status', S.string())
// 	.prop('created_at', S.string())
// 	.prop('finished_at', S.string().nullable());