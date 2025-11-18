<?php
include('../php/prescription_utilities.php');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

//db config
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'vitalsoft_db';

mysqli_report(MYSQLI_REPORT_ERROR); //for reporting errors.

$mysqli = connectDB($host, $username, $password, $dbname);

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
            
            //validation for updatePrescription: ID and new data must be present
            if (isset($parsedJson['prescription_id']) && isset($parsedJson['data'])) {
                $action = 'updatePrescription';
            }
            //validation for savePrescription: data must be present
            elseif (isset($parsedJson['data'])) {
                $action = 'savePrescription';
            }
            //validation for deletePrescription: ID must be present (to locate the presscription to be deleted)
            elseif (isset($parsedJson['prescription_id'])) {
                $action = 'deletePrescription';
            }
        }
    }
}

//queries to be used
$patient_query=
    "SELECT user.* 
    FROM user 
    JOIN patient ON user.user_id = patient.patientid 
    ORDER BY user.first_name, user.last_name"

$medicine_query=
    "SELECT * 
    FROM medicine 
    ORDER BY brand_name"

$prescription_query=
    "SELECT 
        med_assign.*, 
        med.*, 
        pres.date_created, 
        pres.status, 
        CONCAT(user.first_name, ' ', user.last_name) as user_name
    FROM medication_assignments as med_assign
    JOIN prescription as pres ON med_assign.prescript_id = pres.prescriptionid
    JOIN medicine as med ON med_assign.meds_id = med.medicineid
    JOIN user ON pres.patient_id = user.user_id
    WHERE pres.prescriptionid = ?"


switch ($action) {
    case 'getPatientList':
        getPatientList($mysqli, $patient_query);
        break;
    case 'getMedicineList':
        getMedicineList($mysqli, $medicine_query);
        break;
    case 'getPrescriptionList':
        getPrescriptionList($mysqli, $prescription_query);
        break;
    case 'getPrescriptionDetails':
        //similar query to get prescription list because inside this function is an embedded query that will get the neccesary details.
        getPrescriptionDetails($mysqli, $prescription_query);
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
?>