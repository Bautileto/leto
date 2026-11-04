"""Exploración de salas y eventos aleatorios."""

import random

from combate import combatir
from enemigos import crear_enemigo
from inventario import Objeto
from jefes import crear_jefe


def _cofre(personaje) -> None:
    oro = random.randint(8, 24) + personaje.sala
    personaje.oro += oro
    print(f"¡Cofre! Dentro hay {oro} monedas y una nota que dice «no mires el fondo».")
    if random.random() < 0.65:
        identificador = random.choice([
            "pocion", "mana", "antidoto", "espada_hierro", "armadura_cuero"
        ])
        personaje.inventario.agregar(Objeto(identificador))


def _trampa(personaje) -> None:
    if random.random() < 0.3:
        danio = max(1, 8 + personaje.sala - personaje.velocidad)
        personaje.vida = max(0, personaje.vida - danio)
        print(f"¡Trampa! Una baldosa te causa {danio} de daño.")
    else:
        print("¡Esquivaste la trampa! Tus tobillos agradecen el entrenamiento.")


def _fuente(personaje) -> None:
    cura = min(personaje.vida_maxima - personaje.vida, 14)
    mana = min(personaje.mana_maximo - personaje.mana, 8)
    personaje.vida += cura
    personaje.mana += mana
    personaje.veneno = 0
    print(f"Fuente curativa: recuperas {cura} de vida y {mana} de maná.")


def _misterio(personaje) -> None:
    evento = random.choice(("bendicion", "monedas", "cosquillas"))
    if evento == "bendicion":
        personaje.vida = min(personaje.vida_maxima, personaje.vida + 10)
        personaje.mana = min(personaje.mana_maximo, personaje.mana + 5)
        print("Una voz misteriosa te bendice. O te hace cosquillas en el alma.")
    elif evento == "monedas":
        personaje.oro += 20
        print("Una bolsa cae del techo. El techo parece arrepentido: +20 oro.")
    else:
        personaje.vida = max(1, personaje.vida - 5)
        print("El misterio te hace cosquillas... con una pluma afilada. -5 vida.")


def explorar(personaje) -> None:
    """Resuelve un evento; cada quinta sala garantiza un jefe."""
    personaje.sala += 1
    if personaje.sala % 5 == 0:
        numero_jefe = personaje.sala // 5
        jefe = crear_jefe(numero_jefe, personaje.nivel)
        resultado = combatir(personaje, jefe)
        if resultado == "victoria":
            print(f"Recompensa especial: {jefe.recompensa}.")
            personaje.oro += 25
        return

    evento = random.choices(
        ["combate", "cofre", "trampa", "mercader", "fuente", "misterio"],
        weights=[35, 18, 12, 10, 12, 13],
        k=1,
    )[0]
    if evento == "combate":
        enemigo = crear_enemigo(personaje.nivel)
        combatir(personaje, enemigo)
    elif evento == "cofre":
        _cofre(personaje)
    elif evento == "trampa":
        _trampa(personaje)
    elif evento == "mercader":
        from tienda import visitar_tienda
        print("¡Un mercader aparece entre las sombras! Lleva cambio y cero explicaciones.")
        visitar_tienda(personaje)
    elif evento == "fuente":
        _fuente(personaje)
    else:
        _misterio(personaje)
