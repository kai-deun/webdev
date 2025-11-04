import { prescriptUtils, prescriptions, meds } from "./Instances";

export class BindEvents {

    constructor() {
        // Add medicine button
        const addMedicineBtn = document.querySelector('.medicine-form .btn-secondary');
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                meds.addMedicineToPrescription();
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

        // Search functionality
        const searchBoxes = document.querySelectorAll('.search-box');
        searchBoxes.forEach(box => {
            box.addEventListener('input', (e) => {
                prescriptUtils.handleSearch(e.target);
            });
        });

        // Filter functionality
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                prescriptUtils.handleFilter(e.target);
            });
        });

        // Tab functionality
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                prescriptUtils.switchTab(e.target);
            });
        });
    }
}