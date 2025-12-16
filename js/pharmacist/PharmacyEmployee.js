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
    
    container.innerHTML = `
        <table class="prescriptions-table">
            <thead>
                <tr>
                    <th>Prescription ID</th>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Medications</th>
                    <th>Qty</th>
                    <th>Refills</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${pharmPrescriptions.map(rx => `
                    <tr data-rx-id="${rx.prescriptionid}">
                        <td><span class="prescription-id">${rx.prescriptionid}</span></td>
                        <td><span class="prescription-date">${formatDate(rx.prescriptiondate)}</span></td>
                        <td><span class="prescription-doctor">${escapeHtml(rx.doctorname)}</span></td>
                        <td><span class="prescription-medications">${getMedicationsText(rx.medicines)}</span></td>
                        <td class="prescription-qty">${getTotalQuantity(rx.medicines)}</td>
                        <td class="prescription-refills">-</td>
                        <td><span class="prescription-status status-${rx.status.toLowerCase()}">${rx.status}</span></td>
                        <td class="prescription-actions">
                            <button class="btn btn-success" onclick="dispensePrescription('${rx.prescriptionid}')">
                                <i class="fas fa-pills"></i> Dispense
                            </button>
                            <button class="btn btn-warning" onclick="holdPrescription('${rx.prescriptionid}')">
                                <i class="fas fa-pause"></i> Hold
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getMedicationsText(medicines) {
    if (!medicines || medicines.length === 0) return '-';
    return medicines.map(med => escapeHtml(med.medicinename)).join(', ');
}

function getTotalQuantity(medicines) {
    if (!medicines || medicines.length === 0) return '-';
    const total = medicines.reduce((sum, med) => sum + (parseInt(med.prescribedqty) || 0), 0);
    return total;
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
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No dispensed prescriptions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = pharmDispensedHistory.map(record => {
        console.log('Rendering record:', record);
        const medicineLists = getMedicinesDispensedText(record);
        return `
            <tr>
                <td><strong>${record.prescriptionid || 'N/A'}</strong></td>
                <td>${escapeHtml(record.patientname || 'Unknown Patient')}</td>
                <td>${escapeHtml(record.doctorname || 'Unknown Doctor')}</td>
                <td class="medicines-dispensed">${medicineLists}</td>
                <td>${escapeHtml(record.pharmacistname || 'Pharmacist')}</td>
                <td>${formatDateTime(record.dispensedat || record.date_created)}</td>
            </tr>
        `;
    }).join('');
    
    console.log('=== RENDER COMPLETE ===');
}

function getMedicinesDispensedText(record) {
    // If the record has medicines array with dispensed quantities
    if (record.medicines && Array.isArray(record.medicines)) {
        return record.medicines
            .filter(med => med.dispensedqty && med.dispensedqty > 0)
            .map(med => `${escapeHtml(med.medicinename)} (${med.dispensedqty}x)`)
            .join(', ') || 'N/A';
    }
    
    // Fallback if stored differently
    if (record.medicine_name && record.dispensed_quantity) {
        return `${escapeHtml(record.medicine_name)} (${record.dispensed_quantity}x)`;
    }
    
    return 'Multiple items';
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
    openHoldModal(prescriptionId);
}

function openHoldModal(prescriptionId) {
    const rx = pharmPrescriptions.find(p => p.prescriptionid == prescriptionId);
    if (!rx) {
        alert('Prescription not found');
        return;
    }

    // Populate modal info
    document.getElementById('hold-rx-id').textContent = rx.prescriptionid;
    document.getElementById('hold-patient').textContent = `${rx.patientname} (${rx.patientid})`;
    document.getElementById('hold-doctor').textContent = rx.doctorname;
    document.getElementById('hold-date').textContent = formatDate(rx.prescriptiondate);

    // Display medicines
    const medicinesHtml = rx.medicines.map(med => `
        <div class="medicine-item-display">
            <span class="item-name">${escapeHtml(med.medicinename)}</span>
            <span class="item-qty">Qty: ${med.prescribedqty}</span>
        </div>
    `).join('');
    document.getElementById('holdMedicinesList').innerHTML = medicinesHtml;

    // Reset form
    document.getElementById('holdReason').value = '';
    document.getElementById('holdNotes').value = '';

    // Store prescription ID for submission
    document.getElementById('holdPrescriptionModal').dataset.prescriptionId = prescriptionId;

    // Show modal
    document.getElementById('holdPrescriptionModal').classList.add('show');
}

function closeHoldModal() {
    document.getElementById('holdPrescriptionModal').classList.remove('show');
}

