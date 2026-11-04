"""Objetos, equipamiento e inventario del aventurero."""

from datos import OBJETOS


class Objeto:
    """Representa una unidad de un objeto definido en el catálogo."""

    def __init__(self, identificador: str):
        if identificador not in OBJETOS:
            raise ValueError(f"Objeto desconocido: {identificador}")
        self.identificador = identificador
        self.datos = OBJETOS[identificador]

    @property
    def nombre(self) -> str:
        return self.datos["nombre"]

    @property
    def tipo(self) -> str:
        return self.datos["tipo"]

    @property
    def rareza(self) -> str:
        return self.datos["rareza"]

    @property
    def efecto(self) -> dict[str, int]:
        return self.datos["efecto"]

    @property
    def valor(self) -> int:
        return self.datos["valor"]

    def describir(self) -> str:
        return f"{self.nombre} ({self.rareza}) — {self.datos['descripcion']}"


class Inventario:
    """Guarda objetos y equipo; el equipo no ocupa espacio de mochila."""

    def __init__(self, capacidad: int = 12):
        self.capacidad = capacidad
        self.objetos: list[Objeto] = []
        self.equipo: dict[str, Objeto | None] = {"arma": None, "armadura": None}

    def agregar(self, objeto: Objeto) -> bool:
        if len(self.objetos) >= self.capacidad:
            print("La mochila está llena. Ni una rata cabe ya ahí.")
            return False
        self.objetos.append(objeto)
        print(f"Recogiste: {objeto.nombre}.")
        return True

    def quitar(self, indice: int) -> Objeto:
        return self.objetos.pop(indice)

    def modificar_equipo(self, objeto: Objeto) -> Objeto | None:
        if objeto.tipo not in self.equipo:
            raise ValueError("Solo se pueden equipar armas o armaduras.")
        if len(self.objetos) >= self.capacidad and self.equipo[objeto.tipo] is not None:
            print("No hay sitio para guardar el equipo que vas a cambiar.")
            return None
        anterior = self.equipo[objeto.tipo]
        self.equipo[objeto.tipo] = objeto
        return anterior


def usar_objeto(personaje, indice: int, enemigo=None) -> bool:
    """Usa un consumible y lo consume solo si tuvo un efecto."""
    if indice < 0 or indice >= len(personaje.inventario.objetos):
        print("Ese espacio de la mochila está vacío.")
        return False
    objeto = personaje.inventario.objetos[indice]
    if objeto.tipo != "consumible":
        print("Ese objeto se equipa desde el inventario; no se puede consumir.")
        return False

    efecto = objeto.efecto
    aplico = False
    if efecto.get("vida"):
        recuperado = min(efecto["vida"], personaje.vida_maxima - personaje.vida)
        personaje.vida += recuperado
        aplico = aplico or recuperado > 0
        print(f"Recuperas {recuperado} de vida.")
    if efecto.get("mana"):
        recuperado = min(efecto["mana"], personaje.mana_maximo - personaje.mana)
        personaje.mana += recuperado
        aplico = aplico or recuperado > 0
        print(f"Recuperas {recuperado} de maná.")
    if efecto.get("limpiar") and personaje.veneno > 0:
        personaje.veneno = 0
        aplico = True
        print("El veneno desaparece. La poción sabe a calcetín, pero funciona.")
    if efecto.get("danio") and enemigo is not None and enemigo.vida > 0:
        enemigo.vida = max(0, enemigo.vida - efecto["danio"])
        aplico = True
        print(f"{objeto.nombre} inflige {efecto['danio']} de daño.")

    if aplico:
        personaje.inventario.quitar(indice)
    else:
        print("No necesitas ese objeto ahora; se queda en la mochila.")
    return aplico


def mostrar_inventario(personaje) -> None:
    inventario = personaje.inventario
    while True:
        print(
            f"\n--- Mochila ({len(inventario.objetos)}/{inventario.capacidad}) ---"
        )
        for indice, objeto in enumerate(inventario.objetos, 1):
            print(f"{indice}) {objeto.describir()}")
        for tipo, objeto in inventario.equipo.items():
            print(f"Equipo {tipo}: {objeto.nombre if objeto else 'nada'}")
        print("1) Usar/equipar objeto  2) Desequipar  3) Volver")
        opcion = input("Opción: ").strip()
        if opcion == "3":
            return
        if opcion == "1":
            if not inventario.objetos:
                print("Tu mochila está más vacía que una taberna un lunes.")
                continue
            for indice, objeto in enumerate(inventario.objetos, 1):
                print(f"{indice}) {objeto.nombre} [{objeto.tipo}]")
            try:
                indice = int(input("Número de objeto (0 para cancelar): ")) - 1
            except ValueError:
                print("Escribe un número, no una profecía.")
                continue
            if indice == -1:
                continue
            if indice < 0 or indice >= len(inventario.objetos):
                print("Ese número no corresponde a ningún objeto.")
                continue
            objeto = inventario.objetos[indice]
            if objeto.tipo in ("arma", "armadura"):
                equipar_objeto(personaje, indice)
            else:
                usar_objeto(personaje, indice)
        elif opcion == "2":
            desequipar_objeto(personaje)
        else:
            print("Opción inválida.")


def equipar_objeto(personaje, indice: int) -> bool:
    objeto = personaje.inventario.objetos[indice]
    anterior = personaje.inventario.modificar_equipo(objeto)
    if anterior is None and personaje.inventario.equipo[objeto.tipo] is not objeto:
        return False
    personaje.inventario.quitar(indice)
    if anterior is not None:
        personaje.inventario.objetos.append(anterior)
    personaje.recalcular_estadisticas()
    print(f"Equipaste {objeto.nombre}.")
    return True


def desequipar_objeto(personaje) -> None:
    opciones = [
        (tipo, objeto) for tipo, objeto in personaje.inventario.equipo.items()
        if objeto is not None
    ]
    if not opciones:
        print("No llevas nada equipado. Bueno, al menos vas ligero.")
        return
    for indice, (tipo, objeto) in enumerate(opciones, 1):
        print(f"{indice}) {tipo}: {objeto.nombre}")
    try:
        indice = int(input("¿Qué deseas desequipar? ")) - 1
    except ValueError:
        print("Escribe un número válido.")
        return
    if indice < 0 or indice >= len(opciones):
        print("Ese equipo no existe.")
        return
    if len(personaje.inventario.objetos) >= personaje.inventario.capacidad:
        print("La mochila está llena; libera espacio primero.")
        return
    tipo, objeto = opciones[indice]
    personaje.inventario.equipo[tipo] = None
    personaje.inventario.objetos.append(objeto)
    personaje.recalcular_estadisticas()
    print(f"Desequipaste {objeto.nombre}.")
