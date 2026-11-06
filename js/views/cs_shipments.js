/**
 * BRIDGES Control Tower - Customer Service Shipment Search View
 * Phase 6: Multi-field search across Shipment ID, Order ID, Customer Reference,
 * and Consignee name with operational filters and customer update statuses.
 */

window.CSShipmentsView = {
  searchQuery: '',
  filterExceptionStatus: 'All',
  filterShipmentStatus: 'All',
  filterSlaRisk: 'All',
  filterEtaApprovalStatus: 'All',
  filterCustomerUpdateStatus: 'All',

  render() {
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();

    // Multi-attribute search & filtering
    const filtered = allShipments.filter(s => {
      // 1. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        const idMatch = (s.id || '').toLowerCase().includes(q);
        const orderMatch = (s.orderId || '').toLowerCase().includes(q);
        const refMatch = (s.customerReference || '').toLowerCase().includes(q);
        const custMatch = (s.customerName || '').toLowerCase().includes(q);
        const consMatch = (s.consigneeName || '').toLowerCase().includes(q);
        const originMatch = (s.origin || '').toLowerCase().includes(q);
        const destMatch = (s.destination || '').toLowerCase().includes(q);
        if (!idMatch && !orderMatch && !refMatch && !custMatch && !consMatch && !originMatch && !destMatch) {
          return false;
        }
      }

      // 2. Exception Status filter
      if (this.filterExceptionStatus !== 'All') {
        if (this.filterExceptionStatus === 'Active Exception') {
          if (!s.exceptionId || s.status === 'Delivered') return false;
        } else if (this.filterExceptionStatus === 'Resolved') {
          if (s.exceptionStatus !== 'Resolved') return false;
        } else if (this.filterExceptionStatus === 'None') {
          if (s.exceptionId) return false;
        }
      }

      // 3. Shipment Status filter
      if (this.filterShipmentStatus !== 'All' && s.status !== this.filterShipmentStatus) {
        return false;
      }

      // 4. SLA Risk filter
      if (this.filterSlaRisk !== 'All' && s.slaRisk !== this.filterSlaRisk) {
        return false;
      }

      // 5. ETA Approval Status filter
      if (this.filterEtaApprovalStatus !== 'All' && s.etaApprovalStatus !== this.filterEtaApprovalStatus) {
        return false;
      }

      // 6. Customer Update Required filter
      if (this.filterCustomerUpdateStatus !== 'All' && s.customerUpdateStatus !== this.filterCustomerUpdateStatus) {
        return false;
      }

      return true;
    });

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BANNER / HEADER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Customer Service Gateway
              </span>
              <span class="cs-user-tag">
                ${filtered.length} of ${allShipments.length} Active Shipments Indexed
              </span>
            </div>
            <h1 class="cs-banner-title">Shipment & Customer Reference Lookup</h1>
            <p class="cs-banner-subtitle">
              Locate shipments via Shipment ID, Order ID, Customer Reference, or Consignee name. Real-time approved ETAs and communication statuses.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSShipmentsView.resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Reset Filters
            </button>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('cs_ai_assistant')" style="border-color: #424989; color: #18217E; font-weight: 700;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('cs_compose')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Draft Update
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
                id="cs-shipment-search-input" 
                class="cs-search-input" 
                placeholder="Search by Shipment ID (e.g. BRG-2848), Order ID (e.g. ORD-9921), Customer Ref (e.g. CR-BIO-449), or Consignee..."
                value="${this.searchQuery}"
                oninput="CSShipmentsView.onSearchInput(this.value)"
              />
              ${this.searchQuery ? `
                <button class="cs-search-clear" onclick="CSShipmentsView.onSearchInput('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- FILTERS GRID -->
          <div class="cs-filters-grid">
            <!-- Filter 1: Exception Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Exception Status</label>
              <select class="cs-select" onchange="CSShipmentsView.onFilterChange('filterExceptionStatus', this.value)">
                <option value="All" ${this.filterExceptionStatus === 'All' ? 'selected' : ''}>All Exceptions</option>
                <option value="Active Exception" ${this.filterExceptionStatus === 'Active Exception' ? 'selected' : ''}>Active Disruption</option>
                <option value="Resolved" ${this.filterExceptionStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
                <option value="None" ${this.filterExceptionStatus === 'None' ? 'selected' : ''}>No Exception</option>
              </select>
            </div>

            <!-- Filter 2: Shipment Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Shipment Status</label>
              <select class="cs-select" onchange="CSShipmentsView.onFilterChange('filterShipmentStatus', this.value)">
                <option value="All" ${this.filterShipmentStatus === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="In Transit" ${this.filterShipmentStatus === 'In Transit' ? 'selected' : ''}>In Transit</option>
                <option value="Delayed" ${this.filterShipmentStatus === 'Delayed' ? 'selected' : ''}>Delayed</option>
                <option value="At Risk" ${this.filterShipmentStatus === 'At Risk' ? 'selected' : ''}>At Risk</option>
                <option value="Out for Delivery" ${this.filterShipmentStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="Delivered" ${this.filterShipmentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            </div>

            <!-- Filter 3: SLA Risk -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">SLA Risk</label>
              <select class="cs-select" onchange="CSShipmentsView.onFilterChange('filterSlaRisk', this.value)">
                <option value="All" ${this.filterSlaRisk === 'All' ? 'selected' : ''}>All SLA Levels</option>
                <option value="Critical SLA Breach" ${this.filterSlaRisk === 'Critical SLA Breach' ? 'selected' : ''}>Critical SLA Breach</option>
                <option value="High Risk" ${this.filterSlaRisk === 'High Risk' ? 'selected' : ''}>High Risk</option>
                <option value="Medium" ${this.filterSlaRisk === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${this.filterSlaRisk === 'Low' ? 'selected' : ''}>Low</option>
                <option value="On Schedule" ${this.filterSlaRisk === 'On Schedule' ? 'selected' : ''}>On Schedule</option>
              </select>
            </div>

            <!-- Filter 4: ETA Approval Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">ETA Approval</label>
              <select class="cs-select" onchange="CSShipmentsView.onFilterChange('filterEtaApprovalStatus', this.value)">
                <option value="All" ${this.filterEtaApprovalStatus === 'All' ? 'selected' : ''}>All ETA Statuses</option>
                <option value="Approved" ${this.filterEtaApprovalStatus === 'Approved' ? 'selected' : ''}>Approved & Confirmed</option>
                <option value="Pending Review" ${this.filterEtaApprovalStatus === 'Pending Review' ? 'selected' : ''}>Pending Operational Review</option>
              </select>
            </div>

            <!-- Filter 5: Customer Update Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Customer Update Status</label>
              <select class="cs-select" onchange="CSShipmentsView.onFilterChange('filterCustomerUpdateStatus', this.value)">
                <option value="All" ${this.filterCustomerUpdateStatus === 'All' ? 'selected' : ''}>All Update States</option>
                <option value="Action Required" ${this.filterCustomerUpdateStatus === 'Action Required' ? 'selected' : ''}>Action Required</option>
                <option value="Under Review" ${this.filterCustomerUpdateStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Up to Date" ${this.filterCustomerUpdateStatus === 'Up to Date' ? 'selected' : ''}>Up to Date</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SHIPMENTS COMPACT TABLE -->
        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-title-group">
              <h3 class="cs-card-title">Search Results</h3>
              <p class="cs-card-subtitle">Showing ${filtered.length} matching shared shipment records</p>
            </div>
            <div class="cs-table-legend">
              <span class="cs-legend-item"><span class="cs-dot dot-approved"></span> Approved ETA</span>
              <span class="cs-legend-item"><span class="cs-dot dot-pending"></span> Pending Ops Review</span>
            </div>
          </div>
          <div class="cs-card-body p-0">
            <div class="table-responsive">
              <table class="cs-table cs-table-hover">
                <thead>
                  <tr>
                    <th>Shipment & Cargo</th>
                    <th>Order & Customer Ref</th>
                    <th>Customer & Consignee</th>
                    <th>Location & Route</th>
                    <th>Carrier & Vehicle</th>
                    <th>Status & POD Confirmation</th>
                    <th>Latest Approved ETA</th>
                    <th>Recovery & SLA</th>
                    <th>Customer Outreach</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="10" class="text-center py-5">
                        <div class="cs-empty-state">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                          <h4 class="mt-2 text-dark font-semibold">No Matching Shipments Found</h4>
                          <p class="text-muted text-sm" style="max-width: 400px; margin: 4px auto 12px;">
                            No shipments match query "${this.searchQuery || 'current filters'}". Per security and data policy, new shipment records are never invented.
                          </p>
                          <button class="btn btn-secondary btn-sm" onclick="CSShipmentsView.resetFilters()">
                            Clear All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ` : filtered.map(s => {
                    const hasPendingReview = s.etaApprovalStatus === 'Pending Review' && s.proposedETA;
                    const carrier = s.carrierDetails || {};
                    const recovery = s.recoveryAction || {};
                    const pod = s.deliveryConfirmation;
                    return `
                      <tr onclick="CSShipmentsView.viewShipment('${s.id}')" style="cursor: pointer;">
                        <td>
                          <div class="cs-shipment-id-badge">
                            <strong style="color: #18217E; font-size: 13px;">${s.id}</strong>
                            <span class="text-xs text-muted" style="display: block; font-size: 10.5px; max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${s.cargoType || 'General Freight'}
                            </span>
                            ${s.exceptionId ? `
                              <span class="cs-tag-exception" title="Disruption: ${s.exceptionType || 'Exception'}">
                                ${s.exceptionType ? s.exceptionType.substring(0, 14) : 'Disrupted'}
                              </span>
                            ` : ''}
                          </div>
                        </td>
                        <td>
                          <div class="cs-ref-block">
                            <span class="cs-order-id" style="font-weight: 700;">${s.orderId || 'ORD-N/A'}</span>
                            <span class="cs-ref-sub" style="color: #424989;">Ref: <strong>${s.customerReference || 'N/A'}</strong></span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-party-block">
                            <strong class="cs-customer-name">${s.customerName || 'Customer'}</strong>
                            <span class="cs-consignee-name">&rarr; ${s.consigneeName || 'Consignee'}</span>
                          </div>
                        </td>
                        <td>
                          <div class="cs-route-badge" style="margin-bottom: 3px;">
                            <span>${s.origin ? s.origin.split(',')[0] : 'Origin'}</span>
                            <span class="cs-route-arrow">&rarr;</span>
                            <span>${s.destination ? s.destination.split(',')[0] : 'Dest'}</span>
                          </div>
                          <div style="font-size: 10.5px; color: #18217E; display: flex; align-items: center; gap: 4px;">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>${s.currentLocation || 'In Transit Corridor'}</span>
                          </div>
                        </td>
                        <td>
                          <div style="font-size: 11.5px; line-height: 1.35;">
                            <strong style="color: #070724; display: block;">${carrier.carrierName || 'Apex Logistics'}</strong>
                            <span style="color: #424989; font-size: 10.5px; display: block;">${carrier.vehiclePlate || 'TX-TRK-8821'} &bull; ${carrier.driverName || 'Marcus Vance'}</span>
                          </div>
                        </td>
                        <td>
                          <span class="badge ${
                            s.status === 'In Transit' ? 'badge-primary' :
                            s.status === 'Delayed' || s.status === 'At Risk' ? 'badge-danger' :
                            s.status === 'Out for Delivery' ? 'badge-warning' :
                            s.status === 'Delivered' ? 'badge-success' : 'badge-neutral'
                          }">
                            ${s.status}
                          </span>
                          ${pod ? `
                            <div style="margin-top: 3px; font-size: 10px; color: #10B981; font-weight: 700; display: flex; align-items: center; gap: 3px;">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                              POD Signed (${pod.receivedQty} pcs)
                            </div>
                          ` : ''}
                        </td>
                        <td>
                          <div class="cs-eta-cell">
                            <span class="cs-approved-eta-badge">${s.approvedETA || s.eta || 'TBD'}</span>
                            ${hasPendingReview ? `
                              <span class="cs-eta-pending-pill" title="Proposed ETA ${s.proposedETA} is awaiting operational approval">
                                Review Pending
                              </span>
                            ` : `
                              <span class="cs-eta-approved-pill">Confirmed</span>
                            `}
                          </div>
                        </td>
                        <td>
                          <span class="badge ${
                            s.slaRisk === 'Critical SLA Breach' ? 'badge-danger' :
                            s.slaRisk === 'High Risk' ? 'badge-warning' :
                            s.slaRisk === 'Medium' ? 'badge-info' : 'badge-neutral'
                          }">
                            ${s.slaRisk || 'On Schedule'}
                          </span>
                          <span style="display: block; font-size: 10px; color: #424989; margin-top: 2px;">
                            ${recovery.status === 'Active Recovery in Progress' ? `⚡ ${recovery.planTitle.slice(0, 22)}...` : 'Nominal'}
                          </span>
                        </td>
                        <td>
                          <span class="cs-status-pill ${
                            s.customerUpdateStatus === 'Action Required' ? 'status-action-required' :
                            s.customerUpdateStatus === 'Under Review' ? 'status-under-review' :
                            'status-up-to-date'
                          }">
                            ${s.customerUpdateStatus || 'Up to Date'}
                          </span>
                        </td>
                        <td class="text-right" onclick="event.stopPropagation()">
                          <div class="cs-action-btn-group" style="display: flex; gap: 4px; justify-content: flex-end;">
                            <button class="btn btn-outline btn-xs" onclick="CSShipmentsView.viewShipment('${s.id}')" title="View shipment visibility & details">
                              Details
                            </button>
                            <button class="btn btn-secondary btn-xs" onclick="CSShipmentsView.askAI('${s.id}')" title="Ask AI about status, exception, recovery & ETA" style="border-color: #424989; color: #18217E; font-weight: 700;">
                              Ask AI
                            </button>
                            <button class="btn btn-outline btn-xs" onclick="CSShipmentsView.openAddNoteModal('${s.id}')" title="Log customer call/communication note">
                              + Note
                            </button>
                            <button class="btn btn-primary btn-xs" onclick="CSShipmentsView.draftUpdate('${s.id}')" title="Draft customer notification">
                              Update
                            </button>
                          </div>
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
    this.filterExceptionStatus = 'All';
    this.filterShipmentStatus = 'All';
    this.filterSlaRisk = 'All';
    this.filterEtaApprovalStatus = 'All';
    this.filterCustomerUpdateStatus = 'All';
    App.renderCurrentView();
    UI.showToast('Search and filters reset.', 'info');
  },

  viewShipment(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  draftUpdate(shipmentId) {
    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_compose');
  },

  askAI(shipmentId) {
    if (window.CSAIAssistantView) {
      window.CSAIAssistantView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_ai_assistant');
  },

  openAddNoteModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(shipmentId);
    if (!shipment) return;

    UI.openModal('generic-app-modal', `Add Customer Communication Note — ${shipment.id}`, `
      <form id="cs-note-form" onsubmit="event.preventDefault(); CSShipmentsView.saveNote('${shipment.id}');">
        <div style="font-size: 12px; color: #393A50; margin-bottom: 14px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; padding: 10px;">
          <div>Shipment: <strong>${shipment.id}</strong> (${shipment.orderId}) &bull; Customer: <strong>${shipment.customerName}</strong></div>
          <div style="margin-top: 3px; color: #424989;">Approved ETA: <strong>${shipment.approvedETA}</strong> &bull; Status: <span class="badge badge-sm badge-primary">${shipment.status}</span></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Contact Person</label>
            <input type="text" id="note-contact-person" class="login-input" value="${shipment.customerContact || 'Logistics Coordinator'}" required style="padding: 6px 10px; font-size: 12px;">
          </div>
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Interaction Channel</label>
            <select id="note-channel" class="cs-select" style="width: 100%; padding: 6px 10px; font-size: 12px;">
              <option value="Inbound Phone Call">Inbound Phone Call</option>
              <option value="Outbound Follow-up Call">Outbound Follow-up Call</option>
              <option value="Direct Email Inquiry">Direct Email Inquiry</option>
              <option value="Customer Portal Ticket">Customer Portal Ticket</option>
              <option value="Live Chat Session">Live Chat Session</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Customer Sentiment / Mood</label>
          <select id="note-sentiment" class="cs-select" style="width: 100%; padding: 6px 10px; font-size: 12px;">
            <option value="Satisfied">Satisfied / Reassured</option>
            <option value="Inquiring / Neutral" selected>Inquiring / Neutral</option>
            <option value="Concerned / Anxious">Concerned / Anxious</option>
            <option value="Frustrated / Escalation Risk">Frustrated / Escalation Risk</option>
          </select>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Communication Notes & Summary</label>
          <textarea id="note-body" class="login-input" rows="4" placeholder="Record summary of customer conversation, questions answered, and agreed commitments..." required style="padding: 8px 10px; font-size: 12px; width: 100%; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Communication Note</button>
        </div>
      </form>
    `);
  },

  saveNote(shipmentId) {
    const contactPerson = document.getElementById('note-contact-person')?.value;
    const channel = document.getElementById('note-channel')?.value;
    const sentiment = document.getElementById('note-sentiment')?.value;
    const note = document.getElementById('note-body')?.value;

    if (!note || !note.trim()) {
      UI.showToast('Please enter note text.', 'error');
      return;
    }

    window.BRIDGES_STORE.addCommunicationNote(shipmentId, {
      contactPerson,
      channel,
      sentiment,
      note: note.trim()
    });

    UI.closeModal('generic-app-modal');
    UI.showToast(`Saved customer communication note for ${shipmentId}.`, 'success');
    App.renderCurrentView();
  }
};
