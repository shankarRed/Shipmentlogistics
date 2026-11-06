/**
 * BRIDGES Control Tower - Carrier Request Management
 * Full lifecycle tracking of recovery submissions and carrier responses:
 * - Status tracking: Accepted, Rejected, Expired, Cancelled, Pending, In Progress, Completed
 * - Operational controls: Revise, Cancel, Resend, or Choose Another Carrier after rejection
 * - Handover & Resource verification (Vehicle, Driver, Revised ETA)
 */

const DispatcherRecoveriesView = {
  currentTab: 'All',
  searchQuery: '',

  render() {
    const allRequests = window.BRIDGES_STORE.getRecoveryRequests();

    // Filter by tab
    const filtered = allRequests.filter(r => {
      if (this.currentTab !== 'All' && r.responseStatus !== this.currentTab) {
        return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const mId = r.id.toLowerCase().includes(q);
        const mExc = r.exceptionId.toLowerCase().includes(q);
        const mShip = r.shipmentId.toLowerCase().includes(q);
        const mCarrier = (r.requestedCarrierName || '').toLowerCase().includes(q);
        const mStrat = r.recoveryStrategy.toLowerCase().includes(q);
        if (!mId && !mExc && !mShip && !mCarrier && !mStrat) return false;
      }
      return true;
    });

    const tabs = ['All', 'Pending Carrier Response', 'Accepted', 'Rejected', 'Expired', 'Cancelled', 'In Progress', 'Completed'];

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER -->
        <div class="page-action-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Carrier Recovery Request Management</h2>
              <span class="badge badge-primary">${filtered.length} Requests</span>
            </div>
            <p class="page-subheading">
              Track carrier tenders (accepted, rejected, expired, cancelled). Revise parameters, cancel tenders, resend requests, or choose alternate carriers after rejection.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_planning')">
            + New Recovery Plan
          </button>
        </div>

        <!-- TABS & SEARCH -->
        <div class="panel" style="margin-bottom: 16px; padding: 12px 14px;">
          <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
            <!-- Tabs -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${tabs.map(tab => {
                const count = tab === 'All' 
                  ? allRequests.length 
                  : allRequests.filter(r => r.responseStatus === tab).length;
                return `
                  <button class="btn ${this.currentTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                          onclick="DispatcherRecoveriesView.setTab('${tab}')"
                          style="font-size: 11.5px; padding: 4px 10px;">
                    ${tab === 'Pending Carrier Response' ? 'Awaiting Carrier' : tab} (${count})
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Search -->
            <div style="min-width: 240px; position: relative;">
              <input type="text" 
                     class="search-input" 
                     style="width: 100%; padding: 5px 8px 5px 28px; font-size: 11.5px; border: 1px solid #CBD5E1; border-radius: 6px;"
                     placeholder="Search request ID, shipment, carrier..." 
                     value="${this.searchQuery}"
                     oninput="DispatcherRecoveriesView.handleSearch(this.value)">
              <span style="position: absolute; left: 8px; top: 6px; color: #94A3B8;">${Icons.search(12)}</span>
            </div>
          </div>
        </div>

        <!-- TABLE OF RECOVERY REQUESTS -->
        <div class="panel" style="padding: 0; overflow: hidden;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">${Icons.recovery(24)}</div>
              <div class="empty-state-title">No Recovery Requests in this State</div>
              <div class="empty-state-sub">There are currently zero recovery requests under "${this.currentTab}".</div>
            </div>
          ` : `
            <div class="table-container" style="box-shadow: none; border: none; overflow-x: auto;">
              <table class="data-table" style="min-width: 1100px;">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Exception / Shipment</th>
                    <th>Strategy</th>
                    <th>Carrier Tendered</th>
                    <th>Response Status</th>
                    <th>Assigned Vehicle / Driver</th>
                    <th>Revised ETA</th>
                    <th>Last Updated</th>
                    <th style="text-align: right;">Operational Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(req => {
                    const isRejected = req.responseStatus === 'Rejected';
                    const isPending = req.responseStatus === 'Pending Carrier Response';
                    const isExpired = req.responseStatus === 'Expired';
                    const isCancelled = req.responseStatus === 'Cancelled';
                    const isAccepted = req.responseStatus === 'Accepted';

                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${req.id}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div style="font-weight: 700; color: var(--color-royal-navy); font-size: 11.5px;">${req.shipmentId}</div>
                          <div style="font-size: 10.5px; color: var(--color-charcoal);">${req.exceptionId}</div>
                        </td>
                        <td>
                          <span class="badge badge-secondary" style="font-weight: 700;">
                            ${req.recoveryStrategy}
                          </span>
                        </td>
                        <td>
                          <div style="font-weight: 600; font-size: 11.5px; color: var(--color-midnight);">${req.requestedCarrierName || 'Direct Re-route'}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${req.requestedCarrierId || 'Existing Carrier'}</div>
                        </td>
                        <td>
                          ${UI.renderStatusBadge(req.responseStatus)}
                          ${isRejected && req.rejectionReason ? `
                            <div style="font-size: 10px; color: var(--color-signal-red); margin-top: 3px; max-width: 180px; white-space: normal;">
                              Reason: ${req.rejectionReason}
                            </div>
                          ` : ''}
                          ${isExpired ? `
                            <div style="font-size: 10px; color: #D97706; margin-top: 2px;">Tender SLA expired (60m elapsed)</div>
                          ` : ''}
                          ${isCancelled ? `
                            <div style="font-size: 10px; color: #64748B; margin-top: 2px;">${req.rejectionReason || 'Cancelled by dispatcher'}</div>
                          ` : ''}
                        </td>
                        <td>
                          ${req.assignedVehicleId ? `
                            <div style="font-weight: 700; color: var(--color-midnight); font-size: 11.5px;">${req.assignedVehicleId}</div>
                            <div style="font-size: 10.5px; color: var(--color-charcoal);">${req.assignedDriverName || 'Driver Assigned'}</div>
                          ` : `
                            <span style="font-size: 11px; color: var(--color-muted-sage); font-style: italic;">
                              ${isPending ? 'Awaiting Carrier' : isRejected ? 'Rejected' : isExpired ? 'Expired' : 'Unassigned'}
                            </span>
                          `}
                        </td>
                        <td>
                          <div style="font-weight: 600; font-size: 11.5px; color: var(--color-midnight);">${req.revisedEta || 'Pending'}</div>
                          <div style="font-size: 10px; color: #1E8E3E;">${req.expectedEtaImpact || ''}</div>
                        </td>
                        <td>
                          <div style="font-size: 11px; color: var(--color-charcoal);">
                            ${new Date(req.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style="text-align: right;">
                          <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
                            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.openDetailModal('${req.id}')" style="padding: 4px 7px;">
                              Inspect
                            </button>
                            ${(isRejected || isExpired) ? `
                              <button class="btn btn-primary btn-sm" onclick="DispatcherRecoveriesView.openChooseCarrierModal('${req.id}')" style="padding: 4px 7px; font-weight: 700; background: #18217E;">
                                Alternate Carrier
                              </button>
                              <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.resendTender('${req.id}')" style="padding: 4px 7px;">
                                Resend
                              </button>
                            ` : ''}
                            ${isPending ? `
                              <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.openReviseModal('${req.id}')" style="padding: 4px 7px;">
                                Revise
                              </button>
                              <button class="btn btn-danger btn-sm" onclick="DispatcherRecoveriesView.openCancelModal('${req.id}')" style="padding: 4px 7px;">
                                Cancel
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
          `}
        </div>
      </div>
    `;
  },

  setTab(tab) {
    this.currentTab = tab;
    App.renderCurrentView();
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  openDetailModal(requestId) {
    const req = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!req) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--color-light-blue-grey);">
          <div>
            <div style="font-weight: 800; font-size: 16px; color: var(--color-midnight);">${req.id}</div>
            <div style="font-size: 11.5px; color: var(--color-muted-sage);">
              Strategy: <strong>${req.recoveryStrategy}</strong> · Linked Exception: <strong>${req.exceptionId}</strong> (${req.shipmentId})
            </div>
          </div>
          ${UI.renderStatusBadge(req.responseStatus)}
        </div>

        <!-- Strategy Details Grid -->
        <div class="meta-kv-grid" style="margin-bottom: 14px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Requested Carrier</span>
            <span class="meta-kv-value">${req.requestedCarrierName || 'N/A'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Assigned Vehicle</span>
            <span class="meta-kv-value">${req.assignedVehicleId || 'Awaiting Carrier Assignment'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Assigned Driver</span>
            <span class="meta-kv-value">${req.assignedDriverName || 'Awaiting Carrier Assignment'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Revised ETA</span>
            <span class="meta-kv-value" style="color: var(--color-royal-navy); font-weight: 800;">${req.revisedEta || 'Pending'}</span>
          </div>
        </div>

        <div style="background: #F8FAFB; border: 1px solid var(--color-light-blue-grey); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px;">
          <div style="font-weight: 700; color: var(--color-midnight); margin-bottom: 3px;">Operational Instructions & Handover</div>
          <div style="color: var(--color-charcoal); line-height: 1.4;">${req.operationalNotes}</div>
        </div>

        ${req.rejectionReason ? `
          <div style="background: #FFF5F5; border: 1px solid rgba(234, 52, 31, 0.25); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px; color: var(--color-signal-red);">
            <strong>Reason Note:</strong> ${req.rejectionReason}
          </div>
        ` : ''}

        <!-- Chronological Timeline Stream -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-bottom: 8px;">Execution & Handover Timeline</div>
          <div class="timeline-stream">
            ${(req.timeline || []).map(item => `
              <div class="timeline-node">
                <div class="timeline-node-dot"></div>
                <div class="timeline-node-content">
                  <div class="timeline-node-header">
                    <span class="timeline-node-author">${item.actor || 'System'}</span>
                    <span class="timeline-node-time">${new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div class="timeline-node-text">${item.note || item.action}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- OPERATIONAL DISPATCHER CONTROLS -->
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #18217E; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span>DISPATCHER ACTIONS &amp; SIMULATION CONTROLS</span>
            <span style="font-weight: 600; font-size: 10px; color: #64748B;">LIFECYCLE MANAGEMENT</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            <button class="btn btn-primary btn-sm" onclick="DispatcherRecoveriesView.openChooseCarrierModal('${req.id}')" style="font-size: 11px; font-weight: 600;">
              ⇄ Choose Another Carrier
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.resendTender('${req.id}')" style="font-size: 11px; font-weight: 600;">
              ↺ Resend Tender
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.openReviseModal('${req.id}')" style="font-size: 11px; font-weight: 600;">
              ✎ Revise Terms
            </button>
            <button class="btn btn-danger btn-sm" onclick="DispatcherRecoveriesView.openCancelModal('${req.id}')" style="font-size: 11px; font-weight: 600;">
              ✕ Cancel Request
            </button>
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-bottom: 6px; border-top: 1px dashed #CBD5E1; padding-top: 6px;">
            Test / Simulate Carrier Responses:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.simulateResponse('${req.id}', 'Accepted')" style="font-size: 10.5px; background: #EAF7EE; color: #1E8E3E;">
              ✓ Carrier Accept
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.simulateResponse('${req.id}', 'Rejected')" style="font-size: 10.5px; background: #FFF5F5; color: #EA341F;">
              ✕ Carrier Decline
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.simulateResponse('${req.id}', 'Expired')" style="font-size: 10.5px; background: #FFFDF5; color: #D97706;">
              ⏱ Mark Expired
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.simulateResponse('${req.id}', 'In Progress')" style="font-size: 10.5px;">
              ▶ Mark En Route
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherRecoveriesView.simulateResponse('${req.id}', 'Completed')" style="font-size: 10.5px; background: #EAF7EE; color: #1E8E3E;">
              ✓ Mark Delivered (POD)
            </button>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Recovery Request Dossier — ${req.id}`, modalHtml);
  },

  openChooseCarrierModal(requestId) {
    const req = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!req) return;
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 10px;">
          Choose an alternative active carrier for recovery request <strong>${req.id}</strong> (${req.shipmentId}):
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Select Replacement Carrier *</label>
          <select id="choose-carrier-select" class="planning-select" style="width: 100%;">
            ${activeCarriers.map(c => `
              <option value="${c.id}" ${c.id !== req.requestedCarrierId ? 'selected' : ''}>
                ${c.name} (${c.id}) — Region: ${c.operatingRegion} [Rating: ${c.rating}★]
              </option>
            `).join('')}
          </select>
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Operational Reassignment Reason *</label>
          <input type="text" id="choose-carrier-reason" class="planning-input" value="Previous carrier tender declined/expired; engaging regional secondary fleet.">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherRecoveriesView.applyChooseCarrier('${req.id}')" style="font-weight: 700;">
            Re-tender to Selected Carrier
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Choose Another Carrier — ${req.id}`, modalHtml);
  },

  applyChooseCarrier(requestId) {
    const sel = document.getElementById('choose-carrier-select');
    const reasonInput = document.getElementById('choose-carrier-reason');
    if (!sel) return;
    const carrierId = sel.value;
    const reason = reasonInput ? reasonInput.value : '';

    try {
      window.BRIDGES_STORE.changeRecoveryCarrier(requestId, carrierId, '', reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Request ${requestId} re-tendered to alternate carrier.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  resendTender(requestId) {
    try {
      window.BRIDGES_STORE.resendRecoveryRequest(requestId, 'Re-transmitted tender by dispatcher with refreshed 60m SLA expiration.');
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery tender ${requestId} resent to carrier dispatch.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openCancelModal(requestId) {
    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 10px;">
          Are you sure you want to cancel recovery request <strong>${requestId}</strong>?
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Cancellation Justification *</label>
          <input type="text" id="cancel-recovery-reason" class="planning-input" value="Cancelled by transport planner; primary linehaul recovered schedule.">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button class="btn btn-danger btn-sm" onclick="DispatcherRecoveriesView.applyCancel('${requestId}')" style="font-weight: 700;">
            Confirm Cancellation
          </button>
        </div>
      </div>
    `;
    UI.openModal('generic-app-modal', `Cancel Recovery Request ${requestId}`, modalHtml);
  },

  applyCancel(requestId) {
    const input = document.getElementById('cancel-recovery-reason');
    const reason = input ? input.value : 'Cancelled by dispatcher';
    try {
      window.BRIDGES_STORE.cancelRecoveryRequest(requestId, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery request ${requestId} cancelled.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openReviseModal(requestId) {
    const req = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!req) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; margin-bottom: 12px;">Revise operational parameters for request <strong>${req.id}</strong>:</div>
        <div class="planning-form-group">
          <label class="planning-form-label">Recovery Strategy</label>
          <input type="text" class="planning-input" readonly value="${req.recoveryStrategy}">
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Operational Handover Notes *</label>
          <textarea id="revise-operational-notes" class="planning-textarea" required>${req.operationalNotes || ''}</textarea>
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Expected ETA Impact *</label>
          <input type="text" id="revise-eta-impact" class="planning-input" required value="${req.expectedEtaImpact || ''}">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherRecoveriesView.applyRevise('${req.id}')" style="font-weight: 700;">
            Save & Re-submit Terms
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Revise Recovery Terms — ${req.id}`, modalHtml);
  },

  applyRevise(requestId) {
    const notesInput = document.getElementById('revise-operational-notes');
    const etaInput = document.getElementById('revise-eta-impact');
    if (!notesInput) return;

    try {
      window.BRIDGES_STORE.reviseRecoveryRequest(requestId, {
        operationalNotes: notesInput.value,
        expectedEtaImpact: etaInput ? etaInput.value : '-1h',
        reason: 'Parameters revised by transport dispatcher.'
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Request ${requestId} terms revised and re-tendered.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  simulateResponse(requestId, targetStatus) {
    let details = {};
    if (targetStatus === 'Accepted') {
      details = {
        vehicleId: 'FR-23',
        driverName: 'Ethan Cole',
        revisedEta: '2026-03-24T14:15:00Z'
      };
    } else if (targetStatus === 'Rejected') {
      details = {
        rejectionReason: 'Driver duty hours exceeded and zero standby tractors available in corridor sector.'
      };
    } else if (targetStatus === 'Expired') {
      details = {
        rejectionReason: 'Tender window expired with zero carrier acknowledgement.'
      };
    } else if (targetStatus === 'Completed') {
      details = {
        note: 'Carrier delivered payload to destination hub. Bill of lading verified with zero cargo defects.',
        confirmDelivery: true
      };
    }

    try {
      window.BRIDGES_STORE.updateRecoveryStatus(requestId, targetStatus, details);
      UI.showToast(`Request ${requestId} transitioned to: ${targetStatus}`, 'success');
      this.openDetailModal(requestId);
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.DispatcherRecoveriesView = DispatcherRecoveriesView;
