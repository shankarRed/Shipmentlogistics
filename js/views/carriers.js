/**
 * BRIDGES Control Tower - Carrier Management View (US-7 to US-11)
 * Carrier registry, onboarding, profiles with associated users & fleet resources, activation gating
 */

const CarriersView = {
  currentFilters: {
    search: '',
    status: 'ALL',
    type: 'ALL',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  currentPage: 1,
  pageSize: 25,

  getCarrierModalities(type) {
    if (!type) return ['Ground'];
    if (Array.isArray(type)) return type;
    const str = String(type).trim();
    if (str.toLowerCase() === 'multi-modal' || str.toLowerCase() === 'multimodal') {
      return ['Ground', 'Air', 'Sea'];
    }
    const modes = [];
    if (/ground|truck|road|van/i.test(str)) modes.push('Ground');
    if (/air|flight|express/i.test(str)) modes.push('Air');
    if (/sea|ocean|port|marine/i.test(str)) modes.push('Sea');
    return modes.length > 0 ? modes : ['Ground'];
  },

  normalizeType(type) {
    const modes = this.getCarrierModalities(type);
    if (modes.length > 1) return 'Multi-Modal';
    return modes[0] || 'Ground';
  },

  renderTypeBadge(type) {
    const modes = this.getCarrierModalities(type);
    const badges = [];

    modes.forEach(m => {
      if (m === 'Air') {
        badges.push(`<span class="badge" style="background: rgba(139, 92, 246, 0.12); color: #7C3AED; border: 1px solid rgba(139, 92, 246, 0.25); font-weight: 600; padding: 2.5px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 11px;">✈️ Air</span>`);
      } else if (m === 'Sea') {
        badges.push(`<span class="badge" style="background: rgba(2, 132, 199, 0.12); color: #0284C7; border: 1px solid rgba(2, 132, 199, 0.25); font-weight: 600; padding: 2.5px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 11px;">🚢 Sea</span>`);
      } else {
        badges.push(`<span class="badge" style="background: rgba(25, 103, 210, 0.12); color: #1967D2; border: 1px solid rgba(25, 103, 210, 0.25); font-weight: 600; padding: 2.5px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 11px;">🚛 Ground</span>`);
      }
    });

    if (modes.length > 1) {
      badges.unshift(`<span class="badge" style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.25); font-weight: 600; padding: 2.5px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 11px;">🌐 Multi</span>`);
    }

    return `<div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">${badges.join('')}</div>`;
  },

  handleModalityCardToggle(chk) {
    const card = chk.closest('.modality-checkbox-card');
    if (card) {
      if (chk.checked) {
        card.classList.add('is-checked');
      } else {
        card.classList.remove('is-checked');
      }
    }
    const form = chk.closest('form');
    if (!form) return;
    const checked = Array.from(form.querySelectorAll('input[name="carrierModalities"]:checked')).map(el => el.value);
    const summaryEl = form.querySelector('#carrier-modalities-summary');
    if (summaryEl) {
      if (checked.length === 0) {
        summaryEl.textContent = 'None selected (Please check at least one)';
        summaryEl.style.color = '#DC2626';
      } else if (checked.length === 3) {
        summaryEl.textContent = 'Multi-Modal (Ground, Air & Sea)';
        summaryEl.style.color = '#059669';
      } else if (checked.length === 2) {
        summaryEl.textContent = `Multi-Modal (${checked.join(' + ')})`;
        summaryEl.style.color = '#2563EB';
      } else {
        summaryEl.textContent = `${checked[0]} Only`;
        summaryEl.style.color = '#1E40AF';
      }
    }
  },

  render() {
    const allFilteredCarriers = this.getFilteredCarriers();
    const totalRecords = allFilteredCarriers.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageCarriers = allFilteredCarriers.slice(startIndex, startIndex + this.pageSize);

    // Pre-index users and vehicles for instant O(1) lookups across 500 carriers
    const usersByCarrier = {};
    window.BRIDGES_STORE.getUsers().forEach(u => {
      if (u.carrierId) {
        if (!usersByCarrier[u.carrierId]) usersByCarrier[u.carrierId] = [];
        usersByCarrier[u.carrierId].push(u);
      }
    });

    const vehiclesByCarrier = {};
    window.BRIDGES_STORE.getResources().forEach(r => {
      if (r.carrierId && r.type === 'Vehicle') {
        if (!vehiclesByCarrier[r.carrierId]) vehiclesByCarrier[r.carrierId] = [];
        vehiclesByCarrier[r.carrierId].push(r);
      }
    });

    const carrierTypes = Array.from(new Set(window.BRIDGES_STORE.getCarriers().map(c => c.carrierType)));

    return `
      <div class="view-carriers animate-fade-in">
        <!-- Header Controls -->
        <div class="page-action-header">
          <div class="header-text-block">
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 class="page-heading">Carrier Management</h2>
              <span class="badge badge-primary" style="font-size: 12px;">${window.BRIDGES_STORE.getCarriers().length} Registered Carriers</span>
            </div>
            <p class="page-subheading">Manage contracted logistics providers, regional networks, and fleet partnerships across 500 carrier partners.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="CarriersView.openAddCarrierModal()">
              ${Icons.plus(16)} Register New Carrier
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" id="carrier-search-field" placeholder="Search by carrier name, ID (e.g. CAR-42), contact, or region..." 
                value="${this.currentFilters.search}"
                oninput="CarriersView.handleSearch(this.value)">
              ${this.currentFilters.search ? `
                <button class="clear-search-btn" onclick="CarriersView.handleSearch(''); document.getElementById('carrier-search-field').value=''">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

              <!-- Type Filter (Ground, Air, Sea) -->
              <div class="select-wrapper">
                <select id="carrier-type-filter" onchange="CarriersView.handleTypeFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.type === 'ALL' ? 'selected' : ''}>All Carrier Types (Ground, Air, Sea)</option>
                  <option value="Ground" ${this.currentFilters.type === 'Ground' ? 'selected' : ''}>🚛 Ground Carriers</option>
                  <option value="Air" ${this.currentFilters.type === 'Air' ? 'selected' : ''}>✈️ Air Carriers</option>
                  <option value="Sea" ${this.currentFilters.type === 'Sea' ? 'selected' : ''}>🚢 Sea &amp; Maritime</option>
                  <option value="Multi-Modal" ${this.currentFilters.type === 'Multi-Modal' ? 'selected' : ''}>🌐 Multi-Modal</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="select-wrapper">
                <select id="carrier-status-filter" onchange="CarriersView.handleStatusFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
                  <option value="Active" ${this.currentFilters.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Inactive" ${this.currentFilters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Carriers Table -->
        <div class="panel carriers-table-panel" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table" id="carriers-data-table">
              <thead>
                <tr>
                  <th class="cursor-pointer" onclick="CarriersView.handleSort('id')">
                    <div class="th-content">Carrier ID ${this.renderSortArrow('id')}</div>
                  </th>
                  <th class="cursor-pointer" onclick="CarriersView.handleSort('name')">
                    <div class="th-content">Carrier Name ${this.renderSortArrow('name')}</div>
                  </th>
                  <th>Contact Person</th>
                  <th>Contact Info</th>
                  <th class="cursor-pointer" onclick="CarriersView.handleSort('operatingRegion')">
                    <div class="th-content">Operating Region ${this.renderSortArrow('operatingRegion')}</div>
                  </th>
                  <th>Carrier Type</th>
                  <th class="cursor-pointer" onclick="CarriersView.handleSort('status')">
                    <div class="th-content">Status ${this.renderSortArrow('status')}</div>
                  </th>
                  <th style="width: 120px; min-width: 120px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pageCarriers.length === 0 ? `
                  <tr>
                    <td colspan="8">
                      ${UI.renderEmptyState('No Carriers Found', 'No carrier records matched the current filters.', `
                        <button class="btn btn-secondary btn-sm" onclick="CarriersView.resetFilters()">Reset Filters</button>
                      `)}
                    </td>
                  </tr>
                ` : ''}

                ${pageCarriers.map(c => {
                  return `
                    <tr class="${c.status === 'Inactive' ? 'row-inactive' : ''}">
                      <td>
                        <span class="font-bold text-navy">${c.id}</span>
                      </td>
                      <td>
                        <span class="carrier-title font-medium text-midnight">${c.name}</span>
                      </td>
                      <td>
                        <span class="font-medium text-midnight">${c.contactPerson}</span>
                      </td>
                      <td>
                        <span class="text-xs text-midnight">${c.email}</span>
                      </td>
                      <td>
                        <span class="region-pill">${c.operatingRegion}</span>
                      </td>
                      <td>
                        ${this.renderTypeBadge(c.carrierType)}
                      </td>
                      <td>
                        ${UI.renderStatusBadge(c.status)}
                      </td>
                      <td style="width: 120px; min-width: 120px; text-align: center; vertical-align: middle;">
                        <div class="action-buttons-group">
                          <button class="btn-icon-action" title="View Carrier Profile & Associated Resources" onclick="CarriersView.viewCarrierProfile('${c.id}')">
                            ${Icons.eye(15)}
                          </button>
                          <button class="btn-icon-action" title="Edit Carrier" onclick="CarriersView.openEditCarrierModal('${c.id}')">
                            ${Icons.edit(15)}
                          </button>
                          <button class="btn-icon-action ${c.status === 'Active' ? 'text-warning' : 'text-success'}" 
                            title="${c.status === 'Active' ? 'Deactivate Carrier' : 'Activate Carrier'}" 
                            onclick="CarriersView.confirmToggleStatus('${c.id}')">
                            ${c.status === 'Active' ? Icons.trash(15) : Icons.refresh(15)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="pagination-container">
            <div>
              Showing <strong>${totalRecords > 0 ? startIndex + 1 : 0}</strong> to <strong>${Math.min(startIndex + this.pageSize, totalRecords)}</strong> of <strong>${totalRecords}</strong> carriers (<strong>${window.BRIDGES_STORE.getCarriers().length}</strong> total in master registry)
            </div>
            <div class="pagination-controls">
              <label style="display: flex; align-items: center; gap: 6px; margin-right: 12px; font-size: 11.5px; color: #64748B;">
                Page size:
                <select onchange="CarriersView.changePageSize(Number(this.value))" style="padding: 3px 6px; border-radius: 4px; border: 1px solid #CBD5E1; font-size: 11.5px;">
                  <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${this.pageSize === 25 ? 'selected' : ''}>25</option>
                  <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
                  <option value="100" ${this.pageSize === 100 ? 'selected' : ''}>100</option>
                  <option value="500" ${this.pageSize === 500 ? 'selected' : ''}>All (500)</option>
                </select>
              </label>

              <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="CarriersView.goToPage(1)" title="First Page">«</button>
              <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="CarriersView.goToPage(${this.currentPage - 1})" title="Previous Page">‹ Prev</button>
              <span style="padding: 0 8px; font-weight: 600; font-size: 12px;">Page ${this.currentPage} of ${totalPages}</span>
              <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="CarriersView.goToPage(${this.currentPage + 1})" title="Next Page">Next ›</button>
              <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="CarriersView.goToPage(${totalPages})" title="Last Page">»</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  goToPage(page) {
    this.currentPage = Math.max(1, page);
    App.renderCurrentView();
  },

  changePageSize(size) {
    this.pageSize = size;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  getFilteredCarriers() {
    let carriers = [...window.BRIDGES_STORE.getCarriers()];

    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      carriers = carriers.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.operatingRegion.toLowerCase().includes(q)
      );
    }

    if (this.currentFilters.status !== 'ALL') {
      carriers = carriers.filter(c => c.status === this.currentFilters.status);
    }

    if (this.currentFilters.type !== 'ALL') {
      const target = this.currentFilters.type;
      carriers = carriers.filter(c => {
        const modes = this.getCarrierModalities(c.carrierType);
        if (target === 'Multi-Modal') {
          return modes.length > 1;
        }
        return modes.includes(target);
      });
    }

    carriers.sort((a, b) => {
      let valA = a[this.currentFilters.sortBy] || '';
      let valB = b[this.currentFilters.sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.currentFilters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return carriers;
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
    this.currentPage = 1;
    App.renderCurrentView();
  },

  handleTypeFilter(type) {
    this.currentFilters.type = type;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  handleStatusFilter(status) {
    this.currentFilters.status = status;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  resetFilters() {
    this.currentFilters.search = '';
    this.currentFilters.status = 'ALL';
    this.currentFilters.type = 'ALL';
    this.currentPage = 1;
    App.renderCurrentView();
  },

  // Modal: Add Carrier
  openAddCarrierModal() {
    const nextId = `CAR-${String(window.BRIDGES_STORE.getCarriers().length + 1).padStart(2, '0')}`;

    const formHtml = `
      <form id="add-carrier-form" onsubmit="CarriersView.handleAddCarrierSubmit(event)">
        <div class="form-grid">
          <div class="form-group col-4">
            <label class="form-label" for="carrier-id">Carrier ID <span class="required">*</span></label>
            <input type="text" id="carrier-id" name="id" class="form-control" value="${nextId}" required>
          </div>

          <div class="form-group col-8">
            <label class="form-label" for="carrier-name">Carrier Organization Name <span class="required">*</span></label>
            <input type="text" id="carrier-name" name="name" class="form-control" placeholder="e.g. Apex Freight Systems" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="carrier-contact">Primary Contact Person <span class="required">*</span></label>
            <input type="text" id="carrier-contact" name="contactPerson" class="form-control" placeholder="e.g. Amara Chen" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="carrier-email">Contact Email <span class="required">*</span></label>
            <input type="email" id="carrier-email" name="email" class="form-control" placeholder="dispatch@carrier.com" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="carrier-phone">Contact Phone <span class="required">*</span></label>
            <input type="tel" id="carrier-phone" name="phone" class="form-control" placeholder="+1 (555) 000-0000" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="carrier-region">Operating Region <span class="required">*</span></label>
            <input type="text" id="carrier-region" name="operatingRegion" class="form-control" placeholder="e.g. North America Central" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="carrier-status">Initial Status</label>
            <select id="carrier-status" name="status" class="form-control">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="form-group col-12">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Supported Transport Modalities <span class="required">*</span></span>
              <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Check one, two, or all three types)</span>
            </label>
            <div class="carrier-modality-checkboxes">
              <label class="modality-checkbox-card is-checked" id="chk-card-ground">
                <input type="checkbox" name="carrierModalities" value="Ground" checked onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">🚛</span>
                  <div class="modality-text">
                    <strong>Ground</strong>
                    <small>Road &amp; Trucking Freight</small>
                  </div>
                </div>
              </label>

              <label class="modality-checkbox-card" id="chk-card-air">
                <input type="checkbox" name="carrierModalities" value="Air" onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">✈️</span>
                  <div class="modality-text">
                    <strong>Air</strong>
                    <small>Air Cargo &amp; Express Jets</small>
                  </div>
                </div>
              </label>

              <label class="modality-checkbox-card" id="chk-card-sea">
                <input type="checkbox" name="carrierModalities" value="Sea" onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">🚢</span>
                  <div class="modality-text">
                    <strong>Sea</strong>
                    <small>Ocean &amp; Maritime Drayage</small>
                  </div>
                </div>
              </label>
            </div>
            <div id="carrier-modalities-hint" style="margin-top: 6px; font-size: 11px; color: #1E40AF; font-weight: 500;">
              Selected Modality: <span id="carrier-modalities-summary">Ground Only</span>
            </div>
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Register Carrier</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = 'Register New Carrier Partner';
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleAddCarrierSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const checkedModalities = Array.from(form.querySelectorAll('input[name="carrierModalities"]:checked')).map(el => el.value);
    if (checkedModalities.length === 0) {
      UI.showToast('Please select at least one carrier modality (Ground, Air, or Sea).', 'warning');
      return;
    }
    const carrierType = checkedModalities.join(', ');

    try {
      const newCarrier = window.BRIDGES_STORE.addCarrier({
        id: formData.get('id'),
        name: formData.get('name'),
        contactPerson: formData.get('contactPerson'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        operatingRegion: formData.get('operatingRegion'),
        carrierType: carrierType,
        status: formData.get('status')
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Carrier ${newCarrier.name} registered successfully.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Modal: Edit Carrier
  openEditCarrierModal(id) {
    const carrier = window.BRIDGES_STORE.getCarrier(id);
    if (!carrier) return;

    const carrierModes = this.getCarrierModalities(carrier.carrierType);
    const isGround = carrierModes.includes('Ground');
    const isAir = carrierModes.includes('Air');
    const isSea = carrierModes.includes('Sea');

    const formHtml = `
      <form id="edit-carrier-form" onsubmit="CarriersView.handleEditCarrierSubmit(event, '${carrier.id}')">
        <div class="form-grid">
          <div class="form-group col-4">
            <label class="form-label">Carrier ID</label>
            <input type="text" class="form-control" value="${carrier.id}" disabled>
          </div>

          <div class="form-group col-8">
            <label class="form-label" for="edit-c-name">Carrier Name <span class="required">*</span></label>
            <input type="text" id="edit-c-name" name="name" class="form-control" value="${carrier.name}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-c-contact">Primary Contact Person <span class="required">*</span></label>
            <input type="text" id="edit-c-contact" name="contactPerson" class="form-control" value="${carrier.contactPerson}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-c-email">Contact Email <span class="required">*</span></label>
            <input type="email" id="edit-c-email" name="email" class="form-control" value="${carrier.email}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-c-phone">Contact Phone <span class="required">*</span></label>
            <input type="tel" id="edit-c-phone" name="phone" class="form-control" value="${carrier.phone}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-c-region">Operating Region <span class="required">*</span></label>
            <input type="text" id="edit-c-region" name="operatingRegion" class="form-control" value="${carrier.operatingRegion}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-c-status">Status</label>
            <select id="edit-c-status" name="status" class="form-control">
              <option value="Active" ${carrier.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${carrier.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div class="form-group col-12">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Supported Transport Modalities <span class="required">*</span></span>
              <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Check one, two, or all three types)</span>
            </label>
            <div class="carrier-modality-checkboxes">
              <label class="modality-checkbox-card ${isGround ? 'is-checked' : ''}" id="edit-chk-card-ground">
                <input type="checkbox" name="carrierModalities" value="Ground" ${isGround ? 'checked' : ''} onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">🚛</span>
                  <div class="modality-text">
                    <strong>Ground</strong>
                    <small>Road &amp; Trucking Freight</small>
                  </div>
                </div>
              </label>

              <label class="modality-checkbox-card ${isAir ? 'is-checked' : ''}" id="edit-chk-card-air">
                <input type="checkbox" name="carrierModalities" value="Air" ${isAir ? 'checked' : ''} onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">✈️</span>
                  <div class="modality-text">
                    <strong>Air</strong>
                    <small>Air Cargo &amp; Express Jets</small>
                  </div>
                </div>
              </label>

              <label class="modality-checkbox-card ${isSea ? 'is-checked' : ''}" id="edit-chk-card-sea">
                <input type="checkbox" name="carrierModalities" value="Sea" ${isSea ? 'checked' : ''} onchange="CarriersView.handleModalityCardToggle(this)">
                <div class="modality-card-content">
                  <span class="modality-icon">🚢</span>
                  <div class="modality-text">
                    <strong>Sea</strong>
                    <small>Ocean &amp; Maritime Drayage</small>
                  </div>
                </div>
              </label>
            </div>
            <div id="carrier-modalities-hint" style="margin-top: 6px; font-size: 11px; color: #1E40AF; font-weight: 500;">
              Selected Modality: <span id="carrier-modalities-summary">${carrierModes.length > 1 ? `Multi-Modal (${carrierModes.join(' + ')})` : `${carrierModes[0] || 'Ground'} Only`}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Update Carrier</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = `Edit Carrier: ${carrier.name} (${carrier.id})`;
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleEditCarrierSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const checkedModalities = Array.from(form.querySelectorAll('input[name="carrierModalities"]:checked')).map(el => el.value);
    if (checkedModalities.length === 0) {
      UI.showToast('Please select at least one carrier modality (Ground, Air, or Sea).', 'warning');
      return;
    }
    const carrierType = checkedModalities.join(', ');

    try {
      window.BRIDGES_STORE.updateCarrier(id, {
        name: formData.get('name'),
        contactPerson: formData.get('contactPerson'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        operatingRegion: formData.get('operatingRegion'),
        carrierType: carrierType,
        status: formData.get('status')
      });

      UI.closeModal('generic-app-modal');
      UI.showToast('Carrier details updated successfully.', 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // View Carrier Details (Clean view page matching the Edit page layout)
  currentProfileTab: 'profile',

  switchProfileTab(carrierId, tabName) {
    this.currentProfileTab = tabName;
    this.viewCarrierProfile(carrierId);
  },

  viewCarrierProfile(id) {
    const carrier = window.BRIDGES_STORE.getCarrier(id);
    if (!carrier) return;

    const carrierModes = this.getCarrierModalities(carrier.carrierType);
    const isGround = carrierModes.includes('Ground');
    const isAir = carrierModes.includes('Air');
    const isSea = carrierModes.includes('Sea');

    const contentHtml = `
      <div class="view-carrier-details animate-fade-in">
        <div class="form-grid">
          <div class="form-group col-4">
            <label class="form-label">Carrier ID</label>
            <input type="text" class="form-control" value="${carrier.id}" readonly style="background: #F8FAFC; color: #1E293B; font-weight: 600; cursor: default;">
          </div>

          <div class="form-group col-8">
            <label class="form-label">Carrier Name</label>
            <input type="text" class="form-control" value="${carrier.name}" readonly style="background: #F8FAFC; color: #1E293B; font-weight: 600; cursor: default;">
          </div>

          <div class="form-group col-6">
            <label class="form-label">Primary Contact Person</label>
            <input type="text" class="form-control" value="${carrier.contactPerson || '—'}" readonly style="background: #F8FAFC; color: #1E293B; cursor: default;">
          </div>

          <div class="form-group col-6">
            <label class="form-label">Contact Email</label>
            <input type="email" class="form-control font-mono" value="${carrier.email || '—'}" readonly style="background: #F8FAFC; color: #1E293B; cursor: default;">
          </div>

          <div class="form-group col-6">
            <label class="form-label">Contact Phone</label>
            <input type="text" class="form-control" value="${carrier.phone || '—'}" readonly style="background: #F8FAFC; color: #1E293B; cursor: default;">
          </div>

          <div class="form-group col-6">
            <label class="form-label">Operating Region</label>
            <input type="text" class="form-control" value="${carrier.operatingRegion || '—'}" readonly style="background: #F8FAFC; color: #1E293B; cursor: default;">
          </div>

          <div class="form-group col-6">
            <label class="form-label">Status</label>
            <div class="form-control" style="background: #F8FAFC; display: flex; align-items: center; height: 38px; cursor: default;">
              ${carrier.status === 'Active' 
                ? '<span class="status-pill on-route" style="background: #ECFDF5; color: #059669; font-weight: 700;"><span class="status-pill-dot" style="background: #10B981;"></span>Active</span>' 
                : '<span class="status-pill delayed" style="background: #FEF2F2; color: #DC2626; font-weight: 700;"><span class="status-pill-dot" style="background: #EF4444;"></span>Inactive</span>'}
            </div>
          </div>

          <div class="form-group col-12">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Supported Transport Modalities</span>
              <span style="font-size: 11px; color: #64748B; font-weight: normal;">Active operational fleet types</span>
            </label>
            <div class="carrier-modality-checkboxes">
              <div class="modality-checkbox-card ${isGround ? 'is-checked' : ''}" style="${!isGround ? 'opacity: 0.38; filter: grayscale(1);' : 'pointer-events: none;'}">
                <div class="modality-card-content">
                  <span class="modality-icon">🚛</span>
                  <div class="modality-text">
                    <strong>Ground</strong>
                    <small>Road &amp; Trucking Freight</small>
                  </div>
                </div>
              </div>

              <div class="modality-checkbox-card ${isAir ? 'is-checked' : ''}" style="${!isAir ? 'opacity: 0.38; filter: grayscale(1);' : 'pointer-events: none;'}">
                <div class="modality-card-content">
                  <span class="modality-icon">✈️</span>
                  <div class="modality-text">
                    <strong>Air</strong>
                    <small>Air Cargo &amp; Express Jets</small>
                  </div>
                </div>
              </div>

              <div class="modality-checkbox-card ${isSea ? 'is-checked' : ''}" style="${!isSea ? 'opacity: 0.38; filter: grayscale(1);' : 'pointer-events: none;'}">
                <div class="modality-card-content">
                  <span class="modality-icon">🚢</span>
                  <div class="modality-text">
                    <strong>Sea</strong>
                    <small>Ocean &amp; Maritime Drayage</small>
                  </div>
                </div>
              </div>
            </div>
            <div id="carrier-modalities-hint" style="margin-top: 6px; font-size: 11px; color: #1E40AF; font-weight: 500;">
              Active Modality: <span>${carrierModes.length > 1 ? `Multi-Modal (${carrierModes.join(' + ')})` : `${carrierModes[0] || 'Ground'} Only`}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button type="button" class="btn btn-primary" onclick="CarriersView.openEditCarrierModal('${carrier.id}')">
            ${Icons.edit(14)} Edit Carrier
          </button>
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = `View Carrier: ${carrier.name} (${carrier.id})`;
    document.getElementById('generic-modal-body').innerHTML = contentHtml;
    UI.openModal('generic-app-modal');
  },

  // Document Management Methods
  openAddDocumentModal(carrierId) {
    const carrier = window.BRIDGES_STORE.getCarrier(carrierId);
    if (!carrier) return;

    const formHtml = `
      <form onsubmit="CarriersView.handleSaveDocument(event, '${carrier.id}')">
        <div class="form-group mb-3">
          <label class="form-label" for="doc-type">Document Classification <span class="required">*</span></label>
          <select id="doc-type" name="docType" class="form-control" required>
            <option value="Master Services Agreement (MSA)">Master Services Agreement (MSA)</option>
            <option value="Fleet Cargo Liability Insurance">Fleet Cargo Liability Insurance</option>
            <option value="HazMat Transportation Permit">HazMat Transportation Permit</option>
            <option value="Good Distribution Practice (GDP) Pharma">Good Distribution Practice (GDP) Pharma</option>
            <option value="Air Carrier Operating Certificate">Air Carrier Operating Certificate</option>
            <option value="Carrier Safety Rating">Carrier Safety Rating</option>
          </select>
        </div>

        <div class="form-group mb-3">
          <label class="form-label" for="doc-title">Document Title / Policy Reference <span class="required">*</span></label>
          <input type="text" id="doc-title" name="title" class="form-control" placeholder="e.g. Certificate of Commercial Cargo Insurance ($10M)" required>
        </div>

        <div class="form-grid">
          <div class="form-group col-6 mb-3">
            <label class="form-label" for="doc-issue">Effective Issue Date <span class="required">*</span></label>
            <input type="date" id="doc-issue" name="issueDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required>
          </div>
          <div class="form-group col-6 mb-3">
            <label class="form-label" for="doc-expiry">Expiration Date <span class="required">*</span></label>
            <input type="date" id="doc-expiry" name="expiryDate" class="form-control" value="2027-12-31" required>
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label" for="doc-file">Simulated Digital Attachment</label>
          <input type="text" id="doc-file" name="fileRef" class="form-control" value="Compliance-Cert-${carrier.id}-Verified.pdf">
          <span class="field-hint">Electronic verification hash attached upon save.</span>
        </div>

        <div class="modal-footer mt-3">
          <button type="button" class="btn btn-secondary" onclick="CarriersView.viewCarrierProfile('${carrier.id}', 'documents')">Back</button>
          <button type="submit" class="btn btn-primary">${Icons.check(14)} Save &amp; Verify Document</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = `Upload Compliance Document: ${carrier.name}`;
    document.getElementById('generic-modal-body').innerHTML = formHtml;
  },

  handleSaveDocument(e, carrierId) {
    e.preventDefault();
    const form = e.target;
    const docType = form.docType.value;
    const title = form.title.value.trim();
    const issueDate = form.issueDate.value;
    const expiryDate = form.expiryDate.value;
    const fileRef = form.fileRef.value.trim();

    window.BRIDGES_STORE.addCarrierDocument({
      carrierId,
      docType,
      title,
      issueDate,
      expiryDate,
      fileRef,
      status: 'Verified',
      uploadedBy: 'Bima Ary (Administrator)'
    });

    UI.showToast(`Document "${title}" uploaded and verified.`, 'success');
    this.viewCarrierProfile(carrierId, 'documents');
  },

  downloadDocument(docId, title) {
    UI.showToast(`Generating certified PDF copy for "${title}"...`, 'info');
    setTimeout(() => {
      const content = `==========================================================\nBRIDGES LOGISTICS GOVERNANCE - CARRIER COMPLIANCE CERTIFICATE\n==========================================================\nDocument ID: ${docId}\nDocument Title: ${title}\nAudit Status: VERIFIED & COMPLIANT\nVerification Authority: BRIDGES Enterprise Control Tower Administrator\nDigital Fingerprint: SHA256:${Math.random().toString(36).substring(2, 15)}\n==========================================================\n`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docId}-Verification.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.showToast(`Certificate downloaded.`, 'success');
    }, 300);
  },

  deleteDocument(docId, carrierId) {
    UI.confirm({
      title: 'Delete Compliance Document',
      message: 'Are you sure you want to remove this verified carrier compliance document?',
      confirmText: 'Delete Document',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteCarrierDocument(docId);
        UI.showToast('Compliance document removed.', 'info');
        this.viewCarrierProfile(carrierId, 'documents');
      }
    });
  },

  // Toggle Carrier Status with Confirmation (US-10)
  confirmToggleStatus(id) {
    const carrier = window.BRIDGES_STORE.getCarrier(id);
    if (!carrier) return;

    const isDeactivating = carrier.status === 'Active';
    const actionWord = isDeactivating ? 'Deactivate' : 'Activate';

    UI.confirm({
      title: `${actionWord} Carrier Partner`,
      message: `Are you sure you want to <strong>${actionWord.toLowerCase()}</strong> carrier <strong>${carrier.name}</strong> (${carrier.id})?<br><br>
        <span class="text-sm text-muted">${isDeactivating 
          ? 'Notice: Inactive carriers will be prevented from accepting new operational shipment assignments. All historical shipments, carrier user profiles, and audit records remain securely preserved.' 
          : 'The carrier will be reactivated and restored to operational dispatch eligibility.'}</span>`,
      confirmText: `${actionWord} Carrier`,
      confirmType: isDeactivating ? 'danger' : 'success',
      onConfirm: () => {
        window.BRIDGES_STORE.toggleCarrierStatus(id);
        UI.showToast(`Carrier ${carrier.name} has been ${isDeactivating ? 'deactivated' : 'activated'}.`, 'success');
        App.renderCurrentView();
      }
    });
  }
};

window.CarriersView = CarriersView;
