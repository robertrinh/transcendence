export type Screen = 
  | 'main'
  | 'local'
  | 'online'
  | 'host-lobby'
  | 'join-lobby'
  | 'tournament'
  | 'create-tournament'
  | 'tournament-lobby'
  | 'tournament-bracket'
  | 'countdown'
  | 'searching'
  | 'game'
  | 'timeout'
  | 'error'  // ✅ ADD THIS
  | 'websocket-connecting'  // ✅ ADD THIS
  | 'websocket-closed'  // ✅ ADD THIS

export type GameMode = 
  |'none' 
  | 'singleplayer' 
  | 'multiplayer' 
  | 'online'