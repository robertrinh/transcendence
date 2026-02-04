import asyncio
import json
import random as rand
import sys
from time import time
from websockets import ServerConnection
from websockets.asyncio.server import serve
from gameinstance import GameInstance

IP = "0.0.0.0"
PORT = 8081  # change to envvar

CONNECTED = set()
LOBBIES: [GameInstance] = []


def request_lobby_id() -> str:
    hex = "0123456789abcdef"
    lobby_id = []
    for i in range(0, 10):
        lobby_id.append(hex[rand.randint(0, 15)])
    return "".join(lobby_id)


def add_game_instance() -> GameInstance:
    lobby_id = request_lobby_id()
    LOBBIES.append(GameInstance(lobby_id))
    return LOBBIES[-1]


def find_game_instance_by_id(lobby_id: str) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.lobby_id == lobby_id:
            return lobby
    return None


def find_game_instance_by_connection(
        websocket: ServerConnection) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.has_player(websocket):
            return lobby
    return None


async def process_message(
        message_type: str, message_content, websocket: ServerConnection):
    if message_type == 'REQ_LOBBY':
        game_instance = add_game_instance()
        lobby_id = game_instance.lobby_id
        response = {
            'type': 'LOBBY_ID',
            'lobby_id': lobby_id
            }
        await websocket.send(json.dumps(response))
        return
    if message_type == 'JOIN_LOBBY':
        lobby_id = message_content['lobby_id']
        lobby = find_game_instance_by_id(lobby_id)
        response = None
        if lobby is None:
            response = {
                'type': 'ERROR',
                'message': f"Lobby {lobby.id} not found"
            }
        elif lobby.lobby_full():
            response = {
                'type': 'ERROR',
                'message': f"Lobby {lobby.id} is full"
            }
        else:
            lobby.add_player(websocket)
            if len(lobby.players) == 1:
                asyncio.create_task(lobby.start_lobby())
            response = {
                'type': 'JOIN_SUCCESS'
            }
        await websocket.send(json.dumps(response))
        return
    # The message contains a game state update at this point so always look for
    # the related lobby first
    lobby = find_game_instance_by_connection(websocket)
    match message_type:
        case 'MOVE_DOWN':
            if websocket == lobby.players[0]:
                lobby.p1_input.append(['DOWN', message_content['ts']])
            else:
                lobby.p2_input.append(['DOWN', message_content['ts']])
        case 'MOVE_UP':
            if websocket == lobby.players[0]:
                lobby.p1_input.append(['UP', message_content['ts']])
            else:
                lobby.p2_input.append(['UP', message_content['ts']])
        case 'WHOAMI':
            if websocket == lobby.players[0]:
                await websocket.send(json.dumps(
                    {'type': 'ID', 'player_id': 1}
                    ))
            else:
                await websocket.send(json.dumps(
                    {'type': 'ID', 'player_id': 2}
                    ))


async def handler(websocket: ServerConnection):
    CONNECTED.add(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e, file=sys.stderr)
            continue
        message_type = message_content['type']
        await process_message(message_type, message_content, websocket)


async def main(ip: str, port: int):
    rand.seed(time())
    async with serve(handler, ip, port) as server:
        print(f"Lobby server is listening on: {ip}:{port}")
        await server.serve_forever()

if __name__ == "__main__":
    try:
        asyncio.run(main(IP, PORT))
    except KeyboardInterrupt:
        print("\nGame server interrupted, exiting...", file=sys.stderr)
        exit(0)
