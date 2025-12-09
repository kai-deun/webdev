// Loads initial data and sets up the page

import { managerUtils, eventBinder } from "./ManagerInstances.js";

class ManagerDashboard {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication first
        this.checkAuth();

        // Load all initial data
        managerUtils.loadBranches();
        managerUtils.loadStaff();
        managerUtils.loadInventory();
        managerUtils.loadPendingRequests();
        managerUtils.loadLowStockAlerts();
        managerUtils.loadPerformanceMetrics();

        // Initialize event bindings
        eventBinder;
    }

    async checkAuth() {
        const user = await checkAuth();
        if (!user || user.role !== 'Pharmacy Manager') {
            window.location.href = 'login.html';
            return;
        }
        updateUserInfo(user);
    }
}

// Initialize when DOM is loaded
let managerDashboard;
document.addEventListener('DOMContentLoaded', function() {
    managerDashboard = new ManagerDashboard();
});