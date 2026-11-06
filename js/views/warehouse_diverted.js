/**
 * BRIDGES Control Tower - Diverted Shipments View
 * Phase 5: Rerouted and emergency recovery incoming shipment workflow
 * Capacity review, explicit Accept/Reject decisions with reason, dock staging, and inbound receiving workflow.
 */

window.WarehouseDivertedView = {
  state: {
    selectedDiversionId: null,
    filterStatus: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const diversions = store.getDiversions(whId);

    if (!this.state.selectedDiversionId && diversions.length > 0) {
      this.state.selectedDiversionId = diversions[0].id;
    }

    let filtered = diversions;
    if (this.state.filterStatus !== 'ALL') {
      filtered = filtered.filter(d => d.status === this.state.filterStatus);
    }

    const currentRecord = diversions.find(d => d.id === this.state.selectedDiversionId) || diversions[0];
    const shipment = currentRecord ? (store.data.shipments || []).find(s => s.id === currentRecord.shipmentId) : null;
    const docks = store.getWarehouseDocks(whId);

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Diverted & Incoming Recovery Shipments</h2>
            <p class="warehouse-view-subheading">
              Review rerouted cargo inbound to ${warehouse.name}, assess facility receiving capacity, and execute intake verification
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('warehouse_docks')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
              </svg>
              Check Dock Availability
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_history')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Diversion Audit Log
            </button>
          </div>
        </div>

        <!-- 2-COLUMN LAYOUT -->
        <div class="warehouse-readiness-layout">
          <!-- LEFT DIVERSION SELECTOR -->
          <div class="warehouse-readiness-sidebar">
            <div class="warehouse-card">
              <div class="warehouse-card-header">
                <h3 class="warehouse-card-title">Diversion Requests</h3>
                <div class="readiness-filter-mini">
                  <select onchange="WarehouseDivertedView.setFilter(this.value)">
                    <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All</option>
                    <option value="Pending Review" ${this.state.filterStatus === 'Pending Review' ? 'selected' : ''}>Pending</option>
                    <option value="Accepted" ${this.state.filterStatus === 'Accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="Arrived" ${this.state.filterStatus === 'Arrived' ? 'selected' : ''}>Arrived</option>
                    <option value="Receiving In Progress" ${this.state.filterStatus === 'Receiving In Progress' ? 'selected' : ''}>Receiving</option>
                    <option value="Received" ${this.state.filterStatus === 'Received' ? 'selected' : ''}>Received</option>
                    <option value="Rejected" ${this.state.filterStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                  </select>
                </div>
              </div>
              <div class="readiness-shipment-list">
                ${filtered.length === 0 ? `
                  <div class="warehouse-empty-state" style="padding: 16px;">
                    <p class="text-xs text-muted">No diverted shipments matching filter.</p>
                  </div>
                ` : filtered.map(d => {
                  const isSelected = d.id === this.state.selectedDiversionId;
                  const statusClass = d.status === 'Received' || d.status === 'Accepted' ? 'badge-ready' : 
                    (d.status === 'Rejected' ? 'badge-blocked' : 
                    (d.status === 'Pending Review' ? 'badge-high' : 'badge-inbound'));

                  return `
                    <div 
                      class="readiness-shipment-item ${isSelected ? 'selected' : ''}"
                      onclick="WarehouseDivertedView.selectDiversion('${d.id}')"
                    >
                      <div class="rsi-top">
                        <span class="font-mono font-bold" style="color: #18217E;">${d.shipmentId}</span>
                        <span class="badge ${statusClass}">${d.status}</span>
                      </div>
                      <div class="rsi-carrier text-truncate">
                        Carrier: ${d.currentCarrier}
                      </div>
                      <div class="rsi-dock text-xs text-muted">
                        ETA: <strong>${d.expectedArrival ? new Date(d.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</strong> &bull; Dock: <strong>${d.assignedDock || 'TBD'}</strong>
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
                  <p>Select a diversion request to review.</p>
                </div>
              </div>
            ` : `
              <div class="warehouse-card">
                <!-- TOP HEADER -->
                <div class="readiness-detail-header">
                  <div>
                    <div class="badge-row" style="margin-bottom: 4px;">
                      <span class="font-mono font-bold" style="font-size: 16px; color: #18217E;">${currentRecord.shipmentId}</span>
                      <span class="badge ${currentRecord.status === 'Received' || currentRecord.status === 'Accepted' ? 'badge-ready' : (currentRecord.status === 'Rejected' ? 'badge-critical' : (currentRecord.status === 'Pending Review' ? 'badge-high' : 'badge-inbound'))}">
                        ${currentRecord.status}
                      </span>
                      <span class="badge badge-dock">${currentRecord.assignedDock || 'Bay Pending'}</span>
                      <span class="badge badge-subtle">Ref: ${currentRecord.id}</span>
                    </div>
                    <div class="text-xs text-muted">
                      Original Route: <strong>${currentRecord.originalDestination}</strong> &rarr; Rerouted Facility: <strong>${currentRecord.proposedDiversionDestination}</strong>
                    </div>
                  </div>
                  <div class="readiness-header-action" style="display: flex; gap: 8px;">
                    ${currentRecord.status === 'Pending Review' ? `
                      <button class="btn btn-outline btn-sm text-danger" onclick="WarehouseDivertedView.openRejectModal('${currentRecord.id}')">
                        Reject Diversion
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="WarehouseDivertedView.openAcceptModal('${currentRecord.id}')">
                        Accept Diversion
                      </button>
                    ` : ''}
                    ${currentRecord.status === 'Accepted' || currentRecord.status === 'Awaiting Arrival' ? `
                      <button class="btn btn-primary btn-sm" onclick="WarehouseDivertedView.openRecordArrivalModal('${currentRecord.id}')">
                        Record Gate Arrival
                      </button>
                    ` : ''}
                    ${currentRecord.status === 'Arrived' || currentRecord.status === 'Receiving In Progress' ? `
                      <button class="btn btn-primary btn-sm" onclick="WarehouseDivertedView.openReceivingModal('${currentRecord.id}')">
                        Execute Inbound Receiving &check;
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- DIVERSION CAUSE & OPERATIONAL RATIONALE -->
                <div class="detail-blocker-box has-blockers" style="background: #F8FAFD; border-color: #18217E;">
                  <div class="blocker-box-title" style="color: #18217E;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    Diversion Decision Rationale & Control Tower Context
                  </div>
                  <p class="text-xs" style="color: #070724; margin: 4px 0 0;">
                    <strong>Reason for Reroute:</strong> ${currentRecord.diversionReason}
                  </p>
                  ${currentRecord.rejectionReason ? `
                    <p class="text-xs" style="color: #EA341F; margin: 4px 0 0; font-weight: bold;">
                      Rejection Reason: ${currentRecord.rejectionReason}
                    </p>
                  ` : ''}
                </div>

                <!-- 2-COL DETAILS -->
                <div class="detail-section-row" style="margin-top: 14px;">
                  <div class="detail-col">
                    <h4 class="detail-section-heading">Inbound Transport Details</h4>
                    <div class="detail-prop-table">
                      <div class="prop-row">
                        <span class="prop-key">Active Carrier:</span>
                        <span class="prop-val font-bold">${currentRecord.currentCarrier}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Vehicle Plate:</span>
                        <span class="prop-val font-mono">${currentRecord.vehiclePlate}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Driver Name:</span>
                        <span class="prop-val">${currentRecord.driverName}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Estimated ETA:</span>
                        <span class="prop-val font-mono">${currentRecord.expectedArrival ? new Date(currentRecord.expectedArrival).toLocaleString() : 'Today'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Receiving Gate / Dock:</span>
                        <span class="prop-val font-mono font-bold" style="color: #18217E;">${currentRecord.assignedDock || 'Pending Assignment'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="detail-col">
                    <h4 class="detail-section-heading">Cargo Manifest & Receiving Progress</h4>
                    <div class="detail-prop-table">
                      <div class="prop-row">
                        <span class="prop-key">Cargo Type:</span>
                        <span class="prop-val">${currentRecord.cargoDescription}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Manifested Quantity:</span>
                        <span class="prop-val font-bold">${currentRecord.expectedQuantity} units</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Verified Received:</span>
                        <span class="prop-val font-bold ${currentRecord.receivedQuantity === currentRecord.expectedQuantity ? 'text-success' : ''}">
                          ${currentRecord.receivedQuantity || 0} / ${currentRecord.expectedQuantity} units
                        </span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Arrival Recorded At:</span>
                        <span class="prop-val font-mono">${currentRecord.arrivedAt ? new Date(currentRecord.arrivedAt).toLocaleTimeString() : 'Not Arrived Yet'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Intake Completed At:</span>
                        <span class="prop-val font-mono">${currentRecord.receivedAt ? new Date(currentRecord.receivedAt).toLocaleTimeString() : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- RECEIVING INSTRUCTIONS & NOTES -->
                <div class="detail-prop-table" style="margin-top: 14px;">
                  <div class="prop-row">
                    <span class="prop-key">Receiving Protocol / Instructions:</span>
                    <span class="prop-val">${currentRecord.receivingInstructions || 'Standard cross-dock receiving protocol.'}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-key">Receiving Staff Notes:</span>
                    <span class="prop-val">${currentRecord.receivingNotes || 'No anomalies recorded.'}</span>
                  </div>
                </div>

                <!-- FOOTER -->
                <div class="readiness-card-footer">
                  <div class="text-xs text-muted">
                    <em>Audit Rule: Diverted shipments retain their original history and destination details. Acceptance is broadcast live to Dispatcher & Analyst.</em>
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  selectDiversion(divId) {
    this.state.selectedDiversionId = divId;
    App.renderCurrentView();
  },

  setFilter(status) {
    this.state.filterStatus = status;
    App.renderCurrentView();
  },

  openAcceptModal(diversionId) {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const docks = store.getWarehouseDocks(whId);

    const modalTitle = `Accept Inbound Diversion`;
    const modalBody = `
      <form id="accept-diversion-form" onsubmit="WarehouseDivertedView.handleAcceptDiversion(event, '${diversionId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Assigned Receiving Bay / Dock <span class="text-danger">*</span></label>
          <select id="acc-dock-select" class="form-control" required>
            <option value="">-- Choose Bay --</option>
            ${docks.map(d => `<option value="${d.id}" ${d.status === 'Available' ? 'selected' : ''}>${d.id} (${d.type}) — ${d.status}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Receiving Instructions for Gate & Floor Staff <span class="text-danger">*</span></label>
          <textarea id="acc-instructions-input" class="form-control" rows="3" required placeholder="e.g. Stage immediately in Reefer staging zone, verify cold-chain logger upon seal removal, alert shift supervisor..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Acceptance</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleAcceptDiversion(e, diversionId) {
    e.preventDefault();
    const dock = document.getElementById('acc-dock-select').value;
    const instructions = document.getElementById('acc-instructions-input').value.trim();

    try {
      window.BRIDGES_STORE.respondToDiversion(diversionId, {
        decision: 'Accepted',
        assignedDock: dock,
        receivingInstructions: instructions
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Diversion accepted. Inbound dock bay reserved.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openRejectModal(diversionId) {
    const modalTitle = `Reject Inbound Diversion`;
    const modalBody = `
      <form id="reject-diversion-form" onsubmit="WarehouseDivertedView.handleRejectDiversion(event, '${diversionId}')">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          Rejecting an incoming diverted shipment alerts the Transport Dispatcher to find an alternate recovery facility. A clear operational reason is mandatory.
        </p>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Mandatory Rejection Rationale <span class="text-danger">*</span></label>
          <textarea id="rej-reason-input" class="form-control" rows="3" required placeholder="e.g. Cold storage capacity exceeded (100% capacity), dock bays undergo scheduled floor repaving..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Reject Request</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleRejectDiversion(e, diversionId) {
    e.preventDefault();
    const reason = document.getElementById('rej-reason-input').value.trim();

    if (!reason) {
      UI.showToast("A rejection reason is mandatory.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.respondToDiversion(diversionId, {
        decision: 'Rejected',
        rejectionReason: reason
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Diversion rejected. Notified Control Tower and Dispatcher.", "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openRecordArrivalModal(diversionId) {
    const store = window.BRIDGES_STORE;
    const div = (store.data.diversionRequests || []).find(d => d.id === diversionId);
    const whId = store.getCurrentWarehouseId();
    const docks = store.getWarehouseDocks(whId);

    const modalTitle = `Record Vehicle Arrival at Gate`;
    const modalBody = `
      <form id="record-arr-form" onsubmit="WarehouseDivertedView.handleRecordArrival(event, '${diversionId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Receiving Dock Bay <span class="text-danger">*</span></label>
          <select id="rec-dock-select" class="form-control" required>
            ${docks.map(d => `<option value="${d.id}" ${div && div.assignedDock === d.id ? 'selected' : ''}>${d.id} (${d.type})</option>`).join('')}
          </select>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Arrival & Stage Bay</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleRecordArrival(e, diversionId) {
    e.preventDefault();
    const dock = document.getElementById('rec-dock-select').value;

    try {
      window.BRIDGES_STORE.recordDiversionArrival(diversionId, dock);
      UI.closeModal('generic-app-modal');
      UI.showToast("Vehicle arrival logged. Staged for receiving.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openReceivingModal(diversionId) {
    const store = window.BRIDGES_STORE;
    const div = (store.data.diversionRequests || []).find(d => d.id === diversionId);

    const modalTitle = `Execute Inbound Receiving Verification`;
    const modalBody = `
      <form id="exec-rec-form" onsubmit="WarehouseDivertedView.handleExecuteReceiving(event, '${diversionId}', ${div.expectedQuantity})">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Expected Units</label>
          <input type="text" class="form-control" value="${div.expectedQuantity} units manifested" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Physical Count Verified (Units) <span class="text-danger">*</span></label>
          <input type="number" id="rec-qty-input" class="form-control" min="0" value="${div.expectedQuantity}" required>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Receiving Status <span class="text-danger">*</span></label>
          <select id="rec-status-select" class="form-control" required>
            <option value="Received">Received (Fully verified & accepted into warehouse)</option>
            <option value="Receiving In Progress">Receiving In Progress (Partial check)</option>
            <option value="Blocked">Blocked (Discrepancy / Damage found)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Receiving Notes & Inspection Findings</label>
          <textarea id="rec-notes-input" class="form-control" rows="2" placeholder="Cold logger downloaded (4.2°C compliant), pallet seals matched, no external box damage..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Complete Inbound Intake</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleExecuteReceiving(e, diversionId, expectedQty) {
    e.preventDefault();
    const qty = parseInt(document.getElementById('rec-qty-input').value, 10);
    const status = document.getElementById('rec-status-select').value;
    const notes = document.getElementById('rec-notes-input').value.trim();

    if (isNaN(qty) || qty < 0) {
      UI.showToast("Received quantity must be a non-negative number.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.updateDiversionReceiving(diversionId, {
        status: status,
        receivedQty: qty,
        notes: notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Inbound intake updated: ${status}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }
};
