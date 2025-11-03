import { prescriptObj, prescriptUtils } from "./Instances"

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

    editPrescription(prescriptionId) {
        alert('Edit functionality would be implemented here');
    }
}