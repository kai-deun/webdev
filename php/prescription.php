<?php
// Prescription Management PHP Backend
// Handles prescription CRUD operations and data processing

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Start session to access user authentication
session_start();

// Use centralized database connection from config.php
require_once 'config.php';
$mysqli = getDbConnection();

// Parse JSON body once (so we don't consume php://input multiple times)
$rawInput = file_get_contents('php://input');
$parsedJson = null;
if ($rawInput !== false && strlen($rawInput) > 0) {
    $parsedJson = json_decode($rawInput, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $GLOBALS['REQUEST_JSON'] = $parsedJson;
    }
}

// Handle different actions (accept from GET, POST form, or JSON body)
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
if (!$action && is_array($parsedJson)) {
    if (isset($parsedJson['action'])) {
        $action = $parsedJson['action'];
    } else {
        // Infer action for common POST JSON bodies
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($parsedJson['data'])) {
                $action = 'savePrescription';
            } elseif (isset($parsedJson['prescription_id'])) {
                $action = 'deletePrescription';
            }
        }
    }
}

switch ($action) {
    case 'getPatients':
        getPatients($mysqli);
        break;
    case 'getMedicalHistory':
        getMedicalHistory($mysqli);
        break;
    case 'getMedicines':
        getMedicines($mysqli);
        break;
    case 'createSampleMedicines':
        createSampleMedicines($mysqli);
        break;
    case 'getPrescriptions':
        getPrescriptions($mysqli);
        break;
    case 'addPatient':
        addPatient($mysqli);
        break;
    case 'getPrescriptionDetails':
        getPrescriptionDetails($mysqli);
        break;
    case 'savePrescription':
        savePrescription($mysqli);
        break;
    case 'updatePrescription':
        updatePrescription($mysqli);
        break;
    case 'deletePrescription':
        deletePrescription($mysqli);
        break;
    case 'requestRenewal':
        requestPrescriptionRenewal($mysqli);
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action',
            'details' => [
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
                'received_action' => $action,
                'has_json' => is_array($parsedJson),
                'json_keys' => is_array($parsedJson) ? array_keys($parsedJson) : null
            ]
        ]);
        break;
}

function getMedicalHistory($mysqli) {
    $patientId = $_GET['patient_id'] ?? '';
    if (empty($patientId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'patient_id is required']);
        return;
    }

    try {
        $query = "
            SELECT mh.history_id, mh.patient_id, mh.doctor_id, mh.diagnosis, mh.notes, mh.visit_date, mh.created_at,
                   CONCAT(u.first_name, ' ', u.last_name) AS doctor_name
            FROM medical_history mh
            LEFT JOIN users u ON mh.doctor_id = u.user_id
            WHERE mh.patient_id = ?
            ORDER BY mh.visit_date DESC, mh.history_id DESC
        ";

        $stmt = $mysqli->prepare($query);
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        $stmt->bind_param('i', $patientId);
        $stmt->execute();
        $result = $stmt->get_result();

        $records = [];
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
        $stmt->close();

        echo json_encode(['success' => true, 'records' => $records]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching medical history: ' . $e->getMessage()]);
    }
}

