/**
 * BRIDGES Control Tower - Dispatcher Shipment Tracking & Recovery Monitoring
 * End-to-end operational surveillance of shipments undergoing recovery until final delivery:
 * - Carrier-assigned vehicle and driver verification
 * - Pickup and delivery schedule tracking (scheduled vs actual pickup, planned vs revised delivery)
 * - Multi-tier ETA variance comparison
 * - Notification trigger controls (Customer, Warehouse Dock, Driver SMS)
 * - 8-milestone recovery lifecycle stepper and direct POD completion
 */

const DispatcherTrackingView = {
  searchQuery: '',

  render() {
    const shipments = window.BRIDGES_STORE.getShipments();
    const recoveryRequests = window.BRIDGES_STORE.getRecoveryRequests();
    const exceptions = window.BRIDGES_STORE.getExceptions();

    // Recovering shipments or delayed shipments
    const activeTracked = shipments.filter(s => {
      const hasRec = recoveryRequests.some(r => r.shipmentId === s.id);
      const isDelayed = s.status === 'Delayed' || s.slaRisk === true;
      if (!hasRec && !isDelayed) return false;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const mId = s.id.toLowerCase().includes(q);
        const mOrigin = (s.origin || '').toLowerCase().includes(q);
        const mDest = (s.destination || '').toLowerCase().includes(q);
        const mCarrier = (s.carrier || '').toLowerCase().includes(q);
        const mCust = (s.customerName || '').toLowerCase().includes(q);
        if (!mId && !mOrigin && !mDest && !mCarrier && !mCust) return false;
      }
      return true;
    });

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER -->
        <div class="page-action-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Shipment Recovery Monitoring & Tracking</h2>
              <span class="badge badge-primary">${activeTracked.length} Active Recoveries</span>
            </div>
            <p class="page-subheading">
              End-to-end monitoring of carrier-assigned resources, pickup/delivery schedules, multi-tier revised ETAs, and required customer/warehouse notifications until confirmed delivery.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_escalations')">
              Manage Escalations
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_planning')">
              + Plan New Recovery
            </button>
          </div>
        </div>

        <!-- SEARCH BAR -->
        <div class="panel" style="margin-bottom: 16px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="flex: 1; max-width: 360px; position: relative;">
              <input type="text" 
                     class="search-input" 
                     style="width: 100%; padding: 6px 10px 6px 30px; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px;"
                     placeholder="Filter monitored shipments by ID, customer, carrier..." 
                     value="${this.searchQuery}"
                     oninput="DispatcherTrackingView.handleSearch(this.value)">
              <span style="position: absolute; left: 9px; top: 7px; color: #94A3B8;">${Icons.search(13)}</span>
            </div>
            <span style="font-size: 11.5px; color: #64748B;">Active Surveillance: Telemetry feeds refreshed every 60s</span>
          </div>
        </div>

        <!-- TRACKING CARDS LIST -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${activeTracked.length === 0 ? `
            <div class="panel">
              <div class="analyst-empty-state">
                <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
                <div class="empty-state-title">No Recoveries Match Filter</div>
                <div class="empty-state-sub">Adjust your search query to inspect other shipments under recovery.</div>
              </div>
            </div>
          ` : activeTracked.map(shipment => {
            const linkedExc = exceptions.find(e => e.shipmentId === shipment.id);
            const linkedRec = recoveryRequests.find(r => r.shipmentId === shipment.id);
            
            // ETA breakdown
            const originalEta = shipment.originalETA || '12:00 PM';
            const predictedEta = (linkedExc && linkedExc.predictedETA) || shipment.predictedETA || 'Delayed';
            const plannedEta = (linkedRec && linkedRec.revisedEta) || 'Pending Plan';
            const confirmedEta = linkedRec && linkedRec.responseStatus === 'Accepted' ? linkedRec.revisedEta : 'Awaiting Confirmation';
            const commitment = shipment.deliveryCommitment || '14:00 PM';

            // Pickup & Delivery Times Schedule
            const schedPickup = shipment.departureTime || '2026-03-24 08:00 AM';
            const actualPickup = shipment.actualDeparture || '2026-03-24 08:25 AM (Completed)';
            const plannedDelivery = shipment.deliveryCommitment || '2026-03-24 14:00 PM';
            const revisedDelivery = linkedRec && linkedRec.revisedEta ? linkedRec.revisedEta : predictedEta;

            // Determine if SLA commitment is threatened
            const isThreatened = linkedExc && ['Critical', 'High'].includes(linkedExc.slaRisk);

            // Milestone states (1-8)
            const step1 = !!linkedExc;
            const step2 = !!linkedRec;
            const step3 = !!linkedRec;
            const step4 = linkedRec && ['Accepted', 'Completed', 'In Progress'].includes(linkedRec.responseStatus);
            const step5 = linkedRec && !!linkedRec.assignedVehicleId;
            const step6 = linkedRec && ['In Progress', 'Completed'].includes(linkedRec.responseStatus);
            const step7 = shipment.status === 'On Route' || (linkedRec && linkedRec.responseStatus === 'In Progress');
            const step8 = shipment.status === 'Delivered' || (linkedRec && linkedRec.responseStatus === 'Completed');

            return `
              <div class="panel" style="padding: 16px 18px;">
                <!-- Top Card Bar -->
                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--color-light-blue-grey); gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 16px; font-weight: 800; color: var(--color-royal-navy);">${shipment.id}</div>
                    <span style="font-size: 11.5px; color: var(--color-charcoal); font-weight: 600;">
                      ${shipment.origin} → ${shipment.destination}
                    </span>
                    <span class="badge ${shipment.status === 'Delivered' ? 'badge-success' : shipment.status === 'Delayed' ? 'badge-danger' : 'badge-primary'}">
                      ${shipment.status}
                    </span>
                    <span style="font-size: 11px; color: #18217E; font-weight: 600;">
                      ${shipment.customerName || 'Strategic Customer'}
                    </span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="DispatcherTrackingView.openNotificationModal('${shipment.id}')" style="font-weight: 600; padding: 4px 10px;">
                      🔔 Trigger Notifications
                    </button>
                    ${!step8 ? `
                      <button class="btn btn-secondary btn-sm" onclick="DispatcherTrackingView.confirmDelivery('${shipment.id}', '${linkedRec ? linkedRec.id : ''}')" style="background: #EAF7EE; color: #1E8E3E; border-color: #A7F3D0; font-weight: 700; padding: 4px 10px;">
                        ✓ Confirm Delivery & POD
                      </button>
                    ` : `
                      <span class="badge badge-success" style="font-size: 11px;">✓ Final POD Confirmed</span>
                    `}
                    ${isThreatened ? `
                      <button class="btn btn-danger btn-sm" onclick="DispatcherTrackingView.initiateEscalation('${shipment.id}', '${linkedExc ? linkedExc.id : ''}')" style="padding: 4px 10px; font-weight: 700;">
                        ⚠ Escalate SLA Risk
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- Middle: Multi-tier ETA Variance Strip -->
                <div class="multi-eta-strip">
                  <div class="eta-strip-col">
                    <span class="eta-strip-label">Original Target ETA</span>
                    <span class="eta-strip-val">${originalEta}</span>
                    <span class="eta-strip-source">Schedule baseline</span>
                  </div>

                  <div class="eta-strip-col">
                    <span class="eta-strip-label">Analyst Predicted ETA</span>
                    <span class="eta-strip-val" style="color: var(--color-signal-red);">${predictedEta}</span>
                    <span class="eta-strip-source">Telemetry projection</span>
                  </div>

                  <div class="eta-strip-col">
                    <span class="eta-strip-label">Dispatcher Planned ETA</span>
                    <span class="eta-strip-val">${plannedEta}</span>
                    <span class="eta-strip-source">${linkedRec ? linkedRec.recoveryStrategy : 'Unplanned'}</span>
                  </div>

                  <div class="eta-strip-col">
                    <span class="eta-strip-label">Carrier Confirmed ETA</span>
                    <span class="eta-strip-val" style="color: ${confirmedEta.includes('Awaiting') ? 'var(--color-muted-sage)' : 'var(--color-royal-navy)'};">
                      ${confirmedEta}
                    </span>
                    <span class="eta-strip-source">
                      Commitment: <strong>${commitment}</strong>
                    </span>
                  </div>
                </div>

                <!-- Pickup & Delivery Schedule Details Strip -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11.5px; margin-bottom: 12px; padding: 10px 12px; background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 6px;">
                  <div>
                    <span style="color: #92400E; display: block; font-size: 10.5px; font-weight: 600;">Scheduled Pickup</span>
                    <strong>${schedPickup}</strong>
                  </div>
                  <div>
                    <span style="color: #92400E; display: block; font-size: 10.5px; font-weight: 600;">Actual Pickup Handover</span>
                    <strong style="color: #1E8E3E;">${actualPickup}</strong>
                  </div>
                  <div>
                    <span style="color: #92400E; display: block; font-size: 10.5px; font-weight: 600;">Original SLA Commitment</span>
                    <strong>${plannedDelivery}</strong>
                  </div>
                  <div>
                    <span style="color: #92400E; display: block; font-size: 10.5px; font-weight: 600;">Revised Delivery ETA</span>
                    <strong style="color: #18217E;">${revisedDelivery}</strong>
                  </div>
                </div>

                <!-- Resource & Corridor Meta Strip -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11.5px; margin-bottom: 16px; padding: 10px; background: #FFFFFF; border: 1px solid #EDF2F6; border-radius: 6px;">
                  <div>
                    <span style="color: var(--color-muted-sage); display: block; font-size: 10.5px;">Assigned Carrier</span>
                    <strong>${linkedRec && linkedRec.requestedCarrierName ? linkedRec.requestedCarrierName : shipment.carrier}</strong>
                  </div>
                  <div>
                    <span style="color: var(--color-muted-sage); display: block; font-size: 10.5px;">Vehicle & Driver Assigned</span>
                    <strong>
                      ${linkedRec && linkedRec.assignedVehicleId ? `${linkedRec.assignedVehicleId} (${linkedRec.assignedDriverName || 'Driver'})` : (shipment.vehicle ? `${shipment.vehicle} (${shipment.driver})` : 'Awaiting Assignment')}
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--color-muted-sage); display: block; font-size: 10.5px;">Last Telemetry Position</span>
                    <strong>${shipment.currentLocation || 'En Route Corridor'}</strong>
                  </div>
                  <div>
                    <span style="color: var(--color-muted-sage); display: block; font-size: 10.5px;">Recovery Status</span>
                    <strong>${linkedRec ? linkedRec.responseStatus : 'No Active Recovery'}</strong>
                  </div>
                </div>

                <!-- Bottom: 8-Milestone Recovery Stepper -->
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--color-muted-sage); text-transform: uppercase; margin-bottom: 8px;">
                    Recovery Execution Milestones (Recorded Events)
                  </div>
                  <div class="recovery-stepper">
                    <div class="recovery-step ${step1 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">1</div>
                      <span class="recovery-step-name">Exception Identified</span>
                    </div>
                    <div class="recovery-step ${step2 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">2</div>
                      <span class="recovery-step-name">Strategy Selected</span>
                    </div>
                    <div class="recovery-step ${step3 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">3</div>
                      <span class="recovery-step-name">Request Submitted</span>
                    </div>
                    <div class="recovery-step ${step4 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">4</div>
                      <span class="recovery-step-name">Carrier Response</span>
                    </div>
                    <div class="recovery-step ${step5 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">5</div>
                      <span class="recovery-step-name">Vehicle/Driver Assigned</span>
                    </div>
                    <div class="recovery-step ${step6 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">6</div>
                      <span class="recovery-step-name">Recovery Dispatched</span>
                    </div>
                    <div class="recovery-step ${step7 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">7</div>
                      <span class="recovery-step-name">In-Transit Updates</span>
                    </div>
                    <div class="recovery-step ${step8 ? 'step-completed' : ''}">
                      <div class="recovery-step-circle">8</div>
                      <span class="recovery-step-name">Delivery Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  openNotificationModal(shipmentId) {
    const shipment = window.BRIDGES_STORE.getShipment(shipmentId) || {};
    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; color: #070724; margin-bottom: 12px;">
          Broadcast required recovery milestone notification for shipment <strong>${shipmentId}</strong>:
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Target Audience *</label>
          <select id="notif-audience" class="planning-select" style="width: 100%;">
            <option value="Customer & Consignee">Customer & Consignee (${shipment.customerName || 'BioPharma Health Alliance'})</option>
            <option value="Warehouse Receiving Dock">Destination Warehouse Receiving Dock (${shipment.destination || 'Lake Knot'})</option>
            <option value="Carrier Dispatch & Driver">Carrier Dispatch & On-Road Driver</option>
            <option value="All Stakeholders (Omni-Channel Broadcast)" selected>All Stakeholders (Omni-Channel Broadcast)</option>
          </select>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Delivery Channel *</label>
          <select id="notif-channel" class="planning-select" style="width: 100%;">
            <option value="Multi-Channel (Email + SMS + In-App Webhook)" selected>Multi-Channel (Email + SMS + In-App Webhook)</option>
            <option value="Priority SMS to Logistics Coordinator">Priority SMS to Logistics Coordinator</option>
            <option value="EDI 214 Inbound Shipment Status">EDI 214 Inbound Shipment Status</option>
            <option value="Customer Portal High-Priority Banner">Customer Portal High-Priority Banner</option>
          </select>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Notification Subject *</label>
          <input type="text" id="notif-subject" class="planning-input" value="Shipment ${shipmentId} — Recovery Operation Active, Revised ETA Confirmed">
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Notification Message Body *</label>
          <textarea id="notif-message" class="planning-textarea" rows="3">Shipment ${shipmentId} is actively recovering under operational dispatch protocol. Carrier resources have been assigned and revised ETA is synchronized with receiving dock team.</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherTrackingView.sendNotification('${shipmentId}')" style="font-weight: 700;">
            🚀 Dispatch Notification
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Trigger Operational Notification — ${shipmentId}`, modalHtml);
  },

  sendNotification(shipmentId) {
    const audience = document.getElementById('notif-audience')?.value;
    const channel = document.getElementById('notif-channel')?.value;
    const subject = document.getElementById('notif-subject')?.value;
    const message = document.getElementById('notif-message')?.value;

    try {
      window.BRIDGES_STORE.triggerRecoveryNotification(shipmentId, {
        audience,
        channel,
        subject,
        message
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Notification broadcasted to ${audience} via ${channel}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  confirmDelivery(shipmentId, recoveryRequestId) {
    if (confirm(`Confirm final physical delivery and proof-of-delivery (POD) signoff for shipment ${shipmentId}?`)) {
      try {
        if (recoveryRequestId) {
          window.BRIDGES_STORE.updateRecoveryStatus(recoveryRequestId, 'Completed', {
            note: 'Final POD signed off by destination receiving personnel. Recovery closed.',
            confirmDelivery: true
          });
        } else {
          const s = window.BRIDGES_STORE.getShipment(shipmentId);
          if (s) {
            s.status = 'Delivered';
            s.actualArrival = new Date().toISOString();
            window.BRIDGES_STORE.save();
          }
        }
        UI.showToast(`Delivery and POD confirmed for shipment ${shipmentId}.`, 'success');
        App.renderCurrentView();
      } catch (err) {
        UI.showToast(err.message, 'error');
      }
    }
  },

  initiateEscalation(shipmentId, exceptionId) {
    App.navigateTo('dispatcher_escalations');
    setTimeout(() => {
      DispatcherEscalationsView.openCreateModal(exceptionId, shipmentId);
    }, 50);
  }
};

window.DispatcherTrackingView = DispatcherTrackingView;
