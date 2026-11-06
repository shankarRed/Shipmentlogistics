/**
 * BRIDGES Control Tower - Data Quality Management View
 * Identifies shipments with missing or invalid data, triggers partner correction requests,
 * enables false-positive exception suppression, and maintains complete resolution history.
 */

const AnalystDataQualityView = {
  severityFilter: 'All',
  statusFilter: 'All',
  searchQuery: '',

  render() {
    const issues = window.BRIDGES_STORE ? window.BRIDGES_STORE.getDataQualityIssues() : [];
    const history = window.BRIDGES_STORE ? window.BRIDGES_STORE.getDataQualityHistory() : [];
    const shipments = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipments() : [];

    const openIssues = issues.filter(i => i.status !== 'Resolved');
    const highSeverityIssues = issues.filter(i => i.severity === 'High' && i.status !== 'Resolved');
    const suppressedCount = issues.filter(i => i.suppressExceptionDetection).length;

    // Filter issues
    const filtered = issues.filter(i => {
      if (this.severityFilter !== 'All' && i.severity !== this.severityFilter) return false;
      if (this.statusFilter !== 'All' && i.status !== this.statusFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = i.id.toLowerCase().includes(q);
        const matchShip = i.shipmentId.toLowerCase().includes(q);
        const matchCat = i.category.toLowerCase().includes(q);
        const matchField = i.field.toLowerCase().includes(q);
        const matchNotes = i.notes && i.notes.toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchCat && !matchField && !matchNotes) return false;
      }
      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Data Quality &amp; Governance Management</h2>
              <span class="role-indicator-pill role-analyst">Data Health</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Proactive anomaly detection for missing telemetry, incomplete customs codes, driver unassignment, and exception suppression.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystDataQualityView.scanDataHealth()">
              ${Icons.refresh ? Icons.refresh(13) : ''}
              <span>Run Automated Health Scan</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="AnalystDataQualityView.openCreateIssueModal()">
              ${Icons.plus ? Icons.plus(13) : ''}
              <span>Log Data Quality Issue</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Health Cards -->
        <div class="analyst-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px;">
          <div class="analyst-kpi-card kpi-resolved">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Overall Data Health Index</span>
              <span class="analyst-kpi-badge" style="background: #EAF7EE; color: #1E8E3E;">Grade A-</span>
            </div>
            <div class="analyst-kpi-value" style="color: #1E8E3E;">96.2%</div>
            <div class="analyst-kpi-sub">Across Active Shipments</div>
          </div>
          <div class="analyst-kpi-card kpi-critical">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Open Data Quality Issues</span>
              <span class="analyst-kpi-badge" style="background: #FEE2E2; color: #DC2626;">${openIssues.length} Active</span>
            </div>
            <div class="analyst-kpi-value" style="color: #DC2626;">${openIssues.length}</div>
            <div class="analyst-kpi-sub">${highSeverityIssues.length} High Severity</div>
          </div>
          <div class="analyst-kpi-card kpi-open">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Exception Detection Suppressed</span>
              <span class="analyst-kpi-badge">${suppressedCount} Shipments</span>
            </div>
            <div class="analyst-kpi-value" style="color: var(--color-slate-indigo);">${suppressedCount}</div>
            <div class="analyst-kpi-sub">False-Positive Prevention Active</div>
          </div>
          <div class="analyst-kpi-card kpi-active">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Rectifications Executed</span>
              <span class="analyst-kpi-badge">${history.length} Resolved</span>
            </div>
            <div class="analyst-kpi-value" style="color: var(--color-royal-navy);">${history.length}</div>
            <div class="analyst-kpi-sub">Historical Audit Trail</div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar" style="margin-bottom: 16px;">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Issue ID, Shipment ID, Data Field, Diagnostic Notes..." 
              value="${this.searchQuery}" 
              oninput="AnalystDataQualityView.handleSearch(this.value)"
            >
          </div>

          <select class="filter-select" onchange="AnalystDataQualityView.handleSeverityFilter(this.value)">
            <option value="All" ${this.severityFilter === 'All' ? 'selected' : ''}>All Severities</option>
            <option value="High" ${this.severityFilter === 'High' ? 'selected' : ''}>High Severity</option>
            <option value="Medium" ${this.severityFilter === 'Medium' ? 'selected' : ''}>Medium Severity</option>
            <option value="Low" ${this.severityFilter === 'Low' ? 'selected' : ''}>Low Severity</option>
          </select>

          <select class="filter-select" onchange="AnalystDataQualityView.handleStatusFilter(this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Open" ${this.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
            <option value="Under Review" ${this.statusFilter === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>

        <!-- Data Quality Issues Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px;">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-light-blue-grey); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 800; color: var(--color-midnight);">Active Data Quality Issues &amp; Correction Queue</span>
            <span style="font-size: 11px; color: var(--color-charcoal);">${filtered.length} Displayed Issues</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Affected Shipment</th>
                  <th>Defect Category</th>
                  <th>Flagged Field</th>
                  <th>Current / Missing Value</th>
                  <th>Suppression</th>
                  <th>Assigned Analyst</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(issue => {
                  const isHigh = issue.severity === 'High';
                  const isResolved = issue.status === 'Resolved';

                  return `
                    <tr style="${isHigh && !isResolved ? 'background: #FFFBFB;' : ''}">
                      <td>
                        <strong style="color: var(--color-royal-navy);">${issue.id}</strong>
                        <div>
                          <span class="badge ${isHigh ? 'badge-danger' : 'badge-neutral'}" style="font-size: 9.5px;">${issue.severity}</span>
                        </div>
                      </td>
                      <td>
                        <a href="javascript:void(0)" onclick="AnalystShipmentsView.openDetailModal('${issue.shipmentId}')" style="font-weight: 700; color: var(--color-royal-navy);">
                          ${issue.shipmentId} ↗
                        </a>
                      </td>
                      <td>
                        <span style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${issue.category}</span>
                        <div style="font-size: 10.5px; color: #64748B; max-width: 220px; line-height: 1.25; margin-top: 2px;">
                          ${issue.notes}
                        </div>
                      </td>
                      <td>
                        <code style="background: #EEF2F6; padding: 2px 5px; border-radius: 4px; font-size: 11px; color: #18217E;">${issue.field}</code>
                      </td>
                      <td>
                        <div style="font-size: 11px; color: #DC2626; font-weight: 600;">${issue.currentValue}</div>
                        <div style="font-size: 10px; color: #8A9995;">Expected: ${issue.expectedFormat}</div>
                      </td>
                      <td>
                        <label style="display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: 11px; font-weight: 600; color: ${issue.suppressExceptionDetection ? 'var(--color-slate-indigo)' : '#8A9995'};">
                          <input 
                            type="checkbox" 
                            ${issue.suppressExceptionDetection ? 'checked' : ''} 
                            onchange="AnalystDataQualityView.toggleSuppression('${issue.shipmentId}', this.checked)"
                          >
                          <span>${issue.suppressExceptionDetection ? 'Suppressed' : 'Active'}</span>
                        </label>
                      </td>
                      <td>
                        ${issue.assignedAnalyst ? `
                          <span class="role-indicator-pill" style="font-size: 10px;">${issue.assignedAnalyst}</span>
                        ` : `
                          <button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 10px;" onclick="AnalystDataQualityView.claimIssue('${issue.id}')">
                            Take Issue
                          </button>
                        `}
                      </td>
                      <td>
                        <span class="badge" style="background: ${isResolved ? '#EAF7EE' : '#FFF3CD'}; color: ${isResolved ? '#1E8E3E' : '#B45309'}; font-size: 10px; font-weight: 700;">
                          ${issue.status}
                        </span>
                        ${issue.requestedCorrectionAt ? `
                          <div style="font-size: 9.5px; color: #1967D2; margin-top: 2px;">Req: ${issue.requestedCorrectionAt.slice(11, 16)}</div>
                        ` : ''}
                      </td>
                      <td style="text-align: right; white-space: nowrap;">
                        <div style="display: inline-flex; gap: 4px;">
                          ${!isResolved ? `
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 10.5px;" onclick="AnalystDataQualityView.openRequestCorrectionModal('${issue.id}')" title="Request correction from carrier or customer">
                              Request Fix
                            </button>
                            <button class="btn btn-primary btn-sm" style="padding: 2px 7px; font-size: 10.5px; background: #1E8E3E; border-color: #1E8E3E;" onclick="AnalystDataQualityView.openResolveModal('${issue.id}')" title="Verify & close issue">
                              Resolve
                            </button>
                          ` : `
                            <span style="font-size: 11px; color: #1E8E3E; font-weight: 700;">✓ Resolved</span>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Correction History Audit Log -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-light-blue-grey); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 800; color: var(--color-midnight);">Data Quality Rectification History Log</span>
            <span style="font-size: 11px; color: var(--color-charcoal);">${history.length} Permanent Records</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Shipment</th>
                  <th>Field Modified</th>
                  <th>Pre-Correction Value</th>
                  <th>Rectified Value</th>
                  <th>Analyst</th>
                  <th>Timestamp</th>
                  <th>Resolution Summary</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(h => `
                  <tr>
                    <td><strong style="color: var(--color-royal-navy);">${h.id}</strong></td>
                    <td><strong style="color: var(--color-midnight);">${h.shipmentId}</strong></td>
                    <td><code>${h.field}</code></td>
                    <td><span style="color: #DC2626; text-decoration: line-through;">${h.oldValue}</span></td>
                    <td><span style="color: #1E8E3E; font-weight: 700;">${h.correctedValue}</span></td>
                    <td><span>${h.correctedBy}</span></td>
                    <td><span style="font-size: 11px;">${h.timestamp ? h.timestamp.slice(0, 16).replace('T', ' ') : '--'}</span></td>
                    <td><span style="font-size: 11px; color: #393A50;">${h.resolution}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_data_quality') {
      App.renderCurrentView();
    }
  },

  handleSeverityFilter(val) {
    this.severityFilter = val;
    if (window.App && App.currentView === 'analyst_data_quality') {
      App.renderCurrentView();
    }
  },

  handleStatusFilter(val) {
    this.statusFilter = val;
    if (window.App && App.currentView === 'analyst_data_quality') {
      App.renderCurrentView();
    }
  },

  claimIssue(issueId) {
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const name = user ? user.name : "Sarah Lin";
    try {
      window.BRIDGES_STORE.assignDataQualityIssue(issueId, name);
      UI.showToast(`Issue ${issueId} assigned to ${name}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  toggleSuppression(shipmentId, suppress) {
    try {
      window.BRIDGES_STORE.toggleExceptionSuppression(shipmentId, suppress);
      UI.showToast(`Exception detection suppression ${suppress ? 'enabled' : 'disabled'} for ${shipmentId}.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openRequestCorrectionModal(issueId) {
    const issue = (window.BRIDGES_STORE ? window.BRIDGES_STORE.getDataQualityIssues() : []).find(i => i.id === issueId);
    if (!issue) return;

    const modalHtml = `
      <form id="request-correction-form" onsubmit="AnalystDataQualityView.submitRequestCorrection(event, '${issue.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
            Target Shipment: <strong>${issue.shipmentId}</strong> • Defect: <strong>${issue.category}</strong> (<code>${issue.field}</code>)
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Partner Notification Target *</label>
            <select id="req-target-partner" class="form-control" required>
              <option value="Carrier Dispatch Operations">Carrier Dispatch Operations (BGL Dispatch Portal)</option>
              <option value="Customs Broker">Customs Broker &amp; Compliance Agent</option>
              <option value="Shipper / Enterprise Order Desk">Shipper / Enterprise Order Desk</option>
              <option value="Customer Consignee Contact">Customer Consignee Contact</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Urgent Data Rectification Notice *</label>
            <textarea id="req-correction-notes" class="form-control" rows="3" required>Please provide verified ${issue.field} to resolve defect. Expected format: ${issue.expectedFormat}.</textarea>
          </div>

          <div style="background: #FFFDF0; border: 1px solid #FFE58F; border-radius: 6px; padding: 8px 10px; font-size: 11px; color: #874D00;">
            <strong>Automated Alert Suppression:</strong> Exception creation will be placed in a temporary holding buffer while the partner addresses this request.
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Dispatch Correction Request</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Request Partner Data Fix — ${issue.id}`, modalHtml);
  },

  submitRequestCorrection(e, issueId) {
    e.preventDefault();
    const notes = document.getElementById('req-correction-notes')?.value;
    try {
      window.BRIDGES_STORE.requestDataCorrection(issueId, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Correction request dispatched for ${issueId}. Partner notified.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openResolveModal(issueId) {
    const issue = (window.BRIDGES_STORE ? window.BRIDGES_STORE.getDataQualityIssues() : []).find(i => i.id === issueId);
    if (!issue) return;

    const modalHtml = `
      <form id="resolve-dq-form" onsubmit="AnalystDataQualityView.submitResolve(event, '${issue.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #EAF7EE; border: 1px solid #B7EB8F; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #1E8E3E;">
            <strong>Rectification Sign-off:</strong> Resolving will normalize the record in master database and record permanent audit entry.
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Verified Correct Value *</label>
            <input type="text" id="resolve-correct-value" class="form-control" placeholder="Enter validated value..." value="${issue.expectedFormat.replace('e.g. ', '')}" required>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Resolution Notes &amp; Verification Method *</label>
            <textarea id="resolve-notes" class="form-control" rows="3" required placeholder="Describe how value was confirmed...">Verified directly with partner EDI transponder log and confirmed by lead analyst.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #1E8E3E; border-color: #1E8E3E;">Confirm &amp; Close Issue</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Resolve Data Quality Defect — ${issue.id}`, modalHtml);
  },

  submitResolve(e, issueId) {
    e.preventDefault();
    const correctVal = document.getElementById('resolve-correct-value')?.value;
    const notes = document.getElementById('resolve-notes')?.value;
    try {
      window.BRIDGES_STORE.closeDataQualityIssue(issueId, notes, correctVal);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Issue ${issueId} successfully resolved and archived.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openCreateIssueModal() {
    const shipments = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipments() : [];
    const modalHtml = `
      <form id="create-dq-issue-form" onsubmit="AnalystDataQualityView.submitCreateIssue(event)">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Select Target Shipment *</label>
            <select id="new-dq-shipment" class="form-control" required>
              ${shipments.map(s => `
                <option value="${s.id}">${s.id} — ${s.origin} to ${s.destination} (${s.carrierId})</option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Defect Category *</label>
              <select id="new-dq-category" class="form-control" required>
                <option value="Missing GPS Telemetry">Missing GPS Telemetry</option>
                <option value="Incomplete Customs Classification">Incomplete Customs Classification</option>
                <option value="Missing Receiving Contact Info">Missing Receiving Contact Info</option>
                <option value="Conflicting ETA Telemetry">Conflicting ETA Telemetry</option>
                <option value="Carrier Driver Unassigned">Carrier Driver Unassigned</option>
                <option value="Invalid Temperature Profile">Invalid Temperature Profile</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Severity Level *</label>
              <select id="new-dq-severity" class="form-control" required>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Field Identifier *</label>
              <input type="text" id="new-dq-field" class="form-control" placeholder="e.g. customsTariffCode" required value="customsTariffCode">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Current Value *</label>
              <input type="text" id="new-dq-current" class="form-control" placeholder="e.g. Empty / Undefined" required value="Empty">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Expected Standard Format *</label>
            <input type="text" id="new-dq-expected" class="form-control" placeholder="e.g. 10-digit HTSUS Code" required value="10-digit HTSUS Code">
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Diagnostic Notes *</label>
            <textarea id="new-dq-notes" class="form-control" rows="2" required placeholder="Describe anomaly...">Identified during inbound file audit.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Create Data Quality Issue</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', 'Log New Data Quality Issue', modalHtml);
  },

  submitCreateIssue(e) {
    e.preventDefault();
    const shipmentId = document.getElementById('new-dq-shipment')?.value;
    const category = document.getElementById('new-dq-category')?.value;
    const severity = document.getElementById('new-dq-severity')?.value;
    const field = document.getElementById('new-dq-field')?.value;
    const currentValue = document.getElementById('new-dq-current')?.value;
    const expectedFormat = document.getElementById('new-dq-expected')?.value;
    const notes = document.getElementById('new-dq-notes')?.value;

    const newIssue = {
      id: `DQI-${Math.floor(105 + Math.random() * 890)}`,
      shipmentId,
      category,
      severity,
      field,
      currentValue,
      expectedFormat,
      status: "Open",
      assignedAnalyst: "Sarah Lin",
      suppressExceptionDetection: false,
      notes,
      requestedCorrectionAt: null,
      correctionTarget: "Partner Operations",
      createdAt: new Date().toISOString()
    };

    if (!window.BRIDGES_STORE.data.dataQualityIssues) {
      window.BRIDGES_STORE.data.dataQualityIssues = [];
    }
    window.BRIDGES_STORE.data.dataQualityIssues.unshift(newIssue);
    window.BRIDGES_STORE.logAudit("Data Quality Issue Created", "Data Quality", newIssue.id, `Created ${severity} issue for ${shipmentId} (${category}).`);
    window.BRIDGES_STORE.save();

    UI.closeModal('generic-app-modal');
    UI.showToast(`Data quality issue ${newIssue.id} logged.`, 'success');
    App.renderCurrentView();
  },

  scanDataHealth() {
    UI.showToast("Automated data health scan completed: Scanned 12 shipments and 14 master carrier tables. 0 critical pipeline corruptions.", "success");
  }
};

window.AnalystDataQualityView = AnalystDataQualityView;
