/**
 * BRIDGES Control Tower - Analyst Recovery Requests View (US-38 to US-40)
 * Searchable recovery request list with chronological timeline,
 * rejection handling with direct re-investigation return,
 * and carrier simulation controls for end-to-end verification.
 */

const AnalystRecoveriesView = {
  searchQuery: '',
  strategyFilter: 'All',
  statusFilter: 'All',
  carrierFilter: 'All',

  render() {
    const recoveries = window.BRIDGES_STORE.getRecoveryRequests();
    const carriers = window.BRIDGES_STORE.getCarriers();

    // Filter
    const filtered = recoveries.filter(r => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchExc = r.exceptionId.toLowerCase().includes(q);
        const matchShip = r.shipmentId.toLowerCase().includes(q);
        const matchStrat = r.recoveryStrategy.toLowerCase().includes(q);
        const matchCarrier = r.requestedCarrierName && r.requestedCarrierName.toLowerCase().includes(q);
        if (!matchId && !matchExc && !matchShip && !matchStrat && !matchCarrier) return false;
      }

      if (this.strategyFilter !== 'All' && r.recoveryStrategy !== this.strategyFilter) return false;
      if (this.statusFilter !== 'All' && r.responseStatus !== this.statusFilter) return false;
      if (this.carrierFilter !== 'All' && r.requestedCarrierId !== this.carrierFilter) return false;

      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Carrier Recovery Requests</h2>
              <span class="role-indicator-pill">Execution Monitoring</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Oversight of initiated re-routes, carrier re-assignments, expedited transport, and split recovery requests.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystRecoveriesView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_investigation')">
              ${Icons.investigate ? Icons.investigate(14) : ''}
              <span>Initiate New Recovery</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Request ID, Exception, Shipment, Strategy, Carrier..." 
              value="${this.searchQuery}" 
              oninput="AnalystRecoveriesView.handleSearch(this.value)"
            >
          </div>

          <!-- Strategy Filter -->
          <select class="filter-select" onchange="AnalystRecoveriesView.handleFilter('strategyFilter', this.value)">
            <option value="All" ${this.strategyFilter === 'All' ? 'selected' : ''}>All Strategies</option>
            <option value="Re-route" ${this.strategyFilter === 'Re-route' ? 'selected' : ''}>Re-route</option>
            <option value="Alternate Carrier" ${this.strategyFilter === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier</option>
            <option value="Expedite" ${this.strategyFilter === 'Expedite' ? 'selected' : ''}>Expedite</option>
            <option value="Split Shipment" ${this.strategyFilter === 'Split Shipment' ? 'selected' : ''}>Split Shipment</option>
          </select>

          <!-- Response Status Filter -->
          <select class="filter-select" onchange="AnalystRecoveriesView.handleFilter('statusFilter', this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Response Statuses</option>
            <option value="Pending Carrier Response" ${this.statusFilter === 'Pending Carrier Response' ? 'selected' : ''}>Pending Carrier Response</option>
            <option value="Accepted" ${this.statusFilter === 'Accepted' ? 'selected' : ''}>Accepted</option>
            <option value="Rejected" ${this.statusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
            <option value="In Progress" ${this.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${this.statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Failed" ${this.statusFilter === 'Failed' ? 'selected' : ''}>Failed</option>
          </select>

          <!-- Carrier Filter -->
          <select class="filter-select" onchange="AnalystRecoveriesView.handleFilter('carrierFilter', this.value)">
            <option value="All" ${this.carrierFilter === 'All' ? 'selected' : ''}>All Requested Carriers</option>
            ${carriers.map(c => `
              <option value="${c.id}" ${this.carrierFilter === c.id ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Table Card -->
        <div class="card" style="padding: 0; overflow: hidden;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">
                ${Icons.recovery ? Icons.recovery(24) : Icons.refresh(24)}
              </div>
              <div class="empty-state-title">No Recovery Requests Found</div>
              <div class="empty-state-sub">There are no carrier recovery requests matching the selected filters.</div>
              <button class="btn btn-secondary btn-sm mt-3" onclick="AnalystRecoveriesView.resetFilters()">Clear Filters</button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table" style="font-size: 12px;">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Linked Exception</th>
                    <th>Shipment ID</th>
                    <th>Strategy</th>
                    <th>Requested Carrier</th>
                    <th>Response Status</th>
                    <th>Assigned Vehicle / Driver</th>
                    <th>Revised ETA</th>
                    <th>Last Updated</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(rec => `
                    <tr style="cursor: pointer;" onclick="AnalystRecoveriesView.openDetailModal('${rec.id}')">
                      <td>
                        <span style="font-weight: 700; color: var(--color-royal-navy);">${rec.id}</span>
                      </td>
                      <td>
                        <span style="font-weight: 700; color: var(--color-midnight); cursor: pointer;" onclick="event.stopPropagation(); AnalystDashboardView.openInvestigation('${rec.exceptionId}')">
                          ${rec.exceptionId} ↗
                        </span>
                      </td>
                      <td>
                        <span style="font-weight: 600; color: var(--color-charcoal); cursor: pointer;" onclick="event.stopPropagation(); AnalystShipmentsView.openDetailModal('${rec.shipmentId}')">
                          ${rec.shipmentId} ↗
                        </span>
                      </td>
                      <td>
                        <span class="badge" style="background: #EFEFF9; color: var(--color-slate-indigo); font-weight: 700;">
                          ${rec.recoveryStrategy}
                        </span>
                      </td>
                      <td>
                        <span style="font-weight: 600; color: var(--color-midnight);">
                          ${rec.requestedCarrierName || 'In-Fleet Carrier'}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${this.getResponseStatusBadgeClass(rec.responseStatus)}">
                          ${rec.responseStatus}
                        </span>
                      </td>
                      <td>
                        ${rec.assignedVehicleId ? `
                          <div><strong>${rec.assignedVehicleId}</strong></div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${rec.assignedDriverName || 'Driver assigned'}</div>
                        ` : `
                          <span style="color: var(--color-muted-sage); font-size: 11px;">Pending Assignment</span>
                        `}
                      </td>
                      <td>
                        <span style="font-weight: 600; color: var(--color-midnight);">
                          ${rec.revisedEta || rec.expectedEtaImpact}
                        </span>
                      </td>
                      <td>
                        <div style="font-size: 11px;">${AnalystDashboardView.formatTime(rec.updatedAt)}</div>
                        <div style="font-size: 10px; color: var(--color-muted-sage);">${rec.updatedAt ? rec.updatedAt.slice(0, 10) : ''}</div>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 4px;">
                          <button class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 11px;" onclick="event.stopPropagation(); AnalystRecoveriesView.openDetailModal('${rec.id}')">
                            View &amp; Simulate
                          </button>
                          ${['Rejected', 'Failed'].includes(rec.responseStatus) ? `
                            <button class="btn btn-primary btn-sm" style="padding: 3px 8px; font-size: 11px; background: #EA341F; border-color: #EA341F;" onclick="event.stopPropagation(); AnalystRecoveriesView.openReopenModal('${rec.id}')">
                              Reopen
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_recoveries') {
      App.renderCurrentView();
    }
  },

  handleFilter(field, val) {
    this[field] = val;
    if (window.App && App.currentView === 'analyst_recoveries') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.strategyFilter = 'All';
    this.statusFilter = 'All';
    this.carrierFilter = 'All';
    if (window.App && App.currentView === 'analyst_recoveries') {
      App.renderCurrentView();
    }
  },

  getResponseStatusBadgeClass(status) {
    switch (status) {
      case 'Accepted': return 'badge-active';
      case 'In Progress': return 'badge-neutral';
      case 'Completed': return 'badge-active';
      case 'Pending Carrier Response': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      case 'Failed': return 'badge-danger';
      default: return 'badge-neutral';
    }
  },

  // Open Recovery Detail Modal with Simulation Controls
  openDetailModal(requestId) {
    const rec = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!rec) return;

    const shipment = window.BRIDGES_STORE.getShipment(rec.shipmentId);
    const exc = window.BRIDGES_STORE.getException(rec.exceptionId);

    const contentHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--color-light-blue-grey); flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="font-size: 16px; font-weight: 800; color: var(--color-royal-navy); margin: 0;">${rec.id}</h4>
              <span class="badge ${this.getResponseStatusBadgeClass(rec.responseStatus)}">${rec.responseStatus}</span>
              <span class="badge" style="background: #EFEFF9; color: var(--color-slate-indigo); font-weight: 700;">${rec.recoveryStrategy}</span>
            </div>
            <div style="font-size: 12px; color: var(--color-charcoal); margin-top: 3px;">
              Target Carrier: <strong>${rec.requestedCarrierName || 'In-Fleet Carrier'}</strong> • Shipment: <strong>${rec.shipmentId}</strong> • Exception: <strong>${rec.exceptionId}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--color-muted-sage);">Expected ETA Impact</div>
            <div style="font-size: 14px; font-weight: 700; color: #1E8E3E;">${rec.expectedEtaImpact}</div>
          </div>
        </div>

        <!-- Strategy Specific Details -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div>Reason for Recovery: <strong style="color: var(--color-midnight);">${rec.reasonForRecovery}</strong></div>
          <div>Operational Notes: <span style="color: var(--color-charcoal);">${rec.operationalNotes}</span></div>
          ${rec.proposedRoute ? `<div>Proposed Route Details: <strong style="color: var(--color-royal-navy);">${rec.proposedRoute}</strong></div>` : ''}
          ${rec.splitDetails ? `<div>Split Allocation: <strong>${rec.splitDetails.portion1}</strong> | <strong>${rec.splitDetails.portion2}</strong></div>` : ''}
          ${rec.expediteUrgency ? `<div>Expedite Service Level: <strong>${rec.expediteUrgency}</strong></div>` : ''}
          ${rec.rejectionReason ? `
            <div style="padding: 8px; background: #FDE8E6; border: 1px solid #F9BCB5; border-radius: 4px; color: var(--color-signal-red); font-weight: 600;">
              Carrier Rejection Reason: ${rec.rejectionReason}
            </div>
          ` : ''}
        </div>

        <!-- Carrier & Vehicle Assignment Row -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
            <div style="font-size: 11px; color: var(--color-charcoal);">Carrier Status</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 2px;">${rec.requestedCarrierName || 'Assigned'}</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
            <div style="font-size: 11px; color: var(--color-charcoal);">Assigned Vehicle & Driver</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 2px;">
              ${rec.assignedVehicleId ? rec.assignedVehicleId + ' (' + (rec.assignedDriverName || 'Driver') + ')' : 'Pending Carrier Response'}
            </div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
            <div style="font-size: 11px; color: var(--color-charcoal);">Revised Transit ETA</div>
            <div style="font-size: 13px; font-weight: 700; color: #1E8E3E; margin-top: 2px;">${rec.revisedEta || '--'}</div>
          </div>
        </div>

        <!-- Chronological Execution Timeline -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-bottom: 8px;">
            Chronological Recovery Progress Timeline
          </div>
          <div class="timeline-stream">
            ${(rec.timeline || []).map(item => `
              <div class="timeline-stream-item">
                <div class="timeline-node-dot ${item.action.includes('Accepted') || item.action.includes('Completed') ? 'success' : item.action.includes('Rejected') ? 'alert' : ''}"></div>
                <div class="timeline-content-box">
                  <div class="timeline-content-header">
                    <span class="timeline-action-text">${item.action}</span>
                    <span class="timeline-timestamp">${AnalystDashboardView.formatTime(item.timestamp)}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-charcoal);">${item.note}</div>
                  <div style="font-size: 10px; color: var(--color-muted-sage); margin-top: 2px;">Actor: <strong>${item.actor}</strong></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Rejection & Failure Remediation Action (US-38 to US-40) -->
        ${['Rejected', 'Failed'].includes(rec.responseStatus) ? `
          <div style="padding: 12px; background: #FFFBFB; border: 1px solid #F9BCB5; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="color: var(--color-signal-red); font-size: 12px;">Carrier ${rec.responseStatus} Recovery Tender</strong>
              <div style="font-size: 11px; color: var(--color-charcoal); margin-top: 2px;">
                ${rec.rejectionReason || 'Previous recovery attempt did not succeed.'} Re-tender with alternative partner or revised parameters.
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" style="background: #EA341F; border-color: #EA341F;" onclick="AnalystRecoveriesView.openReopenModal('${rec.id}')">
                🔄 Reopen &amp; Resubmit Tender
              </button>
              <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal'); AnalystDashboardView.openInvestigation('${rec.exceptionId}')">
                Investigation Workspace →
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Operational Execution & Direct Action Controls -->
        <div style="padding: 14px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-royal-navy);">
              Operational Execution &amp; Dispatch Controls
            </div>
            <span style="font-size: 10px; color: var(--color-muted-sage); text-transform: uppercase; font-weight: 600;">Direct Lifecycle Advance</span>
          </div>
          <div style="font-size: 11px; color: var(--color-charcoal); margin-bottom: 10px;">
            Execute direct lifecycle status progression or switch to the assigned Carrier portal to manage execution:
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${rec.responseStatus === 'Pending Carrier Response' ? `
              <button class="btn btn-primary btn-sm" onclick="AnalystRecoveriesView.simulateCarrierAccept('${rec.id}')">
                ✓ Authorize &amp; Accept Request
              </button>
              <button class="btn btn-danger btn-sm" onclick="AnalystRecoveriesView.simulateCarrierReject('${rec.id}')">
                ✕ Reject / Return to Planning
              </button>
            ` : ''}

            ${rec.responseStatus === 'Accepted' ? `
              <button class="btn btn-primary btn-sm" onclick="AnalystRecoveriesView.simulateDispatchProgress('${rec.id}')">
                ▶ Confirm Vehicle En Route
              </button>
            ` : ''}

            ${rec.responseStatus === 'In Progress' ? `
              <button class="btn btn-primary btn-sm" style="background: #1E8E3E; border-color: #1E8E3E;" onclick="AnalystRecoveriesView.simulateDeliveryConfirmation('${rec.id}')">
                ✓ Finalize &amp; Confirm Delivery
              </button>
            ` : ''}

            ${rec.responseStatus === 'Completed' ? `
              <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-weight: 700; padding: 6px 12px; font-size: 12px;">
                ✓ Recovery Fully Executed &amp; Confirmed
              </span>
            ` : ''}

            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.switchRole('Carrier Operations User');" style="margin-left: auto;">
              Open in Carrier Portal &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Recovery Request Details — ${rec.id}`, contentHtml);
  },

  simulateCarrierAccept(requestId) {
    try {
      window.BRIDGES_STORE.updateRecoveryStatus(requestId, 'Accepted', {
        vehicleId: 'FR-23',
        driverName: 'Ethan Cole',
        revisedEta: 'On Schedule (-45m Mitigated)'
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Carrier accepted recovery request ${requestId}. Vehicle and driver assigned.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  simulateCarrierReject(requestId) {
    const reason = prompt("Enter Carrier Rejection Reason:", "No refrigerated equipment available for requested delivery window.");
    if (!reason) return;

    try {
      window.BRIDGES_STORE.updateRecoveryStatus(requestId, 'Rejected', {
        rejectionReason: reason
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Carrier rejected recovery request ${requestId}. Returned to Analyst for alternative strategy.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  simulateDispatchProgress(requestId) {
    try {
      window.BRIDGES_STORE.updateRecoveryStatus(requestId, 'In Progress', {
        note: "Replacement transport unit cleared checkpoint and entered transit bypass."
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery execution status updated to In Progress.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  simulateDeliveryConfirmation(requestId) {
    try {
      window.BRIDGES_STORE.updateRecoveryStatus(requestId, 'Completed', {
        note: "Delivery safely completed and certified at destination terminal.",
        confirmDelivery: true
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery completed! Delivery certified. Exception can now be closed in Exception History.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openReopenModal(requestId) {
    const rec = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!rec) return;

    const carriers = window.BRIDGES_STORE.getCarriers();

    const formHtml = `
      <form onsubmit="AnalystRecoveriesView.submitReopenRecovery(event, '${rec.id}')">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="padding: 10px 12px; background: #FFF5F5; border: 1px solid #FECACA; border-radius: 6px; font-size: 11.5px; color: #7F1D1D;">
            <strong>Reopen Failed Recovery Tender:</strong> You are resetting this tender back to active negotiation with updated carrier routing or service tier.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Recovery Strategy <span style="color: var(--color-signal-red);">*</span></label>
              <select id="reopen-strategy" class="form-control" required>
                <option value="Alternate Carrier" ${rec.recoveryStrategy === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier (Hotshot / Dedicated)</option>
                <option value="Re-route" ${rec.recoveryStrategy === 'Re-route' ? 'selected' : ''}>Re-route (Transit Bypass)</option>
                <option value="Expedite" ${rec.recoveryStrategy === 'Expedite' ? 'selected' : ''}>Expedite (Team Driver / Air Charter)</option>
                <option value="Split Shipment" ${rec.recoveryStrategy === 'Split Shipment' ? 'selected' : ''}>Split Shipment (Priority Partial)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Target Carrier Partner <span style="color: var(--color-signal-red);">*</span></label>
              <select id="reopen-carrier" class="form-control" required>
                ${carriers.map(c => `
                  <option value="${c.id}" ${rec.requestedCarrierId === c.id ? 'selected' : ''}>${c.name} (${c.id})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Re-tender Instructions &amp; Revised Terms <span style="color: var(--color-signal-red);">*</span></label>
            <textarea id="reopen-notes" class="form-control" rows="3" required placeholder="Specify updated rate agreement, revised delivery deadline, or equipment requirements...">Priority tender resubmission following previous carrier equipment rejection. Immediate dispatch requested within 45-minute window.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #EA341F; border-color: #EA341F;">
              Confirm &amp; Resubmit Tender
            </button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Reopen Recovery Tender — ${rec.id}`, formHtml);
  },

  submitReopenRecovery(e, requestId) {
    e.preventDefault();
    try {
      const strategy = document.getElementById('reopen-strategy').value;
      const carrierId = document.getElementById('reopen-carrier').value;
      const notes = document.getElementById('reopen-notes').value;

      const user = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser();
      const actor = user ? `${user.name} (${user.role})` : 'Sarah Lin (Control Tower)';

      window.BRIDGES_STORE.reopenRecoveryRequest(requestId, {
        recoveryStrategy: strategy,
        newCarrierId: carrierId,
        notes: notes,
        actor: actor
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery ${requestId} successfully reopened and re-tendered.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystRecoveriesView = AnalystRecoveriesView;
