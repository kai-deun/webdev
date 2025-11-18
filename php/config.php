<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'vitalsoft_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Create mysqli connection
function getDBConnection() {
    try {
        $mysqli = new mysqli(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                mysqli::ATTR_ERRMODE => mysqli::ERRMODE_EXCEPTION,
                mysqli::ATTR_DEFAULT_FETCH_MODE => mysqli::FETCH_ASSOC,
                mysqli::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $mysqli;
    } catch (mysqliException $e) {
        error_log("Database Connection Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed'
        ]);
        exit;
    }
}

// Start session
session_start();

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to get current user
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return [
        'user_id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role'],
        'full_name' => $_SESSION['full_name']
    ];
}

// Helper function to check user role
function hasRole($role) {
    return isset($_SESSION['role']) && $_SESSION['role'] === $role;
}
?>