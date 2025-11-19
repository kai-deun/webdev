import { prescriptionObject, prescriptionUtils } from "./singletons.js";

/*
This class compiles all functions for patient data manipulation (actually only used by prescription form).
*/

export class PatientFunctions {

    //to populate the dropdown with the patientList from the database.
    populatePatientSelect() {
        const patientSelect = document.getElementById('patient-select');
        if (patientSelect) {
            // Clear existing options except the first one
            patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
                
            prescriptionObject.getPatients().forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = `${patient.first_name} ${patient.last_name} (${patient.patient_id})`;
                patientSelect.appendChild(option);
            });
        }
    }

    //to assign value to patient select
    selectPatient(patientId) {
        //assigns the patient ID binded to the clicked button
        const patientSelect = document.getElementById('patient-select');
        if (patientSelect) {
            patientSelect.value = patientId;
        }
    }

    createPrescriptionForPatient(patientId) {
        //deactivates all buttons and contents 
        prescriptionUtils.deactivateTab();

        //add prescription tab to active class
        const prescriptionTab = document.querySelector('[data-tab="prescriptions"]');
        if (prescriptionTab) {
            prescriptionTab.classList.add('active');
        }
        
        //selects patient
        this.selectPatient(patientId);

        //scroll to prescription form
        const prescriptionForm = document.querySelector('.content-section');
        if (prescriptionForm) {
            prescriptionForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
}