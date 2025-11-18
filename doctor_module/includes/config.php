<?php

define('HOST', 'localhost');
define('USERNAME', 'root');
define('PASS', '');
define('DB', 'vitalsoft_db');

$connection = mysqli_connect(HOST, USERNAME, PASS, DB);

if (!$connection) {
    die("Error connecting to database: " + mysqli_connect_error());
}