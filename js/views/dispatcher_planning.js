/**
 * BRIDGES Control Tower - Recovery Planning Workspace
 * Comprehensive two-column operational planning workspace for transport dispatchers.
 * Supports evaluation of all 5 recovery strategies:
 * 1. Re-route
 * 2. Alternate Carrier
 * 3. Expedite
 * 4. Split Shipment
 * 5. Wait-and-Monitor
 * Includes side-by-side Comparative Evaluation Matrix (ETA, Cost, Availability, SLA feasibility).
 */

const DispatcherPlanningView = {
  selectedExceptionId: null,
  selectedStrategy: null,
  lastSelectedExceptionId: null,
  isSubmitting: false,

  getExceptionDefaultStrategy(exception, shipment) {
    if (!exception) return 'Alternate Carrier';

    // 1. Check existing active/pending recovery request in store
    const recs = window.BRIDGES_STORE.getRecoveryRequests();
    const existingRec = recs.find(r => r.exceptionId === exception.id && r.responseStatus !== 'Superseded' && r.responseStatus !== 'Rejected');
    if (existingRec && existingRec.recoveryStrategy) {
      return existingRec.recoveryStrategy;
    }

    // 2. Rule-based recommendation matching queue & dispatch logic
    const type = exception.type || '';
    const reason = (exception.reason || exception.rootCause || '').toLowerCase();

    if (type === 'Temperature Breach' || reason.includes('temp') || reason.includes('reefer') || reason.includes('compressor')) {
      return 'Alternate Carrier';
    }
    if (reason.includes('rock') || reason.includes('road') || reason.includes('traffic') || reason.includes('detour') || (type === 'Route Delay' && !reason.includes('blizzard'))) {
      return 'Re-route';
    }
    if (exception.severity === 'Critical') {
      return 'Expedite';
    }
    if (type === 'Partial Cargo Offload' || reason.includes('split')) {
      return 'Split Shipment';
    }
    return 'Wait-and-Monitor';
  },

  render() {
    const exceptions = window.BRIDGES_STORE.getExceptions();
    const actionable = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Under Investigation', 'Recovery in Progress', 'Escalated'].includes(e.status)
    );

    // If no exception selected, select first actionable or first exception
    if (!this.selectedExceptionId || !window.BRIDGES_STORE.getException(this.selectedExceptionId)) {
      if (actionable.length > 0) {
        this.selectedExceptionId = actionable[0].id;
      } else if (exceptions.length > 0) {
        this.selectedExceptionId = exceptions[0].id;
      }
    }

    const currentException = this.selectedExceptionId ? window.BRIDGES_STORE.getException(this.selectedExceptionId) : null;
    const currentShipment = currentException ? window.BRIDGES_STORE.getShipment(currentException.shipmentId) : null;
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();

    if (!currentException || !currentShipment) {
      return `
        <div class="analyst-page-container animate-fade-in">
          <div class="analyst-empty-state">
            <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
            <div class="empty-state-title">No Active Exceptions for Planning</div>
            <div class="empty-state-sub">There are currently zero open shipment exceptions requiring dispatcher recovery planning.</div>
          </div>
        </div>
      `;
    }

    // Auto-select strategy if exception changed or strategy not yet set
    if (this.lastSelectedExceptionId !== this.selectedExceptionId || !this.selectedStrategy) {
      this.selectedStrategy = this.getExceptionDefaultStrategy(currentException, currentShipment);
      this.lastSelectedExceptionId = this.selectedExceptionId;
    }

    // Existing recovery request for this exception if any
    const existingRec = currentException.recoveryRequestId ? window.BRIDGES_STORE.getRecoveryRequest(currentException.recoveryRequestId) : null;

    // Rule-based ranking calculation for all 5 strategies
    const allStrategies = this.getRankedStrategies(currentException, currentShipment);
    // Display only the related strategy option for this exception
    const matchedStrategies = allStrategies.filter(strat => strat.name === this.selectedStrategy);
    const strategies = matchedStrategies.length > 0 ? matchedStrategies : [allStrategies[0]];

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- TOP BREADCRUMB & EXCEPTION SELECTOR -->
        <div class="page-action-header" style="margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Recovery Planning Workspace</h2>
              <span class="badge badge-primary">Operational Decision Making</span>
            </div>
            <p class="page-subheading">
              Evaluate and select re-route, alternate carrier, expedite, split, or wait-and-monitor options. Compare ETA, cost, carrier availability, and SLA feasibility.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="DispatcherPlanningView.openComparativeMatrixModal()" style="font-weight: 700; background: #FFFDF5; border-color: #F59E0B; color: #92400E;">
              📊 Compare All 5 Strategies Matrix
            </button>
            <label style="font-size: 11.5px; font-weight: 600; color: var(--color-charcoal);">Select Exception:</label>
            <select class="planning-select" style="min-width: 220px;" onchange="DispatcherPlanningView.selectException(this.value)">
              ${exceptions.map(e => `
                <option value="${e.id}" ${e.id === this.selectedExceptionId ? 'selected' : ''}>
                  ${e.id} (${e.shipmentId}) — ${e.severity} [${e.status}]
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- TWO-COLUMN WORKSPACE LAYOUT -->
        <div class="planning-workspace-layout">
          <!-- LEFT PANEL: SHIPMENT & EXCEPTION CONTEXT -->
          <div class="planning-context-panel">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--color-light-blue-grey);">
              <div>
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-muted-sage);">Context Dossier</span>
                <div style="font-size: 15px; font-weight: 800; color: var(--color-midnight);">${currentException.id}</div>
              </div>
              <span class="severity-badge ${currentException.severity === 'Critical' ? 'badge-danger' : currentException.severity === 'High' ? 'badge-warning' : 'badge-secondary'}">
                ${currentException.severity} Severity
              </span>
            </div>

            <!-- Exception Summary -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 600; color: var(--color-charcoal); margin-bottom: 3px;">DEVIATION REASON</div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--color-midnight); line-height: 1.35;">${currentException.reason}</div>
              <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 3px;">
                Type: <strong>${currentException.type}</strong> · Detected: ${currentException.detectionTime ? new Date(currentException.detectionTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Logged'}
              </div>
            </div>

            <!-- Shipment Metadata Grid -->
            <div class="meta-kv-grid" style="margin-bottom: 14px;">
              <div class="meta-kv-item">
                <span class="meta-kv-label">Shipment ID</span>
                <span class="meta-kv-value" style="color: var(--color-royal-navy); font-weight: 800;">${currentShipment.id}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Customer</span>
                <span class="meta-kv-value" style="font-weight: 700; color: #18217E;">${currentShipment.customerName || 'BioPharma Health Alliance'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Cargo & Value</span>
                <span class="meta-kv-value">${currentShipment.cargoDescription || 'Medical Biologics'} · <strong style="color: #1E8E3E;">${currentShipment.cargoValue || '$185,000'}</strong></span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Order Reference</span>
                <span class="meta-kv-value">${currentShipment.orderReference || 'ORD-98248'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Origin → Destination</span>
                <span class="meta-kv-value">${currentShipment.origin} → ${currentShipment.destination}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Current Carrier</span>
                <span class="meta-kv-value">${currentShipment.carrier || currentShipment.carrierName || 'Bridges Global Logistics'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Vehicle & Driver</span>
                <span class="meta-kv-value">${currentShipment.vehicle || 'FR-09 Reefer'} · ${currentShipment.driver || 'Marcus Vance'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Customer Tier</span>
                <span class="meta-kv-value">${currentShipment.customerTier || 'Tier 1 Strategic'}</span>
              </div>
            </div>

            <!-- SLA & Financial Impact Box -->
            <div style="background: #F8FAFB; border: 1px solid var(--color-light-blue-grey); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--color-midnight); text-transform: uppercase; margin-bottom: 8px;">
                SLA & Delivery Commitments
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11.5px;">
                <div>
                  <span style="color: var(--color-muted-sage); font-size: 10.5px; display: block;">Original ETA</span>
                  <strong style="color: var(--color-midnight);">${this.formatDisplayTime(currentShipment.originalETA || currentShipment.estArrival)}</strong>
                </div>
                <div>
                  <span style="color: var(--color-muted-sage); font-size: 10.5px; display: block;">Predicted ETA</span>
                  <strong style="color: var(--color-signal-red);">${this.formatDisplayTime(currentException.predictedETA || currentShipment.predictedETA)}</strong>
                </div>
                <div>
                  <span style="color: var(--color-muted-sage); font-size: 10.5px; display: block;">Delivery Commitment</span>
                  <strong style="color: var(--color-midnight);">${this.formatDisplayTime(currentShipment.deliveryCommitment)}</strong>
                </div>
                <div>
                  <span style="color: var(--color-muted-sage); font-size: 10.5px; display: block;">SLA Penalty Risk</span>
                  <span class="badge ${currentException.slaRisk === 'Critical' ? 'badge-danger' : 'badge-warning'}">
                    ${currentException.slaRisk || 'High Risk'}
                  </span>
                </div>
              </div>

              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #EDF2F6; display: flex; justify-content: space-between; font-size: 11.5px;">
                <span style="color: var(--color-charcoal);">Estimated Business Impact:</span>
                <strong style="color: var(--color-deep-red);">${currentException.estimatedBusinessImpact || currentShipment.estimatedPenalty || '$4,500'}</strong>
              </div>
            </div>

            <!-- Existing Linked Recovery Request Banner (if any) -->
            ${existingRec ? `
              <div style="padding: 10px 12px; background: rgba(24, 33, 126, 0.05); border: 1px solid rgba(24, 33, 126, 0.15); border-radius: 6px; font-size: 11.5px;">
                <div style="font-weight: 700; color: var(--color-royal-navy); margin-bottom: 2px;">
                  Linked Recovery Request: ${existingRec.id}
                </div>
                <div style="color: var(--color-charcoal);">
                  Strategy: <strong>${existingRec.recoveryStrategy}</strong> · Status: ${UI.renderStatusBadge(existingRec.responseStatus)}
                </div>
                <div style="font-size: 10.5px; color: var(--color-muted-sage); margin-top: 4px;">
                  Updated: ${new Date(existingRec.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ` : `
              <div style="padding: 10px 12px; background: #FFFDF5; border: 1px solid #FDE68A; border-radius: 6px; font-size: 11.5px; color: #92400E;">
                <strong>No Active Recovery Submitted:</strong> Select and configure one of the 5 recovery strategies on the right.
              </div>
            `}
          </div>

          <!-- RIGHT PANEL: STRATEGY CARD & DYNAMIC PLANNING FORM -->
          <div class="planning-options-panel">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-muted-sage);">Recovery Decision Making</span>
                <div style="font-size: 15px; font-weight: 800; color: var(--color-midnight);">Selected Recovery Strategy: ${this.selectedStrategy}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-primary" style="font-size: 10px;">Recommended Strategy</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="DispatcherPlanningView.openComparativeMatrixModal()" style="font-size: 10.5px; padding: 2px 8px; font-weight: 600;">
                  Compare / Switch
                </button>
              </div>
            </div>

            <!-- STRATEGY SELECTOR CARD (Only Related Strategy Option) -->
            <div class="strategy-cards-grid" style="grid-template-columns: 1fr;">
              ${strategies.map(strat => `
                <div class="strategy-select-card active-selected" style="cursor: default;">
                  <div>
                    <div class="strategy-card-header">
                      <span class="strategy-card-name">
                        ${strat.icon} ${strat.name}
                      </span>
                      <span class="strategy-pill ${strat.pillClass}">${strat.pillText}</span>
                    </div>

                    <div class="strategy-meta-grid">
                      <div>
                        <span class="strategy-meta-label">ETA Impact:</span>
                        <div class="strategy-meta-val" style="color: #1E8E3E;">${strat.etaImpact}</div>
                      </div>
                      <div>
                        <span class="strategy-meta-label">Est. Cost:</span>
                        <div class="strategy-meta-val">${strat.cost}</div>
                      </div>
                      <div>
                        <span class="strategy-meta-label">SLA Protection:</span>
                        <div class="strategy-meta-val">${strat.slaProtection}</div>
                      </div>
                      <div>
                        <span class="strategy-meta-label">Feasibility:</span>
                        <div class="strategy-meta-val">${strat.feasibility}</div>
                      </div>
                    </div>

                    <p class="strategy-rationale-text">${strat.rationale}</p>
                  </div>

                  <button type="button" class="btn-select-strategy" style="pointer-events: none;">
                    ✓ Selected Strategy
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- DYNAMIC STRATEGY CONFIGURATION FORM -->
            <div class="strategy-form-container">
              <form id="dispatcher-planning-form" onsubmit="DispatcherPlanningView.handleRecoverySubmit(event)">
                <div class="strategy-form-title">
                  <span>Configure: ${this.selectedStrategy} Plan</span>
                  <span style="font-size: 11px; font-weight: 500; color: var(--color-muted-sage);">
                    Target Exception: <strong>${currentException.id}</strong> (${currentShipment.id})
                  </span>
                </div>

                <!-- Strategy-specific fields -->
                ${this.renderStrategyFields(this.selectedStrategy, currentException, currentShipment, activeCarriers)}

                <!-- Common operational notes -->
                <div class="planning-form-group">
                  <label class="planning-form-label">Operational Dispatch Instructions & Handover Notes *</label>
                  <textarea name="operationalNotes" class="planning-textarea" required placeholder="Provide clear handover notes for carrier dispatch, driver instructions, and corridor routing requirements...">${this.getDefaultOperationalNotes(this.selectedStrategy, currentException, currentShipment)}</textarea>
                </div>

                <div class="planning-form-group">
                  <label class="planning-form-label">Expected ETA Impact Summary *</label>
                  <input type="text" name="expectedEtaImpact" class="planning-input" required value="${this.getDefaultEtaImpact(this.selectedStrategy, currentException)}">
                </div>

                <!-- Action Button Row -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--color-light-blue-grey);">
                  <div style="font-size: 11px; color: var(--color-muted-sage);">
                    Transmits formal recovery instruction to carrier dispatch workflow.
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_queue')">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary btn-sm" id="btn-submit-recovery" ${this.isSubmitting ? 'disabled' : ''} style="font-weight: 700; padding: 6px 14px;">
                      ${this.isSubmitting ? 'Submitting Request...' : `Transmit ${this.selectedStrategy} Plan`}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getRankedStrategies(exception, shipment) {
    const isTempBreach = exception.type === 'Temperature Breach';
    const isRockfall = (exception.reason || '').toLowerCase().includes('rockfall') || (exception.reason || '').toLowerCase().includes('road') || (exception.reason || '').toLowerCase().includes('traffic');
    const isCritical = exception.severity === 'Critical';

    return [
      {
        name: 'Re-route',
        icon: Icons.reroute(15),
        pillText: isRockfall ? 'Recommended' : 'Feasible',
        pillClass: isRockfall ? 'recommended' : 'feasible',
        etaImpact: '-45m to -1h',
        cost: '+$180 Fuel Detour',
        slaProtection: 'High (Bypasses Obstruction)',
        feasibility: 'High (Existing Truck)',
        availability: 'Immediate (Active Driver)',
        slaScore: '94% On-Time Probability',
        rationale: isRockfall 
          ? 'Recommended: Local road blockage can be circumvented via secondary arterial with minimal detour penalty.'
          : 'Feasible if alternative highway routes exist around primary choke point.'
      },
      {
        name: 'Alternate Carrier',
        icon: Icons.swap(15),
        pillText: isTempBreach ? 'Recommended' : 'Feasible',
        pillClass: isTempBreach ? 'recommended' : 'feasible',
        etaImpact: '-2h to -3h',
        cost: '+$450 Carrier Switch',
        slaProtection: 'Very High',
        feasibility: 'Medium (Requires active fleet slot)',
        availability: 'Confirmed Capacity (Falcon / Swift)',
        slaScore: '98% On-Time Probability',
        rationale: isTempBreach
          ? 'Recommended: Mechanical reefer failure requires prompt equipment swap to specialized cold chain carrier.'
          : 'Assigns standby certified carrier fleet with confirmed capacity in regional sector.'
      },
      {
        name: 'Expedite',
        icon: Icons.zap(15),
        pillText: isCritical ? 'Recommended' : 'High Cost',
        pillClass: isCritical ? 'recommended' : 'high-cost',
        etaImpact: '-3h 30m',
        cost: '+$950 Express Tier',
        slaProtection: 'Critical Recovery',
        feasibility: 'High (Priority Lane)',
        availability: 'Dedicated Sprint Team Ready',
        slaScore: '99% On-Time Probability',
        rationale: 'Engages priority air transfer or dedicated dual-driver courier to salvage impending SLA breach.'
      },
      {
        name: 'Split Shipment',
        icon: Icons.split(15),
        pillText: 'Complex Allocation',
        pillClass: 'complex',
        etaImpact: '-1h (Priority Batch)',
        cost: '+$320 Split Handling',
        slaProtection: 'Partial (Key portion)',
        feasibility: 'Moderate (Portioning required)',
        availability: 'Requires Cross-Dock Slot',
        slaScore: '85% Core SLA Protected',
        rationale: 'Bifurcates critical production components from general freight to meet partial delivery commitments.'
      },
      {
        name: 'Wait-and-Monitor',
        icon: Icons.eye(15),
        pillText: 'Zero Surcharge',
        pillClass: 'feasible',
        etaImpact: '0m variance (Buffered)',
        cost: '$0 (No Operational Surcharge)',
        slaProtection: 'Moderate (Buffer dependent)',
        feasibility: 'Immediate (Telemetry Poll)',
        availability: 'No External Fleet Required',
        slaScore: '88% Within Grace Period',
        rationale: 'Hold active carrier tender while monitoring GPS pings and terminal queue clearing. Optimal when delivery buffer absorbs delay without breach.'
      }
    ];
  },

  renderStrategyFields(strategy, exception, shipment, activeCarriers) {
    if (strategy === 'Re-route') {
      return `
        <div class="planning-form-group">
          <label class="planning-form-label">Current Route Plan (Readonly)</label>
          <input type="text" class="planning-input" readonly value="${shipment.origin} → Highway Route 4 Sector → ${shipment.destination}">
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Proposed Alternative Route *</label>
          <input type="text" name="proposedRoute" class="planning-input" required 
                 value="Valley Arterial 3 Bypass around rockslide sector to ${shipment.destination}">
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Reason for Route Change *</label>
          <input type="text" name="reasonForRecovery" class="planning-input" required 
                 value="${exception.reason || 'Primary highway corridor obstructed; active detour engaged.'}">
        </div>
      `;
    }

    if (strategy === 'Alternate Carrier') {
      return `
        <div class="planning-form-group">
          <label class="planning-form-label">Select Active Replacement Carrier *</label>
          <select name="requestedCarrierId" class="planning-select" required>
            <option value="">-- Choose active carrier from registry --</option>
            ${activeCarriers.map(c => `
              <option value="${c.id}" ${c.id === 'CAR-01' ? 'selected' : ''}>
                ${c.name} (${c.id}) — Region: ${c.operatingRegion} [Rating: ${c.rating}★]
              </option>
            `).join('')}
          </select>
          <div style="font-size: 10.5px; color: var(--color-muted-sage); margin-top: 3px;">
            Per governance rules, inactive carrier CAR-06 is excluded from operational recovery assignments.
          </div>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Reason for Carrier Assignment *</label>
          <input type="text" name="reasonForRecovery" class="planning-input" required 
                 value="Current carrier equipment malfunction or delay requires certified partner swap.">
        </div>
      `;
    }

    if (strategy === 'Expedite') {
      return `
        <div class="planning-form-group">
          <label class="planning-form-label">Required Delivery Timeframe / Urgency Tier *</label>
          <select name="expediteUrgency" class="planning-select" required>
            <option value="Emergency (Same-day Charter)">Emergency (Same-day Charter Flight)</option>
            <option value="High (Dual-Driver Priority Ground)" selected>High (Dual-Driver Priority Ground)</option>
            <option value="Standard Expedite (Priority Dispatch)">Standard Expedite (Priority Dispatch)</option>
          </select>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Reason for Urgency *</label>
          <input type="text" name="reasonForRecovery" class="planning-input" required 
                 value="Impending SLA breach threshold. Urgent courier acceleration required.">
        </div>
      `;
    }

    if (strategy === 'Split Shipment') {
      return `
        <div class="planning-form-group">
          <label class="planning-form-label">Reason for Split Recovery *</label>
          <input type="text" name="reasonForRecovery" class="planning-input" required 
                 value="Partitioning time-critical biologics batch from bulk storage components.">
        </div>

        <div class="split-recon-meter">
          <span>Original Shipment Capacity: <strong>1,000 Units (100%)</strong></span>
          <span class="split-recon-status matched" id="split-status-indicator">✓ Reconciled: 600 + 400 = 1,000 Units</span>
        </div>

        <div class="split-alloc-grid">
          <div class="split-portion-box">
            <div class="split-portion-title">Portion A (Expedited / Critical)</div>
            <div class="planning-form-group">
              <label class="planning-form-label">Cargo Allocation (Units)</label>
              <input type="number" id="split-portion-1" name="portion1Qty" class="planning-input" value="600" min="1" max="1000" oninput="DispatcherPlanningView.validateSplit()">
            </div>
            <div class="planning-form-group">
              <label class="planning-form-label">Destination</label>
              <input type="text" name="portion1Dest" class="planning-input" value="${shipment.destination}">
            </div>
          </div>

          <div class="split-portion-box">
            <div class="split-portion-title">Portion B (Standard Ground)</div>
            <div class="planning-form-group">
              <label class="planning-form-label">Cargo Allocation (Units)</label>
              <input type="number" id="split-portion-2" name="portion2Qty" class="planning-input" value="400" min="1" max="1000" oninput="DispatcherPlanningView.validateSplit()">
            </div>
            <div class="planning-form-group">
              <label class="planning-form-label">Destination</label>
              <input type="text" name="portion2Dest" class="planning-input" value="${shipment.destination}">
            </div>
          </div>
        </div>
      `;
    }

    if (strategy === 'Wait-and-Monitor') {
      return `
        <div class="planning-form-group">
          <label class="planning-form-label">Monitoring Sampling Interval *</label>
          <select name="monitoringInterval" class="planning-select" required>
            <option value="Every 15 Minutes">Every 15 Minutes (High Priority / Cold Chain)</option>
            <option value="Every 30 Minutes" selected>Every 30 Minutes (Standard Highway Delay)</option>
            <option value="Every 1 Hour">Every 1 Hour (Port / Terminal Choke Point)</option>
            <option value="Every 2 Hours">Every 2 Hours (Long-Haul Rest Stop)</option>
          </select>
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Auto-Escalation Delay Threshold *</label>
          <input type="text" name="autoEscalateThreshold" class="planning-input" value="If delay exceeds +90 minutes, trigger SLA Escalation">
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Sensor / Waypoint Verification Condition *</label>
          <input type="text" name="sensorCheckCondition" class="planning-input" value="Confirm GPS progress past Milepost 180 and reefer stable between 2°C - 8°C">
        </div>

        <div class="planning-form-group">
          <label class="planning-form-label">Operational Reason for Monitoring *</label>
          <input type="text" name="reasonForRecovery" class="planning-input" required 
                 value="Shipment is within grace period buffer. Monitoring telemetry before engaging costly fleet diversion.">
        </div>
      `;
    }

    return '';
  },

  getDefaultOperationalNotes(strategy, exception, shipment) {
    if (strategy === 'Re-route') {
      return `Bypass authorized due to ${exception.reason}. Driver instructed to take secondary arterial. Weight limits verified with road transport administration.`;
    }
    if (strategy === 'Alternate Carrier') {
      return `Target carrier confirmed active with standby fleet. Requesting transfer of bill of lading and hazardous seal verification upon trailer coupling.`;
    }
    if (strategy === 'Expedite') {
      return `Dedicated dual-driver dispatch authorized. Zero intermediate stops permitted between waypoint and delivery hub.`;
    }
    if (strategy === 'Split Shipment') {
      return `Portion A transferred to priority van. Portion B will proceed on primary schedule via standard linehaul.`;
    }
    if (strategy === 'Wait-and-Monitor') {
      return `Hold carrier tender. Monitor active telemetry every 30 minutes. If delay crosses 90 minutes without resolution, trigger immediate expedite or alternate carrier.`;
    }
    return '';
  },

  getDefaultEtaImpact(strategy, exception) {
    if (strategy === 'Re-route') return '-45m recovery versus static waiting';
    if (strategy === 'Alternate Carrier') return '-2h 30m expedited recovery';
    if (strategy === 'Expedite') return '-3h 30m urgent courier acceleration';
    if (strategy === 'Split Shipment') return '-1h for critical portion; nominal for secondary';
    if (strategy === 'Wait-and-Monitor') return '0m variance / buffer absorbs deviation';
    return '-1h estimated recovery';
  },

  validateSplit() {
    const p1 = parseInt(document.getElementById('split-portion-1')?.value || 0, 10);
    const p2 = parseInt(document.getElementById('split-portion-2')?.value || 0, 10);
    const total = p1 + p2;
    const indicator = document.getElementById('split-status-indicator');
    if (!indicator) return;

    if (total === 1000) {
      indicator.className = 'split-recon-status matched';
      indicator.textContent = `✓ Reconciled: ${p1} + ${p2} = 1,000 Units`;
    } else {
      indicator.className = 'split-recon-status mismatch';
      indicator.textContent = `⚠️ Allocation Mismatch: ${p1} + ${p2} = ${total} (Expected: 1,000 Units)`;
    }
  },

  setStrategy(strategyName) {
    this.selectedStrategy = strategyName;
    App.renderCurrentView();
  },

  selectException(exceptionId, strategy) {
    this.selectedExceptionId = exceptionId;
    this.lastSelectedExceptionId = exceptionId;
    const exception = window.BRIDGES_STORE.getException(exceptionId);
    const shipment = exception ? window.BRIDGES_STORE.getShipment(exception.shipmentId) : null;
    this.selectedStrategy = strategy || this.getExceptionDefaultStrategy(exception, shipment);
    App.renderCurrentView();
  },

  openComparativeMatrixModal() {
    const exception = window.BRIDGES_STORE.getException(this.selectedExceptionId);
    const shipment = exception ? window.BRIDGES_STORE.getShipment(exception.shipmentId) : null;
    if (!exception || !shipment) return;

    const strats = this.getRankedStrategies(exception, shipment);

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #E5EBEE;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #18217E;">Comparative Recovery Evaluation Matrix</div>
            <div style="font-size: 11.5px; color: #64748B;">Comparing 5 recovery strategies for <strong>${exception.id}</strong> (${shipment.id})</div>
          </div>
          <span class="severity-badge ${exception.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">${exception.severity} Deviation</span>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="font-size: 11.5px;">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>ETA Impact</th>
                <th>Additional Cost</th>
                <th>Carrier Availability</th>
                <th>SLA Feasibility & Protection</th>
                <th>Operational Rationale</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${strats.map(s => `
                <tr style="${this.selectedStrategy === s.name ? 'background: rgba(24, 33, 126, 0.04); font-weight: 600;' : ''}">
                  <td>
                    <div style="font-weight: 700; color: #18217E; font-size: 12px;">${s.name}</div>
                    <span class="strategy-pill ${s.pillClass}" style="margin-top: 3px;">${s.pillText}</span>
                  </td>
                  <td><strong style="color: #1E8E3E;">${s.etaImpact}</strong></td>
                  <td><span style="font-weight: 700;">${s.cost}</span></td>
                  <td>${s.availability || 'Available'}</td>
                  <td>
                    <div style="font-weight: 700; color: #070724;">${s.slaScore || 'High Protection'}</div>
                    <div style="font-size: 10px; color: #64748B;">${s.slaProtection}</div>
                  </td>
                  <td style="max-width: 220px; white-space: normal; font-size: 10.5px; line-height: 1.3;">
                    ${s.rationale}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn ${this.selectedStrategy === s.name ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                            onclick="UI.closeModal('generic-app-modal'); DispatcherPlanningView.setStrategy('${s.name}');"
                            style="padding: 4px 10px; font-weight: 700;">
                      ${this.selectedStrategy === s.name ? '✓ Selected' : 'Choose'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Comparative Strategy Evaluation — ${exception.id}`, modalHtml);
  },

  handleRecoverySubmit(e) {
    e.preventDefault();
    if (this.isSubmitting) return;

    const form = e.target;
    const user = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const exception = window.BRIDGES_STORE.getException(this.selectedExceptionId);
    if (!exception) {
      UI.showToast("Selected exception not found.", "error");
      return;
    }

    const payload = {
      exceptionId: exception.id,
      shipmentId: exception.shipmentId,
      recoveryStrategy: this.selectedStrategy,
      reasonForRecovery: form.reasonForRecovery ? form.reasonForRecovery.value : 'Operational recovery',
      operationalNotes: form.operationalNotes.value,
      expectedEtaImpact: form.expectedEtaImpact.value,
      submittedBy: user ? `${user.name} (${user.role})` : 'Marcus Vance (Dispatcher)'
    };

    if (this.selectedStrategy === 'Re-route') {
      payload.proposedRoute = form.proposedRoute ? form.proposedRoute.value : '';
    } else if (this.selectedStrategy === 'Alternate Carrier') {
      payload.requestedCarrierId = form.requestedCarrierId ? form.requestedCarrierId.value : '';
    } else if (this.selectedStrategy === 'Expedite') {
      payload.expediteUrgency = form.expediteUrgency ? form.expediteUrgency.value : 'High';
    } else if (this.selectedStrategy === 'Wait-and-Monitor') {
      payload.monitoringInterval = form.monitoringInterval ? form.monitoringInterval.value : 'Every 30 Minutes';
    } else if (this.selectedStrategy === 'Split Shipment') {
      const p1 = parseInt(form.portion1Qty?.value || 0, 10);
      const p2 = parseInt(form.portion2Qty?.value || 0, 10);
      if (p1 + p2 !== 1000) {
        UI.showToast("Split allocation must reconcile exactly with the 1,000 shipment units.", "error");
        return;
      }
      payload.splitDetails = {
        portion1: { qty: p1, dest: form.portion1Dest?.value },
        portion2: { qty: p2, dest: form.portion2Dest?.value }
      };
    }

    try {
      this.isSubmitting = true;
      const btn = document.getElementById('btn-submit-recovery');
      if (btn) btn.disabled = true;

      const created = window.BRIDGES_STORE.createRecoveryRequest(payload);
      UI.showToast(`Recovery request ${created.id} (${created.recoveryStrategy}) submitted.`, 'success');

      setTimeout(() => {
        this.isSubmitting = false;
        App.navigateTo('dispatcher_recoveries');
      }, 350);
    } catch (err) {
      this.isSubmitting = false;
      UI.showToast(err.message, 'error');
      const btn = document.getElementById('btn-submit-recovery');
      if (btn) btn.disabled = false;
    }
  },

  formatDisplayTime(iso) {
    if (!iso) return 'Not available';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch (e) {
      return iso;
    }
  }
};

window.DispatcherPlanningView = DispatcherPlanningView;
