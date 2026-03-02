from lib import Point, Rect, is_colliding_ball_paddle
from ball import Ball


class PlayerPaddle:
    shape: Rect
    y_vector: float

    def __init__(
            self, y_vector: float, shape: Rect):
        self.y_vector = y_vector
        self.shape = shape

    def move_up(self, ball: Ball):
        new_y = self.shape.y - self.y_vector
        new_pos = Point(self.shape.x, new_y)
        ball_center = Point(
            ball.shape.x + ball.radius_px, ball.shape.y + ball.radius_px)
        if is_colliding_ball_paddle(ball_center, ball.radius_px, new_pos,
           self.shape.width, self.shape.height) is not None:
            return
        if new_y < 0:
            new_y = 0
        self.shape.y = new_y

    def move_down(self, ball: Ball, arena_height: int):
        new_y = self.shape.y + self.y_vector
        new_pos = Point(self.shape.x, new_y)
        ball_center = Point(
            ball.shape.x + ball.radius_px, ball.shape.y + ball.radius_px)
        if is_colliding_ball_paddle(ball_center, ball.radius_px, new_pos,
           self.shape.width, self.shape.height) is not None:
            return
        if (new_y + self.shape.height) > arena_height:
            new_y = arena_height - self.shape.height
        self.shape.y = new_y
