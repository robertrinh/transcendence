import S from 'fluent-json-schema';

export const postTournamentSchemaBody = S.object()
	.prop('game_id', S.integer())
	.prop('name', S.string().required())
	.prop('description', S.string())
	.prop('max_participants', S.integer().required());

export const updateScoreSchema = S.object()

export const updateSchema = S.object()

export const finishTournamentSchema = S.object()

export const tournamentSchema = S.object()

export const joinTournamentBody = S.object()
	.prop('user_id', S.integer().required());