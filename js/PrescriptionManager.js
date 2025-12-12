// loads patients, medicines, prescriptions and initializes events
import { prescriptUtils, eventBinder } from "./Instances.js";

class PrescriptionManager {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Initializing Doctor Dashboard...');
        
        try {
            // Check authentication first
            const user = await this.checkAuth();
            if (!user) {
                console.log('Auth failed, stopping initialization');
                return; // Auth failed, redirect already happened
            }

            // Load all initial data
            console.log('Loading doctor data for user:', user.username);
            prescriptUtils.loadPatients();
            prescriptUtils.loadMedicines();
            prescriptUtils.loadPrescriptions();
            prescriptUtils.setCurrentDate();
            this.loadDashboardStats();
            this.loadRenewals();
            eventBinder;
            
            console.log('Doctor Dashboard initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            // Don't redirect here, let checkAuth handle it
        }
    }

    async checkAuth() {
        try {
            // Use global checkAuth from common.js
            const user = await window.checkAuth();
            console.log('==== AUTH CHECK RESULT ====', user);
            console.log('User object:', JSON.stringify(user, null, 2));
            
            if (!user) {
                console.error('==== NO USER SESSION FOUND ====');
                alert('No user session found. Redirecting to login...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.href = 'login.html';
                return null;
            }
            
            // Check if user has proper role
            console.log('==== CHECKING USER ROLE ====', user.role);
            if (user.role !== 'Doctor' && user.role !== 'Admin') {
                console.error('==== ACCESS DENIED ==== User role:', user.role);
                alert('Access denied. This page is for Doctors only. Redirecting to login...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.href = 'login.html';
                return null;
            }
            
            console.log('==== USER AUTHENTICATED SUCCESSFULLY ====', user);
            window.updateUserInfo(user);
            return user;
        } catch (error) {
            console.error('==== AUTH ERROR ====', error);
            alert('Auth error: ' + error.message + '. Redirecting to login...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.href = 'login.html';
            return null;
        }
    }
}

// Update doctor dashboard stats cards
PrescriptionManager.prototype.loadDashboardStats = async function() {
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    try {
        const resp = await fetch('../php/prescription.php?action=getDoctorDashboardStats', {
            credentials: 'same-origin'
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!data.success) throw new Error(data.message || 'Failed to load stats');
        const stats = data.stats || {};
        setVal('patients-today-stat', stats.active_patients ?? 0);
        setVal('prescriptions-today-stat', stats.active_prescriptions ?? 0);
        setVal('appointments-stat', stats.pending_renewals ?? 0);
    } catch (err) {
        console.error('Failed to load doctor stats:', err);
    }
};

// Load and render renewal requests
PrescriptionManager.prototype.loadRenewals = async function() {
    const tableBody = document.querySelector('#renewals-table tbody');
    const countEl = document.getElementById('renewals-count');

    if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;color:#666;"><i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:10px;"></i><p>Loading renewal requests...</p></td></tr>';
    if (countEl) countEl.textContent = '0';

    try {
        const resp = await fetch('../php/prescription.php?action=getDoctorRenewals', {
            credentials: 'same-origin'
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!data.success) throw new Error(data.message || 'Failed to load renewals');

        const renewals = data.renewals || [];
        if (countEl) countEl.textContent = renewals.length;

        if (!tableBody) return;
        if (renewals.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;color:#999;"><i class="fas fa-check-circle" style="font-size:32px;color:#27ae60;margin-bottom:10px;"></i><p style="font-size:16px;margin:10px 0 0 0;">No renewal requests at this time</p></td></tr>';
            return;
        }

        const rows = renewals.map(r => {
            const statusClass = r.renewal_status === 'pending' ? 'status-active' : 
                               r.renewal_status === 'approved' ? 'status-completed' : 
                               'status-expired';
            const statusBadge = `<span class="status-badge ${statusClass}">${r.renewal_status || ''}</span>`;
            const requestDate = r.request_date ? new Date(r.request_date).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '-';
            const actions = r.renewal_status === 'pending'
                ? `<button class="btn btn-success btn-sm btn-approve" data-id="${r.renewal_id}" style="margin-right:5px;"><i class="fas fa-check"></i> Approve</button>
                   <button class="btn btn-danger btn-sm btn-reject" data-id="${r.renewal_id}"><i class="fas fa-times"></i> Reject</button>`
                : `<small style="color:#666;"><i class="fas fa-check-circle"></i> Reviewed</small>`;
            const notes = r.patient_notes ? (r.patient_notes.length > 50 ? r.patient_notes.substring(0, 50) + '...' : r.patient_notes) : '-';
            return `
                <tr>
                    <td><strong>#${r.renewal_id}</strong></td>
                    <td><i class="fas fa-user"></i> ${r.patient_name || ''}</td>
                    <td><i class="fas fa-prescription"></i> #${r.prescription_id}</td>
                    <td><small>${requestDate}</small></td>
                    <td><small>${notes.replace(/</g,'&lt;')}</small></td>
                    <td>${statusBadge}</td>
                    <td style="white-space:nowrap;">${actions}</td>
                </tr>`;
        }).join('');

        tableBody.innerHTML = rows;

        // Bind action buttons
        tableBody.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', () => this.updateRenewal(btn.dataset.id, 'approved'));
        });
        tableBody.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => this.updateRenewal(btn.dataset.id, 'rejected'));
        });
    } catch (err) {
        console.error('Failed to load renewals:', err);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:40px;color:#e74c3c;"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:10px;"></i><p>Error loading renewal requests</p></td></tr>`;
        if (countEl) countEl.textContent = '0';
    }
};

PrescriptionManager.prototype.updateRenewal = async function(renewalId, status) {
    if (!renewalId || !status) return;
    const confirmMsg = status === 'approved'
        ? 'Approve this renewal request?'
        : 'Reject this renewal request?';
    if (!confirm(confirmMsg)) return;

    try {
        const resp = await fetch('../php/prescription.php?action=updateRenewalStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ renewal_id: Number(renewalId), status })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!data.success) throw new Error(data.message || 'Failed to update renewal');
        alert('Renewal ' + status);
        this.loadRenewals();
        this.loadDashboardStats();
    } catch (err) {
        console.error('Failed to update renewal:', err);
        alert('Error updating renewal: ' + err.message);
    }
};

// Initialize the prescription manager when DOM is loaded
let prescriptionManager;
document.addEventListener('DOMContentLoaded', function() {
    prescriptionManager = new PrescriptionManager();
});
