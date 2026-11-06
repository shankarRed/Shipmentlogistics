/**
 * BRIDGES Control Tower - Warehouse Activity History View
 * Phase 5: Complete tamper-evident audit history of all operational events at warehouse facility
 * Read-only log of readiness updates, dock scheduling, picking/packing, loading, handovers, diversions, and blockers.
 */

window.WarehouseHistoryView = {
  state: {
    searchTerm: '',
    actionFilter: 'ALL',
    page: 1,
    pageSize: 12
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    let activity = store.getWarehouseActivity(whId);

    // Apply Filter
    if (this.state.actionFilter !== 'ALL') {
      activity = activity.filter(a => a.action && a.action.toLowerCase().includes(this.state.actionFilter.toLowerCase()));
    }

    if (this.state.searchTerm.trim()) {
      const q = this.state.searchTerm.toLowerCase().trim();
      activity = activity.filter(a => 
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.shipmentId && a.shipmentId.toLowerCase().includes(q)) ||
        (a.action && a.action.toLowerCase().includes(q)) ||
        (a.user && a.user.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q)) ||
        (a.previousStatus && a.previousStatus.toLowerCase().includes(q)) ||
        (a.newStatus && a.newStatus.toLowerCase().includes(q))
      );
    }

    // Pagination
    const totalCount = activity.length;
    const totalPages = Math.ceil(totalCount / this.state.pageSize) || 1;
    if (this.state.page > totalPages) this.state.page = totalPages;
    const startIndex = (this.state.page - 1) * this.state.pageSize;
    const pagedEntries = activity.slice(startIndex, startIndex + this.state.pageSize);

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Warehouse Activity & Audit History</h2>
            <p class="warehouse-view-subheading">
              Immutable ledger of readiness clearances, dock reservations, picking lines, loading events, and custody handovers for ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <span class="warehouse-sim-tag" style="padding: 6px 12px; font-size: 11px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Read-Only Audit Trail
            </span>
            <button class="btn btn-secondary btn-sm" onclick="WarehouseHistoryView.resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
              Reset Filters
            </button>
          </div>
        </div>

        <!-- FILTER TOOLBAR -->
        <div class="warehouse-filter-panel">
          <div class="warehouse-filter-row">
            <div class="warehouse-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search audit trail by shipment ID, action, user, or note content..." 
                value="${this.state.searchTerm}"
                oninput="WarehouseHistoryView.onSearch(this.value)"
              >
            </div>

            <div class="warehouse-filter-group">
              <label>Event Type:</label>
              <select onchange="WarehouseHistoryView.setFilter('actionFilter', this.value)">
                <option value="ALL" ${this.state.actionFilter === 'ALL' ? 'selected' : ''}>All Events</option>
                <option value="Readiness" ${this.state.actionFilter === 'Readiness' ? 'selected' : ''}>Readiness Updates</option>
                <option value="Dock" ${this.state.actionFilter === 'Dock' ? 'selected' : ''}>Dock Scheduling</option>
                <option value="Picking" ${this.state.actionFilter === 'Picking' ? 'selected' : ''}>Picking Progress</option>
                <option value="Packing" ${this.state.actionFilter === 'Packing' ? 'selected' : ''}>Packing Progress</option>
                <option value="Loading" ${this.state.actionFilter === 'Loading' ? 'selected' : ''}>Loading Milestones</option>
                <option value="Handover" ${this.state.actionFilter === 'Handover' ? 'selected' : ''}>Carrier Handover</option>
                <option value="Diversion" ${this.state.actionFilter === 'Diversion' ? 'selected' : ''}>Diversions & Receiving</option>
                <option value="Blocker" ${this.state.actionFilter === 'Blocker' ? 'selected' : ''}>Warehouse Blockers</option>
              </select>
            </div>
          </div>
        </div>

        <!-- AUDIT TABLE -->
        <div class="warehouse-card">
          <div class="warehouse-table-responsive">
            <table class="warehouse-table">
              <thead>
                <tr>
                  <th style="width: 14%;">Timestamp</th>
                  <th style="width: 12%;">Acting User</th>
                  <th style="width: 12%;">Shipment</th>
                  <th style="width: 18%;">Action Performed</th>
                  <th style="width: 16%;">State Transition</th>
                  <th style="width: 28%;">Operational Notes & Rationale</th>
                </tr>
              </thead>
              <tbody>
                ${pagedEntries.length === 0 ? `
                  <tr>
                    <td colspan="6" class="warehouse-empty-cell">
                      <div class="warehouse-empty-state">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <p style="font-weight: 600; margin: 8px 0 2px;">No activity logs found</p>
                        <p class="text-xs text-muted">Try clearing the search filter.</p>
                      </div>
                    </td>
                  </tr>
                ` : pagedEntries.map(e => `
                  <tr class="warehouse-table-row">
                    <td class="font-mono text-xs">
                      <div>${new Date(e.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div class="text-muted">${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    </td>
                    <td>
                      <div class="cell-primary font-bold text-xs">${e.user}</div>
                      <div class="cell-sub text-truncate" style="max-width: 130px;">${e.warehouse}</div>
                    </td>
                    <td class="font-mono font-bold">
                      ${e.shipmentId && e.shipmentId !== 'GENERAL' && e.shipmentId !== 'N/A' && e.shipmentId !== 'WAR-ROOM-ESCALATION' ? `
                        <a href="javascript:void(0)" onclick="WarehouseShipmentsView.openDetailModal('${e.shipmentId}')" style="color: #18217E; text-decoration: none;">
                          ${e.shipmentId}
                        </a>
                      ` : `<span class="badge badge-subtle">${e.shipmentId}</span>`}
                    </td>
                    <td>
                      <span class="badge badge-dock">${e.action}</span>
                    </td>
                    <td>
                      <div class="transition-pill">
                        <span class="trans-prev font-mono">${e.previousStatus || 'None'}</span>
                        <span class="trans-arrow">&rarr;</span>
                        <span class="trans-new font-mono font-bold">${e.newStatus || 'Updated'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="cell-primary" style="font-size: 12px; line-height: 1.4;">${e.notes || 'Routine execution event.'}</div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- PAGINATION FOOTER -->
          <div class="warehouse-table-footer">
            <div class="warehouse-pagination-info">
              Showing <strong>${totalCount === 0 ? 0 : startIndex + 1} - ${Math.min(startIndex + this.state.pageSize, totalCount)}</strong> of <strong>${totalCount}</strong> historical events
            </div>
            <div class="warehouse-pagination-controls">
              <button 
                class="btn btn-outline btn-xs" 
                ${this.state.page <= 1 ? 'disabled' : ''} 
                onclick="WarehouseHistoryView.changePage(${this.state.page - 1})"
              >
                &larr; Prev
              </button>
              <span class="warehouse-page-num">Page ${this.state.page} of ${totalPages}</span>
              <button 
                class="btn btn-outline btn-xs" 
                ${this.state.page >= totalPages ? 'disabled' : ''} 
                onclick="WarehouseHistoryView.changePage(${this.state.page + 1})"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onSearch(val) {
    this.state.searchTerm = val;
    this.state.page = 1;
    App.renderCurrentView();
  },

  setFilter(prop, val) {
    this.state[prop] = val;
    this.state.page = 1;
    App.renderCurrentView();
  },

  changePage(p) {
    this.state.page = p;
    App.renderCurrentView();
  },

  resetFilters() {
    this.state = {
      searchTerm: '',
      actionFilter: 'ALL',
      page: 1,
      pageSize: 12
    };
    App.renderCurrentView();
  }
};
