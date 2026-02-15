from lib import Rect


class PlayerPaddle:
    shape: Rect
    y_vector: float

    def __init__(
            self, y_vector: float, shape: Rect):
        self.y_vector = y_vector
        self.shape = shape

    def move_up(self):
        new_y = self.shape.y - self.y_vector
        if new_y < 0:
            new_y = 0
        self.shape.y = new_y

    def move_down(self, arena_height: int):
        new_y = self.shape.y + self.y_vector
        if (new_y + self.shape.height) > arena_height:
            new_y = arena_height - self.shape.height
        self.shape.y = new_y
