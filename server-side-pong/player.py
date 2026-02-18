from websockets import ServerConnection
from player_paddle import PlayerPaddle

class Player:
	# JWT
	user_id: int
	username: str
	iat: int
	exp: int

	connection: ServerConnection
	paddle: PlayerPaddle

	def __init__(
			self, user_id: int, username: str, iat: int, exp: int,
			connection: ServerConnection, paddle: PlayerPaddle):
		self.user_id = user_id
		self.username = username
		self.iat = iat
		self.exp = exp
		self.connection = connection
		self.paddle = paddle

