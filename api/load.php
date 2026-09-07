<?php
/**
 * api/load.php
 * Mengembalikan settings, menu_overrides, dan custom_kategori.
 * Endpoint publik — tidak butuh login.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

$dataDir = __DIR__ . '/../data/';

// ── Settings ──────────────────────────────────────────────
$settings = file_exists($dataDir . 'settings.json')
    ? json_decode(file_get_contents($dataDir . 'settings.json'), true)
    : ['wa_number' => '', 'alamat' => '', 'status_buka' => true];

if (!is_array($settings)) $settings = ['wa_number' => '', 'alamat' => '', 'status_buka' => true];

// ── Custom kategori (disimpan di dalam settings.json) ─────
$customKategori = isset($settings['custom_kategori']) && is_array($settings['custom_kategori'])
    ? $settings['custom_kategori']
    : [];

// Hapus custom_kategori dari object settings sebelum dikirim
// (agar settings response tetap bersih)
unset($settings['custom_kategori']);

// ── Menu overrides ─────────────────────────────────────────
$menuOverrides = file_exists($dataDir . 'menu_overrides.json')
    ? json_decode(file_get_contents($dataDir . 'menu_overrides.json'), true)
    : [];

if (!is_array($menuOverrides)) $menuOverrides = [];

// Pastikan img selalu ada sebagai field (null jika belum diupload)
foreach ($menuOverrides as $id => &$ov) {
    if (is_array($ov) && !isset($ov['img'])) {
        $ov['img'] = null;
    }
}
unset($ov);

echo json_encode([
    'success'          => true,
    'settings'         => $settings,
    'menu_overrides'   => $menuOverrides,
    'custom_kategori'  => $customKategori,
]);
