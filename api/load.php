<?php
/**
 * api/load.php
 * Mengembalikan data settings dan menu overrides sebagai JSON.
 * Endpoint publik — tidak butuh login.
 *
 * Nilai img dinormalisasi ke URL siap render:
 *   - 'r2:menu/x.webp' -> R2_PUBLIC_BASE_URL/menu/x.webp
 *   - 'http(s)://...'  -> diteruskan apa adanya
 *   - 'images/...'     -> path relatif lokal (kompatibel data lama)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/lib/storage.php';

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
        if (!isset($ov['img'])) {
            $ov['img'] = null;
        } elseif (is_string($ov['img']) && $ov['img'] !== '') {
            $ov['img'] = kenshin_media_url($ov['img']);
        }
    }
    unset($ov);
}

echo json_encode([
    'success'        => true,
    'settings'       => $settings,
    'menu_overrides' => $menuOverrides,
]);
