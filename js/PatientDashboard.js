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
