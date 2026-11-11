/* ==========================================================
   Brisa Limpia · app.js
   Un solo script para las tres páginas (se carga con defer).
   Cada función revisa si el elemento existe en la página
   actual, así no da error en las páginas donde no está.
   ========================================================== */

/* 1. Datos del catálogo ------------------------------------ */
// Mismos servicios de la tabla. Los precios están en pesos
// dominicanos (1 USD = 60 DOP), por ejemplo $45 = RD$2,700.
const servicios = [
  { nombre: "Limpieza básica", categoria: "Hogar", precio: 2700,
    descripcion: "Cocina, baños y habitaciones con productos sin COV.",
    imagen: "img/hogar.svg", alt: "Sala con sofá verde, ventana grande y una planta" },
  { nombre: "Limpieza profunda", categoria: "Hogar", precio: 5700,
    descripcion: "Desengrasado y desinfección de baños y muebles.",
    imagen: "img/profunda.svg", alt: "Bañera blanca con burbujas y grifo azul" },
  { nombre: "Limpieza de mudanza", categoria: "Hogar", precio: 7200,
    descripcion: "Deja la vivienda lista para entregar o para estrenar.",
    imagen: "img/hero.svg", alt: "Casa de tejado azul con puerta verde y destellos de limpieza" },
  { nombre: "Oficina pequeña", categoria: "Especial", precio: 5100,
    descripcion: "Escritorios, salas de reunión y pisos, hasta 80 m².",
    imagen: "img/oficina.svg", alt: "Escritorio de oficina con monitor, lámpara y una planta" },
  { nombre: "Post-obra", categoria: "Especial", precio: 10800,
    descripcion: "Retiro de polvo fino y residuos después de remodelar.",
    imagen: "img/equipo.svg", alt: "Dos personas de la cuadrilla con uniforme azul y verde" },
  { nombre: "Alfombras y tapetes", categoria: "Especial", precio: 4200,
    descripcion: "Lavado en seco y extracción de manchas.",
    imagen: "img/hogar.svg", alt: "Sala con sofá verde sobre un piso limpio" }
];

// Metros cuadrados mínimos según el servicio elegido en el formulario.
const metrosMinimos = {
  basica: 20, profunda: 30, mudanza: 40, oficina: 20, postobra: 50, alfombras: 20
};

/* 2. Las tres páginas: menú, tema, año y volver arriba ------ */
function crearBotones() {
  const barra = document.querySelector(".barra");
  if (!barra) return;

  const contenedor = document.createElement("div");
  contenedor.className = "acciones";

  const botonTema = document.createElement("button");
  botonTema.type = "button";
  botonTema.className = "tema-boton";
  botonTema.textContent = "Modo oscuro";
  botonTema.addEventListener("click", alternarTema);

  const botonMenu = document.createElement("button");
  botonMenu.type = "button";
  botonMenu.className = "menu-boton";
  botonMenu.textContent = "☰ Menú";
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.addEventListener("click", alternarMenu);

  contenedor.appendChild(botonTema);
  contenedor.appendChild(botonMenu);
  barra.appendChild(contenedor);
}

function alternarMenu() {
  const menu = document.querySelector("nav ul");
  const boton = document.querySelector(".menu-boton");
  menu.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", menu.classList.contains("abierto"));
}

function alternarTema() {
  document.body.classList.toggle("oscuro");
  if (document.body.classList.contains("oscuro")) {
    localStorage.setItem("tema", "oscuro");
  } else {
    localStorage.setItem("tema", "claro");
  }
  actualizarTextoTema();
}

function cargarTema() {
  if (localStorage.getItem("tema") === "oscuro") {
    document.body.classList.add("oscuro");
  }
  actualizarTextoTema();
}

function actualizarTextoTema() {
  const boton = document.querySelector(".tema-boton");
  if (boton) {
    boton.textContent = document.body.classList.contains("oscuro") ? "Modo claro" : "Modo oscuro";
  }
}

function marcarPaginaActual() {
  let archivo = location.pathname.split("/").pop();
  if (archivo === "") {
    archivo = "index.html";
  }
  const enlaces = document.querySelectorAll("nav a");
  enlaces.forEach(function (enlace) {
    if (enlace.getAttribute("href") === archivo) {
      enlace.setAttribute("aria-current", "page");
    }
  });
}

function escribirAnio() {
  const parrafo = document.querySelector("footer p");
  if (parrafo) {
    parrafo.textContent = parrafo.textContent.replace("2026", new Date().getFullYear());
  }
}

function crearVolverArriba() {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "volver-arriba";
  boton.textContent = "↑ Subir";
  document.body.appendChild(boton);

  boton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", function () {
    boton.classList.toggle("visible", window.scrollY > 300);
  });
}

