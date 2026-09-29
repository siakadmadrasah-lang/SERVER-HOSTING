<?php
/**
 * AethelPanel Web Terminal (Browser SSH Console)
 * Integrated with Nginx & PHP-FPM
 * Allows managing Ubuntu server directly from any web browser (Mobile & Desktop)
 */
session_start();

// Authentication Configuration
define('TERM_USER', 'server');
define('TERM_PASS', 'masbagus15');
define('DEFAULT_CWD', '/var/www/html/siakad');

// Handle Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
    exit;
}

// Handle Login
$login_error = '';
if (isset($_POST['login_user']) && isset($_POST['login_pass'])) {
    $u = trim($_POST['login_user']);
    $p = trim($_POST['login_pass']);
    if (($u === 'server' || $u === 'denbaguse' || $u === 'admin') && 
        ($p === 'masbagus15' || $p === 'admin123' || $p === 'admin@123')) {
        $_SESSION['term_logged_in'] = true;
        $_SESSION['term_user'] = $u;
        if (!isset($_SESSION['term_cwd'])) {
            $_SESSION['term_cwd'] = is_dir(DEFAULT_CWD) ? DEFAULT_CWD : (is_dir('/var/www/html') ? '/var/www/html' : getcwd());
        }
        if (!isset($_SESSION['term_history'])) {
            $_SESSION['term_history'] = [];
        }
        header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
        exit;
    } else {
        $login_error = 'Username atau password salah!';
    }
}

// API Login via Header or JSON (supports both auth_user/auth_pass and user/password)
$input_json = json_decode(file_get_contents('php://input'), true);
$api_u = isset($input_json['auth_user']) ? trim($input_json['auth_user']) : (isset($input_json['user']) ? trim($input_json['user']) : '');
$api_p = isset($input_json['auth_pass']) ? trim($input_json['auth_pass']) : (isset($input_json['password']) ? trim($input_json['password']) : '');
if ($api_u !== '' && $api_p !== '') {
    if (($api_u === 'server' || $api_u === 'denbaguse' || $api_u === 'admin') && 
        ($api_p === 'masbagus15' || $api_p === 'admin123' || $api_p === 'admin@123')) {
        $_SESSION['term_logged_in'] = true;
        $_SESSION['term_user'] = $api_u;
    }
}

$logged_in = isset($_SESSION['term_logged_in']) && $_SESSION['term_logged_in'] === true;

// Initialize session state
if ($logged_in) {
    if (!isset($_SESSION['term_cwd']) || !is_dir($_SESSION['term_cwd'])) {
        $_SESSION['term_cwd'] = is_dir(DEFAULT_CWD) ? DEFAULT_CWD : (is_dir('/var/www/html') ? '/var/www/html' : getcwd());
    }
    if (!isset($_SESSION['term_history'])) {
        $_SESSION['term_history'] = [];
    }
}

// ANSI escape code to HTML converter
function ansiToHtml($text) {
    $html = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    
    // Convert basic ANSI colors
    $patterns = [
        '/\e\[0?m/' => '</span>',
        '/\e\[1m/' => '<span class="font-bold">',
        '/\e\[30m/' => '<span class="text-slate-500">',
        '/\e\[31m/' => '<span class="text-red-400">',
        '/\e\[32m/' => '<span class="text-emerald-400">',
        '/\e\[33m/' => '<span class="text-amber-400">',
        '/\e\[34m/' => '<span class="text-blue-400">',
        '/\e\[35m/' => '<span class="text-purple-400">',
        '/\e\[36m/' => '<span class="text-cyan-400">',
        '/\e\[37m/' => '<span class="text-slate-200">',
        '/\e\[90m/' => '<span class="text-slate-400">',
        '/\e\[91m/' => '<span class="text-red-300">',
        '/\e\[92m/' => '<span class="text-emerald-300">',
        '/\e\[93m/' => '<span class="text-yellow-300">',
        '/\e\[94m/' => '<span class="text-sky-300">',
        '/\e\[95m/' => '<span class="text-pink-300">',
        '/\e\[96m/' => '<span class="text-teal-300">',
        '/\e\[97m/' => '<span class="text-white">',
        '/\e\[[0-9;]*[a-zA-Z]/' => '', // Strip other escapes
    ];
    
    foreach ($patterns as $pattern => $replacement) {
        $html = preg_replace($pattern, $replacement, $html);
    }
    return $html;
}

