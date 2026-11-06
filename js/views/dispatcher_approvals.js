/**
 * BRIDGES Control Tower - Exception Approvals & Decision Overrides Console
 * Fulfills Dispatcher / Transport Planner Requirements 6 & 8:
 * - Exception Approvals: View escalated high-severity exceptions with business/financial impact
 *   and AI recommendation; approve, reject, or request more information before recovery execution.
 * - Decision Overrides: Override severity/priority where authorized, set approval conditions,
 *   and view complete permanent approval audit history.
 */

const DispatcherApprovalsView = {
  activeTab: 'approvals', // 'approvals' | 'overrides' | 'audit'
  statusFilter: 'All',

  render() {
    const approvals = window.BRIDGES_STORE.getExceptionApprovals(this.statusFilter);
    const allApprovals = window.BRIDGES_STORE.getExceptionApprovals('All');
    const pendingCount = allApprovals.filter(a => a.status === 'Pending Approval').length;
    const auditHistory = window.BRIDGES_STORE.getApprovalAuditHistory();
    const exceptions = window.BRIDGES_STORE.getExceptions();

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER & BREADCRUMB -->
        <div class="page-action-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Exception Approvals &amp; Decision Overrides</h2>
              <span class="badge ${pendingCount > 0 ? 'badge-danger' : 'badge-success'}">${pendingCount} Pending Approval</span>
              <span class="badge badge-secondary">${auditHistory.length} Audit Records</span>
            </div>
            <p class="page-subheading">
              Operational governance console: evaluate high-severity recovery proposals with financial impact and AI recommendations, approve/reject execution, set conditions, override severity/priority, and review permanent audit history.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_queue')">
              Exception Queue
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_planning')">
              Recovery Planning
            </button>
          </div>
        </div>

        <!-- NAVIGATION TABS -->
        <div class="panel" style="margin-bottom: 16px; padding: 8px 12px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 6px;">
              <button class="btn ${this.activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                      onclick="DispatcherApprovalsView.switchTab('approvals')"
                      style="font-size: 11.5px; font-weight: 700; padding: 5px 14px;">
                📋 Exception Approvals Queue (${pendingCount})
              </button>
              <button class="btn ${this.activeTab === 'overrides' ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                      onclick="DispatcherApprovalsView.switchTab('overrides')"
                      style="font-size: 11.5px; font-weight: 700; padding: 5px 14px;">
                ⚡ Decision Overrides &amp; Conditions
              </button>
              <button class="btn ${this.activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                      onclick="DispatcherApprovalsView.switchTab('audit')"
                      style="font-size: 11.5px; font-weight: 700; padding: 5px 14px;">
                📜 Approval &amp; Override Audit History (${auditHistory.length})
              </button>
            </div>

            ${this.activeTab === 'approvals' ? `
              <div style="display: flex; gap: 6px; align-items: center;">
                <label style="font-size: 11px; color: #64748B; font-weight: 600;">Status:</label>
                <select class="planning-select" style="padding: 4px 8px; font-size: 11px;" onchange="DispatcherApprovalsView.setStatusFilter(this.value)">
                  <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Proposals</option>
                  <option value="Pending Approval" ${this.statusFilter === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
                  <option value="Approved" ${this.statusFilter === 'Approved' ? 'selected' : ''}>Approved</option>
                  <option value="Rejected" ${this.statusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
                  <option value="Info Requested" ${this.statusFilter === 'Info Requested' ? 'selected' : ''}>Info Requested</option>
                </select>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- TAB CONTENT -->
        ${this.activeTab === 'approvals' ? this.renderApprovalsTab(approvals) : ''}
        ${this.activeTab === 'overrides' ? this.renderOverridesTab(exceptions) : ''}
        ${this.activeTab === 'audit' ? this.renderAuditTab(auditHistory) : ''}
      </div>
    `;
  },

  renderApprovalsTab(approvals) {
    if (approvals.length === 0) {
      return `
        <div class="panel">
          <div class="analyst-empty-state">
            <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
            <div class="empty-state-title">No Exception Approvals in this State</div>
            <div class="empty-state-sub">Zero recovery proposals match filter "${this.statusFilter}".</div>
          </div>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${approvals.map(app => {
          const isPending = app.status === 'Pending Approval';
          const isApproved = app.status === 'Approved';
          const isRejected = app.status === 'Rejected';
          const isInfo = app.status === 'Info Requested';

          return `
            <div class="panel" style="padding: 16px 18px; border-left: 4px solid ${isPending ? '#EA341F' : isApproved ? '#1E8E3E' : isRejected ? '#8C2527' : '#F59E0B'};">
              <!-- Top Header Bar -->
              <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #E5EBEE; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 15px; font-weight: 800; color: #18217E;">${app.id}</span>
                  <span style="font-size: 12px; font-weight: 700; color: #070724;">Exception: ${app.exceptionId} (${app.shipmentId})</span>
                  <span class="severity-badge ${app.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">${app.severity} · ${app.priority}</span>
                  <span class="badge ${isPending ? 'badge-danger' : isApproved ? 'badge-success' : isRejected ? 'badge-secondary' : 'badge-warning'}">
                    ${app.status}
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 11px; color: #92400E; background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 4px; padding: 2px 8px; font-weight: 600;">
                    ⏳ Deadline: ${new Date(app.decisionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  ${isPending ? `
                    <button class="btn btn-primary btn-sm" onclick="DispatcherApprovalsView.openApproveModal('${app.id}')" style="background: #1E8E3E; font-weight: 700; padding: 4px 10px;">
                      ✓ Approve Execution
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="DispatcherApprovalsView.openRejectModal('${app.id}')" style="font-weight: 700; padding: 4px 10px;">
                      ✕ Reject
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="DispatcherApprovalsView.openInfoModal('${app.id}')" style="font-weight: 600; padding: 4px 10px;">
                      💬 Request More Info
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" onclick="DispatcherApprovalsView.openInspectApprovalModal('${app.id}')" style="font-weight: 600; padding: 4px 10px;">
                      Inspect Dossier
                    </button>
                  `}
                </div>
              </div>

              <!-- Deviation Reason & Business Impact Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <!-- Left: Deviation & Customer Context -->
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; font-size: 11.5px;">
                  <div style="font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Deviation &amp; Cargo Impact</div>
                  <div style="font-size: 12.5px; font-weight: 700; color: #070724; margin-bottom: 4px;">${app.deviationReason}</div>
                  <div><strong>Customer:</strong> ${app.customerName}</div>
                  <div><strong>Cargo:</strong> ${app.cargoDescription}</div>
                  <div><strong>Proposed Recovery:</strong> <strong style="color: #18217E;">${app.proposedStrategy}</strong> (${app.proposedCarrier})</div>
                  <div style="margin-top: 6px; font-size: 10.5px; color: #64748B;">Submitted by: <strong>${app.submittedBy}</strong> · ${new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <!-- Right: Financial Impact & AI Recommendation -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="background: #FFF5F5; border: 1px solid rgba(234, 52, 31, 0.25); border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
                    <div style="font-size: 10.5px; font-weight: 700; color: #8C2527; text-transform: uppercase; margin-bottom: 2px;">Business &amp; Financial Impact</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span>Recovery Cost Exposure:</span>
                      <strong style="color: #EA341F;">${app.financialImpact}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>Potential SLA Penalty Risk:</span>
                      <strong style="color: #8C2527;">${app.penaltyRisk}</strong>
                    </div>
                  </div>

                  <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
                    <div style="font-size: 10.5px; font-weight: 700; color: #18217E; text-transform: uppercase; margin-bottom: 2px;">🤖 AI Recommendation &amp; Explainability</div>
                    <div style="color: #070724; font-weight: 600;">${app.aiRecommendation}</div>
                    <div style="margin-top: 4px; display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; color: #424989;">
                      <span>Confidence Score: <strong>${app.aiConfidence}</strong></span>
                      <span class="badge badge-success" style="font-size: 9.5px;">Feasible &amp; Validated</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Conditional Requirements or Notes -->
              ${app.approvalConditions && app.approvalConditions.length > 0 ? `
                <div style="background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 6px; padding: 8px 12px; font-size: 11.5px; color: #92400E;">
                  <strong>Approval Conditions:</strong> ${app.approvalConditions.join(' · ')}
                </div>
              ` : ''}

              ${app.decisionNotes ? `
                <div style="margin-top: 6px; font-size: 11.5px; color: #18217E;">
                  <strong>Decided by ${app.decidedBy || 'Manager'}:</strong> ${app.decisionNotes}
                </div>
              ` : ''}

              ${app.rejectionReason ? `
                <div style="margin-top: 6px; font-size: 11.5px; color: #EA341F;">
                  <strong>Rejection Justification:</strong> ${app.rejectionReason}
                </div>
              ` : ''}

              ${app.inquiry ? `
                <div style="margin-top: 6px; font-size: 11.5px; color: #D97706;">
                  <strong>Manager Inquiry:</strong> ${app.inquiry}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderOverridesTab(exceptions) {
    const actionable = exceptions.filter(e => e.status !== 'Closed');

    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <!-- Left: Decision Override Form -->
        <div class="panel" style="padding: 16px 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
            <div style="font-size: 14px; font-weight: 800; color: #18217E;">⚡ Authorized Decision Override Console</div>
            <span class="badge badge-warning" style="font-size: 10px;">Manager Override Authorized</span>
          </div>

          <p style="font-size: 11.5px; color: #64748B; margin-bottom: 14px;">
            Override exception severity or operational priority where authorized by control-tower policies. Attach mandatory audit justification and set explicit compliance conditions.
          </p>

          <form id="decision-override-form" onsubmit="DispatcherApprovalsView.handleOverrideSubmit(event)">
            <div class="planning-form-group">
              <label class="planning-form-label">Select Exception to Override *</label>
              <select id="override-exception-select" class="planning-select" required onchange="DispatcherApprovalsView.handleOverrideExceptionChange(this.value)">
                <option value="">-- Choose exception record --</option>
                ${actionable.map(e => `
                  <option value="${e.id}" data-sev="${e.severity}" data-pri="${e.priority || 'P2'}">
                    ${e.id} (${e.shipmentId}) — ${e.reason} [Current: ${e.severity} / ${e.priority || 'P2'}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="planning-form-group">
                <label class="planning-form-label">Target Severity *</label>
                <select id="override-target-severity" class="planning-select" required>
                  <option value="Critical">Critical (Immediate Line Stop)</option>
                  <option value="High">High (Impending SLA Threat)</option>
                  <option value="Medium" selected>Medium (Standard Transit Deviation)</option>
                  <option value="Low">Low (Informational / Absorbed)</option>
                </select>
              </div>

              <div class="planning-form-group">
                <label class="planning-form-label">Target Priority Tier *</label>
                <select id="override-target-priority" class="planning-select" required>
                  <option value="P1">P1 (Immediate Executive Action)</option>
                  <option value="P2" selected>P2 (Lead Dispatcher Handling)</option>
                  <option value="P3">P3 (Routine Workflow)</option>
                </select>
              </div>
            </div>

            <div class="planning-form-group">
              <label class="planning-form-label">Mandatory Override Justification / Rationale *</label>
              <textarea id="override-rationale" class="planning-textarea" required placeholder="State exact operational basis (e.g. driver hours reset completed early; customer granted 2h grace window; verified alternate reefer telemetry)..."></textarea>
            </div>

            <!-- Approval Conditions Builder -->
            <div class="planning-form-group">
              <label class="planning-form-label">Set Mandatory Approval Conditions (Check all that apply):</label>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 12px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="cond" value="Continuous GPS Waypoint Ping (Every 15 min)" checked>
                  Continuous GPS Waypoint Ping (Every 15 min)
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="cond" value="Hourly Reefer Sensor Calibration Check" checked>
                  Hourly Reefer Sensor Calibration Check (Cold Chain)
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="cond" value="Customer Service Proactive Delay Communication">
                  Customer Service Proactive Delay Communication
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="cond" value="Immediate Re-Escalation if delay exceeds 90 minutes">
                  Immediate Re-Escalation if delay exceeds 90 minutes
                </label>
                <div style="margin-top: 4px;">
                  <input type="text" id="override-custom-cond" class="planning-input" placeholder="Add custom condition (optional)..." style="font-size: 11px;">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
              <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E; padding: 6px 14px;">
                Apply Decision Override
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Governance Guidelines & Context -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="panel" style="padding: 16px 18px;">
            <div style="font-size: 13px; font-weight: 800; color: #070724; margin-bottom: 8px;">
              Governance Rules for Decision Overrides
            </div>
            <ul style="font-size: 11.5px; color: #393A50; line-height: 1.5; padding-left: 18px; margin: 0 0 12px 0;">
              <li><strong>P1 / Critical Overrides:</strong> Permitted only with written dispatcher rationale and verified telemetric backing.</li>
              <li><strong>Financial Threshold:</strong> Recovery costs exceeding $10,000 require Regional Operations Manager signoff.</li>
              <li><strong>Audit Immutability:</strong> All overrides are committed to the permanent control-tower audit trail with actor name, timestamp, and conditions.</li>
              <li><strong>Condition Verification:</strong> Checked conditions are automatically monitored by the background telemetry engine.</li>
            </ul>
            <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.15); border-radius: 6px; padding: 10px 12px; font-size: 11px; color: #18217E;">
              💡 Overriding an exception's severity or priority automatically propagates to all linked transport planning and carrier scheduling views in real time.
            </div>
          </div>

          <div class="panel" style="padding: 16px 18px;">
            <div style="font-size: 13px; font-weight: 800; color: #070724; margin-bottom: 8px;">
              Recent Override Snapshot
            </div>
            <div style="font-size: 11.5px; color: #64748B;">
              Switch to the <strong>Approval &amp; Override Audit History</strong> tab to inspect all previous decisions.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderAuditTab(auditHistory) {
    if (auditHistory.length === 0) {
      return `
        <div class="panel">
          <div class="analyst-empty-state">
            <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
            <div class="empty-state-title">No Audit Records Found</div>
            <div class="empty-state-sub">Zero approval actions or decision overrides logged yet.</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="panel" style="padding: 0; overflow: hidden;">
        <div class="table-container" style="box-shadow: none; border: none; overflow-x: auto;">
          <table class="data-table" style="min-width: 1100px;">
            <thead>
              <tr>
                <th>Audit ID &amp; Time</th>
                <th>Action Type</th>
                <th>Linked Exception / Shipment</th>
                <th>Authorized Actor</th>
                <th>State Transition (Old → New)</th>
                <th>Approval Conditions</th>
                <th>Justification &amp; Rationale</th>
              </tr>
            </thead>
            <tbody>
              ${auditHistory.map(aud => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #070724; font-size: 12px;">${aud.id}</div>
                    <div style="font-size: 10px; color: #64748B;">${new Date(aud.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                  </td>
                  <td>
                    <span class="badge ${aud.action.includes('Approved') ? 'badge-success' : aud.action.includes('Rejected') ? 'badge-danger' : 'badge-primary'}" style="font-weight: 700;">
                      ${aud.action}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #18217E; font-size: 11.5px;">${aud.shipmentId || 'N/A'}</div>
                    <div style="font-size: 10px; color: #64748B;">${aud.exceptionId || ''}</div>
                  </td>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #070724;">${aud.authorizedBy}</div>
                  </td>
                  <td>
                    <div style="font-size: 11px; color: #393A50;">${aud.previousValue}</div>
                    <div style="font-size: 10.5px; font-weight: 700; color: #18217E;">&rarr; ${aud.newValue}</div>
                  </td>
                  <td>
                    ${aud.conditions && aud.conditions.length > 0 ? `
                      <div style="font-size: 10.5px; color: #070724; max-width: 220px; white-space: normal;">
                        ${aud.conditions.map(c => `<span class="badge badge-secondary" style="font-size: 9.5px; margin: 1px;">${c}</span>`).join('')}
                      </div>
                    ` : `
                      <span style="font-size: 10.5px; color: #94A3B8; font-style: italic;">None Attached</span>
                    `}
                  </td>
                  <td>
                    <div style="font-size: 10.5px; color: #393A50; max-width: 260px; white-space: normal; line-height: 1.35;">
                      ${aud.rationale}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    App.renderCurrentView();
  },

  setStatusFilter(val) {
    this.statusFilter = val;
    App.renderCurrentView();
  },

  handleOverrideExceptionChange(excId) {
    const sel = document.getElementById('override-exception-select');
    if (!sel) return;
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.dataset) {
      const sevSelect = document.getElementById('override-target-severity');
      const priSelect = document.getElementById('override-target-priority');
      if (sevSelect && opt.dataset.sev) sevSelect.value = opt.dataset.sev;
      if (priSelect && opt.dataset.pri) priSelect.value = opt.dataset.pri;
    }
  },

  handleOverrideSubmit(e) {
    e.preventDefault();
    const excId = document.getElementById('override-exception-select')?.value;
    const newSeverity = document.getElementById('override-target-severity')?.value;
    const newPriority = document.getElementById('override-target-priority')?.value;
    const rationale = document.getElementById('override-rationale')?.value;

    if (!excId) {
      UI.showToast("Please choose an exception to override.", "error");
      return;
    }

    const checkboxes = document.querySelectorAll('input[name="cond"]:checked');
    const conditions = Array.from(checkboxes).map(cb => cb.value);
    const customCond = document.getElementById('override-custom-cond')?.value;
    if (customCond && customCond.trim()) {
      conditions.push(customCond.trim());
    }

    try {
      window.BRIDGES_STORE.overrideDecision(excId, {
        newSeverity,
        newPriority,
        overrideReason: rationale,
        approvalConditions: conditions
      });
      UI.showToast(`Decision override successfully applied to ${excId}.`, 'success');
      this.activeTab = 'audit';
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openApproveModal(approvalId) {
    const app = window.BRIDGES_STORE.getExceptionApproval(approvalId);
    if (!app) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 12px;">
          Approve operational recovery execution for <strong>${app.id}</strong> (${app.shipmentId} / ${app.proposedStrategy}):
        </div>

        <div style="background: rgba(30, 142, 62, 0.08); border: 1px solid rgba(30, 142, 62, 0.25); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px;">
          <div><strong>Financial Exposure:</strong> ${app.financialImpact}</div>
          <div><strong>AI Recommendation:</strong> ${app.aiRecommendation}</div>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Approval Conditions (Select applicable):</label>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 12px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="cond-1" value="Maximum budget capped at $2,000 surcharge" checked>
              Maximum budget capped at $2,000 surcharge
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="cond-2" value="Hourly temperature sensor telemetry verification" checked>
              Hourly temperature sensor telemetry verification
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="cond-3" value="Customer Service notified of revised delivery schedule">
              Customer Service notified of revised delivery schedule
            </label>
          </div>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Approval Authorization Notes *</label>
          <input type="text" id="approve-notes" class="planning-input" value="Authorized for immediate fleet dispatch per AI recommendation.">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherApprovalsView.applyApprove('${app.id}')" style="background: #1E8E3E; font-weight: 700;">
            ✓ Confirm Approval &amp; Authorize Execution
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Approve Recovery Proposal — ${app.id}`, modalHtml);
  },

  applyApprove(approvalId) {
    const notes = document.getElementById('approve-notes')?.value;
    const conds = [];
    if (document.getElementById('cond-1')?.checked) conds.push(document.getElementById('cond-1').value);
    if (document.getElementById('cond-2')?.checked) conds.push(document.getElementById('cond-2').value);
    if (document.getElementById('cond-3')?.checked) conds.push(document.getElementById('cond-3').value);

    try {
      window.BRIDGES_STORE.approveExceptionExecution(approvalId, notes, conds);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery proposal ${approvalId} approved for execution.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openRejectModal(approvalId) {
    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 12px;">
          Provide rejection rationale for proposal <strong>${approvalId}</strong>:
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Rejection Justification *</label>
          <textarea id="reject-reason" class="planning-textarea" required placeholder="State exact rationale (e.g. proposed premium air bridge cost exceeds value threshold; wait-and-monitor preferred)...">Proposed recovery cost exceeds authorized emergency operating margin. Recommended fallback to Wait-and-Monitor.</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-danger btn-sm" onclick="DispatcherApprovalsView.applyReject('${approvalId}')" style="font-weight: 700;">
            ✕ Confirm Rejection
          </button>
        </div>
      </div>
    `;
    UI.openModal('generic-app-modal', `Reject Recovery Proposal — ${approvalId}`, modalHtml);
  },

  applyReject(approvalId) {
    const reason = document.getElementById('reject-reason')?.value;
    try {
      window.BRIDGES_STORE.rejectExceptionProposal(approvalId, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Proposal ${approvalId} rejected.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openInfoModal(approvalId) {
    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 12px;">
          Request more information from transport planner for <strong>${approvalId}</strong>:
        </div>
        <div class="planning-form-group">
          <label class="planning-form-label">Inquiry Details *</label>
          <textarea id="info-inquiry" class="planning-textarea" required placeholder="Specify what evidence, telematic verification, or alternative carrier quote is needed...">Please verify secondary reefer unit diagnostics and confirm whether Falcon Express has confirmed standby tractor availability.</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherApprovalsView.applyInfo('${approvalId}')" style="font-weight: 700;">
            Transmit Inquiry
          </button>
        </div>
      </div>
    `;
    UI.openModal('generic-app-modal', `Request Information — ${approvalId}`, modalHtml);
  },

  applyInfo(approvalId) {
    const inquiry = document.getElementById('info-inquiry')?.value;
    try {
      window.BRIDGES_STORE.requestMoreInfoForApproval(approvalId, inquiry);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Information requested for proposal ${approvalId}.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openInspectApprovalModal(approvalId) {
    const app = window.BRIDGES_STORE.getExceptionApproval(approvalId);
    if (!app) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #18217E;">${app.id} — Proposal Dossier</div>
            <div style="font-size: 11.5px; color: #64748B;">Linked Exception: <strong>${app.exceptionId}</strong> (${app.shipmentId})</div>
          </div>
          <span class="badge ${app.status === 'Approved' ? 'badge-success' : app.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}">${app.status}</span>
        </div>

        <div class="meta-kv-grid" style="margin-bottom: 12px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Customer</span>
            <span class="meta-kv-value">${app.customerName}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Cargo</span>
            <span class="meta-kv-value">${app.cargoDescription}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Proposed Strategy</span>
            <span class="meta-kv-value" style="font-weight: 700; color: #18217E;">${app.proposedStrategy}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Financial Exposure</span>
            <span class="meta-kv-value" style="font-weight: 700; color: #EA341F;">${app.financialImpact}</span>
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px;">
          <div style="font-weight: 700; color: #18217E; margin-bottom: 4px;">AI Recommendation</div>
          <div>${app.aiRecommendation}</div>
        </div>

        ${app.approvalConditions && app.approvalConditions.length > 0 ? `
          <div style="background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px; color: #92400E;">
            <div style="font-weight: 700; margin-bottom: 4px;">Approval Conditions</div>
            <div>${app.approvalConditions.join(' · ')}</div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Approval Dossier — ${app.id}`, modalHtml);
  }
};

window.DispatcherApprovalsView = DispatcherApprovalsView;
