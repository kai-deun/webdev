<?php
//all of the php functions that will be used later are present here.

//database functions
function connectDB($host, $username, $password, $dbname)
{
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
function getPatientList($mysqli, $query_statement)
{
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
function getMedicineList($mysqli, $query_statement)
{
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

// reusable function for inserting/updating list of medicines
function updateMedicineList(mysqli $mysqli, mysqli $added_meds)
{
    $meds_query = $mysqli->prepare(
        "INSERT INTO medication_assignements (prescription_id, medicine_id, dosage, meds_quantity, instructions, additional_notes)
            VALUES (?, ?, ?, ?, ?, ?)"
    );
    foreach ($added_meds as $med) {
        $medicine_id = sanitizeInput($med['medicine_id']);
        $dosage = floatval($med['dosage']);
        $medsquantity = intval($med['meds_quantity']);
        $instructions = sanitizeInput($med['instructions']);
        $additionalnotes = sanitizeInput($med['additional_notes'] ?? null);

        $meds_query->bind_param('ssdiis', $prescriptionid, $medicine_id, $dosage, $medsquantity, $instructions, $additionalnotes);
        $meds_query->execute();
    }
}

//fetch all of the prescriptions available in the database
function getPrescriptions($mysqli, $query_statement)
{
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

function getPrescriptionDetails($mysqli, $query_statement)
{
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
        $query->bind_param("i", $prescription_id); //bind parameter to a certain datatype
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
function getMedsForPrescriptDetails($mysqli, $prescription_id)
{
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


function savePrescription($mysqli)
{
    try {
        $prescription_id = uniqid('P');
        $doctor_id = sanitizeInput($_POST['doctor_id'] ?? '');
        $patient_id = sanitizeInput($_POST['patient_id'] ?? '');
        $date_made = sanitizeInput($_POST['date_created'] ?? '');
        $status = sanitizeInput($_POST['status'] ?? 'valid');
        $diagnose = sanitizeInput($_POST['diagnosis'] ?? '');
        $added_meds = $_POST['assigned_meds'] ?? [];

        $query = $mysqli->prepare(
            "INSERT INTO prescriptions (prescription_id, doctor_id, patient_id, date_created, status, diagnosis)
        VALUES (?, ?, ?, ?, ?, ?)"
        );

        $query->bind_param('ssssss', $prescription_id, $doctor_id, $patient_id, $date_made, $status, $diagnose);
        $query->execute();

        // for multiple medicines
        medicines($mysqli, $added_meds);

        echo json_encode([
            'success' => true,
            'message' => 'Prescription saved to database',
            'prescription_id' => $prescription_id
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save prescription: ' . $e->getMessage()
        ]);
    }
}

function updatePrescription($mysqli)
{
    try {
        $prescriptionid = sanitizeInput($_POST['prescription_id'] ?? '');
        $doctorid = sanitizeInput($_POST['doctor_id'] ?? '');
        $patientid = sanitizeInput($_POST['patient_id'] ?? '');
        $datecreated = sanitizeInput($_POST['date_created'] ?? '');
        $status = sanitizeInput($_POST['status'] ?? 'valid');
        $diagnose = sanitizeInput($_POST['diagnosis'] ?? '');
        $added_meds = $_POST['assigned_meds'] ?? [];

        // replace new (update)
        $query = $mysqli->prepare(
            "UPDATE prescriptions SET doctor_id = ?, patient_id = ?, date_created = ?, status = ?, diagnosis = ? WHERE prescription_id = ?"
        );
        $query->bind_param('ssssss', $doctorid, $patientid, $datecreated, $status, $diagnose, $prescriptionid);
        $query->execute();

        // delete old
        $del_query = $mysqli->prepare("DELETE FROM medication_assignments WHERE prescription_id = ?");
        $del_query->bind_param('s', $prescriptionid);
        $del_query->execute();

        // for new assigned meds
        medicines($mysqli, $added_meds);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode(
            [
                'success' => false,
                'message' => 'Error updating information: ' . $e->getMessage()
            ]
        );
    }
}

function deletePrescription($mysqli)
{
    //TODO: can be change to deactivate prescription if we will not going to delete a prescription.
    try {
        $prescriptionid = sanitizeInput($_POST['prescription_id'] ?? '');

        // delete assignments (for referential integrity)
        $del_assign = $mysqli->prepare(
            "DELETE FROM medication_assignements WHERE prescription_id = ?"
        );
        $del_assign->bind_param('s', $prescriptionid);
        $del_assign->execute();

        // delete function
        $del_query = $mysqli->prepare(
            "DELETE FROM prescriptions WHERE prescription_id = ?"
        );
        $del_query->bind_param('s', $prescriptionid);
        $del_query->execute();

        echo json_encode([
            'success' => true, 
            'message' => 'Prescription successfully deleted'
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting prescription: ' . $e->getMessage()
        ]);
    }
}

function validateDate($date, $format = 'Y-m-d')
{
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function sanitizeInput($input)
{
    return htmlspecialchars(strip_tags(trim($input)));
}