// Command execution function
function executeCommand($command, &$current_cwd) {
    $trimmed = trim($command);
    if ($trimmed === '') {
        return ['output' => '', 'exit_code' => 0, 'cwd' => $current_cwd];
    }
    
    // Handle standalone 'cd' commands only (without chaining &&, ;, ||, |)
    if (preg_match('/^cd(?:\s+([^;&|]+))?$/', $trimmed, $matches)) {
        $target = isset($matches[1]) ? trim($matches[1]) : '';
        if ($target === '' || $target === '~') {
            $new_dir = getenv('HOME') ?: '/root';
        } elseif ($target === '-') {
            $new_dir = isset($_SESSION['term_prev_cwd']) ? $_SESSION['term_prev_cwd'] : $current_cwd;
        } else {
            // Remove quotes if present
            $target = trim($target, '"\'');
            if ($target[0] === '/') {
                $new_dir = realpath($target);
            } else {
                $new_dir = realpath($current_cwd . '/' . $target);
            }
        }
        
        if ($new_dir && is_dir($new_dir)) {
            $_SESSION['term_prev_cwd'] = $current_cwd;
            $current_cwd = $new_dir;
            $_SESSION['term_cwd'] = $current_cwd;
            return [
                'output' => "Directory changed to: " . $current_cwd,
                'exit_code' => 0,
                'cwd' => $current_cwd
            ];
        } else {
            return [
                'output' => "bash: cd: " . $target . ": No such directory or permission denied",
                'exit_code' => 1,
                'cwd' => $current_cwd
            ];
        }
    }
    
    // Prepare command execution
    $descriptors = [
        0 => ["pipe", "r"], // stdin
        1 => ["pipe", "w"], // stdout
        2 => ["pipe", "w"], // stderr
    ];
    
    // Add environment variables (Use C.UTF-8 to avoid setlocale warnings on Ubuntu)
    $env = [
        'PATH' => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'HOME' => '/var/www',
        'USER' => 'www-data',
        'TERM' => 'xterm-256color',
        'LANG' => 'C.UTF-8',
        'LC_ALL' => 'C.UTF-8'
    ];
    
    // Automatically route any update.sh / update.ssh invocation through unique /tmp/cpro_$$ so www-data and denbaguse never collide
    if (preg_match('/(^|[;&|\s])(sudo\s+)?(bash\s+|sh\s+|\.\/)?update\.ss?h(\s|$)/i', $trimmed)) {
        $command = 'D=/tmp/cpro_$$ && git clone --depth 1 https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git $D && bash $D/update.sh && rm -rf $D';
    }

    // Smart sudo wrapper so www-data in Web Terminal never fails with "sudo: I'm sorry www-data"
    $wrapped_command = 'sudo() { if [ "$(id -u)" -eq 0 ]; then "$@"; elif command sudo -n true 2>/dev/null; then command sudo -n "$@"; elif echo masbagus15 | command sudo -S -p "" true 2>/dev/null; then echo masbagus15 | command sudo -S -p "" "$@"; else "$@"; fi; }; export -f sudo; ' . $command;
    $process = proc_open("bash -c " . escapeshellarg($wrapped_command), $descriptors, $pipes, $current_cwd, $env);
    
    $output = '';
    $exit_code = -1;
    
    if (is_resource($process)) {
        fclose($pipes[0]); // Close stdin
        
        // Read stdout and stderr with timeout
        stream_set_blocking($pipes[1], 0);
        stream_set_blocking($pipes[2], 0);
        
        $start_time = time();
        $timeout_seconds = 60; // Max 60 seconds per command
        
        while (true) {
            $read = [$pipes[1], $pipes[2]];
            $write = null;
            $except = null;
            
            $num_changed_streams = @stream_select($read, $write, $except, 0, 200000);
            
            if ($num_changed_streams === false) {
                break;
            }
            
            if ($num_changed_streams > 0) {
                foreach ($read as $r) {
                    $chunk = fread($r, 4096);
                    if ($chunk !== false && strlen($chunk) > 0) {
                        $output .= $chunk;
                    }
                }
            }
            
            $status = proc_get_status($process);
            if (!$status['running']) {
                // Read remaining output
                $output .= stream_get_contents($pipes[1]);
                $output .= stream_get_contents($pipes[2]);
                $exit_code = $status['exitcode'];
                break;
            }
            
            if ((time() - $start_time) > $timeout_seconds) {
                proc_terminate($process, 9);
                $output .= "\n[Execution timeout: Command took more than {$timeout_seconds} seconds]\n";
                $exit_code = 124;
                break;
            }
            
            usleep(50000);
        }
        
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);
    } else {
        $output = "Failed to launch process.";
        $exit_code = 1;
    }
    
    // Auto-update cwd if command was a compound command that might have changed dir
    if (strpos($trimmed, 'cd ') !== false) {
        $pwd_output = @shell_exec("cd " . escapeshellarg($current_cwd) . " && " . $command . " && pwd 2>/dev/null");
        if ($pwd_output) {
            $lines = explode("\n", trim($pwd_output));
            $last_line = end($lines);
            if (is_dir($last_line)) {
                $current_cwd = $last_line;
                $_SESSION['term_cwd'] = $current_cwd;
            }
        }
    }
    
    return [
        'output' => $output,
        'exit_code' => $exit_code,
        'cwd' => $current_cwd
    ];
}

