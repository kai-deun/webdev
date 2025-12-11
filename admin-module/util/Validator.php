<?php

class Validator
{

    public function validEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function validPass($password)
    {
        return strlen($password) >= PASSWORD_MIN_LEN &&
            preg_match('/[A-Z]/', $password) &&
            preg_match('/[0-9]/', $password);
    }

    // TODO: look why the {10,} is for number pattern greater than 10
    public function validPhoneNo($phone)
    {
        return preg_match('/^[0-9]{10,}/', preg_replace('/[^0-9]/', '', $phone));
    }

    public function _numeric($value)
    {
        return is_numeric($value);
    }

    public function validUrl($url)
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    // SANITIZE
    public function sanitizeString($string)
    {
        return htmlspecialchars(trim($string, ENT_QUOTES, 'UTF-8'));
    }

    // validate required fields
    public function validateRequiredFields($fields, $data)
    {
        $errors = [];

        foreach ($fields as $field) {
            if (empty($data[$field])) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }

        return $errors;
    }
}
