import { eventBinder, prescriptionUtils } from "./singletons.js"

/*
This is like the main class in Java. This will be the one to be imported in the <script> tag in the html.
*/

class PrescriptionManager {
    constructor() {
        this.init();
    }

    init() {
        prescriptionUtils.loadPatients();//loads patient from database
        prescriptionUtils.loadMedicines();//loads medicine from database
        prescriptionUtils.loadPrescriptions();//loads prescriptions from database
        prescriptionUtils.setCurrentDate();
        eventBinder;
    }
}

//create an instance of this class to initialize
let prescriptionManager;
document.addEventListener('DOMContentLoaded', function() {
    prescriptionManager = new PrescriptionManager();
});