"""Jefes con cambios de fase y recompensas únicas."""

import random

from datos import JEFES
from enemigos import Enemigo


class Jefe(Enemigo):
    """Enemigo especial con patrón de fase y recompensa propia."""

    def __init__(self, datos: dict, nivel: int = 1):
        super().__init__(datos, nivel, jefe=True)
        self.recompensa = datos["recompensa"]
        self.fase = 1

    def actualizar_fase(self) -> None:
        if self.fase == 1 and self.vida <= self.vida_maxima // 2:
            self.fase = 2
            print(f"\n¡{self.nombre} entra en fase 2! La música se pone cara.")

    def atacar(self, personaje, defendiendo: bool = False) -> int:
        self.actualizar_fase()
        if self.comportamiento == "calavera" and self.fase == 2:
            if random.random() < 0.4:
                danio = max(1, self.ataque + 5 - personaje.defensa)
                personaje.vida = max(0, personaje.vida - danio)
                print(f"Doña Calavera firma una orden ejecutiva: {danio} de daño.")
                return danio
        elif self.comportamiento == "dragon" and self.fase == 2:
            danio = max(1, self.ataque + 4 - personaje.defensa)
            if defendiendo:
                danio = max(1, danio // 2)
            personaje.vida = max(0, personaje.vida - danio)
            print(f"El dragón lanza una llamarada de oferta: {danio} de daño.")
            if random.random() < 0.25:
                personaje.veneno = max(personaje.veneno, 2)
                print("Las llamas dejan un veneno de dudosa procedencia.")
            return danio
        elif self.comportamiento == "bruja" and self.fase == 2:
            cura = min(10, self.vida_maxima - self.vida)
            if cura:
                self.vida += cura
                print(f"La bruja se cura {cura} puntos. ¡Eso no estaba en el contrato!")
        return super().atacar(personaje, defendiendo)


def crear_jefe(numero: int, nivel: int = 1) -> Jefe:
    datos = JEFES[(max(1, numero) - 1) % len(JEFES)]
    return Jefe(datos, nivel)
