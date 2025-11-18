import { PrescriptionObject } from "./prescriptionObject";
import { PrescriptionUtilities } from "./prescriptionUtilities";
import { EventBinder } from "./eventBinder";
import { PrescriptionFunctions } from "./prescriptionFunctions";
import { MedicineFunctions } from "./medicineFunctions";
import { PatientFunctions } from "./patientFunctions";
import { DisplayFunctions } from "./displayFunctions";

/*
This class produces the instances of each classes used which is called a singleton.
Singletons: single instance objects. This is to ensure that the data being used is consistent.
*/

//reference object and event binder instance
export const prescriptionObject = new PrescriptionObject();
export const eventBinder = new EventBinder();

//main utility class instance
export const prescriptionUtils = new PrescriptionUtilities();

//function instances
export const pres_funcs = new PrescriptionFunctions();
export const med_funcs = new MedicineFunctions();
export const pat_funcs = new PatientFunctions();
export const disp_funcs = new DisplayFunctions();