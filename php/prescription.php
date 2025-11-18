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

// Database configuration
$host = 'localhost';
$dbname = 'vitalsoft_db';
$username = 'root';
$password = '';

$mysqli = new mysqli($host, $username, $password, $dbname);

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

$mysqli->set_charset("utf8");

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
    case 'deletePrescription':
        deletePrescription($mysqli);
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
             CAST(p.patient_id AS CHAR) AS patient_id,
             p.insurance_number,
             p.insurance_provider,
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
        // Provide a "dosage" field (used by frontend) and select commonly used columns
        $sql = "SELECT medicine_id, medicine_name, generic_name, manufacturer, description, dosage_form, strength, unit_price, requires_prescription, "
             . "CONCAT(COALESCE(dosage_form, ''), ' ', COALESCE(strength, '')) AS dosage "
             . "FROM medicines "
             . "ORDER BY medicine_name";

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
        $query = "
            SELECT p.prescription_id, CAST(p.patient_id AS CHAR) AS patient_id, p.doctor_id, p.prescription_date, p.expiry_date, 
                   p.diagnosis, p.notes, p.status, p.renewal_requested, p.created_at, p.updated_at,
                   CONCAT(u_pat.first_name, ' ', u_pat.last_name) as patient_name,
                   CONCAT(u_doc.first_name, ' ', u_doc.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN users u_pat ON pat.user_id = u_pat.user_id
            JOIN users u_doc ON p.doctor_id = u_doc.user_id
            ORDER BY p.prescription_date DESC, p.prescription_id DESC
        ";
        
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

// Utility function to validate date format
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Utility function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}
?>
