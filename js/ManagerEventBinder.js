// Handles all event bindings for manager dashboard
// Similar pattern to EventBinder.js

import { managerUtils } from "./ManagerInstances.js";

export class ManagerEventBinder {

    constructor() {
        this.bindDynamicContent();
        document.addEventListener('DOMContentLoaded', this.bindStaticContent.bind(this));
    }

    bindStaticContent() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                managerUtils.switchTab(tabName);
            });
        });

        // Search boxes
        const searchBoxes = document.querySelectorAll('.search-box');
        searchBoxes.forEach(box => {
            box.addEventListener('input', (e) => {
                const tabId = e.target.closest('.tab-content').id;
                const searchTerm = e.target.value;

                if (tabId === 'inventory-tab') {
                    managerUtils.filterInventory(searchTerm);
                } else if (tabId === 'staff-tab') {
                    managerUtils.filterStaff(searchTerm);
                }
            });
        });

        // Branch filter dropdown
        const branchFilters = document.querySelectorAll('.filter-select');
        branchFilters.forEach(select => {
            select.addEventListener('change', (e) => {
                const branchId = e.target.value;
                const tabId = e.target.closest('.tab-content').id;

                if (tabId === 'inventory-tab') {
                    managerUtils.loadInventory(branchId || null);
                } else if (tabId === 'staff-tab') {
                    managerUtils.loadStaff(branchId || null);
                }
            });
        });

        // Add staff form submission
        const addStaffForm = document.querySelector('#add-staff-form');
        if (addStaffForm) {
            addStaffForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(addStaffForm);
                const staffData = Object.fromEntries(formData);
                managerUtils.createStaff(staffData);
                addStaffForm.reset();
            });
        }
    }

    bindDynamicContent() {
        // Use event delegation on document.body
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            // Branch actions
            if (button.classList.contains('js-change-status')) {
                const branchId = button.dataset.branchId;
                const currentStatus = button.dataset.currentStatus;
                this.handleChangeStatus(branchId, currentStatus);
            }

            // Staff actions
            if (button.classList.contains('js-delete-staff')) {
                const staffId = button.dataset.staffId;
                managerUtils.deleteStaff(staffId);
            }

            // Inventory actions
            if (button.classList.contains('js-edit-inventory')) {
                const inventoryId = button.dataset.inventoryId;
                this.handleEditInventory(inventoryId);
            }

            // Request actions
            if (button.classList.contains('js-approve-request')) {
                const requestId = button.dataset.requestId;
                if (confirm('Are you sure you want to approve this request?')) {
                    managerUtils.approveRequest(requestId);
                }
            }

            if (button.classList.contains('js-reject-request')) {
                const requestId = button.dataset.requestId;
                const reason = prompt('Enter rejection reason (optional):');
                managerUtils.rejectRequest(requestId, reason || '');
            }

            // Low-stock actions
            if (button.classList.contains('js-order-stock')) {
                const inventoryId = button.dataset.inventoryId;
                this.handleOrderStock(inventoryId);
            }
        });
    }

    handleChangeStatus(branchId, currentStatus) {
        const options = ['active', 'inactive', 'under_maintenance'];
        const newStatus = prompt(
            `Current status: ${currentStatus}\nEnter new status (${options.join(', ')}):`
        );

        if (newStatus && options.includes(newStatus.toLowerCase())) {
            managerUtils.updateBranchStatus(branchId, newStatus.toLowerCase());
        } else if (newStatus) {
            alert('Invalid status. Use: active, inactive, or under_maintenance');
        }
    }

    handleEditInventory(inventoryId) {
        const newQuantity = prompt('Enter new quantity:');
        if (newQuantity && !isNaN(newQuantity)) {
            managerUtils.updateInventoryItem(inventoryId, parseInt(newQuantity));
        }
    }

    handleOrderStock(inventoryId) {
        const quantity = prompt('Enter quantity to order:');
        if (quantity && !isNaN(quantity)) {
            alert(`Order placed for ${quantity} units (This would integrate with ordering system)`);
        }
    }
}