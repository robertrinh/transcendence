import asyncio
import json
import random as rand
import sys
import signal
from time import time
from websockets import ServerConnection, Request, ConnectionClosed
from websockets.asyncio.server import serve
from gameinstance import GameInstance
from player import Player
from os import getenv
from time import time_ns
import jwt

JWT_SECRET = getenv('JWT_SECRET')
if JWT_SECRET is None:
    print('Missing JWT_SECRET environment variable', file=sys.stderr)
    exit(1)

IP = "0.0.0.0"
PORT = 8081  # change to envvar

CONNECTED: list[Player] = []
LOBBIES: [GameInstance] = []


def add_game_instance(
        db_game_id: int, db_p1_id: int, db_p2_id: int) -> GameInstance:
    """
    The gameserver receives all the game information from the backend server.
    """
    print(f"creating lobby with id: {db_game_id}")
    LOBBIES.append(GameInstance(db_game_id, db_p1_id, db_p2_id))
    return LOBBIES[-1]


def find_game_instance(
        db_game_id=None | int, player=None | Player
        ) -> GameInstance | None:
    lobby: GameInstance
    if db_game_id is not None:
        for lobby in LOBBIES:
            if lobby.db_game_id == db_game_id:
                return lobby
    if player is not None:
        for lobby in LOBBIES:
            if player in lobby.players:
                return lobby
    return None


def find_player(connection: ServerConnection):
    player: Player
    for player in CONNECTED:
        if player.connection is connection:
            return player


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
        message_type: str, message_content, player: Player):
    if message_type == 'START_GAME':
        game_instance = find_game_instance(
            db_game_id=message_content['game_id']
        )
        if game_instance is None:
            game_instance = add_game_instance(
                message_content['game_id'],
                message_content['player1_id'],
                message_content['player2_id']
            )
        await game_instance.add_player(player)
        if not game_instance.lobby_full():
            asyncio.create_task(game_instance.start_lobby())
        return
    # The message contains a game state update at this point so always look for
    # the related lobby first
    lobby = find_game_instance(player=player)
    if lobby is None:
        return
    match message_type:
        case 'MOVE_DOWN':
            if player.user_id == lobby.db_p1_id:
                lobby.p1_input.append(['DOWN', message_content['timestamp']])
            else:
                lobby.p2_input.append(['DOWN', message_content['timestamp']])
        case 'MOVE_UP':
            if player.user_id == lobby.db_p1_id:
                lobby.p1_input.append(['UP', message_content['timestamp']])
            else:
                lobby.p2_input.append(['UP', message_content['timestamp']])
        case 'HEARTBEAT':
            # https://stackoverflow.com/a/56394660
            now = time_ns() // 1_000_000
            player: Player
            if player.connection == lobby.players[0].connection:
                player = lobby.players[0]
            else:
                player = lobby.players[1]
            player.last_hearbeat = now
            player.ping = now - int(message_content['timestamp'])
            if player.ping < 0:
                player.ping = 0
            print(f"player \"{player.username}\" sent HEARTBEAT, ping {player.ping}ms")
        case _:
            raise RuntimeError(f"Unknown message type: {message_type}")


async def handler(websocket: ServerConnection):
    print(f"connection added: {websocket}")
    async for message in websocket:
        try:
            message_content = json.loads(message)
            validate_message(message_content)
            message_type = message_content['type']
            player = find_player(websocket)
            await process_message(message_type, message_content, player)
        except ConnectionClosed as e:
            print(f"connection closed: {websocket}: {e}")
            break
        except Exception as e:
            print(e, file=sys.stderr)
            continue


async def add_player(player: Player):
    i = 0
    while i < len(CONNECTED):
        conn_player: Player = CONNECTED[i]
        # remove any old connections from the same player, new connections have
        # priority
        if conn_player.user_id is player.user_id:
            await conn_player.connection.close(
                reason="You have initiated a new request, you are probably "
                "logged in on separate browser tabs"
            )
        i += 1
    CONNECTED.append(player)


async def process_request(connection: ServerConnection, request: Request):
    try:
        jwt_encoded = request.headers['Bearer']
        jwt_decoded = jwt.decode(jwt_encoded, JWT_SECRET, algorithms="HS256")
        # validate jwt
        required_fields = ["userId", "username", "iat", "exp"]
        for field in required_fields:
            if field not in jwt_decoded.keys():
                raise RuntimeError
        user_id = jwt_decoded["userId"]
        username = jwt_decoded["username"]
        iat = jwt_decoded["iat"]
        exp = jwt_decoded["exp"]
        await add_player(Player(user_id, username, iat, exp, connection))
    except Exception as e:
        print(
            "An error occured when processing the request of connection: "
            f"{connection}: {e}", file=sys.stderr
        )
        if e is KeyError:
            print(
                f"Missing Bearer header from connection: {connection}",
                file=sys.stderr
            )
        try:
            await connection.close()
        except Exception:
            pass


async def main(ip: str, port: int):
    loop = asyncio.get_running_loop()
    rand.seed(time())
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, signal.SIGTERM)
    loop.add_signal_handler(signal.SIGINT, stop.set_result, signal.SIGINT)
    asyncio.create_task(reap_lobbies())
    async with serve(
        handler, ip, port, process_request=process_request
    ) as server:
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
