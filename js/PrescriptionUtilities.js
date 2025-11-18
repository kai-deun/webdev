import { prescriptObj, display } from "./Instances"

export class PrescriptionUtils {
    constructor() {
        // batch rendering state for patients list
        this.batchSize = 25;
        this.renderedCount = 0;
        this.currentPatients = [];
        this.loading = false;
        this._onScrollBound = this._onScroll.bind(this);
        // prescriptions batching
        this.presBatchSize = 20;
        this.presRenderedCount = 0;
        this.currentPrescriptions = [];
        this.presLoading = false;
        this._onPresScrollBound = this._onPresScroll.bind(this);
    }
    
    async loadPatients() {
        try {
            const response = await fetch('../php/prescription.php?action=getPatients');
            const data = await response.json();
                
            if (data.success) {
                prescriptObj.setPatients(data.patients);
                this.populatePatientSelect();
                // initialize batch rendering
                this.currentPatients = data.patients || [];
                this.renderedCount = 0;
                const patientsList = document.querySelector('.patients-list');
                if (patientsList) patientsList.innerHTML = '';
                this._hideLoading();
                this._ensureScrollHandler();
                this.loadMorePatients();
            } else {
                console.error('Error loading patients:', data.message);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    async loadMedicines() {
         try {
            const response = await fetch('../php/prescription.php?action=getMedicines');
            const data = await response.json();
            
            if (data.success) {
                console.debug('[PrescriptionUtils] getMedicines response', data);
                prescriptObj.setMedicines(data.medicines || []);
                // If there are no medicines in the DB, attempt to create sample medicines (useful for fresh installs)
                if ((!data.medicines || data.medicines.length === 0)) {
                    console.info('[PrescriptionUtils] No medicines found, seeding sample medicines...');
                    try {
                        const seedResp = await fetch('../php/prescription.php?action=createSampleMedicines');
                        const seedData = await seedResp.json();
                        console.info('[PrescriptionUtils] Seed response:', seedData);
                        // Try fetching medicines again after seeding
                        const retryResp = await fetch('../php/prescription.php?action=getMedicines');
                        const retryData = await retryResp.json();
                        if (retryData.success) prescriptObj.setMedicines(retryData.medicines || []);
                    } catch (seedErr) {
                        console.error('Error seeding medicines:', seedErr);
                    }
                }
                this.populateMedicineSuggestions();
                // Also refresh inventory table in case the Inventory tab is visible
                try { display.displayMedicines(); } catch (e) { console.debug('displayMedicines not available yet', e); }
            } else {
                console.error('Error loading medicines:', data.message);
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    async loadPrescriptions() {
        try {
            const response = await fetch('../php/prescription.php?action=getPrescriptions');
            const data = await response.json();
            
            if (data.success) {
                prescriptObj.setPrescriptions(data.prescriptions);
                // initialize prescriptions batching
                this.currentPrescriptions = data.prescriptions || [];
                this.presRenderedCount = 0;
                const presList = document.querySelector('.prescriptions-list');
                if (presList) presList.innerHTML = '';
                this._hidePresLoading();
                this._ensurePrescriptionsScrollHandler();
                this.loadMorePrescriptions();
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

    filterPatients(searchTerm) {
        // Search by first name only (case-insensitive)
        const term = (searchTerm || '').toString().trim().toLowerCase();
        let filteredPatients;
        if (!term) {
            filteredPatients = prescriptObj.getPatients();
        } else {
            // Match by first name prefix (startsWith) similar to prescription ID behavior
            filteredPatients = prescriptObj.getPatients().filter(patient => {
                const first = (patient.first_name || '').toString().toLowerCase();
                return first.startsWith(term);
            });
        }

        // debug: report filter results
        console.debug('[PrescriptionUtils] filterPatients', { term, total: prescriptObj.getPatients().length, matched: filteredPatients.length });

        // Use batching: set currentPatients to filtered results and render batches
        this.currentPatients = filteredPatients;
        this.renderedCount = 0;
        const patientsList = document.querySelector('.patients-list');
        if (patientsList) patientsList.innerHTML = '';
        this._hideLoading();
        this.loadMorePatients();
    }

    // Filter patients by last name initial (A-Z). Pass 'All' to clear filter.
    filterPatientsByInitial(letter) {
        if (!letter || letter === 'All') {
            // Show all patients (reset to master list)
            this.currentPatients = prescriptObj.getPatients();
        } else {
            const initial = letter.toLowerCase();
            this.currentPatients = prescriptObj.getPatients().filter(p => {
                const last = (p.last_name || '').toString().trim().toLowerCase();
                return last.startsWith(initial);
            });
        }

        // reset rendering and show first batch
        this.renderedCount = 0;
        const patientsList = document.querySelector('.patients-list');
        if (patientsList) patientsList.innerHTML = '';
        this._hideLoading();
        this.loadMorePatients();
    }

    // --- Prescriptions batch helpers ---
    _ensurePrescriptionsScrollHandler() {
        const container = document.getElementById('prescriptions-container');
        if (!container) return;
        if (!container._infinitePresBound) {
            container.addEventListener('scroll', this._onPresScrollBound);
            container._infinitePresBound = true;
        }
    }

    _onPresScroll(e) {
        const container = e.target;
        if (this.presLoading) return;
        if (this.presRenderedCount >= (this.currentPrescriptions ? this.currentPrescriptions.length : 0)) return;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 60) {
            this.loadMorePrescriptions();
        }
    }

    loadMorePrescriptions() {
        if (!this.currentPrescriptions) this.currentPrescriptions = prescriptObj.getPrescriptions() || [];
        if (this.presLoading) return;
        const remaining = this.currentPrescriptions.length - this.presRenderedCount;
        if (remaining <= 0) {
            this._hidePresLoading();
            return;
        }

        this.presLoading = true;
        this._showPresLoading();

        const nextSlice = this.currentPrescriptions.slice(this.presRenderedCount, this.presRenderedCount + this.presBatchSize);
        // append next slice
        display.displayPrescriptions(nextSlice, true);
        this.presRenderedCount += nextSlice.length;

        this.presLoading = false;
        if (this.presRenderedCount >= this.currentPrescriptions.length) {
            this._hidePresLoading();
        } else {
            this._hidePresLoading();
        }
    }

    _showPresLoading() {
        const el = document.getElementById('prescriptions-loading');
        if (el) el.style.display = 'block';
    }

    _hidePresLoading() {
        const el = document.getElementById('prescriptions-loading');
        if (el) el.style.display = 'none';
    }

    filterPrescriptions(searchTerm) {
        // Search by prescription ID only. If empty, reset to all.
        const term = (searchTerm || '').toString().trim();
        let filteredPrescriptions;
        if (!term) {
            filteredPrescriptions = prescriptObj.getPrescriptions();
        } else {
            filteredPrescriptions = prescriptObj.getPrescriptions().filter(prescription => {
                return prescription.prescription_id.toString().includes(term);
            });
        }

        // Use batching: set currentPrescriptions to filtered and render from start
        this.currentPrescriptions = filteredPrescriptions;
        this.presRenderedCount = 0;
        const presList = document.querySelector('.prescriptions-list');
        if (presList) presList.innerHTML = '';
        this._hidePresLoading();
        this.loadMorePrescriptions();
    }
    
    filterPrescriptionsByStatus(status) {
        // Handle legacy 'completed' values: treat 'dispensed' filter as matching both 'dispensed' and 'completed'
        const all = prescriptObj.getPrescriptions();
        let filteredPrescriptions;
        if (!status) {
            filteredPrescriptions = all;
        } else {
            const s = status.toString().toLowerCase();
            if (s === 'dispensed') {
                filteredPrescriptions = all.filter(p => {
                    const st = (p.status || '').toString().toLowerCase();
                    return st === 'dispensed' || st === 'completed';
                });
            } else {
                filteredPrescriptions = all.filter(p => (p.status || '').toString().toLowerCase() === s);
            }
        }

        display.displayFilteredPrescriptions(filteredPrescriptions);
    }

    handleSearch(searchBox) {
        const raw = searchBox.value;
        const searchTerm = (raw || '').toString().toLowerCase();
        const tabId = searchBox.closest('.tab-content') ? searchBox.closest('.tab-content').id : 'unknown';
        // debug: log user search actions
        console.debug('[PrescriptionUtils] handleSearch', { tabId, searchTerm });

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
        } else if (tabId === 'inventory-tab') {
            // If the select has class 'inventory-status-select', treat as status filter; otherwise it's handled elsewhere
            if (filterSelect.classList.contains('inventory-status-select')) {
                this.filterMedicinesByInventoryStatus(filterValue);
            } else {
                // Could be medicine type filter - do simple client-side filtering by medicine_type
                const all = prescriptObj.getMedicines();
                const filtered = filterValue ? all.filter(m => (m.medicine_type || '').toLowerCase() === filterValue.toLowerCase()) : all;
                display.displayMedicines(filtered);
            }
        }
    }

    filterMedicinesByInventoryStatus(status) {
        const all = prescriptObj.getMedicines();
        const today = new Date().toISOString().split('T')[0];
        let filtered;
        if (!status) {
            filtered = all;
        } else if (status === 'expired') {
            filtered = all.filter(m => m.expiry_date && m.expiry_date < today);
        } else if (status === 'low') {
            filtered = all.filter(m => {
                const stock = typeof m.stock !== 'undefined' ? m.stock : (m.quantity ?? null);
                return stock !== null && stock < 20;
            });
        } else if (status === 'in_stock') {
            filtered = all.filter(m => {
                const stock = typeof m.stock !== 'undefined' ? m.stock : (m.quantity ?? null);
                return stock !== null && stock >= 20;
            });
        } else {
            filtered = all;
        }

        // update display (don't replace master array stored in prescriptObj)
        display.displayMedicines(filtered);
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
            // If patients are already loaded, reset batch rendering; otherwise fetch
            if (this.currentPatients && this.currentPatients.length > 0) {
                this.renderedCount = 0;
                const patientsList = document.querySelector('.patients-list');
                if (patientsList) patientsList.innerHTML = '';
                this._ensureScrollHandler();
                this.loadMorePatients();
            } else {
                this.loadPatients();
            }
        }
    }

    setCurrentDate() {
        const dateInput = document.getElementById('prescription-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    /* --- Infinite scroll helpers for patients container --- */
    _ensureScrollHandler() {
        const container = document.getElementById('patients-container');
        if (!container) return;
        if (!container._infiniteBound) {
            container.addEventListener('scroll', this._onScrollBound);
            container._infiniteBound = true;
        }
    }

    _onScroll(e) {
        const container = e.target;
        if (this.loading) return;
        if (this.renderedCount >= (this.currentPatients ? this.currentPatients.length : 0)) return;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 60) {
            this.loadMorePatients();
        }
    }

    loadMorePatients() {
        if (!this.currentPatients) this.currentPatients = prescriptObj.getPatients() || [];
        if (this.loading) return;
        const remaining = this.currentPatients.length - this.renderedCount;
        if (remaining <= 0) {
            this._hideLoading();
            return;
        }

        this.loading = true;
        this._showLoading();

        const nextSlice = this.currentPatients.slice(this.renderedCount, this.renderedCount + this.batchSize);
        // append next slice
        display.displayPatients(nextSlice, true);
        this.renderedCount += nextSlice.length;

        this.loading = false;
        if (this.renderedCount >= this.currentPatients.length) {
            this._hideLoading();
        } else {
            this._hideLoading();
        }
    }

    _showLoading() {
        const el = document.getElementById('patients-loading');
        if (el) el.style.display = 'block';
    }

    _hideLoading() {
        const el = document.getElementById('patients-loading');
        if (el) el.style.display = 'none';
    }
}
