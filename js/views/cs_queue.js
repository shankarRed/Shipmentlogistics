/**
 * BRIDGES Control Tower - Customer Service Communication Queue View
 * Phase 6: Prioritized queue of shipments requiring customer communications,
 * with multi-criteria filtering, SLA risk badges, and direct workspace launch.
 */

window.CSQueueView = {
  filterPriority: 'All',
  filterCustomerUpdateStatus: 'All',
  filterExceptionType: 'All',
  filterSlaRisk: 'All',
  filterMessageStatus: 'All',

  render() {
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();
    const allComms = store.getCommunications();

    // Map communications per shipment to check current communication status
    const commsByShipment = {};
    allComms.forEach(c => {
      if (!commsByShipment[c.shipmentId]) commsByShipment[c.shipmentId] = [];
      commsByShipment[c.shipmentId].push(c);
    });

    // Derive queue items from shipments requiring communication or having active exceptions
    const queueItems = allShipments.map(s => {
      const comms = commsByShipment[s.id] || [];
      const latestComm = comms.length > 0 ? comms[comms.length - 1] : null;

      // Determine Reason for communication
      let reason = 'Periodic Status Confirmation';
      if (s.etaApprovalStatus === 'Pending Review' || s.proposedETA) {
        reason = 'ETA Revision Under Review';
      } else if (s.slaRisk === 'Critical SLA Breach') {
        reason = 'Severe SLA Delay Advisory';
      } else if (s.slaRisk === 'High Risk') {
        reason = 'Delivery Window At Risk';
      } else if (s.exceptionType === 'Temperature Excursion') {
        reason = 'Cold Chain Integrity Alert';
      } else if (s.exceptionType === 'Mechanical Breakdown') {
        reason = 'Vehicle Substitution Notification';
      } else if (s.exceptionType === 'Severe Weather Delay') {
        reason = 'Weather Route Delay Notice';
      } else if (s.customerUpdateStatus === 'Action Required') {
        reason = 'Proactive Update Required';
      }

      // Priority calculation
      let priority = 'Medium';
      if (s.slaRisk === 'Critical SLA Breach' || s.severity === 'Critical') {
        priority = 'Critical';
      } else if (s.slaRisk === 'High Risk' || s.severity === 'High' || s.customerUpdateStatus === 'Action Required') {
        priority = 'High';
      } else if (s.status === 'Delivered') {
        priority = 'Low';
      }

      // Latest message status
      let messageStatus = 'No Message Sent';
      if (latestComm) {
        messageStatus = latestComm.status;
      }

      return {
        shipment: s,
        reason,
        priority,
        messageStatus,
        lastContact: s.lastCustomerContact || (latestComm ? latestComm.sentAt || latestComm.createdAt : 'Never Contacted'),
        latestComm
      };
    });

    // Sorting: Critical first, then High, then Action Required
    queueItems.sort((a, b) => {
      const score = (item) => {
        let pScore = item.priority === 'Critical' ? 40 : item.priority === 'High' ? 30 : item.priority === 'Medium' ? 10 : 0;
        let uScore = item.shipment.customerUpdateStatus === 'Action Required' ? 20 : item.shipment.customerUpdateStatus === 'Under Review' ? 10 : 0;
        return pScore + uScore;
      };
      return score(b) - score(a);
    });

    // Filtering
    const filteredQueue = queueItems.filter(item => {
      const s = item.shipment;
      if (this.filterPriority !== 'All' && item.priority !== this.filterPriority) return false;
      if (this.filterCustomerUpdateStatus !== 'All' && s.customerUpdateStatus !== this.filterCustomerUpdateStatus) return false;
      if (this.filterExceptionType !== 'All' && s.exceptionType !== this.filterExceptionType) return false;
      if (this.filterSlaRisk !== 'All' && s.slaRisk !== this.filterSlaRisk) return false;
      if (this.filterMessageStatus !== 'All' && item.messageStatus !== this.filterMessageStatus) return false;
      return true;
    });

    // Exception types for filter dropdown
    const exceptionTypes = Array.from(new Set(allShipments.map(s => s.exceptionType).filter(Boolean)));

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BANNER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Customer Communication Queue
              </span>
              <span class="cs-user-tag">
                ${filteredQueue.length} Shipments in Communication Backlog
              </span>
            </div>
            <h1 class="cs-banner-title">Proactive Customer Notification Queue</h1>
            <p class="cs-banner-subtitle">
              Prioritized dispatch queue for proactive customer communications. Prioritizes critical disruptions, delayed ETAs, and SLA commitments.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSQueueView.resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Reset Filters
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('cs_compose')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Open Compose Workspace
            </button>
          </div>
        </div>

        <!-- FILTERS ROW -->
        <div class="cs-filter-card">
          <div class="cs-filters-grid">
            <!-- Filter 1: Priority -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Priority</label>
              <select class="cs-select" onchange="CSQueueView.onFilterChange('filterPriority', this.value)">
                <option value="All" ${this.filterPriority === 'All' ? 'selected' : ''}>All Priorities</option>
                <option value="Critical" ${this.filterPriority === 'Critical' ? 'selected' : ''}>Critical Urgency</option>
                <option value="High" ${this.filterPriority === 'High' ? 'selected' : ''}>High Priority</option>
                <option value="Medium" ${this.filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${this.filterPriority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>

            <!-- Filter 2: Customer Update Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Update Status</label>
              <select class="cs-select" onchange="CSQueueView.onFilterChange('filterCustomerUpdateStatus', this.value)">
                <option value="All" ${this.filterCustomerUpdateStatus === 'All' ? 'selected' : ''}>All Update States</option>
                <option value="Action Required" ${this.filterCustomerUpdateStatus === 'Action Required' ? 'selected' : ''}>Action Required</option>
                <option value="Under Review" ${this.filterCustomerUpdateStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Up to Date" ${this.filterCustomerUpdateStatus === 'Up to Date' ? 'selected' : ''}>Up to Date</option>
              </select>
            </div>

            <!-- Filter 3: Exception Type -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Exception Type</label>
              <select class="cs-select" onchange="CSQueueView.onFilterChange('filterExceptionType', this.value)">
                <option value="All" ${this.filterExceptionType === 'All' ? 'selected' : ''}>All Disruption Types</option>
                ${exceptionTypes.map(t => `
                  <option value="${t}" ${this.filterExceptionType === t ? 'selected' : ''}>${t}</option>
                `).join('')}
              </select>
            </div>

            <!-- Filter 4: SLA Risk -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">SLA Risk</label>
              <select class="cs-select" onchange="CSQueueView.onFilterChange('filterSlaRisk', this.value)">
                <option value="All" ${this.filterSlaRisk === 'All' ? 'selected' : ''}>All SLA Levels</option>
                <option value="Critical SLA Breach" ${this.filterSlaRisk === 'Critical SLA Breach' ? 'selected' : ''}>Critical SLA Breach</option>
                <option value="High Risk" ${this.filterSlaRisk === 'High Risk' ? 'selected' : ''}>High Risk</option>
                <option value="Medium" ${this.filterSlaRisk === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="On Schedule" ${this.filterSlaRisk === 'On Schedule' ? 'selected' : ''}>On Schedule</option>
              </select>
            </div>

            <!-- Filter 5: Message Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Message Status</label>
              <select class="cs-select" onchange="CSQueueView.onFilterChange('filterMessageStatus', this.value)">
                <option value="All" ${this.filterMessageStatus === 'All' ? 'selected' : ''}>All Message States</option>
                <option value="No Message Sent" ${this.filterMessageStatus === 'No Message Sent' ? 'selected' : ''}>No Message Sent</option>
                <option value="Draft" ${this.filterMessageStatus === 'Draft' ? 'selected' : ''}>Draft in Progress</option>
                <option value="Awaiting Review" ${this.filterMessageStatus === 'Awaiting Review' ? 'selected' : ''}>Awaiting Review</option>
                <option value="Sent" ${this.filterMessageStatus === 'Sent' ? 'selected' : ''}>Dispatched (Sent)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- QUEUE TABLE -->
        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-title-group">
              <h3 class="cs-card-title">Prioritized Communications Tasklist</h3>
              <p class="cs-card-subtitle">Sorted by urgency: Critical SLA breaches and required customer outreach</p>
            </div>
            <span class="cs-queue-count-badge">${filteredQueue.length} Active Tasks</span>
          </div>
          <div class="cs-card-body p-0">
            <div class="table-responsive">
              <table class="cs-table cs-table-hover">
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Customer / Consignee</th>
                    <th>Customer-Safe Summary</th>
                    <th>Approved ETA</th>
                    <th>Reason for Communication</th>
                    <th>Priority</th>
                    <th>Last Contact</th>
                    <th>Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredQueue.length === 0 ? `
                    <tr>
                      <td colspan="9" class="text-center py-5">
                        <div class="cs-empty-state">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="1.8">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <h4 class="mt-2 text-dark font-semibold">Communication Queue Clear</h4>
                          <p class="text-muted text-sm">No shipments currently match the selected queue criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ` : filteredQueue.map(item => {
                    const s = item.shipment;
                    const hasPendingReview = s.etaApprovalStatus === 'Pending Review' && s.proposedETA;

                    return `
                      <tr>
                        <td>
                          <div class="cs-shipment-cell">
                            <span class="cs-shipment-id" onclick="CSQueueView.viewDetails('${s.id}')">${s.id}</span>
                            <span class="cs-ref-sub">Ref: ${s.customerReference || s.orderId || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-party-block">
                            <strong class="cs-customer-name">${s.customerName || 'Customer'}</strong>
                            <span class="cs-consignee-name">&rarr; ${s.consigneeName || 'Consignee'}</span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-issue-desc" title="${s.customerSafeExceptionSummary || 'Nominal execution'}">
                            ${s.customerSafeExceptionSummary || 'Transit proceeding as scheduled'}
                          </div>
                        </td>
                        <td>
                          <div class="cs-eta-cell">
                            <span class="cs-approved-eta-badge">${s.approvedETA || s.eta || 'TBD'}</span>
                            ${hasPendingReview ? `
                              <span class="cs-eta-pending-pill" title="Proposed ETA ${s.proposedETA} is awaiting approval">Review Pending</span>
                            ` : ''}
                          </div>
                        </td>
                        <td>
                          <span class="cs-reason-badge">${item.reason}</span>
                        </td>
                        <td>
                          <span class="badge ${
                            item.priority === 'Critical' ? 'badge-danger' :
                            item.priority === 'High' ? 'badge-warning' :
                            item.priority === 'Medium' ? 'badge-info' : 'badge-neutral'
                          }">
                            ${item.priority}
                          </span>
                        </td>
                        <td>
                          <span class="cs-time-text">${item.lastContact}</span>
                        </td>
                        <td>
                          <span class="cs-comm-status-badge ${
                            item.messageStatus === 'Sent' ? 'comm-sent' :
                            item.messageStatus === 'Awaiting Review' ? 'comm-review' :
                            item.messageStatus === 'Draft' ? 'comm-draft' : 'comm-none'
                          }">
                            ${item.messageStatus}
                          </span>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-primary btn-xs" onclick="CSQueueView.openWorkspace('${s.id}')">
                            Open Workspace
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onFilterChange(key, val) {
    this[key] = val;
    App.renderCurrentView();
  },

  resetFilters() {
    this.filterPriority = 'All';
    this.filterCustomerUpdateStatus = 'All';
    this.filterExceptionType = 'All';
    this.filterSlaRisk = 'All';
    this.filterMessageStatus = 'All';
    App.renderCurrentView();
    UI.showToast('Queue filters reset.', 'info');
  },

  viewDetails(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  openWorkspace(shipmentId) {
    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_compose');
  }
};
