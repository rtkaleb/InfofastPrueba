// Arreglos globales donde se almacenarán los clientes y productos
// después de cargarlos desde la API.
let clientes = [];
let productos = [];

/**
 * Da formato de moneda mexicana a un valor numérico.
 * Ejemplo: 1234.5 -> "$1,234.50"
 * @param {number} valor
 * @returns {string}
 */
function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(valor);
}

/**
 * Cuando el documento termina de cargar:
 * 1. Inicializa el selector de fecha/hora.
 * 2. Carga clientes y productos desde la API.
 * 3. Registra los eventos principales del formulario.
 * 4. Oculta el loader.
 * 5. Agrega una primera fila de producto por defecto.
 */
document.addEventListener("DOMContentLoaded", async () => {
    flatpickr("#fechaEntrega", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        // La fecha mínima permitida es 1 minuto después del momento actual
        minDate: new Date(Date.now() + 60000)
    });

    await cargarClientes();
    await cargarProductos();

    document.getElementById("btnAgregarProducto").addEventListener("click", agregarFilaProducto);
    document.getElementById("pedidoForm").addEventListener("submit", guardarPedido);

    // Oculta el indicador de carga una vez que todo está listo
    document.getElementById("loader").style.display = "none";

    // Agrega una fila inicial para facilitar la captura
    agregarFilaProducto();
});

/**
 * Obtiene la lista de clientes desde el backend,
 * la normaliza y llena el <select> de clientes.
 */
async function cargarClientes() {
    try {
        const res = await fetch("api/proxy_clientes.php");
        const data = await res.json();

        // Si la API responde con ok=false, se considera error controlado
        if (data.ok === false) {
            throw new Error(data.message);
        }

        // Convierte la respuesta a una estructura uniforme
        clientes = normalizarClientes(data);
        console.log("CLIENTES NORMALIZADOS:", clientes);

        const select = document.getElementById("cliente");
        select.innerHTML = `<option value="">Seleccione un cliente</option>`;

        // Llena el combo con los clientes disponibles
        clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("ERROR EN cargarClientes():", error);
        mostrarMensaje("No fue posible cargar clientes.", "error");
    }
}

/**
 * Obtiene la lista de productos desde el backend
 * y la guarda normalizada en memoria.
 */
async function cargarProductos() {
    try {
        const res = await fetch("api/proxy_productos.php");
        const data = await res.json();

        // Si la API devuelve ok=false, lanzamos error
        if (data.ok === false) {
            throw new Error(data.message);
        }

        // Convierte la respuesta a una estructura uniforme
        productos = normalizarProductos(data);
        console.log("PRODUCTOS NORMALIZADOS:", productos);
    } catch (error) {
        console.error("ERROR EN cargarProductos():", error);
        mostrarMensaje("No fue posible cargar productos.", "error");
    }
}

/**
 * Normaliza la estructura de clientes, ya que el backend
 * podría regresar los datos con distintos nombres de propiedades.
 *
 * Siempre devuelve objetos con esta forma:
 * { id: "...", nombre: "..." }
 *
 * @param {Array|Object} data
 * @returns {Array}
 */
function normalizarClientes(data) {
    const arr = Array.isArray(data)
        ? data
        : (data.data || data.clientes || data.result || []);

    return arr.map(c => ({
        id: String(
            c.id_cliente ??
            c.id ??
            c.ID ??
            c.cliente_id ??
            c.CveCliente ??
            c.codigo ??
            ""
        ),
        nombre: String(
            c.nombre ??
            c.Nombre ??
            c.razon_social ??
            c.RazonSocial ??
            c.descripcion ??
            "Cliente sin nombre"
        )
    }))
    // Solo conserva clientes válidos
    .filter(c => c.id && c.nombre);
}

/**
 * Normaliza la estructura de productos, ya que el backend
 * podría regresar los datos con distintos nombres de propiedades.
 *
 * Siempre devuelve objetos con esta forma:
 * { id: "...", nombre: "...", precio: 0 }
 *
 * @param {Array|Object} data
 * @returns {Array}
 */
