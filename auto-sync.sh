#!/bin/bash
# ==============================================================================
# Cloud PRO Background Auto-Sync Daemon (v4.0)
# Mengecek pembaruan di GitHub setiap 2 menit secara otomatis.
# ==============================================================================

REPO_URL="https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git"
APP_DIR="/var/www/html/siakad"
[ ! -d "$APP_DIR" ] && APP_DIR="/var/www/html"

git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

REMOTE_COMMIT=$(git ls-remote "$REPO_URL" refs/heads/main 2>/dev/null | awk '{print $1}')
LOCAL_COMMIT=""
if [ -f "/var/www/html/.cloudpro_commit" ]; then
  LOCAL_COMMIT=$(cat /var/www/html/.cloudpro_commit 2>/dev/null | tr -d '\r\n ')
elif [ -d "$APP_DIR/.git" ]; then
  LOCAL_COMMIT=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo "")
fi

if [ -n "$REMOTE_COMMIT" ] && [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "[$(date)] 🚀 Pembaruan baru terdeteksi di GitHub ($REMOTE_COMMIT). Memulai auto-update..." >> /var/log/cloudpro-sync.log 2>&1
    D="/tmp/cpro_auto_$$"
    git clone --depth 1 "$REPO_URL" "$D" >> /var/log/cloudpro-sync.log 2>&1 && bash "$D/update.sh" >> /var/log/cloudpro-sync.log 2>&1
    rm -rf "$D" 2>/dev/null || true
    echo "$REMOTE_COMMIT" > /var/www/html/.cloudpro_commit 2>/dev/null || true
else
    if command -v systemctl >/dev/null 2>&1; then
        if ! systemctl is-active --quiet cloudflared 2>/dev/null; then
            systemctl restart cloudflared 2>/dev/null || service cloudflared restart 2>/dev/null || true
        fi
        if ! systemctl is-active --quiet nginx 2>/dev/null; then
            systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || true
        fi
    fi
fi
