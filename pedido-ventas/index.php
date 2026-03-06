<!DOCTYPE html>
<!--
    Documento principal de la aplicación de captura de pedidos.
    Idioma configurado en español.
-->
<html lang="es">
<head>
    <!-- Configuración básica del documento -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Título que aparece en la pestaña del navegador -->
    <title>Pedimento de Órdenes de Venta</title>

    <!-- Hoja de estilos principal del proyecto -->
    <link rel="stylesheet" href="style.css">

    <!--
        Flatpickr:
        Librería externa para mostrar un selector de fecha y hora más amigable
        que el input nativo del navegador.
    -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
</head>
<body>
    <!--
        Contenedor principal de toda la aplicación.
        Ayuda a centrar y organizar visualmente el contenido.
    -->
    <div class="container">

        <!-- Encabezado principal de la app -->
        <header class="app-header">
            <!-- Caja del logo o iniciales de la aplicación -->
            <div class="logo-box">IF</div>

            <div>
                <!-- Título principal visible al usuario -->
                <h1>Pedimento de Órdenes de Venta</h1>

                <!--
                    Loader o mensaje de carga.
                    Se muestra mientras se obtienen clientes y productos
                    desde los servicios web, y luego se oculta desde app.js.
                -->
                <div id="loader" class="loader">
                    Cargando información...
                </div>

                <!-- Descripción corta del propósito de la aplicación -->
                <p>Alta de pedidos con consulta de clientes y productos desde servicio web.</p>
            </div>
        </header>

        <!-- Tarjeta visual principal que contiene el formulario -->
        <main class="card">

            <!--
                Formulario principal para registrar un pedido.
                Será controlado por JavaScript mediante el archivo app.js
            -->
            <form id="pedidoForm">

                <!--
                    Primera sección del formulario:
                    datos generales del pedido
                -->
                <div class="form-grid">

                    <!-- Campo de selección del cliente -->
                    <div class="form-group">
                        <label for="cliente">Cliente</label>

                        <!--
                            Este select se llena dinámicamente con JavaScript
                            después de consultar la API de clientes.
                        -->
                        <select id="cliente" required>
                            <option value="">Cargando clientes...</option>
                        </select>
                    </div>

                    <!-- Campo para seleccionar fecha y hora de entrega -->
                    <div class="form-group">
                        <label for="fechaEntrega">Fecha y hora de entrega</label>

                        <!--
                            Input tipo texto porque Flatpickr se encarga
                            de convertirlo en selector de fecha/hora.
                        -->
                        <input
                            type="text"
                            id="fechaEntrega"
                            placeholder="Seleccione fecha y hora"
                            required
                        >
                    </div>
                </div>

                <!-- Sección dinámica para agregar productos al pedido -->
                <section class="productos-section">

                    <!-- Encabezado de la sección de productos -->
                    <div class="section-header">
                        <h2>Productos</h2>

                        <!--
                            Botón para agregar una nueva fila de producto.
                            No envía el formulario porque su tipo es "button".
                        -->
                        <button type="button" id="btnAgregarProducto" class="btn-secondary">
                            + Agregar producto
                        </button>
                    </div>

                    <!--
                        Contenedor donde JavaScript insertará dinámicamente
                        las filas de productos seleccionados.
                    -->
                    <div id="productosContainer"></div>
                </section>

                <!-- Sección de totales del pedido -->
                <section class="totales">

                    <!-- Subtotal general calculado en JavaScript -->
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <strong id="subtotalGeneral">$0.00</strong>
                    </div>

                    <!-- Total final del pedido -->
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <strong id="totalGeneral">$0.00</strong>
                    </div>
                </section>

                <!-- Acciones principales del formulario -->
                <div class="actions">

                    <!--
                        Botón para enviar el pedido.
                        El evento submit es interceptado por JavaScript
                        para validar y enviar los datos al backend.
                    -->
                    <button type="submit" class="btn-primary">Enviar</button>
                </div>

                <!--
                    Área para mostrar mensajes al usuario:
                    éxito, error o validaciones.
                -->
                <div id="mensaje" class="mensaje"></div>
            </form>
        </main>
    </div>

    <!-- Script de la librería Flatpickr -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <!-- Script principal de la aplicación -->
    <script src="app.js"></script>
</body>
</html>