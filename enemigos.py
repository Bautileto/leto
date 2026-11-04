"""Creación y comportamiento de enemigos comunes."""

import random

from datos import ENEMIGOS


class Enemigo:
    """Criatura con estadísticas ajustadas al avance de la aventura."""

    def __init__(self, datos: dict, nivel: int = 1, jefe: bool = False):
        self.nombre = datos["nombre"]
        escala = max(0, nivel - 1)
        factor = 1 + escala * (0.12 if jefe else 0.09)
        self.vida_maxima = int(datos["vida"] * factor)
        self.vida = self.vida_maxima
        self.ataque = int(datos["ataque"] + escala * 1.2)
        self.defensa = datos["defensa"] + escala // 3
        self.velocidad = datos["velocidad"] + escala // 4
        self.experiencia = int(datos["experiencia"] * factor)
        self.oro = int(datos["oro"] * factor)
        self.comportamiento = datos["comportamiento"]
        self.botin = list(datos["botin"])
        self.es_jefe = jefe
        self.fase = 1
        self.veneno = 0

    def atacar(self, personaje, defendiendo: bool = False) -> int:
        if self.comportamiento == "curacion" and self.vida < self.vida_maxima * 0.55:
            cura = min(8, self.vida_maxima - self.vida)
            self.vida += cura
            print(f"{self.nombre} se recompone y recupera {cura} de vida.")
            return 0
        if self.comportamiento == "blindaje" and random.random() < 0.25:
            print(f"{self.nombre} levanta su escudo. Parece una reunión eterna.")
            return 0

        multiplicador = 1.35 if self.comportamiento == "rapido" else 1
        if self.es_jefe and self.vida <= self.vida_maxima // 2:
            multiplicador *= 1.35
        if random.random() < max(0.04, personaje.velocidad * 0.012):
            print(f"¡Esquivas el ataque de {self.nombre}!")
            return 0
        danio = max(1, int(self.ataque * multiplicador) + random.randint(-2, 3)
                    - personaje.defensa)
        if defendiendo:
            danio = max(1, danio // 2)
        personaje.vida = max(0, personaje.vida - danio)
        print(f"{self.nombre} te causa {danio} de daño.")
        if self.comportamiento == "veneno" and random.random() < 0.35:
            personaje.veneno = max(personaje.veneno, 3)
            print("¡Te ha envenenado! El color verde no te favorece.")
        if self.comportamiento == "ladron" and personaje.oro > 0 and random.random() < 0.2:
            robado = min(personaje.oro, random.randint(1, 5))
            personaje.oro -= robado
            print(f"El goblin te roba {robado} monedas. ¡Qué servicio tan pésimo!")
        return danio


def crear_enemigo(nivel: int = 1, indice: int | None = None) -> Enemigo:
    datos = ENEMIGOS[indice] if indice is not None else random.choice(ENEMIGOS)
    return Enemigo(datos, nivel)
