// Patient dashboard data wiring
(async function initPatientDashboard() {
    try {
        const user = await checkAuth();
        if (!user) {
            window.location.href = './login.html';
            return;
        }

        updateUserInfo(user);
        const identifier = document.getElementById('patient-identifier');
        if (identifier) {
            const suffix = user.username ? ` (${user.username})` : '';
            identifier.textContent = suffix;
        }

        await loadDashboardStats();
    } catch (err) {
        console.error('Patient dashboard init failed:', err);
    }
})();

async function loadPrescriptions() {
    const search = document.getElementById('prescription-search').value;
    const status = document.getElementById('prescription-status-filter').value;
    const loadingEl = document.getElementById('prescriptions-loading');
    
    if (loadingEl) loadingEl.style.display = 'block';

    try {
        // Construct URL with filter parameters
        let url = `../php/prescription.php?action=getPrescriptions&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
        
        // If a patient ID is stored in the session/user object, append it
        if (window.currentUser && window.currentUser.patient_id) {
            url += `&patient_id=${window.currentUser.patient_id}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderPrescriptionsTable(data.prescriptions);
        }
    } catch (err) {
        console.error('Failed to load prescriptions:', err);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

async function loadMedicalHistory() {
    const search = document.getElementById('history-search').value;
    const type = document.getElementById('history-type-filter').value;
    const patientId = window.currentUser?.patient_id;

    if (!patientId) return;

    try {
        let url = `../php/prescription.php?action=getMedicalHistory&patient_id=${patientId}&search=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderMedicalHistoryTable(data.records);
        }
    } catch (err) {
        console.error('Failed to load medical history:', err);
    }
}

// Initialize listeners when the dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('prescription-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', loadPrescriptions);
    }

    // Optional: Trigger search on "Enter" key in the search box
    const searchInput = document.getElementById('prescription-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadPrescriptions();
        });
    }
});

async function loadDashboardStats() {
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    try {
        const response = await fetch('../php/prescription.php?action=getPatientDashboardStats', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load stats');
        }

        const stats = data.stats || {};
        setValue('active-prescriptions-stat', stats.active_prescriptions ?? 0);
        setValue('upcoming-refills-stat', stats.upcoming_refills ?? 0);
        setValue('medical-records-stat', stats.medical_records ?? 0);
        setValue('pending-requests-stat', stats.pending_requests ?? 0);
    } catch (err) {
        console.error('Failed to load patient stats:', err);
    }
}
