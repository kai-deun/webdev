// ============================================
// PHARMACY EMPLOYEE UTILITIES
// Helper functions for pharmacy employee module
// ============================================

// -------------------- HTML Sanitization --------------------
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// -------------------- Date/Time Utilities --------------------
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function isExpiringSoon(expiryDate, daysThreshold = 30) {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= daysThreshold;
}

function isExpired(expiryDate) {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
}

// -------------------- Status Badge Helpers --------------------
function getStatusBadge(status) {
    const statusLower = (status || '').toLowerCase();
    const badges = {
        'pending': { label: 'Pending', class: 'status-pending' },
        'active': { label: 'Active', class: 'status-active' },
        'ready': { label: 'Ready for Pickup', class: 'status-ready' },
        'dispensed': { label: 'Dispensed', class: 'status-dispensed' },
        'cancelled': { label: 'Cancelled', class: 'status-cancelled' },
        'expired': { label: 'Expired', class: 'status-expired' }
    };
    
    const badge = badges[statusLower] || { label: status, class: 'status-default' };
    return `<span class="badge ${badge.class}">${escapeHtml(badge.label)}</span>`;
}

function getStockLevelClass(quantity, reorderLevel) {
    const qty = parseInt(quantity) || 0;
    const reorder = parseInt(reorderLevel) || 0;
    
    if (qty === 0) return 'stock-out';
    if (qty <= reorder) return 'stock-low';
    if (qty <= reorder * 1.5) return 'stock-medium';
    return 'stock-high';
}

function getStockLevelBadge(quantity, reorderLevel) {
    const qty = parseInt(quantity) || 0;
    const reorder = parseInt(reorderLevel) || 0;
    const levelClass = getStockLevelClass(qty, reorder);
    
    const labels = {
        'stock-out': 'Out of Stock',
        'stock-low': 'Low Stock',
        'stock-medium': 'Medium',
        'stock-high': 'In Stock'
    };
    
    return `<span class="badge ${levelClass}">${labels[levelClass]}</span>`;
}

// -------------------- Search/Filter Utilities --------------------
function filterBySearchText(items, searchText, fields) {
    if (!searchText || searchText.trim() === '') return items;
    
    const search = searchText.trim().toLowerCase();
    return items.filter(item => {
        const haystack = fields
            .map(field => String(item[field] || ''))
            .join(' ')
            .toLowerCase();
        return haystack.includes(search);
    });
}

function sortByField(items, field, ascending = true) {
    return [...items].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        const comparison = valA < valB ? -1 : 1;
        return ascending ? comparison : -comparison;
    });
}

// -------------------- Statistics Helpers --------------------
function calculatePrescriptionStats(prescriptions) {
    const stats = {
        pending: 0,
        ready: 0,
        dispensed: 0,
        total: prescriptions.length
    };
    
    prescriptions.forEach(p => {
        const status = (p.status || '').toLowerCase();
        if (status === 'pending' || status === 'active') stats.pending++;
        else if (status === 'ready') stats.ready++;
        else if (status === 'dispensed') stats.dispensed++;
    });
    
    return stats;
}

function calculateInventoryStats(inventory) {
    const stats = {
        total: inventory.length,
        lowStock: 0,
        outOfStock: 0,
        expiringSoon: 0,
        expired: 0
    };
    
    inventory.forEach(item => {
        const qty = parseInt(item.quantity) || 0;
        const reorder = parseInt(item.reorderlevel) || 0;
        
        if (qty === 0) stats.outOfStock++;
        else if (qty <= reorder) stats.lowStock++;
        
        if (isExpired(item.expirydate)) stats.expired++;
        else if (isExpiringSoon(item.expirydate)) stats.expiringSoon++;
    });
    
    return stats;
}

// -------------------- UI Update Helpers --------------------
function updateStatDisplay(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('notification-show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showConfirmDialog(message) {
    return confirm(message);
}

function showLoadingOverlay(show = true) {
    const overlay = document.querySelector('.pharm-loading');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// -------------------- Tab Management --------------------
function initializeTabs(tabButtonSelector, tabContentSelector) {
    const tabButtons = document.querySelectorAll(tabButtonSelector);
    const tabContents = document.querySelectorAll(tabContentSelector);
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active from all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

// -------------------- Table Utilities --------------------
function createTableRow(data, columns) {
    const tr = document.createElement('tr');
    
    columns.forEach(col => {
        const td = document.createElement('td');
        if (typeof col.render === 'function') {
            td.innerHTML = col.render(data[col.field], data);
        } else {
            td.textContent = data[col.field] || '';
        }
        tr.appendChild(td);
    });
    
    return tr;
}

function renderEmptyState(container, message, colspan = 5) {
    container.innerHTML = `
        <tr>
            <td colspan="${colspan}" class="empty-state">
                <div class="empty-icon">📋</div>
                <p>${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
}

// -------------------- API Helpers --------------------
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

async function apiGet(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return apiRequest(fullUrl, { method: 'GET' });
}

async function apiPost(url, data) {
    return apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// -------------------- Prescription Formatting --------------------
function formatMedicineList(medicines) {
    if (!medicines) return 'N/A';
    if (Array.isArray(medicines)) {
        return medicines.map(m => m.medicinename || m).join(', ');
    }
    return String(medicines);
}

function formatPrescriptionId(id) {
    return `RX-${String(id).padStart(6, '0')}`;
}

function formatDosageInstruction(item) {
    const parts = [];
    if (item.dosage) parts.push(item.dosage);
    if (item.frequency) parts.push(item.frequency);
    if (item.duration) parts.push(`for ${item.duration}`);
    return parts.join(', ') || 'As prescribed';
}

// -------------------- Validation Helpers --------------------
function validatePrescriptionId(id) {
    return id && !isNaN(parseInt(id));
}

function validateStatus(status) {
    const validStatuses = ['pending', 'active', 'ready', 'dispensed', 'cancelled', 'expired'];
    return validStatuses.includes((status || '').toLowerCase());
}

// -------------------- Export --------------------
// If using modules, export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        formatDateTime,
        formatDate,
        isExpiringSoon,
        isExpired,
        getStatusBadge,
        getStockLevelClass,
        getStockLevelBadge,
        filterBySearchText,
        sortByField,
        calculatePrescriptionStats,
        calculateInventoryStats,
        updateStatDisplay,
        showNotification,
        showConfirmDialog,
        showLoadingOverlay,
        initializeTabs,
        createTableRow,
        renderEmptyState,
        apiRequest,
        apiGet,
        apiPost,
        formatMedicineList,
        formatPrescriptionId,
        formatDosageInstruction,
        validatePrescriptionId,
        validateStatus
    };
}
