/**
 * BRIDGES Control Tower - Warehouse Exceptions View
 * Phase 5: Warehouse-related operational blockers and escalation console
 * Captures floor discrepancies, tracks resolution status, and flags SLA impacts for the Control Tower.
 */

window.WarehouseExceptionsView = {
  state: {
    statusFilter: 'ALL',
    severityFilter: 'ALL',
    searchTerm: ''
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const blockers = store.getWarehouseBlockers(whId);

    // Filter
    let filtered = blockers;
    if (this.state.statusFilter !== 'ALL') {
      filtered = filtered.filter(b => b.status === this.state.statusFilter);
    }
    if (this.state.severityFilter !== 'ALL') {
      filtered = filtered.filter(b => b.severity === this.state.severityFilter);
    }
    if (this.state.searchTerm.trim()) {
      const q = this.state.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(b => 
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.shipmentId && b.shipmentId.toLowerCase().includes(q)) ||
        (b.blockerType && b.blockerType.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.responsibleParty && b.responsibleParty.toLowerCase().includes(q))
      );
    }

    const openCount = blockers.filter(b => b.status === 'Open').length;
    const criticalCount = blockers.filter(b => b.status === 'Open' && b.severity === 'Critical').length;
    const highCount = blockers.filter(b => b.status === 'Open' && b.severity === 'High').length;
    const resolvedCount = blockers.filter(b => b.status === 'Resolved').length;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Warehouse Exceptions & Blockers</h2>
            <p class="warehouse-view-subheading">
              Floor blockers, documentation halts, and cargo discrepancies at ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <button class="btn btn-secondary btn-sm" onclick="WarehouseExceptionsView.openCapacityModal()">
              Escalate Capacity &amp; Readiness
            </button>
            <button class="btn btn-secondary btn-sm" onclick="WarehouseExceptionsView.openEscalateModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 8 8 12 12 16 12 13 16 13 16 11 12 11 12 8"></polygon>
              </svg>
              Escalate to Analyst War Room
            </button>
            <button class="btn btn-primary btn-sm" onclick="WarehouseExceptionsView.openCreateModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Log Warehouse Blocker
            </button>
          </div>
        </div>

        <!-- KPI SUMMARY STRIP -->
        <div class="dock-summary-strip">
          <div class="dss-item">
            <span class="dss-label">Total Blockers</span>
            <span class="dss-val">${blockers.length}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Open Blockers</span>
            <span class="dss-val" style="color: ${openCount > 0 ? '#EA341F' : '#070724'};">${openCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Critical Severity</span>
            <span class="dss-val" style="color: #EA341F;">${criticalCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">High Severity</span>
            <span class="dss-val" style="color: #8C2527;">${highCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Resolved</span>
            <span class="dss-val" style="color: #424989;">${resolvedCount}</span>
          </div>
        </div>

        <!-- FILTER TOOLBAR -->
        <div class="warehouse-filter-panel" style="margin-top: 14px;">
          <div class="warehouse-filter-row">
            <div class="warehouse-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search blocker, shipment, type, description..." 
                value="${this.state.searchTerm}"
                oninput="WarehouseExceptionsView.onSearch(this.value)"
              >
            </div>

            <div class="warehouse-filter-group">
              <label>Status:</label>
              <select onchange="WarehouseExceptionsView.setFilter('statusFilter', this.value)">
                <option value="ALL" ${this.state.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="Open" ${this.state.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Resolved" ${this.state.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>

            <div class="warehouse-filter-group">
              <label>Severity:</label>
              <select onchange="WarehouseExceptionsView.setFilter('severityFilter', this.value)">
                <option value="ALL" ${this.state.severityFilter === 'ALL' ? 'selected' : ''}>All Severities</option>
                <option value="Critical" ${this.state.severityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
                <option value="High" ${this.state.severityFilter === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${this.state.severityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${this.state.severityFilter === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>
          </div>
        </div>

        <!-- BLOCKERS TABLE -->
        <div class="warehouse-card">
          <div class="warehouse-table-responsive">
            <table class="warehouse-table">
              <thead>
                <tr>
                  <th>Blocker ID</th>
                  <th>Shipment</th>
                  <th>Exception Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Detected</th>
                  <th>Status</th>
                  <th>Responsible Party</th>
                  <th>Required Action</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="10" class="warehouse-empty-cell">
                      <div class="warehouse-empty-state">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p style="font-weight: 600; margin: 8px 0 2px;">No warehouse blockers matching criteria</p>
                        <p class="text-xs text-muted">All active operations are currently within normal thresholds.</p>
                      </div>
                    </td>
                  </tr>
                ` : filtered.map(b => {
                  const isCrit = b.severity === 'Critical';
                  const isHigh = b.severity === 'High';
                  const sevBadge = isCrit ? 'badge-critical' : (isHigh ? 'badge-high' : 'badge-subtle');
                  const statusBadge = b.status === 'Resolved' ? 'badge-ready' : 'badge-blocked';

                  return `
                    <tr class="warehouse-table-row">
                      <td class="font-mono font-bold" style="color: #18217E;">${b.id}</td>
                      <td class="font-mono font-bold">
                        ${b.shipmentId !== 'GENERAL' ? `
                          <a href="javascript:void(0)" onclick="WarehouseShipmentsView.openDetailModal('${b.shipmentId}')" style="color: #18217E; text-decoration: none;">
                            ${b.shipmentId}
                          </a>
                        ` : `<span class="badge badge-subtle">Facility Wide</span>`}
                      </td>
                      <td>
                        <span class="badge badge-dock">${b.blockerType}</span>
                        ${b.threatensDeliveryCommitment ? `<span class="badge badge-critical" style="margin-top: 2px; display: inline-block;">SLA Risk</span>` : ''}
                      </td>
                      <td><span class="badge ${sevBadge}">${b.severity}</span></td>
                      <td>
                        <div class="cell-primary text-truncate" style="max-width: 200px;" title="${b.description}">${b.description}</div>
                        ${b.resolutionNotes ? `<div class="cell-sub text-success text-truncate" style="max-width: 200px;">Resolved: ${b.resolutionNotes}</div>` : ''}
                      </td>
                      <td class="font-mono text-xs text-muted">${new Date(b.detectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span class="badge ${statusBadge}">${b.status}</span></td>
                      <td><div class="cell-primary text-xs">${b.responsibleParty}</div></td>
                      <td><div class="warehouse-action-pill text-truncate" style="max-width: 140px;" title="${b.requiredAction}">${b.requiredAction}</div></td>
                      <td style="text-align: right; white-space: nowrap;">
                        ${b.status === 'Open' ? `
                          ${b.acknowledged ? `
                            <span class="badge badge-ready" style="font-size: 10px; margin-right: 4px;">&check; Ack</span>
                          ` : `
                            <button class="btn btn-secondary btn-xs" style="margin-right: 4px;" onclick="WarehouseExceptionsView.acknowledgeBlocker('${b.id}')">
                              Acknowledge
                            </button>
                          `}
                          <button class="btn btn-outline btn-xs" onclick="WarehouseExceptionsView.openResolveModal('${b.id}')">
                            Resolve
                          </button>
                        ` : `
                          <span class="text-xs text-muted font-bold">&check; Resolved</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  onSearch(val) {
    this.state.searchTerm = val;
    App.renderCurrentView();
  },

  setFilter(prop, val) {
    this.state[prop] = val;
    App.renderCurrentView();
  },

  openCreateModal() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const shipments = store.getWarehouseShipments(whId);

    const modalTitle = `Log Warehouse Operational Blocker`;
    const modalBody = `
      <form id="create-blocker-form" onsubmit="WarehouseExceptionsView.handleCreateBlocker(event)">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Associated Shipment (Optional / Facility Wide)</label>
          <select id="cb-shipment-select" class="form-control">
            <option value="GENERAL">-- Facility General (No specific shipment) --</option>
            ${shipments.map(s => `<option value="${s.id}">${s.id} — ${s.carrierName || 'No Carrier'} — ${s.origin} to ${s.destination}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Blocker Category <span class="text-danger">*</span></label>
          <select id="cb-type-select" class="form-control" required>
            <option value="Picking Delay">Picking Delay (Inventory inaccessible / equipment hold)</option>
            <option value="Packing Delay">Packing Delay (Line backlog / material shortage)</option>
            <option value="Cargo Discrepancy">Cargo Discrepancy (Physical count vs packing slip mismatch)</option>
            <option value="Damaged Goods">Damaged Goods (Cargo carton damaged / crushed)</option>
            <option value="Dock Unavailable">Dock Unavailable (Overbooked / mechanical door failure)</option>
            <option value="Missing Documentation">Missing Documentation (Export stamp / hazardous declaration missing)</option>
            <option value="Vehicle Not Arrived">Vehicle Not Arrived (Carrier tractor late to gate)</option>
            <option value="Loading Delay">Loading Delay (Stowage strapping / weight balance delay)</option>
            <option value="Handover Failure">Handover Failure (Driver disputed count / rejected custody)</option>
            <option value="Receiving Capacity Issue">Receiving Capacity Issue (Cold room / storage at capacity)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Severity Level <span class="text-danger">*</span></label>
          <select id="cb-sev-select" class="form-control" required>
            <option value="Critical">Critical (Immediate dispatch halt / SLA breach threatened)</option>
            <option value="High" selected>High (Major operational impediment)</option>
            <option value="Medium">Medium (Manageable floor delay)</option>
            <option value="Low">Low (Informational / minor delay)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Responsible Operational Entity <span class="text-danger">*</span></label>
          <select id="cb-resp-select" class="form-control" required>
            <option value="Warehouse Operations">Warehouse Operations (Floor / Picker team)</option>
            <option value="Transport Dispatcher">Transport Dispatcher (Sarah Jenkins)</option>
            <option value="Carrier Operations">Carrier Operations / Motor Driver</option>
            <option value="Customs & Compliance">Customs & Compliance Department</option>
            <option value="Inventory QA">Inventory Quality Assurance</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Detailed Description <span class="text-danger">*</span></label>
          <textarea id="cb-desc-input" class="form-control" rows="3" required placeholder="Specify exact pallets, locations, error messages, or missing papers..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Required Immediate Action <span class="text-danger">*</span></label>
          <input type="text" id="cb-action-input" class="form-control" required placeholder="e.g. Expedite missing customs stamp, re-assign bay 4, alert Dispatcher...">
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="toggle-checkbox-label">
            <input type="checkbox" id="cb-sla-input" checked>
            <span class="toggle-text" style="color: #EA341F; font-weight: 600;">Flag as Threatening Delivery Commitment (Broadcast to Control Tower)</span>
          </label>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Create Blocker & Notify Tower</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleCreateBlocker(e) {
    e.preventDefault();
    const shipmentId = document.getElementById('cb-shipment-select').value;
    const blockerType = document.getElementById('cb-type-select').value;
    const severity = document.getElementById('cb-sev-select').value;
    const resp = document.getElementById('cb-resp-select').value;
    const desc = document.getElementById('cb-desc-input').value.trim();
    const action = document.getElementById('cb-action-input').value.trim();
    const threatensSLA = document.getElementById('cb-sla-input').checked;

    if (!desc) {
      UI.showToast("Description is required.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.createWarehouseBlocker({
        shipmentId: shipmentId,
        blockerType: blockerType,
        severity: severity,
        responsibleParty: resp,
        description: desc,
        requiredAction: action,
        threatensDeliveryCommitment: threatensSLA
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Logged blocker: ${blockerType}`, "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openResolveModal(blockerId) {
    const store = window.BRIDGES_STORE;
    const blocker = (store.data.warehouseBlockers || []).find(b => b.id === blockerId);

    const modalTitle = `Resolve Warehouse Blocker — ${blockerId}`;
    const modalBody = `
      <form id="resolve-blocker-form" onsubmit="WarehouseExceptionsView.handleResolveBlocker(event, '${blockerId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Blocker</label>
          <input type="text" class="form-control" value="[${blocker ? blocker.severity : 'Sev'}] ${blocker ? blocker.blockerType : 'Blocker'} — ${blocker ? blocker.shipmentId : ''}" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Mandatory Resolution Notes <span class="text-danger">*</span></label>
          <textarea id="resolve-notes-input" class="form-control" rows="3" required placeholder="Detail the corrective action taken, replacement documents acquired, or clearance from QA/Dispatch..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Resolution & Clear Hold</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleResolveBlocker(e, blockerId) {
    e.preventDefault();
    const notes = document.getElementById('resolve-notes-input').value.trim();

    if (!notes) {
      UI.showToast("Resolution notes are required to clear an operational hold.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.resolveWarehouseBlocker(blockerId, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Resolved blocker ${blockerId}. Floor hold cleared.`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openEscalateModal() {
    const modalTitle = `Escalate to Control Tower Analyst War Room`;
    const modalBody = `
      <div style="padding: 8px 0;">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          Directly bridge the warehouse shift floor to Control Tower Lead Analyst <strong>Marcus Vance</strong> for priority rerouting, customs intervention, or customer service alerting.
        </p>
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">War Room Escalation Topic <span class="text-danger">*</span></label>
          <input type="text" id="warroom-topic" class="form-control" placeholder="e.g. Cold Chain Failure Imminent / Export Customs Hold / Gate Lockout" required>
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Urgent Situation Summary <span class="text-danger">*</span></label>
          <textarea id="warroom-desc" class="form-control" rows="3" placeholder="Provide full context for Marcus Vance and operational commanders..."></textarea>
        </div>
        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="WarehouseExceptionsView.sendWarRoomEscalation()">Transmit to Analyst War Room</button>
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  sendWarRoomEscalation() {
    const topic = document.getElementById('warroom-topic').value.trim();
    const desc = document.getElementById('warroom-desc').value.trim();

    if (!topic || !desc) {
      UI.showToast("Topic and summary are required for War Room escalation.", "error");
      return;
    }

    const store = window.BRIDGES_STORE;
    store.createWarehouseBlocker({
      shipmentId: "WAR-ROOM-ESCALATION",
      blockerType: topic,
      severity: "Critical",
      responsibleParty: "Control Tower Analyst (Marcus Vance)",
      description: desc,
      requiredAction: "Review in War Room and initiate multi-department recovery.",
      threatensDeliveryCommitment: true
    });

    UI.closeModal('generic-app-modal');
    UI.showToast("Transmitted to Analyst War Room & Control Tower", "success");
    App.renderCurrentView();
  },

  acknowledgeBlocker(blockerId) {
    try {
      window.BRIDGES_STORE.acknowledgeWarehouseException(blockerId, "Acknowledged by shift supervisor Carlos Mendoza.");
      UI.showToast("Exception acknowledged. Control Tower notified.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openCapacityModal() {
    const store = window.BRIDGES_STORE;
    const wh = store.getWarehouse(store.getCurrentWarehouseId());

    const modalTitle = `Escalate Warehouse Capacity or Readiness Bottleneck`;
    const modalBody = `
      <form id="exc-capacity-form" onsubmit="WarehouseExceptionsView.handleEscalateCapacity(event)">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          Broadcast urgent facility capacity or readiness hold at ${wh.name} directly to the Lead Dispatcher and Analyst War Room.
        </p>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Capacity / Readiness Category <span class="text-danger">*</span></label>
          <select id="we-cap-type" class="form-control" required>
            <option value="Cold Room Capacity Saturation (>95%)">Cold Room Capacity Saturation (>95% Full)</option>
            <option value="Dock Bay Congestion / Yard Gate Jam">Dock Bay Congestion / Yard Gate Jam</option>
            <option value="Trailer Staging Area Saturation">Trailer Staging Area Saturation</option>
            <option value="Material Handling Equipment Failure (MHE)">Material Handling Equipment Failure (Forklifts/Cranes)</option>
            <option value="Pre-Chill Temperature Pull-down Delay">Pre-Chill Temperature Pull-down Delay</option>
            <option value="Staffing / Shift Shortage on Inbound Line">Staffing / Shift Shortage on Inbound Line</option>
          </select>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Severity Level <span class="text-danger">*</span></label>
            <select id="we-cap-sev" class="form-control" required>
              <option value="Critical" selected>Critical (Dispatch halt / SLA risk)</option>
              <option value="High">High (Major floor hold)</option>
              <option value="Medium">Medium (Floor alert)</option>
            </select>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Facility Capacity Reading</label>
            <input type="text" id="we-cap-metric" class="form-control" value="Cold Storage: 97.4% Full | Bays 1-4 Busy" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Detailed Situation Description <span class="text-danger">*</span></label>
          <textarea id="we-cap-desc" class="form-control" rows="3" required placeholder="Specify impacted docks, delayed trailers, and required diversion action..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Required Immediate Action <span class="text-danger">*</span></label>
          <input type="text" id="we-cap-action" class="form-control" required value="Hold non-priority inbound dispatches; divert regional trailers to secondary facility.">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Escalate to Control Tower &amp; Dispatcher</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleEscalateCapacity(e) {
    e.preventDefault();
    const type = document.getElementById('we-cap-type').value;
    const sev = document.getElementById('we-cap-sev').value;
    const metric = document.getElementById('we-cap-metric').value.trim();
    const desc = document.getElementById('we-cap-desc').value.trim();
    const action = document.getElementById('we-cap-action').value.trim();

    try {
      window.BRIDGES_STORE.escalateWarehouseCapacity(window.BRIDGES_STORE.getCurrentWarehouseId(), {
        issueType: type,
        severity: sev,
        capacityMetric: metric,
        impactedAreas: "Facility Docks & Staging",
        description: desc,
        mitigationAction: action
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Capacity issue escalated to Control Tower & Dispatcher", "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }
};
