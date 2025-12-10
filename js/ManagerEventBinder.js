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
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                managerUtils.switchTab(tabName);
            });
        });

        // Branch search
        const branchSearchBtn = document.getElementById('branch-search-btn');
        if (branchSearchBtn) {
            branchSearchBtn.addEventListener('click', () => {
                const searchTerm = document.getElementById('branch-search').value;
                this.handleBranchSearch(searchTerm);
            });
        }

        // Staff search
        const staffSearchBtn = document.getElementById('staff-search-btn');
        if (staffSearchBtn) {
            staffSearchBtn.addEventListener('click', () => {
                const searchTerm = document.getElementById('staff-search').value;
                const branchFilter = document.getElementById('staff-branch-filter').value;
                const roleFilter = document.getElementById('staff-role-filter').value;
                this.handleStaffSearch(searchTerm, branchFilter, roleFilter);
            });
        }

        // Inventory search
        const inventorySearchBtn = document.getElementById('inventory-search-btn');
        if (inventorySearchBtn) {
            inventorySearchBtn.addEventListener('click', () => {
                const searchTerm = document.getElementById('inventory-search').value;
                const branchFilter = document.getElementById('inventory-branch-filter').value;
                const statusFilter = document.getElementById('inventory-status-filter').value;
                this.handleInventorySearch(searchTerm, branchFilter, statusFilter);
            });
        }

        // Add branch button
        const addBranchBtn = document.getElementById('add-branch-btn');
        if (addBranchBtn) {
            addBranchBtn.addEventListener('click', () => {
                alert('Add branch form would open here (to be implemented)');
            });
        }

        // Add staff button
        const addStaffBtn = document.getElementById('add-staff-btn');
        if (addStaffBtn) {
            addStaffBtn.addEventListener('click', () => {
                alert('Add staff form would open here (to be implemented)');
            });
        }

        // Add medicine button
        const addMedicineBtn = document.getElementById('add-medicine-btn');
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', () => {
                alert('Add medicine form would open here (to be implemented)');
            });
        }

        // Branch status filter
        const branchStatusFilter = document.getElementById('branch-status-filter');
        if (branchStatusFilter) {
            branchStatusFilter.addEventListener('change', (e) => {
                const status = e.target.value;
                this.handleBranchFilter(status);
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

    handleBranchSearch(searchTerm) {
        const branches = managerUtils.getBranches();
        const filtered = branches.filter(branch => 
            branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        managerUtils.displayBranches(filtered);
    }

    handleBranchFilter(status) {
        const branches = managerUtils.getBranches();
        if (status) {
            const filtered = branches.filter(branch => branch.status === status);
            managerUtils.displayBranches(filtered);
        } else {
            managerUtils.displayBranches(branches);
        }
    }

    handleStaffSearch(searchTerm, branchFilter, roleFilter) {
        let staff = managerUtils.getStaff();
        
        if (searchTerm) {
            staff = staff.filter(s => 
                s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (branchFilter) {
            staff = staff.filter(s => s.branch_id == branchFilter);
        }
        
        if (roleFilter) {
            staff = staff.filter(s => s.role_name === roleFilter);
        }
        
        managerUtils.displayStaff(staff);
    }

    handleInventorySearch(searchTerm, branchFilter, statusFilter) {
        let inventory = managerUtils.getInventory();
        
        if (searchTerm) {
            inventory = inventory.filter(item => 
                item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.generic_name && item.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (branchFilter) {
            inventory = inventory.filter(item => item.branch_id == branchFilter);
        }
        
        if (statusFilter) {
            inventory = inventory.filter(item => item.status === statusFilter);
        }
        
        managerUtils.displayInventory(inventory);
    }
}