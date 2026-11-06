/**
 * BRIDGES Control Tower - Analyst Investigation Workspace (US-22 to US-32)
 * Comprehensive multi-panel operational workspace:
 * Panel A: Exception Summary
 * Panel B: Business Impact & SLA Metrics
 * Panel C: Shipment Milestones & Timeline History
 * Panel D: Route Corridor & Alternate Detour View
 * Panel E: Ranked Rule-based Recovery Options with instant Request Modal trigger
 */

const AnalystInvestigationView = {
  currentExceptionId: 'EXC-1048',

  formatDisplayTime(iso) {
    if (!iso) return '--';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const monthStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${timeStr} (${monthStr})`;
    } catch (e) {
      return iso;
    }
  },

  render() {
    const exceptions = window.BRIDGES_STORE.getExceptions();
    
    // Pick active or first exception
    let exc = exceptions.find(e => e.id === this.currentExceptionId);
    if (!exc && exceptions.length > 0) {
      exc = exceptions[0];
      this.currentExceptionId = exc.id;
    }

    if (!exc) {
      return `
        <div class="view-container animate-fade-in">
          <div class="analyst-empty-state">
            <div class="empty-state-icon-wrap">${Icons.investigate(24)}</div>
            <div class="empty-state-title">No Exceptions Available for Investigation</div>
            <div class="empty-state-sub">There are currently no active or historical exceptions in the database.</div>
          </div>
        </div>
      `;
    }

    const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId);
    const carrier = shipment ? window.BRIDGES_STORE.getCarrier(shipment.carrierId) : null;
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();
    const currentUser = window.BRIDGES_AUTH.getCurrentUser();
    const myName = currentUser ? currentUser.name : "Sarah Lin";

    // Linked recovery request if any
    const linkedRecovery = exc.recoveryRequestId ? window.BRIDGES_STORE.getRecoveryRequest(exc.recoveryRequestId) : null;

    // Rule-based ranked recovery options tailored to exception type
    const recoveryOptions = this.getRankedRecoveryOptions(exc, shipment);

    return `
      <div class="view-container animate-fade-in">
        <!-- Investigation Header Bar with Exception Switcher -->
        <div class="investigation-header-bar">
          <div class="investigation-selector-wrap">
            <span style="font-size: 12px; font-weight: 700; color: var(--color-charcoal);">Select Exception:</span>
            <select class="filter-select" style="min-width: 240px; font-weight: 600;" onchange="AnalystInvestigationView.selectException(this.value)">
              ${exceptions.map(e => `
                <option value="${e.id}" ${e.id === exc.id ? 'selected' : ''}>
                  ${e.id} — ${e.type} (${e.severity}) [${e.status}]
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            ${!exc.assignedAnalyst ? `
              <button class="btn btn-secondary btn-sm" style="background: #FFF3CD; color: #856404; font-weight: 700;" onclick="AnalystInvestigationView.claimOwnership('${exc.id}')">
                ${Icons.userCheck ? Icons.userCheck(13) : ''}
                <span>Take Ownership</span>
              </button>
            ` : `
              <span class="role-indicator-pill" style="font-size: 11px;">
                Assigned: ${exc.assignedAnalyst.split(' ')[0]} ${exc.assignedAnalyst.split(' ')[1] || ''}
              </span>
            `}

            ${(exc.severity === 'Critical' || exc.slaRisk === 'Critical' || exc.slaRisk === 'High') ? `
              <button class="btn btn-danger btn-sm" onclick="App.navigateTo('analyst_war_room')">
                ${Icons.warRoom ? Icons.warRoom(13) : ''}
                <span>Escalate to War Room</span>
              </button>
            ` : ''}

            <button class="btn btn-secondary btn-sm" onclick="AnalystInvestigationView.openAttachEvidenceModal('${exc.id}')" style="background: #F8FAFC; border-color: #CBD5E1; font-weight: 700;">
              ${Icons.clipboard ? Icons.clipboard(13) : '📎'}
              <span>Attach Evidence (${(exc.evidence || []).length})</span>
            </button>

            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('analyst_queue')">
              ← Back to Queue
            </button>
          </div>
        </div>

        <!-- Multi-panel Grid Top (Panel A: Summary, Panel B: Business Impact) -->
        <div class="investigation-grid-top">
          <!-- Panel A: Exception Summary -->
          <div class="investigation-panel">
            <div class="investigation-panel-title">
              <span>Panel A — Exception Summary</span>
              <span class="panel-title-badge">Triage Scope</span>
            </div>

            <div class="meta-kv-grid">
              <div class="meta-kv-item">
                <span class="meta-kv-label">Exception ID</span>
                <span class="meta-kv-value highlight-navy">${exc.id}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Exception Classification</span>
                <span class="meta-kv-value">${exc.type}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Severity Level</span>
                <span class="meta-kv-value">
                  <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(exc.severity)}">${exc.severity}</span>
                </span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Operational Status</span>
                <span class="meta-kv-value">
                  <span class="badge" style="background: #EEF2F6; color: var(--color-midnight);">${exc.status}</span>
                </span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Affected Shipment</span>
                <span class="meta-kv-value" style="color: var(--color-royal-navy); cursor: pointer;" onclick="AnalystShipmentsView.openDetailModal('${exc.shipmentId}')">
                  ${exc.shipmentId} (View Details ↗)
                </span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Detected</span>
                <span class="meta-kv-value">${this.formatDisplayTime(exc.detectionTime)}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Location</span>
                <span class="meta-kv-value">${exc.location || (shipment ? shipment.currentLocation : 'Not available')}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Root Cause</span>
                <span class="meta-kv-value" style="color: var(--color-charcoal); font-weight: 600;">${exc.rootCause}</span>
              </div>
            </div>
          </div>

          <!-- Panel B: Business Impact & SLA Breach Assessment -->
          <div class="investigation-panel">
            <div class="investigation-panel-title">
              <span>Panel B — Business & SLA Impact</span>
              <span class="panel-title-badge">Contractual</span>
            </div>

            <div class="meta-kv-grid">
              <div class="meta-kv-item">
                <span class="meta-kv-label">Original ETA</span>
                <span class="meta-kv-value">${this.formatDisplayTime(shipment ? (shipment.originalETA || shipment.estArrival) : null)}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Predicted ETA</span>
                <span class="meta-kv-value highlight-red">${this.formatDisplayTime(exc.predictedETA || (shipment ? shipment.predictedETA : null))}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Commitment</span>
                <span class="meta-kv-value">${shipment && shipment.deliveryCommitment ? this.formatDisplayTime(shipment.deliveryCommitment) : 'Standard Window'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">SLA Breach Risk</span>
                <span class="meta-kv-value">
                  <span class="badge-sla-risk ${exc.slaRisk ? exc.slaRiREDACTED() : 'none'}">
                    ${exc.slaRisk ? exc.slaRisk + ' Risk' : 'Within Tolerance'}
                  </span>
                </span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Customer Tier</span>
                <span class="meta-kv-value">${shipment && shipment.customerTier ? shipment.customerTier : 'Standard'}</span>
              </div>
              <div class="meta-kv-item">
                <span class="meta-kv-label">Cargo Value</span>
                <span class="meta-kv-value" style="font-weight: 700; color: #1E8E3E;">${shipment && shipment.cargoValue ? shipment.cargoValue : 'Not available'}</span>
              </div>
              <div class="meta-kv-item" style="grid-column: span 2;">
                <span class="meta-kv-label">Penalty Risk</span>
                <span class="meta-kv-value highlight-red" style="font-size: 14px; font-weight: 800;">
                  ${exc.estimatedBusinessImpact || (shipment && shipment.estimatedPenalty ? shipment.estimatedPenalty : 'Not available')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Multi-panel Grid Mid (Panel C: History & Milestones, Panel D: Route Corridor) -->
        <div class="investigation-grid-mid">
          <!-- Panel C: Shipment History & Operational Milestones -->
          <div class="investigation-panel">
            <div class="investigation-panel-title">
              <span>Panel C — Shipment Events & Audit Timeline</span>
              <span class="panel-title-badge">Chronological</span>
            </div>

            <div style="max-height: 280px; overflow-y: auto; padding-right: 6px;">
              <div class="timeline-stream">
                ${(exc.timeline || []).map(item => `
                  <div class="timeline-stream-item">
                    <div class="timeline-node-dot ${item.action.includes('Detected') ? 'alert' : item.action.includes('Accepted') ? 'success' : ''}"></div>
                    <div class="timeline-content-box">
                      <div class="timeline-content-header">
                        <span class="timeline-action-text">${item.action}</span>
                        <span class="timeline-timestamp">${AnalystDashboardView.formatTime(item.timestamp)}</span>
                      </div>
                      <div class="timeline-note-text">${item.note}</div>
                      <div style="font-size: 10px; color: var(--color-muted-sage); margin-top: 2px;">Actor: <strong>${item.actor}</strong></div>
                    </div>
                  </div>
                `).join('')}

                ${(!exc.timeline || exc.timeline.length === 0) ? `
                  <div style="font-size: 11px; color: var(--color-muted-sage); padding: 12px 0;">
                    No recorded timeline transitions yet.
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- In-Panel Case Collaboration & Communication Thread -->
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #E2E8F0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #18217E;">Case Communications &amp; Collaboration (${(exc.coordinationNotes || []).length})</span>
                <span style="font-size: 10px; color: #8A9995;">Analyst • Dispatcher • Carrier Thread</span>
              </div>
              <div style="max-height: 120px; overflow-y: auto; margin-bottom: 8px;">
                ${(exc.coordinationNotes || []).map(cn => `
                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; font-size: 10.5px;">
                    <div style="display: flex; justify-content: space-between; color: #18217E; font-weight: 700;">
                      <span>${cn.author}</span>
                      <span style="font-size: 9.5px; color: #8A9995;">${cn.timestamp ? cn.timestamp.slice(11, 16) : ''}</span>
                    </div>
                    <div style="color: #393A50; margin-top: 2px;">${cn.text}</div>
                  </div>
                `).join('')}
                ${(!exc.coordinationNotes || exc.coordinationNotes.length === 0) ? `
                  <div style="font-size: 10.5px; color: #8A9995; font-style: italic;">No communication notes posted yet.</div>
                ` : ''}
              </div>
              <div style="display: flex; gap: 6px;">
                <input type="text" id="panel-coord-note-input" class="form-control" style="font-size: 11px; padding: 4px 8px;" placeholder="Add internal communication or carrier instructions...">
                <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px; font-weight: 700;" onclick="AnalystInvestigationView.postCoordinationNote('${exc.id}')">
                  Post Note
                </button>
              </div>
            </div>
          </div>

          <!-- Panel D: Route Corridor & Alternate Visualization -->
          <div class="investigation-panel">
            <div class="investigation-panel-title">
              <span>Panel D — Route Corridor & Detour Topology</span>
              <span class="panel-title-badge">Corridor</span>
            </div>

            <div class="schematic-svg-wrap" style="height: 180px;">
              <svg class="schematic-svg-canvas" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
                <!-- Planned Route Line -->
                <line x1="60" y1="80" x2="440" y2="80" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
                <line x1="60" y1="80" x2="250" y2="80" stroke="#18217E" stroke-width="3"/>

                <!-- Alternate Detour Route Curve -->
                <path d="M 210,80 Q 300,20 390,80" fill="none" stroke="#D97706" stroke-width="2.5" stroke-dasharray="5 3"/>

                <!-- Origin Node -->
                <g transform="translate(60, 80)">
                  <circle cx="0" cy="0" r="10" fill="#18217E"/>
                  <text x="0" y="24" text-anchor="middle" font-size="10" font-weight="700" fill="#070724">
                    ${shipment ? shipment.origin.split(' ')[0] : 'Origin'}
                  </text>
                </g>

                <!-- Incident Deviation Node -->
                <g transform="translate(250, 80)">
                  <circle cx="0" cy="0" r="12" class="pulse-beacon-circle" fill="none" stroke="#EA341F"/>
                  <circle cx="0" cy="0" r="9" fill="#EA341F"/>
                  <text x="0" y="24" text-anchor="middle" font-size="10" font-weight="700" fill="#EA341F">
                    Incident (Hold)
                  </text>
                </g>

                <!-- Detour Waypoint Marker -->
                <g transform="translate(300, 48)">
                  <rect x="-35" y="-14" width="70" height="16" rx="3" fill="#D97706"/>
                  <text x="0" y="-3" text-anchor="middle" font-size="9" font-weight="700" fill="#FFFFFF">
                    Detour Corridor
                  </text>
                </g>

                <!-- Destination Node -->
                <g transform="translate(440, 80)">
                  <circle cx="0" cy="0" r="10" fill="#64748B"/>
                  <text x="0" y="24" text-anchor="middle" font-size="10" font-weight="700" fill="#070724">
                    ${shipment ? shipment.destination.split(' ')[0] : 'Dest'}
                  </text>
                </g>
              </svg>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 11px;">
              <div>Origin: <strong>${shipment ? shipment.origin : '--'}</strong></div>
              <div>Current Location: <strong style="color: var(--color-signal-red);">${exc.location || (shipment ? shipment.currentLocation : '--')}</strong></div>
              <div>Dest: <strong>${shipment ? shipment.destination : '--'}</strong></div>
            </div>
          </div>
        </div>

        <!-- Dedicated Temperature & Customs Operations Workspace -->
        ${(exc.type === 'Temperature Breach' || exc.type === 'Customs Hold' || exc.inspectionTask || exc.customsTask || exc.cargoCondition || exc.customsRelease) ? `
          <div class="investigation-panel" style="margin-bottom: 16px; border-left: 4px solid ${exc.type === 'Temperature Breach' ? '#EA341F' : '#18217E'}; background: #FCFDFF;">
            <div class="investigation-panel-title">
              <span>Operational Domain Control: ${exc.type === 'Temperature Breach' ? 'Cold-Chain Cryogenic Interventions' : 'Customs & Border Regulatory Clearance'}</span>
              <span class="panel-title-badge" style="background: ${exc.type === 'Temperature Breach' ? '#FEE2E2' : '#EBF3FC'}; color: ${exc.type === 'Temperature Breach' ? '#DC2626' : '#18217E'};">
                ${exc.type === 'Temperature Breach' ? 'Pharma Cold Chain Protocol' : 'Customs Broker API'}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-top: 10px;">
              <div>
                ${exc.type === 'Temperature Breach' ? `
                  <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                    <div style="flex: 1; background: #FFFFFF; border: 1px solid #FECACA; border-radius: 6px; padding: 10px;">
                      <div style="font-size: 11px; color: #8A9995;">Current Probe Reading</div>
                      <div style="font-size: 18px; font-weight: 800; color: #DC2626; margin-top: 2px;">${exc.cargoCondition?.coreTemperature || '+4.8°C'}</div>
                      <div style="font-size: 10px; color: #DC2626;">Threshold: +2.0°C to +4.0°C Exceeded</div>
                    </div>
                    <div style="flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                      <div style="font-size: 11px; color: #8A9995;">Dry Ice Reserve</div>
                      <div style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin-top: 2px;">${exc.cargoCondition?.dryIceStatus || 'Depleted to 25%'}</div>
                      <div style="font-size: 10px; color: var(--color-muted-sage);">Sublimation rate: 1.2 kg/hr</div>
                    </div>
                    <div style="flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                      <div style="font-size: 11px; color: #8A9995;">Cargo Seal Status</div>
                      <div style="font-size: 18px; font-weight: 800; color: #1E8E3E; margin-top: 2px;">${exc.cargoCondition?.packagingSeal || 'Intact'}</div>
                      <div style="font-size: 10px; color: #1E8E3E;">No Tampering Detected</div>
                    </div>
                  </div>
                ` : `
                  <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                    <div style="flex: 1; background: #FFFFFF; border: 1px solid #FEE2E2; border-radius: 6px; padding: 10px;">
                      <div style="font-size: 11px; color: #8A9995;">Customs Entry Status</div>
                      <div style="font-size: 16px; font-weight: 800; color: #DC2626; margin-top: 2px;">${exc.customsRelease?.releaseStatus || 'Red Line Inspection Hold'}</div>
                      <div style="font-size: 10px; color: #8A9995;">Entry Ref: ${exc.customsRelease?.entryNumber || 'CBP-2026-991823'}</div>
                    </div>
                    <div style="flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                      <div style="font-size: 11px; color: #8A9995;">Flagged Tariff Code</div>
                      <div style="font-size: 16px; font-weight: 800; color: var(--color-royal-navy); margin-top: 2px;">HTS-9018.99</div>
                      <div style="font-size: 10px; color: var(--color-muted-sage);">10-digit subdivision required</div>
                    </div>
                  </div>
                `}

                <!-- Operational Tasks Active Banner -->
                ${exc.inspectionTask ? `
                  <div style="background: #EAF7EE; border: 1px solid #B7EB8F; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; font-size: 11px; color: #1E8E3E;">
                    <strong>✓ Inspection Task Dispatched (${exc.inspectionTaREDACTED}):</strong> Assigned to ${exc.inspectionTaREDACTED} • Status: ${exc.inspectionTaREDACTED}.
                  </div>
                ` : ''}

                ${exc.customsTask ? `
                  <div style="background: #EBF3FC; border: 1px solid #C7DCFA; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px; font-size: 11px; color: #18217E;">
                    <strong>✓ Customs Document Task (${exc.customsTaREDACTED}):</strong> Broker: ${exc.customsTaREDACTED} • Status: ${exc.customsTaREDACTED}.
                  </div>
                ` : ''}
              </div>

              <!-- Quick Action Task Buttons -->
              <div style="display: flex; flex-direction: column; gap: 8px; justify-content: center;">
                ${exc.type === 'Temperature Breach' ? `
                  <button class="btn btn-secondary btn-sm" onclick="AnalystInvestigationView.openTriggerInspectionModal('${exc.id}')" style="font-size: 11px;">
                    🔍 Trigger Physical Inspection Task
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="AnalystInvestigationView.openRecordCargoConditionModal('${exc.id}')" style="font-size: 11px; background: #18217E;">
                    📝 Certify Cargo Condition &amp; Temp
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-sm" onclick="AnalystInvestigationView.openTriggerCustomsModal('${exc.id}')" style="font-size: 11px;">
                    📑 Trigger Broker Document Task
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="AnalystInvestigationView.openRecordCustomsReleaseModal('${exc.id}')" style="font-size: 11px; background: #1E8E3E; border-color: #1E8E3E;">
                    ✓ Record Customs Clearance &amp; Release
                  </button>
                `}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Panel E: Ranked Recovery Strategies & AI Decision Support -->
        <div class="investigation-panel">
          <div class="investigation-panel-title">
            <span>Panel E — AI Decision Intelligence &amp; Ranked Strategies</span>
            <span class="panel-title-badge" style="background: #EBF3FC; color: #1967D2;">AI Recommendation Engine</span>
          </div>

          <!-- AI Decision Support Card (US Requirement: AI-Assisted Decision Support) -->
          <div style="background: linear-gradient(135deg, #F8FAFE 0%, #EFF6FF 100%); border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 800; color: #18217E;">AI Recommendation Intelligence</span>
                  <span class="badge" style="background: #18217E; color: #FFFFFF; font-size: 10px; font-weight: 700;">
                    ${exc.aiConfidence || '96.4% Predictive Confidence'}
                  </span>
                  ${exc.aiRecommendationStatus === 'Accepted' ? `
                    <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-size: 10px; font-weight: 700;">✓ Accepted by Analyst</span>
                  ` : exc.aiRecommendationStatus === 'Overridden' ? `
                    <span class="badge badge-danger" style="font-size: 10px; font-weight: 700;">⚠ Overridden (Reason: ${exc.aiOverride?.reason || 'Analyst Discretion'})</span>
                  ` : ''}
                </div>
                <div style="font-size: 11.5px; color: #393A50; margin-top: 4px; max-width: 620px; line-height: 1.4;">
                  <strong>AI Rationale:</strong> Corridor telemetry, 89.2% recovery velocity, and active partner carrier fleet availability evaluated.
                </div>
              </div>

              <!-- Accept / Override AI Decision Controls -->
              <div style="display: flex; gap: 6px;">
                <button 
                  class="btn btn-primary btn-sm" 
                  style="background: #1E8E3E; border-color: #1E8E3E; font-size: 11px; font-weight: 700;"
                  onclick="AnalystInvestigationView.acceptAI('${exc.id}', '${recoveryOptions[0]?.strategy || 'Re-route'}')"
                  ${exc.aiRecommendationStatus === 'Accepted' ? 'disabled' : ''}
                >
                  ✓ Accept AI Recommendation
                </button>
                <button 
                  class="btn btn-secondary btn-sm" 
                  style="font-size: 11px; font-weight: 700; color: #DC2626;"
                  onclick="AnalystInvestigationView.openOverrideAIModal('${exc.id}', '${recoveryOptions[0]?.strategy || 'Re-route'}')"
                >
                  Override AI Recommendation
                </button>
              </div>
            </div>

            <!-- 4 Metric Indicators for AI Model -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #BFDBFE;">
              <div>
                <span style="font-size: 10px; color: #64748B;">Predicted Arrival:</span>
                <div style="font-size: 12px; font-weight: 700; color: #18217E;">${exc.predictedETA ? exc.predictedETA.slice(11, 16) : '--'}</div>
              </div>
              <div>
                <span style="font-size: 10px; color: #64748B;">Predicted SLA Breach Risk:</span>
                <div style="font-size: 12px; font-weight: 700; color: #DC2626;">${exc.slaRisk} Risk</div>
              </div>
              <div>
                <span style="font-size: 10px; color: #64748B;">Calculated Penalty Avoidance:</span>
                <div style="font-size: 12px; font-weight: 700; color: #1E8E3E;">${exc.estimatedBusinessImpact ? exc.estimatedBusinessImpact.split(' ')[0] : '$15,000'} Preserved</div>
              </div>
              <div>
                <span style="font-size: 10px; color: #64748B;">Recommended Strategy:</span>
                <div style="font-size: 12px; font-weight: 800; color: #18217E;">#1 ${recoveryOptions[0]?.strategy || 'Re-route'}</div>
              </div>
            </div>
          </div>

          ${linkedRecovery ? `
            <div style="background: #F8FAFE; border: 1px solid #C7DCFA; border-radius: 8px; padding: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <span class="badge" style="background: #EBF3FC; color: #1967D2; font-weight: 700;">Recovery Active</span>
                <span style="font-size: 12px; font-weight: 700; color: var(--color-royal-navy); margin-left: 6px;">${linkedRecovery.id} — ${linkedRecovery.recoveryStrategy}</span>
                <div style="font-size: 11px; color: var(--color-charcoal); margin-top: 2px;">
                  Status: <strong>${linkedRecovery.responseStatus}</strong> • Target Carrier: <strong>${linkedRecovery.requestedCarrierName || 'In-fleet'}</strong> • ETA Impact: <strong>${linkedRecovery.expectedEtaImpact}</strong>
                </div>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="AnalystInvestigationView.cancelActiveRecovery('${linkedRecovery.id}')" style="color: #EA341F; border-color: #FCA5A5; font-size: 11px;">
                  Cancel Active Tender
                </button>
                <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_recoveries')" style="font-size: 11px;">
                  View Recovery Execution →
                </button>
              </div>
            </div>
          ` : ''}

          <div class="recovery-strategies-list">
            ${recoveryOptions.map((opt, idx) => `
              <div class="recovery-strategy-card ${opt.isRecommended ? 'recommended' : ''}">
                <div class="strategy-left">
                  <div class="strategy-rank-badge">#${idx + 1}</div>
                  <div class="strategy-info">
                    <div class="strategy-name-row">
                      <span class="strategy-name">${opt.strategy}</span>
                      ${opt.isRecommended ? `<span class="strategy-pill recommended">Recommended</span>` : ''}
                      <span class="badge" style="background: #EEF2F6; font-size: 10px;">Feasibility: ${opt.feasibility}</span>
                    </div>
                    <div class="strategy-desc">${opt.rationale}</div>
                    <div class="strategy-metrics-row">
                      <span class="strategy-metric">ETA Impact: <strong>${opt.etaImpact}</strong></span>
                      <span>•</span>
                      <span class="strategy-metric">SLA Breach Risk: <strong>${opt.slaRiskMitigation}</strong></span>
                      <span>•</span>
                      <span class="strategy-metric">Estimated Cost: <strong>${opt.estimatedCost}</strong></span>
                    </div>
                  </div>
                </div>

                <div style="flex-shrink: 0; align-self: center;">
                  <button 
                    class="btn ${opt.isRecommended ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                    onclick="AnalystInvestigationView.openRecoveryForm('${opt.strategy}')"
                  >
                    ${linkedRecovery ? (linkedRecovery.recoveryStrategy === opt.strategy ? 'Revise Plan' : 'Switch Strategy') : 'Initiate Recovery'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  selectException(exceptionId) {
    this.currentExceptionId = exceptionId;
    if (window.App && App.currentView === 'analyst_investigation') {
      App.renderCurrentView();
    }
  },

  claimOwnership(exceptionId) {
    try {
      const currentUser = window.BRIDGES_AUTH.getCurrentUser();
      window.BRIDGES_STORE.takeOwnership(exceptionId, currentUser);
      UI.showToast(`Ownership taken for ${exceptionId}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // Rule-based logic ranking the 5 Use Case 4.1 strategies
  getRankedRecoveryOptions(exc, shipment) {
    if (exc.type === 'Temperature Breach') {
      return [
        {
          strategy: 'Alternate Carrier',
          isRecommended: true,
          feasibility: 'High',
          rationale: 'Reefer stator failed. SkyLink Aviation has temp-controlled aircraft ready at nearest airstrip.',
          etaImpact: '-3h 20m faster',
          slaRiskMitigation: 'Full Spoilage Prevention',
          estimatedCost: '$3,800 air charter'
        },
        {
          strategy: 'Expedite',
          isRecommended: false,
          feasibility: 'Medium',
          rationale: 'Nonstop express transit to closest regional cryo depot for dry ice replenishment.',
          etaImpact: '-1h 45m',
          slaRiskMitigation: 'Partial (Risk if ambient heat rises)',
          estimatedCost: '$1,200 express surcharge'
        },
        {
          strategy: 'Re-route',
          isRecommended: false,
          feasibility: 'Low',
          rationale: 'Detour to Lake Knot cold depot. Distance too far for current battery degradation.',
          etaImpact: '+45m',
          slaRiskMitigation: 'High risk of spoilage',
          estimatedCost: '$450 fuel'
        },
        {
          strategy: 'Split Shipment',
          isRecommended: false,
          feasibility: 'Low',
          rationale: 'Requires biopharma cold packaging dock; field split impossible on mountain corridor.',
          etaImpact: 'N/A',
          slaRiskMitigation: 'Not feasible in field',
          estimatedCost: 'N/A'
        },
        {
          strategy: 'Wait & Monitor',
          isRecommended: false,
          feasibility: 'Low',
          rationale: 'Passive monitoring without intervention. Unacceptable risk for temp-sensitive biologics.',
          etaImpact: '0m variance (holds current slip)',
          slaRiskMitigation: 'High Risk (Cryo Spoilage)',
          estimatedCost: '$0'
        }
      ];
    }

    if (exc.type === 'Route Delay') {
      return [
        {
          strategy: 'Re-route',
          isRecommended: true,
          feasibility: 'High',
          rationale: 'Highway 4 blocked by rockslide. Valley 3 arterial bypass is paved and clear.',
          etaImpact: '-45m recovery versus waiting',
          slaRiskMitigation: 'Eliminates 4-hr static queue',
          estimatedCost: '$180 additional mileage'
        },
        {
          strategy: 'Alternate Carrier',
          isRecommended: false,
          feasibility: 'Medium',
          rationale: 'Transload trailer onto Apex Freight tractor already stationed past bottleneck.',
          etaImpact: '-1h 10m',
          slaRiskMitigation: 'Moderate',
          estimatedCost: '$1,400 tractor switch'
        },
        {
          strategy: 'Expedite',
          isRecommended: false,
          feasibility: 'Medium',
          rationale: 'Assign dual-driver team upon clearing detour sector to make up schedule.',
          etaImpact: '-30m',
          slaRiskMitigation: 'Low',
          estimatedCost: '$600 driver bonus'
        },
        {
          strategy: 'Split Shipment',
          isRecommended: false,
          feasibility: 'Low',
          rationale: 'Single full truckload of heavy electronics; splitting creates double handling delay.',
          etaImpact: '+1h 30m',
          slaRiskMitigation: 'Poor',
          estimatedCost: '$1,900 split haul'
        },
        {
          strategy: 'Wait & Monitor',
          isRecommended: false,
          feasibility: 'Medium',
          rationale: 'Hold current position. Monitor DOT rockslide clearance crews on 30-min intervals.',
          etaImpact: '0m variance (holds current slip)',
          slaRiskMitigation: 'Low (Passive buffer)',
          estimatedCost: '$0'
        }
      ];
    }

    // Default ranking for customs, dwell, missed pickup
    return [
      {
        strategy: 'Re-route',
        isRecommended: true,
        feasibility: 'High',
        rationale: 'Reposition freight to automated Berth 4 to bypass broken mechanical crane.',
        etaImpact: '-2h 15m',
        slaRiskMitigation: 'Preserves vessel departure window',
        estimatedCost: '$250 terminal shift'
      },
      {
        strategy: 'Expedite',
        isRecommended: false,
        feasibility: 'High',
        rationale: 'Priority customs green-line inspection team dispatched.',
        etaImpact: '-1h 00m',
        slaRiskMitigation: 'Moderate',
        estimatedCost: '$500 inspection fee'
      },
      {
        strategy: 'Alternate Carrier',
        isRecommended: false,
        feasibility: 'Medium',
        rationale: 'Transfer container to secondary maritime drayage provider.',
        etaImpact: '-40m',
        slaRiskMitigation: 'Moderate',
        estimatedCost: '$1,100 drayage'
      },
      {
        strategy: 'Split Shipment',
        isRecommended: false,
        feasibility: 'Low',
        rationale: 'Maritime container customs seal cannot be split until port discharge.',
        etaImpact: 'N/A',
        slaRiskMitigation: 'Regulatory barrier',
        estimatedCost: 'N/A'
      },
      {
        strategy: 'Wait & Monitor',
        isRecommended: false,
        feasibility: 'Medium',
        rationale: 'Allow 45-min buffer for berth queue release before committing drayage resources.',
        etaImpact: '0m variance (holds current slip)',
        slaRiskMitigation: 'Low (Passive buffer)',
        estimatedCost: '$0'
      }
    ];
  },

  // Open the Recovery Request form modal pre-filled with the selected strategy (US-27, US-33 to US-39)
  openRecoveryForm(strategyName) {
    const exc = window.BRIDGES_STORE.getException(this.currentExceptionId);
    if (!exc) return;
    const shipment = window.BRIDGES_STORE.getShipment(exc.shipmentId);
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();
    const linkedRecovery = exc.recoveryRequestId ? window.BRIDGES_STORE.getRecoveryRequest(exc.recoveryRequestId) : null;
    const isRevising = linkedRecovery && ['Pending Carrier Response', 'In Progress', 'Accepted'].includes(linkedRecovery.responseStatus);

    const formHtml = `
      <form id="recovery-request-form" onsubmit="AnalystInvestigationView.submitRecoveryForm(event)">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Strategy & Target Info Banner -->
          <div style="padding: 10px 12px; background: #F8FAFE; border: 1px solid #C7DCFA; border-radius: 6px; font-size: 12px;">
            Linked Exception: <strong>${exc.id} (${exc.type})</strong> • Shipment: <strong>${exc.shipmentId}</strong>
            ${isRevising ? `<div style="margin-top: 4px; color: #1967D2; font-weight: 700;">Revising Active Recovery Tender (${linkedRecovery.id}) &bull; Target will be updated upon submission</div>` : ''}
          </div>

          <!-- Strategy Selector -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Recovery Strategy</label>
            <select id="rec-strategy-select" class="form-control" onchange="AnalystInvestigationView.handleStrategyChange(this.value)">
              <option value="Re-route" ${strategyName === 'Re-route' ? 'selected' : ''}>Re-route (Alternative Path / Corridor Bypass)</option>
              <option value="Alternate Carrier" ${strategyName === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier (Active Carrier Re-assignment)</option>
              <option value="Expedite" ${strategyName === 'Expedite' ? 'selected' : ''}>Expedite (Air / Express Transit)</option>
              <option value="Split Shipment" ${strategyName === 'Split Shipment' ? 'selected' : ''}>Split Shipment (Portion Cargo Allocation)</option>
              <option value="Wait & Monitor" ${strategyName === 'Wait & Monitor' || strategyName === 'Wait-and-Monitor' ? 'selected' : ''}>Wait &amp; Monitor (Telemetry Polling &amp; Standby)</option>
            </select>
          </div>

          <!-- Strategy-Specific Dynamic Section -->
          <div id="strategy-dynamic-fields">
            ${this.renderStrategyDynamicFields(strategyName, activeCarriers, shipment)}
          </div>

          <!-- Reason for Recovery -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Reason for Recovery <span style="color: var(--color-signal-red);">*</span></label>
            <input 
              type="text" 
              id="rec-reason" 
              class="form-control" 
              required 
              value="${exc.rootCause ? 'Mitigate: ' + exc.rootCause : 'Overcome operational bottleneck and preserve contractual SLA'}"
            >
          </div>

          <!-- Expected ETA Impact -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Expected ETA Impact <span style="color: var(--color-signal-red);">*</span></label>
            <input 
              type="text" 
              id="rec-eta-impact" 
              class="form-control" 
              required 
              placeholder="e.g. -45m recovery versus waiting, or Revised ETA 14:30" 
              value="${linkedRecovery ? linkedRecovery.expectedEtaImpact : '-45m operational recovery'}"
            >
          </div>

          <!-- Operational Notes -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Operational Notes for Dispatch / Carrier <span style="color: var(--color-signal-red);">*</span></label>
            <textarea 
              id="rec-notes" 
              class="form-control" 
              rows="3" 
              required
              placeholder="Enter instructions, bridge weight limits, cryo parameters, or coordination contact..."
            >${linkedRecovery ? linkedRecovery.operationalNotes : 'Driver confirmed equipment capability. Coordinated with control tower dispatch team.'}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" id="rec-submit-btn">
              ${isRevising ? 'Update &amp; Transmit Revised Plan' : 'Submit Recovery Request'}
            </button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', isRevising ? `Revise Recovery Request — ${strategyName}` : `Initiate Recovery Request — ${strategyName}`, formHtml);
  },

  cancelActiveRecovery(recoveryId) {
    if (confirm("Are you sure you wish to cancel this active recovery tender and return the exception to investigation?")) {
      try {
        window.BRIDGES_STORE.cancelRecoveryRequest(recoveryId, "Cancelled by Analyst to re-evaluate recovery strategy.");
        UI.showToast("Recovery tender cancelled. You may now initiate a fresh strategy.", "info");
        App.renderCurrentView();
      } catch (e) {
        UI.showToast(e.message, "error");
      }
    }
  },

  handleStrategyChange(newStrategy) {
    const activeCarriers = window.BRIDGES_STORE.getActiveCarriers();
    const exc = window.BRIDGES_STORE.getException(this.currentExceptionId);
    const shipment = exc ? window.BRIDGES_STORE.getShipment(exc.shipmentId) : null;
    const dynamicContainer = document.getElementById('strategy-dynamic-fields');
    if (dynamicContainer) {
      dynamicContainer.innerHTML = this.renderStrategyDynamicFields(newStrategy, activeCarriers, shipment);
    }
  },

  renderStrategyDynamicFields(strategy, activeCarriers, shipment) {
    if (strategy === 'Alternate Carrier') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Target Active Carrier <span style="color: var(--color-signal-red);">*</span></label>
          <select id="rec-carrier-id" class="form-control" required>
            <option value="">-- Select Active Carrier --</option>
            ${activeCarriers.map(c => `
              <option value="${c.id}">${c.name} (${c.carrierType} • Rating: ${c.rating}★)</option>
            `).join('')}
          </select>
          <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 3px;">
            Only Active carriers from the Administrator registry are eligible for assignment. Inactive carriers are excluded.
          </div>
        </div>
      `;
    }

    if (strategy === 'Re-route') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Proposed Alternative Route <span style="color: var(--color-signal-red);">*</span></label>
          <input 
            type="text" 
            id="rec-proposed-route" 
            class="form-control" 
            required 
            placeholder="e.g. Valley Arterial 3 Bypass to Lake Knot Hub" 
            value="Valley Arterial 3 Bypass around bottleneck sector"
          >
          <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 3px;">
            Specify corridor, arterial code, or bypass highways to route around the impediment.
          </div>
        </div>
      `;
    }

    if (strategy === 'Expedite') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Urgency & Required Delivery Timeframe <span style="color: var(--color-signal-red);">*</span></label>
          <select id="rec-expedite-urgency" class="form-control" required>
            <option value="Urgent (Next Available SkyLink Flight)">Urgent (Next Available SkyLink Flight)</option>
            <option value="Critical Cold Chain (Emergency Charter)">Critical Cold Chain (Emergency Charter)</option>
            <option value="Priority Ground Sprinter Team">Priority Ground Sprinter Team</option>
          </select>
        </div>
      `;
    }

    if (strategy === 'Split Shipment') {
      const originalCargo = shipment ? shipment.cargoType : 'Total Cargo Load (24.0T)';
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Portion 1 Allocation <span style="color: var(--color-signal-red);">*</span></label>
            <input type="text" id="rec-split-p1" class="form-control" required value="Portion 1: 60% Priority Medical Kits" placeholder="e.g. 12.0T Priority Cargo">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Portion 2 Allocation <span style="color: var(--color-signal-red);">*</span></label>
            <input type="text" id="rec-split-p2" class="form-control" required value="Portion 2: 40% Secondary Supplies" placeholder="e.g. 12.0T Standard Cargo">
          </div>
        </div>
        <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 2px;">
          Original Cargo: <strong>${originalCargo}</strong>. Portions must account for the full manifest.
        </div>
      `;
    }

    if (strategy === 'Wait & Monitor' || strategy === 'Wait-and-Monitor') {
      return `
        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Telemetry Polling Interval <span style="color: var(--color-signal-red);">*</span></label>
          <select id="rec-interval" class="form-control">
            <option value="15min">Every 15 minutes (High Alert)</option>
            <option value="30min" selected>Every 30 minutes (Standard Corridor Watch)</option>
            <option value="60min">Every 60 minutes (Low Urgency)</option>
          </select>
          <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 3px;">
            Automated rules will trigger escalation if ETA deviation increases beyond tolerance buffer.
          </div>
        </div>
      `;
    }

    return '';
  },

  submitRecoveryForm(e) {
    e.preventDefault();
    const btn = document.getElementById('rec-submit-btn');
    if (btn) btn.disabled = true; // Prevent double submission

    try {
      const strategy = document.getElementById('rec-strategy-select').value;
      const reason = document.getElementById('rec-reason').value;
      const etaImpact = document.getElementById('rec-eta-impact').value;
      const notes = document.getElementById('rec-notes').value;

      const exc = window.BRIDGES_STORE.getException(this.currentExceptionId);
      if (!exc) throw new Error("Linked exception not found.");

      const payload = {
        exceptionId: exc.id,
        shipmentId: exc.shipmentId,
        recoveryStrategy: strategy,
        reasonForRecovery: reason,
        expectedEtaImpact: etaImpact,
        operationalNotes: notes
      };

      if (strategy === 'Alternate Carrier') {
        const carrierSelect = document.getElementById('rec-carrier-id');
        if (!carrierSelect || !carrierSelect.value) throw new Error("Please select an Active carrier.");
        payload.requestedCarrierId = carrierSelect.value;
      } else if (strategy === 'Re-route') {
        const routeInput = document.getElementById('rec-proposed-route');
        if (!routeInput || !routeInput.value.trim()) throw new Error("Please provide alternative route details.");
        payload.proposedRoute = routeInput.value.trim();
      } else if (strategy === 'Expedite') {
        payload.expediteUrgency = document.getElementById('rec-expedite-urgency').value;
      } else if (strategy === 'Split Shipment') {
        payload.splitDetails = {
          portion1: document.getElementById('rec-split-p1').value,
          portion2: document.getElementById('rec-split-p2').value
        };
      } else if (strategy === 'Wait & Monitor' || strategy === 'Wait-and-Monitor') {
        payload.monitoringInterval = document.getElementById('rec-interval')?.value || '30min';
      }

      const createdReq = window.BRIDGES_STORE.createRecoveryRequest(payload);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Recovery request ${createdReq.id} submitted. Status: Pending Carrier Response.`, 'success');
      App.renderCurrentView();

    } catch (err) {
      if (btn) btn.disabled = false;
      UI.showToast(err.message, 'error');
    }
  },

  // --- CASE COLLABORATION NOTE ---
  postCoordinationNote(exceptionId) {
    const input = document.getElementById('panel-coord-note-input');
    const noteText = input ? input.value.trim() : '';
    if (!noteText) {
      UI.showToast("Please enter a note before posting.", "error");
      return;
    }

    try {
      const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
      const author = user ? `${user.name} (Analyst)` : "Sarah Lin (Analyst)";
      window.BRIDGES_STORE.addCoordinationNote(exceptionId, noteText, author);
      UI.showToast("Case communication note posted.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // --- AI DECISION SUPPORT METHODS ---
  acceptAI(exceptionId, strategy) {
    try {
      window.BRIDGES_STORE.acceptAIRecommendation(exceptionId, strategy);
      UI.showToast(`AI Recommendation "${strategy}" accepted! Pre-filling recovery tender.`, 'success');
      this.openRecoveryForm(strategy);
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openOverrideAIModal(exceptionId, defaultStrategy) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="override-ai-form" onsubmit="AnalystInvestigationView.submitOverrideAI(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #FFF5F5; border: 1px solid #FCA5A5; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #DC2626;">
            <strong>AI Recommendation Override:</strong> Human authorization requires logging a formal operational reason and audit justification.
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Select Alternate Recovery Strategy *</label>
            <select id="override-strategy-select" class="form-control" required>
              <option value="Alternate Carrier" ${defaultStrategy !== 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier (Transfer to standby partner)</option>
              <option value="Expedite" ${defaultStrategy !== 'Expedite' ? 'selected' : ''}>Expedite (Air / Priority Charter)</option>
              <option value="Re-route" ${defaultStrategy !== 'Re-route' ? 'selected' : ''}>Re-route (Alternative Corridor Bypass)</option>
              <option value="Split Shipment" ${defaultStrategy !== 'Split Shipment' ? 'selected' : ''}>Split Shipment (Manifest Allocation)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Mandatory Override Reason *</label>
            <select id="override-reason-select" class="form-control" required>
              <option value="Direct phone confirmation with carrier dispatcher reveals immediate fleet availability">Direct phone confirmation with carrier dispatcher reveals immediate fleet availability</option>
              <option value="Weather and rockfall obstruction clearing faster than satellite model forecast">Weather and rockfall obstruction clearing faster than satellite model forecast</option>
              <option value="Cryogenic temperature logger stabilized within acceptable pharmaceutical tolerance">Cryogenic temperature logger stabilized within acceptable pharmaceutical tolerance</option>
              <option value="Customer consignee agreed to deliver split consignment via local sprinter">Customer consignee agreed to deliver split consignment via local sprinter</option>
              <option value="Customs broker uploaded urgent phytosanitary green-line clearance">Customs broker uploaded urgent phytosanitary green-line clearance</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Operational Justification &amp; Notes *</label>
            <textarea id="override-justification" class="form-control" rows="3" required placeholder="Detailed clinical or route rationale...">Verified with regional dispatch team and validated by lead analyst before overriding model recommendation.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #DC2626; border-color: #DC2626;">Confirm &amp; Log Override</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Override AI Recommendation — ${exc.id}`, modalHtml);
  },

  submitOverrideAI(e, exceptionId) {
    e.preventDefault();
    const strategy = document.getElementById('override-strategy-select')?.value;
    const reason = document.getElementById('override-reason-select')?.value;
    const justification = document.getElementById('override-justification')?.value;

    try {
      window.BRIDGES_STORE.overrideAIRecommendation(exceptionId, strategy, reason, justification);
      UI.closeModal('generic-app-modal');
      UI.showToast(`AI overridden with "${strategy}". Reason logged to audit timeline.`, 'info');
      this.openRecoveryForm(strategy);
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  // --- TEMPERATURE & CUSTOMS MODALS ---
  openTriggerInspectionModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="trigger-inspection-form" onsubmit="AnalystInvestigationView.submitTriggerInspection(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
            Dispatching physical on-site probe inspection for cold-chain excursion on <strong>${exc.shipmentId}</strong>.
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Assigned Facility Inspector *</label>
            <select id="insp-assignee" class="form-control" required>
              <option value="Carlos Mendoza (Dallas Dock Supervisor)">Carlos Mendoza (Dallas Dock Supervisor)</option>
              <option value="David O'Connor (Chicago Freight Hub)">David O'Connor (Chicago Freight Hub)</option>
              <option value="Kenji Sato (Los Angeles Port Gateway)">Kenji Sato (Los Angeles Port Gateway)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Required Verification Checklist</label>
            <div style="font-size: 11px; color: #393A50; display: flex; flex-direction: column; gap: 4px;">
              <label><input type="checkbox" checked disabled> Dual thermocouple core temp check</label>
              <label><input type="checkbox" checked disabled> Dry ice weight &amp; replenishment status</label>
              <label><input type="checkbox" checked disabled> Digital data logger tamper-evident seal</label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Urgent Instructions for Inspector</label>
            <textarea id="insp-notes" class="form-control" rows="2" required>Immediate cold-chain verification required. Refill dry ice hopper to 100% capacity if below 50kg.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Dispatch Inspection Task</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Dispatch Physical Inspection — ${exc.id}`, modalHtml);
  },

  submitTriggerInspection(e, exceptionId) {
    e.preventDefault();
    const inspectorAssigned = document.getElementById('insp-assignee')?.value;
    const notes = document.getElementById('insp-notes')?.value;

    try {
      window.BRIDGES_STORE.triggerInspectionTask(exceptionId, { inspectorAssigned, notes });
      UI.closeModal('generic-app-modal');
      UI.showToast("Physical inspection task dispatched successfully.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openRecordCargoConditionModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="record-cargo-form" onsubmit="AnalystInvestigationView.submitRecordCargoCondition(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #EAF7EE; border: 1px solid #B7EB8F; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #1E8E3E;">
            <strong>Formal Cargo Condition Certification:</strong> Logs verified physical temperature readings and certifies product stability.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Certified Core Probe Temp *</label>
              <input type="text" id="cargo-core-temp" class="form-control" value="+3.4°C (Safe Range)" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Dry Ice Hopper Status *</label>
              <select id="cargo-dry-ice" class="form-control" required>
                <option value="Replenished to 100% (80kg)">Replenished to 100% (80kg)</option>
                <option value="Adequate (50kg remaining)">Adequate (50kg remaining)</option>
                <option value="Critical (< 20kg)">Critical (&lt; 20kg)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Packaging Seal Condition *</label>
              <select id="cargo-seal" class="form-control" required>
                <option value="Intact & Undamaged">Intact &amp; Undamaged</option>
                <option value="Resealed after Inspection">Resealed after Inspection</option>
                <option value="Compromised">Compromised</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Spoilage Assessment *</label>
              <select id="cargo-spoilage" class="form-control" required>
                <option value="Mitigated (Zero Spoilage)">Mitigated (Zero Spoilage)</option>
                <option value="Partial Excursion (< 1h buffer)">Partial Excursion (&lt; 1h buffer)</option>
                <option value="Total Spoilage">Total Spoilage</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Inspector / Analyst Certification Notes</label>
            <textarea id="cargo-notes" class="form-control" rows="2" required>Probe readings verified with secondary digital thermistor. Biological integrity certified intact for continuing transport.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #18217E; border-color: #18217E;">Certify Cargo Condition</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Certify Cargo Condition — ${exc.id}`, modalHtml);
  },

  submitRecordCargoCondition(e, exceptionId) {
    e.preventDefault();
    const coreTemperature = document.getElementById('cargo-core-temp')?.value;
    const dryIceStatus = document.getElementById('cargo-dry-ice')?.value;
    const packagingSeal = document.getElementById('cargo-seal')?.value;
    const spoilageRisk = document.getElementById('cargo-spoilage')?.value;
    const inspectorNotes = document.getElementById('cargo-notes')?.value;

    try {
      window.BRIDGES_STORE.recordCargoCondition(exceptionId, {
        coreTemperature,
        dryIceStatus,
        packagingSeal,
        spoilageRisk,
        inspectorNotes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Cargo condition certified and logged to permanent audit trail.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openTriggerCustomsModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="trigger-customs-form" onsubmit="AnalystInvestigationView.submitTriggerCustoms(e, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
            Issue urgent document task to customs broker for shipment <strong>${exc.shipmentId}</strong>.
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Designated Customs Broker *</label>
            <select id="cust-broker-name" class="form-control" required>
              <option value="Pacific Marine Customs Brokers (Broker Code 2704)">Pacific Marine Customs Brokers (Broker Code 2704)</option>
              <option value="Global Transit Brokerage Alliance">Global Transit Brokerage Alliance</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Required Customs Documentation</label>
            <div style="font-size: 11px; color: #393A50; display: flex; flex-direction: column; gap: 4px;">
              <label><input type="checkbox" checked disabled> 10-Digit HTSUS Tariff Classification Sheet</label>
              <label><input type="checkbox" checked disabled> Commercial Invoice &amp; Certificate of Origin</label>
              <label><input type="checkbox" checked disabled> FDA / Medical Device Electronic Import Declaration</label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Urgent Instructions to Broker</label>
            <textarea id="cust-broker-notes" class="form-control" rows="2" required>Urgent: Border inspector requires 10-digit HTSUS amendment. Please submit revised declaration DEC-8819 immediately.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Issue Broker Document Task</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Issue Customs Broker Task — ${exc.id}`, modalHtml);
  },

  submitTriggerCustoms(e, exceptionId) {
    if (e && e.preventDefault) e.preventDefault();
    const brokerName = document.getElementById('cust-broker-name')?.value;
    const notes = document.getElementById('cust-broker-notes')?.value;

    try {
      window.BRIDGES_STORE.triggerCustomsTask(exceptionId, { brokerName, notes });
      UI.closeModal('generic-app-modal');
      UI.showToast("Customs broker task dispatched via API.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  openRecordCustomsReleaseModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="record-release-form" onsubmit="AnalystInvestigationView.submitRecordCustomsRelease(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #EAF7EE; border: 1px solid #B7EB8F; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #1E8E3E;">
            <strong>Customs Release Authorization:</strong> Recording official customs release lifts the port/border hold and updates shipment to Cleared.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Official CBP / Port Entry No. *</label>
              <input type="text" id="cust-entry-no" class="form-control" value="CBP-2026-991823-REL" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Release Classification *</label>
              <select id="cust-rel-status" class="form-control" required>
                <option value="Green Line Full Electronic Release">Green Line Full Electronic Release</option>
                <option value="Conditional Release Pending Broker Audit">Conditional Release Pending Broker Audit</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Clearing Broker *</label>
              <input type="text" id="cust-clearing-broker" class="form-control" value="Pacific Marine Customs Brokers" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Duties &amp; Tariffs Paid *</label>
              <input type="text" id="cust-duty-paid" class="form-control" value="$2,450.00" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Border Inspector Sign-off Details</label>
            <textarea id="cust-rel-notes" class="form-control" rows="2" required>Electronic release confirmation code received from CBP automated commercial system. Hold resolved.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #1E8E3E; border-color: #1E8E3E; font-weight: 700;">Confirm Customs Release &amp; Clear Hold</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Record Customs Release — ${exc.id}`, modalHtml);
  },

  submitRecordCustomsRelease(e, exceptionId) {
    e.preventDefault();
    const entryNumber = document.getElementById('cust-entry-no')?.value;
    const releaseStatus = document.getElementById('cust-rel-status')?.value;
    const clearingBroker = document.getElementById('cust-clearing-broker')?.value;
    const dutyPaid = document.getElementById('cust-duty-paid')?.value;
    const customsNotes = document.getElementById('cust-rel-notes')?.value;

    try {
      window.BRIDGES_STORE.recordCustomsRelease(exceptionId, {
        entryNumber,
        releaseStatus,
        clearingBroker,
        dutyPaid,
        customsNotes
      });
      UI.closeModal('generic-app-modal');
      UI.showToast("Customs release verified! Exception status updated to Resolved.", "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  // --- ATTACH EVIDENCE MODAL ---
  openAttachEvidenceModal(exceptionId) {
    const exc = window.BRIDGES_STORE.getException(exceptionId);
    if (!exc) return;

    const modalHtml = `
      <form id="attach-evidence-form" onsubmit="AnalystInvestigationView.submitAttachEvidence(event, '${exc.id}')">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #F8FAFE; border: 1px solid #C7DCFA; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
            Attach operational audit evidence to Exception <strong>${exc.id}</strong> (Shipment: <strong>${exc.shipmentId}</strong>).
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Document / Artifact Name *</label>
            <input type="text" id="ev-file-name" class="form-control" value="Temperature_Logger_Trace_Data.pdf" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Evidence Classification *</label>
              <select id="ev-file-type" class="form-control" required>
                <option value="Datalogger Telemetry Log">Datalogger Telemetry Log</option>
                <option value="Site Inspection Report">Site Inspection Report</option>
                <option value="Customs CBP Release Form">Customs CBP Release Form</option>
                <option value="Police Incident Citation">Police Incident Citation</option>
                <option value="Proof of Delivery Exception Note">POD Exception Note</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Artifact File Size</label>
              <input type="text" id="ev-file-size" class="form-control" value="1.8 MB" readonly>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Diagnostic Description &amp; Verification Note *</label>
            <textarea id="ev-description" class="form-control" rows="2" required>Certified digital export from on-board trailer datalogger showing time-indexed temperature trace.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Attach &amp; Archive Evidence</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Attach Evidence — ${exc.id}`, modalHtml);
  },

  submitAttachEvidence(e, exceptionId) {
    e.preventDefault();
    const fileName = document.getElementById('ev-file-name')?.value;
    const fileType = document.getElementById('ev-file-type')?.value;
    const description = document.getElementById('ev-description')?.value;

    try {
      window.BRIDGES_STORE.attachExceptionEvidence(exceptionId, {
        fileName,
        fileType,
        description
      });
      UI.closeModal('generic-app-modal');
      UI.showToast(`Evidence "${fileName}" attached to ${exceptionId}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystInvestigationView = AnalystInvestigationView;

