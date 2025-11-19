import { PrescriptionObject } from "./PrescriptionObject";
import { PrescriptionUtils } from "../php/includes/PrescriptionUtilities";
import { Prescriptions } from "./Prescriptions";
import { BindEvents } from "./EventBinder";
import { Patient } from "./Patient";
import { Medicine } from "./Medicine";
import { Display } from "./Displays";

export const prescriptObj = new PrescriptionObject();
export const prescriptUtils = new PrescriptionUtils();
export const prescriptions = new Prescriptions();
export const eventBinder = new BindEvents();
export const patient = new Patient();
export const meds = new Medicine();
export const display = new Display();