/**
 * BRIDGES Control Tower - Warehouse Readiness View
 * Phase 5: Readiness workspace for outbound dispatches and incoming recovery operations
 * Tracks 8 operational readiness checks, enforces mandatory validation, and handles blocker coordination.
 */

window.WarehouseReadinessView = {
  state: {
    selectedShipmentId: null,
    filterStatus: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const readinessList = (store.data.warehouseReadiness || []).filter(r => r.warehouseId === whId);

    if (!this.state.selectedShipmentId && readinessList.length > 0) {
      this.state.selectedShipmentId = readinessList[0].shipmentId;
    }

    let filtered = readinessList;
    if (this.state.filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.overallStatus === this.state.filterStatus);
    }

    const currentRecord = readinessList.find(r => r.shipmentId === this.state.selectedShipmentId) || readinessList[0];
    const shipment = currentRecord ? (store.data.shipments || []).find(s => s.id === currentRecord.shipmentId) : null;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Warehouse Readiness Workspace</h2>
            <p class="warehouse-view-subheading">
              Validate mandatory gate, cargo, inventory, documentation, and dock prerequisites for ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('warehouse_exceptions')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Report Blocker
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_loading')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              </svg>
              Go to Loading Bays
            </button>
          </div>
        </div>

        <!-- 2-COLUMN WORKSPACE: LEFT SELECTOR / RIGHT CHECKLIST -->
        <div class="warehouse-readiness-layout">
          <!-- LEFT SHIPMENT SELECTOR COLUMN -->
          <div class="warehouse-readiness-sidebar">
            <div class="warehouse-card">
              <div class="warehouse-card-header">
                <h3 class="warehouse-card-title">Shipments (${readinessList.length})</h3>
                <div class="readiness-filter-mini">
                  <select onchange="WarehouseReadinessView.setFilter(this.value)">
                    <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All</option>
                    <option value="Ready" ${this.state.filterStatus === 'Ready' ? 'selected' : ''}>Ready</option>
                    <option value="In Progress" ${this.state.filterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Blocked" ${this.state.filterStatus === 'Blocked' ? 'selected' : ''}>Blocked</option>
                  </select>
                </div>
              </div>
              <div class="readiness-shipment-list">
                ${filtered.length === 0 ? `
                  <div class="warehouse-empty-state" style="padding: 16px;">
                    <p class="text-xs text-muted">No shipments matching filter.</p>
                  </div>
                ` : filtered.map(r => {
                  const s = (store.data.shipments || []).find(x => x.id === r.shipmentId);
                  const isSelected = r.shipmentId === this.state.selectedShipmentId;
                  const statusBadge = r.overallStatus === 'Ready' ? 'badge-ready' : (r.overallStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress');

                  return `
                    <div 
                      class="readiness-shipment-item ${isSelected ? 'selected' : ''}" 
                      onclick="WarehouseReadinessView.selectShipment('${r.shipmentId}')"
                    >
                      <div class="rsi-top">
                        <span class="font-mono font-bold" style="color: #18217E;">${r.shipmentId}</span>
                        <span class="badge ${statusBadge}">${r.overallStatus}</span>
                      </div>
                      <div class="rsi-carrier text-truncate">
                        ${s ? s.carrierName || '<span class="text-muted">Unassigned Carrier</span>' : 'N/A'}
                      </div>
                      <div class="rsi-dock text-xs text-muted">
                        ${s && s.assignedDock ? `Dock: <strong>${s.assignedDock}</strong>` : 'Dock: <em>Unassigned</em>'}
                        &bull; ${s ? s.direction || 'Outbound' : 'Outbound'}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT CHECKLIST DETAIL COLUMN -->
          <div class="warehouse-readiness-content">
            ${!currentRecord ? `
              <div class="warehouse-card">
                <div class="warehouse-empty-state" style="padding: 40px;">
                  <p>Please select a shipment to review readiness checks.</p>
                </div>
              </div>
            ` : `
              <div class="warehouse-card">
                <!-- TOP HEADER FOR SELECTED SHIPMENT -->
                <div class="readiness-detail-header">
                  <div>
                    <div class="badge-row" style="margin-bottom: 4px;">
                      <span class="font-mono font-bold" style="font-size: 16px; color: #18217E;">${currentRecord.shipmentId}</span>
                      <span class="badge ${currentRecord.overallStatus === 'Ready' ? 'badge-ready' : (currentRecord.overallStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress')}">
                        ${currentRecord.overallStatus}
                      </span>
                      ${shipment ? `<span class="badge ${(shipment.direction || (shipment.origin && (shipment.origin.includes('Dallas') || shipment.origin.includes('Capital Knot')) ? 'Outbound' : 'Inbound')) === 'Inbound' ? 'badge-inbound' : 'badge-outbound'}">${shipment.direction || (shipment.origin && (shipment.origin.includes('Dallas') || shipment.origin.includes('Capital Knot')) ? 'Outbound' : 'Inbound')}</span>` : ''}
                      ${shipment && shipment.assignedDock ? `<span class="badge badge-dock">${shipment.assignedDock}</span>` : `<span class="badge badge-outline">Dock Pending</span>`}
                    </div>
                    <div class="text-xs text-muted">
                      Route: <strong>${shipment ? shipment.origin : 'N/A'}</strong> &rarr; <strong>${shipment ? shipment.destination : 'N/A'}</strong>
                      &bull; Carrier: <strong>${shipment ? shipment.carrierName || 'Unassigned' : 'N/A'}</strong>
                    </div>
                  </div>
                  <div class="readiness-header-action" style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="WarehouseReadinessView.openColdChainCertModal('${currentRecord.shipmentId}')">
                      ❄️ Confirm Cold-Chain &amp; Transfer
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="WarehouseReadinessView.openCoordinateModal('${currentRecord.shipmentId}')">
                      Coordinate with Dispatcher
                    </button>
                  </div>
                </div>

                <!-- BLOCKER WARNING IF BLOCKED -->
                ${currentRecord.overallStatus === 'Blocked' ? `
                  <div class="readiness-blocker-alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <strong>Operational Blocker Recorded:</strong>
                      <p style="margin: 2px 0 0; color: #8C2527;">${currentRecord.blockedReason || 'One or more mandatory readiness checks are blocked.'}</p>
                    </div>
                  </div>
                ` : ''}

                <!-- CHECKLIST ITEMS TABLE -->
                <div class="warehouse-table-responsive" style="margin-top: 14px;">
                  <table class="warehouse-table">
                    <thead>
                      <tr>
                        <th style="width: 35%;">Readiness Check</th>
                        <th style="width: 15%;">Status</th>
                        <th style="width: 35%;">Operational Notes / Blocker Details</th>
                        <th style="width: 15%; text-align: right;">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(currentRecord.checklist || {}).map(([key, chk]) => {
                        const statusClass = chk.status === 'Ready' ? 'badge-ready' : 
                          (chk.status === 'Blocked' ? 'badge-blocked' : 
                          (chk.status === 'In Progress' ? 'badge-progress' : 'badge-subtle'));
                        
                        return `
                          <tr>
                            <td>
                              <div class="cell-primary font-bold">${chk.label}</div>
                              <div class="cell-sub">${chk.mandatory ? '<span style="color: #EA341F; font-weight: 600;">* Mandatory</span>' : 'Optional Check'}</div>
                            </td>
                            <td>
                              <span class="badge ${statusClass}">${chk.status}</span>
                            </td>
                            <td>
                              <div class="text-xs ${chk.status === 'Blocked' ? 'text-danger font-semibold' : 'text-muted'}">
                                ${chk.notes || 'No impediments noted.'}
                              </div>
                            </td>
                            <td style="text-align: right;">
                              <button 
                                class="btn btn-outline btn-xs" 
                                onclick="WarehouseReadinessView.openUpdateCheckModal('${currentRecord.shipmentId}', '${key}', '${chk.label}', '${chk.status}', '${this.escapeHtml(chk.notes || '')}')"
                              >
                                Edit Check
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>

                <!-- FOOTER RE-CALCULATION & AUDIT INFO -->
                <div class="readiness-card-footer">
                  <div class="text-xs text-muted">
                    Last updated by <strong>${currentRecord.updatedBy || 'Carlos Mendoza'}</strong> at ${new Date(currentRecord.updatedAt).toLocaleString()}
                  </div>
                  <div>
                    <span class="text-xs text-muted" style="margin-right: 8px;">Overall Readiness is calculated automatically from mandatory checklist items.</span>
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

  openUpdateCheckModal(shipmentId, checkKey, checkName, currentStatus, currentReason) {
    const modalTitle = `Update Check — ${checkName}`;
    const modalBody = `
      <form id="update-check-form" onsubmit="WarehouseReadinessView.handleUpdateCheck(event, '${shipmentId}', '${checkKey}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label" style="font-weight: 600;">Shipment ID</label>
          <input type="text" class="form-control" value="${shipmentId}" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label" style="font-weight: 600;">Check Status <span class="text-danger">*</span></label>
          <select id="check-status-select" class="form-control" onchange="WarehouseReadinessView.onStatusSelectChange(this.value)">
            <option value="Not Started" ${currentStatus === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Ready" ${currentStatus === 'Ready' ? 'selected' : ''}>Ready (Satisfied)</option>
            <option value="Blocked" ${currentStatus === 'Blocked' ? 'selected' : ''}>Blocked (Requires Intervention)</option>
            <option value="Not Applicable" ${currentStatus === 'Not Applicable' ? 'selected' : ''}>Not Applicable</option>
          </select>
        </div>

        <div class="form-group" id="reason-group" style="margin-bottom: 16px;">
          <label class="form-label" id="reason-label" style="font-weight: 600;">
            Notes / Reason ${currentStatus === 'Blocked' ? '<span class="text-danger">* (Mandatory for Blocked status)</span>' : ''}
          </label>
          <textarea 
            id="check-reason-input" 
            class="form-control" 
            rows="3" 
            placeholder="Enter specific operational context, discrepancies, or blocker rationale..."
          >${currentReason}</textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Check Status</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  onStatusSelectChange(val) {
    const reasonLabel = document.getElementById('reason-label');
    if (reasonLabel) {
      if (val === 'Blocked') {
        reasonLabel.innerHTML = 'Blocker Reason <span class="text-danger">* (Mandatory for Blocked status)</span>';
      } else {
        reasonLabel.innerHTML = 'Operational Notes (Optional)';
      }
    }
  },

  handleUpdateCheck(e, shipmentId, checkKey) {
    e.preventDefault();
    const status = document.getElementById('check-status-select').value;
    const reason = document.getElementById('check-reason-input').value.trim();

    if (status === 'Blocked' && !reason) {
      UI.showToast("A reason is mandatory when marking a readiness check as Blocked.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.updateWarehouseReadiness(shipmentId, checkKey, status, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Updated check to ${status}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openCoordinateModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const shipment = (store.data.shipments || []).find(s => s.id === shipmentId);
    const modalTitle = `Coordinate with Dispatcher — ${shipmentId}`;
    const modalBody = `
      <div style="padding: 8px 0;">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          If this shipment is blocked due to missing transport planning, delayed vehicles, or carrier dispatch coordination, report it directly to Dispatcher <strong>Sarah Jenkins</strong>.
        </p>
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Assigned Carrier</label>
          <input type="text" class="form-control" value="${shipment && shipment.carrierName ? shipment.carrierName : 'None Assigned (Missing Carrier)'}" disabled>
        </div>
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Coordination Message / Blocker Summary <span class="text-danger">*</span></label>
          <textarea id="dispatch-msg-input" class="form-control" rows="3" placeholder="Explain what the warehouse requires from Dispatch (e.g. carrier re-assignment, revised ETA, gate documents)..."></textarea>
        </div>
        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="WarehouseReadinessView.sendDispatchCoordination('${shipmentId}')">Dispatch Escalation</button>
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  sendDispatchCoordination(shipmentId) {
    const msg = document.getElementById('dispatch-msg-input').value.trim();
    if (!msg) {
      UI.showToast("Please provide a coordination message for the Dispatcher.", "error");
      return;
    }

    const store = window.BRIDGES_STORE;
    store.createWarehouseBlocker({
      shipmentId: shipmentId,
      blockerType: "Carrier or Vehicle Delayed",
      severity: "High",
      description: `Warehouse Escalation to Dispatch: ${msg}`,
      responsibleParty: "Transport Dispatcher (Sarah Jenkins)",
      requiredAction: "Assign compliant carrier/vehicle and update dispatch plan.",
      threatensDeliveryCommitment: true
    });

    UI.closeModal('generic-app-modal');
    UI.showToast("Escalated to Dispatcher & Control Tower", "success");
    App.renderCurrentView();
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  openColdChainCertModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = (store.data.shipments || []).find(x => x.id === shipmentId);
    const modalTitle = `Confirm Cargo Transfer & Cold-Chain Readiness — ${shipmentId}`;
    const modalBody = `
      <form id="whr-coldchain-form" onsubmit="WarehouseReadinessView.handleColdChainCertSubmit(event, '${shipmentId}')">
        <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #18217E;">Mandatory Cold-Chain Compliance Verification</div>
          <div style="font-size: 12px; color: #393A50; margin-top: 2px;">
            Target Spec: <strong>2.0°C to 8.0°C</strong> &bull; Cargo: <strong>${s ? s.cargoType || 'Pharma' : 'Biopharma'}</strong>
          </div>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Core Cargo Temperature Reading (°C) <span class="text-danger">*</span></label>
            <input type="number" step="0.1" id="whr-cc-temp" class="form-control" value="4.2" required>
            <span class="text-xs text-muted">Allowable range: 2.0°C to 8.0°C</span>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Datalogger / Telematics Sensor ID <span class="text-danger">*</span></label>
            <input type="text" id="whr-cc-logger" class="form-control" value="LOG-SENSIRION-8819" required>
          </div>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Security Seal Number <span class="text-danger">*</span></label>
            <input type="text" id="whr-cc-seal" class="form-control" value="SL-TX-994102" required>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Driver Transfer Signoff <span class="text-danger">*</span></label>
            <input type="text" id="whr-cc-driver" class="form-control" value="${s ? s.driverName || 'Ethan Cole' : 'Ethan Cole'}" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="toggle-checkbox-label" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="whr-cc-prechill" checked>
            <span style="font-size: 12px; font-weight: 600;">Reefer Bay Pre-chill Verified (+4.0°C pull-down confirmed)</span>
          </label>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Compliance & Inspection Notes</label>
          <textarea id="whr-cc-notes" class="form-control" rows="2" placeholder="Cold-chain passport verified, probe calibrated, seal intact..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Certify Cold-Chain Readiness</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleColdChainCertSubmit(e, shipmentId) {
    e.preventDefault();
    const temp = document.getElementById('whr-cc-temp').value;
    const logger = document.getElementById('whr-cc-logger').value.trim();
    const seal = document.getElementById('whr-cc-seal').value.trim();
    const driver = document.getElementById('whr-cc-driver').value.trim();
    const prechill = document.getElementById('whr-cc-prechill').checked;
    const notes = document.getElementById('whr-cc-notes').value.trim();

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
