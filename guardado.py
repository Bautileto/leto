"""Guardado y carga de partidas con formato JSON."""

import json
from pathlib import Path

from datos import CLASES
from inventario import Inventario, Objeto
from personaje import Personaje

ARCHIVO_GUARDADO = Path(__file__).with_name("partida.json")


def guardar_partida(personaje, ruta: Path = ARCHIVO_GUARDADO) -> bool:
    datos = {
        "nombre": personaje.nombre,
        "clase": personaje.clase,
        "estadisticas_base": personaje.estadisticas_base,
        "nivel": personaje.nivel,
        "experiencia": personaje.experiencia,
        "oro": personaje.oro,
        "sala": personaje.sala,
        "combates": personaje.combates,
        "vida": personaje.vida,
        "mana": personaje.mana,
        "veneno": personaje.veneno,
        "objetos": [objeto.identificador for objeto in personaje.inventario.objetos],
        "equipo": {
            tipo: objeto.identificador if objeto else None
            for tipo, objeto in personaje.inventario.equipo.items()
        },
    }
    try:
        with ruta.open("w", encoding="utf-8") as archivo:
            json.dump(datos, archivo, ensure_ascii=False, indent=2)
    except OSError as error:
        print(f"No se pudo guardar la partida: {error}")
        return False
    print(f"Partida guardada en {ruta.name}.")
    return True


def cargar_partida(ruta: Path = ARCHIVO_GUARDADO):
    if not ruta.exists():
        print("No hay partida guardada todavía.")
        return None
    try:
        with ruta.open("r", encoding="utf-8") as archivo:
            datos = json.load(archivo)
        if datos["clase"] not in CLASES:
            raise ValueError("La clase guardada no existe.")
        personaje = Personaje(datos["nombre"], datos["clase"])
        personaje.estadisticas_base = datos["estadisticas_base"]
        personaje.nivel = max(1, int(datos["nivel"]))
        personaje.experiencia = max(0, int(datos["experiencia"]))
        personaje.oro = max(0, int(datos["oro"]))
        personaje.sala = max(0, int(datos["sala"]))
        personaje.combates = max(0, int(datos["combates"]))
        personaje.inventario = Inventario()
        personaje.inventario.objetos = [
            Objeto(identificador) for identificador in datos["objetos"]
        ][:personaje.inventario.capacidad]
        for tipo in ("arma", "armadura"):
            identificador = datos.get("equipo", {}).get(tipo)
            if identificador:
                objeto = Objeto(identificador)
                if objeto.tipo != tipo:
                    raise ValueError("El equipo guardado no coincide con su espacio.")
                personaje.inventario.equipo[tipo] = objeto
        personaje.recalcular_estadisticas()
        personaje.vida = max(0, min(personaje.vida_maxima, int(datos["vida"])))
        personaje.mana = max(0, min(personaje.mana_maximo, int(datos["mana"])))
        personaje.veneno = max(0, int(datos.get("veneno", 0)))
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        print(f"No se pudo cargar la partida: {error}")
        return None
    print(f"¡Partida de {personaje.nombre} cargada!")
    return personaje
