/**
 * BRIDGES Control Tower - Warehouse Carrier Handover View
 * Phase 5: Official physical custody transfer desk from warehouse floor to carrier driver
 * Verifies seal integrity, captures driver signature / BOL reference, and logs shared handover event.
 */

window.WarehouseHandoverView = {
  state: {
    selectedShipmentId: null,
    filterStatus: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const handovers = (store.data.carrierHandovers || []).filter(h => h.warehouseId === whId);

    if (!this.state.selectedShipmentId && handovers.length > 0) {
      this.state.selectedShipmentId = handovers[0].shipmentId;
    }

    let filtered = handovers;
    if (this.state.filterStatus !== 'ALL') {
      filtered = filtered.filter(h => h.handoverStatus === this.state.filterStatus);
    }

    const currentRecord = handovers.find(h => h.shipmentId === this.state.selectedShipmentId) || handovers[0];
    const shipment = currentRecord ? (store.data.shipments || []).find(s => s.id === currentRecord.shipmentId) : null;
    const loading = currentRecord ? store.getLoadingRecord(currentRecord.shipmentId) : null;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Carrier Handover Desk</h2>
            <p class="warehouse-view-subheading">
              Transfer physical cargo custody to assigned motor carriers, verify seal integrity, and log bill of lading at ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="WarehouseHandoverView.openReportBlockerModal('${currentRecord ? currentRecord.shipmentId : ''}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Report Handover Blocker
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_history')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Activity History
            </button>
          </div>
        </div>

        <!-- 2-COLUMN LAYOUT -->
        <div class="warehouse-readiness-layout">
          <!-- LEFT SHIPMENT SELECTOR -->
          <div class="warehouse-readiness-sidebar">
            <div class="warehouse-card">
              <div class="warehouse-card-header">
                <h3 class="warehouse-card-title">Handover Queue</h3>
                <div class="readiness-filter-mini">
                  <select onchange="WarehouseHandoverView.setFilter(this.value)">
                    <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All</option>
                    <option value="Ready for Handover" ${this.state.filterStatus === 'Ready for Handover' ? 'selected' : ''}>Ready</option>
                    <option value="Handover In Progress" ${this.state.filterStatus === 'Handover In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Handed Over" ${this.state.filterStatus === 'Handed Over' ? 'selected' : ''}>Handed Over</option>
                    <option value="Handover Blocked" ${this.state.filterStatus === 'Handover Blocked' ? 'selected' : ''}>Blocked</option>
                  </select>
                </div>
              </div>
              <div class="readiness-shipment-list">
                ${filtered.length === 0 ? `
                  <div class="warehouse-empty-state" style="padding: 16px;">
                    <p class="text-xs text-muted">No handover records matching filter.</p>
                  </div>
                ` : filtered.map(h => {
                  const isSelected = h.shipmentId === this.state.selectedShipmentId;
                  const statusClass = h.handoverStatus === 'Handed Over' ? 'badge-ready' : 
                    (h.handoverStatus === 'Handover Blocked' ? 'badge-blocked' : 
                    (h.handoverStatus === 'Ready for Handover' ? 'badge-inbound' : 'badge-progress'));

                  return `
                    <div 
                      class="readiness-shipment-item ${isSelected ? 'selected' : ''}"
                      onclick="WarehouseHandoverView.selectShipment('${h.shipmentId}')"
                    >
                      <div class="rsi-top">
                        <span class="font-mono font-bold" style="color: #18217E;">${h.shipmentId}</span>
                        <span class="badge ${statusClass}">${h.handoverStatus}</span>
                      </div>
                      <div class="rsi-carrier text-truncate">
                        ${h.carrierName} &bull; ${h.driverName || 'Driver TBA'}
                      </div>
                      <div class="rsi-dock text-xs text-muted">
                        Dock: <strong>${h.dockId || 'TBD'}</strong> &bull; Seal: <strong>${h.sealNumber || 'Pending'}</strong>
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
                  <p>Select a shipment from the handover queue.</p>
                </div>
              </div>
            ` : `
              <div class="warehouse-card">
                <!-- TOP HEADER -->
                <div class="readiness-detail-header">
                  <div>
                    <div class="badge-row" style="margin-bottom: 4px;">
                      <span class="font-mono font-bold" style="font-size: 16px; color: #18217E;">${currentRecord.shipmentId}</span>
                      <span class="badge ${currentRecord.handoverStatus === 'Handed Over' ? 'badge-ready' : (currentRecord.handoverStatus === 'Handover Blocked' ? 'badge-blocked' : 'badge-inbound')}">
                        ${currentRecord.handoverStatus}
                      </span>
                      ${currentRecord.dockId ? `<span class="badge badge-dock">${currentRecord.dockId}</span>` : ''}
                      <span class="badge badge-subtle">${currentRecord.cargoVerificationStatus}</span>
                    </div>
                    <div class="text-xs text-muted">
                      Carrier: <strong>${currentRecord.carrierName}</strong> &bull; Vehicle: <strong>${currentRecord.vehiclePlate}</strong> &bull; Driver: <strong>${currentRecord.driverName}</strong>
                    </div>
                  </div>
                  <div class="readiness-header-action" style="display: flex; gap: 8px;">
                    ${currentRecord.handoverStatus === 'Ready for Handover' || currentRecord.handoverStatus === 'Handover In Progress' ? `
                      <button class="btn btn-primary btn-sm" onclick="WarehouseHandoverView.openConfirmModal('${currentRecord.shipmentId}')">
                        Confirm Handover & Sign BOL
                      </button>
                    ` : ''}
                    ${currentRecord.handoverStatus === 'Handed Over' ? `
                      <span class="badge badge-ready" style="padding: 6px 12px; font-size: 12px;">
                        &check; Handover Completed (${new Date(currentRecord.handoverTimestamp).toLocaleTimeString()})
                      </span>
                    ` : ''}
                  </div>
                </div>

                <!-- BLOCKER WARNING IF BLOCKED -->
                ${currentRecord.handoverStatus === 'Handover Blocked' ? `
                  <div class="readiness-blocker-alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <strong>Handover Blocker Active:</strong>
                      <p style="margin: 2px 0 0; color: #8C2527;">${currentRecord.blockerReason || 'Handover halted due to documentation or vehicle discrepancy.'}</p>
                    </div>
                  </div>
                ` : ''}

                <!-- CARRIER & CARGO CUSTODY MANIFEST -->
                <div class="detail-section-row" style="margin-top: 14px;">
                  <div class="detail-col">
                    <h4 class="detail-section-heading">Carrier Driver Verification</h4>
                    <div class="detail-prop-table">
                      <div class="prop-row">
                        <span class="prop-key">Carrier Company:</span>
                        <span class="prop-val font-bold">${currentRecord.carrierName}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Driver Name:</span>
                        <span class="prop-val">${currentRecord.driverName || 'Not Assigned'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Vehicle Plate / IMO:</span>
                        <span class="prop-val font-mono">${currentRecord.vehiclePlate || 'Not Assigned'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Loading Bay:</span>
                        <span class="prop-val font-mono">${currentRecord.dockId || 'Unassigned'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Loading State:</span>
                        <span class="prop-val">${loading ? loading.status : 'Completed'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="detail-col">
                    <h4 class="detail-section-heading">Custody & Legal Proof</h4>
                    <div class="detail-prop-table">
                      <div class="prop-row">
                        <span class="prop-key">Security Seal Number:</span>
                        <span class="prop-val font-mono font-bold" style="color: #18217E;">${currentRecord.sealNumber || 'Pending Placement'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Proof / BOL Reference:</span>
                        <span class="prop-val font-mono">${currentRecord.proofReference || 'Generated at Signoff'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Planned Departure:</span>
                        <span class="prop-val font-mono">${currentRecord.plannedDeparture ? new Date(currentRecord.plannedDeparture).toLocaleString() : 'Today'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Signed By:</span>
                        <span class="prop-val">${currentRecord.handoverSignee || 'Awaiting Driver Signature'}</span>
                      </div>
                      <div class="prop-row">
                        <span class="prop-key">Handover Timestamp:</span>
                        <span class="prop-val font-mono">${currentRecord.handoverTimestamp ? new Date(currentRecord.handoverTimestamp).toLocaleString() : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- NOTES & INSTRUCTIONS -->
                <div class="detail-prop-table" style="margin-top: 14px;">
                  <div class="prop-row">
                    <span class="prop-key">Handover Notes:</span>
                    <span class="prop-val">${currentRecord.notes || 'All pallets verified against packing slip and Bill of Lading.'}</span>
                  </div>
                </div>

                <!-- FOOTER REMINDER -->
                <div class="readiness-card-footer">
                  <div class="text-xs text-muted">
                    <em>Compliance Note: Warehouse Handover marks custody transfer from facility to motor carrier. It does NOT represent final customer delivery.</em>
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

  openConfirmModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const handover = store.getCarrierHandover(shipmentId);
    const shipment = (store.data.shipments || []).find(s => s.id === shipmentId);

    const defaultBOL = `BOL-DAL-${Math.floor(10000 + Math.random() * 90000)}-${shipmentId.slice(-4)}`;
    const driverName = handover ? handover.driverName : (shipment ? shipment.driverName : 'Ethan Cole');

    const modalTitle = `Confirm Carrier Handover — ${shipmentId}`;
    const modalBody = `
      <form id="handover-confirm-form" onsubmit="WarehouseHandoverView.handleConfirmHandover(event, '${shipmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Carrier Organization</label>
          <input type="text" class="form-control" value="${handover ? handover.carrierName : 'Carrier'}" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Driver Name / Signee <span class="text-danger">*</span></label>
          <input type="text" id="handover-driver-input" class="form-control" value="${driverName || ''}" required>
          <span class="text-xs text-muted">Carrier driver physically present at dock receiving cargo custody.</span>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Bill of Lading / Proof Reference <span class="text-danger">*</span></label>
          <input type="text" id="handover-proof-input" class="form-control" value="${defaultBOL}" required>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Supervisor Handover Notes</label>
          <textarea id="handover-notes-input" class="form-control" rows="2" placeholder="Cargo condition verified, seal intact, driver countersigned..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Sign & Hand Over Cargo</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleConfirmHandover(e, shipmentId) {
    e.preventDefault();
    const driverName = document.getElementById('handover-driver-input').value.trim();
    const proofRef = document.getElementById('handover-proof-input').value.trim();
    const notes = document.getElementById('handover-notes-input').value.trim();

    if (!driverName || !proofRef) {
      UI.showToast("Driver name and BOL reference are required for custody handover.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.confirmCarrierHandover(shipmentId, {
        driverName: driverName,
        proofReference: proofRef,
        notes: notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Custody transferred for ${shipmentId}. Shipment handed over to carrier.`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openReportBlockerModal(shipmentId) {
    const modalTitle = `Report Handover Blocker — ${shipmentId}`;
    const modalBody = `
      <form id="handover-blocker-form" onsubmit="WarehouseHandoverView.handleReportBlocker(event, '${shipmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Blocker Category <span class="text-danger">*</span></label>
          <select id="hb-cat-select" class="form-control" required>
            <option value="Documentation Missing">Consignee Export / Commercial Documentation Missing</option>
            <option value="Driver Refusal">Driver Refusal / Signature Discrepancy</option>
            <option value="Damaged Cargo at Gate">Cargo Packaging Damaged at Gate</option>
            <option value="Vehicle Discrepancy">Vehicle License / Carrier Plate Mismatch</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Blocker Description & Operational Impact <span class="text-danger">*</span></label>
          <textarea id="hb-reason-input" class="form-control" rows="3" required placeholder="Specify exact missing stamps, driver objections, or damaged pallet numbers..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Halt Handover & Create Blocker</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleReportBlocker(e, shipmentId) {
    e.preventDefault();
    const reason = document.getElementById('hb-reason-input').value.trim();

    if (!reason) {
      UI.showToast("Blocker reason is required.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.reportHandoverBlocker(shipmentId, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast("Handover halted. Blocker logged and shared with Control Tower.", "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }
};
