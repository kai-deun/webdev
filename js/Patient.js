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
}