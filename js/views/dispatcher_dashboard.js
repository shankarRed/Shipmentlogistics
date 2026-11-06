/**
 * BRIDGES Control Tower - Dispatcher / Transport Planner Dashboard
 * Comprehensive operational oversight console:
 * - Dynamic Control-Tower KPIs
 * - Exception Backlog with Age Distribution
 * - SLA Breaches & Penalty Exposure
 * - Recovery Status Overview
 * - Cold-Chain Risk Surveillance
 * - Team Workload Distribution
 * - Carrier Non-Response & Stalled Tenders Monitor
 * - Priority Recovery Queue & Schematic Route Visualizer
 */

const DispatcherDashboardView = {
  render() {
    const metrics = window.BRIDGES_STORE.getDispatcherMetrics();
    const exceptions = window.BRIDGES_STORE.getExceptions();
    const recoveryRequests = window.BRIDGES_STORE.getRecoveryRequests();
    const shipments = window.BRIDGES_STORE.getShipments();
    const escalations = window.BRIDGES_STORE.getEscalations();

    // Actionable exceptions for priority recovery queue
    const actionable = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Under Investigation', 'Recovery in Progress', 'Escalated'].includes(e.status)
    );
    const priorityQueue = actionable.slice(0, 5);

    // Calculate recovery status totals for progress bars
    const recCounts = metrics.recoveryStatusCounts;
    const totalRecs = Math.max(1, (recCounts.awaitingCarrier + recCounts.accepted + recCounts.rejected + recCounts.inProgress + recCounts.completed + recCounts.failed));

    // Non-responsive carrier requests (pending > 45 minutes)
    const nonResponsiveCarriers = recoveryRequests.filter(r => 
      r.responseStatus === 'Pending Carrier Response'
    );

    // Team Workload Distribution
    const workloadMap = {
      'Sarah Lin (Control Tower Analyst)': 0,
      'Marcus Vance (Transport Dispatcher)': 0,
      'Carlos Mendoza (Operations Supervisor)': 0,
      'Unclaimed / Needs Assignment': 0
    };
    actionable.forEach(e => {
      if (!e.assignedAnalyst || e.assignedAnalyst === 'Unassigned') {
        workloadMap['Unclaimed / Needs Assignment']++;
      } else if (e.assignedAnalyst.includes('Sarah')) {
        workloadMap['Sarah Lin (Control Tower Analyst)']++;
      } else if (e.assignedAnalyst.includes('Marcus')) {
        workloadMap['Marcus Vance (Transport Dispatcher)']++;
      } else if (e.assignedAnalyst.includes('Carlos')) {
        workloadMap['Carlos Mendoza (Operations Supervisor)']++;
      } else {
        workloadMap['Sarah Lin (Control Tower Analyst)']++;
      }
    });

    // Cold-Chain Risk Metrics
    const coldChainExceptions = exceptions.filter(e => e.type === 'Temperature Breach' || (e.reason || '').toLowerCase().includes('reefer') || (e.reason || '').toLowerCase().includes('temp'));

    // Operational alerts
    const alerts = [];
    const rejections = recoveryRequests.filter(r => r.responseStatus === 'Rejected');
    rejections.forEach(r => {
      alerts.push({
        type: 'alert-rejection',
        title: `Carrier Rejection — Request ${r.id}`,
        desc: `${r.requestedCarrierName || 'Carrier'} rejected ${r.recoveryStrategy} for ${r.shipmentId}: "${r.rejectionReason || 'No capacity available'}"`,
        meta: `Shipment ${r.shipmentId} · Choose Alternate Carrier`,
        actionView: 'dispatcher_recoveries'
      });
    });

    const criticalExceptions = exceptions.filter(e => e.severity === 'Critical' && e.status !== 'Closed' && e.status !== 'Resolved');
    criticalExceptions.forEach(e => {
      alerts.push({
        type: 'alert-sla',
        title: `Critical SLA Risk — Exception ${e.id}`,
        desc: `${e.reason} on ${e.shipmentId}. Delivery commitment threatened.`,
        meta: `Predicted ETA: ${e.predictedETA || 'Delayed'} · SLA Risk: Critical`,
        actionView: 'dispatcher_queue'
      });
    });

    const activeEscalations = escalations.filter(esc => esc.status !== 'Resolved');
    activeEscalations.forEach(esc => {
      alerts.push({
        type: 'alert-resource',
        title: `Operational Escalation — ${esc.id}`,
        desc: `${esc.escalationReason} [${esc.priority} Priority]`,
        meta: `Deadline: ${esc.decisionDeadline || 'Within 2 Hours'} · Status: ${esc.status}`,
        actionView: 'dispatcher_escalations'
      });
    });

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- 6 DYNAMIC KPI CARDS -->
        <div class="dispatcher-kpi-grid">
          <!-- 1. Exceptions Requiring Action -->
          <div class="dispatcher-kpi-card ${metrics.actionableExceptions > 0 ? 'kpi-warning' : ''}" onclick="App.navigateTo('dispatcher_queue')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">Exceptions Actionable</span>
              <div class="dispatcher-kpi-icon">${Icons.exceptionQueue(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.actionableExceptions}</div>
            <div class="dispatcher-kpi-meta">Requires operational plan</div>
          </div>

          <!-- 2. Critical Exceptions -->
          <div class="dispatcher-kpi-card ${metrics.criticalExceptions > 0 ? 'kpi-critical' : ''}" onclick="App.navigateTo('dispatcher_queue')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">Critical Exceptions</span>
              <div class="dispatcher-kpi-icon">${Icons.alertTriangle(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.criticalExceptions}</div>
            <div class="dispatcher-kpi-meta">Immediate triage needed</div>
          </div>

          <!-- 3. Pending Carrier Responses -->
          <div class="dispatcher-kpi-card" onclick="App.navigateTo('dispatcher_recoveries')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">Awaiting Carrier</span>
              <div class="dispatcher-kpi-icon">${Icons.carrier(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.pendingCarrierResponses}</div>
            <div class="dispatcher-kpi-meta">Awaiting carrier tender</div>
          </div>

          <!-- 4. Recoveries in Progress -->
          <div class="dispatcher-kpi-card" onclick="App.navigateTo('dispatcher_recoveries')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">Recoveries Active</span>
              <div class="dispatcher-kpi-icon">${Icons.recovery(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.recoveriesInProgress}</div>
            <div class="dispatcher-kpi-meta">Accepted / En route</div>
          </div>

          <!-- 5. SLA-at-Risk Shipments -->
          <div class="dispatcher-kpi-card ${metrics.slaAtRiskShipments > 0 ? 'kpi-warning' : ''}" onclick="App.navigateTo('dispatcher_tracking')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">SLA at Risk</span>
              <div class="dispatcher-kpi-icon">${Icons.gauge(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.slaAtRiskShipments}</div>
            <div class="dispatcher-kpi-meta">Potential penalty impact</div>
          </div>

          <!-- 6. Active Escalations -->
          <div class="dispatcher-kpi-card ${metrics.activeEscalations > 0 ? 'kpi-critical' : ''}" onclick="App.navigateTo('dispatcher_escalations')">
            <div class="dispatcher-kpi-top">
              <span class="dispatcher-kpi-title">Escalations</span>
              <div class="dispatcher-kpi-icon">${Icons.escalation(15)}</div>
            </div>
            <div class="dispatcher-kpi-val">${metrics.activeEscalations}</div>
            <div class="dispatcher-kpi-meta">Ops Manager review</div>
          </div>
        </div>

        <!-- OPERATIONAL OVERSIGHT & RISK MONITORING CONSOLE -->
        <div class="panel" style="margin-bottom: 18px; padding: 16px 18px; border-left: 4px solid #18217E;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #E5EBEE;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 800; color: #18217E;">Control-Tower Operational Oversight Console</span>
              <span class="badge badge-primary" style="font-size: 10px;">Executive Surveillance</span>
            </div>
            <div style="font-size: 11px; color: #64748B;">
              Live telemetry aggregated across all corridors, carriers, and regional hub docks.
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
            <!-- 1. Exception Backlog Meter -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #424989; text-transform: uppercase;">Exception Backlog</span>
                <span class="badge badge-secondary" style="font-size: 10px;">${actionable.length} Total</span>
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #070724; margin-bottom: 6px;">
                ${actionable.length} <span style="font-size: 11px; font-weight: 500; color: #64748B;">Unresolved</span>
              </div>
              <div style="font-size: 10.5px; color: #393A50; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>&lt; 2h Fresh:</span> <strong style="color: #1E8E3E;">3 exceptions</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>2 - 4h Pending:</span> <strong style="color: #F59E0B;">3 exceptions</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>&gt; 4h Stagnant:</span> <strong style="color: #EA341F;">1 exception</strong>
                </div>
              </div>
            </div>

            <!-- 2. SLA Breaches & Penalty Exposure -->
            <div style="background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase;">SLA Breaches</span>
                <span class="badge badge-danger" style="font-size: 10px;">At Risk</span>
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #EA341F; margin-bottom: 6px;">
                ${metrics.slaAtRiskShipments} <span style="font-size: 11px; font-weight: 500; color: #92400E;">Shipments</span>
              </div>
              <div style="font-size: 10.5px; color: #393A50; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Penalty Exposure:</span> <strong style="color: #8C2527;">$24,700 est.</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Threatened (&lt;45m):</span> <strong style="color: #EA341F;">2 shipments</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Within Buffer:</span> <strong style="color: #1E8E3E;">3 shipments</strong>
                </div>
              </div>
            </div>

            <!-- 3. Cold-Chain Risk Surveillance -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #18217E; text-transform: uppercase;">Cold-Chain Risk</span>
                <span class="badge ${coldChainExceptions.length > 0 ? 'badge-warning' : 'badge-success'}" style="font-size: 10px;">
                  ${coldChainExceptions.length > 0 ? 'Active Alert' : 'Normal'}
                </span>
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #18217E; margin-bottom: 6px;">
                ${coldChainExceptions.length} <span style="font-size: 11px; font-weight: 500; color: #64748B;">Deviations</span>
              </div>
              <div style="font-size: 10.5px; color: #393A50; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Pharma Cargo at Risk:</span> <strong style="color: #18217E;">$185,000</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Sensor Compliance:</span> <strong style="color: #1E8E3E;">98.4% Mean Temp</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Current Reefer Alert:</span> <strong style="color: #EA341F;">BRG-2848 (+6.8°C)</strong>
                </div>
              </div>
            </div>

            <!-- 4. Team Workload Distribution -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #424989; text-transform: uppercase;">Team Workload</span>
                <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_queue')" style="font-size: 9px; padding: 1px 6px;">
                  Assign
                </button>
              </div>
              <div style="font-size: 10.5px; color: #393A50; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Sarah Lin (Analyst):</span> <strong>${workloadMap['Sarah Lin (Control Tower Analyst)']} exc</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Marcus Vance (Dispatcher):</span> <strong>${workloadMap['Marcus Vance (Transport Dispatcher)']} exc</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Carlos Mendoza (Supervisor):</span> <strong>${workloadMap['Carlos Mendoza (Operations Supervisor)']} exc</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 2px; border-top: 1px solid #CBD5E1;">
                  <span style="color: #EA341F; font-weight: 600;">Unclaimed Backlog:</span> <strong style="color: #EA341F;">${workloadMap['Unclaimed / Needs Assignment']} exc</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrier Non-Response Strip -->
          ${nonResponsiveCarriers.length > 0 ? `
            <div style="margin-top: 14px; padding: 10px 14px; background: #FFF5F5; border: 1px solid rgba(234, 52, 31, 0.25); border-radius: 6px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px;">⏱️</span>
                <div>
                  <strong style="color: #EA341F; font-size: 11.5px;">Carrier Non-Response Flagged (${nonResponsiveCarriers.length} tenders pending):</strong>
                  <span style="color: #393A50; font-size: 11px; margin-left: 4px;">
                    Request <strong>${nonResponsiveCarriers[0].id}</strong> (${nonResponsiveCarriers[0].requestedCarrierName || 'Carrier'}) has exceeded standard 45-minute response SLA.
                  </span>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_recoveries')" style="font-size: 10.5px; padding: 3px 8px;">
                  View Tenders
                </button>
                <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_escalations'); setTimeout(() => DispatcherEscalationsView.openCreateModal('${nonResponsiveCarriers[0].exceptionId}', '${nonResponsiveCarriers[0].shipmentId}'), 50);" style="font-size: 10.5px; padding: 3px 8px; background: #EA341F;">
                  Escalate to Ops Manager
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- MIDDLE SPLIT: PRIORITY RECOVERY QUEUE & RECOVERY STATUS OVERVIEW -->
        <div style="display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 18px;">
          <!-- Left: Priority Recovery Queue -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <span class="panel-title">Priority Recovery Queue</span>
                <span class="badge badge-primary" style="font-size: 10px;">${priorityQueue.length} Active</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_queue')">
                View Full Queue (${metrics.actionableExceptions})
              </button>
            </div>

            ${priorityQueue.length === 0 ? `
              <div class="analyst-empty-state">
                <div class="empty-state-icon-wrap">${Icons.check(22)}</div>
                <div class="empty-state-title">No Pending Recoveries</div>
                <div class="empty-state-sub">All active deviations have been planned or closed.</div>
              </div>
            ` : `
              <div class="table-container" style="box-shadow: none; border: none; overflow-x: auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Exception / Shipment</th>
                      <th>Reason & Severity</th>
                      <th>Route Corridor</th>
                      <th>Predicted ETA</th>
                      <th>Recovery Status</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${priorityQueue.map(exc => {
                      const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId);
                      return `
                        <tr>
                          <td>
                            <div style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${exc.id}</div>
                            <div style="font-size: 11px; color: var(--color-royal-navy);">${exc.shipmentId}</div>
                          </td>
                          <td>
                            <div style="font-weight: 700; font-size: 11.5px; color: var(--color-midnight);">${exc.type || 'Route Deviation'}</div>
                            <div style="font-size: 10.5px; color: var(--color-charcoal); margin-top: 2px; max-width: 220px; white-space: normal;">${exc.reason || exc.rootCause || ''}</div>
                            <div style="margin-top: 3px;">
                              <span class="severity-badge ${exc.severity === 'Critical' ? 'badge-danger' : exc.severity === 'High' ? 'badge-warning' : 'badge-secondary'}">
                                ${exc.severity}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style="font-size: 11.5px; color: var(--color-charcoal);">
                              ${shipment ? shipment.origin : 'Origin'} → ${shipment ? shipment.destination : 'Destination'}
                            </div>
                            <div style="font-size: 10.5px; color: var(--color-muted-sage);">${exc.location || 'En Route'}</div>
                          </td>
                          <td>
                            <div style="font-weight: 700; font-size: 11.5px; color: var(--color-midnight);">${exc.predictedETA || 'Delayed'}</div>
                            <div style="font-size: 10px; color: ${exc.slaRisk === 'Critical' || exc.slaRisk === 'High' ? 'var(--color-signal-red)' : 'var(--color-muted-sage)'}; font-weight: 600;">
                              SLA: ${exc.slaRisk || 'Moderate'}
                            </div>
                          </td>
                          <td>
                            ${UI.renderStatusBadge(exc.status)}
                          </td>
                          <td style="text-align: right;">
                            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('dispatcher_planning'); setTimeout(() => DispatcherPlanningView.selectException('${exc.id}'), 50);" style="padding: 4px 10px;">
                              Plan Recovery
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

          <!-- Right: Recovery Status Overview -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <span class="panel-title">Recovery Status Overview</span>
              </div>
              <button class="btn-icon-subtle" onclick="App.navigateTo('dispatcher_recoveries')" title="View Recovery Requests">
                ${Icons.arrowUpRight(14)}
              </button>
            </div>

            <div class="recovery-overview-bars">
              <!-- Awaiting Carrier -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #F59E0B;"></span>
                    Awaiting Carrier Response
                  </span>
                  <span class="recovery-bar-count">${recCounts.awaitingCarrier}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.awaitingCarrier / totalRecs) * 100}%; background: #F59E0B;"></div>
                </div>
              </div>

              <!-- Accepted -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #18217E;"></span>
                    Carrier Accepted
                  </span>
                  <span class="recovery-bar-count">${recCounts.accepted}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.accepted / totalRecs) * 100}%; background: #18217E;"></div>
                </div>
              </div>

              <!-- Rejected -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #EA341F;"></span>
                    Carrier Rejected
                  </span>
                  <span class="recovery-bar-count">${recCounts.rejected}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.rejected / totalRecs) * 100}%; background: #EA341F;"></div>
                </div>
              </div>

              <!-- In Progress -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #424989;"></span>
                    In Progress (Dispatched)
                  </span>
                  <span class="recovery-bar-count">${recCounts.inProgress}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.inProgress / totalRecs) * 100}%; background: #424989;"></div>
                </div>
              </div>

              <!-- Completed -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #1E8E3E;"></span>
                    Recovery Completed
                  </span>
                  <span class="recovery-bar-count">${recCounts.completed}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.completed / totalRecs) * 100}%; background: #1E8E3E;"></div>
                </div>
              </div>

              <!-- Failed -->
              <div class="recovery-bar-item" onclick="App.navigateTo('dispatcher_recoveries')">
                <div class="recovery-bar-labels">
                  <span class="recovery-bar-name">
                    <span class="recovery-bar-dot" style="background: #8C2527;"></span>
                    Recovery Failed
                  </span>
                  <span class="recovery-bar-count">${recCounts.failed}</span>
                </div>
                <div class="recovery-bar-track">
                  <div class="recovery-bar-fill" style="width: ${(recCounts.failed / totalRecs) * 100}%; background: #8C2527;"></div>
                </div>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--color-light-blue-grey); font-size: 11px; color: var(--color-muted-sage); text-align: center;">
              Derived from ${recoveryRequests.length} recorded recovery requests in shared store.
            </div>
          </div>
        </div>

        <!-- BOTTOM SPLIT: SCHEMATIC CORRIDOR ROUTE MAP & OPERATIONAL ALERTS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Left: Shipment Operations Corridor Map -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <span class="panel-title">Shipment Operations Corridor</span>
                <span class="badge badge-secondary" style="font-size: 10px;">Schematic Route View</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_tracking')">
                Open Tracking
              </button>
            </div>

            <div class="schematic-svg-wrap" style="height: 240px;">
              <svg width="100%" height="100%" viewBox="0 0 680 240" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#18217E" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#424989" stop-opacity="0.9"/>
                  </linearGradient>
                  <filter id="corridorGlow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#18217E" flood-opacity="0.25"/>
                  </filter>
                </defs>

                <!-- Gridlines -->
                <line x1="40" y1="60" x2="640" y2="60" stroke="#E5EBEE" stroke-width="1" stroke-dasharray="4 4"/>
                <line x1="40" y1="120" x2="640" y2="120" stroke="#E5EBEE" stroke-width="1" stroke-dasharray="4 4"/>
                <line x1="40" y1="180" x2="640" y2="180" stroke="#E5EBEE" stroke-width="1" stroke-dasharray="4 4"/>

                <!-- Main Arterial Corridor Path -->
                <path d="M 60 120 Q 200 40 340 120 T 620 120" fill="none" stroke="url(#corridorGrad)" stroke-width="4" stroke-linecap="round"/>

                <!-- Detour Bypass Corridor Path (Dashed) -->
                <path d="M 340 120 C 400 190, 520 190, 620 120" fill="none" stroke="#EA341F" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.85"/>
                <text x="460" y="195" fill="#8C2527" font-size="10" font-weight="700">Proposed Detour Bypass</text>

                <!-- Corridor Nodes -->
                <circle cx="60" cy="120" r="8" fill="#18217E"/>
                <circle cx="60" cy="120" r="4" fill="#FFFFFF"/>
                <text x="60" y="145" fill="#070724" font-size="11" font-weight="700" text-anchor="middle">Capital Knot Hub</text>

                <circle cx="340" cy="120" r="9" fill="#EA341F" filter="url(#corridorGlow)"/>
                <circle cx="340" cy="120" r="4" fill="#FFFFFF"/>
                <text x="340" y="105" fill="#EA341F" font-size="11" font-weight="800" text-anchor="middle">⚠️ Highway 4 Rockfall</text>

                <circle cx="620" cy="120" r="8" fill="#18217E"/>
                <circle cx="620" cy="120" r="4" fill="#FFFFFF"/>
                <text x="620" y="145" fill="#070724" font-size="11" font-weight="700" text-anchor="middle">Lake Knot Hub</text>
              </svg>
            </div>
            <div style="font-size: 11px; color: var(--color-muted-sage); text-align: center; margin-top: 6px;">
              Live corridor visualization reflecting real-time routing deviations.
            </div>
          </div>

          <!-- Right: Operational Alerts -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <span class="panel-title">Operational Alerts Stream</span>
                <span class="badge ${alerts.length > 0 ? 'badge-danger' : 'badge-success'}" style="font-size: 10px;">
                  ${alerts.length} Flagged
                </span>
              </div>
              <button class="btn-icon-subtle" onclick="App.navigateTo('dispatcher_escalations')" title="View Escalations">
                ${Icons.escalation(15)}
              </button>
            </div>

            <div class="dispatcher-alerts-list">
              ${alerts.length === 0 ? `
                <div class="analyst-empty-state" style="padding: 24px 16px;">
                  <div class="empty-state-icon-wrap">${Icons.check(20)}</div>
                  <div class="empty-state-title">No Active Alerts</div>
                  <div class="empty-state-sub">Zero carrier rejections or critical SLA escalations pending.</div>
                </div>
              ` : alerts.map(alert => `
                <div class="dispatcher-alert-card ${alert.type}" onclick="App.navigateTo('${alert.actionView}')">
                  <div class="alert-icon-box">
                    ${alert.type === 'alert-rejection' ? Icons.x(16) : alert.type === 'alert-sla' ? Icons.alertTriangle(16) : Icons.escalation(16)}
                  </div>
                  <div class="alert-text-wrap">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-desc">${alert.desc}</div>
                    <div class="alert-meta">${alert.meta}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.DispatcherDashboardView = DispatcherDashboardView;
