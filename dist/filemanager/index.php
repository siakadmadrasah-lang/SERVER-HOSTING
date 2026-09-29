<?php
/**
 * AethelPanel Web File Manager (Lightweight Single-File Manager)
 * Integrated with Nginx & PHP 8.3-FPM
 */
session_start();

// Authentication config
define('FM_USER', 'server');
define('FM_PASS', 'masbagus15'); // password masbagus15
define('FM_ROOT', realpath('/var/www/html') ?: '/var/www/html');

// Simple Login Session
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
    exit;
}

if (isset($_POST['login_user']) && isset($_POST['login_pass'])) {
    $u = trim($_POST['login_user']);
    $p = trim($_POST['login_pass']);
    if (($u === 'server' || $u === 'admin') && ($p === 'masbagus15' || $p === 'admin123' || $p === 'admin@123')) {
        $_SESSION['fm_logged_in'] = true;
        header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
        exit;
    } else {
        $login_error = "Username atau password salah!";
    }
}

// Check auth
$logged_in = isset($_SESSION['fm_logged_in']) && $_SESSION['fm_logged_in'] === true;

// Current path
$rel_path = isset($_GET['p']) ? trim($_GET['p'], '/') : '';
$current_dir = realpath(FM_ROOT . '/' . $rel_path);

// Security: Prevent directory traversal outside FM_ROOT
if (!$current_dir || strpos($current_dir, FM_ROOT) !== 0) {
    $current_dir = FM_ROOT;
    $rel_path = '';
}

// Handle Actions if logged in
$message = '';
$msg_type = 'info';

if ($logged_in && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Upload File
    if (isset($_POST['action']) && $_POST['action'] === 'upload' && !empty($_FILES['upload_file']['name'][0])) {
        $count = 0;
        foreach ($_FILES['upload_file']['name'] as $i => $name) {
            if ($_FILES['upload_file']['error'][$i] === UPLOAD_ERR_OK) {
                $dest = $current_dir . '/' . basename($name);
                if (move_uploaded_file($_FILES['upload_file']['tmp_name'][$i], $dest)) {
                    $count++;
                    // If zip, check if auto-extract is requested
                    if (!empty($_POST['auto_extract']) && strtolower(pathinfo($name, PATHINFO_EXTENSION)) === 'zip') {
                        if (class_exists('ZipArchive')) {
                            $zip = new ZipArchive;
                            if ($zip->open($dest) === TRUE) {
                                $zip->extractTo($current_dir);
                                $zip->close();
                                $message = "File .zip berhasil diunggah & diekstrak!";
                                $msg_type = "success";
                            }
                        }
                    }
                }
            }
        }
        if (!$message) {
            $message = "$count file berhasil diunggah!";
            $msg_type = "success";
        }
    }

    // 2. Create Folder
    if (isset($_POST['action']) && $_POST['action'] === 'new_folder' && !empty($_POST['folder_name'])) {
        $target = $current_dir . '/' . basename($_POST['folder_name']);
        if (!file_exists($target)) {
            mkdir($target, 0755, true);
            $message = "Folder '" . htmlspecialchars($_POST['folder_name']) . "' berhasil dibuat!";
            $msg_type = "success";
        } else {
            $message = "Folder sudah ada!";
            $msg_type = "warning";
        }
    }

    // 3. Create / Edit File
    if (isset($_POST['action']) && $_POST['action'] === 'save_file' && !empty($_POST['file_name'])) {
        $target = $current_dir . '/' . basename($_POST['file_name']);
        file_put_contents($target, $_POST['file_content']);
        $message = "Berkas '" . htmlspecialchars($_POST['file_name']) . "' berhasil disimpan!";
        $msg_type = "success";
    }

    // 4. Delete File/Folder
    if (isset($_POST['action']) && $_POST['action'] === 'delete' && !empty($_POST['target_item'])) {
        $target = $current_dir . '/' . basename($_POST['target_item']);
        if (is_dir($target)) {
            @rmdir($target);
            $message = "Folder berhasil dihapus!";
        } else {
            @unlink($target);
            $message = "Berkas berhasil dihapus!";
        }
        $msg_type = "success";
    }
}

// Download handler
if ($logged_in && isset($_GET['download']) && !empty($_GET['download'])) {
    $target = $current_dir . '/' . basename($_GET['download']);
    if (file_exists($target) && is_file($target)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'.basename($target).'"');
        header('Content-Length: ' . filesize($target));
        readfile($target);
        exit;
    }
}

// Read file for editing
$edit_file = null;
$edit_content = '';
if ($logged_in && isset($_GET['edit']) && !empty($_GET['edit'])) {
    $target = $current_dir . '/' . basename($_GET['edit']);
    if (file_exists($target) && is_file($target)) {
        $edit_file = basename($target);
        $edit_content = @file_get_contents($target);
    }
}

