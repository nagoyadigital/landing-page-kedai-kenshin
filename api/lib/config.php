<?php
/**
 * api/lib/config.php
 * Konfigurasi terpusat: baca .env + environment, tanpa dependency.
 *
 * Urutan baca .env (yang pertama ditemukan dipakai):
 *   1. <release>/.env                  (dibuat manual di VPS, tidak di-commit)
 *   2. <shared>/.env                   (persisten, tidak hilang saat deploy;
 *       di-resolve langsung, tetap ketemu walau symlink data/ rusak)
 *   3. Environment bawaan PHP-FPM / shell
 */

function kenshin_config_path() {
    $candidates = [];

    // 1. .env di root release (samping index.html)
    $releaseRoot = dirname(__DIR__, 2);
    $candidates[] = $releaseRoot . '/.env';

    // 2. .env di shared/ — turunkan dari release root TANPA lewat symlink
    //    Layout: /var/www/kedaikenshin.com/releases/<TS>  ->  shared di ../../shared
    //            /var/www/kedaikenshin.com/current (symlink ke release)
    $root = $releaseRoot;
    if (is_link($root)) {
        $resolved = readlink($root);
        if ($resolved !== false) {
            if ($resolved[0] !== '/') {
                $resolved = dirname($root) . '/' . $resolved;
            }
            $root = $resolved;
        }
    }
    $sharedEnv = dirname(dirname($root)) . '/shared/.env';
    $candidates[] = $sharedEnv;

    // 3. Fallback lama: via symlink data/ (hanya bila targetnya valid)
    $dataReal = realpath(__DIR__ . '/../../data');
    if ($dataReal !== false) {
        $candidates[] = dirname($dataReal) . '/.env';
    }

    foreach ($candidates as $p) {
        if (is_file($p) && is_readable($p)) return $p;
    }
    return null;
}

function kenshin_load_dotenv() {
    static $loaded = false;
    if ($loaded) return;
    $loaded = true;

    $path = kenshin_config_path();
    if ($path === null) return;

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;

        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));

        // Kupas kutip luar "..." atau '...'
        if (strlen($val) >= 2) {
            $q = $val[0];
            if (($q === '"' || $q === "'") && $val[strlen($val) - 1] === $q) {
                $val = substr($val, 1, -1);
            }
        }

        // Environment bawaan menang atas .env
        if (getenv($key) === false) {
            putenv($key . '=' . $val);
            $_ENV[$key] = $val;
        }
    }
}

function kenshin_env($key, $default = '') {
    kenshin_load_dotenv();
    $v = getenv($key);
    return ($v === false || $v === '') ? $default : $v;
}

function kenshin_storage_driver() {
    $d = strtolower(trim(kenshin_env('STORAGE_DRIVER', 'local')));
    return ($d === 'r2') ? 'r2' : 'local';
}

function kenshin_image_config() {
    return [
        'max_width'    => max(320, (int)kenshin_env('IMAGE_MAX_WIDTH', '1600')),
        'webp_quality' => min(100, max(50, (int)kenshin_env('IMAGE_WEBP_QUALITY', '82'))),
        'max_mb'       => max(1, (int)kenshin_env('IMAGE_MAX_MB', '5')),
    ];
}
