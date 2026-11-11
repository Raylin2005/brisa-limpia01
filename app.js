/* ==========================================================
   Brisa Limpia · app.js
   Un solo script para las tres páginas (se carga con defer).
   Cada bloque se protege: si el elemento no existe en la
   página actual, ese bloque simplemente no se ejecuta.
   ========================================================== */

/* 1. Datos -------------------------------------------------- */
// Mismos servicios y precios (USD) que la tabla de servicios.html.
const TASA_DOP = 60; // pesos dominicanos por dólar (referencia fija)

const servicios = [
  { id: "basica", nombre: "Limpieza básica", categoria: "Hogar", precioUSD: 45, duracion: "3 h",
    descripcion: "Cocina, baños y habitaciones con productos sin COV.",
    imagen: "img/hogar.svg", alt: "Sala con sofá verde, ventana grande y una planta, todo ordenado y limpio" },
  { id: "profunda", nombre: "Limpieza profunda", categoria: "Hogar", precioUSD: 95, duracion: "5 h",
    descripcion: "Desengrasado, desinfección de baños y detrás de los muebles.",
    imagen: "img/profunda.svg", alt: "Bañera blanca con burbujas y grifo azul, recién desinfectada" },
  { id: "mudanza", nombre: "Limpieza de mudanza", categoria: "Hogar", precioUSD: 120, duracion: "6 h",
    descripcion: "Deja la vivienda lista para entregar o para estrenar.",
    imagen: "img/hero.svg", alt: "Casa de tejado azul con puerta verde, destellos de limpieza y un cubo junto a la entrada" },
  { id: "oficina", nombre: "Oficina pequeña", categoria: "Especial", precioUSD: 85, duracion: "4 h",
    descripcion: "Escritorios, salas de reunión y pisos, hasta 80 m².",
    imagen: "img/oficina.svg", alt: "Escritorio de oficina con monitor encendido, lámpara y una planta" },
  { id: "postobra", nombre: "Post-obra", categoria: "Especial", precioUSD: 180, duracion: "8 h",
    descripcion: "Retiro de polvo fino y residuos después de remodelar.",
    imagen: "img/equipo.svg", alt: "Dos integrantes de la cuadrilla con uniforme azul y verde, una con un rociador de limpieza" },
  { id: "alfombras", nombre: "Alfombras y tapetes", categoria: "Especial", precioUSD: 70, duracion: "3 h",
    descripcion: "Lavado en seco y extracción de manchas.",
    imagen: "img/hogar.svg", alt: "Sala con sofá verde sobre un piso limpio, junto a una ventana" }
];

// Metros cuadrados mínimos según el servicio (regla propia del formulario).
const METROS_MINIMOS = { basica: 20, profunda: 30, mudanza: 40, oficina: 20, postobra: 50, alfombras: 20 };

/* 2. Utilidades --------------------------------------------- */
function crear(etiqueta, atributos = {}, texto = "") {
  const nodo = document.createElement(etiqueta);
  Object.entries(atributos).forEach(([clave, valor]) => nodo.setAttribute(clave, valor));
  if (texto) nodo.textContent = texto;
  return nodo;
}

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatearMoneda(valorUSD) {
  return (valorUSD * TASA_DOP).toLocaleString("es-DO", { style: "currency", currency: "DOP" });
}

function guardar(clave, valor) {
  try { localStorage.setItem(clave, valor); } catch (e) { /* almacenamiento no disponible */ }
}

function leer(clave) {
  try { return localStorage.getItem(clave); } catch (e) { return null; }
}

/* 3. Las tres páginas: menú, tema, año, volver arriba ------- */
function marcarPaginaActual() {
  const archivo = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((enlace) => {
    if (enlace.getAttribute("href") === archivo) enlace.setAttribute("aria-current", "page");
  });
}

function aplicarTema(oscuro) {
  document.body.classList.toggle("oscuro", oscuro);
  const boton = document.querySelector(".tema-boton");
  if (boton) {
    boton.textContent = oscuro ? "Modo claro" : "Modo oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
  }
}

