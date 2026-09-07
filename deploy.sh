#!/bin/bash
# deploy.sh - dipanggil dari GitHub Actions saat deploy landing page kedaikenshin.com
# Input: TAR_FILE_PATH (path tarball hasil rsync dari GitHub Actions)
# Output: sukses deploy atau rollback otomatis
set -euo pipefail

WEB_ROOT=/var/www/kedaikenshin.com
RELEASES_DIR=$WEB_ROOT/releases
SHARED_DIR=$WEB_ROOT/shared
CURRENT_LINK=$WEB_ROOT/current
TARBALL="$1"
PREV_LINK=$(readlink "$CURRENT_LINK" 2>/dev/null || true)

TS=$(date +%Y%m%d_%H%M%S)
NEW_RELEASE=$RELEASES_DIR/$TS

echo "=== DEPLOY kedaikenshin.com ==="
echo "Timestamp: $TS"
echo "Prev release: ${PREV_LINK:-none}"
echo "New release: $NEW_RELEASE"

# Buat release dir baru + symlink persistent (ABSOLUT — anti rusak)
# Relatif seperti ../../../shared/data pecah karena current/ adalah symlink
# (di-resolve ke /var/www/releases/... yang tidak ada). Absolut selalu benar.
mkdir -p "$NEW_RELEASE"
mkdir -p "$NEW_RELEASE/images"
mkdir -p "$SHARED_DIR/data" "$SHARED_DIR/images/menu"
ln -sfn "$SHARED_DIR/data" "$NEW_RELEASE/data"
ln -sfn "$SHARED_DIR/images/menu" "$NEW_RELEASE/images/menu"

# Validasi symlink: target HARUS ada (gagalkan deploy bila rusak)
for L in "$NEW_RELEASE/data" "$NEW_RELEASE/images/menu"; do
  if [ ! -e "$L" ]; then
    echo "ERROR: symlink rusak: $L -> $(readlink "$L")"
    rm -rf "$NEW_RELEASE"
    exit 1
  fi
done
echo "Symlink OK: data -> $SHARED_DIR/data, images/menu -> $SHARED_DIR/images/menu"

# .env persisten: pastikan ada + bisa dibaca ubuntu (CLI) & www-data (FPM)
# Isinya TETAP milik user (tidak pernah ditimpa bila sudah ada).
if [ ! -f "$SHARED_DIR/.env" ]; then
  echo "Buat $SHARED_DIR/.env default dari .env.example (mode local, aman)"
  cp "$NEW_RELEASE/.env.example" "$SHARED_DIR/.env" 2>/dev/null || printf 'STORAGE_DRIVER=local\n' > "$SHARED_DIR/.env"
fi
chown ubuntu:www-data "$SHARED_DIR/.env" 2>/dev/null || chown www-data:www-data "$SHARED_DIR/.env" 2>/dev/null || true
chmod 640 "$SHARED_DIR/.env" 2>/dev/null || true

# Ekstrak tarball (kode statis)
tar -xzf "$TARBALL" -C "$NEW_RELEASE"

# Symlink logo case-sensitivity fix (Linux is case-sensitive)
if [ -f "$NEW_RELEASE/images/logo.PNG" ] && [ ! -e "$NEW_RELEASE/images/logo.png" ]; then
  ln -sfn logo.PNG "$NEW_RELEASE/images/logo.png"
  echo "Created logo.png -> logo.PNG symlink"
fi

# Ownership
chown -R ubuntu:ubuntu "$NEW_RELEASE" 2>/dev/null || true
chmod -R 755 "$NEW_RELEASE" 2>/dev/null || true
find "$NEW_RELEASE" -type d -exec chmod 775 {} \; 2>/dev/null || true
find "$NEW_RELEASE" -type f ! -type l -exec chmod 664 {} \; 2>/dev/null || true

# Backup current symlink target sebelum switch
BEFORE=$(readlink "$CURRENT_LINK" 2>/dev/null || true)

# Ganti symlink current -> baru (atomik)
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"

# Reload nginx (tanpa restart, tanpa ganggu app)
sudo nginx -t && sudo systemctl reload nginx

echo "=== HEALTH CHECK ==="
sleep 2
CODE_ROOT=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 15 https://kedaikenshin.com/)
CODE_API=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 15 https://kedaikenshin.com/api/load.php)
CODE_APP=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 15 https://app.kedaikenshin.com/)

echo "kedaikenshin.com root: $CODE_ROOT"
echo "kedaikenshin.com API:  $CODE_API"
echo "app.kedaikenshin.com:  $CODE_APP"

if [ "$CODE_ROOT" != "200" ] || [ "$CODE_API" != "200" ]; then
  echo "=== ROLLBACK ==="
  if [ -n "$BEFORE" ]; then
    ln -sfn "$BEFORE" "$CURRENT_LINK"
    sudo nginx -t && sudo systemctl reload nginx
    echo "Rolled back to: $BEFORE"
  fi
  # Hapus release gagal
  rm -rf "$NEW_RELEASE"
  exit 1
fi

# Verifikasi app tidak terganggu
if [ "$CODE_APP" != "200" ]; then
  echo "ERROR: app.kedaikenshin.com broken! $CODE_APP"
  exit 1
fi

# Cleanup: simpan 3 release terakhir (only if more than 3 exist)
COUNT=$(ls -1d $RELEASES_DIR/*/ 2>/dev/null | wc -l)
if [ "$COUNT" -gt 3 ]; then
  ls -1d $RELEASES_DIR/*/ | sort | head -n -3 | xargs -r rm -rf
  echo "Cleaned up old releases (kept 3 most recent)"
fi

# Cleanup tarball
rm -f "$TARBALL"

echo "=== DEPLOY SUCCESS ==="
echo "Current: $(readlink $CURRENT_LINK)"
