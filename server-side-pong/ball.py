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
            self, x: int, y: int, dir_vect: Vector2, movement_speed: int,
            max_speed: int, radius_px: int):
        self.shape = pygame.Rect(x, y, radius_px * 2, radius_px * 2)
        self.dir_vect = dir_vect
        self.movement_speed = movement_speed
        self.max_speed = max_speed
        self.speed_incr = 0
        self.radius_px = radius_px
    
    def increase_speed(self):
        if self.movement_speed < self.max_speed:
            self.movement_speed += 0.5 * pow(1.2, self.speed_incr)
            self.speed_incr += 1
        if self.movement_speed > self.max_speed:
            self.movement_speed = self.max_speed