function alternarTema() {
  const oscuro = !document.body.classList.contains("oscuro");
  aplicarTema(oscuro);
  guardar("brisa-tema", oscuro ? "oscuro" : "claro");
}

function alternarMenu() {
  const lista = document.querySelector("nav ul");
  const boton = document.querySelector(".menu-boton");
  const abierto = lista.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", String(abierto));
}

function cerrarMenu() {
  const lista = document.querySelector("nav ul");
  const boton = document.querySelector(".menu-boton");
  if (lista && boton) {
    lista.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }
}

function crearBotonesCabecera() {
  const barra = document.querySelector(".barra");
  const lista = document.querySelector("nav ul");
  if (!barra || !lista) return;

  lista.id = "menu-principal";
  const acciones = crear("div", { class: "acciones" });
  const botonTema = crear("button", { type: "button", class: "tema-boton", "aria-pressed": "false" }, "Modo oscuro");
  const botonMenu = crear("button", { type: "button", class: "menu-boton", "aria-expanded": "false",
    "aria-controls": "menu-principal", "aria-label": "Abrir o cerrar el menú" }, "☰ Menú");

  botonTema.addEventListener("click", alternarTema);
  botonMenu.addEventListener("click", alternarMenu);
  document.addEventListener("keydown", (evento) => { if (evento.key === "Escape") cerrarMenu(); });

  acciones.append(botonTema, botonMenu);
  barra.appendChild(acciones);
  aplicarTema(leer("brisa-tema") === "oscuro");
}

function escribirAnio() {
  const parrafo = document.querySelector("footer p");
  if (parrafo) parrafo.textContent = parrafo.textContent.replace(/\d{4}/, String(new Date().getFullYear()));
}

function crearVolverArriba() {
  const boton = crear("button", { type: "button", class: "volver-arriba", "aria-label": "Volver al inicio de la página" }, "↑ Subir");
  boton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => boton.classList.toggle("visible", window.scrollY > 300));
  document.body.appendChild(boton);
}

/* 4. servicios.html: catálogo dinámico ---------------------- */
function crearTarjeta(servicio) {
  const tarjeta = crear("li");
  tarjeta.append(
    crear("img", { src: servicio.imagen, alt: servicio.alt, width: "600", height: "400", loading: "lazy" }),
    crear("p", { class: "categoria" }, servicio.categoria),
    crear("h3", {}, servicio.nombre),
    crear("p", {}, servicio.descripcion),
    crear("p", { class: "precio" }, `${formatearMoneda(servicio.precioUSD)} · ${servicio.duracion}`)
  );
  return tarjeta;
}

function iniciarCatalogo() {
  const precios = document.querySelector("#precios");
  if (!precios) return;

  const seccion = crear("section", { id: "buscador" });
  const buscador = crear("input", { type: "search", id: "busqueda", placeholder: "Ej. baño, oficina, mudanza" });
  const etiqueta = crear("label", { for: "busqueda" }, "Buscar servicio");
  const filtros = crear("div", { class: "filtros" });
  const contador = crear("p", { class: "contador", "aria-live": "polite" });
  const lista = crear("ul", { class: "tarjetas" });
  const vacio = crear("p", { class: "sin-resultados", hidden: "" },
    "No encontramos servicios con esa búsqueda. Prueba con otra palabra o cambia la categoría.");
  let categoriaActiva = "Todos";

  function pintarTarjetas(resultado) {
    lista.replaceChildren();
    resultado.forEach((servicio) => lista.appendChild(crearTarjeta(servicio)));
    contador.textContent = `Mostrando ${resultado.length} de ${servicios.length} servicios`;
    vacio.hidden = resultado.length > 0;
  }

  function filtrarServicios() {
    const texto = normalizar(buscador.value.trim());
    const resultado = servicios
      .filter((s) => categoriaActiva === "Todos" || s.categoria === categoriaActiva)
      .filter((s) => normalizar(`${s.nombre} ${s.descripcion} ${s.categoria}`).includes(texto));
    pintarTarjetas(resultado);
  }

  ["Todos", ...new Set(servicios.map((s) => s.categoria))].forEach((categoria) => {
    const boton = crear("button", { type: "button", class: "filtro-boton",
      "aria-pressed": String(categoria === categoriaActiva) }, categoria);
    boton.addEventListener("click", () => {
      categoriaActiva = categoria;
      filtros.querySelectorAll(".filtro-boton").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
      filtrarServicios();
    });
    filtros.appendChild(boton);
  });

  buscador.addEventListener("input", filtrarServicios);
  filtros.prepend(etiqueta, buscador);
  seccion.append(crear("h2", {}, "Encuentra tu servicio"), filtros, contador, lista, vacio);
  precios.before(seccion);
  filtrarServicios();
}