/* 3. servicios.html: catálogo dinámico ---------------------- */
function formatearMoneda(valor) {
  return valor.toLocaleString("es-DO", { style: "currency", currency: "DOP" });
}

function pintarTarjetas(lista) {
  let html = "";
  lista.forEach(function (servicio) {
    html += `
      <li>
        <img src="${servicio.imagen}" alt="${servicio.alt}" width="600" height="400" loading="lazy">
        <p class="categoria">${servicio.categoria}</p>
        <h3>${servicio.nombre}</h3>
        <p>${servicio.descripcion}</p>
        <p class="precio">${formatearMoneda(servicio.precio)}</p>
      </li>`;
  });
  document.getElementById("lista").innerHTML = html;
  document.getElementById("contador").textContent =
    "Mostrando " + lista.length + " de " + servicios.length + " servicios";
  document.getElementById("vacio").hidden = lista.length > 0;
}

function filtrarServicios() {
  const texto = document.getElementById("busqueda").value.toLowerCase();
  const categoria = document.getElementById("categoria").value;

  const resultado = servicios.filter(function (servicio) {
    const textoServicio = (servicio.nombre + " " + servicio.descripcion).toLowerCase();
    const coincideTexto = textoServicio.includes(texto);
    const coincideCategoria = categoria === "Todos" || servicio.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
  pintarTarjetas(resultado);
}

function iniciarCatalogo() {
  const precios = document.getElementById("precios");
  if (!precios) return;

  const seccion = document.createElement("section");
  seccion.innerHTML = `
    <h2>Encuentra tu servicio</h2>
    <div class="filtros">
      <label for="busqueda">Buscar</label>
      <input type="search" id="busqueda" placeholder="Ej. baño, oficina">
      <label for="categoria">Categoría</label>
      <select id="categoria">
        <option value="Todos">Todos</option>
        <option value="Hogar">Hogar</option>
        <option value="Especial">Especial</option>
      </select>
    </div>
    <p class="contador" id="contador" aria-live="polite"></p>
    <ul class="tarjetas" id="lista"></ul>
    <p class="sin-resultados" id="vacio" hidden>No encontramos servicios con esa búsqueda. Prueba con otra palabra o cambia la categoría.</p>`;
  precios.before(seccion);

  document.getElementById("busqueda").addEventListener("input", filtrarServicios);
  document.getElementById("categoria").addEventListener("change", filtrarServicios);
  filtrarServicios();
}

/* 4. contacto.html: validación del formulario --------------- */
const camposFormulario = ["nombre", "correo", "telefono", "clave", "servicio",
  "fecha", "hora", "metros", "frecuencia", "acepto"];

function validarNombre(valor) {
  if (valor === "") return "El nombre es obligatorio.";
  if (valor.split(" ").length < 2) return "Escribe tu nombre y apellido.";
  return "";
}

function validarCorreo(valor) {
  if (valor === "") return "El correo es obligatorio.";
  if (!valor.includes("@") || !valor.includes(".")) return "Escribe un correo válido, por ejemplo nombre@correo.com.";
  return "";
}

function validarTelefono(valor) {
  if (valor === "") return "El teléfono es obligatorio.";
  if (valor.length !== 10 || isNaN(valor)) return "El teléfono debe tener 10 dígitos.";
  const prefijo = valor.slice(0, 3);
  if (prefijo !== "809" && prefijo !== "829" && prefijo !== "849") {
    return "El teléfono debe iniciar con 809, 829 o 849.";
  }
  return "";
}

function validarClave(valor) {
  if (valor === "") return "La contraseña es obligatoria.";
  if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(valor) || !/[0-9]/.test(valor)) return "Combina letras y números en la contraseña.";
  return "";
}

function validarServicio(valor) {
  if (valor === "") return "Elige el tipo de servicio.";
  return "";
}

function validarFecha(valor) {
  if (valor === "") return "La fecha es obligatoria.";
  const fecha = new Date(valor + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) return "La fecha no puede estar en el pasado.";
  if (fecha.getDay() === 0) return "Trabajamos de lunes a sábado. Elige otra fecha.";
  return "";
}

function validarHora(valor) {
  if (valor !== "" && (valor < "07:00" || valor > "16:00")) {
    return "La hora de llegada debe estar entre 7:00 a. m. y 4:00 p. m.";
  }
  return "";
}

function validarMetros(valor) {
  if (valor === "") return "Los metros cuadrados son obligatorios.";
  const metros = Number(valor);
  if (metros < 20 || metros > 500) return "Los metros cuadrados deben estar entre 20 y 500.";
  const servicio = document.getElementById("servicio").value;
  if (metrosMinimos[servicio] && metros < metrosMinimos[servicio]) {
    return "Este servicio requiere mínimo " + metrosMinimos[servicio] + " m².";
  }
  return "";
}

// Cada campo con su función de validación.
const reglas = {
  nombre: validarNombre, correo: validarCorreo, telefono: validarTelefono,
  clave: validarClave, servicio: validarServicio, fecha: validarFecha,
  hora: validarHora, metros: validarMetros
};

// El grupo de radios y el checkbox se tratan aparte.
function campoDe(id) {
  if (id === "frecuencia") return document.querySelector('[role="radiogroup"]');
  return document.getElementById(id);
}

function mostrarError(id, mensaje) {
  const span = document.getElementById("error-" + id);
  span.textContent = mensaje;
  campoDe(id).classList.toggle("invalido", mensaje !== "");
}

function validarCampo(id) {
  let mensaje = "";
  if (id === "frecuencia") {
    if (!document.querySelector('input[name="frecuencia"]:checked')) {
      mensaje = "Elige con qué frecuencia necesitas el servicio.";
    }
  } else if (id === "acepto") {
    if (!document.getElementById("acepto").checked) {
      mensaje = "Debes aceptar el uso de tus datos para enviar la solicitud.";
    }
  } else {
    mensaje = reglas[id](document.getElementById(id).value.trim());
  }
  mostrarError(id, mensaje);
  return mensaje === "";
}

function crearErrores() {
  camposFormulario.forEach(function (id) {
    const span = document.createElement("span");
    span.className = "error";
    span.id = "error-" + id;

    let lugar = campoDe(id);
    if (id === "acepto") {
      lugar = lugar.parentElement; // el span va después del label
    }
    lugar.after(span);
    campoDe(id).setAttribute("aria-describedby", span.id);
  });
}

function mostrarExito() {
  const anterior = document.querySelector(".exito");
  if (anterior) anterior.remove();

  const caja = document.createElement("div");
  caja.className = "exito";
  caja.setAttribute("role", "status");
  caja.setAttribute("tabindex", "-1");

  const titulo = document.createElement("h3");
  titulo.textContent = "¡Solicitud enviada!";
  const mensaje = document.createElement("p");
  mensaje.textContent = "Gracias. Te enviaremos la cotización en menos de 2 horas. Este es el resumen:";
  const lista = document.createElement("ul");

  const select = document.getElementById("servicio");
  const datos = [
    "Nombre: " + document.getElementById("nombre").value,
    "Correo: " + document.getElementById("correo").value,
    "Teléfono: " + document.getElementById("telefono").value,
    "Servicio: " + select.options[select.selectedIndex].text,
    "Fecha: " + document.getElementById("fecha").value,
    "Metros cuadrados: " + document.getElementById("metros").value + " m²"
  ];
  datos.forEach(function (dato) {
    const item = document.createElement("li");
    item.textContent = dato;
    lista.appendChild(item);
  });

  caja.appendChild(titulo);
  caja.appendChild(mensaje);
  caja.appendChild(lista);
  document.querySelector("form").before(caja);
  caja.focus();
}

function corregirCampo(evento) {
  let id = evento.target.id;
  if (evento.target.name === "frecuencia") id = "frecuencia";

  // Solo se vuelve a validar si el campo ya tenía un error.
  const span = document.getElementById("error-" + id);
  if (span && span.textContent !== "") {
    validarCampo(id);
  }
  // Si cambia el servicio, se revisa de nuevo el mínimo de metros.
  if (id === "servicio" && document.getElementById("metros").value !== "") {
    validarCampo("metros");
  }
}

function iniciarFormulario() {
  const formulario = document.querySelector("form");
  if (!formulario) return;

  formulario.noValidate = true; // los mensajes los escribe JavaScript
  crearErrores();

  formulario.addEventListener("input", corregirCampo);
  formulario.addEventListener("change", corregirCampo);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let primerError = "";
    camposFormulario.forEach(function (id) {
      if (!validarCampo(id) && primerError === "") {
        primerError = id;
      }
    });

    if (primerError !== "") {
      if (primerError === "frecuencia") {
        document.querySelector('input[name="frecuencia"]').focus();
      } else {
        document.getElementById(primerError).focus();
      }
      return;
    }

    mostrarExito();
    formulario.reset();
  });
}

/* 5. Arranque ------------------------------------------------ */
crearBotones();
cargarTema();
marcarPaginaActual();
escribirAnio();
crearVolverArriba();
iniciarCatalogo();
iniciarFormulario();
