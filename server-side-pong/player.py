from websockets import ServerConnection


class Player:
    user_id: int
    username: str
    iat: int
    exp: int

    connection: ServerConnection

    def __init__(
            self, user_id: int, username: str, iat: int, exp: int,
            connection: ServerConnection):
        self.user_id = user_id
        self.username = username
        self.iat = iat
        self.exp = exp
        self.connection = connection
