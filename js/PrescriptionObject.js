class Prescription {
    #medicineName;
    #dosage;
    #quantity;
    #instruction;

    constructor() {
        this.#medicineName = "Medicine Name";
        this.#dosage = 0+"mg";
        this.#quantity = 0;
        this.#instruction = "Instructionss";
    }

    constructor(medicineName, dosage, quantity, instruction) {
        this.#medicineName = medicineName;
        this.#dosage = dosage;
        this.#quantity = quantity;
        this.#instruction = instruction;
    }

    //setters
    setMedicineName(name) {
        this.#medicineName = name
    }
    setDosage(dosage) {
        this.#dosage = dosage;
    }
    setQuantity(quantity) {
        this.#quantity = quantity;
    }
    setInstruction(instruction) {
        this.#instruction = instruction;
    }

    //getters
    getMedicineName() {
        return this.#medicineName;
    }
    getDosage() {
        return this.#dosage;
    }
    getQuantity() {
        return this.#quantity;
    }
    getInstructiom() {
        return this.#instruction;
    }

    //toString in case we need it
    toString() {
        return `${this.#medicineName},${this.#dosage},${this.#quantity},${this.#instruction}`.toString();
    }
}