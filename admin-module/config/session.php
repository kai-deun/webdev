<?php

session_start();

function loggedIn(){
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireLogin(){
    if (!loggedIn()) {
        $_SESSION['error'] = 'Need to Login';
        header('Location: index.php?page=login');
        exit;
    }
}

function checkSessionTimeout(){
    if (isset($_SESSION['last_active'])) {
        if (time() - $_SESSION['last_active'] > SESSION_TIMEOUT) {
            session_destroy();
            header('Location: index.php?page=login');
            exit;
        }
    }
    $_SESSION['last_active'] = time();
}

checkSessionTimeout();