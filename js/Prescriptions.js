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
            const response = await fetch('../php/prescription.php', {
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
            const response = await fetch(`../php/prescription.php?action=getPrescriptionDetails&id=${prescriptionId}`);
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
                const response = await fetch('../php/prescription.php', {
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
        // Open an edit modal populated with prescription details
        (async () => {
            try {
                const response = await fetch(`../php/prescription.php?action=getPrescriptionDetails&id=${prescriptionId}`);
                const data = await response.json();
                if (!data.success) {
                    alert('Error loading prescription details: ' + (data.message || 'Unknown'));
                    return;
                }

                const p = data.prescription;

                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Edit Prescription</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="edit-prescription-form" class="form-container">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Prescription ID</label>
                                        <input name="prescription_id" class="form-control" value="${p.prescription_id}" readonly />
                                    </div>
                                    <div class="form-group">
                                        <label>Patient</label>
                                        <input class="form-control" value="${p.patient_name || p.patient_id}" readonly />
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Prescription Date</label>
                                        <input name="prescription_date" type="date" class="form-control" value="${p.prescription_date || ''}" />
                                    </div>
                                    <div class="form-group">
                                        <label>Expiry Date</label>
                                        <input name="expiry_date" type="date" class="form-control" value="${p.expiry_date || ''}" />
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group" style="flex:1;">
                                        <label>Diagnosis</label>
                                        <input name="diagnosis" class="form-control" value="${(p.diagnosis || '').replace(/"/g,'&quot;')}" />
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group" style="flex:1;">
                                        <label>Notes</label>
                                        <textarea name="notes" class="form-control">${p.notes || ''}</textarea>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Status</label>
                                        <select name="status" class="form-control">
                                            <option value="active" ${p.status==='active'?'selected':''}>Active</option>
                                            <option value="dispensed" ${p.status==='dispensed'?'selected':''}>Dispensed</option>
                                            <option value="expired" ${p.status==='expired'?'selected':''}>Expired</option>
                                            <option value="cancelled" ${p.status==='cancelled'?'selected':''}>Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-success">Save Changes</button>
                                    <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);
                const close = modal.querySelector('.close');
                const cancel = modal.querySelector('.btn-cancel');
                const form = modal.querySelector('#edit-prescription-form');
                const closeModal = () => { if (modal && modal.parentNode) document.body.removeChild(modal); };
                close.addEventListener('click', closeModal);
                cancel.addEventListener('click', closeModal);
                modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const payload = {};
                    fd.forEach((v,k) => payload[k] = v);
                    payload.prescription_id = p.prescription_id;

                    try {
                        const res = await fetch('../php/prescription.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'updatePrescription', data: payload })
                        });
                        const result = await res.json();
                        if (result.success) {
                            alert('Prescription updated');
                            prescriptUtils.loadPrescriptions();
                            closeModal();
                        } else {
                            alert('Update failed: ' + (result.message || 'Unknown'));
                        }
                    } catch (err) {
                        console.error('Error updating prescription', err);
                        alert('Error updating prescription');
                    }
                });

            } catch (err) {
                console.error('Error loading prescription for edit', err);
                alert('Error loading prescription details');
            }
        })();
    }
}