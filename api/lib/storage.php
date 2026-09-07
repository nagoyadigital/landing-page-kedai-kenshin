<?php
/**
 * api/lib/storage.php
 * Seam penyimpanan gambar: satu Interface, dua Adapter.
 *
 *   kenshin_storage_put($bytes, $menuId, $ext, $mime) -> [ok, urlAtauPath, isRemote]
 *   kenshin_storage_delete($stored)                   -> [ok, pesan]
 *   kenshin_media_url($stored)                        -> string URL siap render
 *   kenshin_media_is_remote($stored)                  -> bool
 *
 * Aturan nilai $stored yang dicatat di menu_overrides.json:
 *   - 'r2:menu/<file>'  -> objek R2 (render via R2_PUBLIC_BASE_URL)
 *   - 'images/menu/<f>' -> file lokal relatif (kompatibel data lama)
 *   - 'http(s)://...'   -> URL absolut (diteruskan apa adanya)
 *
 * STORAGE_DRIVER=local -> Adapter lokal (perilaku lama, folder shared).
 * STORAGE_DRIVER=r2    -> Adapter R2 + optimasi (resize + WebP).
 * Jika kredensial R2 belum lengkap, otomatis fallback ke lokal
 * agar admin panel tidak pernah rusak.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/r2.php';
require_once __DIR__ . '/image.php';

function kenshin_media_is_remote($stored) {
    if (!is_string($stored) || $stored === '') return false;
    return strpos($stored, 'r2:') === 0
        || stripos($stored, 'http://') === 0
        || stripos($stored, 'https://') === 0;
}

function kenshin_media_url($stored) {
    if (!is_string($stored) || $stored === '') return '';
    if (strpos($stored, 'r2:') === 0) {
        return kenshin_r2_public_url(substr($stored, 3));
    }
    return $stored;
}

function kenshin_storage_put($bytes, $menuId, $ext, $mime) {
    $cfg = kenshin_image_config();
    $menuId = (string)intval($menuId);

    [$optBytes, $optMime] = kenshin_optimize_image($bytes, $ext, $cfg);
    $optExt = kenshin_mime_to_ext($optMime);
    if ($optExt === '') $optExt = $ext;

    $ts = time();
    $filename = 'menu-' . $menuId . '-' . $ts . '-' . substr(md5($menuId . $ts . strlen($optBytes)), 0, 6) . $optExt;

    // ── Adapter R2 ──────────────────────────────────────────
    if (kenshin_r2_enabled()) {
        $key = 'menu/' . $filename;
        [$ok, $urlOrMsg] = kenshin_r2_upload($optBytes, $key, $optMime);
        if ($ok) return [true, 'r2:' . $key, true];
        return [false, $urlOrMsg, false];
    }

    // ── Adapter lokal (fallback / perilaku lama) ────────────
    $imgDir = __DIR__ . '/../../images/menu/';
    if (!is_dir($imgDir) && !mkdir($imgDir, 0755, true)) {
        return [false, 'Gagal membuat folder images/menu/', false];
    }
    if (!is_writable($imgDir)) {
        return [false, 'Folder images/menu/ tidak bisa ditulis', false];
    }
    if (file_put_contents($imgDir . $filename, $optBytes) === false) {
        return [false, 'Gagal menyimpan file. Cek permission folder images/menu/', false];
    }
    return [true, 'images/menu/' . $filename, false];
}

function kenshin_storage_delete($stored) {
    if (!is_string($stored) || $stored === '') return [true, ''];
    if (strpos($stored, 'r2:') === 0) {
        return kenshin_r2_delete(substr($stored, 3));
    }
    if (stripos($stored, 'http://') === 0 || stripos($stored, 'https://') === 0) {
        return [true, ''];
    }
    // File lokal: hapus diam-diam (kegagalan bukan fatal)
    $abs = __DIR__ . '/../../' . ltrim($stored, '/');
    $real = realpath($abs);
    $root = realpath(__DIR__ . '/../../');
    if ($real !== false && $root !== false && strpos($real, $root) === 0 && is_file($real)) {
        @unlink($real);
    }
    return [true, ''];
}
