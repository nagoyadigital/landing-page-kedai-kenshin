<?php
/**
 * admin/auth.php
 * Handle login & logout untuk admin panel.
 * Ganti ADMIN_PASSWORD di bawah sebelum deploy!
 */

session_start();
header('Content-Type: application/json');

// ── Konfigurasi ───────────────────────────────────────────
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'kenshin2024'); // ← GANTI SEBELUM DEPLOY

$body = json_decode(file_get_contents('php://input'), true);
$action = $body['action'] ?? '';

switch ($action) {

    case 'login':
        $user = trim($body['username'] ?? '');
        $pass = trim($body['password'] ?? '');

        if ($user === ADMIN_USERNAME && $pass === ADMIN_PASSWORD) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_time']      = time();
            echo json_encode(['success' => true, 'message' => 'Login berhasil']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logout berhasil']);
        break;

    case 'check':
        echo json_encode(['logged_in' => !empty($_SESSION['admin_logged_in'])]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
}
