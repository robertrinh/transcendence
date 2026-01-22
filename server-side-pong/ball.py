import pygame
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


class Ball:
    shape: pygame.Rect
    dir_vect: Vector2
    movement_speed: int
    max_speed: int
    speed_incr: int
    radius_px: int

    def __init__(
            self, movement_speed: int,
            max_speed: int, radius_px: int):
        self.shape = pygame.Rect(0, 0, radius_px * 2, radius_px * 2)
        self.dir_vect = (0, 0)
        self.movement_speed = movement_speed
        self.max_speed = max_speed
        self.speed_incr = 0
        self.radius_px = radius_px

    def set_start(
            self, arena_height: int, arena_width: int, dir_vect: Vector2):
        self.shape.x = (arena_width / 2) - self.radius_px
        self.shape.y = (arena_height / 2) - self.radius_px
        self.dir_vect = dir_vect

    def increase_speed(self):
        if self.movement_speed < self.max_speed:
            self.movement_speed += 0.5 * pow(1.2, self.speed_incr)
            self.speed_incr += 1
        if self.movement_speed > self.max_speed:
            self.movement_speed = self.max_speed

    def draw(self, surface: pygame.Surface):
        pygame.draw.circle(surface, (151, 3, 204), (
            self.shape.x + self.radius_px,
            self.shape.y + self.radius_px
            ),
            self.radius_px
        )
