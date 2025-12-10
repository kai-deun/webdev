// Renders manager data to the DOM
// Similar pattern to Displays.js

import { managerObj } from "./ManagerInstances.js";

export class ManagerDisplay {

    // Update statistics on dashboard
    updateStatistics() {
        const branches = managerObj.getBranches();
        const staff = managerObj.getStaff();
        const inventory = managerObj.getInventory();

        // Count statistics
        const branchCount = branches ? branches.length : 0;
        const staffCount = staff ? staff.length : 0;
        
        // Count unique products across all branches
        const uniqueProducts = inventory ? new Set(inventory.map(i => i.medicine_id)).size : 0;
        
        // Count low stock items
        const lowStockCount = inventory ? 
            inventory.filter(i => i.status === 'low_stock' || i.quantity <= i.reorder_level).length : 0;

        // Update DOM
        const managedBranchesStat = document.getElementById('managed-branches-stat');
        const totalStaffStat = document.getElementById('total-staff-stat');
        const totalProductsStat = document.getElementById('total-products-stat');
        const lowStockStat = document.getElementById('low-stock-stat');

        if (managedBranchesStat) managedBranchesStat.textContent = branchCount;
        if (totalStaffStat) totalStaffStat.textContent = staffCount;
        if (totalProductsStat) totalProductsStat.textContent = uniqueProducts;
        if (lowStockStat) lowStockStat.textContent = lowStockCount;
    }