function getPatients($mysqli) {
    try {
        // Return patient and user basic info. Cast patient_id to string and alias phone_number -> phone
        $result = $mysqli->query("
         SELECT u.user_id,
             u.username,
             u.first_name,
             u.last_name,
             u.email,
             u.phone_number AS phone,
             u.address AS address,
             u.date_of_birth,
             CAST(p.patient_id AS CHAR) AS patient_id,
             p.insurance_number,
             p.insurance_provider,
             p.emergency_contact_name AS emergency_contact_name,
             p.emergency_contact_phone AS emergency_contact_phone,
             p.blood_type,
             p.allergies,
             TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
             '' AS gender
            FROM users u
            LEFT JOIN patients p ON u.user_id = p.user_id
            WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'Patient')
            ORDER BY u.first_name, u.last_name
        ");
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $patients = [];
        while ($row = $result->fetch_assoc()) {
            $patients[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'patients' => $patients
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching patients: ' . $e->getMessage()]);
    }
}

function getMedicines($mysqli) {
    try {
        // Provide a "dosage" field (used by frontend) and select commonly used columns.
        // expiry_date and stock are stored per-branch in branch_inventory; aggregate them here so the front-end can display a representative expiry and total stock.
       $sql = "SELECT m.medicine_id, m.medicine_name, m.generic_name, m.manufacturer, m.description, m.dosage_form, m.strength, m.unit_price, m.requires_prescription, "
           . "COALESCE(inv.expiry_date, '') AS expiry_date, COALESCE(inv.total_stock, 0) AS stock, "
           . "CONCAT(COALESCE(m.dosage_form, ''), ' ', COALESCE(m.strength, '')) AS dosage "
           . "FROM medicines m "
           . "LEFT JOIN (SELECT medicine_id, MIN(expiry_date) AS expiry_date, SUM(quantity) AS total_stock FROM branch_inventory GROUP BY medicine_id) inv ON m.medicine_id = inv.medicine_id "
           . "ORDER BY m.medicine_name";

        $result = $mysqli->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $medicines = [];
        while ($row = $result->fetch_assoc()) {
            // ensure frontend-consumed keys exist
            if (!isset($row['medicine_type'])) {
                $row['medicine_type'] = $row['dosage_form'] ?? '';
            }
            if (!isset($row['dosage'])) {
                $row['dosage'] = trim(($row['dosage_form'] ?? '') . ' ' . ($row['strength'] ?? ''));
            }
            $medicines[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'medicines' => $medicines
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching medicines: ' . $e->getMessage()]);
    }
}

function getPrescriptions($mysqli) {
    try {
        // Optionally allow filtering by patient_id for patient-specific views
        $patientFilter = isset($_GET['patient_id']) && $_GET['patient_id'] !== '' ? (int)$_GET['patient_id'] : null;

        $query = "
            SELECT p.prescription_id, CAST(p.patient_id AS CHAR) AS patient_id, p.doctor_id, p.prescription_date, p.expiry_date, 
                   p.diagnosis, p.notes, p.status, p.renewal_requested, p.created_at, p.updated_at,
                   CONCAT(u_pat.first_name, ' ', u_pat.last_name) as patient_name,
                   CONCAT(u_doc.first_name, ' ', u_doc.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN users u_pat ON pat.user_id = u_pat.user_id
            JOIN users u_doc ON p.doctor_id = u_doc.user_id
        ";

        if ($patientFilter !== null) {
            $query .= " WHERE p.patient_id = " . $patientFilter . " ";
        }

        $query .= " ORDER BY p.prescription_date DESC, p.prescription_id DESC ";

        $result = $mysqli->query($query);
        
        if (!$result) {
            throw new Exception("Query failed: " . $mysqli->error);
        }
        
        $prescriptions = [];
        while ($row = $result->fetch_assoc()) {
            $prescriptions[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'prescriptions' => $prescriptions
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching prescriptions: ' . $e->getMessage()]);
    }
}

function getPrescriptionDetails($mysqli) {
    $prescriptionId = $_GET['id'] ?? '';
    
    if (empty($prescriptionId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Prescription ID is required']);
        return;
    }
    
    try {
        // Get prescription details
        $query = "
            SELECT p.prescription_id, CAST(p.patient_id AS CHAR) AS patient_id, p.doctor_id, p.prescription_date, p.expiry_date,
                   p.diagnosis, p.notes, p.status, p.renewal_requested, p.created_at, p.updated_at,
                   CONCAT(u_pat.first_name, ' ', u_pat.last_name) as patient_name,
                   CONCAT(u_doc.first_name, ' ', u_doc.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN users u_pat ON pat.user_id = u_pat.user_id
            JOIN users u_doc ON p.doctor_id = u_doc.user_id
            WHERE p.prescription_id = ?
        ";
        
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("i", $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $prescription = $result->fetch_assoc();
        $stmt->close();
        
        if (!$prescription) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        // Get prescription items
        $query = "
            SELECT pi.item_id, pi.prescription_id, pi.medicine_id, pi.dosage, pi.quantity,
                   pi.frequency, pi.duration, pi.instructions, pi.created_at,
                   m.medicine_name, m.generic_name, m.strength, m.unit_price
            FROM prescription_items pi
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.prescription_id = ?
            ORDER BY pi.item_id
        ";
        
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("i", $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $stmt->close();
        
    // Return items under both keys for compatibility with different front-end modules
    $prescription['items'] = $items;
    $prescription['medicines'] = $items;
        
        echo json_encode([
            'success' => true,
            'prescription' => $prescription
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching prescription details: ' . $e->getMessage()]);
    }
}

function savePrescription($mysqli) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    
    if (!$input || !isset($input['data'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid input data']);
        return;
    }
    
    $data = $input['data'];
    
    // Normalize incoming items/medicines and validate required fields
    $itemsInput = $data['items'] ?? ($data['medicines'] ?? null);

    if (empty($data['patient_id']) || empty($data['prescription_date']) || empty($itemsInput)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields (patient_id, prescription_date, medicines/items expected)']);
        return;
    }

    // Ensure we have a doctor_id; if not provided, pick the first user with Doctor role
    $doctorId = $data['doctor_id'] ?? null;
    if (empty($doctorId)) {
        $res = $mysqli->query("SELECT user_id FROM users WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'Doctor') LIMIT 1");
        if ($res && $row = $res->fetch_assoc()) {
            $doctorId = (int)$row['user_id'];
        }
    }

    if (empty($doctorId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Doctor ID not provided and no doctor account found.']);
        return;
    }
    
    try {
        $mysqli->begin_transaction();
        
        // Insert prescription
        $query = "
            INSERT INTO prescriptions (patient_id, doctor_id, prescription_date, expiry_date, diagnosis, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        ";
        
        $stmt = $mysqli->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $diagnosis = $data['diagnosis'] ?? '';
        $notes = $data['notes'] ?? '';
        $expiry_date = $data['expiry_date'] ?? null;
        
        $stmt->bind_param(
            "iissss",
            $data['patient_id'],
            $doctorId,
            $data['prescription_date'],
            $expiry_date,
            $diagnosis,
            $notes
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert prescription: " . $stmt->error);
        }
        
        $prescriptionId = $mysqli->insert_id;
        $stmt->close();
        
        // Insert prescription items
        $query = "
            INSERT INTO prescription_items (prescription_id, medicine_id, dosage, quantity, frequency, duration, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ";
        
        $stmt = $mysqli->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        foreach ($itemsInput as $item) {
            // Support both keys used by front-end: dosage_frequency/duration_days or frequency/duration
            $frequency = $item['dosage_frequency'] ?? ($item['frequency'] ?? 'As directed');
            $duration = isset($item['duration_days']) ? (string)$item['duration_days'] : ($item['duration'] ?? '7');
            $instructions = $item['instructions'] ?? '';
            $dosage = $item['dosage'] ?? '';
            $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;

            $stmt->bind_param(
                "iisisss",
                $prescriptionId,
                $item['medicine_id'],
                $dosage,
                $quantity,
                $frequency,
                $duration,
                $instructions
            );

            if (!$stmt->execute()) {
                throw new Exception("Failed to insert item: " . $stmt->error);
            }
        }
        
        $stmt->close();
        $mysqli->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Prescription saved successfully',
            'prescription_id' => $prescriptionId
        ]);
        
    } catch (Exception $e) {
        $mysqli->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error saving prescription: ' . $e->getMessage()]);
    }
}

function addPatient($mysqli) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        return;
    }

    $data = $input['data'] ?? $input;

    // required
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $first_name = trim($data['first_name'] ?? '');
    $last_name = trim($data['last_name'] ?? '');

    if ($username === '' || $email === '' || $first_name === '' || $last_name === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    $phone = $data['phone_number'] ?? null;
    $dob = $data['date_of_birth'] ?? null;
    $address = $data['address'] ?? null;
    $insurance_number = $data['insurance_number'] ?? null;
    $insurance_provider = $data['insurance_provider'] ?? null;
    $password = $data['password'] ?? 'password123';

    try {
        // role id for Patient
        $res = $mysqli->query("SELECT role_id FROM roles WHERE role_name = 'Patient' LIMIT 1");
        if (!$res || $res->num_rows === 0) throw new Exception('Patient role not found');
        $r = $res->fetch_assoc();
        $roleId = (int)$r['role_id'];

        // check unique username/email
        $stmt = $mysqli->prepare("SELECT user_id FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->bind_param('ss', $username, $email);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $stmt->close();
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
            return;
        }
        $stmt->close();

        // insert into users
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $mysqli->prepare("INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, phone_number, date_of_birth, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        $stmt->bind_param('sssisssss', $username, $email, $password_hash, $roleId, $first_name, $last_name, $phone, $dob, $address);
        if (!$stmt->execute()) throw new Exception('Insert user failed: ' . $stmt->error);
        $userId = $mysqli->insert_id;
        $stmt->close();

        // insert into patients
        $stmt = $mysqli->prepare("INSERT INTO patients (user_id, insurance_number, insurance_provider) VALUES (?, ?, ?)");
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        $stmt->bind_param('iss', $userId, $insurance_number, $insurance_provider);
        if (!$stmt->execute()) throw new Exception('Insert patient failed: ' . $stmt->error);
        $patientId = $mysqli->insert_id;
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Patient added', 'user_id' => $userId, 'patient_id' => $patientId]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error adding patient: ' . $e->getMessage()]);
    }
}

function deletePrescription($mysqli) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    
    if (!$input || empty($input['prescription_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Prescription ID is required']);
        return;
    }
    
    $prescriptionId = $input['prescription_id'];
    
    try {
        $mysqli->begin_transaction();
        
        // Delete prescription items first (due to foreign key constraints)
        $stmt = $mysqli->prepare("DELETE FROM prescription_items WHERE prescription_id = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("i", $prescriptionId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete items: " . $stmt->error);
        }
        $stmt->close();
        
        // Delete prescription
        $stmt = $mysqli->prepare("DELETE FROM prescriptions WHERE prescription_id = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $mysqli->error);
        }
        
        $stmt->bind_param("i", $prescriptionId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete prescription: " . $stmt->error);
        }
        
        $affected_rows = $stmt->affected_rows;
        $stmt->close();
        
        if ($affected_rows === 0) {
            $mysqli->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        $mysqli->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Prescription deleted successfully'
        ]);
        
    } catch (Exception $e) {
        $mysqli->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting prescription: ' . $e->getMessage()]);
    }
}

function updatePrescription($mysqli) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    if (!$input || !isset($input['data'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        return;
    }

    $data = $input['data'];
    $prescriptionId = isset($data['prescription_id']) ? (int)$data['prescription_id'] : 0;
    if ($prescriptionId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'prescription_id is required']);
        return;
    }

    try {
        // Fetch existing prescription
        $stmt = $mysqli->prepare("SELECT diagnosis, notes, status, expiry_date, prescription_date FROM prescriptions WHERE prescription_id = ? LIMIT 1");
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $existing = $res->fetch_assoc();
        $stmt->close();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }

        // Determine new values (use provided or keep existing)
        $diagnosis = isset($data['diagnosis']) ? sanitizeInput($data['diagnosis']) : $existing['diagnosis'];
        $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : $existing['notes'];
        $status = isset($data['status']) ? sanitizeInput($data['status']) : $existing['status'];
        $expiry_date = isset($data['expiry_date']) && $data['expiry_date'] !== '' ? $data['expiry_date'] : $existing['expiry_date'];
        $prescription_date = isset($data['prescription_date']) && $data['prescription_date'] !== '' ? $data['prescription_date'] : $existing['prescription_date'];

        // Validate dates if provided
        if ($expiry_date && !validateDate($expiry_date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid expiry_date format']);
            return;
        }
        if ($prescription_date && !validateDate($prescription_date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid prescription_date format']);
            return;
        }

    $stmt = $mysqli->prepare("UPDATE prescriptions SET diagnosis = ?, notes = ?, status = ?, expiry_date = ?, prescription_date = ?, updated_at = NOW() WHERE prescription_id = ?");
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);

        // Use NULL for empty expiry_date
        $expiry_param = $expiry_date === '' ? null : $expiry_date;

        // If transitioning to dispensed, attempt inventory deduction first
        if (strtolower($status) === 'dispensed') {
            $ok = reduceInventoryForPrescription($mysqli, $prescriptionId);
            if ($ok !== true) {
                // reduceInventoryForPrescription returns true on success or an array with details on partial/insufficient stock
                // We'll still proceed to update status but return a warning message to the client
                $inventoryWarning = is_array($ok) ? ($ok['message'] ?? 'Inventory partially updated') : (string)$ok;
            }
        }

        $stmt->bind_param('sssssi', $diagnosis, $notes, $status, $expiry_param, $prescription_date, $prescriptionId);
        if (!$stmt->execute()) {
            throw new Exception('Failed to update prescription: ' . $stmt->error);
        }
        $affected = $stmt->affected_rows;
        $stmt->close();

        $resp = ['success' => true, 'message' => 'Prescription updated', 'affected_rows' => $affected];
        if (isset($inventoryWarning)) $resp['inventory_warning'] = $inventoryWarning;
        echo json_encode($resp);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating prescription: ' . $e->getMessage()]);
    }
}

/**
 * Reduce inventory for a prescription by subtracting quantities from branch_inventory.
 * Attempts to deduct per item.quantity from branch_inventory rows (FIFO by expiry_date).
 * Returns true on success, or an array with a message if partial/insufficient stock.
 */
function reduceInventoryForPrescription($mysqli, $prescriptionId, $branchId = 1) {
    try {
        $mysqli->begin_transaction();

        // Get prescription items
        $stmt = $mysqli->prepare("SELECT medicine_id, quantity FROM prescription_items WHERE prescription_id = ?");
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) $items[] = $row;
        $stmt->close();

        if (empty($items)) {
            // Nothing to deduct
            $mysqli->commit();
            return true;
        }

        $insufficient = [];
        foreach ($items as $item) {
            $need = (int)$item['quantity'];
            $medId = (int)$item['medicine_id'];

            // Fetch available inventory batches for this medicine and branch (not expired first)
            $q = "SELECT inventory_id, quantity, reorder_level FROM branch_inventory WHERE medicine_id = ? AND branch_id = ? ORDER BY expiry_date ASC, inventory_id ASC";
            $st = $mysqli->prepare($q);
            if (!$st) throw new Exception('Prepare failed: ' . $mysqli->error);
            $st->bind_param('ii', $medId, $branchId);
            $st->execute();
            $res = $st->get_result();
            $batches = [];
            while ($r = $res->fetch_assoc()) $batches[] = $r;
            $st->close();

            $totalAvailable = 0;
            foreach ($batches as $b) $totalAvailable += (int)$b['quantity'];

            if ($totalAvailable < $need) {
                // Deduct what we can and record insufficiency
                $remainingNeeded = $need;
                foreach ($batches as $batch) {
                    if ($remainingNeeded <= 0) break;
                    $take = min($remainingNeeded, (int)$batch['quantity']);
                    if ($take <= 0) continue;
                    $newQty = (int)$batch['quantity'] - $take;
                    $u = $mysqli->prepare('UPDATE branch_inventory SET quantity = ?, status = CASE WHEN ? <= reorder_level THEN "low_stock" WHEN ? = 0 THEN "out_of_stock" ELSE status END, updated_at = NOW() WHERE inventory_id = ?');
                    if (!$u) throw new Exception('Prepare failed: ' . $mysqli->error);
                    $u->bind_param('iiii', $newQty, $newQty, $newQty, $batch['inventory_id']);
                    if (!$u->execute()) throw new Exception('Failed to update inventory: ' . $u->error);
                    $u->close();
                    $remainingNeeded -= $take;
                }
                $insufficient[] = "Medicine ID {$medId}: needed {$need}, available {$totalAvailable}";
            } else {
                // Enough total stock; deduct across batches FIFO
                $remainingNeeded = $need;
                foreach ($batches as $batch) {
                    if ($remainingNeeded <= 0) break;
                    $avail = (int)$batch['quantity'];
                    if ($avail <= 0) continue;
                    $take = min($avail, $remainingNeeded);
                    $newQty = $avail - $take;
                    $u = $mysqli->prepare('UPDATE branch_inventory SET quantity = ?, status = CASE WHEN ? <= reorder_level THEN "low_stock" WHEN ? = 0 THEN "out_of_stock" ELSE status END, updated_at = NOW() WHERE inventory_id = ?');
                    if (!$u) throw new Exception('Prepare failed: ' . $mysqli->error);
                    $u->bind_param('iiii', $newQty, $newQty, $newQty, $batch['inventory_id']);
                    if (!$u->execute()) throw new Exception('Failed to update inventory: ' . $u->error);
                    $u->close();
                    $remainingNeeded -= $take;
                }
            }
        }

        $mysqli->commit();

        if (!empty($insufficient)) {
            return ['message' => 'Insufficient stock for some items', 'details' => $insufficient];
        }

        return true;
    } catch (Exception $e) {
        $mysqli->rollback();
        return ['message' => 'Error reducing inventory: ' . $e->getMessage()];
    }
}

function createSampleMedicines($mysqli) {
    try {
        $samples = [
            ['Paracetamol 500mg', 'Paracetamol', 'Acme Pharma', 'Common pain reliever', 'Tablet', '500mg', 0.10],
            ['Amoxicillin 500mg', 'Amoxicillin', 'HealthCorp', 'Antibiotic', 'Capsule', '500mg', 0.25],
            ['Ibuprofen 200mg', 'Ibuprofen', 'MediLabs', 'Anti-inflammatory', 'Tablet', '200mg', 0.15]
        ];

        $inserted = [];
        foreach ($samples as $s) {
            // check existing
            $check = $mysqli->prepare('SELECT medicine_id FROM medicines WHERE medicine_name = ? LIMIT 1');
            $check->bind_param('s', $s[0]);
            $check->execute();
            $check->store_result();
            if ($check->num_rows > 0) { $check->close(); continue; }
            $check->close();

            $stmt = $mysqli->prepare('INSERT INTO medicines (medicine_name, generic_name, manufacturer, description, dosage_form, strength, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)');
            if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
            $stmt->bind_param('ssssssd', $s[0], $s[1], $s[2], $s[3], $s[4], $s[5], $s[6]);
            if (!$stmt->execute()) throw new Exception('Insert medicine failed: ' . $stmt->error);
            $medId = $mysqli->insert_id;
            $stmt->close();

            // create a branch inventory record for branch 1
            $expiry = date('Y-m-d', strtotime('+1 year'));
            $qty = 100;
            $bi = $mysqli->prepare('INSERT INTO branch_inventory (branch_id, medicine_id, quantity, reorder_level, expiry_date, batch_number, status, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)');
            if (!$bi) throw new Exception('Prepare failed: ' . $mysqli->error);
            $branchId = 1;
            $batch = 'BATCH-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $status = 'available';
            $reorder = 10;
            // types: branchId (i), medId (i), qty (i), reorder (i), expiry (s), batch (s), status (s)
            $bi->bind_param('iiiisss', $branchId, $medId, $qty, $reorder, $expiry, $batch, $status);
            if (!$bi->execute()) throw new Exception('Insert branch_inventory failed: ' . $bi->error);
            $bi->close();

            $inserted[] = $s[0];
        }

        echo json_encode(['success' => true, 'message' => 'Sample medicines created', 'inserted' => $inserted]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error creating sample medicines: ' . $e->getMessage()]);
    }
}

// Utility function to validate date format
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Utility function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

// Request prescription renewal
function requestPrescriptionRenewal($mysqli) {
    // Get parameters from POST
    $prescriptionId = $_POST['prescription_id'] ?? ($_GET['prescription_id'] ?? '');
    $notes = $_POST['notes'] ?? ($_GET['notes'] ?? '');
    
    if (empty($prescriptionId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'prescription_id is required']);
        return;
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $userId = $_SESSION['user_id'];
    
    try {
        // Verify prescription exists and belongs to this patient
        $checkQuery = "
            SELECT p.prescription_id, p.patient_id, p.status, pat.user_id
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            WHERE p.prescription_id = ? AND pat.user_id = ?
        ";
        
        $stmt = $mysqli->prepare($checkQuery);
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        
        $stmt->bind_param('ii', $prescriptionId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found or does not belong to this patient']);
            return;
        }
        
        $prescription = $result->fetch_assoc();
        $stmt->close();
        
        // Check if prescription is expired or cancelled
        if ($prescription['status'] === 'cancelled') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot renew a cancelled prescription']);
            return;
        }
        
        // Insert renewal request
        $insertQuery = "
            INSERT INTO prescription_renewals 
            (prescription_id, requested_by, request_date, status, notes)
            VALUES (?, ?, NOW(), 'pending', ?)
        ";
        
        $stmt = $mysqli->prepare($insertQuery);
        if (!$stmt) throw new Exception('Prepare failed: ' . $mysqli->error);
        
        $stmt->bind_param('iis', $prescriptionId, $userId, $notes);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $renewalId = $mysqli->insert_id;
        $stmt->close();
        
        // Update prescription renewal_requested flag
        $updateQuery = "UPDATE prescriptions SET renewal_requested = TRUE WHERE prescription_id = ?";
        $stmt = $mysqli->prepare($updateQuery);
        $stmt->bind_param('i', $prescriptionId);
        $stmt->execute();
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Renewal request submitted successfully',
            'renewal_id' => $renewalId,
            'prescription_id' => $prescriptionId
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error submitting renewal request: ' . $e->getMessage()]);
    }
}
?>
