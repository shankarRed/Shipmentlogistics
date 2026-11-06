/**
 * BRIDGES Control Tower - Dispatcher Operational Exception Queue
 * Displays actionable exceptions needing operational action with:
 * - Shipment, Customer, and Cargo details (description + cargo value)
 * - Carrier & Vehicle telemetry
 * - Predicted ETA & SLA feasibility
 * - Interactive Map launcher
 * - AI Recommendation badge
 * - Ownership assignment & Claim controls
 */

const DispatcherQueueView = {
  searchQuery: '',
  severityFilter: 'All',
  typeFilter: 'All',
  statusFilter: 'Actionable',
  slaFilter: 'All',
  carrierFilter: 'All',

  render() {
    const allExceptions = window.BRIDGES_STORE.getExceptions();
    const carriers = window.BRIDGES_STORE.getCarriers();

    // Filter exceptions
    const filtered = allExceptions.filter(exc => {
      const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId) || {};

      // Search match
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = exc.id.toLowerCase().includes(q);
        const matchShip = exc.shipmentId.toLowerCase().includes(q);
        const matchCust = (shipment.customerName || '').toLowerCase().includes(q);
        const matchCargo = (shipment.cargoDescription || '').toLowerCase().includes(q);
        const matchReason = (exc.reason || '').toLowerCase().includes(q);
        const matchCarrier = (shipment.carrier || '').toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchCust && !matchCargo && !matchReason && !matchCarrier) return false;
      }

      // Severity
      if (this.severityFilter !== 'All' && exc.severity !== this.severityFilter) {
        return false;
      }

      // Type
      if (this.typeFilter !== 'All' && exc.type !== this.typeFilter) {
        return false;
      }

      // Status Filter
      if (this.statusFilter === 'Actionable') {
        if (!['Open', 'Assigned', 'Investigating', 'Under Investigation', 'Recovery in Progress', 'Escalated'].includes(exc.status)) {
          return false;
        }
      } else if (this.statusFilter !== 'All') {
        if (exc.status !== this.statusFilter) return false;
      }

      // SLA Risk
      if (this.slaFilter !== 'All' && exc.slaRisk !== this.slaFilter) {
        return false;
      }

      // Carrier
      if (this.carrierFilter !== 'All' && shipment.carrier !== this.carrierFilter) {
        return false;
      }

      return true;
    });

    const uniqueTypes = [...new Set(allExceptions.map(e => e.type).filter(Boolean))];

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER & BREADCRUMB -->
        <div class="page-action-header" style="margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Operational Exception Queue</h2>
              <span class="badge badge-primary">${filtered.length} Active Deviations</span>
            </div>
            <p class="page-subheading" style="margin-top: 2px;">
              Triage active shipment exceptions, evaluate AI recovery options, and launch resolution workflows.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="DispatcherQueueView.resetFilters()">
              Reset Filters
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_planning')">
              Recovery Planning Workspace &rarr;
            </button>
          </div>
        </div>

        <!-- SEARCH & FILTER CONTROLS BAR -->
        <div class="panel" style="margin-bottom: 14px; padding: 10px 14px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between;">
            <!-- Search Input -->
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input type="text" 
                     id="dispatcher-queue-search" 
                     class="search-input" 
                     style="width: 100%; padding: 6px 10px 6px 30px; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px;"
                     placeholder="Search exception, shipment, customer, cargo, carrier..." 
                     value="${this.searchQuery}"
                     oninput="DispatcherQueueView.handleSearch(this.value)">
              <span style="position: absolute; left: 9px; top: 7px; color: #94A3B8;">${Icons.search(13)}</span>
            </div>

            <!-- Filters -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <!-- Severity Filter -->
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherQueueView.setSeverityFilter(this.value)">
                <option value="All" ${this.severityFilter === 'All' ? 'selected' : ''}>All Severities</option>
                <option value="Critical" ${this.severityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
                <option value="High" ${this.severityFilter === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${this.severityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${this.severityFilter === 'Low' ? 'selected' : ''}>Low</option>
              </select>

              <!-- Status Filter -->
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherQueueView.setStatusFilter(this.value)">
                <option value="Actionable" ${this.statusFilter === 'Actionable' ? 'selected' : ''}>Actionable Only</option>
                <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Open" ${this.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Assigned" ${this.statusFilter === 'Assigned' ? 'selected' : ''}>Assigned</option>
                <option value="Recovery in Progress" ${this.statusFilter === 'Recovery in Progress' ? 'selected' : ''}>Recovery Active</option>
                <option value="Escalated" ${this.statusFilter === 'Escalated' ? 'selected' : ''}>Escalated</option>
              </select>

              <!-- Exception Type -->
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherQueueView.setTypeFilter(this.value)">
                <option value="All" ${this.typeFilter === 'All' ? 'selected' : ''}>All Deviation Types</option>
                ${uniqueTypes.map(t => `<option value="${t}" ${this.typeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>

              <!-- SLA Risk -->
              <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherQueueView.setSlaFilter(this.value)">
                <option value="All" ${this.slaFilter === 'All' ? 'selected' : ''}>All SLA Risks</option>
                <option value="Critical" ${this.slaFilter === 'Critical' ? 'selected' : ''}>Critical Risk</option>
                <option value="High" ${this.slaFilter === 'High' ? 'selected' : ''}>High Risk</option>
                <option value="Moderate" ${this.slaFilter === 'Moderate' ? 'selected' : ''}>Moderate Risk</option>
                <option value="Low" ${this.slaFilter === 'Low' ? 'selected' : ''}>Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        <!-- EXCEPTIONS TABLE (Fit 100% width, no horizontal scrollbar) -->
        <div class="panel" style="padding: 0; overflow: hidden; border: 1px solid #E2E8F0; border-radius: 8px;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
              <div class="empty-state-title">No Matching Operational Exceptions</div>
              <div class="empty-state-sub">Adjust your filters or search terms to inspect other shipment records.</div>
            </div>
          ` : `
            <div class="table-responsive" style="overflow-x: hidden; width: 100%;">
              <table class="data-table" style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                    <th style="padding: 10px 12px; width: 13%;">Exception &amp; Time</th>
                    <th style="padding: 10px 12px; width: 22%;">Shipment &amp; Customer</th>
                    <th style="padding: 10px 12px; width: 20%;">Deviation &amp; Severity</th>
                    <th style="padding: 10px 12px; width: 17%;">Carrier &amp; Predicted ETA</th>
                    <th style="padding: 10px 12px; width: 13%;">AI Strategy</th>
                    <th style="padding: 10px 12px; width: 15%; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(exc => {
                    const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId) || {};
                    const isCritical = exc.severity === 'Critical';
                    const isHigh = exc.severity === 'High';
                    const aiRec = this.getAiRecommendation(exc, shipment);
                    const customerName = shipment.customerName || (exc.shipmentId === 'BRG-2848' ? 'BioPharma Health Alliance' : exc.shipmentId === 'BRG-2847' ? 'Apex Dynamics Corp' : 'Global Maritime Energy');
                    const cargoDesc = shipment.cargoDescription || (exc.type === 'Temperature Breach' ? 'Biologics & Vaccines' : 'Industrial Assemblies');
                    const cargoVal = shipment.cargoValue || (exc.type === 'Temperature Breach' ? '$185,000' : '$92,000');
                    const owner = exc.assignedAnalyst || 'Unclaimed';
                    const isUnclaimed = !exc.assignedAnalyst || exc.assignedAnalyst === 'Unassigned';
                    const carrierName = shipment.carrier || shipment.carrierName || 'Bridges Global';

                    return `
                      <tr style="border-bottom: 1px solid #F1F5F9; transition: background 0.15s;" onmouseover="this.style.background='#F8FAFE'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 10px 12px;">
                          <div style="font-weight: 800; color: #18217E; font-size: 12.5px;">${exc.id}</div>
                          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${this.formatTime(exc.detectionTime)}</div>
                        </td>

                        <td style="padding: 10px 12px;">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-weight: 800; color: #070724; font-size: 12px;">${exc.shipmentId}</span>
                            <span style="font-size: 10.5px; font-weight: 700; color: #1E8E3E;">${cargoVal}</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; color: #18217E; margin-top: 1px;">${customerName}</div>
                          <div style="font-size: 10px; color: #64748B;">${cargoDesc}</div>
                        </td>

                        <td style="padding: 10px 12px;">
                          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                            <span style="font-weight: 700; color: #070724;">${exc.type}</span>
                            <span class="severity-badge ${isCritical ? 'badge-danger' : isHigh ? 'badge-warning' : 'badge-secondary'}" style="font-size: 9.5px; padding: 1px 6px;">
                              ${exc.severity}
                            </span>
                          </div>
                          <div style="font-size: 10.5px; color: #475569; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${exc.reason}">
                            ${exc.reason}
                          </div>
                        </td>

                        <td style="padding: 10px 12px;">
                          <div style="font-weight: 600; color: #070724; font-size: 11.5px;">${carrierName}</div>
                          <div style="font-size: 11px; font-weight: 700; color: ${exc.slaRisk === 'Critical' ? 'var(--color-signal-red)' : '#18217E'}; margin-top: 2px;">
                            ETA: ${this.formatTime(exc.predictedETA || shipment.predictedETA)}
                            <span class="badge ${exc.slaRisk === 'Critical' ? 'badge-danger' : exc.slaRisk === 'High' ? 'badge-warning' : 'badge-success'}" style="font-size: 9px; padding: 1px 5px; margin-left: 3px;">
                              SLA: ${exc.slaRisk || 'Moderate'}
                            </span>
                          </div>
                        </td>

                        <td style="padding: 10px 12px;">
                          <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.15); border-radius: 6px; padding: 4px 8px;">
                            <div style="font-size: 11px; font-weight: 800; color: #18217E;">🤖 ${aiRec.strategy}</div>
                            <div style="font-size: 9.5px; color: #424989;">${aiRec.confidence} Conf</div>
                          </div>
                        </td>

                        <td style="padding: 10px 12px; text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                            <button class="btn btn-secondary btn-sm" 
                                    title="View Route & Map"
                                    onclick="DispatcherQueueView.openMapModal('${shipment.id}', '${exc.id}')"
                                    style="padding: 4px 7px; font-size: 11px;">
                              Map
                            </button>
                            <button class="btn btn-primary btn-sm" 
                                    title="Plan Recovery Strategy"
                                    onclick="App.navigateTo('dispatcher_planning'); setTimeout(() => DispatcherPlanningView.selectException('${exc.id}'), 50);"
                                    style="padding: 4px 10px; font-weight: 700; font-size: 11px; white-space: nowrap;">
                              Plan Recovery &rarr;
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            </div>
          `}
        </div>
      </div>
    `;
  },

  getAiRecommendation(exc, shipment) {
    if (exc.type === 'Temperature Breach') {
      return {
        strategy: 'Alternate Carrier',
        confidence: '96%',
        summary: 'Engage reefer swap to save pharma cargo'
      };
    } else if ((exc.reason || '').toLowerCase().includes('rockfall') || (exc.reason || '').toLowerCase().includes('road')) {
      return {
        strategy: 'Re-route',
        confidence: '93%',
        summary: 'Bypass via State Route 80 corridor'
      };
    } else if (exc.severity === 'Critical') {
      return {
        strategy: 'Expedite',
        confidence: '95%',
        summary: 'Dedicated sprint van to protect SLA'
      };
    } else {
      return {
        strategy: 'Wait-and-Monitor',
        confidence: '88%',
        summary: 'Delay absorptive within delivery buffer'
      };
    }
  },

  openMapModal(shipmentId, exceptionId) {
    if (window.LiveTrackingMap && typeof window.LiveTrackingMap.openFullscreen === 'function') {
      window.LiveTrackingMap.openFullscreen(shipmentId);
      return;
    }
    const shipment = window.BRIDGES_STORE.getShipment(shipmentId) || {};
    const exc = window.BRIDGES_STORE.getException(exceptionId) || {};

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #18217E;">🗺️ Live Telemetry & Corridor Map — ${shipmentId}</div>
            <div style="font-size: 11.5px; color: #64748B;">Origin: ${shipment.origin || 'Origin'} → Destination: ${shipment.destination || 'Destination'}</div>
          </div>
          <span class="severity-badge ${exc.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">${exc.severity || 'High'} Exception</span>
        </div>

        <div style="height: 320px; background: #070724; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <svg width="100%" height="100%" viewBox="0 0 700 320" preserveAspectRatio="xMidYMid meet">
            <line x1="50" y1="80" x2="650" y2="80" stroke="#18217E" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
            <line x1="50" y1="160" x2="650" y2="160" stroke="#18217E" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
            <line x1="50" y1="240" x2="650" y2="240" stroke="#18217E" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>

            <!-- Route corridor path -->
            <path d="M 80 160 Q 250 80 400 160 T 620 160" fill="none" stroke="#424989" stroke-width="6" stroke-linecap="round"/>
            <!-- Recommended detour -->
            <path d="M 400 160 C 460 250, 540 250, 620 160" fill="none" stroke="#EA341F" stroke-width="3" stroke-dasharray="8 6"/>

            <!-- Origin node -->
            <circle cx="80" cy="160" r="10" fill="#18217E"/>
            <circle cx="80" cy="160" r="5" fill="#FFFFFF"/>
            <text x="80" y="190" fill="#E5EBEE" font-size="12" font-weight="700" text-anchor="middle">${shipment.origin || 'Origin Terminal'}</text>

            <!-- Incident marker -->
            <circle cx="400" cy="160" r="14" fill="#EA341F" opacity="0.4">
              <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="400" cy="160" r="9" fill="#EA341F"/>
            <circle cx="400" cy="160" r="4" fill="#FFFFFF"/>
            <text x="400" y="140" fill="#EA341F" font-size="12" font-weight="800" text-anchor="middle">⚠️ ${exc.type || 'Choke Point'}</text>

            <!-- Destination node -->
            <circle cx="620" cy="160" r="10" fill="#18217E"/>
            <circle cx="620" cy="160" r="5" fill="#FFFFFF"/>
            <text x="620" y="190" fill="#E5EBEE" font-size="12" font-weight="700" text-anchor="middle">${shipment.destination || 'Destination Hub'}</text>
          </svg>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
          <div>
            <span style="color: #64748B; display: block; font-size: 10.5px;">Current Position</span>
            <strong>${exc.location || shipment.currentLocation || 'Interstate Corridor Mile 142'}</strong>
          </div>
          <div>
            <span style="color: #64748B; display: block; font-size: 10.5px;">GPS Telemetry Coordinates</span>
            <strong>32.7767° N, 96.7970° W</strong>
          </div>
          <div>
            <span style="color: #64748B; display: block; font-size: 10.5px;">Assigned Carrier</span>
            <strong>${shipment.carrier || 'Bridges Global'} (${shipment.vehicle || 'Vehicle 23'})</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigateTo('dispatcher_planning'); setTimeout(() => DispatcherPlanningView.selectException('${exc.id}'), 50);">
            Proceed to Recovery Planning →
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Live GPS & Corridor Map — ${shipmentId}`, modalHtml);
  },

  openInspectModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;
    const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId) || {};
    const aiRec = this.getAiRecommendation(exc, shipment);

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #E5EBEE;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #070724;">${exc.id} — Operational Exception Dossier</div>
            <div style="font-size: 11.5px; color: #64748B;">Linked Shipment: <strong>${exc.shipmentId}</strong> · Customer: <strong>${shipment.customerName || 'BioPharma Health Alliance'}</strong></div>
          </div>
          <span class="severity-badge ${exc.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">${exc.severity} Severity</span>
        </div>

        <!-- 8 Dimensions Dossier Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 14px;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
            <div style="font-weight: 700; color: #18217E; margin-bottom: 6px; text-transform: uppercase; font-size: 10.5px;">Customer & Cargo</div>
            <div><strong>Customer:</strong> ${shipment.customerName || 'BioPharma Health Alliance'}</div>
            <div><strong>Cargo:</strong> ${shipment.cargoDescription || 'Pharmaceutical Biologics'}</div>
            <div><strong>Cargo Value:</strong> <span style="color: #1E8E3E; font-weight: 700;">${shipment.cargoValue || '$185,000'}</span></div>
            <div><strong>Order Ref:</strong> ${shipment.orderReference || 'ORD-98248'}</div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
            <div style="font-weight: 700; color: #18217E; margin-bottom: 6px; text-transform: uppercase; font-size: 10.5px;">Carrier & Route Telemetry</div>
            <div><strong>Carrier:</strong> ${shipment.carrier || 'Bridges Global Logistics'}</div>
            <div><strong>Vehicle / Driver:</strong> ${shipment.vehicle || 'FR-09'} · ${shipment.driver || 'Ethan Cole'}</div>
            <div><strong>Corridor:</strong> ${shipment.origin || 'Capital Knot'} → ${shipment.destination || 'Lake Knot'}</div>
            <div><strong>Last Location:</strong> ${exc.location || shipment.currentLocation || 'Interstate Mile 142'}</div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
            <div style="font-weight: 700; color: #18217E; margin-bottom: 6px; text-transform: uppercase; font-size: 10.5px;">ETA & SLA Feasibility</div>
            <div><strong>Original Target ETA:</strong> ${shipment.originalETA || '12:00 PM'}</div>
            <div><strong>Predicted Arrival:</strong> <span style="color: #EA341F; font-weight: 700;">${exc.predictedETA || shipment.predictedETA || 'Delayed'}</span></div>
            <div><strong>Delivery Commitment:</strong> ${shipment.deliveryCommitment || '14:00 PM'}</div>
            <div><strong>SLA Breach Penalty:</strong> <span style="color: #8C2527; font-weight: 700;">${exc.estimatedBusinessImpact || '$4,500'}</span></div>
          </div>

          <div style="background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 6px; padding: 10px 12px; font-size: 11.5px;">
            <div style="font-weight: 700; color: #18217E; margin-bottom: 6px; text-transform: uppercase; font-size: 10.5px;">🤖 AI Recovery Recommendation</div>
            <div><strong>Recommended Strategy:</strong> <strong>${aiRec.strategy}</strong> (${aiRec.confidence} confidence)</div>
            <div style="margin-top: 4px; color: #393A50; line-height: 1.35;">${aiRec.summary}. Minimizes delivery variance and protects SLA delivery commitments.</div>
            <div style="margin-top: 6px;">
              <span class="badge badge-success" style="font-size: 10px;">Feasibility: 98%</span>
            </div>
          </div>
        </div>

        <!-- Ownership Dossier Strip -->
        <div style="background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
          <div>
            <strong>Operational Ownership:</strong> ${exc.assignedAnalyst || 'Unassigned / Unclaimed'}
          </div>
          <div>
            <button class="btn btn-secondary btn-sm" onclick="DispatcherQueueView.claimException('${exc.id}')" style="font-size: 11px;">
              Assign to Me
            </button>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigateTo('dispatcher_planning'); setTimeout(() => DispatcherPlanningView.selectException('${exc.id}'), 50);">
            Open Planning Workspace →
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Exception Dossier — ${exc.id}`, modalHtml);
  },

  claimException(exceptionId) {
    try {
      const user = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser ? window.BRIDGES_AUTH.getCurrentUser() : { name: 'Marcus Vance', role: 'Dispatcher / Transport Planner' };
      window.BRIDGES_STORE.takeOwnership(exceptionId, user);
      UI.showToast(`Claimed operational ownership of exception ${exceptionId}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  reassignModal(exceptionId) {
    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="font-size: 13px; margin-bottom: 12px;">Select transport dispatcher or operational analyst to reassign <strong>${exceptionId}</strong>:</div>
        <select id="reassign-user-select" class="planning-select" style="width: 100%; margin-bottom: 16px;">
          <option value="Marcus Vance (Transport Dispatcher)">Marcus Vance (Transport Dispatcher)</option>
          <option value="Sarah Lin (Control Tower Analyst)">Sarah Lin (Control Tower Analyst)</option>
          <option value="Carlos Mendoza (Operations Supervisor)">Carlos Mendoza (Operations Supervisor)</option>
          <option value="David Kim (Regional Operations Manager)">David Kim (Regional Operations Manager)</option>
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="DispatcherQueueView.applyReassign('${exceptionId}')">Confirm Reassignment</button>
        </div>
      </div>
    `;
    UI.openModal('generic-app-modal', `Reassign Exception ${exceptionId}`, modalHtml);
  },

  applyReassign(exceptionId) {
    const select = document.getElementById('reassign-user-select');
    if (!select) return;
    const newOwner = select.value;
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (exc) {
      exc.assignedAnalyst = newOwner;
      if (!exc.timeline) exc.timeline = [];
      exc.timeline.push({
        timestamp: new Date().toISOString(),
        actor: window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? window.BRIDGES_AUTH.getCurrentUser().name : 'Control Tower',
        action: 'Ownership Reassigned',
        note: `Reassigned operational ownership to ${newOwner}.`
      });
      window.BRIDGES_STORE.save();
      UI.closeModal('generic-app-modal');
      UI.showToast(`Reassigned exception ${exceptionId} to ${newOwner}.`, 'success');
      App.renderCurrentView();
    }
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  setSeverityFilter(val) {
    this.severityFilter = val;
    App.renderCurrentView();
  },

  setStatusFilter(val) {
    this.statusFilter = val;
    App.renderCurrentView();
  },

  setTypeFilter(val) {
    this.typeFilter = val;
    App.renderCurrentView();
  },

  setSlaFilter(val) {
    this.slaFilter = val;
    App.renderCurrentView();
  },

  setCarrierFilter(val) {
    this.carrierFilter = val;
    App.renderCurrentView();
  },

  formatTime(iso) {
    if (!iso) return 'Pending';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return iso;
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.severityFilter = 'All';
    this.typeFilter = 'All';
    this.statusFilter = 'Actionable';
    this.slaFilter = 'All';
    this.carrierFilter = 'All';
    App.renderCurrentView();
  }
};

window.DispatcherQueueView = DispatcherQueueView;
