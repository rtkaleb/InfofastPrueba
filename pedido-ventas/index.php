<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedimento de Órdenes de Venta</title>

    <link rel="stylesheet" href="style.css">

    <!-- Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
</head>
<body>
    <div class="container">
        <header class="app-header">
            <div class="logo-box">IF</div>
            <div>
                <h1>Pedimento de Órdenes de Venta</h1>
                <div id="loader" class="loader">
    Cargando información...
</div>
                <p>Alta de pedidos con consulta de clientes y productos desde servicio web.</p>
            </div>
        </header>

        <main class="card">
            <form id="pedidoForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="cliente">Cliente</label>
                        <select id="cliente" required>
                            <option value="">Cargando clientes...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="fechaEntrega">Fecha y hora de entrega</label>
                        <input type="text" id="fechaEntrega" placeholder="Seleccione fecha y hora" required>
                    </div>
                </div>

                <section class="productos-section">
                    <div class="section-header">
                        
                        <h2>Productos</h2>
                        <button type="button" id="btnAgregarProducto" class="btn-secondary">
                            + Agregar producto
                        </button>
                    </div>

                    <div id="productosContainer"></div>
                </section>

                <section class="totales">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <strong id="subtotalGeneral">$0.00</strong>
                    </div>
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <strong id="totalGeneral">$0.00</strong>
                    </div>
                </section>

                <div class="actions">
                    <button type="submit" class="btn-primary">Enviar</button>
                </div>

                <div id="mensaje" class="mensaje"></div>
            </form>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="app.js"></script>
</body>
</html>