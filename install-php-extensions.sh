#!/bin/bash
# ==============================================================================
# 🧩 CLOUD PRO - IONCUBE LOADER, CURL & ESSENTIAL PHP EXTENSIONS AUTO-INSTALLER
# Mendukung RDM Kemenag, SIAKAD Madrasah, CBT, Laravel, WordPress, Moodle, WHMCS
# ==============================================================================

echo "=========================================================="
echo "🧩 MEMASANG IONCUBE LOADER, CURL & EKSTENSI WAJIB WEBSITE"
echo "=========================================================="

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  fi
fi

export DEBIAN_FRONTEND=noninteractive

echo "📦 [1/4] Memastikan pustaka sistem utama (curl, wget, unzip, zip, tar, ca-certificates)..."
$SUDO apt-get update -qq 2>/dev/null || true
$SUDO apt-get install -y -qq curl wget unzip zip tar ca-certificates openssl libcurl4-openssl-dev 2>/dev/null || true

# Deteksi versi PHP aktif di sistem (misal 8.3, 8.2, 8.1, 7.4)
PHP_VERSIONS=""
if command -v php >/dev/null 2>&1; then
  ACTIVE_PHP=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null)
  [ -n "$ACTIVE_PHP" ] && PHP_VERSIONS="$ACTIVE_PHP"
fi

for dir in /etc/php/*; do
  if [ -d "$dir" ]; then
    ver=$(basename "$dir")
    if ! echo "$PHP_VERSIONS" | grep -q "$ver"; then
      PHP_VERSIONS="$PHP_VERSIONS $ver"
    fi
  fi
done

[ -z "$PHP_VERSIONS" ] && PHP_VERSIONS="8.3"

echo "📦 [2/4] Memasang modul PHP lengkap (curl, gd, zip, mbstring, xml, intl, bcmath, soap, imagick, mysql, pgsql, redis, imap, gmp, ldap, exif)..."
for VER in $PHP_VERSIONS; do
  echo "   👉 Memeriksa & memasang ekstensi untuk PHP $VER..."
  $SUDO apt-get install -y -qq \
    "php${VER}-fpm" \
    "php${VER}-cli" \
    "php${VER}-common" \
    "php${VER}-curl" \
    "php${VER}-gd" \
    "php${VER}-zip" \
    "php${VER}-mbstring" \
    "php${VER}-xml" \
    "php${VER}-intl" \
    "php${VER}-bcmath" \
    "php${VER}-soap" \
    "php${VER}-mysql" \
    "php${VER}-pgsql" \
    "php${VER}-sqlite3" \
    "php${VER}-imap" \
    "php${VER}-gmp" \
    "php${VER}-ldap" \
    "php${VER}-opcache" \
    "php${VER}-readline" 2>/dev/null || true
done

# Paket tambahan lintas versi (imagick, redis, memcached)
$SUDO apt-get install -y -qq php-imagick php-redis php-memcached imagemagick 2>/dev/null || true

echo "🔐 [3/4] Mengunduh & memasang ionCube PHP Loader (64-bit Linux)..."
ARCH=$(uname -m)
IONCUBE_TMP="/tmp/ioncube_install"
mkdir -p "$IONCUBE_TMP"

if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then
  IONCUBE_URL="https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  IONCUBE_URL="https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_aarch64.tar.gz"
else
  IONCUBE_URL="https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz"
fi

curl -sSL "$IONCUBE_URL" -o "$IONCUBE_TMP/ioncube.tar.gz" 2>/dev/null || wget -qO "$IONCUBE_TMP/ioncube.tar.gz" "$IONCUBE_URL" 2>/dev/null || true

if [ -f "$IONCUBE_TMP/ioncube.tar.gz" ]; then
  tar -xzf "$IONCUBE_TMP/ioncube.tar.gz" -C "$IONCUBE_TMP" 2>/dev/null || true
  if [ -d "$IONCUBE_TMP/ioncube" ]; then
    EXT_DIR=$(php -i 2>/dev/null | grep -i '^extension_dir' | awk '{print $3}' | head -n 1)
    [ -z "$EXT_DIR" ] && EXT_DIR="/usr/lib/php/20230831"
    $SUDO mkdir -p "$EXT_DIR" 2>/dev/null || true
    $SUDO mkdir -p /usr/local/ioncube 2>/dev/null || true
    $SUDO cp -f "$IONCUBE_TMP/ioncube/"*.so "$EXT_DIR/" 2>/dev/null || true
    $SUDO cp -f "$IONCUBE_TMP/ioncube/"*.so /usr/local/ioncube/ 2>/dev/null || true

    for VER in $PHP_VERSIONS; do
      LOADER_FILE="/usr/local/ioncube/ioncube_loader_lin_${VER}.so"
      if [ -f "$LOADER_FILE" ]; then
        echo "   ✅ Mengaktifkan ionCube Loader untuk PHP $VER ($LOADER_FILE)..."
        if [ -d "/etc/php/${VER}/fpm/conf.d" ]; then
          echo "zend_extension = ${LOADER_FILE}" | $SUDO tee "/etc/php/${VER}/fpm/conf.d/00-ioncube.ini" >/dev/null
        fi
        if [ -d "/etc/php/${VER}/cli/conf.d" ]; then
          echo "zend_extension = ${LOADER_FILE}" | $SUDO tee "/etc/php/${VER}/cli/conf.d/00-ioncube.ini" >/dev/null
        fi
      fi
    done
  fi
fi
rm -rf "$IONCUBE_TMP" 2>/dev/null || true

echo "⚙️ [4/4] Mengoptimalkan batas php.ini (upload_max_filesize=256M, memory_limit=512M, max_input_vars=5000) & me-restart PHP-FPM..."
for VER in $PHP_VERSIONS; do
  for SAPI in fpm cli; do
    INI_FILE="/etc/php/${VER}/${SAPI}/php.ini"
    if [ -f "$INI_FILE" ]; then
      $SUDO sed -i 's/^\s*;*\s*upload_max_filesize\s*=.*/upload_max_filesize = 256M/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*post_max_size\s*=.*/post_max_size = 256M/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*memory_limit\s*=.*/memory_limit = 512M/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*max_execution_time\s*=.*/max_execution_time = 300/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*max_input_time\s*=.*/max_input_time = 300/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*max_input_vars\s*=.*/max_input_vars = 5000/' "$INI_FILE" 2>/dev/null || true
      $SUDO sed -i 's/^\s*;*\s*allow_url_fopen\s*=.*/allow_url_fopen = On/' "$INI_FILE" 2>/dev/null || true
    fi
  done
  $SUDO systemctl restart "php${VER}-fpm" 2>/dev/null || $SUDO service "php${VER}-fpm" restart 2>/dev/null || true
done

$SUDO systemctl reload nginx 2>/dev/null || $SUDO service nginx reload 2>/dev/null || true

echo "=========================================================="
echo "✅ SELESAI! ionCube Loader, cURL & Seluruh Ekstensi PHP Aktif!"
php -v 2>/dev/null | head -n 4 || true
echo "=========================================================="
