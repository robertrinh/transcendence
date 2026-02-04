import asyncio
import json
import random as rand
import pygame
from websockets import ServerConnection, broadcast
from ball import Ball, Vector2
from player_paddle import PlayerPaddle

# game dimensions
ARENA_WIDTH = 1024
ARENA_HEIGHT = 768

TICK = 1000 / 66
BALL_RADIUS = 15
BALL_SIZE = BALL_RADIUS * 2

# movement
BALL_SPEED_UNITS_S = 500  # The ball speed in units per second
PADDLE_SPEED_UNITS_S = 30


class Point:
    x: float
    y: float

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y


class GameInstance:
    lobby_id: str
    players: [ServerConnection]
    game_running = False

    p1_last_ts: int
    p1_input: []
    p1_paddle: PlayerPaddle
    p1_score: int

    p2_last_ts: int
    p2_input: []
    p2_paddle: PlayerPaddle
    p2_score: int

    ball: Ball

    def __init__(self, lobby_id: str):
        self.lobby_id = lobby_id
        conv_ball_speed = (BALL_SPEED_UNITS_S / 1000) * TICK
        self.ball = Ball(
            conv_ball_speed, conv_ball_speed * 2, BALL_RADIUS)
        self.ball.set_start(ARENA_HEIGHT, ARENA_WIDTH, random_ball_vec())
        self.p1_paddle = PlayerPaddle(
            PADDLE_SPEED_UNITS_S,
            pygame.Rect(0, 0, BALL_SIZE, BALL_SIZE * 4),
            pygame.Color(55, 100, 40)
            )
        self.p2_paddle = PlayerPaddle(
            PADDLE_SPEED_UNITS_S,
            pygame.Rect(ARENA_WIDTH-(BALL_SIZE), 0, BALL_SIZE, BALL_SIZE * 4),
            pygame.Color(55, 100, 40)
            )
        self.set_game_start()
        self.players = list()

    def set_game_start(self):
        # player one
        self.p1_input = []
        self.p1_last_ts = None
        self.p1_paddle.shape.x = 0
        self.p1_paddle.shape.y = 0
        self.p1_score = 0
        # player two
        self.p2_input = []
        self.p2_last_ts = None
        self.p2_paddle.shape.x = ARENA_WIDTH-BALL_SIZE
        self.p2_paddle.shape.y = 0
        self.p2_score = 0

    def add_player(self, connection: ServerConnection):
        self.players.append(connection)

    def has_player(self, connection: ServerConnection):
        return connection in self.players

    def lobby_full(self) -> bool:
        return len(self.players) == 2

    async def start_lobby(self):
        lobby_timeout_sec = 30
        sec_passed = 0
        sec_pause = 5
        while not self.lobby_full() and sec_passed < lobby_timeout_sec:
            message = {'type': 'LOBBY_WAIT'}
            broadcast(self.players, json.dumps(message))
            sec_passed += sec_pause
            await asyncio.sleep(sec_pause)
        print("Lobby is full")
        if not self.lobby_full():
            message = {'type': 'ERROR', 'message': 'Lobby timed out'}
            broadcast(self.players, json.dumps(message))
            raise Exception(f"Lobby {self.lobby_id} timed out")
        self.game_running = True
        while self.game_running:
            broadcast(self.players, json.dumps(game_loop(self)))
            await asyncio.sleep(TICK/1000)


def line_line_intersect(
        p1: Point, p2: Point, p3: Point, p4: Point, side: str
        ) -> None | tuple[Point, str]:
    denom = ((p2.x - p1.x) * (p4.y - p3.y)) - ((p2.y - p1.y) * (p4.x - p3.x))
    if denom == 0:
        return None
    dist1 = (
        ((p1.y - p3.y) * (p4.x - p3.x)) -
        ((p1.x - p3.x) * (p4.y - p3.y))) / denom
    dist2 = (
        ((p1.y - p3.y) * (p2.x - p1.x)) -
        ((p1.x - p3.x) * (p2.y - p1.y))) / denom
    if (dist1 >= 0 and dist1 <= 1) and (dist2 >= 0 and dist2 <= 1):
        intersect_x = p1.x + (dist1 * (p2.x - p1.x))
        intersect_y = p1.y + (dist1 * (p2.y - p1.y))
        return (Point(intersect_x, intersect_y), side)
    return None


