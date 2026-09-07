<?php
/**
 * api/upload-image.php
 * Upload foto menu. Hanya bisa diakses setelah login.
 *
 * Penyimpanan lewat storage seam (api/lib/storage.php):
 *   STORAGE_DRIVER=local -> images/menu/ (perilaku lama, persisten di shared)
 *   STORAGE_DRIVER=r2    -> Cloudflare R2 + optimasi resize/WebP
 *
 * Response img selalu URL siap render (path lokal atau URL R2).
 */

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/lib/storage.php';

// ── Auth ──────────────────────────────────────────────────
if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// ── Validasi input ────────────────────────────────────────
$menuId = isset($_POST['menu_id']) ? (string)intval($_POST['menu_id']) : null;
if (!$menuId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'menu_id diperlukan']);
    exit;
}

if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errMsg = isset($_FILES['foto']) ? 'Upload error: ' . $_FILES['foto']['error'] : 'File tidak ditemukan';
    echo json_encode(['success' => false, 'message' => $errMsg]);
    exit;
}

// ── Validasi tipe & ukuran ────────────────────────────────
$allowed   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$extMap    = ['image/jpeg' => '.jpg', 'image/png' => '.png', 'image/webp' => '.webp', 'image/gif' => '.gif'];
$mimeType  = mime_content_type($_FILES['foto']['tmp_name']);
$cfg       = kenshin_image_config();
$maxSize   = $cfg['max_mb'] * 1024 * 1024;

if (!in_array($mimeType, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.']);
    exit;
}
if ($_FILES['foto']['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'Ukuran file maksimal ' . $cfg['max_mb'] . 'MB.']);
    exit;
}

$bytes = file_get_contents($_FILES['foto']['tmp_name']);
if ($bytes === false || $bytes === '') {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal membaca file upload']);
    exit;
}

// ── Simpan via storage seam (R2 atau lokal + optimasi) ────
[$ok, $storedOrMsg, $isRemote] = kenshin_storage_put($bytes, $menuId, $extMap[$mimeType], $mimeType);
if (!$ok) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $storedOrMsg]);
    exit;
}
$stored = $storedOrMsg;

// ── Update menu_overrides.json ────────────────────────────
$dataDir   = __DIR__ . '/../data/';
$overrides = file_exists($dataDir . 'menu_overrides.json')
    ? json_decode(file_get_contents($dataDir . 'menu_overrides.json'), true)
    : [];

if (!isset($overrides[$menuId])) $overrides[$menuId] = [];

// Hapus objek lama di remote agar bucket tidak menumpuk revisi
$old = $overrides[$menuId]['img'] ?? null;
if (is_string($old) && $old !== '' && $old !== $stored && kenshin_media_is_remote($old)) {
    kenshin_storage_delete($old);
}

$overrides[$menuId]['img'] = $stored;

file_put_contents($dataDir . 'menu_overrides.json', json_encode($overrides, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'img'     => kenshin_media_url($stored),
    'storage' => $isRemote ? 'r2' : 'local',
    'message' => 'Foto berhasil diupload',
]);
