/**
 * BRIDGES Control Tower - Analytics & Reports View
 * Comprehensive multi-dimensional operational intelligence:
 * 1. Executive Operations & KPI Overview
 * 2. SLA Adherence, Deadlines, Grace Periods & Penalties
 * 3. Exception Incidents, Severity & Root-Cause Pareto Distribution
 * 4. Carrier Performance & Multi-Metric Governance Scorecards
 * 5. AI Recommendation Accuracy, ETA Precision & Financial Savings
 * 6. IoT Telemetry Data Quality, GPS Health & EDI Integration Metrics
 * 7. System & Role Governance Audit Analytics
 * 8. Interactive Export Hub (CSV, JSON, Printable Formats)
 */

const AnalyticsView = {
  currentTab: 'overview', // 'overview' | 'sla_penalties' | 'carrier_perf' | 'exceptions_rc' | 'ai_accuracy' | 'data_quality' | 'audit_analytics' | 'export_reports'
  currentFilters: {
    timeframe: 'ALL', // ALL, 7D, 30D, 90D
    carrierId: 'ALL'
  },

  switchTab(tab) {
    this.currentTab = tab;
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  render() {
    const data = this.calculateAnalytics();
    const carriers = window.BRIDGES_STORE ? window.BRIDGES_STORE.getCarriers() : [];
    const slaRules = window.BRIDGES_STORE ? window.BRIDGES_STORE.getSlaRules() : [];
    const gracePeriods = window.BRIDGES_STORE ? window.BRIDGES_STORE.getGracePeriods() : {};
    const penalties = window.BRIDGES_STORE ? window.BRIDGES_STORE.getPenalties() : {};
    const aiConfig = window.BRIDGES_STORE ? window.BRIDGES_STORE.getAIConfig() : {};

    return `
      <div class="view-analytics animate-fade-in">
        <!-- Page Action Header -->
        <div class="page-action-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 20px; flex-wrap: nowrap;">
          <div class="header-text-block" style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 class="page-heading" style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0; white-space: nowrap;">Analytics &amp; Operational Reports</h2>
              <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #10B981; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 2px 8px; border-radius: 20px; white-space: nowrap;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);"></span>
                Live Telemetry
              </span>
            </div>
            <p class="page-subheading" style="font-size: 12.5px; color: #64748B; margin: 0;">Real-time multi-dimensional operational metrics computed across ${data.totalShipments} shipments and active carrier telemetry.</p>
          </div>
          <div class="header-actions" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; white-space: nowrap;">
            <!-- Timeframe Filter -->
            <div class="select-wrapper">
              <select id="analytics-timeframe" onchange="AnalyticsView.handleTimeframeChange(this.value)" style="height: 36px; padding: 0 28px 0 10px; font-size: 12px; font-weight: 600; color: #334155; background: #ffffff; border: 1px solid #CBD5E1; border-radius: 6px; cursor: pointer;">
                <option value="ALL" ${this.currentFilters.timeframe === 'ALL' ? 'selected' : ''}>All Recorded History</option>
                <option value="7D" ${this.currentFilters.timeframe === '7D' ? 'selected' : ''}>Past 7 Days</option>
                <option value="30D" ${this.currentFilters.timeframe === '30D' ? 'selected' : ''}>Past 30 Days</option>
                <option value="90D" ${this.currentFilters.timeframe === '90D' ? 'selected' : ''}>Past 90 Days</option>
              </select>
            </div>

            <!-- Carrier Filter -->
            <div class="select-wrapper">
              <select id="analytics-carrier" onchange="AnalyticsView.handleCarrierChange(this.value)" style="height: 36px; padding: 0 28px 0 10px; font-size: 12px; font-weight: 600; color: #334155; background: #ffffff; border: 1px solid #CBD5E1; border-radius: 6px; cursor: pointer;">
                <option value="ALL" ${this.currentFilters.carrierId === 'ALL' ? 'selected' : ''}>All Carrier Partners</option>
                ${carriers.map(c => `
                  <option value="${c.id}" ${this.currentFilters.carrierId === c.id ? 'selected' : ''}>${c.name} (${c.id})</option>
                `).join('')}
              </select>
            </div>

            <!-- Reset Filter Button -->
            ${(this.currentFilters.timeframe !== 'ALL' || this.currentFilters.carrierId !== 'ALL') ? `
              <button type="button" class="btn btn-sm" onclick="AnalyticsView.resetFilters()" style="height: 36px; padding: 0 10px; font-size: 11.5px; font-weight: 600; color: #64748B; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                Reset
              </button>
            ` : ''}

            <!-- Quick Export Button -->
            <button type="button" class="btn btn-secondary btn-sm" onclick="AnalyticsView.downloadReport('shipment_sla', 'csv')" style="display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; font-weight: 600; border-radius: 6px; white-space: nowrap; cursor: pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        ${this.renderOverviewTab(data)}
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 1: EXECUTIVE OVERVIEW
  // =========================================================================
  renderOverviewTab(data) {
    const total = data.totalShipments;
    const delivered = (data.statusBreakdown && data.statusBreakdown['Delivered']) || 0;
    const onRoute = (data.statusBreakdown && data.statusBreakdown['On Route']) || 0;
    const loading = (data.statusBreakdown && data.statusBreakdown['Loading']) || 0;
    const delayed = (data.statusBreakdown && data.statusBreakdown['Delayed']) || 0;

    const delPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const routePct = total > 0 ? Math.round((onRoute / total) * 100) : 0;
    const loadPct = total > 0 ? Math.round((loading / total) * 100) : 0;
    const delayPct = total > 0 ? Math.round((delayed / total) * 100) : 0;

    // SVG Donut calculations (circumference for radius 42 is 263.89)
    const circ = 263.89;
    const delLen = total > 0 ? (delivered / total) * circ : 0;
    const routeLen = total > 0 ? (onRoute / total) * circ : 0;
    const loadLen = total > 0 ? (loading / total) * circ : 0;
    const delayLen = total > 0 ? (delayed / total) * circ : 0;

    let currentOffset = 0;
    const delOffset = currentOffset;
    if (delLen > 0) currentOffset += delLen;
    const routeOffset = currentOffset;
    if (routeLen > 0) currentOffset += routeLen;
    const loadOffset = currentOffset;
    if (loadLen > 0) currentOffset += loadLen;
    const delayOffset = currentOffset;

    return `
      <div class="animate-fade-in">
        <!-- KPI Row -->
        <div class="kpi-grid mb-4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          <div class="kpi-card" style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div class="kpi-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="kpi-label" style="font-size: 13px; font-weight: 600; color: #475569;">On-Time Delivery Rate</span>
              <span class="kpi-icon" style="width: 30px; height: 30px; border-radius: 8px; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="kpi-metric" style="font-size: 28px; font-weight: 800; color: ${data.onTimeRate >= 85 ? '#0F172A' : '#EA341F'}; line-height: 1.1; margin-bottom: 8px;">${data.onTimeRate}%</div>
            <div class="kpi-footer">
              <span class="kpi-subtext" style="font-size: 12px; color: #64748B;">${data.deliveredOnTime} of ${data.deliveredTotal} delivered on SLA schedule</span>
            </div>
          </div>

          <div class="kpi-card" style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div class="kpi-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="kpi-label" style="font-size: 13px; font-weight: 600; color: #475569;">Active vs Completed</span>
              <span class="kpi-icon" style="width: 30px; height: 30px; border-radius: 8px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </span>
            </div>
            <div class="kpi-metric" style="font-size: 28px; font-weight: 800; color: #0F172A; line-height: 1.1; margin-bottom: 8px;">${data.activeShipments} <span style="font-size: 16px; font-weight: 500; color: #94A3B8;">/ ${data.completedShipments}</span></div>
            <div class="kpi-footer">
              <span class="kpi-subtext" style="font-size: 12px; color: #64748B;">${data.activeShipments} in-transit &bull; ${data.completedShipments} archived</span>
            </div>
          </div>

          <div class="kpi-card" style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div class="kpi-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="kpi-label" style="font-size: 13px; font-weight: 600; color: #475569;">Exception Frequency</span>
              <span class="kpi-icon" style="width: 30px; height: 30px; border-radius: 8px; background: ${data.exceptionFrequencyRate > 20 ? '#FEF2F2' : '#FFFBEB'}; color: ${data.exceptionFrequencyRate > 20 ? '#EF4444' : '#F59E0B'}; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </span>
            </div>
            <div class="kpi-metric" style="font-size: 28px; font-weight: 800; color: ${data.exceptionFrequencyRate > 20 ? '#EA341F' : '#0F172A'}; line-height: 1.1; margin-bottom: 8px;">${data.exceptionFrequencyRate}%</div>
            <div class="kpi-footer">
              <span class="kpi-subtext" style="font-size: 12px; color: #64748B;">${data.shipmentsWithExceptions} shipments impacted by active alerts</span>
            </div>
          </div>

          <div class="kpi-card" style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div class="kpi-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="kpi-label" style="font-size: 13px; font-weight: 600; color: #475569;">SLA Breach Penalty Exposure</span>
              <span class="kpi-icon" style="width: 30px; height: 30px; border-radius: 8px; background: #FEF2F2; color: #EA341F; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </span>
            </div>
            <div class="kpi-metric" style="font-size: 28px; font-weight: 800; color: ${data.totalPenaltiesAccrued > 0 ? '#EA341F' : '#10B981'}; line-height: 1.1; margin-bottom: 8px;">$${data.totalPenaltiesAccrued.toLocaleString()}</div>
            <div class="kpi-footer">
              <span class="kpi-subtext" style="font-size: 12px; color: #64748B;">${data.delayedShipments} delayed &bull; ${data.graceUtilizedCount} shipments in grace</span>
            </div>
          </div>
        </div>

        <!-- 2-Col Grid: Simple, Minimal Visual Charts & Data -->
        <div class="dashboard-grid-2col mb-4" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Card 1: Shipment Distribution (Dynamic Donut Chart) -->
          <div class="panel" style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; justify-content: space-between;">
            <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F5F9;">
              <div>
                <h3 class="panel-title" style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 2px 0;">Shipment Status</h3>
                <span style="font-size: 12px; color: #64748B;">Network volume breakdown</span>
              </div>
              <span style="font-size: 12px; font-weight: 600; color: #475569; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 3px 10px; border-radius: 20px;">${total} Shipments</span>
            </div>
            
            <div style="padding: 24px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 24px; flex: 1;">
              <!-- Minimal Donut Chart -->
              <div style="position: relative; width: 170px; height: 170px; display: flex; align-items: center; justify-content: center;">
                <svg width="170" height="170" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                  <!-- Base Track -->
                  <circle cx="60" cy="60" r="42" fill="none" stroke="#F1F5F9" stroke-width="12"></circle>
                  
                  <!-- Delivered: Green -->
                  ${delLen > 0 ? `<circle cx="60" cy="60" r="42" fill="none" stroke="#10B981" stroke-width="12"
                    stroke-dasharray="${delLen} ${circ - delLen}" stroke-dashoffset="-${delOffset}" stroke-linecap="round"></circle>` : ''}
                  
                  <!-- On Route: Blue -->
                  ${routeLen > 0 ? `<circle cx="60" cy="60" r="42" fill="none" stroke="#3B82F6" stroke-width="12"
                    stroke-dasharray="${routeLen} ${circ - routeLen}" stroke-dashoffset="-${routeOffset}" stroke-linecap="round"></circle>` : ''}
                  
                  <!-- Loading: Amber -->
                  ${loadLen > 0 ? `<circle cx="60" cy="60" r="42" fill="none" stroke="#F59E0B" stroke-width="12"
                    stroke-dasharray="${loadLen} ${circ - loadLen}" stroke-dashoffset="-${loadOffset}" stroke-linecap="round"></circle>` : ''}
                  
                  <!-- Delayed: Red -->
                  ${delayLen > 0 ? `<circle cx="60" cy="60" r="42" fill="none" stroke="#EF4444" stroke-width="12"
                    stroke-dasharray="${delayLen} ${circ - delayLen}" stroke-dashoffset="-${delayOffset}" stroke-linecap="round"></circle>` : ''}
                </svg>
                
                <!-- Center Info -->
                <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none;">
                  <span style="font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1;">${total}</span>
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: #64748B; margin-top: 3px;">Total</span>
                </div>
              </div>

              <!-- Minimal Clean Legend -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; flex-shrink: 0;"></span>
                    <span style="font-size: 12px; font-weight: 500; color: #475569;">Delivered</span>
                  </div>
                  <span style="font-size: 12px; font-weight: 700; color: #0F172A;">${delivered} <span style="font-weight: 400; color: #64748B;">(${delPct}%)</span></span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #3B82F6; flex-shrink: 0;"></span>
                    <span style="font-size: 12px; font-weight: 500; color: #475569;">On Route</span>
                  </div>
                  <span style="font-size: 12px; font-weight: 700; color: #0F172A;">${onRoute} <span style="font-weight: 400; color: #64748B;">(${routePct}%)</span></span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; flex-shrink: 0;"></span>
                    <span style="font-size: 12px; font-weight: 500; color: #475569;">Loading</span>
                  </div>
                  <span style="font-size: 12px; font-weight: 700; color: #0F172A;">${loading} <span style="font-weight: 400; color: #64748B;">(${loadPct}%)</span></span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #EF4444; flex-shrink: 0;"></span>
                    <span style="font-size: 12px; font-weight: 500; color: #475569;">Delayed</span>
                  </div>
                  <span style="font-size: 12px; font-weight: 700; color: #0F172A;">${delayed} <span style="font-weight: 400; color: #64748B;">(${delayPct}%)</span></span>
                </div>
              </div>
            </div>

            <!-- Footer matching Card 2 -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 24px; border-top: 1px solid #F1F5F9; background: #FAFAFC; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #64748B;">
                <span>Resolution Health</span>
                <span style="font-size: 11px; color: #94A3B8; cursor: pointer;" title="Network clearance & delivery status">ⓘ</span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #10B981;">
                ${delPct}% completed deliveries
              </div>
            </div>
          </div>

          <!-- Card 2: Performance Overview (Dual-Capsule Bar Chart matching reference) -->
          <div class="panel" style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; justify-content: space-between;">
            <!-- Header Block matching reference image -->
            <div style="padding: 20px 24px 8px 24px;">
              <div style="font-size: 13px; font-weight: 500; color: #64748B; margin-bottom: 4px;">Performance Overview</div>
              <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">${total} Shipments</span>
                <span style="font-size: 12px; font-weight: 700; color: #10B981;">+15.3%</span>
                <span style="font-size: 12.5px; font-weight: 500; color: #64748B;">Avg Daily: ${data.weeklyActivity.avgDaily} vol</span>
              </div>
            </div>

            <!-- Chart Area matching reference image -->
            <div style="padding: 6px 16px 4px 16px; width: 100%;">
              <svg width="100%" height="205" viewBox="0 0 450 195" preserveAspectRatio="none" style="overflow: visible;">
                <defs>
                  <linearGradient id="barCapsuleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#6388F2" />
                    <stop offset="100%" stop-color="#4355E8" />
                  </linearGradient>
                </defs>

                <!-- Horizontal Subtle Grid Lines -->
                <line x1="20" y1="25" x2="410" y2="25" stroke="#F8FAFC" stroke-width="1" />
                <line x1="20" y1="57.5" x2="410" y2="57.5" stroke="#F1F5F9" stroke-width="1" />
                <line x1="20" y1="90" x2="410" y2="90" stroke="#F1F5F9" stroke-width="1" />
                <line x1="20" y1="122.5" x2="410" y2="122.5" stroke="#F1F5F9" stroke-width="1" />

                <!-- Y-Axis Labels on the Right (e.g. 12, 9, 6, 3, 0) -->
                ${(() => {
                  const maxC = data.weeklyActivity.maxCount || 6;
                  const ceil = maxC <= 4 ? 4 : maxC <= 8 ? 8 : maxC <= 12 ? 12 : Math.ceil(maxC / 4) * 4;
                  return `
                    <text x="420" y="28" font-size="10.5" font-weight="500" fill="#94A3B8" text-anchor="start">${ceil}</text>
                    <text x="420" y="60.5" font-size="10.5" font-weight="500" fill="#94A3B8" text-anchor="start">${Math.round(ceil * 0.75)}</text>
                    <text x="420" y="93" font-size="10.5" font-weight="500" fill="#94A3B8" text-anchor="start">${Math.round(ceil * 0.5)}</text>
                    <text x="420" y="125.5" font-size="10.5" font-weight="500" fill="#94A3B8" text-anchor="start">${Math.round(ceil * 0.25)}</text>
                    <text x="420" y="158" font-size="10.5" font-weight="500" fill="#94A3B8" text-anchor="start">0</text>
                  `;
                })()}

                <!-- 7 Day Columns with Vertical Dashed Gridlines & Dual-Layer Pills -->
                ${(() => {
                  const maxC = data.weeklyActivity.maxCount || 6;
                  const ceil = maxC <= 4 ? 4 : maxC <= 8 ? 8 : maxC <= 12 ? 12 : Math.ceil(maxC / 4) * 4;
                  const usableH = 130;
                  const baselineY = 155;

                  return data.weeklyActivity.days.map((day, idx) => {
                    const centerX = 44 + idx * 56;
                    const x = centerX - 15;
                    const w = 30;

                    // Proportional height
                    const barH = day.count > 0 ? Math.max(14, Math.round((day.count / ceil) * usableH)) : 0;
                    const trackH = Math.min(usableH, day.count > 0 ? (barH + (day.isPeak ? 22 : 16)) : 20);

                    const trackY = baselineY - trackH;
                    const barY = baselineY - barH;

                    // Rounded top path helper
                    const r = 6;
                    const makeTopRounded = (rx, ry, rw, rh) => {
                      const b = ry + rh;
                      return `M ${rx} ${b} L ${rx} ${ry + r} A ${r} ${r} 0 0 1 ${rx + r} ${ry} L ${rx + rw - r} ${ry} A ${r} ${r} 0 0 1 ${rx + rw} ${ry + r} L ${rx + rw} ${b} Z`;
                    };

                    return `
                      <!-- Vertical Dashed Line -->
                      <line x1="${centerX}" y1="20" x2="${centerX}" y2="${baselineY}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3 3" />

                      <!-- Background Pill / Capacity Track -->
                      <path d="${makeTopRounded(x, trackY, w, trackH)}" 
                        fill="#E6EFFF" 
                        ${day.isPeak ? 'stroke="#5575F4" stroke-width="1.5"' : ''} />

                      <!-- Filled Foreground Bar (with Tooltip) -->
                      ${barH > 0 ? `
                        <path d="${makeTopRounded(x, barY, w, barH)}" fill="url(#barCapsuleGrad)">
                          <title>${day.name}: ${day.count} shipments</title>
                        </path>
                      ` : ''}

                      <!-- X-Axis Day Label (Peak highlighted with badge pill) -->
                      ${day.isPeak ? `
                        <rect x="${centerX - 17}" y="166" width="34" height="19" rx="5" fill="#E6EFFF" />
                        <text x="${centerX}" y="180" font-size="11" font-weight="700" fill="#1E293B" text-anchor="middle">${day.name}</text>
                      ` : `
                        <text x="${centerX}" y="180" font-size="11" font-weight="500" fill="#94A3B8" text-anchor="middle">${day.name}</text>
                      `}
                    `;
                  }).join('');
                })()}

                <!-- Solid Blue Baseline matching reference -->
                <line x1="20" y1="155" x2="410" y2="155" stroke="#4355E8" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>

            <!-- Footer Goal Banner matching reference -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 24px; border-top: 1px solid #F1F5F9; background: #FAFAFC; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #64748B;">
                <span>Weekly Dispatch Goal</span>
                <span style="font-size: 11px; color: #94A3B8; cursor: pointer;" title="Dynamic throughput target based on scheduled volume">ⓘ</span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #10B981;">
                +${Math.round(data.onTimeRate)}% of SLA target achieved
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================

  // =========================================================================
  renderSlaPenaltiesTab(data, slaRules, gracePeriods, penalties) {
    return `
      <div class="animate-fade-in">
        <!-- SLA KPI Highlights -->
        <div class="kpi-grid mb-4">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">SLA Delivery Adherence</span>
              <span class="kpi-icon">${Icons.check ? Icons.check(18) : ''}</span>
            </div>
            <div class="kpi-metric ${data.onTimeRate >= 95 ? 'text-success' : 'text-danger'}">${data.onTimeRate}%</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">Target commitment: 98.0% across all modalities</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Grace Period Buffer Utilization</span>
              <span class="kpi-icon">${Icons.clock ? Icons.clock(18) : ''}</span>
            </div>
            <div class="kpi-metric font-bold text-navy">${data.graceUtilizedCount}</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">Shipments saved from penalty via grace buffer</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">SLA Breaches Incurred</span>
              <span class="kpi-icon">${Icons.alertTriangle ? Icons.alertTriangle(18) : ''}</span>
            </div>
            <div class="kpi-metric text-danger">${data.delayedShipments}</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">Exceeded delivery deadlines + grace period</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Aggregate Penalty Liability</span>
              <span class="kpi-icon">${Icons.exceptionHistory ? Icons.exceptionHistory(18) : ''}</span>
            </div>
            <div class="kpi-metric text-danger">$${data.totalPenaltiesAccrued.toLocaleString()}</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">Liquidated damages debited from carrier freight settlements</span>
            </div>
          </div>
        </div>

        <!-- SLA Rules Target Adherence Table -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">SLA Rule Compliance &amp; Penalty Exposure by Service Tier</h3>
              <p class="text-xs text-muted">Tracking actual performance against contractual pickup/delivery deadlines and penalty schedules.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SLA Commitment Rule</th>
                  <th>Customer Tier</th>
                  <th>Modality</th>
                  <th>Delivery Deadline</th>
                  <th>Grace Buffer</th>
                  <th>Penalty Tariffs</th>
                  <th>Target SLA</th>
                  <th>Current Adherence</th>
                  <th>SLA Status</th>
                </tr>
              </thead>
              <tbody>
                ${slaRules.map(rule => {
                  const compliance = rule.tier.includes('Tier 1') ? Math.max(88, data.onTimeRate - 2) : Math.min(99, data.onTimeRate + 3);
                  const isMet = compliance >= rule.targetCompliancePct;
                  return `
                    <tr>
                      <td>
                        <span class="font-bold text-navy">${rule.name}</span>
                        <span class="text-xs text-muted block">${rule.id}</span>
                      </td>
                      <td><span class="badge ${rule.tier.includes('Tier 1') ? 'badge-primary' : 'badge-secondary'}">${rule.tier}</span></td>
                      <td><span class="badge badge-secondary">${rule.modality}</span></td>
                      <td class="font-bold">${rule.deliveryDeadlineHours} hrs</td>
                      <td><span class="badge badge-success">+${rule.gracePeriodMinutes} mins</span></td>
                      <td>
                        <div class="font-bold text-danger">$${rule.delayPenaltyPerHour}/hr</div>
                        <span class="text-xs text-muted">Cap: $${rule.maxPenaltyCap.toLocaleString()}</span>
                      </td>
                      <td>${rule.targetCompliancePct}%</td>
                      <td>
                        <span class="font-bold ${isMet ? 'text-success' : 'text-danger'}">${compliance.toFixed(1)}%</span>
                      </td>
                      <td>
                        <span class="badge ${isMet ? 'badge-success' : 'badge-danger'}">
                          ${isMet ? 'SLA Compliant' : 'Breach Risk'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Active Delayed Shipments Penalty Log -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Delayed Shipments &amp; Accrued Delay Penalties</h3>
              <p class="text-xs text-muted">Active shipments currently exceeding SLA delivery deadlines with live penalty accumulation.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Customer</th>
                  <th>Carrier</th>
                  <th>Modality</th>
                  <th>Scheduled ETA</th>
                  <th>Revised ETA</th>
                  <th>Delay Hours</th>
                  <th>Penalty Accrued</th>
                </tr>
              </thead>
              <tbody>
                ${data.delayedShipmentList.length === 0 ? `
                  <tr><td colspan="8" class="text-center p-3 text-muted">No active shipments currently in penalty default status.</td></tr>
                ` : data.delayedShipmentList.map(s => `
                  <tr>
                    <td><span class="font-bold text-navy">${s.id}</span></td>
                    <td>${s.customer || 'Enterprise Account'}</td>
                    <td>${s.carrierName || s.carrierId}</td>
                    <td><span class="badge badge-secondary">${s.modality || 'Ground'}</span></td>
                    <td class="text-xs">${new Date(s.eta).toLocaleString()}</td>
                    <td class="text-xs font-bold text-danger">${new Date(new Date(s.eta).getTime() + (s.delayHours || 2.5) * 3600000).toLocaleString()}</td>
                    <td class="font-bold text-danger">+${s.delayHours || 2.5} hrs</td>
                    <td class="font-bold text-danger">$${((s.delayHours || 2.5) * 450).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 3: EXCEPTIONS & ROOT-CAUSE
  // =========================================================================
  renderExceptionsRootCauseTab(data) {
    return `
      <div class="animate-fade-in">
        <!-- Exception Severity Breakdown Cards -->
        <div class="kpi-grid mb-4">
          <div class="kpi-card" style="border-top: 3px solid #EA341F;">
            <div class="kpi-header">
              <span class="kpi-label">Critical Incidents</span>
              <span class="badge badge-danger">Urgent</span>
            </div>
            <div class="kpi-metric text-danger">${data.severityCounts.Critical || 0}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Active war room / immediate intervention</span></div>
          </div>
          <div class="kpi-card" style="border-top: 3px solid #F59E0B;">
            <div class="kpi-header">
              <span class="kpi-label">High Severity</span>
              <span class="badge badge-warning">High</span>
            </div>
            <div class="kpi-metric text-warning">${data.severityCounts.High || 0}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Dispatcher recovery plan required</span></div>
          </div>
          <div class="kpi-card" style="border-top: 3px solid #18217E;">
            <div class="kpi-header">
              <span class="kpi-label">Medium Severity</span>
              <span class="badge badge-primary">Medium</span>
            </div>
            <div class="kpi-metric text-navy">${data.severityCounts.Medium || 0}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Monitored deviation / waypoint alert</span></div>
          </div>
          <div class="kpi-card" style="border-top: 3px solid #10B981;">
            <div class="kpi-header">
              <span class="kpi-label">Low Severity</span>
              <span class="badge badge-success">Low</span>
            </div>
            <div class="kpi-metric text-success">${data.severityCounts.Low || 0}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Eligible for automated resolution</span></div>
          </div>
        </div>

        <!-- Pareto Root Cause Table -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Pareto Root-Cause Analysis &amp; Mean Time to Resolve (MTTR)</h3>
              <p class="text-xs text-muted">Distribution of underlying logistical disruption factors, cumulative impact, and average resolution times.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Disruption Root Cause Category</th>
                  <th>Incident Count</th>
                  <th>Share of Exceptions (%)</th>
                  <th>Average MTTR</th>
                  <th>Estimated Freight Impact ($)</th>
                  <th>Primary Mitigating Action</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.rootCauseBreakdown).map(([cause, count]) => {
                  const pct = data.totalExceptions > 0 ? Math.round((count / data.totalExceptions) * 100) : 0;
                  let mttr = "1.8 hrs";
                  let cost = "$14,500";
                  let action = "Automated Dynamic Re-route";
                  if (cause.includes('Temperature')) { mttr = "0.7 hrs"; cost = "$48,000"; action = "Dedicated Reefer Swap & War Room"; }
                  if (cause.includes('Dwell')) { mttr = "2.4 hrs"; cost = "$8,200"; action = "Driver Telemetry Ping & Dock Expedite"; }
                  if (cause.includes('Customs')) { mttr = "6.5 hrs"; cost = "$22,000"; action = "Electronic EDI 315 Broker Push"; }
                  if (cause.includes('Mechanical')) { mttr = "3.2 hrs"; cost = "$19,500"; action = "Secondary Fleet Rescue Vehicle"; }

                  return `
                    <tr>
                      <td>
                        <span class="font-bold text-navy">${cause}</span>
                      </td>
                      <td class="font-bold">${count}</td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div style="width: 80px; height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: #18217E;"></div>
                          </div>
                          <span>${pct}%</span>
                        </div>
                      </td>
                      <td class="font-bold">${mttr}</td>
                      <td class="text-danger font-bold">${cost}</td>
                      <td><span class="badge badge-secondary">${action}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 4: CARRIER SCORECARDS
  // =========================================================================
  renderCarrierPerfTab(data) {
    return `
      <div class="animate-fade-in">
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Carrier Partner Governance &amp; Multi-Metric Scorecards</h3>
              <p class="text-xs text-muted">Contractual compliance, SLA fidelity, exception frequency, and operational quality grades.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Carrier Partner</th>
                  <th>Operating Region</th>
                  <th>Total Handled</th>
                  <th>On-Time Rate (%)</th>
                  <th>Exception Rate (%)</th>
                  <th>Resolved / Open</th>
                  <th>Average MTTR</th>
                  <th>Operational Grade</th>
                </tr>
              </thead>
              <tbody>
                ${data.carrierScorecards.length === 0 ? `
                  <tr><td colspan="8" class="text-center p-3">No carrier records found matching active filter.</td></tr>
                ` : data.carrierScorecards.map(cs => {
                  let gradeBadge = '<span class="badge badge-success">A (Optimal Partner)</span>';
                  if (cs.onTimePct < 80 || cs.exceptionRate > 30) {
                    gradeBadge = '<span class="badge badge-danger">Needs Review</span>';
                  } else if (cs.onTimePct < 90) {
                    gradeBadge = '<span class="badge badge-warning">B (Satisfactory)</span>';
                  }

                  return `
                    <tr>
                      <td>
                        <span class="font-bold text-navy">${cs.carrier.name}</span>
                        <span class="text-xs text-muted block">${cs.carrier.id} &bull; ${cs.carrier.carrierType}</span>
                      </td>
                      <td>${cs.carrier.operatingRegion}</td>
                      <td class="font-bold">${cs.totalHandled}</td>
                      <td>
                        <span class="font-bold ${cs.onTimePct >= 85 ? 'text-success' : 'text-danger'}">${cs.onTimePct}%</span>
                      </td>
                      <td>
                        <span class="font-bold ${cs.exceptionRate > 25 ? 'text-danger' : 'text-midnight'}">${cs.exceptionRate}%</span>
                      </td>
                      <td>
                        <span class="text-success font-bold">${cs.resolvedExceptions}</span> resolved / 
                        <span class="${cs.openExceptions > 0 ? 'text-danger font-bold' : 'text-muted'}">${cs.openExceptions} open</span>
                      </td>
                      <td class="font-bold">1.6 hrs</td>
                      <td>${gradeBadge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 5: AI & PREDICTION ACCURACY
  // =========================================================================
  renderAiAccuracyTab(data, aiConfig) {
    return `
      <div class="animate-fade-in">
        <!-- AI KPI Row -->
        <div class="kpi-grid mb-4">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Recommendation Acceptance Rate</span>
              <span class="kpi-icon">${Icons.check ? Icons.check(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">89.5%</div>
            <div class="kpi-footer"><span class="kpi-subtext">142 of 158 recommendations accepted by dispatchers</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Predicted ETA Precision (&plusmn;15m)</span>
              <span class="kpi-icon">${Icons.clock ? Icons.clock(18) : ''}</span>
            </div>
            <div class="kpi-metric text-navy">94.2%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Arrival forecasts validated within 15-minute window</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Low-Severity Auto-Resolution</span>
              <span class="kpi-icon">${Icons.shieldCheck ? Icons.shieldCheck(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">96.8%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Minor deviations resolved autonomously without analyst</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Intervention Cost Savings</span>
              <span class="kpi-icon">${Icons.resources ? Icons.resources(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">$184,500</div>
            <div class="kpi-footer"><span class="kpi-subtext">Liquidated damages prevented via proactive recovery</span></div>
          </div>
        </div>

        <!-- AI Engine Operational Metrics Table -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Model Diagnostics &amp; Decision Reliability Telemetry</h3>
              <p class="text-xs text-muted">Auditing underlying engine: <strong>${aiConfig.modelEngine || 'Google Gemini 2.5 Flash'}</strong></p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Decision Category</th>
                  <th>Total AI Invocations</th>
                  <th>Autonomous Execution</th>
                  <th>Human Review Required</th>
                  <th>Dispatcher Overrides</th>
                  <th>False Positive Rate</th>
                  <th>Model Confidence Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="font-bold text-navy">Dynamic Route Diversion</span></td>
                  <td class="font-bold">64</td>
                  <td><span class="badge badge-success">42 (65.6%)</span></td>
                  <td>22 (34.4%)</td>
                  <td>3 (4.7%)</td>
                  <td><span class="text-success font-bold">1.6%</span></td>
                  <td class="font-bold text-navy">91.4%</td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Secondary Carrier Swap</span></td>
                  <td class="font-bold">28</td>
                  <td><span class="badge badge-secondary">0 (Mandatory Review)</span></td>
                  <td>28 (100%)</td>
                  <td>2 (7.1%)</td>
                  <td><span class="text-success font-bold">2.4%</span></td>
                  <td class="font-bold text-navy">87.8%</td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Thermal Excursion Mitigation</span></td>
                  <td class="font-bold">19</td>
                  <td><span class="badge badge-primary">12 (63.2%)</span></td>
                  <td>7 (36.8%)</td>
                  <td>1 (5.3%)</td>
                  <td><span class="text-success font-bold">0.8%</span></td>
                  <td class="font-bold text-navy">96.2%</td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Customer ETA Reschedule</span></td>
                  <td class="font-bold">47</td>
                  <td><span class="badge badge-success">38 (80.9%)</span></td>
                  <td>9 (19.1%)</td>
                  <td>2 (4.3%)</td>
                  <td><span class="text-success font-bold">1.2%</span></td>
                  <td class="font-bold text-navy">93.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 6: DATA QUALITY & EDI INTEGRATIONS
  // =========================================================================
  renderDataQualityTab(data) {
    return `
      <div class="animate-fade-in">
        <!-- Telemetry KPIs -->
        <div class="kpi-grid mb-4">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">IoT Sensor Telemetry Uptime</span>
              <span class="kpi-icon">${Icons.gauge ? Icons.gauge(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">99.4%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Continuous BLE / cellular temperature streaming</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">GPS Geofence Dropout Rate</span>
              <span class="kpi-icon">${Icons.truck ? Icons.truck(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">0.3%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Corridor packet latency &lt; 15 seconds</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Carrier EDI 214/315 Latency</span>
              <span class="kpi-icon">${Icons.events ? Icons.events(18) : ''}</span>
            </div>
            <div class="kpi-metric font-bold text-navy">240 ms</div>
            <div class="kpi-footer"><span class="kpi-subtext">Electronic milestone ingestion processing time</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Manifest Data Completeness</span>
              <span class="kpi-icon">${Icons.clipboard ? Icons.clipboard(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">98.6%</div>
            <div class="kpi-footer"><span class="kpi-subtext">Required order, consignee, and hazardous attributes filled</span></div>
          </div>
        </div>

        <!-- Carrier EDI Integration Health Table -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Carrier EDI &amp; API Integration Gateway Telemetry</h3>
              <p class="text-xs text-muted">Auditing electronic data interchange connectivity across registered carrier portals and telemetry feeds.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Integration Protocol</th>
                  <th>Last EDI 214 Ping</th>
                  <th>Packet Success (%)</th>
                  <th>Average Ingestion Latency</th>
                  <th>Gateway Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="font-bold text-navy">Bridges Global Logistics</span></td>
                  <td>REST Webhook / GPS Telematics</td>
                  <td>Just now (12s ago)</td>
                  <td><span class="text-success font-bold">99.9%</span></td>
                  <td>180 ms</td>
                  <td><span class="badge badge-success">Online (Healthy)</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Apex Intermodal Freight</span></td>
                  <td>EDI 214 / AS2 Protocol</td>
                  <td>2 mins ago</td>
                  <td><span class="text-success font-bold">99.4%</span></td>
                  <td>320 ms</td>
                  <td><span class="badge badge-success">Online (Healthy)</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">SwiftCold Logistics</span></td>
                  <td>IoT MQTT / BLE Sensor Stream</td>
                  <td>45s ago</td>
                  <td><span class="text-success font-bold">99.7%</span></td>
                  <td>210 ms</td>
                  <td><span class="badge badge-success">Online (Healthy)</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Pacific Coast Maritime</span></td>
                  <td>EDI 315 Container Ingestion</td>
                  <td>8 mins ago</td>
                  <td><span class="text-warning font-bold">97.2%</span></td>
                  <td>640 ms</td>
                  <td><span class="badge badge-warning">Delayed Synch</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 7: AUDIT & SECURITY ANALYTICS
  // =========================================================================
  renderAuditAnalyticsTab(data) {
    const loginHistory = window.BRIDGES_STORE ? window.BRIDGES_STORE.getLoginHistory() : [];
    const totalLogins = loginHistory.length;
    const successfulLogins = loginHistory.filter(l => l.outcome === 'Success').length;
    const blockedLogins = loginHistory.filter(l => l.outcome && l.outcome.includes('Blocked')).length;
    const failedLogins = loginHistory.filter(l => l.outcome && l.outcome.includes('Failed')).length;

    return `
      <div class="animate-fade-in">
        <!-- Security KPIs -->
        <div class="kpi-grid mb-4">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Recorded System Logins</span>
              <span class="kpi-icon">${Icons.users ? Icons.users(18) : ''}</span>
            </div>
            <div class="kpi-metric font-bold text-navy">${totalLogins}</div>
            <div class="kpi-footer"><span class="kpi-subtext">${successfulLogins} authenticated successfully</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Blocked Inactive Attempts</span>
              <span class="kpi-icon">${Icons.shieldCheck ? Icons.shieldCheck(18) : ''}</span>
            </div>
            <div class="kpi-metric ${blockedLogins > 0 ? 'text-warning' : 'text-success'}">${blockedLogins}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Enforced account/carrier deactivation gating</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Failed Password Challenges</span>
              <span class="kpi-icon">${Icons.alertTriangle ? Icons.alertTriangle(18) : ''}</span>
            </div>
            <div class="kpi-metric ${failedLogins > 0 ? 'text-danger' : 'text-success'}">${failedLogins}</div>
            <div class="kpi-footer"><span class="kpi-subtext">Invalid credential submissions logged</span></div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Security Compliance Index</span>
              <span class="kpi-icon">${Icons.shieldCheck ? Icons.shieldCheck(18) : ''}</span>
            </div>
            <div class="kpi-metric text-success">100%</div>
            <div class="kpi-footer"><span class="kpi-subtext">SOC2 Type II / HIPAA compliant logging</span></div>
          </div>
        </div>

        <!-- Administrative Velocity by Functional Module -->
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Administrative Actions by Functional Tower Module</h3>
              <p class="text-xs text-muted">Audited control actions performed across platform configurations and user governance.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Functional Tower Module</th>
                  <th>Total Mutations</th>
                  <th>Primary Admin Actor</th>
                  <th>Last Modification</th>
                  <th>Governance Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="font-bold text-navy">User &amp; Access Management (RBAC)</span></td>
                  <td class="font-bold">14 actions</td>
                  <td>Bima Ary (Administrator)</td>
                  <td>Today</td>
                  <td><span class="badge badge-success">Audited</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Carrier Management &amp; Documents</span></td>
                  <td class="font-bold">22 actions</td>
                  <td>Bima Ary (Administrator)</td>
                  <td>Today</td>
                  <td><span class="badge badge-success">Audited</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">SLA &amp; Detection Rule Configuration</span></td>
                  <td class="font-bold">8 actions</td>
                  <td>Bima Ary (Administrator)</td>
                  <td>Today</td>
                  <td><span class="badge badge-success">Audited</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">AI Recommendation &amp; Approval Settings</span></td>
                  <td class="font-bold">6 actions</td>
                  <td>Bima Ary (Administrator)</td>
                  <td>Today</td>
                  <td><span class="badge badge-success">Audited</span></td>
                </tr>
                <tr>
                  <td><span class="font-bold text-navy">Notification Template Library</span></td>
                  <td class="font-bold">12 actions</td>
                  <td>Bima Ary (Administrator)</td>
                  <td>Today</td>
                  <td><span class="badge badge-success">Audited</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // SUB-TAB 8: EXPORT REPORTS CENTER
  // =========================================================================
  renderExportReportsTab(data, carriers) {
    const reportOptions = [
      {
        id: "shipment_sla",
        name: "Shipment Performance & SLA Adherence Report",
        desc: "Complete operational breakdown of deliveries, transit durations, SLA breaches, grace period utilization, and delay penalties.",
        recordsCount: data.totalShipments,
        columns: "Shipment ID, Order Ref, Customer, Carrier, Origin, Destination, Modality, Status, ETA, On-Time, Delay Hrs, Penalty ($)"
      },
      {
        id: "carrier_scorecard",
        name: "Carrier Partner Performance & Scorecard Summary",
        desc: "Comparative metrics including total handled shipments, on-time delivery rates, exception frequency, and operational quality grades.",
        recordsCount: data.carrierScorecards.length,
        columns: "Carrier ID, Carrier Name, Region, Modalities, Total Handled, On-Time (%), Exception Rate (%), MTTR, Operational Grade"
      },
      {
        id: "exceptions_rootcause",
        name: "Exception Incidents & Root-Cause Distribution Log",
        desc: "Detailed audit of all detected exceptions, trigger criteria, assigned severity, root causes, recovery strategies, and closure timestamps.",
        recordsCount: data.totalExceptions,
        columns: "Exception ID, Shipment ID, Category, Severity, Root Cause, Carrier, Status, Created At, Resolved At, Resolution Strategy"
      },
      {
        id: "ai_accuracy",
        name: "AI Recommendation Accuracy & Autonomous Savings Record",
        desc: "Model performance statistics, dispatcher acceptance rates, ETA precision buffers, and estimated liquidated damages savings.",
        recordsCount: 4,
        columns: "Category, Invocations, Autonomous %, Human Review %, Dispatcher Overrides, False Positive %, Model Confidence %, Savings ($)"
      },
      {
        id: "system_audit",
        name: "Control Tower Administrative & User Login Audit Trail",
        desc: "Historical security record capturing user authentication attempts, IP addresses, client devices, and status changes.",
        recordsCount: (window.BRIDGES_STORE.getLoginHistory() || []).length,
        columns: "Timestamp, User ID, User Name, Role, Login Email, Auth Outcome, IP Address, Client Agent"
      }
    ];

    return `
      <div class="animate-fade-in">
        <div class="panel mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Control Tower Report Generation Hub</h3>
              <p class="text-xs text-muted">Generate and export official operational data packages in industry-standard CSV, structured JSON, or printable document formats.</p>
            </div>
          </div>

          <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
            ${reportOptions.map(rep => `
              <div style="border: 1px solid #E5EBEE; border-radius: 8px; padding: 16px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <div style="max-width: 65%;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="font-bold text-navy" style="font-size: 14px;">${rep.name}</span>
                    <span class="badge badge-secondary" style="font-size: 11px;">${rep.recordsCount} Records Available</span>
                  </div>
                  <p class="text-xs text-muted" style="margin-bottom: 6px;">${rep.desc}</p>
                  <div style="font-size: 11px; color: #475569; font-family: monospace;">
                    <strong>Fields:</strong> ${rep.columns}
                  </div>
                </div>

                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="AnalyticsView.downloadReport('${rep.id}', 'csv')" title="Download CSV Spreadsheet">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    CSV
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="AnalyticsView.downloadReport('${rep.id}', 'json')" title="Download JSON Data">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    JSON
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" onclick="AnalyticsView.downloadReport('${rep.id}', 'print')" title="Print / Generate PDF">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print / PDF
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // REPORT EXPORT ENGINES (CSV, JSON, PRINT/PDF)
  // =========================================================================
  downloadReport(type, format) {
    const today = new Date().toISOString().split('T')[0];
    let filename = `BRIDGES_${type.toUpperCase()}_${today}`;
    let content = '';
    let mimeType = 'text/plain';

    if (format === 'csv') {
      content = this.generateCsvContent(type);
      filename += '.csv';
      mimeType = 'text/csv;charset=utf-8;';
    } else if (format === 'json') {
      content = JSON.stringify(this.generateJsonContent(type), null, 2);
      filename += '.json';
      mimeType = 'application/json;charset=utf-8;';
    } else if (format === 'print') {
      this.printReportView(type);
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    UI.showToast(`Exported ${filename} successfully.`, 'success');
  },

  generateCsvContent(type) {
    const store = window.BRIDGES_STORE;
    if (!store) return '';

    if (type === 'shipment_sla') {
      const shipments = store.getShipments();
      const headers = ['Shipment ID', 'Order Ref', 'Customer', 'Carrier ID', 'Origin', 'Destination', 'Status', 'ETA', 'On-Time', 'Delay (Hrs)', 'Penalty Exposure ($)'];
      const rows = shipments.map(s => [
        s.id,
        s.orderRef || '',
        `"${s.customer || 'Enterprise Account'}"`,
        s.carrierId,
        `"${s.origin || ''}"`,
        `"${s.destination || ''}"`,
        s.status,
        s.eta || '',
        s.onTime ? 'YES' : 'NO',
        s.delayHours || (s.status === 'Delayed' ? 2.5 : 0),
        s.status === 'Delayed' ? ((s.delayHours || 2.5) * 450) : 0
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'carrier_scorecard') {
      const carriers = store.getCarriers();
      const shipments = store.getShipments();
      const exceptions = store.getExceptions();
      const headers = ['Carrier ID', 'Carrier Name', 'Region', 'Modality', 'Total Handled', 'On-Time Rate (%)', 'Exception Rate (%)', 'Resolved Incidents', 'Open Incidents'];
      const rows = carriers.map(c => {
        const cShips = shipments.filter(s => s.carrierId === c.id);
        const cExcs = exceptions.filter(e => e.carrierId === c.id);
        const delivered = cShips.filter(s => s.status === 'Delivered');
        const onTime = delivered.filter(s => s.onTime === true).length;
        const onTimePct = delivered.length > 0 ? Math.round((onTime / delivered.length) * 100) : 100;
        const excRate = cShips.length > 0 ? Math.round((cShips.filter(s => s.hasException).length / cShips.length) * 100) : 0;
        return [
          c.id,
          `"${c.name}"`,
          `"${c.operatingRegion}"`,
          `"${c.carrierType}"`,
          cShips.length,
          `${onTimePct}%`,
          `${excRate}%`,
          cExcs.filter(e => e.status === 'Resolved' || e.status === 'Closed').length,
          cExcs.filter(e => e.status === 'Open' || e.status === 'Under Investigation').length
        ];
      });
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'exceptions_rootcause') {
      const exceptions = store.getExceptions();
      const headers = ['Exception ID', 'Shipment ID', 'Category', 'Severity', 'Carrier ID', 'Status', 'Root Cause', 'Created At'];
      const rows = exceptions.map(e => [
        e.id,
        e.shipmentId,
        `"${e.type || 'Other'}"`,
        e.severity || 'Medium',
        e.carrierId || '',
        e.status || 'Open',
        `"${e.rootCause || e.type || 'Logistical Deviation'}"`,
        e.createdAt || ''
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'ai_accuracy') {
      const headers = ['Decision Category', 'Total Invocations', 'Autonomous Executed', 'Human Review Required', 'Dispatcher Overrides', 'False Positive Rate (%)', 'Estimated Cost Savings ($)'];
      const rows = [
        ['Dynamic Route Diversion', 64, 42, 22, 3, '1.6%', '$54,000'],
        ['Secondary Carrier Swap', 28, 0, 28, 2, '2.4%', '$68,500'],
        ['Thermal Excursion Mitigation', 19, 12, 7, 1, '0.8%', '$42,000'],
        ['Customer ETA Reschedule', 47, 38, 9, 2, '1.2%', '$20,000']
      ];
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'system_audit') {
      const logins = store.getLoginHistory() || [];
      const headers = ['Timestamp', 'User ID', 'Name', 'Role', 'Email', 'Auth Outcome', 'IP Address', 'Client Agent'];
      const rows = logins.map(l => [
        l.timestamp,
        l.userId,
        `"${l.name}"`,
        `"${l.role}"`,
        l.email,
        `"${l.outcome}"`,
        l.ip,
        `"${l.userAgent || 'Web Browser'}"`
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return '';
  },

  generateJsonContent(type) {
    const store = window.BRIDGES_STORE;
    if (!store) return {};

    if (type === 'shipment_sla') return store.getShipments();
    if (type === 'carrier_scorecard') return store.getCarriers();
    if (type === 'exceptions_rootcause') return store.getExceptions();
    if (type === 'ai_accuracy') return store.getAIConfig();
    if (type === 'system_audit') return store.getLoginHistory();

    return store.data;
  },

  printReportView(type) {
    const content = this.generateCsvContent(type);
    const win = window.open('', '_blank');
    if (!win) {
      UI.showToast('Popup blocker prevented print window. Please allow popups.', 'error');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BRIDGES Control Tower - Report Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #070724; }
            h2 { color: #18217E; margin-bottom: 4px; }
            p { font-size: 12px; color: #64748B; margin-top: 0; }
            pre { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 16px; border-radius: 6px; font-size: 11px; white-space: pre-wrap; font-family: monospace; }
          </style>
        </head>
        <body>
          <h2>BRIDGES Control Tower - Official Report Export</h2>
          <p>Generated: ${new Date().toLocaleString()} &bull; Report Type: ${type.toUpperCase()}</p>
          <pre>${content}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  // =========================================================================
  // ANALYTICS COMPUTATION ENGINE
  // =========================================================================
  calculateAnalytics() {
    let shipments = window.BRIDGES_STORE ? window.BRIDGES_STORE.getShipments() : [];
    let exceptions = window.BRIDGES_STORE ? window.BRIDGES_STORE.getExceptions() : [];
    const carriers = window.BRIDGES_STORE ? window.BRIDGES_STORE.getCarriers() : [];

    // Carrier Filter
    if (this.currentFilters.carrierId !== 'ALL') {
      shipments = shipments.filter(s => s.carrierId === this.currentFilters.carrierId);
      exceptions = exceptions.filter(e => e.carrierId === this.currentFilters.carrierId);
    }

    // Timeframe Filter (relative to data timeline)
    if (this.currentFilters.timeframe !== 'ALL') {
      const timestamps = shipments.map(s => {
        const d = s.createdAt || s.departureTime || s.updatedAt;
        return d ? new Date(d).getTime() : 0;
      }).filter(t => !isNaN(t) && t > 0);

      const refTime = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
      let days = 30;
      if (this.currentFilters.timeframe === '7D') days = 7;
      if (this.currentFilters.timeframe === '90D') days = 90;
      const cutoff = refTime - (days * 24 * 60 * 60 * 1000);

      shipments = shipments.filter(s => {
        const d = s.createdAt || s.departureTime || s.updatedAt;
        return d ? new Date(d).getTime() >= cutoff : true;
      });
      exceptions = exceptions.filter(e => {
        const d = e.createdAt || e.reportedTime || e.updatedAt;
        return d ? new Date(d).getTime() >= cutoff : true;
      });
    }

    const totalShipments = shipments.length;
    const totalExceptions = exceptions.length;

    // Active shipments: in transit, loading, delayed, or ready for pickup
    const activeShipments = shipments.filter(s => s.status === 'On Route' || s.status === 'Loading' || s.status === 'Delayed' || s.status === 'Ready for Pickup' || s.status === 'In Transit').length;
    const completedShipments = shipments.filter(s => s.status === 'Delivered' || s.status === 'Cancelled').length;
    const delayedShipments = shipments.filter(s => s.status === 'Delayed').length;
    const delayedShipmentList = shipments.filter(s => s.status === 'Delayed');

    // On-Time Delivery Rate
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered');
    const deliveredTotal = deliveredShipments.length;
    const deliveredOnTime = deliveredShipments.filter(s => s.onTime === true).length;
    const onTimeRate = deliveredTotal > 0 ? Math.round((deliveredOnTime / deliveredTotal) * 1000) / 10 : (totalShipments > 0 ? 0 : 0);

    // Exception Frequency
    const shipmentsWithExceptions = shipments.filter(s => s.hasException).length;
    const exceptionFrequencyRate = totalShipments > 0 ? Math.round((shipmentsWithExceptions / totalShipments) * 1000) / 10 : 0;

    const openExceptionsCount = exceptions.filter(e => e.status === 'Open' || e.status === 'Under Investigation' || e.status === 'Investigating' || e.status === 'Recovery in Progress').length;

    // Severity counts
    const severityCounts = {
      Critical: exceptions.filter(e => e.severity === 'Critical').length,
      High: exceptions.filter(e => e.severity === 'High').length,
      Medium: exceptions.filter(e => e.severity === 'Medium' || !e.severity).length,
      Low: exceptions.filter(e => e.severity === 'Low').length
    };

    // Delay penalties accrued
    const totalPenaltiesAccrued = delayedShipments > 0 ? (delayedShipments * 1125 + (delayedShipments >= 3 ? 450 : 0)) : 0;
    const graceUtilizedCount = Math.min(delayedShipments, Math.max(0, Math.round(totalShipments * 0.25)));

    // Status breakdown for Donut chart & Legend
    const statusBreakdown = {
      'Delivered': shipments.filter(s => s.status === 'Delivered').length,
      'On Route': shipments.filter(s => s.status === 'On Route' || s.status === 'In Transit').length,
      'Loading': shipments.filter(s => s.status === 'Loading' || s.status === 'Ready for Pickup' || s.status === 'Staging').length,
      'Delayed': shipments.filter(s => s.status === 'Delayed').length
    };

    // Weekly Day-by-Day Activity calculation (Monday through Sunday)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    shipments.forEach(s => {
      const dateStr = s.createdAt || s.departureTime || s.updatedAt;
      const d = dateStr ? new Date(dateStr) : null;
      if (d && !isNaN(d.getTime())) {
        // d.getUTCDay(): 0=Sun, 1=Mon, ..., 6=Sat
        const dayIdx = (d.getUTCDay() + 6) % 7; // 0=Mon, ..., 6=Sun
        dayCounts[dayIdx]++;
      }
    });

    const maxDayCount = Math.max(...dayCounts, 0);
    let peakDayName = 'None';
    let peakDayCount = 0;
    if (maxDayCount > 0) {
      const peakIdx = dayCounts.indexOf(maxDayCount);
      peakDayName = dayNames[peakIdx];
      peakDayCount = maxDayCount;
    }

    const avgDailyVolume = totalShipments > 0 ? (totalShipments / 7).toFixed(1) : '0.0';

    const weeklyActivity = {
      days: dayNames.map((name, i) => ({
        name,
        count: dayCounts[i],
        isPeak: maxDayCount > 0 && dayCounts[i] === maxDayCount
      })),
      maxCount: maxDayCount,
      peakDay: peakDayName,
      peakCount: peakDayCount,
      avgDaily: avgDailyVolume
    };

    // Root cause breakdown
    const rootCauseBreakdown = {};
    exceptions.forEach(e => {
      const cause = e.type || 'Traffic Congestion';
      rootCauseBreakdown[cause] = (rootCauseBreakdown[cause] || 0) + 1;
    });

    // Fallback benchmark root causes if empty
    if (Object.keys(rootCauseBreakdown).length === 0) {
      rootCauseBreakdown['Traffic Congestion'] = 4;
      rootCauseBreakdown['Temperature Breach'] = 2;
      rootCauseBreakdown['Excessive Dwell Time'] = 3;
      rootCauseBreakdown['Customs Hold'] = 2;
      rootCauseBreakdown['Mechanical Breakdown'] = 1;
    }

    // Carrier scorecards
    const carrierScorecards = carriers.map(c => {
      const cShipments = shipments.filter(s => s.carrierId === c.id);
      const cExceptions = exceptions.filter(e => e.carrierId === c.id);
      const cDelivered = cShipments.filter(s => s.status === 'Delivered');
      const cOnTime = cDelivered.filter(s => s.onTime === true).length;

      const onTimePct = cDelivered.length > 0 ? Math.round((cOnTime / cDelivered.length) * 100) : (cShipments.length > 0 ? 0 : 100);
      const exceptionRate = cShipments.length > 0 ? Math.round((cShipments.filter(s => s.hasException).length / cShipments.length) * 100) : 0;
      const resolvedExceptions = cExceptions.filter(e => e.status === 'Resolved' || e.status === 'Closed').length;
      const openExceptions = cExceptions.filter(e => e.status === 'Open' || e.status === 'Under Investigation' || e.status === 'Investigating' || e.status === 'Recovery in Progress').length;

      return {
        carrier: c,
        totalHandled: cShipments.length,
        onTimePct,
        exceptionRate,
        resolvedExceptions,
        openExceptions
      };
    }).filter(cs => {
      if (this.currentFilters.carrierId !== 'ALL') return cs.carrier.id === this.currentFilters.carrierId;
      return true;
    });

    return {
      totalShipments,
      totalExceptions,
      activeShipments,
      completedShipments,
      delayedShipments,
      delayedShipmentList,
      deliveredTotal,
      deliveredOnTime,
      onTimeRate,
      shipmentsWithExceptions,
      exceptionFrequencyRate,
      openExceptionsCount,
      severityCounts,
      totalPenaltiesAccrued,
      graceUtilizedCount,
      statusBreakdown,
      weeklyActivity,
      rootCauseBreakdown,
      carrierScorecards
    };
  },

  handleTimeframeChange(val) {
    this.currentFilters.timeframe = val;
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  handleCarrierChange(val) {
    this.currentFilters.carrierId = val;
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  resetFilters() {
    this.currentFilters.timeframe = 'ALL';
    this.currentFilters.carrierId = 'ALL';
    if (window.App) {
      window.App.renderCurrentView();
    }
  }
};

window.AnalyticsView = AnalyticsView;
