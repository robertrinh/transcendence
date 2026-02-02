import pygame
import asyncio
import websockets
from multiprocessing import connection
from websockets import broadcast
from websockets.asyncio.server import serve
import json
import random as rand
from ball import Ball, Vector2
from time import time
from player_paddle import PlayerPaddle

# game dimensions
ARENA_WIDTH = 1024
ARENA_HEIGHT = 768

PLAYERS = list()
READY_COUNT = 0
TICK = 1000 / 66
screen = None
BALL_RADIUS = 15
BALL_SIZE = BALL_RADIUS * 2

# movement
BALL_SPEED_UNITS_S = 500  # The ball speed in units per second
PADDLE_SPEED_UNITS_S = 30
P1_INPUT = list()
P2_INPUT = list()
P1_LAST_TS = None
P2_LAST_TS = None

P1_SCORE = 0
P2_SCORE = 0


def in_hor_arena_bounds(y: int, radius_px: int) -> bool:
    return y >= 0 and y <= ARENA_HEIGHT - radius_px * 2


def in_vert_arena_bounds(x: int, radius_px: int) -> bool:
    return x >= 0 and x <= ARENA_WIDTH - radius_px * 2


class Point:
    x: float
    y: float

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y


def line_line_intersect(p1: Point, p2: Point, p3: Point, p4: Point, side: str) -> None | tuple[Point, str]:
    denom = ((p2.x - p1.x) * (p4.y - p3.y)) - ((p2.y - p1.y) * (p4.x - p3.x))
    if denom == 0:
        return None
    dist1 = (((p1.y - p3.y) * (p4.x - p3.x)) - ((p1.x - p3.x) * (p4.y - p3.y))) / denom
    dist2 = (((p1.y - p3.y) * (p2.x - p1.x)) - ((p1.x - p3.x) * (p2.y - p1.y))) / denom
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
                Point(ARENA_WIDTH + ball.radius_px, ARENA_HEIGHT - ball.radius_px),
                "bottom"
            )
    return intersect


def handle_score(ball: Ball):
    scored = False
    scored_by = None
    if (ball.shape.x + ball.radius_px * 4) < 0:
        scored = True
        scored_by = "p2"
        global P2_SCORE
        P2_SCORE += 1
    if (ball.shape.x - ball.radius_px * 4) > ARENA_WIDTH:
        scored = True
        scored_by = "p1"
        global P1_SCORE
        P1_SCORE += 1
    if not scored:
        return
    message = {'type': 'SCORE', 'scored_by': scored_by}
    broadcast(PLAYERS, json.dumps(message))
    ball.set_start(ARENA_HEIGHT, ARENA_WIDTH, random_ball_vec())


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
            elif ball.dir_vect.y > 0 and ((new_pos.y + ball.radius_px) > ARENA_HEIGHT):
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


def update(ball: Ball, player_one: PlayerPaddle, player_two: PlayerPaddle):
    move_ball(ball, player_one, player_two)
    process_input(player_one, player_two)
    handle_score(ball)


def draw(ball: Ball, player_one: PlayerPaddle, player_two: PlayerPaddle):
    screen.fill([255, 255, 255])
    ball.draw(screen)
    player_one.draw(screen)
    player_two.draw(screen)
    pygame.display.update()


def game_loop(
        ball: Ball, player_one: PlayerPaddle,
        player_two: PlayerPaddle):
    game_state = {
        'type': 'STATE',
        'ball': {
            'x': ball.shape.x,
            'y': ball.shape.y,
            },
        'p1': {
            'x': player_one.shape.x,
            'y': player_one.shape.y,
            'last_ts': P1_LAST_TS
        },
        'p2': {
            'x': player_two.shape.x,
            'y': player_two.shape.y,
            'last_ts': P2_LAST_TS
        }
    }
    update(ball, player_one, player_two)
    draw(ball, player_one, player_two)
    terminate = False
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            terminate = True
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            terminate = True
    if terminate:
        pygame.quit()
        exit(0)
    return game_state


