<?php
require_once 'db.php';

$pdo = getConnection();
$sql = file_get_contents(__DIR__ . '/init.sql');
$pdo->exec($sql);

echo "Base de datos creada correctamente.";