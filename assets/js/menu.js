let items = [];
let orden = {}; 
let tipoPedido = "";
let scrollPos = 0;
let whatsappNegocio = "";


const NEGOCIO = detectarNegocio();
const RUTA_IMG = `pics/${NEGOCIO}`;
const RUTA_JSON = `data/${NEGOCIO}.json`;

document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();

  const list = document.getElementById("order-list");
  const hint = document.querySelector(".scroll-hint");

  if (list && hint) {
    list.addEventListener("scroll", () => {
      hint.style.opacity = "0";
    });
  }
   
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.target.blur();
    }
  }); 

  // NUEVA LÓGICA SIMPLE PARA STICKY
  const menuCategorias = document.querySelector('.menu-categorias');
  
  window.addEventListener('scroll', () => {
    if (!menuCategorias) return;
    
    const rect = menuCategorias.getBoundingClientRect();
    const headerHeight = 72; // tu header height
    
    if (rect.top <= headerHeight) {
      menuCategorias.classList.add('is-stuck');
    } else {
      menuCategorias.classList.remove('is-stuck');
    }
  });

  //AQUI TERMINA EL DOM LOADER
});


async function cargarDatos() {
  const response = await fetch(RUTA_JSON);
  const data = await response.json();

  const negocio = data.negocio;
  aplicarColores(negocio.colores);

  document.getElementById("frase-menu").textContent = negocio.frase_menu;
  document.getElementById("eslogan").textContent = negocio.eslogan;
  document.getElementById("direccion").textContent = negocio.direccion;
  document.getElementById("reservas").textContent = negocio.reservaciones;
  document.getElementById("nombre").textContent = negocio.nombre;
  document.getElementById("nombre-header").textContent = negocio.titulo;
  document.getElementById("nombre2").textContent = negocio.nombre;
  document.getElementById("titulo").textContent = negocio.titulo;

  whatsappNegocio = data.negocio.whatsapp;

  cargarIconos();
  cargarLogo(negocio);


  cargarCategorias(data.menu.categorias);
  items = data.menu.items;   
  cargarItems(items);

  setTimeout(() => {
    if (typeof initIsotopeLayout === "function") {
      initIsotopeLayout();
    }
  }, 0);

  // MAPA
  const iframeMapa = document.getElementById("mapa-iframe");
  if (iframeMapa && negocio.mapa_link) {
    iframeMapa.src = negocio.mapa_link;
  }

  // BOTÓN GOOGLE MAPS
  const btnMaps = document.getElementById("btn-maps");
  if (btnMaps && negocio.link_maps) {
    btnMaps.href = negocio.link_maps;
  }

  cargarHorarios(data.horarios);

  cargarRedes(data.redes);

  //CARGAR TIPOS DE PEDIDO
  const configPedido = negocio.pedido;

  const opciones = {
    llevar: "Ordenar y llevar",
    aqui: "Ordenar y comer aquí",
    domicilio: "A domicilio",
    mesa: "Ya en mesa"
  };

  const contenedor = document.getElementById("order-options");

  Object.keys(opciones).forEach(tipo => {
    if (configPedido[tipo]) {
      contenedor.innerHTML += `
        <button onclick="seleccionarTipo('${tipo}')" class="fw-bold" id="opt-${tipo}">
          ${opciones[tipo]}
        </button>
      `;
    }
  });
 }

function cargarCategorias(categorias) {
  const ul = document.getElementById("categorias-menu");
  ul.innerHTML = "";

  // Botón "Todos"
  const liTodos = document.createElement("li");
  liTodos.classList.add("filter-active");
  liTodos.setAttribute("data-filter", "*");
  liTodos.textContent = "Todos";
  ul.appendChild(liTodos);

  // Categorías del JSON
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.setAttribute("data-filter", `.filter-${cat.id}`);
    li.textContent = cat.nombre;
    ul.appendChild(li);
  });
  
  // NO agregues eventos aquí
}

