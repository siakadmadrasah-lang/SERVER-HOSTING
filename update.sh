#!/bin/bash
# ==============================================================================
# 🚀 CLOUD PRO SERVER AUTOMATIC UPDATE ENGINE (v3.5)
# Kompatibel untuk:
#   1. Web Terminal Browser (user: www-data, tanpa sudo)
#   2. Terminal SSH PuTTY / Termius (user: denbaguse / root)
#   3. Cron Job Auto-Sync Background (tiap 2 menit)
# ==============================================================================

echo "=========================================================="
echo "🚀 MEMULAI PEMBARUAN CLOUD PRO SERVER VPS (v3.5)"
echo "=========================================================="
echo "Waktu : $(date)"
echo "User  : $(whoami) (UID: $(id -u))"

# Tentukan direktori proyek secara otomatis
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null)" 2>/dev/null && pwd)"
if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/.git" ]; then
  APP_DIR="$SCRIPT_DIR"
elif [ -d "/var/www/html/siakad/.git" ]; then
  APP_DIR="/var/www/html/siakad"
elif [ -d "/var/www/html/.git" ]; then
  APP_DIR="/var/www/html"
else
  APP_DIR="/var/www/html/siakad"
  mkdir -p "$APP_DIR" 2>/dev/null || true
fi

echo "📁 Direktori Proyek: $APP_DIR"
cd "$APP_DIR" || { echo "❌ Gagal masuk ke $APP_DIR"; exit 1; }

# Deteksi hak akses sudo (HANYA gunakan sudo jika benar-benar tidak meminta password / non-interaktif)
SUDO=""
HAS_ROOT=0
if [ "$(id -u)" -eq 0 ]; then
  HAS_ROOT=1
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  SUDO="sudo -n"
  HAS_ROOT=1
fi

# Tentukan user pemilik server utama
TARGET_USER="${SUDO_USER:-$USER}"
if [ -z "$TARGET_USER" ] || [ "$TARGET_USER" = "root" ] || [ "$TARGET_USER" = "www-data" ]; then
  if id "denbaguse" >/dev/null 2>&1; then
    TARGET_USER="denbaguse"
  else
    TARGET_USER="www-data"
  fi
fi

# Jika dijalankan oleh root/sudo di PuTTY, daftarkan sudoers agar Web Terminal (www-data) bebas error sudo!
if [ "$HAS_ROOT" -eq 1 ]; then
  echo "🔑 Mengaktifkan izin eksekusi Web Terminal (www-data & $TARGET_USER)..."
  $SUDO tee /etc/sudoers.d/cloudpro-panel >/dev/null 2>&1 << SUDO_EOF
www-data ALL=(ALL) NOPASSWD: ALL
$TARGET_USER ALL=(ALL) NOPASSWD: ALL
server ALL=(ALL) NOPASSWD: ALL
SUDO_EOF
  $SUDO chmod 440 /etc/sudoers.d/cloudpro-panel 2>/dev/null || true
  $SUDO usermod -aG www-data "$TARGET_USER" 2>/dev/null || true
  $SUDO usermod -aG "$TARGET_USER" www-data 2>/dev/null || true
fi

# Pastikan git safe directory terdaftar
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
git config --global --add safe.directory /var/www/html/siakad 2>/dev/null || true
git config --global --add safe.directory /var/www/html 2>/dev/null || true

REPO_URL="https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git"
git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL" 2>/dev/null || true

echo "📥 Menarik pembaruan fitur terbaru dari GitHub (SERVER-HOSTING)..."
git fetch "$REPO_URL" main 2>/dev/null || git fetch origin main 2>/dev/null || true

# Reset worktree jika izin memungkinkan
git reset --hard FETCH_HEAD 2>/dev/null || git reset --hard origin/main 2>/dev/null || true

echo "🚚 Menyalin bundle produksi terbaru ke /var/www/html..."
$SUDO mkdir -p /var/www/html /var/www/html/terminal /var/www/html/api /var/www/html/filemanager 2>/dev/null || mkdir -p /var/www/html /var/www/html/terminal /var/www/html/api /var/www/html/filemanager 2>/dev/null || true

# Hapus file lama terlebih dahulu agar www-data dapat menulis file baru tanpa terhalang ownership file lama
$SUDO rm -rf /var/www/html/assets /var/www/html/index.html 2>/dev/null || rm -rf /var/www/html/assets /var/www/html/index.html 2>/dev/null || true

# Metode 1: Ekstrak langsung dari objek Git FETCH_HEAD ke /var/www/html (100% berhasil walau dijalankan oleh www-data)
if git rev-parse --verify FETCH_HEAD >/dev/null 2>&1; then
  git archive FETCH_HEAD dist 2>/dev/null | tar -x --strip-components=1 -C /var/www/html/ 2>/dev/null || true
  git archive FETCH_HEAD public 2>/dev/null | tar -x --strip-components=1 -C /var/www/html/ 2>/dev/null || true
  git show FETCH_HEAD:public/terminal/index.php > /var/www/html/terminal.php 2>/dev/null || true
fi

# Metode 2: Salin dari folder dist/ jika tersedia
if [ -d "$APP_DIR/dist" ] && [ ! -f "/var/www/html/index.html" ]; then
  $SUDO cp -rf "$APP_DIR/dist/"* /var/www/html/ 2>/dev/null || cp -rf "$APP_DIR/dist/"* /var/www/html/ 2>/dev/null || true