/* 5. contacto.html: validación del formulario --------------- */
const MENSAJE_OBLIGATORIO = "Este campo es obligatorio.";

function validarNombre(valor) {
  if (!valor) return MENSAJE_OBLIGATORIO;
  if (valor.length < 3) return "El nombre debe tener al menos 3 letras.";
  if (valor.split(/\s+/).length < 2) return "Escribe tu nombre y apellido.";
  return "";
}

function validarCorreo(valor) {
  if (!valor) return MENSAJE_OBLIGATORIO;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com.";
}

function validarTelefono(valor) {
  if (!valor) return MENSAJE_OBLIGATORIO;
  if (!/^\d+$/.test(valor)) return "El teléfono solo puede tener números.";
  if (valor.length !== 10) return "El teléfono debe tener 10 dígitos.";
  if (!/^(809|829|849)/.test(valor)) return "El teléfono debe iniciar con 809, 829 o 849.";
  return "";
}

function validarClave(valor) {
  if (!valor) return MENSAJE_OBLIGATORIO;
  if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(valor) || !/\d/.test(valor)) return "Combina letras y números en la contraseña.";
  return "";
}

function validarFecha(valor) {
  if (!valor) return MENSAJE_OBLIGATORIO;
  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) return "La fecha no puede estar en el pasado.";
  if (fecha.getDay() === 0) return "Trabajamos de lunes a sábado. Elige otra fecha.";
  return "";
}

function validarHora(valor) {
  if (!valor) return "";
  return valor >= "07:00" && valor <= "16:00" ? "" : "La hora de llegada debe estar entre 7:00 a. m. y 4:00 p. m.";
}

