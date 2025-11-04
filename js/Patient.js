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
}