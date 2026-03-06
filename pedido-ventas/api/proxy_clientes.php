<?php
header('Content-Type: application/json; charset=utf-8');

$url = "https://www.infofast.com.mx/Erick/service/clientes/";

$postData = [
    'user' => 'user_pruebas',
    'pwd'  => 'Pru3B@5.'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Error al consultar clientes',
        'error' => curl_error($ch)
    ]);
    exit;
}

echo $response;