// Handle API requests (JSON or Form POST)
if ($logged_in && (isset($_GET['api']) || isset($_POST['api']) || (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false))) {
    header('Content-Type: application/json; charset=utf-8');
    
    $req_data = $input_json ?: $_POST;
    $cmd = isset($req_data['command']) ? $req_data['command'] : '';
    
    if ($cmd === 'clear') {
        $_SESSION['term_history'] = [];
        echo json_encode(['success' => true, 'output' => '', 'exit_code' => 0, 'cwd' => $_SESSION['term_cwd']]);
        exit;
    }
    
    $res = executeCommand($cmd, $_SESSION['term_cwd']);
    
    // Add to session history
    $_SESSION['term_history'][] = [
        'command' => $cmd,
        'output' => $res['output'],
        'exit_code' => $res['exit_code'],
        'cwd' => $res['cwd'],
        'time' => date('H:i:s')
    ];
    
    // Keep max 50 entries
    if (count($_SESSION['term_history']) > 50) {
        array_shift($_SESSION['term_history']);
    }
    
    echo json_encode([
        'success' => true,
        'command' => $cmd,
        'output' => $res['output'],
        'exit_code' => $res['exit_code'],
        'cwd' => $res['cwd'],
        'time' => date('H:i:s')
    ]);
    exit;
}

// Handle Clear screen in standard UI
if ($logged_in && isset($_GET['clear'])) {
    $_SESSION['term_history'] = [];
    header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
    exit;
}

// Handle Standard Form Submission
if ($logged_in && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['command'])) {
    $cmd = $_POST['command'];
    if (trim($cmd) === 'clear') {
        $_SESSION['term_history'] = [];
    } else {
        $res = executeCommand($cmd, $_SESSION['term_cwd']);
        $_SESSION['term_history'][] = [
            'command' => $cmd,
            'output' => $res['output'],
            'exit_code' => $res['exit_code'],
            'cwd' => $res['cwd'],
            'time' => date('H:i:s')
        ];
        if (count($_SESSION['term_history']) > 50) {
            array_shift($_SESSION['term_history']);
        }
    }
    header('Location: ' . strtok($_SERVER["REQUEST_URI"], '?'));
    exit;
}

// Server stats for header
$hostname = @gethostname() ?: 'ubuntu-server';
$uptime = @shell_exec('uptime -p 2>/dev/null') ?: 'up';
$whoami = @shell_exec('whoami 2>/dev/null') ?: 'server';
?>
<!DOCTYPE html>
<html lang="id" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Web Terminal (Browser SSH) - Cloud PRO Server</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Server Terminal">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#0b0f19">
    <link rel="icon" type="image/png" href="/favicon.png?v=3">
    <link rel="shortcut icon" href="/favicon.ico?v=3">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0b0f19;
            color: #f1f5f9;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        /* Custom scrollbar for terminal */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col bg-slate-950 text-slate-100">

