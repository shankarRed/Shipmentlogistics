/**
 * BRIDGES Control Tower - Customer Notifications and Updates View
 * Phase 7: Customer-safe notifications, schedule update notices, and care messages.
 * Includes read/unread toggles, shipment linking, and notification type filtering.
 */

window.CustNotificationsView = {
  filterType: 'All',
  filterShipment: 'All',

  render(container) {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(ctx.customerId);
    const notifs = store.getCustomerNotifications(ctx.customerId);

    // Filtering
    const filtered = notifs.filter(n => {
      if (this.filterType !== 'All' && n.type !== this.filterType) return false;
      if (this.filterShipment !== 'All' && n.shipmentId !== this.filterShipment) return false;
      return true;
    });

    const unreadCount = notifs.filter(n => !n.isRead).length;

    // Distinct types for filter dropdown
    const types = Array.from(new Set(notifs.map(n => n.type)));

    const html = `
      <div class="cust-view-container animate-fade-in">
        <!-- HEADER BANNER -->
        <div class="cust-header-banner">
          <div class="cust-banner-info">
            <div class="cust-badge-row">
              <span class="customer-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Notifications & Updates
              </span>
              <span class="customer-account-tag">
                ${ctx.customerName}
              </span>
              ${unreadCount > 0 ? `
                <span style="font-size: 11px; font-weight: 700; color: #FFFFFF; background: #EA341F; padding: 2px 8px; border-radius: 9999px;">
                  ${unreadCount} Unread
                </span>
              ` : `
                <span class="customer-isolation-indicator">All caught up</span>
              `}
            </div>
            <h1 class="cust-banner-title">Notifications & Delivery Advisories</h1>
            <p class="cust-banner-subtitle">
              Verified schedule notifications, transit disruption warnings, and customer support communications for your shipments.
            </p>
          </div>

          <div class="cust-banner-actions">
            <button class="btn btn-primary btn-sm" onclick="CustNotificationsView.openPreferencesModal()" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Manage Alert Channels & Preferences
            </button>
            ${unreadCount > 0 ? `
              <button class="btn btn-secondary btn-sm" onclick="CustNotificationsView.markAllRead()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Mark All as Read
              </button>
            ` : ''}
          </div>
        </div>

        <!-- FILTERS ROW -->
        <div class="cust-card">
          <div class="cust-card-body" style="padding: 14px 18px;">
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 200px;">
                <label style="font-size: 11px; font-weight: 700; color: #424989; display: block; margin-bottom: 4px;">Filter by Event Type:</label>
                <select class="cust-form-select" onchange="CustNotificationsView.onTypeFilter(this.value)">
                  <option value="All" ${this.filterType === 'All' ? 'selected' : ''}>All Event Types (ETA, Re-Route, Carrier, Expedite, Split, Delivery)</option>
                  ${types.map(t => `
                    <option value="${t}" ${this.filterType === t ? 'selected' : ''}>${t}</option>
                  `).join('')}
                </select>
              </div>

              <div style="flex: 1; min-width: 200px;">
                <label style="font-size: 11px; font-weight: 700; color: #424989; display: block; margin-bottom: 4px;">Filter by Shipment:</label>
                <select class="cust-form-select" onchange="CustNotificationsView.onShipmentFilter(this.value)">
                  <option value="All" ${this.filterShipment === 'All' ? 'selected' : ''}>All Shipments</option>
                  ${customerShipments.map(s => `
                    <option value="${s.id}" ${this.filterShipment === s.id ? 'selected' : ''}>
                      ${s.id} — Order ${s.orderId || s.orderReference || 'ORD-7721'} (${s.status})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTIFICATIONS LIST -->
        <div class="cust-card">
          <div class="cust-card-header">
            <h3 class="cust-card-title">Notification & Advisory History (${filtered.length})</h3>
            <span style="font-size: 12px; color: #8A9995;">Dispatched via configured customer channels &bull; Click to inspect tracking</span>
          </div>
          <div class="cust-card-body">
            ${filtered.length === 0 ? `
              <div class="cust-empty-state">
                <svg class="cust-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <h4 style="font-weight: 700; color: #070724; margin: 4px 0;">No Notifications Found</h4>
                <p class="text-muted" style="font-size: 12.5px;">No notifications match your current filter settings.</p>
              </div>
            ` : `
              <div class="cust-notif-list">
                ${filtered.map(n => `
                  <div class="cust-notif-item ${!n.isRead ? 'cust-notif-unread' : ''}" onclick="CustNotificationsView.viewShipment('${n.shipmentId}', '${n.id}')">
                    <div class="cust-notif-icon">
                      ${n.type.includes('ETA') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                      ` : n.type.includes('Re-Route') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18217E" stroke-width="2.2">
                          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                        </svg>
                      ` : n.type.includes('Carrier') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#424989" stroke-width="2.2">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      ` : n.type.includes('Expedite') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2.2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                      ` : n.type.includes('Split') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C2527" stroke-width="2.2">
                          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                        </svg>
                      ` : n.type.includes('Delivered') ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18217E" stroke-width="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        </svg>
                      `}
                    </div>
                    <div class="cust-notif-content">
                      <div class="cust-notif-top">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span class="cust-notif-type">${n.type}</span>
                          ${n.channel ? `
                            <span style="font-size: 10px; background: #EEF2F6; color: #18217E; padding: 2px 6px; border-radius: 4px; font-weight: 600; border: 1px solid rgba(24,33,126,0.15);">
                              ${n.channel}
                            </span>
                          ` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span class="cust-notif-time">${n.timestamp ? n.timestamp.slice(0, 16).replace('T', ' ') : 'Recent'}</span>
                          ${!n.isRead ? `
                            <button class="btn btn-outline btn-xs" onclick="event.stopPropagation(); CustNotificationsView.markSingleRead('${n.id}')" title="Mark as read">
                              Mark Read
                            </button>
                          ` : ''}
                        </div>
                      </div>
                      <p class="cust-notif-text">${n.message}</p>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                        <span class="cust-notif-ship-ref" style="font-weight: 600; color: #18217E;">Shipment: ${n.shipmentId} &rsaquo; View Live Timeline</span>
                        <span style="font-size: 10.5px; color: #64748B;">Dispatched via customer-safe gateway</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    if (container) container.innerHTML = html;
    return html;
  },

  onTypeFilter(val) {
    this.filterType = val;
    App.renderCurrentView();
  },

  onShipmentFilter(val) {
    this.filterShipment = val;
    App.renderCurrentView();
  },

  markSingleRead(notifId) {
    const store = window.BRIDGES_STORE;
    store.markCustomerNotificationRead(notifId);
    UI.showToast('Notification marked as read.', 'info');
    App.renderCurrentView();
  },

  markAllRead() {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    store.markAllCustomerNotificationsRead(ctx.customerId);
    UI.showToast('All notifications marked as read.', 'success');
    App.renderCurrentView();
  },

  viewShipment(shipmentId, notifId) {
    const store = window.BRIDGES_STORE;
    if (notifId) store.markCustomerNotificationRead(notifId);
    if (window.CustShipmentDetailView) {
      window.CustShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_shipment_detail');
  },

  openPreferencesModal() {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const prefs = store.getCustomerNotificationPreferences(ctx.customerId);

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #18217E;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span>Customer Notification Preferences & Delivery Channels</span>
      </div>
    `;

    dialogEl.innerHTML = `
      <form id="cust-notif-prefs-form" onsubmit="event.preventDefault(); CustNotificationsView.savePreferences();">
        <div style="font-size: 13px; color: #393A50; margin-bottom: 16px;">
          Configure delivery channels and automated event alerts for <strong>${ctx.customerName}</strong>.
        </div>

        <!-- 1. NOTIFICATION CHANNELS -->
        <div class="cust-card" style="margin-bottom: 14px; padding: 14px 16px;">
          <h4 style="font-size: 12.5px; font-weight: 700; color: #18217E; margin: 0 0 10px 0; text-transform: uppercase;">
            1. Alert Delivery Channels
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; cursor: pointer;">
              <span><strong>Email Notifications</strong> (${prefs.emailAddress || 'customer@gmail.com'})</span>
              <input type="checkbox" id="pref-channel-email" ${prefs.emailEnabled ? 'checked' : ''} style="transform: scale(1.2);">
            </label>
            <label style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; cursor: pointer;">
              <span><strong>SMS Text Alerts</strong> (${prefs.smsPhone || '+1 (555) 890-1234'})</span>
              <input type="checkbox" id="pref-channel-sms" ${prefs.smsEnabled ? 'checked' : ''} style="transform: scale(1.2);">
            </label>
            <label style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; cursor: pointer;">
              <span><strong>Portal &amp; Browser Push Notifications</strong></span>
              <input type="checkbox" id="pref-channel-push" ${prefs.pushEnabled ? 'checked' : ''} style="transform: scale(1.2);">
            </label>
          </div>
        </div>

        <!-- 2. EVENT SUBSCRIPTIONS -->
        <div class="cust-card" style="margin-bottom: 14px; padding: 14px 16px;">
          <h4 style="font-size: 12.5px; font-weight: 700; color: #18217E; margin: 0 0 10px 0; text-transform: uppercase;">
            2. Event Subscriptions
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12.5px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-eta" ${prefs.notifyEtaChange !== false ? 'checked' : ''}>
              <span>ETA-Change &amp; Schedule Revisions</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-reroute" ${prefs.notifyReRoute !== false ? 'checked' : ''}>
              <span>Route Optimization &amp; Arterial Detours</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-recarrier" ${prefs.notifyReCarrier !== false ? 'checked' : ''}>
              <span>Re-Carrier &amp; Dedicated Fleet Transit</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-expedite" ${prefs.notifyExpedite !== false ? 'checked' : ''}>
              <span>Expedited Priority Dispatch Alerts</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-split" ${prefs.notifySplit !== false ? 'checked' : ''}>
              <span>Consignment Split &amp; Partial Staging</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pref-event-delivery" ${prefs.notifyDelivery !== false ? 'checked' : ''}>
              <span>Delivery Confirmation &amp; Proof of Delivery (POD)</span>
            </label>
          </div>
        </div>

        <!-- 3. FREQUENCY -->
        <div class="cust-card" style="margin-bottom: 16px; padding: 14px 16px;">
          <h4 style="font-size: 12.5px; font-weight: 700; color: #18217E; margin: 0 0 8px 0; text-transform: uppercase;">
            3. Delivery Frequency
          </h4>
          <select class="cust-form-select" id="pref-frequency">
            <option value="Immediate" ${prefs.frequency === 'Immediate' ? 'selected' : ''}>Immediate (Instant notification upon event trigger)</option>
            <option value="Hourly" ${prefs.frequency === 'Hourly' ? 'selected' : ''}>Hourly Digest</option>
          </select>
        </div>

        <div class="cs-modal-btn-row" style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Preferences</button>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal');
  },

  savePreferences() {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();

    const newPrefs = {
      emailEnabled: document.getElementById('pref-channel-email').checked,
      emailAddress: 'customer@gmail.com',
      smsEnabled: document.getElementById('pref-channel-sms').checked,
      smsPhone: '+1 (555) 890-1234',
      pushEnabled: document.getElementById('pref-channel-push').checked,
      notifyEtaChange: document.getElementById('pref-event-eta').checked,
      notifyReRoute: document.getElementById('pref-event-reroute').checked,
      notifyReCarrier: document.getElementById('pref-event-recarrier').checked,
      notifyExpedite: document.getElementById('pref-event-expedite').checked,
      notifySplit: document.getElementById('pref-event-split').checked,
      notifyDelivery: document.getElementById('pref-event-delivery').checked,
      frequency: document.getElementById('pref-frequency').value
    };

    store.saveCustomerNotificationPreferences(ctx.customerId, newPrefs);
    UI.closeModal('generic-app-modal');
    if (window.UI) UI.showToast('Notification alert channels & preferences saved successfully!', 'success');
  }
};
