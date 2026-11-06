/**
 * BRIDGES Control Tower - Incident Escalation Management
 * Handles operational escalations to Operations Manager for:
 * - Non-responsive carrier tenders
 * - Critical SLA breaches (>2h threshold / penalty risk)
 * - Unresolved mechanical or cold-chain breakdowns
 * - Corridor infrastructure & carrier capacity exhaustion
 * Features target authority designation, category classification, notes, and decision deadline tracking.
 */

const DispatcherEscalationsView = {
  statusFilter: 'All',
  priorityFilter: 'All',

  render() {
    const escalations = window.BRIDGES_STORE.getEscalations({
      status: this.statusFilter,
      priority: this.priorityFilter
    });

    const activeCount = window.BRIDGES_STORE.getEscalations().filter(e => e.status !== 'Resolved').length;

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- TOP ALERT BANNER -->
        <div class="escalation-top-banner">
          <div class="escalation-banner-left">
            <div class="escalation-banner-icon">
              ${Icons.escalation(20)}
            </div>
            <div>
              <div class="escalation-banner-title">Operations Manager Escalation Console</div>
              <div class="escalation-banner-desc">
                Escalate high-impact deviations, unresolved cold-chain failures, and non-responsive carrier cases to Operations Management with mandatory reason, operational notes, and decision deadlines.
              </div>
            </div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="DispatcherEscalationsView.openCreateModal()" style="font-weight: 700; padding: 6px 14px; white-space: nowrap;">
            + File Escalation to Ops Manager
          </button>
        </div>

        <!-- FILTER & STATUS BAR -->
        <div class="panel" style="margin-bottom: 16px; padding: 12px 14px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--color-midnight);">
                Escalations Registry
              </span>
              <span class="badge ${activeCount > 0 ? 'badge-danger' : 'badge-success'}">
                ${activeCount} Active Escalations
              </span>
            </div>

            <div style="display: flex; gap: 8px;">
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherEscalationsView.setStatusFilter(this.value)">
                <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Open" ${this.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Under Review" ${this.statusFilter === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Escalated to Management" ${this.statusFilter === 'Escalated to Management' ? 'selected' : ''}>Escalated to Management</option>
                <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>

              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherEscalationsView.setPriorityFilter(this.value)">
                <option value="All" ${this.priorityFilter === 'All' ? 'selected' : ''}>All Priorities</option>
                <option value="Critical" ${this.priorityFilter === 'Critical' ? 'selected' : ''}>Critical Priority</option>
                <option value="High" ${this.priorityFilter === 'High' ? 'selected' : ''}>High Priority</option>
                <option value="Medium" ${this.priorityFilter === 'Medium' ? 'selected' : ''}>Medium Priority</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ESCALATIONS TABLE -->
        <div class="panel" style="padding: 0; overflow: hidden;">
          ${escalations.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
              <div class="empty-state-title">No Escalations Found</div>
              <div class="empty-state-sub">Zero records match current filter criteria.</div>
            </div>
          ` : `
            <div class="table-container" style="box-shadow: none; border: none; overflow-x: auto;">
              <table class="data-table" style="min-width: 1150px;">
                <thead>
                  <tr>
                    <th>Escalation ID</th>
                    <th>Linked Exception / Shipment</th>
                    <th>Target Authority</th>
                    <th>Category & Reason</th>
                    <th>Priority</th>
                    <th>Decision Deadline</th>
                    <th>Business Impact</th>
                    <th>Status</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${escalations.map(esc => {
                    const deadline = esc.decisionDeadline || 'Within 2 Hours (SLA Threatened)';
                    const targetManager = esc.assignedManager || 'David Kim (Regional Ops Manager)';
                    const isUrgent = esc.priority === 'Critical' || (esc.decisionDeadline && esc.decisionDeadline.includes('1 Hour'));

                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${esc.id}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${new Date(esc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div style="font-weight: 700; color: var(--color-royal-navy); font-size: 11.5px;">${esc.shipmentId}</div>
                          <div style="font-size: 10.5px; color: var(--color-charcoal);">${esc.exceptionId}</div>
                        </td>
                        <td>
                          <div style="font-size: 11px; font-weight: 700; color: #18217E;">${targetManager}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">By ${esc.escalatedBy || 'Transport Planner'}</div>
                        </td>
                        <td>
                          <div style="font-weight: 600; font-size: 11.5px; color: var(--color-midnight); max-width: 240px; white-space: normal;">
                            ${esc.escalationReason}
                          </div>
                          ${esc.category ? `
                            <div style="font-size: 10px; color: #424989; font-weight: 600; margin-top: 2px;">🏷️ ${esc.category}</div>
                          ` : ''}
                        </td>
                        <td>
                          <span class="priority-tag ${esc.priority === 'Critical' ? 'priority-critical' : esc.priority === 'High' ? 'priority-high' : 'priority-medium'}">
                            ${esc.priority}
                          </span>
                        </td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 4px;">
                            <span class="badge ${isUrgent ? 'badge-danger' : 'badge-warning'}" style="font-size: 10px; font-weight: 700;">
                              ⏳ ${deadline}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style="font-size: 11px; color: var(--color-deep-red); font-weight: 600; max-width: 170px; white-space: normal;">
                            ${esc.businessImpact}
                          </div>
                        </td>
                        <td>
                          <span class="badge ${esc.status === 'Resolved' ? 'badge-success' : esc.status === 'Escalated to Management' ? 'badge-danger' : 'badge-warning'}">
                            ${esc.status}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-sm" onclick="DispatcherEscalationsView.openDetailModal('${esc.id}')" style="padding: 4px 8px; font-weight: 600;">
                            View Details
                          </button>
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

  setStatusFilter(val) {
    this.statusFilter = val;
    App.renderCurrentView();
  },

  setPriorityFilter(val) {
    this.priorityFilter = val;
    App.renderCurrentView();
  },

  openCreateModal(prefillExcId = '', prefillShipId = '') {
    const exceptions = window.BRIDGES_STORE.getExceptions().filter(e => e.status !== 'Closed');

    const formHtml = `
      <div style="padding: 10px 0;">
        <form id="create-escalation-form" onsubmit="DispatcherEscalationsView.handleCreateSubmit(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="planning-form-group">
              <label class="planning-form-label">Linked Exception *</label>
              <select name="exceptionId" class="planning-select" required onchange="DispatcherEscalationsView.handleExceptionSelect(this.value)">
                <option value="">-- Choose exception to escalate --</option>
                ${exceptions.map(e => `
                  <option value="${e.id}" data-shipment="${e.shipmentId}" ${e.id === prefillExcId ? 'selected' : ''}>
                    ${e.id} (${e.shipmentId}) — ${e.reason} [${e.severity}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="planning-form-group">
              <label class="planning-form-label">Shipment Reference *</label>
              <input type="text" id="esc-form-shipment-id" name="shipmentId" class="planning-input" required readonly value="${prefillShipId || (exceptions[0] ? exceptions[0].shipmentId : '')}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="planning-form-group">
              <label class="planning-form-label">Target Authority (Operations Manager) *</label>
              <select name="assignedManager" class="planning-select" required>
                <option value="David Kim (Regional Operations Manager)" selected>David Kim (Regional Operations Manager)</option>
                <option value="Elena Rostova (Lead Control Tower Director)">Elena Rostova (Lead Control Tower Director)</option>
                <option value="Carlos Mendoza (Logistics Hub Supervisor)">Carlos Mendoza (Logistics Hub Supervisor)</option>
              </select>
            </div>

            <div class="planning-form-group">
              <label class="planning-form-label">Escalation Category *</label>
              <select name="category" class="planning-select" required>
                <option value="Non-Responsive Carrier Tender" selected>Non-Responsive Carrier Tender (No response >60m)</option>
                <option value="High-Impact SLA Penalty Threat">High-Impact SLA Penalty Threat (Breach >$10,000)</option>
                <option value="Unresolved Mechanical / Reefer Breakdown">Unresolved Mechanical / Reefer Breakdown</option>
                <option value="Regional Corridor Impasse / Choke Point">Regional Corridor Impasse / Choke Point</option>
                <option value="Customer Dissatisfaction & Critical Esc">Customer Dissatisfaction & Critical Esc</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="planning-form-group">
              <label class="planning-form-label">Priority Level *</label>
              <select name="priority" class="planning-select" required>
                <option value="Critical">Critical (Immediate Executive Action)</option>
                <option value="High" selected>High (Regional Management Review)</option>
                <option value="Medium">Medium (Operational Supervisor)</option>
              </select>
            </div>

            <div class="planning-form-group">
              <label class="planning-form-label">Decision Deadline *</label>
              <select name="decisionDeadline" class="planning-select" required>
                <option value="Within 1 Hour (Critical SLA Breach)">Within 1 Hour (Critical SLA Breach)</option>
                <option value="Within 2 Hours (Corridor Hold)" selected>Within 2 Hours (Corridor Hold)</option>
                <option value="Within 4 Hours (Shift Resolution)">Within 4 Hours (Shift Resolution)</option>
                <option value="End of Business Day (18:00)">End of Business Day (18:00)</option>
              </select>
            </div>
          </div>

          <div class="planning-form-group">
            <label class="planning-form-label">Escalation Summary & Operational Reason *</label>
            <input type="text" name="escalationReason" class="planning-input" required placeholder="e.g. Carrier has not acknowledged alternate dispatch request after 75 minutes; customer assembly line at risk.">
          </div>

          <div class="planning-form-group">
            <label class="planning-form-label">Estimated Financial & Business Impact *</label>
            <input type="text" name="businessImpact" class="planning-input" required placeholder="e.g. Tier 1 Critical Customer; $12,500 hourly assembly line downtime penalty.">
          </div>

          <div class="planning-form-group">
            <label class="planning-form-label">Actions Attempted by Dispatcher *</label>
            <textarea name="actionsAttempted" class="planning-textarea" required placeholder="Detail previous tender attempts, direct phone contact, alternate route calculations..."></textarea>
          </div>

          <div class="planning-form-group">
            <label class="planning-form-label">Specific Intervention Requested from Operations Manager *</label>
            <textarea name="requestedIntervention" class="planning-textarea" required placeholder="e.g. Authorize premium air cargo charter expenditure ($8,500) or invoke emergency carrier master contract clause."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--color-light-blue-grey);">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-danger btn-sm" style="font-weight: 700;">Submit to Operations Manager</button>
          </div>
        </form>
      </div>
    `;

    UI.openModal('generic-app-modal', 'Escalate Incident to Operations Manager', formHtml);
  },

  handleExceptionSelect(excId) {
    const exc = window.BRIDGES_STORE.getException(excId);
    const shipInput = document.getElementById('esc-form-shipment-id');
    if (exc && shipInput) {
      shipInput.value = exc.shipmentId;
    }
  },

  handleCreateSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const user = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser ? window.BRIDGES_AUTH.getCurrentUser() : null;

    try {
      const created = window.BRIDGES_STORE.createEscalation({
        exceptionId: form.exceptionId.value,
        shipmentId: form.shipmentId.value,
        escalationReason: form.escalationReason.value,
        businessImpact: form.businessImpact.value,
        priority: form.priority.value,
        currentRecoveryStatus: 'Escalated to Operations Manager',
        actionsAttempted: form.actionsAttempted.value,
        requestedIntervention: form.requestedIntervention.value,
        assignedManager: form.assignedManager.value,
        category: form.category.value,
        decisionDeadline: form.decisionDeadline.value,
        escalatedBy: user ? `${user.name} (${user.role})` : 'Marcus Vance (Dispatcher)'
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Escalation ${created.id} forwarded to ${form.assignedManager.value}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openDetailModal(escalationId) {
    const esc = window.BRIDGES_STORE.getEscalation(escalationId);
    if (!esc) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--color-light-blue-grey);">
          <div>
            <div style="font-weight: 800; font-size: 15px; color: var(--color-midnight);">${esc.id}</div>
            <div style="font-size: 11.5px; color: var(--color-muted-sage);">
              Linked: <strong>${esc.exceptionId}</strong> (${esc.shipmentId}) · Escalated by ${esc.escalatedBy || 'Dispatcher'}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <span class="priority-tag ${esc.priority === 'Critical' ? 'priority-critical' : 'priority-high'}">
              ${esc.priority} Priority
            </span>
            <span class="badge badge-warning" style="font-weight: 700;">
              ⏳ ${esc.decisionDeadline || 'Within 2 Hours'}
            </span>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-charcoal); margin-bottom: 2px;">TARGET AUTHORITY &amp; CATEGORY</div>
          <div style="font-size: 12.5px; font-weight: 700; color: #18217E;">${esc.assignedManager || 'David Kim (Regional Operations Manager)'}</div>
          <div style="font-size: 11px; color: #424989;">Category: ${esc.category || 'High-Impact SLA Threat'}</div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-charcoal); margin-bottom: 2px;">OPERATIONAL REASON</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight);">${esc.escalationReason}</div>
        </div>

        <div style="background: #FDF4F4; border: 1px solid rgba(234, 52, 31, 0.2); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px;">
          <strong style="color: var(--color-deep-red);">Business & Financial Impact:</strong>
          <div style="color: var(--color-midnight); margin-top: 2px;">${esc.businessImpact}</div>
        </div>

        <div class="meta-kv-grid" style="margin-bottom: 14px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Current Status</span>
            <span class="meta-kv-value">${UI.renderStatusBadge(esc.status)}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Decision Deadline</span>
            <span class="meta-kv-value" style="color: #EA341F; font-weight: 800;">${esc.decisionDeadline || 'Within 2 Hours'}</span>
          </div>
          <div class="meta-kv-item" style="grid-column: span 2;">
            <span class="meta-kv-label">Actions Attempted by Dispatcher</span>
            <span class="meta-kv-value" style="font-weight: normal; color: var(--color-charcoal);">${esc.actionsAttempted || 'Tender issued; carrier telephone follow-up logged.'}</span>
          </div>
          <div class="meta-kv-item" style="grid-column: span 2;">
            <span class="meta-kv-label">Requested Manager Intervention</span>
            <span class="meta-kv-value" style="font-weight: 700; color: var(--color-midnight);">${esc.requestedIntervention || 'Executive budget authorization.'}</span>
          </div>
        </div>

        <!-- Timeline -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--color-midnight); margin-bottom: 6px;">Escalation Audit Timeline</div>
          <div class="timeline-stream">
            ${(esc.timeline || []).map(t => `
              <div class="timeline-node">
                <div class="timeline-node-dot"></div>
                <div class="timeline-node-content">
                  <div class="timeline-node-header">
                    <span class="timeline-node-author">${t.author || 'System'}</span>
                    <span class="timeline-node-time">${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div class="timeline-node-text">${t.note || t.action}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Operational Status Update Form -->
        ${esc.status !== 'Resolved' ? `
          <div style="background: #F8FAFB; border: 1px solid var(--color-light-blue-grey); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--color-charcoal); margin-bottom: 6px;">Update Escalation Decision</div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="DispatcherEscalationsView.updateStatus('${esc.id}', 'Under Review', 'Operations Manager reviewing carrier non-response and alternative air charter.')">
                Mark Under Review
              </button>
              <button class="btn btn-secondary btn-sm" onclick="DispatcherEscalationsView.updateStatus('${esc.id}', 'Escalated to Management', 'Forwarded to Regional VP Operations for emergency financial clearance.')">
                Escalate to Management
              </button>
              <button class="btn btn-primary btn-sm" onclick="DispatcherEscalationsView.updateStatus('${esc.id}', 'Resolved', 'Operations Manager approved emergency recovery budget. Dispatched alternate fleet.')">
                Resolve Escalation
              </button>
            </div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Escalation Dossier — ${esc.id}`, modalHtml);
  },

  updateStatus(id, newStatus, note) {
    try {
      window.BRIDGES_STORE.updateEscalationStatus(id, newStatus, note);
      UI.showToast(`Escalation ${id} updated to ${newStatus}.`, 'success');
      this.openDetailModal(id);
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.DispatcherEscalationsView = DispatcherEscalationsView;
