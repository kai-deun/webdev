<?php
/**
 * Pharmacy Manager API
 * Handles manager-specific operations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
require_once 'config.php';
$mysqli = getDbConnection();

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$action && is_array($data) && isset($data['action'])) {
    $action = $data['action'];
}

switch ($action) {
    case 'getBranches':
        getBranches($mysqli);
        break;
    case 'updateBranchStatus':
        updateBranchStatus($mysqli, $data);
        break;
    case 'getStaff':
        getStaff($mysqli);
        break;
    case 'createStaff':
        createStaff($mysqli, $data);
        break;
    case 'deleteStaff':
        deleteStaff($mysqli, $data);
        break;
    case 'getInventory':
        getInventory($mysqli);
        break;
    case 'updateInventory':
        updateInventory($mysqli, $data);
        break;
    case 'deleteInventory':
        deleteInventory($mysqli, $data);
        break;
    case 'getPendingRequests':
        getPendingRequests($mysqli);
        break;
    case 'approveRequest':
        approveRequest($mysqli, $data);
        break;
    case 'rejectRequest':
        rejectRequest($mysqli, $data);
        break;
    case 'getLowStockAlerts':
        getLowStockAlerts($mysqli);
        break;
    case 'getBrands':
        getBrands($mysqli);
        break;
    case 'getPerformanceMetrics':
        getPerformanceMetrics($mysqli);
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
        break;
}

// Get all branches managed by current manager
function getBranches($mysqli) {
    try {
        $query = "
            SELECT pb.branch_id, pb.branch_name, pb.branch_code, pb.address,
                   pb.city, pb.state, pb.phone_number, pb.email, pb.status,
                   CONCAT(u.first_name, ' ', u.last_name) AS manager_name
            FROM pharmacy_branches pb
            LEFT JOIN users u ON pb.manager_id = u.user_id
            ORDER BY pb.branch_name
        ";

        $result = $mysqli->query($query);
        $branches = [];
        while ($row = $result->fetch_assoc()) {
            $branches[] = $row;
        }

        echo json_encode([
            'success' => true,
            'branches' => $branches
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Update branch operational status
function updateBranchStatus($mysqli, $data) {
    try {
        $stmt = $mysqli->prepare("UPDATE pharmacy_branches SET status = ? WHERE branch_id = ?");
        $stmt->bind_param('si', $data['status'], $data['branch_id']);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Branch status updated']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get staff members
function getStaff($mysqli) {
    try {
        $branchId = $_GET['branch_id'] ?? null;

        $query = "
            SELECT u.user_id, u.username, u.email, u.first_name, u.last_name,
                   u.phone_number, u.status,
                   r.role_name,
                   pb.branch_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN branch_staff bs ON u.user_id = bs.user_id
            LEFT JOIN pharmacy_branches pb ON bs.branch_id = pb.branch_id
            WHERE r.role_name IN ('Pharmacist', 'Pharmacy Manager')
        ";

        if ($branchId) {
            $query .= " AND bs.branch_id = $branchId";
        }

        $query .= " ORDER BY u.first_name, u.last_name";

        $result = $mysqli->query($query);
        $staff = [];
        while ($row = $result->fetch_assoc()) {
            $staff[] = $row;
        }

        echo json_encode(['success' => true, 'staff' => $staff]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Create new staff account
function createStaff($mysqli, $data) {
    try {
        $mysqli->begin_transaction();

        // Get role_id
        $roleStmt = $mysqli->prepare("SELECT role_id FROM roles WHERE role_name = ?");
        $roleStmt->bind_param('s', $data['role']);
        $roleStmt->execute();
        $roleResult = $roleStmt->get_result();
        $role = $roleResult->fetch_assoc();
        $roleStmt->close();

        if (!$role) {
            throw new Exception('Invalid role');
        }

        // Create user
        $password = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $mysqli->prepare("
            INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->bind_param('sssiss',
            $data['username'], $data['email'], $password,
            $role['role_id'], $data['first_name'], $data['last_name']
        );
        $stmt->execute();
        $userId = $mysqli->insert_id;
        $stmt->close();

        // Assign to branch
        if (isset($data['branch_id'])) {
            $stmt = $mysqli->prepare("
                INSERT INTO branch_staff (user_id, branch_id, assigned_date, status)
                VALUES (?, ?, CURDATE(), 'active')
            ");
            $stmt->bind_param('ii', $userId, $data['branch_id']);
            $stmt->execute();
            $stmt->close();
        }

        $mysqli->commit();

        echo json_encode(['success' => true, 'message' => 'Staff created', 'user_id' => $userId]);
    } catch (Exception $e) {
        $mysqli->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Delete staff account
function deleteStaff($mysqli, $data) {
    try {
        $stmt = $mysqli->prepare("UPDATE users SET status = 'inactive' WHERE user_id = ?");
        $stmt->bind_param('i', $data['user_id']);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Staff deleted']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get inventory across branches
function getInventory($mysqli) {
    try {
        $branchId = $_GET['branch_id'] ?? null;

        $query = "
            SELECT bi.inventory_id, bi.branch_id, bi.quantity, bi.reorder_level, bi.status,
                   m.medicine_name, m.unit_price, m.dosage_form,
                   pb.branch_name
            FROM branch_inventory bi
            JOIN medicines m ON bi.medicine_id = m.medicine_id
            JOIN pharmacy_branches pb ON bi.branch_id = pb.branch_id
        ";

        if ($branchId) {
            $query .= " WHERE bi.branch_id = $branchId";
        }

        $query .= " ORDER BY m.medicine_name";

        $result = $mysqli->query($query);
        $inventory = [];
        while ($row = $result->fetch_assoc()) {
            $inventory[] = $row;
        }

        echo json_encode(['success' => true, 'inventory' => $inventory]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Update inventory quantity
function updateInventory($mysqli, $data) {
    try {
        $stmt = $mysqli->prepare("
            UPDATE branch_inventory
            SET quantity = ?,
                status = CASE
                    WHEN ? <= reorder_level THEN 'low_stock'
                    WHEN ? = 0 THEN 'out_of_stock'
                    ELSE 'available'
                END
            WHERE inventory_id = ?
        ");
        $stmt->bind_param('iiii',
            $data['quantity'], $data['quantity'], $data['quantity'], $data['inventory_id']
        );
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Inventory updated']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Delete inventory item
function deleteInventory($mysqli, $data) {
    try {
        $stmt = $mysqli->prepare("DELETE FROM branch_inventory WHERE inventory_id = ?");
        $stmt->bind_param('i', $data['inventory_id']);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Inventory deleted']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get pending inventory update requests
function getPendingRequests($mysqli) {
    try {
        $query = "
            SELECT iur.request_id, iur.request_type, iur.old_quantity, iur.new_quantity,
                   iur.reason, iur.created_at,
                   m.medicine_name,
                   pb.branch_name,
                   CONCAT(u.first_name, ' ', u.last_name) AS requested_by_name
            FROM inventory_update_requests iur
            JOIN branch_inventory bi ON iur.inventory_id = bi.inventory_id
            JOIN medicines m ON bi.medicine_id = m.medicine_id
            JOIN pharmacy_branches pb ON bi.branch_id = pb.branch_id
            JOIN users u ON iur.requested_by = u.user_id
            WHERE iur.status = 'pending'
            ORDER BY iur.created_at DESC
        ";

        $result = $mysqli->query($query);
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }

        echo json_encode(['success' => true, 'requests' => $requests]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Approve request
function approveRequest($mysqli, $data) {
    try {
        $mysqli->begin_transaction();

        // Update request status
        $stmt = $mysqli->prepare("
            UPDATE inventory_update_requests
            SET status = 'approved', approved_by = ?, approval_date = NOW()
            WHERE request_id = ?
        ");
        $userId = $_SESSION['user_id'] ?? 1;
        $stmt->bind_param('ii', $userId, $data['request_id']);
        $stmt->execute();
        $stmt->close();

        // Get request details
        $stmt = $mysqli->prepare("
            SELECT inventory_id, new_quantity
            FROM inventory_update_requests
            WHERE request_id = ?
        ");
        $stmt->bind_param('i', $data['request_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $request = $result->fetch_assoc();
        $stmt->close();

        // Update inventory
        $stmt = $mysqli->prepare("UPDATE branch_inventory SET quantity = ? WHERE inventory_id = ?");
        $stmt->bind_param('ii', $request['new_quantity'], $request['inventory_id']);
        $stmt->execute();
        $stmt->close();

        $mysqli->commit();

        echo json_encode(['success' => true, 'message' => 'Request approved']);
    } catch (Exception $e) {
        $mysqli->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Reject request
function rejectRequest($mysqli, $data) {
    try {
        $stmt = $mysqli->prepare("
            UPDATE inventory_update_requests
            SET status = 'rejected', approved_by = ?, approval_date = NOW()
            WHERE request_id = ?
        ");
        $userId = $_SESSION['user_id'] ?? 1;
        $stmt->bind_param('ii', $userId, $data['request_id']);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Request rejected']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get low-stock alerts
function getLowStockAlerts($mysqli) {
    try {
        $query = "
            SELECT bi.inventory_id, bi.quantity, bi.reorder_level,
                   m.medicine_name,
                   pb.branch_name
            FROM branch_inventory bi
            JOIN medicines m ON bi.medicine_id = m.medicine_id
            JOIN pharmacy_branches pb ON bi.branch_id = pb.branch_id
            WHERE bi.quantity <= bi.reorder_level
            ORDER BY bi.quantity ASC
        ";

        $result = $mysqli->query($query);
        $alerts = [];
        while ($row = $result->fetch_assoc()) {
            $alerts[] = $row;
        }

        echo json_encode(['success' => true, 'alerts' => $alerts]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get medicine brands
function getBrands($mysqli) {
    try {
        $query = "
            SELECT m.manufacturer AS brand_name,
                   COUNT(DISTINCT m.medicine_id) AS product_count,
                   COUNT(DISTINCT bi.branch_id) AS branch_count,
                   m.manufacturer AS supplier
            FROM medicines m
            LEFT JOIN branch_inventory bi ON m.medicine_id = bi.medicine_id
            WHERE m.manufacturer IS NOT NULL AND m.manufacturer != ''
            GROUP BY m.manufacturer
            ORDER BY product_count DESC
        ";

        $result = $mysqli->query($query);
        $brands = [];
        $brandId = 1;
        while ($row = $result->fetch_assoc()) {
            $row['brand_id'] = $brandId++;
            $brands[] = $row;
        }

        echo json_encode(['success' => true, 'brands' => $brands]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Get performance metrics
function getPerformanceMetrics($mysqli) {
    try {
        $query = "
            SELECT pb.branch_id, pb.branch_name,
                   COUNT(o.order_id) AS daily_volume,
                   COUNT(o.order_id) * 30 AS monthly_volume,
                   AVG(TIMESTAMPDIFF(MINUTE, o.order_date, o.dispensed_at)) AS avg_dispensing_time,
                   ROUND((COUNT(CASE WHEN o.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2) AS performance_score
            FROM pharmacy_branches pb
            LEFT JOIN orders o ON pb.branch_id = o.branch_id
            WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            GROUP BY pb.branch_id, pb.branch_name
            ORDER BY pb.branch_name
        ";

        $result = $mysqli->query($query);
        $metrics = [];
        while ($row = $result->fetch_assoc()) {
            $metrics[] = $row;
        }

        echo json_encode(['success' => true, 'metrics' => $metrics]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>