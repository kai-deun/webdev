// Prescription Management JavaScript
// Handles prescription form interactions and API calls

class PrescriptionManager {

    //make the attributes private
    #medicines;
    #patients;
    #prescriptions;
    #currentPrescription;

    constructor() {
        this.#medicines = [];
        this.#patients = [];
        this.#prescriptions = [];
        this.#currentPrescription = {
            medicines: []
        };
        this.init();
    }

    //setters
    setMedicines(medicines) {
        this.#medicines = medicines;
    }
    setPatients(patients) {
        this.#patients = patients;
    }
    setPrescriptions(prescriptions) {
        this.#prescriptions = prescriptions;
    }
    setCurrentPrescription(currentPrescription) {
        this.#currentPrescription = currentPrescription;
    }

    //getters
    getMedicines() {
        return this.#medicines;
    }
    getPatients() {
        return this.#patients;
    }
    getPrescriptions() {
        return this.#prescriptions;
    }
    getCurrentPrescription() {
        return this.#currentPrescription;
    }

    init() {
        this.loadPatients();
        this.loadMedicines();
        this.loadPrescriptions();
        this.bindEvents();
        this.setCurrentDate();
    }

    bindEvents() {
        // Add medicine button
        const addMedicineBtn = document.querySelector('.medicine-form .btn-secondary');
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addMedicineToPrescription();
            });
        }
    
        // Save prescription button
        const savePrescriptionBtn = document.getElementById('save-prescription');
        if (savePrescriptionBtn) {
            savePrescriptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.savePrescription();
            });
        }

        // Search functionality
        const searchBoxes = document.querySelectorAll('.search-box');
        searchBoxes.forEach(box => {
            box.addEventListener('input', (e) => {
                this.handleSearch(e.target);
            });
        });

        // Filter functionality
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleFilter(e.target);
            });
        });

        // Tab functionality
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target);
            });
        });
    }

    setCurrentDate() {
        const dateInput = document.getElementById('prescription-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    async loadPatients() {
        try {
            const response = await fetch('/php/prescription.php?action=getPatients');
            const data = await response.json();
            
            if (data.success) {
                this.setPatients(data.patients);
                this.populatePatientSelect();
                this.displayPatients();
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
                this.setMedicines(data.medicines);
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
                this.setPrescriptions(data.prescriptions);
                this.displayPrescriptions();
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
            
            this.patients.forEach(patient => {
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
            this.getMedicines().forEach(medicine => {
                const option = document.createElement('option');
                option.value = `${medicine.medicine_name} (${medicine.dosage})`;
                option.setAttribute('data-medicine-id', medicine.medicine_id);
                option.setAttribute('data-dosage', medicine.dosage);
                datalist.appendChild(option);
            });
        }
    }

    addMedicineToPrescription() {
        const medicineName = document.getElementById('medicine-name').value;
        const dosage = document.getElementById('medicine-dosage').value;
        const quantity = document.getElementById('medicine-quantity').value;
        const instructions = document.getElementById('medicine-instructions').value;
        const dosageFrequency = document.getElementById('dosage-frequency').value;
        const durationDays = document.getElementById('duration-days').value;

        // Validation
        if (!medicineName || !dosage || !quantity || !instructions || !dosageFrequency || !durationDays) {
            alert('Please fill in all medicine fields');
            return;
        }

        // Find medicine ID
        const medicine = this.getMedicines().find(m => 
            m.medicine_name.toLowerCase() === medicineName.toLowerCase().split(' (')[0]
        );

        if (!medicine) {
            alert('Medicine not found in database');
            return;
        }

        const medicineData = {
            medicine_id: medicine.medicine_id,
            medicine_name: medicine.medicine_name,
            dosage: dosage,
            quantity: parseInt(quantity),
            instructions: instructions,
            dosage_frequency: dosageFrequency,
            duration_days: parseInt(durationDays)
        };

        this.getCurrentPrescription().medicines.push(medicineData);
        this.displayCurrentPrescription();
        this.clearMedicineForm();
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
        if (this.getCurrentPrescription().medicines.length === 0) {
            html += '<p>No medicines added yet</p>';
        } else {
            html += '<ul>';
            this.getCurrentPrescription().medicines.forEach((medicine, index) => {
                html += `
                    <li>
                        ${medicine.medicine_name} (${medicine.dosage}) - 
                        Qty: ${medicine.quantity} - 
                        ${medicine.instructions}
                        <button type="button" onclick="prescriptionManager.removeMedicine(${index})" class="btn btn-danger btn-sm">Remove</button>
                    </li>
                `;
            });
            html += '</ul>';
        }
        preview.innerHTML = html;
    }

    removeMedicine(index) {
        this.getCurrentPrescription().medicines.splice(index, 1);
        this.displayCurrentPrescription();
    }

    clearMedicineForm() {
        document.getElementById('medicine-name').value = '';
        document.getElementById('medicine-dosage').value = '';
        document.getElementById('medicine-quantity').value = '';
        document.getElementById('medicine-instructions').value = '';
        document.getElementById('dosage-frequency').value = 'Once daily';
        document.getElementById('duration-days').value = '7';
    }

    async savePrescription() {
        const patientId = document.getElementById('patient-select').value;
        const prescriptionDate = document.getElementById('prescription-date').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const notes = document.getElementById('notes').value;

        if (!patientId) {
            alert('Please select a patient');
            return;
        }

        if (this.getCurrentPrescription().medicines.length === 0) {
            alert('Please add at least one medicine to the prescription');
            return;
        }

        const prescriptionData = {
            patient_id: patientId,
            prescription_date: prescriptionDate,
            diagnosis: diagnosis,
            notes: notes,
            medicines: this.getCurrentPrescription().medicines
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
                this.clearPrescriptionForm();
                this.loadPrescriptions(); // Refresh prescriptions list
            } else {
                alert('Error saving prescription: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            alert('Error saving prescription. Please try again.');
        }
    }

    clearPrescriptionForm() {
        document.getElementById('patient-select').value = '';
        document.getElementById('prescription-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('diagnosis').value = '';
        document.getElementById('notes').value = '';
        this.getCurrentPrescription().medicines = [];
        this.displayCurrentPrescription();
        this.clearMedicineForm();
    }

    displayPrescriptions() {
        const prescriptionsList = document.querySelector('.prescriptions-list');
        if (!prescriptionsList) return;

        let html = '';
        if (this.getPrescriptions().length === 0) {
            html = '<p>No prescriptions found</p>';
        } else {
            this.getPrescriptions().forEach(prescription => {
                const patient = this.patients.find(p => p.patient_id === prescription.patient_id);
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
                            <button class="btn btn-primary" onclick="prescriptionManager.viewPrescription(${prescription.prescription_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-warning" onclick="prescriptionManager.editPrescription(${prescription.prescription_id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="prescriptionManager.deletePrescription(${prescription.prescription_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        prescriptionsList.innerHTML = html;
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

    filterPrescriptions(searchTerm) {
        const filteredPrescriptions = this.getPrescriptions().filter(prescription => {
            const patient = this.getPatients().find(p => p.patient_id === prescription.patient_id);
            const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
            
            return patientName.toLowerCase().includes(searchTerm) ||
                   prescription.prescription_id.toString().includes(searchTerm) ||
                   (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(searchTerm));
        });
        
        this.displayFilteredPrescriptions(filteredPrescriptions);
    }

    filterPrescriptionsByStatus(status) {
        const filteredPrescriptions = status ? 
            this.getPrescriptions().filter(p => p.status.toLowerCase() === status.toLowerCase()) :
            this.getPrescriptions();
        
        this.displayFilteredPrescriptions(filteredPrescriptions);
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
                            <button class="btn btn-primary" onclick="prescriptionManager.viewPrescription(${prescription.prescription_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-warning" onclick="prescriptionManager.editPrescription(${prescription.prescription_id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="prescriptionManager.deletePrescription(${prescription.prescription_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        prescriptionsList.innerHTML = html;
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
            this.displayMedicines();
        } else if (tabId === 'patients') {
            this.displayPatients();
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
                    this.loadPrescriptions(); // Refresh prescriptions list
                } else {
                    alert('Error deleting prescription: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting prescription:', error);
                alert('Error deleting prescription. Please try again.');
            }
        }
    }

    displayMedicines() {
        const medicinesTableBody = document.getElementById('medicines-table-body');
        if (!medicinesTableBody) return;

        let html = '';
        if (this.getMedicines().length === 0) {
            html = '<tr><td colspan="5">No medicines found</td></tr>';
        } else {
            this.getMedicines().forEach(medicine => {
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

    displayPatients() {
        const patientsList = document.querySelector('.patients-list');
        if (!patientsList) return;

        let html = '';
        if (this.getPatients().length === 0) {
            html = '<p>No patients found</p>';
        } else {
            this.getPatients().forEach(patient => {
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
                            <button class="btn btn-primary" onclick="prescriptionManager.selectPatient('${patient.patient_id}')">
                                <i class="fas fa-file-medical"></i> Medical History
                            </button>
                            <button class="btn btn-success" onclick="prescriptionManager.createPrescriptionForPatient('${patient.patient_id}')">
                                <i class="fas fa-prescription"></i> New Prescription
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        patientsList.innerHTML = html;
    }

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

    filterPatients(searchTerm) {
        const filteredPatients = this.getPatients().filter(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
            return fullName.includes(searchTerm) ||
                   patient.patient_id.toLowerCase().includes(searchTerm) ||
                   (patient.phone && patient.phone.includes(searchTerm)) ||
                   (patient.email && patient.email.toLowerCase().includes(searchTerm));
        });
        
        this.displayFilteredPatients(filteredPatients);
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
                            <button class="btn btn-primary" onclick="prescriptionManager.selectPatient('${patient.patient_id}')">
                                <i class="fas fa-file-medical"></i> Medical History
                            </button>
                            <button class="btn btn-success" onclick="prescriptionManager.createPrescriptionForPatient('${patient.patient_id}')">
                                <i class="fas fa-prescription"></i> New Prescription
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        patientsList.innerHTML = html;
    }
}

// Initialize the prescription manager when DOM is loaded
let prescriptionManager;
document.addEventListener('DOMContentLoaded', function() {
    prescriptionManager = new PrescriptionManager();
});
