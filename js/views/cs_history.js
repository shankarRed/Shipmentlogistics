/**
 * BRIDGES Control Tower - Customer Service Communication History View
 * Phase 6: Searchable, filterable log of all dispatched and drafted customer messages,
 * with channel badges, full message modal viewer, and resumption of saved drafts.
 */

window.CSHistoryView = {
  searchQuery: '',
  filterChannel: 'All',
  filterStatus: 'All',
  filterTemplate: 'All',

  render() {
    const store = window.BRIDGES_STORE;
    const allComms = store.getCommunications();

    // Multi-attribute search and filtering
    const filtered = allComms.filter(c => {
      // 1. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        const idMatch = (c.id || '').toLowerCase().includes(q);
        const shipMatch = (c.shipmentId || '').toLowerCase().includes(q);
        const custMatch = (c.customerName || '').toLowerCase().includes(q);
        const recipMatch = (c.recipient || '').toLowerCase().includes(q);
        const subjMatch = (c.subject || '').toLowerCase().includes(q);
        const bodyMatch = (c.body || c.message || '').toLowerCase().includes(q);
        if (!idMatch && !shipMatch && !custMatch && !recipMatch && !subjMatch && !bodyMatch) {
          return false;
        }
      }

      // 2. Channel filter
      if (this.filterChannel !== 'All' && c.channel !== this.filterChannel) {
        return false;
      }

      // 3. Status filter
      if (this.filterStatus !== 'All' && c.status !== this.filterStatus) {
        return false;
      }

      // 4. Template filter
      const tmpl = c.template || c.templateName || '';
      if (this.filterTemplate !== 'All' && tmpl !== this.filterTemplate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort newest first
      return (b.id || '').localeCompare(a.id || '');
    });

    const metrics = store.getCSMetrics();
    const alerts = store.getCustomerServiceAlerts ? store.getCustomerServiceAlerts() : { failedComms: [], slaDelays: [], complaints: [] };
    const failedCount = alerts.failedComms ? alerts.failedComms.length : 0;

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BANNER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Customer Service Archive
              </span>
              <span class="cs-user-tag">
                ${allComms.length} Total Historical Messages Logged
              </span>
              ${failedCount > 0 ? `
                <span class="cs-safety-tag" style="background: rgba(234, 52, 31, 0.1); color: #EA341F; border: 1px solid rgba(234, 52, 31, 0.25);">
                  ⚠️ ${failedCount} Failed Delivery Dispatches
                </span>
              ` : ''}
            </div>
            <h1 class="cs-banner-title">Customer Communication History & Alerts</h1>
            <p class="cs-banner-subtitle">
              Audit trail of customer notifications, simulated email/SMS dispatches, retry gateway for failed alerts, and timestamped customer outreach logs.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSHistoryView.resetFilters()">
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
              + Compose New
            </button>
          </div>
        </div>

        ${failedCount > 0 ? `
          <!-- FAILED NOTIFICATIONS RETRY BANNER -->
          <div class="cs-alert-banner" style="background: rgba(234, 52, 31, 0.08); border: 1px solid rgba(234, 52, 31, 0.3); border-radius: 8px; padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #EA341F; color: #fff; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div>
                <strong style="color: #EA341F; font-size: 13.5px; display: block;">Notification Delivery Alerts: ${failedCount} Failed Customer Dispatches Require Retry</strong>
                <span style="font-size: 12px; color: #393A50;">SMS gateway timeouts or carrier relay errors occurred. Review error diagnostics and click <strong>"Retry Dispatch"</strong> to immediately re-attempt delivery.</span>
              </div>
            </div>
            <button class="btn btn-sm" style="background: #EA341F; color: #FFFFFF; font-weight: 700; border: none; white-space: nowrap; padding: 6px 14px;" onclick="CSHistoryView.filterFailedOnly()">
              Filter Failed Dispatches (${failedCount})
            </button>
          </div>
        ` : ''}

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
                placeholder="Search history by Comm ID (e.g. COM-6001), Shipment ID (e.g. BRG-2848), Customer, Recipient, or Subject..."
                value="${this.searchQuery}"
                oninput="CSHistoryView.onSearchInput(this.value)"
              />
              ${this.searchQuery ? `
                <button class="cs-search-clear" onclick="CSHistoryView.onSearchInput('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>

          <div class="cs-filters-grid">
            <!-- Filter 1: Channel -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Channel</label>
              <select class="cs-select" onchange="CSHistoryView.onFilterChange('filterChannel', this.value)">
                <option value="All" ${this.filterChannel === 'All' ? 'selected' : ''}>All Channels</option>
                <option value="Email" ${this.filterChannel === 'Email' ? 'selected' : ''}>Email Notification</option>
                <option value="SMS" ${this.filterChannel === 'SMS' ? 'selected' : ''}>SMS Text Alert</option>
              </select>
            </div>

            <!-- Filter 2: Status -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Communication Status</label>
              <select class="cs-select" onchange="CSHistoryView.onFilterChange('filterStatus', this.value)">
                <option value="All" ${this.filterStatus === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Sent" ${this.filterStatus === 'Sent' ? 'selected' : ''}>Dispatched (Sent)</option>
                <option value="Failed" ${this.filterStatus === 'Failed' ? 'selected' : ''}>Failed / Delivery Error (${failedCount})</option>
                <option value="Awaiting Review" ${this.filterStatus === 'Awaiting Review' ? 'selected' : ''}>Awaiting Review</option>
                <option value="Draft" ${this.filterStatus === 'Draft' ? 'selected' : ''}>Saved Draft</option>
              </select>
            </div>

            <!-- Filter 3: Template -->
            <div class="cs-filter-group">
              <label class="cs-filter-label">Template / Message Type</label>
              <select class="cs-select" onchange="CSHistoryView.onFilterChange('filterTemplate', this.value)">
                <option value="All" ${this.filterTemplate === 'All' ? 'selected' : ''}>All Templates</option>
                <option value="ETA Updated" ${this.filterTemplate === 'ETA Updated' ? 'selected' : ''}>ETA Updated</option>
                <option value="Delivery May Be Delayed" ${this.filterTemplate === 'Delivery May Be Delayed' ? 'selected' : ''}>Delivery May Be Delayed</option>
                <option value="Shipment Under Resolution" ${this.filterTemplate === 'Shipment Under Resolution' ? 'selected' : ''}>Shipment Under Resolution</option>
                <option value="Shipment Resolved" ${this.filterTemplate === 'Shipment Resolved' ? 'selected' : ''}>Shipment Resolved</option>
                <option value="Status Confirmation" ${this.filterTemplate === 'Status Confirmation' ? 'selected' : ''}>Status Confirmation</option>
              </select>
            </div>
          </div>
        </div>

        <!-- TABLE OF COMMUNICATIONS -->
        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-title-group">
              <h3 class="cs-card-title">Communication Records</h3>
              <p class="cs-card-subtitle">Showing ${filtered.length} matching messages</p>
            </div>
            <div class="cs-badge-row">
              <span class="cs-comm-status-badge comm-sent">${metrics.messagesSentToday} Sent Today</span>
              <span class="cs-comm-status-badge comm-review">${metrics.messagesAwaitingReview} In Review</span>
            </div>
          </div>
          <div class="cs-card-body p-0">
            <div class="table-responsive">
              <table class="cs-table cs-table-hover">
                <thead>
                  <tr>
                    <th>Comm ID</th>
                    <th>Shipment ID</th>
                    <th>Customer / Consignee</th>
                    <th>Template Type</th>
                    <th>Channel</th>
                    <th>Message Preview</th>
                    <th>Author</th>
                    <th>Created</th>
                    <th>Sent Timestamp</th>
                    <th>Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr>
                      <td colspan="11" class="text-center py-5">
                        <div class="cs-empty-state">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <h4 class="mt-2 text-dark font-semibold">No Communications Found</h4>
                          <p class="text-muted text-sm">No messages match "${this.searchQuery || 'current filters'}".</p>
                        </div>
                      </td>
                    </tr>
                  ` : filtered.map(c => `
                    <tr onclick="CSDashboardView.openMessageModal('${c.id}')" style="cursor: pointer;">
                      <td>
                        <strong class="cs-comm-id">${c.id}</strong>
                      </td>
                      <td onclick="event.stopPropagation(); CSHistoryView.viewShipment('${c.shipmentId}')">
                        <span class="cs-shipment-id">${c.shipmentId}</span>
                      </td>
                      <td>
                        <div class="cs-party-block">
                          <strong class="cs-customer-name">${c.customerName || 'Customer'}</strong>
                          <span class="cs-ref-sub">To: ${c.recipient}</span>
                        </div>
                      </td>
                      <td>
                        <span class="cs-template-tag">${c.template || c.templateName || 'Notification'}</span>
                      </td>
                      <td>
                        <span class="cs-channel-badge ${c.channel === 'Email' ? 'channel-email' : 'channel-sms'}">
                          ${c.channel}
                        </span>
                      </td>
                      <td>
                        <div class="cs-comm-preview-snippet" title="${(c.body || c.message || '').replace(/"/g, '&quot;')}">
                          ${c.subject ? `<strong>${c.subject}</strong> — ` : ''}
                          ${(c.body || c.message || '').substring(0, 75)}${(c.body || c.message || '').length > 75 ? '...' : ''}
                        </div>
                        ${c.status === 'Failed' ? `
                          <div style="font-size: 11px; color: #EA341F; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Error: ${c.failureReason || 'Dispatch Failure'}
                          </div>
                        ` : ''}
                      </td>
                      <td>
                        <span class="cs-author-text">${c.createdBy || 'Clara Hughes'}</span>
                      </td>
                      <td>
                        <span class="cs-time-text">${c.createdAt}</span>
                      </td>
                      <td>
                        <span class="cs-time-text ${c.status === 'Failed' ? 'text-danger font-semibold' : c.sentAt ? 'text-success font-semibold' : 'text-muted'}">
                          ${c.status === 'Failed' ? 'Delivery Error' : (c.sentAt || '—')}
                        </span>
                      </td>
                      <td>
                        <span class="cs-comm-status-badge ${
                          c.status === 'Sent' ? 'comm-sent' :
                          c.status === 'Failed' ? 'comm-failed' :
                          c.status === 'Awaiting Review' ? 'comm-review' : 'comm-draft'
                        }" style="${c.status === 'Failed' ? 'background: rgba(234, 52, 31, 0.12); color: #EA341F; border: 1px solid rgba(234, 52, 31, 0.3); font-weight: 700;' : ''}">
                          ${c.status}
                        </span>
                      </td>
                      <td class="text-right" onclick="event.stopPropagation()">
                        <div class="cs-action-btn-group">
                          <button class="btn btn-outline btn-xs" onclick="CSDashboardView.openMessageModal('${c.id}')">
                            View
                          </button>
                          ${c.status === 'Failed' ? `
                            <button class="btn btn-xs" style="background: #EA341F; color: #FFFFFF; font-weight: 700; border: none; display: inline-flex; align-items: center; gap: 4px;" onclick="CSHistoryView.retryDispatch('${c.id}')" title="Retry notification dispatch">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                              </svg>
                              Retry Dispatch
                            </button>
                          ` : c.status !== 'Sent' ? `
                            <button class="btn btn-primary btn-xs" onclick="CSHistoryView.resumeDraft('${c.id}')" title="Resume drafting">
                              Resume
                            </button>
                          ` : ''}
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
  },

  onSearchInput(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  onFilterChange(key, val) {
    this[key] = val;
    App.renderCurrentView();
  },

  filterFailedOnly() {
    this.filterStatus = 'Failed';
    App.renderCurrentView();
    if (window.UI) UI.showToast('Filtering for failed customer notifications.', 'warning');
  },

  retryDispatch(commId) {
    const store = window.BRIDGES_STORE;
    const res = store.retryCommunication(commId);
    if (res && res.success) {
      if (window.UI) UI.showToast(`Notification ${commId} retried and dispatched successfully to customer!`, 'success');
      App.renderCurrentView();
    } else {
      if (window.UI) UI.showToast(res && res.error ? res.error : 'Failed to retry notification dispatch', 'error');
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.filterChannel = 'All';
    this.filterStatus = 'All';
    this.filterTemplate = 'All';
    App.renderCurrentView();
    UI.showToast('History filters reset.', 'info');
  },

  viewShipment(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  resumeDraft(commId) {
    const store = window.BRIDGES_STORE;
    const comm = store.getCommunication(commId);
    if (!comm) return;

    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = comm.shipmentId;
      window.CSComposeView.editingCommId = comm.id;
      window.CSComposeView.selectedChannel = comm.channel;
      window.CSComposeView.selectedTemplate = comm.template || comm.templateName || 'ETA Updated';
      window.CSComposeView.recipient = comm.recipient;
      window.CSComposeView.subject = comm.subject || '';
      window.CSComposeView.body = comm.body || comm.message || '';
    }
    App.navigateTo('cs_compose');
  }
};
