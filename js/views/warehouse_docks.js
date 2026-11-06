/**
 * BRIDGES Control Tower - Dock Schedule View
 * Phase 5: Complete dock bay management and appointment scheduling
 * Time-grid and compact table views, dock capability matching, conflict detection, and arrival/release tracking.
 */

window.WarehouseDocksView = {
  state: {
    viewMode: 'grid', // 'grid' or 'table'
    selectedStatus: 'ALL',
    selectedType: 'ALL'
  },

  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const docks = store.getWarehouseDocks(whId);
    const appointments = store.data.dockAppointments || [];
    const etaAlerts = store.getEtaChangeAlerts(whId);

    // Filter docks if needed
    let filteredDocks = docks;
    if (this.state.selectedStatus !== 'ALL') {
      filteredDocks = filteredDocks.filter(d => d.status === this.state.selectedStatus);
    }
    if (this.state.selectedType !== 'ALL') {
      filteredDocks = filteredDocks.filter(d => d.type === this.state.selectedType);
    }

    const occupiedCount = docks.filter(d => d.status === 'Occupied').length;
    const availableCount = docks.filter(d => d.status === 'Available').length;
    const maintCount = docks.filter(d => d.status === 'Maintenance').length;

    return `
      <div class="warehouse-view-container animate-fade-in">
        <!-- HEADER & TOP ACTIONS -->
        <div class="warehouse-view-header">
          <div class="warehouse-view-title-group">
            <h2 class="warehouse-view-heading">Dock Schedule &amp; Bay Utilization</h2>
            <p class="warehouse-view-subheading">
              Manage physical bays, schedule appointments, review carrier ETA-change alerts, and coordinate live arrivals for ${warehouse.name}
            </p>
          </div>
          <div class="warehouse-view-actions">
            <!-- VIEW MODE TOGGLE -->
            <div class="view-mode-btn-group">
              <button 
                class="btn btn-xs ${this.state.viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}" 
                onclick="WarehouseDocksView.setViewMode('grid')"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Grid View
              </button>
              <button 
                class="btn btn-xs ${this.state.viewMode === 'table' ? 'btn-primary' : 'btn-outline'}" 
                onclick="WarehouseDocksView.setViewMode('table')"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Table View
              </button>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="WarehouseDocksView.openAdjustScheduleModal()">
              Adjust Dock Schedule
            </button>
            <button class="btn btn-secondary btn-sm" onclick="WarehouseDocksView.openCapacityModal()">
              Escalate Capacity
            </button>
            <button class="btn btn-primary btn-sm" onclick="WarehouseDocksView.openAssignModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Schedule Dock Appointment
            </button>
          </div>
        </div>

        <!-- ETA-CHANGE ALERTS & REVISED DOCK SLOTS PANEL (Requirement 2) -->
        ${etaAlerts.length > 0 ? `
          <div class="warehouse-eta-alerts-container" style="background: #FFFFFF; border: 1px solid #E5EBEE; border-left: 4px solid #EA341F; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-critical" style="font-size: 11px;">⚠️ LIVE ETA-CHANGE ALERTS (${etaAlerts.filter(a => a.status === 'Pending Response').length} Pending Response)</span>
                <span style="font-size: 12px; color: #393A50;">Carrier revised arrival times requiring dock schedule response</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${etaAlerts.map(alt => {
                const isPending = alt.status === 'Pending Response';
                const origTime = new Date(alt.originalETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const revTime = new Date(alt.revisedETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #F8FAFD; border: 1px solid #E5EBEE; border-radius: 6px; padding: 10px 14px; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="font-mono font-bold" style="color: #18217E; font-size: 13px;">${alt.shipmentId}</span>
                        <span class="badge ${isPending ? 'badge-warning' : (alt.status === 'Slot Accepted' ? 'badge-ready' : 'badge-subtle')}">${alt.status}</span>
                        <span class="text-xs" style="color: #EA341F; font-weight: 700;">+${alt.delayMinutes}m Delayed</span>
                      </div>
                      <div style="font-size: 12px; color: #070724; margin-top: 3px;">
                        Carrier: <strong>${alt.carrierName}</strong> (Driver: ${alt.driverName || 'Ethan Cole'}, Vehicle: ${alt.vehiclePlate}) &bull; Current Dock: <strong>${alt.currentDockId}</strong>
                      </div>
                      <div class="text-xs text-muted" style="margin-top: 2px;">
                        Planned ETA: <span class="font-mono">${origTime}</span> &rarr; Revised Carrier ETA: <strong class="font-mono" style="color: #EA341F;">${revTime}</strong>. 
                        Reason: <em>${alt.reason}</em>
                      </div>
                      <div style="font-size: 11.5px; color: #18217E; font-weight: 600; margin-top: 3px;">
                        Proposed Revised Slot: <strong>${alt.proposedDockSlot}</strong> at ${alt.currentDockId}
                      </div>
                    </div>

                    <div style="display: flex; gap: 6px; align-items: center;">
                      ${isPending ? `
                        <button class="btn btn-primary btn-xs" onclick="WarehouseDocksView.handleAcceptRevisedSlot('${alt.id}')" title="Accept revised slot and adjust bay schedule">
                          Accept Revised Slot
                        </button>
                        <button class="btn btn-outline btn-xs text-danger" onclick="WarehouseDocksView.openRejectSlotModal('${alt.id}')" title="Reject revised slot with reason & propose alternate">
                          Reject &amp; Propose Alternate
                        </button>
                        <button class="btn btn-secondary btn-xs" onclick="WarehouseDocksView.handleAcknowledgeAlert('${alt.id}')">
                          Acknowledge
                        </button>
                      ` : `
                        <span class="text-xs text-muted"><strong>Response:</strong> ${alt.supervisorResponse || alt.status}</span>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- QUICK DOCK STATUS METRICS STRIP -->
        <div class="dock-summary-strip">
          <div class="dss-item">
            <span class="dss-label">Total Bays</span>
            <span class="dss-val">${docks.length}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Available</span>
            <span class="dss-val" style="color: #424989;">${availableCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Occupied</span>
            <span class="dss-val" style="color: #18217E;">${occupiedCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Maintenance</span>
            <span class="dss-val" style="color: #8C2527;">${maintCount}</span>
          </div>
          <div class="dss-item">
            <span class="dss-label">Active Appointments</span>
            <span class="dss-val">${appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length}</span>
          </div>
        </div>

        <!-- FILTER TOOLBAR -->
        <div class="warehouse-filter-panel" style="margin-top: 14px;">
          <div class="warehouse-filter-row">
            <div class="warehouse-filter-group">
              <label>Bay Status:</label>
              <select onchange="WarehouseDocksView.setFilter('selectedStatus', this.value)">
                <option value="ALL" ${this.state.selectedStatus === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="Available" ${this.state.selectedStatus === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Occupied" ${this.state.selectedStatus === 'Occupied' ? 'selected' : ''}>Occupied</option>
                <option value="Maintenance" ${this.state.selectedStatus === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              </select>
            </div>
            <div class="warehouse-filter-group">
              <label>Capability / Type:</label>
              <select onchange="WarehouseDocksView.setFilter('selectedType', this.value)">
                <option value="ALL" ${this.state.selectedType === 'ALL' ? 'selected' : ''}>All Capabilities</option>
                <option value="Standard Cross-Dock" ${this.state.selectedType === 'Standard Cross-Dock' ? 'selected' : ''}>Standard Cross-Dock</option>
                <option value="Heavy Freight" ${this.state.selectedType === 'Heavy Freight' ? 'selected' : ''}>Heavy Freight</option>
                <option value="Cold-Chain Reefer" ${this.state.selectedType === 'Cold-Chain Reefer' ? 'selected' : ''}>Cold-Chain Reefer</option>
                <option value="Inbound Receiving" ${this.state.selectedType === 'Inbound Receiving' ? 'selected' : ''}>Inbound Receiving</option>
                <option value="Hazardous Materials" ${this.state.selectedType === 'Hazardous Materials' ? 'selected' : ''}>Hazardous Materials</option>
              </select>
            </div>
          </div>
        </div>

        <!-- MAIN VIEW: GRID OR TABLE -->
        ${this.state.viewMode === 'grid' ? this.renderGridView(filteredDocks, appointments) : this.renderTableView(filteredDocks, appointments)}
      </div>
    `;
  },

  renderGridView(docks, appointments) {
    return `
      <div class="dock-grid-full">
        ${docks.map(dock => {
          const appts = appointments.filter(a => a.dockId === dock.id);
          const currentAppt = appts.find(a => (a.appointmentStatus || a.status) === 'In Progress' || (a.appointmentStatus || a.status) === 'Arrived' || (a.appointmentStatus || a.status) === 'Occupied') || appts[0];
          const isOcc = dock.status === 'Occupied';
          const isMaint = dock.status === 'Maintenance';
          const statusClass = isOcc ? 'dock-box-occ' : (isMaint ? 'dock-box-maint' : 'dock-box-avail');

          return `
            <div class="dock-box ${statusClass}">
              <!-- TOP DOCK TITLE -->
              <div class="dock-box-top">
                <div>
                  <span class="dock-box-id">${dock.id}</span>
                  <div class="dock-box-type">${dock.type}</div>
                </div>
                <span class="badge ${isOcc ? 'badge-inbound' : (isMaint ? 'badge-critical' : 'badge-ready')}">
                  ${dock.status}
                </span>
              </div>

              <!-- MIDDLE INFO: CURRENT SHIPMENT OR EMPTY -->
              <div class="dock-box-body">
                ${dock.currentShipmentId ? `
                  <div class="dock-shipment-active">
                    <div class="dsa-label">Assigned Shipment</div>
                    <div class="dsa-id font-mono font-bold" onclick="WarehouseShipmentsView.openDetailModal('${dock.currentShipmentId}')">
                      ${dock.currentShipmentId}
                    </div>
                    <div class="dsa-carrier text-truncate">${dock.carrier || 'Carrier'} &bull; ${dock.vehicle || 'Vehicle'}</div>
                    <div class="dsa-slot font-mono text-xs text-muted">Slot: ${dock.timeSlot || 'Active'}</div>
                  </div>
                ` : `
                  <div class="dock-empty-notice">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>Bay Available</span>
                  </div>
                `}
              </div>

              <!-- APPOINTMENTS LIST FOR THIS DOCK -->
              <div class="dock-box-appts">
                <div class="dba-title">Scheduled Slots (${appts.length})</div>
                ${appts.length === 0 ? `
                  <div class="text-xs text-muted">No scheduled appointments.</div>
                ` : appts.map(a => {
                  const aStat = a.appointmentStatus || a.status || 'Scheduled';
                  const statBadge = aStat === 'Arrived' ? 'badge-inbound' : (aStat === 'Scheduled' ? 'badge-subtle' : 'badge-ready');
                  return `
                    <div class="appt-mini-row">
                      <span class="font-mono text-xs">${a.timeSlot}</span>
                      <span class="font-bold text-xs" style="color: #18217E;">${a.shipmentId}</span>
                      <span class="badge badge-xs ${statBadge}">${aStat}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- ACTION BUTTONS -->
              <div class="dock-box-actions">
                ${isOcc ? `
                  <button class="btn btn-outline btn-xs" onclick="WarehouseDocksView.releaseDock('${dock.id}')">Release Bay</button>
                  <button class="btn btn-secondary btn-xs" onclick="WarehouseDocksView.openRescheduleModal('${currentAppt ? currentAppt.id : ''}', '${dock.id}', '${dock.currentShipmentId}')">Reschedule</button>
                ` : (isMaint ? `
                  <button class="btn btn-secondary btn-xs" onclick="WarehouseDocksView.updateDockStatus('${dock.id}', 'Available')">End Maintenance</button>
                ` : `
                  <button class="btn btn-primary btn-xs" onclick="WarehouseDocksView.openAssignModal('${dock.id}')">Assign Shipment</button>
                  <button class="btn btn-outline btn-xs" onclick="WarehouseDocksView.updateDockStatus('${dock.id}', 'Maintenance')">Maintenance</button>
                `)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderTableView(docks, appointments) {
    const store = window.BRIDGES_STORE;
    return `
      <div class="warehouse-card">
        <div class="warehouse-table-responsive">
          <table class="warehouse-table">
            <thead>
              <tr>
                <th>Dock Bay</th>
                <th>Capability / Type</th>
                <th>Time Slot</th>
                <th>Assigned Shipment</th>
                <th>Direction</th>
                <th>Carrier & Vehicle</th>
                <th>Appointment Status</th>
                <th>Readiness</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${docks.map(d => {
                const appt = appointments.find(a => a.dockId === d.id && a.status !== 'Completed');
                const shipmentId = d.currentShipmentId || (appt ? appt.shipmentId : null);
                const s = shipmentId ? (store.data.shipments || []).find(x => x.id === shipmentId) : null;
                const readiness = shipmentId ? store.getWarehouseReadiness(shipmentId) : null;
                const rStatus = readiness ? readiness.overallStatus : 'N/A';

                return `
                  <tr>
                    <td class="font-mono font-bold" style="color: #18217E;">${d.id}</td>
                    <td><span class="badge badge-dock">${d.type}</span></td>
                    <td class="font-mono text-xs">${d.timeSlot || (appt ? appt.timeSlot : 'Open')}</td>
                    <td>
                      ${shipmentId ? `
                        <a href="javascript:void(0)" onclick="WarehouseShipmentsView.openDetailModal('${shipmentId}')" class="font-mono font-bold" style="color: #18217E;">
                          ${shipmentId}
                        </a>
                      ` : `<span class="text-muted text-xs">Unassigned</span>`}
                    </td>
                    <td>
                      ${s ? `<span class="badge ${s.direction === 'Inbound' ? 'badge-inbound' : 'badge-outbound'}">${s.direction}</span>` : '-'}
                    </td>
                    <td>
                      <div class="cell-primary">${d.carrier || (s ? s.carrierName : 'None')}</div>
                      <div class="cell-sub font-mono">${d.vehicle || (s ? s.vehiclePlate : '')}</div>
                    </td>
                    <td>
                      <span class="badge ${d.status === 'Occupied' ? 'badge-inbound' : (d.status === 'Maintenance' ? 'badge-critical' : 'badge-ready')}">
                        ${d.status}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${rStatus === 'Ready' ? 'badge-ready' : (rStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress')}">
                        ${rStatus}
                      </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      ${d.status === 'Occupied' ? `
                        <button class="btn btn-outline btn-xs" onclick="WarehouseDocksView.releaseDock('${d.id}')">Release</button>
                      ` : `
                        <button class="btn btn-primary btn-xs" onclick="WarehouseDocksView.openAssignModal('${d.id}')">Schedule</button>
                      `}
                      ${appt ? `
                        <button class="btn btn-secondary btn-xs" onclick="WarehouseDocksView.recordArrival('${appt.id}', '${d.id}')">Arrival</button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  setViewMode(mode) {
    this.state.viewMode = mode;
    App.renderCurrentView();
  },

  setFilter(prop, val) {
    this.state[prop] = val;
    App.renderCurrentView();
  },

  openAssignModal(preselectedDockId) {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const docks = store.getWarehouseDocks(whId);
    const shipments = store.getWarehouseShipments(whId);

    const modalTitle = `Schedule Dock Bay Appointment`;
    const modalBody = `
      <form id="schedule-dock-form" onsubmit="WarehouseDocksView.handleAssignDock(event)">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Select Shipment <span class="text-danger">*</span></label>
          <select id="assign-shipment-select" class="form-control" required onchange="WarehouseDocksView.onShipmentSelectChange(this.value)">
            <option value="">-- Choose Shipment --</option>
            ${shipments.map(s => `
              <option value="${s.id}">
                ${s.id} (${s.direction}) - ${s.carrierName || 'No Carrier'} - ${s.cargoType || 'Cargo'}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Select Dock Bay <span class="text-danger">*</span></label>
          <select id="assign-dock-select" class="form-control" required>
            <option value="">-- Choose Dock Bay --</option>
            ${docks.map(d => `
              <option value="${d.id}" ${preselectedDockId === d.id ? 'selected' : ''}>
                ${d.id} (${d.type}) — ${d.status}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Time Slot Window <span class="text-danger">*</span></label>
          <select id="assign-slot-select" class="form-control" required>
            <option value="10:00 - 11:30">10:00 - 11:30</option>
            <option value="11:30 - 13:00">11:30 - 13:00</option>
            <option value="13:00 - 14:30">13:00 - 14:30</option>
            <option value="14:30 - 16:00">14:30 - 16:00</option>
            <option value="16:00 - 17:30">16:00 - 17:30</option>
          </select>
        </div>

        <div id="dock-conflict-alert" style="display: none; padding: 8px 12px; background: #FDEDEC; border: 1px solid #EA341F; border-radius: 6px; color: #8C2527; font-size: 12px; margin-bottom: 12px;">
          Conflict detected: This bay already has an active booking for this time slot.
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Scheduling Notes</label>
          <input type="text" id="assign-notes-input" class="form-control" placeholder="Driver ETA, pallet staging requirements, temperature pre-chill...">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Booking</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  onShipmentSelectChange(shipmentId) {
    // Check if cold-chain or heavy freight
    const store = window.BRIDGES_STORE;
    const shipment = (store.data.shipments || []).find(s => s.id === shipmentId);
    const dockSelect = document.getElementById('assign-dock-select');
    if (!shipment || !dockSelect) return;

    if (shipment.cargoType && shipment.cargoType.toLowerCase().includes('cold') || shipment.cargoType && shipment.cargoType.toLowerCase().includes('vaccine') || shipment.cargoType && shipment.cargoType.toLowerCase().includes('culture')) {
      // Suggest Reefer dock
      for (let i = 0; i < dockSelect.options.length; i++) {
        if (dockSelect.options[i].text.includes('Reefer')) {
          dockSelect.selectedIndex = i;
          break;
        }
      }
    }
  },

  handleAssignDock(e) {
    e.preventDefault();
    const shipmentId = document.getElementById('assign-shipment-select').value;
    const dockId = document.getElementById('assign-dock-select').value;
    const timeSlot = document.getElementById('assign-slot-select').value;
    const notes = document.getElementById('assign-notes-input').value;

    try {
      window.BRIDGES_STORE.assignDock({ shipmentId, dockId, timeSlot, notes });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Assigned ${shipmentId} to ${dockId} for slot ${timeSlot}`, "success");
      App.renderCurrentView();
    } catch (err) {
      const conflictEl = document.getElementById('dock-conflict-alert');
      if (conflictEl) {
        conflictEl.textContent = err.message;
        conflictEl.style.display = 'block';
      } else {
        UI.showToast(err.message, "error");
      }
    }
  },

  openRescheduleModal(appointmentId, dockId, shipmentId) {
    const modalTitle = `Reschedule Dock Appointment`;
    const modalBody = `
      <form id="reschedule-form" onsubmit="WarehouseDocksView.handleReschedule(event, '${appointmentId}')">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Current Dock & Shipment</label>
          <input type="text" class="form-control" value="${dockId} &bull; ${shipmentId || 'Appointment'}" disabled>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">New Time Slot <span class="text-danger">*</span></label>
          <select id="resched-slot-select" class="form-control" required>
            <option value="11:30 - 13:00">11:30 - 13:00</option>
            <option value="13:00 - 14:30">13:00 - 14:30</option>
            <option value="14:30 - 16:00">14:30 - 16:00</option>
            <option value="16:00 - 17:30">16:00 - 17:30</option>
            <option value="17:30 - 19:00">17:30 - 19:00</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Mandatory Rescheduling Reason <span class="text-danger">*</span></label>
          <textarea id="resched-reason-input" class="form-control" rows="3" required placeholder="State driver delay, loading bay equipment hold, staging backlog, or carrier ETA revision..."></textarea>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Confirm Reschedule</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleReschedule(e, appointmentId) {
    e.preventDefault();
    const newSlot = document.getElementById('resched-slot-select').value;
    const reason = document.getElementById('resched-reason-input').value.trim();

    if (!reason) {
      UI.showToast("A reason is mandatory when rescheduling an appointment.", "error");
      return;
    }

    try {
      window.BRIDGES_STORE.rescheduleDockAppointment(appointmentId, newSlot, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Rescheduled appointment to ${newSlot}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  recordArrival(appointmentId, dockId) {
    try {
      window.BRIDGES_STORE.updateDockStatus(dockId, 'Occupied');
      const appt = (window.BRIDGES_STORE.data.dockAppointments || []).find(a => a.id === appointmentId);
      if (appt) appt.status = "Arrived";
      UI.showToast(`Recorded arrival at ${dockId}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  releaseDock(dockId) {
    if (!confirm(`Are you sure you want to release ${dockId} back to Available status?`)) return;
    try {
      window.BRIDGES_STORE.releaseDock(dockId);
      UI.showToast(`Released ${dockId}. Bay is now Available.`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  updateDockStatus(dockId, newStatus) {
    try {
      window.BRIDGES_STORE.updateDockStatus(dockId, newStatus);
      UI.showToast(`Updated ${dockId} status to ${newStatus}`, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // =========================================================================
  // Exception Response: Accept / Reject Revised Dock Slots (Requirement 2)
  // =========================================================================
  handleAcceptRevisedSlot(alertId) {
    try {
      window.BRIDGES_STORE.respondToRevisedDockSlot(alertId, 'Accept');
      UI.showToast("Revised dock slot accepted. Schedule and bay updated.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openRejectSlotModal(alertId) {
    const store = window.BRIDGES_STORE;
    const alert = (store.data.etaChangeAlerts || []).find(a => a.id === alertId);
    const docks = store.getWarehouseDocks(store.getCurrentWarehouseId());

    const modalTitle = `Reject Revised Dock Slot & Counter-Propose`;
    const modalBody = `
      <form id="reject-slot-form" onsubmit="WarehouseDocksView.handleRejectSlot(event, '${alertId}')">
        <div style="background: #FDEDEC; border: 1px solid #EA341F; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: #8C2527;">Carrier Delay: ${alert ? alert.delayMinutes : 45} mins</div>
          <div style="font-size: 11.5px; color: #393A50; margin-top: 2px;">
            Proposed Slot: <strong>${alert ? alert.proposedDockSlot : '14:00 - 15:30'}</strong> at <strong>${alert ? alert.currentDockId : 'DOCK-02'}</strong>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Mandatory Rejection Reason <span class="text-danger">*</span></label>
          <textarea id="rej-slot-reason" class="form-control" rows="3" required placeholder="Specify why the proposed slot cannot be accommodated (e.g. Bay occupied by cold-chain pharma transfer, staging line congestion)..."></textarea>
        </div>

        <div class="detail-section-row" style="margin-bottom: 16px;">
          <div class="detail-col">
            <label class="form-label font-bold">Counter-Proposed Bay</label>
            <select id="rej-counter-dock" class="form-control">
              ${docks.map(d => `<option value="${d.id}">${d.id} (${d.type}) — ${d.status}</option>`).join('')}
            </select>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Counter-Proposed Time Window</label>
            <select id="rej-counter-slot" class="form-control">
              <option value="15:30 - 17:00">15:30 - 17:00</option>
              <option value="16:00 - 17:30">16:00 - 17:30</option>
              <option value="17:00 - 18:30">17:00 - 18:30</option>
              <option value="18:00 - 19:30">18:00 - 19:30</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Reject Slot &amp; Notify Dispatcher</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleRejectSlot(e, alertId) {
    e.preventDefault();
    const reason = document.getElementById('rej-slot-reason').value.trim();
    const newDock = document.getElementById('rej-counter-dock').value;
    const newSlot = document.getElementById('rej-counter-slot').value;

    try {
      window.BRIDGES_STORE.respondToRevisedDockSlot(alertId, 'Reject', {
        reason: `${reason} Counter-proposed: ${newDock} (${newSlot}).`,
        newDockId: newDock,
        newSlot: newSlot
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Slot revision rejected. Dispatcher and Carrier alerted.", "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  handleAcknowledgeAlert(alertId) {
    try {
      window.BRIDGES_STORE.acknowledgeEtaAlert(alertId, "Acknowledged by shift supervisor. Dock bay prepped.");
      UI.showToast("ETA Alert acknowledged.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // =========================================================================
  // Adjust Dock Schedule Modal (Requirement 2: Adjust Dock Schedule)
  // =========================================================================
  openAdjustScheduleModal() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const docks = store.getWarehouseDocks(whId);
    const appointments = store.data.dockAppointments || [];

    const modalTitle = `Adjust Facility Dock Schedule`;
    const modalBody = `
      <form id="adjust-schedule-form" onsubmit="WarehouseDocksView.handleSaveScheduleAdjustment(event)">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          Re-sequence or shift active appointments to eliminate bay congestion and accommodate inbound ETA variances.
        </p>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Target Appointment <span class="text-danger">*</span></label>
          <select id="adj-appt-select" class="form-control" required>
            ${appointments.map(a => `
              <option value="${a.id}">
                ${a.shipmentId} &bull; ${a.dockId} (${a.timeSlot}) — ${a.carrierName || 'Carrier'}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">New Dock Bay</label>
            <select id="adj-dock-select" class="form-control" required>
              ${docks.map(d => `<option value="${d.id}">${d.id} (${d.type}) — ${d.status}</option>`).join('')}
            </select>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Adjusted Time Window</label>
            <select id="adj-slot-select" class="form-control" required>
              <option value="11:30 - 13:00">11:30 - 13:00</option>
              <option value="13:00 - 14:30">13:00 - 14:30</option>
              <option value="14:30 - 16:00">14:30 - 16:00</option>
              <option value="16:00 - 17:30">16:00 - 17:30</option>
              <option value="17:30 - 19:00">17:30 - 19:00</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Adjustment Reason <span class="text-danger">*</span></label>
          <input type="text" id="adj-reason-input" class="form-control" required placeholder="e.g. Relocating to Bay 3 to accommodate Reefer pre-chill, shifting 45 mins for inbound delay...">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Schedule Adjustment</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleSaveScheduleAdjustment(e) {
    e.preventDefault();
    const apptId = document.getElementById('adj-appt-select').value;
    const newDock = document.getElementById('adj-dock-select').value;
    const newSlot = document.getElementById('adj-slot-select').value;
    const reason = document.getElementById('adj-reason-input').value.trim();

    try {
      window.BRIDGES_STORE.rescheduleDockAppointment(apptId, newDock, newSlot, new Date().toISOString().split('T')[0], reason);
      UI.closeModal('generic-app-modal');
      UI.showToast("Dock schedule adjusted successfully.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // =========================================================================
  // Escalate Capacity / Readiness Modal (Requirement 2)
  // =========================================================================
  openCapacityModal() {
    const store = window.BRIDGES_STORE;
    const wh = store.getWarehouse(store.getCurrentWarehouseId());

    const modalTitle = `Escalate Facility Capacity or Readiness Bottleneck`;
    const modalBody = `
      <form id="escalate-capacity-form" onsubmit="WarehouseDocksView.handleEscalateCapacity(event)">
        <p class="text-xs text-muted" style="margin-bottom: 12px;">
          Immediately broadcast a facility capacity constraint from ${wh.name} to the Lead Transport Dispatcher and Analyst War Room.
        </p>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Bottleneck Category <span class="text-danger">*</span></label>
          <select id="cap-type-select" class="form-control" required>
            <option value="Cold Room Capacity Saturation (>95%)">Cold Room Capacity Saturation (>95% Full)</option>
            <option value="Dock Bay Congestion / Yard Gate Jam">Dock Bay Congestion / Yard Gate Jam</option>
            <option value="Trailer Staging Area Saturation">Trailer Staging Area Saturation</option>
            <option value="Material Handling Equipment Failure (MHE)">Material Handling Equipment Failure (Forklifts/Cranes)</option>
            <option value="Pre-Chill Temperature Pull-down Delay">Pre-Chill Temperature Pull-down Delay</option>
            <option value="Staffing / Shift Shortage on Inbound Line">Staffing / Shift Shortage on Inbound Line</option>
          </select>
        </div>

        <div class="detail-section-row" style="margin-bottom: 12px;">
          <div class="detail-col">
            <label class="form-label font-bold">Severity Level <span class="text-danger">*</span></label>
            <select id="cap-sev-select" class="form-control" required>
              <option value="Critical" selected>Critical (Immediate dispatch halt / SLA risk)</option>
              <option value="High">High (Impending floor bottleneck)</option>
              <option value="Medium">Medium (Operational advisory)</option>
            </select>
          </div>
          <div class="detail-col">
            <label class="form-label font-bold">Capacity Metric Reading</label>
            <input type="text" id="cap-metric-input" class="form-control" value="Cold Storage: 97.4% Utilized | 6 Trucks in Yard Queue" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label font-bold">Detailed Situation Description <span class="text-danger">*</span></label>
          <textarea id="cap-desc-input" class="form-control" rows="3" required placeholder="Describe the physical congestion, affected bays, and estimated recovery timeframe..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label font-bold">Requested Dispatcher / Tower Mitigation Action <span class="text-danger">*</span></label>
          <input type="text" id="cap-action-input" class="form-control" required value="Hold non-priority inbound dispatches; divert regional freight to Austin hub.">
        </div>

        <div class="modal-footer" style="padding-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-danger btn-sm">Escalate to Control Tower &amp; Dispatcher</button>
        </div>
      </form>
    `;

    document.getElementById('generic-modal-title').textContent = modalTitle;
    document.getElementById('generic-modal-body').innerHTML = modalBody;
    UI.openModal('generic-app-modal');
  },

  handleEscalateCapacity(e) {
    e.preventDefault();
    const type = document.getElementById('cap-type-select').value;
    const sev = document.getElementById('cap-sev-select').value;
    const metric = document.getElementById('cap-metric-input').value.trim();
    const desc = document.getElementById('cap-desc-input').value.trim();
    const action = document.getElementById('cap-action-input').value.trim();

    try {
      window.BRIDGES_STORE.escalateWarehouseCapacity(window.BRIDGES_STORE.getCurrentWarehouseId(), {
        issueType: type,
        severity: sev,
        capacityMetric: metric,
        impactedAreas: "Dock Bays, Yard Gate, Cryo Chamber",
        description: desc,
        mitigationAction: action
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Capacity issue escalated to Control Tower & Dispatcher", "warning");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }
};
