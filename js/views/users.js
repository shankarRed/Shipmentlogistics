/**
 * BRIDGES Control Tower - User & Access Management View (Phase 1, US-1 to US-6)
 * Complete User CRUD, Carrier User Management, Role-Based Access Control (RBAC),
 * Account Activation Gating, and Real-time Login & Audit History Trails.
 */

const UsersView = {
  currentTab: 'users', // 'users' | 'rbac' | 'login_history'

  currentFilters: {
    search: '',
    role: 'ALL',
    status: 'ALL',
    carrierOnly: false,
    sortBy: 'name',
    sortOrder: 'asc'
  },

  loginFilters: {
    search: '',
    role: 'ALL',
    status: 'ALL'
  },

  switchTab(tab) {
    this.currentTab = tab;
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  render() {
    return `
      <div class="view-users animate-fade-in">
        <!-- Header Controls -->
        <div class="page-action-header">
          <div class="header-text-block">
            <h2 class="page-heading">User &amp; Access Management</h2>
            <p class="page-subheading">Administer enterprise identities, role-based access controls (RBAC), carrier users, and immutable authentication audit trails.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="UsersView.openAddUserModal()">
              ${Icons.plus(16)} Add New User
            </button>
          </div>
        </div>

        <!-- User Directory & Accounts Content -->
        ${this.renderUsersTab()}
      </div>
    `;
  },

  // =========================================================================
  // TAB 1: USER DIRECTORY & ACCOUNTS
  // =========================================================================
  renderUsersTab() {
    const users = this.getFilteredUsers();
    const allUsers = window.BRIDGES_STORE.getUsers();
    const activeCount = allUsers.filter(u => u.status === 'Active').length;
    const carrierUsersCount = allUsers.filter(u => !!u.carrierId).length;

    return `
      <div class="users-tab-content animate-fade-in">
        <!-- Metric Summary Chips -->
        <div class="kpi-grid mb-3" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Total System Users</span></div>
            <div class="kpi-metric text-navy">${allUsers.length}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Registered across 7 operational roles</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Active Accounts</span></div>
            <div class="kpi-metric text-success">${activeCount} <span class="text-xs font-normal text-muted">/ ${allUsers.length}</span></div>
            <div class="kpi-footer"><span class="kpi-subtext">Eligible for session login</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Carrier Users</span></div>
            <div class="kpi-metric text-midnight">${carrierUsersCount}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Mapped to external carrier partners</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Deactivated / Inactive</span></div>
            <div class="kpi-metric ${allUsers.length - activeCount > 0 ? 'text-danger' : 'text-muted'}">${allUsers.length - activeCount}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Access suspended, records preserved</span></div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" id="user-search-field" placeholder="Search by name, email, or user ID..." 
                value="${this.currentFilters.search}"
                oninput="UsersView.handleSearch(this.value)">
              ${this.currentFilters.search ? `
                <button class="clear-search-btn" onclick="UsersView.handleSearch(''); document.getElementById('user-search-field').value=''">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

            <div class="filter-controls-group">
              <!-- Role Filter -->
              <div class="select-wrapper">
                <select id="user-role-filter" onchange="UsersView.handleRoleFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.role === 'ALL' ? 'selected' : ''}>All Roles</option>
                  <option value="Administrator" ${this.currentFilters.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                  <option value="Control Tower Analyst" ${this.currentFilters.role === 'Control Tower Analyst' ? 'selected' : ''}>Control Tower Analyst</option>
                  <option value="Dispatcher / Transport Planner" ${this.currentFilters.role === 'Dispatcher / Transport Planner' ? 'selected' : ''}>Dispatcher / Transport Planner</option>
                  <option value="Carrier Operations User" ${this.currentFilters.role === 'Carrier Operations User' ? 'selected' : ''}>Carrier Operations User</option>
                  <option value="Warehouse Supervisor" ${this.currentFilters.role === 'Warehouse Supervisor' ? 'selected' : ''}>Warehouse Supervisor</option>
                  <option value="Customer Service" ${this.currentFilters.role === 'Customer Service' ? 'selected' : ''}>Customer Service</option>
                  <option value="Customer" ${this.currentFilters.role === 'Customer' ? 'selected' : ''}>Customer</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="select-wrapper">
                <select id="user-status-filter" onchange="UsersView.handleStatusFilter(this.value)">
                  <option value="ALL" ${this.currentFilters.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
                  <option value="Active" ${this.currentFilters.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Inactive" ${this.currentFilters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table Panel -->
        <div class="panel users-table-panel">
          <div class="table-responsive">
            <table class="data-table" id="users-data-table">
              <thead>
                <tr>
                  <th class="cursor-pointer" onclick="UsersView.handleSort('name')">
                    <div class="th-content">User Name ${this.renderSortArrow('name')}</div>
                  </th>
                  <th class="cursor-pointer" onclick="UsersView.handleSort('email')">
                    <div class="th-content">Email Address ${this.renderSortArrow('email')}</div>
                  </th>
                  <th class="cursor-pointer" onclick="UsersView.handleSort('role')">
                    <div class="th-content">Assigned Role ${this.renderSortArrow('role')}</div>
                  </th>
                  <th>Organization Context</th>
                  <th class="cursor-pointer" onclick="UsersView.handleSort('status')">
                    <div class="th-content">Status ${this.renderSortArrow('status')}</div>
                  </th>
                  <th>Registered</th>
                  <th style="width: 140px; min-width: 140px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.length === 0 ? `
                  <tr>
                    <td colspan="7">
                      ${UI.renderEmptyState('No Users Found', 'No user profiles matched your current search and filter criteria.', `
                        <button class="btn btn-secondary btn-sm" onclick="UsersView.resetFilters()">Reset Filters</button>
                      `)}
                    </td>
                  </tr>
                ` : ''}

                ${users.map(u => {
                  const carrier = u.carrierId ? window.BRIDGES_STORE.getCarrier(u.carrierId) : null;
                  const carrierName = carrier ? carrier.name : (u.carrierId ? u.carrierId : null);
                  const orgContext = carrierName 
                    ? `<div class="carrier-org-badge" title="${carrierName}">${Icons.carrier(14)} <span class="carrier-org-name">${carrierName}</span></div>`
                    : (u.customerName ? `<span class="badge badge-primary" style="font-size: 11px;">🏢 ${u.customerName}</span>` : '<span class="text-muted">Internal Control Tower</span>');
                  const initials = u.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();

                  return `
                    <tr class="${u.status === 'Inactive' ? 'row-inactive' : ''}">
                      <td>
                        <div class="user-profile-cell">
                          <span class="user-avatar-initials">${initials}</span>
                          <div class="user-name-box">
                            <span class="user-fullname">${u.name}</span>
                            <span class="user-id-code">${u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="user-email-text" style="color: #334155; font-size: 12.5px; font-weight: 500;">${u.email}</span>
                      </td>
                      <td>
                        ${UI.renderRoleBadge(u.role)}
                      </td>
                      <td>
                        ${orgContext}
                      </td>
                      <td>
                        ${UI.renderStatusBadge(u.status)}
                      </td>
                      <td>
                        <span class="text-muted text-sm">${UI.formatDate(u.createdAt, false)}</span>
                      </td>
                      <td style="width: 110px; min-width: 110px; text-align: center; vertical-align: middle;">
                        <div class="action-buttons-group">
                          <button class="btn-icon-action" title="Edit User" onclick="UsersView.openEditUserModal('${u.id}')">
                            ${Icons.edit(15)}
                          </button>
                          ${u.email !== 'admin@gmail.com' ? `
                            <button class="btn-icon-action ${u.status === 'Active' ? 'text-warning' : 'text-success'}" 
                              title="${u.status === 'Active' ? 'Deactivate User' : 'Activate User'}" 
                              onclick="UsersView.confirmToggleStatus('${u.id}')">
                              ${u.status === 'Active' ? (Icons.userX ? Icons.userX(15) : Icons.x(15)) : (Icons.userCheck ? Icons.userCheck(15) : Icons.check(15))}
                            </button>
                          ` : `
                            <span style="width: 28px; height: 28px; display: inline-block;"></span>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-footer-status">
            <span>Showing <strong>${users.length}</strong> of <strong>${allUsers.length}</strong> registered system users</span>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // TAB 2: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
  // =========================================================================
  renderRBACTab() {
    const permissions = window.BRIDGES_STORE.getRolePermissions();
    const roles = [
      "Administrator",
      "Control Tower Analyst",
      "Dispatcher / Transport Planner",
      "Carrier Operations User",
      "Warehouse Supervisor",
      "Customer Service",
      "Customer"
    ];

    const modules = [
      { key: "userManagement", label: "User Management & Credentials", desc: "Create, edit, deactivate user identities & passwords" },
      { key: "carrierGovernance", label: "Carrier Management & Scorecards", desc: "Onboard carriers, verify insurance & serviceability" },
      { key: "exceptionTriage", label: "Exception Triage & War Room", desc: "Investigate telemetry anomalies, severity scoring & closures" },
      { key: "recoveryPlanning", label: "Recovery Planning & Dispatch", desc: "Assign alternate carriers, re-routes, splits & expedites" },
      { key: "slaRulesConfig", label: "SLA & Detection Rule Config", desc: "Define SLA deadlines, grace buffers & detection thresholds" },
      { key: "notificationConfig", label: "Notification Template Engine", desc: "Design & publish stakeholder email, SMS & in-app alerts" },
      { key: "aiApprovalConfig", label: "AI Engine & Financial Authorizations", desc: "Configure AI confidence thresholds & financial sign-off limits" },
      { key: "analyticsReports", label: "Analytics & Compliance Export", desc: "Access live Control Tower BI metrics & generate regulatory reports" }
    ];

    return `
      <div class="rbac-tab-content animate-fade-in">
        <div class="panel mb-4" style="background: linear-gradient(135deg, rgba(24,33,126,0.03) 0%, rgba(24,33,126,0.01) 100%); border-left: 4px solid var(--color-royal-navy);">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="font-size: 24px;">🛡️</div>
            <div>
              <h3 style="font-size: 15px; font-weight: 700; color: #070724; margin-bottom: 4px;">Role-Based Access Control Architecture</h3>
              <p style="font-size: 13px; color: #424989; line-height: 1.5; margin: 0;">
                Configure granular system capabilities across all 7 operational roles. Permissions govern view access, modification rights, financial approval ceilings, and administrative override capabilities.
              </p>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="flex-between w-full">
              <div>
                <h3 class="panel-title">System Role Permissions Matrix</h3>
                <span class="text-xs text-muted">Adjust permission levels per role and click "Save Access Matrix" above.</span>
              </div>
              <div style="display: flex; gap: 8px; font-size: 11px;">
                <span class="badge" style="background: rgba(30,142,62,0.12); color: #1E8E3E; font-weight: 700;">Full Access</span>
                <span class="badge" style="background: rgba(25,103,210,0.12); color: #1967D2; font-weight: 700;">Read &amp; Write</span>
                <span class="badge" style="background: rgba(217,119,6,0.12); color: #D97706; font-weight: 700;">Read Only</span>
                <span class="badge" style="background: rgba(100,116,139,0.12); color: #64748B; font-weight: 700;">Denied</span>
              </div>
            </div>
          </div>

          <form id="rbac-matrix-form" onsubmit="UsersView.handleSaveRBAC(event)">
            <div class="table-responsive">
              <table class="data-table" style="font-size: 12.5px;">
                <thead>
                  <tr>
                    <th style="min-width: 240px;">System Functional Module</th>
                    ${roles.map(r => `
                      <th style="text-align: center; min-width: 140px;">
                        <div style="font-size: 12px; font-weight: 700; color: #070724;">${r}</div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${modules.map(m => `
                    <tr>
                      <td>
                        <div style="font-weight: 700; color: #070724;">${m.label}</div>
                        <div style="font-size: 11px; color: #64748B;">${m.desc}</div>
                      </td>
                      ${roles.map(r => {
                        const currentPerm = (permissions[r] && permissions[r][m.key]) || (r === 'Administrator' ? 'Full Access' : 'Denied');
                        const isAdmin = r === 'Administrator';

                        return `
                          <td style="text-align: center; vertical-align: middle;">
                            <select class="form-control select-sm rbac-perm-select" 
                              name="perm_${r}_${m.key}" 
                              data-role="${r}" 
                              data-module="${m.key}"
                              ${isAdmin ? 'disabled' : ''}
                              style="font-size: 11px; font-weight: 600; padding: 3px 6px; border-radius: 4px; ${currentPerm === 'Full Access' ? 'background: #EAF7EE; color: #1E8E3E; border-color: #A3E6B4;' : currentPerm === 'Read & Write' ? 'background: #EBF3FC; color: #1967D2; border-color: #BFDBFE;' : currentPerm === 'Read Only' ? 'background: #FEF3D6; color: #B45309; border-color: #FDE68A;' : 'background: #F1F5F9; color: #64748B; border-color: #CBD5E1;'}"
                              onchange="UsersView.handlePermSelectColor(this)">
                              <option value="Full Access" ${currentPerm === 'Full Access' ? 'selected' : ''}>Full Access</option>
                              <option value="Read & Write" ${currentPerm === 'Read & Write' ? 'selected' : ''}>Read & Write</option>
                              <option value="Read Only" ${currentPerm === 'Read Only' ? 'selected' : ''}>Read Only</option>
                              <option value="Denied" ${currentPerm === 'Denied' ? 'selected' : ''}>Denied</option>
                            </select>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="panel-footer" style="padding: 14px 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--color-border);">
              <button type="button" class="btn btn-secondary" onclick="UsersView.resetRBACDefaults()">Reset to Defaults</button>
              <button type="submit" class="btn btn-primary">${Icons.check(16)} Save Access Matrix</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  handlePermSelectColor(selectEl) {
    const val = selectEl.value;
    if (val === 'Full Access') {
      selectEl.style.background = '#EAF7EE';
      selectEl.style.color = '#1E8E3E';
      selectEl.style.borderColor = '#A3E6B4';
    } else if (val === 'Read & Write') {
      selectEl.style.background = '#EBF3FC';
      selectEl.style.color = '#1967D2';
      selectEl.style.borderColor = '#BFDBFE';
    } else if (val === 'Read Only') {
      selectEl.style.background = '#FEF3D6';
      selectEl.style.color = '#B45309';
      selectEl.style.borderColor = '#FDE68A';
    } else {
      selectEl.style.background = '#F1F5F9';
      selectEl.style.color = '#64748B';
      selectEl.style.borderColor = '#CBD5E1';
    }
  },

  handleSaveRBAC(e) {
    if (e) e.preventDefault();
    const selects = document.querySelectorAll('.rbac-perm-select');
    const updated = {};

    selects.forEach(sel => {
      const role = sel.getAttribute('data-role');
      const module = sel.getAttribute('data-module');
      if (!updated[role]) updated[role] = {};
      updated[role][module] = sel.value;
    });

    Object.keys(updated).forEach(role => {
      window.BRIDGES_STORE.updateRolePermissions(role, updated[role]);
    });

    UI.showToast('Role-based access permissions saved successfully.', 'success');
  },

  saveRBACChanges() {
    this.handleSaveRBAC(null);
  },

  resetRBACDefaults() {
    UI.confirm({
      title: 'Reset RBAC Permissions',
      message: 'Restore default role permission assignments for all system users?',
      confirmText: 'Restore Defaults',
      confirmType: 'primary',
      onConfirm: () => {
        window.BRIDGES_STORE.data.rolePermissions = JSON.parse(JSON.stringify(SEED_DATA.rolePermissions));
        window.BRIDGES_STORE.save();
        UI.showToast('Role permissions restored to default benchmark values.', 'success');
        App.renderCurrentView();
      }
    });
  },

  // =========================================================================
  // TAB 3: USER STATUS & LOGIN AUDIT HISTORY
  // =========================================================================
  renderLoginHistoryTab() {
    let logs = [...window.BRIDGES_STORE.getLoginHistory()];

    // Filtering
    if (this.loginFilters.search) {
      const q = this.loginFilters.search.toLowerCase();
      logs = logs.filter(l => 
        (l.userName && l.userName.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(q))
      );
    }
    if (this.loginFilters.role !== 'ALL') {
      logs = logs.filter(l => l.role === this.loginFilters.role);
    }
    if (this.loginFilters.status !== 'ALL') {
      logs = logs.filter(l => l.status.startsWith(this.loginFilters.status));
    }

    const totalLogins = window.BRIDGES_STORE.getLoginHistory().length;
    const blockedCount = window.BRIDGES_STORE.getLoginHistory().filter(l => l.status.startsWith('Blocked')).length;
    const successCount = window.BRIDGES_STORE.getLoginHistory().filter(l => l.status === 'Success').length;

    return `
      <div class="login-history-tab-content animate-fade-in">
        <!-- Metric Row -->
        <div class="kpi-grid mb-3" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Authentication Events</span></div>
            <div class="kpi-metric text-navy">${totalLogins}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Total tracked sessions</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Successful Logins</span></div>
            <div class="kpi-metric text-success">${successCount}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Valid authenticated sessions</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Security Blocks</span></div>
            <div class="kpi-metric ${blockedCount > 0 ? 'text-danger' : 'text-muted'}">${blockedCount}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Inactive accounts / suspended carriers</span></div>
          </div>
          <div class="kpi-card" style="padding: 14px 18px;">
            <div class="kpi-header"><span class="kpi-label">Audit Integrity</span></div>
            <div class="kpi-metric text-navy">100%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Regulatory compliance active</span></div>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="panel toolbar-panel mb-3">
          <div class="toolbar-row">
            <div class="search-input-group flex-1">
              <span class="icon">${Icons.search(16)}</span>
              <input type="text" placeholder="Search by name, email, IP address..." 
                value="${this.loginFilters.search}"
                oninput="UsersView.handleLoginSearch(this.value)">
              ${this.loginFilters.search ? `
                <button class="clear-search-btn" onclick="UsersView.handleLoginSearch('');">
                  ${Icons.x(14)}
                </button>
              ` : ''}
            </div>

            <div class="filter-controls-group">
              <div class="select-wrapper">
                <select onchange="UsersView.handleLoginRoleFilter(this.value)">
                  <option value="ALL" ${this.loginFilters.role === 'ALL' ? 'selected' : ''}>All Roles</option>
                  <option value="Administrator" ${this.loginFilters.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                  <option value="Control Tower Analyst" ${this.loginFilters.role === 'Control Tower Analyst' ? 'selected' : ''}>Control Tower Analyst</option>
                  <option value="Dispatcher / Transport Planner" ${this.loginFilters.role === 'Dispatcher / Transport Planner' ? 'selected' : ''}>Dispatcher / Transport Planner</option>
                  <option value="Carrier Operations User" ${this.loginFilters.role === 'Carrier Operations User' ? 'selected' : ''}>Carrier Operations User</option>
                  <option value="Warehouse Supervisor" ${this.loginFilters.role === 'Warehouse Supervisor' ? 'selected' : ''}>Warehouse Supervisor</option>
                  <option value="Customer Service" ${this.loginFilters.role === 'Customer Service' ? 'selected' : ''}>Customer Service</option>
                  <option value="Customer" ${this.loginFilters.role === 'Customer' ? 'selected' : ''}>Customer</option>
                </select>
              </div>

              <div class="select-wrapper">
                <select onchange="UsersView.handleLoginStatusFilter(this.value)">
                  <option value="ALL" ${this.loginFilters.status === 'ALL' ? 'selected' : ''}>All Results</option>
                  <option value="Success" ${this.loginFilters.status === 'Success' ? 'selected' : ''}>Successful Logins</option>
                  <option value="Blocked" ${this.loginFilters.status === 'Blocked' ? 'selected' : ''}>Blocked (Inactive Account)</option>
                  <option value="Failed" ${this.loginFilters.status === 'Failed' ? 'selected' : ''}>Failed (Bad Credentials)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Panel -->
        <div class="panel">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Identity</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Authentication Result</th>
                  <th>IP &amp; Endpoint Node</th>
                  <th>Client Device</th>
                  <th style="text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="8" class="text-center p-4 text-muted">No login audit events found matching filters.</td></tr>
                ` : logs.map(l => {
                  let statusBadge = '<span class="badge badge-success">✓ Success</span>';
                  if (l.status.startsWith('Blocked')) {
                    statusBadge = `<span class="badge badge-danger">⊘ ${l.status}</span>`;
                  } else if (l.status.startsWith('Failed')) {
                    statusBadge = `<span class="badge badge-warning">⚠ ${l.status}</span>`;
                  }

                  const matchedUser = l.userId !== 'UNKNOWN' ? window.BRIDGES_STORE.getUser(l.userId) : null;

                  return `
                    <tr>
                      <td>
                        <span class="font-semibold text-sm text-midnight">${UI.formatDate(l.timestamp)}</span>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: #070724;">${l.userName}</div>
                        <span class="text-xs text-muted">${l.userId}</span>
                      </td>
                      <td>
                        <span class="text-sm font-medium" style="color: #334155;">${l.email}</span>
                      </td>
                      <td>
                        ${UI.renderRoleBadge(l.role)}
                      </td>
                      <td>
                        ${statusBadge}
                      </td>
                      <td>
                        <span class="text-sm font-mono" style="font-size: 11.5px; color: #1E293B;">${l.ipAddress}</span>
                      </td>
                      <td>
                        <span class="text-xs text-muted" title="${l.userAgent}">${l.userAgent}</span>
                      </td>
                      <td style="text-align: center;">
                        <span class="text-muted">—</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-footer-status">
            <span>Showing <strong>${logs.length}</strong> recorded authentication events</span>
          </div>
        </div>
      </div>
    `;
  },

  handleLoginSearch(val) {
    this.loginFilters.search = val.trim();
    App.renderCurrentView();
  },

  handleLoginRoleFilter(role) {
    this.loginFilters.role = role;
    App.renderCurrentView();
  },

  handleLoginStatusFilter(status) {
    this.loginFilters.status = status;
    App.renderCurrentView();
  },

  exportLoginHistoryCsv() {
    const logs = window.BRIDGES_STORE.getLoginHistory();
    let csv = "ID,Timestamp,User ID,User Name,Email,Role,Status,IP Address,User Agent,Details\n";
    logs.forEach(l => {
      csv += `"${l.id}","${l.timestamp}","${l.userId}","${l.userName}","${l.email}","${l.role}","${l.status}","${l.ipAddress}","${(l.userAgent || '').replace(/"/g, '""')}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BRIDGES-Login-Audit-Report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    UI.showToast('Login audit log exported as CSV.', 'success');
  },

  // =========================================================================
  // USER FILTERING & ACTIONS
  // =========================================================================
  getFilteredUsers() {
    let users = [...window.BRIDGES_STORE.getUsers()];

    // Search query
    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (this.currentFilters.role !== 'ALL') {
      users = users.filter(u => u.role === this.currentFilters.role);
    }

    // Status filter
    if (this.currentFilters.status !== 'ALL') {
      users = users.filter(u => u.status === this.currentFilters.status);
    }

    // Carrier Only Filter
    if (this.currentFilters.carrierOnly) {
      users = users.filter(u => !!u.carrierId);
    }

    // Sorting
    users.sort((a, b) => {
      let valA = a[this.currentFilters.sortBy] || '';
      let valB = b[this.currentFilters.sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.currentFilters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return users;
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

  handleRoleFilter(role) {
    this.currentFilters.role = role;
    App.renderCurrentView();
  },

  handleStatusFilter(status) {
    this.currentFilters.status = status;
    App.renderCurrentView();
  },

  toggleCarrierOnlyFilter() {
    this.currentFilters.carrierOnly = !this.currentFilters.carrierOnly;
    App.renderCurrentView();
  },

  resetFilters() {
    this.currentFilters.search = '';
    this.currentFilters.role = 'ALL';
    this.currentFilters.status = 'ALL';
    this.currentFilters.carrierOnly = false;
    App.renderCurrentView();
  },

  // Modal: Add User
  openAddUserModal(prefillCarrierId = null) {
    const carriers = window.BRIDGES_STORE.getActiveCarriers();

    const formHtml = `
      <form id="add-user-form" onsubmit="UsersView.handleAddUserSubmit(event)">
        <div class="form-grid">
          <div class="form-group col-12">
            <label class="form-label" for="user-name">Full Name <span class="required">*</span></label>
            <input type="text" id="user-name" name="name" class="form-control" placeholder="e.g. David Vance" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="user-email">Email Address <span class="required">*</span></label>
            <input type="email" id="user-email" name="email" class="form-control" placeholder="e.g. david.v@bridges.io" required>
            <span class="field-hint">Used for Control Tower session login.</span>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="user-phone">Phone Number <span class="required">*</span></label>
            <input type="tel" id="user-phone" name="phone" class="form-control" placeholder="+1 (555) 000-0000" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="user-role">Assigned Role <span class="required">*</span></label>
            <select id="user-role" name="role" class="form-control" required onchange="UsersView.handleRoleChangeInForm(this.value)">
              <option value="">-- Select Role --</option>
              <option value="Administrator">Administrator</option>
              <option value="Control Tower Analyst">Control Tower Analyst</option>
              <option value="Dispatcher / Transport Planner">Dispatcher / Transport Planner</option>
              <option value="Carrier Operations User" ${prefillCarrierId ? 'selected' : ''}>Carrier Operations User</option>
              <option value="Warehouse Supervisor">Warehouse Supervisor</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="user-status">Account Status</label>
            <select id="user-status" name="status" class="form-control">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <!-- Carrier Selection: Visible & required for Carrier Operations User -->
          <div class="form-group col-12" id="carrier-select-row" style="display: ${prefillCarrierId ? 'block' : 'none'};">
            <label class="form-label" for="user-carrier">Associated Carrier Organization <span class="required">*</span></label>
            <select id="user-carrier" name="carrierId" class="form-control" ${prefillCarrierId ? 'required' : ''}>
              <option value="">-- Select Active Carrier --</option>
              ${carriers.map(c => `
                <option value="${c.id}" ${prefillCarrierId === c.id ? 'selected' : ''}>${c.name} (${c.carrierType} - ${c.operatingRegion})</option>
              `).join('')}
            </select>
            <span class="field-hint">Carrier Operations Users are strictly bound to an authorized carrier partner.</span>
          </div>

          <!-- Customer Selection: Visible for Customer Role -->
          <div class="form-group col-12" id="customer-select-row" style="display: none;">
            <label class="form-label" for="user-customer">Client Account Organization <span class="required">*</span></label>
            <select id="user-customer" name="customerOrg" class="form-control">
              <option value="CUST-BIO-01|BioPharma Health Alliance">BioPharma Health Alliance (CUST-BIO-01)</option>
              <option value="CUST-APEX-02|Apex Dynamics Corp">Apex Dynamics Corp (CUST-APEX-02)</option>
              <option value="CUST-GME-03|Global Maritime Imports">Global Maritime Imports (CUST-GME-03)</option>
            </select>
            <span class="field-hint">Customer users are isolated strictly to their assigned client freight order records.</span>
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Save User Profile</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = 'Add New Control Tower User';
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleRoleChangeInForm(role) {
    const carrierRow = document.getElementById('carrier-select-row');
    const carrierSelect = document.getElementById('user-carrier');
    const customerRow = document.getElementById('customer-select-row');
    const customerSelect = document.getElementById('user-customer');

    if (carrierRow) {
      if (role === 'Carrier Operations User') {
        carrierRow.style.display = 'block';
        if (carrierSelect) carrierSelect.required = true;
      } else {
        carrierRow.style.display = 'none';
        if (carrierSelect) {
          carrierSelect.required = false;
          carrierSelect.value = '';
        }
      }
    }

    if (customerRow) {
      if (role === 'Customer') {
        customerRow.style.display = 'block';
        if (customerSelect) customerSelect.required = true;
      } else {
        customerRow.style.display = 'none';
        if (customerSelect) customerSelect.required = false;
      }
    }
  },

  handleAddUserSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const email = formData.get('email').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      UI.showToast('Please enter a valid email address.', 'error');
      return;
    }

    const role = formData.get('role');
    const carrierId = formData.get('carrierId');
    const customerOrg = formData.get('customerOrg') || '';
    let customerId = null;
    let customerName = null;
    if (role === 'Customer' && customerOrg) {
      const parts = customerOrg.split('|');
      customerId = parts[0];
      customerName = parts[1];
    }

    if (role === 'Carrier Operations User' && !carrierId) {
      UI.showToast('Carrier Operations Users require an assigned Carrier Organization.', 'error');
      return;
    }

    try {
      const newUser = window.BRIDGES_STORE.addUser({
        name: formData.get('name'),
        email: email,
        phone: formData.get('phone'),
        role: role,
        status: formData.get('status'),
        carrierId: role === 'Carrier Operations User' ? carrierId : null,
        customerId: customerId,
        customerName: customerName
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`User profile created for ${newUser.name} (${newUser.role}).`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Modal: Edit User
  openEditUserModal(id) {
    const user = window.BRIDGES_STORE.getUser(id);
    if (!user) return;

    const carriers = window.BRIDGES_STORE.getActiveCarriers();
    const isCarrierUser = user.role === 'Carrier Operations User';
    const isCustomerUser = user.role === 'Customer';

    const formHtml = `
      <form id="edit-user-form" onsubmit="UsersView.handleEditUserSubmit(event, '${user.id}')">
        <div class="form-grid">
          <div class="form-group col-12">
            <label class="form-label" for="edit-name">Full Name <span class="required">*</span></label>
            <input type="text" id="edit-name" name="name" class="form-control" value="${user.name}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-email">Email Address <span class="required">*</span></label>
            <input type="email" id="edit-email" name="email" class="form-control" value="${user.email}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-phone">Phone Number <span class="required">*</span></label>
            <input type="tel" id="edit-phone" name="phone" class="form-control" value="${user.phone || ''}" required>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-role">Assigned Role <span class="required">*</span></label>
            <select id="edit-role" name="role" class="form-control" required onchange="UsersView.handleRoleChangeInForm(this.value)">
              <option value="Administrator" ${user.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
              <option value="Control Tower Analyst" ${user.role === 'Control Tower Analyst' ? 'selected' : ''}>Control Tower Analyst</option>
              <option value="Dispatcher / Transport Planner" ${user.role === 'Dispatcher / Transport Planner' ? 'selected' : ''}>Dispatcher / Transport Planner</option>
              <option value="Carrier Operations User" ${user.role === 'Carrier Operations User' ? 'selected' : ''}>Carrier Operations User</option>
              <option value="Warehouse Supervisor" ${user.role === 'Warehouse Supervisor' ? 'selected' : ''}>Warehouse Supervisor</option>
              <option value="Customer Service" ${user.role === 'Customer Service' ? 'selected' : ''}>Customer Service</option>
              <option value="Customer" ${user.role === 'Customer' ? 'selected' : ''}>Customer</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label class="form-label" for="edit-status">Account Status</label>
            <select id="edit-status" name="status" class="form-control">
              <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <!-- Carrier Row -->
          <div class="form-group col-12" id="carrier-select-row" style="display: ${isCarrierUser ? 'block' : 'none'};">
            <label class="form-label" for="user-carrier">Associated Carrier Organization <span class="required">*</span></label>
            <select id="user-carrier" name="carrierId" class="form-control" ${isCarrierUser ? 'required' : ''}>
              <option value="">-- Select Active Carrier --</option>
              ${carriers.map(c => `
                <option value="${c.id}" ${user.carrierId === c.id ? 'selected' : ''}>${c.name} (${c.carrierType})</option>
              `).join('')}
            </select>
          </div>

          <!-- Customer Organization Row -->
          <div class="form-group col-12" id="customer-select-row" style="display: ${isCustomerUser ? 'block' : 'none'};">
            <label class="form-label" for="user-customer">Client Account Organization <span class="required">*</span></label>
            <select id="user-customer" name="customerOrg" class="form-control">
              <option value="CUST-BIO-01|BioPharma Health Alliance" ${user.customerId === 'CUST-BIO-01' ? 'selected' : ''}>BioPharma Health Alliance (CUST-BIO-01)</option>
              <option value="CUST-APEX-02|Apex Dynamics Corp" ${user.customerId === 'CUST-APEX-02' ? 'selected' : ''}>Apex Dynamics Corp (CUST-APEX-02)</option>
              <option value="CUST-GME-03|Global Maritime Imports" ${user.customerId === 'CUST-GME-03' ? 'selected' : ''}>Global Maritime Imports (CUST-GME-03)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">${Icons.check(16)} Update Profile</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = `Edit User: ${user.name} (${user.id})`;
    document.getElementById('generic-modal-body').innerHTML = formHtml;
    UI.openModal('generic-app-modal');
  },

  handleEditUserSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const email = formData.get('email').trim();
    const role = formData.get('role');
    const carrierId = formData.get('carrierId');
    const customerOrg = formData.get('customerOrg') || '';
    let customerId = null;
    let customerName = null;
    if (role === 'Customer' && customerOrg) {
      const parts = customerOrg.split('|');
      customerId = parts[0];
      customerName = parts[1];
    }

    try {
      window.BRIDGES_STORE.updateUser(id, {
        name: formData.get('name'),
        email: email,
        phone: formData.get('phone'),
        role: role,
        status: formData.get('status'),
        carrierId: role === 'Carrier Operations User' ? carrierId : null,
        customerId: customerId,
        customerName: customerName
      });

      UI.closeModal('generic-app-modal');
      UI.showToast('User profile updated successfully.', 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Confirmation before Deactivation / Activation (US-6)
  confirmToggleStatus(id) {
    const user = window.BRIDGES_STORE.getUser(id);
    if (!user) return;

    const isDeactivating = user.status === 'Active';
    const actionWord = isDeactivating ? 'Deactivate' : 'Activate';

    UI.confirm({
      title: `${actionWord} User Account`,
      message: `Are you sure you want to <strong>${actionWord.toLowerCase()}</strong> the account for <strong>${user.name}</strong> (${user.email})?<br><br>
        <span class="text-sm text-muted">${isDeactivating 
          ? 'Notice: Deactivating this account will immediately block this user from authenticating into the Control Tower. Historical activity, shipments, and audit logs remain strictly preserved.' 
          : 'The user account will be reactivated, restoring login privileges immediately.'}</span>`,
      confirmText: `${actionWord} User`,
      confirmType: isDeactivating ? 'danger' : 'success',
      onConfirm: () => {
        window.BRIDGES_STORE.toggleUserStatus(id);
        UI.showToast(`User ${user.name} has been ${isDeactivating ? 'deactivated' : 'activated'}.`, 'success');
        App.renderCurrentView();
      }
    });
  }
};

window.UsersView = UsersView;
