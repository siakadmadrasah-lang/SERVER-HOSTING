#!/bin/bash
# ==============================================================================
# Script Perbaikan Total Nginx & TinyFileManager (Anti-404)
# ==============================================================================
set -e

echo "🔧 [1/5] Memperbaiki kepemilikan git siakad..."
CURRENT_USER="${SUDO_USER:-$USER}"
[ -z "$CURRENT_USER" ] && CURRENT_USER="denbaguse"
chown -R "$CURRENT_USER:$CURRENT_USER" /var/www/html/siakad 2>/dev/null || true
git config --global --add safe.directory /var/www/html/siakad 2>/dev/null || true

echo "📁 [2/5] Menyiapkan folder & memasang Web File Manager..."
mkdir -p /var/www/html/filemanager
if [ -f /var/www/html/siakad/public/filemanager/index.php ]; then
    cp /var/www/html/siakad/public/filemanager/index.php /var/www/html/filemanager/index.php
else
    curl -sSL https://raw.githubusercontent.com/prasathmani/tinyfilemanager/master/tinyfilemanager.php -o /var/www/html/filemanager/index.php
fi
chmod 755 /var/www/html/filemanager
chmod 644 /var/www/html/filemanager/index.php

echo "🐘 [3/5] Mendeteksi dan mengaktifkan PHP-FPM..."
# Jalankan service php-fpm yang ada
for s in $(service --status-all 2>&1 | grep -o 'php[0-9.]*-fpm'); do
    service "$s" start 2>/dev/null || true
done

PHP_SOCK=$(ls /run/php/php*-fpm.sock 2>/dev/null | head -n 1)
if [ -z "$PHP_SOCK" ]; then
    echo "⚠️ PHP-FPM belum terdeteksi aktif, mencoba apt install php-fpm..."
    apt-get update -y && apt-get install -y php-fpm php-zip php-mbstring
    for s in $(service --status-all 2>&1 | grep -o 'php[0-9.]*-fpm'); do
        service "$s" start 2>/dev/null || true
    done
    PHP_SOCK=$(ls /run/php/php*-fpm.sock 2>/dev/null | head -n 1)
fi

echo "Socket PHP yang ditemukan: $PHP_SOCK"

echo "🌐 [4/5] Memperbarui konfigurasi Nginx (/etc/nginx/sites-available/default)..."
cat << EOF > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.php;

    server_name _;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /filemanager {
        index index.php;
        try_files \$uri \$uri/ /filemanager/index.php\$is_args\$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_SOCK};
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

echo "🔄 [5/5] Menguji & memuat ulang Nginx..."
nginx -t
service nginx reload || systemctl reload nginx

chown -R www-data:www-data /var/www/html
chown -R "$CURRENT_USER:$CURRENT_USER" /var/www/html/siakad
chmod -R 775 /var/www/html/siakad

echo "=========================================================="
echo "✅ BERHASIL 100%! Web File Manager Sudah Aktif & Siap Dibuka:"
echo "   👉 https://server.denbagoes.my.id/filemanager/"
echo "   👉 Login: server / masbagus15 (atau admin / masbagus15)"
echo "=========================================================="
