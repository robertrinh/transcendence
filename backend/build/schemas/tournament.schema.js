import S from 'fluent-json-schema';
export const postTournamentSchemaBody = S.object()
    .prop('name', S.string().required())
    .prop('description', S.string())
    .prop('max_participants', S.integer().required());
export const tournamentResultSchema = S.object()
    .prop('status', S.string().required())
    .prop('game_id', S.integer().required())
    .prop('score_player1', S.integer().required())
    .prop('score_player2', S.integer().required())
    .prop('winner_id', S.integer().required())
    .prop('round', S.integer().required());
export const joinTournamentBody = S.object()
    .prop('user_id', S.integer().required());
export const tournamentResponseSchema = S.object()
    .prop('id', S.integer())
    .prop('name', S.string())
    .prop('description', S.string())
    .prop('max_participants', S.integer())
    .prop('status', S.string())
    .prop('created_at', S.integer())
    .prop('start_date', S.string())
    .prop('end_date', S.string());