def increment_ready():
    global READY_COUNT
    READY_COUNT += 1


def process_paddle(input: list, paddle: PlayerPaddle):
    for move in input:
        if move[0] == 'DOWN':
            paddle.move_down(ARENA_HEIGHT)
        elif move[0] == 'UP':
            paddle.move_up()


def process_input(player_one: PlayerPaddle, player_two: PlayerPaddle):
    global P1_LAST_TS
    global P2_LAST_TS
    if len(P1_INPUT) != 0:
        process_paddle(P1_INPUT, player_one)
        P1_LAST_TS = P1_INPUT[-1][1]
        P1_INPUT.clear()
    if len(P2_INPUT) != 0:
        process_paddle(P2_INPUT, player_two)
        P2_LAST_TS = P2_INPUT[-1][1]
        P2_INPUT.clear()


async def handler(websocket: websockets.ServerConnection):
    # some authentication here?
    PLAYERS.append(websocket)
    print(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e)
            exit(1)
        message_type = message_content['type']
        match message_type:
            case 'READY':
                increment_ready()
                print(websocket, " is ready")
                if READY_COUNT < 2:
                    asyncio.create_task(game_lobby())
            case 'MOVE_DOWN':
                if websocket == PLAYERS[0]:
                    print("Player 1 wants to move down")
                    P1_INPUT.append(['DOWN', message_content['ts']])
                else:
                    print("Player 2 wants to move down")
                    P2_INPUT.append(['DOWN', message_content['ts']])
            case 'MOVE_UP':
                if websocket == PLAYERS[0]:
                    print("Player 1 wants to move up")
                    P1_INPUT.append(['UP', message_content['ts']])
                else:
                    print("Player 2 wants to move up")
                    P2_INPUT.append(['UP', message_content['ts']])
            case 'WHOAMI':
                if websocket == PLAYERS[0]:
                    await websocket.send(json.dumps(
                        {'type': 'ID', 'player_id': 1}
                        ))
                else:
                    await websocket.send(json.dumps(
                        {'type': 'ID', 'player_id': 2}
                        ))


async def game_lobby():
    while READY_COUNT != 2:
        message = {'type': 'LOBBY_WAIT'}
        broadcast(PLAYERS, json.dumps(message))
        await asyncio.sleep(5)
    conv_ball_speed = (BALL_SPEED_UNITS_S / 1000) * TICK
    ball = Ball(
        conv_ball_speed, conv_ball_speed * 2, BALL_RADIUS)
    ball.set_start(ARENA_HEIGHT, ARENA_WIDTH, random_ball_vec())
    player_one = PlayerPaddle(
        PADDLE_SPEED_UNITS_S,
        pygame.Rect(0, 0, BALL_SIZE, BALL_SIZE * 4),
        pygame.Color(55, 100, 40)
        )
    player_two = PlayerPaddle(
        PADDLE_SPEED_UNITS_S,
        pygame.Rect(ARENA_WIDTH-(BALL_SIZE), 0, BALL_SIZE, BALL_SIZE * 4),
        pygame.Color(55, 100, 40)
        )
    while True:
        broadcast(PLAYERS, json.dumps(game_loop(ball, player_one, player_two)))
        await asyncio.sleep(TICK/1000)


async def main(child_conn: connection.Connection, ip: str, lobby_id: str):
    # let the OS pick a random available port
    async with serve(handler, ip, 0) as server:
        server_port = server.sockets[0].getsockname()[1]
        child_conn.send(f"{server_port}")
        print(f"Game lobby {lobby_id} hosted on {ip}:{server_port}")
        await server.serve_forever()


def game_process(child_conn: connection.Connection, ip: str, lobby_id: str):
    rand.seed(time())
    global screen
    screen = pygame.display.set_mode((ARENA_WIDTH, ARENA_HEIGHT))
    # game_arena = screen.get_rect()
    screen.fill([255, 255, 255])
    pygame.display.set_caption(f"pong lobby {lobby_id}")
    pygame.init()
    asyncio.run(main(child_conn, ip, lobby_id))
    pygame.quit()
