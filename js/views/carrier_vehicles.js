/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Vehicle Management (US-64 to US-66)
 * Fleet management, Add / Edit vehicles, maintenance status, availability toggle, assignment history
 */

const CarrierVehiclesView = {
  statusFilter: 'all',
  searchQuery: '',

  render() {
    const store = window.BRIDGES_STORE;
    const vehicles = store.getCarrierVehicles();
    const availableCount = vehicles.filter(v => v.status === 'Available').length;
    const assignedCount = vehicles.filter(v => v.status === 'Assigned' || v.status === 'In Transit').length;
    const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;

    return `
      <div class="carrier-vehicles-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Vehicle Fleet Management &bull; Bridges Global Logistics</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Manage tractor-trailers, box trucks, and line-haul assets. Shared with Control Tower Administrator.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="CarrierVehiclesView.openAddVehicleModal()" style="font-weight: 700; background: #18217E;">
            ${Icons.truck(14)} Register New Vehicle
          </button>
        </div>

        <!-- Filter & Search Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <!-- Status Filters -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierVehiclesView.setStatusFilter('all')">
              All Fleet (${vehicles.length})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Available' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierVehiclesView.setStatusFilter('Available')">
              Available (${availableCount})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Assigned' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierVehiclesView.setStatusFilter('Assigned')">
              Dispatched / Assigned (${assignedCount})
            </button>
            <button type="button" class="btn btn-sm ${this.statusFilter === 'Maintenance' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierVehiclesView.setStatusFilter('Maintenance')">
              Maintenance (${maintenanceCount})
            </button>
          </div>

          <!-- Search Input -->
          <div style="position: relative; width: 250px;">
            <input type="text" id="carrier-vehicle-search" placeholder="Search plate, model, ID..." value="${this.searchQuery}" oninput="CarrierVehiclesView.handleSearch(this.value)" class="carrier-form-input" style="padding: 6px 10px 6px 28px; font-size: 12px;">
            <span style="position: absolute; left: 9px; top: 7px; color: #8A9995;">${Icons.search(13)}</span>
          </div>
        </div>

        <!-- Vehicle Table Container -->
        <div id="carrier-vehicles-table-container">
          ${this.renderTableContent()}
        </div>
      </div>
    `;
  },

  setStatusFilter(filter) {
    this.statusFilter = filter;
    const container = document.getElementById('carrier-vehicles-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  handleSearch(q) {
    this.searchQuery = q;
    const container = document.getElementById('carrier-vehicles-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  getFilteredVehicles() {
    const store = window.BRIDGES_STORE;
    let list = store.getCarrierVehicles();

    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'Assigned') {
        list = list.filter(v => v.status === 'Assigned' || v.status === 'In Transit');
      } else {
        list = list.filter(v => v.status === this.statusFilter);
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
        (v.vehicleType && v.vehicleType.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTableContent() {
    const vehicles = this.getFilteredVehicles();

    if (vehicles.length === 0) {
      return `
        <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
          <div class="carrier-empty-icon">${Icons.truck(26)}</div>
          <div class="carrier-empty-title">No Vehicles Found</div>
          <p class="carrier-empty-desc">
            No vehicle records match the active filter or search query. Click "Register New Vehicle" to add one to the carrier fleet.
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
                <th style="padding: 11px 14px;">Vehicle ID</th>
                <th>Model / Type</th>
                <th>Registration / Plate</th>
                <th>Cargo Capacity</th>
                <th>Operational Status</th>
                <th>Current Assignment</th>
                <th>Maintenance Status</th>
                <th style="text-align: right; padding-right: 14px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.map(v => {
                let badgeClass = 'carrier-badge-available';
                if (v.status === 'Assigned') badgeClass = 'carrier-badge-assigned';
                if (v.status === 'In Transit') badgeClass = 'carrier-badge-transit';
                if (v.status === 'Maintenance') badgeClass = 'carrier-badge-maintenance';
                if (v.status === 'Inactive') badgeClass = 'carrier-badge-inactive';

                return `
                  <tr>
                    <td style="padding: 11px 14px;">
                      <span style="font-weight: 700; color: #18217E;">${v.id}</span>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #070724;">${v.name}</div>
                      <div style="font-size: 10.5px; color: #8A9995;">${v.vehicleType || 'Semi-Trailer'}</div>
                    </td>
                    <td>
                      <span style="font-family: monospace; font-size: 11.5px; font-weight: 700; color: #070724; background: #F4F6F8; padding: 2px 6px; border-radius: 4px; border: 1px solid #E5EBEE;">
                        ${v.plateNumber || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style="color: #393A50;">${v.capacity || '45,000 lbs'}</span>
                    </td>
                    <td>
                      <span class="carrier-badge ${badgeClass}">
                        ${v.status}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 11px; color: ${v.currentAssignment ? '#18217E' : '#8A9995'}; font-weight: ${v.currentAssignment ? '700' : '500'};">
                        ${v.currentAssignment ? `${v.currentAssignment} (${v.assignedShipmentId || 'Recovery'})` : 'None &bull; Standby'}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 11px; font-weight: 600; color: ${v.maintenanceStatus === 'Good' ? '#059669' : (v.maintenanceStatus === 'Inspection Due' ? '#D97706' : '#EA341F')};">
                        &bull; ${v.maintenanceStatus || 'Good'}
                      </span>
                    </td>
                    <td style="text-align: right; padding-right: 14px; white-space: nowrap;">
                      <button class="btn btn-secondary btn-sm" onclick="CarrierVehiclesView.openEditVehicleModal('${v.id}')" style="padding: 3px 8px; font-size: 11px; font-weight: 600; margin-right: 4px;">
                        Edit
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="CarrierVehiclesView.openHistoryModal('${v.id}')" style="padding: 3px 8px; font-size: 11px; font-weight: 600;" title="View Assignment History">
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

  openAddVehicleModal() {
    UI.openModal('generic-app-modal', 'Register New Carrier Vehicle', `
      <div style="padding: 6px 0;">
        <form id="carrier-vehicle-form" onsubmit="event.preventDefault(); CarrierVehiclesView.submitVehicleForm();">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="v-name">Vehicle Model / Make: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="v-name" class="carrier-form-input" placeholder="e.g. Freightliner Cascadia 126" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-plate">License Plate / Registration: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="v-plate" class="carrier-form-input" placeholder="e.g. TX-4921-TR" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-type">Vehicle Configuration:</label>
              <select id="v-type" class="carrier-form-select">
                <option value="Freightliner Cascadia">Freightliner Cascadia</option>
                <option value="Kenworth T680">Kenworth T680</option>
                <option value="Peterbilt 579">Peterbilt 579</option>
                <option value="Volvo VNL 860">Volvo VNL 860</option>
                <option value="Reefer 53ft Trailer">Reefer 53ft Trailer</option>
                <option value="Dry Van 53ft">Dry Van 53ft</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-capacity">Max Cargo Capacity:</label>
              <input type="text" id="v-capacity" class="carrier-form-input" value="45,000 lbs" placeholder="e.g. 45,000 lbs">
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-maint">Maintenance Status:</label>
              <select id="v-maint" class="carrier-form-select">
                <option value="Good">Good &bull; Passed DOT</option>
                <option value="Inspection Due">Inspection Due</option>
                <option value="Minor Service">Minor Service</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="v-status">Initial Fleet Status:</label>
            <select id="v-status" class="carrier-form-select">
              <option value="Available">Available (Ready for dispatch)</option>
              <option value="Maintenance">Maintenance (Not available)</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">Register Vehicle</button>
          </div>
        </form>
      </div>
    `);
  },

  openEditVehicleModal(vehicleId) {
    const store = window.BRIDGES_STORE;
    const v = store.getCarrierVehicles().find(item => item.id === vehicleId);
    if (!v) return;

    UI.openModal('generic-app-modal', `Edit Vehicle — ${v.id}`, `
      <div style="padding: 6px 0;">
        <form id="carrier-vehicle-form" onsubmit="event.preventDefault(); CarrierVehiclesView.submitVehicleForm('${v.id}');">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="v-name">Vehicle Model / Make: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="v-name" class="carrier-form-input" value="${v.name}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-plate">License Plate / Registration: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="v-plate" class="carrier-form-input" value="${v.plateNumber}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-type">Vehicle Configuration:</label>
              <select id="v-type" class="carrier-form-select">
                <option value="Freightliner Cascadia" ${v.vehicleType === 'Freightliner Cascadia' ? 'selected' : ''}>Freightliner Cascadia</option>
                <option value="Kenworth T680" ${v.vehicleType === 'Kenworth T680' ? 'selected' : ''}>Kenworth T680</option>
                <option value="Peterbilt 579" ${v.vehicleType === 'Peterbilt 579' ? 'selected' : ''}>Peterbilt 579</option>
                <option value="Volvo VNL 860" ${v.vehicleType === 'Volvo VNL 860' ? 'selected' : ''}>Volvo VNL 860</option>
                <option value="Reefer 53ft Trailer" ${v.vehicleType === 'Reefer 53ft Trailer' ? 'selected' : ''}>Reefer 53ft Trailer</option>
                <option value="Dry Van 53ft" ${v.vehicleType === 'Dry Van 53ft' ? 'selected' : ''}>Dry Van 53ft</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-capacity">Max Cargo Capacity:</label>
              <input type="text" id="v-capacity" class="carrier-form-input" value="${v.capacity || '45,000 lbs'}">
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="v-maint">Maintenance Status:</label>
              <select id="v-maint" class="carrier-form-select">
                <option value="Good" ${v.maintenanceStatus === 'Good' ? 'selected' : ''}>Good &bull; Passed DOT</option>
                <option value="Inspection Due" ${v.maintenanceStatus === 'Inspection Due' ? 'selected' : ''}>Inspection Due</option>
                <option value="Minor Service" ${v.maintenanceStatus === 'Minor Service' ? 'selected' : ''}>Minor Service</option>
                <option value="Out of Service" ${v.maintenanceStatus === 'Out of Service' ? 'selected' : ''}>Out of Service</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="v-status">Current Operational Status:</label>
            <select id="v-status" class="carrier-form-select">
              <option value="Available" ${v.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Assigned" ${v.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="In Transit" ${v.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
              <option value="Maintenance" ${v.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              <option value="Inactive" ${v.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
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

  submitVehicleForm(vehicleId = null) {
    const name = document.getElementById('v-name').value;
    const plateNumber = document.getElementById('v-plate').value;
    const vehicleType = document.getElementById('v-type').value;
    const capacity = document.getElementById('v-capacity').value;
    const maintenanceStatus = document.getElementById('v-maint').value;
    const status = document.getElementById('v-status').value;

    try {
      window.BRIDGES_STORE.saveCarrierVehicle({
        id: vehicleId,
        name,
        plateNumber,
        vehicleType,
        capacity,
        maintenanceStatus,
        status
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Vehicle ${name} (${plateNumber}) updated successfully.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openHistoryModal(vehicleId) {
    const store = window.BRIDGES_STORE;
    const v = store.getCarrierVehicles().find(item => item.id === vehicleId);
    if (!v) return;

    const history = v.assignmentHistory || [];

    UI.openModal('generic-app-modal', `Assignment History — ${v.name} (${v.plateNumber})`, `
      <div style="padding: 4px 0;">
        <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; margin-bottom: 14px; font-size: 12px;">
          <div><strong>Vehicle ID:</strong> ${v.id} &bull; <strong>Plate:</strong> ${v.plateNumber}</div>
          <div><strong>Current Status:</strong> <span class="carrier-badge carrier-badge-available">${v.status}</span> &bull; <strong>Active Recovery:</strong> ${v.currentAssignment || 'None'}</div>
        </div>

        <div style="font-size: 11.5px; font-weight: 700; color: #18217E; text-transform: uppercase; margin-bottom: 8px;">Historical Recovery Assignments</div>

        ${history.length === 0 ? `
          <div style="text-align: center; padding: 24px 12px; color: #8A9995; font-size: 12px;">
            No past recovery assignments recorded for this asset yet.
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
                  Assigned Driver: <strong>${h.driverName || 'Ethan Vance'}</strong>
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

window.CarrierVehiclesView = CarrierVehiclesView;
