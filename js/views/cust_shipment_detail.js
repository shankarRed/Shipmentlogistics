/**
 * BRIDGES Control Tower - Customer Shipment Tracking Details View
 * Phase 7: External customer tracking view showing vertical milestone progress,
 * approved ETA, customer-safe delay advisory, and Contact Customer Service gateway.
 */

window.CustShipmentDetailView = {
  selectedShipmentId: null,

  render(container) {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(ctx.customerId);

    // Default to first shipment if none selected or not found
    if (!this.selectedShipmentId && customerShipments.length > 0) {
      this.selectedShipmentId = customerShipments[0].id;
    }

    // Strict customer-level data isolation
    const shipment = store.getCustomerShipment(this.selectedShipmentId, ctx.customerId);

    if (!shipment) {
      const emptyHtml = `
        <div class="cust-view-container animate-fade-in">
          <div class="cust-card text-center py-5">
            <svg class="cust-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            <h3 style="font-weight: 800; color: #070724; margin: 8px 0 4px 0;">Shipment Not Found in Your Account</h3>
            <p class="text-muted" style="font-size: 13px; max-width: 480px; margin: 0 auto 16px;">
              Shipment reference <strong>${this.selectedShipmentId || 'Unknown'}</strong> is not associated with customer account <strong>${ctx.customerName}</strong>.
              Access to other customers' shipment telemetry is prohibited.
            </p>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('customer_track')">
              Return to Track Shipment
            </button>
          </div>
        </div>
      `;
      if (container) container.innerHTML = emptyHtml;
      return emptyHtml;
    }

    const isDelayed = shipment.status === 'Delayed' || shipment.status === 'At Risk' || shipment.hasException;

    // Build milestone list based on actual shipment data
    const milestones = [
      {
        step: 1,
        name: "Shipment Confirmed",
        desc: `Order received and manifest registered for ${shipment.customerName}`,
        time: shipment.departureTime ? shipment.departureTime.slice(0, 10) + ' 08:30 UTC' : 'Confirmed',
        status: 'completed'
      },
      {
        step: 2,
        name: "Processing / Preparing",
        desc: `Cargo packaged & verified at ${shipment.origin.split(',')[0]} facility`,
        time: shipment.departureTime ? shipment.departureTime.slice(0, 10) + ' 10:15 UTC' : 'Completed',
        status: 'completed'
      },
      {
        step: 3,
        name: "Dispatched",
        desc: `Departed origin terminal toward destination corridor`,
        time: shipment.departureTime ? shipment.departureTime.slice(11, 16) + ' UTC' : 'Dispatched',
        status: 'completed'
      },
      {
        step: 4,
        name: "In Transit",
        desc: isDelayed ? (shipment.customerSafeExceptionSummary || 'Active transit coordination in progress') : 'Proceeding along primary corridor',
        time: shipment.lastOperationalUpdate ? shipment.lastOperationalUpdate.slice(11, 16) + ' UTC' : 'Active',
        status: shipment.status === 'Delivered' ? 'completed' : (isDelayed ? 'incident' : 'current')
      },
      {
        step: 5,
        name: "Out for Delivery",
        desc: `Final approach to consignee receiving dock at ${shipment.destination.split(',')[0]}`,
        time: shipment.status === 'Out for Delivery' ? 'In Progress' : 'Pending',
        status: shipment.status === 'Delivered' ? 'completed' : (shipment.status === 'Out for Delivery' ? 'current' : 'pending')
      },
      {
        step: 6,
        name: "Delivered",
        desc: `Signed for by consignee at ${shipment.destination}`,
        time: shipment.actualArrival ? shipment.actualArrival.slice(0, 16).replace('T', ' ') + ' UTC' : (shipment.approvedETA ? 'Estimated: ' + shipment.approvedETA.slice(11, 16) + ' UTC' : 'Pending'),
        status: shipment.status === 'Delivered' ? 'completed' : 'pending'
      }
    ];

    const html = `
      <div class="cust-view-container animate-fade-in">
        <!-- BREADCRUMB, ORDER LOOKUP & SWITCHER -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #424989; display: flex; align-items: center; gap: 6px;">
            <span class="cs-link" onclick="App.navigateTo('customer_track')" style="cursor: pointer;">Track Shipments</span>
            <span style="color: #8A9995;">&rsaquo;</span>
            <span style="color: #070724; font-weight: 700;">${shipment.id}</span>
            <span style="font-size: 11px; background: #EEF2F6; color: #18217E; padding: 2px 7px; border-radius: 4px; font-weight: 600;">Order: ${shipment.orderId || shipment.orderReference}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- QUICK ORDER NUMBER LOOKUP -->
            <div style="display: flex; align-items: center; gap: 4px;">
              <input 
                type="text" 
                id="cust-quick-order-search" 
                placeholder="Enter Order # or Shipment ID..." 
                class="cust-form-input" 
                style="width: 220px; padding: 5px 10px; font-size: 12px; height: 30px;" 
                onkeydown="if(event.key==='Enter')CustShipmentDetailView.quickLookup(this.value)"
              />
              <button class="btn btn-primary btn-xs" onclick="CustShipmentDetailView.quickLookup(document.getElementById('cust-quick-order-search').value)">
                Lookup
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 6px;">
              <label style="font-size: 11.5px; color: #424989; font-weight: 600;">Switch:</label>
              <select class="cust-account-select" onchange="CustShipmentDetailView.selectShipment(this.value)">
                ${customerShipments.map(s => `
                  <option value="${s.id}" ${s.id === shipment.id ? 'selected' : ''}>
                    ${s.id} — Order ${s.orderId || s.orderReference || 'ORD-7721'} (${s.status})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- HEADER BANNER -->
        <div class="cust-header-banner">
          <div class="cust-banner-info">
            <div class="cust-badge-row">
              <span class="customer-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Customer Verified Tracking
              </span>
              <span class="cust-status-badge ${
                shipment.status === 'Delayed' || shipment.status === 'At Risk' ? 'status-delayed' :
                shipment.status === 'Delivered' ? 'status-delivered' : 'status-in-transit'
              }">
                ${shipment.status === 'Delivered' ? 'Delivered & Accepted' : shipment.status}
              </span>
              <span class="customer-account-tag">
                PO Ref: ${shipment.customerReference || 'N/A'}
              </span>
              <span style="font-size: 11px; background: rgba(24, 33, 126, 0.08); color: #18217E; padding: 3px 8px; border-radius: 9999px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Location: ${shipment.currentLocation || shipment.origin}
              </span>
            </div>
            <h1 class="cust-banner-title">Shipment ${shipment.id}</h1>
            <p class="cust-banner-subtitle">
              Order Reference: <strong>${shipment.orderId || shipment.orderReference || 'ORD-7721'}</strong> &bull; Cargo: <strong>${shipment.cargoType || 'Standard Freight'}</strong> &bull; Consignee: <strong>${shipment.consigneeName || 'Destination Terminal'}</strong>
            </p>
          </div>

          <div class="cust-banner-actions">
            <button class="btn btn-sm" style="background: rgba(24, 33, 126, 0.08); color: #18217E; border: 1px solid rgba(24, 33, 126, 0.25); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px;" onclick="CustShipmentDetailView.askAI('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CustShipmentDetailView.contactSupport('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Contact Customer Service
            </button>
          </div>
        </div>

        <!-- DELAY ADVISORY BANNER (WHEN DELAYED) -->
        ${isDelayed ? `
          <div class="cust-delay-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style="flex: 1;">
              <h4 class="cust-delay-heading">Delivery Schedule Advisory</h4>
              <p class="cust-delay-text">
                ${shipment.customerSafeExceptionSummary || 'Your shipment has encountered an operational transit adjustment. Our logistics control team is actively monitoring progress to ensure safe and timely arrival.'}
              </p>
              <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; font-size: 11.5px;">
                <span>Latest Approved ETA: <strong>${shipment.approvedETA ? shipment.approvedETA.slice(0, 16).replace('T', ' ') + ' UTC' : 'Pending Confirmation'}</strong></span>
                <span style="color: #9A3412;">&bull;</span>
                <span>Delivery timing may adjust as route resolution completes.</span>
                <button class="btn btn-outline btn-xs" onclick="CustShipmentDetailView.contactSupport('${shipment.id}')" style="margin-left: auto;">
                  Inquire on this Delay &rsaquo;
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2-COLUMN LAYOUT -->
        <div class="cust-dashboard-grid">
          <!-- LEFT COLUMN: ROUTE & DETAILS CARD -->
          <div>
            <!-- 1. Route & Arrival Commitment -->
            <div class="cust-card">
              <div class="cust-card-header">
                <h3 class="cust-card-title">Route & Delivery Schedule</h3>
                <span class="cust-approved-eta-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Verified Schedule
                </span>
              </div>
              <div class="cust-card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: #8A9995; font-weight: 700;">Origin</span>
                    <div style="font-size: 14px; font-weight: 700; color: #070724; margin-top: 2px;">${shipment.origin}</div>
                    <span style="font-size: 11px; color: #393A50;">Departed: ${shipment.departureTime ? shipment.departureTime.slice(11, 16) + ' UTC' : 'Completed'}</span>
                  </div>
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: #8A9995; font-weight: 700;">Destination</span>
                    <div style="font-size: 14px; font-weight: 700; color: #070724; margin-top: 2px;">${shipment.destination}</div>
                    <span style="font-size: 11px; color: #393A50;">Consignee: ${shipment.consigneeName || 'Receiving Facility'}</span>
                  </div>
                </div>

                <!-- LIVE LOCATION STRIP -->
                <div style="background: #EEF2F6; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #18217E; display: flex;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <div style="font-size: 12px; color: #070724;">
                    <strong>Live Transit Location:</strong> ${shipment.currentLocation || shipment.origin} (Authorized Transit Corridor)
                  </div>
                </div>

                <!-- PLANNED VS APPROVED ETA COMPARISON -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E5EBEE; border-radius: 8px;">
                  <div>
                    <span style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Planned Baseline ETA</span>
                    <div style="font-size: 15px; font-weight: 700; color: #334155; margin-top: 2px;">
                      ${shipment.plannedETA ? shipment.plannedETA.slice(0, 16).replace('T', ' ') : '13:00 CDT'}
                    </div>
                    <span style="font-size: 10.5px; color: #8A9995;">Original delivery commitment</span>
                  </div>
                  <div>
                    <span style="font-size: 11px; color: #18217E; font-weight: 700; text-transform: uppercase;">Latest Approved ETA</span>
                    <div style="font-size: 16px; font-weight: 800; color: #18217E; margin-top: 2px;">
                      ${shipment.approvedETA ? shipment.approvedETA.slice(0, 16).replace('T', ' ') : 'Pending Confirmation'}
                    </div>
                    <span style="font-size: 10.5px; color: #10B981; font-weight: 600;">✓ Confirmed by Operations</span>
                  </div>
                </div>
                </div>
              </div>
            </div>

            <!-- 2. Cargo & Reference Details -->
            <div class="cust-card">
              <div class="cust-card-header">
                <h3 class="cust-card-title">Shipment Information</h3>
                <span class="customer-isolation-indicator">Customer Confidential</span>
              </div>
              <div class="cust-card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 12.5px;">
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Tracking Reference:</span>
                    <strong style="color: #070724;">${shipment.id}</strong>
                  </div>
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Order Reference:</span>
                    <strong style="color: #070724;">${shipment.orderId || shipment.orderReference || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Customer PO Reference:</span>
                    <strong style="color: #070724;">${shipment.customerReference || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Customer Organization:</span>
                    <strong style="color: #070724;">${shipment.customerName}</strong>
                  </div>
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Commodity Type:</span>
                    <strong style="color: #070724;">${shipment.cargoType || 'Standard Logistics Freight'}</strong>
                  </div>
                  <div>
                    <span style="color: #8A9995; font-size: 11px; display: block;">Last Operational Status:</span>
                    <strong style="color: #070724;">${shipment.lastOperationalUpdate ? shipment.lastOperationalUpdate.slice(11, 16) + ' UTC' : 'Recent'}</strong>
                  </div>
                </div>
              </div>
            </div>

            ${(shipment.status === 'Delivered' || shipment.deliveryConfirmation) ? `
              <!-- 3. Delivery Confirmation & Electronic Proof of Delivery (POD) -->
              <div class="cust-card" style="border: 1px solid #BBF7D0;">
                <div class="cust-card-header" style="background: #F0FDF4; border-bottom: 1px solid #BBF7D0;">
                  <h3 class="cust-card-title" style="color: #166534; display: flex; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Delivery Confirmation & Proof of Delivery (POD)
                  </h3>
                  <span class="badge badge-success" style="font-weight: 700;">Delivered & Verified</span>
                </div>
                <div class="cust-card-body">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 12px; margin-bottom: 14px;">
                    <div>
                      <span style="color: #64748B; font-size: 11px; display: block;">Delivered Timestamp:</span>
                      <strong style="color: #070724;">${shipment.deliveryConfirmation ? shipment.deliveryConfirmation.deliveredAt : (shipment.actualArrival || '2026-10-29 11:20 CDT')}</strong>
                    </div>
                    <div>
                      <span style="color: #64748B; font-size: 11px; display: block;">Accepted & Signed By:</span>
                      <strong style="color: #070724;">${shipment.deliveryConfirmation ? shipment.deliveryConfirmation.recipientName : 'Marcus Vance'} (${shipment.deliveryConfirmation ? shipment.deliveryConfirmation.recipientRole : 'Receiving Supervisor'})</strong>
                    </div>
                    <div>
                      <span style="color: #64748B; font-size: 11px; display: block;">Verified Tally:</span>
                      <strong style="color: #166534;">${shipment.deliveryConfirmation ? shipment.deliveryConfirmation.receivedQty : 340} Pieces Accepted in Full</strong>
                    </div>
                    <div>
                      <span style="color: #64748B; font-size: 11px; display: block;">Digital Signature:</span>
                      <strong style="color: #18217E;">✓ Digitally Signed & Stamped</strong>
                    </div>
                  </div>
                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #334155; margin-bottom: 12px;">
                    <strong>Condition at Receiving:</strong> "${shipment.deliveryConfirmation ? shipment.deliveryConfirmation.conditionNotes : 'All cartons inspected, intact, and accepted in full.'}"
                  </div>
                  <button class="btn btn-outline btn-xs" onclick="CustShipmentDetailView.openPodModal('${shipment.id}')" style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    View Electronic Proof of Delivery (POD) Receipt
                  </button>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- RIGHT COLUMN: VERTICAL SHIPMENT MILESTONE TIMELINE -->
          <div>
            <div class="cust-card">
              <div class="cust-card-header">
                <div class="cust-card-title-group">
                  <h3 class="cust-card-title">Live Tracking Milestones</h3>
                  <p class="cust-card-subtitle">Chain of custody progression derived from verified telemetry (sanitized)</p>
                </div>
              </div>
              <div class="cust-card-body">
                <div class="cust-tracking-stepper">
                  ${milestones.map((m) => `
                    <div class="cust-step-item cust-step-${m.status}">
                      <div class="cust-step-marker">
                        ${m.status === 'completed' ? `
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ` : (m.status === 'incident' ? `
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        ` : m.step)}
                      </div>
                      <div class="cust-step-content">
                        <div class="cust-step-header">
                          <span class="cust-step-name">${m.name}</span>
                          <span class="cust-step-time">${m.time}</span>
                        </div>
                        <p class="cust-step-desc">${m.desc}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (container) container.innerHTML = html;
    return html;
  },

  selectShipment(id) {
    this.selectedShipmentId = id;
    App.renderCurrentView();
  },

  quickLookup(query) {
    if (!query || !query.trim()) return;
    const q = query.trim().toLowerCase();
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(ctx.customerId);

    const match = customerShipments.find(s => 
      (s.id && s.id.toLowerCase() === q) ||
      (s.orderId && s.orderId.toLowerCase() === q) ||
      (s.orderReference && s.orderReference.toLowerCase() === q) ||
      (s.customerReference && s.customerReference.toLowerCase() === q) ||
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.orderId && s.orderId.toLowerCase().includes(q))
    );

    if (match) {
      this.selectedShipmentId = match.id;
      App.renderCurrentView();
      if (window.UI) UI.showToast(`Found shipment ${match.id} (Order ${match.orderId || match.orderReference}).`, 'success');
    } else {
      if (window.UI) UI.showToast(`No shipment found matching "${query}" in your account.`, 'error');
    }
  },

  askAI(shipmentId) {
    if (window.CustAIAssistantView) {
      window.CustAIAssistantView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_ai_assistant');
  },

  contactSupport(shipmentId) {
    if (window.CustContactView) {
      window.CustContactView.preselectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_contact');
  },

  openPodModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getCustomerShipment(shipmentId);
    if (!s) return;

    const pod = s.deliveryConfirmation || {
      deliveredAt: s.actualArrival || '2026-10-29 11:20 CDT',
      destinationAddress: s.destination,
      receivedQty: 340,
      damagedQty: 0,
      rejectedQty: 0,
      recipientName: 'Marcus Vance',
      recipientRole: 'Dock Receiving Supervisor',
      signatureStatus: 'Digitally Signed & Stamp Verified',
      conditionNotes: 'All cartons inspected, intact and accepted in full.'
    };

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #10B981;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
        <span>Official Proof of Delivery (POD) Receipt</span>
      </div>
    `;

    dialogEl.innerHTML = `
      <div style="padding: 10px 0;">
        <div style="border: 2px solid #E2E8F0; border-radius: 8px; padding: 20px; background: #FFFFFF; font-family: monospace, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18217E; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <h2 style="margin: 0; color: #18217E; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">BRIDGES LOGISTICS</h2>
              <span style="font-size: 11px; color: #64748B;">ELECTRONIC PROOF OF DELIVERY & ACCEPTANCE CERTIFICATE</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: 700; border: 1px solid #BBF7D0;">VERIFIED ACCEPTED</span>
              <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Doc ID: POD-${s.id}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; font-size: 12px;">
            <div>
              <span style="color: #64748B; display: block; font-size: 10.5px;">SHIPMENT REFERENCE:</span>
              <strong style="color: #070724; font-size: 14px;">${s.id}</strong>
              <div style="color: #424989; font-size: 11.5px; margin-top: 2px;">Order Ref: ${s.orderId || s.orderReference || 'ORD-7721'}</div>
              <div style="color: #64748B; font-size: 11.5px;">Customer PO: ${s.customerReference || 'PO-88248'}</div>
            </div>
            <div>
              <span style="color: #64748B; display: block; font-size: 10.5px;">CONSIGNEE & DESTINATION:</span>
              <strong style="color: #070724; font-size: 13px;">${s.customerName}</strong>
              <div style="color: #334155; font-size: 11.5px;">${pod.destinationAddress || s.destination}</div>
              <div style="color: #10B981; font-size: 11.5px; font-weight: 600;">Delivered: ${pod.deliveredAt}</div>
            </div>
          </div>

          <!-- RECEIVING TALLY -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; margin-bottom: 18px;">
            <div style="font-size: 11px; font-weight: 700; color: #18217E; margin-bottom: 6px; text-transform: uppercase;">Piece Count & Condition Inspection</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 8px;">
              <div style="background: #FFFFFF; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                <span style="font-size: 10px; color: #64748B; display: block;">ACCEPTED</span>
                <strong style="color: #166534; font-size: 16px;">${pod.receivedQty}</strong>
              </div>
              <div style="background: #FFFFFF; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                <span style="font-size: 10px; color: #64748B; display: block;">DAMAGED</span>
                <strong style="color: #334155; font-size: 16px;">${pod.damagedQty || 0}</strong>
              </div>
              <div style="background: #FFFFFF; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                <span style="font-size: 10px; color: #64748B; display: block;">REJECTED</span>
                <strong style="color: #334155; font-size: 16px;">${pod.rejectedQty || 0}</strong>
              </div>
              <div style="background: #FFFFFF; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                <span style="font-size: 10px; color: #64748B; display: block;">DISCREPANCY</span>
                <strong style="color: #10B981; font-size: 16px;">0</strong>
              </div>
            </div>
            <div style="font-size: 11.5px; color: #334155; margin-top: 8px;">
              <strong>Inspector Remarks:</strong> "${pod.conditionNotes || 'All cartons inspected, intact and accepted in full.'}"
            </div>
          </div>

          <!-- DIGITAL SIGNATURE STAMP -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px dashed #CBD5E1;">
            <div>
              <span style="font-size: 10.5px; color: #64748B; display: block;">AUTHORIZED ACCEPTANCE RECIPIENT:</span>
              <strong style="font-size: 13px; color: #070724;">${pod.recipientName}</strong>
              <div style="font-size: 11px; color: #424989;">${pod.recipientRole}</div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; border: 2px solid #10B981; border-radius: 6px; padding: 6px 14px; background: #F0FDF4; color: #166534; font-size: 11px; font-weight: 800; transform: rotate(-2deg);">
                ✓ DIGITALLY SIGNED & VERIFIED<br>
                <span style="font-size: 9.5px; font-weight: 500; opacity: 0.85;">${pod.deliveredAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="cs-modal-btn-row mt-3" style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button class="btn btn-primary btn-sm" onclick="window.print()">Print Receipt</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal');
  }
};
