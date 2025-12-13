// Global modal functions for Pharmacy Manager
// These need to be global to be called from HTML onclick attributes

import { managerUtils, managerObj } from "./ManagerInstances.js";

// Store current IDs for edit/delete operations
let currentBranchId = null;
let currentStaffId = null;
let currentInventoryId = null;

// Add Branch Modal Functions
window.openAddBranchModal = function() {
    const modal = document.getElementById('add-branch-modal');
    modal.style.display = 'flex';
    // Clear form
    document.getElementById('add-branch-form').reset();
};

window.closeAddBranchModal = function() {
    const modal = document.getElementById('add-branch-modal');
    modal.style.display = 'none';
};

window.submitAddBranch = function() {
    const branchName = document.getElementById('branch-name').value.trim();
    const address = document.getElementById('branch-address').value.trim();
    const phoneNumber = document.getElementById('branch-phone').value.trim();
    
    // Validate required fields
    if (!branchName || !address || !phoneNumber) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Call the add branch utility function
    managerUtils.addBranch({
        branch_name: branchName,
        address: address,
        phone_number: phoneNumber,
        status: 'active'
    });
    
    // Close modal
    window.closeAddBranchModal();
};

// Edit Branch Modal Functions
window.openEditBranchModal = function(branchId) {
    currentBranchId = branchId;
    const branches = managerUtils.getBranches();
    const branch = branches.find(b => b.branch_id == branchId);
    
    if (!branch) {
        alert('Branch not found');
        return;
    }
    
    // Populate form with current branch data
    document.getElementById('edit-branch-name').value = branch.branch_name;
    document.getElementById('edit-branch-address').value = branch.address || '';
    document.getElementById('edit-branch-phone').value = branch.phone_number || '';
    
    // Show modal
    const modal = document.getElementById('edit-branch-modal');
    modal.style.display = 'flex';
};

window.closeEditBranchModal = function() {
    const modal = document.getElementById('edit-branch-modal');
    modal.style.display = 'none';
    currentBranchId = null;
};

window.submitEditBranch = function() {
    if (!currentBranchId) {
        alert('No branch selected for editing');
        return;
    }
    
    const branchName = document.getElementById('edit-branch-name').value.trim();
    const address = document.getElementById('edit-branch-address').value.trim();
    const phoneNumber = document.getElementById('edit-branch-phone').value.trim();
    
    // Validate required fields
    if (!branchName || !address || !phoneNumber) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Call the update branch utility function
    managerUtils.updateBranch(currentBranchId, {
        branch_name: branchName,
        address: address,
        phone_number: phoneNumber
    });
    
    // Close modal
    window.closeEditBranchModal();
};

// Change Status Modal Functions
window.openChangeStatusModal = function(branchId, currentStatus) {
    currentBranchId = branchId;
    
    // Populate current status
    document.getElementById('status-current').value = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
    document.getElementById('status-new').value = '';
    
    // Show modal
    const modal = document.getElementById('change-status-modal');
    modal.style.display = 'flex';
};

window.closeChangeStatusModal = function() {
    const modal = document.getElementById('change-status-modal');
    modal.style.display = 'none';
    currentBranchId = null;
};

window.submitChangeStatus = function() {
    if (!currentBranchId) {
        alert('No branch selected for status change');
        return;
    }
    
    const newStatus = document.getElementById('status-new').value;
    
    // Validate selection
    if (!newStatus) {
        alert('Please select a new status');
        return;
    }
    
    // Call the update branch status utility function
    managerUtils.updateBranchStatus(currentBranchId, newStatus);
    
    // Close modal
    window.closeChangeStatusModal();
};

