// Stores all manager-related data
// Similar pattern to PrescriptionObject.js

export class ManagerObject {

    #branches;
    #staff;
    #inventory;
    #pendingRequests;
    #approvalHistory;
    #lowStockAlerts;
    #brands;
    #performanceMetrics;
    #selectedBranch;

    constructor() {
        this.#branches = [];
        this.#staff = [];
        this.#inventory = [];
        this.#pendingRequests = [];
        this.#approvalHistory = [];
        this.#lowStockAlerts = [];
        this.#brands = [];
        this.#performanceMetrics = [];
        this.#selectedBranch = null;
    }

    // Setters
    setBranches(branches) {
        this.#branches = branches;
    }

    setStaff(staff) {
        this.#staff = staff;
    }

    setInventory(inventory) {
        this.#inventory = inventory;
    }

    setPendingRequests(requests) {
        this.#pendingRequests = requests;
    }

    setApprovalHistory(history) {
        this.#approvalHistory = history;
    }

    setLowStockAlerts(alerts) {
        this.#lowStockAlerts = alerts;
    }

    setBrands(brands) {
        this.#brands = brands;
    }

    setPerformanceMetrics(metrics) {
        this.#performanceMetrics = metrics;
    }

    setSelectedBranch(branchId) {
        this.#selectedBranch = branchId;
    }

    // Getters
    getBranches() {
        return this.#branches;
    }

    getStaff() {
        return this.#staff;
    }

    getInventory() {
        return this.#inventory;
    }

    getPendingRequests() {
        return this.#pendingRequests;
    }

    getApprovalHistory() {
        return this.#approvalHistory;
    }

    getLowStockAlerts() {
        return this.#lowStockAlerts;
    }

    getBrands() {
        return this.#brands;
    }

    getPerformanceMetrics() {
        return this.#performanceMetrics;
    }

    getSelectedBranch() {
        return this.#selectedBranch;
    }
}