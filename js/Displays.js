// render patients, prescriptions, medicines to DOM
import { prescriptObj } from "./Instances.js";

export class Display {

    // Small helper: build a patient lookup map to avoid repeated O(n) finds
    _buildPatientMap() {
        const patients = prescriptObj.getPatients() || [];
        const map = new Map();
        for (let i = 0; i < patients.length; i++) {
            const p = patients[i];
            map.set(p.patient_id, p);
        }
        return map;
    }

    // render a provided patients array or all patients by default.
    // If append === true, appends to the existing list instead of replacing it.
    displayPatients(patients = null, append = false) {
        const tbody = document.querySelector('#patients-table tbody');
        if (!tbody) return;

        const source = patients || prescriptObj.getPatients() || [];

        if (!source || source.length === 0) {
            if (!append) tbody.innerHTML = '<tr><td colspan="7" class="text-center">No patients found</td></tr>';
            return;
        }

        const parts = [];
        for (let i = 0; i < source.length; i++) {
            const patient = source[i];
            parts.push(
                `<tr>` +
                    `<td>${patient.patient_id}</td>` +
                    `<td>${patient.first_name} ${patient.last_name}</td>` +
                    `<td>${patient.email || 'N/A'}</td>` +
                    `<td>${patient.phone || 'N/A'}</td>` +
                    `<td>${patient.age || 'N/A'}</td>` +
                    `<td>${patient.gender || 'N/A'}</td>` +
                    `<td>` +
                        `<button class="btn btn-primary btn-sm js-new-prescription" data-patient-id="${patient.patient_id}">New Prescription</button>` +
                    `</td>` +
                `</tr>`
            );
        }

        const html = parts.join('');
        if (append) tbody.insertAdjacentHTML('beforeend', html);
        else tbody.innerHTML = html;
    }

    displayMedicines() {
        const medicinesTableBody = document.getElementById('medicines-table-body');
        if (!medicinesTableBody) return;

        const source = arguments[0] || prescriptObj.getMedicines() || [];

        if (source.length === 0) {
            medicinesTableBody.innerHTML = '<tr><td colspan="8">No medicines found</td></tr>';
            return;
        }

        const parts = [];
        const today = new Date().toISOString().split('T')[0];

        for (let i = 0; i < source.length; i++) {
            const medicine = source[i];
            const expiry = medicine.expiry_date || '';
            const isExpired = expiry && expiry < today;
            const stock = typeof medicine.stock !== 'undefined' ? medicine.stock : (medicine.quantity ?? null);
            let stockClass = 'high';
            if (stock === null) stockClass = '';
            else if (stock < 20) stockClass = 'low';
            else if (stock < 100) stockClass = 'medium';

            parts.push(
                `<tr class="medicine-row ${isExpired ? 'medicine-expired' : ''}">` +
                    `<td>${medicine.medicine_name}</td>` +
                    `<td>${medicine.dosage}</td>` +
                    `<td>${medicine.manufacturer || 'N/A'}</td>` +
                    `<td>${medicine.medicine_type}</td>` +
                    `<td>${expiry ? `<span class="expiry-date ${isExpired ? 'expired' : ''}">${expiry}</span>` : ''}</td>` +
                    `<td>${stock !== null ? `<span class="stock-level ${stockClass}">${stock}</span>` : 'N/A'}</td>` +
                    `<td>${medicine.description || 'No description'}</td>` +
                `</tr>`
            );
        }

        medicinesTableBody.innerHTML = parts.join('');
    }

