<?php
require_once __DIR__ . '/../config/database.php';

// Aligned to output data into the audit_logs table
class Logger
{

    private $connection;
    private $table = 'audit_logs';

    public function __construct()
    {
        $this->connection = getConn();
    }

    // TODO: find why ip_address is not included but the column exists in the table
    // record an action
    public function log($user_id, $action, $table_name, $record_id, $old_values, $new_values)
    {

        $query = "INSERT INTO" . $this->table . "
        (user_id, action, table_name, record_id, old_values, new_values, created_at)
        VALUES (?,?,?,?,?,?, NOW())";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param(
            "issiiss",
            $user_id,
            $action,
            $table_name,
            $record_id,
            $old_values,
            $new_values
        );

        return $stmt->execute();
    }

    // get logs
    public function getLogs($page = 1, $limit = 50)
    {
        $offset = ($page - 1) * $limit;

        $query = "SELECT al.*, u.username
        FROM " . $this->table . " al
        JOIN users u ON al.user_id = u.user_id
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // search logs
    public function search($keyword)
    {
        $searchTerm = "%" . $keyword . "%";

        $query = "SELECT al.*, u.username
        FROM " . $this->table . " al
        JOIN users u ON al.user_id = u.user_id
        WHERE al.action LIKE ? OR al.table_name LIKE ? OR u.username LIKE ?
        ORDER BY al.created_at DESC";

        $stmt = $this->connection->prepare($query);
        $stmt->bind_param("sss", $searchTerm, $searchTerm, $searchTerm);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
