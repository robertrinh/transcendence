import pygame


class PlayerPaddle:
    shape: pygame.Rect
    y_vector: float

    def __init__(self, y_vector: float, shape: pygame.Rect):
        self.y_vector = y_vector
        self.shape = shape

    def move_up(self):
        pos_x, pos_y = self.shape.topleft
        new_shape = self.shape.move(0, -self.y_vector)
        if new_shape.collidepoint(pos_x, 0):
            return
        self.shape = new_shape

    def move_down(self, arena_height: int):
        pos_x, pos_y = self.shape.topleft
        new_shape = self.shape.move(0, self.y_vector)
        if new_shape.collidepoint(self.shape.bottomleft[0], arena_height):
            return
        self.shape = new_shape
