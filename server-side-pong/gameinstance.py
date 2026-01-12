from multiprocessing import Process
from websockets import ServerConnection


class GameInstance:
    lobby_id: str
    port: int
    ip: str
    process: Process
    players: [ServerConnection]

    def __init__(self, lobby_id: str, process: Process, port: int):
        self.lobby_id = lobby_id
        self.ip = "127.0.0.1"
        self.process = process
        self.port = port
