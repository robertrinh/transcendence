from math import pow


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
