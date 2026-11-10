/**
 * BRIDGES Control Tower - Analyst Exception Queue View (US-21 to US-31)
 * Primary operational workspace distinguishing active intervention cases from
 * automatically resolved low-severity cases. Supports ownership assignment,
 * multi-criteria filters, and fast navigation to Investigation Workspace.
 */

const AnalystQueueView = {
  activeTab: 'intervention', // 'intervention' or 'auto_resolved'
  searchQuery: '',
  severityFilter: 'All',
  typeFilter: 'All',
  statusFilter: 'All',
  slaFilter: 'All',
  ownershipFilter: 'All', // 'All', 'Unassigned', 'Mine'

  render() {
    const allExceptions = window.BRIDGES_STORE.getExceptions();
    const currentUser = window.BRIDGES_AUTH.getCurrentUser();
    const myName = currentUser ? currentUser.name : "Sarah Lin";

    // Split between active intervention and low-severity auto-resolved
    const interventionExceptions = allExceptions.filter(e => !e.autoResolved);
    const autoResolvedExceptions = allExceptions.filter(e => e.autoResolved === true);

    const listToFilter = this.activeTab === 'intervention' ? interventionExceptions : autoResolvedExceptions;

    // Apply filters
    const filtered = listToFilter.filter(e => {
      // Search
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = e.id.toLowerCase().includes(q);
        const matchShip = e.shipmentId.toLowerCase().includes(q);
        const matchType = e.type.toLowerCase().includes(q);
        const matchCause = e.rootCause && e.rootCause.toLowerCase().includes(q);
        const matchLoc = e.location && e.location.toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchType && !matchCause && !matchLoc) return false;
      }

      // Severity
      if (this.severityFilter !== 'All') {
        if (e.severity !== this.severityFilter) return false;
      }

      // Type
      if (this.typeFilter !== 'All') {
        if (e.type !== this.typeFilter) return false;
      }

      // Status
      if (this.statusFilter !== 'All') {
        if (e.status !== this.statusFilter) return false;
      }

      // SLA Risk
      if (this.slaFilter !== 'All') {
        if ((e.slaRisk || 'None') !== this.slaFilter) return false;
      }

      // Ownership
      if (this.ownershipFilter === 'Unassigned') {
        if (e.assignedAnalyst) return false;
      } else if (this.ownershipFilter === 'Mine') {
        if (!e.assignedAnalyst || !e.assignedAnalyst.includes(myName)) return false;
      }

      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Exception Queue Workspace</h2>
              <span class="role-indicator-pill role-analyst">Analyst Triage</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Live exception triage: low-severity events auto-resolve; high-impact deviations routed with AI-ranked options.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystQueueView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset</span>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AnalystQueueView.openCreateManualExceptionModal()" style="background: #EBF3FC; color: #18217E; border-color: #C7DCFA; font-weight: 700;">
              ${Icons.plus ? Icons.plus(13) : '+'}
              <span>+ Log Exception</span>
            </button>
          </div>
        </div>

        <!-- Tabbed Operations Header (Active Intervention vs Low-Severity Auto-Resolved Review) -->
        <div class="operation-tabs-header">
          <div class="operation-nav-tabs">
            <button 
              class="operation-tab-btn ${this.activeTab === 'intervention' ? 'active' : ''}" 
              onclick="AnalystQueueView.switchTab('intervention')"
            >
              <span>Active Intervention Queue</span>
              <span class="operation-tab-badge">${interventionExceptions.filter(e => ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status)).length}</span>
            </button>
            <button 
              class="operation-tab-btn ${this.activeTab === 'auto_resolved' ? 'active' : ''}" 
              onclick="AnalystQueueView.switchTab('auto_resolved')"
            >
              <span>Low-Severity Auto-Resolved Review</span>
              <span class="operation-tab-badge">${autoResolvedExceptions.length}</span>
            </button>
          </div>
          <div style="font-size: 11px; color: var(--color-muted-sage);">
            Signed In: <strong>${myName} (Control Tower)</strong>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Exception ID, Shipment, Deviation Type, Location..." 
              value="${this.searchQuery}" 
              oninput="AnalystQueueView.handleSearch(this.value)"
            >
          </div>

          <!-- Severity Filter -->
          <select class="filter-select" onchange="AnalystQueueView.handleFilter('severityFilter', this.value)">
            <option value="All" ${this.severityFilter === 'All' ? 'selected' : ''}>All Severities</option>
            <option value="Critical" ${this.severityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
            <option value="High" ${this.severityFilter === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${this.severityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${this.severityFilter === 'Low' ? 'selected' : ''}>Low</option>
          </select>

          <!-- Type Filter -->
          <select class="filter-select" onchange="AnalystQueueView.handleFilter('typeFilter', this.value)">
            <option value="All" ${this.typeFilter === 'All' ? 'selected' : ''}>All Deviation Types</option>
            <option value="Route Delay" ${this.typeFilter === 'Route Delay' ? 'selected' : ''}>Route Delay</option>
            <option value="Temperature Breach" ${this.typeFilter === 'Temperature Breach' ? 'selected' : ''}>Temperature Breach</option>
            <option value="Excessive Dwell Time" ${this.typeFilter === 'Excessive Dwell Time' ? 'selected' : ''}>Excessive Dwell Time</option>
            <option value="Missed Pickup" ${this.typeFilter === 'Missed Pickup' ? 'selected' : ''}>Missed Pickup</option>
            <option value="Customs Hold" ${this.typeFilter === 'Customs Hold' ? 'selected' : ''}>Customs Hold</option>
            <option value="Mechanical Breakdown" ${this.typeFilter === 'Mechanical Breakdown' ? 'selected' : ''}>Mechanical Breakdown</option>
          </select>

          <!-- Status Filter -->
          <select class="filter-select" onchange="AnalystQueueView.handleFilter('statusFilter', this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Open" ${this.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
            <option value="Assigned" ${this.statusFilter === 'Assigned' ? 'selected' : ''}>Assigned</option>
            <option value="Investigating" ${this.statusFilter === 'Investigating' ? 'selected' : ''}>Investigating</option>
            <option value="Recovery in Progress" ${this.statusFilter === 'Recovery in Progress' ? 'selected' : ''}>Recovery Active</option>
            <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>

          <!-- Ownership Filter -->
          <select class="filter-select" onchange="AnalystQueueView.handleFilter('ownershipFilter', this.value)">
            <option value="All" ${this.ownershipFilter === 'All' ? 'selected' : ''}>All Ownership</option>
            <option value="Unassigned" ${this.ownershipFilter === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
            <option value="Mine" ${this.ownershipFilter === 'Mine' ? 'selected' : ''}>Assigned to Me</option>
          </select>
        </div>

        <!-- Table Card -->
        <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #E2E8F0; border-radius: 8px;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">
                ${Icons.shieldCheck ? Icons.shieldCheck(24) : Icons.check(24)}
              </div>
              <div class="empty-state-title">No Exceptions Matching Filter</div>
              <div class="empty-state-sub">There are no exception deviations matching your current search parameters.</div>
              <button class="btn btn-secondary btn-sm mt-3" onclick="AnalystQueueView.resetFilters()">Clear Filters</button>
            </div>
          ` : this.activeTab === 'intervention' ? `
            <!-- Intervention Queue Table (Clean 7-column layout, fits 100% width) -->
            <div class="table-responsive" style="overflow-x: hidden; width: 100%;">
              <table class="data-table" style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                <colgroup>
                  <col style="width: 15%;">
                  <col style="width: 11%;">
                  <col style="width: 18%;">
                  <col style="width: 14%;">
                  <col style="width: 18%;">
                  <col style="width: 10%;">
                  <col style="width: 14%;">
                </colgroup>
                <thead>
                  <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Exception &amp; Time</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Shipment</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Deviation Type</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Status</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Location</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">SLA Risk</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(exc => {
                    const impactParts = (exc.estimatedBusinessImpact || '$4,500').split(' ');
                    const impactAmount = impactParts[0];

                    return `
                      <tr style="cursor: pointer; border-bottom: 1px solid #F1F5F9; transition: background 0.15s;" onclick="AnalystQueueView.openDetailModal('${exc.id}')" onmouseover="this.style.background='#F8FAFE'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 700; color: #18217E; font-size: 12px; font-family: 'JetBrains Mono', Consolas, monospace; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 2.5px 7px; border-radius: 4px; display: inline-block;">${exc.id}</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 500;">${AnalystDashboardView.formatTime(exc.detectionTime)}</span>
                          </div>
                        </td>
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <span style="font-weight: 700; color: #0F172A; font-size: 12.5px;">${exc.shipmentId}</span>
                        </td>
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <span style="font-weight: 700; color: #0F172A; font-size: 12.5px;">${exc.type}</span>
                        </td>
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <span style="font-size: 11px; padding: 2.5px 8px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; ${exc.status === 'Open' ? 'background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;' : exc.status === 'Investigating' ? 'background: #EBF3FC; color: #1967D2; border: 1px solid #BFDBFE;' : exc.status === 'Recovery in Progress' ? 'background: #F3E8FF; color: #6D28D9; border: 1px solid #DDD6FE;' : 'background: #EAF7EE; color: #1E8E3E; border: 1px solid #BBF7D0;'}">
                            <span style="width: 5px; height: 5px; border-radius: 50%; background: currentColor;"></span> ${exc.status}
                          </span>
                        </td>
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <span style="font-size: 12px; color: #334155; font-weight: 500;">📍 ${exc.location || 'Route Hub'}</span>
                        </td>
                        <td style="padding: 12px 14px; vertical-align: middle;">
                          <span class="badge-sla-risk ${exc.slaRisk ? exc.slaRisk.toLowerCase() : 'none'}" style="font-size: 10.5px; padding: 2.5px 8px; font-weight: 700; display: inline-block;">
                            ${exc.slaRisk || 'Nominal'}
                          </span>
                        </td>
                        <td style="padding: 12px 14px; text-align: right; vertical-align: middle;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                            ${!exc.assignedAnalyst ? `
                              <button class="btn btn-secondary btn-sm" style="padding: 4px 9px; font-size: 11px; font-weight: 700; background: #FEF3CD; color: #92400E; border: 1px solid #FCD34D;" onclick="event.stopPropagation(); AnalystQueueView.claimOwnership('${exc.id}')">
                                Claim
                              </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm" style="padding: 4px 12px; font-size: 11.5px; font-weight: 600; white-space: nowrap;" onclick="event.stopPropagation(); AnalystQueueView.openDetailModal('${exc.id}')">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <!-- Low-Severity Auto-Resolved Review Table (US-21) -->
            <div class="table-responsive">
              <table class="data-table" style="font-size: 12px;">
                <thead>
                  <tr>
                    <th>Exception ID</th>
                    <th>Shipment ID</th>
                    <th>Type & Category</th>
                    <th>Automated Action Taken</th>
                    <th>Resolution Outcome</th>
                    <th>Resolved At</th>
                    <th>Audit Status</th>
                    <th style="text-align: right;">Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(exc => `
                    <tr>
                      <td>
                        <span style="font-weight: 700; color: var(--color-royal-navy);">${exc.id}</span>
                      </td>
                      <td>
                        <strong>${exc.shipmentId}</strong>
                      </td>
                      <td>
                        <div style="font-weight: 600; color: var(--color-midnight);">${exc.type}</div>
                        <div style="font-size: 10px; color: var(--color-muted-sage);">Low Severity</div>
                      </td>
                      <td>
                        <div style="color: var(--color-royal-navy); font-weight: 500; max-width: 240px; font-size: 11px;">
                          ${exc.autoActionTaken || 'Automated rule adjustment applied.'}
                        </div>
                      </td>
                      <td>
                        <div style="color: #1E8E3E; font-size: 11px; max-width: 240px;">
                          ${exc.finalOutcome || 'Cleared automatically without customer impact.'}
                        </div>
                      </td>
                      <td>
                        <div style="font-size: 11px; font-weight: 600;">${AnalystDashboardView.formatTime(exc.resolvedAt)}</div>
                        <div style="font-size: 10px; color: var(--color-muted-sage);">${this.formatDate(exc.resolvedAt)}</div>
                      </td>
                      <td>
                        <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-weight: 700;">
                          Auto-Resolved
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 11px;" onclick="AnalystQueueView.inspectAutoResolved('${exc.id}')">
                          History
                        </button>
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

  switchTab(tab) {
    this.activeTab = tab;
    if (window.App && App.currentView === 'analyst_queue') {
      App.renderCurrentView();
    }
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_queue') {
      App.renderCurrentView();
    }
  },

  handleFilter(field, val) {
    this[field] = val;
    if (window.App && App.currentView === 'analyst_queue') {
      App.renderCurrentView();
    }
  },

  setSeverityFilter(sev) {
    this.severityFilter = sev;
    this.activeTab = 'intervention';
    if (window.App && App.currentView === 'analyst_queue') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.severityFilter = 'All';
    this.typeFilter = 'All';
    this.statusFilter = 'All';
    this.slaFilter = 'All';
    this.ownershipFilter = 'All';
    if (window.App && App.currentView === 'analyst_queue') {
      App.renderCurrentView();
    }
  },

  formatDate(isoString) {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  },

  // Take Ownership (US-21 to US-31)
  claimOwnership(exceptionId) {
    try {
      const currentUser = window.BRIDGES_AUTH.getCurrentUser();
      const updated = window.BRIDGES_STORE.takeOwnership(exceptionId, currentUser);
      UI.showToast(`Ownership taken for ${exceptionId}. Status changed to Assigned.`, 'success');
      if (window.App && App.currentView === 'analyst_queue') {
        App.renderCurrentView();
      }
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openDetailModal(exceptionId) {
    if (window.AnalystInvestigationView) {
      AnalystInvestigationView.openModal(exceptionId);
    }
  },

  openInvestigation(exceptionId) {
    this.openDetailModal(exceptionId);
  },

  // Inspect Auto-Resolved History Modal
  inspectAutoResolved(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const contentHtml = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="padding: 12px; background: #EAF7EE; border: 1px solid #B7EB8F; border-radius: 6px;">
          <div style="font-size: 13px; font-weight: 700; color: #1E8E3E;">
            Automated Low-Severity Resolution Audit
          </div>
          <div style="font-size: 12px; color: #274916; margin-top: 3px;">
            This exception was automatically intercepted and resolved by control tower business rule logic without requiring manual analyst intervention.
          </div>
        </div>

        <div class="meta-kv-grid" style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Exception ID</span>
            <span class="meta-kv-value">${exc.id}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Shipment ID</span>
            <span class="meta-kv-value">${exc.shipmentId}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Deviation Root Cause</span>
            <span class="meta-kv-value">${exc.rootCause}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Automated Action</span>
            <span class="meta-kv-value" style="color: var(--color-royal-navy);">${exc.autoActionTaken || 'Buffer applied.'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Resolution Outcome</span>
            <span class="meta-kv-value" style="color: #1E8E3E;">${exc.finalOutcome}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Resolved At</span>
            <span class="meta-kv-value">${AnalystDashboardView.formatTime(exc.resolvedAt)} (${exc.resolvedAt})</span>
          </div>
        </div>

        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); margin-bottom: 8px;">
            Automated Execution Timeline
          </div>
          <div class="timeline-stream">
            ${(exc.timeline || []).map(item => `
              <div class="timeline-stream-item">
                <div class="timeline-node-dot success"></div>
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
      </div>
    `;

    UI.openModal('generic-app-modal', `Automated Resolution History — ${exc.id}`, contentHtml);
  },

  // --- MANUAL EXCEPTION & EVIDENCE CREATION ---
  openCreateManualExceptionModal() {
    const shipments = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipments() : [];
    const activeShipments = shipments.filter(s => s.status !== 'Delivered');

    const modalHtml = `
      <form id="create-manual-exception-form" onsubmit="AnalystQueueView.submitManualException(event)">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
            <strong>Manual Exception Intake:</strong> Log operational deviations identified via external phone calls, physical inspections, police reports, or field observations.
          </div>

          <!-- Target Shipment -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Target Active Shipment *</label>
            <select id="man-exc-shipment" class="form-control" required onchange="AnalystQueueView.handleShipmentSelection(this.value)">
              <option value="">-- Select Target Shipment --</option>
              ${activeShipments.map(s => `
                <option value="${s.id}">${s.id} — ${s.origin} → ${s.destination} (${s.cargoType}) [${s.carrierId}]</option>
              `).join('')}
            </select>
          </div>

          <!-- Category & Severity -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Exception Category *</label>
              <select id="man-exc-type" class="form-control" required>
                <option value="Route Delay">Route Delay</option>
                <option value="Temperature Breach">Temperature Breach</option>
                <option value="Missed Pickup">Missed Pickup</option>
                <option value="Excessive Dwell Time">Excessive Dwell Time</option>
                <option value="Customs Hold">Customs Hold</option>
                <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                <option value="Documentation Defect">Documentation Defect</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Severity Classification *</label>
              <select id="man-exc-severity" class="form-control" required>
                <option value="Critical">Critical Alert (Immediate Spoilage / Breach)</option>
                <option value="High" selected>High Severity</option>
                <option value="Medium">Medium Impact</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <!-- Location & SLA Risk -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Reported Location / Corridor Sector *</label>
              <input type="text" id="man-exc-location" class="form-control" placeholder="e.g. Interstate Highway 35 Corridor Milepost 88" required value="Interstate Route Corridor Sector 4">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Contractual SLA Risk *</label>
              <select id="man-exc-sla" class="form-control" required>
                <option value="Critical">Critical Breach Imminent</option>
                <option value="High" selected>High SLA Risk</option>
                <option value="Medium">Medium SLA Tolerance</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>

          <!-- Root Cause Hypothesis -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Root Cause Hypothesis &amp; Field Observation *</label>
            <input type="text" id="man-exc-cause" class="form-control" required placeholder="e.g. Severe cross-wind rollover blockage on mountain pass" value="Physical obstruction reported along transit route">
          </div>

          <!-- Evidence Attachment Section -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="font-weight: 700; margin: 0;">Evidence &amp; Artifact Attachments</label>
              <span class="badge" style="background: #EBF3FC; color: #18217E; font-size: 10px;">Digital Evidence Audit</span>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
              <input type="text" id="man-exc-evidence-name" class="form-control" style="font-size: 11.5px;" placeholder="Document name (e.g. Police_Road_Closure_Notice.pdf)" value="Police_Incident_Log_Rpt.pdf">
              <select id="man-exc-evidence-type" class="form-control" style="font-size: 11.5px;">
                <option value="Official Police/Highway Report">Police Report</option>
                <option value="Reefer Datalogger Export">Datalogger Export</option>
                <option value="Customs Broker Notice">Customs Notice</option>
                <option value="Driver Incident Photograph">Site Photograph</option>
                <option value="Bill of Lading Revision">BOL Revision</option>
              </select>
            </div>
            <div style="font-size: 10px; color: var(--color-muted-sage); margin-top: 4px;">
              Evidence files will be linked to the exception record and permanently archived for root cause analytics.
            </div>
          </div>

          <!-- Initial Coordination Note -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Initial Analyst Coordination Note</label>
            <textarea id="man-exc-note" class="form-control" rows="2" placeholder="Instructions for war room or dispatch team...">Verified with carrier dispatch operations. Escalating to recovery planning.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #18217E; border-color: #18217E; font-weight: 700;">
              Create Exception &amp; Attach Evidence
            </button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', 'Create Manual Exception & Attach Evidence', modalHtml);
  },

  handleShipmentSelection(shipmentId) {
    if (!shipmentId) return;
    const shipment = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipment(shipmentId) : null;
    if (shipment) {
      const locInput = document.getElementById('man-exc-location');
      if (locInput) locInput.value = shipment.currentLocation || "En Route Corridor";
    }
  },

  submitManualException(e) {
    e.preventDefault();
    const shipmentId = document.getElementById('man-exc-shipment')?.value;
    if (!shipmentId) {
      UI.showToast("Please select a target shipment.", "error");
      return;
    }

    const type = document.getElementById('man-exc-type')?.value;
    const severity = document.getElementById('man-exc-severity')?.value;
    const location = document.getElementById('man-exc-location')?.value;
    const slaRisk = document.getElementById('man-exc-sla')?.value;
    const rootCause = document.getElementById('man-exc-cause')?.value;
    const evidenceName = document.getElementById('man-exc-evidence-name')?.value;
    const evidenceType = document.getElementById('man-exc-evidence-type')?.value;
    const initialNote = document.getElementById('man-exc-note')?.value;

    const evidenceList = evidenceName ? [
      { fileName: evidenceName, fileType: evidenceType, fileSize: "2.1 MB" }
    ] : [];

    try {
      const newExc = window.BRIDGES_STORE.createManualException({
        shipmentId,
        type,
        severity,
        location,
        slaRisk,
        rootCause,
        evidence: evidenceList,
        initialNote,
        estimatedBusinessImpact: severity === 'Critical' ? "$45,000 SLA penalty buffer" : "$12,000 contractual buffer"
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Manual exception ${newExc.id} logged with evidence attachment!`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystQueueView = AnalystQueueView;

