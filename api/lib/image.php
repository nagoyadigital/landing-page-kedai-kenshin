<?php
/**
 * api/lib/image.php
 * Optimasi gambar sebelum disimpan: resize + konversi WebP bila didukung.
 *
 *   kenshin_optimize_image($bytes, $ext, $cfg) -> [bytes, mime]
 *   kenshin_mime_to_ext($mime)                 -> '.webp' | '.jpg' | '.png' | '.gif' | ''
 *
 * Prinsip:
 *   - Tidak pernah merusak upload: jika GD tidak ada / decode gagal,
 *     kembalikan bytes asli apa adanya.
 *   - Foto menu (JPEG/PNG/WebP) dinormalisasi ke WebP agar ringan di CDN.
 *   - GIF animasi dibiarkan asli (resize GIF merusak animasi).
 *   - PNG dengan transparansi yang gagal di-WebP-kan dibiarkan asli.
 */

function kenshin_mime_to_ext($mime) {
    static $map = [
        'image/jpeg' => '.jpg',
        'image/png'  => '.png',
        'image/webp' => '.webp',
        'image/gif'  => '.gif',
    ];
    return $map[strtolower($mime)] ?? '';
}

function kenshin_optimize_image($bytes, $ext, $cfg) {
    $ext = strtolower($ext);
    $origMime = $ext === '.jpg' || $ext === '.jpeg' ? 'image/jpeg'
        : ($ext === '.png' ? 'image/png'
        : ($ext === '.webp' ? 'image/webp'
        : ($ext === '.gif' ? 'image/gif' : 'application/octet-stream')));

    // GIF: jangan diapa-apakan (jaga animasi)
    if ($ext === '.gif') return [$bytes, 'image/gif'];

    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
        return [$bytes, $origMime];
    }

    $src = @imagecreatefromstring($bytes);
    if ($src === false) return [$bytes, $origMime];

    $w = imagesx($src);
    $h = imagesy($src);
    if ($w <= 0 || $h <= 0) {
        imagedestroy($src);
        return [$bytes, $origMime];
    }

    $maxW = max(320, (int)($cfg['max_width'] ?? 1600));
    if ($w > $maxW) {
        $nw = $maxW;
        $nh = (int)round($h * $maxW / $w);
        $dst = imagecreatetruecolor($nw, $nh);

        // Jaga transparansi PNG/WebP saat resize
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $nw, $nh, $transparent);

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($src);
        $src = $dst;
    } else {
        // Tanpa resize pun tetap pastikan alpha tersimpan untuk WebP
        imagealphablending($src, false);
        imagesavealpha($src, true);
    }

    $quality = min(100, max(50, (int)($cfg['webp_quality'] ?? 82)));
    ob_start();
    $ok = @imagewebp($src, null, $quality);
    $webp = ob_get_clean();
    imagedestroy($src);

    if (!$ok || $webp === '' || $webp === false) {
        return [$bytes, $origMime];
    }
    return [$webp, 'image/webp'];
}
