// ============================================
// PHARMACY EMPLOYEE MODULE
// ============================================

const PHARMACYAPI = '../php/pharmacist.php';
const PRESCRIPTIONAPI = '../php/prescription.php';

let pharmPrescriptions = [];
let pharmInventory = [];
let pharmDispensedHistory = [];

// -------------------- Initialize --------------------
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadAllPharmacyData();
    attachEventHandlers();
});

// -------------------- Tab Management --------------------
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// -------------------- Data Loading --------------------
async function loadAllPharmacyData() {
    try {
        showLoading(true);
        await Promise.all([
            loadPrescriptions(),
            loadInventory(),
            loadDispensedHistory()
        ]);
        updateStatCards();
        showLoading(false);
    } catch (error) {
        console.error('Error loading pharmacy data:', error);
        alert(`Error loading data: ${error.message}`);
        showLoading(false);
    }
}

async function loadPrescriptions() {
    try {
        const response = await apiRequest(`${PHARMACYAPI}?action=getPendingPrescriptions`);
        if (response.success) {
            pharmPrescriptions = response.prescriptions || [];
            renderPrescriptionsList();
        }
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

async function loadInventory() {
    try {
        const response = await apiRequest(`${PHARMACYAPI}?action=getBranchInventory`);
        if (response.success) {
            pharmInventory = response.inventory || [];
            renderInventoryTable();
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

async function loadDispensedHistory() {
    try {
        const response = await apiRequest(`${PHARMACYAPI}?action=getDispensedToday`);
        console.log('Loaded dispensed history:', response);
        if (response.success) {
            pharmDispensedHistory = response.dispensed || response.prescriptions || [];
            console.log('pharmDispensedHistory:', pharmDispensedHistory);
            renderDispensedHistory();
        }
    } catch (error) {
        console.error('Error loading dispensed history:', error);
    }
}

// -------------------- Render Functions --------------------
function renderPrescriptionsList() {
    const container = document.querySelector('.pharm-pending-list');
    if (!container) return;
    
    if (pharmPrescriptions.length === 0) {
        container.innerHTML = '<div class="empty-state">No pending prescriptions</div>';
        return;
    }
    
    container.innerHTML = pharmPrescriptions.map(rx => `
        <div class="prescription-card" data-rx-id="${rx.prescriptionid}">
            <div class="prescription-header">
                <div class="prescription-info">
                    <div class="prescription-id">RX-${rx.prescriptionid}</div>
                    <div class="prescription-date">Date: ${formatDate(rx.prescriptiondate)}</div>
                </div>
                <div class="prescription-status status-${rx.status.toLowerCase()}">${rx.status}</div>
            </div>
            <div class="prescription-patient">
                <strong>Patient:</strong> ${escapeHtml(rx.patientname)} (${rx.patientid}) | 
                <strong>DOB:</strong> ${formatDate(rx.dateofbirth)}
            </div>
            <div class="prescription-doctor">
                <strong>Doctor:</strong> ${escapeHtml(rx.doctorname)}
            </div>
            <div class="prescription-medicines">
                <h4>Medicines:</h4>
                ${renderMedicineItems(rx.medicines)}
            </div>
            <div class="prescription-actions">
                <button class="btn btn-success" onclick="dispensePrescription('${rx.prescriptionid}')">
                    <i class="fas fa-check"></i> Dispense
                </button>
                <button class="btn btn-warning" onclick="holdPrescription('${rx.prescriptionid}')">
                    <i class="fas fa-times"></i> On Hold
                </button>
            </div>
        </div>
    `).join('');
}

function renderMedicineItems(medicines) {
    if (!medicines || medicines.length === 0) return '<p>No medicines listed</p>';
    
    return medicines.map(med => `
        <div class="medicine-item">
            <div class="medicine-details">
                <span class="medicine-name">${escapeHtml(med.medicinename)}</span>
                <span class="medicine-dosage">${escapeHtml(med.dosage || 'As prescribed')}</span>
                <span class="medicine-quantity">Quantity: ${med.prescribedqty}</span>
            </div>
        </div>
    `).join('');
}

function renderInventoryTable() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;
    
    if (pharmInventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No inventory data</td></tr>';
        return;
    }
    
    tbody.innerHTML = pharmInventory.map(item => `
        <tr data-inventory-id="${item.inventoryid}">
            <td>${escapeHtml(item.medicinename)}</td>
            <td>${escapeHtml(item.category || 'General')}</td>
            <td><span class="stock-level ${getStockLevelClass(item.quantity, item.reorderlevel)}">${item.quantity}</span></td>
            <td>${item.reorderlevel}</td>
            <td>${formatDate(item.expirydate)}</td>
            <td>$${parseFloat(item.unitprice || 0).toFixed(2)}</td>
            <td>${item.status || 'Available'}</td>
            <td class="action-buttons">
                <button class="action-btn edit" onclick="editInventoryItem('${item.inventoryid}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteInventoryItem('${item.inventoryid}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderDispensedHistory() {
    console.log('=== RENDER DISPENSED HISTORY ===');
    console.log('pharmDispensedHistory:', pharmDispensedHistory);
    console.log('Length:', pharmDispensedHistory.length);
    
    const tbody = document.querySelector('#dispensed-table tbody');
    console.log('Found tbody:', tbody);
    
    if (!tbody) {
        console.error('ERROR: Could not find #dispensed-table tbody');
        return;
    }
    
    if (pharmDispensedHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No dispensed prescriptions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = pharmDispensedHistory.map(record => {
        console.log('Rendering record:', record);
        return `
            <tr>
                <td>${record.prescriptionid || 'N/A'}</td>
                <td>${escapeHtml(record.patientname || 'Unknown Patient')}</td>
                <td>${escapeHtml(record.doctorname || 'Unknown Doctor')}</td>
                <td>${escapeHtml(record.pharmacistname || 'Pharmacist')}</td>
                <td>${formatDateTime(record.dispensedat || record.date_created)}</td>
            </tr>
        `;
    }).join('');
    
    console.log('=== RENDER COMPLETE ===');
}


// -------------------- Action Handlers --------------------
async function dispensePrescription(prescriptionId) {
    if (!confirm('Confirm dispensing this prescription?')) return;
    
    try {
        showLoading(true);
        const response = await apiRequest(`${PHARMACYAPI}?action=dispensePrescription`, {
            method: 'POST',
            body: JSON.stringify({
                prescriptionid: prescriptionId
            })
        });
        
        if (response.success) {
            alert('Prescription dispensed successfully!');
            await loadAllPharmacyData();
        } else {
            alert(`Error: ${response.message}`);
        }
        showLoading(false);
    } catch (error) {
        console.error('Error dispensing prescription:', error);
        alert(`Error dispensing prescription: ${error.message}`);
        showLoading(false);
    }
}

function holdPrescription(prescriptionId) {
    if (!confirm('Put this prescription on hold?')) return;
    alert('Prescription put on hold');
}

async function editInventoryItem(inventoryId) {
    const item = pharmInventory.find(i => i.inventoryid == inventoryId);
    if (!item) return;
    
    const newQty = prompt(`Update quantity for ${item.medicinename}\nCurrent: ${item.quantity}`, item.quantity);
    if (newQty === null || newQty === '') return;
    
    try {
        const response = await apiRequest(`${PHARMACYAPI}?action=updateInventory`, {
            method: 'POST',
            body: JSON.stringify({
                inventoryid: inventoryId,
                quantity: parseInt(newQty)
            })
        });
        
        if (response.success) {
            alert('Inventory updated successfully!');
            await loadInventory();
        }
    } catch (error) {
        alert(`Error updating inventory: ${error.message}`);
    }
}

function deleteInventoryItem(inventoryId) {
    if (!confirm('Are you sure?')) return;
    alert('Delete functionality pending');
}

// -------------------- Search/Filter --------------------
function attachEventHandlers() {
    // Refresh button
    const refreshBtn = document.getElementById('pharm-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAllPharmacyData);
    }
    
    // Search boxes
    const searchBoxes = document.querySelectorAll('.pharm-search');
    searchBoxes.forEach(box => {
        box.addEventListener('input', (e) => {
            const target = e.target.getAttribute('data-target');
            filterByTarget(target, e.target.value);
        });
    });
}

function filterByTarget(target, searchText) {
    const search = searchText.toLowerCase();
    
    if (target === 'pending') {
        document.querySelectorAll('.prescription-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(search) ? 'block' : 'none';
        });
    } else if (target === 'inventory') {
        document.querySelectorAll('#inventory-table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? 'table-row' : 'none';
        });
    } else if (target === 'dispensed') {
        document.querySelectorAll('#dispensed-table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? 'table-row' : 'none';
        });
    }
}

// -------------------- Stats Update --------------------
function updateStatCards() {
    const pending = pharmPrescriptions.length;
    const dispensedToday = pharmDispensedHistory.length;
    const lowStock = pharmInventory.filter(i => i.quantity <= i.reorderlevel).length;
    
    document.getElementById('pharm-stat-pending').textContent = pending;
    document.getElementById('pharm-stat-ready').textContent = '20';
    document.getElementById('pharm-stat-dispensed').textContent = dispensedToday;
    document.getElementById('pharm-stat-lowstock').textContent = lowStock;
}

// -------------------- Utility Functions --------------------
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

function showLoading(show) {
    const loader = document.querySelector('.pharm-loading');
    if (loader) loader.style.display = show ? 'block' : 'none';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US');
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US');
}

function getStockLevelClass(qty, reorder) {
    if (qty === 0) return 'out';
    if (qty <= reorder) return 'low';
    if (qty <= reorder * 1.5) return 'medium';
    return 'high';
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../html/login.html';
    }
}
