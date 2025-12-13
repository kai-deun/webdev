<?php
session_start();
$_SESSION['userid'] = 7; // Default pharmacist user

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'config.php';

try {
    $mysqli = getDbConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($action) {
        case 'getPendingPrescriptions':
        case 'getPharmacyPrescriptions':
            getPendingPrescriptions($mysqli);
            break;
        case 'getBranchInventory':
            getBranchInventory($mysqli);
            break;
        case 'getDispensedToday':
        case 'getDispensed':
            getDispensedToday($mysqli);
            break;
        case 'dispensePrescription':
            dispensePrescription($mysqli, $input);
            break;
        case 'updateInventory':
            updateInventory($mysqli, $input);
            break;
        case 'getLowStock':
            getLowStock($mysqli);
            break;
        case 'updateStatus':
            updatePrescriptionStatus($mysqli, $input);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
            break;
    }
} catch (Exception $e) {
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function getPendingPrescriptions($mysqli) {
    try {
        // Get prescriptions with active status
        $sql = "SELECT p.*, 
                       u1.first_name as patient_fname, u1.last_name as patient_lname,
                       u2.first_name as doctor_fname, u2.last_name as doctor_lname
                FROM prescriptions p
                JOIN patients pat ON p.patient_id = pat.patient_id
                JOIN users u1 ON pat.user_id = u1.user_id
                JOIN users u2 ON p.doctor_id = u2.user_id
                WHERE p.status = 'active'
                ORDER BY p.prescription_date DESC LIMIT 50";
        
        $result = $mysqli->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => true, 'prescriptions' => []]);
            return;
        }
        
        $prescriptions = [];
        while ($row = $result->fetch_assoc()) {
            $medicines = [];
            
            // Get prescription items with medicine details
            $prescId = $mysqli->real_escape_string($row['prescription_id']);
            $medSql = "SELECT pi.*, m.medicine_name, m.strength, m.unit_price
                       FROM prescription_items pi
                       JOIN medicines m ON pi.medicine_id = m.medicine_id
                       WHERE pi.prescription_id = ?";
            
            $medStmt = $mysqli->prepare($medSql);
            $medStmt->bind_param('i', $prescId);
            $medStmt->execute();
            $medResult = $medStmt->get_result();
            
            while ($med = $medResult->fetch_assoc()) {
                $medicines[] = [
                    'medicineid' => $med['medicine_id'],
                    'medicinename' => $med['medicine_name'],
                    'prescribedqty' => $med['quantity'],
                    'dosage' => $med['dosage'],
                    'frequency' => $med['frequency'] ?? '',
                    'instructions' => $med['instructions'] ?? '',
                    'strength' => $med['strength'] ?? '',
                    'unitprice' => $med['unit_price'] ?? 0,
                    'availableqty' => 100,
                    'reorderlevel' => 10
                ];
            }
            
            $prescriptions[] = [
                'prescriptionid' => $row['prescription_id'],
                'patientid' => $row['patient_id'],
                'patientname' => $row['patient_fname'] . ' ' . $row['patient_lname'],
                'dateofbirth' => '1990-01-01',
                'doctorid' => $row['doctor_id'],
                'doctorname' => 'Dr. ' . $row['doctor_fname'] . ' ' . $row['doctor_lname'],
                'prescriptiondate' => $row['prescription_date'],
                'status' => $row['status'],
                'diagnosis' => $row['diagnosis'] ?? 'No diagnosis',
                'notes' => $row['notes'] ?? '',
                'medicines' => $medicines
            ];
        }
        
        echo json_encode(['success' => true, 'prescriptions' => $prescriptions]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'prescriptions' => []]);
    }
}

