"""Tienda para comprar y vender equipo y consumibles."""

from datos import OBJETOS
from inventario import Objeto


def visitar_tienda(personaje) -> None:
    catalogo = [
        identificador for identificador, datos in OBJETOS.items()
        if datos["tipo"] in ("consumible", "arma", "armadura")
    ]
    while True:
        print(f"\n--- Mercader ambulante | Oro: {personaje.oro} ---")
        print("1) Comprar  2) Vender  3) Volver")
        opcion = input("Opción: ").strip()
        if opcion == "3":
            return
        if opcion == "1":
            for indice, identificador in enumerate(catalogo, 1):
                datos = OBJETOS[identificador]
                print(
                    f"{indice}) {datos['nombre']} ({datos['rareza']}) "
                    f"- {datos['valor']} oro"
                )
            try:
                indice = int(input("Objeto a comprar (0 para cancelar): ")) - 1
            except ValueError:
                print("El mercader acepta números, monedas o cumplidos.")
                continue
            if indice == -1:
                continue
            if indice < 0 or indice >= len(catalogo):
                print("Ese artículo no está en el catálogo.")
                continue
            objeto = Objeto(catalogo[indice])
            if personaje.oro < objeto.valor:
                print("Te faltan monedas. El mercader no acepta promesas heroicas.")
            elif len(personaje.inventario.objetos) >= personaje.inventario.capacidad:
                print("La mochila está llena. ¡Y sin recargo por equipaje!")
            else:
                personaje.oro -= objeto.valor
                personaje.inventario.agregar(objeto)
        elif opcion == "2":
            if not personaje.inventario.objetos:
                print("No tienes nada que vender.")
                continue
            for indice, objeto in enumerate(personaje.inventario.objetos, 1):
                print(f"{indice}) {objeto.nombre} - {max(1, objeto.valor // 2)} oro")
            try:
                indice = int(input("Objeto a vender (0 para cancelar): ")) - 1
            except ValueError:
                print("Elige con un número, por favor.")
                continue
            if indice == -1:
                continue
            if indice < 0 or indice >= len(personaje.inventario.objetos):
                print("Ese objeto no existe.")
                continue
            objeto = personaje.inventario.quitar(indice)
            precio = max(1, objeto.valor // 2)
            personaje.oro += precio
            print(f"Vendes {objeto.nombre} por {precio} monedas.")
        else:
            print("Opción inválida.")