def handle_paddle_collision(
        old_ball_pos: Point, new_ball_pos: Point,
        player: PlayerPaddle, ball: Ball) -> None | tuple[Point, str]:
    intersect = None
    # moving left
    if ball.dir_vect.x < 0:
        intersect = line_line_intersect(
            old_ball_pos,
            new_ball_pos,
            Point(
                player.shape.topright[0] + ball.radius_px,
                player.shape.topright[1] - ball.radius_px
                ),
            Point(
                player.shape.bottomright[0] + ball.radius_px,
                player.shape.bottomright[1] + ball.radius_px
            ),
            "right"
        )
    elif ball.dir_vect.x > 0:
        intersect = line_line_intersect(
            old_ball_pos,
            new_ball_pos,
            Point(
                player.shape.topleft[0] - ball.radius_px,
                player.shape.topleft[1] - ball.radius_px
                ),
            Point(
                player.shape.bottomleft[0] - ball.radius_px,
                player.shape.bottomleft[1] + ball.radius_px
            ),
            "left"
        )
    if intersect is None:
        if ball.dir_vect.y < 0:
            intersect = line_line_intersect(
                old_ball_pos,
                new_ball_pos,
                Point(
                    player.shape.bottomleft[0] - ball.radius_px,
                    player.shape.bottomleft[1] + ball.radius_px
                    ),
                Point(
                    player.shape.bottomright[0] + ball.radius_px,
                    player.shape.bottomright[1] + ball.radius_px
                ),
                "bottom"
            )
        elif ball.dir_vect.y > 0:
            intersect = line_line_intersect(
                    old_ball_pos,
                    new_ball_pos,
                    Point(
                        player.shape.topleft[0] - ball.radius_px,
                        player.shape.topleft[1] - ball.radius_px
                        ),
                    Point(
                        player.shape.topright[0] + ball.radius_px,
                        player.shape.topright[1] - ball.radius_px
                    ),
                    "top"
                )
    return intersect


def handle_court_collision(
        old_ball_pos: Point, new_ball_pos: Point, ball: Ball
        ) -> None | tuple[Point, str]:
    intersect = None
    if ball.dir_vect.y < 0:
        intersect = line_line_intersect(
            old_ball_pos,
            new_ball_pos,
            Point(-ball.radius_px, ball.radius_px),
            Point(ARENA_WIDTH + ball.radius_px, ball.radius_px),
            "top"
        )
    elif ball.dir_vect.y > 0:
        intersect = line_line_intersect(
                old_ball_pos,
                new_ball_pos,
                Point(-ball.radius_px, ARENA_HEIGHT - ball.radius_px),
                Point(
                    ARENA_WIDTH + ball.radius_px,
                    ARENA_HEIGHT - ball.radius_px
                ),
                "bottom"
            )
    return intersect


def handle_score(game: GameInstance):
    scored = False
    scored_by = None
    if (game.ball.shape.x + game.ball.radius_px * 4) < 0:
        scored = True
        scored_by = "p2"
        game.p2_score += 1
    if (game.ball.shape.x - game.ball.radius_px * 4) > ARENA_WIDTH:
        scored = True
        scored_by = "p1"
        game.p1_score += 1
    if not scored:
        return
    message = {'type': 'SCORE', 'scored_by': scored_by}
    broadcast(game.players, json.dumps(message))
    game.ball.set_start(ARENA_HEIGHT, ARENA_WIDTH, random_ball_vec())