async function submitHoldPrescription() {
    const prescriptionId = document.getElementById('holdPrescriptionModal').dataset.prescriptionId;
    const reason = document.getElementById('holdReason').value;
    const notes = document.getElementById('holdNotes').value;

    if (!reason) {
        alert('Please select a reason for holding this prescription');
        return;
    }

    if (!confirm('Are you sure you want to put this prescription on hold?')) {
        return;
    }

    try {
        showLoading(true);
        const response = await apiRequest(`${PHARMACYAPI}?action=holdPrescription`, {
            method: 'POST',
            body: JSON.stringify({
                prescriptionid: prescriptionId,
                reason: reason,
                notes: notes
            })
        });

        if (response.success) {
            alert('Prescription put on hold successfully!');
            await loadPrescriptions();
            closeHoldModal();
        } else {
            alert(`Error: ${response.message || 'Failed to hold prescription'}`);
        }
    } catch (error) {
        console.error('Error holding prescription:', error);
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
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
        document.querySelectorAll('.prescriptions-table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? 'table-row' : 'none';
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

// ===== PARTIAL DISPENSING MODAL FUNCTIONS =====

let currentDispensingPrescription = null;
let currentDispensingMedicines = [];

function openDispensingModal(prescriptionId) {
    // Find prescription in the list
    const prescription = pharmPrescriptions.find(rx => rx.prescriptionid === prescriptionId);
    
    if (!prescription) {
        alert('Prescription not found');
        return;
    }
    
    currentDispensingPrescription = prescription;
    currentDispensingMedicines = prescription.medicines || [];
    
    // Populate modal header info
    document.getElementById('dispensing-rx-id').textContent = `RX-${prescription.prescriptionid}`;
    document.getElementById('dispensing-patient').textContent = prescription.patientname;
    
    // Populate medicine list
    renderDispensingMedicinesList();
    
    // Load dispensing history
    loadDispensingHistory(prescriptionId);
    
    // Show modal
    const modal = document.getElementById('partialDispensingModal');
    modal.classList.add('show');
}

function closeDispensingModal() {
    const modal = document.getElementById('partialDispensingModal');
    modal.classList.remove('show');
    
    // Clear form
    document.getElementById('dispensingNotes').value = '';
    const inputs = document.querySelectorAll('.dispense-input');
    inputs.forEach(inp => inp.value = '');
    
    currentDispensingPrescription = null;
    currentDispensingMedicines = [];
}

function renderDispensingMedicinesList() {
    const container = document.getElementById('dispensingMedicinesList');
    
    if (!currentDispensingMedicines || currentDispensingMedicines.length === 0) {
        container.innerHTML = '<p>No medicines in this prescription</p>';
        return;
    }
    
    container.innerHTML = currentDispensingMedicines.map(med => {
        const remaining = med.remainingqty || med.prescribedqty;
        return `
        <div class="medicine-input-row" data-item-id="${med.itemid}" data-remaining="${remaining}" data-name="${escapeHtml(med.medicinename)}">
            <div class="medicine-input-info">
                <div class="item-name">${escapeHtml(med.medicinename)}</div>
                <div class="item-qty">
                    Prescribed: ${med.prescribedqty} | 
                    Dispensed: ${med.dispensedqty || 0} | 
                    Remaining: ${remaining}
                </div>
            </div>
            <div class="medicine-input-control">
                <label>Dispense now</label>
                <input type="number" class="dispense-input" min="0" max="${remaining}" placeholder="0" aria-label="Dispense ${escapeHtml(med.medicinename)}">
                <div class="input-hint">Max: ${remaining}</div>
            </div>
        </div>`;
    }).join('');
}

function loadDispensingHistory(prescriptionId) {
    const container = document.getElementById('dispensingHistoryList');
    container.innerHTML = '<p>Loading history...</p>';
    
    apiRequest(`${PHARMACYAPI}?action=getDispensingHistory`, {
        method: 'POST',
        body: JSON.stringify({ prescription_id: prescriptionId })
    })
    .then(response => {
        if (response.success && response.history && response.history.length > 0) {
            container.innerHTML = response.history.map(h => `
                <div class="history-item">
                    <div class="history-item-details">
                        <div class="history-medicine">${escapeHtml(h.medicine_name)}</div>
                        <div class="history-meta">
                            Dispensed by: ${escapeHtml(h.pharmacist_name)} | 
                            Date: ${formatDateTime(h.dispensed_date)}
                            ${h.notes ? `<br>Notes: ${escapeHtml(h.notes)}` : ''}
                        </div>
                    </div>
                    <div class="history-qty">+${h.quantity_dispensed}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-history">No dispensing history yet</div>';
        }
    })
    .catch(error => {
        console.error('Error loading history:', error);
        container.innerHTML = '<div class="empty-history">Error loading history</div>';
    });
}

async function submitPartialDispensing() {
    if (!currentDispensingPrescription) {
        alert('No prescription selected');
        return;
    }
    
    const rows = Array.from(document.querySelectorAll('.medicine-input-row'));
    const notesInput = document.getElementById('dispensingNotes');
    const toDispense = [];
    const errors = [];
    
    rows.forEach(row => {
        const input = row.querySelector('.dispense-input');
        const qty = parseInt(input.value || '0', 10);
        const remaining = parseInt(row.dataset.remaining, 10);
        const itemId = parseInt(row.dataset.itemId, 10);
        const name = row.dataset.name;
        
        if (qty > 0) {
            if (qty > remaining) {
                errors.push(`${name}: cannot dispense ${qty}; only ${remaining} remaining.`);
            } else {
                toDispense.push({ itemId, qty });
            }
        }
    });
    
    if (errors.length) {
        alert(errors.join('\n'));
        return;
    }
    
    if (toDispense.length === 0) {
        alert('Enter a quantity for at least one medicine.');
        return;
    }
    
    showLoading(true);
    try {
        for (const entry of toDispense) {
            const payload = {
                prescription_id: currentDispensingPrescription.prescriptionid,
                item_id: entry.itemId,
                quantity_to_dispense: entry.qty,
                notes: notesInput.value
            };
            const response = await apiRequest(`${PHARMACYAPI}?action=partialDispensing`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (!response.success) {
                throw new Error(response.message || 'Dispensing failed');
            }
        }
        alert('Dispensing recorded successfully.');
        await loadPrescriptions();
        closeDispensingModal();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error dispensing prescription: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Override the original dispensePrescription function to use modal
function dispensePrescription(prescriptionId) {
    openDispensingModal(prescriptionId);
}
