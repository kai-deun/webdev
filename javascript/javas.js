/* ============================================
   DATA STORAGE (In-Memory Database)
   ============================================ */
let users = [
    { id: 'U001', firstName: 'John', lastName: 'Smith', email: 'john.smith@hospital.com', username: 'drsmith', password: 'pass123', role: 'doctor', status: 'active', dateCreated: '2024-01-15' },
    { id: 'U002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@pharmacy.com', username: 'sarahjohnson', password: 'pass123', role: 'pharmacist', status: 'active', dateCreated: '2024-02-20' },
    { id: 'U003', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@pharmacy.com', username: 'mbrown', password: 'pass123', role: 'manager', status: 'active', dateCreated: '2024-03-10' },
    { id: 'U004', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@patient.com', username: 'emilydavis', password: 'pass123', role: 'patient', status: 'active', dateCreated: '2024-04-05' },
    { id: 'U005', firstName: 'David', lastName: 'Wilson', email: 'david.wilson@hospital.com', username: 'drwilson', password: 'pass123', role: 'doctor', status: 'inactive', dateCreated: '2024-05-12' }
];

let branches = [
    { id: 'B001', name: 'Main Branch', location: 'Downtown Medical Plaza', manager: 'Michael Brown', phone: '+1-555-0101', status: 'active', staffCount: 12, dateCreated: '2024-01-01' },
    { id: 'B002', name: 'North District Pharmacy', location: 'North Avenue, Suite 200', manager: 'Sarah Johnson', phone: '+1-555-0102', status: 'active', staffCount: 8, dateCreated: '2024-02-15' },
    { id: 'B003', name: 'Central Pharmacy', location: 'Central Business District', manager: 'Michael Brown', phone: '+1-555-0103', status: 'inactive', staffCount: 5, dateCreated: '2024-03-20' }
];

let nextUserId = 'U006';
let nextBranchId = 'B004';

/* ============================================
   PAGE NAVIGATION
   ============================================ */
function switchPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const page = document.getElementById(pageName + '-page');
    if (page) {
        page.classList.add('active');
    }

    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');

    // Load page data
    if (pageName === 'dashboard') {
        loadDashboard();
    } else if (pageName === 'users') {
        loadUsers();
    } else if (pageName === 'branches') {
        loadBranches();
    }
}

/* ============================================
   DASHBOARD PAGE
   ============================================ */
function loadDashboard() {
    const totalUsers = users.length;
    const totalBranches = branches.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status !== 'active').length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalBranches').textContent = totalBranches;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('inactiveUsers').textContent = inactiveUsers;
}

/* ============================================
   USER MANAGEMENT
   ============================================ */
function loadUsers() {
    displayUsers(users);
    populateManagerDropdown();
}

function displayUsers(usersToDisplay) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (usersToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found</td></tr>';
        return;
    }

    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${capitalizeFirst(user.role)}</span></td>
            <td><span class="badge badge-${user.status}">${capitalizeFirst(user.status)}</span></td>
            <td>${user.dateCreated}</td>
            <td>
                <div class="action-cell">
                    <button class="action-btn edit" onclick="editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteUser('${user.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    const roleFilter = document.getElementById('userRoleFilter').value;
    const statusFilter = document.getElementById('userStatusFilter').value;

    const filtered = users.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(searchTerm) || 
                            user.lastName.toLowerCase().includes(searchTerm) || 
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    displayUsers(filtered);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFirstName').value = user.firstName;
    document.getElementById('editUserLastName').value = user.lastName;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status;

    openModal('editUserModal');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        loadUsers();
        alert('User deleted successfully');
    }
}

// Add User Form
document.getElementById('addUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newUser = {
        id: nextUserId,
        firstName: document.getElementById('userFirstName').value,
        lastName: document.getElementById('userLastName').value,
        email: document.getElementById('userEmail').value,
        username: document.getElementById('userUsername').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        dateCreated: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    nextUserId = 'U' + (parseInt(nextUserId.substring(1)) + 1).toString().padStart(3, '0');

    closeModal('addUserModal');
    this.reset();
    loadUsers();
    alert('User added successfully');
});