// Delete Branch Modal Functions
window.openDeleteBranchModal = function(branchId) {
    currentBranchId = branchId;
    const branches = managerUtils.getBranches();
    const branch = branches.find(b => b.branch_id == branchId);
    
    if (!branch) {
        alert('Branch not found');
        return;
    }
    
    // Show branch name to confirm deletion
    document.getElementById('branch-to-delete-name').innerHTML = 
        `<strong>Branch:</strong> ${branch.branch_name}<br><strong>Address:</strong> ${branch.address || 'N/A'}`;
    
    // Show modal
    const modal = document.getElementById('delete-branch-modal');
    modal.style.display = 'flex';
};

window.closeDeleteBranchModal = function() {
    const modal = document.getElementById('delete-branch-modal');
    modal.style.display = 'none';
    currentBranchId = null;
};

window.submitDeleteBranch = function() {
    if (!currentBranchId) {
        alert('No branch selected for deletion');
        return;
    }
    
    // Call the delete branch utility function
    managerUtils.deleteBranch(currentBranchId);
    
    // Close modal
    window.closeDeleteBranchModal();
};

// Add Staff Modal Functions
window.openAddStaffModal = function() {
    const modal = document.getElementById('add-staff-modal');
    modal.style.display = 'flex';
    // Clear form
    document.getElementById('add-staff-form').reset();
    
    // Populate branch dropdown
    const branchSelect = document.getElementById('staff-branch');
    const branches = managerUtils.getBranches();
    
    // Clear existing options except the first one
    branchSelect.innerHTML = '<option value="">Select Branch</option>';
    
    branches.forEach(branch => {
        if (branch.status === 'active') {
            const option = document.createElement('option');
            option.value = branch.branch_id;
            option.textContent = branch.branch_name;
            branchSelect.appendChild(option);
        }
    });
};

window.closeAddStaffModal = function() {
    const modal = document.getElementById('add-staff-modal');
    modal.style.display = 'none';
};

window.submitAddStaff = function() {
    const firstName = document.getElementById('staff-first-name').value.trim();
    const lastName = document.getElementById('staff-last-name').value.trim();
    const email = document.getElementById('staff-email').value.trim();
    const username = document.getElementById('staff-username').value.trim();
    const password = document.getElementById('staff-password').value.trim();
    const phoneNumber = document.getElementById('staff-phone').value.trim();
    const branchId = document.getElementById('staff-branch').value;
    const role = document.getElementById('staff-role').value;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password || !branchId || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Call the add staff utility function
    managerUtils.addStaff({
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        password: password,
        phone_number: phoneNumber,
        branch_id: parseInt(branchId),
        role_name: role
    });
    
    // Close modal
    window.closeAddStaffModal();
};

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const branchModal = document.getElementById('add-branch-modal');
    const editBranchModal = document.getElementById('edit-branch-modal');
    const changeStatusModal = document.getElementById('change-status-modal');
    const deleteBranchModal = document.getElementById('delete-branch-modal');
    const staffModal = document.getElementById('add-staff-modal');
    const editStaffModal = document.getElementById('edit-staff-modal');
    const deleteStaffModal = document.getElementById('delete-staff-modal');
    const editInventoryModal = document.getElementById('edit-inventory-modal');
    const transferInventoryModal = document.getElementById('transfer-inventory-modal');
    const approveRequestModal = document.getElementById('approve-request-modal');
    const rejectRequestModal = document.getElementById('reject-request-modal');
    
    if (event.target === branchModal) {
        window.closeAddBranchModal();
    }
    if (event.target === editBranchModal) {
        window.closeEditBranchModal();
    }
    if (event.target === changeStatusModal) {
        window.closeChangeStatusModal();
    }
    if (event.target === deleteBranchModal) {
        window.closeDeleteBranchModal();
    }
    if (event.target === staffModal) {
        window.closeAddStaffModal();
    }
    if (event.target === editStaffModal) {
        window.closeEditStaffModal();
    }
    if (event.target === deleteStaffModal) {
        window.closeDeleteStaffModal();
    }
    if (event.target === editInventoryModal) {
        window.closeEditInventoryModal();
    }
    if (event.target === transferInventoryModal) {
        window.closeTransferInventoryModal();
    }
    if (event.target === approveRequestModal) {
        window.closeApproveRequestModal();
    }
    if (event.target === rejectRequestModal) {
        window.closeRejectRequestModal();
    }
});

