import asyncio
import json
from websockets import broadcast
from websockets.asyncio.server import serve

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
    while True:
        broadcast(lobby_players, "TICK UPDATE")
        await asyncio.sleep(TICK)

async def handler(websocket):
    CONNECTED.append(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e)
            return
        print(message_content)
        message_type = message_content['type']
        if message_type == 'REQ_LOBBY':
            lobby_id = 'ABCDEF'
            LOBBIES[lobby_id] = [websocket]
            response = {'type': 'LOBBY_ID', 'lobby_id': lobby_id}
            await websocket.send(json.dumps(response))
        elif message_type == 'JOIN_LOBBY':
            print(message_content)
            print(LOBBIES)
            players = LOBBIES.setdefault(message_content['lobby_id'], [websocket])
            print(players)
            if len(players) == 1:
                asyncio.create_task(game_loop(message_content['lobby_id']))
            else:
                players.append(websocket)

async def main():
    async with serve(handler, "127.0.0.1", 8081) as server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())