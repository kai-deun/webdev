import { prescriptUtils, prescriptions, meds, patient, display } from "./Instances.js";

export class BindEvents {

    constructor() {
        // Set up the listener for dynamic content immediately (delegation on document.body)
        this.bindDynamicContent(); 

        // CRITICAL: Ensure static bindings only run AFTER the DOM is fully loaded.
        // This prevents errors if elements like 'save-prescription' haven't been parsed yet.
        document.addEventListener('DOMContentLoaded', this.bindStaticContent.bind(this));
    }

    // Handles elements that are present when the page loads (e.g., search/tab buttons)
    bindStaticContent() {

        // Add medicine button
        const addMedicineBtn = document.querySelector('.medicine-form .btn-secondary');
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                meds.addMedicineToPrescription();
                display.displayCurrentPrescription(); // Refresh the list
            });
        }

        // Header: New Prescription button scrolls to the create form and opens the Prescriptions tab
        const newPresBtn = document.getElementById('btn-new-prescription');
        if (newPresBtn) {
            newPresBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Activate prescriptions tab
                const presTabBtn = document.querySelector('.tab-btn[data-tab="prescriptions"]');
                if (presTabBtn) presTabBtn.click();

                // Scroll to the create form content section
                const formSection = document.querySelector('.content-section');
                if (formSection) {
                    setTimeout(() => {
                        formSection.scrollIntoView({ behavior: 'smooth' });
                        const patientSelect = document.getElementById('patient-select');
                        if (patientSelect) patientSelect.focus();
                    }, 200);
                }
            });
        }

        // Header: Add Patient button opens add-patient modal
        const addPatientBtn = document.getElementById('btn-add-patient');
        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (patient && typeof patient.createPatientModal === 'function') {
                    patient.createPatientModal();
                }
            });
        }

        // When a patient is added elsewhere in the app, refresh the patients list
        document.addEventListener('patients:added', (e) => {
            try {
                console.debug('patients:added event received', e.detail);
                prescriptUtils.loadPatients();
            } catch (err) {
                console.error('Error handling patients:added', err);
            }
        });
    
        // Save prescription button
        const savePrescriptionBtn = document.getElementById('save-prescription');
        if (savePrescriptionBtn) {
            savePrescriptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prescriptions.savePrescription();
            });
        }

        document.querySelectorAll('.search-box').forEach(box => {
            box.addEventListener('input', (e) => prescriptUtils.handleSearch(e.target));
        });

        // Support clicking the search button next to inputs to trigger the same search
        document.querySelectorAll('.search-filter .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = btn.closest('.search-filter');
                if (!container) return;
                const input = container.querySelector('.search-box');
                if (!input) return;
                prescriptUtils.handleSearch(input);
            });
        });

        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', (e) => prescriptUtils.handleFilter(e.target));
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => prescriptUtils.switchTab(e.target));
        });

        // A–Z filter removed from UI; search input handles filtering now.
    }

    // Handles elements that are dynamically added to the DOM (like table rows)
    bindDynamicContent() {
        // Use a high-level static parent element for delegation
        const mainAppContainer = document.body; 

        mainAppContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return; // Not a button click

            // --- 1. Patient Table Actions ---
            if (button.classList.contains('js-new-prescription')) {
                const patientId = button.dataset.patientId;
                console.log(`Creating prescription for: ${patientId}`);
                patient.createPrescriptionForPatient(patientId);
            }
            
            // --- 2. Prescription Table Actions (View/Edit/Delete) ---
            else if (button.classList.contains('js-view-prescription')) {
                const rx = button.dataset.rx;
                console.log(`Viewing prescription: ${rx}`);
                prescriptions.viewPrescription(rx);
            }
            else if (button.classList.contains('js-edit-prescription')) {
                const rx = button.dataset.rx;
                console.log(`Editing prescription: ${rx}`);
                prescriptions.editPrescription(rx);
            }
            else if (button.classList.contains('js-delete-prescription')) {
                const rx = button.dataset.rx;
                console.log(`Deleting prescription: ${rx}`);
                prescriptions.deletePrescription(rx);
            }

            // --- 3. Current Prescription Removal (Medicine) ---
            else if (button.classList.contains('js-remove-medicine')) {
                // Get the index directly from the data attribute
                const index = parseInt(button.dataset.medicineIndex, 10);
                
                // Call module-scoped method and refresh the display
                meds.removeMedicine(index);
                display.displayCurrentPrescription();
            }
        });
    }
}