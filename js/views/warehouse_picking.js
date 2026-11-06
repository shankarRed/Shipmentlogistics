/**
 * BRIDGES Control Tower - Warehouse Picking & Packing View
 * Phase 5: Floor execution workspace for warehouse pickers and packers
 * Real SKU-level and quantity reconciliation, progress recording, discrepancy reporting, and loading gate validation.
 */

window.WarehousePickingView = {
  state: {
    selectedShipmentId: null,
    filterStatus: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const pkpList = (store.data.pickingPacking || []).filter(p => p.warehouseId === whId);

    if (!this.state.selectedShipmentId && pkpList.length > 0) {
      this.state.selectedShipmentId = pkpList[0].shipmentId;
    }

    let filtered = pkpList;
    if (this.state.filterStatus === 'ACTIVE') {
      filtered = filtered.filter(p => p.pickingStatus !== 'Completed' || p.packingStatus !== 'Completed');
    } else if (this.state.filterStatus === 'COMPLETED') {
      filtered = filtered.filter(p => p.pickingStatus === 'Completed' && p.packingStatus === 'Completed');
    } else if (this.state.filterStatus === 'BLOCKED') {
      filtered = filtered.filter(p => p.pickingStatus === 'Blocked' || p.packingStatus === 'Blocked');
    }

    const currentRecord = pkpList.find(p => p.shipmentId === this.state.selectedShipmentId) || pkpList[0];
    const shipment = currentRecord ? (store.data.shipments || []).find(s => s.id === currentRecord.shipmentId) : null;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Picking & Packing Execution</h2>
            <p class="warehouse-view-subheading">
              Manage inventory pull, SKU verification, packaging lines, and staging reconciliation for ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="WarehousePickingView.openReportIssueModal('${currentRecord ? currentRecord.shipmentId : ''}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Report Cargo Discrepancy
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('warehouse_loading')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
              </svg>
              Proceed to Loading
            </button>
          </div>
        </div>

        <!-- 2-COLUMN LAYOUT -->
        <div class="warehouse-readiness-layout">
          <!-- LEFT SHIPMENT SELECTOR -->
          <div class="warehouse-readiness-sidebar">
            <div class="warehouse-card">
              <div class="warehouse-card-header">
                <h3 class="warehouse-card-title">Execution Queue</h3>
                <div class="readiness-filter-mini">
                  <select onchange="WarehousePickingView.setFilter(this.value)">
                    <option value="ALL" ${this.state.filterStatus === 'ALL' ? 'selected' : ''}>All</option>
                    <option value="ACTIVE" ${this.state.filterStatus === 'ACTIVE' ? 'selected' : ''}>Active</option>
                    <option value="BLOCKED" ${this.state.filterStatus === 'BLOCKED' ? 'selected' : ''}>Blocked</option>
                    <option value="COMPLETED" ${this.state.filterStatus === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                  </select>
                </div>
              </div>
              <div class="readiness-shipment-list">
                ${filtered.length === 0 ? `
                  <div class="warehouse-empty-state" style="padding: 16px;">
                    <p class="text-xs text-muted">No shipments in queue.</p>
                  </div>
                ` : filtered.map(p => {
                  const s = (store.data.shipments || []).find(x => x.id === p.shipmentId);
                  const isSelected = p.shipmentId === this.state.selectedShipmentId;
                  const pickBadge = p.pickingStatus === 'Completed' ? 'badge-ready' : (p.pickingStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress');
                  const packBadge = p.packingStatus === 'Completed' ? 'badge-ready' : (p.packingStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress');

                  return `
                    <div 
                      class="readiness-shipment-item ${isSelected ? 'selected' : ''}"
                      onclick="WarehousePickingView.selectShipment('${p.shipmentId}')"
                    >
                      <div class="rsi-top">
                        <span class="font-mono font-bold" style="color: #18217E;">${p.shipmentId}</span>
                        <div style="display: flex; gap: 4px;">
                          <span class="badge badge-xs ${pickBadge}">Pick: ${p.pickingStatus}</span>
                        </div>
                      </div>
                      <div class="rsi-carrier text-truncate">
                        ${s ? s.carrierName || 'Unassigned Carrier' : 'N/A'}
                      </div>
                      <div class="rsi-dock text-xs text-muted">
                        Units: <strong>${p.totalPicked}/${p.totalRequired}</strong> picked &bull; <strong>${p.totalPacked}/${p.totalRequired}</strong> packed
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
                  <p>Select a shipment to manage picking and packing.</p>
                </div>
              </div>
            ` : `
              <div class="warehouse-card">
                <!-- TOP HEADER -->
                <div class="readiness-detail-header">
                  <div>
                    <div class="badge-row" style="margin-bottom: 4px;">
                      <span class="font-mono font-bold" style="font-size: 16px; color: #18217E;">${currentRecord.shipmentId}</span>
                      <span class="badge ${currentRecord.pickingStatus === 'Completed' ? 'badge-ready' : (currentRecord.pickingStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress')}">
                        Picking: ${currentRecord.pickingStatus}
                      </span>
                      <span class="badge ${currentRecord.packingStatus === 'Completed' ? 'badge-ready' : (currentRecord.packingStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress')}">
                        Packing: ${currentRecord.packingStatus}
                      </span>
                    </div>
                    <div class="text-xs text-muted">
                      Cutoff Deadline: <strong>${currentRecord.deadline ? new Date(currentRecord.deadline).toLocaleString() : 'Today 14:00'}</strong>
                      &bull; Staged for Dock: <strong>${shipment && shipment.assignedDock ? shipment.assignedDock : 'Unassigned'}</strong>
                    </div>
                  </div>
                  <div class="readiness-header-action" style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="WarehousePickingView.openUpdateNotesModal('${currentRecord.shipmentId}')">
                      Notes
                    </button>
                    ${currentRecord.pickingStatus !== 'Completed' ? `
                      <button class="btn btn-outline btn-sm" onclick="WarehousePickingView.quickConfirmPick('${currentRecord.shipmentId}')">
                        Confirm Pick All
                      </button>
                    ` : ''}
                    ${currentRecord.pickingStatus === 'Completed' && currentRecord.packingStatus !== 'Completed' ? `
                      <button class="btn btn-primary btn-sm" onclick="WarehousePickingView.quickConfirmPack('${currentRecord.shipmentId}')">
                        Confirm Pack All
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- PROGRESS BARS -->
                <div class="pkp-progress-box">
                  <div class="pkp-prog-row">
                    <div class="pkp-prog-label">
                      <span>Picking Progress</span>
                      <strong>${currentRecord.totalPicked} / ${currentRecord.totalRequired} units (${Math.round((currentRecord.totalPicked / currentRecord.totalRequired) * 100)}%)</strong>
                    </div>
                    <div class="warehouse-progress-track">
                      <div class="warehouse-progress-fill" style="width: ${Math.round((currentRecord.totalPicked / currentRecord.totalRequired) * 100)}%;"></div>
                    </div>
                  </div>
                  <div class="pkp-prog-row" style="margin-top: 10px;">
                    <div class="pkp-prog-label">
                      <span>Packing Progress</span>
                      <strong>${currentRecord.totalPacked} / ${currentRecord.totalRequired} units (${Math.round((currentRecord.totalPacked / currentRecord.totalRequired) * 100)}%)</strong>
                    </div>
                    <div class="warehouse-progress-track">
                      <div class="warehouse-progress-fill" style="width: ${Math.round((currentRecord.totalPacked / currentRecord.totalRequired) * 100)}%; background: #424989;"></div>
                    </div>
                  </div>
                </div>

                <!-- BLOCKERS ALERT IF ANY -->
                ${currentRecord.blockers && currentRecord.blockers.length > 0 ? `
                  <div class="readiness-blocker-alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <strong>Floor Execution Hold:</strong>
                      <p style="margin: 2px 0 0; color: #8C2527;">${currentRecord.blockers.join(', ')}</p>
                    </div>
                  </div>
                ` : ''}

                <!-- SKU ITEMS TABLE -->
                <div class="warehouse-table-responsive" style="margin-top: 14px;">
                  <table class="warehouse-table">
                    <thead>
                      <tr>
                        <th>SKU & Description</th>
                        <th>Storage Location</th>
                        <th>Required</th>
                        <th>Picked</th>
                        <th>Packed</th>
                        <th>Condition</th>
                        <th style="text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${currentRecord.items.map(item => `
                        <tr>
                          <td>
                            <div class="cell-primary font-mono font-bold" style="color: #18217E;">${item.sku}</div>
                            <div class="cell-sub">${item.name}</div>
                          </td>
                          <td>
                            <span class="badge badge-dock">${item.location}</span>
                          </td>
                          <td class="font-mono font-bold">${item.requiredQty} ${item.unit}</td>
                          <td class="font-mono ${item.pickedQty === item.requiredQty ? 'text-success font-bold' : ''}">${item.pickedQty}</td>
                          <td class="font-mono ${item.packedQty === item.requiredQty ? 'text-success font-bold' : ''}">${item.packedQty}</td>
                          <td>
                            <span class="badge ${item.condition === 'Good' ? 'badge-ready' : 'badge-blocked'}">${item.condition}</span>
                          </td>
                          <td style="text-align: right;">
                            <button 
                              class="btn btn-outline btn-xs" 
                              onclick="WarehousePickingView.openUpdateItemModal('${currentRecord.shipmentId}', '${item.sku}', ${item.requiredQty}, ${item.pickedQty}, ${item.packedQty})"
                            >
                              Log Qty
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                <!-- OPERATIONAL NOTES & TIMESTAMPS -->
                <div class="readiness-card-footer">
                  <div class="text-xs text-muted">
                    <strong>Floor Notes:</strong> ${currentRecord.operationalNotes || 'Standard handling protocol.'}
                  </div>
                  <div class="text-xs text-muted">
                    Last touched by <strong>${currentRecord.updatedBy || 'Carlos Mendoza'}</strong> at ${new Date(currentRecord.updatedAt).toLocaleTimeString()}
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

  openUpdateItemModal(shipmentId, sku, requiredQty, currentPicked, currentPacked) {
    const modalTitle = `Log Quantities — ${sku}`;
    const modalBody = `
      <form id="item-qty-form" onsubmit="WarehousePickingView.handleUpdateItemQty(event, '${shipmentId}', '${sku}', ${requiredQty})">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Required Target Quantity</label>
          <input type="text" class="form-control" value="${requiredQty} units (Order Target)" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Picked Quantity (0 to ${requiredQty}) <span class="text-danger">*</span></label>
          <input type="number" id="item-picked-input" class="form-control" min="0" max="${requiredQty}" value="${currentPicked}" required>
          <span class="text-xs text-muted">Validated against order line. Negative values prohibited.</span>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Packed Quantity (Cannot exceed Picked) <span class="text-danger">*</span></label>
          <input type="number" id="item-packed-input" class="form-control" min="0" max="${requiredQty}" value="${currentPacked}" required>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Floor Notes</label>
          <input type="text" id="item-notes-input" class="form-control" placeholder="Aisle batch ID, scanner serial, packaging pack list ref...">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Update Item Progress</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleUpdateItemQty(e, shipmentId, sku, requiredQty) {
    e.preventDefault();
    const picked = parseInt(document.getElementById('item-picked-input').value, 10);
    const packed = parseInt(document.getElementById('item-packed-input').value, 10);
    const notes = document.getElementById('item-notes-input').value;

    if (isNaN(picked) || picked < 0) {
      UI.showToast("Picked quantity must be a non-negative number.", "error");
      return;
    }
    if (isNaN(packed) || packed < 0) {
      UI.showToast("Packed quantity must be a non-negative number.", "error");
      return;
    }
    if (packed > picked) {
      UI.showToast("Packed quantity cannot exceed the picked quantity.", "error");
      return;
    }

    try {
      const store = window.BRIDGES_STORE;
      store.updatePickingProgress(shipmentId, sku, picked, notes);
      if (packed > 0) {
        store.updatePackingProgress(shipmentId, sku, packed, notes);
      }
      UI.closeModal('generic-app-modal');
      UI.showToast(`Updated SKU ${sku} progress.`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  quickConfirmPick(shipmentId) {
    try {
      const store = window.BRIDGES_STORE;
      const pkp = store.getPickingPacking(shipmentId);
      if (!pkp) return;

      pkp.items.forEach(item => {
        store.updatePickingProgress(shipmentId, item.sku, item.requiredQty, "Full batch picked and staged.");
      });

      UI.showToast(`Picking fully completed for ${shipmentId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  quickConfirmPack(shipmentId) {
    try {
      const store = window.BRIDGES_STORE;
      const pkp = store.getPickingPacking(shipmentId);
      if (!pkp) return;

      pkp.items.forEach(item => {
        store.updatePackingProgress(shipmentId, item.sku, item.requiredQty, "Full batch packed, labeled, and staged.");
      });

      UI.showToast(`Packing fully completed for ${shipmentId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openReportIssueModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const pkp = store.getPickingPacking(shipmentId);
    const modalTitle = `Report Cargo Discrepancy — ${shipmentId}`;
    const modalBody = `
      <form id="report-issue-form" onsubmit="WarehousePickingView.handleReportIssue(event, '${shipmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Affected SKU</label>
          <select id="issue-sku-select" class="form-control" required>
            ${pkp && pkp.items ? pkp.items.map(i => `<option value="${i.sku}">${i.sku} — ${i.name}</option>`).join('') : '<option value="ALL">All Items</option>'}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Issue Type <span class="text-danger">*</span></label>
          <select id="issue-type-select" class="form-control" required>
            <option value="Damaged Goods">Damaged Goods (Crushed / Pierced / Wet)</option>
            <option value="Missing Cargo">Missing Cargo (Physical count short)</option>
            <option value="Mismatched Item">Mismatched SKU / Barcode Conflict</option>
            <option value="Packaging Failure">Packaging / Strapping Failure</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Quantity Affected <span class="text-danger">*</span></label>
          <input type="number" id="issue-qty-input" class="form-control" min="1" value="1" required>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Description & Operational Notes <span class="text-danger">*</span></label>
          <textarea id="issue-notes-input" class="form-control" rows="3" required placeholder="Describe physical findings, lot numbers, evidence photos taken..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Submit Blocker & Notify Dispatch</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleReportIssue(e, shipmentId) {
    e.preventDefault();
    const sku = document.getElementById('issue-sku-select').value;
    const issueType = document.getElementById('issue-type-select').value;
    const qty = parseInt(document.getElementById('issue-qty-input').value, 10);
    const notes = document.getElementById('issue-notes-input').value.trim();

    if (!notes) {
      UI.showToast("Please provide details of the discrepancy.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.reportCargoIssue(shipmentId, sku, issueType, qty, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Logged cargo issue: ${issueType}. Blocker created.`, "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openUpdateNotesModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const pkp = store.getPickingPacking(shipmentId);
    const modalTitle = `Floor Notes — ${shipmentId}`;
    const modalBody = `
      <div style="padding: 8px 0;">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label font-bold">Operational Floor Notes</label>
          <textarea id="pkp-floor-notes" class="form-control" rows="4">${pkp ? pkp.operationalNotes || '' : ''}</textarea>
        </div>
        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="WarehousePickingView.saveNotes('${shipmentId}')">Save Notes</button>
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  saveNotes(shipmentId) {
    const notes = document.getElementById('pkp-floor-notes').value.trim();
    const store = window.BRIDGES_STORE;
    const pkp = store.getPickingPacking(shipmentId);
    if (pkp) {
      pkp.operationalNotes = notes;
      pkp.updatedAt = new Date().toISOString();
      store.save();
    }
    UI.closeModal('generic-app-modal');
    UI.showToast("Saved operational notes.", "success");
    App.renderCurrentView();
  }
};
