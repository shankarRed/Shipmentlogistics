/**
 * BRIDGES Control Tower - Main Application Controller
 * Handles routing, authentication gating, layout shell rendering, and global interactions
 * Seamlessly supports 3 roles: Administrator, Control Tower Analyst, and Dispatcher / Transport Planner
 * with shared underlying data model and persistence.
 */

const App = {
  currentView: 'dashboard',
  sidebarCollapsed: false,
  shipmentSubmenuOpen: true,

  init() {
    // Initialize Theme & Custom Accent from localStorage
    this.initTheme();

    // Initialize Live Tracking Telemetry engine
    if (window.LiveTrackingMap) {
      window.LiveTrackingMap.init();
    }

    // Listen for auth changes
    window.BRIDGES_AUTH.onAuthChange((user) => {
      if (user) {
        if (user.role === 'Customer') {
          if (!this.currentView.startsWith('customer_')) {
            this.currentView = 'customer_home';
            window.location.hash = '#/customer_home';
          }
        } else if (user.role === 'Warehouse Supervisor') {
          if (!this.currentView.startsWith('warehouse_')) {
            this.currentView = 'warehouse_dashboard';
            window.location.hash = '#/warehouse_dashboard';
          }
        } else if (user.role === 'Carrier Operations User') {
          if (!this.currentView.startsWith('carrier_')) {
            this.currentView = 'carrier_dashboard';
            window.location.hash = '#/carrier_dashboard';
          }
        } else if (user.role === 'Dispatcher / Transport Planner') {
          if (!this.currentView.startsWith('dispatcher_')) {
            this.currentView = 'dispatcher_dashboard';
            window.location.hash = '#/dispatcher_dashboard';
          }
        } else if (user.role === 'Control Tower Analyst') {
          if (!this.currentView.startsWith('analyst_')) {
            this.currentView = 'analyst_dashboard';
            window.location.hash = '#/analyst_dashboard';
          }
        } else if (user.role === 'Customer Service') {
          if (!this.currentView.startsWith('cs_')) {
            this.currentView = 'cs_dashboard';
            window.location.hash = '#/cs_dashboard';
          }
        } else {
          if (this.currentView.startsWith('analyst_') || this.currentView.startsWith('dispatcher_') || this.currentView.startsWith('carrier_') || this.currentView.startsWith('warehouse_') || this.currentView.startsWith('cs_') || this.currentView.startsWith('customer_')) {
            this.currentView = 'dashboard';
            window.location.hash = '#/dashboard';
          }
        }
      }
      this.render();
    });

    // Listen for store changes
    window.BRIDGES_STORE.subscribe((data) => {
      if (window.BRIDGES_AUTH.isAuthenticated()) {
        this.renderCurrentView();
      }
    });

    // Hash navigation
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Keyboard shortcut for search (Ctrl+K or ⌘+K) & Esc to dismiss
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'Escape') {
        const searchInput = document.getElementById('global-search-input');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
          const dropdown = document.getElementById('search-suggestions-dropdown');
          if (dropdown) dropdown.style.display = 'none';
        }
      }
    });

    // Handle initial hash
    const user = window.BRIDGES_AUTH.getCurrentUser();
    if (window.location.hash) {
      const raw = window.location.hash.replace('#/', '').replace('#', '');
      let route = this.resolveRoute(raw);
      if (route === 'resources' && (!user || user.role === 'Administrator')) {
        route = 'dashboard';
        window.location.hash = '#/dashboard';
      }
      if (this.isValidRoute(route)) {
        this.currentView = route;
      }
    } else if (user) {
      if (user.role === 'Customer') {
        this.currentView = 'customer_home';
      } else if (user.role === 'Warehouse Supervisor') {
        this.currentView = 'warehouse_dashboard';
      } else if (user.role === 'Carrier Operations User') {
        this.currentView = 'carrier_dashboard';
      } else if (user.role === 'Dispatcher / Transport Planner') {
        this.currentView = 'dispatcher_dashboard';
      } else if (user.role === 'Control Tower Analyst') {
        this.currentView = 'analyst_dashboard';
      } else if (user.role === 'Customer Service') {
        this.currentView = 'cs_dashboard';
      } else {
        this.currentView = 'dashboard';
      }
      window.location.hash = `#/${this.currentView}`;
    }

    this.render();
  },

  resolveRoute(rawRoute) {
    if (!rawRoute) return '';
    const cleanRoute = rawRoute.split('?')[0];
    const aliases = {
      'cust_home': 'customer_home',
      'cust_track': 'customer_track',
      'cust_shipment_detail': 'customer_shipment_detail',
      'cust_notifications': 'customer_notifications',
      'cust_contact': 'customer_contact',
      'cust_queries': 'customer_queries',
      'cust_history': 'customer_history',
      'cust_ai_assistant': 'customer_ai_assistant'
    };
    return aliases[cleanRoute] || cleanRoute;
  },

  isValidRoute(route) {
    const r = this.resolveRoute(route);
    return [
      // Admin routes (Phase 1)
      'dashboard', 'users', 'carriers', 'resources', 'analytics', 'exceptions', 'audit', 'settings', 'login', 'sla_rules', 'notifications_config', 'ai_config',
      
      // Control Tower Analyst routes (Phase 2, US-17 to US-43)
      'analyst_dashboard', 'analyst_shipments', 'analyst_onboarding', 'analyst_data_quality',
      'analyst_queue', 'analyst_investigation', 
      'analyst_war_room', 'analyst_recoveries', 'analyst_events', 'analyst_history',

      // Dispatcher / Transport Planner routes (Phase 3, US-44 to US-57)
      'dispatcher_dashboard', 'dispatcher_queue', 'dispatcher_planning', 'dispatcher_carriers',
      'dispatcher_recoveries', 'dispatcher_tracking', 'dispatcher_escalations', 'dispatcher_approvals', 'dispatcher_completed',

      // Carrier Operations User routes (Phase 4, US-58 to US-78)
      'carrier_dashboard', 'carrier_requests', 'carrier_shipments', 'carrier_vehicles',
      'carrier_drivers', 'carrier_execution', 'carrier_disruptions', 'carrier_delivery', 'carrier_history',

      // Warehouse Supervisor routes (Phase 5)
      'warehouse_dashboard', 'warehouse_shipments', 'warehouse_readiness', 'warehouse_docks',
      'warehouse_picking', 'warehouse_loading', 'warehouse_handover', 'warehouse_diverted',
      'warehouse_exceptions', 'warehouse_history',

      // Customer Service routes (Phase 6)
      'cs_dashboard', 'cs_shipments', 'cs_shipment_detail', 'cs_queue', 'cs_compose', 'cs_history', 'cs_escalations', 'cs_ai_assistant',

      // Customer Portal routes (Phase 7)
      'customer_home', 'customer_track', 'customer_shipment_detail', 'customer_notifications',
      'customer_contact', 'customer_queries', 'customer_history', 'customer_ai_assistant'
    ].includes(r);
  },

  handleHashChange() {
    const raw = window.location.hash.replace('#/', '').replace('#', '');
    let route = this.resolveRoute(raw);
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    if (route === 'resources' && (!user || user.role === 'Administrator')) {
      route = 'dashboard';
      window.location.hash = '#/dashboard';
    }
    if (this.isValidRoute(route) && route !== this.currentView) {
      this.navigateTo(route, false);
    }
  },

  navigateTo(viewName, updateHash = true) {
    let resolved = this.resolveRoute(viewName);
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    if (resolved === 'resources' && (!user || user.role === 'Administrator')) {
      resolved = 'dashboard';
    }
    if (!this.isValidRoute(resolved)) return;

    this.currentView = resolved;
    if (updateHash) {
      window.location.hash = `#/${resolved}`;
    }

    if (viewName === 'login') {
      this.render();
      return;
    }

    // Update active nav class
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.getAttribute('data-view');
      if (target === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update topbar title
    this.updateTopbarTitle();

    // Update 8-step flow ribbon
    this.updateFlowBar();

    // Render the view content
    this.renderCurrentView();

    // Scroll to top
    const mainContent = document.getElementById('app-main-content');
    if (mainContent) mainContent.scrollTop = 0;
  },

  render() {
    const root = document.getElementById('app-root');
    if (!root) return;

    if (!window.BRIDGES_AUTH.isAuthenticated() || this.currentView === 'login') {
      root.innerHTML = this.renderLoginView();
      return;
    }

    root.innerHTML = this.renderAppShell();
    this.renderCurrentView();
  },

  renderLoginView() {
    return `
      <div class="login-wrapper">
        <div class="login-card-container animate-fade-in">
          <!-- Left side: 3D Isometric Shipment Exception Control Tower Illustration -->
          <div class="login-illustration-side"></div>

          <!-- Right side: Form (Matches reference mockup layout with exact requested text) -->
          <div class="login-form-side">
            <div class="login-form-content">
              <h1 class="login-title">Login</h1>
              <p class="login-subtitle">
                Welcome to Shipment exception control management
              </p>

              <form id="app-login-form" onsubmit="App.handleLoginSubmit(event)">
                <div id="login-error-alert" class="alert alert-danger" style="display: none; padding: 9px 12px; background: #FDE8E6; color: #EA341F; border-radius: 6px; font-size: 12px; margin-bottom: 14px;"></div>

                <div class="login-field-group">
                  <label class="login-field-label" for="login-email">E-mail</label>
                  <input type="email" id="login-email" name="email" class="login-input" value="dispatcher@gmail.com" required autocomplete="email" placeholder="dispatcher@gmail.com">
                </div>

                <div class="login-field-group">
                  <label class="login-field-label" for="login-password">Password</label>
                  <input type="password" id="login-password" name="password" class="login-input" value="1" required autocomplete="current-password" placeholder="••••••••••••">
                </div>

                <button type="submit" class="btn-login-submit" id="login-submit-btn">
                  Login
                </button>
              </form>

              <!-- Quick Demo Access Switcher -->
              <div style="margin-top: 18px; padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; font-size: 11px; color: #393A50; line-height: 1.5;">
                <div style="font-weight: 700; color: #18217E; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                  <span>Demo Access Roles:</span>
                  <span style="font-size: 10px; color: var(--color-muted-sage);">password: 1</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 6px;">
                  <button type="button" onclick="App.autofillAdminCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #CBD5E1; color: var(--color-charcoal); border-radius: 4px; cursor: pointer;">
                    Admin
                  </button>
                  <button type="button" onclick="App.autofillAnalystCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #CBD5E1; color: var(--color-charcoal); border-radius: 4px; cursor: pointer;">
                    Analyst
                  </button>
                  <button type="button" onclick="App.autofillDispatcherCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #CBD5E1; color: var(--color-charcoal); border-radius: 4px; cursor: pointer;">
                    Dispatcher
                  </button>
                  <button type="button" onclick="App.autofillCarrierCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #CBD5E1; color: var(--color-charcoal); border-radius: 4px; cursor: pointer;">
                    Carrier
                  </button>
                  <button type="button" onclick="App.autofillWarehouseCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #CBD5E1; color: var(--color-charcoal); border-radius: 4px; cursor: pointer;">
                    Warehouse
                  </button>
                  <button type="button" onclick="App.autofillCSCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 600; background: white; border: 1px solid #8C2527; color: #8C2527; border-radius: 4px; cursor: pointer;">
                    Cust Serv
                  </button>
                  <button type="button" onclick="App.autofillCustomerCredentials()" style="padding: 5px 3px; font-size: 9px; font-weight: 700; background: #18217E; border: 1px solid #18217E; color: white; border-radius: 4px; cursor: pointer;">
                    Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  autofillAdminCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'admin@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Administrator credentials filled (admin@gmail.com / 1).', 'info');
  },

  autofillAnalystCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'cta@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Analyst credentials filled (cta@gmail.com / 1).', 'info');
  },

  autofillDispatcherCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'dispatcher@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Dispatcher credentials filled (dispatcher@gmail.com / 1).', 'info');
  },

  autofillCarrierCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'carrier@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Carrier Operations credentials filled (carrier@gmail.com / 1).', 'info');
  },

  autofillWarehouseCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'warehouse@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Warehouse Supervisor credentials filled (warehouse@gmail.com / 1).', 'info');
  },

  autofillCSCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'cs@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Customer Service credentials filled (cs@gmail.com / 1).', 'info');
  },

  autofillCustomerCredentials() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'customer@gmail.com';
    if (passField) passField.value = '1';
    UI.showToast('Customer Portal credentials filled (customer@gmail.com / 1).', 'info');
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const alertBox = document.getElementById('login-error-alert');

    const result = window.BRIDGES_AUTH.login(email, password);
    if (result.success) {
      if (alertBox) alertBox.style.display = 'none';
      if (result.user.role === 'Customer') {
        UI.showToast(`Welcome, ${result.user.name} (${result.user.customerName || 'Customer Portal'}).`, 'success');
        this.currentView = 'customer_home';
        window.location.hash = '#/customer_home';
      } else if (result.user.role === 'Customer Service') {
        UI.showToast(`Welcome, ${result.user.name} (Customer Service).`, 'success');
        this.currentView = 'cs_dashboard';
        window.location.hash = '#/cs_dashboard';
      } else if (result.user.role === 'Warehouse Supervisor') {
        UI.showToast(`Welcome, ${result.user.name} (Warehouse Supervisor - Dallas Central Hub).`, 'success');
        this.currentView = 'warehouse_dashboard';
        window.location.hash = '#/warehouse_dashboard';
      } else if (result.user.role === 'Carrier Operations User') {
        UI.showToast(`Welcome, ${result.user.name} (Carrier Operations - Bridges Global Logistics).`, 'success');
        this.currentView = 'carrier_dashboard';
        window.location.hash = '#/carrier_dashboard';
      } else if (result.user.role === 'Dispatcher / Transport Planner') {
        UI.showToast(`Welcome, ${result.user.name} (Dispatcher / Transport Planner).`, 'success');
        this.currentView = 'dispatcher_dashboard';
        window.location.hash = '#/dispatcher_dashboard';
      } else if (result.user.role === 'Control Tower Analyst') {
        UI.showToast(`Welcome, ${result.user.name} (Control Tower Analyst).`, 'success');
        this.currentView = 'analyst_dashboard';
        window.location.hash = '#/analyst_dashboard';
      } else {
        UI.showToast(`Welcome back, ${result.user.name} (Administrator).`, 'success');
        this.currentView = 'dashboard';
        window.location.hash = '#/dashboard';
      }
      this.render();
    } else {
      if (alertBox) {
        alertBox.textContent = result.error;
        alertBox.style.display = 'block';
      }
      UI.showToast(result.error, 'error');
    }
  },

  renderAppShell() {
    const user = window.BRIDGES_AUTH.getCurrentUser();
    const isCustomer = user && user.role === 'Customer';
    const isCS = user && user.role === 'Customer Service';
    const isWarehouse = user && user.role === 'Warehouse Supervisor';
    const isCarrier = user && user.role === 'Carrier Operations User';
    const isDispatcher = user && user.role === 'Dispatcher / Transport Planner';
    const isAnalyst = user && user.role === 'Control Tower Analyst';

    const brandLanding = isCustomer ? 'customer_home' : isCS ? 'cs_dashboard' : isWarehouse ? 'warehouse_dashboard' : isCarrier ? 'carrier_dashboard' : isDispatcher ? 'dispatcher_dashboard' : isAnalyst ? 'analyst_dashboard' : 'dashboard';

    // Customer notifications & actions count
    let customerUnreadCount = 0;
    let customerActionNeededCount = 0;
    if (isCustomer && window.BRIDGES_STORE) {
      customerUnreadCount = (window.BRIDGES_STORE.getCustomerNotifications() || []).filter(n => !n.isRead).length;
      customerActionNeededCount = (window.BRIDGES_STORE.getCustomerQueries() || []).filter(q => q.status === 'Awaiting Customer').length;
    }

    // Carrier unread notifications count
    let carrierUnreadCount = 0;
    if (isCarrier && window.BRIDGES_STORE) {
      carrierUnreadCount = (window.BRIDGES_STORE.getCarrierNotifications() || []).filter(n => !n.read).length;
    }

    // Warehouse active blockers count
    let warehouseBlockersCount = 0;
    if (isWarehouse && window.BRIDGES_STORE) {
      warehouseBlockersCount = (window.BRIDGES_STORE.getWarehouseBlockers() || []).filter(b => b.status === 'Open').length;
    }

    // Customer Service updates required count
    let csUpdatesCount = 0;
    if (isCS && window.BRIDGES_STORE) {
      csUpdatesCount = (window.BRIDGES_STORE.data.shipments || []).filter(s => s.customerUpdateStatus === 'Update Required').length;
    }

    // Active unread notifications count for the topbar bell badge
    let activeUnreadCount = 0;
    if (isCustomer) {
      activeUnreadCount = customerUnreadCount;
    } else if (isCarrier) {
      activeUnreadCount = carrierUnreadCount;
    } else {
      activeUnreadCount = this.getOperationalUnreadCount();
    }

    return `
      <div class="app-layout ${this.sidebarCollapsed ? 'sidebar-is-collapsed' : ''}">
        <!-- Fixed Left Sidebar -->
        <aside class="app-sidebar" id="app-sidebar">
          <!-- Top Header: Logo + Brand + Collapse button -->
          <div class="sidebar-top">
            <div class="sidebar-brand" onclick="App.navigateTo('${brandLanding}')">
              <div class="brand-logo-icon">
                ${Icons.logo(22)}
              </div>
              <span class="brand-name">BRIDGES</span>
            </div>
            <button class="sidebar-collapse-btn" onclick="App.toggleSidebar()" title="Toggle Sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
          </div>

          <!-- Navigation Groups -->
          <nav class="sidebar-nav">
            ${isCustomer ? this.renderCustomerNav() : isCS ? this.renderCustomerServiceNav() : isWarehouse ? this.renderWarehouseNav() : isCarrier ? this.renderCarrierNav() : isDispatcher ? this.renderDispatcherNav() : isAnalyst ? this.renderAnalystNav() : this.renderAdminNav()}
          </nav>

          <!-- Sidebar Footer: Profile Card -->
          <div class="sidebar-footer">
            <div class="user-profile-card" onclick="App.showProfileMenu()" title="View session details / switch role">
              <div class="profile-avatar-wrap">
                <img src="${user ? user.avatar : 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=120'}" alt="${user ? user.name : 'User'}" class="profile-avatar-img">
              </div>
              <div class="profile-info-wrap">
                <span class="profile-name">${user ? user.name : (isCustomer ? 'Sarah Jenkins' : isCS ? 'Clara Hughes' : isWarehouse ? 'Carlos Mendoza' : isCarrier ? 'Marcus Vance' : 'Elena Rostova')}</span>
                <span class="profile-sub">${isCustomer ? `${user ? user.customerName : 'BioPharma Health Alliance'} (Portal)` : isCS ? 'Senior Customer Care Specialist' : isWarehouse ? `${user.warehouseName || 'Dallas Central Hub'} (${user.warehouseId || 'WH-DAL-01'})` : isCarrier ? 'Bridges Global Logistics (CAR-01)' : (user ? user.title : 'Lead Transport Dispatcher')}</span>
              </div>
              <button type="button" class="profile-logout-icon-btn" onclick="event.stopPropagation(); App.handleLogout();" title="Sign Out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="app-main-wrapper">
          <!-- Top Navigation Bar -->
          <header class="app-topbar">
            <div class="topbar-left">
              <!-- Page title intentionally hidden in topbar per layout design (view headers appear in main content) -->
              <span id="topbar-page-title" style="display: none;"></span>
            </div>

            <div class="topbar-right">
              <!-- Unique Command Search Bar & Quick Jump Palette -->
              <div class="global-search-container" id="global-search-container">
                <div class="global-search-bar" id="global-search-bar" onclick="document.getElementById('global-search-input').focus()">
                  <div class="search-lens-ring" title="Global Command &amp; Telemetry Search">
                    <svg class="search-lens-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <div class="search-scope-chip" title="Instant Command &amp; Telemetry Lookup">
                    <span class="scope-sparkle">✦</span>
                    <span class="scope-text">Command</span>
                  </div>
                  <input type="text" id="global-search-input" 
                    placeholder="${isCustomer ? 'Search shipments, orders, tracking #' : isCS ? 'Search shipments, orders, customer refs...' : isWarehouse ? 'Search warehouse queue, docks, SKUs...' : isCarrier ? 'Search shipments, requests, units...' : 'Search shipments, exceptions, carriers...'}" 
                    onkeydown="App.handleGlobalSearch(event)"
                    onfocus="App.onSearchFocus()"
                    onblur="App.onSearchBlur()"
                    oninput="App.onSearchInput(this.value)"
                    autocomplete="off">
                  <button type="button" class="search-clear-btn" id="search-clear-btn" onclick="App.clearSearch(event)" title="Clear Search" style="display: none;">✕</button>
                </div>

                <!-- Sleek Command Palette Quick-Suggestions Dropdown -->
                <div class="search-suggestions-dropdown" id="search-suggestions-dropdown" style="display: none;">
                  <div class="suggestions-header">
                    <span class="suggestions-title">⚡ Quick Jump &amp; Direct Filters</span>
                    <span class="suggestions-hint">Press ↵ or click</span>
                  </div>
                  <div class="suggestions-chips-row">
                    <button type="button" class="sugg-chip" onmousedown="App.quickSearchAction('shipments')">
                      <span class="sugg-icon">📦</span> Shipments
                    </button>
                    <button type="button" class="sugg-chip" onmousedown="App.quickSearchAction('carriers')">
                      <span class="sugg-icon">🚚</span> Carriers
                    </button>
                    <button type="button" class="sugg-chip" onmousedown="App.quickSearchAction('exceptions')">
                      <span class="sugg-icon">⚠️</span> Exceptions
                    </button>
                    <button type="button" class="sugg-chip" onmousedown="App.quickSearchAction('users')">
                      <span class="sugg-icon">👥</span> Users
                    </button>
                    <button type="button" class="sugg-chip" onmousedown="App.quickSearchAction('analytics')">
                      <span class="sugg-icon">📊</span> Analytics
                    </button>
                  </div>
                  <div class="suggestions-footer">
                    <span>💡 <strong>Quick tip:</strong> Type tracking ID (e.g. <code>#BRG-2847</code>), carrier, or driver name and press <strong>Enter</strong> to jump directly.</span>
                  </div>
                </div>
              </div>

              <!-- Notifications Icon with Red Badge -->
              <div class="topbar-round-btn" onclick="App.showNotifications()" title="Notifications &amp; Operational Alerts" style="cursor: pointer;">
                ${Icons.bell(16)}
                <span class="topbar-badge-pill" id="carrier-unread-badge" style="${activeUnreadCount > 0 ? '' : 'display: none;'}">${activeUnreadCount}</span>
              </div>
            </div>
          </header>

          <!-- Main Dynamic Page Content -->
          <main class="app-main-content" id="app-main-content">
            <!-- Rendered by renderCurrentView() -->
          </main>
        </div>
      </div>
    `;
  },

  renderCustomerNav() {
    let unreadNotifs = 0;
    let actionQueries = 0;
    if (window.BRIDGES_STORE) {
      unreadNotifs = (window.BRIDGES_STORE.getCustomerNotifications() || []).filter(n => !n.isRead).length;
      actionQueries = (window.BRIDGES_STORE.getCustomerQueries() || []).filter(q => q.status === 'Awaiting Customer').length;
    }

    return `
      <div class="nav-group-title">CUSTOMER PORTAL</div>
      <ul class="nav-list">
        <!-- 1. Home -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_home' ? 'active' : ''}" data-view="customer_home" onclick="App.navigateTo('customer_home')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard ? Icons.dashboard(17) : Icons.package(17)}</span>
              <span class="nav-label">Customer Home</span>
            </div>
          </div>
        </li>

        <!-- 2. Track Shipment -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_track' || this.currentView === 'customer_shipment_detail' ? 'active' : ''}" data-view="customer_track" onclick="App.navigateTo('customer_track')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.truck ? Icons.truck(17) : Icons.search(17)}</span>
              <span class="nav-label">Track Shipment</span>
            </div>
          </div>
        </li>

        <!-- 3. Notifications & Updates -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_notifications' ? 'active' : ''}" data-view="customer_notifications" onclick="App.navigateTo('customer_notifications')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.bell ? Icons.bell(17) : Icons.alert(17)}</span>
              <span class="nav-label">Notifications &amp; Updates</span>
            </div>
            ${unreadNotifs > 0 ? `
              <span class="nav-badge-pill" style="background: #EA341F; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;">
                ${unreadNotifs}
              </span>
            ` : ''}
          </div>
        </li>

        <!-- 4. Contact Customer Service -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_contact' ? 'active' : ''}" data-view="customer_contact" onclick="App.navigateTo('customer_contact')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.message ? Icons.message(17) : Icons.inbox(17)}</span>
              <span class="nav-label">Contact Support</span>
            </div>
          </div>
        </li>

        <!-- 5. My Queries -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_queries' ? 'active' : ''}" data-view="customer_queries" onclick="App.navigateTo('customer_queries')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.inbox ? Icons.inbox(17) : Icons.clipboard(17)}</span>
              <span class="nav-label">My Support Queries</span>
            </div>
            ${actionQueries > 0 ? `
              <span class="nav-badge-pill" style="background: #18217E; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;">
                ${actionQueries}
              </span>
            ` : ''}
          </div>
        </li>

        <!-- 6. Delivery History -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_history' ? 'active' : ''}" data-view="customer_history" onclick="App.navigateTo('customer_history')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.audit ? Icons.audit(17) : Icons.check(17)}</span>
              <span class="nav-label">Delivery History</span>
            </div>
          </div>
        </li>

        <!-- 7. AI Self-Service Assistant -->
        <li>
          <div class="nav-link ${this.currentView === 'customer_ai_assistant' ? 'active' : ''}" data-view="customer_ai_assistant" onclick="App.navigateTo('customer_ai_assistant')">
            <div class="nav-link-left">
              <span class="nav-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
              </span>
              <span class="nav-label">AI Self-Service</span>
            </div>
            <span class="nav-badge-pill" style="background: rgba(24, 33, 126, 0.12); color: #18217E; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; border: 1px solid rgba(24, 33, 126, 0.22);">
              AI Copilot
            </span>
          </div>
        </li>
      </ul>
    `;
  },

  renderCustomerServiceNav() {
    let updateReqCount = 0;
    let openEscCount = 0;
    if (window.BRIDGES_STORE && window.BRIDGES_STORE.data) {
      updateReqCount = (window.BRIDGES_STORE.data.shipments || []).filter(s => s.customerUpdateStatus === 'Update Required').length;
      openEscCount = (window.BRIDGES_STORE.data.escalations || []).filter(e => !['Resolved', 'Closed'].includes(e.status)).length;
    }

    return `
      <div class="nav-group-title">CUSTOMER SERVICE</div>
      <ul class="nav-list">
        <!-- 1. Dashboard -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_dashboard' ? 'active' : ''}" data-view="cs_dashboard" onclick="App.navigateTo('cs_dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>

        <!-- 2. Shipment Search -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_shipments' || this.currentView === 'cs_shipment_detail' ? 'active' : ''}" data-view="cs_shipments" onclick="App.navigateTo('cs_shipments')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.search ? Icons.search(17) : Icons.clipboard(17)}</span>
              <span class="nav-label">Shipment Search</span>
            </div>
          </div>
        </li>

        <!-- 3. Communication Queue -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_queue' ? 'active' : ''}" data-view="cs_queue" onclick="App.navigateTo('cs_queue')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.inbox ? Icons.inbox(17) : Icons.clipboard(17)}</span>
              <span class="nav-label">Communication Queue</span>
            </div>
            ${updateReqCount > 0 ? `
              <span class="nav-badge-pill" style="background: #EA341F; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;">
                ${updateReqCount}
              </span>
            ` : ''}
          </div>
        </li>

        <!-- 4. Compose Message -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_compose' ? 'active' : ''}" data-view="cs_compose" onclick="App.navigateTo('cs_compose')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.message(17)}</span>
              <span class="nav-label">Compose Message</span>
            </div>
          </div>
        </li>

        <!-- 5. Operational Escalations -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_escalations' ? 'active' : ''}" data-view="cs_escalations" onclick="App.navigateTo('cs_escalations')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.alert ? Icons.alert(17) : Icons.bell(17)}</span>
              <span class="nav-label">Operational Escalations</span>
            </div>
            ${openEscCount > 0 ? `
              <span class="nav-badge-pill" style="background: #8C2527; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;">
                ${openEscCount}
              </span>
            ` : ''}
          </div>
        </li>

        <!-- 6. Communication History -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_history' ? 'active' : ''}" data-view="cs_history" onclick="App.navigateTo('cs_history')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.audit(17)}</span>
              <span class="nav-label">Communication History</span>
            </div>
          </div>
        </li>

        <!-- 7. AI Support Assistant -->
        <li>
          <div class="nav-link ${this.currentView === 'cs_ai_assistant' ? 'active' : ''}" data-view="cs_ai_assistant" onclick="App.navigateTo('cs_ai_assistant')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.bot(17)}</span>
              <span class="nav-label">AI Support Assistant</span>
            </div>
            <span class="nav-badge-pill" style="background: rgba(24, 33, 126, 0.12); color: #18217E; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 8px; border: 1px solid rgba(24, 33, 126, 0.25);">
              AI Copilot
            </span>
          </div>
        </li>
      </ul>
    `;
  },

  renderWarehouseNav() {
    // 10 items per Section 3 Prompt:
    // MAIN MENU: 1. Dashboard, 2. Inbound & Outbound Shipments, 3. Warehouse Readiness, 4. Dock Schedule, 5. Picking & Packing, 6. Loading & Dispatch, 7. Carrier Handover, 8. Diverted Shipments, 9. Warehouse Exceptions
    // OTHERS: 10. Activity History
    return `
      <div class="nav-group-title">MAIN MENU</div>
      <ul class="nav-list">
        <!-- 1. Dashboard -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_dashboard' ? 'active' : ''}" data-view="warehouse_dashboard" onclick="App.navigateTo('warehouse_dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>

        <!-- 2. Inbound & Outbound Shipments -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_shipments' ? 'active' : ''}" data-view="warehouse_shipments" onclick="App.navigateTo('warehouse_shipments')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.truck(17)}</span>
              <span class="nav-label">Inbound & Outbound Shipments</span>
            </div>
          </div>
        </li>

        <!-- 3. Warehouse Readiness -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_readiness' ? 'active' : ''}" data-view="warehouse_readiness" onclick="App.navigateTo('warehouse_readiness')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.clipboard(17)}</span>
              <span class="nav-label">Warehouse Readiness</span>
            </div>
          </div>
        </li>

        <!-- 4. Dock Schedule -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_docks' ? 'active' : ''}" data-view="warehouse_docks" onclick="App.navigateTo('warehouse_docks')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.calendar(17)}</span>
              <span class="nav-label">Dock Schedule</span>
            </div>
          </div>
        </li>

        <!-- 5. Picking & Packing -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_picking' ? 'active' : ''}" data-view="warehouse_picking" onclick="App.navigateTo('warehouse_picking')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.resources(17)}</span>
              <span class="nav-label">Picking & Packing</span>
            </div>
          </div>
        </li>

        <!-- 6. Loading & Dispatch -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_loading' ? 'active' : ''}" data-view="warehouse_loading" onclick="App.navigateTo('warehouse_loading')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.gauge(17)}</span>
              <span class="nav-label">Loading & Dispatch</span>
            </div>
          </div>
        </li>

        <!-- 7. Carrier Handover -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_handover' ? 'active' : ''}" data-view="warehouse_handover" onclick="App.navigateTo('warehouse_handover')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.carrier(17)}</span>
              <span class="nav-label">Carrier Handover</span>
            </div>
          </div>
        </li>

        <!-- 8. Diverted Shipments -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_diverted' ? 'active' : ''}" data-view="warehouse_diverted" onclick="App.navigateTo('warehouse_diverted')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.refresh(17)}</span>
              <span class="nav-label">Diverted Shipments</span>
            </div>
          </div>
        </li>

        <!-- 9. Warehouse Exceptions -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_exceptions' ? 'active' : ''}" data-view="warehouse_exceptions" onclick="App.navigateTo('warehouse_exceptions')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.alertTriangle(17)}</span>
              <span class="nav-label">Warehouse Exceptions</span>
            </div>
          </div>
        </li>
      </ul>

      <div class="nav-group-title mt-3">OTHERS</div>
      <ul class="nav-list">
        <!-- 10. Activity History -->
        <li>
          <div class="nav-link ${this.currentView === 'warehouse_history' ? 'active' : ''}" data-view="warehouse_history" onclick="App.navigateTo('warehouse_history')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.audit(17)}</span>
              <span class="nav-label">Activity History</span>
            </div>
          </div>
        </li>
      </ul>
    `;
  },

  renderCarrierNav() {
    // 9 items per Prompt Section 3:
    // MAIN MENU: 1. Dashboard, 2. Assignment Requests, 3. My Shipments, 4. Vehicle Management, 5. Driver Management, 6. Shipment Execution, 7. Disruption Reporting, 8. Delivery Confirmation
    // OTHERS: 9. Activity History
    return `
      <div class="nav-group-title">MAIN MENU</div>
      <ul class="nav-list">
        <!-- 1. Dashboard -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_dashboard' ? 'active' : ''}" data-view="carrier_dashboard" onclick="App.navigateTo('carrier_dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>

        <!-- 2. Assignment Requests -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_requests' ? 'active' : ''}" data-view="carrier_requests" onclick="App.navigateTo('carrier_requests')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.inbox(17)}</span>
              <span class="nav-label">Assignment Requests</span>
            </div>
          </div>
        </li>

        <!-- 3. My Shipments -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_shipments' ? 'active' : ''}" data-view="carrier_shipments" onclick="App.navigateTo('carrier_shipments')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.package(17)}</span>
              <span class="nav-label">My Shipments</span>
            </div>
          </div>
        </li>

        <!-- 4. Vehicle Management -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_vehicles' ? 'active' : ''}" data-view="carrier_vehicles" onclick="App.navigateTo('carrier_vehicles')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.truck(17)}</span>
              <span class="nav-label">Vehicle Management</span>
            </div>
          </div>
        </li>

        <!-- 5. Driver Management -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_drivers' ? 'active' : ''}" data-view="carrier_drivers" onclick="App.navigateTo('carrier_drivers')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.steeringWheel(17)}</span>
              <span class="nav-label">Driver Management</span>
            </div>
          </div>
        </li>

        <!-- 6. Shipment Execution -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_execution' ? 'active' : ''}" data-view="carrier_execution" onclick="App.navigateTo('carrier_execution')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.execution(17)}</span>
              <span class="nav-label">Shipment Execution</span>
            </div>
          </div>
        </li>

        <!-- 7. Disruption Reporting -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_disruptions' ? 'active' : ''}" data-view="carrier_disruptions" onclick="App.navigateTo('carrier_disruptions')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.disruption(17)}</span>
              <span class="nav-label">Disruption Reporting</span>
            </div>
          </div>
        </li>

        <!-- 8. Delivery Confirmation -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_delivery' ? 'active' : ''}" data-view="carrier_delivery" onclick="App.navigateTo('carrier_delivery')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.delivery(17)}</span>
              <span class="nav-label">Delivery Confirmation</span>
            </div>
          </div>
        </li>
      </ul>

      <div class="nav-group-title mt-3">OTHERS</div>
      <ul class="nav-list">
        <!-- 9. Activity History -->
        <li>
          <div class="nav-link ${this.currentView === 'carrier_history' ? 'active' : ''}" data-view="carrier_history" onclick="App.navigateTo('carrier_history')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.history(17)}</span>
              <span class="nav-label">Activity History</span>
            </div>
          </div>
        </li>
      </ul>
    `;
  },

  renderDispatcherNav() {
    // 8 items per Section 3 prompt:
    // MAIN MENU: 1. Dashboard, 2. Exception Queue, 3. Recovery Planning, 4. Carrier Assignment, 5. Recovery Requests, 6. Shipment Tracking, 7. Escalations
    // OTHERS: 8. Completed Recoveries
    return `
      <div class="nav-group-title">MAIN MENU</div>
      <ul class="nav-list">
        <!-- 1. Dashboard -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_dashboard' ? 'active' : ''}" data-view="dispatcher_dashboard" onclick="App.navigateTo('dispatcher_dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>

        <!-- 2. Exception Queue -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_queue' ? 'active' : ''}" data-view="dispatcher_queue" onclick="App.navigateTo('dispatcher_queue')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.exceptionQueue(17)}</span>
              <span class="nav-label">Exception Queue</span>
            </div>
          </div>
        </li>

        <!-- 3. Recovery Planning -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_planning' ? 'active' : ''}" data-view="dispatcher_planning" onclick="App.navigateTo('dispatcher_planning')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.planning(17)}</span>
              <span class="nav-label">Recovery Planning</span>
            </div>
          </div>
        </li>

        <!-- 4. Carrier Assignment -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_carriers' ? 'active' : ''}" data-view="dispatcher_carriers" onclick="App.navigateTo('dispatcher_carriers')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.carrier(17)}</span>
              <span class="nav-label">Carrier Assignment</span>
            </div>
          </div>
        </li>

        <!-- 5. Recovery Requests -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_recoveries' ? 'active' : ''}" data-view="dispatcher_recoveries" onclick="App.navigateTo('dispatcher_recoveries')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.recovery(17)}</span>
              <span class="nav-label">Recovery Requests</span>
            </div>
          </div>
        </li>

        <!-- 6. Shipment Tracking -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_tracking' ? 'active' : ''}" data-view="dispatcher_tracking" onclick="App.navigateTo('dispatcher_tracking')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.truck(17)}</span>
              <span class="nav-label">Shipment Tracking</span>
            </div>
          </div>
        </li>

        <!-- 7. Escalations -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_escalations' ? 'active' : ''}" data-view="dispatcher_escalations" onclick="App.navigateTo('dispatcher_escalations')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.escalation(17)}</span>
              <span class="nav-label">Escalations</span>
            </div>
          </div>
        </li>

        <!-- 8. Exception Approvals & Decision Overrides -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_approvals' ? 'active' : ''}" data-view="dispatcher_approvals" onclick="App.navigateTo('dispatcher_approvals')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.check(17)}</span>
              <span class="nav-label">Approvals &amp; Overrides</span>
            </div>
            <span class="nav-badge" style="background: #EA341F; color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 10px;">${window.BRIDGES_STORE ? window.BRIDGES_STORE.getExceptionApprovals('Pending Approval').length : 2}</span>
          </div>
        </li>
      </ul>

      <div class="nav-group-title mt-3">OTHERS</div>
      <ul class="nav-list">
        <!-- 9. Completed Recoveries -->
        <li>
          <div class="nav-link ${this.currentView === 'dispatcher_completed' ? 'active' : ''}" data-view="dispatcher_completed" onclick="App.navigateTo('dispatcher_completed')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.shieldCheck(17)}</span>
              <span class="nav-label">Completed Recoveries</span>
            </div>
          </div>
        </li>
      </ul>
    `;
  },

  renderAnalystNav() {
    return `
      <div class="nav-group-title">MAIN MENU</div>
      <ul class="nav-list">
        <!-- 1. Dashboard -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_dashboard' ? 'active' : ''}" data-view="analyst_dashboard" onclick="App.navigateTo('analyst_dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>

        <!-- 2. Active Shipments -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_shipments' ? 'active' : ''}" data-view="analyst_shipments" onclick="App.navigateTo('analyst_shipments')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.package(17)}</span>
              <span class="nav-label">Active Shipments</span>
            </div>
          </div>
        </li>

        <!-- 3. Exception Queue -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_queue' ? 'active' : ''}" data-view="analyst_queue" onclick="App.navigateTo('analyst_queue')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.exceptionQueue(17)}</span>
              <span class="nav-label">Exception Queue</span>
            </div>
          </div>
        </li>

        <!-- 4. Recovery Requests -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_recoveries' ? 'active' : ''}" data-view="analyst_recoveries" onclick="App.navigateTo('analyst_recoveries')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.recovery(17)}</span>
              <span class="nav-label">Recovery Requests</span>
            </div>
          </div>
        </li>

        <!-- 7. Tracking & Events -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_events' ? 'active' : ''}" data-view="analyst_events" onclick="App.navigateTo('analyst_events')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.events(17)}</span>
              <span class="nav-label">Tracking & Events</span>
            </div>
          </div>
        </li>

        <!-- 8. Exception History -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_history' ? 'active' : ''}" data-view="analyst_history" onclick="App.navigateTo('analyst_history')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.exceptionHistory(17)}</span>
              <span class="nav-label">Exception History</span>
            </div>
          </div>
        </li>
      </ul>

      <div class="nav-group-title" style="margin-top: 14px;">INTEGRATION &amp; DATA</div>
      <ul class="nav-list">
        <!-- 9. Shipment & Order Onboarding -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_onboarding' ? 'active' : ''}" data-view="analyst_onboarding" onclick="App.navigateTo('analyst_onboarding')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.clipboard(17)}</span>
              <span class="nav-label">Shipment Onboarding</span>
            </div>
          </div>
        </li>

        <!-- 10. Data Quality Management -->
        <li>
          <div class="nav-link ${this.currentView === 'analyst_data_quality' ? 'active' : ''}" data-view="analyst_data_quality" onclick="App.navigateTo('analyst_data_quality')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.audit(17)}</span>
              <span class="nav-label">Data Quality Mgmt</span>
            </div>
          </div>
        </li>
      </ul>
    `;
  },

  renderAdminNav() {
    return `
      <ul class="nav-list">
        <li>
          <div class="nav-link ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard" onclick="App.navigateTo('dashboard')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.dashboard(17)}</span>
              <span class="nav-label">Dashboard</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'users' ? 'active' : ''}" data-view="users" onclick="App.navigateTo('users')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.users(17)}</span>
              <span class="nav-label">User &amp; Access</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'carriers' ? 'active' : ''}" data-view="carriers" onclick="App.navigateTo('carriers')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.carrier(17)}</span>
              <span class="nav-label">Carrier Management</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'analytics' ? 'active' : ''}" data-view="analytics" onclick="App.navigateTo('analytics')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.analytics(17)}</span>
              <span class="nav-label">Analytics &amp; Reports</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'exceptions' ? 'active' : ''}" data-view="exceptions" onclick="App.navigateTo('exceptions')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.exceptionHistory(17)}</span>
              <span class="nav-label">Exception History</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'sla_rules' ? 'active' : ''}" data-view="sla_rules" onclick="App.navigateTo('sla_rules')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.clock ? Icons.clock(17) : Icons.gauge(17)}</span>
              <span class="nav-label">SLA &amp; Rules</span>
            </div>
          </div>
        </li>
        <li>
          <div class="nav-link ${this.currentView === 'audit' ? 'active' : ''}" data-view="audit" onclick="App.navigateTo('audit')">
            <div class="nav-link-left">
              <span class="nav-icon">${Icons.audit(17)}</span>
              <span class="nav-label">Audit Log</span>
            </div>
          </div>
        </li>
      </ul>
    `;
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    const layout = document.querySelector('.app-layout');
    if (layout) {
      layout.classList.toggle('sidebar-is-collapsed', this.sidebarCollapsed);
    }
  },

  handleLogout() {
    UI.closeModal('generic-app-modal');
    UI.closeModal('app-confirm-modal');
    window.BRIDGES_AUTH.logout();
    this.currentView = 'login';
    window.location.hash = '#/login';
    UI.showToast('You have been signed out successfully.', 'info');
    this.render();
  },

  showProfileMenu() {
    const user = window.BRIDGES_AUTH.getCurrentUser();
    const isCustomer = user && user.role === 'Customer';
    const isCS = user && user.role === 'Customer Service';
    const isWarehouse = user && user.role === 'Warehouse Supervisor';
    const isCarrier = user && user.role === 'Carrier Operations User';
    const isDispatcher = user && user.role === 'Dispatcher / Transport Planner';
    const isAnalyst = user && user.role === 'Control Tower Analyst';

    UI.openModal('generic-app-modal', 'User Session & Account', `
      <div style="padding: 10px 0;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <img src="${user ? user.avatar : ''}" alt="Avatar" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #18217E;">
          <div>
            <div style="font-weight: 700; font-size: 15px; color: #070724;">${user ? user.name : ''}</div>
            <div style="font-size: 13px; color: #424989;">${user ? user.email : ''}</div>
            <div style="margin-top: 4px; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${isCustomer ? 'background: rgba(24,33,126,0.12); color: #18217E;' : isCS ? 'background: rgba(140,37,39,0.12); color: #8C2527;' : isWarehouse ? 'background: rgba(24,33,126,0.12); color: #18217E;' : isCarrier ? 'background: rgba(24,33,126,0.12); color: #18217E;' : isDispatcher ? 'background: rgba(66,73,137,0.1); color: #424989;' : isAnalyst ? 'background: rgba(24,33,126,0.1); color: #18217E;' : 'background: rgba(140,37,39,0.1); color: #8C2527;'}">
              ${user ? user.role : ''} ${isCustomer ? `&bull; ${user.customerName || 'Authorized Account'}` : isCS ? '&bull; Customer Care Operations' : isWarehouse ? '&bull; Dallas Central Hub (WH-DAL-01)' : isCarrier ? '&bull; Bridges Global Logistics (CAR-01)' : ''}
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #393A50; margin-bottom: 14px; line-height: 1.5; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          ${isCustomer ? `Customer Portal active. Data is strictly isolated to your authorized account (${user.customerName || 'BioPharma Health Alliance'}). Internal operational notes, AI risk reasoning, and carrier margins remain strictly confidential.` : isCS ? 'Customer Care workspace active. Read-only operational views with customer-safe information, approved ETAs, and communication simulation.' : isWarehouse ? 'Tenant isolation active. Warehouse supervisor workspace is scoped strictly to Dallas Central Hub (WH-DAL-01) operations.' : isCarrier ? 'Tenant isolation active. Carrier portal is filtered strictly to CAR-01 records and assigned operations.' : 'All roles share the underlying shipment, exception, carrier, and recovery dataset.'}
        </div>

        ${isCustomer ? `
          <div style="margin-bottom: 14px; padding: 10px 12px; background: #F1F5F9; border-radius: 6px; border: 1px solid #CBD5E1;">
            <div style="font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 6px;">DEMO DATA ISOLATION TEST (SWITCH CUSTOMER ACCOUNT):</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn ${user && user.customerId === 'CUST-BIO-01' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.BRIDGES_AUTH.switchCustomerAccount('CUST-BIO-01', 'BioPharma Health Alliance', 'Sarah Jenkins'); UI.closeModal('generic-app-modal'); App.navigateTo('customer_home'); UI.showToast('Switched to BioPharma Health Alliance', 'info');" style="font-size: 10px; padding: 3px 8px;">
                BioPharma (4 Shipments)
              </button>
              <button type="button" class="btn ${user && user.customerId === 'CUST-APEX-02' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.BRIDGES_AUTH.switchCustomerAccount('CUST-APEX-02', 'Apex Dynamics Corp', 'David Vance'); UI.closeModal('generic-app-modal'); App.navigateTo('customer_home'); UI.showToast('Switched to Apex Dynamics Corp', 'info');" style="font-size: 10px; padding: 3px 8px;">
                Apex Dynamics (3 Shipments)
              </button>
              <button type="button" class="btn ${user && user.customerId === 'CUST-GME-03' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.BRIDGES_AUTH.switchCustomerAccount('CUST-GME-03', 'Global Maritime Imports', 'Elena Gomez'); UI.closeModal('generic-app-modal'); App.navigateTo('customer_home'); UI.showToast('Switched to Global Maritime Imports', 'info');" style="font-size: 10px; padding: 3px 8px;">
                Global Maritime (2 Shipments)
              </button>
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-charcoal); margin-bottom: 6px;">SWITCH DEMO ROLE:</div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Administrator')" style="font-size: 9px; font-weight: ${!isCustomer && !isCS && !isWarehouse && !isCarrier && !isDispatcher && !isAnalyst ? '700' : '500'};">
              Admin
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Control Tower Analyst')" style="font-size: 9px; font-weight: ${isAnalyst ? '700' : '500'};">
              Analyst
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Dispatcher / Transport Planner')" style="font-size: 9px; font-weight: ${isDispatcher ? '700' : '500'};">
              Dispatcher
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Carrier Operations User')" style="font-size: 9px; font-weight: ${isCarrier ? '700' : '500'};">
              Carrier
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Warehouse Supervisor')" style="font-size: 9px; font-weight: ${isWarehouse ? '700' : '500'};">
              Warehouse
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Customer Service')" style="font-size: 9px; font-weight: ${isCS ? '700' : '500'};">
              Cust Serv
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.switchRole('Customer')" style="font-size: 9px; font-weight: ${isCustomer ? '700' : '500'};">
              Customer
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button type="button" class="btn btn-danger btn-sm w-full" onclick="App.handleLogout();" style="font-weight: 700; width: 100%; padding: 8px 16px;">
            Log Out
          </button>
        </div>
      </div>
    `);
  },

  switchRole(targetRole) {
    UI.closeModal('generic-app-modal');
    if (targetRole === 'Customer') {
      window.BRIDGES_AUTH.login('customer@gmail.com', '1');
    } else if (targetRole === 'Customer Service') {
      window.BRIDGES_AUTH.login('cs@gmail.com', '1');
    } else if (targetRole === 'Warehouse Supervisor') {
      window.BRIDGES_AUTH.login('warehouse@gmail.com', '1');
    } else if (targetRole === 'Carrier Operations User') {
      window.BRIDGES_AUTH.login('carrier@gmail.com', '1');
    } else if (targetRole === 'Dispatcher / Transport Planner') {
      window.BRIDGES_AUTH.login('dispatcher@gmail.com', '1');
    } else if (targetRole === 'Control Tower Analyst') {
      window.BRIDGES_AUTH.login('cta@gmail.com', '1');
    } else {
      window.BRIDGES_AUTH.login('admin@gmail.com', '1');
    }
  },

  renderUseCaseFlowBar() {
    return '';
  },

  toggleFlowBar() {
    const current = localStorage.getItem('BRIDGES_FLOW_BAR_COLLAPSED') === 'true';
    localStorage.setItem('BRIDGES_FLOW_BAR_COLLAPSED', (!current).toString());
    const bar = document.getElementById('usecase-flow-bar');
    if (bar) {
      bar.classList.toggle('is-collapsed', !current);
      const icon = bar.querySelector('.usecase-collapse-toggle svg');
      if (icon) {
        icon.style.transform = !current ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  },

  updateFlowBar() {
    const bar = document.getElementById('usecase-flow-bar');
    if (!bar) return;
    const currentView = this.currentView || '';

    const steps = [
      { num: 1, name: 'Ingest', actor: 'System', views: ['analyst_events', 'analyst_onboarding', 'analyst_shipments'] },
      { num: 2, name: 'Detect', actor: 'Rules', views: ['analyst_dashboard', 'exceptions'] },
      { num: 3, name: 'Predict', actor: 'AI Skill', views: ['analyst_investigation'] },
      { num: 4, name: 'Triage', actor: 'Decisions', views: ['analyst_queue'] },
      { num: 5, name: 'Resolve', actor: 'Analyst/Disp', views: ['dispatcher_planning', 'dispatcher_queue', 'dispatcher_dashboard', 'dispatcher_approvals', 'analyst_recoveries', 'dispatcher_recoveries'] },
      { num: 6, name: 'Collaborate', actor: 'Carrier/WH', views: ['carrier_requests', 'carrier_dashboard', 'carrier_execution', 'carrier_delivery', 'warehouse_docks', 'warehouse_dashboard', 'warehouse_diverted', 'warehouse_shipments', 'warehouse_loading'] },
      { num: 7, name: 'Notify', actor: 'System/CS', views: ['cs_queue', 'cs_dashboard', 'cs_shipments', 'cs_shipment_detail', 'cs_compose', 'cs_escalations', 'customer_home', 'customer_track', 'customer_shipment_detail', 'customer_notifications', 'customer_ai_assistant', 'cs_ai_assistant'] },
      { num: 8, name: 'Learn', actor: 'Process HQ', views: ['analytics', 'audit', 'dashboard', 'carriers', 'resources', 'sla_rules'] }
    ];

    let activeStepNum = 5;
    for (const s of steps) {
      if (s.views.includes(currentView)) {
        activeStepNum = s.num;
        break;
      }
    }

    const activeStepObj = steps.find(s => s.num === activeStepNum) || steps[4];

    // Update pill text
    const pill = bar.querySelector('.usecase-flow-step-pill');
    if (pill) {
      pill.textContent = `Step ${activeStepNum} of 8: ${activeStepObj.name} (${activeStepObj.actor})`;
    }

    // Update step items active/past classes
    const stepEls = bar.querySelectorAll('.usecase-flow-step-item');
    stepEls.forEach((el, idx) => {
      const num = idx + 1;
      el.classList.toggle('active', num === activeStepNum);
      el.classList.toggle('past', num < activeStepNum);
    });
  },

  switchRoleAndNavigate(targetRole, route) {
    const user = window.BRIDGES_AUTH.getCurrentUser();
    if (!user || user.role !== targetRole) {
      if (targetRole === 'Customer') {
        window.BRIDGES_AUTH.login('customer@gmail.com', '1');
      } else if (targetRole === 'Customer Service') {
        window.BRIDGES_AUTH.login('cs@gmail.com', '1');
      } else if (targetRole === 'Warehouse Supervisor') {
        window.BRIDGES_AUTH.login('warehouse@gmail.com', '1');
      } else if (targetRole === 'Carrier Operations User') {
        window.BRIDGES_AUTH.login('carrier@gmail.com', '1');
      } else if (targetRole === 'Dispatcher / Transport Planner') {
        window.BRIDGES_AUTH.login('dispatcher@gmail.com', '1');
      } else if (targetRole === 'Control Tower Analyst') {
        window.BRIDGES_AUTH.login('cta@gmail.com', '1');
      } else {
        window.BRIDGES_AUTH.login('admin@gmail.com', '1');
      }
    }
    setTimeout(() => {
      this.navigateTo(route);
    }, 40);
  },

  showCarrierNotifications() {
    if (!window.BRIDGES_STORE) return;
    const notifs = window.BRIDGES_STORE.getCarrierNotifications() || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    UI.openModal('generic-app-modal', 'Carrier In-App Notifications', `
      <div style="padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
          <div style="font-size: 12px; color: #393A50;">
            <strong style="color: #18217E;">${unreadCount} Unread</strong> notification${unreadCount === 1 ? '' : 's'} for <strong>Bridges Global Logistics</strong>
          </div>
          ${unreadCount > 0 ? `
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.BRIDGES_STORE.markAllCarrierNotificationsRead(); App.showCarrierNotifications();" style="font-size: 11px; padding: 3px 8px;">
              Mark all as read
            </button>
          ` : ''}
        </div>

        <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          ${notifs.length === 0 ? `
            <div style="text-align: center; padding: 32px 16px; color: #8A9995; font-size: 13px;">
              No operational notifications currently on file.
            </div>
          ` : notifs.map(n => `
            <div style="padding: 10px 12px; border-radius: 6px; border: 1px solid ${n.read ? '#E5EBEE' : '#CBD5E1'}; background: ${n.read ? '#FFFFFF' : '#F8FAFC'}; position: relative;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${n.read ? '#CBD5E1' : '#EA341F'};"></span>
                  <strong style="font-size: 12px; color: #070724;">${n.title}</strong>
                </div>
                <span style="font-size: 10.5px; color: #8A9995; white-space: nowrap;">
                  ${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style="font-size: 11.5px; color: #393A50; margin: 0 0 6px 13px; line-height: 1.4;">
                ${n.message}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-left: 13px;">
                <span style="font-size: 10px; font-weight: 700; color: #18217E; background: rgba(24,33,126,0.06); padding: 2px 6px; border-radius: 3px;">
                  ${n.type.toUpperCase()}
                </span>
                <div style="display: flex; gap: 6px;">
                  ${!n.read ? `
                    <button type="button" class="btn btn-link btn-sm" onclick="window.BRIDGES_STORE.markCarrierNotificationRead('${n.id}'); App.showCarrierNotifications();" style="font-size: 11px; padding: 0; color: #18217E; text-decoration: underline;">
                      Mark read
                    </button>
                  ` : ''}
                  ${n.targetPage ? `
                    <button type="button" class="btn btn-link btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigateTo('${n.targetPage}');" style="font-size: 11px; padding: 0; color: #18217E; font-weight: 700;">
                      View &rarr;
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: #8A9995; text-align: center; border-top: 1px solid #E5EBEE; padding-top: 8px;">
          Real-time in-app carrier notifications. Live operational data synchronized with Control Tower.
        </div>
      </div>
    `);
  },

  getOperationalNotifications() {
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const isAnalyst = user && user.role === 'Control Tower Analyst';
    const isDispatcher = user && user.role === 'Dispatcher / Transport Planner';
    const isWarehouse = user && user.role === 'Warehouse Supervisor';
    const isCS = user && user.role === 'Customer Service';

    let readIds = [];
    try {
      readIds = JSON.parse(localStorage.getItem('BRIDGES_READ_OPERATIONAL_NOTIFS') || '[]');
    } catch (e) {
      readIds = [];
    }

    if (isCS) {
      const csAlerts = window.BRIDGES_STORE ? window.BRIDGES_STORE.getCustomerServiceAlerts() : [];
      return csAlerts.map(a => ({
        id: a.id,
        title: a.title,
        message: a.message,
        severity: a.severity || 'Critical',
        targetPage: 'cs_queue',
        targetLabel: 'Open Queue',
        timestamp: a.timestamp || '2026-03-24T11:45:00Z',
        read: readIds.includes(a.id)
      }));
    }

    if (isWarehouse) {
      return [
        {
          id: 'WH-NOTIF-01',
          title: 'Cold-Chain Staging Alert: BRG-2843',
          message: 'Cryo-Medical pallet set arriving at Dock 2 requires immediate pre-chilled transfer verification.',
          severity: 'Critical',
          targetPage: 'warehouse_readiness',
          targetLabel: 'View Readiness',
          timestamp: '2026-03-24T11:40:00Z',
          read: readIds.includes('WH-NOTIF-01')
        },
        {
          id: 'WH-NOTIF-02',
          title: 'Dock 3 Unloading Schedule Shift: BRG-2846',
          message: 'Vessel berth congestion delayed inbound truck BG-09. Dock 3 bay reservation extended.',
          severity: 'High',
          targetPage: 'warehouse_docks',
          targetLabel: 'Dock Schedule',
          timestamp: '2026-03-24T11:15:00Z',
          read: readIds.includes('WH-NOTIF-02')
        },
        {
          id: 'WH-NOTIF-03',
          title: 'Carrier Handover Check-in: Driver Norman Reedus',
          message: 'Vehicle BG-12 checked into security gate for pallet loading on shipment BRG-2847.',
          severity: 'Info',
          targetPage: 'warehouse_handover',
          targetLabel: 'Handover Bay',
          timestamp: '2026-03-24T10:45:00Z',
          read: readIds.includes('WH-NOTIF-03')
        }
      ];
    }

    // Default for Control Tower Analyst, Administrator, and Dispatcher
    return [
      {
        id: 'OP-NOTIF-101',
        title: 'Critical Temperature Excursion: BRG-2843',
        message: 'Reefer RT-04 sensor reporting -14.2°C (exceeds -20°C bio-limit). Immediate thermal containment required.',
        severity: 'Critical',
        targetPage: isAnalyst ? 'analyst_queue' : 'exceptions',
        targetLabel: isAnalyst ? 'View Exception' : 'View Exception',
        timestamp: '2026-03-24T11:42:00Z',
        read: readIds.includes('OP-NOTIF-101')
      },
      {
        id: 'OP-NOTIF-102',
        title: 'High Severity Route Delay: BRG-2846',
        message: 'Port terminal congestion at LAX Deepwater Berth 4 has delayed cargo handover by 3h 45m.',
        severity: 'High',
        targetPage: isAnalyst ? 'analyst_queue' : isDispatcher ? 'dispatcher_queue' : 'exceptions',
        targetLabel: 'Queue Review',
        timestamp: '2026-03-24T11:30:00Z',
        read: readIds.includes('OP-NOTIF-102')
      },
      {
        id: 'OP-NOTIF-103',
        title: 'Interstate Corridor Collision: BRG-2847',
        message: 'I-40 Eastbound accident blocking transit corridor. Dispatcher recovery routing initiated.',
        severity: 'High',
        targetPage: isAnalyst ? 'analyst_queue' : isDispatcher ? 'dispatcher_planning' : 'exceptions',
        targetLabel: isAnalyst ? 'Queue Review' : 'Re-plan Route',
        timestamp: '2026-03-24T11:15:00Z',
        read: readIds.includes('OP-NOTIF-103')
      },
      {
        id: 'OP-NOTIF-104',
        title: 'New Expedite Recovery Request: REC-2005',
        message: 'Expedite request submitted for BRG-2848 to recover from West Knot depot delay.',
        severity: 'Warning',
        targetPage: isAnalyst ? 'analyst_recoveries' : isDispatcher ? 'dispatcher_recoveries' : 'exceptions',
        targetLabel: 'View Request',
        timestamp: '2026-03-24T11:00:00Z',
        read: readIds.includes('OP-NOTIF-104')
      },
      {
        id: 'OP-NOTIF-105',
        title: 'Proposed Detour Re-route: REC-2006',
        message: 'Detour proposed via Southern Foothill Parkway for BRG-2842 to bypass Alpine flooding.',
        severity: 'Warning',
        targetPage: isAnalyst ? 'analyst_recoveries' : isDispatcher ? 'dispatcher_planning' : 'exceptions',
        targetLabel: 'Review Detour',
        timestamp: '2026-03-24T10:35:00Z',
        read: readIds.includes('OP-NOTIF-105')
      },
      {
        id: 'OP-NOTIF-106',
        title: 'Freight Decoupling / Split Request: REC-2007',
        message: 'Weight restriction on Mountain Crossing requires decoupling BRG-2845 into secondary carrier units.',
        severity: 'Info',
        targetPage: isAnalyst ? 'analyst_recoveries' : isDispatcher ? 'dispatcher_planning' : 'exceptions',
        targetLabel: 'Split Allocation',
        timestamp: '2026-03-24T10:15:00Z',
        read: readIds.includes('OP-NOTIF-106')
      }
    ];
  },

  getOperationalUnreadCount() {
    const notifs = this.getOperationalNotifications();
    return notifs.filter(n => !n.read).length;
  },

  markOperationalNotificationRead(id) {
    let readIds = [];
    try {
      readIds = JSON.parse(localStorage.getItem('BRIDGES_READ_OPERATIONAL_NOTIFS') || '[]');
    } catch (e) {
      readIds = [];
    }
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('BRIDGES_READ_OPERATIONAL_NOTIFS', JSON.stringify(readIds));
    }
    this.updateUnreadBadge();
    this.showNotifications();
  },

  markAllOperationalNotificationsRead() {
    const notifs = this.getOperationalNotifications();
    const allIds = notifs.map(n => n.id);
    localStorage.setItem('BRIDGES_READ_OPERATIONAL_NOTIFS', JSON.stringify(allIds));
    this.updateUnreadBadge();
    this.showNotifications();
    if (window.UI && window.UI.showToast) {
      window.UI.showToast('All notifications marked as read.', 'info');
    }
  },

  updateUnreadBadge() {
    const badge = document.getElementById('carrier-unread-badge');
    if (!badge) return;
    const count = this.getOperationalUnreadCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  },

  showNotifications() {
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const isCustomer = user && user.role === 'Customer';
    const isCarrier = user && user.role === 'Carrier Operations User';

    if (isCustomer) {
      this.navigateTo('customer_notifications');
      return;
    }
    if (isCarrier) {
      this.showCarrierNotifications();
      return;
    }

    const notifs = this.getOperationalNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;
    const roleTitle = user ? (user.role === 'Control Tower Analyst' ? 'Control Tower Operational Alerts' : user.role === 'Customer Service' ? 'Customer Service Alerts' : user.role === 'Warehouse Supervisor' ? 'Warehouse Dispatch & Dock Alerts' : user.role === 'Dispatcher / Transport Planner' ? 'Transport Dispatcher Alerts' : 'Platform Operational Alerts') : 'Operational Alerts';

    const modalContent = `
      <div style="padding: 2px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${unreadCount > 0 ? 'badge-danger' : 'badge-success'}" style="font-size: 11px; padding: 3px 8px; font-weight: 700;">
              ${unreadCount} Unread
            </span>
            <span style="font-size: 12px; color: #64748B;">
              ${user ? user.role : 'Operational Session'} &bull; Real-time Alert Stream
            </span>
          </div>
          ${unreadCount > 0 ? `
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.markAllOperationalNotificationsRead();" style="font-size: 11px; padding: 4px 10px; font-weight: 600;">
              ✓ Mark all as read
            </button>
          ` : `
            <button type="button" class="btn btn-secondary btn-sm" onclick="localStorage.removeItem('BRIDGES_READ_OPERATIONAL_NOTIFS'); App.updateUnreadBadge(); App.showNotifications();" style="font-size: 11px; padding: 4px 10px;">
              ↺ Reset Demo Alerts
            </button>
          `}
        </div>

        <div style="max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 9px; padding-right: 4px;">
          ${notifs.length === 0 ? `
            <div style="text-align: center; padding: 36px 16px; color: #94A3B8; font-size: 13px;">
              No operational alerts currently pending review.
            </div>
          ` : notifs.map(n => {
            const sevBg = n.severity === 'Critical' ? '#FEF2F2' : n.severity === 'High' ? '#FFFBEB' : n.severity === 'Warning' ? '#FFF7ED' : '#F0F9FF';
            const sevBorder = n.severity === 'Critical' ? '#FCA5A5' : n.severity === 'High' ? '#FCD34D' : n.severity === 'Warning' ? '#FDBA74' : '#BAE6FD';
            const sevColor = n.severity === 'Critical' ? '#DC2626' : n.severity === 'High' ? '#D97706' : n.severity === 'Warning' ? '#EA580C' : '#0284C7';
            const sevDot = n.severity === 'Critical' ? '#EF4444' : n.severity === 'High' ? '#F59E0B' : n.severity === 'Warning' ? '#F97316' : '#0EA5E9';

            return `
              <div style="padding: 12px 14px; border-radius: 8px; border: 1px solid ${n.read ? '#E2E8F0' : sevBorder}; background: ${n.read ? '#FAFAFA' : sevBg}; position: relative; transition: all 0.15s ease;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 5px;">
                  <div style="display: flex; align-items: center; gap: 7px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${n.read ? '#CBD5E1' : sevDot}; flex-shrink: 0;"></span>
                    <strong style="font-size: 12.5px; color: ${n.read ? '#475569' : '#0F172A'}; font-weight: 700;">${n.title}</strong>
                  </div>
                  <span style="font-size: 11px; color: #94A3B8; white-space: nowrap; font-variant-numeric: tabular-nums;">
                    ${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style="font-size: 12px; color: ${n.read ? '#64748B' : '#334155'}; margin: 0 0 8px 15px; line-height: 1.45;">
                  ${n.message}
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-left: 15px; padding-top: 4px; border-top: 1px dashed ${n.read ? '#F1F5F9' : 'rgba(0,0,0,0.06)'};">
                  <span style="font-size: 10px; font-weight: 700; color: ${sevColor}; background: ${n.read ? '#F1F5F9' : 'rgba(255,255,255,0.7)'}; border: 1px solid ${sevBorder}; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.4px;">
                    ${n.severity}
                  </span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${!n.read ? `
                      <button type="button" class="btn btn-link btn-sm" onclick="App.markOperationalNotificationRead('${n.id}');" style="font-size: 11px; padding: 0; color: #64748B; text-decoration: underline; cursor: pointer;">
                        Mark read
                      </button>
                    ` : ''}
                    ${n.targetPage ? `
                      <button type="button" class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigateTo('${n.targetPage}');" style="font-size: 11px; padding: 3px 10px; font-weight: 700; background: #18217E; border-color: #18217E;">
                        ${n.targetLabel || 'View'} &rarr;
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 12px; font-size: 11px; color: #94A3B8; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 10px;">
          <span>⚡ Live Telemetry Event Stream</span>
          <span style="color: #10B981; font-weight: 600;">● Real-time sync</span>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', roleTitle, modalContent);
  },

  getViewTitle(view) {
    const titles = {
      // Admin views
      dashboard: 'Dashboard',
      users: 'User & Access Management',
      carriers: 'Carrier Governance & Management',
      resources: 'Resource Overview',
      analytics: 'Performance & Operational Analytics',
      exceptions: 'Exception History',
      sla_rules: 'SLA Rules & Deadline Configuration',
      notifications_config: 'Notification Templates & Automation',
      ai_config: 'AI Recommendation Engine & Approval Rules',
      audit: 'System Audit Log',
      settings: 'Platform Settings',

      // Analyst views (Phase 2)
      analyst_dashboard: 'Control Tower Dashboard',
      analyst_shipments: 'Active Shipments',
      analyst_onboarding: 'Shipment & Order Onboarding',
      analyst_inbound: 'Inbound Message Monitoring & Integration Errors',
      analyst_data_quality: 'Data Quality Management & Governance',
      analyst_queue: 'Exception Queue',
      analyst_investigation: 'Investigation Workspace',
      analyst_war_room: 'Incident War Room',
      analyst_recoveries: 'Recovery Requests',
      analyst_events: 'Tracking & Telemetry Events',
      analyst_history: 'Exception History & Closure',

      // Dispatcher views (Phase 3)
      dispatcher_dashboard: 'Dispatcher Operations Dashboard',
      dispatcher_queue: 'Actionable Exception Queue',
      dispatcher_planning: 'Recovery Planning Workspace',
      dispatcher_carriers: 'Carrier Assignment Directory',
      dispatcher_recoveries: 'Recovery Requests & Responses',
      dispatcher_tracking: 'Shipment Recovery Tracking',
      dispatcher_escalations: 'Incident Escalation Console',
      dispatcher_approvals: 'Exception Approvals & Decision Overrides',
      dispatcher_completed: 'Completed Recoveries Archive',

      // Carrier views (Phase 4, US-58 to US-78)
      carrier_dashboard: 'Carrier Operations Dashboard',
      carrier_requests: 'Recovery Assignment Requests',
      carrier_shipments: 'Carrier Assigned Shipments',
      carrier_vehicles: 'Vehicle Fleet Management',
      carrier_drivers: 'Driver Roster & Availability',
      carrier_execution: 'Shipment Execution Workspace',
      carrier_disruptions: 'Disruption & Exception Reporting',
      carrier_delivery: 'Proof of Delivery Confirmation',
      carrier_history: 'Carrier Activity History',

      // Warehouse Supervisor views (Phase 5)
      warehouse_dashboard: 'Warehouse Operations Dashboard',
      warehouse_shipments: 'Inbound & Outbound Shipments',
      warehouse_readiness: 'Warehouse Readiness Workspace',
      warehouse_docks: 'Dock Schedule & Gate Management',
      warehouse_picking: 'Picking & Packing Execution',
      warehouse_loading: 'Loading & Dispatch Workspace',
      warehouse_handover: 'Carrier Handover Verification',
      warehouse_diverted: 'Diverted Shipments & Receiving',
      warehouse_exceptions: 'Warehouse Blockers & Exceptions',
      warehouse_history: 'Warehouse Activity History',

      // Customer Service views (Phase 6)
      cs_dashboard: 'Customer Service Dashboard',
      cs_shipments: 'Shipment & Order Search',
      cs_shipment_detail: 'Shipment Customer View',
      cs_queue: 'Customer Communication Queue',
      cs_compose: 'Communication Workspace',
      cs_history: 'Communication History',
      cs_escalations: 'Operational Escalations',
      cs_ai_assistant: 'AI-Assisted Customer Support',

      // Customer Portal views (Phase 7)
      customer_home: 'Customer Shipment Portal',
      customer_track: 'Track Shipment',
      customer_shipment_detail: 'Shipment Tracking Details',
      customer_notifications: 'Notifications & Updates',
      customer_contact: 'Contact Customer Service',
      customer_queries: 'My Support Queries',
      customer_history: 'Delivery History',
      customer_ai_assistant: 'AI Self-Service Assistant'
    };
    return titles[view] || 'BRIDGES Control Tower';
  },

  updateTopbarTitle() {
    const titleEl = document.getElementById('topbar-page-title');
    if (titleEl) titleEl.textContent = '';
  },

  onSearchFocus() {
    const dropdown = document.getElementById('search-suggestions-dropdown');
    if (dropdown) dropdown.style.display = 'block';
  },

  onSearchBlur() {
    setTimeout(() => {
      const dropdown = document.getElementById('search-suggestions-dropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 180);
  },

  onSearchInput(val) {
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.style.display = (val && val.trim().length > 0) ? 'flex' : 'none';
    }
  },

  clearSearch(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const inp = document.getElementById('global-search-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
  },

  quickSearchAction(target) {
    const dropdown = document.getElementById('search-suggestions-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const isCustomer = user && user.role === 'Customer';
    const isCS = user && user.role === 'Customer Service';
    const isWarehouse = user && user.role === 'Warehouse Supervisor';
    const isCarrier = user && user.role === 'Carrier Operations User';
    const isAnalyst = user && user.role === 'Control Tower Analyst';

    if (target === 'shipments') {
      if (isCustomer) this.navigateTo('customer_track');
      else if (isCS) this.navigateTo('cs_shipments');
      else if (isWarehouse) this.navigateTo('warehouse_shipments');
      else if (isCarrier) this.navigateTo('carrier_shipments');
      else if (isAnalyst) this.navigateTo('analyst_shipments');
      else this.navigateTo('dashboard');
    } else if (target === 'carriers') {
      if (isCarrier) this.navigateTo('carrier_vehicles');
      else this.navigateTo('carriers');
    } else if (target === 'exceptions') {
      if (isCarrier) this.navigateTo('carrier_disruptions');
      else if (isWarehouse) this.navigateTo('warehouse_exceptions');
      else if (isCS) this.navigateTo('cs_inquiries');
      else this.navigateTo('exceptions');
    } else if (target === 'users') {
      this.navigateTo('users');
    } else if (target === 'analytics') {
      this.navigateTo('analytics');
    }
  },

  handleGlobalSearch(e) {
    if (e.key === 'Enter') {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;

      const user = window.BRIDGES_AUTH.getCurrentUser();
      const isCustomer = user && user.role === 'Customer';
      const isCS = user && user.role === 'Customer Service';
      const isWarehouse = user && user.role === 'Warehouse Supervisor';
      const isCarrier = user && user.role === 'Carrier Operations User';
      const isDispatcher = user && user.role === 'Dispatcher / Transport Planner';
      const isAnalyst = user && user.role === 'Control Tower Analyst';

      if (isCustomer) {
        this.navigateTo('customer_track');
        setTimeout(() => {
          const inp = document.getElementById('custTrackSearchInput');
          if (inp) {
            inp.value = q;
            if (window.CustTrackView && CustTrackView.doSearch) {
              CustTrackView.doSearch(inp.value);
            }
          }
        }, 50);
      } else if (isCS) {
        this.navigateTo('cs_shipments');
        setTimeout(() => { if (window.CSShipmentsView && CSShipmentsView.handleSearch) CSShipmentsView.handleSearch(q); }, 50);
      } else if (isWarehouse) {
        this.navigateTo('warehouse_shipments');
        setTimeout(() => { if (window.WarehouseShipmentsView && WarehouseShipmentsView.handleSearch) WarehouseShipmentsView.handleSearch(q); }, 50);
      } else if (isCarrier) {
        this.navigateTo('carrier_requests');
        setTimeout(() => { if (window.CarrierRequestsView && CarrierRequestsView.handleSearch) CarrierRequestsView.handleSearch(q); }, 50);
      } else if (isDispatcher) {
        this.navigateTo('dispatcher_queue');
        setTimeout(() => { if (window.DispatcherQueueView) DispatcherQueueView.handleSearch(q); }, 50);
      } else if (isAnalyst) {
        this.navigateTo('analyst_queue');
      } else {
        const carrierMatch = window.BRIDGES_STORE.getCarriers().find(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
        if (carrierMatch) {
          this.navigateTo('carriers');
          setTimeout(() => { if (window.CarriersView) CarriersView.handleSearch(q); }, 50);
          return;
        }
        this.navigateTo('dashboard');
      }
    }
  },

  renderCurrentView() {
    const contentEl = document.getElementById('app-main-content');
    if (!contentEl) return;

    try {
      let html = '';
      switch (this.currentView) {
        // Administrator Views (Phase 1)
        case 'dashboard':
          html = window.DashboardView ? window.DashboardView.render() : '';
          break;
        case 'users':
          html = window.UsersView ? window.UsersView.render() : '';
          break;
        case 'carriers':
          html = window.CarriersView ? window.CarriersView.render() : '';
          break;
        case 'resources':
          html = window.ResourcesView ? window.ResourcesView.render() : '';
          break;
        case 'analytics':
          html = window.AnalyticsView ? window.AnalyticsView.render() : '';
          break;
        case 'exceptions':
          html = window.ExceptionHistoryView ? window.ExceptionHistoryView.render() : '';
          break;
        case 'audit':
          html = window.AuditLogView ? window.AuditLogView.render() : '';
          break;
        case 'sla_rules':
          if (window.SettingsView) window.SettingsView.currentTab = 'sla_rules';
          html = window.SettingsView ? window.SettingsView.render() : '';
          break;
        case 'notifications_config':
        case 'ai_config':
        case 'settings':
          this.navigateTo('sla_rules');
          return;

        // Control Tower Analyst Views (Phase 2, US-17 to US-43)
        case 'analyst_dashboard':
          html = window.AnalystDashboardView ? window.AnalystDashboardView.render() : '';
          break;
        case 'analyst_shipments':
          html = window.AnalystShipmentsView ? window.AnalystShipmentsView.render() : '';
          break;
        case 'analyst_onboarding':
          html = window.AnalystOnboardingView ? window.AnalystOnboardingView.render() : '';
          break;
        case 'analyst_inbound':
          this.navigateTo('analyst_dashboard');
          return;
        case 'analyst_data_quality':
          html = window.AnalystDataQualityView ? window.AnalystDataQualityView.render() : '';
          break;
        case 'analyst_queue':
          html = window.AnalystQueueView ? window.AnalystQueueView.render() : '';
          break;
        case 'analyst_investigation':
          this.navigateTo('analyst_queue');
          return;
        case 'analyst_war_room':
          this.navigateTo('analyst_queue');
          return;
        case 'analyst_recoveries':
          html = window.AnalystRecoveriesView ? window.AnalystRecoveriesView.render() : '';
          break;
        case 'analyst_events':
          html = window.AnalystEventsView ? window.AnalystEventsView.render() : '';
          break;
        case 'analyst_history':
          html = window.AnalystHistoryView ? window.AnalystHistoryView.render() : '';
          break;

        // Dispatcher / Transport Planner Views (Phase 3, US-44 to US-57)
        case 'dispatcher_dashboard':
          html = window.DispatcherDashboardView ? window.DispatcherDashboardView.render() : '';
          break;
        case 'dispatcher_queue':
          html = window.DispatcherQueueView ? window.DispatcherQueueView.render() : '';
          break;
        case 'dispatcher_planning':
          html = window.DispatcherPlanningView ? window.DispatcherPlanningView.render() : '';
          break;
        case 'dispatcher_carriers':
          html = window.DispatcherCarriersView ? window.DispatcherCarriersView.render() : '';
          break;
        case 'dispatcher_recoveries':
          html = window.DispatcherRecoveriesView ? window.DispatcherRecoveriesView.render() : '';
          break;
        case 'dispatcher_tracking':
          html = window.DispatcherTrackingView ? window.DispatcherTrackingView.render() : '';
          break;
        case 'dispatcher_escalations':
          html = window.DispatcherEscalationsView ? window.DispatcherEscalationsView.render() : '';
          break;
        case 'dispatcher_approvals':
          html = window.DispatcherApprovalsView ? window.DispatcherApprovalsView.render() : '';
          break;
        case 'dispatcher_completed':
          html = window.DispatcherCompletedView ? window.DispatcherCompletedView.render() : '';
          break;

        // Carrier Operations User Views (Phase 4, US-58 to US-78)
        case 'carrier_dashboard':
          html = window.CarrierDashboardView ? window.CarrierDashboardView.render() : '';
          break;
        case 'carrier_requests':
          html = window.CarrierRequestsView ? window.CarrierRequestsView.render() : '';
          break;
        case 'carrier_shipments':
          html = window.CarrierShipmentsView ? window.CarrierShipmentsView.render() : '';
          break;
        case 'carrier_vehicles':
          html = window.CarrierVehiclesView ? window.CarrierVehiclesView.render() : '';
          break;
        case 'carrier_drivers':
          html = window.CarrierDriversView ? window.CarrierDriversView.render() : '';
          break;
        case 'carrier_execution':
          html = window.CarrierExecutionView ? window.CarrierExecutionView.render() : '';
          break;
        case 'carrier_disruptions':
          html = window.CarrierDisruptionsView ? window.CarrierDisruptionsView.render() : '';
          break;
        case 'carrier_delivery':
          html = window.CarrierDeliveryView ? window.CarrierDeliveryView.render() : '';
          break;
        case 'carrier_history':
          html = window.CarrierHistoryView ? window.CarrierHistoryView.render() : '';
          break;

        // Warehouse Supervisor Views (Phase 5)
        case 'warehouse_dashboard':
          html = window.WarehouseDashboardView ? window.WarehouseDashboardView.render() : '';
          break;
        case 'warehouse_shipments':
          html = window.WarehouseShipmentsView ? window.WarehouseShipmentsView.render() : '';
          break;
        case 'warehouse_readiness':
          html = window.WarehouseReadinessView ? window.WarehouseReadinessView.render() : '';
          break;
        case 'warehouse_docks':
          html = window.WarehouseDocksView ? window.WarehouseDocksView.render() : '';
          break;
        case 'warehouse_picking':
          html = window.WarehousePickingView ? window.WarehousePickingView.render() : '';
          break;
        case 'warehouse_loading':
          html = window.WarehouseLoadingView ? window.WarehouseLoadingView.render() : '';
          break;
        case 'warehouse_handover':
          html = window.WarehouseHandoverView ? window.WarehouseHandoverView.render() : '';
          break;
        case 'warehouse_diverted':
          html = window.WarehouseDivertedView ? window.WarehouseDivertedView.render() : '';
          break;
        case 'warehouse_exceptions':
          html = window.WarehouseExceptionsView ? window.WarehouseExceptionsView.render() : '';
          break;
        case 'warehouse_history':
          html = window.WarehouseHistoryView ? window.WarehouseHistoryView.render() : '';
          break;

        // Customer Service Views (Phase 6)
        case 'cs_dashboard':
          html = window.CSDashboardView ? window.CSDashboardView.render() : '';
          break;
        case 'cs_shipments':
          html = window.CSShipmentsView ? window.CSShipmentsView.render() : '';
          break;
        case 'cs_shipment_detail':
          html = window.CSShipmentDetailView ? window.CSShipmentDetailView.render() : '';
          break;
        case 'cs_queue':
          html = window.CSQueueView ? window.CSQueueView.render() : '';
          break;
        case 'cs_compose':
          html = window.CSComposeView ? window.CSComposeView.render() : '';
          break;
        case 'cs_history':
          html = window.CSHistoryView ? window.CSHistoryView.render() : '';
          break;
        case 'cs_escalations':
          html = window.CSEscalationsView ? window.CSEscalationsView.render() : '';
          break;
        case 'cs_ai_assistant':
          html = window.CSAIAssistantView ? window.CSAIAssistantView.render() : '';
          break;

        // Customer Portal Views (Phase 7)
        case 'customer_home':
          html = window.CustHomeView ? window.CustHomeView.render(contentEl) : '';
          break;
        case 'customer_track':
          html = window.CustTrackView ? window.CustTrackView.render(contentEl) : '';
          break;
        case 'customer_shipment_detail':
          html = window.CustShipmentDetailView ? window.CustShipmentDetailView.render(contentEl) : '';
          break;
        case 'customer_notifications':
          html = window.CustNotificationsView ? window.CustNotificationsView.render(contentEl) : '';
          break;
        case 'customer_contact':
          html = window.CustContactView ? window.CustContactView.render(contentEl) : '';
          break;
        case 'customer_queries':
          if (window.CustQueriesView) {
            window.CustQueriesView.render(contentEl);
            return;
          }
          break;
        case 'customer_history':
          if (window.CustHistoryView) {
            window.CustHistoryView.render(contentEl);
            return;
          }
          break;
        case 'customer_ai_assistant':
          html = window.CustAIAssistantView ? window.CustAIAssistantView.render(contentEl) : '';
          break;

        default:
          html = window.DashboardView ? window.DashboardView.render() : '';
      }

      contentEl.innerHTML = html;

      // Post-render lifecycle hooks
      if ((this.currentView === 'dashboard' || this.currentView === 'analyst_dashboard') && window.LiveTrackingMap) {
        requestAnimationFrame(() => {
          const smallCanvas = document.getElementById('live-tracking-small-canvas');
          if (smallCanvas) {
            window.LiveTrackingMap.attachSmallCanvas(smallCanvas);
          }
        });
      }
    } catch (err) {
      console.error('Error rendering view:', this.currentView, err);
      contentEl.innerHTML = `<div style="padding: 24px; color: #EA341F; font-weight: 600;">Error rendering view (${this.currentView}): ${err.message}</div>`;
    }
  },

  // --- THEME & ACCENT COLOR ENGINE ---
  initTheme() {
    try {
      const savedTheme = localStorage.getItem('BRIDGES_THEME') || 'light';
      const savedAccent = localStorage.getItem('BRIDGES_ACCENT');
      if (savedTheme && savedTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      if (savedAccent) {
        document.documentElement.style.setProperty('--color-royal-navy', savedAccent);
      }
    } catch (e) {
      console.warn('Theme init notice:', e);
    }
  },

  setTheme(themeName) {
    try {
      if (themeName && themeName !== 'light') {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('BRIDGES_THEME', themeName);
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('BRIDGES_THEME', 'light');
      }
      if (window.BRIDGES_STORE) {
        window.BRIDGES_STORE.updateSettings({ themeMode: themeName });
      }
    } catch (e) {
      console.error('Failed to set theme:', e);
    }
  },

  setAccentColor(colorHex) {
    try {
      if (colorHex) {
        document.documentElement.style.setProperty('--color-royal-navy', colorHex);
        localStorage.setItem('BRIDGES_ACCENT', colorHex);
        if (window.BRIDGES_STORE) {
          window.BRIDGES_STORE.updateSettings({ accentColor: colorHex });
        }
      } else {
        document.documentElement.style.removeProperty('--color-royal-navy');
        localStorage.removeItem('BRIDGES_ACCENT');
      }
    } catch (e) {
      console.error('Failed to set accent color:', e);
    }
  }
};

window.App = App;

// Bootstrap on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
