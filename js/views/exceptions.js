/**
 * BRIDGES Control Tower - Exception Management & History View
 * Streamlined tab container for Opened and Closed exceptions with carrier assignment.
 */

const ExceptionHistoryView = {
  activeTab: 'open', // 'open' | 'closed'
  currentFilters: {
    search: '',
    severity: 'ALL',
    carrierId: 'ALL',
    sortBy: 'date',
    sortOrder: 'desc'
  },

  switchTab(tab) {
    this.activeTab = tab;
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  getCarrierForException(e) {
    const store = window.BRIDGES_STORE;
    let carrierId = e.carrierId;
    if (!carrierId && e.shipmentId && store) {
      const shipment = store.getShipment(e.shipmentId);
      if (shipment) carrierId = shipment.carrierId;
    }
    const carrier = carrierId && store ? store.getCarrier(carrierId) : null;
    return {
      id: carrierId || 'CAR-01',
      name: carrier ? carrier.name : (carrierId ? carrierId : 'Bridges Global Logistics')
    };
  },

  render() {
    const store = window.BRIDGES_STORE;
    const allExceptions = store ? store.getExceptions() : [];
    const carriers = store ? store.getCarriers() : [];
    
    const openCount = allExceptions.filter(e => e.status !== 'Resolved' && e.status !== 'Closed').length;
    const closedCount = allExceptions.filter(e => e.status === 'Resolved' || e.status === 'Closed').length;

    const displayedExceptions = this.getFilteredExceptions();

    return `
      <div class="view-exceptions animate-fade-in">
        <!-- Header -->
        <div class="page-action-header mb-3">
          <div class="header-text-block">
            <h2 class="page-heading">Exception Management &amp; History</h2>
            <p class="page-subheading">Track, coordinate, and review active carrier disruptions and resolution outcomes.</p>
          </div>
        </div>

        <!-- Tab Container -->
        <div class="tabs-container" style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #E2E8F0; padding-bottom: 0;">
          <button type="button" 
            class="tab-btn ${this.activeTab === 'open' ? 'active' : ''}" 
            onclick="ExceptionHistoryView.switchTab('open')"
            style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; font-size: 14px; font-weight: ${this.activeTab === 'open' ? '700' : '500'}; color: ${this.activeTab === 'open' ? '#2563EB' : '#64748B'}; background: transparent; border: none; border-bottom: 2px solid ${this.activeTab === 'open' ? '#2563EB' : 'transparent'}; cursor: pointer; margin-bottom: -2px; transition: all 0.15s ease;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.alertTriangle ? Icons.alertTriangle(15) : ''}
              <span>Opened Exceptions</span>
            </span>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ${this.activeTab === 'open' ? '#EFF6FF' : '#F1F5F9'}; color: ${this.activeTab === 'open' ? '#2563EB' : '#64748B'}; border: 1px solid ${this.activeTab === 'open' ? '#BFDBFE' : '#E2E8F0'};">${openCount}</span>
          </button>

          <button type="button" 
            class="tab-btn ${this.activeTab === 'closed' ? 'active' : ''}" 
            onclick="ExceptionHistoryView.switchTab('closed')"
            style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; font-size: 14px; font-weight: ${this.activeTab === 'closed' ? '700' : '500'}; color: ${this.activeTab === 'closed' ? '#2563EB' : '#64748B'}; background: transparent; border: none; border-bottom: 2px solid ${this.activeTab === 'closed' ? '#2563EB' : 'transparent'}; cursor: pointer; margin-bottom: -2px; transition: all 0.15s ease;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.check ? Icons.check(15) : ''}
              <span>Closed Exceptions</span>
            </span>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ${this.activeTab === 'closed' ? '#ECFDF5' : '#F1F5F9'}; color: ${this.activeTab === 'closed' ? '#059669' : '#64748B'}; border: 1px solid ${this.activeTab === 'closed' ? '#A7F3D0' : '#E2E8F0'};">${closedCount}</span>
          </button>
        </div>

        <!-- Filter Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <!-- Search -->
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" id="exception-search-field" placeholder="Search by exception ID, shipment, carrier, or issue..." 
                value="${this.currentFilters.search}"
                oninput="ExceptionHistoryView.handleSearch(this.value)">
              ${this.currentFilters.search ? `
                <button class="clear-search-btn" onclick="ExceptionHistoryView.handleSearch(''); document.getElementById('exception-search-field').value=''">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

            <div class="filter-controls-group">
              <!-- Carrier Filter -->
              <div class="select-wrapper">
                <select id="exception-carrier-filter" onchange="ExceptionHistoryView.handleCarrierFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.carrierId === 'ALL' ? 'selected' : ''}>All Carriers</option>
                  ${carriers.map(c => `
                    <option value="${c.id}" ${this.currentFilters.carrierId === c.id ? 'selected' : ''}>${c.name} (${c.id})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Severity Filter -->
              <div class="select-wrapper">
                <select id="exception-severity-filter" onchange="ExceptionHistoryView.handleSeverityFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.severity === 'ALL' ? 'selected' : ''}>All Severities</option>
                  <option value="Critical" ${this.currentFilters.severity === 'Critical' ? 'selected' : ''}>Critical</option>
                  <option value="High" ${this.currentFilters.severity === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${this.currentFilters.severity === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${this.currentFilters.severity === 'Low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Minimal Exceptions Table -->
        <div class="panel exceptions-table-panel">
          <div class="table-responsive">
            <table class="data-table" id="exceptions-data-table">
              <thead>
                <tr>
                  <th class="cursor-pointer" onclick="ExceptionHistoryView.handleSort('id')">
                    <div class="th-content">Exception ID ${this.renderSortArrow('id')}</div>
                  </th>
                  <th class="cursor-pointer" onclick="ExceptionHistoryView.handleSort('shipmentId')">
                    <div class="th-content">Shipment ${this.renderSortArrow('shipmentId')}</div>
                  </th>
                  <th class="cursor-pointer" onclick="ExceptionHistoryView.handleSort('carrier')">
                    <div class="th-content">Assigned Carrier ${this.renderSortArrow('carrier')}</div>
                  </th>
                  <th>Issue Category</th>
                  <th class="cursor-pointer" onclick="ExceptionHistoryView.handleSort('severity')">
                    <div class="th-content">Severity ${this.renderSortArrow('severity')}</div>
                  </th>
                  <th>Status</th>
                  <th class="cursor-pointer" onclick="ExceptionHistoryView.handleSort('date')">
                    <div class="th-content">${this.activeTab === 'open' ? 'Detected' : 'Resolved'} ${this.renderSortArrow('date')}</div>
                  </th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                ${displayedExceptions.length === 0 ? `
                  <tr>
                    <td colspan="8">
                      ${UI.renderEmptyState(
                        this.activeTab === 'open' ? 'No Open Exceptions' : 'No Closed Exceptions Found',
                        this.activeTab === 'open' 
                          ? 'There are currently no active disruptions matching your filters.' 
                          : 'No historical closed exceptions match your criteria.',
                        `<button class="btn btn-secondary btn-sm" onclick="ExceptionHistoryView.resetFilters()">Reset Filters</button>`
                      )}
                    </td>
                  </tr>
                ` : ''}

                ${displayedExceptions.map(e => {
                  const carrier = this.getCarrierForException(e);
                  const isClosed = e.status === 'Resolved' || e.status === 'Closed';
                  const dateVal = isClosed ? (e.resolvedAt || e.createdAt) : (e.detectionTime || e.createdAt);

                  let statusBadgeStyle = 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;';
                  if (e.status === 'Resolved' || e.status === 'Closed') {
                    statusBadgeStyle = 'background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;';
                  } else if (e.status === 'Investigating') {
                    statusBadgeStyle = 'background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;';
                  }

                  return `
                    <tr>
                      <td>
                        <span class="font-bold text-navy" style="font-size: 13px;">${e.id}</span>
                      </td>
                      <td>
                        <span class="text-sm font-semibold text-midnight">#${e.shipmentId}</span>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-weight: 600; color: #1E293B; font-size: 13px;">${carrier.name}</span>
                          <span style="font-size: 11px; font-weight: 500; color: #64748B; background: #F1F5F9; border: 1px solid #E2E8F0; padding: 1px 6px; border-radius: 4px;">${carrier.id}</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-secondary" style="font-size: 12px; font-weight: 500;">${e.type}</span>
                      </td>
                      <td>
                        ${UI.renderSeverityBadge(e.severity)}
                      </td>
                      <td>
                        <span class="badge" style="${statusBadgeStyle} font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;">${e.status}</span>
                      </td>
                      <td>
                        <span class="text-sm text-muted">${UI.formatDate(dateVal)}</span>
                      </td>
                      <td class="text-right">
                        <button class="btn btn-secondary btn-sm" onclick="ExceptionHistoryView.openDetailModal('${e.id}')" style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 4px 10px; font-weight: 500;">
                          ${Icons.eye(13)} View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-footer-status" style="padding: 12px 16px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #64748B;">
            <span>Displaying <strong>${displayedExceptions.length}</strong> ${this.activeTab === 'open' ? 'active opened' : 'closed historical'} exceptions</span>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredExceptions() {
    const store = window.BRIDGES_STORE;
    if (!store) return [];

    const all = store.getExceptions();

    // Tab Filter
    let list = this.activeTab === 'open'
      ? all.filter(e => e.status !== 'Resolved' && e.status !== 'Closed')
      : all.filter(e => e.status === 'Resolved' || e.status === 'Closed');

    // Search Filter
    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      list = list.filter(e => {
        const carrier = this.getCarrierForException(e);
        return (
          e.id.toLowerCase().includes(q) ||
          e.shipmentId.toLowerCase().includes(q) ||
          (e.type && e.type.toLowerCase().includes(q)) ||
          (e.rootCause && e.rootCause.toLowerCase().includes(q)) ||
          carrier.name.toLowerCase().includes(q) ||
          carrier.id.toLowerCase().includes(q)
        );
      });
    }

    // Severity Filter
    if (this.currentFilters.severity !== 'ALL') {
      list = list.filter(e => e.severity === this.currentFilters.severity);
    }

    // Carrier Filter
    if (this.currentFilters.carrierId !== 'ALL') {
      list = list.filter(e => {
        const carrier = this.getCarrierForException(e);
        return carrier.id === this.currentFilters.carrierId;
      });
    }

    // Sort
    list.sort((a, b) => {
      let valA, valB;
      if (this.currentFilters.sortBy === 'date') {
        valA = a.resolvedAt || a.detectionTime || a.createdAt || '';
        valB = b.resolvedAt || b.detectionTime || b.createdAt || '';
      } else if (this.currentFilters.sortBy === 'carrier') {
        valA = this.getCarrierForException(a).name;
        valB = this.getCarrierForException(b).name;
      } else {
        valA = a[this.currentFilters.sortBy] || '';
        valB = b[this.currentFilters.sortBy] || '';
      }

      if (valA < valB) return this.currentFilters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  },

  renderSortArrow(col) {
    if (this.currentFilters.sortBy !== col) return '';
    return `<span class="sort-indicator">${this.currentFilters.sortOrder === 'asc' ? '▲' : '▼'}</span>`;
  },

  handleSort(col) {
    if (this.currentFilters.sortBy === col) {
      this.currentFilters.sortOrder = this.currentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentFilters.sortBy = col;
      this.currentFilters.sortOrder = 'asc';
    }
    App.renderCurrentView();
  },

  handleSearch(val) {
    this.currentFilters.search = val.trim();
    App.renderCurrentView();
  },

  handleCarrierFilter(carrierId) {
    this.currentFilters.carrierId = carrierId;
    App.renderCurrentView();
  },

  handleSeverityFilter(sev) {
    this.currentFilters.severity = sev;
    App.renderCurrentView();
  },

  resetFilters() {
    this.currentFilters.search = '';
    this.currentFilters.severity = 'ALL';
    this.currentFilters.carrierId = 'ALL';
    App.renderCurrentView();
  },

  // Detail Modal
  openDetailModal(id) {
    const e = window.BRIDGES_STORE ? window.BRIDGES_STORE.getException(id) : null;
    if (!e) return;

    const shipment = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipment(e.shipmentId) : null;
    const carrier = this.getCarrierForException(e);
    const isClosed = e.status === 'Resolved' || e.status === 'Closed';
    const resolver = e.assignedAnalyst || e.responsiblePerson || 'Sarah Lin (Control Tower)';

    const contentHtml = `
      <div class="exception-timeline-view">
        <div class="exception-summary-banner" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px;">
          <div class="flex-between" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="font-bold text-navy" style="font-size: 16px;">${e.id}</span>
              <span style="font-size: 13px; font-weight: 600; color: #475569; background: #E2E8F0; padding: 2px 8px; border-radius: 4px;">Shipment #${e.shipmentId}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${UI.renderSeverityBadge(e.severity)}
              <span class="badge ${isClosed ? 'badge-success' : 'badge-warning'}">${e.status}</span>
            </div>
          </div>
          <h3 style="font-size: 15px; font-weight: 600; color: #0F172A; margin: 12px 0 4px 0;">${e.type}${e.rootCause ? `: ${e.rootCause}` : ''}</h3>
        </div>

        <!-- Key Attributes Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
          <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
            <span style="font-size: 11px; font-weight: 500; color: #64748B; display: block; margin-bottom: 2px;">Assigned Carrier</span>
            <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${carrier.name} <span style="font-weight: 400; color: #64748B;">(${carrier.id})</span></span>
          </div>
          <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
            <span style="font-size: 11px; font-weight: 500; color: #64748B; display: block; margin-bottom: 2px;">Cargo / Consignment</span>
            <span style="font-size: 13px; font-weight: 600; color: #0F172A;">${shipment ? shipment.cargoType : 'General Freight'}</span>
          </div>
          <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
            <span style="font-size: 11px; font-weight: 500; color: #64748B; display: block; margin-bottom: 2px;">Lead Analyst / Resolver</span>
            <span style="font-size: 13px; font-weight: 600; color: #0F172A;">${resolver}</span>
          </div>
          <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
            <span style="font-size: 11px; font-weight: 500; color: #64748B; display: block; margin-bottom: 2px;">Route Corridor</span>
            <span style="font-size: 13px; font-weight: 600; color: #0F172A;">${shipment ? `${shipment.origin} → ${shipment.destination}` : 'Main Transit Corridor'}</span>
          </div>
        </div>

        <!-- Incident Timeline -->
        <h4 style="font-size: 13px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 12px 0;">Incident Timeline</h4>
        <div class="timeline-container" style="border-left: 2px solid #E2E8F0; margin-left: 8px; padding-left: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="position: relative;">
            <div style="position: absolute; left: -21px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #EF4444;"></div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">${UI.formatDate(e.detectionTime || e.createdAt)}</div>
            <div style="font-size: 13px; font-weight: 600; color: #0F172A;">Exception Detected</div>
            <div style="font-size: 12px; color: #475569;">${e.rootCause || 'Deviation threshold triggered by telemetry.'}</div>
          </div>

          <div style="position: relative;">
            <div style="position: absolute; left: -21px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #3B82F6;"></div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Assigned to ${resolver}</div>
            <div style="font-size: 13px; font-weight: 600; color: #0F172A;">Investigation &amp; Carrier Coordination</div>
            <div style="font-size: 12px; color: #475569;">Carrier dispatch contacted (${carrier.name}).</div>
          </div>

          ${isClosed ? `
            <div style="position: relative;">
              <div style="position: absolute; left: -21px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">${UI.formatDate(e.resolvedAt || e.createdAt)}</div>
              <div style="font-size: 13px; font-weight: 600; color: #0F172A;">Resolved &amp; Closed</div>
              <div style="font-size: 12px; color: #475569;">${e.finalOutcome || 'Incident verified and closed successfully.'}</div>
            </div>
          ` : `
            <div style="position: relative;">
              <div style="position: absolute; left: -21px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #F59E0B;"></div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Active Status</div>
              <div style="font-size: 13px; font-weight: 600; color: #F59E0B;">Action in Progress</div>
              <div style="font-size: 12px; color: #475569;">Awaiting carrier operational response and recovery dispatch.</div>
            </div>
          `}
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    document.getElementById('generic-modal-title').textContent = `Exception Details: ${e.id}`;
    document.getElementById('generic-modal-body').innerHTML = contentHtml;
    UI.openModal('generic-app-modal');
  }
};

window.ExceptionHistoryView = ExceptionHistoryView;
