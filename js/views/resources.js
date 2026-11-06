/**
 * BRIDGES Control Tower - Resource Overview (Vehicles and Drivers)
 * Administrative management of carrier fleet units, drivers, availability, and maintenance status
 */

const ResourcesView = {
  currentFilters: {
    search: '',
    carrierId: 'ALL',
    resourceType: 'ALL', // ALL, Vehicle, Driver
    status: 'ALL',
    sortBy: 'id',
    sortOrder: 'asc'
  },

  render() {
    const resources = this.getFilteredResources();
    const carriers = window.BRIDGES_STORE.getCarriers();
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();

    const totalVehicles = window.BRIDGES_STORE.getResources().filter(r => r.type === 'Vehicle').length;
    const totalDrivers = window.BRIDGES_STORE.getResources().filter(r => r.type === 'Driver').length;
    const activeUnits = window.BRIDGES_STORE.getResources().filter(r => r.status === 'Active').length;
    const maintenanceUnits = window.BRIDGES_STORE.getResources().filter(r => r.status === 'Maintenance').length;

    return `
      <div class="view-resources animate-fade-in">
        <!-- Header -->
        <div class="page-action-header">
          <div class="header-text-block">
            <h2 class="page-heading">Resource Overview</h2>
            <p class="page-subheading">Monitor and assign multi-modal fleet vehicles, certified transport drivers, and maintenance states.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="ResourcesView.openAddResourceModal()">
              ${Icons.plus(16)} Add Resource
            </button>
          </div>
        </div>

        <!-- Resource Summary Cards -->
        <div class="kpi-grid mb-3">
          <div class="kpi-card mini-kpi">
            <div class="kpi-header">
              <span class="kpi-label">Registered Vehicles</span>
              <span class="kpi-icon">${Icons.truck(16)}</span>
            </div>
            <div class="kpi-metric font-bold text-navy">${totalVehicles}</div>
          </div>

          <div class="kpi-card mini-kpi">
            <div class="kpi-header">
              <span class="kpi-label">Certified Drivers</span>
              <span class="kpi-icon">${Icons.users(16)}</span>
            </div>
            <div class="kpi-metric font-bold text-navy">${totalDrivers}</div>
          </div>

          <div class="kpi-card mini-kpi">
            <div class="kpi-header">
              <span class="kpi-label">Active / Available</span>
              <span class="kpi-icon">${Icons.check(16)}</span>
            </div>
            <div class="kpi-metric font-bold text-success">${activeUnits}</div>
          </div>

          <div class="kpi-card mini-kpi">
            <div class="kpi-header">
              <span class="kpi-label">In Maintenance</span>
              <span class="kpi-icon">${Icons.alertTriangle(16)}</span>
            </div>
            <div class="kpi-metric font-bold text-warning">${maintenanceUnits}</div>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" id="resource-search-field" placeholder="Search by ID, plate, model, driver name, or license..." 
                value="${this.currentFilters.search}"
                oninput="ResourcesView.handleSearch(this.value)">
              ${this.currentFilters.search ? `
                <button class="clear-search-btn" onclick="ResourcesView.handleSearch(''); document.getElementById('resource-search-field').value=''">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

            <div class="filter-controls-group">
              <!-- Resource Type Filter -->
              <div class="select-wrapper">
                <select id="resource-type-filter" onchange="ResourcesView.handleTypeFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.resourceType === 'ALL' ? 'selected' : ''}>All Types</option>
                  <option value="Vehicle" ${this.currentFilters.resourceType === 'Vehicle' ? 'selected' : ''}>Vehicles Only</option>
                  <option value="Driver" ${this.currentFilters.resourceType === 'Driver' ? 'selected' : ''}>Drivers Only</option>
                </select>
              </div>

              <!-- Carrier Filter -->
              <div class="select-wrapper">
                <select id="resource-carrier-filter" onchange="ResourcesView.handleCarrierFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.carrierId === 'ALL' ? 'selected' : ''}>All Carriers</option>
                  ${carriers.map(c => `
                    <option value="${c.id}" ${this.currentFilters.carrierId === c.id ? 'selected' : ''}>${c.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Status Filter -->
              <div class="select-wrapper">
                <select id="resource-status-filter" onchange="ResourcesView.handleStatusFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
                  <option value="Active" ${this.currentFilters.status === 'Active' ? 'selected' : ''}>Active / Available</option>
                  <option value="Maintenance" ${this.currentFilters.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                  <option value="Inactive" ${this.currentFilters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Resources Table -->
        <div class="panel resources-table-panel">
          <div class="table-responsive">
            <table class="data-table" id="resources-data-table">
              <thead>
                <tr>
                  <th class="cursor-pointer" onclick="ResourcesView.handleSort('id')">
                    <div class="th-content">Identifier ${this.renderSortArrow('id')}</div>
                  </th>
                  <th>Type & Category</th>
                  <th>Description / Specifications</th>
                  <th>Plate / License #</th>
                  <th>Assigned Carrier</th>
                  <th class="cursor-pointer" onclick="ResourcesView.handleSort('status')">
                    <div class="th-content">Status / Availability ${this.renderSortArrow('status')}</div>
                  </th>
                  <th>Current Location</th>
                  <th style="width: 120px; min-width: 120px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${resources.length === 0 ? `
                  <tr>
                    <td colspan="8">
                      ${UI.renderEmptyState('No Resources Found', 'No fleet vehicles or drivers matched your filter criteria.', `
                        <button class="btn btn-secondary btn-sm" onclick="ResourcesView.resetFilters()">Reset Filters</button>
                      `)}
                    </td>
                  </tr>
                ` : ''}

                ${resources.map(r => {
                  const carrier = window.BRIDGES_STORE.getCarrier(r.carrierId);
                  const isVehicle = r.type === 'Vehicle';

                  let iconSvg = isVehicle ? Icons.truck(16) : Icons.users(16);
                  if (r.category === 'Air Unit') iconSvg = Icons.plane(16);
                  if (r.category === 'Sea Unit') iconSvg = Icons.ship(16);

                  return `
                    <tr class="${r.status === 'Inactive' ? 'row-inactive' : ''}">
                      <td>
                        <span class="font-bold text-navy">${r.id}</span>
                      </td>
                      <td>
                        <div class="resource-type-badge">
                          <span class="resource-icon-wrap">${iconSvg}</span>
                          <span>${r.type} ${r.category ? `• ${r.category}` : ''}</span>
                        </div>
                      </td>
                      <td>
                        <div class="resource-desc-cell">
                          <span class="font-medium">${isVehicle ? r.model : r.name}</span>
                          ${isVehicle && r.capacity ? `<span class="capacity-tag">Payload: ${r.capacity}</span>` : ''}
                        </div>
                      </td>
                      <td>
                        <span class="plate-code">${isVehicle ? r.plateNumber : (r.licenseNumber || '—')}</span>
                      </td>
                      <td>
                        ${carrier ? `
                          <div class="carrier-pill-cell">
                            <span class="font-medium text-midnight">${carrier.name}</span>
                            <span class="carrier-code-sub">${carrier.id}</span>
                          </div>
                        ` : '<span class="text-muted">Unassigned</span>'}
                      </td>
                      <td>
                        ${UI.renderStatusBadge(r.status)}
                      </td>
                      <td>
                        <span class="text-sm text-midnight">${r.currentLocation || 'Hub Base'}</span>
                      </td>
                      <td style="width: 120px; min-width: 120px; text-align: center; vertical-align: middle;">
                        <div class="action-buttons-group">
                          <button class="btn-icon-action" title="Edit Resource" onclick="ResourcesView.openEditResourceModal('${r.id}')">
                            ${Icons.edit(15)}
                          </button>
                          <button class="btn-icon-action text-danger" title="Remove Resource" onclick="ResourcesView.confirmDeleteResource('${r.id}')">
                            ${Icons.trash(15)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-footer-status">
            <span>Showing <strong>${resources.length}</strong> of <strong>${window.BRIDGES_STORE.getResources().length}</strong> total fleet assets</span>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredResources() {
    let resources = [...window.BRIDGES_STORE.getResources()];

    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      resources = resources.filter(r => 
        r.id.toLowerCase().includes(q) ||
        (r.model && r.model.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.plateNumber && r.plateNumber.toLowerCase().includes(q)) ||
        (r.licenseNumber && r.licenseNumber.toLowerCase().includes(q))
      );
    }

    if (this.currentFilters.resourceType !== 'ALL') {
      resources = resources.filter(r => r.type === this.currentFilters.resourceType);
    }

    if (this.currentFilters.carrierId !== 'ALL') {
      resources = resources.filter(r => r.carrierId === this.currentFilters.carrierId);
    }

    if (this.currentFilters.status !== 'ALL') {
      resources = resources.filter(r => r.status === this.currentFilters.status);
    }

    resources.sort((a, b) => {
      let valA = a[this.currentFilters.sortBy] || '';
      let valB = b[this.currentFilters.sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.currentFilters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return resources;
  },

  renderSortArrow(col) {
    if (this.currentFilters.sortBy !== col) return '';
    return `<span class="sort-indicator">${this.currentFilters.sortOrder === 'asc' ? '▲' : '▼'}</span>`;
  },

  handleSort(col) {
    if (this.currentFilters.sortBy === col) {
      this.currentFilters.sortOrder = this.currentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentFilters.sortBy = col;
      this.currentFilters.sortOrder = 'asc';
    }
    App.renderCurrentView();
  },

  handleSearch(val) {
    this.currentFilters.search = val.trim();
    App.renderCurrentView();
  },

  handleTypeFilter(type) {
    this.currentFilters.resourceType = type;
    App.renderCurrentView();
  },

  handleCarrierFilter(carrierId) {
    this.currentFilters.carrierId = carrierId;
    App.renderCurrentView();
  },

  handleStatusFilter(status) {
    this.currentFilters.status = status;
    App.renderCurrentView();
  },

  resetFilters() {
    this.currentFilters.search = '';
    this.currentFilters.resourceType = 'ALL';
    this.currentFilters.carrierId = 'ALL';
    this.currentFilters.status = 'ALL';
    App.renderCurrentView();
  },

  // Modal: Add Resource
  openAddResourceModal() {
    const carriers = window.BRIDGES_STORE.getActiveCarriers();

    const formHtml = `
      <form id="add-resource-form" onsubmit="ResourcesView.handleAddResourceSubmit(event)">
        <div class="form-grid">
          <div class="form-group col-6">
            <label class="form-label" for="res-type">Resource Type <span class="required">*</span></label>
            <select id="res-type" name="type" class="form-control" required onchange="ResourcesView.handleResourceTypeChange(this.value)">
              <option value="Vehicle">Fleet Vehicle</option>
              <option value="Driver">Transport Driver</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="res-id">Unique Identifier <span class="required">*</span></label>
            <input type="text" id="res-id" name="id" class="form-control" placeholder="e.g. TRK-104 or DRV-09" required>
            <span class="field-hint">Must be unique across the fleet registry.</span>
          </div>

          <!-- Vehicle Specific Fields -->
          <div class="form-group col-6 vehicle-field">
            <label class="form-label" for="res-category">Vehicle Category</label>
            <select id="res-category" name="category" class="form-control">
              <option value="Ground Unit">Ground Unit (Truck / Van)</option>
              <option value="Air Unit">Air Unit (Cargo Aircraft)</option>
              <option value="Sea Unit">Sea Unit (Cargo Vessel)</option>
            </select>
          </div>

          <div class="form-group col-6 vehicle-field">
            <label class="form-label" for="res-model">Vehicle Model</label>
            <input type="text" id="res-model" name="model" class="form-control" placeholder="e.g. Bridges Transport Truck">
          </div>

          <div class="form-group col-6 vehicle-field">
            <label class="form-label" for="res-plate">License Plate / Registration</label>
            <input type="text" id="res-plate" name="plateNumber" class="form-control" placeholder="e.g. WA-8842-LK">
          </div>

          <div class="form-group col-6 vehicle-field">
            <label class="form-label" for="res-capacity">Payload Capacity</label>
            <input type="text" id="res-capacity" name="capacity" class="form-control" placeholder="e.g. 24.0T">
          </div>

          <!-- Driver Specific Fields -->
          <div class="form-group col-6 driver-field" style="display: none;">
            <label class="form-label" for="res-name">Driver Full Name</label>
            <input type="text" id="res-name" name="name" class="form-control" placeholder="e.g. Marcus Cole">
          </div>

          <div class="form-group col-6 driver-field" style="display: none;">
            <label class="form-label" for="res-phone">Driver Phone</label>
            <input type="tel" id="res-phone" name="phone" class="form-control" placeholder="+1 (555) 000-0000">
          </div>

          <div class="form-group col-6 driver-field" style="display: none;">
            <label class="form-label" for="res-license">Commercial Driver License #</label>
            <input type="text" id="res-license" name="licenseNumber" class="form-control" placeholder="e.g. CDL-88219-X">
          </div>

          <!-- Common Fields -->
          <div class="form-group col-6">
            <label class="form-label" for="res-carrier">Assigned Carrier Partner <span class="required">*</span></label>
            <select id="res-carrier" name="carrierId" class="form-control" required>
              <option value="">-- Select Active Carrier --</option>
              ${carriers.map(c => `
                <option value="${c.id}">${c.name} (${c.operatingRegion})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="res-status">Status / Availability</label>
            <select id="res-status" name="status" class="form-control">
              <option value="Active">Active / Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="form-group col-12">
            <label class="form-label" for="res-location">Current Base / Location</label>
            <input type="text" id="res-location" name="currentLocation" class="form-control" placeholder="e.g. Capital Knot Central Hub">
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Register Fleet Resource</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = 'Register Carrier Fleet Resource';
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleResourceTypeChange(type) {
    const isVehicle = type === 'Vehicle';
    document.querySelectorAll('.vehicle-field').forEach(el => el.style.display = isVehicle ? '' : 'none');
    document.querySelectorAll('.driver-field').forEach(el => el.style.display = isVehicle ? 'none' : '');
  },

  handleAddResourceSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const type = formData.get('type');
      const newRes = window.BRIDGES_STORE.addResource({
        id: formData.get('id'),
        type: type,
        category: formData.get('category'),
        model: formData.get('model'),
        plateNumber: formData.get('plateNumber'),
        capacity: formData.get('capacity'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        licenseNumber: formData.get('licenseNumber'),
        carrierId: formData.get('carrierId'),
        status: formData.get('status'),
        currentLocation: formData.get('currentLocation')
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Resource ${newRes.id} added successfully.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Modal: Edit Resource
  openEditResourceModal(id) {
    const res = window.BRIDGES_STORE.getResource(id);
    if (!res) return;

    const carriers = window.BRIDGES_STORE.getActiveCarriers();
    const isVehicle = res.type === 'Vehicle';

    const formHtml = `
      <form id="edit-resource-form" onsubmit="ResourcesView.handleEditResourceSubmit(event, '${res.id}')">
        <div class="form-grid">
          <div class="form-group col-6">
            <label class="form-label">Resource ID</label>
            <input type="text" class="form-control" value="${res.id}" disabled>
          </div>

          <div class="form-group col-6">
            <label class="form-label">Resource Type</label>
            <input type="text" class="form-control" value="${res.type}" disabled>
          </div>

          ${isVehicle ? `
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-model">Vehicle Model</label>
              <input type="text" id="edit-res-model" name="model" class="form-control" value="${res.model || ''}">
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-plate">License Plate</label>
              <input type="text" id="edit-res-plate" name="plateNumber" class="form-control" value="${res.plateNumber || ''}">
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-capacity">Capacity</label>
              <input type="text" id="edit-res-capacity" name="capacity" class="form-control" value="${res.capacity || ''}">
            </div>
          ` : `
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-name">Driver Full Name</label>
              <input type="text" id="edit-res-name" name="name" class="form-control" value="${res.name || ''}">
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-phone">Driver Phone</label>
              <input type="tel" id="edit-res-phone" name="phone" class="form-control" value="${res.phone || ''}">
            </div>
            <div class="form-group col-6">
              <label class="form-label" for="edit-res-lic">License Number</label>
              <input type="text" id="edit-res-lic" name="licenseNumber" class="form-control" value="${res.licenseNumber || ''}">
            </div>
          `}

          <div class="form-group col-6">
            <label class="form-label" for="edit-res-carrier">Assigned Carrier</label>
            <select id="edit-res-carrier" name="carrierId" class="form-control" required>
              ${carriers.map(c => `
                <option value="${c.id}" ${res.carrierId === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-res-status">Status / Availability</label>
            <select id="edit-res-status" name="status" class="form-control">
              <option value="Active" ${res.status === 'Active' ? 'selected' : ''}>Active / Available</option>
              <option value="Maintenance" ${res.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              <option value="Inactive" ${res.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div class="form-group col-12">
            <label class="form-label" for="edit-res-loc">Current Location</label>
            <input type="text" id="edit-res-loc" name="currentLocation" class="form-control" value="${res.currentLocation || ''}">
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Save Changes</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = `Edit Resource: ${res.id}`;
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleEditResourceSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      window.BRIDGES_STORE.updateResource(id, {
        model: formData.get('model'),
        plateNumber: formData.get('plateNumber'),
        capacity: formData.get('capacity'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        licenseNumber: formData.get('licenseNumber'),
        carrierId: formData.get('carrierId'),
        status: formData.get('status'),
        currentLocation: formData.get('currentLocation')
      });

      UI.closeModal('generic-app-modal');
      UI.showToast('Resource updated successfully.', 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  confirmDeleteResource(id) {
    const res = window.BRIDGES_STORE.getResource(id);
    if (!res) return;

    UI.confirm({
      title: `Decommission Resource`,
      message: `Are you sure you want to remove resource <strong>${res.id}</strong> from active registry?`,
      confirmText: 'Remove Resource',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteResource(id);
        UI.showToast(`Resource ${res.id} removed.`, 'success');
        App.renderCurrentView();
      }
    });
  }
};

window.ResourcesView = ResourcesView;
