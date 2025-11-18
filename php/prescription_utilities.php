<?php
//All of the php functions that will be used later are here.

//database functions
function connectDB($host, $username, $password, $dbname) {
    try {
        $mysqli = new mysqli($host, $username, $password, $dbname);
        $mysqli->set_charset('utf8');

        return $mysqli;
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
}

//fetch all of the patient available in the database
function getPatientList($mysqli, $query_statement) {
    try {
        $result = $mysqli->query($query_statement);
        $patient_list = $result->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode([
            'success' => true,
            'patients' => $patient_list
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error fetching patients: ' . $e->getMessage()
        ]);
    }
}

//fetch all of the medicine available in the database
function getMedicineList($mysqli, $query_statement) {
    try {
        $result = $mysqli->query($query_statement);
        $medicines = $result->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode([
            'success' => true,
            'medicines' => $medicines
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error fetching medicines: ' . $e->getMessage()
        ]);
    }
}

//fetch all of the prescriptions available in the database
function getPrescriptions($mysqli, $query_statement) {
    try {
        $result = $mysqli->query($query_statement);
        $prescriptions = $result->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode([
            'success' => true,
            'prescriptions' => $prescriptions
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error fetching prescriptions: ' . $e->getMessage()
        ]);
    }
}

function getPrescriptionDetails($mysqli, $query_statement) {
    $prescription_id = $_GET['id'] ?? '';
    
    if (empty($prescription_id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Prescription ID is required'
        ]);
        return;
    }
    
    try {
        $query = $mysqli->prepare($query_statement);
        $query->bind_param("i", $prescription_id);//bind parameter to a certain datatype
        $query->execute();
        
        $result = $query->get_result(); 
        $prescription_details = $result->fetch_assoc(); 
        
        if (!$prescription_details) {
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'message' => 'Prescription not found'
            ]);
            return;
        }

        $medicines = getMedsForPrescriptDetails($mysqli, $prescription_id);
        
        $prescription_details['medicines'] = $medicines;
        
        echo json_encode([
            'success' => true,
            'prescription' => $prescription_details
        ]);
        
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error fetching prescription details: ' . $e->getMessage()
        ]);
    }
}

//this function is solely used for getPrescriptionDetails function to fetch the asssociated medicines
function getMedsForPrescriptDetails($mysqli, $prescription_id) {
    try { 
        $query = $mysqli->prepare(
            "SELECT meds.*
            FROM medicines as meds
            JOIN medicine_assignments as med_assign ON meds.medicine_id = med_assign.medicine_id
            JOIN prescriptions as pres ON med_assign.prescription_id = pres.prescription_id
            WHERE pres.prescription_id = ? 
            ORDER BY pres.prescription_id"
        );
        
        $query->bind_param("i", $prescription_id);
        $query->execute();
        $result = $query->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error fetching medicines for prescription details: ' . $e->getMessage()
        ]);
    }
}


function savePrescription($mysqli) {
   //TODO: save prescription
}

function updatePrescription($mysqli) {
    //TODO: main function is to delete the past prescription and replace with the updated one
}

function deletePrescription($myssqli) {
    //TODO: can be change to deactivate prescription if we will not going to delete a prescription.
}

function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

?>