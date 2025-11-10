import { prescriptObj, prescriptUtils, display } from "./Instances"

export class Prescriptions {

    async savePrescription() {
        const patientId = document.getElementById('patient-select').value;
        const prescriptionDate = document.getElementById('prescription-date').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const notes = document.getElementById('notes').value;

        if (!patientId) {
            alert('Please select a patient');
            return;
        }

        if (prescriptObj.getCurrentPrescription().medicines.length === 0) {
            alert('Please add at least one medicine to the prescription');
            return;
        }

        const prescriptionData = {
            patient_id: patientId,
            prescription_date: prescriptionDate,
            diagnosis: diagnosis,
            notes: notes,
            medicines: prescriptObj.getCurrentPrescription().medicines
        };

        try {
            const response = await fetch('/php/prescription.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'savePrescription',
                    data: prescriptionData
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Prescription saved successfully!');
                prescriptUtils.clearPrescriptionForm();
                prescriptUtils.loadPrescriptions(); // Refresh prescriptions list
            } else {
                alert('Error saving prescription: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            alert('Error saving prescription. Please try again.');
        }
    }

    async updatePrescription(prescriptionId, patientId, prescriptionDate, diagnosis, notes, medicines) {

        const prescriptionData = {
            prescription_id: prescriptionId,
            patient_id: patientId,
            prescription_date: prescriptionDate,
            diagnosis: diagnosis,
            notes: notes,
            medicines: medicines
        };

        try {
            const response = await fetch('/php/prescription.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'savePrescription',
                    data: prescriptionData
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Prescription updated successfully!');
                prescriptUtils.clearPrescriptionForm();
                prescriptUtils.loadPrescriptions(); // Refresh prescriptions list
            } else {
                alert('Error updating prescription: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating prescription:', error);
            alert('Error updating prescription. Please try again.');
        }
    }

    async viewPrescription(prescriptionId) {
        try {
            const response = await fetch(`/php/prescription.php?action=getPrescriptionDetails&id=${prescriptionId}`);
            const data = await response.json();
            
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

    async deletePrescription(prescriptionId) {
        if (confirm('Are you sure you want to delete this prescription?')) {
            try {
                const response = await fetch('/php/prescription.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'deletePrescription',
                        prescription_id: prescriptionId
                    })
                });
            
                const result = await response.json();
                
                if (result.success) {
                    alert('Prescription deleted successfully!');
                    prescriptUtils.loadPrescriptions(); // Refresh prescriptions list
                } else {
                    alert('Error deleting prescription: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting prescription:', error);
                alert('Error deleting prescription. Please try again.');
            }
        }
    }

    showPrescriptionModal(prescription) {
        // Create modal for prescription details
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

        // Close modal functionality
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

    async editPrescription(prescriptionId) {
        //fetch prescription data
        try {
            const response = await fetch(`/php/prescription.php?action=getPrescriptionDetails&id=${prescriptionId}`);
            const data = await response.json();
             
            if (data.success) {
                const prescription_details = data.prescription;//fetched prescription details

                // Scroll to prescription form with the prescription details present in the form.
                const prescriptionForm = document.querySelector('.content-section');

                if (prescriptionForm) {
                    prescriptionForm.scrollIntoView({ behavior: 'smooth' });
                    
                    //change the text from "Create New Prescription" to "Edit Prescription"
                    document.querySelector('.content-section h3').innerHTML = 'Edit Prescription';

                    //patient selector (changed the slect element into an input element to apply the readOnly function)
                    const orig_patient_select = document.getElementById('patient-select');
                    const patient_select_replacement = document.createElement('input');

                    patient_select_replacement.setAttribute('type', 'text');
                    patient_select_replacement.setAttribute('id', 'patient-select');
                    patient_select_replacement.setAttribute('name', orig_patient_select.name);
                    patient_select_replacement.setAttribute('value', prescription_details.patient_name);
                    patient_select_replacement.classList.add('form-control');//CSS style as the other input fields
                    patient_select_replacement.readOnly = true;

                    orig_patient_select.replaceWith(patient_select_replacement);
                    

                    //prescription date
                    document.getElementById('prescription-date').value = prescription_details.prescription_date;
                    document.getElementById('prescription-date').readOnly = true;

                    //diagnosis & notes
                    document.getElementById('diagnosis').value = prescription_details.diagnosis;
                    document.getElementById('notes').value = prescription_details.notes;

                    //sets the current prescription to fetched prescription details to display properly.
                    prescriptObj.setCurrentPrescription(prescription_details);
                    display.displayCurrentPrescription();
                    
                    //replaces the save button id to avoid accesssing savePrescription function.
                    const oldBtn = document.getElementById('save-prescription');
                    if (oldBtn) {
                        const newButton = oldBtn.cloneNode(true);
                        newButton.id = 'update-prescription';
                        oldBtn.replaceWith(newButton);
                        newButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.updatePrescription(
                                prescriptObj.getCurrentPrescription().prescription_id,
                                prescriptObj.getCurrentPrescription().patient_id, 
                                prescriptObj.getCurrentPrescription().prescription_date,
                                prescriptObj.getCurrentPrescription().diagnosis,
                                prescriptObj.getCurrentPrescription().notes,
                                prescriptObj.getCurrentPrescription().medicines
                            );
                            document.getElementById('prescriptions-tab').scrollIntoView({ behavior: 'smooth' });
                        });
                    }
                }
            } else {
                alert('Error loading prescription details: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading prescription details:', error);
            alert('Error loading prescription details');
        }
    }
}