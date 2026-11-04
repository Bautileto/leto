"""Combate por turnos entre el personaje y sus rivales."""

import random

from inventario import Objeto, usar_objeto


def barra(valor: int, maximo: int, ancho: int = 20) -> str:
    proporcion = max(0, min(1, valor / maximo)) if maximo else 0
    llenos = round(proporcion * ancho)
    return "[" + "#" * llenos + "-" * (ancho - llenos) + "]"


def mostrar_estado(personaje, enemigo) -> None:
    print(
        f"\n{personaje.nombre}: {barra(personaje.vida, personaje.vida_maxima)} "
        f"{personaje.vida}/{personaje.vida_maxima} PV | "
        f"{barra(personaje.mana, personaje.mana_maximo)} "
        f"{personaje.mana}/{personaje.mana_maximo} PM"
    )
    print(
        f"{enemigo.nombre}: {barra(enemigo.vida, enemigo.vida_maxima)} "
        f"{enemigo.vida}/{enemigo.vida_maxima} PV"
    )


def _atacar(personaje, enemigo) -> None:
    if random.random() < max(0.03, enemigo.velocidad * 0.012):
        print(f"{enemigo.nombre} esquiva tu ataque. Qué reflejos tan poco elegantes.")
        return
    critico = random.random() < min(0.35, 0.08 + personaje.velocidad * 0.015)
    danio = max(1, personaje.ataque + random.randint(-2, 3) - enemigo.defensa)
    if critico:
        danio *= 2
        print("¡Golpe crítico!")
    enemigo.vida = max(0, enemigo.vida - danio)
    print(f"Infliges {danio} de daño a {enemigo.nombre}.")


def _usar_habilidad(personaje, enemigo) -> bool:
    nombre, coste = personaje.habilidad()
    if personaje.mana < coste:
        print(f"No tienes maná suficiente para {nombre}.")
        return False
    personaje.mana -= coste
    if personaje.clase == "Guerrero":
        danio = max(1, personaje.ataque * 2 + random.randint(0, 4) - enemigo.defensa)
    elif personaje.clase == "Mago":
        danio = max(1, personaje.ataque + random.randint(10, 16) - enemigo.defensa // 2)
    else:
        danio = max(1, personaje.ataque + random.randint(2, 6) - enemigo.defensa)
        danio += max(1, personaje.ataque // 2)
    enemigo.vida = max(0, enemigo.vida - danio)
    if personaje.clase == "Pícaro":
        personaje.vida = min(personaje.vida_maxima, personaje.vida + 3)
        print("Recuperas 3 de vida con tu ágil retirada.")
    print(f"¡{nombre}! Causas {danio} de daño.")
    return True


def combatir(personaje, enemigo) -> str:
    """Devuelve 'victoria', 'huida' o 'derrota'."""
    personaje.combates += 1
    defendiendo = False
    print(f"\n¡Aparece {enemigo.nombre}! ¡Conversar tampoco era una opción!")
    while personaje.vida > 0 and enemigo.vida > 0:
        mostrar_estado(personaje, enemigo)
        nombre_habilidad, _ = personaje.habilidad()
        print(
            "\n1) Atacar  2) Habilidad especial  3) Usar objeto "
            "4) Defender  5) Huir"
        )
        print(f"Habilidad: {nombre_habilidad}")
        opcion = input("Tu acción: ").strip()
        turno_enemigo = True
        if opcion == "1":
            _atacar(personaje, enemigo)
        elif opcion == "2":
            turno_enemigo = _usar_habilidad(personaje, enemigo)
        elif opcion == "3":
            objetos = [
                (indice, objeto) for indice, objeto in
                enumerate(personaje.inventario.objetos)
                if objeto.tipo == "consumible"
            ]
            if not objetos:
                print("No tienes consumibles. El bolsillo está en huelga.")
                turno_enemigo = False
            else:
                for indice, objeto in objetos:
                    print(f"{indice + 1}) {objeto.nombre}")
                try:
                    indice = int(input("Objeto (0 para cancelar): ")) - 1
                except ValueError:
                    print("Eso no parece un número de objeto.")
                    turno_enemigo = False
                else:
                    if indice == -1:
                        turno_enemigo = False
                    elif indice < 0 or indice >= len(personaje.inventario.objetos):
                        print("Ese espacio no existe.")
                        turno_enemigo = False
                    else:
                        objeto = personaje.inventario.objetos[indice]
                        if objeto.tipo != "consumible":
                            print("Elige un consumible de la lista.")
                            turno_enemigo = False
                        else:
                            usar_objeto(personaje, indice, enemigo)
        elif opcion == "4":
            defendiendo = True
            print("Te preparas para defenderte. ¡Una decisión sensata, qué raro!")
        elif opcion == "5":
            probabilidad = min(0.85, max(0.15, 0.35
                                        + (personaje.velocidad - enemigo.velocidad) * 0.05))
            if random.random() < probabilidad:
                print("¡Logras huir! La dignidad queda atrás, pero está bien.")
                return "huida"
            print("No consigues escapar.")
        else:
            print("Acción inválida; el enemigo espera con una paciencia preocupante.")
            turno_enemigo = False

        if enemigo.vida <= 0:
            break
        if turno_enemigo:
            enemigo.atacar(personaje, defendiendo)
            defendiendo = False
        if personaje.veneno > 0 and personaje.vida > 0:
            personaje.veneno -= 1
            personaje.vida = max(0, personaje.vida - 2)
            print("El veneno te quita 2 de vida.")

    if personaje.vida <= 0:
        print(f"{personaje.nombre} cae al suelo. El enemigo no ofrece primeros auxilios.")
        return "derrota"
    print(f"\n¡Victoria! {enemigo.nombre} ha sido derrotado.")
    personaje.ganar_experiencia(enemigo.experiencia)
    personaje.oro += enemigo.oro
    print(f"Encuentras {enemigo.oro} monedas.")
    if enemigo.botin and (enemigo.es_jefe or random.random() < 0.45):
        identificador = random.choice(enemigo.botin)
        print("¡Botín encontrado!")
        personaje.inventario.agregar(Objeto(identificador))
    return "victoria"