    displayPrescriptions() {
        // Accept optional array and append flag to support batching
        const tbody = document.querySelector('#prescriptions-table tbody');
        if (!tbody) return;

        const source = arguments[0] || prescriptObj.getPrescriptions() || [];
        const append = arguments[1] || false;

        if (!source || source.length === 0) {
            if (!append) tbody.innerHTML = '<tr><td colspan="6" class="text-center">No prescriptions found</td></tr>';
            return;
        }

        const patientMap = this._buildPatientMap();
        const parts = [];

        for (let i = 0; i < source.length; i++) {
            const prescription = source[i];
            const patient = patientMap.get(prescription.patient_id);
            const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';

            let statusKey = (prescription.status || '').toString().toLowerCase();
            let statusLabel = prescription.status || '';
            if (statusKey === 'completed') {
                statusKey = 'dispensed';
                statusLabel = 'Dispensed';
            }

            parts.push(
                `<tr>` +
                    `<td>${prescription.prescription_id}</td>` +
                    `<td>${prescription.prescription_date}</td>` +
                    `<td>${patientName}</td>` +
                    `<td>${prescription.diagnosis || 'N/A'}</td>` +
                    `<td><span class="status-badge status-${statusKey}">${statusLabel}</span></td>` +
                    `<td>` +
                        `<button class="btn btn-primary btn-sm js-view-prescription" data-rx="${prescription.prescription_id}">View</button>` +
                        `<button class="btn btn-warning btn-sm js-edit-prescription" data-rx="${prescription.prescription_id}">Edit</button>` +
                    `</td>` +
                `</tr>`
            );
        }

        const html = parts.join('');
        if (append) tbody.insertAdjacentHTML('beforeend', html);
        else tbody.innerHTML = html;
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
            if (formContainer) formContainer.appendChild(preview);
        }

        const cur = prescriptObj.getCurrentPrescription();
        const items = cur && cur.medicines ? cur.medicines : [];

        if (!items || items.length === 0) {
            preview.innerHTML = '<h4>Current Prescription</h4><p>No medicines added yet</p>';
            return;
        }

        const parts = ['<h4>Current Prescription</h4>', '<ul>'];
        for (let i = 0; i < items.length; i++) {
            const medicine = items[i];
            parts.push(
                `<li>` +
                    `${medicine.medicine_name} (${medicine.dosage}) - ` +
                    `Qty: ${medicine.quantity} - ` +
                    `${medicine.instructions}` +
                    `<button type="button" data-medicine-index="${i}" class="btn btn-danger btn-sm js-remove-medicine">Remove</button>` +
                `</li>`
            );
        }
        parts.push('</ul>');

        preview.innerHTML = parts.join('');
    }

    displayFilteredPatients(patients) {
        const tbody = document.querySelector('#patients-table tbody');
        if (!tbody) return;

        if (!patients || patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No patients found matching the criteria</td></tr>';
            return;
        }

        const parts = [];
        for (let i = 0; i < patients.length; i++) {
            const patient = patients[i];
            parts.push(
                `<tr>` +
                    `<td>${patient.patient_id}</td>` +
                    `<td>${patient.first_name} ${patient.last_name}</td>` +
                    `<td>${patient.email || 'N/A'}</td>` +
                    `<td>${patient.phone || 'N/A'}</td>` +
                    `<td>${patient.age || 'N/A'}</td>` +
                    `<td>${patient.gender || 'N/A'}</td>` +
                    `<td>` +
                        `<button class="btn btn-primary btn-sm js-new-prescription" data-patient-id="${patient.patient_id}">New Prescription</button>` +
                    `</td>` +
                `</tr>`
            );
        }

        tbody.innerHTML = parts.join('');
    }

    displayFilteredPrescriptions(prescriptions) {
        const tbody = document.querySelector('#prescriptions-table tbody');
        if (!tbody) return;

        if (!prescriptions || prescriptions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No prescriptions found matching the criteria</td></tr>';
            return;
        }

        const patientMap = this._buildPatientMap();
        const parts = [];

        for (let i = 0; i < prescriptions.length; i++) {
            const prescription = prescriptions[i];
            const patient = patientMap.get(prescription.patient_id);
            const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';

            let statusKey = (prescription.status || '').toString().toLowerCase();
            let statusLabel = prescription.status || '';
            if (statusKey === 'completed') {
                statusKey = 'dispensed';
                statusLabel = 'Dispensed';
            }

            parts.push(
                `<tr>` +
                    `<td>${prescription.prescription_id}</td>` +
                    `<td>${prescription.prescription_date}</td>` +
                    `<td>${patientName}</td>` +
                    `<td>${prescription.diagnosis || 'N/A'}</td>` +
                    `<td><span class="status-badge status-${statusKey}">${statusLabel}</span></td>` +
                    `<td>` +
                        `<button class="btn btn-primary btn-sm js-view-prescription" data-rx="${prescription.prescription_id}">View</button>` +
                        `<button class="btn btn-warning btn-sm js-edit-prescription" data-rx="${prescription.prescription_id}">Edit</button>` +
                    `</td>` +
                `</tr>`
            );
        }

        tbody.innerHTML = parts.join('');
    }
}