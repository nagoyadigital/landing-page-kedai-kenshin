<?php
/**
 * api/menu-action.php
 * Tambah / edit / hapus menu lewat admin panel.
 * Hanya bisa diakses setelah login (session check).
 *
 * Payload: { action: 'add'|'edit'|'delete', data: {...} }
 *   add    : { name, kategori, harga, desc, status } -> { success, id, message }
 *   edit   : { id, name?, kategori?, harga?, desc?, status? } -> { success, message }
 *   delete : { id } -> soft delete ({_deleted:true}) -> { success, message }
 */

session_start();
header('Content-Type: application/json');

// ── Auth check ────────────────────────────────────────────
if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$action = isset($body['action']) ? (string)$body['action'] : '';
$data   = isset($body['data']) && is_array($body['data']) ? $body['data'] : [];

$dataDir = __DIR__ . '/../data/';
function kenshin_overrides($dir) {
    $f = $dir . 'menu_overrides.json';
    $d = file_exists($f) ? json_decode(file_get_contents($f), true) : [];
    return is_array($d) ? $d : [];
}

// ── TAMBAH menu baru ──────────────────────────────────────
if ($action === 'add') {
    $name     = trim((string)($data['name'] ?? ''));
    $kategori = trim((string)($data['kategori'] ?? ''));
    if ($name === '' || $kategori === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nama dan kategori wajib diisi']);
        exit;
    }
    $price  = (int)($data['harga'] ?? 0);
    $desc   = trim((string)($data['desc'] ?? ''));
    $status = (($data['status'] ?? 'tersedia') === 'habis') ? 'habis' : 'tersedia';

    $overrides = kenshin_overrides($dataDir);

    // ID baru: mulai dari 1000 (menu custom) agar tidak bentrok ID statis
    $customMax = 999;
    foreach (array_keys($overrides) as $k) {
        $n = (int)$k;
        if ($n >= 1000 && $n > $customMax) $customMax = $n;
    }
    $newId = (string)($customMax + 1);

    $overrides[$newId] = [
        '_isCustom' => true,
        'name'      => mb_substr($name, 0, 100),
        'kategori'  => mb_substr($kategori, 0, 60),
        'harga'     => $price,
        'desc'      => mb_substr($desc, 0, 300),
        'status'    => $status,
        'img'       => null,
    ];

    file_put_contents($dataDir . 'menu_overrides.json', json_encode($overrides, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Menu berhasil ditambahkan']);
    exit;
}

// ── EDIT menu ─────────────────────────────────────────────
if ($action === 'edit') {
    $id = (string)($data['id'] ?? '');
    if ($id === '' || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID menu diperlukan']);
        exit;
    }

    $overrides = kenshin_overrides($dataDir);
    if (!isset($overrides[$id])) $overrides[$id] = [];

    if (isset($data['name']))     $overrides[$id]['name']     = mb_substr(trim((string)$data['name']), 0, 100);
    if (isset($data['kategori'])) $overrides[$id]['kategori']  = mb_substr(trim((string)$data['kategori']), 0, 60);
    if (isset($data['harga']))    $overrides[$id]['harga']    = (int)$data['harga'];
    if (isset($data['desc']))     $overrides[$id]['desc']     = mb_substr(trim((string)$data['desc']), 0, 300);
    if (isset($data['status']))   $overrides[$id]['status']   = ($data['status'] === 'habis') ? 'habis' : 'tersedia';

    file_put_contents($dataDir . 'menu_overrides.json', json_encode($overrides, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'message' => 'Menu berhasil diupdate']);
    exit;
}

// ── HAPUS menu (soft delete) ──────────────────────────────
if ($action === 'delete') {
    $id = (string)($data['id'] ?? '');
    if ($id === '' || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID menu diperlukan']);
        exit;
    }

    $overrides = kenshin_overrides($dataDir);
    if (isset($overrides[$id])) {
        $overrides[$id]['_deleted'] = true;
        file_put_contents($dataDir . 'menu_overrides.json', json_encode($overrides, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true, 'message' => 'Menu berhasil dihapus']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
