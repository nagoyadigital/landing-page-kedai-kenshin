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

# Buat release dir baru + symlink persistent
mkdir -p "$NEW_RELEASE"
mkdir -p "$NEW_RELEASE/images"
ln -sfn ../../../shared/data "$NEW_RELEASE/data"
ln -sfn ../../../shared/images/menu "$NEW_RELEASE/images/menu"

# Ekstrak tarball (kode statis)
tar -xzf "$TARBALL" -C "$NEW_RELEASE"

# Ownership
chown -R ubuntu:ubuntu "$NEW_RELEASE" 2>/dev/null || true
chmod -R 755 "$NEW_RELEASE" 2>/dev/null || true
find "$NEW_RELEASE" -type d -exec chmod 775 {} \; 2>/dev/null || true
find "$NEW_RELEASE" -type f -exec chmod 664 {} \; 2>/dev/null || true

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

# Cleanup: simpan 3 release terakhir
ls -1d $RELEASES_DIR/*/ | sort | head -n -3 | xargs -r rm -rf

# Cleanup tarball
rm -f "$TARBALL"

echo "=== DEPLOY SUCCESS ==="
echo "Current: $(readlink $CURRENT_LINK)"
