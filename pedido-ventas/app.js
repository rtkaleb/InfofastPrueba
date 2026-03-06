let clientes = [];
let productos = [];

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(valor);
}

document.addEventListener("DOMContentLoaded", async () => {
    flatpickr("#fechaEntrega", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: new Date(Date.now() + 60000)
    });

    await cargarClientes();
    await cargarProductos();

    document.getElementById("btnAgregarProducto").addEventListener("click", agregarFilaProducto);
    document.getElementById("pedidoForm").addEventListener("submit", guardarPedido);
    document.getElementById("loader").style.display = "none";

    agregarFilaProducto();
});


async function cargarClientes() {
    try {
        const res = await fetch("api/proxy_clientes.php");
        const data = await res.json();

        if (data.ok === false) {
            throw new Error(data.message);
        }

        clientes = normalizarClientes(data);
        console.log("CLIENTES NORMALIZADOS:", clientes);

        const select = document.getElementById("cliente");
        select.innerHTML = `<option value="">Seleccione un cliente</option>`;

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

async function cargarProductos() {
    try {
        const res = await fetch("api/proxy_productos.php");
        const data = await res.json();

        if (data.ok === false) {
            throw new Error(data.message);
        }

        productos = normalizarProductos(data);
        console.log("PRODUCTOS NORMALIZADOS:", productos);
    } catch (error) {
        console.error("ERROR EN cargarProductos():", error);
        mostrarMensaje("No fue posible cargar productos.", "error");
    }
}

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
    })).filter(c => c.id && c.nombre);
}

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
    })).filter(p => p.id && p.nombre);
}

function productosSeleccionados() {
    const selects = document.querySelectorAll(".producto-select");
    const ids = [];

    selects.forEach(s => {
        if (s.value) ids.push(s.value);
    });

    return ids;
    }

function agregarFilaProducto() {
    const container = document.getElementById("productosContainer");
    const row = document.createElement("div");
    row.className = "product-row";

    const seleccionados = productosSeleccionados();

const productOptions = productos
    .filter(p => !seleccionados.includes(String(p.id)))
    .map(p => `
        <option value="${p.id}" data-precio="${p.precio}" data-nombre="${p.nombre}">
            ${p.nombre} - $${p.precio.toFixed(2)}
        </option>
    `).join("");

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

    const select = row.querySelector(".producto-select");
    const cantidad = row.querySelector(".cantidad-input");
    const precio = row.querySelector(".precio-input");
    const subtotal = row.querySelector(".subtotal-input");
    const btnEliminar = row.querySelector(".btn-eliminar");

    function recalcularFila() {
        const option = select.options[select.selectedIndex];
        const precioUnitario = parseFloat(option?.dataset?.precio || 0);    
        const cant = parseInt(cantidad.value || 0);
        const sub = precioUnitario * cant;

        precio.value = formatoMoneda(precioUnitario);
        subtotal.value = formatoMoneda(sub);

        recalcularTotales();
    }

    

    select.addEventListener("change", recalcularFila);
    cantidad.addEventListener("input", recalcularFila);

    btnEliminar.addEventListener("click", () => {
        row.remove();
        recalcularTotales();
    });

    recalcularFila();
}

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

async function guardarPedido(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const clienteSelect = document.getElementById("cliente");
    const clienteId = clienteSelect.value;
    const clienteNombre = clienteSelect.options[clienteSelect.selectedIndex].textContent;
    const fechaEntrega = document.getElementById("fechaEntrega").value;

    const rows = document.querySelectorAll(".product-row");

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

        if (!data.ok) {
            throw new Error(data.message || "No se pudo guardar el pedido.");
        }

        mostrarMensaje(`Pedido recibido correctamente. Folio interno: ${data.pedido_id}`, "ok");
        limpiarFormulario();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

function limpiarFormulario() {
    document.getElementById("cliente").value = "";
    document.getElementById("fechaEntrega").value = "";
    document.getElementById("productosContainer").innerHTML = "";
    document.getElementById("subtotalGeneral").textContent = formatoMoneda(0);
    document.getElementById("totalGeneral").textContent = formatoMoneda(0);
    agregarFilaProducto();
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}