<?php if (!$logged_in): ?>
<!-- LOGIN SCREEN -->
<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
    <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div class="text-center mb-6">
            <div class="inline-flex p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 mb-3 shadow-inner">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Web Terminal SSH</h1>
            <p class="text-xs text-slate-400 mt-1">Akses CLI Ubuntu Langsung Lewat Browser HP & PC</p>
        </div>

        <?php if (!empty($login_error)): ?>
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span><?= htmlspecialchars($login_error) ?></span>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Username Server</label>
                <input type="text" name="login_user" value="server" required
                       class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors">
                <span class="text-[10px] text-slate-500 mt-1 block">Default: <code class="text-indigo-400">server</code> (atau <code class="text-slate-400">denbaguse</code>)</span>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <input type="password" name="login_pass" required autofocus
                       placeholder="Masukkan password server..."
                       class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors">
                <span class="text-[10px] text-slate-500 mt-1 block">Password server: <code class="text-emerald-400">masbagus15</code></span>
            </div>
            <button type="submit" 
                    class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                <span>Masuk ke Web Terminal</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </form>

        <div class="mt-6 pt-4 border-t border-slate-800 text-center">
            <a href="/" class="text-xs text-indigo-400 hover:underline flex items-center justify-center gap-1">
                <span>&larr; Kembali ke Dashboard AethelPanel</span>
            </a>
        </div>
    </div>
</div>
<?php else: ?>

<!-- TOP NAVIGATION BAR -->
<header class="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between">
    <div class="flex items-center gap-2 sm:gap-3">
        <a href="/" class="flex items-center gap-2 text-white hover:text-indigo-300 transition-colors">
            <div class="p-1.5 bg-indigo-600/30 border border-indigo-500/40 rounded-lg text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
            </div>
            <span class="font-bold text-sm tracking-tight hidden xs:inline">Cloud <span class="text-sky-400">PRO</span></span>
            <span class="px-1.5 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">WEB TERMINAL v3.5</span>
        </a>

        <div class="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-slate-800">
            <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-mono text-emerald-400"><?= htmlspecialchars(trim($whoami)) ?>@<?= htmlspecialchars(trim($hostname)) ?></span>
            </span>
            <span class="text-slate-600">|</span>
            <span class="text-[11px] text-slate-400 truncate max-w-xs"><?= htmlspecialchars(trim($uptime)) ?></span>
        </div>
    </div>

    <!-- Quick Links & Actions -->
    <div class="flex items-center gap-1.5 sm:gap-2">
        <a href="/" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors hidden sm:inline-flex items-center gap-1">
            <span>Dashboard</span>
        </a>
        <a href="/filemanager/" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors hidden sm:inline-flex items-center gap-1">
            <span>File Manager</span>
        </a>
        <a href="?clear=1" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded transition-colors flex items-center gap-1" title="Bersihkan riwayat layar">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span class="hidden sm:inline">Bersihkan</span>
        </a>
        <a href="?logout=1" class="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Keluar</span>
        </a>
    </div>
</header>

<!-- QUICK ACTION SHORTCUTS (Mobile Friendly) -->
<div class="bg-slate-900/60 border-b border-slate-800 px-3 py-2 overflow-x-auto">
    <div class="flex items-center gap-1.5 min-w-max text-[11px] font-mono">
        <span class="text-slate-500 text-[10px] mr-1 hidden sm:inline">Tindakan Cepat:</span>
        <button onclick="runShortcut('D=/tmp/cpro_$$ && git clone --depth 1 https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git $D && bash $D/update.sh && rm -rf $D')" class="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded border border-emerald-500/50 font-bold">Sinkronisasi Sistem</button>
        <button onclick="runShortcut('hostname -I')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700">Informasi IP</button>
        <button onclick="runShortcut('git status')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700">Status Repositori</button>
        <button onclick="runShortcut('php -v && php -m | grep -E \"ionCube|curl\"')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700">Status Modul PHP</button>
        <button onclick="runShortcut('service nginx status')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700">Status Web Server</button>
        <button onclick="runShortcut('free -h')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700">Kapasitas Memori</button>
        <button onclick="runShortcut('df -h')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700">Kapasitas Disk</button>
    </div>
</div>