// Close modal on Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const branchModal = document.getElementById('add-branch-modal');
        const editBranchModal = document.getElementById('edit-branch-modal');
        const changeStatusModal = document.getElementById('change-status-modal');
        const deleteBranchModal = document.getElementById('delete-branch-modal');
        const staffModal = document.getElementById('add-staff-modal');
        const editStaffModal = document.getElementById('edit-staff-modal');
        const deleteStaffModal = document.getElementById('delete-staff-modal');
        const editInventoryModal = document.getElementById('edit-inventory-modal');
        const transferInventoryModal = document.getElementById('transfer-inventory-modal');
        const approveRequestModal = document.getElementById('approve-request-modal');
        const rejectRequestModal = document.getElementById('reject-request-modal');
        
        if (branchModal.style.display === 'flex') {
            window.closeAddBranchModal();
        }
        if (editBranchModal.style.display === 'flex') {
            window.closeEditBranchModal();
        }
        if (changeStatusModal.style.display === 'flex') {
            window.closeChangeStatusModal();
        }
        if (deleteBranchModal.style.display === 'flex') {
            window.closeDeleteBranchModal();
        }
        if (staffModal.style.display === 'flex') {
            window.closeAddStaffModal();
        }
        if (editStaffModal.style.display === 'flex') {
            window.closeEditStaffModal();
        }
        if (deleteStaffModal.style.display === 'flex') {
            window.closeDeleteStaffModal();
        }
        if (editInventoryModal.style.display === 'flex') {
            window.closeEditInventoryModal();
        }
        if (transferInventoryModal.style.display === 'flex') {
            window.closeTransferInventoryModal();
        }
        if (approveRequestModal.style.display === 'flex') {
            window.closeApproveRequestModal();
        }
        if (rejectRequestModal.style.display === 'flex') {
            window.closeRejectRequestModal();
        }
    }
});

// Edit Staff Modal Functions
window.openEditStaffModal = function(staffId) {
    currentStaffId = staffId;
    const staff = managerUtils.getStaff();
    const staffMember = staff.find(s => s.user_id == staffId);
    
    if (!staffMember) {
        alert('Staff member not found');
        return;
    }
    
    // Populate form with current staff data
    document.getElementById('edit-staff-first-name').value = staffMember.first_name;
    document.getElementById('edit-staff-last-name').value = staffMember.last_name;
    document.getElementById('edit-staff-email').value = staffMember.email;
    document.getElementById('edit-staff-phone').value = staffMember.phone_number || '';
    
    // Populate branch dropdown
    const branchSelect = document.getElementById('edit-staff-branch');
    const branches = managerUtils.getBranches();
    branchSelect.innerHTML = '<option value="">Select Branch</option>';
    branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.branch_id;
        option.textContent = branch.branch_name;
        if (branch.branch_id == staffMember.branch_id) {
            option.selected = true;
        }
        branchSelect.appendChild(option);
    });
    
    // Set role
    document.getElementById('edit-staff-role').value = staffMember.role_name;
    
    // Show modal
    const modal = document.getElementById('edit-staff-modal');
    modal.style.display = 'flex';
};

window.closeEditStaffModal = function() {
    const modal = document.getElementById('edit-staff-modal');
    modal.style.display = 'none';
    currentStaffId = null;
};

window.submitEditStaff = function() {
    if (!currentStaffId) {
        alert('No staff member selected for editing');
        return;
    }
    
    const firstName = document.getElementById('edit-staff-first-name').value.trim();
    const lastName = document.getElementById('edit-staff-last-name').value.trim();
    const email = document.getElementById('edit-staff-email').value.trim();
    const phoneNumber = document.getElementById('edit-staff-phone').value.trim();
    const branchId = document.getElementById('edit-staff-branch').value;
    const role = document.getElementById('edit-staff-role').value;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !branchId || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Call the update staff utility function (you may need to implement this)
    managerUtils.updateStaff(currentStaffId, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        branch_id: parseInt(branchId),
        role_name: role
    });
    
    // Close modal
    window.closeEditStaffModal();
};

