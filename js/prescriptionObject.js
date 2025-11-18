/*
This is the main reference class for the presscriptions.
*/
export class PrescriptionObject {
    
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
}