function cargarItems(items) {
  const contenedor = document.getElementById("menu-items");
  contenedor.innerHTML = "";

  items.forEach(item => {
    contenedor.innerHTML += `
      <div class="col-lg-6 isotope-item filter-${item.categoria}">
        <div class="menu-item d-flex align-items-center gap-4">

          <img src="${RUTA_IMG}/${item.imagen}" 
               alt="${item.nombre}" 
               class="menu-img img-fluid rounded-3">

          <div class="menu-content w-100">
            <div class="d-flex justify-content-between align-items-start">

              <div class="flex-grow-1">
                <h5>${item.nombre}</h5>
                <p class="mb-2">${item.descripcion}</p>
                <div class="price fw-bold fs-4">$${item.precio}</div>
              </div>

              <div class="order-controls d-flex flex-column align-items-center gap-2">

                <div class="d-flex align-items-center gap-2 mb-2">
                  <button class="btn btn-outline-accent"
                          onclick="cambiarCantidad(${item.id}, -1)">−</button>

                  <span id="cantidad-${item.id}" class="cantidad-badge">1</span>

                  <button class="btn btn-outline-accent"
                          onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>

                <button class="btn-agregar"
                  onclick="agregarOrden(${item.id}, document.getElementById('cantidad-${item.id}').innerText); this.blur();">
                  Agregar
                </button>


              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  });
}


function cambiarCantidad(id, cambio) {
  const cantidadElement = document.getElementById(`cantidad-${id}`);
  let cantidad = parseInt(cantidadElement.innerText);
  
  cantidad += cambio;
  
  // No permitir menos de 1
  if (cantidad < 1) cantidad = 1;
  // Opcional: máximo de 99
  if (cantidad > 99) cantidad = 99;
  
  cantidadElement.innerText = cantidad;
}

function detectarNegocio() {
  //const host = window.location.hostname;

  //if (host.includes("antena")) return "antena";  

  return "deport"; // fallback
}

function cargarIconos() {
  const favicon = document.getElementById("favicon");
  const apple = document.getElementById("apple-icon");

  if (favicon) favicon.href = `${RUTA_IMG}/logo.png`;
  if (apple) apple.href = `${RUTA_IMG}/logo.png`;
}


function cargarLogo(negocio) {
  const logo = document.getElementById("logo-negocio");

  if (!logo) return;

  logo.src = `${RUTA_IMG}/logo.png`;
  logo.alt = negocio.nombre;
}

function cargarHorarios(horarios) {
  const lista = document.getElementById("lista-horarios");
  if (!lista) return;

  lista.innerHTML = "";

  horarios.forEach(h => {
    const li = document.createElement("li");

    const diasTexto = formatearDias(h.dias);
    const horasTexto = `${formatearHora(h.abre)} – ${formatearHora(h.cierra)}`;

    li.innerHTML = `
      <strong>${diasTexto}</strong>
      <span class="horas-texto">${horasTexto}</span>
    `;

    lista.appendChild(li);
  });
}

function formatearHora(hora) {
  const [h, m] = hora.split(":");
  let horaNum = parseInt(h, 10);
  const ampm = horaNum >= 12 ? "PM" : "AM";

  horaNum = horaNum % 12 || 12;

  return `${horaNum}:${m} ${ampm}`;
}

function formatearDias(dias) {
  const orden = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo"
  ];

  const diasOrdenados = dias
    .slice()
    .sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

  if (diasOrdenados.length === 1) {
    return capitalizar(diasOrdenados[0]);
  }

  return `${capitalizar(diasOrdenados[0])} a ${capitalizar(diasOrdenados[diasOrdenados.length - 1])}`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function cargarRedes(redes) {
  const contenedor = document.getElementById("social-links");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const iconos = {
    facebook: "bi-facebook",
    whatsapp: "bi-whatsapp",
    instagram: "bi-instagram",
    tiktok: "bi-tiktok"
  };

  redes.forEach(red => {
    if (!iconos[red.tipo]) return; // por si viene algo raro

    const a = document.createElement("a");
    a.href = red.url;
    a.className = `social ${red.tipo}`;
    a.target = "_blank";
    a.rel = "noopener";

    a.innerHTML = `<i class="bi ${iconos[red.tipo]}"></i>`;

    contenedor.appendChild(a);
  });
}

function agregarOrden(id, cantidad) {
  cantidad = parseInt(cantidad);

  const item = items.find(i => i.id === id);
  if (!item || cantidad <= 0) return;

  if (orden[id]) {
    orden[id].cantidad += cantidad;
  } else {
    orden[id] = {
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: cantidad
    };
  }

  actualizarContadorOrden();
  document.getElementById(`cantidad-${id}`).innerText = 1;
  mostrarToastAgregado();
  mostrarFeedbackAgregado();
}

function actualizarContadorOrden() {
  let total = 0;

  Object.values(orden).forEach(item => {
    total += item.cantidad;
  });

  document.getElementById("order-count").innerText = total;
}

function mostrarFeedbackAgregado() {
  const badge = document.getElementById("order-count");

  badge.classList.add("animar");

  setTimeout(() => {
    badge.classList.remove("animar");
  }, 300);
}

function abrirOrden() {

  if (Object.keys(orden).length === 0) return;

  scrollPos = window.scrollY;

  const modal = document.getElementById("order-modal");
  const lista = document.getElementById("order-list");
  const totalEl = document.getElementById("order-total");

  lista.innerHTML = "";
  let total = 0;

  Object.values(orden).forEach(item => {
    total += item.precio * item.cantidad;

    lista.innerHTML += `
      <div class="order-item">
        <span>${item.cantidad} × ${item.nombre}</span>
        <div class="order-actions">
          <button onclick="quitarUno(${item.id})">−</button>
          <button onclick="quitarTodo(${item.id})">✕</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = `$${total}`;

  document.body.style.top = `-${scrollPos}px`;
  document.body.classList.add("no-scroll", "modal-open");

  modal.classList.remove("hidden");
  modal.classList.add("activo");

  scrollPos = window.scrollY;
  document.body.classList.add("no-smooth");
  document.body.style.top = `-${scrollPos}px`;
  document.body.classList.add("no-scroll", "modal-open");

  actualizarScrollHint();
}

function cerrarOrden() {

  const modal = document.getElementById("order-modal");

  document.body.classList.remove("no-scroll", "modal-open");
  document.body.style.top = "";

  modal.classList.remove("activo");
  modal.classList.add("hidden");

  window.scrollTo(0, scrollPos);

  // reactivar smooth DESPUÉS de restaurar scroll
  setTimeout(() => {
    document.body.classList.remove("no-smooth");
  }, 0);
}

function quitarUno(id) {
  if (!orden[id]) return;

  orden[id].cantidad--;

  if (orden[id].cantidad <= 0) {
    delete orden[id];
  }

  refrescarOrden();
}

function quitarTodo(id) {
  delete orden[id];
  refrescarOrden();
}

function refrescarOrden() {
  actualizarContadorOrden();

  if (Object.keys(orden).length === 0) {
    cerrarOrden();
    return;
  }
  actualizarScrollHint();
  abrirOrden(); // re-render
}

function seleccionarTipo(tipo) {
  tipoPedido = tipo;

  document.querySelectorAll(".order-options button")
    .forEach(b => b.classList.remove("active"));

  document.getElementById(`opt-${tipo}`).classList.add("active");

  const contenedor = document.getElementById("extra-fields");
  contenedor.innerHTML = "";

  if (tipo === "domicilio") {
    contenedor.innerHTML = `
      <input 
        type="text"
        id="direccion"
        placeholder="Dirección completa"
        inputmode="text"
        autocomplete="street-address"
      >
    `;
  }


  if (tipo === "mesa") {
    contenedor.innerHTML = `
      <input 
        type="number"
        id="mesa"
        placeholder="Número de mesa"
        inputmode="numeric"
        pattern="[0-9]*"
        min="1"
      >
    `;
  }

}

function actualizarScrollHint() {
  const hint = document.querySelector(".scroll-hint");
  const list = document.getElementById("order-list");
  if (!hint || !list) return;

  const cantidadItems = Object.keys(orden).length;

  if (cantidadItems > 3) {
    list.classList.add("scrollable");
    list.classList.add("has-scroll"); // ← Nueva clase
    hint.style.display = "block";
    hint.style.opacity = "1";
  } else {
    list.classList.remove("scrollable");
    list.classList.remove("has-scroll"); // ← Quita la clase
    hint.style.display = "none";
  }
}

function finalizarOrden() {
  // Validar orden no vacía
  if (Object.keys(orden).length === 0) {
    mostrarError("La orden está vacía");
    return;
  }

  // Validar nombre
  const nombre = document.getElementById("customer-name").value.trim();
  if (!nombre) {
    mostrarError("Escribe tu nombre");
    document.getElementById("customer-name").focus();
    return;
  }

  // Validar tipo de pedido
  if (!tipoPedido) {
    mostrarError("Selecciona el tipo de pedido");
    return;
  }

  // Validar campos extras
  let extraInfo = "";
  
  if (tipoPedido === "domicilio") {
    const inputDireccion = document.querySelector("#extra-fields #direccion");
    const direccion = inputDireccion?.value.trim();
    if (!direccion) {
      mostrarError("Escribe la dirección de entrega");
      document.getElementById("direccion")?.focus();
      return;
    }
    extraInfo = `*Dirección:* ${direccion}`;
  }

  if (tipoPedido === "mesa") {
    const mesa = document.getElementById("mesa")?.value.trim();
    if (!mesa) {
      mostrarError("Escribe el número de mesa");
      document.getElementById("mesa")?.focus();
      return;
    }
    extraInfo = `*Mesa:* ${mesa}`;
  }

  // Construir mensaje para WhatsApp
  
  let mensaje = `*NUEVA ORDEN*\n\n`;
  mensaje += `*Nombre:* ${nombre}\n`;
  mensaje += `*Tipo:* ${formatearTipo(tipoPedido)}\n`;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });
  mensaje += `*Hora:* ${hora}\n`;
  
  if (extraInfo) {
    mensaje += `${extraInfo}\n`;
  }
  
  mensaje += `\n━━━━━━━━━━━━━━━━\n`;
  mensaje += ` *DETALLE DE LA ORDEN*\n`;
  mensaje += `━━━━━━━━━━━━━━━━\n\n`;

  let total = 0;

  Object.values(orden).forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    mensaje += `${item.cantidad} x ${item.nombre}\n`;
    mensaje += `          _$${item.precio} c/u = $${subtotal}_\n\n`;
  });

  mensaje += `━━━━━━━━━━━━━━━━\n`;
  mensaje += `  *TOTAL: $${total}*\n`;
  mensaje += `━━━━━━━━━━━━━━━━\n\n`;
  
  const fecha = new Date();
  const opciones = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };

  // Enviar por WhatsApp
  const url = `https://wa.me/${whatsappNegocio}?text=${encodeURIComponent(mensaje)}`;
  console.log(url);
  window.open(url, "_blank");

  // Opcional: cerrar modal y limpiar orden
  setTimeout(() => {
    cerrarOrden();
    orden = {};
    actualizarContadorOrden();
    limpiarOrden();
  }, 500);
}

