<?php

function getConnection(): PDO
{
    $dbPath = __DIR__ . '/data/ventas.sqlite';
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}