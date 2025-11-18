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

try {
    $mysqli = new mysqli("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $mysqli->setAttribute(mysqli::ATTR_ERRMODE, mysqli::ERRMODE_EXCEPTION);
} catch (mysqliException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

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
    case 'getMedicines':
        getMedicines($mysqli);
        break;
    case 'getPrescriptions':
        getPrescriptions($mysqli);
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

function getPatients($mysqli) {
    try {
        $stmt = $mysqli->query("SELECT * FROM patients ORDER BY first_name, last_name");
        $patients = $stmt->fetchAll(mysqli::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'patients' => $patients
        ]);
    } catch (mysqliException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching patients: ' . $e->getMessage()]);
    }
}

function getMedicines($mysqli) {
    try {
        $stmt = $mysqli->query("SELECT * FROM medicines ORDER BY medicine_name");
        $medicines = $stmt->fetchAll(mysqli::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'medicines' => $medicines
        ]);
    } catch (mysqliException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching medicines: ' . $e->getMessage()]);
    }
}

function getPrescriptions($mysqli) {
    try {
        $stmt = $mysqli->query("
            SELECT p.*, 
                   CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
                   CONCAT(d.first_name, ' ', d.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN doctors d ON p.doctor_id = d.doctor_id
            ORDER BY p.prescription_date DESC, p.prescription_id DESC
        ");
        $prescriptions = $stmt->fetchAll(mysqli::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'prescriptions' => $prescriptions
        ]);
    } catch (mysqliException $e) {
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
        $stmt = $mysqli->prepare("
            SELECT p.*, 
                   CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
                   CONCAT(d.first_name, ' ', d.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN doctors d ON p.doctor_id = d.doctor_id
            WHERE p.prescription_id = ?
        ");
        $stmt->execute([$prescriptionId]);
        $prescription = $stmt->fetch(mysqli::FETCH_ASSOC);
        
        if (!$prescription) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        // Get prescription medicines
        $stmt = $mysqli->prepare("
            SELECT pm.*, m.medicine_name, m.dosage
            FROM prescription_medicines pm
            JOIN medicines m ON pm.medicine_id = m.medicine_id
            WHERE pm.prescription_id = ?
            ORDER BY pm.id
        ");
        $stmt->execute([$prescriptionId]);
        $medicines = $stmt->fetchAll(mysqli::FETCH_ASSOC);
        
        $prescription['medicines'] = $medicines;
        
        echo json_encode([
            'success' => true,
            'prescription' => $prescription
        ]);
    } catch (mysqliException $e) {
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
    
    // Check for unique ID to determine action (INSERT or UPDATE)
    $is_update = !empty($data['prescription_id']);
    $prescriptionId = $data['prescription_id'] ?? null;
    
    // Validate required fields
    if (empty($data['patient_id']) || empty($data['prescription_date']) || empty($data['medicines'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    try {
<<<<<<< HEAD
        $pdo->beginTransaction();

        if ($is_update) {
            // ======================================
            // 🔄 UPDATE Existing Prescription
            // ======================================

            // 1. Update the main prescription record
            $stmt = $pdo->prepare("
                UPDATE prescriptions 
                SET patient_id = ?, prescription_date = ?, diagnosis = ?, notes = ?, status = 'Active'
                WHERE prescription_id = ? AND doctor_id = ? 
            ");
            
            $stmt->execute([
                $data['patient_id'],
                $data['prescription_date'],
                $data['diagnosis'] ?? '',
                $data['notes'] ?? '',
                $prescriptionId, // WHERE clause ID
                'DR001' // doctor_id used for security/ownership check
            ]);

            // 2. Clear all existing medicines for this prescription
            // This is the simplest way to handle updates: delete all and re-insert the new list.
            $stmt = $pdo->prepare("DELETE FROM prescription_medicines WHERE prescription_id = ?");
            $stmt->execute([$prescriptionId]);

        } else {
            // ======================================
            // ✨ INSERT New Prescription
            // ======================================
            
            // 1. Insert prescription
            $stmt = $pdo->prepare("
                INSERT INTO prescriptions (patient_id, doctor_id, prescription_date, diagnosis, notes, status)
                VALUES (?, ?, ?, ?, ?, 'Active')
            ");
            
            $stmt->execute([
                $data['patient_id'],
                'DR001', // Default doctor ID
                $data['prescription_date'],
                $data['diagnosis'] ?? '',
                $data['notes'] ?? ''
            ]);
            
            $prescriptionId = $pdo->lastInsertId();
        }
        
        // ======================================
        // 3. Insert/Re-insert Prescription Medicines
        // This runs for both INSERT (new) and UPDATE (after deletion)
        // ======================================

        $stmt = $pdo->prepare("
=======
        $mysqli->beginTransaction();
        
        // Insert prescription
        $stmt = $mysqli->prepare("
            INSERT INTO prescriptions (patient_id, doctor_id, prescription_date, diagnosis, notes, status)
            VALUES (?, ?, ?, ?, ?, 'Active')
        ");
        
        // For now, use DR001 as default doctor (in real app, this would come from session/auth)
        $stmt->execute([
            $data['patient_id'],
            'DR001', // Default doctor ID
            $data['prescription_date'],
            $data['diagnosis'] ?? '',
            $data['notes'] ?? ''
        ]);
        
        $prescriptionId = $mysqli->lastInsertId();
        
        // Insert prescription medicines
        $stmt = $mysqli->prepare("
>>>>>>> b3477267dfa2d2e234023502090c810a16f60943
            INSERT INTO prescription_medicines (prescription_id, medicine_id, quantity, instructions, dosage_frequency, duration_days)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($data['medicines'] as $medicine) {
            $stmt->execute([
                $prescriptionId,
                $medicine['medicine_id'],
                $medicine['quantity'],
                $medicine['instructions'],
                $medicine['dosage_frequency'] ?? 'As directed',
                $medicine['duration_days'] ?? 7
            ]);
        }
        
        $mysqli->commit();
        
        $message = $is_update ? 'Prescription updated successfully' : 'Prescription saved successfully';

        echo json_encode([
            'success' => true,
            'message' => $message,
            'prescription_id' => $prescriptionId
        ]);
        
    } catch (mysqliException $e) {
        $mysqli->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error saving/updating prescription: ' . $e->getMessage()]);
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
        $mysqli->beginTransaction();
        
        // Delete prescription medicines first (due to foreign key constraints)
        $stmt = $mysqli->prepare("DELETE FROM prescription_medicines WHERE prescription_id = ?");
        $stmt->execute([$prescriptionId]);
        
        // Delete prescription
        $stmt = $mysqli->prepare("DELETE FROM prescriptions WHERE prescription_id = ?");
        $stmt->execute([$prescriptionId]);
        
        if ($stmt->rowCount() === 0) {
            $mysqli->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        $mysqli->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Prescription deleted successfully'
        ]);
        
    } catch (mysqliException $e) {
        $mysqli->rollBack();
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
