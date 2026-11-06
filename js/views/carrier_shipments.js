/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: My Shipments (US-58, US-59, US-71)
 * Carrier's assigned shipments with strict tenant isolation, status filters, and detail modals
 */

const CarrierShipmentsView = {
  currentStatusFilter: 'all',
  searchQuery: '',

  render() {
    const store = window.BRIDGES_STORE;
    const shipments = store.getCarrierShipments();

    return `
      <div class="carrier-shipments-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">My Assigned Shipments &bull; Fleet Tracking</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Operational oversight of active and completed freight consignments assigned to Bridges Global Logistics (CAR-01).
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('carrier_execution')" style="font-weight: 600;">
              ${Icons.execution(14)} Milestone Execution
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('carrier_delivery')" style="font-weight: 700;">
              ${Icons.delivery(14)} Delivery Confirmations
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <!-- Status Pills -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.currentStatusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierShipmentsView.setStatusFilter('all')">
              All Shipments (${shipments.length})
            </button>
            <button type="button" class="btn btn-sm ${this.currentStatusFilter === 'In Transit' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierShipmentsView.setStatusFilter('In Transit')">
              In Transit (${shipments.filter(s => s.status === 'In Transit').length})
            </button>
            <button type="button" class="btn btn-sm ${this.currentStatusFilter === 'Arrived at Destination' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierShipmentsView.setStatusFilter('Arrived at Destination')">
              Arrived (${shipments.filter(s => s.status === 'Arrived at Destination').length})
            </button>
            <button type="button" class="btn btn-sm ${this.currentStatusFilter === 'Delayed' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierShipmentsView.setStatusFilter('Delayed')">
              Delayed (${shipments.filter(s => s.status === 'Delayed').length})
            </button>
            <button type="button" class="btn btn-sm ${this.currentStatusFilter === 'Delivered' ? 'btn-primary' : 'btn-secondary'}" onclick="CarrierShipmentsView.setStatusFilter('Delivered')">
              Delivered (${shipments.filter(s => s.status === 'Delivered').length})
            </button>
          </div>

          <!-- Search Input -->
          <div style="position: relative; width: 260px;">
            <input type="text" id="carrier-shipments-search" placeholder="Search shipment, driver, vehicle..." value="${this.searchQuery}" oninput="CarrierShipmentsView.handleSearch(this.value)" class="carrier-form-input" style="padding: 6px 10px 6px 28px; font-size: 12px;">
            <span style="position: absolute; left: 9px; top: 7px; color: #8A9995;">${Icons.search(13)}</span>
          </div>
        </div>

        <!-- Shipments Table Container -->
        <div id="carrier-shipments-table-container">
          ${this.renderTableContent()}
        </div>
      </div>
    `;
  },

  setStatusFilter(status) {
    this.currentStatusFilter = status;
    const container = document.getElementById('carrier-shipments-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  handleSearch(q) {
    this.searchQuery = q;
    const container = document.getElementById('carrier-shipments-table-container');
    if (container) container.innerHTML = this.renderTableContent();
  },

  getFilteredShipments() {
    const store = window.BRIDGES_STORE;
    let list = store.getCarrierShipments();

    if (this.currentStatusFilter !== 'all') {
      list = list.filter(s => s.status === this.currentStatusFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(s => 
        s.id.toLowerCase().includes(q) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        (s.destination && s.destination.toLowerCase().includes(q)) ||
        (s.assignedDriver && s.assignedDriver.toLowerCase().includes(q)) ||
        (s.assignedVehicle && s.assignedVehicle.toLowerCase().includes(q)) ||
        (s.currentLocation && s.currentLocation.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTableContent() {
    const shipments = this.getFilteredShipments();

    if (shipments.length === 0) {
      return `
        <div class="carrier-card-section carrier-empty-state" style="padding: 48px 24px;">
          <div class="carrier-empty-icon">${Icons.truck(26)}</div>
          <div class="carrier-empty-title">No Shipments Match Filter</div>
          <p class="carrier-empty-desc">
            No freight movements found for the selected criteria. Try adjusting your status or search terms.
          </p>
        </div>
      `;
    }

    return `
      <div class="carrier-card-section" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
            <thead style="background: #F8FAFB;">
              <tr>
                <th style="padding: 11px 14px;">Shipment ID</th>
                <th>Corridor (Origin &rarr; Dest)</th>
                <th>Assigned Fleet</th>
                <th>Current Location</th>
                <th>Confirmed ETA</th>
                <th>Committed SLA</th>
                <th>Status</th>
                <th style="text-align: right; padding-right: 14px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${shipments.map(s => {
                let statusBadge = 'carrier-badge-in-progress';
                if (s.status === 'Delayed') statusBadge = 'carrier-badge-rejected';
                if (s.status === 'Delivered') statusBadge = 'carrier-badge-completed';
                if (s.status === 'Arrived at Destination') statusBadge = 'carrier-badge-accepted';

                return `
                  <tr>
                    <td style="padding: 11px 14px;">
                      <div style="font-weight: 700; color: #18217E;">${s.id}</div>
                      <div style="font-size: 10.5px; color: #8A9995;">
                        Type: ${s.cargoType || 'General Freight'}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #070724;">
                        ${s.origin} &rarr; ${s.destination}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #070724; font-size: 11.5px;">
                        ${s.assignedVehicle || 'Freightliner (BG-01)'}
                      </div>
                      <div style="font-size: 10.5px; color: #424989;">
                        Driver: ${s.assignedDriver || 'Ethan Vance'}
                      </div>
                    </td>
                    <td>
                      <div style="color: #393A50; font-weight: 500;">
                        ${s.currentLocation || s.origin}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #070724;">
                        ${s.carrierConfirmedEta || s.currentEta || s.eta || '14:30 EST'}
                      </div>
                      ${s.slaRisk ? '<span style="font-size: 9.5px; color: #EA341F; font-weight: 700;">RISK FLAGGED</span>' : ''}
                    </td>
                    <td>
                      <div style="color: #8A9995; font-size: 11px;">
                        ${s.committedDeliveryTime || '18:00 EST'}
                      </div>
                    </td>
                    <td>
                      <span class="carrier-badge ${statusBadge}">
                        ${s.status}
                      </span>
                    </td>
                    <td style="text-align: right; padding-right: 14px; white-space: nowrap;">
                      <button class="btn btn-secondary btn-sm" onclick="CarrierShipmentsView.openShipmentModal('${s.id}')" style="padding: 4px 8px; font-size: 11px; font-weight: 600; margin-right: 4px;">
                        View
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="CarrierExecutionView.openExecutionWorkspace('${s.id}')" style="padding: 4px 8px; font-size: 11px; font-weight: 600; margin-right: 4px;" title="Update Milestones">
                        Milestones
                      </button>
                      ${s.status === 'Arrived at Destination' ? `
                        <button class="btn btn-primary btn-sm" onclick="CarrierDeliveryView.openDeliveryModal('${s.id}')" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #059669; border-color: #059669;">
                          Confirm POD
                        </button>
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

  openShipmentModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    if (!s) return;

    UI.openModal('generic-app-modal', `Shipment Details — ${s.id}`, `
      <div style="padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; margin-bottom: 14px;">
          <div>
            <span style="font-size: 10.5px; color: #8A9995; font-weight: 700; text-transform: uppercase;">Shipment Number</span>
            <div style="font-size: 15px; font-weight: 800; color: #18217E;">${s.id}</div>
          </div>
          <div>
            <span style="font-size: 10.5px; color: #8A9995; font-weight: 700; text-transform: uppercase;">Operational Status</span>
            <div><span class="carrier-badge carrier-badge-in-progress">${s.status}</span></div>
          </div>
          <div>
            <span style="font-size: 10.5px; color: #8A9995; font-weight: 700; text-transform: uppercase;">Carrier Partner</span>
            <div style="font-size: 13px; font-weight: 700; color: #070724;">Bridges Global Logistics</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div style="background: white; border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #18217E; text-transform: uppercase; margin-bottom: 8px;">Routing &amp; Schedule</div>
            <div class="carrier-field-row"><span class="carrier-field-label">Origin:</span><span class="carrier-field-value">${s.origin}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Destination:</span><span class="carrier-field-value">${s.destination}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Current Location:</span><span class="carrier-field-value">${s.currentLocation || s.origin}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Latest Confirmed ETA:</span><span class="carrier-field-value" style="font-weight: 700; color: #18217E;">${s.carrierConfirmedEta || s.currentEta || s.eta || '14:30 EST'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Committed Delivery:</span><span class="carrier-field-value">${s.committedDeliveryTime || '18:00 EST'}</span></div>
          </div>

          <div style="background: white; border: 1px solid #E5EBEE; border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #424989; text-transform: uppercase; margin-bottom: 8px;">Fleet &amp; Driver Binding</div>
            <div class="carrier-field-row"><span class="carrier-field-label">Vehicle Assigned:</span><span class="carrier-field-value">${s.assignedVehicle || 'Freightliner Cascadia (BG-01)'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Driver Assigned:</span><span class="carrier-field-value">${s.assignedDriver || 'Ethan Vance'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">Cargo Allocation:</span><span class="carrier-field-value">${s.cargoType || 'High-Value Electronics'}</span></div>
            <div class="carrier-field-row"><span class="carrier-field-label">SLA Risk Assessment:</span><span class="carrier-field-value" style="color: ${s.slaRisk ? '#EA341F' : '#059669'}; font-weight: 700;">${s.slaRisk ? 'SLA Compromised' : 'Nominal On-Time'}</span></div>
          </div>
        </div>

        <!-- Milestones list -->
        <div style="border-top: 1px solid #E5EBEE; padding-top: 12px; margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #8A9995; text-transform: uppercase; margin-bottom: 8px;">Recorded Operational Milestones</div>
          <div style="max-height: 130px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
            ${(s.milestones && s.milestones.length > 0) ? s.milestones.map(m => `
              <div style="font-size: 11.5px; padding: 4px 8px; background: #F8FAFB; border-radius: 4px; border-left: 2px solid #18217E;">
                <div style="display: flex; justify-content: space-between; color: #8A9995; font-size: 10px;">
                  <span><strong style="color: #070724;">${m.milestone}</strong> &bull; Location: ${m.location || 'Hub'}</span>
                  <span>${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                ${m.notes ? `<div style="color: #393A50; margin-top: 2px;">${m.notes}</div>` : ''}
              </div>
            `).join('') : `
              <div style="font-size: 11.5px; color: #8A9995; text-align: center; padding: 8px;">
                No execution milestones logged yet. Unit ready for departure.
              </div>
            `}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal'); CarrierExecutionView.openEtaModal('${s.id}')">
            Update Confirmed ETA
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); CarrierExecutionView.openExecutionWorkspace('${s.id}')" style="background: #18217E; font-weight: 700;">
            Advance Milestones &rarr;
          </button>
        </div>
      </div>
    `);
  }
};

window.CarrierShipmentsView = CarrierShipmentsView;
