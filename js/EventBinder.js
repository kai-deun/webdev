import { prescriptUtils, prescriptions, meds, patient, display } from "./Instances";

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
    
        // Save prescription button
        const savePrescriptionBtn = document.getElementById('save-prescription');
        if (savePrescriptionBtn) {
            savePrescriptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prescriptions.savePrescription();
            });
        }

        // Search, Filter, and Tab functionality (uses event handling you already defined)
        document.querySelectorAll('.search-box').forEach(box => {
            box.addEventListener('input', (e) => prescriptUtils.handleSearch(e.target));
        });

        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', (e) => prescriptUtils.handleFilter(e.target));
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => prescriptUtils.switchTab(e.target));
        });
    }

    // Handles elements that are dynamically added to the DOM (like patient cards)
    bindDynamicContent() {
        // Use a high-level static parent element for delegation
        const mainAppContainer = document.body; 

        mainAppContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return; // Not a button click

            // --- 1. Patient List Actions ---
            if (button.closest('.patients-list')) {
                const patientId = button.dataset.patientId;

                if (button.classList.contains('js-select-patient')) {
                    console.log(`Selecting patient: ${patientId}`);
                    patient.selectPatient(patientId); 
                } else if (button.classList.contains('js-new-prescription')) {
                    console.log(`Creating prescription for: ${patientId}`);
                    patient.createPrescriptionForPatient(patientId);
                }
            } 
            
            // --- 2. Prescription Card Actions (View/Edit/Delete) ---
            else if (button.closest('.prescriptions-list')) {
                // Find the ID from the closest .prescription-card parent element
                const card = button.closest('.prescription-card');
                const prescriptionId = card ? card.dataset.prescriptionId : null;

                if (!prescriptionId) return;

                if (button.classList.contains('js-view-prescription')) {
                    console.log(`Viewing prescription: ${prescriptionId}`);
                    prescriptions.viewPrescription(prescriptionId);
                } else if (button.classList.contains('js-edit-prescription')) {
                    console.log(`Editing prescription: ${prescriptionId}`);
                    prescriptions.editPrescription(prescriptionId);
                } else if (button.classList.contains('js-delete-prescription')) {
                    console.log(`Deleting prescription: ${prescriptionId}`);
                    prescriptions.deletePrescription(prescriptionId);
                }
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