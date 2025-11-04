// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const user = await checkAuth();
    if (!user || user.role !== 'Admin') {
        window.location.href = 'login.html';
        return;
    }
    
    updateUserInfo(user);
    await loadDashboardData();
    setupEventListeners();
});

async function loadDashboardData() {
    await Promise.all([
        loadStatsCards(),
        loadUsersTable(),
        loadBranchesTable()
    ]);
}

async function loadStatsCards() {
    const stats = await loadStats('Admin');
    
    if (stats.success) {
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card .value');
        if (statCards[0]) statCards[0].textContent = stats.stats.total_users || 0;
        if (statCards[1]) statCards[1].textContent = stats.stats.total_branches || 0;
        if (statCards[2]) statCards[2].textContent = stats.stats.active_users || 0;
        if (statCards[3]) {
            const inactiveUsers = (stats.stats.total_users || 0) - (stats.stats.active_users || 0);
            statCards[3].textContent = inactiveUsers;
        }
    }
}

async function loadUsersTable() {
    const usersData = await loadUsers();
    const tbody = document.querySelector('.data-table tbody');
    
    if (!tbody) return;
    
    if (!usersData.success) {
        showError(tbody.parentElement, usersData.message);
        return;
    }
    
    let html = '';
    usersData.users.forEach(user => {
        const statusClass = user.status === 'active' ? 'status-active' : 
                           user.status === 'inactive' ? 'status-inactive' : 'status-deactivated';
        
        html += `
            <tr>
                <td>${user.user_id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.role_name}</td>
                <td><span class="status-badge ${statusClass}">${user.status}</span></td>
                <td class="action-buttons">
                    <button class="action-btn edit" onclick="editUser(${user.user_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.user_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

async function loadBranchesTable() {
    const branchesData = await loadBranches();
    const tables = document.querySelectorAll('.data-table');
    const tbody = tables.length > 1 ? tables[1].querySelector('tbody') : null;
    
    if (!tbody) return;
    
    if (!branchesData.success) {
        showError(tbody.parentElement, branchesData.message);
        return;
    }
    
    let html = '';
    branchesData.branches.forEach(branch => {
        const statusClass = branch.status === 'active' ? 'status-active' : 'status-inactive';
        
        html += `
            <tr>
                <td>${branch.branch_id}</td>
                <td>${branch.branch_name}</td>
                <td>${branch.address}, ${branch.city}</td>
                <td>${branch.manager_name || 'Not Assigned'}</td>
                <td><span class="status-badge ${statusClass}">${branch.status}</span></td>
                <td class="action-buttons">
                    <button class="action-btn edit" onclick="editBranch(${branch.branch_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteBranch(${branch.branch_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function setupEventListeners() {
    // Search functionality
    const searchBoxes = document.querySelectorAll('.search-box');
    searchBoxes.forEach(box => {
        box.addEventListener('input', handleSearch);
    });
    
    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
    });
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const table = e.target.closest('.content-section').querySelector('.data-table tbody');
    
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleFilter(e) {
    const filterValue = e.target.value.toLowerCase();
    const table = e.target.closest('.content-section').querySelector('.data-table tbody');
    
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        if (!filterValue) {
            row.style.display = '';
            return;
        }
        
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
            const status = statusBadge.textContent.toLowerCase();
            row.style.display = status === filterValue ? '' : 'none';
        }
    });
}

function editUser(userId) {
    alert(`Edit user functionality for user ID: ${userId}`);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        alert(`Delete user functionality for user ID: ${userId}`);
    }
}

function editBranch(branchId) {
    alert(`Edit branch functionality for branch ID: ${branchId}`);
}

function deleteBranch(branchId) {
    if (confirm('Are you sure you want to delete this branch?')) {
        alert(`Delete branch functionality for branch ID: ${branchId}`);
    }
}