/**
 * BRIDGES Control Tower - Analyst Dashboard View (US-17 to US-30)
 * Compact operational dashboard with dynamically calculated KPI cards,
 * Priority Exceptions table, SVG route schematic visualization,
 * exception distribution breakdown, and real-time operational activity feed.
 */

const AnalystDashboardView = {
  selectedMapShipmentId: 'BRG-2846',

  render() {
    const metrics = window.BRIDGES_STORE.getAnalystMetrics();
    const shipments = window.BRIDGES_STORE.getShipments();
    const exceptions = window.BRIDGES_STORE.getExceptions();
    const events = window.BRIDGES_STORE.getShipmentEvents();

    // Priority exceptions: Open or Investigating exceptions sorted by Critical > High > Medium
    const priorityExceptions = exceptions
      .filter(e => ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status))
      .sort((a, b) => {
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      });

    // Selected shipment for map details
    const selectedShipment = shipments.find(s => s.id === this.selectedMapShipmentId) || shipments[0] || null;

    return `
      <div class="view-container animate-fade-in">
        <!-- Dashboard Top Headline with Operational Scope -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Control Tower Operations Overview</h2>
              <span class="role-indicator-pill role-analyst">Analyst Live Console</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Real-time shipment deviation monitoring, SLA breach containment, and carrier recovery oversight.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('analyst_events')">
              ${Icons.events ? Icons.events(14) : ''}
              <span>Simulate / Log Event</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_queue')">
              ${Icons.exceptionQueue ? Icons.exceptionQueue(14) : ''}
              <span>Exception Queue (${metrics.openExceptions})</span>
            </button>
          </div>
        </div>

        <!-- 4 Compact Prototype KPI Cards (US-17 to US-30) -->
        <div class="analyst-kpi-grid">
          <!-- KPI 1: Shipments (Pastel Mint Green) -->
          <div class="analyst-proto-card" onclick="App.navigateTo('analyst_shipments')" title="View Shipments">
            <div class="analyst-proto-banner banner-active">
              <div class="analyst-proto-icon">${Icons.truck ? Icons.truck(16) : ''}</div>
              <span class="analyst-proto-title">Shipments</span>
            </div>
            <div class="analyst-proto-value">${metrics.activeShipments}</div>
            <div class="analyst-proto-bottom">
              <span class="analyst-proto-subtext">On route & in transit</span>
              <span class="analyst-proto-pill pill-active">↑ Live</span>
            </div>
          </div>

          <!-- KPI 2: Critical Severity (Pastel Rose Red) -->
          <div class="analyst-proto-card" onclick="AnalystDashboardView.navigateToQueueFiltered('Critical')" title="View Critical Severity Exceptions">
            <div class="analyst-proto-banner banner-critical">
              <div class="analyst-proto-icon">${Icons.alertTriangle ? Icons.alertTriangle(16) : ''}</div>
              <span class="analyst-proto-title">Critical Severity</span>
            </div>
            <div class="analyst-proto-value" style="color: #991B1B;">${metrics.criticalExceptions}</div>
            <div class="analyst-proto-bottom">
              <span class="analyst-proto-subtext">High cargo / thermal risk</span>
              <span class="analyst-proto-pill pill-critical">Immediate</span>
            </div>
          </div>

          <!-- KPI 3: SLA at Risk (Pastel Warm Amber) -->
          <div class="analyst-proto-card" onclick="App.navigateTo('analyst_queue')" title="View Exception Queue">
            <div class="analyst-proto-banner banner-sla">
              <div class="analyst-proto-icon">${Icons.gauge ? Icons.gauge(16) : Icons.clock(16)}</div>
              <span class="analyst-proto-title">SLA at Risk</span>
            </div>
            <div class="analyst-proto-value">${metrics.slaAtRisk}</div>
            <div class="analyst-proto-bottom">
              <span class="analyst-proto-subtext">Threshold warning / breached</span>
              <span class="analyst-proto-pill pill-sla">Escalated</span>
            </div>
          </div>

          <!-- KPI 4: In Recovery (Pastel Lavender Purple) -->
          <div class="analyst-proto-card" onclick="App.navigateTo('analyst_recoveries')" title="View Recovery Requests">
            <div class="analyst-proto-banner banner-recovery">
              <div class="analyst-proto-icon">${Icons.recovery ? Icons.recovery(16) : Icons.refresh(16)}</div>
              <span class="analyst-proto-title">In Recovery</span>
            </div>
            <div class="analyst-proto-value">${metrics.recoveriesInProgress}</div>
            <div class="analyst-proto-bottom">
              <span class="analyst-proto-subtext">Carrier coordination active</span>
              <span class="analyst-proto-pill pill-recovery">Re-routing</span>
            </div>
          </div>
        </div>

        <!-- Live Route Corridor & Movement Overview (Interactive Real-World Map with Monitored Exceptions) -->
        <div class="panel map-tracking-panel mb-3" style="margin-bottom: 20px; border-radius: 14px; overflow: hidden; border: 1px solid #E2E8F0; background: #FFFFFF; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #E2E8F0;">
            <div class="panel-title-wrap" style="display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; color: var(--color-royal-navy);">${Icons.mapPin(16)}</span>
              <div>
                <h3 class="panel-title" style="font-size: 14px; font-weight: 700; color: #0F172A; margin: 0;">Live Route Corridor & Movement Overview</h3>
                <p style="font-size: 11px; color: #64748B; margin: 2px 0 0 0;">Real-time corridor telemetry displaying active transit paths and critical exception beacons.</p>
              </div>
              <span class="badge badge-success" style="font-size: 11px; margin-left: 8px;">${shipments.length} Monitored Shipments</span>
            </div>
            <div class="panel-controls" style="display: flex; align-items: center; gap: 8px;">
              <div class="search-input-group" style="width: 170px;">
                <span class="icon">${Icons.search(13)}</span>
                <input type="text" placeholder="Search carrier..." style="padding: 4px 10px 4px 26px; font-size: 11.5px;" oninput="LiveTrackingMap.openFullscreen(); document.getElementById('fullscreen-tracking-search').value = this.value; LiveTrackingMap.handleSearch(this.value);">
              </div>
              <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.openApiKeyModal()" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; font-size: 11px;" title="Real-World Map API Key &amp; Provider Settings">
                🔑 Map Key
              </button>
              <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.openFullscreen()" title="Open Fullscreen Interactive Map">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                Fullscreen
              </button>
            </div>
          </div>

          <!-- Interactive Real-World Map Viewport -->
          <div class="map-viewport-container" onclick="LiveTrackingMap.openFullscreen()" style="cursor: pointer; position: relative; overflow: hidden; height: 400px;" title="Click to open Fullscreen Pan & Zoom Real-World Map">
            <!-- Live Real-World Map driven by LiveTrackingMap -->
            <div id="live-tracking-small-map" class="live-map-canvas" style="width: 100%; height: 100%; position: absolute; inset: 0; z-index: 1;"></div>
            <canvas id="live-tracking-small-canvas" class="live-map-canvas" style="display: none;"></canvas>

            <!-- Zoom Controls -->
            <div class="map-zoom-controls">
              <button class="map-zoom-btn" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.zoomIn();" title="Zoom In">+</button>
              <button class="map-zoom-btn" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.zoomOut();" title="Zoom Out">−</button>
            </div>

            <!-- Floating Detail Tracking Card (Monitored Exceptions & Corridors) -->
            <div class="map-floating-card" style="width: 250px; max-height: 380px;">
              <div class="detail-tracking-box" style="background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(8px); border-radius: 10px; padding: 10px; max-height: 360px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
                <div class="detail-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 6px; margin-bottom: 6px;">
                  <span class="detail-title" style="font-size: 11px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.04em;">Monitored Corridors</span>
                  <span class="badge badge-warning" style="font-size: 10px; padding: 1px 6px;">4 Beacons</span>
                </div>

                <!-- Unit 1: BRG-2846 Delayed -->
                <div class="detail-unit-card delayed-route analyst-floating-unit" data-shipment-id="BRG-2846" onclick="event.stopPropagation(); AnalystDashboardView.selectShipment('BRG-2846');" style="cursor: pointer; border-color: #18217E; box-shadow: 0 0 0 2px rgba(24, 33, 126, 0.15);" title="Click to view telemetry & route">
                  <div class="unit-top">
                    <span class="unit-code">BRG-2846</span>
                    <span class="status-pill delayed"><span class="status-pill-dot"></span>Delayed</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">SK</span>
                      <span class="path-label">South Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line"></div>
                      <span class="path-bullet red"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">LK</span>
                      <span class="path-label">Lake Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.ship ? Icons.ship(12) : '🚢'} Container Vessel</span>
                    <span class="telemetry-speed-grey">12 km/h</span>
                  </div>
                  <div style="margin-top: 5px; padding: 3px 6px; background: rgba(234, 52, 31, 0.08); border-left: 2px solid #EA341F; border-radius: 4px; font-size: 10px; color: #8C2527; font-weight: 600; line-height: 1.25;">
                    ⚠️ Port Gate Delay · High Tide Berth
                  </div>
                </div>

                <!-- Unit 2: BRG-2847 Detour Bypass -->
                <div class="detail-unit-card analyst-floating-unit" data-shipment-id="BRG-2847" onclick="event.stopPropagation(); AnalystDashboardView.selectShipment('BRG-2847');" style="cursor: pointer; margin-top: 6px; border-color: #FCD34D; background: #FFFDF7;" title="Click to view telemetry & route">
                  <div class="unit-top">
                    <span class="unit-code">BRG-2847</span>
                    <span class="status-pill" style="background: #FEF3C7; color: #D97706;"><span class="status-pill-dot"></span>Detour</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">CK</span>
                      <span class="path-label">Capital Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line" style="background: #D97706;"></div>
                      <span class="path-bullet" style="background: #D97706;"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">LK</span>
                      <span class="path-label">Lake Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.truck ? Icons.truck(12) : '🚚'} Biopharma Express</span>
                    <span class="telemetry-speed-green" style="color: #D97706; font-weight: 700;">62 km/h</span>
                  </div>
                  <div style="margin-top: 5px; padding: 3px 6px; background: rgba(217, 119, 6, 0.08); border-left: 2px solid #D97706; border-radius: 4px; font-size: 10px; color: #92400E; font-weight: 600; line-height: 1.25;">
                    ⚠️ Valley 3 Rockfall Bypass Active
                  </div>
                </div>

                <!-- Unit 3: BRG-2843 Critical Temp -->
                <div class="detail-unit-card delayed-route analyst-floating-unit" data-shipment-id="BRG-2843" onclick="event.stopPropagation(); AnalystDashboardView.selectShipment('BRG-2843');" style="cursor: pointer; margin-top: 6px;" title="Click to view telemetry & route">
                  <div class="unit-top">
                    <span class="unit-code">BRG-2843</span>
                    <span class="status-pill delayed"><span class="status-pill-dot"></span>Critical</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">LK</span>
                      <span class="path-label">Lake Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line"></div>
                      <span class="path-bullet red"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">MK</span>
                      <span class="path-label">Mountain Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.thermometer ? Icons.thermometer(12) : '❄️'} Cryo Medical</span>
                    <span class="telemetry-speed-grey">74 km/h</span>
                  </div>
                  <div style="margin-top: 5px; padding: 3px 6px; background: rgba(234, 52, 31, 0.08); border-left: 2px solid #EA341F; border-radius: 4px; font-size: 10px; color: #8C2527; font-weight: 600; line-height: 1.25;">
                    🚨 Chamber +8.8°C (Limit +2.0°C)
                  </div>
                </div>

                <!-- Unit 4: BRG-2848 Nominal Transit -->
                <div class="detail-unit-card active-route analyst-floating-unit" data-shipment-id="BRG-2848" onclick="event.stopPropagation(); AnalystDashboardView.selectShipment('BRG-2848');" style="cursor: pointer; margin-top: 6px;" title="Click to view telemetry & route">
                  <div class="unit-top">
                    <span class="unit-code">BRG-2848</span>
                    <span class="status-pill on-route"><span class="status-pill-dot"></span>On Route</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">WK</span>
                      <span class="path-label">West Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line"></div>
                      <span class="path-bullet green"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">CK</span>
                      <span class="path-label">Capital Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.plane ? Icons.plane(12) : '✈️'} Air Express Cargo</span>
                    <span class="telemetry-speed-green" style="color: #059669; font-weight: 700;">68 km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Bar: Legend & Active Selection -->
          <div class="schematic-map-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 11.5px; border-radius: 0 0 14px 14px; flex-wrap: wrap; gap: 10px;">
            <div class="schematic-legend" style="display: flex; gap: 14px; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 5px; color: #1E293B; font-weight: 600;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #18217E; display: inline-block;"></span> Nominal Transit</span>
              <span style="display: inline-flex; align-items: center; gap: 5px; color: #1E293B; font-weight: 600;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #EA341F; display: inline-block;"></span> Active Exception Beacon</span>
              <span style="display: inline-flex; align-items: center; gap: 5px; color: #1E293B; font-weight: 600;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #D97706; display: inline-block;"></span> Approved Detour Bypass</span>
            </div>
            <div id="analyst-selected-shipment-bar" style="display: flex; align-items: center; gap: 8px; color: #475569;">
              <span>Selected: <strong style="color: #0F172A;">${selectedShipment ? selectedShipment.id : 'BRG-2846'}</strong> (${selectedShipment ? (selectedShipment.cargoType || selectedShipment.type || 'Freight') : 'Containerized Port Freight'})</span>
              <span style="color: #CBD5E1;">•</span>
              <span>Status: <strong style="color: ${selectedShipment && selectedShipment.status === 'Delayed' ? '#EA341F' : (selectedShipment && selectedShipment.status === 'Critical' ? '#B91C1C' : '#1E8E3E')};">${selectedShipment ? selectedShipment.status : 'Delayed'}</strong></span>
              <span style="color: #CBD5E1;">•</span>
              <span>ETA: <strong>${selectedShipment ? (selectedShipment.estArrival || selectedShipment.eta || '2026-03-24T14:45:00Z') : '2026-03-24T14:45:00Z'}</strong></span>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('analyst_shipments')" style="padding: 2px 8px; font-size: 11px; margin-left: 4px;">Full Details →</button>
            </div>
          </div>
        </div>

        <!-- Two Columns: Priority Exceptions Table (Left) + Distribution & Recent Activity (Right) -->
        <div class="analyst-dash-split">
          <!-- Left Column: Priority Exceptions Queue -->
          <div class="card" style="padding: 16px;">
            <div class="card-header" style="padding: 0 0 12px 0; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 class="card-title" style="font-size: 14px; font-weight: 700; color: var(--color-midnight); margin: 0;">Priority Active Exceptions</h3>
                <span style="font-size: 11px; color: var(--color-muted-sage);">High-impact deviations requiring analyst ownership & decisioning</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('analyst_queue')">
                View All Queue (${metrics.openExceptions})
              </button>
            </div>

            ${priorityExceptions.length === 0 ? `
              <div class="analyst-empty-state">
                <div class="empty-state-icon-wrap" style="color: #1E8E3E;">
                  ${Icons.check(22)}
                </div>
                <div class="empty-state-title">No Active Exceptions Detected</div>
                <div class="empty-state-sub">All managed shipments are currently running within verified SLA parameters.</div>
              </div>
            ` : `
              <div class="table-responsive">
                <table class="data-table" style="font-size: 12px;">
                  <thead>
                    <tr>
                      <th>Exception ID</th>
                      <th>Shipment</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>SLA Impact</th>
                      <th>Analyst</th>
                      <th>Status</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${priorityExceptions.slice(0, 5).map(exc => `
                      <tr style="cursor: pointer;" onclick="AnalystDashboardView.openInvestigation('${exc.id}')">
                        <td>
                          <span style="font-weight: 700; color: var(--color-royal-navy);">${exc.id}</span>
                        </td>
                        <td>
                          <strong>${exc.shipmentId}</strong>
                        </td>
                        <td>
                          <span style="font-weight: 500; color: var(--color-midnight);">${exc.type}</span>
                        </td>
                        <td>
                          <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(exc.severity)}">
                            ${exc.severity}
                          </span>
                        </td>
                        <td>
                          <span class="badge-sla-risk ${exc.slaRisk ? exc.slaRisk.toLowerCase() : 'none'}">
                            ${exc.slaRisk || 'Nominal'}
                          </span>
                        </td>
                        <td>
                          ${exc.assignedAnalyst ? `
                            <span style="font-size: 11px; color: var(--color-charcoal); font-weight: 600;">
                              ${exc.assignedAnalyst.split(' ')[0]} ${exc.assignedAnalyst.split(' ')[1] || ''}
                            </span>
                          ` : `
                            <span class="badge" style="background: #FFF3CD; color: #856404; font-size: 10px;">Unassigned</span>
                          `}
                        </td>
                        <td>
                          <span class="badge" style="background: #F1F3F5; color: var(--color-midnight); font-weight: 600;">
                            ${exc.status}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 11px;" onclick="event.stopPropagation(); AnalystDashboardView.openInvestigation('${exc.id}')">
                            Investigate
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <!-- Right Column: Recent Activity Log -->
          <div class="card" style="padding: 16px; display: flex; flex-direction: column;">
            <div class="card-header" style="padding: 0 0 10px 0; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 class="card-title" style="font-size: 13.5px; font-weight: 700; color: var(--color-midnight); margin: 0;">Recent Activity Log</h3>
                <span style="font-size: 11px; color: var(--color-muted-sage);">Live telemetry events & milestone logs</span>
              </div>
              <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 2px 8px;" onclick="App.navigateTo('analyst_events')">
                Events Log →
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 310px; overflow-y: auto; flex: 1;">
              ${events.slice(0, 6).map(evt => `
                <div style="padding: 8px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--color-royal-navy);">${evt.shipmentId}</strong>
                    <span style="color: var(--color-muted-sage); font-size: 10px;">${this.formatTime(evt.timestamp)}</span>
                  </div>
                  <div style="font-weight: 600; color: var(--color-midnight);">${evt.eventType}</div>
                  <div style="color: var(--color-charcoal); line-height: 1.3;">${evt.details}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectShipment(shipmentId) {
    this.selectedMapShipmentId = shipmentId;
    const shipments = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipments() : [];
    const s = shipments.find(item => item.id === shipmentId);

    const bar = document.getElementById('analyst-selected-shipment-bar');
    if (bar && s) {
      const statusColor = s.status === 'Delayed' ? '#EA341F' : (s.status === 'Critical' ? '#B91C1C' : '#1E8E3E');
      bar.innerHTML = `
        <span>Selected: <strong style="color: #0F172A;">${s.id}</strong> (${s.cargoType || s.type || 'Freight'})</span>
        <span style="color: #CBD5E1;">•</span>
        <span>Status: <strong style="color: ${statusColor};">${s.status}</strong></span>
        <span style="color: #CBD5E1;">•</span>
        <span>ETA: <strong>${s.estArrival || s.eta || '2026-03-24T14:45:00Z'}</strong></span>
        <button class="btn btn-secondary btn-sm" onclick="AnalystShipmentsView ? AnalystShipmentsView.openDetailModal('${s.id}') : App.navigateTo('analyst_shipments')" style="padding: 2px 8px; font-size: 11px; margin-left: 4px;">Full Details →</button>
      `;
    }

    // Highlight unit card in floating box
    document.querySelectorAll('.analyst-floating-unit').forEach(el => {
      if (el.dataset.shipmentId === shipmentId) {
        el.style.borderColor = '#18217E';
        el.style.boxShadow = '0 0 0 2px rgba(24, 33, 126, 0.15)';
      } else {
        el.style.borderColor = '#E2E8F0';
        el.style.boxShadow = 'none';
      }
    });

    if (window.LiveTrackingMap && LiveTrackingMap.smallMap) {
      if (shipmentId === 'BRG-2846') {
        LiveTrackingMap.smallMap.panTo([29.76, -95.37]); // Gulf / South port
      } else if (shipmentId === 'BRG-2847') {
        LiveTrackingMap.smallMap.panTo([34.74, -92.28]); // Central I-30
      } else if (shipmentId === 'BRG-2843') {
        LiveTrackingMap.smallMap.panTo([39.73, -104.99]); // Mountain
      } else if (shipmentId === 'BRG-2848') {
        LiveTrackingMap.smallMap.panTo([33.74, -118.26]); // West
      }
    }
  },

  navigateToQueueFiltered(severity) {
    if (window.App) {
      App.navigateTo('analyst_queue');
      setTimeout(() => {
        if (window.AnalystQueueView) {
          AnalystQueueView.setSeverityFilter(severity);
        }
      }, 50);
    }
  },

  openInvestigation(exceptionId) {
    if (window.AnalystInvestigationView) {
      AnalystInvestigationView.openModal(exceptionId);
    }
  },

  getSeverityBadgeClass(severity) {
    switch (severity) {
      case 'Critical': return 'badge-severity-critical';
      case 'High': return 'badge-severity-high';
      case 'Medium': return 'badge-severity-medium';
      case 'Low': return 'badge-severity-low';
      default: return 'badge-severity-low';
    }
  },

  formatTime(isoString) {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  }
};

window.AnalystDashboardView = AnalystDashboardView;
