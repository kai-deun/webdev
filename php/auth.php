<?php
/**
 * Authentication Module
 * Handles user login, logout, and session management
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Start session
session_start();

// Database configuration
$host = 'localhost';
$dbname = 'vitalsoft_db';
$username = 'root';
$password = '';

// Create connection
$mysqli = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $mysqli->connect_error
    ]);
    exit;
}

$mysqli->set_charset("utf8mb4");

// Get action
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

switch ($action) {
    case 'login':
        handleLogin($mysqli);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'getCurrentUser':
        getCurrentUser();
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
        break;
}

/**
 * Handle user login
 */
function handleLogin($mysqli) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
        ]);
        return;
    }

    try {
        // Query user with role information
        $query = "
            SELECT u.user_id, u.username, u.email, u.password_hash, u.first_name, u.last_name, u.status,
                   r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE (u.username = ? OR u.email = ?) AND u.status = 'active'
        ";

        $stmt = $mysqli->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }

        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid username or password'
            ]);
            $stmt->close();
            return;
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        // Verify password using bcrypt
        if (!password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid username or password'
            ]);
            return;
        }

        // Set session variables
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role_name'];
        $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['login_time'] = time();

        // Determine redirect based on role
        $redirect = getDashboardRedirect($user['role_name']);

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'role' => $user['role_name'],
                'full_name' => $user['first_name'] . ' ' . $user['last_name']
            ],
            'redirect' => $redirect
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Login error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    $_SESSION = [];
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

/**
 * Get current logged-in user
 */
function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not logged in'
        ]);
        return;
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role'],
            'full_name' => $_SESSION['full_name'],
            'email' => $_SESSION['email']
        ]
    ]);
}

/**
 * Determine redirect URL based on user role
 */
function getDashboardRedirect($role) {
    switch ($role) {
        case 'Admin':
            return '../html/Admin.html';
        case 'Doctor':
            return '../html/Doctor.html';
        case 'Pharmacist':
            return '../html/Pharmacy Employees.html';
        case 'Pharmacy Manager':
            return '../html/Pharmacy Manager.html';
        case 'Patient':
            return '../html/patient.html';
        default:
            return '../html/login.html';
    }
}

?>
