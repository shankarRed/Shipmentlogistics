/**
 * BRIDGES Control Tower - Analyst Active Shipments View (US-17 to US-20)
 * Searchable shipment table with multi-criteria filtering, sorting, pagination,
 * and comprehensive detail modal with SVG route schematic, milestones, carrier assignment,
 * and related exception indicators.
 */

const AnalystShipmentsView = {
  searchQuery: '',
  statusFilter: 'All',
  carrierFilter: 'All',
  severityFilter: 'All',
  slaFilter: 'All',
  sortField: 'departureTime',
  sortDir: 'desc',
  currentPage: 1,
  pageSize: 8,

  render() {
    const shipments = window.BRIDGES_STORE.getShipments();
    const carriers = window.BRIDGES_STORE.getCarriers();

    // Filter shipments
    let filtered = shipments.filter(s => {
      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const carrier = carriers.find(c => c.id === s.carrierId);
        const matchId = s.id.toLowerCase().includes(q);
        const matchOrder = s.orderReference && s.orderReference.toLowerCase().includes(q);
        const matchOrigin = s.origin && s.origin.toLowerCase().includes(q);
        const matchDest = s.destination && s.destination.toLowerCase().includes(q);
        const matchCargo = s.cargoType && s.cargoType.toLowerCase().includes(q);
        const matchCarrier = carrier && carrier.name.toLowerCase().includes(q);
        const matchVehicle = s.vehicleId && s.vehicleId.toLowerCase().includes(q);
        const matchDriver = s.driverName && s.driverName.toLowerCase().includes(q);
        if (!matchId && !matchOrder && !matchOrigin && !matchDest && !matchCargo && !matchCarrier && !matchVehicle && !matchDriver) return false;
      }

      // Status
      if (this.statusFilter !== 'All') {
        if (s.status !== this.statusFilter) return false;
      }

      // Carrier
      if (this.carrierFilter !== 'All') {
        if (s.carrierId !== this.carrierFilter) return false;
      }

      // Severity
      if (this.severityFilter !== 'All') {
        const excs = window.BRIDGES_STORE.getExceptions().filter(e => e.shipmentId === s.id);
        const hasSev = excs.some(e => e.severity === this.severityFilter);
        if (!hasSev) return false;
      }

      // SLA Risk
      if (this.slaFilter !== 'All') {
        if ((s.slaRisk || 'None') !== this.slaFilter) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let valA = a[this.sortField] || '';
      let valB = b[this.sortField] || '';
      if (this.sortDir === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    // Pagination
    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = filtered.slice(startIndex, startIndex + this.pageSize);

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Active Shipments Registry</h2>
              <span class="role-indicator-pill">Live Operations</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Operational surveillance of all freight movements, carrier dispatch telemetry, and active deviations.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystShipmentsView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset Filters</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_events')">
              ${Icons.events ? Icons.events(14) : ''}
              <span>Simulate Event</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Shipment ID, Order Ref, Carrier, Vehicle, Driver..." 
              value="${this.searchQuery}" 
              oninput="AnalystShipmentsView.handleSearch(this.value)"
            >
          </div>

          <!-- Status Filter -->
          <select class="filter-select" onchange="AnalystShipmentsView.handleFilter('statusFilter', this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="On Route" ${this.statusFilter === 'On Route' ? 'selected' : ''}>On Route</option>
            <option value="Loading" ${this.statusFilter === 'Loading' ? 'selected' : ''}>Loading</option>
            <option value="Delayed" ${this.statusFilter === 'Delayed' ? 'selected' : ''}>Delayed</option>
            <option value="Delivered" ${this.statusFilter === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>

          <!-- Carrier Filter -->
          <select class="filter-select" onchange="AnalystShipmentsView.handleFilter('carrierFilter', this.value)">
            <option value="All" ${this.carrierFilter === 'All' ? 'selected' : ''}>All Carriers</option>
            ${carriers.map(c => `
              <option value="${c.id}" ${this.carrierFilter === c.id ? 'selected' : ''}>${c.name} (${c.id})</option>
            `).join('')}
          </select>

          <!-- Severity Filter -->
          <select class="filter-select" onchange="AnalystShipmentsView.handleFilter('severityFilter', this.value)">
            <option value="All" ${this.severityFilter === 'All' ? 'selected' : ''}>All Severities</option>
            <option value="Critical" ${this.severityFilter === 'Critical' ? 'selected' : ''}>Critical Severity</option>
            <option value="High" ${this.severityFilter === 'High' ? 'selected' : ''}>High Severity</option>
            <option value="Medium" ${this.severityFilter === 'Medium' ? 'selected' : ''}>Medium Severity</option>
            <option value="Low" ${this.severityFilter === 'Low' ? 'selected' : ''}>Low Severity</option>
          </select>

          <!-- SLA Risk Filter -->
          <select class="filter-select" onchange="AnalystShipmentsView.handleFilter('slaFilter', this.value)">
            <option value="All" ${this.slaFilter === 'All' ? 'selected' : ''}>All SLA Risk Levels</option>
            <option value="Critical" ${this.slaFilter === 'Critical' ? 'selected' : ''}>Critical Risk</option>
            <option value="High" ${this.slaFilter === 'High' ? 'selected' : ''}>High Risk</option>
            <option value="Medium" ${this.slaFilter === 'Medium' ? 'selected' : ''}>Medium Risk</option>
            <option value="None" ${this.slaFilter === 'None' ? 'selected' : ''}>No Risk</option>
          </select>
        </div>

        <!-- Table Card -->
        <div class="card" style="padding: 0; overflow: hidden;">
          ${paginated.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">
                ${Icons.truck(22)}
              </div>
              <div class="empty-state-title">No Shipments Found</div>
              <div class="empty-state-sub">No shipment records matched your active filter criteria. Try adjusting or clearing search filters.</div>
              <button class="btn btn-secondary btn-sm mt-3" onclick="AnalystShipmentsView.resetFilters()">Clear Filters</button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table" id="analyst-shipments-table" style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                <colgroup>
                  <col style="width: 11%;">
                  <col style="width: 11%;">
                  <col style="width: 18%;">
                  <col style="width: 11%;">
                  <col style="width: 15%;">
                  <col style="width: 13%;">
                  <col style="width: 11%;">
                  <col style="width: 10%;">
                </colgroup>
                <thead>
                  <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
                    <th onclick="AnalystShipmentsView.handleSort('id')" class="cursor-pointer" style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">
                      <div class="th-content" style="display: inline-flex; align-items: center; gap: 4px;">Shipment ID ${this.renderSortIcon('id')}</div>
                    </th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Order Ref</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Carrier</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Vehicle</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Driver</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Status</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Exceptions</th>
                    <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; white-space: nowrap;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.map(s => {
                    const carrier = carriers.find(c => c.id === s.carrierId);
                    const excs = window.BRIDGES_STORE.getExceptions().filter(e => e.shipmentId === s.id);
                    const openExc = excs.find(e => ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status));
                    const vehIcon = carrier && carrier.carrierType === 'Air' 
                      ? (Icons.plane ? Icons.plane(13) : '✈️')
                      : carrier && carrier.carrierType === 'Sea'
                      ? (Icons.ship ? Icons.ship(13) : '🚢')
                      : (Icons.truck ? Icons.truck(13) : '🚚');

                    return `
                      <tr style="border-bottom: 1px solid #F1F5F9; transition: background-color 0.15s ease; cursor: pointer;" onclick="AnalystShipmentsView.openDetailModal('${s.id}')">
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          <span style="font-weight: 700; color: #18217E; font-size: 12px; font-family: 'JetBrains Mono', Consolas, monospace; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 2.5px 7px; border-radius: 4px; display: inline-block;">${s.id}</span>
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          <span style="font-size: 11.5px; color: #475569; font-weight: 600; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2.5px 7px; border-radius: 4px; display: inline-block;">${s.orderReference || 'ORD-SYNC'}</span>
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-weight: 700; color: #0F172A; font-size: 12.5px; line-height: 1.2;">${carrier ? carrier.name : s.carrierId}</span>
                            <span style="font-size: 11px; color: #64748B;">${carrier && carrier.carrierType ? carrier.carrierType : 'Carrier Partner'}</span>
                          </div>
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11.5px; font-weight: 700; color: #1E293B; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2.5px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
                            ${vehIcon} ${s.vehicleId || 'Unassigned'}
                          </span>
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #1E293B; white-space: nowrap;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: #EEF2F6; color: #475569; font-size: 10.5px; flex-shrink: 0;">👤</span>
                            <span>${s.driverName || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          ${this.renderStatusPill(s.status)}
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle;">
                          ${openExc ? `
                            <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(openExc.severity)}" style="font-size: 11px; padding: 3px 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" title="${openExc.type}: ${openExc.rootCause}">
                              ⚠ ${openExc.severity}
                            </span>
                          ` : excs.length > 0 ? `
                            <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-size: 11px; padding: 3px 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                              ✓ Resolved
                            </span>
                          ` : `
                            <span style="color: #94A3B8; font-size: 12px; font-weight: 500;">None</span>
                          `}
                        </td>
                        <td style="padding: 13px 16px; vertical-align: middle; text-align: right;">
                          <button class="btn btn-secondary btn-sm" style="padding: 4px 12px; font-size: 11.5px; font-weight: 600;" onclick="event.stopPropagation(); AnalystShipmentsView.openDetailModal('${s.id}')">
                            Details
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Footer Pagination -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 18px; border-top: 1px solid #E2E8F0; font-size: 12px; background: #F8FAFC;">
              <span style="color: #64748B;">
                Showing <strong>${startIndex + 1}</strong> to <strong>${Math.min(startIndex + this.pageSize, totalRecords)}</strong> of <strong>${totalRecords}</strong> shipments
              </span>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button 
                  class="btn btn-secondary btn-sm" 
                  ${this.currentPage <= 1 ? 'disabled' : ''} 
                  onclick="AnalystShipmentsView.changePage(${this.currentPage - 1})"
                >
                  Previous
                </button>
                <span style="display: flex; align-items: center; padding: 0 8px; font-weight: 600; color: #1E293B;">
                  Page ${this.currentPage} of ${totalPages}
                </span>
                <button 
                  class="btn btn-secondary btn-sm" 
                  ${this.currentPage >= totalPages ? 'disabled' : ''} 
                  onclick="AnalystShipmentsView.changePage(${this.currentPage + 1})"
                >
                  Next
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    this.currentPage = 1;
    if (window.App && App.currentView === 'analyst_shipments') {
      App.renderCurrentView();
    }
  },

  handleFilter(field, val) {
    this[field] = val;
    this.currentPage = 1;
    if (window.App && App.currentView === 'analyst_shipments') {
      App.renderCurrentView();
    }
  },

  handleSort(field) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    if (window.App && App.currentView === 'analyst_shipments') {
      App.renderCurrentView();
    }
  },

  renderSortIcon(field) {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  },

  changePage(page) {
    this.currentPage = page;
    if (window.App && App.currentView === 'analyst_shipments') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.carrierFilter = 'All';
    this.severityFilter = 'All';
    this.slaFilter = 'All';
    this.currentPage = 1;
    if (window.App && App.currentView === 'analyst_shipments') {
      App.renderCurrentView();
    }
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'On Route': return 'badge-primary';
      case 'Loading': return 'badge-warning';
      case 'Ready for Pickup': return 'badge-secondary';
      case 'Delayed': return 'badge-danger';
      case 'Delivered': return 'badge-success';
      default: return 'badge-muted';
    }
  },

  renderStatusPill(status) {
    switch (status) {
      case 'On Route':
        return `<span class="badge badge-primary" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #1967D2; flex-shrink: 0;"></span> On Route</span>`;
      case 'Loading':
        return `<span class="badge badge-warning" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #B45309; flex-shrink: 0;"></span> Loading</span>`;
      case 'Ready for Pickup':
        return `<span class="badge badge-secondary" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #64748B; flex-shrink: 0;"></span> Ready for Pickup</span>`;
      case 'Delayed':
        return `<span class="badge badge-danger" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #DC2626; flex-shrink: 0;"></span> Delayed</span>`;
      case 'Delivered':
        return `<span class="badge badge-success" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #1E8E3E; flex-shrink: 0;"></span> Delivered</span>`;
      default:
        return `<span class="badge badge-muted" style="font-size: 11.5px; padding: 3px 9px; font-weight: 600;">${status}</span>`;
    }
  },

  formatTime(isoString) {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  },

  // --- DETAIL MODAL (US-18 to US-20) ---
  openDetailModal(shipmentId) {
    const shipment = window.BRIDGES_STORE.getShipment(shipmentId);
    if (!shipment) return;

    const carrier = window.BRIDGES_STORE.getCarrier(shipment.carrierId);
    const exceptions = window.BRIDGES_STORE.getExceptions().filter(e => e.shipmentId === shipmentId);
    const recoveries = window.BRIDGES_STORE.getRecoveryRequests().filter(r => r.shipmentId === shipmentId);

    const contentHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Shipment Quick Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--color-light-blue-grey); flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="font-size: 16px; font-weight: 800; color: var(--color-royal-navy); margin: 0;">${shipment.id}</h4>
              ${this.renderStatusPill(shipment.status)}
              <span class="badge" style="background: #EBF3FC; color: #1967D2;">${shipment.customerTier || 'Tier 1'}</span>
            </div>
            <div style="font-size: 12px; color: var(--color-charcoal); margin-top: 4px;">
              Order Ref: <strong>${shipment.orderReference || 'ORD-SYNC'}</strong> • Cargo: <strong>${shipment.cargoType}</strong> (${shipment.cargoValue || '$120,000'})
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal'); LiveTrackingMap.openFullscreen(); LiveTrackingMap.handleSearch('${shipment.carrierId || shipment.id}');" style="font-size: 11px; display: inline-flex; align-items: center; gap: 4px; background: #0F172A; color: #00E5FF; border-color: #00E5FF;">
              <span>🗺️ Live Telemetry Map</span>
            </button>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: var(--color-muted-sage);">SLA Breach Threshold</div>
              <div class="badge-sla-risk ${shipment.slaRisk ? shipment.slaRisk.toLowerCase() : 'none'}">
                Risk: ${shipment.slaRisk || 'Nominal'}
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Key Grid Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em;">Carrier Partner</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 4px;">${carrier ? carrier.name : shipment.carrierId}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${carrier ? carrier.carrierType : 'Carrier Partner'}</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em;">Vehicle & Driver</div>
            <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-top: 4px; display: flex; align-items: center; gap: 6px;">
              <span style="font-family: 'JetBrains Mono', Consolas, monospace; background: #EEF2F6; border: 1px solid #CBD5E1; padding: 1.5px 6px; border-radius: 4px;">${shipment.vehicleId || 'Unassigned'}</span>
            </div>
            <div style="font-size: 11.5px; color: #334155; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              👤 ${shipment.driverName || 'No driver designated'}
            </div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em;">Current Position</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 4px;">${shipment.currentLocation || 'En Route'}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${shipment.destination} inbound</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.03em;">ETA Schedule</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 4px;">${shipment.estArrival || '--'}</div>
            <div style="font-size: 11px; font-weight: 600; color: ${shipment.hasException ? 'var(--color-signal-red)' : '#1E8E3E'}; margin-top: 2px;">
              ${shipment.predictedETA && shipment.predictedETA !== shipment.originalETA ? 'Predicted Delay' : 'On Schedule'}
            </div>
          </div>
        </div>

        <!-- Telemetry & Regulatory Live Status Bar -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
              <span style="font-size: 11.5px; font-weight: 700; color: #166534; display: inline-flex; align-items: center; gap: 4px;">📡 GPS Live Fix</span>
              <span style="font-size: 10px; background: #DCFCE7; color: #15803D; padding: 2px 7px; border-radius: 4px; font-weight: 700; white-space: nowrap;">Locked (12 Sats)</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #14532D; margin-top: 6px; font-family: 'JetBrains Mono', Consolas, monospace;">${shipment.gpsCoords || '32.7767° N, 96.7970° W'}</div>
            <div style="font-size: 10.5px; color: #15803D; margin-top: 4px;">Ping latency: 142ms • Odometer: 412 mi</div>
          </div>

          <div style="background: ${(shipment.temperature || '').includes('Excursion') ? '#FEF2F2' : '#F0F9FF'}; border: 1px solid ${(shipment.temperature || '').includes('Excursion') ? '#FECACA' : '#BAE6FD'}; border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
              <span style="font-size: 11.5px; font-weight: 700; color: ${(shipment.temperature || '').includes('Excursion') ? '#991B1B' : '#0369A1'}; display: inline-flex; align-items: center; gap: 4px;">🌡️ Cold-Chain Probe</span>
              <span style="font-size: 10px; background: ${(shipment.temperature || '').includes('Excursion') ? '#FEE2E2' : '#E0F2FE'}; color: ${(shipment.temperature || '').includes('Excursion') ? '#B91C1C' : '#0284C7'}; padding: 2px 7px; border-radius: 4px; font-weight: 700; white-space: nowrap;">
                ${(shipment.temperature || '').includes('Cold') ? 'Safe Bounds (+2°C to +8°C)' : 'Ambient Sensor'}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: ${(shipment.temperature || '').includes('Excursion') ? '#7F1D1D' : '#0C4A6E'}; margin-top: 6px;">
              ${shipment.temperature || '+4.2°C (Cold-Chain OK)'}
            </div>
            <div style="font-size: 10.5px; color: ${(shipment.temperature || '').includes('Excursion') ? '#DC2626' : '#0284C7'}; margin-top: 4px;">Probe Battery: 94% • Cryo Logger: IOT-994</div>
          </div>

          <div style="background: ${(shipment.customsStatus || '').includes('Hold') ? '#FFFBEB' : '#F8FAFC'}; border: 1px solid ${(shipment.customsStatus || '').includes('Hold') ? '#FDE68A' : '#E2E8F0'}; border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
              <span style="font-size: 11.5px; font-weight: 700; color: ${(shipment.customsStatus || '').includes('Hold') ? '#92400E' : '#334155'}; display: inline-flex; align-items: center; gap: 4px;">🛂 Customs Regulatory</span>
              <span style="font-size: 10px; background: ${(shipment.customsStatus || '').includes('Hold') ? '#FEF3C7' : '#E2E8F0'}; color: ${(shipment.customsStatus || '').includes('Hold') ? '#B45309' : '#475569'}; padding: 2px 7px; border-radius: 4px; font-weight: 700; white-space: nowrap;">
                Entry Port DFW
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: ${(shipment.customsStatus || '').includes('Hold') ? '#78350F' : '#0F172A'}; margin-top: 6px;">
              ${shipment.customsStatus || 'Cleared / Released'}
            </div>
            <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">Broker: Apex Global Customs (EDI 350)</div>
          </div>
        </div>

        ${shipment.status === 'Delayed' ? `
          <div style="background: #FFF5F5; border: 1px solid #FECACA; border-left: 4px solid #EA341F; border-radius: 6px; padding: 10px 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #991B1B; text-transform: uppercase; display: flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Shipment Delay Root Cause &amp; Operational Impact
            </div>
            <div style="font-size: 12.5px; font-weight: 700; color: #7F1D1D; margin-top: 3px;">
              ${exceptions.length > 0 ? `${exceptions[0].type}: ${exceptions[0].rootCause}` : (carrier && carrier.delayReason) || 'Active Route Exception — Transit Corridor Congestion'}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #FECACA; font-size: 11px; color: #5C6A79;">
              <span>Predicted ETA: <strong style="color: #DC2626;">${shipment.predictedETA ? this.formatTime(shipment.predictedETA) : 'Revised'}</strong> (${shipment.slaRisk || 'High'} SLA Risk)</span>
              <span>Estimated Penalty: <strong style="color: #991B1B;">${shipment.estimatedPenalty || '$0'}</strong></span>
            </div>
          </div>
        ` : ''}

        <!-- SVG Schematic Route Visualizer for this Shipment -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-bottom: 12px;">
            Schematic Movement Corridor
          </div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; position: relative; padding: 10px 10px 6px;">
            <!-- Background base track line passing through node vertical centers (top: 22px) -->
            <div style="position: absolute; top: 22px; left: 80px; right: 80px; height: 3px; background: #CBD5E1; z-index: 1;"></div>
            <!-- Progress line -->
            <div style="position: absolute; top: 22px; left: 80px; width: ${shipment.status === 'Delivered' ? 'calc(100% - 160px)' : 'calc(50% - 40px)'}; height: 3px; background: ${shipment.hasException ? 'var(--color-signal-red)' : 'var(--color-royal-navy)'}; z-index: 2;"></div>

            <!-- Origin Node -->
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 220px; z-index: 3;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-royal-navy); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px #F8FAFC;">A</div>
              <span style="font-size: 11.5px; font-weight: 700; color: var(--color-midnight); margin-top: 8px; line-height: 1.35;">${shipment.origin}</span>
              <span style="font-size: 10.5px; color: var(--color-muted-sage); margin-top: 2px;">Origin</span>
            </div>

            <!-- Waypoint / Incident Node -->
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 260px; z-index: 3;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: ${shipment.hasException ? 'var(--color-signal-red)' : 'var(--color-royal-navy)'}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px #F8FAFC, 0 0 0 6px ${shipment.hasException ? 'rgba(234,52,31,0.2)' : 'rgba(24,33,126,0.15)'};">
                ${shipment.hasException ? '!' : '✓'}
              </div>
              <span style="font-size: 11.5px; font-weight: 700; color: var(--color-midnight); margin-top: 7px; line-height: 1.35;">${shipment.currentLocation}</span>
              <span style="font-size: 10.5px; font-weight: 600; color: ${shipment.hasException ? 'var(--color-signal-red)' : 'var(--color-royal-navy)'}; margin-top: 2px;">Current Location</span>
            </div>

            <!-- Destination Node -->
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 220px; z-index: 3;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${shipment.status === 'Delivered' ? '#1E8E3E' : '#CBD5E1'}; color: ${shipment.status === 'Delivered' ? '#fff' : '#475569'}; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px #F8FAFC;">B</div>
              <span style="font-size: 11.5px; font-weight: 700; color: var(--color-midnight); margin-top: 8px; line-height: 1.35;">${shipment.destination}</span>
              <span style="font-size: 10.5px; color: var(--color-muted-sage); margin-top: 2px;">Destination</span>
            </div>
          </div>
        </div>

        <!-- Movement History & Chronological Tracking Events -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight);">
              Movement History &amp; Tracking Events Stream
            </div>
            <span style="font-size: 10px; color: var(--color-muted-sage);">Verified GPS &amp; EDI Feed</span>
          </div>
          <div class="timeline-stream">
            ${((shipment.trackingEvents && shipment.trackingEvents.length > 0) ? shipment.trackingEvents : (shipment.milestones || []).map(m => ({
              time: m.time,
              event: m.name,
              location: shipment.currentLocation,
              status: m.status,
              details: `Operational milestone status: ${m.status}`
            }))).map(t => `
              <div class="timeline-stream-item">
                <div class="timeline-node-dot ${t.status === 'Active' || t.status === 'in_progress' ? 'alert' : t.status === 'Completed' || t.status === 'completed' ? 'success' : 'muted'}"></div>
                <div class="timeline-content-box">
                  <div class="timeline-content-header">
                    <span class="timeline-action-text" style="font-weight: 700; color: var(--color-midnight);">${t.event}</span>
                    <span class="timeline-timestamp">${t.time ? AnalystShipmentsView.formatTime(t.time) : 'Pending'}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-charcoal); margin-top: 2px;">
                    📍 <strong>${t.location || 'In Transit'}</strong> • ${t.details || ''}
                  </div>
                  <div style="font-size: 10px; color: var(--color-muted-sage); margin-top: 2px; text-transform: capitalize;">
                    Status: <strong style="color: ${t.status === 'Active' ? 'var(--color-signal-red)' : '#1E8E3E'};">${t.status}</strong>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Exceptions & Recovery Actions -->
        ${exceptions.length > 0 ? `
          <div style="background: #FFFBFB; border: 1px solid #F9BCB5; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--color-signal-red);">
                Related Exception Deviations (${exceptions.length})
              </div>
              <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="AnalystInvestigationView.openModal('${exceptions[0].id}');">
                View Exception Details &rarr;
              </button>
            </div>
            ${exceptions.map(exc => `
              <div style="padding: 8px; background: #FFFFFF; border: 1px solid #F2CECE; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-royal-navy);">${exc.id}</strong>
                  <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(exc.severity)}">${exc.severity}</span>
                </div>
                <div style="font-weight: 600; color: var(--color-midnight); margin-top: 2px;">${exc.type}: ${exc.rootCause}</div>
                <div style="color: var(--color-muted-sage); margin-top: 2px;">Status: <strong>${exc.status}</strong> • SLA: <strong>${exc.slaRisk}</strong></div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Recovery Requests -->
        ${recoveries.length > 0 ? `
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-royal-navy); margin-bottom: 8px;">
              Linked Recovery Requests (${recoveries.length})
            </div>
            ${recoveries.map(rec => `
              <div style="padding: 8px; background: #FFFFFF; border: 1px solid #D3E2F8; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-royal-navy);">${rec.id} (${rec.recoveryStrategy})</strong>
                  <span class="badge" style="background: #EBF3FC; color: #1967D2;">${rec.responseStatus}</span>
                </div>
                <div style="color: var(--color-charcoal); margin-top: 2px;">${rec.reasonForRecovery}</div>
                <div style="color: var(--color-muted-sage); margin-top: 2px;">ETA Impact: <strong>${rec.expectedEtaImpact}</strong></div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    UI.openModal('generic-app-modal', `Shipment Details — ${shipment.id}`, contentHtml, '880px');
  }
};

window.AnalystShipmentsView = AnalystShipmentsView;
