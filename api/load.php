<?php
/**
 * api/load.php
 * Mengembalikan data settings dan menu overrides sebagai JSON.
 * Endpoint publik — tidak butuh login.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dataDir = __DIR__ . '/../data/';

$settings      = file_exists($dataDir . 'settings.json')
    ? json_decode(file_get_contents($dataDir . 'settings.json'), true)
    : ['wa_number' => '', 'alamat' => '', 'status_buka' => true];

$menuOverrides = file_exists($dataDir . 'menu_overrides.json')
    ? json_decode(file_get_contents($dataDir . 'menu_overrides.json'), true)
    : (object)[];

// Pastikan img selalu ada sebagai field (null jika belum diupload)
if (is_array($menuOverrides)) {
    foreach ($menuOverrides as $id => &$ov) {
        if (!isset($ov['img'])) $ov['img'] = null;
    }
    unset($ov);
}

echo json_encode([
    'success'        => true,
    'settings'       => $settings,
    'menu_overrides' => $menuOverrides,
]);
