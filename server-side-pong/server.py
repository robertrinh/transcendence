import asyncio
import json
import random as rand
import sys
import signal
from time import time
from websockets import ServerConnection
from websockets.asyncio.server import serve
from gameinstance import GameInstance

IP = "0.0.0.0"
PORT = 8081  # change to envvar

CONNECTED = set()
LOBBIES: [GameInstance] = []


def add_game_instance(
        db_game_id: int, db_p1_id: int, db_p2_id: int) -> GameInstance:
    """
    The gameserver receives all the game information from the backend server.
    """
    LOBBIES.append(GameInstance(db_game_id, db_p1_id, db_p2_id))
    return LOBBIES[-1]


def find_game_instance_by_id(lobby_id: int) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.lobby_id == lobby_id:
            return lobby
    return None


def find_game_instance_by_connection(
        websocket: ServerConnection) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.has_player_conn(websocket):
            return lobby
    return None


def find_game_instance_by_player_id(player_id: int) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.has_player_id(player_id):
            return lobby
    return None


def validate_message(message_content: dict):
    if 'type' not in message_content.keys():
        raise RuntimeError('Message is missing type property')


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
    if message_type == 'START_GAME':
        game_instance = add_game_instance(
            message_content['game_id'],
            message_content['player1_id'],
            message_content['player2_id']
        )
        response = {
            'type': 'WHOAREYOU'
        }
        await websocket.send(json.dumps(response))
        return
    if message_type == 'ID':
        # connect the player to the game instance
        player_id = message_content['id']
        lobby = find_game_instance_by_player_id(player_id)
        await lobby.add_player(player_id, websocket)
        if not lobby.lobby_full():
            asyncio.create_task(lobby.start_lobby())
        return
    # The message contains a game state update at this point so always look for
    # the related lobby first
    lobby = find_game_instance_by_connection(websocket)
    match message_type:
        case 'MOVE_DOWN':
            if websocket == lobby.players[0]:
                lobby.p1_input.append(['DOWN', message_content['timestamp']])
            else:
                lobby.p2_input.append(['DOWN', message_content['timestamp']])
        case 'MOVE_UP':
            if websocket == lobby.players[0]:
                lobby.p1_input.append(['UP', message_content['timestamp']])
            else:
                lobby.p2_input.append(['UP', message_content['timestamp']])
        case _:
            raise RuntimeError(f"Unknown message type: {message_type}")


async def handler(websocket: ServerConnection):
    CONNECTED.add(websocket)
    print(f"connection added: {websocket}")
    async for message in websocket:
        try:
            message_content = json.loads(message)
            validate_message(message_content)
            message_type = message_content['type']
            await process_message(message_type, message_content, websocket)
        except Exception as e:
            print(e, file=sys.stderr)
            continue


async def main(ip: str, port: int):
    loop = asyncio.get_running_loop()
    rand.seed(time())
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, signal.SIGTERM)
    loop.add_signal_handler(signal.SIGINT, stop.set_result, signal.SIGINT)
    async with serve(handler, ip, port) as server:
        print(f"Lobby server is listening on: {ip}:{port}")
        await stop
        signal_print = None
        match stop.result():
            case signal.SIGINT:
                signal_print = 'SIGINT'
            case signal.SIGTERM:
                signal_print = 'SIGTERM'
        print(
            f"\n{signal_print} received, gracefully exiting server...",
            file=sys.stderr)
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main(IP, PORT))