<!-- TERMINAL WORKSPACE -->
<main class="flex-1 flex flex-col p-2 sm:p-4 max-w-7xl w-full mx-auto">
    <!-- Active Terminal Box -->
    <div class="flex-1 bg-black/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs min-h-[450px]">
        <!-- Terminal Header Bar -->
        <div class="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 mr-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span class="text-white font-semibold flex items-center gap-1.5">
                    <span class="text-emerald-400">bash</span>
                    <span class="text-slate-600">/</span>
                    <span class="text-indigo-300 text-[11px] truncate max-w-[200px] sm:max-w-md" id="cwd-display"><?= htmlspecialchars($_SESSION['term_cwd']) ?></span>
                </span>
            </div>
            <div class="text-[10px] text-slate-500 hidden sm:block">
                Ketik <code class="text-slate-300">clear</code> untuk hapus layar
            </div>
        </div>

        <!-- Terminal Output Viewport -->
        <div id="terminal-output" class="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 text-slate-200">
            <!-- Welcome Banner -->
            <div class="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[11px] leading-relaxed text-slate-400">
                <span class="text-emerald-400 font-bold">Cloud PRO Web Terminal v3.5 — Konsol Administrasi Sistem</span><br>
                Antarmuka konsol web terenkripsi yang terhubung langsung ke lingkungan sistem operasi Ubuntu Server.
            </div>

            <!-- Existing Session History -->
            <?php foreach ($_SESSION['term_history'] as $item): ?>
                <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px]">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-emerald-400 font-bold"><?= htmlspecialchars(trim($whoami)) ?>@ubuntu:<?= htmlspecialchars($item['cwd']) ?>$</span>
                            <span class="text-white font-semibold"><?= htmlspecialchars($item['command']) ?></span>
                        </div>
                        <span class="text-[10px] text-slate-500 tabular-nums"><?= htmlspecialchars($item['time']) ?></span>
                    </div>
                    <?php if (!empty($item['output'])): ?>
                        <pre class="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 whitespace-pre-wrap leading-relaxed text-slate-300 overflow-x-auto"><?= ansiToHtml($item['output']) ?></pre>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>

            <!-- Live dynamic outputs will be appended here by JS -->
            <div id="live-outputs"></div>
        </div>

        <!-- Mobile Touch Keyboard Bar -->
        <div class="bg-slate-900 border-t border-slate-800/80 px-2 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button type="button" onclick="runShortcut('D=/tmp/cpro_$$ && git clone --depth 1 https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git $D && bash $D/update.sh && rm -rf $D')" class="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 font-bold rounded shrink-0 flex items-center gap-1">Sinkronisasi Sistem</button>
            <button type="button" onclick="runShortcut('git status')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded shrink-0">Status Git</button>
            <button type="button" onclick="runShortcut('hostname -I')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded shrink-0">Info IP</button>
            <button type="button" onclick="insertText('sudo ')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded shrink-0">sudo</button>
            <button type="button" onclick="insertText('cd ')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded shrink-0">cd</button>
            <button type="button" onclick="insertText('/')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">/</button>
            <button type="button" onclick="insertText(' -')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">-</button>
            <button type="button" onclick="insertText(' | ')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">|</button>
            <button type="button" onclick="insertText(' && ')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">&amp;&amp;</button>
            <button type="button" onclick="historyNavigate(-1)" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">↑</button>
            <button type="button" onclick="historyNavigate(1)" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">↓</button>
            <button type="button" onclick="clearLiveOutput()" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded shrink-0">Clear</button>
        </div>

        <!-- Terminal Command Input Bar -->
        <form id="terminal-form" onsubmit="handleCommandSubmit(event)" class="p-2 sm:p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <span class="text-emerald-400 font-bold shrink-0 text-xs sm:text-sm pl-1">$</span>
            <input type="text" id="cmd-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                   placeholder="Ketik perintah (contoh: git pull, systemctl status nginx, bash update.sh)..."
                   class="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none placeholder-slate-600">
            <button type="submit" id="btn-submit"
                    class="px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <span>Kirim</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
        </form>
    </div>
</main>

