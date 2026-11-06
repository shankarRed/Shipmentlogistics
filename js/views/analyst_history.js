/**
 * BRIDGES Control Tower - Analyst Exception History & Lifecycle View (US-30, US-40 to US-43)
 * Searchable history page for resolved and closed exceptions with complete audit timelines.
 * Implements controlled Reopen exception workflow and Final Resolution Form for Closure.
 */

const AnalystHistoryView = {
  searchQuery: '',
  severityFilter: 'All',
  strategyFilter: 'All',
  outcomeFilter: 'All',
  statusFilter: 'All', // 'All', 'Resolved', 'Closed'

  render() {
    const allExceptions = window.BRIDGES_STORE.getExceptions();

    // Show resolved or closed exceptions (or all history)
    const historyExceptions = allExceptions.filter(e => ['Resolved', 'Closed'].includes(e.status));

    const filtered = historyExceptions.filter(e => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = e.id.toLowerCase().includes(q);
        const matchShip = e.shipmentId.toLowerCase().includes(q);
        const matchType = e.type.toLowerCase().includes(q);
        const matchCause = e.rootCause && e.rootCause.toLowerCase().includes(q);
        const matchStrat = e.finalResolution && e.finalResolution.recoveryStrategy && e.finalResolution.recoveryStrategy.toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchType && !matchCause && !matchStrat) return false;
      }

      if (this.severityFilter !== 'All' && e.severity !== this.severityFilter) return false;
      if (this.statusFilter !== 'All' && e.status !== this.statusFilter) return false;

      if (this.strategyFilter !== 'All') {
        const strat = e.finalResolution ? e.finalResolution.recoveryStrategy : '';
        if (strat !== this.strategyFilter) return false;
      }

      if (this.outcomeFilter !== 'All') {
        const outcome = e.finalResolution ? e.finalResolution.deliveryOutcome : '';
        if (outcome !== this.outcomeFilter) return false;
      }

      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Exception Resolution History</h2>
              <span class="role-indicator-pill">Lifecycle Archive</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Permanent historical archive of resolved and closed exceptions, root-cause analyses, and mitigation performance.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystHistoryView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_queue')">
              ${Icons.exceptionQueue ? Icons.exceptionQueue(14) : ''}
              <span>Active Queue</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Exception ID, Shipment, Root Cause, Resolution Summary..." 
              value="${this.searchQuery}" 
              oninput="AnalystHistoryView.handleSearch(this.value)"
            >
          </div>

          <!-- Lifecycle Status Filter -->
          <select class="filter-select" onchange="AnalystHistoryView.handleFilter('statusFilter', this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All History Statuses</option>
            <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved (Pending Final Close)</option>
            <option value="Closed" ${this.statusFilter === 'Closed' ? 'selected' : ''}>Closed (Audited & Locked)</option>
          </select>

          <!-- Severity Filter -->
          <select class="filter-select" onchange="AnalystHistoryView.handleFilter('severityFilter', this.value)">
            <option value="All" ${this.severityFilter === 'All' ? 'selected' : ''}>All Severities</option>
            <option value="Critical" ${this.severityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
            <option value="High" ${this.severityFilter === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${this.severityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${this.severityFilter === 'Low' ? 'selected' : ''}>Low</option>
          </select>

          <!-- Strategy Filter -->
          <select class="filter-select" onchange="AnalystHistoryView.handleFilter('strategyFilter', this.value)">
            <option value="All" ${this.strategyFilter === 'All' ? 'selected' : ''}>All Recovery Strategies</option>
            <option value="Re-route" ${this.strategyFilter === 'Re-route' ? 'selected' : ''}>Re-route</option>
            <option value="Alternate Carrier" ${this.strategyFilter === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier</option>
            <option value="Expedite" ${this.strategyFilter === 'Expedite' ? 'selected' : ''}>Expedite</option>
            <option value="Split Shipment" ${this.strategyFilter === 'Split Shipment' ? 'selected' : ''}>Split Shipment</option>
            <option value="Operational Intervention" ${this.strategyFilter === 'Operational Intervention' ? 'selected' : ''}>Operational Intervention</option>
          </select>

          <!-- Delivery Outcome Filter -->
          <select class="filter-select" onchange="AnalystHistoryView.handleFilter('outcomeFilter', this.value)">
            <option value="All" ${this.outcomeFilter === 'All' ? 'selected' : ''}>All Delivery Outcomes</option>
            <option value="Delivered" ${this.outcomeFilter === 'Delivered' ? 'selected' : ''}>Delivered (Nominal)</option>
            <option value="Delivered with Delay" ${this.outcomeFilter === 'Delivered with Delay' ? 'selected' : ''}>Delivered with Delay</option>
          </select>
        </div>

        <!-- Table Card -->
        <div class="card" style="padding: 0; overflow: hidden;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">
                ${Icons.exceptionHistory(24)}
              </div>
              <div class="empty-state-title">No Historical Records Found</div>
              <div class="empty-state-sub">There are no resolved or closed exceptions matching the selected criteria.</div>
              <button class="btn btn-secondary btn-sm mt-3" onclick="AnalystHistoryView.resetFilters()">Clear Filters</button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table" style="font-size: 12px;">
                <thead>
                  <tr>
                    <th>Exception ID</th>
                    <th>Shipment ID</th>
                    <th>Type & Severity</th>
                    <th>Verified Root Cause</th>
                    <th>Strategy Used</th>
                    <th>Delivery Outcome</th>
                    <th>SLA Outcome</th>
                    <th>Analyst</th>
                    <th>Resolved / Closed</th>
                    <th style="text-align: right;">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(exc => {
                    const res = exc.finalResolution || {};
                    return `
                      <tr style="cursor: pointer;" onclick="AnalystHistoryView.openDetailModal('${exc.id}')">
                        <td>
                          <span style="font-weight: 700; color: var(--color-royal-navy);">${exc.id}</span>
                        </td>
                        <td>
                          <span style="font-weight: 700; color: var(--color-midnight);">${exc.shipmentId}</span>
                        </td>
                        <td>
                          <div style="font-weight: 600; color: var(--color-midnight);">${exc.type}</div>
                          <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(exc.severity)}">${exc.severity}</span>
                        </td>
                        <td style="max-width: 220px;">
                          <div style="font-size: 11px; color: var(--color-charcoal); line-height: 1.35;">${exc.rootCause}</div>
                        </td>
                        <td>
                          <span class="badge" style="background: #EFEFF9; color: var(--color-slate-indigo); font-weight: 700;">
                            ${res.recoveryStrategy || 'Operational Intervention'}
                          </span>
                        </td>
                        <td>
                          <span style="font-weight: 600; color: #1E8E3E;">
                            ${res.deliveryOutcome || 'Delivered'}
                          </span>
                        </td>
                        <td>
                          <span class="badge-sla-risk ${res.slaOutcome === 'Preserved' ? 'none' : 'high'}">
                            ${res.slaOutcome || 'Preserved'}
                          </span>
                        </td>
                        <td>
                          <span style="font-size: 11px; color: var(--color-charcoal); font-weight: 600;">
                            ${exc.assignedAnalyst ? exc.assignedAnalyst.split(' ')[0] : 'System'}
                          </span>
                        </td>
                        <td>
                          <div style="font-size: 11px; font-weight: 600;">${exc.resolvedAt ? exc.resolvedAt.slice(0, 10) : '--'}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${exc.status === 'Closed' ? 'Closed' : 'Resolved'}</div>
                        </td>
                        <td style="text-align: right;" onclick="event.stopPropagation();">
                          <div style="display: inline-flex; gap: 4px;">
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 11px;" onclick="AnalystHistoryView.openDetailModal('${exc.id}')">
                              Inspect
                            </button>
                            ${exc.status === 'Resolved' ? `
                              <button class="btn btn-primary btn-sm" style="padding: 2px 7px; font-size: 11px; background: #1E8E3E; border-color: #1E8E3E;" onclick="AnalystHistoryView.openCloseModal('${exc.id}')">
                                Close Exception
                              </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 11px; color: var(--color-signal-red);" onclick="AnalystHistoryView.promptReopen('${exc.id}')">
                              Reopen
                            </button>
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

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_history') {
      App.renderCurrentView();
    }
  },

  handleFilter(field, val) {
    this[field] = val;
    if (window.App && App.currentView === 'analyst_history') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.severityFilter = 'All';
    this.strategyFilter = 'All';
    this.outcomeFilter = 'All';
    this.statusFilter = 'All';
    if (window.App && App.currentView === 'analyst_history') {
      App.renderCurrentView();
    }
  },

  // Open Detailed Read-Only Historical Inspection Modal
  openDetailModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const res = exc.finalResolution || {};

    const contentHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--color-light-blue-grey); flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="font-size: 16px; font-weight: 800; color: var(--color-royal-navy); margin: 0;">${exc.id}</h4>
              <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(exc.severity)}">${exc.severity}</span>
              <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-weight: 700;">${exc.status}</span>
            </div>
            <div style="font-size: 12px; color: var(--color-charcoal); margin-top: 3px;">
              Shipment: <strong>${exc.shipmentId}</strong> • Type: <strong>${exc.type}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--color-muted-sage);">SLA Performance Outcome</div>
            <div class="badge-sla-risk ${res.slaOutcome === 'Preserved' ? 'none' : 'high'}">
              ${res.slaOutcome || 'Preserved'}
            </div>
          </div>
        </div>

        <!-- Resolution Details Grid -->
        <div class="meta-kv-grid" style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Verified Root Cause</span>
            <span class="meta-kv-value">${exc.rootCause}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Recovery Strategy Deployed</span>
            <span class="meta-kv-value" style="color: var(--color-royal-navy);">${res.recoveryStrategy || 'Operational Intervention'}</span>
          </div>
          <div class="meta-kv-item" style="grid-column: span 2;">
            <span class="meta-kv-label">Final Resolution Summary</span>
            <span class="meta-kv-value" style="font-weight: 500; line-height: 1.4;">${res.summary || exc.finalOutcome || 'Operational deviation safely resolved.'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Final Delivery Outcome</span>
            <span class="meta-kv-value" style="color: #1E8E3E;">${res.deliveryOutcome || 'Delivered'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Closed By & Timestamp</span>
            <span class="meta-kv-value" style="font-size: 11px;">${res.closedBy || exc.assignedAnalyst || 'Sarah Lin'} (${exc.resolvedAt ? exc.resolvedAt.slice(0, 10) : '--'})</span>
          </div>
        </div>

        <!-- Complete Audit Timeline -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-bottom: 8px;">
            End-to-End Resolution Timeline
          </div>
          <div class="timeline-stream">
            ${(exc.timeline || []).map(item => `
              <div class="timeline-stream-item">
                <div class="timeline-node-dot ${item.action.includes('Closed') || item.action.includes('Accepted') ? 'success' : item.action.includes('Detected') ? 'alert' : ''}"></div>
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

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          ${exc.status === 'Resolved' ? `
            <button class="btn btn-primary btn-sm" style="background: #1E8E3E; border-color: #1E8E3E;" onclick="UI.closeModal('generic-app-modal'); AnalystHistoryView.openCloseModal('${exc.id}')">
              Close Exception (Final Sign-off)
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" style="color: var(--color-signal-red);" onclick="UI.closeModal('generic-app-modal'); AnalystHistoryView.promptReopen('${exc.id}')">
            Reopen Exception
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Exception Audit History — ${exc.id}`, contentHtml);
  },

  // Reopen Prompt (US-40)
  promptReopen(exceptionId) {
    const reason = prompt("Enter specific operational reason to reopen this exception (e.g. 'Secondary compressor failure observed' or 'Customer disputed delivery condition'):");
    if (!reason || !reason.trim()) return;

    try {
      window.BRIDGES_STORE.reopenException(exceptionId, reason.trim());
      UI.showToast(`Exception ${exceptionId} has been reopened and returned to Active Queue.`, 'info');
      App.navigateTo('analyst_queue');
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Final Resolution Form for Closing Exception (US-41 to US-43)
  openCloseModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;
    const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId);
    const linkedRec = exc.recoveryRequestId ? window.BRIDGES_STORE.getRecoveryRequest(exc.recoveryRequestId) : null;

    const formHtml = `
      <form id="close-exception-form" onsubmit="AnalystHistoryView.submitCloseException(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="padding: 10px 12px; background: #EAF7EE; border: 1px solid #B7EB8F; border-radius: 6px; font-size: 12px; color: #1E8E3E;">
            <strong>Formal Exception Closure Sign-off:</strong> Validates delivery completion, root cause classification, and permanent operational archive.
          </div>

          <!-- Root Cause -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Root Cause Category (Analytics) <span style="color: var(--color-signal-red);">*</span></label>
              <select id="close-root-category" class="form-control" required>
                <option value="Carrier Operations Defect">Carrier Operations Defect</option>
                <option value="Severe Weather & Corridor Disruption">Severe Weather &amp; Corridor Disruption</option>
                <option value="Cold-Chain Thermal Excursion">Cold-Chain Thermal Excursion</option>
                <option value="Customs Broker Hold / Documentation Defect">Customs Broker Hold / Documentation Defect</option>
                <option value="Terminal Dock & Warehouse Congestion">Terminal Dock &amp; Warehouse Congestion</option>
                <option value="Mechanical Breakdown / Equipment Failure">Mechanical Breakdown / Equipment Failure</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Final Verified Root Cause <span style="color: var(--color-signal-red);">*</span></label>
              <input 
                type="text" 
                id="close-root-cause" 
                class="form-control" 
                required 
                value="${exc.rootCause || ''}"
              >
            </div>
          </div>

          <!-- Recovery Strategy Used -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Recovery Strategy Used <span style="color: var(--color-signal-red);">*</span></label>
            <select id="close-strategy" class="form-control" required>
              <option value="Re-route" ${linkedRec && linkedRec.recoveryStrategy === 'Re-route' ? 'selected' : ''}>Re-route (Alternative Corridor)</option>
              <option value="Alternate Carrier" ${linkedRec && linkedRec.recoveryStrategy === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier</option>
              <option value="Expedite" ${linkedRec && linkedRec.recoveryStrategy === 'Expedite' ? 'selected' : ''}>Expedite (Air / Express)</option>
              <option value="Split Shipment" ${linkedRec && linkedRec.recoveryStrategy === 'Split Shipment' ? 'selected' : ''}>Split Shipment</option>
              <option value="Operational Intervention" ${!linkedRec ? 'selected' : ''}>Operational Intervention (Direct Mitigation)</option>
            </select>
          </div>

          <!-- Final Resolution Summary -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Final Resolution Summary <span style="color: var(--color-signal-red);">*</span></label>
            <textarea 
              id="close-summary" 
              class="form-control" 
              rows="2" 
              required 
              placeholder="Detailed explanation of resolution action and final state..."
            >Operational recovery verified and confirmed intact. Shipment arrived at destination terminal with full integrity certified.</textarea>
          </div>

          <!-- Delivery Outcome & SLA Outcome -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Delivery Outcome <span style="color: var(--color-signal-red);">*</span></label>
              <select id="close-delivery-outcome" class="form-control" required>
                <option value="Delivered">Delivered (Safe & Nominal)</option>
                <option value="Delivered with Delay">Delivered with Delay</option>
                <option value="Partial Salvage">Partial Salvage</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">SLA Contract Outcome <span style="color: var(--color-signal-red);">*</span></label>
              <select id="close-sla-outcome" class="form-control" required>
                <option value="Preserved">Preserved (Within Buffer / Recovery)</option>
                <option value="Waived">Waived (Customer Agreed)</option>
                <option value="Incurred Penalty">Incurred Penalty</option>
              </select>
            </div>
          </div>

          <!-- Closure Notes & Continuous Learning for Analytics -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Closure Notes &amp; Continuous Learning Insights (for Analytics) <span style="color: var(--color-signal-red);">*</span></label>
            <textarea 
              id="close-analytics-notes" 
              class="form-control" 
              rows="2" 
              required 
              placeholder="Preventive mitigation rules, carrier SLA scorecard feedback, and systemic learnings..."
            >Documented carrier dispatch delay pattern. Added 45-minute buffer recommendation to lane model and updated carrier quarterly scorecard.</textarea>
          </div>

          <!-- Delivery Verification Override Checkbox if simulating without delivery event -->
          <div style="padding: 8px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 11px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--color-midnight);">
              <input type="checkbox" id="close-override-verify" checked>
              <span>Verify that delivery confirmation or recovery completion conditions are met.</span>
            </label>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #1E8E3E; border-color: #1E8E3E;">
              Confirm & Lock Closure
            </button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Close Exception — ${exc.id}`, formHtml);
  },

  submitCloseException(e, exceptionId) {
    e.preventDefault();

    try {
      const rootCategory = document.getElementById('close-root-category').value;
      const rootCause = document.getElementById('close-root-cause').value;
      const strategy = document.getElementById('close-strategy').value;
      const summary = document.getElementById('close-summary').value;
      const deliveryOutcome = document.getElementById('close-delivery-outcome').value;
      const slaOutcome = document.getElementById('close-sla-outcome').value;
      const analyticsNotes = document.getElementById('close-analytics-notes').value;
      const overrideVerification = document.getElementById('close-override-verify')?.checked;

      const currentUser = window.BRIDGES_AUTH.getCurrentUser();
      const closedBy = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Lead Analyst)";

      window.BRIDGES_STORE.closeException(exceptionId, {
        rootCause: `[${rootCategory}] ${rootCause}`,
        rootCategory,
        recoveryStrategy: strategy,
        summary,
        deliveryOutcome,
        slaOutcome,
        additionalNotes: analyticsNotes,
        overrideVerification,
        closedBy
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Exception ${exceptionId} permanently closed and archived with learning analytics notes.`, 'success');
      App.renderCurrentView();

    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystHistoryView = AnalystHistoryView;
