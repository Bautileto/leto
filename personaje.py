"""Creación, estadísticas y progresión de personajes."""

from datos import CLASES
from inventario import Inventario, Objeto


class Personaje:
    """Aventurero controlado por la persona que juega."""

    def __init__(self, nombre: str, clase: str):
        if clase not in CLASES:
            raise ValueError("Clase de personaje desconocida.")
        self.nombre = nombre
        self.clase = clase
        self.estadisticas_base = dict(CLASES[clase])
        self.inventario = Inventario()
        self.nivel = 1
        self.experiencia = 0
        self.oro = 25
        self.sala = 0
        self.combates = 0
        self.veneno = 0
        self.recalcular_estadisticas()
        self.vida = self.vida_maxima
        self.mana = self.mana_maximo
        self.inventario.agregar(Objeto("pocion"))
        self.inventario.agregar(Objeto("mana"))

    def recalcular_estadisticas(self) -> None:
        anterior_vida_maxima = getattr(self, "vida_maxima", 0)
        anterior_mana_maximo = getattr(self, "mana_maximo", 0)
        bono = {clave: 0 for clave in (
            "vida_maxima", "mana_maximo", "ataque", "defensa", "velocidad"
        )}
        for objeto in self.inventario.equipo.values():
            if objeto is not None:
                for atributo, cantidad in objeto.efecto.items():
                    if atributo in bono:
                        bono[atributo] += cantidad
        for atributo, cantidad in bono.items():
            setattr(self, atributo, self.estadisticas_base[atributo] + cantidad)
        if hasattr(self, "vida"):
            self.vida = min(
                self.vida_maxima, self.vida + self.vida_maxima - anterior_vida_maxima
            )
            self.mana = min(
                self.mana_maximo, self.mana + self.mana_maximo - anterior_mana_maximo
            )

    def habilidad(self) -> tuple[str, int]:
        datos = CLASES[self.clase]
        return datos["habilidad"], datos["coste_habilidad"]

    def ganar_experiencia(self, cantidad: int) -> None:
        self.experiencia += cantidad
        print(f"Obtienes {cantidad} de experiencia.")
        while self.experiencia >= self.nivel * 40:
            self.experiencia -= self.nivel * 40
            self.nivel += 1
            self.estadisticas_base["vida_maxima"] += 8
            self.estadisticas_base["mana_maximo"] += 3
            self.estadisticas_base["ataque"] += 2
            self.estadisticas_base["defensa"] += 1
            self.recalcular_estadisticas()
            self.vida = self.vida_maxima
            self.mana = self.mana_maximo
            print(
                f"¡Subes al nivel {self.nivel}! "
                "Tus heridas se cierran (y tu ego crece)."
            )

    def mostrar_estadisticas(self) -> None:
        habilidad, coste = self.habilidad()
        print(
            f"\n{self.nombre} | {self.clase} | Nivel {self.nivel} "
            f"| EXP {self.experiencia}/{self.nivel * 40} | Oro: {self.oro}"
        )
        print(
            f"Vida {self.vida}/{self.vida_maxima} | Maná "
            f"{self.mana}/{self.mana_maximo} | Ataque {self.ataque} | "
            f"Defensa {self.defensa} | Velocidad {self.velocidad}"
        )
        print(f"Habilidad: {habilidad} (cuesta {coste} de maná)")


def elegir_clase() -> str:
    clases = list(CLASES)
    while True:
        print("\nElige tu clase:")
        for indice, clase in enumerate(clases, 1):
            datos = CLASES[clase]
            print(
                f"{indice}) {clase}: vida {datos['vida_maxima']}, "
                f"maná {datos['mana_maximo']}, ataque {datos['ataque']}, "
                f"defensa {datos['defensa']}, velocidad {datos['velocidad']}"
            )
            print(f"   Habilidad: {datos['habilidad']}")
        try:
            indice = int(input("Clase: ")) - 1
        except ValueError:
            print("Introduce el número de la clase.")
            continue
        if 0 <= indice < len(clases):
            return clases[indice]
        print("Esa clase no está en la lista. Todavía.")
