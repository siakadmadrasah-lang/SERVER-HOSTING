#!/bin/bash
# ==============================================================================
# Cloud PRO Background Auto-Sync Daemon
# Mengecek pembaruan di GitHub setiap 2 menit secara otomatis.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/.git" ]; then
  APP_DIR="$SCRIPT_DIR"
elif [ -d "/var/www/html/siakad/.git" ]; then
  APP_DIR="/var/www/html/siakad"
else
  APP_DIR="/var/www/html"
fi

cd "$APP_DIR" || exit 0

# Pastikan folder terdaftar sebagai safe.directory
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

# Deteksi nama repositori yang aktif saat ini (SERVER-HOSTING atau SERVER-VPS)
CURRENT_ORIGIN="$(git remote get-url origin 2>/dev/null || echo '')"
REPO_NAME="SERVER-HOSTING"
if echo "$CURRENT_ORIGIN" | grep -q "SERVER-VPS"; then
  REPO_NAME="SERVER-VPS"
fi

# Gunakan token jika file .git_token ada
if [ -f "$APP_DIR/.git_token" ]; then
  GIT_TOKEN="$(cat "$APP_DIR/.git_token" | tr -d '\r\n ')"
  git remote set-url origin "https://${GIT_TOKEN}@github.com/siakadmadrasah-lang/${REPO_NAME}.git" 2>/dev/null || true
fi

# Fetch pembaruan dari remote main
git fetch origin main >/dev/null 2>&1 || exit 0

LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "local")
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || echo "remote")

# Jika ada perubahan baru di GitHub, jalankan update otomatis
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "[$(date)] 🚀 Pembaruan baru terdeteksi di GitHub ($REMOTE_COMMIT). Memulai auto-update..." >> /var/log/cloudpro-sync.log 2>&1
    bash "$APP_DIR/update.sh" >> /var/log/cloudpro-sync.log 2>&1
else
    # Watchdog: pastikan cloudflared dan nginx selalu hidup
    if command -v systemctl >/dev/null 2>&1; then
        if ! systemctl is-active --quiet cloudflared 2>/dev/null; then
            echo "[$(date)] ⚠️ cloudflared tidak aktif! Menghidupkan ulang..." >> /var/log/cloudpro-sync.log 2>&1
            systemctl restart cloudflared 2>/dev/null || service cloudflared restart 2>/dev/null || true
        fi
        if ! systemctl is-active --quiet nginx 2>/dev/null; then
            echo "[$(date)] ⚠️ nginx tidak aktif! Menghidupkan ulang..." >> /var/log/cloudpro-sync.log 2>&1
            systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || true
        fi
    fi
fi


