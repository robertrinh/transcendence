import pygame


class PlayerPaddle:
    shape: pygame.Rect
    y_vector: float
    color: pygame.Color

    def __init__(
            self, y_vector: float, shape: pygame.Rect,
            color: pygame.Color):
        self.y_vector = y_vector
        self.shape = shape
        self.color = color

    def move_up(self):
        new_shape = self.shape.move(0, -self.y_vector)
        if new_shape.y < 0:
            new_shape.y = 0
        self.shape = new_shape

    def move_down(self, arena_height: int):
        new_shape = self.shape.move(0, self.y_vector)
        if (new_shape.y + new_shape.height) > arena_height:
            new_shape.y = arena_height - new_shape.height
        self.shape = new_shape

    def draw(self, surface: pygame.Surface):
        pygame.draw.rect(surface, self.color, self.shape)
