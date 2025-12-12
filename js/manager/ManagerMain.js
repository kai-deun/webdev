// Loads initial data and sets up the page

import { managerUtils, eventBinder } from "./ManagerInstances.js";
import "./ManagerModals.js"; // Import modal functions to attach to window object

class ManagerDashboard {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Initializing Manager Dashboard...');
        
        try {
            // Check authentication first
            const user = await this.checkAuth();
            if (!user) {
                console.log('Auth failed, stopping initialization');
                return; // Auth failed, redirect already happened
            }

            // Load all initial data
            console.log('Loading manager data for user:', user.username);
            await managerUtils.loadBranches();
            await managerUtils.loadStaff();
            await managerUtils.loadInventory();
            await managerUtils.loadPendingRequests();
            await managerUtils.loadApprovalHistory();

            // Initialize event bindings
            eventBinder;
            
            console.log('Manager Dashboard initialized successfully');
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
                alert('No user session found. Redirecting to login in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                window.location.href = 'login.html';
                return null;
            }
            
            // Check if user has proper role
            console.log('==== CHECKING USER ROLE ====', user.role);
            if (user.role !== 'Pharmacy Manager' && user.role !== 'Admin') {
                console.error('==== ACCESS DENIED ==== User role:', user.role);
                alert('Access denied. This page is for Pharmacy Managers only. Redirecting in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                window.location.href = 'login.html';
                return null;
            }
            
            console.log('==== USER AUTHENTICATED SUCCESSFULLY ====', user);
            window.updateUserInfo(user);
            return user;
        } catch (error) {
            console.error('==== AUTH ERROR ====', error);
            alert('Auth error: ' + error.message + '. Redirecting in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            window.location.href = 'login.html';
            return null;
        }
    }
}

// Initialize when DOM is loaded
let managerDashboard;
document.addEventListener('DOMContentLoaded', function() {
    managerDashboard = new ManagerDashboard();
});