// Edit User Form
document.getElementById('editUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].firstName = document.getElementById('editUserFirstName').value;
        users[userIndex].lastName = document.getElementById('editUserLastName').value;
        users[userIndex].email = document.getElementById('editUserEmail').value;
        users[userIndex].role = document.getElementById('editUserRole').value;
        users[userIndex].status = document.getElementById('editUserStatus').value;
    }

    closeModal('editUserModal');
    loadUsers();
    alert('User updated successfully');
});

/* ============================================
   BRANCH MANAGEMENT
   ============================================ */
function loadBranches() {
    displayBranches(branches);
    populateManagerDropdown();
}

function displayBranches(branchesToDisplay) {
    const tbody = document.getElementById('branchesTableBody');
    tbody.innerHTML = '';

    if (branchesToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No branches found</td></tr>';
        return;
    }

    branchesToDisplay.forEach(branch => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${branch.id}</td>
            <td>${branch.name}</td>
            <td>${branch.location}</td>
            <td>${branch.manager}</td>
            <td><span class="badge badge-${branch.status}">${capitalizeFirst(branch.status)}</span></td>
            <td>${branch.staffCount}</td>
            <td>${branch.dateCreated}</td>
            <td>
                <div class="action-cell">
                    <button class="action-btn edit" onclick="editBranch('${branch.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteBranch('${branch.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterBranches() {
    const searchTerm = document.getElementById('branchSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('branchStatusFilter').value;

    const filtered = branches.filter(branch => {
        const matchesSearch = branch.name.toLowerCase().includes(searchTerm) || 
                            branch.location.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || branch.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    displayBranches(filtered);
}

function editBranch(branchId) {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;

    document.getElementById('editBranchId').value = branch.id;
    document.getElementById('editBranchName').value = branch.name;
    document.getElementById('editBranchLocation').value = branch.location;
    document.getElementById('editBranchPhone').value = branch.phone;
    document.getElementById('editBranchManager').value = branch.manager;
    document.getElementById('editBranchStatus').value = branch.status;

    openModal('editBranchModal');
}

function deleteBranch(branchId) {
    if (confirm('Are you sure you want to delete this branch?')) {
        branches = branches.filter(b => b.id !== branchId);
        loadBranches();
        alert('Branch deleted successfully');
    }
}

function populateManagerDropdown() {
    const managers = users.filter(u => u.role === 'manager');
    
    const addBranchManager = document.getElementById('branchManager');
    const editBranchManager = document.getElementById('editBranchManager');

    [addBranchManager, editBranchManager].forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Manager</option>';
        
        managers.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager.firstName + ' ' + manager.lastName;
            option.textContent = manager.firstName + ' ' + manager.lastName;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

// Add Branch Form
document.getElementById('addBranchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newBranch = {
        id: nextBranchId,
        name: document.getElementById('branchName').value,
        location: document.getElementById('branchLocation').value,
        manager: document.getElementById('branchManager').value,
        phone: document.getElementById('branchPhone').value,
        status: document.getElementById('branchStatus').value,
        staffCount: 0,
        dateCreated: new Date().toISOString().split('T')[0]
    };

    branches.push(newBranch);
    nextBranchId = 'B' + (parseInt(nextBranchId.substring(1)) + 1).toString().padStart(3, '0');

    closeModal('addBranchModal');
    this.reset();
    loadBranches();
    alert('Branch added successfully');
});

// Edit Branch Form
document.getElementById('editBranchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const branchId = document.getElementById('editBranchId').value;
    const branchIndex = branches.findIndex(b => b.id === branchId);

    if (branchIndex !== -1) {
        branches[branchIndex].name = document.getElementById('editBranchName').value;
        branches[branchIndex].location = document.getElementById('editBranchLocation').value;
        branches[branchIndex].phone = document.getElementById('editBranchPhone').value;
        branches[branchIndex].manager = document.getElementById('editBranchManager').value;
        branches[branchIndex].status = document.getElementById('editBranchStatus').value;
    }

    closeModal('editBranchModal');
    loadBranches();
    alert('Branch updated successfully');
});

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully');
        window.location.href = '/';
    }
}

/* ============================================
   MODAL CLOSE ON BACKGROUND CLICK
   ============================================ */
window.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    loadDashboard();
});