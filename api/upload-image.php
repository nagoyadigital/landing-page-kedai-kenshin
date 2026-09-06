<?php
/**
 * api/upload-image.php
 * Upload foto menu. Hanya bisa diakses setelah login.
 * Simpan ke images/menu/ dan catat path di menu_overrides.json.
 */

session_start();
header('Content-Type: application/json');

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
$maxSize   = 5 * 1024 * 1024; // 5MB

if (!in_array($mimeType, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.']);
    exit;
}
if ($_FILES['foto']['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'Ukuran file maksimal 5MB.']);
    exit;
}

// ── Simpan file ───────────────────────────────────────────
$imgDir  = __DIR__ . '/../images/menu/';
if (!is_dir($imgDir)) mkdir($imgDir, 0755, true);

$ext      = $extMap[$mimeType];
$filename = 'menu-' . $menuId . '-' . time() . $ext;
$dest     = $imgDir . $filename;

if (!move_uploaded_file($_FILES['foto']['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file. Cek permission folder images/menu/']);
    exit;
}

// ── Update menu_overrides.json ────────────────────────────
$dataDir   = __DIR__ . '/../data/';
$overrides = file_exists($dataDir . 'menu_overrides.json')
    ? json_decode(file_get_contents($dataDir . 'menu_overrides.json'), true)
    : [];

if (!isset($overrides[$menuId])) $overrides[$menuId] = [];
$imgPath = 'images/menu/' . $filename;
$overrides[$menuId]['img'] = $imgPath;

file_put_contents($dataDir . 'menu_overrides.json', json_encode($overrides, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'img'     => $imgPath,
    'message' => 'Foto berhasil diupload',
]);
