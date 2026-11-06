/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Carrier Activity History (US-18)
 * Searchable, filterable audit log of carrier operational decisions and actions
 */

const CarrierHistoryView = {
  actionFilter: 'all',
  searchQuery: '',

  render() {
    const store = window.BRIDGES_STORE;
    const history = store.getCarrierActivityHistory();

    const actionTypes = [
      'All Actions',
      'Recovery Request Accepted',
      'Recovery Request Rejected',
      'Fleet Resources Assigned',
      'Dispatch Confirmed',
      'Milestone',
      'ETA Updated',
      'Disruption Reported',
      'Re-Route Request',
      'Expedite Request',
      'Split Request',
      'Delivery Confirmed'
    ];

    return `
      <div class="carrier-history-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Carrier Operations Activity Log &bull; Bridges Global Logistics</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Traceable chronological audit trail of request responses, driver assignments, dispatch records, ETA adjustments, and POD confirmations.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.renderCurrentView()" style="font-weight: 600;">
            ${Icons.history(14)} Refresh Activity
          </button>
        </div>

        <!-- Filter & Search Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <!-- Action Dropdown Filter -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 12px; font-weight: 600; color: #393A50;" for="carrier-history-action-filter">Filter Action:</label>
            <select id="carrier-history-action-filter" class="carrier-form-select" onchange="CarrierHistoryView.setActionFilter(this.value)" style="width: 220px; padding: 6px 10px; font-size: 12px;">
              ${actionTypes.map(a => `
                <option value="${a === 'All Actions' ? 'all' : a}" ${this.actionFilter === (a === 'All Actions' ? 'all' : a) ? 'selected' : ''}>${a}</option>
              `).join('')}
            </select>
          </div>

          <!-- Search Input -->
          <div style="position: relative; width: 280px;">
            <input type="text" id="carrier-history-search" placeholder="Search user, shipment, action, outcome..." value="${this.searchQuery}" oninput="CarrierHistoryView.handleSearch(this.value)" class="carrier-form-input" style="padding: 6px 10px 6px 28px; font-size: 12px;">
            <span style="position: absolute; left: 9px; top: 7px; color: #8A9995;">${Icons.search(13)}</span>
          </div>
        </div>

        <!-- Table Container -->
        <div id="carrier-history-table-container">
          ${this.renderTableContent()}
        </div>
      </div>
    `;
  },

  setActionFilter(action) {
    this.actionFilter = action;
    const container = document.getElementById('carrier-history-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  handleSearch(q) {
    this.searchQuery = q;
    const container = document.getElementById('carrier-history-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  getFilteredHistory() {
    const store = window.BRIDGES_STORE;
    let list = store.getCarrierActivityHistory();

    if (this.actionFilter !== 'all') {
      list = list.filter(item => item.action && item.action.toLowerCase().includes(this.actionFilter.toLowerCase()));
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item =>
        (item.user && item.user.toLowerCase().includes(q)) ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.outcome && item.outcome.toLowerCase().includes(q)) ||
        (item.shipmentId && item.shipmentId.toLowerCase().includes(q)) ||
        (item.recoveryRequestId && item.recoveryRequestId.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTableContent() {
    const history = this.getFilteredHistory();

    if (history.length === 0) {
      return `
        <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
          <div class="carrier-empty-icon">${Icons.history(26)}</div>
          <div class="carrier-empty-title">No Activity Records Found</div>
          <p class="carrier-empty-desc">
            No activity log entries match the selected filter criteria.
          </p>
        </div>
      `;
    }

    return `
      <div class="carrier-card-section" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
            <thead style="background: #F8FAFB;">
              <tr>
                <th style="padding: 11px 14px;">Timestamp</th>
                <th>User / Actor</th>
                <th>Shipment ID</th>
                <th>Recovery Request</th>
                <th>Action Taken</th>
                <th>Operational Outcome / Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(item => {
                let actionBadgeColor = '#18217E';
                let actionBadgeBg = 'rgba(24,33,126,0.08)';

                if (item.action.includes('Rejected') || item.action.includes('Disruption')) {
                  actionBadgeColor = '#EA341F';
                  actionBadgeBg = '#FFF1F0';
                } else if (item.action.includes('Confirmed') || item.action.includes('Delivery') || item.action.includes('Accepted')) {
                  actionBadgeColor = '#059669';
                  actionBadgeBg = '#ECFDF5';
                } else if (item.action.includes('Assigned')) {
                  actionBadgeColor = '#3B82F6';
                  actionBadgeBg = '#EFF6FF';
                }

                return `
                  <tr>
                    <td style="padding: 11px 14px; white-space: nowrap;">
                      <div style="font-weight: 700; color: #070724;">
                        ${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div style="font-size: 10.5px; color: #8A9995;">
                        ${new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #070724;">${item.user || 'Marcus Vance'}</div>
                      <div style="font-size: 10px; color: #8A9995;">Carrier Operations</div>
                    </td>
                    <td>
                      <span style="font-weight: 700; color: #18217E;">${item.shipmentId || '—'}</span>
                    </td>
                    <td>
                      <span style="font-weight: 600; color: #424989;">${item.recoveryRequestId || '—'}</span>
                    </td>
                    <td>
                      <span class="carrier-badge" style="background: ${actionBadgeBg}; color: ${actionBadgeColor}; border: 1px solid ${actionBadgeColor}33;">
                        ${item.action}
                      </span>
                    </td>
                    <td style="max-width: 320px; line-height: 1.4; color: #393A50;">
                      ${item.outcome || 'Action logged to carrier operations record.'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

window.CarrierHistoryView = CarrierHistoryView;
