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
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
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
        getPatients($pdo);
        break;
    case 'getMedicines':
        getMedicines($pdo);
        break;
    case 'getPrescriptions':
        getPrescriptions($pdo);
        break;
    case 'getPrescriptionDetails':
        getPrescriptionDetails($pdo);
        break;
    case 'savePrescription':
        savePrescription($pdo);
        break;
    case 'deletePrescription':
        deletePrescription($pdo);
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

function getPatients($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM patients ORDER BY first_name, last_name");
        $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'patients' => $patients
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching patients: ' . $e->getMessage()]);
    }
}

function getMedicines($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM medicines ORDER BY medicine_name");
        $medicines = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'medicines' => $medicines
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching medicines: ' . $e->getMessage()]);
    }
}

function getPrescriptions($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT p.*, 
                   CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
                   CONCAT(d.first_name, ' ', d.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN doctors d ON p.doctor_id = d.doctor_id
            ORDER BY p.prescription_date DESC, p.prescription_id DESC
        ");
        $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'prescriptions' => $prescriptions
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching prescriptions: ' . $e->getMessage()]);
    }
}

function getPrescriptionDetails($pdo) {
    $prescriptionId = $_GET['id'] ?? '';
    
    if (empty($prescriptionId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Prescription ID is required']);
        return;
    }
    
    try {
        // Get prescription details
        $stmt = $pdo->prepare("
            SELECT p.*, 
                   CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
                   CONCAT(d.first_name, ' ', d.last_name) as doctor_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN doctors d ON p.doctor_id = d.doctor_id
            WHERE p.prescription_id = ?
        ");
        $stmt->execute([$prescriptionId]);
        $prescription = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$prescription) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        // Get prescription medicines
        $stmt = $pdo->prepare("
            SELECT pm.*, m.medicine_name, m.dosage
            FROM prescription_medicines pm
            JOIN medicines m ON pm.medicine_id = m.medicine_id
            WHERE pm.prescription_id = ?
            ORDER BY pm.id
        ");
        $stmt->execute([$prescriptionId]);
        $medicines = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $prescription['medicines'] = $medicines;
        
        echo json_encode([
            'success' => true,
            'prescription' => $prescription
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching prescription details: ' . $e->getMessage()]);
    }
}

function savePrescription($pdo) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    
    if (!$input || !isset($input['data'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid input data']);
        return;
    }
    
    $data = $input['data'];
    
    // Validate required fields
    if (empty($data['patient_id']) || empty($data['prescription_date']) || empty($data['medicines'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Insert prescription
        $stmt = $pdo->prepare("
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
        
        $prescriptionId = $pdo->lastInsertId();
        
        // Insert prescription medicines
        $stmt = $pdo->prepare("
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
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Prescription saved successfully',
            'prescription_id' => $prescriptionId
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error saving prescription: ' . $e->getMessage()]);
    }
}

function deletePrescription($pdo) {
    $input = isset($GLOBALS['REQUEST_JSON']) ? $GLOBALS['REQUEST_JSON'] : null;
    
    if (!$input || empty($input['prescription_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Prescription ID is required']);
        return;
    }
    
    $prescriptionId = $input['prescription_id'];
    
    try {
        $pdo->beginTransaction();
        
        // Delete prescription medicines first (due to foreign key constraints)
        $stmt = $pdo->prepare("DELETE FROM prescription_medicines WHERE prescription_id = ?");
        $stmt->execute([$prescriptionId]);
        
        // Delete prescription
        $stmt = $pdo->prepare("DELETE FROM prescriptions WHERE prescription_id = ?");
        $stmt->execute([$prescriptionId]);
        
        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prescription not found']);
            return;
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Prescription deleted successfully'
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
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
