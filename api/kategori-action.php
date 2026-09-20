<?php
/**
 * api/kategori-action.php
 * Tambah / edit / hapus kategori custom (disimpan di settings.json).
 * Hanya bisa diakses setelah login (session check).
 *
 * Payload: { action: 'add'|'edit'|'delete', data: { id, name, jp?, icon? } }
 */

session_start();
header('Content-Type: application/json');

// ── Auth check ────────────────────────────────────────────
if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$body   = json_decode(file_get_contents('php://input'), true);
$action = isset($body['action']) ? (string)$body['action'] : '';
$data   = isset($body['data']) && is_array($body['data']) ? $body['data'] : [];

$dataDir = __DIR__ . '/../data/';

function kenshin_settings($dir) {
    $f = $dir . 'settings.json';
    $d = file_exists($f) ? json_decode(file_get_contents($f), true) : [];
    return is_array($d) ? $d : [];
}

function kenshin_save_settings($dir, $settings) {
    file_put_contents($dir . 'settings.json', json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function kenshin_slug($id) {
    $s = strtolower(trim((string)$id));
    $s = preg_replace('/\s+/g', '-', $s);
    return preg_replace('/[^a-z0-9-]/', '', $s);
}

// ── TAMBAH kategori ───────────────────────────────────────
if ($action === 'add') {
    $id   = kenshin_slug($data['id'] ?? '');
    $name = trim((string)($data['name'] ?? ''));
    if ($id === '' || $name === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID dan nama kategori wajib diisi']);
        exit;
    }

    $settings = kenshin_settings($dataDir);
    if (!isset($settings['custom_kategori']) || !is_array($settings['custom_kategori'])) {
        $settings['custom_kategori'] = [];
    }

    foreach ($settings['custom_kategori'] as $k) {
        if (is_array($k) && ($k['id'] ?? '') === $id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID kategori sudah ada']);
            exit;
        }
    }

    $settings['custom_kategori'][] = [
        'id'   => $id,
        'name' => mb_substr($name, 0, 60),
        'jp'   => mb_substr(trim((string)($data['jp'] ?? '')), 0, 60),
        'icon' => (string)($data['icon'] ?? '🍽️'),
    ];

    kenshin_save_settings($dataDir, $settings);
    echo json_encode(['success' => true, 'message' => 'Kategori berhasil ditambahkan']);
    exit;
}

// ── EDIT kategori ─────────────────────────────────────────
if ($action === 'edit') {
    $id   = kenshin_slug($data['id'] ?? '');
    $name = trim((string)($data['name'] ?? ''));
    if ($id === '' || $name === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID dan nama kategori wajib diisi']);
        exit;
    }

    $settings = kenshin_settings($dataDir);
    $list = isset($settings['custom_kategori']) && is_array($settings['custom_kategori'])
        ? $settings['custom_kategori'] : [];

    $found = false;
    foreach ($list as $i => $k) {
        if (is_array($k) && ($k['id'] ?? '') === $id) {
            $list[$i]['name'] = mb_substr($name, 0, 60);
            $list[$i]['icon'] = (string)($data['icon'] ?? ($k['icon'] ?? '🍽️'));
            $list[$i]['jp']   = mb_substr(trim((string)($data['jp'] ?? '')), 0, 60);
            $found = true;
            break;
        }
    }
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Kategori tidak ditemukan']);
        exit;
    }

    $settings['custom_kategori'] = $list;
    kenshin_save_settings($dataDir, $settings);
    echo json_encode(['success' => true, 'message' => 'Kategori berhasil diupdate']);
    exit;
}

// ── HAPUS kategori ────────────────────────────────────────
if ($action === 'delete') {
    $id = kenshin_slug($data['id'] ?? '');
    if ($id === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID kategori diperlukan']);
        exit;
    }

    $settings = kenshin_settings($dataDir);
    $list = isset($settings['custom_kategori']) && is_array($settings['custom_kategori'])
        ? $settings['custom_kategori'] : [];

    $before = count($list);
    $list = array_values(array_filter($list, function ($k) use ($id) {
        return !(is_array($k) && ($k['id'] ?? '') === $id);
    }));
    $settings['custom_kategori'] = $list;

    kenshin_save_settings($dataDir, $settings);
    echo json_encode([
        'success' => true,
        'message' => ($before === count($list)) ? 'Kategori tidak ditemukan' : 'Kategori berhasil dihapus',
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
