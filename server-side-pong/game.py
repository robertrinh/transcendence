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

# game dimensions
ARENA_WIDTH = 1024
ARENA_HEIGHT = 768

PLAYERS = set()
READY_COUNT = 0
TICK = 1000 / 10
screen = None

BALL_SPEED_UNITS_S = 1000  # The ball speed in units per second
BALL_RADIUS = 15


def in_hor_arena_bounds(y: int, radius_px: int) -> bool:
    return y >= 0 and y <= ARENA_HEIGHT - radius_px * 2


def in_vert_arena_bounds(x: int, radius_px: int) -> bool:
    return x >= 0 and x <= ARENA_WIDTH - radius_px * 2


# simulate a bouncing ball first
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


# player_one = PlayerPaddle(1.005, pygame.Rect(50, 50, 20, 150))
# player_two = PlayerPaddle(1.005, pygame.Rect(ARENA_WIDTH-70, 50, 20, 150))


def draw(ball: Ball):
    screen.fill([255, 255, 255])
    # pygame.draw.rect(screen, (200, 35, 50), player_one.shape, 2)
    # pygame.draw.rect(screen, (200, 35, 50), player_two.shape, 2)
    ball.draw(screen)
    pygame.display.update()


def form_game_state(ball: Ball):
    game_state = {
        'type': 'STATE',
        'last_ts': time() * 1000,
        'ball': {
            'x': ball.shape.x,
            'y': ball.shape.y,
            'dir_x': ball.dir_vect.x,
            'dir_y': ball.dir_vect.y,
            'speed': BALL_SPEED_UNITS_S,
            }
        }
    move_ball(ball)
    draw(ball)
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


async def handler(websocket: websockets.ServerConnection):
    # some authentication here?
    PLAYERS.add(websocket)
    print(websocket)
    async for message in websocket:
        try:
            message_content = json.loads(message)
        except json.decoder.JSONDecodeError as e:
            print(e)
            continue
        message_type = message_content['type']
        match message_type:
            case 'READY':
                increment_ready()
                print(websocket, " is ready")
                if READY_COUNT < 2:
                    asyncio.create_task(game_loop())


async def game_loop():
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
    while True:
        broadcast(PLAYERS, json.dumps(form_game_state(ball)))
        await asyncio.sleep(60/TICK)


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
