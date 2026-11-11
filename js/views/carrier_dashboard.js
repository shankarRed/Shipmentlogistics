/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Carrier Dashboard (US-60)
 * Dynamically calculated KPI cards, Incoming Requests, Active Shipments, Operational Alerts
 */

const CarrierDashboardView = {
  getCarrierId() {
    if (window.BRIDGES_AUTH) {
      if (typeof window.BRIDGES_AUTH.getCurrentCarrierId === 'function') {
        return window.BRIDGES_AUTH.getCurrentCarrierId() || 'CAR-01';
      }
      const u = window.BRIDGES_AUTH.getCurrentUser();
      if (u && u.carrierId) return u.carrierId;
    }
    return 'CAR-01';
  },

  render() {
    const store = window.BRIDGES_STORE;
    const carrierId = this.getCarrierId();
    const carrierObj = store.getCarrier(carrierId) || {
      id: 'CAR-01',
      name: 'Bridges Global Logistics',
      contactPerson: 'Amara Chen',
      email: 'achen@bridges-global.com',
      phone: '+1 (555) 234-8901',
      operatingRegion: 'Trans-Continental North & Central Corridors',
      carrierType: 'Multi-Modal & Heavy Reefer',
      rating: 4.9,
      status: 'Active'
    };

    const metrics = store.getCarrierMetrics(carrierId);
    const reqs = store.getCarrierRecoveryRequests(carrierId);
    const shipments = store.getCarrierShipments(carrierId);
    const docs = store.getCarrierDocuments(carrierId);
    const notifs = store.getCarrierNotifications(carrierId);
    const unreadNotifs = notifs.filter(n => !n.read).length;

    // Filter active shipments (In Transit, Arrived at Destination, Delayed, Assigned)
    const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').slice(0, 6);

    return `
      <div class="carrier-dashboard-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner with Carrier Tenant Isolation & Profile Info -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
              <h2 style="font-size: 17px; font-weight: 800; color: #070724; margin: 0;">${carrierObj.name} &bull; Fleet Operations</h2>
              <span class="carrier-badge carrier-badge-accepted" style="font-size: 10.5px;">${carrierObj.id} &bull; ${carrierObj.status} Fleet</span>
              <span class="badge" style="background: #EEF2FF; color: #18217E; font-size: 10px; font-weight: 700;">★ ${carrierObj.rating || 4.9} Rating</span>
            </div>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Carrier Portal &bull; Tenant Scoped Console for regional line-haul, recovery execution, and fleet dispatch operations.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="CarrierDashboardView.openDocumentsModal()" style="font-weight: 600;">
              📄 Company Documents (${docs.length})
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CarrierDashboardView.openProfileModal()" style="font-weight: 600;">
              ⚙️ Manage Profile
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CarrierDashboardView.openNotificationsModal()" style="font-weight: 600; position: relative;">
              🔔 Notifications ${unreadNotifs > 0 ? `<span style="background: #EA341F; color: white; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 800; margin-left: 4px;">${unreadNotifs}</span>` : ''}
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('carrier_requests')" style="font-weight: 700; background: #18217E;">
              ${Icons.inbox(14)} Request Inbox (${metrics.pendingAssignmentRequests})
            </button>
          </div>
        </div>

        <!-- 6 DYNAMIC CALCULATED KPI CARDS (US-60) -->
        <div class="carrier-kpi-grid">
          <!-- KPI 1: Pending Assignment Requests -->
          <div class="carrier-kpi-card carrier-kpi-pending" onclick="App.navigateTo('carrier_requests')" title="Click to view pending requests">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Pending Requests</span>
              <div class="carrier-kpi-icon" style="background: #FFF1F0; color: #EA341F;">
                ${Icons.inbox(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.pendingAssignmentRequests}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #EA341F; font-weight: 700;">Action Required</span> &bull; Awaiting response
            </div>
          </div>

          <!-- KPI 2: Accepted Requests -->
          <div class="carrier-kpi-card carrier-kpi-accepted" onclick="App.navigateTo('carrier_execution')" title="Click to view accepted recoveries">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Accepted Requests</span>
              <div class="carrier-kpi-icon" style="background: #EEF2FF; color: #18217E;">
                ${Icons.shieldCheck(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.acceptedRequests}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #18217E; font-weight: 700;">Ready for Dispatch</span> &bull; Fleet binding
            </div>
          </div>

          <!-- KPI 3: Active Recoveries -->
          <div class="carrier-kpi-card carrier-kpi-active" onclick="App.navigateTo('carrier_shipments')" title="Click to view active movements">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Active Recoveries</span>
              <div class="carrier-kpi-icon" style="background: #F5F3FF; color: #424989;">
                ${Icons.execution(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.activeRecoveries}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #424989; font-weight: 700;">In Transit</span> &bull; Active execution
            </div>
          </div>

          <!-- KPI 4: Available Vehicles -->
          <div class="carrier-kpi-card carrier-kpi-vehicles" onclick="App.navigateTo('carrier_vehicles')" title="Click to view vehicle fleet">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Available Vehicles</span>
              <div class="carrier-kpi-icon" style="background: #ECFDF5; color: #10B981;">
                ${Icons.truck(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.availableVehicles}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #059669; font-weight: 700;">Ready for Duty</span> &bull; Reserve power
            </div>
          </div>

          <!-- KPI 5: Available Drivers -->
          <div class="carrier-kpi-card carrier-kpi-drivers" onclick="App.navigateTo('carrier_drivers')" title="Click to view driver roster">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Available Drivers</span>
              <div class="carrier-kpi-icon" style="background: #EFF6FF; color: #3B82F6;">
                ${Icons.steeringWheel(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.availableDrivers}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #2563EB; font-weight: 700;">On Standby</span> &bull; Hours compliant
            </div>
          </div>

          <!-- KPI 6: Deliveries Completed -->
          <div class="carrier-kpi-card carrier-kpi-completed" onclick="App.navigateTo('carrier_delivery')" title="Click to view delivery confirmations">
            <div class="carrier-kpi-top">
              <span class="carrier-kpi-title">Deliveries Completed</span>
              <div class="carrier-kpi-icon" style="background: #F0FDF4; color: #059669;">
                ${Icons.delivery(16)}
              </div>
            </div>
            <div class="carrier-kpi-val">${metrics.deliveriesCompleted}</div>
            <div class="carrier-kpi-sub">
              <span style="color: #059669; font-weight: 700;">POD Archived</span> &bull; Closed out
            </div>
          </div>
        </div>

        <!-- Active Shipments Table -->
        <div class="carrier-card-section">
          <div class="carrier-section-title">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${Icons.truck(15)}</span>
              <span>Active Carrier Movements</span>
              <span class="carrier-badge carrier-badge-in-progress" style="font-size: 10px;">${activeShipments.length} Active</span>
            </div>
            <button class="btn btn-link btn-sm" onclick="App.navigateTo('carrier_shipments')" style="font-size: 11.5px; color: #18217E; font-weight: 700;">
              View Fleet Map &rarr;
            </button>
          </div>

          ${activeShipments.length === 0 ? `
            <div class="carrier-empty-state" style="padding: 24px 16px;">
              <div class="carrier-empty-icon">${Icons.truck(22)}</div>
              <div class="carrier-empty-title">No Shipments In Transit</div>
              <p class="carrier-empty-desc">Currently there are no active freight movements dispatched for this carrier.</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Status</th>
                    <th>Vehicle / Driver</th>
                    <th>Latest ETA</th>
                    <th>Next Required Action</th>
                    <th style="text-align: right;">Execute</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeShipments.map(s => {
                    let statusBadgeClass = 'carrier-badge-in-progress';
                    if (s.status === 'Delayed') statusBadgeClass = 'carrier-badge-rejected';
                    if (s.status === 'Arrived at Destination') statusBadgeClass = 'carrier-badge-accepted';

                    let nextAction = 'Update Milestone';
                    let actionTarget = `CarrierExecutionView.openExecutionWorkspace('${s.id}')`;
                    if (s.status === 'Arrived at Destination') {
                      nextAction = 'Confirm Delivery';
                      actionTarget = `CarrierDeliveryView.openDeliveryModal('${s.id}')`;
                    } else if (s.status === 'Delayed' || s.slaRisk) {
                      nextAction = 'Update ETA / Disruption';
                      actionTarget = `CarrierExecutionView.openEtaModal('${s.id}')`;
                    }

                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 700; color: #18217E;">${s.id}</div>
                          <div style="font-size: 10.5px; color: #8A9995;">${s.origin} &rarr; ${s.destination}</div>
                        </td>
                        <td>
                          <span class="carrier-badge ${statusBadgeClass}">
                            ${s.status}
                          </span>
                        </td>
                        <td>
                          <div style="font-size: 11.5px; font-weight: 600; color: #070724;">
                            ${s.assignedVehicle || 'Freightliner (BG-01)'}
                          </div>
                          <div style="font-size: 10.5px; color: #424989;">
                            ${s.assignedDriver || 'Ethan Vance'}
                          </div>
                        </td>
                        <td>
                          <div style="font-size: 11px; font-weight: 700; color: #070724;">
                            ${s.carrierConfirmedEta || s.currentEta || s.eta || '14:30 EST'}
                          </div>
                          ${s.slaRisk ? '<span style="font-size: 9.5px; color: #EA341F; font-weight: 700;">SLA AT RISK</span>' : ''}
                        </td>
                        <td>
                          <span style="font-size: 11.5px; color: #393A50; font-weight: 600;">
                            ${s.status === 'Arrived at Destination' ? 'Capture Recipient Sign-off' : 'En route to next checkpoint'}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-sm" onclick="${actionTarget}" style="padding: 3px 8px; font-size: 11px; font-weight: 600;">
                            ${nextAction}
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  // --- CARRIER COMPANY DOCUMENTS MODAL ---
  openDocumentsModal() {
    const store = window.BRIDGES_STORE;
    const carrierId = this.getCarrierId();
    const carrier = store.getCarrier(carrierId) || { name: 'Bridges Global Logistics', id: 'CAR-01' };
    const docs = store.getCarrierDocuments(carrierId);

    const modalHtml = `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #C7D2FE; border-radius: 6px; padding: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 800; color: #18217E; font-size: 13px;">${carrier.name} &bull; Regulatory Compliance &amp; Credentials</div>
            <div style="font-size: 11.5px; color: #64748B;">Operating Authority: USDOT-882199 &bull; MC-448210 &bull; Tenant: ${carrier.id}</div>
          </div>
          <span class="badge badge-success">Audit Verified</span>
        </div>

        <div class="table-responsive" style="margin-bottom: 14px;">
          <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
            <thead style="background: #F8FAFB;">
              <tr>
                <th style="padding: 10px 12px;">Document Type</th>
                <th>Title &amp; Reference</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style="text-align: right; padding-right: 12px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${docs.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #8A9995;">No documents registered.</td></tr>
              ` : docs.map(d => `
                <tr>
                  <td style="padding: 10px 12px;">
                    <span class="carrier-badge" style="background: rgba(24,33,126,0.06); color: #18217E; font-size: 11px;">
                      ${d.docType}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #070724;">${d.title}</div>
                    <div style="font-size: 10px; color: #8A9995;">File: ${d.fileRef || 'doc.pdf'}</div>
                  </td>
                  <td>${d.issueDate}</td>
                  <td>
                    <span style="font-weight: 600; color: ${new Date(d.expiryDate) < new Date('2026-06-01') ? '#EA341F' : '#070724'};">
                      ${d.expiryDate}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${d.status === 'Verified' ? 'badge-success' : 'badge-warning'}">
                      ${d.status}
                    </span>
                  </td>
                  <td style="text-align: right; padding-right: 12px;">
                    <button class="btn btn-secondary btn-sm" onclick="UI.showToast('Downloaded ${d.fileRef || d.title}', 'success')" style="padding: 3px 8px; font-size: 11px;">
                      View / Download
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Carrier Company Documents &bull; ${carrier.name}`, modalHtml);
  },

  // --- MANAGE CARRIER PROFILE MODAL ---
  openProfileModal() {
    const store = window.BRIDGES_STORE;
    const carrierId = this.getCarrierId();
    const carrier = store.getCarrier(carrierId) || {
      id: 'CAR-01',
      name: 'Bridges Global Logistics',
      contactPerson: 'Amara Chen',
      email: 'achen@bridges-global.com',
      phone: '+1 (555) 234-8901',
      operatingRegion: 'Trans-Continental North & Central Corridors',
      carrierType: 'Multi-Modal & Heavy Reefer',
      rating: 4.9,
      status: 'Active'
    };

    const modalHtml = `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #18217E; margin-bottom: 2px;">Carrier Company Profile: ${carrier.name} (${carrier.id})</div>
          <div style="color: #64748B;">Manage operational point of contact, 24/7 dispatch hotline, and operating corridor specializations.</div>
        </div>

        <form id="carrier-profile-form" onsubmit="event.preventDefault(); CarrierDashboardView.submitProfile('${carrier.id}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label">Carrier Company Name *</label>
              <input type="text" id="prof-name" class="carrier-form-input" value="${carrier.name}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label">Carrier Tenant Identifier</label>
              <input type="text" class="carrier-form-input" value="${carrier.id}" disabled style="background: #F1F5F9; color: #64748B;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label">Primary Operations Contact *</label>
              <input type="text" id="prof-contact" class="carrier-form-input" value="${carrier.contactPerson || 'Amara Chen'}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label">Dispatch Email Address *</label>
              <input type="email" id="prof-email" class="carrier-form-input" value="${carrier.email || 'dispatch@bridges-global.com'}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label">Primary Operations Phone *</label>
              <input type="text" id="prof-phone" class="carrier-form-input" value="${carrier.phone || '+1 (555) 234-8901'}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label">24/7 Emergency Dispatch Hotline</label>
              <input type="text" id="prof-hotline" class="carrier-form-input" value="${carrier.dispatchHotline || '+1 (800) 555-BGL-FAST'}" placeholder="+1 (800) ...">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label">Fleet Specialization &bull; Equipment Type</label>
              <select id="prof-type" class="carrier-form-select">
                <option value="Multi-Modal" ${carrier.carrierType === 'Multi-Modal' ? 'selected' : ''}>Multi-Modal &bull; Ground, Air, Sea</option>
                <option value="Ground" ${carrier.carrierType === 'Ground' ? 'selected' : ''}>Ground Dedicated &bull; Dry Van &amp; Reefer</option>
                <option value="Air" ${carrier.carrierType === 'Air' ? 'selected' : ''}>Air Bridge Expedite</option>
                <option value="Sea" ${carrier.carrierType === 'Sea' ? 'selected' : ''}>Maritime Port &amp; Container</option>
              </select>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label">Primary Operating Corridor</label>
              <input type="text" id="prof-region" class="carrier-form-input" value="${carrier.operatingRegion || 'Trans-Continental North & Central Corridors'}">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">
              Save Profile Updates
            </button>
          </div>
        </form>
      </div>
    `;

    UI.openModal('generic-app-modal', `Manage Carrier Profile &bull; ${carrier.name}`, modalHtml);
  },

  submitProfile(carrierId) {
    const name = document.getElementById('prof-name')?.value;
    const contactPerson = document.getElementById('prof-contact')?.value;
    const email = document.getElementById('prof-email')?.value;
    const phone = document.getElementById('prof-phone')?.value;
    const dispatchHotline = document.getElementById('prof-hotline')?.value;
    const carrierType = document.getElementById('prof-type')?.value;
    const operatingRegion = document.getElementById('prof-region')?.value;

    try {
      window.BRIDGES_STORE.updateCarrierProfile(carrierId, {
        name,
        contactPerson,
        email,
        phone,
        dispatchHotline,
        carrierType,
        operatingRegion
      });

      UI.closeModal('generic-app-modal');
      UI.showToast("Carrier company profile updated successfully.", 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- NOTIFICATIONS MODAL ---
  openNotificationsModal() {
    const store = window.BRIDGES_STORE;
    const carrierId = this.getCarrierId();
    const notifs = store.getCarrierNotifications(carrierId);

    const modalHtml = `
      <div style="padding: 6px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
          <div>
            <div style="font-weight: 800; color: #18217E; font-size: 13px;">Carrier Dispatch Notifications (${notifs.length})</div>
            <div style="font-size: 11.5px; color: #64748B;">Automated dispatch notices, recovery tender alerts, and milestone logs.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="BRIDGES_STORE.markAllCarrierNotificationsRead('${carrierId}'); CarrierDashboardView.openNotificationsModal();" style="font-size: 11px;">
            Mark All as Read
          </button>
        </div>

        <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          ${notifs.length === 0 ? `
            <div style="text-align: center; padding: 24px; color: #8A9995;">No notifications at this time.</div>
          ` : notifs.map(n => `
            <div style="padding: 10px 12px; border-radius: 6px; border: 1px solid ${n.read ? '#E5EBEE' : '#C7D2FE'}; background: ${n.read ? '#FAFCFD' : '#F5F8FF'}; border-left: 3px solid ${n.type === 'danger' ? '#EA341F' : (n.type === 'warning' ? '#F59E0B' : '#18217E')};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <div style="font-weight: 700; color: #070724; font-size: 12px;">
                  ${!n.read ? '<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #EA341F; margin-right: 6px;"></span>' : ''}
                  ${n.title || 'Dispatch Notice'}
                </div>
                <div style="font-size: 10.5px; color: #8A9995;">
                  ${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style="font-size: 11.5px; color: #393A50; line-height: 1.35;">
                ${n.message || n.desc || ''}
              </div>
              ${!n.read ? `
                <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                  <button class="btn btn-secondary btn-sm" onclick="BRIDGES_STORE.markCarrierNotificationRead('${n.id}'); CarrierDashboardView.openNotificationsModal();" style="padding: 1px 6px; font-size: 10px;">
                    Mark Read
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Carrier Notifications Console`, modalHtml);
  }
};

window.CarrierDashboardView = CarrierDashboardView;

