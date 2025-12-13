<?php
/**
 * Password Setup Script
 * Run this once to set up proper password hashes for all default users
 * Access via: http://localhost/webdev/php/setup_passwords.php
 */

require_once 'config.php';

// Define default passwords for each role
$defaultPasswords = [
    'admin' => 'admin123',
    'admin2' => 'admin123',
    'doctor' => 'doctor123',
    'doctor2' => 'doctor123',
    'manager' => 'manager123',
    'manager2' => 'manager123',
    'pharmacist' => 'pharma123',
    'pharmacist2' => 'pharma123',
    'patient' => 'patient123',
    'patient2' => 'patient123'
];

$mysqli = getDbConnection();

echo "<!DOCTYPE html>
<html>
<head>
    <title>Password Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .success {
            color: #4CAF50;
            padding: 10px;
            margin: 10px 0;
            background-color: #d4edda;
            border-radius: 5px;
        }
        .error {
            color: #f44336;
            padding: 10px;
            margin: 10px 0;
            background-color: #f8d7da;
            border-radius: 5px;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔐 Password Setup Script</h1>
        <p>This script will update all default user passwords with proper bcrypt hashes.</p>
";

$updatedCount = 0;
$errors = [];

echo "<h2>Processing Users...</h2>";

foreach ($defaultPasswords as $username => $password) {
    try {
        // Generate password hash
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Update user password
        $stmt = $mysqli->prepare("UPDATE users SET password_hash = ? WHERE username = ?");
        $stmt->bind_param('ss', $passwordHash, $username);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo "<div class='success'>✓ Updated password for user: <strong>{$username}</strong> (password: <span class='code'>{$password}</span>)</div>";
                $updatedCount++;
            } else {
                echo "<div class='error'>⚠ User not found: <strong>{$username}</strong></div>";
                $errors[] = "User not found: {$username}";
            }
        } else {
            echo "<div class='error'>✗ Failed to update: <strong>{$username}</strong> - " . $stmt->error . "</div>";
            $errors[] = "Failed: {$username}";
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        echo "<div class='error'>✗ Error updating {$username}: " . $e->getMessage() . "</div>";
        $errors[] = $username . ": " . $e->getMessage();
    }
}

echo "<hr>";
echo "<h2>📊 Summary</h2>";
echo "<p><strong>Total Users Updated:</strong> {$updatedCount}</p>";

if (count($errors) > 0) {
    echo "<p><strong>Errors:</strong> " . count($errors) . "</p>";
    echo "<ul>";
    foreach ($errors as $error) {
        echo "<li>{$error}</li>";
    }
    echo "</ul>";
} else {
    echo "<div class='success'>✓ All passwords updated successfully!</div>";
}

echo "<div class='info'>
    <h3>📋 Default Login Credentials</h3>
    <table>
        <thead>
            <tr>
                <th>Role</th>
                <th>Username</th>
                <th>Password</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Admin</td>
                <td>admin</td>
                <td><span class='code'>admin123</span></td>
            </tr>
            <tr>
                <td>Admin</td>
                <td>admin2</td>
                <td><span class='code'>admin123</span></td>
            </tr>
            <tr>
                <td>Doctor</td>
                <td>doctor</td>
                <td><span class='code'>doctor123</span></td>
            </tr>
            <tr>
                <td>Doctor</td>
                <td>doctor2</td>
                <td><span class='code'>doctor123</span></td>
            </tr>
            <tr>
                <td>Pharmacy Manager</td>
                <td>manager</td>
                <td><span class='code'>manager123</span></td>
            </tr>
            <tr>
                <td>Pharmacy Manager</td>
                <td>manager2</td>
                <td><span class='code'>manager123</span></td>
            </tr>
            <tr>
                <td>Pharmacist</td>
                <td>pharmacist</td>
                <td><span class='code'>pharma123</span></td>
            </tr>
            <tr>
                <td>Pharmacist</td>
                <td>pharmacist2 - pharmacist6</td>
                <td><span class='code'>pharma123</span></td>
            </tr>
            <tr>
                <td>Patient</td>
                <td>patient</td>
                <td><span class='code'>patient123</span></td>
            </tr>
            <tr>
                <td>Patient</td>
                <td>patient2</td>
                <td><span class='code'>patient123</span></td>
            </tr>
        </tbody>
    </table>
</div>";

echo "<div class='info'>
    <p><strong>⚠️ Security Note:</strong> For production use, make sure to:</p>
    <ul>
        <li>Delete this setup file after running it</li>
        <li>Change all default passwords</li>
        <li>Use strong, unique passwords for each user</li>
    </ul>
</div>";

echo "</div></body></html>";

$mysqli->close();
?>