<script>
    // State
    const terminalOutput = document.getElementById('terminal-output');
    const liveOutputs = document.getElementById('live-outputs');
    const cmdInput = document.getElementById('cmd-input');
    const cwdDisplay = document.getElementById('cwd-display');
    const btnSubmit = document.getElementById('btn-submit');
    
    let commandHistory = [];
    let historyIdx = -1;

    // Scroll to bottom initially
    function scrollToBottom() {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    scrollToBottom();

    function insertText(text) {
        cmdInput.value += text;
        cmdInput.focus();
    }

    function historyNavigate(direction) {
        if (commandHistory.length === 0) return;
        historyIdx += direction;
        if (historyIdx < 0) historyIdx = 0;
        if (historyIdx >= commandHistory.length) {
            historyIdx = commandHistory.length;
            cmdInput.value = '';
            return;
        }
        cmdInput.value = commandHistory[historyIdx];
        cmdInput.focus();
    }

    function runShortcut(cmd) {
        cmdInput.value = cmd;
        handleCommandSubmit(new Event('submit'));
    }

    function clearLiveOutput() {
        window.location.href = '?clear=1';
    }

    // Keyboard navigation (Up/Down arrow for history)
    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            historyNavigate(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            historyNavigate(1);
        }
    });

    async function handleCommandSubmit(e) {
        if (e) e.preventDefault();
        const cmd = cmdInput.value.trim();
        if (!cmd) return;

        // Add to history
        commandHistory.push(cmd);
        historyIdx = commandHistory.length;

        cmdInput.value = '';
        cmdInput.disabled = true;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="animate-spin inline-block mr-1">⌛</span> Menjalankan...`;

        // Create temporary output node
        const timeStr = new Date().toLocaleTimeString();
        const entryDiv = document.createElement('div');
        entryDiv.className = 'space-y-1';
        entryDiv.innerHTML = `
            <div class="flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-emerald-400 font-bold">$</span>
                    <span class="text-white font-semibold">${escapeHtml(cmd)}</span>
                </div>
                <span class="text-[10px] text-slate-500 tabular-nums">${timeStr}</span>
            </div>
            <pre class="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 whitespace-pre-wrap leading-relaxed text-slate-400 overflow-x-auto font-mono text-[11px]">⏳ Menjalankan perintah di server...</pre>
        `;
        liveOutputs.appendChild(entryDiv);
        scrollToBottom();

        try {
            const res = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: cmd, api: 1 })
            });
            const data = await res.json();

            if (data.cwd) {
                cwdDisplay.textContent = data.cwd;
            }

            const preNode = entryDiv.querySelector('pre');
            if (data.output) {
                preNode.className = `p-2.5 rounded bg-slate-900/80 border border-slate-800/80 whitespace-pre-wrap leading-relaxed overflow-x-auto font-mono text-[11px] ${data.exit_code === 0 ? 'text-slate-200' : 'text-rose-300'}`;
                preNode.innerHTML = formatAnsi(data.output);
            } else {
                preNode.className = 'p-2.5 rounded bg-slate-900/80 border border-slate-800/80 whitespace-pre-wrap text-emerald-400 font-mono text-[11px]';
                preNode.textContent = '(Perintah selesai tanpa output)';
            }
        } catch (err) {
            const preNode = entryDiv.querySelector('pre');
            preNode.className = 'p-2.5 rounded bg-red-950/40 border border-red-800/50 text-red-400 whitespace-pre-wrap font-mono text-[11px]';
            preNode.textContent = 'Gagal menghubungi server terminal: ' + err.message;
        } finally {
            cmdInput.disabled = false;
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>Kirim</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            cmdInput.focus();
            scrollToBottom();
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatAnsi(text) {
        let escaped = escapeHtml(text);
        return escaped
            .replace(/\x1b\[0?m/g, '</span>')
            .replace(/\x1b\[1m/g, '<span class="font-bold">')
            .replace(/\x1b\[31m/g, '<span class="text-red-400">')
            .replace(/\x1b\[32m/g, '<span class="text-emerald-400">')
            .replace(/\x1b\[33m/g, '<span class="text-amber-400">')
            .replace(/\x1b\[34m/g, '<span class="text-blue-400">')
            .replace(/\x1b\[35m/g, '<span class="text-purple-400">')
            .replace(/\x1b\[36m/g, '<span class="text-cyan-400">')
            .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    }
</script>
<?php endif; ?>

</body>
</html>
