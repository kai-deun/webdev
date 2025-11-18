<?php

define("HOST", "localhost");
define("USER", "root");
define("PASS", "");
define("DB", "vitalsoft_db");

$connection = mysqli_connect(HOST, USER, PASS, DB);

if (!$connection) {
    die("Database connection failed");
} else {
    /*
    ob is for output buffering, it does not display the output in the website
    */
    ob_start();
    echo "Database connected";
    ob_end_clean();
}
