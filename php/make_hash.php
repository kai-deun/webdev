<?php
// Simple helper to generate bcrypt hashes for seeding users in phpMyAdmin.
// Usage: http://localhost/webdev/php/make_hash.php?pw=YOURPASSWORD
// NOTE: Remove or restrict this file after use in production.

if (!isset($_GET['pw'])) {
    echo "Usage: ?pw=your_password\n";
    exit;
}

$pw = $_GET['pw'];
$hash = password_hash($pw, PASSWORD_BCRYPT);
header('Content-Type: text/plain');
echo $hash;