def move_ball(ball: Ball, player_one: PlayerPaddle, player_two: PlayerPaddle):
    old_pos = Point(ball.shape.centerx, ball.shape.centery)
    new_pos = Point(
        ball.shape.centerx + (ball.dir_vect.x * ball.movement_speed),
        ball.shape.centery + (ball.dir_vect.y * ball.movement_speed))
    ball.shape.x = new_pos.x - ball.radius_px
    ball.shape.y = new_pos.y - ball.radius_px
    # Paddle collision
    paddle = None
    if ball.dir_vect.x < 0:
        paddle = player_one
    elif ball.dir_vect.x > 0:
        paddle = player_two
    if paddle is None:
        return
    paddle_intersect = handle_paddle_collision(old_pos, new_pos, paddle, ball)
    if paddle_intersect is None:
        # Court collision
        court_pt = handle_court_collision(old_pos, new_pos, ball)
        if court_pt is not None:
            pt, side = court_pt
            match side:
                case "left" | "right":
                    ball.dir_vect.x *= -1
                    ball.shape.x = pt.x - ball.radius_px
                case "bottom" | "top":
                    ball.dir_vect.y *= -1
                    ball.shape.y = pt.y - ball.radius_px
        # Make sure the ball is not past the court lines
        else:
            if ball.dir_vect.y < 0 and ((new_pos.y - ball.radius_px) < 0):
                ball.dir_vect.y = -ball.dir_vect.y
                ball.shape.x = new_pos.x - ball.radius_px
                ball.shape.y = 0
            elif ball.dir_vect.y > 0 and (
                    (new_pos.y + ball.radius_px) > ARENA_HEIGHT):
                ball.dir_vect.y = -ball.dir_vect.y
                ball.shape.x = new_pos.x - ball.radius_px
                ball.shape.y = ARENA_HEIGHT - (ball.radius_px * 2)
        return
    paddle_point, side = paddle_intersect
    match side:
        case "left" | "right":
            ball.dir_vect.x *= -1
            ball.shape.x = paddle_point.x - ball.radius_px
        case "bottom" | "top":
            ball.dir_vect.y *= -1
            ball.shape.y = paddle_point.y - ball.radius_px


def random_ball_vec() -> Vector2:
    x = -1 if rand.randint(0, 1) == 0 else 1
    y = -1 if rand.randint(0, 1) == 0 else 1
    return Vector2(x, y)


def update(game: GameInstance):
    move_ball(game.ball, game.p1_paddle, game.p2_paddle)
    process_input(game)
    handle_score(game)


def print_game(game: GameInstance):
    if len(game.p2_input) == 0:
        return
    print(
        f"p1\n"
        f"x:{game.p1_paddle.shape.x} y:{game.p1_paddle.shape.y}\n"
        f"p1_input:{game.p1_input}"

        f"p2\n"
        f"x:{game.p2_paddle.shape.x} y:{game.p2_paddle.shape.y}\n"
        f"p2_input:{game.p2_input}"
        )


def game_loop(game: GameInstance):
    game_state = {
        'type': 'STATE',
        'ball': {
            'x': game.ball.shape.x,
            'y': game.ball.shape.y,
            },
        'p1': {
            'x': game.p1_paddle.shape.x,
            'y': game.p1_paddle.shape.y,
            'last_ts': game.p1_last_ts
        },
        'p2': {
            'x': game.p2_paddle.shape.x,
            'y': game.p2_paddle.shape.y,
            'last_ts': game.p2_last_ts
        }
    }
    update(game)
    print_game(game)
    return game_state


def process_paddle(input: list, paddle: PlayerPaddle):
    for move in input:
        if move[0] == 'DOWN':
            paddle.move_down(ARENA_HEIGHT)
        elif move[0] == 'UP':
            paddle.move_up()


def process_input(game: GameInstance):
    if len(game.p1_input) != 0:
        process_paddle(game.p1_input, game.p1_paddle)
        game.p1_last_ts = game.p1_input[-1][1]
        game.p1_input.clear()
    if len(game.p2_input) != 0:
        process_paddle(game.p2_input, game.p2_paddle)
        game.p2_last_ts = game.p2_input[-1][1]
        game.p2_input.clear()
