/**
 * BRIDGES Control Tower - Customer Service Operational Escalations View
 * Phase 6: Raise operational tickets to Control Tower Analysts and Dispatchers,
 * route based on category, track SLAs, prevent duplicates, and add follow-up notes.
 */

window.CSEscalationsView = {
  searchQuery: '',
  filterCategory: 'All',
  filterPriority: 'All',
  filterStatus: 'All',

  render() {
    const store = window.BRIDGES_STORE;
    const allEscalations = store.getEscalations ? store.getEscalations() : [];
    const allShipments = store.getShipments();

    // Multi-attribute search and filtering
    const filtered = allEscalations.filter(e => {
      // 1. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        const idMatch = (e.id || '').toLowerCase().includes(q);
        const shipMatch = (e.shipmentId || '').toLowerCase().includes(q);
        const catMatch = (e.category || '').toLowerCase().includes(q);
        const reasonMatch = (e.reason || '').toLowerCase().includes(q);
        const roleMatch = (e.assignedRole || '').toLowerCase().includes(q);
        const userMatch = (e.assignedUser || '').toLowerCase().includes(q);
        if (!idMatch && !shipMatch && !catMatch && !reasonMatch && !roleMatch && !userMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (this.filterCategory !== 'All' && e.category !== this.filterCategory) {
        return false;
      }

      // 3. Priority filter
      if (this.filterPriority !== 'All' && e.priority !== this.filterPriority) {
        return false;
      }

      // 4. Status filter
      if (this.filterStatus !== 'All' && e.status !== this.filterStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Open / In Progress first, then newest ID
      if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
      if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
      return (b.id || '').localeCompare(a.id || '');
    });

    const openCount = allEscalations.filter(e => e.status !== 'Resolved').length;

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BANNER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Operations Coordination Channel
              </span>
              <span class="cs-user-tag">
                ${openCount} Active Operational Escalations
              </span>
            </div>
            <h1 class="cs-banner-title">Operational Escalation Management</h1>
            <p class="cs-banner-subtitle">
              Escalate customer-impacting operational inquiries directly to Control Tower Analysts and Transport Planners. Track response SLAs and record collaborative notes.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSEscalationsView.resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Reset Filters
            </button>
            <button class="btn btn-sm" style="background: #8C2527; color: #FFFFFF; font-weight: 700; border: none; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px;" onclick="CSEscalationsView.openComplaintModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              + Escalate Customer Complaint
            </button>
            <button class="btn btn-primary btn-sm" onclick="CSEscalationsView.openNewEscalationModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Raise Operational Escalation
            </button>
          </div>
        </div>

        <!-- SEARCH AND FILTER PANEL -->
        <div class="cs-filter-card">
          <div class="cs-search-row">
            <div class="cs-search-input-wrap">
              <svg class="cs-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                class="cs-search-input" 
                placeholder="Search escalations by Ref (e.g. ESC-4003), Shipment ID, Category, Reason, or Assignee..."
                value="${this.searchQuery}"
                oninput="CSEscalationsView.onSearchInput(this.value)"
              />
              ${this.searchQuery ? `
                <button class="cs-search-clear" onclick="CSEscalationsView.onSearchInput('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>

          <div class="cs-filters-grid">
            <!-- Filter 1: Category -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Escalation Category</label>
              <select class="cs-select" onchange="CSEscalationsView.onFilterChange('filterCategory', this.value)">
                <option value="All" ${this.filterCategory === 'All' ? 'selected' : ''}>All Categories</option>
                <option value="ETA Confirmation Required" ${this.filterCategory === 'ETA Confirmation Required' ? 'selected' : ''}>ETA Confirmation Required</option>
                <option value="Delivery Commitment at Risk" ${this.filterCategory === 'Delivery Commitment at Risk' ? 'selected' : ''}>Delivery Commitment at Risk</option>
                <option value="No Recent Shipment Update" ${this.filterCategory === 'No Recent Shipment Update' ? 'selected' : ''}>No Recent Shipment Update</option>
                <option value="Customer Complaint" ${this.filterCategory === 'Customer Complaint' ? 'selected' : ''}>Customer Complaint</option>
                <option value="Exception Status Clarification" ${this.filterCategory === 'Exception Status Clarification' ? 'selected' : ''}>Exception Status Clarification</option>
                <option value="Other" ${this.filterCategory === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <!-- Filter 2: Priority -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Priority</label>
              <select class="cs-select" onchange="CSEscalationsView.onFilterChange('filterPriority', this.value)">
                <option value="All" ${this.filterPriority === 'All' ? 'selected' : ''}>All Priorities</option>
                <option value="Critical" ${this.filterPriority === 'Critical' ? 'selected' : ''}>Critical</option>
                <option value="High" ${this.filterPriority === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${this.filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${this.filterPriority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>

            <!-- Filter 3: Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Status</label>
              <select class="cs-select" onchange="CSEscalationsView.onFilterChange('filterStatus', this.value)">
                <option value="All" ${this.filterStatus === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Open" ${this.filterStatus === 'Open' ? 'selected' : ''}>Open</option>
                <option value="In Progress" ${this.filterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${this.filterStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ESCALATIONS TABLE -->
        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-title-group">
              <h3 class="cs-card-title">Operational Escalation Register</h3>
              <p class="cs-card-subtitle">Active operational tickets routed to Operations Analysts and Dispatchers</p>
            </div>
            <span class="cs-queue-count-badge">${filtered.length} Escalations Listed</span>
          </div>
          <div class="cs-card-body p-0">
            <div class="table-responsive">
              <table class="cs-table cs-table-hover">
                <thead>
                  <tr>
                    <th>Escalation Ref</th>
                    <th>Shipment ID</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assigned Role & User</th>
                    <th>Created Time</th>
                    <th>Response Deadline</th>
                    <th>Status</th>
                    <th>Latest Response / Note</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="10" class="text-center py-5">
                        <div class="cs-empty-state">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.8">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <h4 class="mt-2 text-dark font-semibold">No Escalations Found</h4>
                          <p class="text-muted text-sm">No operational escalations match "${this.searchQuery || 'current filters'}".</p>
                        </div>
                      </td>
                    </tr>
                  ` : filtered.map(e => `
                    <tr onclick="CSEscalationsView.openDetailModal('${e.id}')" style="cursor: pointer;">
                      <td>
                        <strong class="cs-escalation-id">${e.id}</strong>
                      </td>
                      <td onclick="event.stopPropagation(); CSEscalationsView.viewShipment('${e.shipmentId}')">
                        <span class="cs-shipment-id">${e.shipmentId}</span>
                      </td>
                      <td>
                        <span class="cs-category-text">${e.category}</span>
                      </td>
                      <td>
                        <span class="badge ${
                          e.priority === 'Critical' ? 'badge-danger' :
                          e.priority === 'High' ? 'badge-warning' :
                          e.priority === 'Medium' ? 'badge-info' : 'badge-neutral'
                        }">
                          ${e.priority}
                        </span>
                      </td>
                      <td>
                        <div class="cs-assigned-badge">
                          <strong>${e.assignedRole || 'Unassigned'}</strong>
                          <span class="cs-assigned-user">${e.assignedUser || 'Pending Assignment'}</span>
                        </div>
                      </td>
                      <td>
                        <span class="cs-time-text">${e.createdAt}</span>
                      </td>
                      <td>
                        <span class="cs-deadline-text ${e.status !== 'Resolved' ? 'text-danger font-semibold' : 'text-muted'}">
                          ${e.deadline || 'Within 2 Hours'}
                        </span>
                      </td>
                      <td>
                        <span class="cs-esc-status-badge ${
                          e.status === 'Open' ? 'esc-open' :
                          e.status === 'In Progress' ? 'esc-in-progress' :
                          'esc-resolved'
                        }">
                          ${e.status}
                        </span>
                      </td>
                      <td>
                        <div class="cs-latest-response-snippet" title="${e.latestResponse || e.reason}">
                          ${e.latestResponse || e.reason || 'Pending initial response'}
                        </div>
                      </td>
                      <td class="text-right" onclick="event.stopPropagation()">
                        <button class="btn btn-primary btn-xs" onclick="CSEscalationsView.openDetailModal('${e.id}')">
                          View & Comment
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
    `;
  },

  onSearchInput(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  onFilterChange(key, val) {
    this[key] = val;
    App.renderCurrentView();
  },

  resetFilters() {
    this.searchQuery = '';
    this.filterCategory = 'All';
    this.filterPriority = 'All';
    this.filterStatus = 'All';
    App.renderCurrentView();
    UI.showToast('Escalation filters reset.', 'info');
  },

  viewShipment(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  openComplaintModal(preselectedShipmentId = null) {
    this.openNewEscalationModal(preselectedShipmentId, 'Customer Complaint');
  },

  openNewEscalationModal(preselectedShipmentId = null, defaultCategory = null) {
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    const isComplaint = defaultCategory === 'Customer Complaint';

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: ${isComplaint ? '#EA341F' : '#8C2527'};">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${isComplaint ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
          </svg>
        </span>
        <span>${isComplaint ? 'Escalate Customer Complaint & Grievance' : 'Raise Operational Escalation'}</span>
      </div>
    `;

    const bodyHtml = `
      <form id="cs-new-escalation-form" onsubmit="event.preventDefault(); CSEscalationsView.submitNewEscalation();">
        <div class="cs-modal-form-grid">
          <!-- 1. SHIPMENT SELECTION -->
          <div class="cs-form-group">
            <label class="cs-form-label">Shipment Reference: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-esc-shipment-id" required>
              <option value="">Select a Shipment...</option>
              ${allShipments.map(s => `
                <option value="${s.id}" ${preselectedShipmentId === s.id ? 'selected' : ''}>
                  ${s.id} — ${s.customerName || 'Customer'} (${s.status})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- 2. ESCALATION CATEGORY -->
          <div class="cs-form-group">
            <label class="cs-form-label">Escalation Category: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-esc-category" required onchange="CSEscalationsView.updateRoutingHint(this.value)">
              <option value="ETA Confirmation Required" ${defaultCategory === 'ETA Confirmation Required' ? 'selected' : ''}>ETA Confirmation Required (Routes to Dispatcher)</option>
              <option value="Delivery Commitment at Risk" ${defaultCategory === 'Delivery Commitment at Risk' ? 'selected' : ''}>Delivery Commitment at Risk (Routes to Dispatcher)</option>
              <option value="No Recent Shipment Update" ${defaultCategory === 'No Recent Shipment Update' ? 'selected' : ''}>No Recent Shipment Update (Routes to Analyst)</option>
              <option value="Customer Complaint" ${defaultCategory === 'Customer Complaint' ? 'selected' : ''}>Customer Complaint (Routes to Operations Analyst)</option>
              <option value="Exception Status Clarification" ${defaultCategory === 'Exception Status Clarification' ? 'selected' : ''}>Exception Status Clarification (Routes to Analyst)</option>
              <option value="Other" ${defaultCategory === 'Other' ? 'selected' : ''}>Other Operational Inquiry</option>
            </select>
            <div id="cs-routing-hint" class="cs-routing-hint mt-1">
              <span class="text-xs text-muted">Auto-assigned to: <strong>${isComplaint ? 'Control Tower Analyst (Marcus Vance)' : 'Dispatcher / Transport Planner (Elena Rostova)'}</strong></span>
            </div>
          </div>

          <!-- 3. PRIORITY -->
          <div class="cs-form-group">
            <label class="cs-form-label">Priority: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-esc-priority" required>
              <option value="Critical">Critical (Immediate Response Required)</option>
              <option value="High" selected>High (Response &lt; 2h)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- 4. REQUIRED RESPONSE TIME / DEADLINE -->
          <div class="cs-form-group">
            <label class="cs-form-label">Required Response Deadline: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-esc-deadline" required>
              <option value="Within 1 Hour">Within 1 Hour (Urgent SLA Jeopardy)</option>
              <option value="Within 2 Hours" selected>Within 2 Hours</option>
              <option value="Within 4 Hours">Within 4 Hours</option>
              <option value="End of Day">End of Business Day</option>
            </select>
          </div>

          <!-- 5. REASON -->
          <div class="cs-form-group cs-span-full">
            <label class="cs-form-label">Escalation Reason / Problem Description: <span class="text-danger">*</span></label>
            <textarea 
              class="cs-textarea" 
              id="cs-esc-reason" 
              rows="3" 
              placeholder="Clearly state what operational answer is required (e.g., Customer requesting confirmed arrival time following breakdown report)..." 
              required
            ></textarea>
          </div>

          <!-- 6. CUSTOMER IMPACT -->
          <div class="cs-form-group cs-span-full">
            <label class="cs-form-label">Customer Impact: <span class="text-danger">*</span></label>
            <textarea 
              class="cs-textarea" 
              id="cs-esc-impact" 
              rows="2" 
              placeholder="Describe commercial impact (e.g., Production line shut-down risk at consignee Dallas facility if not delivered by 14:00)..." 
              required
            ></textarea>
          </div>

          <!-- 7. REQUESTED ACTION -->
          <div class="cs-form-group cs-span-full">
            <label class="cs-form-label">Requested Response or Operational Action: <span class="text-danger">*</span></label>
            <textarea 
              class="cs-textarea" 
              id="cs-esc-action" 
              rows="2" 
              placeholder="e.g., Please authorize the proposed 15:30 ETA or confirm dedicated hot-shot vehicle dispatch." 
              required
            ></textarea>
          </div>
        </div>

        <div class="cs-dedup-notice mt-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18217E" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Smart Escalation Guard: If an open escalation already exists for this shipment and category, this will update the existing thread to prevent duplicate operational records.
        </div>

        <div class="cs-modal-btn-row mt-4">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary btn-sm">
            Submit Operational Escalation
          </button>
        </div>
      </form>
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
  },

  updateRoutingHint(category) {
    const hint = document.getElementById('cs-routing-hint');
    if (!hint) return;
    if (category === 'ETA Confirmation Required' || category === 'Delivery Commitment at Risk') {
      hint.innerHTML = `<span class="text-xs text-muted">Auto-assigned to: <strong>Dispatcher / Transport Planner (Elena Rostova)</strong></span>`;
    } else if (category === 'No Recent Shipment Update' || category === 'Exception Status Clarification' || category === 'Customer Complaint') {
      hint.innerHTML = `<span class="text-xs text-muted">Auto-assigned to: <strong>Control Tower Analyst (Sarah Lin)</strong></span>`;
    } else {
      hint.innerHTML = `<span class="text-xs text-muted">Auto-assigned to: <strong>Control Tower Operations Lead (Marcus Vance)</strong></span>`;
    }
  },

  submitNewEscalation() {
    const store = window.BRIDGES_STORE;
    const shipmentId = document.getElementById('cs-esc-shipment-id').value;
    const category = document.getElementById('cs-esc-category').value;
    const priority = document.getElementById('cs-esc-priority').value;
    const deadline = document.getElementById('cs-esc-deadline').value;
    const reason = document.getElementById('cs-esc-reason').value;
    const customerImpact = document.getElementById('cs-esc-impact').value;
    const requestedAction = document.getElementById('cs-esc-action').value;

    if (!shipmentId || !reason || !customerImpact || !requestedAction) {
      UI.showToast('Please fill out all required fields.', 'error');
      return;
    }

    const escalation = store.createCustomerServiceEscalation({
      shipmentId,
      category,
      priority,
      reason,
      customerImpact,
      requestedAction,
      deadline
    });

    UI.closeModal('generic-app-modal');
    UI.showToast(`Escalation ${escalation.id} registered and routed to ${escalation.assignedRole}.`, 'success');
    App.renderCurrentView();
  },

  openDetailModal(escalationId) {
    const store = window.BRIDGES_STORE;
    const allEscalations = store.getEscalations ? store.getEscalations() : [];
    const esc = allEscalations.find(e => e.id === escalationId);
    if (!esc) {
      UI.showToast('Escalation record not found.', 'error');
      return;
    }

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="cs-esc-status-badge ${esc.status === 'Open' ? 'esc-open' : esc.status === 'In Progress' ? 'esc-in-progress' : 'esc-resolved'}">
          ${esc.status}
        </span>
        <span>Escalation ${esc.id} &bull; ${esc.shipmentId}</span>
      </div>
    `;

    const comments = esc.comments || [
      { author: esc.createdBy || 'Clara Hughes', role: 'Customer Service', time: esc.createdAt, text: esc.reason }
    ];

    const bodyHtml = `
      <div class="cs-escalation-modal-content">
        <!-- HEADER METADATA GRID -->
        <div class="cs-modal-meta-grid">
          <div><strong>Shipment:</strong> <span class="cs-link" onclick="UI.closeModal('generic-app-modal'); CSEscalationsView.viewShipment('${esc.shipmentId}')">${esc.shipmentId}</span></div>
          <div><strong>Category:</strong> ${esc.category}</div>
          <div><strong>Priority:</strong> <span class="badge ${esc.priority === 'Critical' ? 'badge-danger' : 'badge-warning'}">${esc.priority}</span></div>
          <div><strong>Assigned Team:</strong> <strong>${esc.assignedRole}</strong> (${esc.assignedUser})</div>
          <div><strong>Created:</strong> ${esc.createdAt} by ${esc.createdBy || 'Clara Hughes'}</div>
          <div><strong>Response Deadline:</strong> <span class="text-danger font-semibold">${esc.deadline || 'Within 2 Hours'}</span></div>
        </div>

        <!-- DETAILS CALLOUT -->
        <div class="cs-esc-detail-box mt-3">
          <div class="cs-esc-row">
            <span class="cs-esc-label">Customer Impact:</span>
            <span>${esc.customerImpact || 'Pending consignee assessment.'}</span>
          </div>
          <div class="cs-esc-row mt-2">
            <span class="cs-esc-label">Requested Response:</span>
            <span>${esc.requestedAction || 'ETA confirmation requested.'}</span>
          </div>
          ${esc.latestResponse ? `
            <div class="cs-esc-row cs-esc-highlight mt-2">
              <span class="cs-esc-label">Latest Operational Response:</span>
              <strong style="color: #18217E;">${esc.latestResponse}</strong>
            </div>
          ` : ''}
        </div>

        <!-- CONVERSATION / TIMELINE OF NOTES -->
        <div class="cs-esc-timeline-section mt-3">
          <h5 class="cs-timeline-heading">Escalation Timeline & Notes (${comments.length})</h5>
          <div class="cs-esc-thread">
            ${comments.map(c => `
              <div class="cs-esc-bubble ${c.role === 'Customer Service' ? 'bubble-cs' : 'bubble-ops'}">
                <div class="cs-bubble-header">
                  <strong>${c.author}</strong> &bull; <span class="text-muted text-xs">${c.role}</span>
                  <span class="cs-bubble-time">${c.time}</span>
                </div>
                <div class="cs-bubble-body">
                  ${c.text.replace(/\n/g, '<br>')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ADD FOLLOW-UP COMMENT FORM -->
        <div class="cs-add-comment-box mt-3">
          <label class="cs-form-label">Add Customer Service Follow-Up Note:</label>
          <div class="cs-comment-input-row">
            <textarea 
              class="cs-textarea" 
              id="cs-followup-comment-text" 
              rows="2" 
              placeholder="Add update from customer, additional inquiry, or client urgency note..."
            ></textarea>
          </div>
          <div class="cs-comment-btn-row mt-2">
            <span class="text-xs text-muted">
              Note: Customer Service cannot resolve operational exceptions directly.
            </span>
            <button class="btn btn-primary btn-xs" onclick="CSEscalationsView.submitFollowUpComment('${esc.id}')">
              Post Follow-Up Note
            </button>
          </div>
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
  },

  submitFollowUpComment(escalationId) {
    const store = window.BRIDGES_STORE;
    const textInput = document.getElementById('cs-followup-comment-text');
    if (!textInput || !textInput.value.trim()) {
      UI.showToast('Please enter a follow-up comment before submitting.', 'error');
      return;
    }

    const updated = store.addEscalationComment(escalationId, textInput.value.trim(), 'Clara Hughes', 'Customer Service');
    if (updated) {
      UI.showToast('Follow-up comment posted successfully.', 'success');
      // Re-render modal to display new comment
      this.openDetailModal(escalationId);
      App.renderCurrentView();
    } else {
      UI.showToast('Failed to add comment to escalation.', 'error');
    }
  }
};
