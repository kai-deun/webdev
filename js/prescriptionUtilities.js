import { prescriptionObject, disp_funcs, pres_funcs, pat_funcs, med_funcs } from "./singletons";

/*
This class compiles all general functions that may be used to different data manipulation
such as prescription data, medicine data, patient data, and other.
*/

export class PrescriptionUtilities {

    //function for getting specific functions in PHP mainly used by load functions.
    async fetchPhpFunction(function_name, method='GET', data_key=null, data_value=null) {
        let response;
 
        if (method.toUpperCase() === 'POST' && data_key != null && data_value !=null) {
            const body_payload = {
                action: function_name,
                [data_key]: data_value
            }

            response = await fetch('../php/prescription.php', {
                method: `${method}`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({body_payload})
            });
        } else {
            response = await fetch(`./php/prescription.php?action=${function_name}`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }

    //uses the PHP function getPatientList($mysqli) to get the patient list from the database.
    loadPatients() {
        try {
            const data = this.fetchPhpFunction('getPatientList');

            if (data.success) {
                prescriptionObject.setPatients(data.patients);
                pat_funcs.populatePatientSelect();
                disp_funcs.displayPatients();
            } else {
                console.error('Error loading patients:', data.message);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    //uses the PHP function getMedicineList($mysqli) to get the patient list from the database.
    loadMedicines() {
         try {
             const data = this.fetchPhpFunction('getMedicineList');
            
            if (data.success) {
                prescriptionObject.setMedicines(data.medicines);
                med_funcs.populateMedicineSuggestions();
            } else {
                console.error('Error loading medicines:', data.message);
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    //uses the PHP function getPrescriptionList($mysqli) to get the patient list from the database.
    loadPrescriptions() {
        try {
             const data = this.fetchPhpFunction('getPrescriptionList');
            
            if (data.success) {
                prescriptionObject.setPrescriptions(data.prescriptions);
                disp_funcs.displayPrescriptions();
            } else {
                console.error('Error loading prescriptions:', data.message);
            }
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    }

    //clears the prescription form
    clearPrescriptionForm() {
        document.getElementById('patient-select').value = '';
        document.getElementById('prescription-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('diagnosis').value = '';
        document.getElementById('notes').value = '';
        prescriptionObject.getCurrentPrescription().medicines = [];
        disp_funcs.displayCurrentPrescription();
        this.clearMedicineForm();
    }

    //clears the medicine form
    clearMedicineForm() {
        document.getElementById('medicine-name').value = '';
        document.getElementById('medicine-dosage').value = '';
        document.getElementById('medicine-quantity').value = '';
        document.getElementById('medicine-instructions').value = '';
        document.getElementById('dosage-frequency').value = '';
        document.getElementById('duration-days').value = '';
    }

    //activates the edit mode of the prescription form.
    activateEditMode(prescriptionId) {
        //fetch prescription data
        try {
            const data = this.fetchPhpFunction(`getPrescriptionDetails&id=${prescriptionId}`);
                 
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
                    prescriptionObject.setCurrentPrescription(prescription_details);
                    disp_funcs.displayCurrentPrescription();
                        
                    //replaces the save button id to avoid accesssing savePrescription function.
                    const oldBtn = document.getElementById('save-prescription');
                    if (oldBtn) {
                        const newButton = oldBtn.cloneNode(true);
                        newButton.id = 'update-prescription';
                        oldBtn.replaceWith(newButton);
                        newButton.addEventListener('click', (e) => {
                            e.preventDefault();

                            const getCurrentPrescription = prescriptionObject.getCurrentPrescription();
                            pres_funcs.updatePrescription(
                                getCurrentPrescription.prescription_id,
                                getCurrentPrescription.patient_id, 
                                getCurrentPrescription.prescription_date,
                                getCurrentPrescription.diagnosis,
                                getCurrentPrescription.notes,
                                getCurrentPrescription.medicines
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

    //resets all the changes made from the prescription form
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

    //search function for patients
    searchPatients(searchTerm) {
        const filteredPatients = prescriptionObject.getPatients().filter(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
            return fullName.includes(searchTerm) ||
                   patient.patient_id.toLowerCase().includes(searchTerm) ||
                   (patient.phone && patient.phone.includes(searchTerm)) ||
                   (patient.email && patient.email.toLowerCase().includes(searchTerm));
        });
        
        disp_funcs.displayFilteredPatients(filteredPatients);
    }

    //filter patients by last name initial (A-Z). Pass 'All' to clear filter.
    filterPatientsByInitial(letter) {
        if (!letter || letter === 'All') {
            // Show all patients
            display.displayPatients();
            return;
        }

        const initial = letter.toLowerCase();
        const filtered = prescriptObj.getPatients().filter(p => {
            const last = (p.last_name || '').toString().trim().toLowerCase();
            return last.startsWith(initial);
        });

        disp_funcs.displayFilteredPatients(filtered);
    }

    //search function: to show prescriptions based on the entered word or string.
    searchPrescriptions(searchTerm) {
        const filteredPrescriptions = prescriptionObject.getPrescriptions().filter(prescription => {
            const patient = prescriptionObject.getPatients().find(p => p.patient_id === prescription.patient_id);
            const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
            
            return patientName.toLowerCase().includes(searchTerm) ||
                   prescription.prescription_id.toString().includes(searchTerm) ||
                   (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(searchTerm));
        });
        
        disp_funcs.displayFilteredPrescriptions(filteredPrescriptions);
    }
    
    //filter function: to show the prescriptions with specific status (e.g. active, inactive).
    filterPrescriptionsByStatus(status) {
        const filteredPrescriptions = status ? 
            prescriptionObject.getPrescriptions().filter(p => p.status.toLowerCase() === status.toLowerCase()) :
            prescriptionObject.getPrescriptions();
        
        disp_funcs.displayFilteredPrescriptions(filteredPrescriptions);
    }

    //search function
    handleSearch(searchBox) {
        const searchTerm = searchBox.value.toLowerCase();
        const tabId = searchBox.closest('.tab-content').id;
        
        if (tabId === 'prescriptions-tab') {
            this.searchPrescriptions(searchTerm);
        } else if (tabId === 'patients-tab') {
            this.searchPatients(searchTerm);
        }
    }

    //filter function
    handleFilter(filterSelect) {
        const filterValue = filterSelect.value;
        const tabId = filterSelect.closest('.tab-content').id;
        
        if (tabId === 'prescriptions-tab') {
            this.filterPrescriptionsByStatus(filterValue);
        }
    }

    //to remove 'active' class attribute from tab buttons and contents 
    deactivateTab() {
        //get the buttons and contents
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        //remove 'active' class attribute from all buttons and contents
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
    }

    switchTab(selected_tab) {
        //deactivates all buttons and contents
        this.deactivateTab();

        //data-tab which is get from buttons of the content-tabs of Doctor.html
        const tabId = selected_tab.getAttribute('data-tab');

        //add active class to current button and content
        selected_tab.classList.add('active');//button
        const targetContent = document.getElementById(`${tabId}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        //load data for the selected tab
        if (tabId === 'prescriptions') {
            this.loadPrescriptions();
        } else if (tabId === 'inventory') {
            disp_funcs.displayMedicines();
        } else if (tabId === 'patients') {
            disp_funcs.displayPatients();
        }
    }

    //sets the date to date today (kind of auto suggestion to dates).
    setCurrentDate() {
        const dateInput = document.getElementById('prescription-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
}