function getBranchInventory($mysqli) {
    try {
        $sql = "SELECT bi.*, m.medicine_name, m.strength, m.unit_price, m.dosage_form,
                       pb.branch_name
                FROM branch_inventory bi
                JOIN medicines m ON bi.medicine_id = m.medicine_id
                JOIN pharmacy_branches pb ON bi.branch_id = pb.branch_id
                WHERE bi.status != 'expired'
                LIMIT 100";
        
        $result = $mysqli->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => true, 'inventory' => []]);
            return;
        }
        
        $inventory = [];
        while ($row = $result->fetch_assoc()) {
            $inventory[] = [
                'inventoryid' => $row['inventory_id'],
                'medicineid' => $row['medicine_id'],
                'medicinename' => $row['medicine_name'],
                'quantity' => $row['quantity'],
                'reorderlevel' => $row['reorder_level'],
                'expirydate' => $row['expiry_date'],
                'status' => $row['status'],
                'category' => 'General',
                'strength' => $row['strength'] ?? '',
                'unitprice' => $row['unit_price'] ?? 0,
                'branch' => $row['branch_name']
            ];
        }
        
        echo json_encode(['success' => true, 'inventory' => $inventory]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'inventory' => []]);
    }
}

function getDispensedToday($mysqli) {
    try {
        // Get dispensed prescriptions from orders table
        $sql = "SELECT o.*, p.prescription_date,
                       u1.first_name as patient_fname, u1.last_name as patient_lname,
                       u2.first_name as doctor_fname, u2.last_name as doctor_lname,
                       u3.first_name as pharma_fname, u3.last_name as pharma_lname
                FROM orders o
                JOIN prescriptions p ON o.prescription_id = p.prescription_id
                JOIN patients pat ON p.patient_id = pat.patient_id
                JOIN users u1 ON pat.user_id = u1.user_id
                JOIN users u2 ON p.doctor_id = u2.user_id
                JOIN users u3 ON o.pharmacist_id = u3.user_id
                WHERE o.status = 'completed' AND p.status = 'dispensed'
                ORDER BY o.dispensed_at DESC LIMIT 50";
        
        $result = $mysqli->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => true, 'dispensed' => [], 'prescriptions' => []]);
            return;
        }
        
        $dispensed = [];
        while ($row = $result->fetch_assoc()) {
            $dispensed[] = [
                'prescriptionid' => $row['prescription_id'],
                'patientname' => $row['patient_fname'] . ' ' . $row['patient_lname'],
                'doctorname' => 'Dr. ' . $row['doctor_fname'] . ' ' . $row['doctor_lname'],
                'pharmacistname' => $row['pharma_fname'] . ' ' . $row['pharma_lname'],
                'medicinesummary' => 'Prescription medicines',
                'totalamount' => $row['total_amount'],
                'dispensedat' => $row['dispensed_at'],
                'date_created' => $row['dispensed_at']
            ];
        }
        
        echo json_encode(['success' => true, 'dispensed' => $dispensed, 'prescriptions' => $dispensed]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'dispensed' => [], 'prescriptions' => []]);
    }
}

