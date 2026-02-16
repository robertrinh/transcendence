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
        db_game_id: int, db_p1_id: int, db_p2_id: int,
        lobby_id=None) -> GameInstance:
    """
    The gameserver receives all the game information from the backend server.
    """
    LOBBIES.append(GameInstance(db_game_id, db_p1_id, db_p2_id, lobby_id))
    return LOBBIES[-1]


def find_game_instance_by_db_game_id(db_game_id: int) -> GameInstance | None:
    for lobby in LOBBIES:
        if lobby.db_game_id == db_game_id:
            return lobby
    return None


def find_game_instance_by_lobby_id(lobby_id: str) -> GameInstance | None:
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


async def reap_lobbies():
    while True:
        for i, lobby in enumerate(LOBBIES):
            if lobby.is_done:
                print("deleting lobby...")
                del LOBBIES[i]
        await asyncio.sleep(30)


async def process_message(
        message_type: str, message_content, websocket: ServerConnection):
    if message_type == 'HOST_LOBBY':
        # we don't know have a game id at this point yet
        game_instance = add_game_instance(
            -1,
            -1,
            -1,
            message_content['lobby_id']
        )
        game_instance.set_is_private()
        await game_instance.add_player(websocket)
        response = {
            'type': 'WHOAREYOU'
        }
        await websocket.send(json.dumps(response))
        return
    if message_type == 'START_GAME':
        if 'lobby_id' in message_content.keys():
            game_instance = find_game_instance_by_lobby_id(
                message_content['lobby_id'])
            game_instance.db_game_id = message_content['game_id']
            game_instance.db_p2_id = message_content['player2_id']
        else:
            game_instance = find_game_instance_by_db_game_id(message_content['game_id'])
            if game_instance is None:
                add_game_instance(
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
        if lobby is None:
            lobby = find_game_instance_by_connection(websocket)
        await lobby.add_player(websocket, player_id)
        if not lobby.lobby_full():
            asyncio.create_task(lobby.start_lobby())
        return
    # The message contains a game state update at this point so always look for
    # the related lobby first
    lobby = find_game_instance_by_connection(websocket)
    if lobby is None:
        return
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
    asyncio.create_task(reap_lobbies())
    async with serve(handler, ip, port) as server:
        print("Game server is running")
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