function iniciarFormulario() {
  const formulario = document.querySelector("form");
  if (!formulario) return;
  formulario.noValidate = true; // los mensajes los escribe JavaScript

  const campo = (id) => formulario.querySelector(`#${id}`);
  const selectServicio = campo("servicio");

  function validarMetros(valor) {
    if (!valor) return MENSAJE_OBLIGATORIO;
    const metros = Number(valor);
    if (metros < 20 || metros > 500) return "Los metros cuadrados deben estar entre 20 y 500.";
    const minimo = METROS_MINIMOS[selectServicio.value];
    if (minimo && metros < minimo) {
      return `El servicio "${selectServicio.selectedOptions[0].textContent}" requiere mínimo ${minimo} m².`;
    }
    return "";
  }

  // Cada campo: nombre del error, elemento, dónde va el mensaje y su regla.
  const grupoFrecuencia = formulario.querySelector("[role=radiogroup]");
  const campos = [
    { nombre: "nombre", ref: campo("nombre"), regla: (v) => validarNombre(v.trim()) },
    { nombre: "correo", ref: campo("correo"), regla: (v) => validarCorreo(v.trim()) },
    { nombre: "telefono", ref: campo("telefono"), regla: (v) => validarTelefono(v.trim()) },
    { nombre: "clave", ref: campo("clave"), regla: validarClave },
    { nombre: "servicio", ref: selectServicio, regla: (v) => (v ? "" : "Elige el tipo de servicio.") },
    { nombre: "fecha", ref: campo("fecha"), regla: validarFecha },
    { nombre: "hora", ref: campo("hora"), regla: validarHora },
    { nombre: "metros", ref: campo("metros"), regla: validarMetros },
    { nombre: "frecuencia", ref: grupoFrecuencia, anclaje: grupoFrecuencia,
      valor: () => (formulario.querySelector("input[name=frecuencia]:checked") || {}).value || "",
      regla: (v) => (v ? "" : "Elige con qué frecuencia necesitas el servicio.") },
    { nombre: "acepto", ref: campo("acepto"), anclaje: campo("acepto").closest("label"),
      valor: () => (campo("acepto").checked ? "si" : ""),
      regla: (v) => (v ? "" : "Debes aceptar el uso de tus datos para enviar la solicitud.") }
  ];

  // Crea el span.error de cada campo y lo enlaza con aria-describedby.
  campos.forEach((c) => {
    c.error = crear("span", { class: "error", id: `error-${c.nombre}` });
    (c.anclaje || c.ref).after(c.error);
    c.ref.setAttribute("aria-describedby", c.error.id);
  });

  function validarCampo(c) {
    const valor = c.valor ? c.valor() : c.ref.value;
    const mensaje = c.regla(valor);
    c.error.textContent = mensaje;
    c.ref.classList.toggle("invalido", mensaje !== "");
    return mensaje === "";
  }

  campos.forEach((c) => {
    const escribir = () => { if (c.ref.classList.contains("invalido")) validarCampo(c); };
    c.ref.addEventListener("input", escribir);
    c.ref.addEventListener("change", escribir);
    if (c.ref.tagName === "INPUT" && c.ref.type !== "checkbox") c.ref.addEventListener("blur", () => validarCampo(c));
  });

  selectServicio.addEventListener("change", () => {
    const metros = campos.find((c) => c.nombre === "metros");
    if (metros.ref.value) validarCampo(metros);
  });

  function mostrarExito(datos) {
    const anterior = formulario.parentElement.querySelector(".exito");
    if (anterior) anterior.remove();
    const caja = crear("div", { class: "exito", role: "status", tabindex: "-1" });
    const resumen = crear("ul");
    datos.forEach(([etiqueta, valor]) => resumen.appendChild(crear("li", {}, `${etiqueta}: ${valor}`)));
    caja.append(crear("h3", {}, "¡Solicitud enviada!"),
      crear("p", {}, "Gracias. Te enviaremos la cotización en menos de 2 horas. Este es el resumen:"), resumen);
    formulario.before(caja);
    caja.focus();
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const resultados = campos.map(validarCampo);
    if (resultados.includes(false)) {
      const primero = campos[resultados.indexOf(false)];
      const foco = primero.nombre === "frecuencia" ? formulario.querySelector("input[name=frecuencia]") : primero.ref;
      foco.focus();
      return;
    }
    const frecuencia = formulario.querySelector("input[name=frecuencia]:checked").parentElement.textContent.trim();
    const [anio, mes, dia] = campo("fecha").value.split("-");
    mostrarExito([
      ["Nombre", campo("nombre").value.trim()],
      ["Correo", campo("correo").value.trim()],
      ["Teléfono", campo("telefono").value.trim()],
      ["Servicio", selectServicio.selectedOptions[0].textContent],
      ["Fecha", `${dia}/${mes}/${anio}`],
      ["Metros cuadrados", `${campo("metros").value} m²`],
      ["Frecuencia", frecuencia]
    ]);
    formulario.reset();
    campos.forEach((c) => { c.error.textContent = ""; c.ref.classList.remove("invalido"); });
  });
}

/* 6. Arranque ------------------------------------------------ */
function iniciar() {
  marcarPaginaActual();
  crearBotonesCabecera();
  escribirAnio();
  crearVolverArriba();
  iniciarCatalogo();
  iniciarFormulario();
}

iniciar();
