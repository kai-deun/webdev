<?php
/**
 * VitalSoft Configuration File
 * Central configuration for database and application settings
 */

// =============================================
// DATABASE CONFIGURATION
// =============================================
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');     // MySQL server hostname
define('DB_NAME', getenv('DB_NAME') ?: 'vitalsoft_db');  // Database name
define('DB_USER', getenv('DB_USER') ?: 'root');          // MySQL username
define('DB_PASS', getenv('DB_PASSWORD') ?: '');          // MySQL password

// =============================================
// APPLICATION CONFIGURATION
// =============================================
define('APP_NAME', 'VitalSoft');
define('APP_VERSION', '1.0.0');
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost/webdev');
define('SESSION_TIMEOUT', 3600);    // Session timeout in seconds (1 hour)

// =============================================
// DATABASE CONNECTION FUNCTION
// =============================================
/**
 * Get a new database connection
 * @return mysqli|false Database connection or false on error
 */
function getDbConnection() {
    // Create a new mysqli connection using constants
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // Check for connection errors
    if ($mysqli->connect_error) {
        // Set a 500 Internal Server Error response code
        http_response_code(500);
        // Return a JSON error message
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $mysqli->connect_error
        ]);
        // Terminate script execution
        exit;
    }

    // Set the character set to utf8mb4 for proper encoding
    $mysqli->set_charset("utf8mb4");

    // Return the connection object
    return $mysqli;
}

// =============================================
// SESSION MANAGEMENT
// =============================================
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Helper function to get current user session data
function getSessionUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return [
        'user_id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role'],
        'full_name' => $_SESSION['full_name'],
        'email' => $_SESSION['email'] ?? null
    ];
}

// Helper function to check user role
function hasRole($role) {
    return isset($_SESSION['role']) && $_SESSION['role'] === $role;
}

// Helper function to redirect if not logged in
function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        exit;
    }
}

// Helper function to redirect if not authorized role
function requireRole($requiredRole) {
    requireLogin();
    if (!hasRole($requiredRole)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient permissions'
        ]);
        exit;
    }
}

// =============================================
// ERROR & LOGGING
// =============================================

// Set up error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Create logs directory if it doesn't exist
$logsDir = __DIR__ . '/../logs';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0755, true);
}

// =============================================
// SECURITY HEADERS
// =============================================

// Set security headers (can be overridden per endpoint)
header_remove('X-Powered-By');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

?>