// Delete Staff Modal Functions
window.openDeleteStaffModal = function(staffId) {
    currentStaffId = staffId;
    const staff = managerUtils.getStaff();
    const staffMember = staff.find(s => s.user_id == staffId);
    
    if (!staffMember) {
        alert('Staff member not found');
        return;
    }
    
    // Show staff name to confirm deletion
    document.getElementById('staff-to-delete-name').innerHTML = 
        `<strong>${staffMember.first_name} ${staffMember.last_name}</strong><br><strong>Email:</strong> ${staffMember.email}`;
    
    // Show modal
    const modal = document.getElementById('delete-staff-modal');
    modal.style.display = 'flex';
};

window.closeDeleteStaffModal = function() {
    const modal = document.getElementById('delete-staff-modal');
    modal.style.display = 'none';
    currentStaffId = null;
};

window.submitDeleteStaff = function() {
    if (!currentStaffId) {
        alert('No staff member selected for deletion');
        return;
    }
    
    // Call the delete staff utility function
    managerUtils.deleteStaff(currentStaffId);
    
    // Close modal
    window.closeDeleteStaffModal();
};

// Edit Inventory Modal Functions
window.openEditInventoryModal = function(inventoryId) {
    currentInventoryId = inventoryId;
    const inventory = managerUtils.getInventory();
    const item = inventory.find(i => i.inventory_id == inventoryId);
    
    if (!item) {
        alert('Inventory item not found');
        return;
    }
    
    // Populate form with current inventory data
    document.getElementById('edit-medicine-name').value = item.medicine_name;
    document.getElementById('edit-generic-name').value = item.generic_name || '';
    document.getElementById('edit-current-quantity').value = item.quantity;
    document.getElementById('edit-new-quantity').value = item.quantity;
    document.getElementById('edit-reorder-level').value = item.reorder_level;
    document.getElementById('edit-unit-price').value = parseFloat(item.unit_price).toFixed(2);
    
    // Show modal
    const modal = document.getElementById('edit-inventory-modal');
    modal.style.display = 'flex';
};

window.closeEditInventoryModal = function() {
    const modal = document.getElementById('edit-inventory-modal');
    modal.style.display = 'none';
    currentInventoryId = null;
};

window.submitEditInventory = function() {
    if (!currentInventoryId) {
        alert('No inventory item selected for editing');
        return;
    }
    
    const newQuantity = document.getElementById('edit-new-quantity').value;
    const reorderLevel = document.getElementById('edit-reorder-level').value;
    const unitPrice = document.getElementById('edit-unit-price').value;
    
    // Validate required fields
    if (!newQuantity || newQuantity < 0 || !reorderLevel || reorderLevel < 0 || !unitPrice || unitPrice < 0) {
        alert('Please enter valid values for all fields');
        return;
    }
    
    // Call the update inventory utility function
    managerUtils.updateInventory(currentInventoryId, {
        quantity: parseInt(newQuantity),
        reorder_level: parseInt(reorderLevel),
        unit_price: parseFloat(unitPrice)
    });
    
    // Close modal
    window.closeEditInventoryModal();
};

