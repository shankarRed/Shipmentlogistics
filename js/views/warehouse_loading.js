/**
 * BRIDGES Control Tower - Warehouse Loading & Dispatch View
 * Phase 5: Loading dock bays, vehicle staging, and dispatch readiness verification
 * Enforces strict pre-loading prerequisites (picking/packing/dock), loading progress tracking, and handover staging.
 */

window.WarehouseLoadingView = {
  state: {
    selectedShipmentId: null,
    filterStatus: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const loadingList = (store.data.loadingRecords || []).filter(l => l.warehouseId === whId);

    if (!this.state.selectedShipmentId && loadingList.length > 0) {
      this.state.selectedShipmentId = loadingList[0].shipmentId;
    }

    let filtered = loadingList;
    if (this.state.filterStatus !== 'ALL') {
      filtered = filtered.filter(l => l.status === this.state.filterStatus);
    }

    const currentRecord = loadingList.find(l => l.shipmentId === this.state.selectedShipmentId) || loadingList[0];
    const shipment = currentRecord ? (store.data.shipments || []).find(s => s.id === currentRecord.shipmentId) : null;
    const pkp = currentRecord ? store.getPickingPacking(currentRecord.shipmentId) : null;
    const readiness = currentRecord ? store.getWarehouseReadiness(currentRecord.shipmentId) : null;

    // Prerequisite checks
    const pickingDone = pkp ? pkp.pickingStatus === 'Completed' : false;
    const packingDone = pkp ? pkp.packingStatus === 'Completed' : false;
    const carrierAssigned = currentRecord && currentRecord.carrierName && currentRecord.carrierName !== 'Unassigned';
    const vehicleAssigned = currentRecord && currentRecord.vehiclePlate && currentRecord.vehiclePlate !== 'None';
    const dockAssigned = currentRecord && !!currentRecord.dockId;
    const readinessClear = readiness ? readiness.overallStatus !== 'Blocked' : true;

    const allPrereqsMet = pickingDone && packingDone && carrierAssigned && vehicleAssigned && dockAssigned && readinessClear;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Loading & Dispatch Workspace</h2>
            <p class="warehouse-view-subheading">
              Enforce dock loading prerequisites, verify cargo stowage, and stage vehicles for handover at ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('warehouse_docks')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
              </svg>
              View Dock Bays
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_handover')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
              </svg>
              Carrier Handover Desk &rarr;
            </button>
          </div>
        </div>

        <!-- 2-COLUMN LAYOUT -->
        <div class="warehouse-readiness-layout">
          <!-- LEFT QUEUE -->
          <div class="warehouse-readiness-sidebar">
            <div class="warehouse-card">
              <div class="warehouse-card-header">
                <h3 class="warehouse-card-title">Loading Queue</h3>
                <div class="readiness-filter-mini">
                  <select onchange="WarehouseLoadingView.setFilter(this.value)">
                    <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All</option>
                    <option value="Awaiting Loading" ${this.state.filterStatus === 'Awaiting Loading' ? 'selected' : ''}>Awaiting</option>
                    <option value="Loading In Progress" ${this.state.filterStatus === 'Loading In Progress' ? 'selected' : ''}>Loading</option>
                    <option value="Loading Completed" ${this.state.filterStatus === 'Loading Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Ready for Handover" ${this.state.filterStatus === 'Ready for Handover' ? 'selected' : ''}>Handover Ready</option>
                  </select>
                </div>
              </div>
              <div class="readiness-shipment-list">
                ${filtered.length === 0 ? `
                  <div class="warehouse-empty-state" style="padding: 16px;">
                    <p class="text-xs text-muted">No loading records in queue.</p>
                  </div>
                ` : filtered.map(l => {
                  const isSelected = l.shipmentId === this.state.selectedShipmentId;
                  const statusClass = l.status === 'Ready for Handover' || l.status === 'Loading Completed' 
                    ? 'badge-ready' : (l.status === 'Loading In Progress' ? 'badge-progress' : 'badge-subtle');

                  return `
                    <div 
                      class="readiness-shipment-item ${isSelected ? 'selected' : ''}"
                      onclick="WarehouseLoadingView.selectShipment('${l.shipmentId}')"
                    >
                      <div class="rsi-top">
                        <span class="font-mono font-bold" style="color: #18217E;">${l.shipmentId}</span>
                        <span class="badge ${statusClass}">${l.status}</span>
                      </div>
                      <div class="rsi-carrier text-truncate">
                        Dock: <strong>${l.dockId || 'Unassigned'}</strong> &bull; ${l.carrierName || 'No Carrier'}
                      </div>
                      <div class="rsi-dock text-xs text-muted">
                        Vehicle: <strong>${l.vehiclePlate || 'None'}</strong> &bull; Progress: <strong>${l.loadingProgress}%</strong>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT DETAIL PANEL -->
          <div class="warehouse-readiness-content">
            ${!currentRecord ? `
              <div class="warehouse-card">
                <div class="warehouse-empty-state" style="padding: 40px;">
                  <p>Select a shipment from the loading queue.</p>
                </div>
              </div>
            ` : `
              <div class="warehouse-card">
                <!-- TOP HEADER -->
                <div class="readiness-detail-header">
                  <div>
                    <div class="badge-row" style="margin-bottom: 4px;">
                      <span class="font-mono font-bold" style="font-size: 16px; color: #18217E;">${currentRecord.shipmentId}</span>
                      <span class="badge ${currentRecord.status === 'Ready for Handover' || currentRecord.status === 'Loading Completed' ? 'badge-ready' : (currentRecord.status === 'Loading In Progress' ? 'badge-progress' : 'badge-subtle')}">
                        ${currentRecord.status}
                      </span>
                      ${currentRecord.dockId ? `<span class="badge badge-dock">${currentRecord.dockId}</span>` : `<span class="badge badge-outline">No Dock Assigned</span>`}
                    </div>
                    <div class="text-xs text-muted">
                      Carrier: <strong>${currentRecord.carrierName || 'Unassigned'}</strong> &bull; Vehicle: <strong>${currentRecord.vehiclePlate || 'None'}</strong> &bull; Driver: <strong>${currentRecord.driverName || 'None'}</strong>
                    </div>
                  </div>
                  <div class="readiness-header-action" style="display: flex; gap: 8px;">
                    ${currentRecord.status === 'Awaiting Loading' ? `
                      <button 
                        class="btn btn-primary btn-sm" 
                        ${!allPrereqsMet ? 'disabled title="Prerequisites not satisfied"' : ''} 
                        onclick="WarehouseLoadingView.startLoading('${currentRecord.shipmentId}')"
                      >
                        Start Loading Bay
                      </button>
                    ` : ''}
                    ${currentRecord.status === 'Loading In Progress' ? `
                      <button class="btn btn-outline btn-sm" onclick="WarehouseLoadingView.openProgressModal('${currentRecord.shipmentId}', ${currentRecord.loadingProgress})">
                        Update %
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="WarehouseLoadingView.completeLoading('${currentRecord.shipmentId}')">
                        Mark Loading Complete
                      </button>
                    ` : ''}
                    ${currentRecord.status === 'Loading Completed' ? `
                      <button class="btn btn-primary btn-sm" onclick="WarehouseLoadingView.stageForHandover('${currentRecord.shipmentId}')">
                        Confirm Handover Readiness
                      </button>
                    ` : ''}
                    ${currentRecord.status === 'Ready for Handover' ? `
                      <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_handover')">
                        Go to Handover Desk &rarr;
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- PREREQUISITES VALIDATION CARD -->
                <div class="prereqs-box">
                  <div class="prereqs-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Mandatory Loading Prerequisites Checklist
                  </div>
                  <div class="prereqs-grid">
                    <div class="prereq-item ${pickingDone ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Picking Complete: <strong>${pickingDone ? 'Verified' : 'Pending'}</strong></span>
                    </div>
                    <div class="prereq-item ${packingDone ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Packing Complete: <strong>${packingDone ? 'Verified' : 'Pending'}</strong></span>
                    </div>
                    <div class="prereq-item ${carrierAssigned ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Carrier Assigned: <strong>${carrierAssigned ? 'Yes' : 'Missing'}</strong></span>
                    </div>
                    <div class="prereq-item ${vehicleAssigned ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Vehicle Plated: <strong>${vehicleAssigned ? 'Yes' : 'Missing'}</strong></span>
                    </div>
                    <div class="prereq-item ${dockAssigned ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Dock Scheduled: <strong>${dockAssigned ? currentRecord.dockId : 'Missing'}</strong></span>
                    </div>
                    <div class="prereq-item ${readinessClear ? 'met' : 'unmet'}">
                      <span class="prereq-dot"></span>
                      <span>Readiness Clear: <strong>${readinessClear ? 'Clear' : 'Blocked'}</strong></span>
                    </div>
                  </div>
                  ${!allPrereqsMet ? `
                    <div class="prereqs-warning">
                      Loading cannot commence until all mandatory prerequisites above are completed.
                    </div>
                  ` : `
                    <div class="prereqs-success">
                      All floor prerequisites satisfied. Dock bay is cleared for vehicle loading.
                    </div>
                  `}
                </div>

                <!-- LOADING PROGRESS TRACKER -->
                <div class="loading-prog-card">
                  <div class="loading-prog-header">
                    <span>Bay Loading Progress</span>
                    <strong class="font-mono text-lg">${currentRecord.loadingProgress}% (${currentRecord.totalLoadedUnits} units stowed)</strong>
                  </div>
                  <div class="warehouse-progress-track" style="height: 10px;">
                    <div class="warehouse-progress-fill" style="width: ${currentRecord.loadingProgress}%;"></div>
                  </div>
                  <div class="loading-stages-row">
                    <span class="loading-stage ${currentRecord.loadingProgress >= 25 ? 'active' : ''}">25% Staged</span>
                    <span class="loading-stage ${currentRecord.loadingProgress >= 50 ? 'active' : ''}">50% Half-Loaded</span>
                    <span class="loading-stage ${currentRecord.loadingProgress >= 75 ? 'active' : ''}">75% Strapped</span>
                    <span class="loading-stage ${currentRecord.loadingProgress === 100 ? 'active' : ''}">100% Sealed</span>
                  </div>
                </div>

                <!-- DISPATCH READINESS SUMMARY -->
                <div class="detail-prop-table" style="margin-top: 14px;">
                  <div class="prop-row">
                    <span class="prop-key">Planned Departure:</span>
                    <span class="prop-val font-mono">${shipment && shipment.plannedDeparture ? new Date(shipment.plannedDeparture).toLocaleString() : 'Today 14:00'}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-key">Loading Started At:</span>
                    <span class="prop-val font-mono">${currentRecord.startedAt ? new Date(currentRecord.startedAt).toLocaleTimeString() : 'Not Started'}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-key">Loading Completed At:</span>
                    <span class="prop-val font-mono">${currentRecord.completedAt ? new Date(currentRecord.completedAt).toLocaleTimeString() : 'Pending Completion'}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-key">Dispatch Readiness:</span>
                    <span class="prop-val">${currentRecord.dispatchReadinessValidated ? '<span class="text-success font-bold">&check; Validated</span>' : '<span class="text-muted">Awaiting loading completion</span>'}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-key">Stowage & Safety Notes:</span>
                    <span class="prop-val">${currentRecord.notes || 'Pallets secured with load lock bars.'}</span>
                  </div>
                </div>

                <!-- FOOTER NOTICE -->
                <div class="readiness-card-footer">
                  <div class="text-xs text-muted">
                    <em>Important Rule: Loading completion does not equal Dispatched. Dispatch must follow carrier physical handover.</em>
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  selectShipment(shipmentId) {
    this.state.selectedShipmentId = shipmentId;
    App.renderCurrentView();
  },

  setFilter(status) {
    this.state.filterStatus = status;
    App.renderCurrentView();
  },

  startLoading(shipmentId) {
    try {
      window.BRIDGES_STORE.startLoading(shipmentId);
      UI.showToast(`Loading commenced for ${shipmentId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openProgressModal(shipmentId, currentProg) {
    const modalTitle = `Update Loading Progress — ${shipmentId}`;
    const modalBody = `
      <form id="load-prog-form" onsubmit="WarehouseLoadingView.handleUpdateProgress(event, '${shipmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Loading Progress Percentage <span class="text-danger">*</span></label>
          <select id="load-pct-select" class="form-control" required>
            <option value="25" ${currentProg === 25 ? 'selected' : ''}>25% — First pallet tier loaded</option>
            <option value="50" ${currentProg === 50 ? 'selected' : ''}>50% — Mid-trailer cargo stowed</option>
            <option value="75" ${currentProg === 75 ? 'selected' : ''}>75% — Final pallets loaded & strapped</option>
            <option value="100" ${currentProg === 100 ? 'selected' : ''}>100% — Fully loaded and secured</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Stowage Notes</label>
          <input type="text" id="load-notes-input" class="form-control" placeholder="Weight distribution verified, corner protectors placed...">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Update Progress</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleUpdateProgress(e, shipmentId) {
    e.preventDefault();
    const pct = parseInt(document.getElementById('load-pct-select').value, 10);
    const notes = document.getElementById('load-notes-input').value;

    try {
      window.BRIDGES_STORE.updateLoadingProgress(shipmentId, pct, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Updated loading progress to ${pct}%`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  completeLoading(shipmentId) {
    const sealNumber = prompt("Enter Cargo Security Seal Number (e.g. SL-88495):", `SL-${Math.floor(10000 + Math.random() * 90000)}`);
    if (!sealNumber) return;

    try {
      window.BRIDGES_STORE.completeLoading(shipmentId, sealNumber);
      UI.showToast(`Loading completed and sealed for ${shipmentId}. Ready for carrier handover.`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  stageForHandover(shipmentId) {
    const store = window.BRIDGES_STORE;
    const loading = store.getLoadingRecord(shipmentId);
    if (loading) {
      loading.status = "Ready for Handover";
      loading.handoverReadyAt = new Date().toISOString();
      const handover = store.getCarrierHandover(shipmentId);
      if (handover) {
        handover.handoverStatus = "Ready for Handover";
      }
      store.save();
    }
    UI.showToast(`Staged ${shipmentId} for Carrier Handover`, "success");
    App.navigate('warehouse_handover');
  }
};
