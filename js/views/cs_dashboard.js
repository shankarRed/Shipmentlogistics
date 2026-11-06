/**
 * BRIDGES Control Tower - Customer Service Dashboard View
 * Phase 6: Real-time customer communication oversight, approved ETA tracking,
 * and operational escalation status.
 */

window.CSDashboardView = {
  render() {
    const store = window.BRIDGES_STORE;
    const metrics = store.getCSMetrics();
    const shipments = store.getShipments();
    const communications = store.getCommunications();
    const escalations = (store.getEscalations ? store.getEscalations() : []).filter(e => e.status !== 'Resolved');
    const alerts = store.getCustomerServiceAlerts ? store.getCustomerServiceAlerts() : { failedComms: [], slaDelays: [], complaints: [] };
    const failedCount = alerts.failedComms ? alerts.failedComms.length : 0;
    const complaintCount = alerts.complaints ? alerts.complaints.length : 0;

    // 1. Priority Customer Updates: Shipments needing communication, sorted by urgency
    const priorityUpdates = shipments.filter(s => {
      return s.customerUpdateStatus === 'Action Required' || 
             s.slaRisk === 'Critical SLA Breach' || 
             s.slaRisk === 'High Risk' ||
             s.etaApprovalStatus === 'Pending Review';
    }).sort((a, b) => {
      // Critical SLA Breach first, then Action Required
      const score = (s) => (s.slaRisk === 'Critical SLA Breach' ? 30 : 0) + 
                           (s.customerUpdateStatus === 'Action Required' ? 20 : 0) + 
                           (s.severity === 'Critical' ? 10 : 0);
      return score(b) - score(a);
    }).slice(0, 5);

    // 2. Recent ETA Changes
    const recentETAChanges = shipments.filter(s => s.proposedETA || s.etaApprovalStatus === 'Pending Review' || s.lastOperationalUpdate)
      .slice(0, 5);

    // 3. Recent Communications
    const recentComms = [...communications].reverse().slice(0, 5);

    // 4. Open Escalations
    const openEscalations = escalations.slice(0, 5);

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BANNER / HEADER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Customer Service Console
              </span>
              <span class="cs-user-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Clara Hughes (USR-106) &bull; Senior Customer Care Specialist
              </span>
              <span class="cs-safety-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Customer-Safe Gateway Verified
              </span>
            </div>
            <h1 class="cs-banner-title">Customer Communication & Exception Control</h1>
            <p class="cs-banner-subtitle">
              Live customer notification dispatch, approved ETA alignment, communication queue management, and operational escalations.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-sm" style="background: rgba(24, 33, 126, 0.08); color: #18217E; border: 1px solid rgba(24, 33, 126, 0.25); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px;" onclick="App.navigateTo('cs_ai_assistant')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('cs_queue')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Communication Queue (${metrics.customersRequiringUpdates})
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('cs_compose')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Draft Customer Update
            </button>
          </div>
        </div>

        ${(failedCount > 0 || complaintCount > 0) ? `
          <!-- ACTIVE DISRUPTION & OUTREACH ALERTS -->
          <div class="cs-alert-strip-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px;">
            ${failedCount > 0 ? `
              <div style="background: #FEF2F2; border: 1px solid rgba(234, 52, 31, 0.25); border-left: 4px solid #EA341F; border-radius: 6px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #EA341F; display: flex;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </span>
                  <span style="font-size: 13px; color: #1E293B;">
                    <strong>Customer Notification Delivery Alert:</strong> ${failedCount} automated customer notifications failed (carrier timeouts/errors).
                  </span>
                </div>
                <button class="btn btn-xs" style="background: #EA341F; color: #fff; font-weight: 700; border: none; white-space: nowrap;" onclick="App.navigateTo('cs_history')">
                  Review & Retry in History &rarr;
                </button>
              </div>
            ` : ''}

            ${complaintCount > 0 ? `
              <div style="background: #FFFBEB; border: 1px solid rgba(217, 119, 6, 0.25); border-left: 4px solid #D97706; border-radius: 6px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #D97706; display: flex;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </span>
                  <span style="font-size: 13px; color: #1E293B;">
                    <strong>Customer Complaints Active:</strong> ${complaintCount} customer complaint(s) escalated to Operations for priority resolution.
                  </span>
                </div>
                <button class="btn btn-xs btn-outline" style="white-space: nowrap;" onclick="App.navigateTo('cs_escalations')">
                  View Complaints &rarr;
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- 6 COMPACT KPI CARDS -->
        <div class="cs-kpi-grid">
          <!-- 1. Open Exceptions -->
          <div class="cs-kpi-card" onclick="App.navigateTo('cs_shipments')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">Open Exceptions</span>
              <span class="cs-kpi-icon" style="color: #EA341F; background: rgba(234, 52, 31, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #EA341F;">${metrics.openExceptions}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Active disruptions monitored</span>
            </div>
          </div>

          <!-- 2. Customers Requiring Updates -->
          <div class="cs-kpi-card cs-kpi-alert" onclick="App.navigateTo('cs_queue')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">Updates Required</span>
              <span class="cs-kpi-icon" style="color: #8C2527; background: rgba(140, 37, 39, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #8C2527;">${metrics.customersRequiringUpdates}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Outreach action pending</span>
            </div>
          </div>

          <!-- 3. ETA Changes Requiring Review -->
          <div class="cs-kpi-card" onclick="App.navigateTo('cs_shipments')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">ETA Review Pending</span>
              <span class="cs-kpi-icon" style="color: #D97706; background: rgba(217, 119, 6, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #D97706;">${metrics.etaChangesRequiringReview}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Ops review pending</span>
            </div>
          </div>

          <!-- 4. SLA-at-Risk Shipments -->
          <div class="cs-kpi-card" onclick="App.navigateTo('cs_shipments')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">SLA At Risk</span>
              <span class="cs-kpi-icon" style="color: #EA341F; background: rgba(234, 52, 31, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 2v20"/>
                  <path d="m17 5-5-3-5 3"/>
                  <path d="m17 19-5 3-5-3"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #EA341F;">${metrics.slaAtRiskShipments}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Commitment jeopardy</span>
            </div>
          </div>

          <!-- 5. Messages Awaiting Review -->
          <div class="cs-kpi-card" onclick="App.navigateTo('cs_history')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">Drafts in Review</span>
              <span class="cs-kpi-icon" style="color: #424989; background: rgba(66, 73, 137, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #424989;">${metrics.messagesAwaitingReview}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Drafted communications</span>
            </div>
          </div>

          <!-- 6. Messages Sent Today -->
          <div class="cs-kpi-card" onclick="App.navigateTo('cs_history')">
            <div class="cs-kpi-header">
              <span class="cs-kpi-label">Messages Sent Today</span>
              <span class="cs-kpi-icon" style="color: #10B981; background: rgba(16, 185, 129, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </span>
            </div>
            <div class="cs-kpi-value" style="color: #10B981;">${metrics.messagesSentToday}</div>
            <div class="cs-kpi-footer">
              <span class="cs-kpi-sub">Simulated customer alerts</span>
            </div>
          </div>
        </div>

        <!-- 4 MAIN OPERATIONAL SECTIONS (2x2 Grid) -->
        <div class="cs-dashboard-grid">
          <!-- 1. PRIORITY CUSTOMER UPDATES -->
          <div class="cs-card">
            <div class="cs-card-header">
              <div class="cs-card-title-group">
                <span class="cs-card-icon" style="color: #EA341F;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cs-card-title">Priority Customer Updates</h3>
                  <p class="cs-card-subtitle">Shipments requiring proactive customer notification, sorted by urgency</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('cs_queue')">
                View All (${metrics.customersRequiringUpdates})
              </button>
            </div>
            <div class="cs-card-body p-0">
              <div class="table-responsive">
                <table class="cs-table">
                  <thead>
                    <tr>
                      <th>Shipment & Customer</th>
                      <th>Customer-Safe Issue</th>
                      <th>Approved ETA</th>
                      <th>Update Status</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${priorityUpdates.length === 0 ? `
                      <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                          No pending customer communications. All customers are currently up to date.
                        </td>
                      </tr>
                    ` : priorityUpdates.map(s => `
                      <tr>
                        <td>
                          <div class="cs-shipment-cell">
                            <span class="cs-shipment-id" onclick="CSDashboardView.viewDetails('${s.id}')">${s.id}</span>
                            <span class="cs-customer-name">${s.customerName || 'Customer'}</span>
                            <span class="cs-ref-sub">Ref: ${s.customerReference || s.orderId || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-issue-desc" title="${s.customerSafeExceptionSummary || 'Operational delay in progress'}">
                            ${s.customerSafeExceptionSummary || 'Transit adjustment under management'}
                          </div>
                          <div class="cs-meta-tags mt-1">
                            <span class="badge ${s.slaRisk === 'Critical SLA Breach' ? 'badge-danger' : s.slaRisk === 'High Risk' ? 'badge-warning' : 'badge-neutral'}">
                              ${s.slaRisk || 'On Schedule'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-eta-display">
                            <strong>${s.approvedETA || s.eta || 'TBD'}</strong>
                            ${s.etaApprovalStatus === 'Pending Review' ? `
                              <span class="cs-eta-pending-pill" title="Proposed: ${s.proposedETA || 'Revised'} is pending operational review">
                                Review Pending
                              </span>
                            ` : `
                              <span class="cs-eta-approved-pill">Confirmed</span>
                            `}
                          </div>
                        </td>
                        <td>
                          <span class="cs-status-pill ${s.customerUpdateStatus === 'Action Required' ? 'status-action-required' : s.customerUpdateStatus === 'Under Review' ? 'status-under-review' : 'status-up-to-date'}">
                            ${s.customerUpdateStatus || 'Action Required'}
                          </span>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-primary btn-xs" onclick="CSDashboardView.startDraft('${s.id}')">
                            Draft Update
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 2. RECENT ETA CHANGES -->
          <div class="cs-card">
            <div class="cs-card-header">
              <div class="cs-card-title-group">
                <span class="cs-card-icon" style="color: #D97706;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cs-card-title">Recent ETA Changes</h3>
                  <p class="cs-card-subtitle">Approved customer commitments vs proposed operational modifications</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('cs_shipments')">
                Search Shipments
              </button>
            </div>
            <div class="cs-card-body p-0">
              <div class="table-responsive">
                <table class="cs-table">
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Approved ETA</th>
                      <th>Proposed ETA</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentETAChanges.map(s => {
                      const hasPending = s.etaApprovalStatus === 'Pending Review' && s.proposedETA;
                      return `
                        <tr>
                          <td>
                            <div class="cs-shipment-cell">
                              <span class="cs-shipment-id" onclick="CSDashboardView.viewDetails('${s.id}')">${s.id}</span>
                              <span class="cs-customer-name">${s.customerName || 'Client'}</span>
                            </div>
                          </td>
                          <td>
                            <span class="cs-approved-eta-badge">${s.approvedETA || s.eta || 'Pending'}</span>
                          </td>
                          <td>
                            ${hasPending ? `
                              <div class="cs-proposed-eta-box">
                                <span class="cs-proposed-time">${s.proposedETA}</span>
                                <span class="cs-pending-tag">Pending Review</span>
                              </div>
                            ` : `
                              <span class="text-muted" style="font-size: 11px;">No pending changes</span>
                            `}
                          </td>
                          <td>
                            <span class="cs-approval-pill ${s.etaApprovalStatus === 'Approved' ? 'approval-approved' : 'approval-pending'}">
                              ${s.etaApprovalStatus || 'Approved'}
                            </span>
                          </td>
                          <td>
                            <span class="cs-time-text">${s.lastOperationalUpdate || '10 mins ago'}</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 3. RECENT COMMUNICATIONS -->
          <div class="cs-card">
            <div class="cs-card-header">
              <div class="cs-card-title-group">
                <span class="cs-card-icon" style="color: #18217E;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cs-card-title">Recent Communications</h3>
                  <p class="cs-card-subtitle">Customer notifications drafted, under review, and dispatched</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('cs_history')">
                Full History
              </button>
            </div>
            <div class="cs-card-body p-0">
              <div class="table-responsive">
                <table class="cs-table">
                  <thead>
                    <tr>
                      <th>Customer & Shipment</th>
                      <th>Template / Type</th>
                      <th>Channel</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentComms.length === 0 ? `
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                          No communication records found.
                        </td>
                      </tr>
                    ` : recentComms.map(c => `
                      <tr>
                        <td>
                          <div class="cs-shipment-cell">
                            <span class="cs-customer-name">${c.customerName || 'Customer'}</span>
                            <span class="cs-ref-sub" onclick="CSDashboardView.viewDetails('${c.shipmentId}')" style="cursor: pointer; color: #18217E;">${c.shipmentId}</span>
                          </div>
                        </td>
                        <td>
                          <span class="cs-template-tag">${c.template || 'Status Update'}</span>
                        </td>
                        <td>
                          <span class="cs-channel-badge ${c.channel === 'Email' ? 'channel-email' : 'channel-sms'}">
                            ${c.channel === 'Email' ? `
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="20" height="16" x="2" y="4" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                              </svg>
                            ` : `
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                            `}
                            ${c.channel}
                          </span>
                        </td>
                        <td>
                          <span class="cs-time-text">${c.sentAt || c.createdAt || 'Today'}</span>
                        </td>
                        <td>
                          <span class="cs-comm-status-badge ${c.status === 'Sent' ? 'comm-sent' : c.status === 'Awaiting Review' ? 'comm-review' : 'comm-draft'}">
                            ${c.status}
                          </span>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-outline btn-xs" onclick="CSDashboardView.openMessageModal('${c.id}')">
                            View
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 4. OPEN OPERATIONAL ESCALATIONS -->
          <div class="cs-card">
            <div class="cs-card-header">
              <div class="cs-card-title-group">
                <span class="cs-card-icon" style="color: #8C2527;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cs-card-title">Open Operational Escalations</h3>
                  <p class="cs-card-subtitle">Tickets raised to Control Tower Analyst and Dispatcher teams</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('cs_escalations')">
                Raise / Manage
              </button>
            </div>
            <div class="cs-card-body p-0">
              <div class="table-responsive">
                <table class="cs-table">
                  <thead>
                    <tr>
                      <th>Ref & Shipment</th>
                      <th>Category</th>
                      <th>Assigned Team</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${openEscalations.length === 0 ? `
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                          No open escalations. All customer inquiries resolved.
                        </td>
                      </tr>
                    ` : openEscalations.map(e => `
                      <tr>
                        <td>
                          <div class="cs-shipment-cell">
                            <span class="cs-escalation-id" onclick="App.navigateTo('cs_escalations')">${e.id}</span>
                            <span class="cs-ref-sub" onclick="CSDashboardView.viewDetails('${e.shipmentId}')" style="cursor: pointer; color: #18217E;">${e.shipmentId}</span>
                          </div>
                        </td>
                        <td>
                          <span class="cs-category-text">${e.category || 'ETA Clarification'}</span>
                        </td>
                        <td>
                          <div class="cs-assigned-badge">
                            <strong>${e.assignedRole || 'Control Tower Analyst'}</strong>
                            <span class="cs-assigned-user">${e.assignedUser || 'Sarah Lin'}</span>
                          </div>
                        </td>
                        <td>
                          <span class="badge ${e.priority === 'Critical' ? 'badge-danger' : e.priority === 'High' ? 'badge-warning' : 'badge-neutral'}">
                            ${e.priority}
                          </span>
                        </td>
                        <td>
                          <span class="cs-esc-status-badge ${e.status === 'Open' ? 'esc-open' : 'esc-in-progress'}">
                            ${e.status}
                          </span>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-outline btn-xs" onclick="App.navigateTo('cs_escalations')">
                            Track
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  startDraft(shipmentId) {
    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_compose');
  },

  viewDetails(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  openMessageModal(commId) {
    const store = window.BRIDGES_STORE;
    const comm = store.getCommunication(commId);
    if (!comm) {
      UI.showToast('Communication record not found.', 'error');
      return;
    }

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="cs-channel-badge ${comm.channel === 'Email' ? 'channel-email' : 'channel-sms'}">${comm.channel}</span>
        <span>Customer Communication — ${comm.id}</span>
      </div>
    `;

    const bodyHtml = `
      <div class="cs-comm-modal-content">
        <div class="cs-modal-meta-grid">
          <div><strong>Shipment:</strong> <span class="cs-link" onclick="UI.closeModal('generic-app-modal'); CSDashboardView.viewDetails('${comm.shipmentId}')">${comm.shipmentId}</span></div>
          <div><strong>Customer:</strong> ${comm.customerName}</div>
          <div><strong>Recipient:</strong> ${comm.recipient}</div>
          <div><strong>Created By:</strong> ${comm.createdBy}</div>
          <div><strong>Status:</strong> <span class="cs-comm-status-badge ${comm.status === 'Sent' ? 'comm-sent' : comm.status === 'Awaiting Review' ? 'comm-review' : 'comm-draft'}">${comm.status}</span></div>
          <div><strong>Timestamp:</strong> ${comm.sentAt || comm.createdAt}</div>
        </div>

        ${comm.subject ? `
          <div class="cs-modal-subject">
            <span class="text-muted">Subject:</span> <strong>${comm.subject}</strong>
          </div>
        ` : ''}

        <div class="cs-modal-body-preview">
          ${(comm.body || comm.message || '').replace(/\n/g, '<br>')}
        </div>

        <div class="cs-safety-notice mt-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Customer Safety Check: Contains only approved operational ETA and non-confidential customer status. Internal AI rationale and carrier recovery metrics are excluded.
        </div>
      </div>
    `;

    // Replace modal body
    let bodyContainer = dialogEl.querySelector('.modal-body');
    if (!bodyContainer) {
      bodyContainer = document.createElement('div');
      bodyContainer.className = 'modal-body';
      dialogEl.appendChild(bodyContainer);
    }
    bodyContainer.innerHTML = bodyHtml;

    UI.openModal('generic-app-modal');
  }
};
