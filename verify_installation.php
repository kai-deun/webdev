<?php
/**
 * VitalSoft Installation Verification Script
 * 
 * This script verifies that all components of VitalSoft are properly installed
 * and configured.
 * 
 * Access: http://localhost/webdev/verify_installation.php
 */

header('Content-Type: text/html; charset=utf-8');

// Configuration
$checks = [
    'php' => [],
    'server' => [],
    'database' => [],
    'files' => [],
    'config' => []
];

$critical = false;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitalSoft - Installation Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin: 30px 0;
        }
        
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.3em;
        }
        
        .check {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            display: flex;
            align-items: center;
            font-weight: 500;
        }
        
        .check-icon {
            margin-right: 15px;
            font-size: 1.5em;
            min-width: 30px;
        }
        
        .check.pass {
            background: #d4edda;
            border-left: 4px solid #28a745;
            color: #155724;
        }
        
        .check.fail {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            color: #721c24;
        }
        
        .check.warn {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
        }
        
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
        }
        
        .summary h3 {
            margin-bottom: 15px;
            color: #667eea;
        }
        
        .summary-item {
            padding: 5px 0;
            display: flex;
            justify-content: space-between;
        }
        
        .summary-value {
            font-weight: bold;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 30px;
            justify-content: center;
        }
        
        button {
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #764ba2;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .status-badge.pass {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.fail {
            background: #f8d7da;
            color: #721c24;
        }
        
        .detail {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 VitalSoft Installation Verification</h1>
            <p>Complete system check and diagnostics</p>
        </div>
        
        <div class="content">
            <?php
            
            // =============================================
            // 1. PHP CHECKS
            // =============================================
            
            echo '<div class="section">';
            echo '<h2>PHP Configuration</h2>';
            
            // PHP Version
            $php_version = phpversion();
            $php_ok = version_compare($php_version, '7.4', '>=');
            echo '<div class="check ' . ($php_ok ? 'pass' : 'fail') . '">';
            echo '<span class="check-icon">' . ($php_ok ? '✓' : '✗') . '</span>';
            echo '<span>PHP Version: ' . $php_version . '</span>';
            echo ($php_ok ? '' : '<span class="status-badge fail">BELOW 7.4</span>');
            echo '</div>';
            
            // Extensions
            $required_ext = ['mysqli', 'json', 'session', 'filter', 'hash'];
            foreach ($required_ext as $ext) {
                $installed = extension_loaded($ext);
                echo '<div class="check ' . ($installed ? 'pass' : 'fail') . '">';
                echo '<span class="check-icon">' . ($installed ? '✓' : '✗') . '</span>';
                echo '<span>Extension: ' . $ext . '</span>';
                echo '</div>';
                if (!$installed) $critical = true;
            }
            
            echo '</div>';
            
            // =============================================
            // 2. SERVER CHECKS
            // =============================================
            
            echo '<div class="section">';
            echo '<h2>Server Configuration</h2>';
            
            // Server Software
            $server_software = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
            echo '<div class="check pass">';
            echo '<span class="check-icon">✓</span>';
            echo '<span>Server: ' . htmlspecialchars($server_software) . '</span>';
            echo '</div>';
            
            // Request Method
            echo '<div class="check pass">';
            echo '<span class="check-icon">✓</span>';
            echo '<span>Request Method: ' . $_SERVER['REQUEST_METHOD'] . '</span>';
            echo '</div>';
            
            // Document Root
            $doc_root = $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown';
            echo '<div class="check pass">';
            echo '<span class="check-icon">✓</span>';
            echo '<span>Document Root: ' . htmlspecialchars($doc_root) . '</span>';
            echo '</div>';
            
            echo '</div>';
            
            // =============================================
            // 3. DATABASE CHECKS
            // =============================================
            
            echo '<div class="section">';
            echo '<h2>Database Configuration</h2>';
            
            // Config file
            $config_file = __DIR__ . '/php/config.php';
            $config_exists = file_exists($config_file);
            echo '<div class="check ' . ($config_exists ? 'pass' : 'fail') . '">';
            echo '<span class="check-icon">' . ($config_exists ? '✓' : '✗') . '</span>';
            echo '<span>Config File: ' . ($config_exists ? 'Found' : 'NOT FOUND') . '</span>';
            if ($config_exists) {
                echo '<div class="detail">' . htmlspecialchars($config_file) . '</div>';
            }
            echo '</div>';
            
            if ($config_exists) {
                require_once $config_file;
                
                // Database Connection
                $mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
                $db_ok = !$mysqli->connect_error;
                
                echo '<div class="check ' . ($db_ok ? 'pass' : 'fail') . '">';
                echo '<span class="check-icon">' . ($db_ok ? '✓' : '✗') . '</span>';
                echo '<span>Database Connection</span>';
                if (!$db_ok) {
                    echo '<div class="detail">Error: ' . htmlspecialchars($mysqli->connect_error) . '</div>';
                    $critical = true;
                } else {
                    echo '<div class="detail">Host: ' . DB_HOST . ' | Database: ' . DB_NAME . '</div>';
                }
                echo '</div>';
                
                if ($db_ok) {
                    // Tables count
                    $result = $mysqli->query("SHOW TABLES");
                    $table_count = $result ? $result->num_rows : 0;
                    $tables_ok = $table_count > 15;
                    
                    echo '<div class="check ' . ($tables_ok ? 'pass' : ($table_count > 0 ? 'warn' : 'fail')) . '">';
                    echo '<span class="check-icon">' . ($table_count > 0 ? '✓' : '✗') . '</span>';
                    echo '<span>Database Tables: ' . $table_count . ' found</span>';
                    if ($table_count === 0) {
                        echo '<div class="detail">⚠️ No tables found. Please run setup.</div>';
                    } elseif ($table_count < 15) {
                        echo '<div class="detail">⚠️ Expected ~20 tables. Database may be incomplete.</div>';
                    }
                    echo '</div>';
                    
                    // Users check
                    $users_result = $mysqli->query("SELECT COUNT(*) as count FROM users");
                    $user_count = $users_result ? $users_result->fetch_assoc()['count'] : 0;
                    $users_ok = $user_count > 0;
                    
                    echo '<div class="check ' . ($users_ok ? 'pass' : 'fail') . '">';
                    echo '<span class="check-icon">' . ($users_ok ? '✓' : '✗') . '</span>';
                    echo '<span>Sample Data: ' . $user_count . ' users</span>';
                    if (!$users_ok) {
                        echo '<div class="detail">⚠️ No users found. Please run setup.</div>';
                    }
                    echo '</div>';
                    
                    $mysqli->close();
                }
            }
            
            echo '</div>';
            
            // =============================================
            // 4. FILE CHECKS
            // =============================================
            
            echo '<div class="section">';
            echo '<h2>Required Files</h2>';
            
            $required_files = [
                '/html/login.html' => 'Login Page',
                '/php/auth.php' => 'Authentication',
                '/php/config.php' => 'Configuration',
                '/php/prescription.php' => 'Prescription API',
                '/database/maindb.sql' => 'Database Schema',
                '/css/login.css' => 'Login Stylesheet',
                '/js/login.js' => 'Login Script'
            ];
            
            foreach ($required_files as $path => $name) {
                $full_path = __DIR__ . $path;
                $exists = file_exists($full_path);
                
                echo '<div class="check ' . ($exists ? 'pass' : 'fail') . '">';
                echo '<span class="check-icon">' . ($exists ? '✓' : '✗') . '</span>';
                echo '<span>' . $name . '</span>';
                if (!$exists) {
                    echo '<span class="status-badge fail">MISSING</span>';
                    $critical = true;
                }
                echo '</div>';
            }
            
            echo '</div>';
            
            // =============================================
            // 5. SUMMARY
            // =============================================
            
            echo '<div class="summary">';
            echo '<h3>Installation Status</h3>';
            
            if ($critical) {
                echo '<div class="check fail">';
                echo '<span class="check-icon">✗</span>';
                echo '<span><strong>CRITICAL ISSUES FOUND</strong> - System is not fully functional</span>';
                echo '</div>';
            } else {
                echo '<div class="check pass">';
                echo '<span class="check-icon">✓</span>';
                echo '<span><strong>ALL CHECKS PASSED</strong> - System is ready to use</span>';
                echo '</div>';
            }
            
            echo '</div>';
            
            ?>
            
            <div class="button-group">
                <button class="btn-primary" onclick="window.location.href='http://localhost/webdev/setup/setup_database.php'">
                    Setup Database
                </button>
                <button class="btn-primary" onclick="window.location.href='http://localhost/webdev/html/login.html'">
                    Login Page
                </button>
                <button class="btn-secondary" onclick="location.reload()">
                    Refresh Check
                </button>
            </div>
        </div>
        
        <div class="footer">
            <p>VitalSoft Installation Verification • Version 1.0.0</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Generated: <?php echo date('Y-m-d H:i:s'); ?></p>
        </div>
    </div>
</body>
</html>
