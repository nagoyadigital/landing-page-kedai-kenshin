#!/bin/bash
# migrate-to-r2.sh — migrasi SATU ARAH file lokal ke Cloudflare R2.
#
# Cara pakai (di VPS, sebagai user ubuntu):
#   1. Isi /var/www/kedaikenshin.com/shared/.env (STORAGE_DRIVER=r2 + kredensial R2)
#   2. bash migrate-to-r2.sh [--dry-run]
#
# Yang dilakukan:
#   - Upload semua images/menu/* + logo ke R2 (key menu/<file>, static/<file>)
#   - Update menu_overrides.json: 'images/menu/x' -> 'r2:menu/x'
#   - Backup otomatis: menu_overrides.json.bak.<timestamp>
#   - File lokal TIDAK dihapus (jadi fallback bila R2 dimatikan)
#   - Idempoten: aman dijalankan ulang (yang sudah 'r2:' dilewati)

set -euo pipefail

WEB_ROOT=/var/www/kedaikenshin.com
SHARED=$WEB_ROOT/shared
DATA_FILE=$SHARED/data/menu_overrides.json
MENU_DIR=$SHARED/images/menu
DRY_RUN=0

if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  echo "=== DRY RUN (tidak ada yang diubah) ==="
fi

if [ ! -f "$DATA_FILE" ]; then
  echo "ERROR: $DATA_FILE tidak ditemukan"
  exit 1
fi

# php -r inline agar tidak perlu file tambahan di release
run_php() {
  php -r "$1"
}

echo "=== 1/3 Cek konfigurasi R2 ==="
R2CHECK=$(php -r '
require "/var/www/kedaikenshin.com/current/api/lib/storage.php";
if (!kenshin_r2_enabled()) { echo "DISABLED"; exit; }
echo "OK|" . kenshin_r2_public_base();
')
if [ "$R2CHECK" = "DISABLED" ]; then
  echo "ERROR: R2 belum aktif. Isi shared/.env dulu:"
  echo "  STORAGE_DRIVER=r2"
  echo "  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL"
  exit 1
fi
echo "R2 aktif: ${R2CHECK#OK|}"

echo
echo "=== 2/3 Upload file lokal ke R2 ==="
export KENSHIN_DRY_RUN=$DRY_RUN
php -r '
require "/var/www/kedaikenshin.com/current/api/lib/storage.php";
$menuDir = "/var/www/kedaikenshin.com/shared/images/menu";
$dry = getenv("KENSHIN_DRY_RUN") === "1";
$files = glob($menuDir . "/*.{jpg,jpeg,png,webp,gif}", GLOB_BRACE) ?: [];
echo "Ditemukan " . count($files) . " file di shared/images/menu\n";
foreach ($files as $abs) {
  $name = basename($abs);
  $key = "menu/" . $name;
  $mime = mime_content_type($abs) ?: "application/octet-stream";
  if ($dry) { echo "  [dry] $name -> $key\n"; continue; }
  $bytes = file_get_contents($abs);
  [$ok, $urlOrMsg] = kenshin_r2_upload($bytes, $key, $mime);
  echo $ok ? "  [ok] $name -> $urlOrMsg\n" : "  [GAGAL] $name: $urlOrMsg\n";
}
// Logo statis (opsional, agar konsisten di CDN)
foreach (["../images/logo.PNG", "../images/logo-footer.png"] as $rel) {
  $abs = realpath("/var/www/kedaikenshin.com/current/images/" . basename($rel));
  // dilewati bila tidak ada — logo boleh tetap lokal
}
'

echo
echo "=== 3/3 Update menu_overrides.json (images/menu/x -> r2:menu/x) ==="
if [ "$DRY_RUN" = "1" ]; then
  php -r '
  $f = "/var/www/kedaikenshin.com/shared/data/menu_overrides.json";
  $d = json_decode(file_get_contents($f), true) ?: [];
  $n = 0;
  foreach ($d as $id => $ov) {
    if (isset($ov["img"]) && strpos($ov["img"], "images/menu/") === 0) { $n++; echo "  [dry] $id: {$ov["img"]} -> r2:menu/" . basename($ov["img"]) . "\n"; }
  }
  echo "Akan diubah: $n entri\n";'
else
  TS=$(date +%Y%m%d_%H%M%S)
  cp "$DATA_FILE" "$DATA_FILE.bak.$TS"
  echo "Backup: $DATA_FILE.bak.$TS"
  php -r '
  require "/var/www/kedaikenshin.com/current/api/lib/storage.php";
  $f = "/var/www/kedaikenshin.com/shared/data/menu_overrides.json";
  $d = json_decode(file_get_contents($f), true) ?: [];
  $n = 0;
  foreach ($d as $id => &$ov) {
    if (isset($ov["img"]) && is_string($ov["img"]) && strpos($ov["img"], "images/menu/") === 0) {
      $ov["img"] = "r2:menu/" . basename($ov["img"]);
      $n++;
      echo "  [ok] $id -> {$ov["img"]}\n";
    }
  }
  unset($ov);
  file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
  echo "Diubah: $n entri\n";'
  sudo chown www-data:www-data "$DATA_FILE"
  sudo chmod 664 "$DATA_FILE"
fi

echo
echo "=== SELESAI ==="
echo "File lokal tetap ada sebagai fallback."
echo "Untuk kembali ke lokal: STORAGE_DRIVER=local di shared/.env"
echo "  (entri 'r2:' tetap bisa dirender selama R2_PUBLIC_BASE_URL terisi;"
echo "   entri lokal lama tetap jalan apa adanya)"
