import asyncio
import json
from websockets import broadcast
from websockets.asyncio.server import serve
from ball import Ball, Vector2
import game

TICK = 1 / 66
CONNECTED = []
LOBBIES = {}

async def game_loop(lobby_id: str):
    while True:
        lobby_players = LOBBIES[lobby_id]
        if len(lobby_players) == 2:
            break
        message = {'type': 'LOBBY_WAIT'}
        broadcast(lobby_players, json.dumps(message))
        await asyncio.sleep(5)
    
    ball = Ball(game.ARENA_WIDTH / 2, game.ARENA_HEIGHT / 2, Vector2(1, 0), 4, 8, 15)
    while True:
        broadcast(lobby_players, json.dumps(game.form_game_state(ball)))
        await asyncio.sleep(TICK)

async def handler(websocket):
    CONNECTED.append(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e)
            return
        print(f"connected: {CONNECTED}")
        print(f"message_content: {message_content}")
        message_type = message_content['type']
        if message_type == 'REQ_LOBBY':
            lobby_id = 'ABCDEF'
            response = {'type': 'LOBBY_ID', 'lobby_id': lobby_id}
            await websocket.send(json.dumps(response))
        elif message_type == 'JOIN_LOBBY':
            lobby_id = message_content['lobby_id']
            print(f"LOBBIES: {LOBBIES}")
            players = LOBBIES.get(lobby_id)
            if players == None:
                LOBBIES.setdefault(lobby_id, [websocket])
                asyncio.create_task(game_loop(lobby_id))
            else:
                players.append(websocket)
                print(f"after appending: {LOBBIES}")

async def main():
    async with serve(handler, "127.0.0.1", 8081) as server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())