import { prescriptObj, display } from "./Instances"

export class PrescriptionUtils {
    
    async loadPatients() {
        try {
            const response = await fetch('/php/prescription.php?action=getPatients');
            const data = await response.json();
                
            if (data.success) {
                prescriptObj.setPatients(data.patients);
                this.populatePatientSelect();
                display.displayPatients();
            } else {
                console.error('Error loading patients:', data.message);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    async loadMedicines() {
         try {
            const response = await fetch('/php/prescription.php?action=getMedicines');
            const data = await response.json();
            
            if (data.success) {
                prescriptObj.setMedicines(data.medicines);
                this.populateMedicineSuggestions();
            } else {
                console.error('Error loading medicines:', data.message);
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    async loadPrescriptions() {
        try {
            const response = await fetch('/php/prescription.php?action=getPrescriptions');
            const data = await response.json();
            
            if (data.success) {
                prescriptObj.setPrescriptions(data.prescriptions);
                display.displayPrescriptions();
            } else {
                console.error('Error loading prescriptions:', data.message);
            }
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    }

    populatePatientSelect() {
        const patientSelect = document.getElementById('patient-select');
        if (patientSelect) {
            // Clear existing options except the first one
            patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
            
            prescriptObj.getPatients().forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = `${patient.first_name} ${patient.last_name} (${patient.patient_id})`;
                patientSelect.appendChild(option);
            });
        }
    }

    populateMedicineSuggestions() {
        const medicineNameInput = document.getElementById('medicine-name');
        if (medicineNameInput) {
            // Create datalist for autocomplete
            let datalist = document.getElementById('medicine-datalist');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'medicine-datalist';
                medicineNameInput.setAttribute('list', 'medicine-datalist');
                document.body.appendChild(datalist);
            }

            datalist.innerHTML = '';
            prescriptObj.getMedicines().forEach(medicine => {
                const option = document.createElement('option');
                option.value = `${medicine.medicine_name} (${medicine.dosage})`;
                option.setAttribute('data-medicine-id', medicine.medicine_id);
                option.setAttribute('data-dosage', medicine.dosage);
                datalist.appendChild(option);
            });
        }
    }

    clearPrescriptionForm() {
        document.getElementById('patient-select').value = '';
        document.getElementById('prescription-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('diagnosis').value = '';
        document.getElementById('notes').value = '';
        prescriptObj.getCurrentPrescription().medicines = [];
        display.displayCurrentPrescription();
        this.clearMedicineForm();
    }

    clearMedicineForm() {
        document.getElementById('medicine-name').value = '';
        document.getElementById('medicine-dosage').value = '';
        document.getElementById('medicine-quantity').value = '';
        document.getElementById('medicine-instructions').value = '';
        document.getElementById('dosage-frequency').value = '';
        document.getElementById('duration-days').value = '';
    }

    //resets all the changes made from the editPrescription function.
    resetEditMode() {
        //Revert back the Header to its original title
        document.querySelector('.content-section h3').innerHTML = 'Create New Prescription';

        //Revet the patient selector
        const patient_input_field = document.getElementById('patient-select');
        const patient_selector_field = document.createElement('select');
        patient_selector_field.setAttribute('id', 'patient-select');
        patient_selector_field.setAttribute('name', patient_input_field.name);
        patient_selector_field.classList.add('form-control');//CSS style as the other input fields
        patient_input_field.replaceWith(patient_selector_field);

        //Revert the button
        const updateBtn = document.getElementById('update-prescription');
        if (updateBtn) {
            const saveBtn = updateBtn.cloneNode(true);
            saveBtn.id = 'save-prescription';
            updateBtn.replaceWith(saveBtn);
        }

        //Revert the Date Input Field
        document.getElementById('prescription-date').readOnly = false; 
    }

    filterPatients(searchTerm) {
        const filteredPatients = this.prescriptObj.getPatients().filter(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
            return fullName.includes(searchTerm) ||
                   patient.patient_id.toLowerCase().includes(searchTerm) ||
                   (patient.phone && patient.phone.includes(searchTerm)) ||
                   (patient.email && patient.email.toLowerCase().includes(searchTerm));
        });
        
        display.displayFilteredPatients(filteredPatients);
    }

    filterPrescriptions(searchTerm) {
        const filteredPrescriptions = prescriptObj.getPrescriptions().filter(prescription => {
            const patient = prescriptObj.getPatients().find(p => p.patient_id === prescription.patient_id);
            const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
            
            return patientName.toLowerCase().includes(searchTerm) ||
                   prescription.prescription_id.toString().includes(searchTerm) ||
                   (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(searchTerm));
        });
        
        display.displayFilteredPrescriptions(filteredPrescriptions);
    }
    
    filterPrescriptionsByStatus(status) {
        const filteredPrescriptions = status ? 
            prescriptObj.getPrescriptions().filter(p => p.status.toLowerCase() === status.toLowerCase()) :
            prescriptObj.getPrescriptions();
        
        display.displayFilteredPrescriptions(filteredPrescriptions);
    }

    handleSearch(searchBox) {
        const searchTerm = searchBox.value.toLowerCase();
        const tabId = searchBox.closest('.tab-content').id;
        
        if (tabId === 'prescriptions-tab') {
            this.filterPrescriptions(searchTerm);
        } else if (tabId === 'patients-tab') {
            this.filterPatients(searchTerm);
        }
    }

    handleFilter(filterSelect) {
        const filterValue = filterSelect.value;
        const tabId = filterSelect.closest('.tab-content').id;
        
        if (tabId === 'prescriptions-tab') {
            this.filterPrescriptionsByStatus(filterValue);
        }
    }

    switchTab(clickedTab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const tabId = clickedTab.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to current button and content
        clickedTab.classList.add('active');
        const targetContent = document.getElementById(`${tabId}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Load data for the active tab
        if (tabId === 'prescriptions') {
            this.loadPrescriptions();
        } else if (tabId === 'inventory') {
            display.displayMedicines();
        } else if (tabId === 'patients') {
            display.displayPatients();
        }
    }

    setCurrentDate() {
        const dateInput = document.getElementById('prescription-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
}
