/**
 * BRIDGES - Customer Role: Delivery History (Page G)
 * Displays a clean, professional history of completed/delivered shipments for the authenticated customer.
 * Strictly isolates records to the authenticated customer account.
 */

window.CustHistoryView = {
  searchQuery: '',
  dateFilter: 'all', // 'all', '7days', '30days', '90days'

  render(container) {
    const target = container || document.getElementById('app-main-content');
    const store = window.BRIDGES_STORE;
    const customer = store.getCurrentCustomerContext();

    // Fetch only customer's shipments
    const allCustomerShipments = store.getCustomerShipments(customer.customerId);
    const deliveredShipments = allCustomerShipments.filter(s => s.status === 'Delivered');

    // Apply search filter
    let filtered = deliveredShipments;
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(s => 
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.orderReference && s.orderReference.toLowerCase().includes(q)) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        (s.destination && s.destination.toLowerCase().includes(q))
      );
    }

    // Apply date filter
    if (this.dateFilter !== 'all') {
      const now = new Date().getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      let maxAgeDays = 30;
      if (this.dateFilter === '7days') maxAgeDays = 7;
      if (this.dateFilter === '30days') maxAgeDays = 30;
      if (this.dateFilter === '90days') maxAgeDays = 90;

      filtered = filtered.filter(s => {
        const delivDate = s.actualArrival || s.lastOperationalUpdate || s.createdAt;
        if (!delivDate) return true;
        const dTime = new Date(delivDate).getTime();
        return (now - dTime) <= (maxAgeDays * dayMs);
      });
    }

    // Sort by delivery date descending
    filtered.sort((a, b) => {
      const dateA = new Date(a.actualArrival || a.lastOperationalUpdate || 0);
      const dateB = new Date(b.actualArrival || b.lastOperationalUpdate || 0);
      return dateB - dateA;
    });

    const html = `
      <div class="cust-portal">
        <!-- Customer Header Banner -->
        <div class="cust-header-banner">
          <div>
            <div class="cust-header-tagline">
              <span class="cust-pulse-dot" style="background:#15803d;"></span> Completed Shipments
            </div>
            <h1 class="cust-header-title">Delivery History</h1>
            <p class="cust-header-sub">
              Review completed consignments, delivery dates, and past shipment records for 
              <strong>${this.escapeHtml(customer.customerName)}</strong>.
            </p>
          </div>
          <div class="cust-banner-badge">
            <span style="font-size: 13px; font-weight: 700; color: #15803d;">
              ${deliveredShipments.length} Completed Total
            </span>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="cust-card" style="padding: 16px 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <!-- Date Filter Pills -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #8A9995; text-transform: uppercase;">Timeframe:</span>
              <div class="cust-tabs" style="margin-bottom: 0; border-bottom: none;">
                <button class="cust-tab-btn ${this.dateFilter === 'all' ? 'active' : ''}" data-date="all">
                  All Time (${deliveredShipments.length})
                </button>
                <button class="cust-tab-btn ${this.dateFilter === '7days' ? 'active' : ''}" data-date="7days">
                  Past 7 Days
                </button>
                <button class="cust-tab-btn ${this.dateFilter === '30days' ? 'active' : ''}" data-date="30days">
                  Past 30 Days
                </button>
                <button class="cust-tab-btn ${this.dateFilter === '90days' ? 'active' : ''}" data-date="90days">
                  Past 90 Days
                </button>
              </div>
            </div>

            <!-- Search Bar -->
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; max-width: 320px; min-width: 200px;">
              <div style="position: relative; width: 100%;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="2" style="position: absolute; left: 10px; top: 11px;">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  id="custHistorySearchInput" 
                  class="cust-form-input" 
                  placeholder="Search by ID, order, route..." 
                  value="${this.escapeHtml(this.searchQuery)}"
                  style="padding-left: 32px; font-size: 13px;"
                />
              </div>
              ${this.searchQuery ? `
                <button id="custClearHistorySearchBtn" class="cust-btn cust-btn-secondary" style="padding: 6px 10px; font-size: 12px;">
                  Clear
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Deliveries Table / List -->
        ${filtered.length === 0 ? `
          <div class="cust-card cust-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="cust-empty-title">No Delivered Shipments Found</div>
            <div class="cust-empty-desc">
              ${this.searchQuery || this.dateFilter !== 'all' 
                ? 'No delivered shipments match your search or timeframe criteria.' 
                : 'There are currently no delivered shipments recorded for your customer account.'}
            </div>
            ${this.searchQuery || this.dateFilter !== 'all' ? `
              <button class="cust-btn cust-btn-secondary" id="custResetHistoryBtn" style="margin-top: 14px;">
                Reset Filters
              </button>
            ` : `
              <a href="#/customer_track" class="cust-btn cust-btn-primary" style="margin-top: 14px;">
                Track Active Shipments
              </a>
            `}
          </div>
        ` : `
          <div class="cust-card" style="padding: 0; overflow: hidden;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                  <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; color: #475569; font-weight: 700;">
                    <th style="padding: 14px 20px;">Shipment Reference</th>
                    <th style="padding: 14px 20px;">Order Ref</th>
                    <th style="padding: 14px 20px;">Origin &rarr; Destination</th>
                    <th style="padding: 14px 20px;">Delivery Date</th>
                    <th style="padding: 14px 20px;">Delivery Status</th>
                    <th style="padding: 14px 20px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map((s, index) => {
                    const delivDate = s.actualArrival || s.lastOperationalUpdate;
                    return `
                      <tr style="border-bottom: 1px solid #E2E8F0; background: ${index % 2 === 0 ? '#ffffff' : '#fafafa'}; transition: background 0.15s ease;">
                        <td style="padding: 14px 20px;">
                          <div style="font-weight: 800; color: #070724; font-size: 14px;">${this.escapeHtml(s.id)}</div>
                          <div style="font-size: 11px; color: #8A9995;">Tracking Available</div>
                        </td>
                        <td style="padding: 14px 20px; font-weight: 600; color: #393A50;">
                          ${this.escapeHtml(s.orderReference || 'N/A')}
                        </td>
                        <td style="padding: 14px 20px;">
                          <div style="font-weight: 600; color: #070724;">
                            ${this.escapeHtml(s.origin)} &rarr; ${this.escapeHtml(s.destination)}
                          </div>
                          <div style="font-size: 11px; color: #8A9995;">
                            ${s.distanceKm ? s.distanceKm + ' km total' : 'Road Freight'}
                          </div>
                        </td>
                        <td style="padding: 14px 20px;">
                          <div style="font-weight: 700; color: #15803d;">
                            ${this.formatDateTime(delivDate)}
                          </div>
                          <div style="font-size: 11px; color: #8A9995;">
                            Actual delivery
                          </div>
                        </td>
                        <td style="padding: 14px 20px;">
                          <span class="cust-badge cust-badge-delivered">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Delivered
                          </span>
                        </td>
                        <td style="padding: 14px 20px; text-align: right;">
                          <a href="#/customer_shipment_detail?id=${this.escapeHtml(s.id)}" class="cust-btn cust-btn-secondary" style="padding: 6px 14px; font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                            <span>View Details</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </a>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div style="padding: 14px 20px; background: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 12px; color: #8A9995; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <span>Showing ${filtered.length} of ${deliveredShipments.length} delivered shipments</span>
              <span>All delivery records verified by carrier sign-off</span>
            </div>
          </div>
        `}
      </div>
    `;

    if (target) {
      target.innerHTML = html;
      this.bindEvents(target);
    }
    return html;
  },

  bindEvents(container) {
    // Date filter tabs
    container.querySelectorAll('.cust-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.dateFilter = btn.getAttribute('data-date');
        this.render(container);
      };
    });

    // Search input
    const searchInput = container.querySelector('#custHistorySearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
        const newInp = container.querySelector('#custHistorySearchInput');
        if (newInp) {
          newInp.focus();
          newInp.setSelectionRange(newInp.value.length, newInp.value.length);
        }
      };
    }

    // Clear search
    const clearBtn = container.querySelector('#custClearHistorySearchBtn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.searchQuery = '';
        this.render(container);
      };
    }

    // Reset filters
    const resetBtn = container.querySelector('#custResetHistoryBtn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.searchQuery = '';
        this.dateFilter = 'all';
        this.render(container);
      };
    }
  },

  formatDateTime(isoStr) {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
