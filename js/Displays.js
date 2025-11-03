import { prescriptObj } from "./Instances";

export class Display {

    displayPatients() {
        const patientsList = document.querySelector('.patients-list');
        if (!patientsList) return;

        let html = '';
        if (prescriptObj.getPatients().length === 0) {
            html = '<p>No patients found</p>';
        } else {
            prescriptObj.getPatients().forEach(patient => {
                html += `
                    <div class="patient-card">
                        <div class="patient-info">
                            <div class="patient-name">${patient.first_name} ${patient.last_name}</div>
                            <div class="patient-details">
                                ID: ${patient.patient_id} | Age: ${patient.age} | Gender: ${patient.gender}
                            </div>
                            <div class="patient-contact">
                                Phone: ${patient.phone || 'N/A'} | Email: ${patient.email || 'N/A'}
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button class="btn btn-primary" onclick="PrescriptionManager.selectPatient('${patient.patient_id}')">
                                <i class="fas fa-file-medical"></i> Medical History
                            </button>
                            <button class="btn btn-success" onclick="PrescriptionManager.createPrescriptionForPatient('${patient.patient_id}')">
                                <i class="fas fa-prescription"></i> New Prescription
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        patientsList.innerHTML = html;
    }

    displayMedicines() {
        const medicinesTableBody = document.getElementById('medicines-table-body');
        if (!medicinesTableBody) return;

        let html = '';
        if (prescriptObj.getMedicines().length === 0) {
            html = '<tr><td colspan="5">No medicines found</td></tr>';
        } else {
            prescriptObj.getMedicines().forEach(medicine => {
                html += `
                    <tr>
                        <td>${medicine.medicine_name}</td>
                        <td>${medicine.dosage}</td>
                        <td>${medicine.manufacturer || 'N/A'}</td>
                        <td>${medicine.medicine_type}</td>
                        <td>${medicine.description || 'No description'}</td>
                    </tr>
                `;
            });
        }
        medicinesTableBody.innerHTML = html;
    }

    displayPrescriptions() {
        const prescriptionsList = document.querySelector('.prescriptions-list');
        if (!prescriptionsList) return;

        let html = '';
        if (prescriptObj.getPrescriptions().length === 0) {
            html = '<p>No prescriptions found</p>';
        } else {
            prescriptObj.getPrescriptions().forEach(prescription => {
                const patient = prescriptObj.getPatients().find(p => p.patient_id === prescription.patient_id);
                const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
                
                html += `
                    <div class="prescription-card">
                        <div class="prescription-info">
                            <div class="prescription-header">
                                <h4>Prescription #${prescription.prescription_id}</h4>
                                <span class="status-badge status-${prescription.status.toLowerCase()}">${prescription.status}</span>
                            </div>
                            <div class="prescription-details">
                                <p><strong>Patient:</strong> ${patientName} (${prescription.patient_id})</p>
                                <p><strong>Date:</strong> ${prescription.prescription_date}</p>
                                <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'Not specified'}</p>
                                <p><strong>Notes:</strong> ${prescription.notes || 'No additional notes'}</p>
                            </div>
                        </div>
                        <div class="prescription-actions">
                            <button class="btn btn-primary" onclick="PrescriptionManager.viewPrescription(${prescription.prescription_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-warning" onclick="PrescriptionManager.editPrescription(${prescription.prescription_id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="PrescriptionManager.deletePrescription(${prescription.prescription_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        prescriptionsList.innerHTML = html;
    }

    displayCurrentPrescription() {
        // Create or update prescription preview
        let preview = document.getElementById('prescription-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'prescription-preview';
            preview.className = 'prescription-preview';
            preview.innerHTML = '<h4>Current Prescription</h4>';
            
            const formContainer = document.querySelector('.form-container');
            formContainer.appendChild(preview);
        }

        let html = '<h4>Current Prescription</h4>';
        if (prescriptObj.getCurrentPrescription().medicines.length === 0) {
            html += '<p>No medicines added yet</p>';
        } else {
            html += '<ul>';
            prescriptObj.getCurrentPrescription().medicines.forEach((medicine, index) => {
                html += `
                    <li>
                        ${medicine.medicine_name} (${medicine.dosage}) - 
                        Qty: ${medicine.quantity} - 
                        ${medicine.instructions}
                        <button type="button" onclick="meds.removeMedicine(${index})" class="btn btn-danger btn-sm">Remove</button>
                    </li>
                `;
            });
            html += '</ul>';
        }
        preview.innerHTML = html;
    }

    displayFilteredPatients(patients) {
        const patientsList = document.querySelector('.patients-list');
        if (!patientsList) return;

        let html = '';
        if (patients.length === 0) {
            html = '<p>No patients found matching the criteria</p>';
        } else {
            patients.forEach(patient => {
                html += `
                    <div class="patient-card">
                        <div class="patient-info">
                            <div class="patient-name">${patient.first_name} ${patient.last_name}</div>
                            <div class="patient-details">
                                ID: ${patient.patient_id} | Age: ${patient.age} | Gender: ${patient.gender}
                            </div>
                            <div class="patient-contact">
                                Phone: ${patient.phone || 'N/A'} | Email: ${patient.email || 'N/A'}
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button class="btn btn-primary" onclick="PrescriptionManager.selectPatient('${patient.patient_id}')">
                                <i class="fas fa-file-medical"></i> Medical History
                            </button>
                            <button class="btn btn-success" onclick="PrescriptionManager.createPrescriptionForPatient('${patient.patient_id}')">
                                <i class="fas fa-prescription"></i> New Prescription
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        patientsList.innerHTML = html;
    }

    displayFilteredPrescriptions(prescriptions) {
        const prescriptionsList = document.querySelector('.prescriptions-list');
        if (!prescriptionsList) return;

        let html = '';
        if (prescriptions.length === 0) {
            html = '<p>No prescriptions found matching the criteria</p>';
        } else {
            prescriptions.forEach(prescription => {
                const patient = this.getPatients().find(p => p.patient_id === prescription.patient_id);
                const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
                
                html += `
                    <div class="prescription-card">
                        <div class="prescription-info">
                            <div class="prescription-header">
                                <h4>Prescription #${prescription.prescription_id}</h4>
                                <span class="status-badge status-${prescription.status.toLowerCase()}">${prescription.status}</span>
                            </div>
                            <div class="prescription-details">
                                <p><strong>Patient:</strong> ${patientName} (${prescription.patient_id})</p>
                                <p><strong>Date:</strong> ${prescription.prescription_date}</p>
                                <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'Not specified'}</p>
                            </div>
                        </div>
                        <div class="prescription-actions">
                            <button class="btn btn-primary" onclick="PrescriptionManager.viewPrescription(${prescription.prescription_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-warning" onclick="PrescriptionManager.editPrescription(${prescription.prescription_id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="PrescriptionManager.deletePrescription(${prescription.prescription_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        prescriptionsList.innerHTML = html;
    }
}