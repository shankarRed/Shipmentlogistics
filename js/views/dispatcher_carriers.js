/**
 * BRIDGES Control Tower - Carrier Assignment Directory (US-48 & US-51)
 * Displays carrier master records, operating regions, dedicated fleet capabilities,
 * active/inactive status enforcement, and quick assignment triggers.
 */

const DispatcherCarriersView = {
  searchQuery: '',
  regionFilter: 'All',
  statusFilter: 'All',
  typeFilter: 'All',
  currentPage: 1,
  pageSize: 24,

  setTypeFilter(val) {
    this.typeFilter = val;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  render() {
    const carriers = window.BRIDGES_STORE.getCarriers();
    const resources = window.BRIDGES_STORE.getResources ? window.BRIDGES_STORE.getResources() : [];

    // Pre-index vehicles and drivers by carrier for instant lookups
    const vehiclesByCarrier = {};
    const driversByCarrier = {};
    resources.forEach(r => {
      if (r.carrierId) {
        if (r.type === 'Vehicle') {
          if (!vehiclesByCarrier[r.carrierId]) vehiclesByCarrier[r.carrierId] = [];
          vehiclesByCarrier[r.carrierId].push(r);
        } else if (r.type === 'Driver') {
          if (!driversByCarrier[r.carrierId]) driversByCarrier[r.carrierId] = [];
          driversByCarrier[r.carrierId].push(r);
        }
      }
    });

    const filtered = carriers.filter(c => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const mName = c.name.toLowerCase().includes(q);
        const mId = c.id.toLowerCase().includes(q);
        const mRegion = (c.operatingRegion || '').toLowerCase().includes(q);
        if (!mName && !mId && !mRegion) return false;
      }
      if (this.regionFilter !== 'All' && c.operatingRegion !== this.regionFilter) return false;
      if (this.statusFilter !== 'All' && c.status !== this.statusFilter) return false;
      if (this.typeFilter !== 'All') {
        const norm = window.CarriersView ? CarriersView.normalizeType(c.carrierType) : c.carrierType;
        if (norm !== this.typeFilter && c.carrierType !== this.typeFilter) return false;
      }
      return true;
    });

    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageCarriers = filtered.slice(startIndex, startIndex + this.pageSize);

    const regions = [...new Set(carriers.map(c => c.operatingRegion).filter(Boolean))];

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER -->
        <div class="page-action-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Carrier Assignment Directory</h2>
              <span class="badge badge-primary">${filtered.length} Carriers</span>
            </div>
            <p class="page-subheading">
              Shared master carrier registry. Only Active partner carriers may be allocated for recovery re-routing and alternate carrier dispatches.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_planning')">
            Open Planning Workspace
          </button>
        </div>

        <!-- SEARCH & FILTER BAR -->
        <div class="panel" style="margin-bottom: 16px; padding: 12px 14px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input type="text" 
                     class="search-input" 
                     style="width: 100%; padding: 6px 10px 6px 30px; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px;"
                     placeholder="Search carrier name, code, region..." 
                     value="${this.searchQuery}"
                     oninput="DispatcherCarriersView.handleSearch(this.value)">
              <span style="position: absolute; left: 9px; top: 7px; color: #94A3B8;">${Icons.search(13)}</span>
            </div>

            <div style="display: flex; gap: 8px;">
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherCarriersView.setTypeFilter(this.value)">
                <option value="All" ${this.typeFilter === 'All' ? 'selected' : ''}>All Modalities (Ground, Air, Sea)</option>
                <option value="Ground" ${this.typeFilter === 'Ground' ? 'selected' : ''}>🚛 Ground</option>
                <option value="Air" ${this.typeFilter === 'Air' ? 'selected' : ''}>✈️ Air</option>
                <option value="Sea" ${this.typeFilter === 'Sea' ? 'selected' : ''}>🚢 Sea</option>
                <option value="Multi-Modal" ${this.typeFilter === 'Multi-Modal' ? 'selected' : ''}>🌐 Multi-Modal</option>
              </select>

              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherCarriersView.setRegionFilter(this.value)">
                <option value="All" ${this.regionFilter === 'All' ? 'selected' : ''}>All Regions</option>
                ${regions.map(r => `<option value="${r}" ${this.regionFilter === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>

              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherCarriersView.setStatusFilter(this.value)">
                <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Active" ${this.statusFilter === 'Active' ? 'selected' : ''}>Active Only (Eligible)</option>
                <option value="Inactive" ${this.statusFilter === 'Inactive' ? 'selected' : ''}>Inactive (Ineligible)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- CARRIER CARDS GRID -->
        <div class="carrier-directory-grid">
          ${pageCarriers.map(carrier => {
            const isActive = carrier.status === 'Active';
            const carrierVehicles = vehiclesByCarrier[carrier.id] || [];
            const carrierDrivers = driversByCarrier[carrier.id] || [];

            return `
              <div class="carrier-dir-card ${!isActive ? 'carrier-inactive' : ''}">
                <div>
                  <div class="carrier-dir-header">
                    <div>
                      <div class="carrier-dir-name">${carrier.name}</div>
                      <div class="carrier-dir-code" style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                        <span>${carrier.id}</span>
                        ${window.CarriersView ? CarriersView.renderTypeBadge(carrier.carrierType) : `<span class="badge badge-secondary">${carrier.carrierType}</span>`}
                      </div>
                    </div>
                    <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                      ${carrier.status}
                    </span>
                  </div>

                  <div style="font-size: 11.5px; color: var(--color-charcoal); margin-bottom: 6px;">
                    Region: <strong>${carrier.operatingRegion}</strong>
                  </div>

                  <div class="carrier-dir-specs">
                    <div>
                      <span style="color: var(--color-muted-sage); display: block;">Rating</span>
                      <strong style="color: #F59E0B;">★ ${carrier.rating || '4.8'}</strong>
                    </div>
                    <div>
                      <span style="color: var(--color-muted-sage); display: block;">Registered Fleet</span>
                      <strong>${carrierVehicles.length} Vehicles</strong>
                    </div>
                    <div>
                      <span style="color: var(--color-muted-sage); display: block;">Active Drivers</span>
                      <strong>${carrierDrivers.length} Drivers</strong>
                    </div>
                    <div>
                      <span style="color: var(--color-muted-sage); display: block;">Contact</span>
                      <span style="color: var(--color-royal-navy);">${carrier.contactPerson || 'Dispatch Hub'}</span>
                    </div>
                  </div>

                  <div style="font-size: 11px; color: var(--color-muted-sage); margin-bottom: 10px; line-height: 1.35;">
                    ${carrier.email} · ${carrier.phone}
                  </div>
                </div>

                <div>
                  ${isActive ? `
                    <button class="btn btn-primary btn-sm" 
                            style="width: 100%; font-weight: 700;"
                            onclick="DispatcherCarriersView.openQuickAssignModal('${carrier.id}')">
                      Allocate to Recovery
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" 
                            style="width: 100%; cursor: not-allowed; opacity: 0.6;" 
                            disabled 
                            title="Inactive carriers cannot receive new recovery assignments per governance rules">
                      Ineligible (Inactive)
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Pagination Controls -->
        <div class="pagination-container" style="margin-top: 16px; border-radius: 8px;">
          <div>
            Showing <strong>${totalRecords > 0 ? startIndex + 1 : 0}</strong> to <strong>${Math.min(startIndex + this.pageSize, totalRecords)}</strong> of <strong>${totalRecords}</strong> carriers (${carriers.length} total)
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="DispatcherCarriersView.goToPage(1)" title="First Page">«</button>
            <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="DispatcherCarriersView.goToPage(${this.currentPage - 1})" title="Previous Page">‹ Prev</button>
            <span style="padding: 0 8px; font-weight: 600; font-size: 12px;">Page ${this.currentPage} of ${totalPages}</span>
            <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="DispatcherCarriersView.goToPage(${this.currentPage + 1})" title="Next Page">Next ›</button>
            <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="DispatcherCarriersView.goToPage(${totalPages})" title="Last Page">»</button>
          </div>
        </div>
      </div>
    `;
  },

  goToPage(p) {
    this.currentPage = Math.max(1, p);
    App.renderCurrentView();
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  setRegionFilter(val) {
    this.regionFilter = val;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  setStatusFilter(val) {
    this.statusFilter = val;
    this.currentPage = 1;
    App.renderCurrentView();
  },

  setStatusFilter(val) {
    this.statusFilter = val;
    App.renderCurrentView();
  },

  openQuickAssignModal(carrierId) {
    const carrier = window.BRIDGES_STORE.getCarrier(carrierId);
    if (!carrier) return;

    const actionable = window.BRIDGES_STORE.getExceptions().filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Recovery in Progress'].includes(e.status)
    );

    if (actionable.length === 0) {
      UI.showToast("No active exceptions currently require carrier allocation.", "info");
      return;
    }

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--color-light-blue-grey);">
          <div style="font-weight: 800; font-size: 14px; color: var(--color-midnight);">${carrier.name} (${carrier.id})</div>
          <div style="font-size: 11.5px; color: var(--color-muted-sage);">Operating Region: ${carrier.operatingRegion}</div>
        </div>

        <form id="quick-assign-form" onsubmit="DispatcherCarriersView.handleQuickAssignSubmit(event, '${carrier.id}')">
          <div class="planning-form-group">
            <label class="planning-form-label">Select Target Exception *</label>
            <select name="targetExceptionId" class="planning-select" required>
              ${actionable.map(e => `
                <option value="${e.id}">${e.id} (${e.shipmentId}) — ${e.reason} [${e.severity}]</option>
              `).join('')}
            </select>
          </div>

          <div class="planning-form-group">
            <label class="planning-form-label">Operational Notes *</label>
            <textarea name="notes" class="planning-textarea" required placeholder="Handover instructions for ${carrier.name}...">Selected ${carrier.name} as alternate replacement carrier for urgent corridor salvage.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Submit Allocation</button>
          </div>
        </form>
      </div>
    `;

    UI.openModal('generic-app-modal', `Allocate Carrier — ${carrier.id}`, modalHtml);
  },

  handleQuickAssignSubmit(e, carrierId) {
    e.preventDefault();
    const form = e.target;
    const excId = form.targetExceptionId.value;
    const notes = form.notes.value;

    const exception = window.BRIDGES_STORE.getException(excId);
    if (!exception) return;

    try {
      const rec = window.BRIDGES_STORE.createRecoveryRequest({
        exceptionId: exception.id,
        shipmentId: exception.shipmentId,
        recoveryStrategy: 'Alternate Carrier',
        requestedCarrierId: carrierId,
        reasonForRecovery: `Alternate carrier allocated via directory: ${exception.reason}`,
        operationalNotes: notes,
        expectedEtaImpact: '-2h 30m alternate carrier transfer'
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Carrier allocated. Recovery request ${rec.id} submitted.`, 'success');
      App.navigateTo('dispatcher_recoveries');
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.DispatcherCarriersView = DispatcherCarriersView;
