/**
 * BRIDGES Control Tower - Analyst Tracking & Events View (US-19 to US-22)
 * Event stream monitoring for TMS, carrier tracking, GPS/telematics, and IoT sensors.
 * Features an interactive "Simulate Event" engine that processes events through
 * configurable business rules, detects exceptions, and deduplicates repeated alerts.
 */

const AnalystEventsView = {
  searchQuery: '',
  eventTypeFilter: 'All',
  sourceFilter: 'All',
  statusFilter: 'All',

  render() {
    const events = window.BRIDGES_STORE.getShipmentEvents();

    const filtered = events.filter(e => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = e.id.toLowerCase().includes(q);
        const matchShip = e.shipmentId.toLowerCase().includes(q);
        const matchType = e.eventType.toLowerCase().includes(q);
        const matchLoc = e.reportedLocation && e.reportedLocation.toLowerCase().includes(q);
        const matchDet = e.details && e.details.toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchType && !matchLoc && !matchDet) return false;
      }

      if (this.eventTypeFilter !== 'All' && e.eventType !== this.eventTypeFilter) return false;
      if (this.sourceFilter !== 'All' && e.sourceSystem !== this.sourceFilter) return false;
      if (this.statusFilter !== 'All' && e.processingStatus !== this.statusFilter) return false;

      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Tracking & Telemetry Events</h2>
              <span class="role-indicator-pill">Event Ingestion Stream</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Multi-source telemetry ingestion from TMS, Carrier Tracking EDI, GPS/telematics, and IoT cold-chain sensors.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystEventsView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="AnalystEventsView.openSimulateEventModal()">
              ${Icons.events ? Icons.events(14) : Icons.plus(14)}
              <span>Simulate Telemetry Event</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Event ID, Shipment ID, Location, Telemetry details..." 
              value="${this.searchQuery}" 
              oninput="AnalystEventsView.handleSearch(this.value)"
            >
          </div>

          <!-- Event Type Filter -->
          <select class="filter-select" onchange="AnalystEventsView.handleFilter('eventTypeFilter', this.value)">
            <option value="All" ${this.eventTypeFilter === 'All' ? 'selected' : ''}>All Event Types</option>
            <option value="Shipment departed" ${this.eventTypeFilter === 'Shipment departed' ? 'selected' : ''}>Shipment departed</option>
            <option value="Shipment arrived at checkpoint" ${this.eventTypeFilter === 'Shipment arrived at checkpoint' ? 'selected' : ''}>Shipment arrived at checkpoint</option>
            <option value="ETA changed" ${this.eventTypeFilter === 'ETA changed' ? 'selected' : ''}>ETA changed</option>
            <option value="Pickup missed" ${this.eventTypeFilter === 'Pickup missed' ? 'selected' : ''}>Pickup missed</option>
            <option value="Excessive dwell time" ${this.eventTypeFilter === 'Excessive dwell time' ? 'selected' : ''}>Excessive dwell time</option>
            <option value="Temperature out of range" ${this.eventTypeFilter === 'Temperature out of range' ? 'selected' : ''}>Temperature out of range</option>
            <option value="Customs hold" ${this.eventTypeFilter === 'Customs hold' ? 'selected' : ''}>Customs hold</option>
            <option value="Delivery completed" ${this.eventTypeFilter === 'Delivery completed' ? 'selected' : ''}>Delivery completed</option>
          </select>

          <!-- Source System Filter -->
          <select class="filter-select" onchange="AnalystEventsView.handleFilter('sourceFilter', this.value)">
            <option value="All" ${this.sourceFilter === 'All' ? 'selected' : ''}>All Source Systems</option>
            <option value="TMS" ${this.sourceFilter === 'TMS' ? 'selected' : ''}>TMS (Transport Management)</option>
            <option value="Carrier Tracking" ${this.sourceFilter === 'Carrier Tracking' ? 'selected' : ''}>Carrier Tracking (EDI)</option>
            <option value="GPS/Telematics" ${this.sourceFilter === 'GPS/Telematics' ? 'selected' : ''}>GPS / Telematics Unit</option>
            <option value="IoT Sensor" ${this.sourceFilter === 'IoT Sensor' ? 'selected' : ''}>IoT Cold Chain Sensor</option>
          </select>

          <!-- Processing Status Filter -->
          <select class="filter-select" onchange="AnalystEventsView.handleFilter('statusFilter', this.value)">
            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Processing Statuses</option>
            <option value="Processed" ${this.statusFilter === 'Processed' ? 'selected' : ''}>Processed</option>
            <option value="Exception Created" ${this.statusFilter === 'Exception Created' ? 'selected' : ''}>Exception Created</option>
            <option value="Duplicate Ignored" ${this.statusFilter === 'Duplicate Ignored' ? 'selected' : ''}>Duplicate Ignored</option>
          </select>
        </div>

        <!-- Table Card -->
        <div class="card" style="padding: 0; overflow: hidden;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">
                ${Icons.events ? Icons.events(24) : Icons.refresh(24)}
              </div>
              <div class="empty-state-title">No Telemetry Events Found</div>
              <div class="empty-state-sub">No shipment event records matched your filter criteria. Use "Simulate Telemetry Event" to log live events.</div>
              <button class="btn btn-primary btn-sm mt-3" onclick="AnalystEventsView.openSimulateEventModal()">Simulate Event</button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table" style="font-size: 12px;">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Shipment ID</th>
                    <th>Event Type</th>
                    <th>Timestamp</th>
                    <th>Reported Location</th>
                    <th>Source System</th>
                    <th>Processing Status</th>
                    <th>Related Exception</th>
                    <th>Telemetry Payload / Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(evt => `
                    <tr>
                      <td>
                        <span style="font-weight: 700; color: var(--color-royal-navy);">${evt.id}</span>
                      </td>
                      <td>
                        <span style="font-weight: 700; color: var(--color-midnight); cursor: pointer;" onclick="AnalystShipmentsView.openDetailModal('${evt.shipmentId}')">
                          ${evt.shipmentId} ↗
                        </span>
                      </td>
                      <td>
                        <strong style="color: var(--color-midnight);">${evt.eventType}</strong>
                      </td>
                      <td>
                        <div style="font-size: 11px; font-weight: 600;">${AnalystDashboardView.formatTime(evt.timestamp)}</div>
                        <div style="font-size: 10px; color: var(--color-muted-sage);">${evt.timestamp ? evt.timestamp.slice(0, 10) : ''}</div>
                      </td>
                      <td>
                        <span style="font-size: 11px; color: var(--color-charcoal);">${evt.reportedLocation}</span>
                      </td>
                      <td>
                        <span class="badge" style="background: #EFEFF9; color: var(--color-slate-indigo); font-weight: 600;">
                          ${evt.sourceSystem}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${this.getProcessingStatusBadgeClass(evt.processingStatus)}">
                          ${evt.processingStatus}
                        </span>
                      </td>
                      <td>
                        ${evt.relatedExceptionId ? `
                          <button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 10px; font-weight: 700; color: var(--color-signal-red);" onclick="AnalystDashboardView.openInvestigation('${evt.relatedExceptionId}')">
                            ${evt.relatedExceptionId} ↗
                          </button>
                        ` : `
                          <span style="color: var(--color-muted-sage); font-size: 11px;">None</span>
                        `}
                      </td>
                      <td style="max-width: 280px;">
                        <span style="color: var(--color-charcoal); font-size: 11px; line-height: 1.35;">
                          ${evt.details}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_events') {
      App.renderCurrentView();
    }
  },

  handleFilter(field, val) {
    this[field] = val;
    if (window.App && App.currentView === 'analyst_events') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.eventTypeFilter = 'All';
    this.sourceFilter = 'All';
    this.statusFilter = 'All';
    if (window.App && App.currentView === 'analyst_events') {
      App.renderCurrentView();
    }
  },

  getProcessingStatusBadgeClass(status) {
    switch (status) {
      case 'Processed': return 'badge-active';
      case 'Exception Created': return 'badge-danger';
      case 'Duplicate Ignored': return 'badge-warning';
      default: return 'badge-neutral';
    }
  },

  // Simulate Event Modal (US-19 to US-22)
  openSimulateEventModal() {
    const shipments = window.BRIDGES_STORE.getShipments();

    const formHtml = `
      <form id="simulate-event-form" onsubmit="AnalystEventsView.handleSimulateSubmit(event)">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="padding: 10px 12px; background: #F8FAFE; border: 1px solid #C7DCFA; border-radius: 6px; font-size: 12px; color: var(--color-royal-navy);">
            <strong>Simulate Operational Telemetry Event:</strong> Select an active shipment and specify event attributes. The event handling engine will parse rules, trigger exceptions if thresholds are breached, and check deduplication.
          </div>

          <!-- Select Shipment -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Target Monitored Shipment <span style="color: var(--color-signal-red);">*</span></label>
            <select id="sim-shipment-id" class="form-control" required onchange="AnalystEventsView.updateSimulateLocationDefault(this.value)">
              ${shipments.map(s => `
                <option value="${s.id}">
                  ${s.id} — ${s.origin} → ${s.destination} (${s.cargoType} • Status: ${s.status})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Event Type -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Event Type <span style="color: var(--color-signal-red);">*</span></label>
            <select id="sim-event-type" class="form-control" required onchange="AnalystEventsView.handleEventTypeChange(this.value)">
              <option value="Temperature out of range">Temperature out of range (Cold Chain Excursion)</option>
              <option value="ETA changed">ETA changed (Route Delay Deviation)</option>
              <option value="Excessive dwell time">Excessive dwell time (Terminal Bottleneck)</option>
              <option value="Pickup missed">Pickup missed (Shipper Dock Mismatch)</option>
              <option value="Customs hold">Customs hold (Border Inspection)</option>
              <option value="Shipment arrived at checkpoint">Shipment arrived at checkpoint (Nominal Progress)</option>
              <option value="Shipment departed">Shipment departed (Ramp Dispatch)</option>
              <option value="Delivery completed">Delivery completed (Destination Fulfilled)</option>
            </select>
          </div>

          <!-- Source System -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Source Telemetry System <span style="color: var(--color-signal-red);">*</span></label>
            <select id="sim-source-system" class="form-control" required>
              <option value="IoT Sensor">IoT Sensor (Cold Chain Temperature Probe)</option>
              <option value="TMS">TMS (Transport Management EDI System)</option>
              <option value="GPS/Telematics">GPS / Telematics Unit (In-Vehicle Unit)</option>
              <option value="Carrier Tracking">Carrier Tracking (Carrier Portal / API)</option>
            </select>
          </div>

          <!-- Dynamic Event Payload Specific Inputs -->
          <div id="sim-dynamic-payload-inputs">
            ${this.renderDynamicPayloadInputs('Temperature out of range')}
          </div>

          <!-- Location -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Reported Location / Checkpoint <span style="color: var(--color-signal-red);">*</span></label>
            <input 
              type="text" 
              id="sim-location" 
              class="form-control" 
              required 
              value="Mountain Pass 7 Cryo Corridor"
            >
          </div>

          <!-- Operational Event Details -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Operational Event Details & Log Notes <span style="color: var(--color-signal-red);">*</span></label>
            <input 
              type="text" 
              id="sim-details" 
              class="form-control" 
              required 
              value="Auxiliary telemetry channel recorded temperature excursion above permissible threshold"
            >
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">
              Process & Ingest Event
            </button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', 'Simulate Operational Telemetry Event', formHtml);
  },

  handleEventTypeChange(eventType) {
    const container = document.getElementById('sim-dynamic-payload-inputs');
    if (container) {
      container.innerHTML = this.renderDynamicPayloadInputs(eventType);
    }

    const detailsInput = document.getElementById('sim-details');
    const sourceSelect = document.getElementById('sim-source-system');
    if (eventType === 'Temperature out of range') {
      if (detailsInput) detailsInput.value = 'Auxiliary telemetry probe reported internal temperature excursion';
      if (sourceSelect) sourceSelect.value = 'IoT Sensor';
    } else if (eventType === 'ETA changed') {
      if (detailsInput) detailsInput.value = 'Traffic congestion / severe weather conditions delayed projected arrival';
      if (sourceSelect) sourceSelect.value = 'TMS';
    } else if (eventType === 'Excessive dwell time') {
      if (detailsInput) detailsInput.value = 'Vehicle stationary in yard loading buffer exceeding maximum allowed wait';
      if (sourceSelect) sourceSelect.value = 'GPS/Telematics';
    } else if (eventType === 'Delivery completed') {
      if (detailsInput) detailsInput.value = 'Recipient signed proof-of-delivery with zero freight damage';
      if (sourceSelect) sourceSelect.value = 'TMS';
    }
  },

  renderDynamicPayloadInputs(eventType) {
    if (eventType === 'Temperature out of range') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Excursion Reading (°C) <span style="color: var(--color-signal-red);">*</span></label>
          <input type="number" step="0.1" id="sim-temp-reading" class="form-control" value="5.8" placeholder="+5.8">
          <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 2px;">
            Permissible range is -22°C to -18°C. Values > 4.0°C trigger Critical Severity.
          </div>
        </div>
      `;
    }

    if (eventType === 'ETA changed') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Delay Duration (Minutes) <span style="color: var(--color-signal-red);">*</span></label>
          <input type="number" id="sim-delay-minutes" class="form-control" value="150" placeholder="150">
          <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 2px;">
            Delays ≥ 120 mins trigger High severity. Delays ≥ 240 mins trigger Critical SLA Breach.
          </div>
        </div>
      `;
    }

    return '';
  },

  updateSimulateLocationDefault(shipmentId) {
    const shipment = window.BRIDGES_STORE.getShipment(shipmentId);
    const locInput = document.getElementById('sim-location');
    if (shipment && locInput) {
      locInput.value = shipment.currentLocation || `${shipment.origin} Highway Corridor`;
    }
  },

  handleSimulateSubmit(e) {
    e.preventDefault();

    try {
      const shipmentId = document.getElementById('sim-shipment-id').value;
      const eventType = document.getElementById('sim-event-type').value;
      const sourceSystem = document.getElementById('sim-source-system').value;
      const reportedLocation = document.getElementById('sim-location').value;
      const details = document.getElementById('sim-details').value;

      const payload = {
        shipmentId,
        eventType,
        sourceSystem,
        reportedLocation,
        details
      };

      const tempInput = document.getElementById('sim-temp-reading');
      if (tempInput) payload.temperature = tempInput.value;

      const delayInput = document.getElementById('sim-delay-minutes');
      if (delayInput) payload.delayMinutes = delayInput.value;

      const result = window.BRIDGES_STORE.addShipmentEvent(payload);
      UI.closeModal('generic-app-modal');

      if (result.processingStatus === 'Exception Created') {
        UI.showToast(`Event processed: Exception ${result.relatedExceptionId} was created and routed to Queue!`, 'success');
      } else if (result.processingStatus === 'Duplicate Ignored') {
        UI.showToast('Duplicate event received within deduplication window. Ignored.', 'info');
      } else {
        UI.showToast('Event successfully processed and logged to telemetry stream.', 'success');
      }

      App.renderCurrentView();

    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystEventsView = AnalystEventsView;
