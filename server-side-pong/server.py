import asyncio
import json
import random as rand
from time import time
from multiprocessing import Process, Pipe
from websockets import ServerConnection
from websockets.asyncio.server import serve
from gameinstance import GameInstance
from game import game_process

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


def spawn_game_instance() -> GameInstance:
    lobby_id = request_lobby_id()
    parent_conn, child_conn = Pipe()
    process = Process(target=game_process, args=(child_conn, IP, lobby_id))
    process.start()
    game_port = parent_conn.recv()
    LOBBIES.append(GameInstance(lobby_id, process, game_port))
    return LOBBIES[-1]


async def reap_children():
    for lobby in LOBBIES:
        if not lobby.process.is_alive():
            print(f"joining lobby {lobby.lobby_id}")
            lobby.process.join()


async def handler(websocket: ServerConnection):
    CONNECTED.add(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e)
            continue
        print(f"connected: {CONNECTED}")
        print(f"lobbies: {LOBBIES}")
        print(f"message_content: {message_content}")
        message_type = message_content['type']
        if message_type == 'REQ_LOBBY':
            game_instance = spawn_game_instance()
            lobby_id = game_instance.lobby_id
            response = {
                'type': 'LOBBY_ID',
                'lobby_id': lobby_id
                }
            await websocket.send(json.dumps(response))
        elif message_type == 'JOIN_LOBBY':
            lobby_id = message_content['lobby_id']
            for lobby in LOBBIES:
                if lobby.lobby_id == lobby_id:
                    response = {
                        'type': 'REDIRECT',
                        'ip': IP,
                        'port': lobby.port 
                    }
                    await websocket.send(json.dumps(response))
                    # should remove it from the main list
                    await websocket.close()
                    break


async def main(ip: str, port: int):
    rand.seed(time())
    async with serve(handler, ip, port) as server:
        print(f"Lobby server is listening on: {ip}:{port}")
        # asyncio.create_task(reap_children())
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main(IP, PORT))
