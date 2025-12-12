// Handles API calls and business logic for manager operations
// Similar pattern to PrescriptionUtilities.js

import { managerObj, managerDisplay } from "./ManagerInstances.js";

export class ManagerUtilities {
    constructor() {
        this.API_BASE = '../php/manager.php';
    }

    // USER STORY 1 & 2: Load branches
    async loadBranches() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getBranches`, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                managerObj.setBranches(data.branches || []);
                managerDisplay.displayBranches();
                this.updateBranchSelect();
            } else {
                console.error('Error loading branches:', data.message);
            }
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    }

    // USER STORY 2: Update branch status
    async updateBranchStatus(branchId, status) {
        try {
            const response = await fetch(`${this.API_BASE}?action=updateBranchStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branch_id: branchId, status: status }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Branch status updated');
                this.loadBranches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating branch status:', error);
            alert('Error updating branch status');
        }
    }

    // Update branch details
    async updateBranch(branchId, branchData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=updateBranch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    branch_id: branchId, 
                    ...branchData 
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                alert('Branch updated successfully');
                this.loadBranches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating branch:', error);
            alert('Error updating branch');
        }
    }

    // Delete branch
    async deleteBranch(branchId) {
        try {
            const response = await fetch(`${this.API_BASE}?action=deleteBranch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branch_id: branchId }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                alert('Branch deleted successfully');
                this.loadBranches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting branch:', error);
            alert('Error deleting branch');
        }
    }

    // Add new branch
    async addBranch(branchData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=addBranch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                alert('Branch added successfully');
                this.loadBranches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding branch:', error);
            alert('Error adding branch');
        }
    }

    // USER STORY 3: Load staff
    async loadStaff(branchId = null) {
        try {
            const url = branchId
                ? `${this.API_BASE}?action=getStaff&branch_id=${branchId}`
                : `${this.API_BASE}?action=getStaff`;

            const response = await fetch(url, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                managerObj.setStaff(data.staff || []);
                managerDisplay.displayStaff();
            } else {
                console.error('Error loading staff:', data.message);
            }
        } catch (error) {
            console.error('Error loading staff:', error);
        }
    }

    // USER STORY 3: Create staff
    async createStaff(staffData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=createStaff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Staff account created');
                this.loadStaff();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating staff:', error);
            alert('Error creating staff account');
        }
    }

    // Add new staff
    async addStaff(staffData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=addStaff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                alert('Staff added successfully');
                this.loadStaff();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding staff:', error);
            alert('Error adding staff');
        }
    }

    // USER STORY 3: Update staff
    async updateStaff(staffId, staffData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=updateStaff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: staffId,
                    first_name: staffData.first_name,
                    last_name: staffData.last_name,
                    email: staffData.email,
                    phone_number: staffData.phone_number,
                    branch_id: staffData.branch_id,
                    role_name: staffData.role_name
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Staff member updated successfully');
                this.loadStaff();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating staff:', error);
            alert('Error updating staff member');
        }
    }

    // USER STORY 3: Delete staff
    async deleteStaff(staffId) {
        try {
            const response = await fetch(`${this.API_BASE}?action=deleteStaff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: staffId }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Staff member deleted');
                this.loadStaff();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Error deleting staff member');
        }
    }

    // USER STORY 1: Load inventory
    async loadInventory(branchId = null) {
        try {
            const url = branchId
                ? `${this.API_BASE}?action=getInventory&branch_id=${branchId}`
                : `${this.API_BASE}?action=getInventory`;

            const response = await fetch(url, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                managerObj.setInventory(data.inventory || []);
                managerDisplay.displayInventory();
            } else {
                console.error('Error loading inventory:', data.message);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    // USER STORY 1: Update inventory (comprehensive)
    async updateInventory(inventoryId, inventoryData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=updateInventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory_id: inventoryId,
                    quantity: inventoryData.quantity,
                    reorder_level: inventoryData.reorder_level,
                    unit_price: inventoryData.unit_price
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Inventory updated successfully');
                this.loadInventory();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert('Error updating inventory');
        }
    }

    // USER STORY 1: Transfer inventory between branches
    async transferInventory(inventoryId, transferData) {
        try {
            const response = await fetch(`${this.API_BASE}?action=transferInventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory_id: inventoryId,
                    to_branch_id: transferData.to_branch_id,
                    quantity: transferData.quantity
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Inventory transferred successfully');
                this.loadInventory();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error transferring inventory:', error);
            alert('Error transferring inventory');
        }
    }

    // USER STORY 1: Update inventory item (legacy method)
    async updateInventoryItem(inventoryId, quantity) {
        try {
            const response = await fetch(`${this.API_BASE}?action=updateInventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory_id: inventoryId,
                    quantity: quantity
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Inventory updated');
                this.loadInventory();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert('Error updating inventory');
        }
    }

    // USER STORY 1: Delete inventory item
    async deleteInventoryItem(inventoryId) {
        if (!confirm('Are you sure you want to delete this inventory item?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}?action=deleteInventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory_id: inventoryId }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Inventory item deleted');
                this.loadInventory();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting inventory:', error);
            alert('Error deleting inventory item');
        }
    }

    // USER STORY 5: Load pending requests
    async loadPendingRequests() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getPendingRequests`, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                managerObj.setPendingRequests(data.requests || []);
                managerDisplay.displayPendingRequests();
                this.updateRequestsBadge(data.requests ? data.requests.length : 0);
            } else {
                console.error('Error loading requests:', data.message);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    }

    // Load approval history (approved and rejected requests)
    async loadApprovalHistory() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getApprovalHistory`, {
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                managerObj.setApprovalHistory(data.history || []);
                managerDisplay.displayApprovalHistory(data.history || []);
            } else {
                console.error('Error loading approval history:', data.message);
            }
        } catch (error) {
            console.error('Error loading approval history:', error);
        }
    }

    // USER STORY 5: Approve request
    async approveRequest(requestId) {
        try {
            const response = await fetch(`${this.API_BASE}?action=approveRequest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: requestId }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Request approved');
                this.loadPendingRequests();
                this.loadApprovalHistory();
                this.loadInventory(); // Refresh inventory
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Error approving request');
        }
    }

    // USER STORY 5: Reject request
    async rejectRequest(requestId, reason = '') {
        try {
            const response = await fetch(`${this.API_BASE}?action=rejectRequest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: requestId,
                    reason: reason
                }),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Request rejected');
                this.loadPendingRequests();
                this.loadApprovalHistory();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Error rejecting request');
        }
    }

    // USER STORY 6: Load low-stock alerts
    async loadLowStockAlerts() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getLowStockAlerts`);
            const data = await response.json();

            if (data.success) {
                managerObj.setLowStockAlerts(data.alerts || []);
                managerDisplay.displayLowStockAlerts();
            } else {
                console.error('Error loading alerts:', data.message);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    // USER STORY 7: Load brands
    async loadBrands() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getBrands`);
            const data = await response.json();

            if (data.success) {
                managerObj.setBrands(data.brands || []);
                managerDisplay.displayBrands();
            } else {
                console.error('Error loading brands:', data.message);
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    // USER STORY 8: Load performance metrics
    async loadPerformanceMetrics() {
        try {
            const response = await fetch(`${this.API_BASE}?action=getPerformanceMetrics`);
            const data = await response.json();

            if (data.success) {
                managerObj.setPerformanceMetrics(data.metrics || []);
                managerDisplay.displayPerformanceMetrics();
            } else {
                console.error('Error loading metrics:', data.message);
            }
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    // USER STORY 4: Search inventory
    filterInventory(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = managerObj.getInventory().filter(item => {
            return item.medicine_name.toLowerCase().includes(term) ||
                item.brand_name.toLowerCase().includes(term);
        });
        managerDisplay.displayInventory(filtered);
    }

    // USER STORY 4: Search staff
    filterStaff(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = managerObj.getStaff().filter(staff => {
            return staff.first_name.toLowerCase().includes(term) ||
                staff.last_name.toLowerCase().includes(term) ||
                staff.email.toLowerCase().includes(term);
        });
        managerDisplay.displayStaff(filtered);
    }

    // Helper: Update branch filter dropdown
    updateBranchSelect() {
        const staffBranchFilter = document.getElementById('staff-branch-filter');
        const inventoryBranchFilter = document.getElementById('inventory-branch-filter');
        
        const branches = managerObj.getBranches();
        
        // Populate staff branch filter
        if (staffBranchFilter) {
            // Keep first option (All Branches)
            staffBranchFilter.innerHTML = '<option value="">All Branches</option>';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.branch_id;
                option.textContent = branch.branch_name;
                staffBranchFilter.appendChild(option);
            });
        }

        // Populate inventory branch filter
        if (inventoryBranchFilter) {
            inventoryBranchFilter.innerHTML = '<option value="">All Branches</option>';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.branch_id;
                option.textContent = branch.branch_name;
                inventoryBranchFilter.appendChild(option);
            });
        }
    }

    // Helper: Update requests badge count
    updateRequestsBadge(count) {
        const badge = document.querySelector('.tab-btn[data-tab="approvals"] .badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    // Handle tab switching
    switchTab(tabName) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        // Remove active class from all
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to current
        const currentBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const currentContent = document.getElementById(`${tabName}-tab`);

        if (currentBtn) currentBtn.classList.add('active');
        if (currentContent) currentContent.classList.add('active');

        // Load data for tab
        this.loadTabData(tabName);
    }

    // Load data based on active tab
    loadTabData(tabName) {
        switch(tabName) {
            case 'branches':
                this.loadBranches();
                break;
            case 'staff':
                this.loadStaff();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'approvals':
                this.loadPendingRequests();
                break;
        }
    }

    // Expose getters for filtering
    getBranches() {
        return managerObj.getBranches();
    }

    getStaff() {
        return managerObj.getStaff();
    }

    getInventory() {
        return managerObj.getInventory();
    }

    // Expose display methods for filtering
    displayBranches(branches) {
        managerDisplay.displayBranches(branches);
    }

    displayStaff(staff) {
        managerDisplay.displayStaff(staff);
    }

    displayInventory(inventory) {
        managerDisplay.displayInventory(inventory);
    }
}