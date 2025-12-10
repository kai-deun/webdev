<?php

require_once __DIR__ . '/../config/database.php';

/* Log:
the variable with $ is also the same name of 
the column from the table
*/

class User
{

    private $connection;
    private $table = 'users';

    public $user_id;
    public $username;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $role_id;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct()
    {
        $this->connection = getConn();
        throw new \Exception('Not implemented');
    }

    // CREATE
    public function create()
    {
        $query = "INSERT INTO " . $this->table . " 
        (username, email, password, first_name, last_name, role_id, status, created_at)
        VALUE (?,?,?,?,?,?,?,NOW())";

        $stmt = $this->connection->prepare($query);
        if (!$stmt) {
            return false;
        }

        // for hashing password
        $hashed = password_hash($this->password, PASSWORD_BCRYPT);

        $stmt->bind_param(
            "ssssis", // s is string and i is int
            $this->username,
            $this->email,
            $hashed,
            $this->first_name,
            $this->last_name,
            $this->role_id,
            $this->status
        );

        if ($stmt->execute()) {
            return $this->connection->insert_id;
        }

        return false;
    }

    // READ all registered users
    public function getAll($page = 1, $limit = 10)
    {
        $offset = ($page - 1) * $limit;

        $query = "SELECT u.*, r.role_name
        FROM " . $this->table . " u
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LIMIT ? OFFSET ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // READ a specific user
    public function getById($id)
    {
        $query = "SELECT u.*, r.role_name
        FROM " . $this->table . " u 
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    // READ via Search
    public function search($keyword)
    {
        $searchTerm = "%" . $keyword . "%";

        $query = "SELECT u.*, r.role_name
        FROM " . $this->table . " u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.username LIKE ? OR u.email LIKE ?
        OR u.first_name LIKE ? OR u.last_name LIKE ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("ssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // UPDATE
    public function update()
    {

        $query = "UPDATE " . $this->table . " SET 
        username = ?, email = ?, first_name = ?, last_name = ?, 
        role_id = ?, status = ?, updated_at = NOW()
        WHERE user_id = ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param(
            "ssssisi",
            $this->username,
            $this->email,
            $this->first_name,
            $this->last_name,
            $this->role_id,
            $this->status,
            $this->user_id
        );

        return $stmt->execute();
    }

    // DELETE
    public function delete($id)
    {
        $query = "DELETE FROM " . $this->table . "WHERE user_id = ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }

    // get user by their username
    public function getUsername($username)
    {
        $query = "SELECT * FROM " . $this->table . "WHERE username = ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("s", $username);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    // total count
    public function getCount()
    {
        $query = "SELECT COUNT(*) as total FROM  " . $this->table;

        $result = $this->connection->query($query);
        $row = $result->fetch_assoc();

        return $row['total'];
    }
}
