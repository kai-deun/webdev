import { prescriptionObject, prescriptionUtils } from "./singletons";

/*
This class compiles all of the functions related to prescription manipulation. 
Vague functions is moved to the PrescriptionUtilities.
*/

export class PrescriptionFunctions {

    //saves the prescription made to the database
    savePrescription() {
        const patientId = document.getElementById('patient-select').value;
        const prescriptionDate = document.getElementById('prescription-date').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const notes = document.getElementById('notes').value;

        if (!patientId) {
            alert('Please select a patient');
            return;
        }

        if (prescriptionObject.getCurrentPrescription().medicines.length === 0) {
            alert('Please add at least one medicine to the prescription');
            return;
        }

        const prescriptionData = {
            patient_id: patientId,
            prescription_date: prescriptionDate,
            diagnosis: diagnosis,
            notes: notes,
            medicines: prescriptionObject.getCurrentPrescription().medicines
        };

        try {
            const result = prescriptionUtils.fetchPhpFunction(
                'savePrescription', 
                method='POST', 
                data_key= 'data',
                data_value= prescriptionData
            )
            
            if (result.success) {
                alert('Prescription saved successfully!');
                prescriptionUtils.clearPrescriptionForm();
                prescriptionUtils.loadPrescriptions(); // Refresh prescriptions list
                prescriptionUtils.loadPatients(); //Refresh patient list
            } else {
                alert('Error saving prescription: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            alert('Error saving prescription. Please try again.');
        }
    }

    //updates existing prescriptions to the database
    updatePrescription(prescriptionId, patientId, prescriptionDate, diagnosis, notes, medicines) {

        const prescriptionData = {
            prescription_id: prescriptionId,
            patient_id: patientId,
            prescription_date: prescriptionDate,
            diagnosis: diagnosis,
            notes: notes,
            medicines: medicines
        };

        try {
            const result = prescriptionUtils.fetchPhpFunction(
                'updatePrescription', 
                method='POST', 
                data_key= 'data',
                data_value= prescriptionData
            )
            
            if (result.success) {
                alert('Prescription updated successfully!');
                prescriptionUtils.resetEditMode();
                prescriptionUtils.clearPrescriptionForm();
                prescriptionUtils.loadPrescriptions();
                prescriptionUtils.loadPatients();
            } else {
                alert('Error updating prescription: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating prescription:', error);
            alert('Error updating prescription. Please try again.');
        }
    }

    //display prescription as a popup/modal (view details button)
    viewPrescription(prescriptionId) {
        try {
            const data = prescriptionUtils.fetchPhpFunction(`getPrescriptionDetails&id=${prescriptionId}`);
            
            if (data.success) {
                this.showPrescriptionModal(data.prescription);
            } else {
                alert('Error loading prescription details: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading prescription details:', error);
            alert('Error loading prescription details');
        }
    }

    //deletes prescription from the database
    deletePrescription(prescriptionId) {
        if (confirm('Are you sure you want to delete this prescription?')) {
            try {
                const result = prescriptionUtils.fetchPhpFunction(
                    'deletePrescription',
                    method= 'POST',
                    data_key='prescription_id',
                    data_value= prescriptionId
                )
                
                if (result.success) {
                    alert('Prescription deleted successfully!');
                    prescriptionUtils.loadPrescriptions(); // Refresh prescriptions list
                } else {
                    alert('Error deleting prescription: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting prescription:', error);
                alert('Error deleting prescription. Please try again.');
            }
        }
    }

    //mainly used by viewPrescription function to display a modal/popup
    showPrescriptionModal(prescription) {
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Prescription Details</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="prescription-details">
                        <p><strong>Prescription ID:</strong> ${prescription.prescription_id}</p>
                        <p><strong>Patient:</strong> ${prescription.patient_name}</p>
                        <p><strong>Date:</strong> ${prescription.prescription_date}</p>
                        <p><strong>Status:</strong> ${prescription.status}</p>
                        <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'Not specified'}</p>
                        <p><strong>Notes:</strong> ${prescription.notes || 'No additional notes'}</p>
                    </div>
                    <div class="medicines-list">
                        <h4>Medicines:</h4>
                        <ul>
                            ${prescription.medicines.map(med => `
                                <li>${med.medicine_name} (${med.dosage}) - Qty: ${med.quantity} - ${med.instructions}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        //event listener to close the popup
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}