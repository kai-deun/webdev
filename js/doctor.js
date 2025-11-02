import Prescription from "./PrescriptionObject.js"
function selectPatient() {
    //This function is to select patients saved from the Database.
    //I don't know how to do it so help me here. Thank you
}

function prescribe(medName, dosage, quantity, instruction) {
    //if-statement where it validates the stock of a certain medicine. if low stock 
    return "Low Medicine Stock"
    //else
    return new Prescription(medName, dosage, quantity, instruction);
}

document.getElementById("save").addEventListener('click', async () => {
    //saves the prescription to the database's prescriptions table.
});