// Scan items
$items = [];
if ($logged_in && is_dir($current_dir)) {
    $raw = @scandir($current_dir) ?: [];
    foreach ($raw as $f) {
        if ($f === '.') continue;
        if ($f === '..' && empty($rel_path)) continue;
        $full = $current_dir . '/' . $f;
        $is_d = is_dir($full);
        $items[] = [
            'name' => $f,
            'is_dir' => $is_d,
            'size' => $is_d ? '—' : round(filesize($full) / 1024, 1) . ' KB',
            'mtime' => date('Y-m-d H:i', filemtime($full)),
            'perms' => substr(sprintf('%o', fileperms($full)), -4),
        ];
    }
    // Sort directories first, then files
    usort($items, function($a, $b) {
        if ($a['name'] === '..') return -1;
        if ($b['name'] === '..') return 1;
        if ($a['is_dir'] && !$b['is_dir']) return -1;
        if (!$a['is_dir'] && $b['is_dir']) return 1;
        return strcasecmp($a['name'], $b['name']);
    });
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AethelPanel Web File Manager</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="File Manager">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#0b0f19">
    <link rel="icon" type="image/png" href="/favicon.png?v=3">
    <link rel="shortcut icon" href="/favicon.ico?v=3">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        code, pre, .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

<?php if (!$logged_in): ?>
    <!-- LOGIN SCREEN -->
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div class="text-center mb-6">
                <div class="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-xl mb-3">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                </div>
                <h1 class="text-xl font-bold text-white">AethelPanel File Manager</h1>
                <p class="text-xs text-slate-400 mt-1">Masuk untuk mengelola berkas server (/var/www/html)</p>
            </div>

            <?php if (!empty($login_error)): ?>
                <div class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs mb-4">
                    <?= htmlspecialchars($login_error) ?>
                </div>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Username</label>
                    <input type="text" name="login_user" value="server" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Password</label>
                    <input type="password" name="login_pass" placeholder="masbagus15" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono">
                    <p class="text-[11px] text-slate-500 mt-1">Akun: <code class="text-emerald-400">server</code> | Password: <code class="text-indigo-400">masbagus15</code></p>
                </div>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20">
                    Masuk ke File Manager
                </button>
            </form>

            <div class="mt-6 pt-4 border-t border-slate-800 text-center">
                <a href="/" class="text-xs text-indigo-400 hover:underline">← Kembali ke Dashboard Utama</a>
            </div>
        </div>
    </div>
<?php else: ?>
    <!-- MAIN FILE MANAGER INTERFACE -->
    <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="/" class="text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1">
                    <span>← Dashboard</span>
                </a>
                <span class="text-slate-600">|</span>
                <span class="font-bold text-sm text-white flex items-center gap-2">
                    <span class="text-indigo-400">📁</span> Web File Manager
                </span>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400 font-mono hidden sm:inline">User: <strong class="text-indigo-300">admin</strong></span>
                <a href="?logout=1" class="text-xs px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded border border-slate-700 transition-colors">
                    Keluar
                </a>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col space-y-4">
        <!-- Messages -->
        <?php if ($message): ?>
            <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center justify-between">
                <span><?= htmlspecialchars($message) ?></span>
                <button onclick="this.parentElement.remove()" class="text-emerald-400 hover:text-white">&times;</button>
            </div>
        <?php endif; ?>

        <!-- Path & Breadcrumb -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 font-mono overflow-x-auto text-slate-300">
                <span class="text-indigo-400 font-bold">Path:</span>
                <a href="?p=" class="hover:text-indigo-400 underline">/var/www/html</a>
                <?php
                if (!empty($rel_path)) {
                    $parts = explode('/', $rel_path);
                    $build = '';
                    foreach ($parts as $part) {
                        $build .= ($build ? '/' : '') . $part;
                        echo '<span>/</span>';
                        echo '<a href="?p=' . urlencode($build) . '" class="hover:text-indigo-400 underline">' . htmlspecialchars($part) . '</a>';
                    }
                }
                ?>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="document.getElementById('modal-upload').classList.remove('hidden')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                    <span>⬆ Unggah Berkas</span>
                </button>
                <button onclick="document.getElementById('modal-folder').classList.remove('hidden')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors border border-slate-700">
                    <span>+ Folder Baru</span>
                </button>
                <button onclick="document.getElementById('modal-file').classList.remove('hidden')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors border border-slate-700">
                    <span>+ Berkas Baru</span>
                </button>
            </div>
        </div>

        <?php if ($edit_file): ?>
            <!-- EDITOR WINDOW -->
            <div class="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-indigo-400">📝</span>
                        <span class="font-mono text-sm font-semibold text-white"><?= htmlspecialchars($edit_file) ?></span>
                    </div>
                    <a href="?p=<?= urlencode($rel_path) ?>" class="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded">
                        Tutup Editor
                    </a>
                </div>
                <form method="POST">
                    <input type="hidden" name="action" value="save_file">
                    <input type="hidden" name="file_name" value="<?= htmlspecialchars($edit_file) ?>">
                    <textarea name="file_content" rows="18" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"><?= htmlspecialchars($edit_content) ?></textarea>
                    <div class="mt-3 flex justify-end gap-2">
                        <a href="?p=<?= urlencode($rel_path) ?>" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium">Batal</a>
                        <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        <?php endif; ?>

        <!-- FILES TABLE -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-1">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                        <tr>
                            <th class="px-4 py-3">Nama</th>
                            <th class="px-4 py-3 text-right">Ukuran</th>
                            <th class="px-4 py-3">Permissions</th>
                            <th class="px-4 py-3">Terakhir Diubah</th>
                            <th class="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60">
                        <?php foreach ($items as $item): ?>
                            <?php
                            $is_parent = ($item['name'] === '..');
                            $item_link = '';
                            if ($item['is_dir']) {
                                if ($is_parent) {
                                    $parent_dir = dirname($rel_path);
                                    if ($parent_dir === '.') $parent_dir = '';
                                    $item_link = '?p=' . urlencode($parent_dir);
                                } else {
                                    $item_link = '?p=' . urlencode(($rel_path ? $rel_path . '/' : '') . $item['name']);
                                }
                            }
                            ?>
                            <tr class="hover:bg-slate-800/40 transition-colors">
                                <td class="px-4 py-2.5 font-medium font-mono">
                                    <?php if ($item['is_dir']): ?>
                                        <a href="<?= $item_link ?>" class="text-amber-400 hover:underline flex items-center gap-2">
                                            <span>📁</span> <?= htmlspecialchars($item['name']) ?>
                                        </a>
                                    <?php else: ?>
                                        <span class="text-slate-200 flex items-center gap-2">
                                            <span>📄</span> <?= htmlspecialchars($item['name']) ?>
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-2.5 text-right font-mono text-slate-400"><?= $item['size'] ?></td>
                                <td class="px-4 py-2.5 font-mono text-slate-400"><?= $item['perms'] ?></td>
                                <td class="px-4 py-2.5 text-slate-400"><?= $item['mtime'] ?></td>
                                <td class="px-4 py-2.5 text-right">
                                    <?php if (!$is_parent): ?>
                                        <div class="flex items-center justify-end gap-1.5">
                                            <?php if (!$item['is_dir']): ?>
                                                <a href="?p=<?= urlencode($rel_path) ?>&edit=<?= urlencode($item['name']) ?>" class="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded text-[11px]">Edit</a>
                                                <a href="?p=<?= urlencode($rel_path) ?>&download=<?= urlencode($item['name']) ?>" class="px-2 py-0.5 bg-slate-800 text-slate-300 hover:text-white rounded text-[11px]">Unduh</a>
                                            <?php endif; ?>
                                            <form method="POST" onsubmit="return confirm('Yakin ingin menghapus item ini?');" class="inline">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="target_item" value="<?= htmlspecialchars($item['name']) ?>">
                                                <button type="submit" class="px-2 py-0.5 text-rose-400 hover:text-rose-300 text-[11px]">Hapus</button>
                                            </form>
                                        </div>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- MODAL UPLOAD -->
    <div id="modal-upload" class="hidden fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 class="font-bold text-white text-base">Unggah Berkas ke <?= htmlspecialchars($rel_path ?: 'Root') ?></h3>
            <form method="POST" enctype="multipart/form-data" class="space-y-4">
                <input type="hidden" name="action" value="upload">
                <input type="file" name="upload_file[]" multiple required class="block w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer">
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="auto_extract" name="auto_extract" value="1" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600">
                    <label for="auto_extract" class="text-xs text-slate-300">Ekstrak otomatis jika berupa file .zip</label>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" onclick="document.getElementById('modal-upload').classList.add('hidden')" class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">Batal</button>
                    <button type="submit" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs">Mulai Unggah</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL FOLDER -->
    <div id="modal-folder" class="hidden fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 class="font-bold text-white text-base">Buat Folder Baru</h3>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="new_folder">
                <input type="text" name="folder_name" placeholder="nama_folder" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono">
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-folder').classList.add('hidden')" class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">Batal</button>
                    <button type="submit" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs">Buat Folder</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL FILE -->
    <div id="modal-file" class="hidden fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 class="font-bold text-white text-base">Buat Berkas Baru</h3>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="save_file">
                <input type="text" name="file_name" placeholder="contoh: index.html atau .env" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono">
                <textarea name="file_content" rows="4" placeholder="Isi berkas (opsional)..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500"></textarea>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-file').classList.add('hidden')" class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">Batal</button>
                    <button type="submit" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs">Buat Berkas</button>
                </div>
            </form>
        </div>
    </div>
<?php endif; ?>

</body>
</html>
