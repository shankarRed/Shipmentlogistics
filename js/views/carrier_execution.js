/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Shipment Execution Workspace (US-66, US-69, US-70, US-71, US-72, US-73, US-74, US-75, US-76, US-77)
 * Fleet assignment, Dispatch confirmation, Milestone advancement, ETA revisions, Re-route, Expedite & Split responses
 */

const CarrierExecutionView = {
  selectedRecoveryId: null,

  render() {
    const store = window.BRIDGES_STORE;
    const reqs = store.getCarrierRecoveryRequests().filter(r => 
      ['Accepted', 'In Progress', 'Completed'].includes(r.responseStatus)
    );

    if (!this.selectedRecoveryId && reqs.length > 0) {
      this.selectedRecoveryId = reqs[0].id;
    }

    const currentReq = store.getRecoveryRequest(this.selectedRecoveryId);
    const shipment = currentReq ? store.getShipment(currentReq.shipmentId) : null;

    return `
      <div class="carrier-execution-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Shipment Execution Workspace &bull; Recovery Telemetry</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Execute active recoveries, bind fleet resources, confirm dispatch, log checkpoint milestones, and update confirmed ETAs.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('carrier_requests')" style="font-weight: 600;">
              ${Icons.inbox(14)} Requests Inbox
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('carrier_delivery')" style="font-weight: 700;">
              ${Icons.delivery(14)} Confirm Delivery
            </button>
          </div>
        </div>

        ${reqs.length === 0 ? `
          <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
            <div class="carrier-empty-icon">${Icons.execution(26)}</div>
            <div class="carrier-empty-title">No Active Recovery Operations</div>
            <p class="carrier-empty-desc">
              There are currently no accepted recovery requests awaiting execution. Go to the Requests Inbox to accept pending instructions.
            </p>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('carrier_requests')" style="margin-top: 14px; font-weight: 700; background: #18217E;">
              Go to Assignment Requests &rarr;
            </button>
          </div>
        ` : `
          <!-- Active Recovery Selector Tabs -->
          <div style="display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px;">
            ${reqs.map(r => {
              const isSelected = r.id === this.selectedRecoveryId;
              let badgeColor = r.responseStatus === 'In Progress' ? '#424989' : (r.responseStatus === 'Accepted' ? '#18217E' : '#059669');

              return `
                <button type="button" class="btn btn-sm" onclick="CarrierExecutionView.selectRecovery('${r.id}')" style="background: ${isSelected ? '#18217E' : 'white'}; color: ${isSelected ? 'white' : '#070724'}; border: 1px solid ${isSelected ? '#18217E' : '#E5EBEE'}; border-radius: 6px; padding: 7px 14px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; white-space: nowrap; box-shadow: 0 1px 2px rgba(7,7,36,0.04);">
                  <span>${r.id} (${r.shipmentId})</span>
                  <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; background: ${isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(24,33,126,0.08)'}; color: ${isSelected ? 'white' : badgeColor};">
                    ${r.responseStatus}
                  </span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Main Workspace Panel -->
          ${currentReq ? this.renderExecutionPanel(currentReq, shipment) : ''}
        `}
      </div>
    `;
  },

  selectRecovery(requestId) {
    this.selectedRecoveryId = requestId;
    App.renderCurrentView();
  },

  openExecutionWorkspace(shipmentId) {
    const store = window.BRIDGES_STORE;
    const req = store.getCarrierRecoveryRequests().find(r => r.shipmentId === shipmentId);
    if (req) {
      this.selectedRecoveryId = req.id;
    }
    App.navigateTo('carrier_execution');
  },

  renderExecutionPanel(req, shipment) {
    const isAccepted = req.responseStatus === 'Accepted';
    const isInProgress = req.responseStatus === 'In Progress';
    const isAssigned = !!(req.assignedVehicleId && req.assignedDriverName);

    // Milestones definition
    const milestones = [
      { key: 'Vehicle Assigned', label: 'Vehicle Assigned' },
      { key: 'Driver Assigned', label: 'Driver Assigned' },
      { key: 'Departed', label: 'Dispatched / Departed' },
      { key: 'In Transit', label: 'In Transit' },
      { key: 'Arrived at Destination', label: 'Arrived at Dest' },
      { key: 'Delivery Completed', label: 'Delivered (POD)' }
    ];

    const loggedMilestones = (shipment && shipment.milestones) ? shipment.milestones.map(m => m.milestone) : [];

    return `
      <div>
        <!-- Top Status Bar & Quick Actions -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 16px; font-weight: 800; color: #18217E;">${req.id}</span>
              <span style="color: #8A9995;">&bull;</span>
              <span style="font-size: 14px; font-weight: 700; color: #070724;">Shipment: ${req.shipmentId}</span>
              <span class="carrier-badge ${isInProgress ? 'carrier-badge-in-progress' : (isAccepted ? 'carrier-badge-accepted' : 'carrier-badge-completed')}">
                ${req.responseStatus}
              </span>
            </div>
            <div style="font-size: 12px; color: #393A50;">
              Strategy: <strong>${req.recoveryStrategy}</strong> &bull; Corridor: <strong>${shipment ? `${shipment.origin} &rarr; ${shipment.destination}` : 'Line-haul'}</strong>
            </div>
          </div>

          <!-- Dynamic Action Buttons depending on execution stage -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${isAccepted && !isAssigned ? `
              <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openAssignResourcesModal('${req.id}')" style="font-weight: 700; background: #059669; border-color: #059669;">
                ${Icons.truck(14)} Assign Vehicle &amp; Driver
              </button>
            ` : ''}

            ${isAccepted && isAssigned ? `
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openAssignResourcesModal('${req.id}')">
                Reassign Fleet
              </button>
              <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openDispatchModal('${req.id}')" style="font-weight: 800; background: #18217E;">
                ${Icons.execution(14)} Confirm Dispatch &rarr;
              </button>
            ` : ''}

            ${isInProgress ? `
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openAdvanceMilestoneModal('${shipment ? shipment.id : ''}')" style="font-weight: 600;">
                Advance Milestone
              </button>
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openEtaModal('${shipment ? shipment.id : ''}')" style="font-weight: 600;">
                Update Confirmed ETA
              </button>
              <button class="btn btn-danger btn-sm" onclick="CarrierExecutionView.openDisruptionModal('${shipment ? shipment.id : ''}', '${req.id}')" style="font-weight: 700;">
                ${Icons.disruption(14)} Report Disruption
              </button>
              <button class="btn btn-primary btn-sm" onclick="CarrierDeliveryView.openDeliveryModal('${shipment ? shipment.id : ''}')" style="font-weight: 700; background: #059669; border-color: #059669;">
                ${Icons.delivery(14)} Confirm Delivery (POD)
              </button>
            ` : ''}

            <!-- Special Strategy Review Actions (Re-route, Expedite, Split) -->
            ${req.recoveryStrategy === 'Re-route' ? `
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openRerouteReviewModal('${req.id}')" style="font-weight: 600; color: #18217E;">
                🗺️ Review / Revise Route ${req.rerouteStatus ? `(${req.rerouteStatus})` : ''}
              </button>
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openRouteProgressModal('${shipment ? shipment.id : ''}')" style="font-weight: 600; color: #059669;">
                📡 Route Progress Update
              </button>
            ` : ''}

            ${req.recoveryStrategy === 'Expedite' ? `
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openExpediteReviewModal('${req.id}')" style="font-weight: 600; color: #EA341F;">
                ⚡ Expedite Review ${req.expediteStatus ? `(${req.expediteStatus})` : ''}
              </button>
            ` : ''}

            ${req.recoveryStrategy === 'Split Shipment' ? `
              <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openSplitReviewModal('${req.id}')" style="font-weight: 600; color: #424989;">
                ✂️ Split Review ${req.splitStatus ? `(${req.splitStatus})` : ''}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Milestone Stepper Progress Bar -->
        <div class="carrier-card-section" style="padding: 16px 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase; margin-bottom: 6px;">
            Operational Milestone Progression
          </div>
          <div class="carrier-stepper">
            ${milestones.map((m, idx) => {
              const isDone = loggedMilestones.includes(m.key) || (isAssigned && idx <= 1) || (isInProgress && idx <= 3);
              const isCurrent = isInProgress && idx === 3;

              return `
                <div class="carrier-step-item ${isDone ? 'completed' : (isCurrent ? 'active' : '')}" onclick="CarrierExecutionView.openAdvanceMilestoneModal('${shipment ? shipment.id : ''}', '${m.key}')" title="Record milestone: ${m.label}">
                  <div class="carrier-step-circle">
                    ${isDone ? '&#10003;' : (idx + 1)}
                  </div>
                  <div class="carrier-step-label">${m.label}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- DEDICATED SPLIT SHIPMENT PORTIONS CONSOLE -->
        ${(req.recoveryStrategy === 'Split Shipment' && req.splitDetails) ? `
          <div class="carrier-card-section" style="border: 2px solid #424989; background: #FAF9FF; margin-bottom: 16px; padding: 16px 20px;">
            <div class="carrier-section-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">✂️</span>
                <span style="font-weight: 800; color: #424989; font-size: 14px;">Split Shipment Portions Execution Console</span>
                <span class="badge" style="background: #424989; color: white; font-size: 10px;">Dual Portion Haulage</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openSplitReviewModal('${req.id}')" style="font-size: 11px;">
                  Review Split Terms
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <!-- PORTION 1 CARD -->
              <div style="background: white; border: 1px solid #DDD6FE; border-radius: 8px; padding: 14px; box-shadow: 0 1px 3px rgba(66,73,137,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span class="badge" style="background: #EDE9FE; color: #424989; font-weight: 700; font-size: 10.5px;">Portion 1 (P1)</span>
                    <div style="font-weight: 800; color: #070724; font-size: 13px; margin-top: 3px;">
                      ${req.splitDetails.portion1?.cargo || 'Core Powertrain Assemblies'}
                    </div>
                  </div>
                  <span class="carrier-badge ${req.splitDetails.portion1?.status === 'Delivered' ? 'carrier-badge-completed' : (req.splitDetails.portion1?.status === 'In Transit' ? 'carrier-badge-in-progress' : 'carrier-badge-pending')}">
                    ${req.splitDetails.portion1?.status || 'Awaiting Assignment'}
                  </span>
                </div>

                <div style="font-size: 11.5px; line-height: 1.6; color: #393A50; margin-bottom: 10px;">
                  <div>Weight: <strong>${req.splitDetails.portion1?.weight || '18.0T'}</strong> &bull; Dest: <strong>${req.splitDetails.portion1?.destination || 'Facility A'}</strong></div>
                  <div>Assigned Fleet: <strong>${req.splitDetails.portion1?.assignedVehicleName || 'None'}</strong></div>
                  <div>Assigned Driver: <strong>${req.splitDetails.portion1?.assignedDriverName || 'None'}</strong></div>
                  <div>Confirmed ETA: <strong style="color: #18217E;">${req.splitDetails.portion1?.revisedEta || req.splitDetails.portion1?.expectedDeliveryTime || '15:30 EST'}</strong></div>
                </div>

                <div style="display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid #F1F5F9; padding-top: 10px;">
                  <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openAssignSplitPortionModal('${req.id}', 'portion1')" style="font-size: 11px;">
                    ${req.splitDetails.portion1?.assignedVehicleId ? 'Reassign Fleet' : 'Assign Fleet (P1)'}
                  </button>
                  ${req.splitDetails.portion1?.assignedVehicleId && req.splitDetails.portion1?.status !== 'In Transit' && req.splitDetails.portion1?.status !== 'Delivered' ? `
                    <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openDispatchSplitPortionModal('${req.id}', 'portion1')" style="font-size: 11px; background: #18217E;">
                      Dispatch P1 &rarr;
                    </button>
                  ` : ''}
                  ${req.splitDetails.portion1?.status === 'In Transit' ? `
                    <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openUpdateSplitPortionModal('${req.id}', 'portion1')" style="font-size: 11px;">
                      Update Status/ETA
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openConfirmSplitPortionDeliveryModal('${req.id}', 'portion1')" style="font-size: 11px; background: #059669; border-color: #059669;">
                      Confirm POD (P1)
                    </button>
                  ` : ''}
                  ${req.splitDetails.portion1?.status === 'Delivered' ? `
                    <span class="badge badge-success" style="padding: 4px 8px;">✓ Delivered &bull; POD Logged</span>
                  ` : ''}
                </div>
              </div>

              <!-- PORTION 2 CARD -->
              <div style="background: white; border: 1px solid #DDD6FE; border-radius: 8px; padding: 14px; box-shadow: 0 1px 3px rgba(66,73,137,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span class="badge" style="background: #EDE9FE; color: #424989; font-weight: 700; font-size: 10.5px;">Portion 2 (P2)</span>
                    <div style="font-weight: 800; color: #070724; font-size: 13px; margin-top: 3px;">
                      ${req.splitDetails.portion2?.cargo || 'Secondary Mounting Brackets'}
                    </div>
                  </div>
                  <span class="carrier-badge ${req.splitDetails.portion2?.status === 'Delivered' ? 'carrier-badge-completed' : (req.splitDetails.portion2?.status === 'In Transit' ? 'carrier-badge-in-progress' : 'carrier-badge-pending')}">
                    ${req.splitDetails.portion2?.status || 'Awaiting Assignment'}
                  </span>
                </div>

                <div style="font-size: 11.5px; line-height: 1.6; color: #393A50; margin-bottom: 10px;">
                  <div>Weight: <strong>${req.splitDetails.portion2?.weight || '14.0T'}</strong> &bull; Dest: <strong>${req.splitDetails.portion2?.destination || 'Facility B'}</strong></div>
                  <div>Assigned Fleet: <strong>${req.splitDetails.portion2?.assignedVehicleName || 'None'}</strong></div>
                  <div>Assigned Driver: <strong>${req.splitDetails.portion2?.assignedDriverName || 'None'}</strong></div>
                  <div>Confirmed ETA: <strong style="color: #18217E;">${req.splitDetails.portion2?.revisedEta || req.splitDetails.portion2?.expectedDeliveryTime || '17:00 EST'}</strong></div>
                </div>

                <div style="display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid #F1F5F9; padding-top: 10px;">
                  <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openAssignSplitPortionModal('${req.id}', 'portion2')" style="font-size: 11px;">
                    ${req.splitDetails.portion2?.assignedVehicleId ? 'Reassign Fleet' : 'Assign Fleet (P2)'}
                  </button>
                  ${req.splitDetails.portion2?.assignedVehicleId && req.splitDetails.portion2?.status !== 'In Transit' && req.splitDetails.portion2?.status !== 'Delivered' ? `
                    <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openDispatchSplitPortionModal('${req.id}', 'portion2')" style="font-size: 11px; background: #18217E;">
                      Dispatch P2 &rarr;
                    </button>
                  ` : ''}
                  ${req.splitDetails.portion2?.status === 'In Transit' ? `
                    <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openUpdateSplitPortionModal('${req.id}', 'portion2')" style="font-size: 11px;">
                      Update Status/ETA
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openConfirmSplitPortionDeliveryModal('${req.id}', 'portion2')" style="font-size: 11px; background: #059669; border-color: #059669;">
                      Confirm POD (P2)
                    </button>
                  ` : ''}
                  ${req.splitDetails.portion2?.status === 'Delivered' ? `
                    <span class="badge badge-success" style="padding: 4px 8px;">✓ Delivered &bull; POD Logged</span>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2-Column Execution Workspace: Resources & Route Details vs Timeline -->
        <div class="carrier-detail-grid">
          <!-- Left: Assigned Resources & Parameters -->
          <div>
            <!-- Resource Binding Card -->
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${Icons.truck(15)}</span>
                  <span>Assigned Fleet Resources &amp; Timetable</span>
                </div>
                ${!isAssigned ? `
                  <span class="carrier-badge carrier-badge-rejected" style="font-size: 10px;">Pending Assignment</span>
                ` : `
                  <span class="carrier-badge carrier-badge-available" style="font-size: 10px;">Assigned &amp; Committed</span>
                `}
              </div>

              ${!isAssigned ? `
                <div style="padding: 16px; background: #FFFBF0; border: 1px dashed #FCD34D; border-radius: 6px; text-align: center;">
                  <div style="font-weight: 700; color: #B45309; font-size: 13px; margin-bottom: 4px;">No Fleet Resources Currently Bound</div>
                  <p style="font-size: 11.5px; color: #92400E; margin: 0 0 10px 0;">
                    To initiate transit and dispatch, you must assign an available carrier vehicle and qualified driver.
                  </p>
                  <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openAssignResourcesModal('${req.id}')" style="font-weight: 700; background: #18217E;">
                    Assign Fleet Now &rarr;
                  </button>
                </div>
              ` : `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px;">
                    <div style="font-size: 10.5px; color: #8A9995; font-weight: 700; text-transform: uppercase;">Vehicle Asset</div>
                    <div style="font-size: 13px; font-weight: 700; color: #070724; margin-top: 2px;">
                      ${req.assignedVehicleName || 'Freightliner Cascadia'}
                    </div>
                    <div style="font-size: 11px; color: #18217E; font-family: monospace;">
                      Plate: ${req.assignedVehiclePlate || req.assignedVehicleId}
                    </div>
                  </div>

                  <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px;">
                    <div style="font-size: 10.5px; color: #8A9995; font-weight: 700; text-transform: uppercase;">Lead Driver</div>
                    <div style="font-size: 13px; font-weight: 700; color: #070724; margin-top: 2px;">
                      ${req.assignedDriverName}
                    </div>
                    <div style="font-size: 11px; color: #424989;">
                      Duty Status: Active On Duty
                    </div>
                  </div>
                </div>

                <div class="carrier-field-row">
                  <span class="carrier-field-label">Scheduled Pickup:</span>
                  <span class="carrier-field-value" style="font-weight: 700;">
                    ${req.expectedPickupTime ? new Date(req.expectedPickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending'}
                  </span>
                </div>
                <div class="carrier-field-row">
                  <span class="carrier-field-label">Target Delivery:</span>
                  <span class="carrier-field-value" style="font-weight: 700; color: #18217E;">
                    ${req.expectedDeliveryTime ? new Date(req.expectedDeliveryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending'}
                  </span>
                </div>
                <div class="carrier-field-row">
                  <span class="carrier-field-label">Confirmed ETA:</span>
                  <span class="carrier-field-value" style="font-weight: 700; color: ${shipment && shipment.slaRisk ? '#EA341F' : '#059669'};">
                    ${shipment ? (shipment.carrierConfirmedEta || shipment.currentEta || '14:30 EST') : '14:30 EST'}
                  </span>
                </div>
                <div class="carrier-field-row">
                  <span class="carrier-field-label">Operational Notes:</span>
                  <span class="carrier-field-value">
                    ${req.carrierOperationalNotes || 'None recorded.'}
                  </span>
                </div>
              `}
            </div>

            <!-- Planned Route & Corridor Details -->
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                  <span>Planned Route &amp; Transit Corridor</span>
                </div>
              </div>
              <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; font-size: 12px; line-height: 1.5; color: #393A50;">
                <div><strong>Standard Corridor:</strong> ${shipment ? shipment.origin : 'Origin'} &rarr; Interstate 80 Line-haul Corridor &rarr; ${shipment ? shipment.destination : 'Destination'}</div>
                ${req.proposedRoute ? `
                  <div style="margin-top: 6px; padding: 6px 8px; background: #EEF2FF; border-left: 2px solid #18217E; border-radius: 3px;">
                    <strong style="color: #18217E;">Dispatcher Proposed Alternative:</strong> ${req.proposedRoute}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Right: Execution Event Timeline -->
          <div>
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${Icons.history(15)}</span>
                  <span>Execution Audit Timeline</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openAdvanceMilestoneModal('${shipment ? shipment.id : ''}')" style="font-size: 11px;">
                  + Log Milestone
                </button>
              </div>

              <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                ${(req.timeline || []).map(t => `
                  <div style="padding: 9px 12px; border-radius: 6px; border: 1px solid #E5EBEE; background: #FAFCFD; border-left: 3px solid #18217E;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                      <strong style="color: #070724;">${t.action}</strong>
                      <span style="color: #8A9995;">${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style="font-size: 10.5px; color: #8A9995; margin-bottom: 3px;">
                      ${t.actor || 'Carrier Dispatch'}
                    </div>
                    <div style="font-size: 11.5px; color: #393A50; line-height: 1.35;">
                      ${t.note}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- Assign Vehicle & Driver Modal (US-66, US-69, US-70) ---
  openAssignResourcesModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const availableVehicles = store.getCarrierVehicles().filter(v => v.status === 'Available' || v.currentAssignment === req.id);
    const availableDrivers = store.getCarrierDrivers().filter(d => d.status === 'Available' || d.currentAssignment === req.id);
    const isReCarrier = req.recoveryStrategy === 'Alternate Carrier' || req.recoveryStrategy === 'Re-carrier';

    // Sensible defaults
    const now = new Date();
    const pickupDefault = new Date(now.getTime() + 30 * 60000).toISOString().slice(0, 16);
    const deliveryDefault = new Date(now.getTime() + 4 * 3600000).toISOString().slice(0, 16);

    const modalTitle = isReCarrier 
      ? `Re-carrier Fleet Assignment &bull; Replacement Vehicle &amp; Driver (${req.id})`
      : `Assign Fleet Resources &bull; Recovery ${req.id}`;

    UI.openModal('generic-app-modal', modalTitle, `
      <div style="padding: 6px 0;">
        <div style="background: ${isReCarrier ? '#EFF6FF' : '#F8FAFD'}; border: 1px solid ${isReCarrier ? '#93C5FD' : '#C7D2FE'}; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 12px; color: #18217E;">
          ${isReCarrier ? `
            <strong>Re-carrier Operational Execution:</strong> Select an available company replacement vehicle and qualified driver to take over line-haul custody for shipment <strong>${req.shipmentId}</strong>. Provide pickup and delivery estimates; confirming will bind assets for dispatch and update recovery readiness.
          ` : `
            <strong>Carrier Operations Rule:</strong> Resources must belong to Bridges Global Logistics (CAR-01) and cannot be double-booked across simultaneous active recoveries.
          `}
        </div>

        <form id="carrier-assign-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitResourceAssignment('${req.id}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="assign-vehicle">${isReCarrier ? 'Select Replacement Vehicle:' : 'Select Available Vehicle:'} <span style="color: #EA341F;">*</span></label>
              <select id="assign-vehicle" class="carrier-form-select" required>
                <option value="">${isReCarrier ? 'Choose replacement tractor-trailer...' : 'Choose available vehicle...'}</option>
                ${availableVehicles.map(v => `
                  <option value="${v.id}" ${req.assignedVehicleId === v.id ? 'selected' : ''}>
                    ${v.name} (${v.plateNumber}) &bull; ${v.capacity || '45k lbs'}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="assign-driver">Assign Qualified Driver: <span style="color: #EA341F;">*</span></label>
              <select id="assign-driver" class="carrier-form-select" required>
                <option value="">Choose qualified driver...</option>
                ${availableDrivers.map(d => `
                  <option value="${d.id}" ${req.assignedDriverId === d.id || req.assignedDriverName === d.name ? 'selected' : ''}>
                    ${d.name} &bull; ${d.licenseClass || 'CDL-A'} (${d.status})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="assign-pickup">Estimated / Scheduled Pickup: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="assign-pickup" class="carrier-form-input" value="${req.expectedPickupTime ? req.expectedPickupTime.slice(0, 16) : pickupDefault}" required>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="assign-delivery">Estimated Delivery Time: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="assign-delivery" class="carrier-form-input" value="${req.expectedDeliveryTime ? req.expectedDeliveryTime.slice(0, 16) : deliveryDefault}" required>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="assign-notes">Carrier Operational Notes:</label>
            <textarea id="assign-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Unit staged and pre-tripped. Driver briefed on route hazards.">${req.carrierOperationalNotes || ''}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #059669; border-color: #059669;">
              ${isReCarrier ? 'Confirm Replacement Fleet Assignment' : 'Confirm Resource Assignment'}
            </button>
          </div>
        </form>
      </div>
    `);
  },

  submitResourceAssignment(requestId) {
    const vehicleId = document.getElementById('assign-vehicle').value;
    const driverId = document.getElementById('assign-driver').value;
    const expectedPickupTime = document.getElementById('assign-pickup').value;
    const expectedDeliveryTime = document.getElementById('assign-delivery').value;
    const notes = document.getElementById('assign-notes').value;

    try {
      window.BRIDGES_STORE.assignResourcesToRecovery(requestId, {
        vehicleId,
        driverId,
        expectedPickupTime,
        expectedDeliveryTime,
        operationalNotes: notes
      });

      UI.closeModal('generic-app-modal');
      UI.showToast("Fleet resources successfully assigned. Unit ready for dispatch confirmation.", 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Confirm Dispatch Modal (US-71) ---
  openDispatchModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    UI.openModal('generic-app-modal', `Confirm Fleet Dispatch — ${req.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">Departure Authorization &bull; Milestone Trigger</div>
          <p style="font-size: 12px; color: #15803D; margin: 0; line-height: 1.4;">
            Confirming dispatch sets vehicle <strong>${req.assignedVehiclePlate || req.assignedVehicleId}</strong> and driver <strong>${req.assignedDriverName}</strong> to <strong>In Transit</strong> status.
            The shipment operational status will update in real time across the Dispatcher and Analyst consoles.
          </p>
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="dispatch-notes">Dispatch Clearance Notes (Optional):</label>
          <textarea id="dispatch-notes" class="carrier-form-textarea" rows="3" placeholder="e.g. Unit rolled out from Dallas Regional Depot at gate 4. Odometer recorded."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.submitDispatch('${req.id}')" style="font-weight: 800; background: #18217E;">
            Authorize &amp; Dispatch Fleet &rarr;
          </button>
        </div>
      </div>
    `);
  },

  submitDispatch(requestId) {
    const notesEl = document.getElementById('dispatch-notes');
    const notes = notesEl ? notesEl.value : '';

    try {
      window.BRIDGES_STORE.confirmDispatch(requestId, { operationalNotes: notes });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Fleet dispatch confirmed for ${requestId}. Shipment is now In Transit.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Advance Milestone Modal (US-71 to US-73) ---
  openAdvanceMilestoneModal(shipmentId, presetMilestone = '') {
    if (!shipmentId) {
      const store = window.BRIDGES_STORE;
      const firstActive = store.getCarrierShipments().find(s => s.status !== 'Delivered');
      if (firstActive) shipmentId = firstActive.id;
    }
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(shipmentId);
    if (!shipment) {
      UI.showToast("No active shipment selected for milestone logging.", 'warning');
      return;
    }

    const milestones = [
      'Arrived at Pickup',
      'Pickup Completed',
      'Departed',
      'In Transit',
      'Arrived at Checkpoint',
      'Delay Reported',
      'Arrived at Destination',
      'Delivery Completed'
    ];

    UI.openModal('generic-app-modal', `Log Execution Milestone — ${shipment.id}`, `
      <div style="padding: 6px 0;">
        <form id="carrier-milestone-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitMilestone('${shipment.id}');">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="m-name">Milestone Event: <span style="color: #EA341F;">*</span></label>
            <select id="m-name" class="carrier-form-select" required>
              ${milestones.map(m => `
                <option value="${m}" ${presetMilestone === m ? 'selected' : ''}>${m}</option>
              `).join('')}
            </select>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="m-loc">Current Geolocation / Checkpoint: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="m-loc" class="carrier-form-input" value="${shipment.currentLocation || shipment.origin}" placeholder="e.g. I-80 Mile Marker 142, Des Moines Hub" required>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="m-notes">Operational Notes:</label>
            <textarea id="m-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Checkpoint cleared on schedule. Cargo seals intact."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">Record Milestone</button>
          </div>
        </form>
      </div>
    `);
  },

  submitMilestone(shipmentId) {
    const milestoneName = document.getElementById('m-name').value;
    const location = document.getElementById('m-loc').value;
    const notes = document.getElementById('m-notes').value;

    try {
      window.BRIDGES_STORE.updateShipmentMilestone(shipmentId, milestoneName, { location, notes });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Milestone '${milestoneName}' logged successfully at ${location}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Update Confirmed ETA Modal (US-73) ---
  openEtaModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    if (!s) return;

    const currentEta = s.carrierConfirmedEta || s.currentEta || s.eta || '14:30 EST';

    UI.openModal('generic-app-modal', `Update Carrier Confirmed ETA — ${s.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #E5EBEE; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 12px;">
          <div><strong>Current Confirmed ETA:</strong> <span style="font-weight: 700; color: #18217E;">${currentEta}</span></div>
          <div><strong>Committed SLA Delivery:</strong> ${s.committedDeliveryTime || '18:00 EST'}</div>
          <div style="font-size: 11px; color: #8A9995; margin-top: 2px;">
            Carrier updates are distinguished in the shared Control Tower from Analyst AI predictions or Dispatcher proposals.
          </div>
        </div>

        <form id="carrier-eta-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitEta('${s.id}');">
          <div class="carrier-form-group">
            <label class="carrier-form-label" for="eta-revised">Revised Confirmed ETA: <span style="color: #EA341F;">*</span></label>
            <input type="text" id="eta-revised" class="carrier-form-input" placeholder="e.g. 16:45 EST (Oct 16)" required>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="eta-reason">Mandatory Operational Reason: <span style="color: #EA341F;">*</span></label>
            <select id="eta-reason" class="carrier-form-select" required>
              <option value="">Select reason for ETA change...</option>
              <option value="Traffic Congestion: Severe gridlock on primary interstate corridor.">Traffic Congestion</option>
              <option value="Vehicle Breakdown: Minor mechanical issue or tire replacement.">Vehicle Breakdown</option>
              <option value="Weather Disruption: Heavy snow, blizzard, or dense fog speed restrictions.">Weather Disruption</option>
              <option value="Loading Delay: Shipper dock turnaround exceeded dwell allocation.">Loading Delay</option>
              <option value="Route Restriction: Bridge weight limit or tunnel detour mandated.">Route Restriction</option>
              <option value="Customs Delay: Border inspection or documentation audit hold.">Customs Delay</option>
              <option value="Other">Other Operational Issue</option>
            </select>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="eta-location">Current Unit Location:</label>
            <input type="text" id="eta-location" class="carrier-form-input" value="${s.currentLocation || ''}" placeholder="e.g. Near Exit 52, Lincoln NE">
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="eta-notes">Supporting Operational Notes:</label>
            <textarea id="eta-notes" class="carrier-form-textarea" rows="2" placeholder="Provide context on mitigation steps taken..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">Update Confirmed ETA</button>
          </div>
        </form>
      </div>
    `);
  },

  submitEta(shipmentId) {
    const revisedEta = document.getElementById('eta-revised').value;
    const reason = document.getElementById('eta-reason').value;
    const currentLocation = document.getElementById('eta-location').value;
    const notes = document.getElementById('eta-notes').value;

    try {
      window.BRIDGES_STORE.updateCarrierEta(shipmentId, {
        revisedEta,
        reason,
        currentLocation,
        operationalNotes: notes
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Carrier confirmed ETA updated to ${revisedEta}. Visible to Dispatcher & Analyst.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Re-Route Review Modal (Review, Accept/Reject, Revise Route/ETA, Confirm Execution) ---
  openRerouteReviewModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const shipment = store.getShipment(req.shipmentId);
    const isAccepted = req.responseStatus === 'Accepted' || req.rerouteStatus === 'Accepted';
    const isCountered = req.rerouteStatus === 'Counter-Route Proposed';

    UI.openModal('generic-app-modal', `Re-route Execution &bull; Decision Workspace (${req.id})`, `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #C7D2FE; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-weight: 700; color: #18217E; font-size: 13px;">Proposed Re-route Analysis &amp; Corridor Review</div>
            <span class="carrier-badge ${isAccepted ? 'carrier-badge-accepted' : isCountered ? 'carrier-badge-in-progress' : 'carrier-badge-pending'}">
              ${req.rerouteStatus || req.responseStatus}
            </span>
          </div>
          <div><strong>Standard Corridor:</strong> ${shipment ? `${shipment.origin} &rarr; ${shipment.destination}` : 'Line-haul Highway'}</div>
          <div style="margin-top: 2px;"><strong>Dispatcher Proposed Route:</strong> <span style="color: #18217E; font-weight: 700;">${req.proposedRoute || 'Detour via US-281 North to avoid interstate gridlock'}</span></div>
          <div style="margin-top: 2px;"><strong>Reason for Recovery:</strong> ${req.reasonForRecovery || 'Highway accident causing severe slowdown.'}</div>
          ${req.carrierCounterRoute ? `
            <div style="margin-top: 6px; padding: 6px 8px; background: #EEF2FF; border-left: 3px solid #18217E; border-radius: 3px;">
              <strong style="color: #18217E;">Active Carrier Counter-Route:</strong> ${req.carrierCounterRoute} (Confirmed ETA: ${req.revisedEta})
            </div>
          ` : ''}
        </div>

        <!-- Section 1: Accept or Reject Proposed Route -->
        <div style="border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px; margin-bottom: 14px; background: white;">
          <div style="font-weight: 700; color: #070724; font-size: 12.5px; margin-bottom: 6px;">
            1. Accept or Reject Proposed Detour Route
          </div>
          <div class="carrier-form-group" style="margin-bottom: 8px;">
            <label class="carrier-form-label" for="reroute-reason">Rejection Reason (Mandatory only if declining):</label>
            <textarea id="reroute-reason" class="carrier-form-textarea" rows="2" placeholder="State operational reason if declining proposed route (e.g. bridge clearance, road restriction)..."></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" class="btn btn-danger btn-sm" onclick="CarrierExecutionView.submitRerouteResponse('${req.id}', 'Rejected')" style="font-weight: 700;">
              Reject Proposed Route
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.submitRerouteResponse('${req.id}', 'Accepted')" style="font-weight: 700; background: #18217E;">
              Accept Proposed Route
            </button>
          </div>
        </div>

        <!-- Section 2: Carrier Revised Route or ETA Counter-Proposal -->
        <div style="border: 1px solid #C7D2FE; border-radius: 6px; padding: 12px; margin-bottom: 14px; background: #F8FAFD;">
          <div style="font-weight: 700; color: #18217E; font-size: 12.5px; margin-bottom: 6px;">
            2. Provide Revised Route or ETA (Carrier Counter-Proposal)
          </div>
          <p style="font-size: 11.5px; color: #393A50; margin: 0 0 10px 0;">
            If the dispatcher's suggested detour is sub-optimal, submit your company's revised corridor and confirmed achievable ETA.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="counter-route">Revised Detour Route / Corridor: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="counter-route" class="carrier-form-input" placeholder="e.g. US-84 West to Loop 289 Bypass" value="${req.carrierCounterRoute || ''}">
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="counter-eta">Revised Confirmed ETA: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="counter-eta" class="carrier-form-input" placeholder="e.g. 16:45 EST" value="${req.revisedEta || ''}">
            </div>
          </div>

          <div class="carrier-form-group" style="margin-bottom: 8px;">
            <label class="carrier-form-label" for="counter-notes">Operational Feasibility Notes:</label>
            <textarea id="counter-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Route avoids mountain pass congestion. Truck stops available at mile 92.">${req.carrierOperationalNotes || ''}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.submitCounterProposal('${req.id}')" style="font-weight: 700; color: #18217E; border-color: #18217E;">
              Submit Counter-Route &amp; Revised ETA &rarr;
            </button>
          </div>
        </div>

        <!-- Section 3: Confirm Route Execution -->
        <div style="border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; background: #F0FDF4; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-weight: 700; color: #166534; font-size: 12.5px;">3. Confirm Re-route Execution</div>
            <div style="font-size: 11.5px; color: #15803D;">Transmit operational confirmation that driver has engaged the detour corridor.</div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.confirmExecution('${req.id}')" style="font-weight: 700; background: #059669; border-color: #059669;">
            ✓ Confirm Execution in Transit
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px solid #E5EBEE; padding-top: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `);
  },

  submitRerouteResponse(requestId, decision) {
    const reasonEl = document.getElementById('reroute-reason');
    const reason = reasonEl ? reasonEl.value : '';

    try {
      window.BRIDGES_STORE.respondToReroute(requestId, decision, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Proposed re-route ${decision.toLowerCase()} successfully.`, decision === 'Accepted' ? 'success' : 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  submitCounterProposal(requestId) {
    const routeEl = document.getElementById('counter-route');
    const etaEl = document.getElementById('counter-eta');
    const notesEl = document.getElementById('counter-notes');

    const revisedRoute = routeEl ? routeEl.value.trim() : '';
    const revisedEta = etaEl ? etaEl.value.trim() : '';
    const operationalNotes = notesEl ? notesEl.value.trim() : '';

    if (!revisedRoute) {
      UI.showToast("Revised detour route corridor is required.", 'error');
      if (routeEl) routeEl.focus();
      return;
    }
    if (!revisedEta) {
      UI.showToast("Revised confirmed ETA is required.", 'error');
      if (etaEl) etaEl.focus();
      return;
    }

    try {
      window.BRIDGES_STORE.submitRerouteCounterProposal(requestId, {
        revisedRoute,
        revisedEta,
        operationalNotes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Counter-route and revised ETA submitted. Control tower updated.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  confirmExecution(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    try {
      req.responseStatus = 'In Progress';
      req.rerouteExecutionConfirmed = true;
      req.rerouteExecutionConfirmedAt = new Date().toISOString();

      const shipment = store.getShipment(req.shipmentId);
      if (shipment) {
        shipment.status = 'In Transit';
        if (!shipment.milestones) shipment.milestones = [];
        shipment.milestones.push({
          milestone: "Departed",
          timestamp: new Date().toISOString(),
          location: shipment.currentLocation || "Detour Inception Point",
          notes: `Carrier confirmed detour route execution via ${req.carrierCounterRoute || req.proposedRoute || 'alternative corridor'}.`
        });
      }

      store.logCarrierActivity("Re-route Execution Confirmed", {
        shipmentId: req.shipmentId,
        recoveryRequestId: req.id,
        outcome: `Carrier confirmed active re-route execution in transit.`
      });

      store.save();
      UI.closeModal('generic-app-modal');
      UI.showToast(`Re-route execution confirmed. Live telematics now tracking detour progress.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- ROUTE PROGRESS CHECKPOINT MODAL (US-74) ---
  openRouteProgressModal(shipmentId) {
    if (!shipmentId) {
      const store = window.BRIDGES_STORE;
      const first = store.getCarrierShipments().find(s => s.status !== 'Delivered');
      if (first) shipmentId = first.id;
    }
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    if (!s) {
      UI.showToast("No active shipment found for route progress update.", 'warning');
      return;
    }

    UI.openModal('generic-app-modal', `Send Route-Progress Update &bull; ${s.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 2px;">Live Route-Progress Telemetry Dispatch</div>
          <div style="color: #15803D;">
            Broadcast real-time waypoint, mile marker, speed, and detour clearance status to the Control Tower and customer portal.
          </div>
        </div>

        <form id="carrier-route-prog-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitRouteProgress('${s.id}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="prog-chk">Current Checkpoint / Waypoint Name: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="prog-chk" class="carrier-form-input" placeholder="e.g. Exit 84 Junction, Abilene Hub" value="${s.currentLocation || ''}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="prog-mm">Highway Mile Marker:</label>
              <input type="text" id="prog-mm" class="carrier-form-input" placeholder="e.g. MM 184.2">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="prog-speed">Average Corridor Speed (mph):</label>
              <input type="number" id="prog-speed" class="carrier-form-input" placeholder="e.g. 58" value="${s.currentSpeed || 55}">
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="prog-status">Route Status Update: <span style="color: #EA341F;">*</span></label>
              <select id="prog-status" class="carrier-form-select" required>
                <option value="On Detour Route">On Detour Route (Active)</option>
                <option value="Congestion Bypassed">Congestion Bypassed Successfully</option>
                <option value="Approaching Re-merge Point">Approaching Re-merge Point</option>
                <option value="Re-entered Main Interstate Corridor">Re-entered Main Interstate Corridor</option>
                <option value="Cruising at Speed">Cruising at Speed (Clear Road)</option>
                <option value="Minor Traffic Slowdown">Minor Traffic Slowdown</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group" style="margin-bottom: 12px;">
            <label class="carrier-form-label" for="prog-notes">Operational Notes &amp; Driver Observations:</label>
            <textarea id="prog-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Detour bypassed accident backlog smoothly. Cargo temperature verified +4.0°C."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #059669; border-color: #059669;">
              Transmit Progress Update &rarr;
            </button>
          </div>
        </form>
      </div>
    `);
  },

  submitRouteProgress(shipmentId) {
    const checkpointName = document.getElementById('prog-chk')?.value;
    const mileMarker = document.getElementById('prog-mm')?.value;
    const speed = document.getElementById('prog-speed')?.value;
    const statusUpdate = document.getElementById('prog-status')?.value;
    const operationalNotes = document.getElementById('prog-notes')?.value;

    try {
      window.BRIDGES_STORE.sendRouteProgressUpdate(shipmentId, {
        checkpointName,
        mileMarker,
        speed,
        statusUpdate,
        operationalNotes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Route progress update transmitted. Location updated to ${checkpointName}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Expedite Review Modal (US-75) ---
  openExpediteReviewModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    UI.openModal('generic-app-modal', `Expedite Request Decision — ${req.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #FFF1F0; border: 1px solid #FCA5A5; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #EA341F; margin-bottom: 4px;">Expedited Transit Service Requirement (US-75)</div>
          <div><strong>Requested Urgency:</strong> ${req.expediteUrgency || 'Dedicated Team Driver Hot-shot'}</div>
          <div><strong>Reason for Expedite:</strong> ${req.reasonForRecovery}</div>
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="expedite-eta">Carrier Achievable ETA (If Accepting):</label>
          <input type="text" id="expedite-eta" class="carrier-form-input" placeholder="e.g. Delivery committed by 11:30 AM" value="${req.expediteUrgency || ''}">
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="expedite-reason">Rejection Reason (Mandatory only if declining):</label>
          <textarea id="expedite-reason" class="carrier-form-textarea" rows="2" placeholder="Required only if rejecting expedite..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="CarrierExecutionView.submitExpediteResponse('${req.id}', 'Rejected')">
            Reject Expedite
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.submitExpediteResponse('${req.id}', 'Accepted')" style="font-weight: 700; background: #EA341F; border-color: #EA341F;">
            Accept &amp; Commit Expedite
          </button>
        </div>
      </div>
    `);
  },

  submitExpediteResponse(requestId, decision) {
    const reasonEl = document.getElementById('expedite-reason');
    const etaEl = document.getElementById('expedite-eta');
    const reason = reasonEl ? reasonEl.value : '';
    const eta = etaEl ? etaEl.value : '';

    try {
      window.BRIDGES_STORE.respondToExpedite(requestId, decision, reason, eta);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Expedite request ${decision.toLowerCase()} successfully.`, decision === 'Accepted' ? 'success' : 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- Split Review Modal (US-76, US-77) ---
  openSplitReviewModal(requestId) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const p1 = req.splitDetails?.portion1 || { weight: '18.0T', cargo: 'Core Powertrain Assemblies', destination: 'Assembly Facility Alpha' };
    const p2 = req.splitDetails?.portion2 || { weight: '14.0T', cargo: 'Secondary Mounting Brackets', destination: 'Assembly Facility Beta' };

    UI.openModal('generic-app-modal', `Split Shipment Allocation Review &bull; ${req.id}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #424989; font-size: 13px; margin-bottom: 4px;">Split Shipment Allocation &amp; Portion Manifest (US-76 &amp; US-77)</div>
          <div>Original Shipment: <strong>${req.shipmentId}</strong> &bull; Reason: <strong>${req.reasonForRecovery || 'Facility capacity constraints'}</strong></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div style="background: white; border: 1px solid #DDD6FE; border-radius: 6px; padding: 12px;">
            <span class="badge" style="background: #EDE9FE; color: #424989; font-weight: 700;">Portion 1 (P1)</span>
            <div style="font-weight: 700; color: #070724; font-size: 12.5px; margin: 4px 0;">${p1.cargo || 'Core Assemblies'}</div>
            <div style="font-size: 11.5px; color: #393A50; line-height: 1.5;">
              <div>Weight: <strong>${p1.weight || '18.0T'}</strong></div>
              <div>Destination: <strong>${p1.destination || 'Primary Plant'}</strong></div>
              <div>Est Delivery: <strong>${p1.revisedEta || '15:30 EST'}</strong></div>
            </div>
          </div>

          <div style="background: white; border: 1px solid #DDD6FE; border-radius: 6px; padding: 12px;">
            <span class="badge" style="background: #EDE9FE; color: #424989; font-weight: 700;">Portion 2 (P2)</span>
            <div style="font-weight: 700; color: #070724; font-size: 12.5px; margin: 4px 0;">${p2.cargo || 'Secondary Components'}</div>
            <div style="font-size: 11.5px; color: #393A50; line-height: 1.5;">
              <div>Weight: <strong>${p2.weight || '14.0T'}</strong></div>
              <div>Destination: <strong>${p2.destination || 'Secondary Depot'}</strong></div>
              <div>Est Delivery: <strong>${p2.revisedEta || '17:00 EST'}</strong></div>
            </div>
          </div>
        </div>

        <div class="carrier-form-group">
          <label class="carrier-form-label" for="split-reason">Rejection Reason (Mandatory only if declining):</label>
          <textarea id="split-reason" class="carrier-form-textarea" rows="2" placeholder="Required only if declining split..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="CarrierExecutionView.submitSplitResponse('${req.id}', 'Rejected')">
            Reject Split Proposal
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.submitSplitResponse('${req.id}', 'Accepted')" style="font-weight: 700; background: #424989; border-color: #424989;">
            Accept Split &amp; Allocate Portions
          </button>
        </div>
      </div>
    `);
  },

  submitSplitResponse(requestId, decision) {
    const reasonEl = document.getElementById('split-reason');
    const reason = reasonEl ? reasonEl.value : '';

    try {
      window.BRIDGES_STORE.respondToSplit(requestId, decision, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Split shipment proposal ${decision.toLowerCase()} successfully.`, decision === 'Accepted' ? 'success' : 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- SPLIT PORTION: ASSIGN FLEET MODAL ---
  openAssignSplitPortionModal(requestId, portionKey) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const portion = req.splitDetails?.[portionKey] || {};
    const availableVehicles = store.getCarrierVehicles().filter(v => v.status === 'Available' || v.currentAssignment === `${req.id}-${portionKey}`);
    const availableDrivers = store.getCarrierDrivers().filter(d => d.status === 'Available' || d.currentAssignment === `${req.id}-${portionKey}`);

    const now = new Date();
    const pickupDefault = new Date(now.getTime() + 20 * 60000).toISOString().slice(0, 16);
    const deliveryDefault = new Date(now.getTime() + 3 * 3600000).toISOString().slice(0, 16);
    const portionLabel = portionKey === 'portion1' ? 'Portion 1 (P1)' : 'Portion 2 (P2)';

    UI.openModal('generic-app-modal', `Assign Dedicated Fleet &bull; ${portionLabel}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #424989;">Cargo: ${portion.cargo || 'Assemblies'} &bull; Weight: ${portion.weight || '16T'}</div>
          <div style="color: #64748B;">Destination: <strong>${portion.destination || 'Facility Destination'}</strong></div>
        </div>

        <form id="carrier-split-assign-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitAssignSplitPortion('${req.id}', '${portionKey}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="split-v">Select Vehicle for ${portionLabel}: <span style="color: #EA341F;">*</span></label>
              <select id="split-v" class="carrier-form-select" required>
                <option value="">Choose vehicle...</option>
                ${availableVehicles.map(v => `
                  <option value="${v.id}" ${portion.assignedVehicleId === v.id ? 'selected' : ''}>
                    ${v.name} (${v.plateNumber})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="split-d">Select Driver for ${portionLabel}: <span style="color: #EA341F;">*</span></label>
              <select id="split-d" class="carrier-form-select" required>
                <option value="">Choose driver...</option>
                ${availableDrivers.map(d => `
                  <option value="${d.id}" ${portion.assignedDriverId === d.id ? 'selected' : ''}>
                    ${d.name} (${d.licenseClass || 'CDL-A'})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="split-pickup">Expected Pickup: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="split-pickup" class="carrier-form-input" value="${portion.expectedPickupTime ? portion.expectedPickupTime.slice(0,16) : pickupDefault}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="split-del">Expected Delivery: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="split-del" class="carrier-form-input" value="${portion.expectedDeliveryTime ? portion.expectedDeliveryTime.slice(0,16) : deliveryDefault}" required>
            </div>
          </div>

          <div class="carrier-form-group" style="margin-bottom: 12px;">
            <label class="carrier-form-label" for="split-notes">Portion Operational Notes:</label>
            <textarea id="split-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Trailer loaded and sealed. Driver instructed on portion route.">${portion.notes || ''}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #424989; border-color: #424989;">
              Assign ${portionLabel} Fleet
            </button>
          </div>
        </form>
      </div>
    `);
  },

  submitAssignSplitPortion(requestId, portionKey) {
    const vehicleId = document.getElementById('split-v')?.value;
    const driverId = document.getElementById('split-d')?.value;
    const expectedPickupTime = document.getElementById('split-pickup')?.value;
    const expectedDeliveryTime = document.getElementById('split-del')?.value;
    const notes = document.getElementById('split-notes')?.value;

    try {
      window.BRIDGES_STORE.assignSplitPortionResources(requestId, portionKey, {
        vehicleId,
        driverId,
        expectedPickupTime,
        expectedDeliveryTime,
        notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Fleet resources assigned to ${portionKey.toUpperCase()}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- SPLIT PORTION: CONFIRM DISPATCH MODAL ---
  openDispatchSplitPortionModal(requestId, portionKey) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const portion = req.splitDetails?.[portionKey] || {};
    const portionLabel = portionKey === 'portion1' ? 'Portion 1 (P1)' : 'Portion 2 (P2)';

    UI.openModal('generic-app-modal', `Confirm Dispatch &bull; ${portionLabel}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">Depart ${portionLabel}</div>
          <div style="color: #15803D;">
            Vehicle: <strong>${portion.assignedVehicleName}</strong> &bull; Driver: <strong>${portion.assignedDriverName}</strong>
            <br>Destination: <strong>${portion.destination}</strong>
          </div>
        </div>

        <div class="carrier-form-group" style="margin-bottom: 14px;">
          <label class="carrier-form-label" for="split-dispatch-notes">Dispatch Notes (Optional):</label>
          <textarea id="split-dispatch-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Unit rolled out from Dallas Regional Depot. Odometer logged."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="CarrierExecutionView.submitDispatchSplitPortion('${req.id}', '${portionKey}')" style="font-weight: 700; background: #18217E;">
            Authorize &amp; Dispatch ${portionLabel} &rarr;
          </button>
        </div>
      </div>
    `);
  },

  submitDispatchSplitPortion(requestId, portionKey) {
    const notesEl = document.getElementById('split-dispatch-notes');
    const notes = notesEl ? notesEl.value : '';

    try {
      window.BRIDGES_STORE.dispatchSplitPortion(requestId, portionKey, notes);
      UI.closeModal('generic-app-modal');
      UI.showToast(`${portionKey.toUpperCase()} dispatched into transit.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- SPLIT PORTION: UPDATE STATUS & ETA MODAL ---
  openUpdateSplitPortionModal(requestId, portionKey) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const portion = req.splitDetails?.[portionKey] || {};
    const portionLabel = portionKey === 'portion1' ? 'Portion 1 (P1)' : 'Portion 2 (P2)';

    UI.openModal('generic-app-modal', `Update Status &amp; ETA &bull; ${portionLabel}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F8FAFD; border: 1px solid #C7D2FE; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 12px;">
          <div>Portion: <strong>${portionLabel}</strong> &bull; Vehicle: <strong>${portion.assignedVehicleName}</strong></div>
          <div>Current Status: <strong>${portion.status || 'In Transit'}</strong> &bull; Destination: <strong>${portion.destination}</strong></div>
        </div>

        <form id="carrier-split-update-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitUpdateSplitPortion('${req.id}', '${portionKey}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="sp-status">Operational Status: <span style="color: #EA341F;">*</span></label>
              <select id="sp-status" class="carrier-form-select" required>
                <option value="In Transit" ${portion.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                <option value="Approaching Destination" ${portion.status === 'Approaching Destination' ? 'selected' : ''}>Approaching Destination</option>
                <option value="At Receiving Dock" ${portion.status === 'At Receiving Dock' ? 'selected' : ''}>At Receiving Dock</option>
                <option value="Delayed" ${portion.status === 'Delayed' ? 'selected' : ''}>Delayed</option>
              </select>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="sp-eta">Confirmed Portion ETA: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="sp-eta" class="carrier-form-input" value="${portion.revisedEta || portion.expectedDeliveryTime || '16:00 EST'}" required>
            </div>
          </div>

          <div class="carrier-form-group" style="margin-bottom: 12px;">
            <label class="carrier-form-label" for="sp-loc">Current Geolocation / Checkpoint:</label>
            <input type="text" id="sp-loc" class="carrier-form-input" placeholder="e.g. Highway 281 MP 64" value="${portion.currentLocation || ''}">
          </div>

          <div class="carrier-form-group" style="margin-bottom: 12px;">
            <label class="carrier-form-label" for="sp-notes">Progress Remarks:</label>
            <textarea id="sp-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Unit moving at posted limit. No delays."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #18217E;">
              Update ${portionLabel} Progress &rarr;
            </button>
          </div>
        </form>
      </div>
    `);
  },

  submitUpdateSplitPortion(requestId, portionKey) {
    const status = document.getElementById('sp-status')?.value;
    const revisedEta = document.getElementById('sp-eta')?.value;
    const location = document.getElementById('sp-loc')?.value;
    const notes = document.getElementById('sp-notes')?.value;

    try {
      window.BRIDGES_STORE.updateSplitPortionStatus(requestId, portionKey, {
        status,
        revisedEta,
        location,
        notes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Updated status & ETA for ${portionKey.toUpperCase()}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- SPLIT PORTION: CONFIRM DELIVERY & POD MODAL ---
  openConfirmSplitPortionDeliveryModal(requestId, portionKey) {
    const store = window.BRIDGES_STORE;
    const req = store.getRecoveryRequest(requestId);
    if (!req) return;

    const portion = req.splitDetails?.[portionKey] || {};
    const portionLabel = portionKey === 'portion1' ? 'Portion 1 (P1)' : 'Portion 2 (P2)';
    const nowIso = new Date().toISOString().slice(0, 16);

    UI.openModal('generic-app-modal', `Confirm Delivery &bull; ${portionLabel}`, `
      <div style="padding: 6px 0;">
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 2px;">POD Receipt &bull; ${portionLabel}</div>
          <div style="color: #15803D;">
            Destination Dock: <strong>${portion.destination}</strong> &bull; Cargo: <strong>${portion.cargo} (${portion.weight})</strong>
          </div>
        </div>

        <form id="carrier-split-pod-form" onsubmit="event.preventDefault(); CarrierExecutionView.submitConfirmSplitPortionDelivery('${req.id}', '${portionKey}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="spod-time">Actual Delivery Time: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="spod-time" class="carrier-form-input" value="${nowIso}" required>
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="spod-recip">Recipient Signatory Name: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="spod-recip" class="carrier-form-input" placeholder="e.g. Dock Receiving Supervisor" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="spod-ref">BOL / Signature Reference:</label>
              <input type="text" id="spod-ref" class="carrier-form-input" value="BOL-SPLIT-${Math.floor(10000 + Math.random() * 90000)}">
            </div>
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="spod-outcome">Delivery Outcome:</label>
              <select id="spod-outcome" class="carrier-form-select">
                <option value="Successful Delivery">Successful Delivery (100% Intact)</option>
                <option value="Partial Delivery">Partial Delivery</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group" style="margin-bottom: 12px;">
            <label class="carrier-form-label" for="spod-notes">Delivery Remarks &amp; Cargo Sign-off Notes: <span style="color: #EA341F;">*</span></label>
            <textarea id="spod-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. Portion received intact. Receiving dock inspection passed." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #059669; border-color: #059669;">
              Confirm Delivery &amp; Record POD &rarr;
            </button>
          </div>
        </form>
      </div>
    `);
  },

  submitConfirmSplitPortionDelivery(requestId, portionKey) {
    const actualDeliveryTime = document.getElementById('spod-time')?.value;
    const recipientName = document.getElementById('spod-recip')?.value;
    const signatureRef = document.getElementById('spod-ref')?.value;
    const outcome = document.getElementById('spod-outcome')?.value;
    const deliveryNotes = document.getElementById('spod-notes')?.value;

    try {
      window.BRIDGES_STORE.confirmSplitPortionDelivery(requestId, portionKey, {
        actualDeliveryTime,
        recipientName,
        signatureRef,
        outcome,
        deliveryNotes,
        podFileName: `Signed_POD_${portionKey.toUpperCase()}.pdf`
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Delivery confirmed for ${portionKey.toUpperCase()}. Vehicle and driver released.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openDisruptionModal(shipmentId, recoveryRequestId) {
    CarrierDisruptionsView.openReportModal(shipmentId, recoveryRequestId);
  }
};

window.CarrierExecutionView = CarrierExecutionView;
