/**
 * BRIDGES Control Tower - Warehouse Supervisor Dashboard View
 * Phase 5: Real-time operational oversight for warehouse floor
 * Displays live calculated KPIs, Today's queue, Dock utilization, Operational blockers, and Milestones.
 */

window.WarehouseDashboardView = {
  render() {
    const store = window.BRIDGES_STORE;
    const whId = store.getCurrentWarehouseId();
    const warehouse = store.getWarehouse(whId) || { name: 'Dallas Central Logistics Hub', id: 'WH-DAL-01' };
    const metrics = store.getWarehouseMetrics(whId);
    const shipments = store.getWarehouseShipments(whId);
    const docks = store.getWarehouseDocks(whId);
    const blockers = store.getWarehouseBlockers(whId).filter(b => b.status === 'Open');
    const diversions = store.getDiversions(whId);
    const etaAlerts = store.getEtaChangeAlerts(whId);
    const pendingEtaAlerts = etaAlerts.filter(a => a.status === 'Pending Response');

    return `
      <div class="warehouse-view-container animate-fade-in">


        <!-- 6 DYNAMIC CALCULATED KPI CARDS -->
        <div class="warehouse-kpi-grid">
          <!-- KPI 1 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_readiness')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Requiring Action</span>
              <div class="warehouse-kpi-icon" style="color: #18217E; background: rgba(24, 33, 126, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val">${metrics.requiringAction}</div>
            <div class="warehouse-kpi-sub">
              <span>Active queue</span>
              <span class="warehouse-kpi-link">View readiness &rarr;</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_readiness')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Awaiting Readiness</span>
              <div class="warehouse-kpi-icon" style="color: #424989; background: rgba(66, 73, 137, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val">${metrics.awaitingReadiness}</div>
            <div class="warehouse-kpi-sub">
              <span>Checks incomplete</span>
              <span class="warehouse-kpi-link">Verify &rarr;</span>
            </div>
          </div>

          <!-- KPI 3 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_readiness')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Picking / Packing</span>
              <div class="warehouse-kpi-icon" style="color: #09104D; background: rgba(9, 16, 77, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val">${metrics.pickingPackingInProgress}</div>
            <div class="warehouse-kpi-sub">
              <span>On warehouse floor</span>
              <span class="warehouse-kpi-link">Verify &rarr;</span>
            </div>
          </div>

          <!-- KPI 4 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_docks')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Awaiting Loading</span>
              <div class="warehouse-kpi-icon" style="color: #18217E; background: rgba(24, 33, 126, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val">${metrics.awaitingLoading}</div>
            <div class="warehouse-kpi-sub">
              <span>Dock staging</span>
              <span class="warehouse-kpi-link">Load bays &rarr;</span>
            </div>
          </div>

          <!-- KPI 5 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_docks')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Awaiting Handover</span>
              <div class="warehouse-kpi-icon" style="color: #424989; background: rgba(66, 73, 137, 0.08);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val">${metrics.dispatchesAwaitingHandover}</div>
            <div class="warehouse-kpi-sub">
              <span>Ready for carrier</span>
              <span class="warehouse-kpi-link">Dock schedule &rarr;</span>
            </div>
          </div>

          <!-- KPI 6 -->
          <div class="warehouse-kpi-card" onclick="App.navigate('warehouse_exceptions')">
            <div class="warehouse-kpi-top">
              <span class="warehouse-kpi-title">Warehouse Blockers</span>
              <div class="warehouse-kpi-icon" style="color: #EA341F; background: rgba(234, 52, 31, 0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            <div class="warehouse-kpi-val" style="color: ${metrics.warehouseBlockers > 0 ? '#EA341F' : '#070724'};">${metrics.warehouseBlockers}</div>
            <div class="warehouse-kpi-sub">
              <span style="color: ${metrics.warehouseBlockers > 0 ? '#EA341F' : '#393A50'};">${metrics.warehouseBlockers > 0 ? 'Action required' : 'Clear floor'}</span>
              <span class="warehouse-kpi-link">Resolve &rarr;</span>
            </div>
          </div>
        </div>

        <!-- TODAY'S WAREHOUSE QUEUE (FULL WIDTH) -->
        <div class="warehouse-card" style="margin-bottom: 18px;">
          <div class="warehouse-card-header">
                <div class="warehouse-card-header-left">
                  <h3 class="warehouse-card-title">Today's Warehouse Queue</h3>
                  <span class="warehouse-card-subtitle">${shipments.length} Active shipments assigned to this facility</span>
                </div>
                <div class="warehouse-card-header-right">
                  <button class="btn btn-outline btn-xs" onclick="App.navigate('warehouse_readiness')">View Readiness</button>
                </div>
              </div>
              <div class="warehouse-table-responsive">
                <table class="warehouse-table">
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Direction</th>
                      <th>Cargo &amp; Temp Spec</th>
                      <th>Carrier &amp; Vehicle</th>
                      <th>Schedule &amp; Latest ETA</th>
                      <th>Dock Bay</th>
                      <th>Readiness</th>
                      <th style="text-align: right;">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${shipments.length === 0 ? `
                      <tr>
                        <td colspan="8" class="warehouse-empty-cell">
                          <div class="warehouse-empty-state">
                            <p>No shipments scheduled for ${warehouse.name} today.</p>
                          </div>
                        </td>
                      </tr>
                    ` : shipments.slice(0, 6).map(s => {
                      const readiness = store.getWarehouseReadiness(s.id);
                      const rStatus = readiness ? readiness.overallStatus : 'Pending Checks';
                      const badgeClass = rStatus === 'Ready' ? 'badge-ready' : (rStatus === 'Blocked' ? 'badge-blocked' : 'badge-progress');
                      const dirBadge = s.direction === 'Inbound' ? 'badge-inbound' : 'badge-outbound';
                      const plannedTime = s.direction === 'Inbound' 
                        ? (s.plannedArrival ? new Date(s.plannedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.originalETA ? new Date(s.originalETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:00'))
                        : (s.plannedDeparture ? new Date(s.plannedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:00');
                      const latestTime = s.latestETA ? new Date(s.latestETA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : plannedTime;
                      
                      return `
                        <tr>
                          <td class="font-mono font-bold">
                            <a href="javascript:void(0)" onclick="WarehouseShipmentsView.openDetailModal('${s.id}')" style="color: #18217E; text-decoration: none;">
                              ${s.id}
                            </a>
                            <div class="text-xs text-muted font-normal">${s.orderReference || s.orderId || 'ORD'}</div>
                          </td>
                          <td><span class="badge ${dirBadge}">${s.direction}</span></td>
                          <td>
                            <div class="cell-primary text-truncate" style="max-width: 140px; font-weight: 600;">${s.cargoType || s.cargoCategory}</div>
                            <span class="badge ${s.isColdChain ? 'badge-coldchain' : 'badge-subtle'}" style="font-size: 10px; margin-top: 2px;">
                              ${s.isColdChain ? '❄️ ' : ''}${s.tempRange || 'Ambient'}
                            </span>
                          </td>
                          <td>
                            <div class="cell-primary font-bold text-truncate" style="max-width: 130px;">${s.carrierName || 'Bridges Logistics'}</div>
                            <div class="cell-sub font-mono text-xs">${s.vehiclePlate || 'Plate TBD'}</div>
                          </td>
                          <td>
                            <div class="font-mono text-xs font-bold" style="color: ${s.isDelayed ? '#EA341F' : '#070724'};">${latestTime}</div>
                            <div class="text-xs text-muted font-mono">Plan: ${plannedTime}</div>
                          </td>
                          <td>
                            ${s.assignedDock ? `<span class="badge badge-dock">${s.assignedDock}</span>` : `<span class="text-muted text-xs">Unassigned</span>`}
                          </td>
                          <td>
                            <span class="badge ${badgeClass}">${rStatus}</span>
                          </td>
                          <td style="text-align: right; white-space: nowrap;">
                            <button class="btn btn-outline btn-xs" onclick="WarehouseShipmentsView.openDetailModal('${s.id}')">
                              Details
                            </button>
                            <button class="btn btn-secondary btn-xs" onclick="WarehouseShipmentsView.openMilestoneModal('${s.id}')">
                              Milestone
                            </button>
                            ${s.direction === 'Inbound' && !s.receivingRecord ? `
                              <button class="btn btn-primary btn-xs" onclick="WarehouseShipmentsView.openReceivingModal('${s.id}')">
                                Receive
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

            <!-- 2-COLUMN LOWER DASHBOARD GRID -->
            <div class="warehouse-dashboard-bottom-grid">
              <!-- LEFT COLUMN: UPCOMING OPERATIONS MILESTONES -->
              <div class="warehouse-card">
                <div class="warehouse-card-header">
                  <div class="warehouse-card-header-left">
                    <h3 class="warehouse-card-title">Upcoming Operations Milestones</h3>
                    <span class="warehouse-card-subtitle">Scheduled arrivals, loading cutoffs, and dispatch deadlines</span>
                  </div>
                </div>
                <div class="warehouse-milestones-list">
                  ${this.renderMilestones(shipments, docks)}
                </div>
              </div>

              <!-- RIGHT COLUMN: DOCK UTILIZATION -->
              <div class="warehouse-card">
                <div class="warehouse-card-header">
                  <div class="warehouse-card-header-left">
                    <h3 class="warehouse-card-title">Dock Bay Utilization</h3>
                    <span class="warehouse-card-subtitle">${docks.filter(d => d.status === 'Occupied').length} / ${docks.length} Bays currently occupied</span>
                  </div>
                  <div class="warehouse-card-header-right">
                    <button class="btn btn-outline btn-xs" onclick="App.navigate('warehouse_docks')">Manage Docks</button>
                  </div>
                </div>
                <div class="warehouse-dock-grid-compact">
                  ${docks.map(dock => {
                    const statusClass = dock.status === 'Available' ? 'dock-avail' : (dock.status === 'Occupied' ? 'dock-occ' : 'dock-maint');
                    return `
                      <div class="warehouse-dock-card-compact ${statusClass}" onclick="App.navigate('warehouse_docks')">
                        <div class="dock-compact-top">
                          <span class="dock-compact-id">${dock.id}</span>
                          <span class="badge badge-xs ${dock.status === 'Available' ? 'badge-ready' : (dock.status === 'Occupied' ? 'badge-inbound' : 'badge-blocked')}">${dock.status}</span>
                        </div>
                        <div class="dock-compact-type">${dock.type}</div>
                        ${dock.currentShipmentId ? `
                          <div class="dock-compact-shipment">
                            <span class="font-mono font-bold">${dock.currentShipmentId}</span>
                            <span class="text-xs text-muted">(${dock.carrier || 'Carrier'})</span>
                          </div>
                        ` : `
                          <div class="dock-compact-empty">Bay Ready for Assignment</div>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    renderMilestones(shipments, docks) {
    const milestones = [
      {
        time: '11:00 AM',
        title: 'Dock Appointment: DOCK-02',
        sub: 'BRG-2847 (BGL) - Scheduled Loading Staging',
        type: 'dock'
      },
      {
        time: '12:00 PM',
        title: 'Picking Cutoff: BRG-2847',
        sub: 'Industrial Electronics & Sensors (230 units)',
        type: 'picking'
      },
      {
        time: '13:00 PM',
        title: 'Loading Deadline: BRG-2842',
        sub: 'Rotary Gears & Hydraulic Gaskets (DOCK-01)',
        type: 'loading'
      },
      {
        time: '14:45 PM',
        title: 'Dispatch Window: BRG-2846',
        sub: 'Pacific Marine Cargo Line - Handover scheduled',
        type: 'dispatch'
      },
      {
        time: '17:30 PM',
        title: 'Emergency Diversion Inbound: BRG-2845',
        sub: 'Rerouted due to severe weather delay (Cold-chain vaccines)',
        type: 'diversion'
      }
    ];

    return milestones.map(m => `
      <div class="warehouse-milestone-row">
        <div class="milestone-time font-mono">${m.time}</div>
        <div class="milestone-indicator milestone-ind-${m.type}"></div>
        <div class="milestone-details">
          <div class="milestone-title">${m.title}</div>
          <div class="milestone-sub">${m.sub}</div>
        </div>
      </div>
    `).join('');
  }
};
