/**
 * BRIDGES Control Tower - Dashboard View
 * Visual structure, typography, and alignments matching the reference image 100%
 */

const DashboardView = {
  render() {
    const metrics = window.BRIDGES_STORE.getMetrics();
    const shipments = window.BRIDGES_STORE.getShipments();

    return `
      <div class="view-dashboard animate-fade-in">
        <!-- Top 4 KPI Cards (Matches Reference Mockup Top Row) -->
        <div class="kpi-grid">
          <!-- 1. Total Shipments -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-title-wrap">
                <span class="kpi-icon-wrap">${Icons.calendar(16)}</span>
                <span class="kpi-label">Total Shipments</span>
              </div>
              <button class="kpi-action-dots" title="Options">${Icons.more(14)}</button>
            </div>
            <div class="kpi-metric">12,847</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">vs last month</span>
              <span class="kpi-trend trend-positive">
                ${Icons.arrowUpRight(12)} +12.5%
              </span>
            </div>
          </div>

          <!-- 2. Active Deliveries -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-title-wrap">
                <span class="kpi-icon-wrap">${Icons.deliveryVan(16)}</span>
                <span class="kpi-label">Active Deliveries</span>
              </div>
              <button class="kpi-action-dots" title="Options">${Icons.more(14)}</button>
            </div>
            <div class="kpi-metric">426</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">vs last month</span>
              <span class="kpi-trend trend-positive">
                ${Icons.arrowUpRight(12)} +8.2%
              </span>
            </div>
          </div>

          <!-- 3. Fleet Utilization -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-title-wrap">
                <span class="kpi-icon-wrap">${Icons.fleetTruck(16)}</span>
                <span class="kpi-label">Fleet Utilization</span>
              </div>
              <button class="kpi-action-dots" title="Options">${Icons.more(14)}</button>
            </div>
            <div class="kpi-metric">87.3%</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">vs last month</span>
              <span class="kpi-trend trend-positive">
                ${Icons.arrowUpRight(12)} +3.1%
              </span>
            </div>
          </div>

          <!-- 4. On Time Delivery -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-title-wrap">
                <span class="kpi-icon-wrap">${Icons.onTimeCheck(16)}</span>
                <span class="kpi-label">On Time Delivery</span>
              </div>
              <button class="kpi-action-dots" title="Options">${Icons.more(14)}</button>
            </div>
            <div class="kpi-metric">94.8%</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">vs last month</span>
              <span class="kpi-trend trend-pill-negative">
                ${Icons.arrowDownRight(11)} -1.2%
              </span>
            </div>
          </div>
        </div>

        <!-- Live Tracking Panel (Full Width) -->
        <div class="panel map-tracking-panel" style="margin-bottom: 20px;">
          <div class="panel-header">
            <div class="panel-title-wrap">
              <h3 class="panel-title">Live Tracking</h3>
              <span class="info-circle-icon" title="Real-time telemetry monitoring 500 enterprise carriers">i</span>
              <span class="badge badge-success" style="font-size: 11px; margin-left: 6px;">500 Carriers Live</span>
            </div>
            <div class="panel-controls">
              <div class="search-input-group" style="width: 170px;">
                <span class="icon">${Icons.search(13)}</span>
                <input type="text" placeholder="Search carrier..." style="padding: 4px 10px 4px 26px; font-size: 11.5px;" oninput="LiveTrackingMap.openFullscreen(); document.getElementById('fullscreen-tracking-search').value = this.value; LiveTrackingMap.handleSearch(this.value);">
              </div>
              <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.openApiKeyModal()" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; font-size: 11px; margin-right: 2px;" title="Real-World Map API Key &amp; Provider Settings">
                🔑 Map Key
              </button>
              <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.openFullscreen()" title="Open Fullscreen Interactive Map">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                Fullscreen
              </button>
            </div>
          </div>

          <!-- Interactive Real-World Map Viewport -->
          <div class="map-viewport-container" onclick="LiveTrackingMap.openFullscreen()" style="cursor: pointer; position: relative; overflow: hidden; height: 380px;" title="Click to open Fullscreen Pan & Zoom Real-World Map">
            <!-- Live Real-World Map driven by LiveTrackingMap -->
            <div id="live-tracking-small-map" class="live-map-canvas" style="width: 100%; height: 100%; position: absolute; inset: 0; z-index: 1;"></div>
            <canvas id="live-tracking-small-canvas" class="live-map-canvas" style="display: none;"></canvas>

            <!-- Zoom Controls -->
            <div class="map-zoom-controls">
              <button class="map-zoom-btn" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.zoomIn();" title="Zoom In">+</button>
              <button class="map-zoom-btn" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.zoomOut();" title="Zoom Out">−</button>
            </div>

            <!-- Floating Detail Tracking Card (Matches Reference Image Exactly) -->
            <div class="map-floating-card">
              <div class="detail-tracking-box">
                <div class="detail-header">
                  <span class="detail-title">Detail Tracking</span>
                  <button class="btn-icon-subtle">${Icons.more(13)}</button>
                </div>

                <!-- Unit 1: FR-23 On Route -->
                <div class="detail-unit-card active-route" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.handleSearch('FR-23');" style="cursor: pointer;" title="Click to view live in telemetry map">
                  <div class="unit-top">
                    <span class="unit-code">FR-23</span>
                    <span class="status-pill on-route"><span class="status-pill-dot"></span>On Route</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">CK</span>
                      <span class="path-label">Capital Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line"></div>
                      <span class="path-bullet green"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">LK</span>
                      <span class="path-label">Lake Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.truck(12)} Bridges Transport Truck</span>
                    <span class="telemetry-speed-green">68 km/h</span>
                  </div>
                  <div class="unit-driver-row">
                    <div class="driver-info">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60" alt="Ethan Cole" class="driver-avatar-mini">
                      <span class="driver-name">Ethan Cole</span>
                    </div>
                    <span class="unit-eta">ETA: <strong>25m</strong></span>
                  </div>
                </div>

                <!-- Unit 2: ST-09 Delayed -->
                <div class="detail-unit-card delayed-route" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.handleSearch('ST-09');" style="cursor: pointer; margin-top: 8px;" title="Click to view live in telemetry map">
                  <div class="unit-top">
                    <span class="unit-code">ST-09</span>
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
                      <span class="path-code">MK</span>
                      <span class="path-label">Mountain Knot</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.ship(12)} Bridges Cargo Vessel</span>
                    <span class="telemetry-speed-grey">12 km/h</span>
                  </div>
                  <div style="margin-top: 6px; padding: 4px 6px; background: rgba(234, 52, 31, 0.08); border-left: 2px solid #EA341F; border-radius: 4px; font-size: 10px; color: #8C2527; font-weight: 600; line-height: 1.3;">
                    ⚠️ Reason: Port Gate Congestion &amp; High Tide Berth Delay
                  </div>
                </div>

                <!-- Unit 3: TR-14 Arrived & Available -->
                <div class="detail-unit-card arrived-route" onclick="event.stopPropagation(); LiveTrackingMap.openFullscreen(); LiveTrackingMap.handleSearch('TR-14');" style="cursor: pointer; margin-top: 8px;" title="Click to view arrived available unit in telemetry map">
                  <div class="unit-top">
                    <span class="unit-code">TR-14</span>
                    <span class="status-pill available"><span class="status-pill-dot"></span>Available & Ready</span>
                  </div>
                  <div class="unit-path">
                    <div class="path-stop">
                      <span class="path-code">NEK</span>
                      <span class="path-label">North East Knot</span>
                    </div>
                    <div class="path-line-wrap">
                      <div class="path-line" style="background: #10B981;"></div>
                      <span class="path-bullet green" style="background: #10B981;"></span>
                    </div>
                    <div class="path-stop text-right">
                      <span class="path-code">CK</span>
                      <span class="path-label">Capital Knot (Docked)</span>
                    </div>
                  </div>
                  <div class="unit-telemetry">
                    <span class="telemetry-item">${Icons.truck(12)} Bridges Express Van</span>
                    <span class="telemetry-speed-green" style="color: #059669; font-weight: 700;">0 km/h · Docked</span>
                  </div>
                  <div class="unit-driver-row">
                    <div class="driver-info">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60" alt="Sarah Chen" class="driver-avatar-mini">
                      <span class="driver-name">Sarah Chen</span>
                    </div>
                    <span class="unit-eta" style="color: #059669; font-weight: 700;">Status: <strong>Available</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Shipments Table (Full Width) -->
        <div class="panel shipments-panel">
          <div class="panel-header">
              <div class="panel-title-wrap">
                <h3 class="panel-title">Recent Shipments</h3>
                <span class="info-circle-icon" title="Latest dispatch records">i</span>
              </div>
              <div class="panel-controls">
                <div class="search-input-group" style="width: 160px;">
                  <span class="icon">${Icons.search(13)}</span>
                  <input type="text" placeholder="Search" style="padding: 4px 10px 4px 26px; font-size: 11.5px;" oninput="DashboardView.filterShipments(this.value)">
                </div>
                <button class="btn-icon-subtle">${Icons.more(14)}</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table" id="recent-shipments-table">
                <thead>
                  <tr>
                    <th>
                      <div class="th-content">Tracking ID <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Origin <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Destination <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Est. Arrival <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Vehicle ID <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Driver <span class="sort-icon-subtle">↕</span></div>
                    </th>
                    <th>
                      <div class="th-content">Status <span class="sort-icon-subtle">↕</span></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Row 1: BRG-2848 -->
                  <tr>
                    <td class="font-bold">#BRG-2848</td>
                    <td>West Of Capital Kn...</td>
                    <td class="text-muted">—</td>
                    <td class="text-muted">—</td>
                    <td>
                      <span class="vehicle-cell-inline">${Icons.plane(13)} AT-77</span>
                    </td>
                    <td>
                      <div class="driver-cell-inline">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=60" alt="Olivia Hayes" class="driver-avatar-circle">
                        <span>Olivia Hayes</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill loading"><span class="status-pill-dot"></span>Loading</span>
                    </td>
                  </tr>

                  <!-- Row 2: BRG-2847 -->
                  <tr>
                    <td class="font-bold">#BRG-2847</td>
                    <td>Capital Knot</td>
                    <td>Lake Knot</td>
                    <td>25m</td>
                    <td>
                      <span class="vehicle-cell-inline">${Icons.truck(13)} FR-23</span>
                    </td>
                    <td>
                      <div class="driver-cell-inline">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60" alt="Ethan Cole" class="driver-avatar-circle">
                        <span>Ethan Cole</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill on-route"><span class="status-pill-dot"></span>On Route</span>
                    </td>
                  </tr>

                  <!-- Row 3: BRG-2846 -->
                  <tr>
                    <td class="font-bold">#BRG-2846</td>
                    <td>Capital Knot</td>
                    <td>Lake Knot</td>
                    <td>2h 45m</td>
                    <td>
                      <span class="vehicle-cell-inline">${Icons.ship(13)} ST-09</span>
                    </td>
                    <td>
                      <div class="driver-cell-inline">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60" alt="Lucas Reed" class="driver-avatar-circle">
                        <span>Lucas Reed</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill delayed"><span class="status-pill-dot"></span>Delayed</span>
                    </td>
                  </tr>

                  <!-- Row 4: BRG-2845 -->
                  <tr>
                    <td class="font-bold">#BRG-2845</td>
                    <td>South Knot</td>
                    <td>Mountain Knot</td>
                    <td>25m</td>
                    <td>
                      <span class="vehicle-cell-inline">${Icons.truck(13)} FR-23</span>
                    </td>
                    <td>
                      <div class="driver-cell-inline">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=60" alt="Norman Reedus" class="driver-avatar-circle">
                        <span>Norman Reedus</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill on-route"><span class="status-pill-dot"></span>On Route</span>
                    </td>
                  </tr>

                  <!-- Row 5: BRG-2844 -->
                  <tr>
                    <td class="font-bold">#BRG-2844</td>
                    <td>South Knot</td>
                    <td>Capital Knot</td>
                    <td>Apr 18, 2026</td>
                    <td>
                      <span class="vehicle-cell-inline">${Icons.truck(13)} FR-33</span>
                    </td>
                    <td>
                      <div class="driver-cell-inline">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60" alt="Ana Brooks" class="driver-avatar-circle">
                        <span>Ana Brooks</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill delivered"><span class="status-pill-dot"></span>Delivered</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
    `;
  },

  filterShipments(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#recent-shipments-table tbody tr');
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  }
};

window.DashboardView = DashboardView;