function normalizarProductos(data) {
    const arr = Array.isArray(data)
        ? data
        : (data.data || data.productos || data.result || []);

    return arr.map(p => ({
        id: String(
            p.id_producto ??
            p.id ??
            p.ID ??
            p.producto_id ??
            p.CveArticulo ??
            p.codigo ??
            ""
        ),
        nombre: String(
            p.nombre ??
            p.Nombre ??
            p.descripcion ??
            p.Descripcion ??
            "Producto sin nombre"
        ),
        precio: parseFloat(
            p.Precio ??
            p.precio ??
            p.precio_unitario ??
            p.PrecioUnitario ??
            0
        )
    }))
    // Solo conserva productos válidos
    .filter(p => p.id && p.nombre);
}

/**
 * Obtiene los IDs de los productos que ya fueron seleccionados
 * en las filas actuales del formulario.
 *
 * Esto se usa para evitar que un mismo producto aparezca repetido
 * en varias filas.
 *
 * @returns {Array<string>}
 */
function productosSeleccionados() {
    const selects = document.querySelectorAll(".producto-select");
    const ids = [];

    selects.forEach(s => {
        if (s.value) ids.push(s.value);
    });

    return ids;
}

/**
 * Agrega dinámicamente una fila nueva de producto al formulario.
 *
 * Cada fila contiene:
 * - selector de producto
 * - cantidad
 * - precio unitario (solo lectura)
 * - subtotal (solo lectura)
 * - botón para eliminar la fila
 */
function agregarFilaProducto() {
    const container = document.getElementById("productosContainer");
    const row = document.createElement("div");
    row.className = "product-row";

    // Obtiene los productos ya elegidos para no repetir opciones
    const seleccionados = productosSeleccionados();

    const productOptions = productos
        .filter(p => !seleccionados.includes(String(p.id)))
        .map(p => `
            <option value="${p.id}" data-precio="${p.precio}" data-nombre="${p.nombre}">
                ${p.nombre} - $${p.precio.toFixed(2)}
            </option>
        `)
        .join("");

    row.innerHTML = `
        <select class="producto-select">
            <option value="">Seleccione un producto</option>
            ${productOptions}
        </select>

        <input type="number" class="cantidad-input" min="1" value="1" placeholder="Cantidad">

        <input type="text" class="precio-input" placeholder="Precio" readonly>

        <input type="text" class="subtotal-input" placeholder="Subtotal" readonly>

        <button type="button" class="btn-danger btn-eliminar">X</button>
    `;

    container.appendChild(row);

    // Referencias a los elementos internos de la fila recién creada
    const select = row.querySelector(".producto-select");
    const cantidad = row.querySelector(".cantidad-input");
    const precio = row.querySelector(".precio-input");
    const subtotal = row.querySelector(".subtotal-input");
    const btnEliminar = row.querySelector(".btn-eliminar");

    /**
     * Recalcula el precio mostrado y subtotal de esta fila
     * según el producto seleccionado y la cantidad capturada.
     */
    function recalcularFila() {
        const option = select.options[select.selectedIndex];
        const precioUnitario = parseFloat(option?.dataset?.precio || 0);
        const cant = parseInt(cantidad.value || 0);
        const sub = precioUnitario * cant;

        precio.value = formatoMoneda(precioUnitario);
        subtotal.value = formatoMoneda(sub);

        // Cada vez que cambia una fila, también recalculamos el total general
        recalcularTotales();
    }

    // Recalcula cuando cambia el producto o la cantidad
    select.addEventListener("change", recalcularFila);
    cantidad.addEventListener("input", recalcularFila);

    // Elimina la fila y actualiza los totales
    btnEliminar.addEventListener("click", () => {
        row.remove();
        recalcularTotales();
    });

    // Inicializa los valores de la fila
    recalcularFila();
}

/**
 * Recorre todas las filas de productos y calcula:
 * - subtotal general
 * - total general
 *
 * En este caso ambos valores son iguales porque no se aplican
 * impuestos, descuentos o cargos extra.
 */
function recalcularTotales() {
    const rows = document.querySelectorAll(".product-row");
    let subtotalGeneral = 0;

    rows.forEach(row => {
        const select = row.querySelector(".producto-select");
        const cantidad = parseInt(row.querySelector(".cantidad-input").value || 0);
        const option = select.options[select.selectedIndex];
        const precio = parseFloat(option?.dataset?.precio || 0);

        subtotalGeneral += precio * cantidad;
    });

    document.getElementById("subtotalGeneral").textContent = formatoMoneda(subtotalGeneral);
    document.getElementById("totalGeneral").textContent = formatoMoneda(subtotalGeneral);
}

