/**
 * BRIDGES Control Tower - Audit Log View
 * Immutable administrative activity trail. Searchable and filterable.
 * Read-only compliance view.
 */

const AuditLogView = {
  currentFilters: {
    search: '',
    module: 'ALL',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  },

  render() {
    const logs = this.getFilteredLogs();
    const modules = ['Users', 'Carriers', 'Resources', 'Settings', 'System'];

    return `
      <div class="view-audit animate-fade-in">
        <!-- Header -->
        <div class="page-action-header">
          <div class="header-text-block">
            <h2 class="page-heading">System Audit Log</h2>
            <p class="page-subheading">Immutable regulatory record of all administrative operations, governance overrides, and entity state changes.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="AuditLogView.exportAuditJson()">
              ${Icons.database(16)} Export Audit Report
            </button>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" id="audit-search-field" placeholder="Search by action, target entity, admin email, or details..." 
                value="${this.currentFilters.search}"
                oninput="AuditLogView.handleSearch(this.value)">
              ${this.currentFilters.search ? `
                <button class="clear-search-btn" onclick="AuditLogView.handleSearch(''); document.getElementById('audit-search-field').value=''">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

            <div class="filter-controls-group">
              <!-- Module Filter -->
              <div class="select-wrapper">
                <select id="audit-module-filter" onchange="AuditLogView.handleModuleFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.module === 'ALL' ? 'selected' : ''}>All Subsystems</option>
                  ${modules.map(m => `
                    <option value="${m}" ${this.currentFilters.module === m ? 'selected' : ''}>${m}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Table Panel -->
        <div class="panel audit-table-panel">
          <div class="table-responsive">
            <table class="data-table" id="audit-data-table" style="width: 100%; table-layout: fixed; border-collapse: collapse;">
              <colgroup>
                <col style="width: 13%;">
                <col style="width: 15%;">
                <col style="width: 12%;">
                <col style="width: 18%;">
                <col style="width: 18%;">
                <col style="width: 24%;">
              </colgroup>
              <thead>
                <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
                  <th class="cursor-pointer" onclick="AuditLogView.handleSort('timestamp')" style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">
                    <div class="th-content" style="display: inline-flex; align-items: center; gap: 4px;">Timestamp ${this.renderSortArrow('timestamp')}</div>
                  </th>
                  <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Action Event</th>
                  <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Subsystem Module</th>
                  <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Affected Record</th>
                  <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Acting Administrator</th>
                  <th style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap;">Operational Details</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr>
                    <td colspan="6" style="padding: 32px 16px;">
                      ${UI.renderEmptyState('No Audit Entries Found', 'No administrative entries matched your search filter.')}
                    </td>
                  </tr>
                ` : ''}

                ${logs.map(log => {
                  let moduleCls = 'badge-primary';
                  if (log.module === 'Users') moduleCls = 'badge-role-admin';
                  if (log.module === 'Carriers') moduleCls = 'badge-role-carrier';
                  if (log.module === 'Resources') moduleCls = 'badge-role-planner';
                  if (log.module === 'Settings') moduleCls = 'badge-secondary';
                  if (log.module === 'System') moduleCls = 'badge-warning';

                  return `
                    <tr style="border-bottom: 1px solid #F1F5F9; transition: background-color 0.15s ease;">
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <span style="font-size: 12.5px; font-weight: 600; color: #1E293B; white-space: nowrap;">${UI.formatDate(log.timestamp)}</span>
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${log.action}</span>
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <span class="badge ${moduleCls}" style="font-size: 11px; font-weight: 600; padding: 4px 10px; display: inline-block; white-space: nowrap;">${log.module}</span>
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        ${this.formatAffectedRecord(log.affectedRecord)}
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        ${this.formatActingUser(log.actingUser)}
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        ${this.formatDetails(log.details, log)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-footer-status" style="padding: 14px 16px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #64748B;">
            <span>Showing <strong>${logs.length}</strong> recorded administrative actions</span>
          </div>
        </div>
      </div>
    `;
  },

  formatAffectedRecord(record) {
    if (!record || record === '—') return '<span class="text-muted">—</span>';
    
    // Case 1: ID with parenthetical sub-name/details, e.g. "EXC-1047 (Shipment BRG-2843)", "USR-104 (Elena Rostova)", "CAR-04 (Pacific Marine Cargo Line)", "Vehicle FR-23 (CA-2311-CK)"
    const match = record.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      const id = match[1].trim();
      const detail = match[2].trim();
      return `
        <div class="affected-record-cell" style="display: flex; flex-direction: column; gap: 3px; align-items: flex-start;">
          <span class="record-badge" style="display: inline-block; font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 11.5px; font-weight: 700; color: #0F172A; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 7px; border-radius: 4px; line-height: 1.2; white-space: nowrap;">${id}</span>
          <span class="record-subtext" style="font-size: 11.5px; color: #64748B; font-weight: 500; line-height: 1.3; word-break: break-word;" title="${detail}">${detail}</span>
        </div>
      `;
    }

    // Case 2: Standalone identifier codes like "USR-101", "EXC-1051", "CAR-01", "SLA-RULE-01"
    if (/^[A-Z0-9]+(?:-[A-Z0-9]+)+$/i.test(record.trim())) {
      return `
        <div class="affected-record-cell">
          <span class="record-badge" style="display: inline-block; font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 11.5px; font-weight: 700; color: #0F172A; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 7px; border-radius: 4px; line-height: 1.2; white-space: nowrap;">${record.trim()}</span>
        </div>
      `;
    }

    // Case 3: Session labels like "Admin Session", "Dispatcher Session", "Customer Session", "Session Ended", "Analyst Session"
    if (/session/i.test(record)) {
      return `
        <div class="affected-record-cell">
          <span style="display: inline-block; font-size: 11.5px; font-weight: 600; color: #475569; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2.5px 8px; border-radius: 4px; white-space: nowrap;">${record.trim()}</span>
        </div>
      `;
    }

    // Case 4: Descriptive configuration/entity names, e.g. "Control Tower Parameters", "SLA Configuration", "All Collections", "Operational Buffers"
    return `
      <div class="affected-record-cell" title="${record}">
        <span style="font-size: 12.5px; font-weight: 600; color: #1E293B; line-height: 1.35; display: inline-block;">${record}</span>
      </div>
    `;
  },

  cleanDetails(details) {
    if (!details) return '—';
    const cleaned = details
      .replace(/\s*authenticated via credentials\.?/gi, '')
      .replace(/\s*authenticated successfully\.?/gi, '')
      .trim();
    return cleaned || '—';
  },

  formatActingUser(userStr) {
    if (!userStr) return '<span class="text-muted">—</span>';
    const match = userStr.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      const email = match[1].trim();
      const role = match[2].trim();
      return `
        <div class="admin-acting-cell" style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 13px; font-weight: 600; color: #0F172A; word-break: break-all;" title="${email}">${email}</span>
          ${role ? `<span style="font-size: 11px; color: #64748B;">${role}</span>` : ''}
        </div>
      `;
    }
    return `<span style="font-size: 13px; font-weight: 600; color: #0F172A;">${userStr}</span>`;
  },

  formatDetails(details, log) {
    const cleaned = this.cleanDetails(details);
    if (!cleaned || cleaned === '—') return '<span class="text-muted">—</span>';
    
    // Only format as stacked Name/Role if the entire cleaned string is exactly "Name (Role)" (e.g. login audits)
    const match = cleaned.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match && (log.action.includes('Login') || log.action.includes('Logout') || log.action.includes('User'))) {
      const name = match[1].trim();
      const role = match[2].trim();
      return `
        <div class="audit-details-cell" style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 13px; font-weight: 600; color: #1E293B;">${name}</span>
          <span style="font-size: 11px; color: #64748B;">${role}</span>
        </div>
      `;
    }
    return `<div class="audit-details-cell" title="${cleaned}"><span style="font-size: 13px; color: #334155; line-height: 1.4; display: inline-block;">${cleaned}</span></div>`;
  },

  getFilteredLogs() {
    let logs = [...window.BRIDGES_STORE.getAuditLogs()];

    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      logs = logs.filter(l => 
        l.action.toLowerCase().includes(q) ||
        l.affectedRecord.toLowerCase().includes(q) ||
        l.actingUser.toLowerCase().includes(q) ||
        this.cleanDetails(l.details).toLowerCase().includes(q)
      );
    }

    if (this.currentFilters.module !== 'ALL') {
      logs = logs.filter(l => l.module === this.currentFilters.module);
    }

    logs.sort((a, b) => {
      let valA = a[this.currentFilters.sortBy] || '';
      let valB = b[this.currentFilters.sortBy] || '';

      if (valA < valB) return this.currentFilters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return logs;
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

  handleModuleFilter(mod) {
    this.currentFilters.module = mod;
    App.renderCurrentView();
  },

  exportAuditJson() {
    const logs = window.BRIDGES_STORE.getAuditLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BRIDGES_Audit_Log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('Audit log export downloaded.', 'success');
  }
};

window.AuditLogView = AuditLogView;
