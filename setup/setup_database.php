<?php
/**
 * Database Setup and Initialization Script
 * This script initializes the database and verifies all connections
 * 
 * INSTRUCTIONS:
 * 1. Place this file in: c:\wamp64\www\webdev\setup\
 * 2. Open browser: http://localhost/webdev/setup/setup_database.php
 * 3. Follow the on-screen instructions
 */

$host = 'localhost';
$dbname = 'vitalsoft_db';
$username = 'root';
$password = '';

// Create connection for database creation
$mysqli = new mysqli($host, $username, $password);

if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

$mysqli->set_charset("utf8mb4");

// Check if setup is requested
$action = $_GET['action'] ?? 'show';

?>
<!DOCTYPE html>
<html>
<head>
    <title>VitalSoft - Database Setup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
        }
        .status-box {
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 500;
        }
        .status-success { 
            background: #d4edda; 
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-error { 
            background: #f8d7da; 
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status-info { 
            background: #d1ecf1; 
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px 10px 0;
            transition: background 0.3s;
        }
        button:hover {
            background: #764ba2;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .instructions {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
            line-height: 1.6;
        }
        .step {
            margin: 15px 0;
        }
        .step-number {
            background: #667eea;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            font-weight: bold;
        }
        code {
            background: #f1f1f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        pre {
            background: #f1f1f1;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
            margin: 10px 0;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 VitalSoft - Database Setup</h1>
        
        <?php
        
        if ($action === 'setup') {
            setupDatabase($mysqli, $host, $username, $password);
        } elseif ($action === 'verify') {
            verifySetup($host, $username, $password, $dbname);
        } else {
            showSetupForm();
        }
        
        $mysqli->close();
        
        function showSetupForm() {
            ?>
            <div class="instructions">
                <h2 style="margin-bottom: 15px;">Welcome to VitalSoft Setup!</h2>
                <p>This wizard will help you set up the VitalSoft pharmacy management system database.</p>
            </div>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Database Configuration</strong>
                <p style="margin-top: 5px;">Click the button below to create the database and load the initial data.</p>
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Verify Setup</strong>
                <p style="margin-top: 5px;">Verify that the database was created successfully.</p>
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Access Application</strong>
                <p style="margin-top: 5px;">Use the demo credentials to log in and test the system.</p>
            </div>
            
            <div class="instructions" style="margin-top: 30px;">
                <h3 style="margin-bottom: 10px;">Demo Credentials:</h3>
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Doctor:</strong> doctor / doctor123</p>
                <p><strong>Pharmacist:</strong> pharmacist / pharma123</p>
                <p><strong>Patient:</strong> patient / patient123</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.location.href='?action=setup'">Start Setup</button>
                <button onclick="window.location.href='?action=verify'">Verify Existing Setup</button>
            </div>
            <?php
        }
        
        function setupDatabase($mysqli, $host, $username, $password) {
            $steps = [
                ['name' => 'Creating database', 'sql' => 'CREATE DATABASE IF NOT EXISTS vitalsoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'],
                ['name' => 'Connecting to database', 'action' => 'connect'],
                ['name' => 'Creating tables', 'action' => 'tables'],
                ['name' => 'Inserting seed data', 'action' => 'seed']
            ];
            
            try {
                // Create database
                echo '<div class="status-box status-success">✓ Creating database...</div>';
                $mysqli->query("CREATE DATABASE IF NOT EXISTS vitalsoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                // Connect to the new database
                echo '<div class="status-box status-success">✓ Selecting database...</div>';
                $mysqli->select_db('vitalsoft_db');
                $mysqli->set_charset("utf8mb4");
                
                // Read and execute the SQL file
                $sqlFile = __DIR__ . '/../database/maindb.sql';
                
                if (!file_exists($sqlFile)) {
                    throw new Exception("SQL file not found at: $sqlFile");
                }
                
                echo '<div class="status-box status-success">✓ Loading database schema...</div>';
                
                // Read the SQL file
                $sql = file_get_contents($sqlFile);
                
                // Split into individual statements
                $statements = explode(';', $sql);
                
                $count = 0;
                foreach ($statements as $statement) {
                    $statement = trim($statement);
                    if (!empty($statement)) {
                        if (!$mysqli->query($statement)) {
                            throw new Exception("Error executing query: " . $mysqli->error . "\n\nQuery: " . substr($statement, 0, 100));
                        }
                        $count++;
                    }
                }
                
                echo '<div class="status-box status-success">✓ Database setup completed successfully!</div>';
                echo '<div class="status-box status-info">Executed ' . $count . ' SQL statements</div>';
                
                echo '<div class="instructions" style="margin-top: 30px;">';
                echo '<h3>Setup Complete! 🎉</h3>';
                echo '<p>Your database has been successfully created and populated with sample data.</p>';
                echo '<p style="margin-top: 10px;"><strong>Next steps:</strong></p>';
                echo '<ol style="margin-left: 20px; margin-top: 10px;">';
                echo '<li>Open your browser</li>';
                echo '<li>Navigate to <code>http://localhost/webdev/html/login.html</code></li>';
                echo '<li>Login with demo credentials (see above)</li>';
                echo '<li>Start using VitalSoft!</li>';
                echo '</ol>';
                echo '</div>';
                
                echo '<div style="text-align: center; margin-top: 30px;">';
                echo '<button onclick="window.location.href=\'?action=verify\'">Verify Setup</button>';
                echo '<button onclick="window.open(\'../html/login.html\', \'_blank\')">Open Login Page</button>';
                echo '</div>';
                
            } catch (Exception $e) {
                echo '<div class="status-box status-error">✗ Error: ' . $e->getMessage() . '</div>';
                echo '<div style="text-align: center; margin-top: 20px;">';
                echo '<button onclick="window.location.href=\'?action=show\'">Back</button>';
                echo '</div>';
            }
        }
        
        function verifySetup($host, $username, $password, $dbname) {
            $checks = [];
            
            // Check database connection
            $conn = new mysqli($host, $username, $password, $dbname);
            if ($conn->connect_error) {
                echo '<div class="status-box status-error">✗ Database connection failed: ' . $conn->connect_error . '</div>';
                echo '<div style="text-align: center; margin-top: 20px;">';
                echo '<button onclick="window.location.href=\'?action=show\'">Back</button>';
                echo '</div>';
                return;
            }
            
            echo '<div class="status-box status-success">✓ Database connection: OK</div>';
            
            // Check tables
            $result = $conn->query("SHOW TABLES");
            $tableCount = $result->num_rows;
            
            if ($tableCount > 0) {
                echo '<div class="status-box status-success">✓ Database tables: ' . $tableCount . ' tables found</div>';
                
                echo '<div class="instructions">';
                echo '<h3>Tables:</h3>';
                echo '<ul style="margin-left: 20px; margin-top: 10px;">';
                while ($row = $result->fetch_array()) {
                    echo '<li>' . htmlspecialchars($row[0]) . '</li>';
                }
                echo '</ul>';
                echo '</div>';
            } else {
                echo '<div class="status-box status-error">✗ No tables found. Please run the setup first.</div>';
            }
            
            // Check data
            $result = $conn->query("SELECT COUNT(*) as count FROM users");
            $row = $result->fetch_assoc();
            $userCount = $row['count'];
            
            if ($userCount > 0) {
                echo '<div class="status-box status-success">✓ Sample data: ' . $userCount . ' users found</div>';
            } else {
                echo '<div class="status-box status-error">✗ No users found. Database may need seed data.</div>';
            }
            
            echo '<div style="text-align: center; margin-top: 30px;">';
            echo '<button onclick="window.location.href=\'?action=show\'">Back</button>';
            echo '<button onclick="window.open(\'../html/login.html\', \'_blank\')">Open Login Page</button>';
            echo '</div>';
            
            $conn->close();
        }
        
        ?>
    </div>
</body>
</html>
