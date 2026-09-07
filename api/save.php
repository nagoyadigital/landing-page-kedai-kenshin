<?php
/**
 * api/save.php
 * Menyimpan data settings atau menu overrides ke file JSON.
 * Hanya bisa diakses setelah login (session check).
 */

session_start();
header('Content-Type: application/json');

// ── Auth check ────────────────────────────────────────────
if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// ── Read request body ─────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bad request']);
    exit;
}

$dataDir = __DIR__ . '/../data/';

// ── Handle save type ──────────────────────────────────────
switch ($body['type']) {

    case 'settings':
        $allowed = ['wa_number', 'alamat', 'status_buka'];
        $existing = file_exists($dataDir . 'settings.json')
            ? json_decode(file_get_contents($dataDir . 'settings.json'), true)
            : [];

        foreach ($allowed as $key) {
            if (isset($body['data'][$key])) {
                $existing[$key] = $body['data'][$key];
            }
        }

        // Validasi nomor WA
        if (!empty($existing['wa_number']) && !preg_match('/^\d{10,15}$/', $existing['wa_number'])) {
            echo json_encode(['success' => false, 'message' => 'Format nomor WA tidak valid']);
            exit;
        }

        file_put_contents($dataDir . 'settings.json', json_encode($existing, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Settings berhasil disimpan']);
        break;

    case 'menu':
        if (!isset($body['data']) || !is_array($body['data'])) {
            echo json_encode(['success' => false, 'message' => 'Data menu tidak valid']);
            exit;
        }

        $existing = file_exists($dataDir . 'menu_overrides.json')
            ? json_decode(file_get_contents($dataDir . 'menu_overrides.json'), true)
            : [];
        if (!is_array($existing)) $existing = [];

        foreach ($body['data'] as $id => $override) {
            $id = (string)$id;
            // Merge — jangan timpa field yang sudah ada
            if (!isset($existing[$id])) $existing[$id] = [];

            // Field yang boleh di-override
            if (isset($override['harga']))    $existing[$id]['harga']    = (int)$override['harga'];
            if (isset($override['status']))   $existing[$id]['status']   = (string)$override['status'];
            if (isset($override['img']))      $existing[$id]['img']      = (string)$override['img'];
            if (isset($override['name']))     $existing[$id]['name']     = (string)$override['name'];
            if (isset($override['desc']))     $existing[$id]['desc']     = (string)$override['desc'];
            if (isset($override['kategori'])) $existing[$id]['kategori'] = (string)$override['kategori'];
            // Pertahankan flag internal
            if (isset($override['_isCustom'])) $existing[$id]['_isCustom'] = (bool)$override['_isCustom'];
            if (isset($override['_deleted']))  $existing[$id]['_deleted']  = (bool)$override['_deleted'];
        }

        file_put_contents($dataDir . 'menu_overrides.json', json_encode($existing, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Menu berhasil disimpan']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipe tidak dikenal']);
}
