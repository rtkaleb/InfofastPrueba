CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id TEXT NOT NULL,
    cliente_nombre TEXT,
    fecha_entrega TEXT NOT NULL,
    subtotal REAL NOT NULL,
    total REAL NOT NULL,
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id TEXT NOT NULL,
    producto_nombre TEXT,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);