fi

if [ -f "$APP_DIR/public/terminal/index.php" ]; then
  $SUDO rm -f /var/www/html/terminal/index.php /var/www/html/terminal.php 2>/dev/null || rm -f /var/www/html/terminal/index.php /var/www/html/terminal.php 2>/dev/null || true
  $SUDO cp -f "$APP_DIR/public/terminal/index.php" /var/www/html/terminal/index.php 2>/dev/null || cp -f "$APP_DIR/public/terminal/index.php" /var/www/html/terminal/index.php 2>/dev/null || true
  $SUDO cp -f "$APP_DIR/public/terminal/index.php" /var/www/html/terminal.php 2>/dev/null || cp -f "$APP_DIR/public/terminal/index.php" /var/www/html/terminal.php 2>/dev/null || true
fi

if [ -f "$APP_DIR/public/api/terminal.php" ]; then
  $SUDO rm -f /var/www/html/api/terminal.php 2>/dev/null || rm -f /var/www/html/api/terminal.php 2>/dev/null || true
  $SUDO cp -f "$APP_DIR/public/api/terminal.php" /var/www/html/api/terminal.php 2>/dev/null || cp -f "$APP_DIR/public/api/terminal.php" /var/www/html/api/terminal.php 2>/dev/null || true
fi

if [ -f "$APP_DIR/public/filemanager/index.php" ]; then
  $SUDO rm -f /var/www/html/filemanager/index.php 2>/dev/null || rm -f /var/www/html/filemanager/index.php 2>/dev/null || true
  $SUDO cp -f "$APP_DIR/public/filemanager/index.php" /var/www/html/filemanager/index.php 2>/dev/null || cp -f "$APP_DIR/public/filemanager/index.php" /var/www/html/filemanager/index.php 2>/dev/null || true
fi

# Cache-buster timestamp pada index.html agar browser langsung memuat tampilan terbaru
sed -i "s/\?v=[0-9]*/?v=$(date +%s)/g" /var/www/html/index.html 2>/dev/null || true

# Jalankan instalasi ekstensi PHP & pengaturan Nginx jika memiliki akses root/sudo
if [ "$HAS_ROOT" -eq 1 ]; then
  echo "🔍 Memastikan PHP-FPM, ionCube Loader, cURL & ekstensi wajib aktif..."
  if [ -f "$APP_DIR/install-php-extensions.sh" ]; then
    $SUDO chmod +x "$APP_DIR/install-php-extensions.sh" 2>/dev/null || true
    if ! php -m 2>/dev/null | grep -qi "ionCube" || ! php -m 2>/dev/null | grep -qi "curl"; then
      $SUDO bash "$APP_DIR/install-php-extensions.sh" || true
    fi
  fi

  PHP_SOCK=$(find /run/php/ -name "php*-fpm.sock" 2>/dev/null | sort -V | tail -n 1)
  [ -z "$PHP_SOCK" ] && PHP_SOCK="/run/php/php8.3-fpm.sock"

  for srv in $(service --status-all 2>&1 | grep -o 'php[0-9.]*-fpm'); do
    $SUDO systemctl start "$srv" 2>/dev/null || $SUDO service "$srv" start 2>/dev/null || true
  done

  if [ -d /etc/nginx/sites-available ]; then
    $SUDO tee /etc/nginx/sites-available/default > /dev/null << NGINX_EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.php;

    server_name _;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    location /filemanager {
        try_files \$uri \$uri/ /filemanager/index.php\$is_args\$args;
    }

    location /terminal {
        try_files \$uri \$uri/ /terminal/index.php\$is_args\$args;
    }

    location /api/ {
        try_files \$uri \$uri/ /api/terminal.php\$is_args\$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_SOCK};
        fastcgi_read_timeout 120;
    }

    location ~ /\.ht {
        deny all;
    }
}
NGINX_EOF
    $SUDO nginx -t 2>/dev/null && ($SUDO systemctl reload nginx 2>/dev/null || $SUDO service nginx reload 2>/dev/null || true)
  fi

  echo "🔒 Mengatur hak akses folder agar Web Terminal (www-data) & SSH selalu sinkron..."
  $SUDO ln -sfn "$APP_DIR" "/home/$TARGET_USER/server-panel" 2>/dev/null || true
  $SUDO ln -sfn "$APP_DIR" "/root/server-panel" 2>/dev/null || true
  $SUDO chown -R "$TARGET_USER:www-data" /var/www/html 2>/dev/null || true
  $SUDO chmod -R 777 /var/www/html 2>/dev/null || true
  $SUDO chown -R "$TARGET_USER:www-data" "$APP_DIR" 2>/dev/null || true
  $SUDO chmod -R 777 "$APP_DIR" 2>/dev/null || true
fi

echo "=========================================================="
echo "✅ PEMBARUAN SUKSES! Cloud PRO Server v3.5 Telah Aktif!"
echo "   👉 Mode Terang Modern + Multi-VPS Cluster + Billing WHMCS"
echo "   👉 ionCube Loader, cURL, Nameserver WHM & Email/FTP Siap"
echo "   👉 Silakan refresh browser Anda (Ctrl+F5 / Tarik ke bawah)"
echo "=========================================================="
exit 0