// Transfer Inventory Modal Functions
window.openTransferInventoryModal = function(inventoryId) {
    currentInventoryId = inventoryId;
    const inventory = managerUtils.getInventory();
    const item = inventory.find(i => i.inventory_id == inventoryId);
    
    if (!item) {
        alert('Inventory item not found');
        return;
    }
    
    // Populate form with current inventory data
    document.getElementById('transfer-medicine-name').value = item.medicine_name;
    document.getElementById('transfer-from-branch').value = item.branch_name;
    document.getElementById('transfer-available-qty').value = item.quantity;
    document.getElementById('transfer-quantity').value = '';
    
    // Populate target branch dropdown (exclude current branch)
    const branchSelect = document.getElementById('transfer-to-branch');
    const branches = managerUtils.getBranches();
    branchSelect.innerHTML = '<option value="">Select Branch</option>';
    branches.forEach(branch => {
        if (branch.branch_id != item.branch_id) {
            const option = document.createElement('option');
            option.value = branch.branch_id;
            option.textContent = branch.branch_name;
            branchSelect.appendChild(option);
        }
    });
    
    // Show modal
    const modal = document.getElementById('transfer-inventory-modal');
    modal.style.display = 'flex';
};

window.closeTransferInventoryModal = function() {
    const modal = document.getElementById('transfer-inventory-modal');
    modal.style.display = 'none';
    currentInventoryId = null;
};

window.submitTransferInventory = function() {
    if (!currentInventoryId) {
        alert('No inventory item selected for transfer');
        return;
    }
    
    const toBranch = document.getElementById('transfer-to-branch').value;
    const quantity = document.getElementById('transfer-quantity').value;
    const availableQty = parseInt(document.getElementById('transfer-available-qty').value);
    
    // Validate required fields
    if (!toBranch) {
        alert('Please select a destination branch');
        return;
    }
    
    if (!quantity || quantity < 1) {
        alert('Please enter a valid quantity to transfer');
        return;
    }
    
    if (parseInt(quantity) > availableQty) {
        alert(`Cannot transfer more than ${availableQty} units available`);
        return;
    }
    
    // Call the transfer inventory utility function
    managerUtils.transferInventory(currentInventoryId, {
        to_branch_id: parseInt(toBranch),
        quantity: parseInt(quantity)
    });
    
    // Close modal
    window.closeTransferInventoryModal();
};

// Approve Request Modal Functions
let currentRequestId = null;

window.openApproveRequestModal = function(requestId) {
    currentRequestId = parseInt(requestId);
    const modal = document.getElementById('approve-request-modal');
    const requests = managerObj.getPendingRequests ? managerObj.getPendingRequests() : [];
    const request = requests.find(r => r.request_id == currentRequestId);
    
    if (request) {
        let details = `<strong>${request.request_type.toUpperCase()}</strong><br>`;
        details += `<strong>Requested by:</strong> ${request.requested_by_name || 'N/A'}<br>`;
        details += `<strong>Reason:</strong> ${request.reason || 'No reason provided'}<br>`;
        if (request.old_quantity && request.new_quantity) {
            details += `<strong>Change:</strong> ${request.old_quantity} → ${request.new_quantity}`;
        }
        document.getElementById('approve-request-details').innerHTML = details;
    }
    
    modal.style.display = 'flex';
};

window.closeApproveRequestModal = function() {
    const modal = document.getElementById('approve-request-modal');
    modal.style.display = 'none';
    currentRequestId = null;
};

window.submitApproveRequest = function() {
    if (!currentRequestId) {
        alert('Error: Request ID not found');
        return;
    }
    
    managerUtils.approveRequest(currentRequestId);
    window.closeApproveRequestModal();
};

// Reject Request Modal Functions
window.openRejectRequestModal = function(requestId) {
    currentRequestId = parseInt(requestId);
    const modal = document.getElementById('reject-request-modal');
    document.getElementById('reject-request-form').reset();
    modal.style.display = 'flex';
};

window.closeRejectRequestModal = function() {
    const modal = document.getElementById('reject-request-modal');
    modal.style.display = 'none';
    currentRequestId = null;
};

window.submitRejectRequest = function() {
    if (!currentRequestId) {
        alert('Error: Request ID not found');
        return;
    }
    
    const reason = document.getElementById('reject-reason').value.trim();
    
    if (!reason) {
        alert('Please enter a rejection reason');
        return;
    }
    
    managerUtils.rejectRequest(currentRequestId, reason);
    window.closeRejectRequestModal();
};
