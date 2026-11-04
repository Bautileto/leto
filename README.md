# Las Catacumbas del Casi

Aventura de rol por turnos para consola, escrita en Python 3 y sin dependencias externas.

## Interfaz web (JavaScript vanilla)

El juego también incluye una interfaz web estática en JavaScript puro. No requiere
instalaciones ni servidor de aplicación. Abre `index.html` directamente en un
navegador o, desde esta carpeta, inicia un servidor local:

```text
python -m http.server 8000
```

Luego abre `http://localhost:8000`. La interfaz web tiene su propia partida y la
guarda en el almacenamiento local del navegador; no se sincroniza con el guardado
JSON de la versión de consola.

## Ejecutar

Abre una terminal en esta carpeta y ejecuta:

```text
python main.py
```

En Windows también puedes usar `py main.py` si el comando `python` no está disponible.

## Controles

- En los menús, escribe el número de la opción y pulsa Enter.
- En combate: `1` atacar, `2` habilidad especial, `3` usar consumible,
  `4` defender y `5` intentar huir.
- En la aventura puedes explorar, revisar la mochila, visitar la tienda,
  guardar la partida o volver al menú.
- La partida se guarda como `partida.json` junto a los módulos del juego.
- Cada quinta sala aparece un jefe. ¡La puerta del ascensor está siempre rota!

## Contenido

Elige entre Guerrero, Mago y Pícaro; reparte tres puntos iniciales; explora salas
con combates, cofres, trampas, mercaderes, fuentes y sucesos misteriosos. Gana
experiencia, sube de nivel, equipa armas y armaduras y vende los objetos que ya
no te convencen.

## Ampliar el juego

- **Enemigos:** agrega una entrada a `ENEMIGOS` en `datos.py`, con `nombre`,
  `vida`, `ataque`, `defensa`, `velocidad`, `experiencia`, `oro`,
  `comportamiento` y una lista de identificadores de `botin`. Los
  comportamientos disponibles son `normal`, `rapido`, `curacion`, `veneno`,
  `ladron` y `blindaje`.
- **Jefes:** agrega entradas a `JEFES` en `datos.py`, con esos mismos campos y
  una `recompensa`. Para un patrón nuevo, añade su comportamiento en
  `Jefe.atacar` dentro de `jefes.py`.
- **Objetos:** agrega una entrada a `OBJETOS` en `datos.py`, con `nombre`,
  `tipo` (`consumible`, `arma` o `armadura`), `rareza`, `efecto`, `valor` y
  `descripcion`. Para que salga como botín, incluye su identificador en la
  lista `botin` de un enemigo o jefe.
- **Clases:** define las estadísticas, `habilidad` y `coste_habilidad` en
  `CLASES` de `datos.py`; para una mecánica de habilidad distinta, actualiza
  `_usar_habilidad` en `combate.py`.
