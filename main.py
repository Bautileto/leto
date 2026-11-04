"""Punto de entrada de Las Catacumbas del Casi."""

from personaje import Personaje, elegir_clase
from guardado import cargar_partida, guardar_partida
from eventos import explorar
from inventario import mostrar_inventario
from tienda import visitar_tienda


def pedir_opcion(mensaje: str, opciones: tuple[str, ...]) -> str:
    """Solicita una opción válida sin interrumpir la partida."""
    while True:
        opcion = input(mensaje).strip()
        if opcion in opciones:
            return opcion
        print("Esa opción no existe. ¡Ni las catacumbas saben qué hacer con eso!")


def crear_personaje() -> Personaje:
    print("\n--- Creación de aventurero ---")
    nombre = input("¿Cómo te llamas, valiente (o imprudente)? ").strip()
    while not nombre:
        nombre = input("El nombre no puede quedar en blanco: ").strip()

    clase = elegir_clase()
    personaje = Personaje(nombre, clase)
    atributos = {
        "vida": ("vida_maxima", 5),
        "mana": ("mana_maximo", 3),
        "ataque": ("ataque", 1),
        "defensa": ("defensa", 1),
        "velocidad": ("velocidad", 1),
    }
    puntos = 3
    print("\nReparte 3 puntos extra. Cada punto aumenta una estadística.")
    while puntos:
        print(
            f"Puntos disponibles: {puntos} | "
            "1) Vida  2) Maná  3) Ataque  4) Defensa  5) Velocidad"
        )
        eleccion = pedir_opcion("Elige atributo: ", ("1", "2", "3", "4", "5"))
        nombre_atributo, cantidad = atributos[{
            "1": "vida", "2": "mana", "3": "ataque",
            "4": "defensa", "5": "velocidad",
        }[eleccion]]
        personaje.estadisticas_base[nombre_atributo] += cantidad
        personaje.recalcular_estadisticas()
        if eleccion in ("1", "2"):
            personaje.vida = personaje.vida_maxima
            personaje.mana = personaje.mana_maximo
        puntos -= 1

    personaje.vida = personaje.vida_maxima
    personaje.mana = personaje.mana_maximo
    print(f"\n¡Bienvenido, {personaje.nombre} el {personaje.clase}!")
    personaje.mostrar_estadisticas()
    return personaje


def jugar(personaje: Personaje) -> None:
    print("\nLas Catacumbas del Casi te dan la bienvenida. Casi sales vivo, casi.")
    while personaje.vida > 0:
        print(f"\n=== Sala {personaje.sala + 1} | Nivel {personaje.nivel} ===")
        explorar(personaje)
        if personaje.vida <= 0:
            break
        while True:
            print("\n¿Qué haces ahora?")
            print("1) Seguir explorando  2) Inventario  3) Tienda")
            print("4) Guardar partida  5) Ver personaje  6) Volver al menú")
            opcion = pedir_opcion("Opción: ", ("1", "2", "3", "4", "5", "6"))
            if opcion == "1":
                break
            if opcion == "2":
                mostrar_inventario(personaje)
            elif opcion == "3":
                visitar_tienda(personaje)
            elif opcion == "4":
                guardar_partida(personaje)
            elif opcion == "5":
                personaje.mostrar_estadisticas()
            elif opcion == "6":
                return

    print(f"\n{personaje.nombre} ha caído en las catacumbas.")
    print("Las ratas organizarán una ceremonia sencilla. No hay presupuesto.")


def menu_principal() -> None:
    print("=" * 54)
    print("     LAS CATACUMBAS DEL CASI: AVENTURA DE BOLSILLO")
    print("=" * 54)
    while True:
        print("\n1) Nueva partida  2) Cargar partida  3) Salir")
        opcion = pedir_opcion("Opción: ", ("1", "2", "3"))
        if opcion == "1":
            jugar(crear_personaje())
        elif opcion == "2":
            personaje = cargar_partida()
            if personaje is not None:
                jugar(personaje)
        else:
            print("¡Hasta la próxima, aventurero! Guarda tus rodillas.")
            return


if __name__ == "__main__":
    try:
        menu_principal()
    except (EOFError, KeyboardInterrupt):
        print("\nLa aventura se detiene aquí. ¡Que las catacumbas te esperen!")
