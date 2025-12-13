import { prescriptObj, prescriptUtils, display } from "../prescription/Instances.js";

export class Medicine {

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
        const medicine = prescriptObj.getMedicines().find(m => 
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

        prescriptObj.getCurrentPrescription().medicines.push(medicineData);
        display.displayCurrentPrescription();
        prescriptUtils.clearMedicineForm();
    }

    removeMedicine(index) {
        prescriptObj.getCurrentPrescription().medicines.splice(index, 1);
        display.displayCurrentPrescription();
    }
}