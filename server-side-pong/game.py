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
TICK = 1000 / 10
screen = None
BALL_RADIUS = 15

# movement
BALL_SPEED_UNITS_S = 500  # The ball speed in units per second
PADDLE_SPEED_UNITS_S = 30
P1_INPUT = list()
P2_INPUT = list()
P1_LAST_TS = None
P2_LAST_TS = None


def in_hor_arena_bounds(y: int, radius_px: int) -> bool:
    return y >= 0 and y <= ARENA_HEIGHT - radius_px * 2


def in_vert_arena_bounds(x: int, radius_px: int) -> bool:
    return x >= 0 and x <= ARENA_WIDTH - radius_px * 2


def move_ball(ball: Ball):
    new_pos = Vector2(
        ball.shape.x + (ball.dir_vect.x * ball.movement_speed),
        ball.shape.y + (ball.dir_vect.y * ball.movement_speed))
    print(f"dir_vect.x:{ball.dir_vect.x} dir_vect.y:{ball.dir_vect.y}")
    print(f"new_pos x:{new_pos.x} y:{new_pos.y}")
    if not in_vert_arena_bounds(new_pos.x, ball.radius_px):
        print("vert_coll")
        ball.dir_vect.x *= -1
    if not in_hor_arena_bounds(new_pos.y, ball.radius_px):
        print("hor_coll")
        ball.dir_vect.y *= -1
    ball.shape.x += ball.dir_vect.x * ball.movement_speed
    ball.shape.y += ball.dir_vect.y * ball.movement_speed


def random_ball_vec() -> Vector2:
    x = -1 if rand.randint(0, 1) == 0 else 1
    y = -1 if rand.randint(0, 1) == 0 else 1
    return Vector2(x, y)


def update(ball: Ball, player_one: PlayerPaddle, player_two: PlayerPaddle):
    move_ball(ball)
    process_input(player_one, player_two)


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
        ARENA_WIDTH / 2,
        ARENA_HEIGHT / 2,
        random_ball_vec(),
        conv_ball_speed, conv_ball_speed * 2, BALL_RADIUS)
    player_one = PlayerPaddle(
        PADDLE_SPEED_UNITS_S,
        pygame.Rect(50, 50, 20, 150),
        pygame.Color(55, 100, 40)
        )
    player_two = PlayerPaddle(
        PADDLE_SPEED_UNITS_S,
        pygame.Rect(ARENA_WIDTH-70, 50, 20, 150),
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