function mostrarError(mensaje) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "order-error";
  errorDiv.textContent = mensaje;
  
  const modal = document.querySelector(".order-card");
  modal.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.classList.add("mostrar");
  }, 10);
  
  setTimeout(() => {
    errorDiv.classList.remove("mostrar");
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);
}

function formatearTipo(tipo) {
  const tipos = {
    llevar: "Para llevar",
    aqui: "Comer aquí",
    domicilio: "A domicilio",
    mesa: "En mesa"
  };
  return tipos[tipo] || tipo;
}

function limpiarOrden() {
  // Vaciar datos
  orden = {};
  tipoPedido = "";

  // Reset contador
  const contador = document.getElementById("order-count");
  if (contador) contador.innerText = "0";

  // Limpiar lista del modal
  const lista = document.getElementById("order-list");
  if (lista) lista.innerHTML = "";

  // Reset total
  const totalEl = document.getElementById("order-total");
  if (totalEl) totalEl.innerText = "$0";

  // Limpiar nombre cliente
  const nombreInput = document.getElementById("customer-name");
  if (nombreInput) nombreInput.value = "";

  // Quitar selección de tipo pedido
  document.querySelectorAll(".order-options button")
    .forEach(b => b.classList.remove("active"));

  // Limpiar campos extra (dirección / mesa)
  const extraFields = document.getElementById("extra-fields");
  if (extraFields) extraFields.innerHTML = "";

  // Reset scroll hint
  const hint = document.querySelector(".scroll-hint");
  if (hint) hint.style.display = "none";
}

function aplicarColores(colores) {
  if (!colores) return;

  const root = document.documentElement;

  root.style.setProperty("--accent-color", colores.primario);
  root.style.setProperty("--accent-contrast", colores.secundario);  
  root.style.setProperty("--add-btn-color", colores.btnagregar);
}


function mostrarToastAgregado() {
  const toast = document.getElementById("toast-agregado");
  if (!toast) return;

  toast.classList.remove("hidden");
  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 1200);
}

function scrollToMenuCategorias() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const top = menu.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top,
    behavior: "auto"
  });
}