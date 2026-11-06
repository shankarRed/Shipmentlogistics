/**
 * BRIDGES Control Tower - Customer Portal Home View
 * Phase 7: External-facing customer overview displaying dynamically calculated
 * customer KPIs, shipments requiring attention, recent updates, and upcoming deliveries.
 */

window.CustHomeView = {
  render(container) {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const kpis = store.getCustomerKPIs(ctx.customerId);
    const shipments = store.getCustomerShipments(ctx.customerId);
    const notifs = store.getCustomerNotifications(ctx.customerId);

    // 1. Shipments Requiring Attention (delayed or has exception, not delivered)
    const attentionShipments = shipments.filter(s => 
      s.status !== 'Delivered' && (s.status === 'Delayed' || s.status === 'At Risk' || s.hasException)
    );

    // 2. Recent Updates on Active Shipments
    const activeShipments = shipments.filter(s => s.status !== 'Delivered');

    // 3. Upcoming Deliveries (In transit or approved ETA today/tomorrow)
    const upcomingShipments = shipments.filter(s => 
      s.status !== 'Delivered' && s.approvedETA
    ).sort((a, b) => new Date(a.approvedETA) - new Date(b.approvedETA));

    // 4. Recent Notifications
    const recentNotifs = notifs.slice(0, 4);

    const html = `
      <div class="cust-view-container animate-fade-in">
        <!-- TOP ACCOUNT & ISOLATION STRIP -->
        <div class="cust-account-strip">
          <div class="cust-account-strip-left">
            <span class="customer-isolation-indicator">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Customer Data Isolation Active
            </span>
            <span>Account Context: <strong>${ctx.customerName}</strong></span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 11.5px; color: #424989; font-weight: 600;">Switch Demo Customer:</label>
            <select class="cust-account-select" onchange="CustHomeView.onSwitchCustomer(this.value)">
              <option value="CUST-BIO-01" ${ctx.customerId === 'CUST-BIO-01' ? 'selected' : ''}>BioPharma Health Alliance (4 Shipments)</option>
              <option value="CUST-APEX-02" ${ctx.customerId === 'CUST-APEX-02' ? 'selected' : ''}>Apex Dynamics Corp (3 Shipments)</option>
              <option value="CUST-GME-03" ${ctx.customerId === 'CUST-GME-03' ? 'selected' : ''}>Global Maritime Energy (5 Shipments)</option>
            </select>
          </div>
        </div>

        <!-- HEADER BANNER -->
        <div class="cust-header-banner">
          <div class="cust-banner-info">
            <div class="cust-badge-row">
              <span class="customer-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Customer Visibility Portal
              </span>
              <span class="customer-account-tag">
                ${ctx.customerName}
              </span>
            </div>
            <h1 class="cust-banner-title">Welcome to BRIDGES Shipment Tracking</h1>
            <p class="cust-banner-subtitle">
              Real-time delivery progress, approved arrival estimates, and proactive transit updates for your authorized shipments.
            </p>
          </div>
          <div class="cust-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('customer_ai_assistant')" style="font-weight: 700; color: #18217E; background: rgba(24, 33, 126, 0.08); border-color: rgba(24, 33, 126, 0.25);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('customer_contact')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Contact Customer Service
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('customer_track')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Track a Shipment
            </button>
          </div>
        </div>

        <!-- 4 DYNAMIC KPI CARDS -->
        <div class="cust-kpi-grid">
          <!-- 1. Active Shipments -->
          <div class="cust-kpi-card" onclick="App.navigateTo('customer_track')">
            <div class="cust-kpi-header">
              <span class="cust-kpi-label">Active Shipments</span>
              <span class="cust-kpi-icon" style="color: #18217E; background: rgba(24, 33, 126, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                  <path d="M15 18H9"/>
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                  <circle cx="17" cy="18" r="2"/>
                  <circle cx="7" cy="18" r="2"/>
                </svg>
              </span>
            </div>
            <div class="cust-kpi-value" style="color: #18217E;">${kpis.activeShipments}</div>
            <div class="cust-kpi-footer">Under active logistics coordination</div>
          </div>

          <!-- 2. In Transit -->
          <div class="cust-kpi-card" onclick="App.navigateTo('customer_track')">
            <div class="cust-kpi-header">
              <span class="cust-kpi-label">In Transit</span>
              <span class="cust-kpi-icon" style="color: #424989; background: rgba(66, 73, 137, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                </svg>
              </span>
            </div>
            <div class="cust-kpi-value" style="color: #424989;">${kpis.inTransit}</div>
            <div class="cust-kpi-footer">Currently moving along scheduled routes</div>
          </div>

          <!-- 3. Delivery Delayed -->
          <div class="cust-kpi-card ${kpis.deliveryDelayed > 0 ? 'cust-kpi-alert' : ''}" onclick="App.navigateTo('customer_track')">
            <div class="cust-kpi-header">
              <span class="cust-kpi-label">Delivery Delayed</span>
              <span class="cust-kpi-icon" style="color: #EA341F; background: rgba(234, 52, 31, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
            </div>
            <div class="cust-kpi-value" style="color: #EA341F;">${kpis.deliveryDelayed}</div>
            <div class="cust-kpi-footer">${kpis.deliveryDelayed > 0 ? 'Schedule adjustments under resolution' : 'No delayed shipments'}</div>
          </div>

          <!-- 4. Delivered -->
          <div class="cust-kpi-card" onclick="App.navigateTo('customer_history')">
            <div class="cust-kpi-header">
              <span class="cust-kpi-label">Delivered</span>
              <span class="cust-kpi-icon" style="color: #10B981; background: rgba(16, 185, 129, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </span>
            </div>
            <div class="cust-kpi-value" style="color: #10B981;">${kpis.delivered}</div>
            <div class="cust-kpi-footer">Completed orders in delivery history</div>
          </div>
        </div>

        <!-- 2x2 SECTIONS GRID -->
        <div class="cust-dashboard-grid">
          <!-- 1. SHIPMENTS REQUIRING ATTENTION -->
          <div class="cust-card">
            <div class="cust-card-header">
              <div class="cust-card-title-group">
                <span style="color: #EA341F;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cust-card-title">Shipments Requiring Attention</h3>
                  <p class="cust-card-subtitle">Active shipments with transit delay advisories or schedule revisions</p>
                </div>
              </div>
              <span class="badge ${attentionShipments.length > 0 ? 'badge-danger' : 'badge-neutral'}">
                ${attentionShipments.length}
              </span>
            </div>
            <div class="cust-card-body">
              ${attentionShipments.length === 0 ? `
                <div class="cust-empty-state" style="padding: 24px 10px;">
                  <svg class="cust-empty-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p style="font-weight: 700; color: #070724; margin: 4px 0;">All Deliveries on Schedule</p>
                  <p class="text-muted" style="font-size: 12px; margin: 0;">None of your shipments are currently delayed or experiencing exceptions.</p>
                </div>
              ` : attentionShipments.map(s => `
                <div class="cust-shipment-card" onclick="CustHomeView.viewShipment('${s.id}')">
                  <div class="cust-shipment-card-top">
                    <div>
                      <span class="cust-shipment-id-badge">${s.id}</span>
                      <span class="cust-order-ref">Order: ${s.orderReference || 'N/A'}</span>
                    </div>
                    <span class="cust-status-badge status-delayed">Delayed</span>
                  </div>

                  <div class="cust-route-row">
                    <span>${s.origin.split(',')[0]}</span>
                    <span class="cust-route-arrow">&rarr;</span>
                    <span>${s.destination.split(',')[0]}</span>
                  </div>

                  ${s.customerSafeExceptionSummary ? `
                    <div style="font-size: 11.5px; color: #7C2D12; background: #FFF7ED; padding: 6px 10px; border-radius: 6px; margin-bottom: 8px;">
                      <strong>Status Notice:</strong> ${s.customerSafeExceptionSummary}
                    </div>
                  ` : ''}

                  <div class="cust-shipment-card-bottom">
                    <div>
                      <span>Approved Delivery Window:</span>
                      <strong style="color: #070724;">${s.approvedETA ? s.approvedETA.slice(11, 16) + ' UTC' : 'Pending Review'}</strong>
                      <span class="cust-eta-approved-pill">Confirmed</span>
                    </div>
                    <button class="btn btn-outline btn-xs" onclick="event.stopPropagation(); CustHomeView.viewShipment('${s.id}')">
                      View Details &rsaquo;
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 2. UPCOMING DELIVERIES -->
          <div class="cust-card">
            <div class="cust-card-header">
              <div class="cust-card-title-group">
                <span style="color: #18217E;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cust-card-title">Upcoming Deliveries</h3>
                  <p class="cust-card-subtitle">Confirmed arrival windows for shipments currently on route</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('customer_track')">
                View All (${upcomingShipments.length})
              </button>
            </div>
            <div class="cust-card-body">
              ${upcomingShipments.length === 0 ? `
                <div class="cust-empty-state" style="padding: 24px 10px;">
                  <p class="text-muted" style="font-size: 12px; margin: 0;">No active incoming deliveries scheduled at this time.</p>
                </div>
              ` : upcomingShipments.map(s => `
                <div class="cust-shipment-card" onclick="CustHomeView.viewShipment('${s.id}')">
                  <div class="cust-shipment-card-top">
                    <div>
                      <span class="cust-shipment-id-badge">${s.id}</span>
                      <span class="cust-order-ref">${s.cargoType || 'Cargo'}</span>
                    </div>
                    <span class="cust-status-badge ${s.status === 'Delayed' ? 'status-delayed' : 'status-in-transit'}">
                      ${s.status}
                    </span>
                  </div>

                  <div class="cust-route-row">
                    <span>${s.origin.split(',')[0]}</span>
                    <span class="cust-route-arrow">&rarr;</span>
                    <span>${s.destination.split(',')[0]}</span>
                  </div>

                  <div class="cust-shipment-card-bottom">
                    <div>
                      <span>Estimated Arrival:</span>
                      <strong style="color: #070724;">${s.approvedETA ? s.approvedETA.slice(11, 16) + ' UTC' : 'Pending Confirmation'}</strong>
                    </div>
                    <button class="btn btn-outline btn-xs" onclick="event.stopPropagation(); CustHomeView.viewShipment('${s.id}')">
                      Track &rsaquo;
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. RECENT SHIPMENT UPDATES -->
          <div class="cust-card">
            <div class="cust-card-header">
              <div class="cust-card-title-group">
                <span style="color: #424989;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cust-card-title">Recent Shipment Updates</h3>
                  <p class="cust-card-subtitle">Verified status statements and milestone progressions</p>
                </div>
              </div>
            </div>
            <div class="cust-card-body p-0">
              <div class="table-responsive">
                <table class="cust-table">
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Destination</th>
                      <th>Status Statement</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${activeShipments.length === 0 ? `
                      <tr><td colspan="4" class="text-center py-4 text-muted">No active shipments in transit.</td></tr>
                    ` : activeShipments.map(s => `
                      <tr>
                        <td>
                          <strong>${s.id}</strong><br>
                          <span style="font-size: 11px; color: #8A9995;">Ref: ${s.customerReference || s.orderReference}</span>
                        </td>
                        <td>${s.destination.split(',')[0]}</td>
                        <td>
                          <div style="font-size: 12px; color: #393A50; max-width: 280px;">
                            ${s.customerSafeExceptionSummary || 'Proceeding on schedule along primary corridor.'}
                          </div>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-outline btn-xs" onclick="CustHomeView.viewShipment('${s.id}')">
                            Details
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 4. RECENT NOTIFICATIONS -->
          <div class="cust-card">
            <div class="cust-card-header">
              <div class="cust-card-title-group">
                <span style="color: #070724;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </span>
                <div>
                  <h3 class="cust-card-title">Recent Notifications</h3>
                  <p class="cust-card-subtitle">Delivered alerts, schedule notices, and customer care responses</p>
                </div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="App.navigateTo('customer_notifications')">
                View All
              </button>
            </div>
            <div class="cust-card-body p-0">
              ${recentNotifs.length === 0 ? `
                <div class="p-4 text-center text-muted" style="font-size: 12px;">
                  No notifications recorded for your shipments yet.
                </div>
              ` : `
                <div class="cust-notif-list" style="padding: 12px;">
                  ${recentNotifs.map(n => `
                    <div class="cust-notif-item ${!n.isRead ? 'cust-notif-unread' : ''}" onclick="CustHomeView.viewShipment('${n.shipmentId}')">
                      <div class="cust-notif-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        </svg>
                      </div>
                      <div class="cust-notif-content">
                        <div class="cust-notif-top">
                          <span class="cust-notif-type">${n.type}</span>
                          <span class="cust-notif-time">${n.timestamp ? n.timestamp.slice(11, 16) + ' UTC' : 'Today'}</span>
                        </div>
                        <p class="cust-notif-text">${n.message}</p>
                        <span class="cust-notif-ship-ref">Shipment: ${n.shipmentId} &rsaquo;</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
    if (container) container.innerHTML = html;
    return html;
  },

  viewShipment(shipmentId) {
    if (window.CustShipmentDetailView) {
      window.CustShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_shipment_detail');
  },

  onSwitchCustomer(customerId) {
    let name = 'BioPharma Health Alliance';
    let contact = 'Sarah Jenkins';
    if (customerId === 'CUST-APEX-02') {
      name = 'Apex Dynamics Corp';
      contact = 'Marcus Chen';
    } else if (customerId === 'CUST-GME-03') {
      name = 'Global Maritime Energy';
      contact = 'David O\'Connor';
    }
    window.BRIDGES_AUTH.switchCustomerAccount(customerId, name, contact);
    UI.showToast(`Switched customer context to ${name}. Data filtered strictly for this account.`, 'info');
    App.renderCurrentView();
  }
};
