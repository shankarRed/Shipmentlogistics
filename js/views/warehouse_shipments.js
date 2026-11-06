/**
 * BRIDGES Control Tower - Warehouse Inbound & Outbound Shipments View
 * Phase 5: Searchable operational shipment directory for supervisor's warehouse
 * Includes multi-criteria filtering, sorting, pagination, and full operational detail drawer/modal.
 */

window.WarehouseShipmentsView = {
  state: {
    searchTerm: '',
    directionFilter: 'ALL',
    statusFilter: 'ALL',
    carrierFilter: 'ALL',
    dockFilter: 'ALL',
    readinessFilter: 'ALL',
    blockedOnly: false,
    sortBy: 'plannedTime',
    sortAsc: true,
    page: 1,
    pageSize: 8
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    
    // Retrieve all shipments for this warehouse
    let shipments = store.getWarehouseShipments(whId);

    // Apply Filters
    if (this.state.searchTerm.trim()) {
      const q = this.state.searchTerm.toLowerCase().trim();
      shipments = shipments.filter(s => 
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.orderId && s.orderId.toLowerCase().includes(q)) ||
        (s.carrierName && s.carrierName.toLowerCase().includes(q)) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        (s.destination && s.destination.toLowerCase().includes(q)) ||
        (s.assignedDock && s.assignedDock.toLowerCase().includes(q)) ||
        (s.cargoType && s.cargoType.toLowerCase().includes(q))
      );
    }

    if (this.state.directionFilter !== 'ALL') {
      shipments = shipments.filter(s => s.direction === this.state.directionFilter);
    }

    if (this.state.statusFilter !== 'ALL') {
      shipments = shipments.filter(s => s.status === this.state.statusFilter);
    }

    if (this.state.carrierFilter !== 'ALL') {
      shipments = shipments.filter(s => s.carrierId === this.state.carrierFilter || s.carrierName === this.state.carrierFilter);
    }

    if (this.state.dockFilter !== 'ALL') {
      if (this.state.dockFilter === 'UNASSIGNED') {
        shipments = shipments.filter(s => !s.assignedDock);
      } else {
        shipments = shipments.filter(s => s.assignedDock === this.state.dockFilter);
      }
    }

    if (this.state.readinessFilter !== 'ALL') {
      shipments = shipments.filter(s => {
        const r = store.getWarehouseReadiness(s.id);
        const rStatus = r ? r.overallStatus : 'Pending Checks';
        return rStatus === this.state.readinessFilter;
      });
    }

    if (this.state.blockedOnly) {
      shipments = shipments.filter(s => {
        const r = store.getWarehouseReadiness(s.id);
        const blockers = store.getWarehouseBlockers(whId).filter(b => b.shipmentId === s.id && b.status === 'Open');
        return (r && r.overallStatus === 'Blocked') || blockers.length > 0 || s.slaRisk === 'High' || s.slaRisk === 'Critical';
      });
    }

    // Sorting
    shipments.sort((a, b) => {
      let valA = a[this.state.sortBy] || '';
      let valB = b[this.state.sortBy] || '';
      if (this.state.sortBy === 'plannedTime') {
        valA = a.plannedDeparture || a.plannedArrival || '';
        valB = b.plannedDeparture || b.plannedArrival || '';
      }
      if (valA < valB) return this.state.sortAsc ? -1 : 1;
      if (valA > valB) return this.state.sortAsc ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalCount = shipments.length;
    const totalPages = Math.ceil(totalCount / this.state.pageSize) || 1;
    if (this.state.page > totalPages) this.state.page = totalPages;
    const startIndex = (this.state.page - 1) * this.state.pageSize;
    const pagedShipments = shipments.slice(startIndex, startIndex + this.state.pageSize);

    // Filter Options
    const docks = store.getWarehouseDocks(whId);
    const carriers = store.data.carriers || [];

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- TOP CONTROLS & BREADCRUMB -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Inbound & Outbound Shipments</h2>
            <p class="warehouse-view-subheading">
              Facility schedule and operational manifest for ${warehouse.name} (${totalCount} Total Records)
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="WarehouseShipmentsView.resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
              Reset Filters
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_readiness')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Check Warehouse Readiness
            </button>
          </div>
        </div>

        <!-- FILTER TOOLBAR -->
        <div class="warehouse-filter-panel">
          <div class="warehouse-filter-row">
            <!-- SEARCH INPUT -->
            <div class="warehouse-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                id="shipment-search-input" 
                placeholder="Search shipment, order, carrier, dock, cargo..." 
                value="${this.escapeHtml(this.state.searchTerm)}"
                oninput="WarehouseShipmentsView.onSearch(this.value)"
              >
            </div>

            <!-- DIRECTION FILTER -->
            <div class="warehouse-filter-group">
              <label>Direction:</label>
              <select onchange="WarehouseShipmentsView.setFilter('directionFilter', this.value)">
                <option value="ALL" ${this.state.directionFilter === 'ALL' ? 'selected' : ''}>All Directions</option>
                <option value="Inbound" ${this.state.directionFilter === 'Inbound' ? 'selected' : ''}>Inbound</option>
                <option value="Outbound" ${this.state.directionFilter === 'Outbound' ? 'selected' : ''}>Outbound</option>
              </select>
            </div>

            <!-- READINESS FILTER -->
            <div class="warehouse-filter-group">
              <label>Readiness:</label>
              <select onchange="WarehouseShipmentsView.setFilter('readinessFilter', this.value)">
                <option value="ALL" ${this.state.readinessFilter === 'ALL' ? 'selected' : ''}>All Readiness</option>
                <option value="Ready" ${this.state.readinessFilter === 'Ready' ? 'selected' : ''}>Ready</option>
                <option value="In Progress" ${this.state.readinessFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Blocked" ${this.state.readinessFilter === 'Blocked' ? 'selected' : ''}>Blocked</option>
                <option value="Not Started" ${this.state.readinessFilter === 'Not Started' ? 'selected' : ''}>Not Started</option>
              </select>
            </div>

            <!-- DOCK FILTER -->
            <div class="warehouse-filter-group">
              <label>Dock:</label>
              <select onchange="WarehouseShipmentsView.setFilter('dockFilter', this.value)">
                <option value="ALL" ${this.state.dockFilter === 'ALL' ? 'selected' : ''}>All Docks</option>
                <option value="UNASSIGNED" ${this.state.dockFilter === 'UNASSIGNED' ? 'selected' : ''}>Unassigned</option>
                ${docks.map(d => `<option value="${d.id}" ${this.state.dockFilter === d.id ? 'selected' : ''}>${d.id} (${d.type})</option>`).join('')}
              </select>
            </div>

            <!-- CARRIER FILTER -->
            <div class="warehouse-filter-group">
              <label>Carrier:</label>
              <select onchange="WarehouseShipmentsView.setFilter('carrierFilter', this.value)">
                <option value="ALL" ${this.state.carrierFilter === 'ALL' ? 'selected' : ''}>All Carriers</option>
                ${carriers.map(c => `<option value="${c.id}" ${this.state.carrierFilter === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <!-- BLOCKED / AT-RISK TOGGLE -->
            <div class="warehouse-filter-toggle">
              <label class="toggle-checkbox-label">
                <input 
                  type="checkbox" 
                  ${this.state.blockedOnly ? 'checked' : ''} 
                  onchange="WarehouseShipmentsView.toggleBlockedOnly(this.checked)"
                >
                <span class="toggle-text" style="color: #EA341F; font-weight: 600;">Blocked / At-Risk Only</span>
              </label>
            </div>
          </div>
        </div>

        <!-- SHIPMENT DATA TABLE -->
        <div class="warehouse-card">
          <div class="warehouse-table-responsive">
            <table class="warehouse-table">
              <thead>
                <tr>
                  <th onclick="WarehouseShipmentsView.setSort('id')">Shipment ID</th>
                  <th>Direction</th>
                  <th>Origin &rarr; Destination</th>
                  <th>Carrier &amp; Vehicle</th>
                  <th>Cargo &amp; Temp Requirements</th>
                  <th onclick="WarehouseShipmentsView.setSort('plannedTime')">Schedule &amp; Latest ETA</th>
                  <th>Dock Bay</th>
                  <th>Status</th>
                  <th>Readiness</th>
                  <th style="text-align: right; min-width: 220px;">Execution Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pagedShipments.length === 0 ? `
                  <tr>
                    <td colspan="10" class="warehouse-empty-cell">
                      <div class="warehouse-empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <p style="font-weight: 600; color: #070724; margin: 8px 0 2px;">No matching shipments found</p>
                        <p class="text-xs text-muted">Try adjusting search parameters or clearing filters.</p>
                        <button class="btn btn-secondary btn-xs" style="margin-top: 10px;" onclick="WarehouseShipmentsView.resetFilters()">Clear Filters</button>
                      </div>
                    </td>
                  </tr>
                ` : pagedShipments.map(s => {
                  const readiness = store.getWarehouseReadiness(s.id);
                  const rStatus = readiness ? readiness.overallStatus : 'Pending Checks';
                  const badgeClass = rStatus === 'Ready' ? 'badge-ready' : (rStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress');
                  const dirBadge = s.direction === 'Inbound' ? 'badge-inbound' : 'badge-outbound';
                  const plannedTime = s.direction === 'Inbound' 
                    ? (s.plannedArrival ? new Date(s.plannedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.originalETA ? new Date(s.originalETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:00'))
                    : (s.plannedDeparture ? new Date(s.plannedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:00');
                  
                  const latestEtaStr = s.latestETA ? new Date(s.latestETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : plannedTime;
                  const hasReceived = !!s.receivingRecord || s.status === 'Delivered & Received at Hub' || s.status === 'Delivered';

                  return `
                    <tr class="warehouse-table-row">
                      <td class="font-mono font-bold">
                        <a href="javascript:void(0)" onclick="WarehouseShipmentsView.openDetailModal('${s.id}')" style="color: #18217E; text-decoration: none;">
                          ${s.id}
                        </a>
                        <div class="text-xs text-muted font-normal">${s.orderReference || s.orderId || 'ORD-SYNC'}</div>
                      </td>
                      <td><span class="badge ${dirBadge}">${s.direction}</span></td>
                      <td>
                        <div class="cell-primary text-truncate" style="max-width: 140px;" title="${s.origin}">${s.origin}</div>
                        <div class="cell-sub text-truncate" style="max-width: 140px;" title="${s.destination}">&rarr; ${s.destination}</div>
                      </td>
                      <td>
                        <div class="cell-primary font-bold text-truncate" style="max-width: 140px;">${s.carrierName || 'Bridges Global Logistics'}</div>
                        <div class="cell-sub font-mono text-xs">${s.vehiclePlate || 'Plate TBD'} &bull; ${s.driverName || 'Driver TBD'}</div>
                      </td>
                      <td>
                        <div class="cell-primary text-truncate" style="max-width: 150px; font-weight: 600;">${s.cargoType || s.cargoCategory}</div>
                        <div style="margin-top: 2px;">
                          ${s.isColdChain ? `
                            <span class="badge badge-coldchain" style="background: rgba(24, 33, 126, 0.1); color: #18217E; border: 1px solid rgba(24,33,126,0.3); font-size: 10.5px;">
                              ❄️ ${s.tempRange}
                            </span>
                          ` : (s.tempRange && s.tempRange.includes('Frozen') ? `
                            <span class="badge badge-frozen" style="background: rgba(9, 16, 77, 0.1); color: #09104D; font-size: 10.5px;">
                              🧊 ${s.tempRange}
                            </span>
                          ` : `
                            <span class="badge badge-subtle" style="font-size: 10.5px;">
                              📦 ${s.tempRange || 'Ambient'}
                            </span>
                          `)}
                        </div>
                        <div class="cell-sub text-xs text-muted" style="margin-top: 1px;">Live Sensor: <strong>${s.liveSensorTemp || 'Verified'}</strong></div>
                      </td>
                      <td>
                        <div class="cell-primary font-mono text-xs">Sched: ${plannedTime}</div>
                        <div class="cell-sub font-mono text-xs">
                          Latest ETA: <strong>${latestEtaStr}</strong>
                        </div>
                        ${s.isDelayed ? `
                          <span class="badge badge-warning" style="background: #FFF3CD; color: #856404; font-size: 10px; margin-top: 2px; display: inline-block;">
                            ⚠️ +${s.delayMinutes || 45}m Delay
                          </span>
                        ` : `
                          <span class="badge badge-ready" style="font-size: 10px; margin-top: 2px; display: inline-block;">
                            &check; On Schedule
                          </span>
                        `}
                      </td>
                      <td>
                        ${s.assignedDock && s.assignedDock !== 'Unassigned' ? `
                          <span class="badge badge-dock">${s.assignedDock}</span>
                          <div class="cell-sub text-xs" style="margin-top: 2px;">
                            ${s.dockStatus === 'Occupied' ? '<span style="color:#18217E; font-weight:600;">Occupied</span>' : '<span style="color:#1E8E3E; font-weight:600;">Available</span>'}
                          </div>
                        ` : `
                          <span class="text-muted text-xs">Unassigned</span>
                          <div>
                            <button class="btn btn-outline btn-xs" style="padding: 1px 6px; font-size: 10px; margin-top: 2px;" onclick="App.navigate('warehouse_docks')">Assign Bay</button>
                          </div>
                        `}
                      </td>
                      <td>
                        <span class="badge badge-subtle">${s.status}</span>
                      </td>
                      <td>
                        <span class="badge ${badgeClass}">${rStatus}</span>
                      </td>
                      <td style="text-align: right; white-space: nowrap;">
                        <button class="btn btn-outline btn-xs" onclick="WarehouseShipmentsView.openDetailModal('${s.id}')" title="View Full Manifest">
                          Details
                        </button>
                        <button class="btn btn-secondary btn-xs" onclick="WarehouseShipmentsView.openMilestoneModal('${s.id}')" title="Record Operational Milestone">
                          Milestone
                        </button>
                        ${s.direction === 'Inbound' ? (hasReceived ? `
                          <span class="badge badge-ready" style="font-size: 10.5px; padding: 4px 6px;">&check; Received</span>
                        ` : `
                          <button class="btn btn-primary btn-xs" onclick="WarehouseShipmentsView.openReceivingModal('${s.id}')" title="Confirm Receipt and Inspection">
                            Receive &amp; Confirm
                          </button>
                        `) : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- PAGINATION FOOTER -->
          <div class="warehouse-table-footer">
            <div class="warehouse-pagination-info">
              Showing <strong>${totalCount === 0 ? 0 : startIndex + 1} - ${Math.min(startIndex + this.state.pageSize, totalCount)}</strong> of <strong>${totalCount}</strong> shipments
            </div>
            <div class="warehouse-pagination-controls">
              <button 
                class="btn btn-outline btn-xs" 
                ${this.state.page <= 1 ? 'disabled' : ''} 
                onclick="WarehouseShipmentsView.changePage(${this.state.page - 1})"
              >
                &larr; Prev
              </button>
              <span class="warehouse-page-num">Page ${this.state.page} of ${totalPages}</span>
              <button 
                class="btn btn-outline btn-xs" 
                ${this.state.page >= totalPages ? 'disabled' : ''} 
                onclick="WarehouseShipmentsView.changePage(${this.state.page + 1})"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onSearch(val) {
    this.state.searchTerm = val;
    this.state.page = 1;
    App.renderCurrentView();
  },

  setFilter(filterName, val) {
    this.state[filterName] = val;
    this.state.page = 1;
    App.renderCurrentView();
  },

  toggleBlockedOnly(checked) {
    this.state.blockedOnly = checked;
    this.state.page = 1;
    App.renderCurrentView();
  },

  setSort(col) {
    if (this.state.sortBy === col) {
      this.state.sortAsc = !this.state.sortAsc;
    } else {
      this.state.sortBy = col;
      this.state.sortAsc = true;
    }
    App.renderCurrentView();
  },

  changePage(p) {
    this.state.page = p;
    App.renderCurrentView();
  },

  resetFilters() {
    this.state = {
      searchTerm: '',
      directionFilter: 'ALL',
      statusFilter: 'ALL',
      carrierFilter: 'ALL',
      dockFilter: 'ALL',
      readinessFilter: 'ALL',
      blockedOnly: false,
      sortBy: 'plannedTime',
      sortAsc: true,
      page: 1,
      pageSize: 8
    };
    App.renderCurrentView();
  },

  openDetailModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const shipment = (store.data.shipments || []).find(s => s.id === shipmentId);
    if (!shipment) {
      UI.showToast("Shipment record not found", "error");
      return;
    }

    const readiness = store.getWarehouseReadiness(shipmentId);
    const pkp = store.getPickingPacking(shipmentId);
    const loading = store.getLoadingRecord(shipmentId);
    const handover = store.getCarrierHandover(shipmentId);
    const blockers = (store.data.warehouseBlockers || []).filter(b => b.shipmentId === shipmentId);
    const events = (store.data.shipmentEvents || []).filter(e => e.shipmentId === shipmentId);
    const exc = (store.data.exceptions || []).find(e => e.shipmentId === shipmentId && e.status !== 'Resolved');

    const modalTitle = `Operational Manifest — ${shipment.id}`;
    const modalBody = `
      <div class="warehouse-detail-modal">
        <!-- TOP SUMMARY GRID -->
        <div class="detail-summary-grid">
          <div class="detail-item">
            <span class="detail-label">Direction</span>
            <span class="detail-val"><span class="badge ${shipment.direction === 'Inbound' ? 'badge-inbound' : 'badge-outbound'}">${shipment.direction || 'Outbound'}</span></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-val"><span class="badge badge-subtle">${shipment.status}</span></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Assigned Dock</span>
            <span class="detail-val font-mono font-bold" style="color: #18217E;">${shipment.assignedDock || 'Not Assigned'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Readiness</span>
            <span class="detail-val">
              <span class="badge ${readiness && readiness.overallStatus === 'Ready' ? 'badge-ready' : (readiness && readiness.overallStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress')}">
                ${readiness ? readiness.overallStatus : 'Pending'}
              </span>
            </span>
          </div>
        </div>

        <!-- 2-COL DETAILS -->
        <div class="detail-section-row">
          <!-- ROUTE & CARRIER DETAILS -->
          <div class="detail-col">
            <h4 class="detail-section-heading">Transport & Routing</h4>
            <div class="detail-prop-table">
              <div class="prop-row">
                <span class="prop-key">Origin:</span>
                <span class="prop-val">${shipment.origin || 'N/A'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Destination:</span>
                <span class="prop-val">${shipment.destination || 'N/A'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Carrier Organization:</span>
                <span class="prop-val">${shipment.carrierName || '<span class="text-muted">Unassigned (Coordinate with Dispatch)</span>'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Assigned Vehicle:</span>
                <span class="prop-val font-mono">${shipment.vehiclePlate || '<span class="text-muted">Unassigned</span>'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Driver Name:</span>
                <span class="prop-val">${shipment.driverName || '<span class="text-muted">Unassigned</span>'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Planned Schedule:</span>
                <span class="prop-val font-mono">${shipment.plannedDeparture ? new Date(shipment.plannedDeparture).toLocaleString() : (shipment.plannedArrival ? new Date(shipment.plannedArrival).toLocaleString() : 'TBD')}</span>
              </div>
            </div>
          </div>

          <!-- CARGO DETAILS -->
          <div class="detail-col">
            <h4 class="detail-section-heading">Cargo & Execution Progress</h4>
            <div class="detail-prop-table">
              <div class="prop-row">
                <span class="prop-key">Cargo Type:</span>
                <span class="prop-val">${shipment.cargoType || 'Standard Freight'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Weight & Volume:</span>
                <span class="prop-val">${shipment.weightKg ? shipment.weightKg + ' kg' : 'Verified'} | ${shipment.volumeCbm ? shipment.volumeCbm + ' CBM' : 'Staged'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Picking Status:</span>
                <span class="prop-val">${pkp ? `${pkp.pickingStatus} (${pkp.totalPicked}/${pkp.totalRequired} units)` : 'N/A'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Packing Status:</span>
                <span class="prop-val">${pkp ? `${pkp.packingStatus} (${pkp.totalPacked}/${pkp.totalRequired} units)` : 'N/A'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Loading Progress:</span>
                <span class="prop-val">${loading ? `${loading.status} (${loading.loadingProgress}%)` : 'Not Started'}</span>
              </div>
              <div class="prop-row">
                <span class="prop-key">Carrier Handover:</span>
                <span class="prop-val">${handover ? handover.handoverStatus : 'Awaiting Readiness'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CURRENT BLOCKERS & REQUIRED ACTION -->
        <div class="detail-blocker-box ${blockers.length > 0 ? 'has-blockers' : 'no-blockers'}">
          <div class="blocker-box-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Current Floor Blockers & Next Required Action
          </div>
          ${blockers.length === 0 ? `
            <p class="text-xs" style="color: #070724; margin: 4px 0 0;">Zero active warehouse blockers on this shipment. Next required operational action: <strong>${shipment.nextAction || 'Proceed to standard workflow'}</strong>.</p>
          ` : `
            <div class="blocker-list-mini">
              ${blockers.map(b => `
                <div class="blocker-pill-item">
                  <span class="badge ${b.severity === 'Critical' ? 'badge-critical' : 'badge-high'}">${b.severity}</span>
                  <strong>${b.blockerType}:</strong> ${b.description} <em>(Action: ${b.requiredAction})</em>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- LINKED EXCEPTION IF ACTIVE -->
        ${exc ? `
          <div class="detail-exc-box">
            <strong>Linked Control Tower Exception:</strong> [${exc.id}] ${exc.type} - Severity: ${exc.severity} (${exc.description})
          </div>
        ` : ''}

        <!-- SHIPMENT EVENT TIMELINE -->
        <div class="detail-timeline-section">
          <h4 class="detail-section-heading">Operational Audit History</h4>
          <div class="warehouse-mini-timeline">
            ${events.length === 0 ? `
              <p class="text-xs text-muted">No operational events recorded yet.</p>
            ` : events.slice(0, 5).map(e => `
              <div class="timeline-step">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-event-name font-bold text-xs">${e.eventType}</span>
                    <span class="timeline-time font-mono text-xs text-muted">${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div class="timeline-desc text-xs text-muted">${e.details || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="detail-actions-footer" style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button class="btn btn-outline btn-sm" onclick="UI.closeModal('generic-app-modal'); WarehouseShipmentsView.openMilestoneModal('${shipment.id}');">
            Record Milestone
          </button>
          <button class="btn btn-outline btn-sm" onclick="UI.closeModal('generic-app-modal'); WarehouseShipmentsView.openColdChainModal('${shipment.id}');">
            Cold-Chain Readiness
          </button>
          ${shipment.direction === 'Inbound' ? `
            <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); WarehouseShipmentsView.openReceivingModal('${shipment.id}');">
              Inbound Receiving &amp; Delivery Signoff
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigate('warehouse_loading');">
              Loading &amp; Dispatch Bay
            </button>
          `}
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // =========================================================================
  // Milestone Recording Modal (Requirement 3: Warehouse Execution)
  // =========================================================================
  openMilestoneModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = (store.data.shipments || []).find(x => x.id === shipmentId);
    const whId = store.getCurrentWarehouseId();
    const docks = store.getWarehouseDocks(whId);

    const modalTitle = `Record Warehouse Operational Milestone — ${shipmentId}`;
    const modalBody = `
      <form id="record-milestone-form" onsubmit="WarehouseShipmentsView.handleRecordMilestone(event, '${shipmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Select Milestone Event <span class="text-danger">*</span></label>
          <select id="ms-type-select" class="form-control" required>
            <option value="Arrival at Gate / Facility Check-in">1. Arrival at Gate / Facility Check-in</option>
            <option value="Docked at Bay / Trailer Chocked">2. Docked at Bay / Trailer Chocked</option>
            <option value="Inbound Cargo Receiving Commenced">3. Inbound Cargo Receiving Commenced</option>
            <option value="Inbound Receiving & Inspection Completed">4. Inbound Receiving & Inspection Completed</option>
            <option value="Picking & Staging Completed">5. Picking & Staging Completed</option>
            <option value="Pickup Readiness Certified">6. Pickup Readiness Certified (Ready for Carrier)</option>
            <option value="Trailer Loading Commenced">7. Trailer Loading Commenced</option>
            <option value="Loading Completed & Seal Verified">8. Loading Completed & Seal Verified</option>
            <option value="Carrier Departure & Dispatched">9. Carrier Departure & Dispatched</option>
          </select>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Dock Bay Location</label>
            <select id="ms-dock-select" class="form-control">
              <option value="">-- Facility Gate / Staging Area --</option>
              ${docks.map(d => `<option value="${d.id}" ${s && s.assignedDock === d.id ? 'selected' : ''}>${d.id} (${d.type}) — ${d.status}</option>`).join('')}
            </select>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Security Seal Number (If applicable)</label>
            <input type="text" id="ms-seal-input" class="form-control" placeholder="e.g. SEAL-DAL-884192">
          </div>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Cargo Temperature Probe (°C)</label>
            <input type="number" step="0.1" id="ms-temp-input" class="form-control" placeholder="e.g. 4.2" value="4.2">
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Operator / Supervisor Name <span class="text-danger">*</span></label>
            <input type="text" id="ms-operator-input" class="form-control" value="Carlos Mendoza" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Shift Notes & Observations</label>
          <textarea id="ms-notes-input" class="form-control" rows="2" placeholder="Driver credentials verified, tamper seal inspected, cold temperature verified..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm & Broadcast Milestone</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleRecordMilestone(e, shipmentId) {
    e.preventDefault();
    const milestoneType = document.getElementById('ms-type-select').value;
    const dockId = document.getElementById('ms-dock-select').value;
    const sealNumber = document.getElementById('ms-seal-input').value.trim();
    const temp = document.getElementById('ms-temp-input').value.trim();
    const operator = document.getElementById('ms-operator-input').value.trim();
    const notes = document.getElementById('ms-notes-input').value.trim();

    try {
      window.BRIDGES_STORE.recordWarehouseMilestone(shipmentId, milestoneType, {
        dockId,
        sealNumber,
        temperature: temp ? `${temp}°C` : null,
        operatorName: operator,
        notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Milestone recorded: ${milestoneType}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // =========================================================================
  // Inbound Receiving & Delivery Confirmation Modal (Requirement 4)
  // =========================================================================
  openReceivingModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = (store.data.shipments || []).find(x => x.id === shipmentId);
    const expectedPieces = parseInt(s ? (s.weightKg || s.pieces || 120) : 120, 10) || 120;
    const wh = store.getWarehouse(store.getCurrentWarehouseId());

    const modalTitle = `Inbound Receiving & Delivery Confirmation — ${shipmentId}`;
    const modalBody = `
      <form id="receiving-confirm-form" onsubmit="WarehouseShipmentsView.handleConfirmReceiving(event, '${shipmentId}')">
        <!-- SHIPMENT & CARRIER SUMMARY STRIP -->
        <div style="background: #F4F6F8; border: 1px solid #E5EBEE; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span>Origin: <strong>${s ? s.origin : 'Supplier Site'}</strong></span>
            <span>Carrier: <strong>${s ? s.carrierName || 'Motor Freight' : 'Assigned Carrier'}</strong></span>
            <span>Vehicle: <strong class="font-mono">${s ? s.vehiclePlate || 'TX-9921' : 'TX-9921'}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
            <span>Cargo Spec: <strong>${s ? s.cargoType || 'Standard Freight' : 'Freight'}</strong></span>
            <span>Assigned Bay: <strong>${s && s.assignedDock ? s.assignedDock : 'Receiving Dock 05'}</strong></span>
            <span>Manifested Pieces: <strong>${expectedPieces} Units</strong></span>
          </div>
        </div>

        <!-- QUANTITY RECONCILIATION -->
        <h4 style="font-size: 13px; font-weight: 700; color: #18217E; margin: 0 0 8px;">1. Quantity Reconciliation & Physical Count</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label font-bold" style="font-size: 11px;">Good Units Received <span class="text-danger">*</span></label>
            <input type="number" id="rec-good-qty" class="form-control" value="${expectedPieces}" min="0" required oninput="WarehouseShipmentsView.calcDiscrepancy(${expectedPieces})">
          </div>
          <div class="form-group">
            <label class="form-label font-bold" style="font-size: 11px; color: #EA341F;">Damaged Units</label>
            <input type="number" id="rec-dam-qty" class="form-control" value="0" min="0" oninput="WarehouseShipmentsView.calcDiscrepancy(${expectedPieces})">
          </div>
          <div class="form-group">
            <label class="form-label font-bold" style="font-size: 11px; color: #8C2527;">Rejected / Quarantined</label>
            <input type="number" id="rec-rej-qty" class="form-control" value="0" min="0" oninput="WarehouseShipmentsView.calcDiscrepancy(${expectedPieces})">
          </div>
        </div>

        <!-- CALCULATED DISCREPANCY STATUS -->
        <div id="discrepancy-status-bar" style="padding: 8px 12px; background: rgba(30, 142, 62, 0.1); border: 1px solid rgba(30, 142, 62, 0.3); border-radius: 6px; font-size: 12px; color: #1E8E3E; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>Piece Reconciliation: <strong id="disc-val-text">0 Discrepancy (100% Match)</strong></span>
          <span class="badge badge-ready" id="disc-badge">&check; Clean Manifest</span>
        </div>

        <!-- DISCREPANCY & CONDITION NOTES -->
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Cargo Condition & Discrepancy Findings</label>
          <textarea id="rec-condition-notes" class="form-control" rows="2" placeholder="Detail any carton crushes, puncture marks, seal numbers, or delivery notes..."></textarea>
        </div>

        <!-- UPLOAD INSPECTION DOCUMENTS / PHOTOS -->
        <h4 style="font-size: 13px; font-weight: 700; color: #18217E; margin: 12px 0 8px;">2. Inspection Documents & Evidence Photos</h4>
        <div style="border: 2px dashed #E5EBEE; border-radius: 6px; padding: 12px; text-align: center; background: #FAFAFA; margin-bottom: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5" style="margin-bottom: 4px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div style="font-size: 11.5px; color: #393A50; font-weight: 600;">Attach Inbound Inspection Report / Cargo Photos</div>
          <p class="text-xs text-muted" style="margin: 2px 0 8px;">Simulated attachment: PDF tally sheets, probe data traces, carton damage photos</p>
          <button type="button" class="btn btn-outline btn-xs" onclick="WarehouseShipmentsView.simulateAddDoc('${shipmentId}')">
            + Attach Inspection Document / Photo
          </button>
          <div id="attached-docs-list" style="margin-top: 8px; text-align: left;">
            <div class="attached-doc-pill" style="display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E5EBEE; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 4px;">
              <span>📄 <strong>Inbound_Receiving_Tally_${shipmentId}.pdf</strong> (385 KB)</span>
              <span style="color: #1E8E3E; font-weight: 600;">&check; Ready</span>
            </div>
          </div>
        </div>

        <!-- CONFIRM DELIVERY COMPLETION CHECKBOX -->
        <div style="padding: 10px 12px; background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 6px; margin-bottom: 16px;">
          <label class="toggle-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="rec-confirm-delivery-checkbox" checked style="width: 16px; height: 16px;">
            <div>
              <span style="font-weight: 700; color: #18217E; font-size: 12px;">Confirm Delivery Completion at Warehouse Facility</span>
              <p class="text-xs text-muted" style="margin: 2px 0 0;">Certifies physical cargo transfer from motor carrier into ${wh.name} inventory. Updates shipment to Delivered &amp; Received.</p>
            </div>
          </label>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Receipt &amp; Complete Inbound Intake</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  calcDiscrepancy(expected) {
    const good = parseInt(document.getElementById('rec-good-qty').value, 10) || 0;
    const dam = parseInt(document.getElementById('rec-dam-qty').value, 10) || 0;
    const rej = parseInt(document.getElementById('rec-rej-qty').value, 10) || 0;
    const total = good + dam + rej;
    const diff = total - expected;

    const bar = document.getElementById('discrepancy-status-bar');
    const text = document.getElementById('disc-val-text');
    const badge = document.getElementById('disc-badge');

    if (diff === 0 && dam === 0 && rej === 0) {
      bar.style.background = 'rgba(30, 142, 62, 0.1)';
      bar.style.borderColor = 'rgba(30, 142, 62, 0.3)';
      bar.style.color = '#1E8E3E';
      text.textContent = '0 Discrepancy (100% Match)';
      badge.className = 'badge badge-ready';
      badge.textContent = '✓ Clean Manifest';
    } else {
      bar.style.background = '#FDEDEC';
      bar.style.borderColor = '#EA341F';
      bar.style.color = '#8C2527';
      text.textContent = `${diff !== 0 ? (diff > 0 ? `+${diff} Over` : `${diff} Missing`) : ''} ${dam > 0 ? `(${dam} Damaged)` : ''} ${rej > 0 ? `(${rej} Rejected)` : ''}`;
      badge.className = 'badge badge-critical';
      badge.textContent = '⚠️ Discrepancy Flagged';
    }
  },

  simulateAddDoc(shipmentId) {
    const list = document.getElementById('attached-docs-list');
    if (!list) return;
    const filename = `Dock_Inspection_Photo_Cargo_${shipmentId}.jpg`;
    list.innerHTML += `
      <div class="attached-doc-pill" style="display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E5EBEE; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 4px;">
        <span>📷 <strong>${filename}</strong> (1.4 MB)</span>
        <span style="color: #1E8E3E; font-weight: 600;">&check; Uploaded</span>
      </div>
    `;
    UI.showToast("Inspection document attached", "success");
  },

  handleConfirmReceiving(e, shipmentId) {
    e.preventDefault();
    const good = parseInt(document.getElementById('rec-good-qty').value, 10) || 0;
    const dam = parseInt(document.getElementById('rec-dam-qty').value, 10) || 0;
    const rej = parseInt(document.getElementById('rec-rej-qty').value, 10) || 0;
    const notes = document.getElementById('rec-condition-notes').value.trim();
    const confirmDelivery = document.getElementById('rec-confirm-delivery-checkbox').checked;

    try {
      window.BRIDGES_STORE.confirmWarehouseReceiving(shipmentId, {
        receivedQty: good,
        damagedQty: dam,
        rejectedQty: rej,
        discrepancyNotes: notes,
        confirmDeliveryCompleted: confirmDelivery
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Inbound receiving confirmed for ${shipmentId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // =========================================================================
  // Cold-Chain Certification Modal (Requirement 3: Cold-Chain Readiness)
  // =========================================================================
  openColdChainModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = (store.data.shipments || []).find(x => x.id === shipmentId);
    const modalTitle = `Cold-Chain Integrity & Transfer Certification — ${shipmentId}`;
    const modalBody = `
      <form id="coldchain-cert-form" onsubmit="WarehouseShipmentsView.handleColdChainSubmit(event, '${shipmentId}')">
        <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #18217E;">Cold-Chain Specifications</div>
          <div style="font-size: 12px; color: #393A50; margin-top: 2px;">
            Target Range: <strong>2.0°C to 8.0°C</strong> &bull; Cargo: <strong>${s ? s.cargoType || 'Pharma' : 'Biopharma'}</strong>
          </div>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Core Pallet Temperature (°C) <span class="text-danger">*</span></label>
            <input type="number" step="0.1" id="cc-temp-input" class="form-control" value="4.2" required>
            <span class="text-xs text-muted">Permissible: 2.0°C - 8.0°C</span>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Datalogger Trace Serial #</label>
            <input type="text" id="cc-logger-input" class="form-control" value="LOG-SENSIRION-8819" required>
          </div>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Tamper-Evident Security Seal # <span class="text-danger">*</span></label>
            <input type="text" id="cc-seal-input" class="form-control" value="SL-TX-994102" required>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Driver Sign-off Name <span class="text-danger">*</span></label>
            <input type="text" id="cc-driver-input" class="form-control" value="${s ? s.driverName || 'Ethan Cole' : 'Ethan Cole'}" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="toggle-checkbox-label" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="cc-prechill-check" checked>
            <span style="font-size: 12px; font-weight: 600;">Trailer Pre-chill Verified (-18°C / +4°C pull-down confirmed)</span>
          </label>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Supervisor Compliance Notes</label>
          <textarea id="cc-notes-input" class="form-control" rows="2" placeholder="Cold-chain passport verified, probe inserted into core test carton, logger active..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Certify Cold-Chain &amp; Release</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleColdChainSubmit(e, shipmentId) {
    e.preventDefault();
    const temp = document.getElementById('cc-temp-input').value;
    const logger = document.getElementById('cc-logger-input').value.trim();
    const seal = document.getElementById('cc-seal-input').value.trim();
    const driver = document.getElementById('cc-driver-input').value.trim();
    const prechill = document.getElementById('cc-prechill-check').checked;
    const notes = document.getElementById('cc-notes-input').value.trim();

    try {
      window.BRIDGES_STORE.confirmCargoTransferAndColdChain(shipmentId, {
        coreTemperature: temp,
        minTemp: 2.0,
        maxTemp: 8.0,
        loggerId: logger,
        sealNumber: seal,
        preChillVerified: prechill,
        driverSignature: driver,
        supervisorNotes: notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Cold-Chain verified and certified for ${shipmentId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }
};
