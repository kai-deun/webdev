<?php
// TODO: change the user and pass when deployed to Apache2
define('HOST', 'localhost');
define('USER', 'root');
define('PASS', '');
define('DB_NAME', 'vitalsoft_db');

$connection = new mysqli(HOST, USER, PASS, DB_NAME);

if($connection->connect_error){
    die("Failed to connect: " . $connection->connect_error);
}

$connection->set_charset("utf8");

function getConn(){
    global $connection;
    return $connection;
}
