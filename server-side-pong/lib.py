from math import pow
from math import sqrt


class Vector2:
    x: int
    y: int

    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y

    def normalize(self):
        magnitude = pow(self.x, 2) + pow(self.y, 2)
        self.x = self.x / magnitude
        self.y = self.y / magnitude


class Point:
    x: float
    y: float

    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y


class Rect:
    x: float
    y: float
    width: float
    height: float

    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height


def is_colliding_ball_paddle(
        ball_center: Point, ball_radius: float, paddle_point: Point,
        paddle_width: float, paddle_height: float) -> None | str:
    test_x = ball_center.x
    test_y = ball_center.y

    if ball_center.x < paddle_point.x:
        test_x = paddle_point.x
    elif ball_center.x > paddle_point.x + paddle_width:
        test_x = paddle_point.x + paddle_width

    if ball_center.y < paddle_point.y:
        test_y = paddle_point.y
    elif ball_center.y > paddle_point.y + paddle_height:
        test_y = paddle_point.y + paddle_height
    dist_x = ball_center.x-test_x
    dist_y = ball_center.y-test_y
    distance = sqrt((dist_x*dist_x) + (dist_y*dist_y))
    if distance <= ball_radius:
        if abs(dist_x) > abs(dist_y):
            return 'vert'
        return 'hor'
    return None