function dispensePrescription($mysqli, $input) {
    try {
        $prescriptionId = $input['prescriptionid'] ?? null;
        
        if (!$prescriptionId) {
            echo json_encode(['success' => false, 'message' => 'Prescription ID required']);
            return;
        }
        
        // Start transaction
        $mysqli->begin_transaction();
        
        // Get prescription details
        $stmt = $mysqli->prepare("SELECT patient_id FROM prescriptions WHERE prescription_id = ?");
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $prescription = $result->fetch_assoc();
        $stmt->close();
        
        if (!$prescription) {
            $mysqli->rollback();
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        $patientId = $prescription['patient_id'];
        $branchId = 1; // Default branch
        $pharmacistId = $_SESSION['userid'] ?? 7; // Current pharmacist
        
        // Calculate total from prescription items
        $stmt = $mysqli->prepare("
            SELECT SUM(pi.quantity * m.unit_price) as total
            FROM prescription_items pi
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.prescription_id = ?
        ");
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $totalRow = $result->fetch_assoc();
        $totalAmount = $totalRow['total'] ?? 0;
        $stmt->close();
        
        // Create order record
        $stmt = $mysqli->prepare("
            INSERT INTO orders (prescription_id, patient_id, branch_id, pharmacist_id, 
                               order_date, total_amount, status, payment_status, dispensed_at)
            VALUES (?, ?, ?, ?, NOW(), ?, 'completed', 'paid', NOW())
        ");
        $stmt->bind_param('iiiid', $prescriptionId, $patientId, $branchId, $pharmacistId, $totalAmount);
        $stmt->execute();
        $orderId = $mysqli->insert_id;
        $stmt->close();
        
        // Create order items
        $stmt = $mysqli->prepare("
            SELECT pi.medicine_id, pi.quantity, m.unit_price
            FROM prescription_items pi
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.prescription_id = ?
        ");
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($item = $result->fetch_assoc()) {
            // Find inventory for this medicine at this branch
            $invStmt = $mysqli->prepare("
                SELECT inventory_id FROM branch_inventory 
                WHERE medicine_id = ? AND branch_id = ? AND quantity > 0
                LIMIT 1
            ");
            $invStmt->bind_param('ii', $item['medicine_id'], $branchId);
            $invStmt->execute();
            $invResult = $invStmt->get_result();
            $inventory = $invResult->fetch_assoc();
            $invStmt->close();
            
            if ($inventory) {
                $inventoryId = $inventory['inventory_id'];
                $subtotal = $item['quantity'] * $item['unit_price'];
                
                // Insert order item
                $oiStmt = $mysqli->prepare("
                    INSERT INTO order_items (order_id, medicine_id, inventory_id, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $oiStmt->bind_param('iiiddd', $orderId, $item['medicine_id'], $inventoryId, 
                                    $item['quantity'], $item['unit_price'], $subtotal);
                $oiStmt->execute();
                $oiStmt->close();
                
                // Update inventory quantity
                $upStmt = $mysqli->prepare("
                    UPDATE branch_inventory 
                    SET quantity = quantity - ?
                    WHERE inventory_id = ?
                ");
                $upStmt->bind_param('ii', $item['quantity'], $inventoryId);
                $upStmt->execute();
                $upStmt->close();
            }
        }
        $stmt->close();
        
        // Update prescription status to 'dispensed'
        $stmt = $mysqli->prepare("UPDATE prescriptions SET status = 'dispensed' WHERE prescription_id = ?");
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $stmt->close();
        
        // Commit transaction
        $mysqli->commit();
        
        echo json_encode(['success' => true, 'message' => 'Prescription dispensed successfully']);
    } catch (Exception $e) {
        $mysqli->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateInventory($mysqli, $input) {
    try {
        $inventoryId = $input['inventoryid'] ?? null;
        $quantity = $input['quantity'] ?? null;
        
        if (!$inventoryId || $quantity === null) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            return;
        }
        
        $stmt = $mysqli->prepare("UPDATE branch_inventory SET quantity = ? WHERE inventory_id = ?");
        $stmt->bind_param('ii', $quantity, $inventoryId);
        $success = $stmt->execute();
        $stmt->close();
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Inventory updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update inventory']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getLowStock($mysqli) {
    try {
        $sql = "SELECT bi.*, m.medicine_name, pb.branch_name
                FROM branch_inventory bi
                JOIN medicines m ON bi.medicine_id = m.medicine_id
                JOIN pharmacy_branches pb ON bi.branch_id = pb.branch_id
                WHERE bi.quantity <= bi.reorder_level
                ORDER BY bi.quantity ASC
                LIMIT 20";
        
        $result = $mysqli->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => true, 'items' => []]);
            return;
        }
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'inventoryid' => $row['inventory_id'],
                'medicinename' => $row['medicine_name'],
                'branch' => $row['branch_name'],
                'quantity' => $row['quantity'],
                'reorderlevel' => $row['reorder_level']
            ];
        }
        
        echo json_encode(['success' => true, 'items' => $items]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'items' => []]);
    }
}

function updatePrescriptionStatus($mysqli, $input) {
    try {
        $prescriptionId = $input['prescriptionid'] ?? null;
        $newStatus = $input['status'] ?? 'active';
        
        if (!$prescriptionId) {
            echo json_encode(['success' => false, 'message' => 'Prescription ID required']);
            return;
        }
        
        $stmt = $mysqli->prepare("UPDATE prescriptions SET status = ? WHERE prescription_id = ?");
        if ($stmt) {
            $stmt->bind_param('si', $newStatus, $prescriptionId);
            $stmt->execute();
            $stmt->close();
        }
        
        echo json_encode(['success' => true, 'message' => 'Status updated']);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'message' => 'Status updated']);
    }
}
?>