    // USER STORY 2: Display branches
    displayBranches(branches = null) {
        const container = document.getElementById('branches-grid');
        const loading = document.getElementById('branches-loading');
        
        if (!container) return;

        if (loading) loading.style.display = 'block';

        const source = branches || managerObj.getBranches();

        if (loading) loading.style.display = 'none';

        if (!source || source.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">No branches found</p>';
            return;
        }

        container.innerHTML = source.map(branch => {
            const statusClass = branch.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = branch.status.replace('_', ' ').toUpperCase();
            
            return `
                <div class="branch-card">
                    <div class="branch-header">
                        <h3>${branch.branch_name}</h3>
                        <span class="branch-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="branch-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${branch.address || 'N/A'}</p>
                        <p><i class="fas fa-phone"></i> ${branch.phone_number || 'N/A'}</p>
                        <p><i class="fas fa-user"></i> Manager: ${branch.manager_name || 'Not Assigned'}</p>
                        <p><i class="fas fa-users"></i> Staff: ${branch.staff_count || 0} employees</p>
                        <p><i class="fas fa-pills"></i> Products: ${branch.product_count || 0} items</p>
                    </div>
                    <div class="branch-actions">
                        <button class="btn btn-primary js-edit-branch" data-branch-id="${branch.branch_id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-warning js-change-status" data-branch-id="${branch.branch_id}" data-current-status="${branch.status}">
                            <i class="fas fa-toggle-on"></i> Change Status
                        </button>
                        <button class="btn btn-danger js-delete-branch" data-branch-id="${branch.branch_id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.updateStatistics();
    }

    // USER STORY 3: Display staff
    displayStaff(staff = null) {
        const tbody = document.querySelector('#staff-table tbody');
        const loading = document.getElementById('staff-loading');
        
        if (!tbody) return;

        if (loading) loading.style.display = 'block';

        const source = staff || managerObj.getStaff();

        if (loading) loading.style.display = 'none';

        if (!source || source.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">No staff members found</td></tr>';
            return;
        }

        tbody.innerHTML = source.map(member => {
            const statusClass = member.status === 'active' ? 'status-active' : 'status-inactive';
            return `
                <tr>
                    <td>EMP${String(member.user_id).padStart(3, '0')}</td>
                    <td>${member.first_name} ${member.last_name}</td>
                    <td>${member.email}</td>
                    <td>${member.role_name || 'N/A'}</td>
                    <td>${member.branch_name || 'Not Assigned'}</td>
                    <td><span class="status-badge ${statusClass}">${member.status.toUpperCase()}</span></td>
                    <td class="action-buttons">
                        <button class="action-btn edit js-edit-staff" data-staff-id="${member.user_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete js-delete-staff" data-staff-id="${member.user_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateStatistics();
    }

    // USER STORY 1: Display inventory
    displayInventory(inventory = null) {
        const tbody = document.querySelector('#inventory-table tbody');
        const loading = document.getElementById('inventory-loading');
        
        if (!tbody) return;

        if (loading) loading.style.display = 'block';

        const source = inventory || managerObj.getInventory();

        if (loading) loading.style.display = 'none';

        if (!source || source.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#666;">No inventory items found</td></tr>';
            return;
        }

        tbody.innerHTML = source.map(item => {
            let stockClass = 'high';
            if (item.quantity <= 0) stockClass = 'low';
            else if (item.quantity <= item.reorder_level) stockClass = 'low';
            else if (item.quantity < item.reorder_level * 2) stockClass = 'medium';

            const statusClass = item.status === 'available' ? 'status-active' : 
                               item.status === 'low_stock' ? 'status-badge' : 'status-inactive';

            return `
                <tr>
                    <td>${item.medicine_name}</td>
                    <td>${item.generic_name || 'N/A'}</td>
                    <td>${item.branch_name}</td>
                    <td><span class="stock-level ${stockClass}">${item.quantity}</span></td>
                    <td>${item.reorder_level}</td>
                    <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${item.status.replace('_', ' ').toUpperCase()}</span></td>
                    <td class="action-buttons">
                        <button class="action-btn edit js-edit-inventory" data-inventory-id="${item.inventory_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn transfer js-transfer-inventory" data-inventory-id="${item.inventory_id}">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateStatistics();
    }

    // USER STORY 5: Display pending requests
    displayPendingRequests(requests = null) {
        const container = document.getElementById('pending-requests-list');
        const loading = document.getElementById('approvals-loading');
        
        if (!container) return;

        if (loading) loading.style.display = 'block';

        const source = requests || managerObj.getPendingRequests();

        if (loading) loading.style.display = 'none';

        if (!source || source.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">No pending requests</p>';
            return;
        }

        container.innerHTML = source.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <span class="request-type">${request.request_type.toUpperCase()}</span>
                        <span class="request-date">${new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="request-status pending">Pending</div>
                </div>
                <div class="request-details">
                    <p><strong>Requested by:</strong> ${request.requested_by_name || 'N/A'}</p>
                    <p><strong>Reason:</strong> ${request.reason || 'No reason provided'}</p>
                    <p><strong>Old Quantity:</strong> ${request.old_quantity || 'N/A'}</p>
                    <p><strong>New Quantity:</strong> ${request.new_quantity || 'N/A'}</p>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success js-approve-request" data-request-id="${request.request_id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger js-reject-request" data-request-id="${request.request_id}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Display approval history
    displayApprovalHistory(history = null) {
        const tbody = document.querySelector('#approval-history-table tbody');
        const loading = document.getElementById('history-loading');
        
        if (!tbody) return;

        if (loading) loading.style.display = 'block';

        const source = history || [];

        if (loading) loading.style.display = 'none';

        if (!source || source.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No approval history</td></tr>';
            return;
        }

        tbody.innerHTML = source.map(item => {
            const statusClass = item.status === 'approved' ? 'status-approved' : 'status-rejected';
            return `
                <tr>
                    <td>${new Date(item.approval_date || item.created_at).toLocaleDateString()}</td>
                    <td>${item.request_type.toUpperCase()}</td>
                    <td>${item.requested_by_name || 'N/A'}</td>
                    <td>${item.reason || 'N/A'}</td>
                    <td><span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span></td>
                    <td>${item.approved_by_name || 'N/A'}</td>
                </tr>
            `;
        }).join('');
    }

    // USER STORY 6: Display low-stock alerts
    displayLowStockAlerts(alerts = null) {
        const container = document.querySelector('#alerts-tab .alert-list');
        if (!container) return;

        const source = alerts || managerObj.getLowStockAlerts();

        if (!source || source.length === 0) {
            container.innerHTML = '<p class="no-alerts">✓ All stock levels are good!</p>';
            return;
        }

        container.innerHTML = source.map(alert => {
            let urgency = 'medium';
            if (alert.quantity === 0) urgency = 'critical';
            else if (alert.quantity < alert.reorder_level * 0.5) urgency = 'high';

            return `
                <div class="alert-card ${urgency}">
                    <div class="alert-header">
                        <span class="alert-icon">⚠️</span>
                        <span class="alert-urgency">${urgency.toUpperCase()}</span>
                    </div>
                    <h4>${alert.medicine_name}</h4>
                    <p>Branch: ${alert.branch_name}</p>
                    <p>Current: ${alert.quantity} | Reorder Level: ${alert.reorder_level}</p>
                    <button class="btn btn-primary js-order-stock" data-inventory-id="${alert.inventory_id}">
                        <i class="fas fa-cart-plus"></i> Order More
                    </button>
                </div>
            `;
        }).join('');
    }

    // USER STORY 7: Display brands
    displayBrands(brands = null) {
        const container = document.querySelector('.brands-container');
        if (!container) return;

        const source = brands || managerObj.getBrands();

        if (!source || source.length === 0) {
            container.innerHTML = '<p>No brands found</p>';
            return;
        }

        container.innerHTML = source.map(brand => `
            <div class="brand-card">
                <h4>${brand.brand_name}</h4>
                <p>Supplier: ${brand.supplier || 'N/A'}</p>
                <p>Products: ${brand.product_count || 0}</p>
                <button class="btn btn-secondary js-view-brand" data-brand-id="${brand.brand_id}">
                    View Details
                </button>
            </div>
        `).join('');
    }

    // USER STORY 8: Display performance metrics
    displayPerformanceMetrics(metrics = null) {
        const container = document.querySelector('.metrics-container');
        if (!container) return;

        const source = metrics || managerObj.getPerformanceMetrics();

        if (!source || source.length === 0) {
            container.innerHTML = '<p>No metrics available</p>';
            return;
        }

        container.innerHTML = source.map(metric => `
            <div class="metrics-card">
                <h4>${metric.branch_name}</h4>
                <div class="metrics-grid">
                    <div class="metric">
                        <span class="metric-label">Avg Dispensing Time</span>
                        <span class="metric-value">${metric.avg_dispensing_time || 0} min</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Daily Volume</span>
                        <span class="metric-value">${metric.daily_volume || 0} orders</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Monthly Volume</span>
                        <span class="metric-value">${metric.monthly_volume || 0} orders</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Performance Score</span>
                        <span class="metric-value">${metric.performance_score || 0}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}