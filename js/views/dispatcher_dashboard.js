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

    // Actionable exceptions for priority recovery queue
    const actionable = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Under Investigation', 'Recovery in Progress', 'Escalated'].includes(e.status)
    );
    const priorityQueue = actionable.slice(0, 5);

    // Calculate recovery status totals for progress bars
    const recCounts = metrics.recoveryStatusCounts;
    const totalRecs = Math.max(1, (recCounts.awaitingCarrier + recCounts.accepted + recCounts.rejected + recCounts.inProgress + recCounts.completed + recCounts.failed));

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- 4 DYNAMIC KPI CARDS -->
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
      </div>
    `;
  }
};

window.DispatcherDashboardView = DispatcherDashboardView;
