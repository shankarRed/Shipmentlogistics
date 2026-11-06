/**
 * BRIDGES Control Tower - Customer Track Shipment View
 * Phase 7: Customer-facing search by Shipment ID, Order reference, or Customer reference.
 * Strictly isolates searches to shipments belonging to the authenticated customer account.
 */

window.CustTrackView = {
  searchQuery: '',
  filterStatus: 'All',

  render(container) {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(ctx.customerId);

    // Multi-reference search restricted to customer's own shipments
    const filtered = customerShipments.filter(s => {
      // 1. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        const idMatch = (s.id || '').toLowerCase().includes(q);
        const orderMatch = (s.orderReference || '').toLowerCase().includes(q);
        const refMatch = (s.customerReference || '').toLowerCase().includes(q);
        const originMatch = (s.origin || '').toLowerCase().includes(q);
        const destMatch = (s.destination || '').toLowerCase().includes(q);
        const cargoMatch = (s.cargoType || '').toLowerCase().includes(q);
        if (!idMatch && !orderMatch && !refMatch && !originMatch && !destMatch && !cargoMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (this.filterStatus !== 'All' && s.status !== this.filterStatus) {
        return false;
      }

      return true;
    });

    const html = `
      <div class="cust-view-container animate-fade-in">
        <!-- TOP ISOLATION BANNER -->
        <div class="cust-account-strip">
          <div class="cust-account-strip-left">
            <span class="customer-isolation-indicator">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Account Sandbox
            </span>
            <span>Searching authorized shipments for <strong>${ctx.customerName}</strong> (${customerShipments.length} total)</span>
          </div>
          <div>
            <span style="font-size: 11px; color: #8A9995;">Other accounts' freight records are strictly isolated and hidden.</span>
          </div>
        </div>

        <!-- HEADER BANNER -->
        <div class="cust-header-banner">
          <div class="cust-banner-info">
            <div class="cust-badge-row">
              <span class="customer-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Track & Trace
              </span>
            </div>
            <h1 class="cust-banner-title">Track Your Shipments</h1>
            <p class="cust-banner-subtitle">
              Enter your Shipment ID, Order Reference, or Customer PO to view live progress milestones and verified delivery times.
            </p>
          </div>
          <div class="cust-banner-actions">
            <button class="btn btn-sm" style="background: rgba(24, 33, 126, 0.08); color: #18217E; border: 1px solid rgba(24, 33, 126, 0.25); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px;" onclick="App.navigateTo('customer_ai_assistant')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CustTrackView.resetSearch()">
              Reset Search
            </button>
          </div>
        </div>

        <!-- SEARCH AND FILTER INPUT CARD -->
        <div class="cust-card">
          <div class="cust-card-body" style="padding: 16px 18px;">
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 260px; position: relative;">
                <input 
                  type="text" 
                  class="cust-form-input" 
                  placeholder="Enter Order Number (e.g. ORD-7721), Shipment ID (e.g. BRG-2847), or PO (e.g. PO-88248)..."
                  value="${this.searchQuery}"
                  oninput="CustTrackView.onSearchInput(this.value)"
                  style="padding-left: 36px;"
                />
                <svg style="position: absolute; left: 12px; top: 12px; color: #8A9995;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>

              <div style="width: 180px;">
                <select class="cust-form-select" onchange="CustTrackView.onStatusFilter(this.value)">
                  <option value="All" ${this.filterStatus === 'All' ? 'selected' : ''}>All Statuses</option>
                  <option value="In Transit" ${this.filterStatus === 'In Transit' ? 'selected' : ''}>In Transit</option>
                  <option value="Delayed" ${this.filterStatus === 'Delayed' ? 'selected' : ''}>Delayed</option>
                  <option value="Delivered" ${this.filterStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- SHIPMENTS RESULT TABLE / CARDS -->
        <div class="cust-card">
          <div class="cust-card-header">
            <div class="cust-card-title-group">
              <h3 class="cust-card-title">Matching Shipments (${filtered.length})</h3>
              <p class="cust-card-subtitle">Displaying verified shipments registered to your customer account</p>
            </div>
          </div>
          <div class="cust-card-body p-0">
            <div class="table-responsive">
              <table class="cust-table">
                <thead>
                  <tr>
                    <th>Shipment Reference</th>
                    <th>Order Number & PO</th>
                    <th>Route & Live Location</th>
                    <th>Delivery Status</th>
                    <th>Planned vs Approved ETA</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="6" class="text-center py-5">
                        <div class="cust-empty-state">
                          <svg class="cust-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                          <h4 style="font-weight: 700; color: #070724; margin: 4px 0;">No Matching Shipments Found</h4>
                          <p class="text-muted" style="font-size: 12.5px; max-width: 440px; margin: 0 auto 12px;">
                            No shipments match "${this.searchQuery || 'selected criteria'}" within account <strong>${ctx.customerName}</strong>.
                            Per security protocol, unauthorized shipments cannot be viewed.
                          </p>
                          <button class="btn btn-secondary btn-sm" onclick="CustTrackView.resetSearch()">
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ` : filtered.map(s => `
                    <tr onclick="CustTrackView.viewTracking('${s.id}')" style="cursor: pointer;">
                      <td>
                        <strong style="color: #18217E; font-size: 13.5px;">${s.id}</strong>
                        <div style="font-size: 11px; color: #8A9995;">${s.cargoType || 'Freight'}</div>
                      </td>
                      <td>
                        <div style="font-size: 13px; font-weight: 700; color: #070724;">Order: ${s.orderId || s.orderReference || 'ORD-7721'}</div>
                        <div style="font-size: 11px; color: #64748B;">PO: ${s.customerReference || 'N/A'}</div>
                      </td>
                      <td>
                        <div style="font-weight: 600; color: #070724;">
                          ${s.origin.split(',')[0]} <span style="color: #8A9995;">&rarr;</span> ${s.destination.split(',')[0]}
                        </div>
                        <div style="font-size: 11px; color: #18217E; font-weight: 600; margin-top: 3px; display: inline-flex; align-items: center; gap: 4px;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          Live Location: ${s.currentLocation || s.origin}
                        </div>
                      </td>
                      <td>
                        <span class="cust-status-badge ${
                          s.status === 'Delayed' || s.status === 'At Risk' ? 'status-delayed' :
                          s.status === 'Delivered' ? 'status-delivered' : 'status-in-transit'
                        }">
                          ${s.status === 'Delivered' ? 'Delivered & Verified' : s.status}
                        </span>
                        ${s.status === 'Delivered' ? `
                          <div style="font-size: 10.5px; color: #166534; font-weight: 600; margin-top: 3px;">
                            ✓ POD Signed (${s.deliveryConfirmation ? s.deliveryConfirmation.receivedQty : 340} Pcs)
                          </div>
                        ` : ''}
                      </td>
                      <td>
                        <div class="cust-approved-eta-badge">
                          Approved: ${s.approvedETA ? s.approvedETA.slice(0, 16).replace('T', ' ') : 'Pending'}
                        </div>
                        <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">
                          Planned: ${s.plannedETA ? s.plannedETA.slice(0, 16).replace('T', ' ') : (s.deliveryCommitment || '13:00 CDT')}
                        </div>
                      </td>
                      <td class="text-right" onclick="event.stopPropagation()">
                        <div style="display: inline-flex; align-items: center; gap: 6px;">
                          <button class="btn btn-outline btn-xs" onclick="CustTrackView.askAI('${s.id}')" title="Ask AI assistant about this shipment">
                            Ask AI
                          </button>
                          <button class="btn btn-primary btn-xs" onclick="CustTrackView.viewTracking('${s.id}')">
                            View Timeline
                          </button>
                        </div>
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
    if (container) container.innerHTML = html;
    return html;
  },

  onSearchInput(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  onStatusFilter(val) {
    this.filterStatus = val;
    App.renderCurrentView();
  },

  resetSearch() {
    this.searchQuery = '';
    this.filterStatus = 'All';
    App.renderCurrentView();
    UI.showToast('Search filters cleared.', 'info');
  },

  viewTracking(shipmentId) {
    if (window.CustShipmentDetailView) {
      window.CustShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_shipment_detail');
  },

  askAI(shipmentId) {
    if (window.CustAIAssistantView) {
      window.CustAIAssistantView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_ai_assistant');
  }
};
