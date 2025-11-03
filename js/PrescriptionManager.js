// Prescription Management JavaScript
// Handles prescription form interactions and API calls
import { prescriptUtils, eventBinder } from "./Instances";

class PrescriptionManager {
    constructor() {
        this.init();
    }

    init() {
        prescriptUtils.loadPatients();
        prescriptUtils.loadMedicines();
        prescriptUtils.loadPrescriptions();
        prescriptUtils.setCurrentDate();
        eventBinder;
    }
}

// Initialize the prescription manager when DOM is loaded
let prescriptionManager;
document.addEventListener('DOMContentLoaded', function() {
    prescriptionManager = new PrescriptionManager();
});