/**
 * Valida los campos del formulario antes de guardar.
 *
 * Reglas:
 * - Debe existir cliente
 * - Debe existir fecha
 * - La fecha debe ser futura
 * - Debe haber al menos una fila
 * - Debe haber al menos un producto válido con cantidad > 0
 *
 * @returns {boolean}
 */
function validarFormulario() {
    const clienteId = document.getElementById("cliente").value;
    const fecha = document.getElementById("fechaEntrega").value;

    if (!clienteId) {
        mostrarMensaje("Debe seleccionar un cliente.", "error");
        return false;
    }

    if (!fecha) {
        mostrarMensaje("Debe seleccionar una fecha.", "error");
        return false;
    }

    // Convierte la fecha del input a objeto Date para comparar
    const fechaSeleccionada = new Date(fecha.replace(" ", "T"));
    const ahora = new Date();

    if (fechaSeleccionada <= ahora) {
        mostrarMensaje("La fecha debe ser mayor a la actual.", "error");
        return false;
    }

    const rows = document.querySelectorAll(".product-row");

    if (rows.length === 0) {
        mostrarMensaje("Debe agregar al menos un producto.", "error");
        return false;
    }

    let hayProductoValido = false;

    for (const row of rows) {
        const productoId = row.querySelector(".producto-select").value;
        const cantidad = parseInt(row.querySelector(".cantidad-input").value || 0);

        if (productoId && cantidad > 0) {
            hayProductoValido = true;
        }
    }

    if (!hayProductoValido) {
        mostrarMensaje("Debe seleccionar al menos un producto válido.", "error");
        return false;
    }

    return true;
}

/**
 * Envía el pedido al backend cuando el usuario manda el formulario.
 *
 * @param {Event} e
 */
async function guardarPedido(e) {
    e.preventDefault();

    // Si la validación falla, no continúa con el guardado
    if (!validarFormulario()) return;

    const clienteSelect = document.getElementById("cliente");
    const clienteId = clienteSelect.value;
    const clienteNombre = clienteSelect.options[clienteSelect.selectedIndex].textContent;
    const fechaEntrega = document.getElementById("fechaEntrega").value;

    const rows = document.querySelectorAll(".product-row");

    // Construye el arreglo de productos seleccionados para enviarlo a la API
    const productosSeleccionados = [];

    rows.forEach(row => {
        const select = row.querySelector(".producto-select");
        const option = select.options[select.selectedIndex];
        const productoId = select.value;
        const productoNombre = option?.dataset?.nombre || "";
        const precioUnitario = parseFloat(option?.dataset?.precio || 0);
        const cantidad = parseInt(row.querySelector(".cantidad-input").value || 0);

        if (productoId && cantidad > 0) {
            productosSeleccionados.push({
                id: productoId,
                nombre: productoNombre,
                cantidad: cantidad,
                precio_unitario: precioUnitario
            });
        }
    });

    try {
        const res = await fetch("api/guardar_pedido.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cliente: {
                    id: clienteId,
                    nombre: clienteNombre
                },
                fecha_entrega: fechaEntrega,
                productos: productosSeleccionados
            })
        });

        const data = await res.json();

        // Si la respuesta no es exitosa, lanza error
        if (!data.ok) {
            throw new Error(data.message || "No se pudo guardar el pedido.");
        }

        mostrarMensaje(`Pedido recibido correctamente. Folio interno: ${data.pedido_id}`, "ok");
        limpiarFormulario();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

/**
 * Limpia todos los campos del formulario y deja el estado inicial.
 */
function limpiarFormulario() {
    document.getElementById("cliente").value = "";
    document.getElementById("fechaEntrega").value = "";
    document.getElementById("productosContainer").innerHTML = "";
    document.getElementById("subtotalGeneral").textContent = formatoMoneda(0);
    document.getElementById("totalGeneral").textContent = formatoMoneda(0);

    // Deja una fila vacía lista para capturar un nuevo pedido
    agregarFilaProducto();
}

/**
 * Muestra un mensaje visual al usuario.
 *
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje: "ok" o "error"
 */
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}