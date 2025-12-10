from ball import Ball, Vector2

# game dimensions
ARENA_WIDTH = 1024
ARENA_HEIGHT = 768

def in_vert_arena_bounds(y: int, radius_px: int) -> bool:
    return y >= 0 and y <= ARENA_HEIGHT - radius_px * 2

def in_hor_arena_bounds(x: int, radius_px: int) -> bool:
    return x >= 0 and x <= ARENA_WIDTH - radius_px * 2

def apply_vert_bounce(ball: Ball):
    ball.dir_vect.y = -ball.dir_vect.y

def apply_hor_bounce(ball: Ball):
    ball.dir_vect.x = -ball.dir_vect.x

# simulate a bouncing ball first

def move_ball(ball: Ball):
    new_pos = Vector2(ball.x + (ball.dir_vect.x * ball.movement_speed), ball.y + (ball.dir_vect.y * ball.movement_speed))
    if not in_vert_arena_bounds(new_pos.y, ball.radius_px):
        apply_vert_bounce(ball)
    if not in_hor_arena_bounds(new_pos.x, ball.radius_px):
        apply_hor_bounce(ball)
    ball.dir_vect.normalize()
    ball.x += ball.dir_vect.x * ball.movement_speed
    ball.y += ball.dir_vect.y * ball.movement_speed

def form_game_state(ball: Ball):
    game_state = {
        'type': 'STATE',
        'tick': 0,
        'ball': {'x': 0, 'y': 0}
        }
    move_ball(ball)
    game_state['ball']['x'] = ball.x
    game_state['ball']['y'] = ball.y
    return game_state
