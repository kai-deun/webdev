export class Patient {
    selectPatient(patientId) {
        // Switch to prescription form and select the patient
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to prescription form
        const prescriptionTab = document.querySelector('[data-tab="prescriptions"]');
        if (prescriptionTab) {
            prescriptionTab.classList.add('active');
        }
        
        // Select the patient in the dropdown
        const patientSelect = document.getElementById('patient-select');
        if (patientSelect) {
            patientSelect.value = patientId;
        }

        // Scroll to prescription form
        const prescriptionForm = document.querySelector('.content-section');
        if (prescriptionForm) {
            prescriptionForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    createPrescriptionForPatient(patientId) {
        this.selectPatient(patientId);
    }

    async viewMedicalHistory(patientId) {
        try {
            const response = await fetch(`../php/prescription.php?action=getMedicalHistory&patient_id=${patientId}`);
            const data = await response.json();
            if (!data.success) {
                alert('Error loading medical history: ' + (data.message || 'Unknown'));
                return;
            }

            // Build modal with history records
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Medical History</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="history-list">
                            ${data.records.length === 0 ? '<p>No medical history found for this patient.</p>' : data.records.map(r => `
                                <div class="history-item">
                                    <div class="history-date">${r.visit_date || r.created_at}</div>
                                    <div class="history-content">
                                        <p><strong>Doctor:</strong> ${r.doctor_name || 'Unknown'}</p>
                                        <p><strong>Diagnosis:</strong> ${r.diagnosis || 'N/A'}</p>
                                        <p><strong>Notes:</strong> ${r.notes || 'No notes'}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const closeBtn = modal.querySelector('.close');
            closeBtn.addEventListener('click', () => document.body.removeChild(modal));
            modal.addEventListener('click', (e) => { if (e.target === modal) document.body.removeChild(modal); });
        } catch (error) {
            console.error('Error fetching medical history:', error);
            alert('Error loading medical history');
        }
    }

    createPatientModal() {
        // Build add-patient modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Patient</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="add-patient-form" class="form-container">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Username</label>
                                <input name="username" class="form-control" required />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input name="email" type="email" class="form-control" required />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name</label>
                                <input name="first_name" class="form-control" required />
                            </div>
                            <div class="form-group">
                                <label>Last Name</label>
                                <input name="last_name" class="form-control" required />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input name="phone_number" class="form-control" />
                            </div>
                            <div class="form-group">
                                <label>Date of Birth</label>
                                <input name="date_of_birth" type="date" class="form-control" />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group" style="flex:1;">
                                <label>Address</label>
                                <input name="address" class="form-control" />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Insurance #</label>
                                <input name="insurance_number" class="form-control" />
                            </div>
                            <div class="form-group">
                                <label>Insurance Provider</label>
                                <input name="insurance_provider" class="form-control" />
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-success">Add Patient</button>
                            <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = modal.querySelector('.close');
        const cancel = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('#add-patient-form');

        const closeModal = () => { if (modal && modal.parentNode) document.body.removeChild(modal); };

        close.addEventListener('click', closeModal);
        cancel.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const data = {};
            fd.forEach((v,k) => data[k] = v);

            // Basic validation
            if (!data.username || !data.email || !data.first_name || !data.last_name) {
                alert('Please fill required fields');
                return;
            }

            try {
                const resp = await fetch('../php/prescription.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'addPatient', data })
                });
                const result = await resp.json();
                if (result.success) {
                    // Notify the app to refresh patients
                    document.dispatchEvent(new CustomEvent('patients:added', { detail: result }));
                    alert('Patient added successfully');
                    closeModal();
                } else {
                    alert('Failed to add patient: ' + (result.message || 'Unknown'));
                }
            } catch (err) {
                console.error('Error adding patient', err);
                alert('Error adding patient');
            }
        });
    }
}