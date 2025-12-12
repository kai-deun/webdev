// loads patients, medicines, prescriptions and initializes events
import { prescriptUtils, eventBinder } from "./Instances.js";

class PrescriptionManager {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Initializing Doctor Dashboard...');
        
        try {
            // Check authentication first
            const user = await this.checkAuth();
            if (!user) {
                console.log('Auth failed, stopping initialization');
                return; // Auth failed, redirect already happened
            }

            // Load all initial data
            console.log('Loading doctor data for user:', user.username);
            prescriptUtils.loadPatients();
            prescriptUtils.loadMedicines();
            prescriptUtils.loadPrescriptions();
            prescriptUtils.setCurrentDate();
            eventBinder;
            
            console.log('Doctor Dashboard initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            // Don't redirect here, let checkAuth handle it
        }
    }

    async checkAuth() {
        try {
            // Use global checkAuth from common.js
            const user = await window.checkAuth();
            console.log('==== AUTH CHECK RESULT ====', user);
            console.log('User object:', JSON.stringify(user, null, 2));
            
            if (!user) {
                console.error('==== NO USER SESSION FOUND ====');
                alert('No user session found. Redirecting to login...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.href = 'login.html';
                return null;
            }
            
            // Check if user has proper role
            console.log('==== CHECKING USER ROLE ====', user.role);
            if (user.role !== 'Doctor' && user.role !== 'Admin') {
                console.error('==== ACCESS DENIED ==== User role:', user.role);
                alert('Access denied. This page is for Doctors only. Redirecting to login...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.href = 'login.html';
                return null;
            }
            
            console.log('==== USER AUTHENTICATED SUCCESSFULLY ====', user);
            window.updateUserInfo(user);
            return user;
        } catch (error) {
            console.error('==== AUTH ERROR ====', error);
            alert('Auth error: ' + error.message + '. Redirecting to login...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.href = 'login.html';
            return null;
        }
    }
}

// Initialize the prescription manager when DOM is loaded
let prescriptionManager;
document.addEventListener('DOMContentLoaded', function() {
    prescriptionManager = new PrescriptionManager();
});
