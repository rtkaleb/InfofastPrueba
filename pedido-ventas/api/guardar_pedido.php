<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        throw new Exception("No se recibió información válida.");
    }

    $cliente = $input['cliente'] ?? null;
    $fechaEntrega = $input['fecha_entrega'] ?? null;
    $productos = $input['productos'] ?? [];

    if (!$cliente || empty($cliente['id'])) {
        throw new Exception("Debe seleccionar un cliente.");
    }

    if (!$fechaEntrega) {
        throw new Exception("Debe seleccionar una fecha.");
    }

    $fechaSeleccionada = strtotime($fechaEntrega);
    if ($fechaSeleccionada <= time()) {
        throw new Exception("La fecha debe ser mayor a la actual.");
    }

    if (count($productos) === 0) {
        throw new Exception("Debe agregar al menos un producto.");
    }

    $subtotalGeneral = 0;

    foreach ($productos as $p) {
        if (empty($p['id']) || empty($p['cantidad']) || $p['cantidad'] <= 0) {
            throw new Exception("Todos los productos deben tener cantidad válida.");
        }

        $subtotalGeneral += ((float)$p['precio_unitario']) * ((int)$p['cantidad']);
    }

    $total = $subtotalGeneral;

    $pdo = getConnection();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO pedidos (cliente_id, cliente_nombre, fecha_entrega, subtotal, total)
        VALUES (:cliente_id, :cliente_nombre, :fecha_entrega, :subtotal, :total)
    ");

    $stmt->execute([
        ':cliente_id' => $cliente['id'],
        ':cliente_nombre' => $cliente['nombre'] ?? '',
        ':fecha_entrega' => $fechaEntrega,
        ':subtotal' => $subtotalGeneral,
        ':total' => $total
    ]);

    $pedidoId = $pdo->lastInsertId();

    $stmtDetalle = $pdo->prepare("
        INSERT INTO pedido_detalle
        (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal)
        VALUES
        (:pedido_id, :producto_id, :producto_nombre, :cantidad, :precio_unitario, :subtotal)
    ");

    foreach ($productos as $p) {
        $subtotal = ((float)$p['precio_unitario']) * ((int)$p['cantidad']);

        $stmtDetalle->execute([
            ':pedido_id' => $pedidoId,
            ':producto_id' => $p['id'],
            ':producto_nombre' => $p['nombre'] ?? '',
            ':cantidad' => (int)$p['cantidad'],
            ':precio_unitario' => (float)$p['precio_unitario'],
            ':subtotal' => $subtotal
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'ok' => true,
        'message' => 'Pedido guardado correctamente.',
        'pedido_id' => $pedidoId
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}