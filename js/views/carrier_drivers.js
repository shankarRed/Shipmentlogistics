/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Driver Management (US-67 to US-69)
 * Driver roster, Add / Edit driver, duty status toggle, assignment history
 */

const CarrierDriversView = {
  statusFilter: 'all',
  searchQuery: '',

  render() {
    const store = window.BRIDGES_STORE;
    const drivers = store.getCarrierDrivers();
    const availableCount = drivers.filter(d => d.status === 'Available').length;
    const assignedCount = drivers.filter(d => d.status === 'Assigned' || d.status === 'In Transit').length;
    const offDutyCount = drivers.filter(d => d.status === 'Off Duty' || d.status === 'Inactive').length;

    return `
      <div class="carrier-drivers-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Driver Roster &amp; Availability &bull; Bridges Global Logistics</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Manage qualified CDL drivers, duty status, and recovery assignments.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="CarrierDriversView.openAddDriverModal()" style="font-weight: 700; background: #18217E;">
            ${Icons.steeringWheel(14)} Add New Driver
          </button>
        </div>

        <!-- Filter & Search Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <!-- Status Filters -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierDriversView.setStatusFilter('all')">
              All Drivers (${drivers.length})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Available' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierDriversView.setStatusFilter('Available')">
              Available (${availableCount})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Assigned' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierDriversView.setStatusFilter('Assigned')">
              Assigned / In Transit (${assignedCount})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Off Duty' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierDriversView.setStatusFilter('Off Duty')">
              Off Duty (${offDutyCount})
            </button>
          </div>

          <!-- Search Input -->
          <div style="position: relative; width: 250px;">
            <input type="text" id="carrier-driver-search" placeholder="Search driver name, ID, phone..." value="${this.searchQuery}" oninput="CarrierDriversView.handleSearch(this.value)" class="carrier-form-input" style="padding: 6px 10px 6px 28px; font-size: 12px;">
            <span style="position: absolute; left: 9px; top: 7px; color: #8A9995;">${Icons.search(13)}</span>
          </div>
        </div>

        <!-- Drivers Table Container -->
        <div id="carrier-drivers-table-container">
          ${this.renderTableContent()}
        </div>
      </div>
    `;
  },

  setStatusFilter(filter) {
    this.statusFilter = filter;
    const container = document.getElementById('carrier-drivers-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  handleSearch(q) {
    this.searchQuery = q;
    const container = document.getElementById('carrier-drivers-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  getFilteredDrivers() {
    const store = window.BRIDGES_STORE;
    let list = store.getCarrierDrivers();

    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'Assigned') {
        list = list.filter(d => d.status === 'Assigned' || d.status === 'In Transit');
      } else if (this.statusFilter === 'Off Duty') {
        list = list.filter(d => d.status === 'Off Duty' || d.status === 'Inactive');
      } else {
        list = list.filter(d => d.status === this.statusFilter);
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.phone && d.phone.toLowerCase().includes(q)) ||
        (d.licenseClass && d.licenseClass.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTableContent() {
    const drivers = this.getFilteredDrivers();

    if (drivers.length === 0) {
      return `
        <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
          <div class="carrier-empty-icon">${Icons.steeringWheel(26)}</div>
          <div class="carrier-empty-title">No Drivers Found</div>
          <p class="carrier-empty-desc">
            No driver records match the active filter or search query. Click "Add New Driver" to add one to the roster.
          </p>
        </div>
      `;
    }

    return `
      <div class="carrier-card-section" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
            <thead style="background: #F8FAFB;">
              <tr>
                <th style="padding: 11px 14px;">Driver ID</th>
                <th>Full Name</th>
                <th>Contact Phone</th>
                <th>License Qualification</th>
                <th>Current Status</th>
                <th>Assigned Vehicle</th>
                <th>Active Recovery</th>
                <th style="text-align: right; padding-right: 14px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${drivers.map(d => {
                let badgeClass = 'carrier-badge-available';
                if (d.status === 'Assigned') badgeClass = 'carrier-badge-assigned';
                if (d.status === 'In Transit') badgeClass = 'carrier-badge-transit';
                if (d.status === 'Off Duty') badgeClass = 'carrier-badge-inactive';
                if (d.status === 'Inactive') badgeClass = 'carrier-badge-inactive';

                return `
                  <tr>
                    <td style="padding: 11px 14px;">
                      <span style="font-weight: 700; color: #18217E;">${d.id}</span>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #070724;">${d.name}</div>
                    </td>
                    <td>
                      <span style="color: #393A50; font-family: monospace;">${d.phone || '+1 (555) 234-5678'}</span>
                    </td>
                    <td>
                      <span style="font-size: 11px; font-weight: 600; background: #EEF2FF; color: #18217E; padding: 2px 6px; border-radius: 4px;">
                        ${d.licenseClass || 'CDL-A (HazMat)'}
                      </span>
                    </td>
                    <td>
                      <span class="carrier-badge ${badgeClass}">
                        ${d.status}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 11.5px; color: #070724; font-weight: 500;">
                        ${d.currentVehicle || 'None'}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 11px; color: ${d.currentAssignment ? '#18217E' : '#8A9995'}; font-weight: ${d.currentAssignment ? '700' : '500'};">
                        ${d.currentAssignment || 'None &bull; Standby'}
                      </span>
                    </td>
                    <td style="text-align: right; padding-right: 14px; white-space: nowrap;">
                      <button class="btn btn-secondary btn-sm" onclick="CarrierDriversView.openEditDriverModal('${d.id}')" style="padding: 3px 8px; font-size: 11px; font-weight: 600; margin-right: 4px;">
                        Edit
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="CarrierDriversView.openHistoryModal('${d.id}')" style="padding: 3px 8px; font-size: 11px; font-weight: 600;" title="View Assignment History">
                        History
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openAddDriverModal() {
    UI.openModal('generic-app-modal', 'Register New Carrier Driver', `
      <div style="padding: 6px 0;">
        <form id="carrier-driver-form" onsubmit="event.preventDefault(); CarrierDriversView.submitDriverForm();">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="d-name">Driver Full Name: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="d-name" class="carrier-form-input" placeholder="e.g. Marcus Vance" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="d-phone">Contact Phone: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="d-phone" class="carrier-form-input" placeholder="e.g. +1 (555) 782-9912" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="d-license">CDL License Class:</label>
              <select id="d-license" class="carrier-form-select">
                <option value="CDL-A (HazMat &amp; Tanker)">CDL-A (HazMat &amp; Tanker)</option>
                <option value="CDL-A (Standard Combination)">CDL-A (Standard Combination)</option>
                <option value="CDL-B (Heavy Straight)">CDL-B (Heavy Straight)</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="d-status">Initial Availability Status:</label>
            <select id="d-status" class="carrier-form-select">
              <option value="Available">Available (Ready for assignment)</option>
              <option value="Off Duty">Off Duty (Mandatory Rest / HOS)</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">Register Driver</button>
          </div>
        </form>
      </div>
    `);
  },

  openEditDriverModal(driverId) {
    const store = window.BRIDGES_STORE;
    const d = store.getCarrierDrivers().find(item => item.id === driverId);
    if (!d) return;

    UI.openModal('generic-app-modal', `Edit Driver — ${d.name}`, `
      <div style="padding: 6px 0;">
        <form id="carrier-driver-form" onsubmit="event.preventDefault(); CarrierDriversView.submitDriverForm('${d.id}');">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="d-name">Driver Full Name: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="d-name" class="carrier-form-input" value="${d.name}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="d-phone">Contact Phone: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="d-phone" class="carrier-form-input" value="${d.phone || '+1 (555) 234-5678'}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="d-license">CDL License Class:</label>
              <select id="d-license" class="carrier-form-select">
                <option value="CDL-A (HazMat &amp; Tanker)" ${d.licenseClass && d.licenseClass.includes('HazMat') ? 'selected' : ''}>CDL-A (HazMat &amp; Tanker)</option>
                <option value="CDL-A (Standard Combination)" ${d.licenseClass && d.licenseClass.includes('Standard') ? 'selected' : ''}>CDL-A (Standard Combination)</option>
                <option value="CDL-B (Heavy Straight)" ${d.licenseClass && d.licenseClass.includes('CDL-B') ? 'selected' : ''}>CDL-B (Heavy Straight)</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="d-status">Current Status:</label>
            <select id="d-status" class="carrier-form-select">
              <option value="Available" ${d.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Assigned" ${d.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="In Transit" ${d.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
              <option value="Off Duty" ${d.status === 'Off Duty' ? 'selected' : ''}>Off Duty</option>
              <option value="Inactive" ${d.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">Save Changes</button>
          </div>
        </form>
      </div>
    `);
  },

  submitDriverForm(driverId = null) {
    const name = document.getElementById('d-name').value;
    const phone = document.getElementById('d-phone').value;
    const licenseClass = document.getElementById('d-license').value;
    const status = document.getElementById('d-status').value;

    try {
      window.BRIDGES_STORE.saveCarrierDriver({
        id: driverId,
        name,
        phone,
        licenseClass,
        status
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Driver ${name} updated successfully.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openHistoryModal(driverId) {
    const store = window.BRIDGES_STORE;
    const d = store.getCarrierDrivers().find(item => item.id === driverId);
    if (!d) return;

    const history = d.assignmentHistory || [];

    UI.openModal('generic-app-modal', `Driver History — ${d.name}`, `
      <div style="padding: 4px 0;">
        <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; margin-bottom: 14px; font-size: 12px;">
          <div><strong>Driver ID:</strong> ${d.id} &bull; <strong>License:</strong> ${d.licenseClass || 'CDL-A'}</div>
          <div><strong>Current Status:</strong> <span class="carrier-badge carrier-badge-available">${d.status}</span> &bull; <strong>Assigned Tractor:</strong> ${d.currentVehicle || 'None'}</div>
        </div>

        <div style="font-size: 11.5px; font-weight: 700; color: #18217E; text-transform: uppercase; margin-bottom: 8px;">Historical Recovery Missions</div>

        ${history.length === 0 ? `
          <div style="text-align: center; padding: 24px 12px; color: #8A9995; font-size: 12px;">
            No past recovery missions recorded for this driver yet.
          </div>
        ` : `
          <div style="max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            ${history.map(h => `
              <div style="padding: 8px 10px; background: white; border: 1px solid #E5EBEE; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 700; color: #18217E;">${h.recoveryRequestId || 'Recovery'} &bull; Shipment: ${h.shipmentId || 'N/A'}</span>
                  <span style="color: #8A9995;">${new Date(h.assignedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style="font-size: 11.5px; color: #393A50;">
                  Operated Tractor: <strong>${h.vehicleName || 'Freightliner Cascadia'}</strong>
                </div>
                ${h.notes ? `<div style="font-size: 11px; color: #8A9995; margin-top: 2px;">Notes: ${h.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `}

        <div style="display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px solid #E5EBEE; padding-top: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `);
  }
};

window.CarrierDriversView = CarrierDriversView;
