<?php

require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../util/Validator.php';
require_once __DIR__ . '/../util/Logger.php';

class UserController {
    private $model;
    private $validator;
    private $logger;

    public function __construct()
    {
        $this->model = new User();
        $this->validator = new Validator();
        $this->logger = new Logger();
    }

    // show the CREATE FORM
    public function createForm(){
        require __DIR__ . '/../views/users/create.php';
    }

    // store NEW USER
    public function store(){
        $errors = [];

        if (empty($_POST['username'])) {
            $errors[] = 'Username is required';
        }
        if (!$this->validator->validEmail($_POST['email'])){
            $errors[] = 'Valid email required';
        }
        if(strlen($_POST['password']) < PASSWORD_MIN_LEN){
            $errors[] = 'Password must be at least ' . PASSWORD_MIN_LEN .  ' characters';
        }
        if (empty($_POST['first_name'])) {
            $errors[] = 'First name required';
        }
        if (empty($_POST['last_name'])) {
            $errors[] = 'Surname required';
        }

        if (!empty($errors)){
            $_SESSION['errors'] = $errors;

            header('Location: index.php=page=users&action=create');
            exit;
        }


        // validate if user exist
        $exists = $this->model->getUsername($_POST['username']);

        if ($exists) {
            $_SESSION['error'] = 'Username already registered';

            header('Location: index.php?page=users&action=create');
            exit;
        }

        // CREATE user
        $this->model->username = $_POST['username'];
        $this->model->email = $_POST['email'];
        $this->model->password = $_POST['password'];
        $this->model->first_name = $_POST['first_name'];
        $this->model->last_name = $_POST['last_name'];
        $this->model->role_id = $_POST['role_id'];
        $this->model->status = 'active';

        // gets the function from the /model/User.php
        $userId = $this->model->create();

        if ($userId) {
            // log action
            $this->logger->log(
                $_SESSION['user_id'],
                'CREATE',
                'users',
                $userId,
                null,
                json_encode(['username' => $_POST['username'],
                'email' => $_POST['email']])
            );

            $_SESSION['success'] = 'User created successfully';
            header('Location: index.php?page=users');
            exit;
        } else {
            $_SESSION['error'] = 'Failed to create user';
            header('Location: index.php?page=users&action=create');
            exit;
        }

    }

    // EDIT user form
    public function showEdit(){
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        $user = $this->model->getById($id);

        if (!$user){
            $_SESSION['error'] = 'User not found';
            header('Location: index.php?page=users');
            exit;
        }

        require __DIR__ . '/../view/uses/edit.php';

    }

    // UPDATE user
    public function update(){
        $id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

        $user = $this->model->getById($id);

        if (!$user) {
            $_SESSION['error'] = 'User not found';
            header('Location: index.php?page=users');
            exit;
        }

        // validate
        $errors = [];
        if(empty($_POST['username'])) {
            $errors = 'New Username required';
        }
        if(!$this->validator->validEmail($_POST['email'])) {
            $errors = 'New email required';
        }
        if(empty($_POST['first_name'])) {
            $errors = 'New first name required';
        }
        if(empty($_POST['last_name'])) {
            $errors = 'New last name required';
        }

        if (!empty($errors)) {
            $_SESSION['errors'] = $errors;
            header('Location: index.php?page=users&action=edit&id=' . $id);
            exit;
        }

        // UPDATE
        $this->model->user_id = $id;
        $this->model->username = $_POST['username'];
        $this->model->email = $_POST['email'];
        $this->model->password = $_POST['password'];
        $this->model->first_name = $_POST['first_name'];
        $this->model->last_name = $_POST['last_name'];
        $this->model->role_id = $_POST['role_id'];
        $this->model->status = $_POST['status'];

        if($this->model->update()){
            $this->logger->log(
                $_SESSION['user_id'],
                'UPDATE',
                'users',
                $id,
                json_encode($user),
                json_encode(['username' => $_POST['username'],
                'email' => $_POST['email']])
            );

            $_SESSION['success'] = 'User updated successfully';
            header('Location: index.php?page=users');
            exit;

        } else {

            $_SESSION['error'] = 'Failed to update user';
            header('Location: index.php?page=users&action=edit&id=' . $id);
            exit;

        }

    }

    // DELETE user
    public function delete(){
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($this->model->delete($id)) {
            $this->logger->log(
                $_SESSION['user_id'],
                'DELETE',
                'users',
                $id,
                null, null
            );

            $_SESSION['success'] = 'User deleted successfully';
        } else {
            $_SESSION['error'] = 'Failed to delete user';
        }

        header('Location: index.php?page=users');
        exit;

    }

}