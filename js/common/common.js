// API calls and small utilities used by Doctor page

// API base URL
const API_BASE = '../php/api.php';
const AUTH_API = '../php/auth.php';

// Check if user is logged in
async function checkAuth() {
    try {
        console.log('checkAuth: Fetching current user...');
        const response = await fetch(`${AUTH_API}?action=getCurrentUser`, {
            credentials: 'same-origin'
        });
        
        console.log('checkAuth: Response status:', response.status);
        
        if (!response.ok) {
            console.log('checkAuth: Response not OK');
            return null;
        }
        
        const data = await response.json();
        console.log('checkAuth: Data received:', data);
        
        if (!data.success || !data.user) {
            console.log('checkAuth: No user in response');
            return null;
        }
        
        console.log('checkAuth: User found:', data.user.username);
        return data.user;
    } catch (error) {
        console.error('checkAuth: Exception occurred:', error);
        return null;
    }
}

// Update user info in header
function updateUserInfo(user) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');
    
    if (userNameEl && user) {
        userNameEl.textContent = user.full_name;
    }
    if (userRoleEl && user) {
        userRoleEl.textContent = user.role;
    }
    if (userAvatarEl && user) {
        const initials = user.full_name.split(' ').map(n => n[0]).join('');
        userAvatarEl.textContent = initials;
    }
}

// API call helper
async function apiCall(action, params = {}, method = 'GET') {
    try {
        let url = `${API_BASE}?action=${action}`;
        let options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (method === 'GET') {
            Object.keys(params).forEach(key => {
                url += `&${key}=${encodeURIComponent(params[key])}`;
            });
        } else {
            options.body = JSON.stringify(params);
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return { success: false, message: error.message };
    }
}

// Load users
async function loadUsers(filters = {}) {
    return await apiCall('getUsers', filters);
}

// Load branches
async function loadBranches() {
    return await apiCall('getBranches');
}

// Load inventory
async function loadInventory(branchId = null) {
    const params = branchId ? { branch_id: branchId } : {};
    return await apiCall('getInventory', params);
}

// Load prescriptions
async function loadPrescriptions(filters = {}) {
    return await apiCall('getPrescriptions', filters);
}

// Load patients
async function loadPatients() {
    return await apiCall('getPatients');
}

// Load medicines
async function loadMedicines() {
    return await apiCall('getMedicines');
}

// Load statistics
async function loadStats(role) {
    return await apiCall('getStats', { role });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// Show loading indicator
function showLoading(element) {
    if (element) {
        element.innerHTML = '<p class="loading">Loading...</p>';
    }
}

// Show error message
function showError(element, message) {
    if (element) {
        element.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
}

// Show success message
function showSuccess(message) {
    alert(message); // Simple implementation, can be enhanced with toast notifications
}

// Calculate age from date of birth
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Logout function
async function logout() {
    try {
        const response = await fetch(`${AUTH_API}?action=logout`);
        // Always redirect to login.html regardless of response
        window.location.href = './login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = './login.html';
    }
}

// Handle logout button click
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        await logout();
    }
}