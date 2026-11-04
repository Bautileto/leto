/* Interfaz y reglas de la aventura para el navegador, sin dependencias. */
(() => {
  "use strict";

  const clavePartida = "catacumbas-del-casi-partida";
  const raiz = document.querySelector("#aplicacion");
  const estado = {
    pantalla: "portada",
    vista: "aventura",
    vistaAnterior: "aventura",
    personaje: null,
    enemigo: null,
    evento: null,
    claseSeleccionada: "Guerrero",
    puntos: 3,
    reparto: {},
    nombreBorrador: "",
    registro: []
  };

  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, caracter => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caracter]);
  }

  function aleatorio(minimo, maximo) {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  }

  function anotar(texto) {
    estado.registro.unshift(texto);
    estado.registro = estado.registro.slice(0, 7);
  }

  function renderizar() {
    if (estado.pantalla === "portada") renderizarPortada();
    else if (estado.pantalla === "creacion") renderizarCreacion();
    else if (estado.pantalla === "fin") renderizarFin();
    else renderizarJuego();
  }

  function renderizarPortada() {
    let hayPartida = false;
    try {
      hayPartida = Boolean(localStorage.getItem(clavePartida));
    } catch (error) {
      hayPartida = false;
    }
    raiz.innerHTML = `
      <section class="portada">
        <div>
          <div class="etiqueta">✳ &nbsp; ROL POR TURNOS · UNA AVENTURA CASI ÉPICA</div>
          <h1>Un pie en la mazmorra.<br><em>El otro, quién sabe.</em></h1>
          <p class="texto-intro">Seis clases de problemas, tres jefes con asuntos pendientes y un mercader que no hace preguntas. Las catacumbas te esperan. Casi con entusiasmo.</p>
          <div class="acciones-portada">
            <button class="boton" data-accion="nueva">Comenzar aventura <span aria-hidden="true">→</span></button>
            ${hayPartida ? '<button class="boton boton-secundario" data-accion="cargar">Continuar partida</button>' : ""}
          </div>
          <p class="micro" style="margin-top:22px">SIN INSTALACIONES &nbsp;·&nbsp; GUARDADO EN ESTE NAVEGADOR</p>
        </div>
        <div class="ilustracion" role="img" aria-label="Portal mágico a las catacumbas">
          <div class="portal" aria-hidden="true">⌘</div>
          <div class="sello">PELIGRO: CASI GARANTIZADO</div>
        </div>
      </section>`;
  }

  function renderizarCreacion() {
    const clases = DATOS_JUEGO.clases;
    const datosClase = { ...clases[estado.claseSeleccionada] };
    for (const [atributo, cantidad] of Object.entries(estado.reparto)) {
      datosClase[atributo] += cantidad;
    }
    const atributos = [
      ["vidaMaxima", "Vida máxima", 5],
      ["manaMaximo", "Maná máximo", 3],
      ["ataque", "Ataque", 1],
      ["defensa", "Defensa", 1],
      ["velocidad", "Velocidad", 1]
    ];
    raiz.innerHTML = `
      <div class="pantalla-titulo">
        <div class="etiqueta">PASO 01 · PREPARA TU DESTINO</div>
        <h1 class="titulo-pagina">Tu leyenda empieza aquí.</h1>
        <p class="subtitulo">No hace falta que sea una leyenda especialmente larga.</p>
      </div>
      <section class="panel formulario">
        <label class="campo-nombre" for="nombre-personaje">Nombre del aventurero
          <input id="nombre-personaje" maxlength="24" autocomplete="off" placeholder="Ej. Patricio el Cauteloso" value="${escapar(estado.nombreBorrador)}">
        </label>
        <div class="etiqueta" style="margin-bottom:10px">ELIGE TU CLASE</div>
        <div class="rejilla-clases">
          ${Object.entries(clases).map(([nombre, datos]) => `
            <button class="tarjeta-clase ${nombre === estado.claseSeleccionada ? "seleccionada" : ""}" data-accion="clase" data-clase="${escapar(nombre)}" aria-pressed="${nombre === estado.claseSeleccionada}">
              <span class="clase-icono" aria-hidden="true">${datos.icono}</span>
              <h3>${escapar(nombre)}</h3>
              <p>${escapar(datos.descripcion)}</p>
              <div class="mini-estadisticas">
                <span>♥ ${datos.vidaMaxima} vida</span><span>✧ ${datos.manaMaximo} maná</span>
                <span>⚔ ${datos.ataque} ataque</span><span>⬡ ${datos.defensa} defensa</span>
              </div>
            </button>`).join("")}
        </div>
        <div class="bloque-atributos">
          <div class="encabezado-atributos"><strong>Reparte atributos extra</strong><span class="contador-puntos">✳ ${estado.puntos} PUNTOS</span></div>
          ${atributos.map(([clave, titulo, aumento]) => `
            <div class="fila-atributo">
              <span>${titulo}</span>
              <span class="controles-atributo">
                <button class="boton boton-secundario boton-pequeno" data-accion="atributo" data-atributo="${clave}" aria-label="Aumentar ${titulo}" ${estado.puntos === 0 ? "disabled" : ""}>+${aumento}</button>
              </span>
              <span class="contador-atributo">${datosClase[clave]}</span>
            </div>`).join("")}
        </div>
        <div class="aviso">Tu habilidad especial será <strong>${escapar(datosClase.habilidad)}</strong>. El seguro de vida no está incluido.</div>
        <div class="pie-formulario">
          <button class="boton boton-secundario" data-accion="portada">Volver</button>
          <button class="boton" data-accion="crear" ${estado.puntos ? "disabled" : ""}>Entrar en las catacumbas →</button>
        </div>
      </section>`;
  }

  function renderizarJuego() {
    const p = estado.personaje;
    if (!p) {
      estado.pantalla = "portada";
      renderizarPortada();
      return;
    }
    const esCombate = estado.vista === "combate" && estado.enemigo;
    raiz.innerHTML = `
      <div class="barra-aventura">
        <div class="marca-aventura"><span>✦</span> SALA ${p.sala || 0} <span class="micro">/</span> NIVEL ${p.nivel}</div>
        <div class="acciones-rapidas">
          <button class="boton boton-secundario boton-pequeno" data-accion="inventario">Mochila</button>
          <button class="boton boton-secundario boton-pequeno" data-accion="tienda" ${esCombate ? "disabled title=\"Termina el combate antes de comerciar\"" : ""}>Mercader</button>
          <button class="boton boton-secundario boton-pequeno" data-accion="guardar">Guardar</button>
        </div>
      </div>
      <div class="rejilla-juego">
        <section class="columna-central">
          ${estado.vista === "inventario" ? renderizarInventario() :
            estado.vista === "tienda" ? renderizarTienda() :
            renderizarSala(esCombate)}
        </section>
        <aside class="panel panel-personaje">
          ${renderizarPanelPersonaje()}
        </aside>
      </div>`;
  }

  function renderizarSala(esCombate) {
    const p = estado.personaje;
    const enemigo = estado.enemigo;
    const titulo = esCombate ? enemigo.nombre : (estado.evento?.titulo || "Las catacumbas aguardan");
    const descripcion = esCombate
      ? enemigo.esJefe
        ? `¡${escapar(enemigo.nombre)} bloquea el pasillo! ${enemigo.fase === 2 ? "Está en fase dos. La cosa se ha puesto administrativa." : "El aire vibra con una amenaza de jefe."}`
        : `Un ${escapar(enemigo.nombre)} te corta el paso. La diplomacia no parece ser su estadística más alta.`
      : (estado.evento?.descripcion || "Un pasillo húmedo se pierde entre sombras. Alguien ha dejado una flecha que apunta hacia abajo.");
    const colorJefe = esCombate && enemigo.esJefe ? "toque-jefe" : "";

    return `
      <article class="panel tarjeta-sala">
        <div class="encabezado-sala">
          <span class="micro">${esCombate ? (enemigo.esJefe ? "⚠ ENCUENTRO DE JEFE" : "ENCUENTRO HOSTIL") : (estado.evento?.etiqueta || "EXPLORACIÓN")}</span>
          <span class="micro">✦ ${p.sala} ${p.sala === 1 ? "SALA" : "SALAS"}</span>
        </div>
        <div class="texto-sala">
          <h2 class="${colorJefe}">${titulo}</h2>
          <p>${descripcion}</p>
          ${esCombate ? renderizarBarrasEnemigo(enemigo) : ""}
          ${esCombate ? renderizarAccionesCombate() : renderizarAccionesEvento()}
        </div>
      </article>
      <section class="registro" aria-label="Registro de aventura">
        <h3>REGISTRO DE AVENTURA</h3>
        ${estado.registro.length
          ? estado.registro.map(linea => `<p class="entrada-registro">${escapar(linea)}</p>`).join("")
          : '<p class="entrada-registro">Todo en calma. Sospechosamente en calma.</p>'}
      </section>`;
  }

  function renderizarBarrasEnemigo(enemigo) {
    const porcentaje = Math.max(0, Math.min(100, enemigo.vida / enemigo.vidaMaxima * 100));
    return `<div class="enemigo-datos">
      <div class="fila-barra"><span>${enemigo.esJefe ? "JEFE · FASE " + enemigo.fase : "ENEMIGO"}</span><span>${enemigo.vida} / ${enemigo.vidaMaxima} PV</span></div>
      <div class="barra-vida"><span style="width:${porcentaje}%"></span></div>
    </div>`;
  }

  function renderizarAccionesCombate() {
    const objetos = estado.personaje.inventario
      .map((id, indice) => ({ id, indice, datos: DATOS_JUEGO.objetos[id] }))
      .filter(objeto => objeto.datos && objeto.datos.tipo === "consumible");
    const datosClase = DATOS_JUEGO.clases[estado.personaje.clase];
    return `<div class="acciones-combate">
      <button class="boton" data-accion="atacar">⚔ Atacar</button>
      <button class="boton boton-secundario" data-accion="habilidad" ${estado.personaje.mana < datosClase.costeHabilidad ? "disabled" : ""}>✧ ${escapar(datosClase.habilidad)} · ${datosClase.costeHabilidad} PM</button>
      ${objetos.length ? objetos.map(objeto => `<button class="boton boton-secundario" data-accion="usar" data-indice="${objeto.indice}">▣ ${escapar(objeto.datos.nombre)}</button>`).join("") : ""}
      <button class="boton boton-secundario" data-accion="defender">⬡ Defender</button>
      <button class="boton boton-peligro" data-accion="huir">↗ Huir</button>
    </div>`;
  }

  function renderizarAccionesEvento() {
    const p = estado.personaje;
    if (!estado.evento) {
      return `<div class="acciones-evento"><button class="boton" data-accion="explorar">Explorar siguiente sala →</button></div>`;
    }
    if (estado.evento.tipo === "mercader") {
      return `<div class="acciones-evento">
        <button class="boton" data-accion="tienda">Ver mercancía →</button>
        <button class="boton boton-secundario" data-accion="continuar">Seguir explorando</button>
      </div>`;
    }
    if (estado.evento.tipo === "combate" && estado.evento.huyo) {
      return `<div class="acciones-evento"><button class="boton" data-accion="explorar">Explorar siguiente sala →</button></div>`;
    }
    return `<div class="acciones-evento"><button class="boton" data-accion="explorar">Explorar siguiente sala →</button></div>`;
  }

  function renderizarPanelPersonaje() {
    const p = estado.personaje;
    const stats = estadisticasActuales();
    const datosClase = DATOS_JUEGO.clases[p.clase];
    const porcentajeVida = Math.max(0, Math.min(100, p.vida / stats.vidaMaxima * 100));
    const porcentajeMana = stats.manaMaximo ? Math.max(0, Math.min(100, p.mana / stats.manaMaximo * 100)) : 0;
    const inventarioVisible = p.inventario.slice(0, 4);
    return `
      <div class="encabezado-personaje">
        <div class="avatar" aria-hidden="true">${datosClase.icono}</div>
        <div><h2 class="nombre-personaje">${escapar(p.nombre)}</h2><span class="clase-personaje">${escapar(p.clase)}</span></div>
        <span class="nivel-personaje">NV ${p.nivel}</span>
      </div>
      <div class="bloque-barras">
        <div class="fila-barra"><span>VIDA</span><span>${p.vida} / ${stats.vidaMaxima}</span></div>
        <div class="barra-vida jugador"><span style="width:${porcentajeVida}%"></span></div>
        <div class="fila-barra" style="margin-top:10px"><span>MANÁ</span><span>${p.mana} / ${stats.manaMaximo}</span></div>
        <div class="barra-vida mana"><span style="width:${porcentajeMana}%"></span></div>
        <div class="micro" style="margin-top:8px">EXP ${p.experiencia} / ${p.nivel * 40}</div>
      </div>
      <div class="estadisticas-grid">
        ${[["ATAQUE", stats.ataque], ["DEFENSA", stats.defensa], ["VELOCIDAD", stats.velocidad], ["VENENO", p.veneno ? p.veneno + " turnos" : "No"]]
          .map(([titulo, valor]) => `<div><span class="estadistica-etiqueta">${titulo}</span><span class="estadistica-valor">${valor}</span></div>`).join("")}
      </div>
      <div class="oro-personaje"><span>Monedas encontradas</span><strong>◈ ${p.oro}</strong></div>
      <div class="seccion-equipo">
        <h3 class="seccion-titulo">EQUIPO</h3>
        ${["arma", "armadura"].map(tipo => {
          const objeto = p.equipo[tipo];
          return `<div class="ranura-equipo"><span>${tipo === "arma" ? "⚔ Arma" : "⬡ Armadura"}</span>
            ${objeto ? `<button data-accion="desequipar" data-tipo="${tipo}" title="Desequipar">${escapar(DATOS_JUEGO.objetos[objeto].nombre)} ×</button>` : "<span>Vacío</span>"}
          </div>`;
        }).join("")}
      </div>
      <div class="resumen-mochila">
        <h3 class="seccion-titulo">MOCHILA · ${p.inventario.length}/12</h3>
        ${inventarioVisible.length ? `<ul>${inventarioVisible.map(id => {
          const objeto = DATOS_JUEGO.objetos[id];
          return `<li><span>${escapar(objeto?.nombre || "Objeto desconocido")}</span><span class="rareza ${objeto?.rareza || ""}">${escapar(objeto?.rareza || "")}</span></li>`;
        }).join("")}</ul>${p.inventario.length > 4 ? `<p class="micro">+ ${p.inventario.length - 4} objetos más</p>` : ""}` : '<p class="micro">Vacía, pero llena de posibilidades.</p>'}
      </div>
      <div class="acciones-panel">
        <button class="boton boton-secundario boton-pequeno" data-accion="inventario">Ver mochila completa</button>
        <button class="boton boton-secundario boton-pequeno" data-accion="tienda" ${estado.vista === "combate" ? "disabled title=\"Termina el combate antes de comerciar\"" : ""}>Visitar mercader</button>
        <button class="boton boton-secundario boton-pequeno" data-accion="guardar">Guardar partida</button>
      </div>`;
  }

  function renderizarInventario() {
    const p = estado.personaje;
    const objetos = p.inventario;
    return `<section class="zona-listas">
      <div class="etiqueta">TUS COSAS, TODAS JUNTAS</div>
      <h2 class="titulo-pagina">Mochila <span class="micro">${objetos.length}/12</span></h2>
      <p class="subtitulo" style="margin-bottom:22px">Equipar un objeto reemplaza el del mismo tipo. Desequípalo desde la ficha.</p>
      ${objetos.length ? `<div class="rejilla-objetos">${objetos.map((id, indice) => {
        const objeto = DATOS_JUEGO.objetos[id];
        if (!objeto) return "";
        const esEquipo = objeto.tipo === "arma" || objeto.tipo === "armadura";
        const textoBoton = esEquipo ? "Equipar" : "Usar";
        return `<article class="tarjeta-objeto">
          <div><h3>${escapar(objeto.nombre)} <span class="rareza ${objeto.rareza}">${escapar(objeto.rareza)}</span></h3><p>${escapar(objeto.descripcion)}</p></div>
          <button class="boton boton-secundario boton-pequeno" data-accion="${esEquipo ? "equipar" : "usar-mochila"}" data-indice="${indice}">${textoBoton}</button>
        </article>`;
      }).join("")}</div>` : '<div class="texto-vacio">Tu mochila está más vacía que una taberna un lunes.</div>'}
      <div class="acciones-evento"><button class="boton boton-secundario" data-accion="volver">← Volver a la aventura</button></div>
    </section>`;
  }

  function renderizarTienda() {
    const p = estado.personaje;
    const catalogo = Object.entries(DATOS_JUEGO.objetos);
    return `<section class="zona-listas">
      <div class="etiqueta">CAMBIO JUSTO, HISTORIAS DUDOSAS</div>
      <h2 class="titulo-pagina">El mercader ambulante</h2>
      <p class="subtitulo" style="margin-bottom:18px">Tu bolsa: <strong style="color:var(--oro)">◈ ${p.oro} monedas</strong>. No se fía, pero acepta efectivo.</p>
      <div class="rejilla-objetos">${catalogo.map(([id, objeto]) => {
        const tieneEspacio = p.inventario.length < 12;
        return `<article class="tarjeta-objeto">
          <div><h3>${escapar(objeto.nombre)} <span class="rareza ${objeto.rareza}">${escapar(objeto.rareza)}</span></h3><p>${escapar(objeto.descripcion)}</p></div>
          <button class="boton boton-secundario boton-pequeno" data-accion="comprar" data-id="${id}" ${p.oro < objeto.valor || !tieneEspacio ? "disabled" : ""}>◈ ${objeto.valor}</button>
        </article>`;
      }).join("")}</div>
      <h3 class="seccion-titulo" style="margin-top:26px">VENDER · LA MITAD DEL PRECIO</h3>
      ${p.inventario.length ? `<div class="rejilla-objetos">${p.inventario.map((id, indice) => {
        const objeto = DATOS_JUEGO.objetos[id];
        return objeto ? `<article class="tarjeta-objeto"><div><h3>${escapar(objeto.nombre)}</h3><p>${escapar(objeto.descripcion)}</p></div><button class="boton boton-secundario boton-pequeno" data-accion="vender" data-indice="${indice}">+ ◈ ${Math.max(1, Math.floor(objeto.valor / 2))}</button></article>` : "";
      }).join("")}</div>` : '<p class="micro">No tienes nada que vender. El mercader respeta tu privacidad.</p>'}
      <div class="acciones-evento"><button class="boton boton-secundario" data-accion="volver">← Volver a la aventura</button></div>
    </section>`;
  }

  function renderizarFin() {
    const p = estado.personaje;
    raiz.innerHTML = `<section class="panel pantalla-final">
      <div class="icono-final">✦</div>
      <div class="etiqueta">FIN DE LA EXPEDICIÓN</div>
      <h1>Las catacumbas ganan... esta vez.</h1>
      <p>${escapar(p.nombre)} llegó al nivel ${p.nivel} y exploró ${p.sala} salas. Las ratas preparan una ceremonia sencilla. No hay presupuesto.</p>
      <div class="acciones-portada" style="justify-content:center">
        <button class="boton" data-accion="nueva">Intentarlo otra vez</button>
        <button class="boton boton-secundario" data-accion="portada">Volver al inicio</button>
      </div>
    </section>`;
  }

  function crearPersonaje() {
    const nombre = (document.querySelector("#nombre-personaje")?.value || estado.nombreBorrador).trim();
    if (!nombre) {
      mostrarAviso("Escribe un nombre antes de entrar. Hasta las catacumbas necesitan saber a quién perseguir.");
      return;
    }
    const base = { ...DATOS_JUEGO.clases[estado.claseSeleccionada] };
    for (const [atributo, cantidad] of Object.entries(estado.reparto)) {
      base[atributo] += cantidad;
    }
    delete base.habilidad;
    delete base.costeHabilidad;
    delete base.icono;
    delete base.descripcion;
    estado.personaje = {
      nombre: nombre.slice(0, 24), clase: estado.claseSeleccionada,
      base, nivel: 1, experiencia: 0, oro: 25, sala: 0, combates: 0,
      vida: base.vidaMaxima, mana: base.manaMaximo, veneno: 0,
      inventario: ["pocion", "mana"], equipo: { arma: null, armadura: null }
    };
    estado.registro = ["La aventura comienza. Las probabilidades de supervivencia son técnicamente distintas de cero."];
    estado.evento = null;
    estado.enemigo = null;
    estado.vista = "aventura";
    estado.pantalla = "juego";
    anotar(`${nombre} el ${estado.personaje.clase} entra en las catacumbas.`);
    renderizar();
  }

  function estadisticasActuales() {
    const p = estado.personaje;
    const total = { ...p.base };
    for (const id of Object.values(p.equipo)) {
      if (!id) continue;
      const efecto = DATOS_JUEGO.objetos[id].efecto;
      for (const [atributo, cantidad] of Object.entries(efecto)) {
        const destino = {
          vida: "vidaMaxima", mana: "manaMaximo",
          vidaMaxima: "vidaMaxima", manaMaximo: "manaMaximo"
        }[atributo] || atributo;
        if (destino in total) total[destino] += cantidad;
      }
    }
    return total;
  }

  function actualizarEquipo() {
    const p = estado.personaje;
    const maximosAnteriores = estadisticasActuales();
    p.vida = Math.min(maximosAnteriores.vidaMaxima, p.vida);
    p.mana = Math.min(maximosAnteriores.manaMaximo, p.mana);
  }

  function explorar() {
    const p = estado.personaje;
    p.sala += 1;
    estado.vista = "aventura";
    estado.evento = null;
    if (p.sala % 5 === 0) {
      const numero = (Math.floor(p.sala / 5) - 1) % DATOS_JUEGO.jefes.length;
      iniciarCombate(DATOS_JUEGO.jefes[numero], true);
      return;
    }
    const tirada = Math.random() * 100;
    if (tirada < 35) {
      const datos = DATOS_JUEGO.enemigos[aleatorio(0, DATOS_JUEGO.enemigos.length - 1)];
      iniciarCombate(datos, false);
    } else if (tirada < 53) {
      const oro = aleatorio(8, 24) + p.sala;
      p.oro += oro;
      let texto = `Encuentras ${oro} monedas en un cofre con una nota: «no mires el fondo».`;
      if (Math.random() < 0.65) {
        const id = ["pocion", "mana", "antidoto", "espada_hierro", "armadura_cuero"][aleatorio(0, 4)];
        recogerObjeto(id);
        texto += ` También hay ${DATOS_JUEGO.objetos[id].nombre}.`;
      }
      finalizarEvento("cofre", "Una caja sospechosamente intacta", texto, "BOTÍN");
    } else if (tirada < 65) {
      if (Math.random() < 0.3) {
        const stats = estadisticasActuales();
        const danio = Math.max(1, 8 + p.sala - stats.velocidad);
        p.vida = Math.max(0, p.vida - danio);
        finalizarEvento("trampa", "La baldosa traicionera", `¡Trampa! Una baldosa te causa ${danio} de daño. Los arquitectos se ríen desde lejos.`, "TRAMPA");
      } else {
        finalizarEvento("trampa", "Una trampa bastante obvia", "Esquivas una baldosa floja. Tus tobillos agradecen el entrenamiento.", "TRAMPA");
      }
    } else if (tirada < 75) {
      finalizarEvento("mercader", "Un mercader entre las sombras", "Lleva cambio, vendas y cero explicaciones. Dice que el puesto es temporal desde hace seis años.", "ENCUENTRO");
    } else if (tirada < 87) {
      const vida = Math.min(14, estadisticasActuales().vidaMaxima - p.vida);
      const mana = Math.min(8, estadisticasActuales().manaMaximo - p.mana);
      p.vida += vida;
      p.mana += mana;
      p.veneno = 0;
      finalizarEvento("fuente", "Una fuente de aguas brillantes", `Recuperas ${vida} de vida y ${mana} de maná. También desaparece cualquier veneno.`, "DESCANSO");
    } else {
      const misterio = aleatorio(0, 2);
      if (misterio === 0) {
        p.vida = Math.min(estadisticasActuales().vidaMaxima, p.vida + 10);
        p.mana = Math.min(estadisticasActuales().manaMaximo, p.mana + 5);
        finalizarEvento("misterio", "Una voz detrás de la pared", "Una presencia misteriosa te bendice. O te hace cosquillas en el alma. +10 vida, +5 maná.", "MISTERIO");
      } else if (misterio === 1) {
        p.oro += 20;
        finalizarEvento("misterio", "Algo cae desde el techo", "Una bolsa de monedas cae del techo. El techo parece arrepentido. +20 oro.", "MISTERIO");
      } else {
        p.vida = Math.max(1, p.vida - 5);
        finalizarEvento("misterio", "Una pluma levita en el pasillo", "Te hace cosquillas... con el extremo afilado. -5 vida. El misterio sigue sin resolverse.", "MISTERIO");
      }
    }
    if (p.vida <= 0) terminarAventura();
    else renderizar();
  }

  function finalizarEvento(tipo, titulo, descripcion, etiqueta) {
    estado.evento = { tipo, titulo, descripcion, etiqueta };
    anotar(descripcion);
  }

  function iniciarCombate(datos, esJefe) {
    const p = estado.personaje;
    const escala = Math.max(0, p.nivel - 1);
    const factor = 1 + escala * (esJefe ? 0.12 : 0.09);
    estado.enemigo = {
      nombre: datos.nombre,
      vidaMaxima: Math.floor(datos.vida * factor),
      vida: Math.floor(datos.vida * factor),
      ataque: Math.floor(datos.ataque + escala * 1.2),
      defensa: datos.defensa + Math.floor(escala / 3),
      velocidad: datos.velocidad + Math.floor(escala / 4),
      experiencia: Math.floor(datos.experiencia * factor),
      oro: Math.floor(datos.oro * factor),
      comportamiento: datos.comportamiento,
      botin: [...datos.botin],
      esJefe,
      fase: 1,
      recompensa: datos.recompensa
    };
    estado.vista = "combate";
    estado.evento = null;
    p.combates += 1;
    anotar(`¡Aparece ${datos.nombre}! Conversar tampoco era una opción.`);
    renderizar();
  }

  function atacar() {
    const p = estado.personaje;
    const enemigo = estado.enemigo;
    const stats = estadisticasActuales();
    if (Math.random() < Math.max(0.03, enemigo.velocidad * 0.012)) {
      anotar(`${enemigo.nombre} esquiva tu ataque.`);
      turnoEnemigo();
      return;
    }
    const critico = Math.random() < Math.min(0.35, 0.08 + stats.velocidad * 0.015);
    let danio = Math.max(1, stats.ataque + aleatorio(-2, 3) - enemigo.defensa);
    if (critico) {
      danio *= 2;
      anotar("¡Golpe crítico!");
    }
    enemigo.vida = Math.max(0, enemigo.vida - danio);
    anotar(`Infliges ${danio} de daño a ${enemigo.nombre}.`);
    resolverTurno();
  }

  function usarHabilidad() {
    const p = estado.personaje;
    const enemigo = estado.enemigo;
    const habilidad = DATOS_JUEGO.clases[p.clase];
    if (p.mana < habilidad.costeHabilidad) {
      anotar("No tienes maná suficiente. El hechizo acepta disculpas, pero no las convierte en energía.");
      renderizar();
      return;
    }
    p.mana -= habilidad.costeHabilidad;
    const ataque = estadisticasActuales().ataque;
    let danio;
    if (p.clase === "Guerrero") danio = Math.max(1, ataque * 2 + aleatorio(0, 4) - enemigo.defensa);
    else if (p.clase === "Mago") danio = Math.max(1, ataque + aleatorio(10, 16) - Math.floor(enemigo.defensa / 2));
    else {
      danio = Math.max(1, ataque + aleatorio(2, 6) - enemigo.defensa) + Math.max(1, Math.floor(ataque / 2));
      p.vida = Math.min(estadisticasActuales().vidaMaxima, p.vida + 3);
      anotar("Recuperas 3 de vida con tu ágil retirada.");
    }
    enemigo.vida = Math.max(0, enemigo.vida - danio);
    anotar(`${habilidad.habilidad}: causas ${danio} de daño.`);
    resolverTurno();
  }

  function defender() {
    anotar("Te preparas para defenderte. ¡Una decisión sensata, qué raro!");
    turnoEnemigo(true);
    comprobarEstado();
  }

  function intentarHuir() {
    const stats = estadisticasActuales();
    const posibilidad = Math.min(0.85, Math.max(0.15, 0.35 + (stats.velocidad - estado.enemigo.velocidad) * 0.05));
    if (Math.random() < posibilidad) {
      anotar("¡Logras huir! La dignidad queda atrás, pero está bien.");
      estado.enemigo = null;
      estado.vista = "aventura";
      estado.evento = { tipo: "combate", huyo: true, titulo: "Una retirada estratégica", descripcion: "Escapaste por los pelos. Los pelos también quieren descansar.", etiqueta: "ESCAPASTE" };
      renderizar();
    } else {
      anotar("No consigues escapar.");
      turnoEnemigo();
      comprobarEstado();
    }
  }

  function resolverTurno() {
    if (estado.enemigo.vida <= 0) derrotarEnemigo();
    else {
      turnoEnemigo();
      comprobarEstado();
    }
  }

  function turnoEnemigo(defendiendo = false) {
    const enemigo = estado.enemigo;
    const p = estado.personaje;
    if (!enemigo || enemigo.vida <= 0) return;
    if (enemigo.comportamiento === "curacion" && enemigo.vida < enemigo.vidaMaxima * 0.55) {
      const cura = Math.min(8, enemigo.vidaMaxima - enemigo.vida);
      enemigo.vida += cura;
      anotar(`${enemigo.nombre} se recompone y recupera ${cura} de vida.`);
      return;
    }
    if (enemigo.comportamiento === "blindaje" && Math.random() < 0.25) {
      anotar(`${enemigo.nombre} levanta su escudo. Parece una reunión eterna.`);
      return;
    }
    if (enemigo.esJefe && enemigo.vida <= enemigo.vidaMaxima / 2 && enemigo.fase === 1) {
      enemigo.fase = 2;
      anotar(`¡${enemigo.nombre} entra en fase 2! La música se pone cara.`);
    }
    if (enemigo.esJefe && enemigo.fase === 2 && enemigo.comportamiento === "bruja") {
      const cura = Math.min(10, enemigo.vidaMaxima - enemigo.vida);
      if (cura) {
        enemigo.vida += cura;
        anotar(`La bruja se cura ${cura} puntos. ¡Eso no estaba en el contrato!`);
      }
    }
    const stats = estadisticasActuales();
    if (Math.random() < Math.max(0.04, stats.velocidad * 0.012)) {
      anotar(`¡Esquivas el ataque de ${enemigo.nombre}!`);
      aplicarVeneno();
      return;
    }
    let multiplicador = enemigo.comportamiento === "rapido" ? 1.35 : 1;
    if (enemigo.esJefe && enemigo.fase === 2) multiplicador *= 1.35;
    let danio = Math.max(1, Math.floor(enemigo.ataque * multiplicador) + aleatorio(-2, 3) - stats.defensa);
    if (enemigo.esJefe && enemigo.fase === 2 && enemigo.comportamiento === "dragon") {
      danio = Math.max(1, enemigo.ataque + 4 - stats.defensa);
      anotar("El dragón lanza una llamarada de oferta.");
    }
    if (enemigo.esJefe && enemigo.fase === 2 && enemigo.comportamiento === "calavera" && Math.random() < 0.4) {
      danio = Math.max(1, enemigo.ataque + 5 - stats.defensa);
      anotar("Doña Calavera firma una orden ejecutiva.");
    }
    if (defendiendo) danio = Math.max(1, Math.floor(danio / 2));
    p.vida = Math.max(0, p.vida - danio);
    anotar(`${enemigo.nombre} te causa ${danio} de daño.`);
    if ((enemigo.comportamiento === "veneno" && Math.random() < 0.35) ||
        (enemigo.esJefe && enemigo.fase === 2 && enemigo.comportamiento === "dragon" && Math.random() < 0.25)) {
      p.veneno = Math.max(p.veneno, enemigo.esJefe ? 2 : 3);
      anotar("¡Te han envenenado! El verde no te favorece.");
    }
    if (enemigo.comportamiento === "ladron" && p.oro > 0 && Math.random() < 0.2) {
      const robado = Math.min(p.oro, aleatorio(1, 5));
      p.oro -= robado;
      anotar(`El goblin te roba ${robado} monedas. ¡Qué servicio tan pésimo!`);
    }
    aplicarVeneno();
  }

  function aplicarVeneno() {
    const p = estado.personaje;
    if (p.veneno > 0 && p.vida > 0) {
      p.veneno -= 1;
      p.vida = Math.max(0, p.vida - 2);
      anotar("El veneno te quita 2 de vida.");
    }
  }

  function comprobarEstado() {
    if (estado.personaje.vida <= 0) terminarAventura();
    else renderizar();
  }

  function derrotarEnemigo() {
    const enemigo = estado.enemigo;
    const p = estado.personaje;
    anotar(`¡Victoria! ${enemigo.nombre} ha sido derrotado.`);
    p.oro += enemigo.oro;
    anotar(`Obtienes ${enemigo.experiencia} EXP y ${enemigo.oro} monedas.`);
    ganarExperiencia(enemigo.experiencia);
    const probabilidadBotin = enemigo.esJefe ? 1 : 0.45;
    if (enemigo.botin.length && Math.random() < probabilidadBotin) {
      const id = enemigo.botin[aleatorio(0, enemigo.botin.length - 1)];
      recogerObjeto(id);
      anotar(`Botín: ${DATOS_JUEGO.objetos[id].nombre}.`);
    }
    if (enemigo.esJefe) {
      p.oro += 25;
      anotar(`Recompensa especial: ${enemigo.recompensa}. +25 monedas.`);
    }
    estado.enemigo = null;
    estado.evento = { tipo: "victoria", titulo: "Victoria, casi sin rasguños", descripcion: "El camino vuelve a estar despejado. El botín no se va a ordenar solo.", etiqueta: "VICTORIA" };
    estado.vista = "aventura";
    renderizar();
  }

  function ganarExperiencia(cantidad) {
    const p = estado.personaje;
    p.experiencia += cantidad;
    while (p.experiencia >= p.nivel * 40) {
      p.experiencia -= p.nivel * 40;
      p.nivel += 1;
      p.base.vidaMaxima += 8;
      p.base.manaMaximo += 3;
      p.base.ataque += 2;
      p.base.defensa += 1;
      const stats = estadisticasActuales();
      p.vida = stats.vidaMaxima;
      p.mana = stats.manaMaximo;
      anotar(`¡Subes al nivel ${p.nivel}! Tus heridas se cierran y tu ego crece.`);
    }
  }

  function recogerObjeto(id) {
    const p = estado.personaje;
    if (p.inventario.length >= 12) {
      anotar("La mochila está llena; el botín se queda en el suelo.");
      return false;
    }
    p.inventario.push(id);
    return true;
  }

  function usarObjeto(indice, enemigo = null) {
    const p = estado.personaje;
    const id = p.inventario[indice];
    const objeto = DATOS_JUEGO.objetos[id];
    if (!objeto || objeto.tipo !== "consumible") return false;
    const efecto = objeto.efecto;
    const stats = estadisticasActuales();
    let aplico = false;
    if (efecto.vida) {
      const cura = Math.min(efecto.vida, stats.vidaMaxima - p.vida);
      if (cura > 0) {
        p.vida += cura;
        anotar(`Usas ${objeto.nombre}: recuperas ${cura} de vida.`);
        aplico = true;
      }
    }
    if (efecto.mana) {
      const cura = Math.min(efecto.mana, stats.manaMaximo - p.mana);
      if (cura > 0) {
        p.mana += cura;
        anotar(`Usas ${objeto.nombre}: recuperas ${cura} de maná.`);
        aplico = true;
      }
    }
    if (efecto.limpiar && p.veneno > 0) {
      p.veneno = 0;
      aplico = true;
      anotar("El veneno desaparece. La poción sabe a calcetín, pero funciona.");
    }
    if (efecto.danio && enemigo) {
      enemigo.vida = Math.max(0, enemigo.vida - efecto.danio);
      aplico = true;
      anotar(`${objeto.nombre} inflige ${efecto.danio} de daño.`);
    }
    if (aplico) p.inventario.splice(indice, 1);
    else anotar("No necesitas ese objeto ahora; se queda en la mochila.");
    return aplico;
  }

  function equipar(indice) {
    const p = estado.personaje;
    const id = p.inventario[indice];
    const objeto = DATOS_JUEGO.objetos[id];
    if (!objeto || !["arma", "armadura"].includes(objeto.tipo)) return;
    const anterior = p.equipo[objeto.tipo];
    if (anterior && p.inventario.length >= 12) {
      anotar("No hay sitio para guardar el equipo que vas a cambiar.");
      renderizar();
      return;
    }
    p.equipo[objeto.tipo] = id;
    p.inventario.splice(indice, 1);
    if (anterior) p.inventario.push(anterior);
    const stats = estadisticasActuales();
    p.vida = Math.min(stats.vidaMaxima, p.vida);
    p.mana = Math.min(stats.manaMaximo, p.mana);
    anotar(`Equipas ${objeto.nombre}.`);
    renderizar();
  }

  function desequipar(tipo) {
    const p = estado.personaje;
    const id = p.equipo[tipo];
    if (!id) return;
    if (p.inventario.length >= 12) {
      anotar("La mochila está llena; libera espacio primero.");
      renderizar();
      return;
    }
    p.equipo[tipo] = null;
    p.inventario.push(id);
    const stats = estadisticasActuales();
    p.vida = Math.min(stats.vidaMaxima, p.vida);
    p.mana = Math.min(stats.manaMaximo, p.mana);
    anotar(`Desequipas ${DATOS_JUEGO.objetos[id].nombre}.`);
    renderizar();
  }

  function comprar(id) {
    const objeto = DATOS_JUEGO.objetos[id];
    const p = estado.personaje;
    if (!objeto || p.oro < objeto.valor || p.inventario.length >= 12) return;
    p.oro -= objeto.valor;
    p.inventario.push(id);
    anotar(`Compras ${objeto.nombre} por ${objeto.valor} monedas.`);
    renderizar();
  }

  function vender(indice) {
    const p = estado.personaje;
    const id = p.inventario[indice];
    const objeto = DATOS_JUEGO.objetos[id];
    if (!objeto) return;
    const precio = Math.max(1, Math.floor(objeto.valor / 2));
    p.inventario.splice(indice, 1);
    p.oro += precio;
    anotar(`Vendes ${objeto.nombre} por ${precio} monedas.`);
    renderizar();
  }

  function guardar() {
    try {
      localStorage.setItem(clavePartida, JSON.stringify(estado.personaje));
      anotar("Partida guardada en este navegador.");
      renderizar();
    } catch (error) {
      mostrarAviso("No se pudo guardar la partida. Revisa el espacio disponible del navegador.");
    }
  }

  function cargar() {
    try {
      const datos = JSON.parse(localStorage.getItem(clavePartida));
      if (!datos || !DATOS_JUEGO.clases[datos.clase] ||
          !Array.isArray(datos.inventario) ||
          !datos.inventario.every(id => DATOS_JUEGO.objetos[id]) ||
          !datos.equipo || !["arma", "armadura"].every(tipo =>
            datos.equipo[tipo] === null ||
            (DATOS_JUEGO.objetos[datos.equipo[tipo]]?.tipo === tipo))) {
        throw new Error("Los datos guardados no tienen un formato válido.");
      }
      estado.personaje = datos;
      estado.enemigo = null;
      estado.evento = null;
      estado.vista = "aventura";
      estado.pantalla = "juego";
      estado.registro = ["Partida recuperada. La aventura continúa."];
      renderizar();
    } catch (error) {
      mostrarAviso("No se pudo cargar la partida guardada. Puede estar dañada o no pertenecer a esta versión.");
    }
  }

  function nuevaAventura() {
    estado.pantalla = "creacion";
    estado.puntos = 3;
    estado.reparto = {};
    estado.claseSeleccionada = "Guerrero";
    estado.nombreBorrador = "";
    estado.personaje = null;
    estado.enemigo = null;
    estado.evento = null;
    renderizar();
  }

  function mostrarAviso(mensaje) {
    window.alert(mensaje);
  }

  document.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton || boton.disabled) return;
    const accion = boton.dataset.accion;
    if (accion === "nueva") nuevaAventura();
    else if (accion === "cargar") cargar();
    else if (accion === "portada") { estado.pantalla = "portada"; renderizar(); }
    else if (accion === "clase") {
      estado.claseSeleccionada = boton.dataset.clase;
      renderizar();
    } else if (accion === "atributo") {
      if (!estado.puntos) return;
      const atributo = boton.dataset.atributo;
      const aumento = { vidaMaxima: 5, manaMaximo: 3, ataque: 1, defensa: 1, velocidad: 1 }[atributo];
      estado.reparto[atributo] = (estado.reparto[atributo] || 0) + aumento;
      estado.puntos -= 1;
      renderizar();
    } else if (accion === "crear") crearPersonaje();
    else if (accion === "explorar" || accion === "continuar") explorar();
    else if (accion === "atacar") atacar();
    else if (accion === "habilidad") usarHabilidad();
    else if (accion === "defender") defender();
    else if (accion === "huir") intentarHuir();
    else if (accion === "usar") {
      usarObjeto(Number(boton.dataset.indice), estado.enemigo);
      resolverTurno();
    } else if (accion === "inventario") { estado.vistaAnterior = estado.vista; estado.vista = "inventario"; renderizar(); }
    else if (accion === "tienda" && estado.vista !== "combate") { estado.vistaAnterior = estado.vista; estado.vista = "tienda"; renderizar(); }
    else if (accion === "volver") { estado.vista = estado.vistaAnterior || "aventura"; renderizar(); }
    else if (accion === "usar-mochila") {
      const turnoDeCombate = estado.vistaAnterior === "combate" && Boolean(estado.enemigo);
      const seUso = usarObjeto(Number(boton.dataset.indice), turnoDeCombate ? estado.enemigo : null);
      if (turnoDeCombate && seUso) {
        estado.vista = "combate";
        resolverTurno();
      } else {
        renderizar();
      }
    } else if (accion === "equipar") equipar(Number(boton.dataset.indice));
    else if (accion === "desequipar") desequipar(boton.dataset.tipo);
    else if (accion === "comprar") comprar(boton.dataset.id);
    else if (accion === "vender") vender(Number(boton.dataset.indice));
    else if (accion === "guardar") guardar();
  });

  document.addEventListener("input", evento => {
    if (evento.target.id === "nombre-personaje") {
      estado.nombreBorrador = evento.target.value;
    }
  });

  function terminarAventura() {
    estado.pantalla = "fin";
    try { localStorage.removeItem(clavePartida); } catch (error) { /* El juego termina aunque el navegador bloquee el almacenamiento. */ }
    renderizar();
  }

  renderizar();
})();
