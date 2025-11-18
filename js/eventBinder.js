import { pat_funcs, pres_funcs, prescriptionUtils } from "./singletons";

/*
This class will compile all of the functions that will get 
binded to the events (e.g. click, keypress, etc.). This is done for readability and modularity.

NOTE:
This class is mostly used to button functions because the onclick="" (event handler) attribute is not working properly
There are also some contents such as the search, filter and switch tab that are included here.
*/
export class EventBinder {
    constructor() {
        this.bindDynamicContent();

        document.addEventListener('DOMContentLoaded', this.bindStaticContent.bind(this));
    }

    bindStaticContent() {
        //add medicine button binder
        const addMedicineBtn = document.querySelector('.medicine-form .btn-secondary');
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                meds.addMedicineToPrescription();
                display.displayCurrentPrescription(); // Refresh the list
            });
        }
    
        //save prescription button binder
        const savePrescriptionBtn = document.getElementById('save-prescription');
        if (savePrescriptionBtn) {
            savePrescriptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prescriptions.savePrescription();
            });
        }

        //search bar binder
        document.querySelectorAll('.search-box').forEach(box => {
            box.addEventListener('input', (e) => prescriptUtils.handleSearch(e.target));
        });

        //filter selector binder
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', (e) => prescriptUtils.handleFilter(e.target));
        });

        //tab buttons binder
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => prescriptUtils.switchTab(e.target));
        });

        //A-Z filter buttons (patients) binder
        const azFilter = document.querySelector('.az-filter');
        if (azFilter) {
            azFilter.addEventListener('click', (e) => {
                const btn = e.target.closest('.az-btn');
                if (!btn) return;
                const letter = btn.dataset.letter;

                //update active state visually
                azFilter.querySelectorAll('.az-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                prescriptUtils.filterPatientsByInitial(letter);
            });
        }
    }

    bindDynamicContent() {
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return; //not a button click

            //patient buttons binder
            if (button.closest('.patients-list')) {
                const patientId = button.dataset.patientId;

                if (button.classList.contains('js-select-patient')) { //Medical History Button (non functional as of the moment).
                    console.log(`Selecting patient: ${patientId}`);
                    pat_funcs.createPrescriptionForPatient(patientId);
                } else if (button.classList.contains('js-new-prescription')) { //New Prescription Button
                    console.log(`Creating prescription for: ${patientId}`);
                    pat_funcs.createPrescriptionForPatient(patientId);
                }
            } 
            
            //prescription buttons binder
            else if (button.closest('.prescriptions-list')) {
                // Find the ID from the closest .prescription-card parent element
                const card = button.closest('.prescription-card');
                const prescriptionId = card ? card.dataset.prescriptionId : null;

                if (!prescriptionId) return;

                if (button.classList.contains('js-view-prescription')) {
                    console.log(`Viewing prescription: ${prescriptionId}`);
                    pres_funcs.viewPrescription(prescriptionId);
                } else if (button.classList.contains('js-edit-prescription')) {
                    console.log(`Editing prescription: ${prescriptionId}`);
                    prescriptionUtils.activateEditMode(prescriptionId);
                } else if (button.classList.contains('js-delete-prescription')) {
                    console.log(`Deleting prescription: ${prescriptionId}`);
                    pres_funcs.deletePrescription(prescriptionId);
                }
            }

            //medicine remove button binder
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

