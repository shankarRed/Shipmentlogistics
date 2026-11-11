/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Assignment Requests (US-60 to US-63)
 * Request inbox, search/filters, full recovery context modal, Accept / Reject with required reason
 */

const CarrierRequestsView = {
  currentFilter: 'all',
  currentStrategy: 'all',
  searchQuery: '',

  handleSearch(query) {
    this.searchQuery = query;
    const input = document.getElementById('carrier-requests-search');
    if (input) input.value = query;
    this.filterTable();
  },

  setFilter(status) {
    this.currentFilter = status;
    this.renderList();
  },

  setStrategy(strat) {
    this.currentStrategy = strat;
    this.renderList();
  },

  render() {
    const store = window.BRIDGES_STORE;
    const allReqs = store.getCarrierRecoveryRequests();
    const pendingCount = allReqs.filter(r => r.responseStatus === 'Pending Carrier Response').length;
    const revisedCount = allReqs.filter(r => r.responseStatus === 'Revised' || r.rerouteStatus === 'Counter-Route Proposed').length;
    const infoCount = allReqs.filter(r => r.responseStatus === 'Info Requested').length;
    const acceptedCount = allReqs.filter(r => r.responseStatus === 'Accepted').length;
    const rejectedCount = allReqs.filter(r => r.responseStatus === 'Rejected').length;
    const cancelledCount = allReqs.filter(r => r.responseStatus === 'Cancelled').length;

    return `
      <div class="carrier-requests-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Top Action Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0;">Recovery Assignment Requests Inbox</h2>
              <span class="carrier-badge carrier-badge-accepted" style="font-size: 10px;">Tenant Scoped &bull; CAR-01</span>
            </div>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Review operational recovery tenders with shipment, exception, location, cargo, and deadline details. Accept, reject with reason, request information, or manage revised tenders.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('carrier_execution')" style="font-weight: 600;">
              ${Icons.execution(14)} Execution Workspace
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.renderCurrentView()" style="font-weight: 700; background: #18217E;">
              Refresh Inbox
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <!-- Status Filter Pills -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.currentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('all')">
              All (${allReqs.length})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Pending Carrier Response' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Pending Carrier Response')" style="${this.currentFilter === 'Pending Carrier Response' ? '' : 'color: #B45309; border-color: #FCD34D;'}">
              Pending (${pendingCount})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Revised' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Revised')" style="${this.currentFilter === 'Revised' ? '' : 'color: #18217E; border-color: #C7D2FE;'}">
              Revised (${revisedCount})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Info Requested' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Info Requested')">
              Info Requested (${infoCount})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Accepted' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Accepted')">
              Accepted (${acceptedCount})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Rejected' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Rejected')">
              Rejected (${rejectedCount})
            </button>
            <button type="button" class="btn btn-sm ${this.currentFilter === 'Cancelled' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierRequestsView.setFilter('Cancelled')">
              Cancelled (${cancelledCount})
            </button>
          </div>

          <!-- Strategy Filter & Search Input -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <select class="carrier-form-select" id="carrier-strategy-filter" onchange="CarrierRequestsView.setStrategy(this.value)" style="width: 170px; padding: 6px 10px; font-size: 12px;">
              <option value="all">All Strategies</option>
              <option value="Alternate Carrier">Alternate Carrier</option>
              <option value="Re-route">Re-route</option>
              <option value="Expedite">Expedite</option>
              <option value="Split Shipment">Split Shipment</option>
              <option value="Wait-and-Monitor">Wait-and-Monitor</option>
            </select>

            <div style="position: relative; width: 220px;">
              <input type="text" id="carrier-requests-search" placeholder="Search request, shipment..." value="${this.searchQuery}" oninput="CarrierRequestsView.handleSearch(this.value)" class="carrier-form-input" style="padding: 6px 10px 6px 28px; font-size: 12px;">
              <span style="position: absolute; left: 9px; top: 7px; color: #8A9995;">${Icons.search(13)}</span>
            </div>
          </div>
        </div>

        <!-- Requests Table Content Area -->
        <div id="carrier-requests-table-container">
          ${this.renderTableContent()}
        </div>
      </div>
    `;
  },

  renderList() {
    const container = document.getElementById('carrier-requests-table-container');
    if (container) {
      container.innerHTML = this.renderTableContent();
    }
  },

  filterTable() {
    this.renderList();
  },

  getFilteredRequests() {
    const store = window.BRIDGES_STORE;
    let list = store.getCarrierRecoveryRequests();

    if (this.currentFilter === 'Revised') {
      list = list.filter(r => r.responseStatus === 'Revised' || r.rerouteStatus === 'Counter-Route Proposed');
    } else if (this.currentFilter === 'Info Requested') {
      list = list.filter(r => r.responseStatus === 'Info Requested');
    } else if (this.currentFilter === 'Cancelled') {
      list = list.filter(r => r.responseStatus === 'Cancelled');
    } else if (this.currentFilter !== 'all') {
      list = list.filter(r => r.responseStatus === this.currentFilter);
    }

    if (this.currentStrategy !== 'all') {
      list = list.filter(r => r.recoveryStrategy === this.currentStrategy);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.shipmentId.toLowerCase().includes(q) ||
        r.recoveryStrategy.toLowerCase().includes(q) ||
        (r.reasonForRecovery && r.reasonForRecovery.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTableContent() {
    const reqs = this.getFilteredRequests();
    const store = window.BRIDGES_STORE;

    if (reqs.length === 0) {
      return `
        <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
          <div class="carrier-empty-icon">${Icons.inbox(26)}</div>
          <div class="carrier-empty-title">No Recovery Requests Found</div>
          <p class="carrier-empty-desc">
            No assignment requests match the active filter criteria. Check again once new recovery instructions are dispatched.
          </p>
        </div>
      `;
    }

    return `
      <div class="carrier-card-section" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
            <thead style="background: #F8FAFB;">
              <tr>
                <th style="padding: 11px 14px;">Request ID</th>
                <th>Shipment &amp; Customer</th>
                <th>Cargo &amp; Value</th>
                <th>Exception &amp; Deviation</th>
                <th>Strategy</th>
                <th>Corridor &amp; Location</th>
                <th>Decision Deadline</th>
                <th>Status</th>
                <th style="text-align: right; padding-right: 14px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reqs.map(r => {
                const sh = store.getShipment(r.shipmentId) || {};
                const ex = store.getException(r.exceptionId) || {};
                const isPending = r.responseStatus === 'Pending Carrier Response';
                const isRevised = r.responseStatus === 'Revised' || r.rerouteStatus === 'Counter-Route Proposed';
                const isInfoReq = r.responseStatus === 'Info Requested';

                let badgeClass = 'carrier-badge-pending';
                if (r.responseStatus === 'Accepted') badgeClass = 'carrier-badge-accepted';
                if (r.responseStatus === 'Rejected') badgeClass = 'carrier-badge-rejected';
                if (r.responseStatus === 'In Progress') badgeClass = 'carrier-badge-in-progress';
                if (r.responseStatus === 'Completed') badgeClass = 'carrier-badge-completed';
                if (r.responseStatus === 'Cancelled') badgeClass = 'carrier-badge-rejected';

                const customerName = sh.customerName || (r.shipmentId === 'BRG-2848' ? 'BioPharma Health Alliance' : r.shipmentId === 'BRG-2847' ? 'Apex Dynamics Corp' : 'Global Maritime Energy');
                const cargoDesc = sh.cargoDescription || (ex.type === 'Temperature Breach' ? 'Biological Vaccines (2°C-8°C)' : 'Precision Assemblies');
                const cargoVal = sh.cargoValue || (ex.type === 'Temperature Breach' ? '$650,000' : '$340,000');
                const deadlineDisplay = r.deadline || 'Within 45m (16:30 EST)';

                return `
                  <tr style="${isPending || isRevised ? 'background: #FFFEFA;' : ''}">
                    <td style="padding: 11px 14px;">
                      <div style="font-weight: 700; color: #18217E;">${r.id}</div>
                      <div style="font-size: 10.5px; color: #8A9995;">
                        ${new Date(r.createdAt || r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td>
                      <div style="font-weight: 700; color: #070724;">${r.shipmentId}</div>
                      <div style="font-size: 11px; font-weight: 600; color: #18217E;">${customerName}</div>
                      <div style="font-size: 10px; color: #8A9995;">${sh.orderReference || 'PO-9824'}</div>
                    </td>

                    <td>
                      <div style="font-size: 11.5px; font-weight: 600; color: #070724;">${cargoDesc}</div>
                      <div style="font-size: 10.5px; color: #1E8E3E; font-weight: 700;">${cargoVal}</div>
                    </td>

                    <td>
                      <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                        <span style="font-weight: 700; color: #070724;">${ex.type || r.exceptionId}</span>
                        <span class="badge ${ex.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}" style="font-size: 9px; padding: 1px 5px;">${ex.severity || 'High'}</span>
                      </div>
                      <div style="max-width: 220px; line-height: 1.3; font-size: 10.5px; color: #64748B;">
                        ${r.reasonForRecovery || ex.reason || 'Operational transit deviation.'}
                      </div>
                    </td>

                    <td>
                      <span class="carrier-badge" style="background: rgba(24,33,126,0.06); color: #18217E; border: 1px solid rgba(24,33,126,0.18); font-weight: 700;">
                        ${r.recoveryStrategy}
                      </span>
                    </td>

                    <td>
                      <div style="color: #070724; font-weight: 600;">
                        ${sh.origin ? `${sh.origin} &rarr; ${sh.destination}` : 'Capital Knot &rarr; Lake Knot'}
                      </div>
                      <div style="font-size: 10.5px; color: #8A9995;">
                        Loc: <strong>${sh.currentLocation || 'Interstate 80 MP 112'}</strong>
                      </div>
                    </td>

                    <td>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 11px; font-weight: 700; color: #B45309;">${deadlineDisplay}</span>
                      </div>
                      <span class="badge badge-warning" style="font-size: 9px; padding: 1px 5px;">Action Due</span>
                    </td>

                    <td>
                      <span class="carrier-badge ${badgeClass}">
                        ${r.responseStatus}
                      </span>
                      ${isRevised ? `<div style="font-size: 9.5px; color: #18217E; font-weight: 700; margin-top: 2px;">★ Revised Terms</div>` : ''}
                      ${isInfoReq ? `<div style="font-size: 9.5px; color: #F59E0B; font-weight: 700; margin-top: 2px;">💬 Awaiting Dispatcher</div>` : ''}
                    </td>

                    <td style="text-align: right; padding-right: 14px; white-space: nowrap;">
                      <div style="display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end;">
                        <button class="carrier-btn-icon carrier-btn-icon-details" onclick="CarrierRequestsView.openRequestDetailsModal('${r.id}')" title="View Request Details" aria-label="View Request Details">
                          ${Icons.eye(15)}
                        </button>

                        ${(isPending || isRevised || isInfoReq) ? `
                          <button class="carrier-btn-icon carrier-btn-icon-accept" onclick="CarrierRequestsView.openAcceptModal('${r.id}')" title="Accept Recovery Request" aria-label="Accept Recovery Request">
                            ${Icons.check(15)}
                          </button>
                          <button class="carrier-btn-icon carrier-btn-icon-reject" onclick="CarrierRequestsView.openRejectModal('${r.id}')" title="Reject Request with Reason" aria-label="Reject Request with Reason">
                            ${Icons.x(15)}
                          </button>
                          <button class="carrier-btn-icon carrier-btn-icon-info" onclick="CarrierRequestsView.openRequestInfoModal('${r.id}')" title="Request Clarification / Info" aria-label="Request Clarification / Info">
                            ${Icons.message(14)}
                          </button>
                        ` : ''}

                        ${r.responseStatus === 'Accepted' ? `
                          <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openAssignResourcesModal('${r.id}')" style="padding: 4px 9px; font-size: 11px; font-weight: 700; background: #059669; border-color: #059669; margin-left: 2px;">
                            Assign Fleet &rarr;
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // --- Request Details Modal (Complete context) ---
  openRequestDetailsModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const sh = store.getShipment(req.shipmentId);
    const ex = store.getException(req.exceptionId);
    const isActionable = ['Pending Carrier Response', 'Revised', 'Info Requested'].includes(req.responseStatus);

    UI.openModal('generic-app-modal', `Recovery Request Details — ${req.id}`, `
      <div style="padding: 4px 0;">
        <!-- Top Status Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; margin-bottom: 14px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase;">Recovery Strategy</span>
            <div style="font-size: 14px; font-weight: 800; color: #18217E;">${req.recoveryStrategy}</div>
          </div>
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase;">Current Response Status</span>
            <div><span class="carrier-badge ${req.responseStatus === 'Pending Carrier Response' ? 'carrier-badge-pending' : req.responseStatus === 'Accepted' ? 'carrier-badge-accepted' : 'carrier-badge-rejected'}">${req.responseStatus}</span></div>
          </div>
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase;">Requested Carrier</span>
            <div style="font-size: 13px; font-weight: 700; color: #070724;">Bridges Global Logistics (CAR-01)</div>
          </div>
        </div>

        <!-- 2-Column Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div style="background: white; border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #18217E; text-transform: uppercase; margin-bottom: 8px;">Shipment Context</div>
            <div class="carrier-field-row"><span class="carrier-field-label">Shipment ID:</span><span class="carrier-field-value">${req.shipmentId}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Origin:</span><span class="carrier-field-value">${sh ? sh.origin : 'N/A'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Destination:</span><span class="carrier-field-value">${sh ? sh.destination : 'N/A'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Current Location:</span><span class="carrier-field-value">${sh ? (sh.currentLocation || sh.origin) : 'N/A'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Committed SLA:</span><span class="carrier-field-value">${sh ? sh.committedDeliveryTime : 'N/A'}</span></div>
          </div>

          <div style="background: white; border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #8C2527; text-transform: uppercase; margin-bottom: 8px;">Exception Information</div>
            <div class="carrier-field-row"><span class="carrier-field-label">Exception ID:</span><span class="carrier-field-value">${req.exceptionId}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Reason / Type:</span><span class="carrier-field-value">${ex ? ex.type : 'Line-haul Delay'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Severity:</span><span class="carrier-field-value" style="color: #EA341F; font-weight: 700;">${ex ? ex.severity : 'High'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Impact Assessment:</span><span class="carrier-field-value">${req.expectedEtaImpact || 'Potential SLA deviation'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Submitted By:</span><span class="carrier-field-value">${req.submittedBy || 'Dispatcher / Transport Planner'}</span></div>
          </div>
        </div>

        <!-- Strategy-Specific Payload details -->
        ${req.proposedRoute ? `
          <div style="background: #F8FAFD; border: 1px solid #C7D2FE; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
            <strong style="font-size: 11.5px; color: #18217E;">Proposed Alternative Route:</strong>
            <p style="font-size: 12px; color: #393A50; margin: 4px 0 0 0;">${req.proposedRoute}</p>
          </div>
        ` : ''}

        ${req.expediteUrgency ? `
          <div style="background: #FFF1F0; border: 1px solid #FCA5A5; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
            <strong style="font-size: 11.5px; color: #EA341F;">Expedite Urgency / Priority:</strong>
            <p style="font-size: 12px; color: #393A50; margin: 4px 0 0 0;">${req.expediteUrgency} &bull; Required Priority: Immediate Dispatch</p>
          </div>
        ` : ''}

        ${req.splitDetails ? `
          <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
            <strong style="font-size: 11.5px; color: #424989;">Split Shipment Portions:</strong>
            <div style="font-size: 12px; color: #393A50; margin-top: 4px;">
              <div>Portion 1: ${req.splitDetails.portion1 ? (req.splitDetails.portion1.cargo || req.splitDetails.portion1.quantity || '50% cargo') : '50%'} &rarr; ${req.splitDetails.portion1 ? req.splitDetails.portion1.destination || 'Primary Hub' : 'Hub'} (${req.splitDetails.portion1?.weight || '18T'})</div>
              <div>Portion 2: ${req.splitDetails.portion2 ? (req.splitDetails.portion2.cargo || req.splitDetails.portion2.quantity || '50% cargo') : '50%'} &rarr; ${req.splitDetails.portion2 ? req.splitDetails.portion2.destination || 'Secondary Hub' : 'Spoke'} (${req.splitDetails.portion2?.weight || '14T'})</div>
            </div>
          </div>
        ` : ''}

        <!-- Operational Notes -->
        <div style="margin-bottom: 14px;">
          <strong style="font-size: 11.5px; color: #393A50;">Dispatcher Operational Instructions:</strong>
          <p style="font-size: 12px; color: #070724; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 4px; padding: 8px 10px; margin: 4px 0 0 0; line-height: 1.4;">
            ${req.operationalNotes || req.reasonForRecovery || 'Review fleet availability and provide driver dispatch commitment.'}
          </p>
        </div>

        ${req.rejectionReason ? `
          <div style="background: #FEE2E2; border: 1px solid #F87171; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
            <strong style="font-size: 11.5px; color: #EA341F;">Recorded Rejection Reason:</strong>
            <p style="font-size: 12px; color: #070724; margin: 4px 0 0 0;">${req.rejectionReason}</p>
          </div>
        ` : ''}

        <!-- Timeline Log -->
        <div style="border-top: 1px solid #E5EBEE; padding-top: 12px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase; margin-bottom: 8px;">Activity Timeline</div>
          <div style="max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
            ${(req.timeline || []).map(t => `
              <div style="font-size: 11.5px; padding: 4px 8px; background: #F8FAFB; border-radius: 4px; border-left: 2px solid #18217E;">
                <div style="display: flex; justify-content: space-between; color: #8A9995; font-size: 10.5px;">
                  <span><strong>${t.actor || 'System'}</strong> &bull; ${t.action}</span>
                  <span>${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style="color: #393A50; margin-top: 2px;">${t.note}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          ${isActionable ? `
            <button type="button" class="btn btn-danger btn-sm" onclick="UI.closeModal('generic-app-modal'); CarrierRequestsView.openRejectModal('${req.id}');" style="font-weight: 700;">
              Reject Request
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); CarrierRequestsView.openAcceptModal('${req.id}');" style="font-weight: 700; background: #18217E;">
              Accept Request
            </button>
          ` : ''}
          ${req.responseStatus === 'Accepted' ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); CarrierExecutionView.openAssignResourcesModal('${req.id}');" style="font-weight: 700; background: #059669; border-color: #059669;">
              Assign Resources &rarr;
            </button>
          ` : ''}
        </div>
      </div>
    `);
  },

  // --- Accept Request Confirmation Modal ---
  openAcceptModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const actionableStatuses = ['Pending Carrier Response', 'Revised', 'Info Requested'];
    if (!actionableStatuses.includes(req.responseStatus)) {
      UI.showToast(`Request ${req.id} is in status '${req.responseStatus}'. Cannot accept.`, 'warning');
      return;
    }

    UI.openModal('generic-app-modal', `Accept Recovery Request — ${req.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">Confirm Carrier Recovery Acceptance</div>
          <p style="font-size: 12px; color: #15803D; margin: 0; line-height: 1.4;">
            By accepting, <strong>Bridges Global Logistics</strong> agrees to handle the <strong>${req.recoveryStrategy}</strong> recovery for shipment <strong>${req.shipmentId}</strong>.
            This makes the recovery active and ready for vehicle/driver assignment.
          </p>
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="carrier-accept-notes">Operational Readiness Notes (Optional):</label>
          <textarea id="carrier-accept-notes" class="carrier-form-textarea" rows="3" placeholder="e.g. Unit staged at Hub 4, available for pickup within 30 minutes."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierRequestsView.submitAcceptance('${req.id}')" style="font-weight: 700; background: #18217E;">
            Confirm Acceptance &rarr;
          </button>
        </div>
      </div>
    `);
  },

  submitAcceptance(requestId) {
    const notesEl = document.getElementById('carrier-accept-notes');
    const notes = notesEl ? notesEl.value : '';

    try {
      window.BRIDGES_STORE.acceptRecoveryRequest(requestId, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery request ${requestId} successfully accepted. Ready for resource dispatch.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Reject Request Modal (Required Reason) ---
  openRejectModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const actionableStatuses = ['Pending Carrier Response', 'Revised', 'Info Requested'];
    if (!actionableStatuses.includes(req.responseStatus)) {
      UI.showToast(`Request ${req.id} is in status '${req.responseStatus}'. Cannot reject.`, 'warning');
      return;
    }

    UI.openModal('generic-app-modal', `Reject Recovery Request — ${req.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: #991B1B; font-size: 13px; margin-bottom: 4px;">Carrier Rejection Notification</div>
          <p style="font-size: 12px; color: #B91C1C; margin: 0; line-height: 1.4;">
            A specific rejection reason is <strong>mandatory</strong>. Rejecting will notify the Dispatcher / Transport Planner so they can dispatch an alternative carrier or strategy.
          </p>
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="carrier-reject-reason">Mandatory Rejection Reason: <span style="color: #EA341F;">*</span></label>
          <select id="carrier-reject-reason-select" class="carrier-form-select" onchange="CarrierRequestsView.handleRejectPreset(this.value)" style="margin-bottom: 8px;">
            <option value="">Select standard operational reason...</option>
            <option value="Fleet Capacity Fully Booked: No eligible tractor-trailers available in regional corridor.">Fleet Capacity Fully Booked: No eligible tractor-trailers available.</option>
            <option value="Driver Hours-of-Service Limitation: All available drivers near duty limit.">Driver Hours-of-Service: Available drivers near duty limit.</option>
            <option value="Severe Weather & Road Closure: Transit corridor restricted by transport authority.">Severe Weather / Road Closure on designated corridor.</option>
            <option value="Cargo Equipment Mismatch: Temperature-controlled reefer requirement unserviceable.">Equipment Mismatch: Specialized reefer equipment unavailable.</option>
            <option value="custom">Other Operational Reason (Enter manually below)</option>
          </select>
          <textarea id="carrier-reject-reason-text" class="carrier-form-textarea" rows="3" placeholder="Enter clear operational reason why carrier cannot service this request..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="CarrierRequestsView.submitRejection('${req.id}')" style="font-weight: 700;">
            Confirm Rejection
          </button>
        </div>
      </div>
    `);
  },

  handleRejectPreset(val) {
    const textEl = document.getElementById('carrier-reject-reason-text');
    if (textEl && val && val !== 'custom') {
      textEl.value = val;
    }
  },

  submitRejection(requestId) {
    const textEl = document.getElementById('carrier-reject-reason-text');
    const reason = textEl ? textEl.value.trim() : '';

    if (!reason) {
      UI.showToast("A valid rejection reason is required.", 'error');
      if (textEl) textEl.focus();
      return;
    }

    try {
      window.BRIDGES_STORE.rejectRecoveryRequest(requestId, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Request ${requestId} rejected. Dispatcher notified in shared console.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- REQUEST INFORMATION / CLARIFICATION MODAL ---
  openRequestInfoModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const sh = store.getShipment(req.shipmentId) || {};
    const ex = store.getException(req.exceptionId) || {};

    const modalHtml = `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #C7D2FE; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #18217E; margin-bottom: 2px;">Inquire / Clarify Recovery Parameters &bull; ${req.id}</div>
          <div style="color: #64748B;">Request operational clarification from Dispatcher before committing fleet resources to ${req.shipmentId}.</div>
        </div>

        <form id="carrier-info-form" onsubmit="event.preventDefault(); CarrierRequestsView.submitRequestInfo('${req.id}');">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="carrier-inquiry-cat">Inquiry Category *</label>
            <select id="carrier-inquiry-cat" class="carrier-form-select" required>
              <option value="">Select subject requiring clarification...</option>
              <option value="Hazardous Cargo Handling Specs &amp; HazMat Placarding">Hazardous Cargo Specs &amp; HazMat Placarding</option>
              <option value="Cold-Chain Reefer Temperature Setpoint Verification">Cold-Chain Temperature Setpoint Verification</option>
              <option value="Consignee Receiving Dock Operating Hours &amp; Appointment Slot">Receiving Dock Hours &amp; Appointment Slot</option>
              <option value="Detour Corridor Bridge Weight &amp; Height Restrictions">Detour Corridor Weight &amp; Height Restrictions</option>
              <option value="Demurrage / Standby Rate Compensation for Extended Dwell">Demurrage / Standby Rate Compensation</option>
              <option value="General Operational Question">General Operational Question</option>
            </select>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="carrier-inquiry-details">Clarification Inquiry Details *</label>
            <textarea id="carrier-inquiry-details" class="carrier-form-textarea" rows="3" required placeholder="Specify what evidence, telematic verification, or revised parameters are needed from the transport planner before tender acceptance..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">
              Transmit Inquiry to Dispatcher
            </button>
          </div>
        </form>
      </div>
    `;

    UI.openModal('generic-app-modal', `Request Clarification &bull; ${req.id}`, modalHtml);
  },

  submitRequestInfo(requestId) {
    const cat = document.getElementById('carrier-inquiry-cat')?.value;
    const details = document.getElementById('carrier-inquiry-details')?.value;

    try {
      window.BRIDGES_STORE.requestCarrierInfo(requestId, cat, details);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Inquiry transmitted to Dispatcher for request ${requestId}. Status marked 'Info Requested'.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.CarrierRequestsView = CarrierRequestsView;

