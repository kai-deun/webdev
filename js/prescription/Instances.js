// shared singletons used across modules (data + utils + display)
import { PrescriptionObject } from "./PrescriptionObject.js";
import { PrescriptionUtils } from "../doctor/PrescriptionUtilities.js";
import { Prescriptions } from "./Prescriptions.js";
import { BindEvents } from "./EventBinder.js";
import { Patient } from "./Patient.js";
import { Medicine } from "../common/Medicine.js";
import { Display } from "./Displays.js";

export const prescriptObj = new PrescriptionObject();
export const prescriptUtils = new PrescriptionUtils();
export const prescriptions = new Prescriptions();
export const eventBinder = new BindEvents();
export const patient = new Patient();
export const meds = new Medicine();
export const display = new Display();