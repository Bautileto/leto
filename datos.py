"""Catálogo editable de clases, criaturas, jefes y objetos."""

CLASES = {
    "Guerrero": {
        "vida_maxima": 38, "mana_maximo": 8, "ataque": 9,
        "defensa": 6, "velocidad": 4,
        "habilidad": "Golpe demoledor", "coste_habilidad": 4,
    },
    "Mago": {
        "vida_maxima": 25, "mana_maximo": 22, "ataque": 7,
        "defensa": 3, "velocidad": 6,
        "habilidad": "Lluvia de chispas", "coste_habilidad": 6,
    },
    "Pícaro": {
        "vida_maxima": 30, "mana_maximo": 12, "ataque": 8,
        "defensa": 4, "velocidad": 9,
        "habilidad": "Doble puñalada", "coste_habilidad": 5,
    },
}

ENEMIGOS = [
    {
        "nombre": "Rata con complejo de dragón", "vida": 18, "ataque": 5,
        "defensa": 1, "velocidad": 7, "experiencia": 12, "oro": 7,
        "comportamiento": "rapido", "botin": ["pocion", "bomba"],
    },
    {
        "nombre": "Esqueleto distraído", "vida": 24, "ataque": 7,
        "defensa": 3, "velocidad": 4, "experiencia": 16, "oro": 9,
        "comportamiento": "normal", "botin": ["pocion", "espada_hierro"],
    },
    {
        "nombre": "Baba pegajosa", "vida": 30, "ataque": 6,
        "defensa": 2, "velocidad": 2, "experiencia": 18, "oro": 8,
        "comportamiento": "curacion", "botin": ["pocion", "armadura_cuero"],
    },
    {
        "nombre": "Murciélago venenoso", "vida": 21, "ataque": 6,
        "defensa": 1, "velocidad": 10, "experiencia": 17, "oro": 10,
        "comportamiento": "veneno", "botin": ["antidoto", "pocion"],
    },
    {
        "nombre": "Goblin cobrador", "vida": 27, "ataque": 8,
        "defensa": 2, "velocidad": 6, "experiencia": 20, "oro": 14,
        "comportamiento": "ladron", "botin": ["pocion", "daga_sombra"],
    },
    {
        "nombre": "Caballero sin turno", "vida": 34, "ataque": 9,
        "defensa": 5, "velocidad": 3, "experiencia": 24, "oro": 13,
        "comportamiento": "blindaje", "botin": ["pocion", "escudo_roble"],
    },
]

JEFES = [
    {
        "nombre": "Doña Calavera, gerente del piso", "vida": 92,
        "ataque": 11, "defensa": 5, "velocidad": 5,
        "experiencia": 75, "oro": 55, "comportamiento": "calavera",
        "botin": ["espada_rara", "pocion_grande"],
        "recompensa": "Llave dorada de la gerencia",
    },
    {
        "nombre": "El Dragón de Oferta", "vida": 115,
        "ataque": 13, "defensa": 6, "velocidad": 6,
        "experiencia": 95, "oro": 75, "comportamiento": "dragon",
        "botin": ["baston_epico", "armadura_epica"],
        "recompensa": "Escama de descuento legendario",
    },
    {
        "nombre": "La Bruja del Último Piso", "vida": 130,
        "ataque": 14, "defensa": 7, "velocidad": 8,
        "experiencia": 120, "oro": 100, "comportamiento": "bruja",
        "botin": ["daga_epica", "pocion_grande"],
        "recompensa": "Sombrero que sabe demasiado",
    },
]

OBJETOS = {
    "pocion": {
        "nombre": "Poción pequeña", "tipo": "consumible", "rareza": "común",
        "efecto": {"vida": 18}, "valor": 12, "descripcion": "Recupera 18 de vida.",
    },
    "pocion_grande": {
        "nombre": "Poción de bolsillo gigante", "tipo": "consumible",
        "rareza": "raro", "efecto": {"vida": 38}, "valor": 30,
        "descripcion": "Recupera 38 de vida.",
    },
    "mana": {
        "nombre": "Tónico de maná", "tipo": "consumible", "rareza": "común",
        "efecto": {"mana": 12}, "valor": 14, "descripcion": "Recupera 12 de maná.",
    },
    "antidoto": {
        "nombre": "Antídoto de emergencia", "tipo": "consumible",
        "rareza": "común", "efecto": {"limpiar": 1, "vida": 4},
        "valor": 10, "descripcion": "Elimina el veneno y recupera 4 de vida.",
    },
    "bomba": {
        "nombre": "Bomba bastante legal", "tipo": "consumible",
        "rareza": "raro", "efecto": {"danio": 22}, "valor": 24,
        "descripcion": "Inflige 22 de daño al enemigo.",
    },
    "espada_hierro": {
        "nombre": "Espada de hierro", "tipo": "arma", "rareza": "común",
        "efecto": {"ataque": 3}, "valor": 28, "descripcion": "+3 de ataque.",
    },
    "daga_sombra": {
        "nombre": "Daga de sombra", "tipo": "arma", "rareza": "raro",
        "efecto": {"ataque": 4, "velocidad": 2}, "valor": 52,
        "descripcion": "+4 de ataque y +2 de velocidad.",
    },
    "espada_rara": {
        "nombre": "Mandoble de recursos humanos", "tipo": "arma",
        "rareza": "épico", "efecto": {"ataque": 7}, "valor": 90,
        "descripcion": "+7 de ataque.",
    },
    "baston_epico": {
        "nombre": "Bastón de tormenta", "tipo": "arma", "rareza": "épico",
        "efecto": {"ataque": 5, "mana_maximo": 8}, "valor": 105,
        "descripcion": "+5 de ataque y +8 de maná máximo.",
    },
    "daga_epica": {
        "nombre": "Daga del turno extra", "tipo": "arma",
        "rareza": "épico", "efecto": {"ataque": 6, "velocidad": 4},
        "valor": 110, "descripcion": "+6 de ataque y +4 de velocidad.",
    },
    "armadura_cuero": {
        "nombre": "Chaleco de cuero", "tipo": "armadura", "rareza": "común",
        "efecto": {"defensa": 2}, "valor": 28, "descripcion": "+2 de defensa.",
    },
    "escudo_roble": {
        "nombre": "Escudo de roble", "tipo": "armadura", "rareza": "raro",
        "efecto": {"defensa": 4, "vida_maxima": 8}, "valor": 58,
        "descripcion": "+4 de defensa y +8 de vida máxima.",
    },
    "armadura_epica": {
        "nombre": "Armadura de dragón en rebajas", "tipo": "armadura",
        "rareza": "épico", "efecto": {"defensa": 6, "vida_maxima": 16},
        "valor": 115, "descripcion": "+6 de defensa y +16 de vida máxima.",
    },
}
