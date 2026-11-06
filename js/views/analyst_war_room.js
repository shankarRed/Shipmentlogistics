/**
 * BRIDGES Control Tower - Analyst War Room View (Section 11)
 * Focused incident coordination console for critical, SLA-breached, or unresolved exceptions.
 * Real-time operational command console with live coordination notes stream,
 * recovery monitoring, and carrier escalation oversight.
 */

const AnalystWarRoomView = {
  selectedIncidentId: null,

  render() {
    const allExceptions = window.BRIDGES_STORE.getExceptions();
    const recoveries = window.BRIDGES_STORE.getRecoveryRequests();

    // Filter to critical, SLA breached, or failed/rejected recovery cases
    const criticalIncidents = allExceptions.filter(e => {
      if (['Resolved', 'Closed'].includes(e.status)) return false;
      const isCritical = e.severity === 'Critical';
      const isSlaCritical = ['Critical', 'High'].includes(e.slaRisk);
      const linkedRec = e.recoveryRequestId ? recoveries.find(r => r.id === e.recoveryRequestId) : null;
      const isRecoveryFailed = linkedRec && ['Rejected', 'Failed'].includes(linkedRec.responseStatus);
      return isCritical || isSlaCritical || isRecoveryFailed;
    });

    if (criticalIncidents.length > 0 && !this.selectedIncidentId) {
      this.selectedIncidentId = criticalIncidents[0].id;
    } else if (criticalIncidents.length > 0 && !criticalIncidents.find(i => i.id === this.selectedIncidentId)) {
      this.selectedIncidentId = criticalIncidents[0].id;
    }

    const activeIncident = criticalIncidents.find(i => i.id === this.selectedIncidentId) || null;
    const shipment = activeIncident ? window.BRIDGES_STORE.getShipment(activeIncident.shipmentId) : null;
    const linkedRecovery = activeIncident && activeIncident.recoveryRequestId 
      ? recoveries.find(r => r.id === activeIncident.recoveryRequestId) 
      : null;

    return `
      <div class="view-container animate-fade-in">
        <!-- War Room Crisis Banner -->
        <div class="war-room-banner mb-3">
          <div class="war-room-banner-left">
            <div class="war-room-pulse-icon">
              ${Icons.warRoom ? Icons.warRoom(24) : Icons.alertTriangle(24)}
            </div>
            <div>
              <div class="war-room-banner-title">INCIDENT WAR ROOM — CRITICAL EXCEPTION COMMAND</div>
              <div class="war-room-banner-subtitle">
                High-impact deviation containment, contract SLA penalty mitigation, and expedited recovery execution.
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #A0ABC0;">Active Emergencies</div>
              <div style="font-size: 20px; font-weight: 800; color: #FFFFFF;">${criticalIncidents.length} Critical Incidents</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3);" onclick="App.navigateTo('analyst_dashboard')">
              ← Exit War Room
            </button>
          </div>
        </div>

        ${criticalIncidents.length === 0 ? `
          <div class="card" style="padding: 40px; text-align: center;">
            <div class="empty-state-icon-wrap" style="color: #1E8E3E; margin: 0 auto 14px;">
              ${Icons.shieldCheck ? Icons.shieldCheck(30) : Icons.check(30)}
            </div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--color-midnight); margin: 0 0 6px 0;">
              All Critical Incidents Stabilized
            </h3>
            <p style="font-size: 12px; color: var(--color-muted-sage); max-width: 440px; margin: 0 auto 16px;">
              There are currently no critical severity alerts, imminent SLA breaches, or rejected carrier recoveries requiring active War Room emergency coordination.
            </p>
            <div>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('analyst_dashboard')">
                Return to Operational Dashboard
              </button>
            </div>
          </div>
        ` : `
          <!-- War Room Split Layout: Left Column (Critical Incident Queue) + Right Column (Command Center Console) -->
          <div class="war-room-split">
            <!-- Left: Critical Incidents List -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--color-midnight); text-transform: uppercase; letter-spacing: 0.5px;">
                Active Critical Queue (${criticalIncidents.length})
              </div>

              <div class="war-room-incident-list">
                ${criticalIncidents.map(inc => {
                  const incShipment = window.BRIDGES_STORE.getShipment(inc.shipmentId);
                  const isSelected = inc.id === this.selectedIncidentId;
                  return `
                    <div 
                      class="war-room-incident-card ${isSelected ? 'active' : ''}" 
                      onclick="AnalystWarRoomView.selectIncident('${inc.id}')"
                    >
                      <div class="incident-card-top">
                        <span class="incident-id-tag">${inc.id}</span>
                        <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(inc.severity)}">${inc.severity}</span>
                      </div>
                      <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 2px;">
                        ${inc.type}
                      </div>
                      <div style="font-size: 11px; color: var(--color-charcoal); line-height: 1.35; margin-top: 2px;">
                        ${inc.rootCause}
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px;">
                        <span style="color: var(--color-muted-sage);">Shipment: <strong>${inc.shipmentId}</strong></span>
                        <span style="color: var(--color-signal-red); font-weight: 700;">
                          ${inc.slaRisk === 'Critical' ? '⚡ Breaching' : '⚠ High Risk'}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Right: War Room Active Incident Command Console -->
            ${activeIncident ? `
              <div class="war-room-console">
                <!-- Header with Action Controls -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--color-light-blue-grey); flex-wrap: wrap; gap: 10px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="badge ${AnalystDashboardView.getSeverityBadgeClass(activeIncident.severity)}">${activeIncident.severity} Alert</span>
                      <h3 style="font-size: 16px; font-weight: 800; color: var(--color-midnight); margin: 0;">
                        ${activeIncident.id} — ${activeIncident.type}
                      </h3>
                      <span class="badge" style="background: #EEF2F6; color: var(--color-midnight);">${activeIncident.status}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--color-charcoal); margin-top: 4px;">
                      Bottleneck Location: <strong>${activeIncident.location || 'In Transit'}</strong> • Detected: <strong>${activeIncident.detectionTime ? activeIncident.detectionTime.slice(0, 10) + ' ' + AnalystDashboardView.formatTime(activeIncident.detectionTime) : '--'}</strong>
                    </div>
                  </div>

                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="AnalystDashboardView.openInvestigation('${activeIncident.id}')">
                      ${Icons.investigate ? Icons.investigate(13) : ''}
                      <span>Open in Investigation Workspace</span>
                    </button>
                    ${!activeIncident.assignedAnalyst ? `
                      <button class="btn btn-primary btn-sm" onclick="AnalystWarRoomView.claimOwnership('${activeIncident.id}')">
                        Take Ownership
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- 4 Operational Metrics Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                  <div style="background: #FFF8F8; border: 1px solid #F9BCB5; border-radius: 6px; padding: 10px;">
                    <div style="font-size: 11px; color: var(--color-deep-red); font-weight: 600;">Financial Penalty at Risk</div>
                    <div style="font-size: 15px; font-weight: 800; color: var(--color-signal-red); margin-top: 2px;">
                      ${activeIncident.estimatedBusinessImpact || '$45,000'}
                    </div>
                    <div style="font-size: 10px; color: var(--color-muted-sage);">Contractual SLA clause</div>
                  </div>

                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                    <div style="font-size: 11px; color: var(--color-charcoal); font-weight: 600;">Affected Shipment & Cargo</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 2px;">
                      ${activeIncident.shipmentId}
                    </div>
                    <div style="font-size: 10px; color: var(--color-muted-sage);">${shipment ? shipment.cargoType : 'High Priority'}</div>
                  </div>

                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                    <div style="font-size: 11px; color: var(--color-charcoal); font-weight: 600;">SLA Commitment Target</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-top: 2px;">
                      ${shipment && shipment.deliveryCommitment ? shipment.deliveryCommitment : '--'}
                    </div>
                    <div style="font-size: 10px; color: var(--color-signal-red); font-weight: 600;">
                      Pred: ${activeIncident.predictedETA ? AnalystDashboardView.formatTime(activeIncident.predictedETA) : '--'}
                    </div>
                  </div>

                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                    <div style="font-size: 11px; color: var(--color-charcoal); font-weight: 600;">Assigned Analyst</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--color-royal-navy); margin-top: 2px;">
                      ${activeIncident.assignedAnalyst ? activeIncident.assignedAnalyst.split(' ')[0] + ' ' + (activeIncident.assignedAnalyst.split(' ')[1] || '') : 'Unassigned'}
                    </div>
                    <div style="font-size: 10px; color: var(--color-muted-sage);">Control Tower Lead</div>
                  </div>
                </div>

                <!-- Linked Recovery Status Card -->
                <div style="background: #F8FAFE; border: 1px solid #C7DCFA; border-radius: 8px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 12px; font-weight: 700; color: var(--color-royal-navy);">
                      Linked Recovery Strategy Status
                    </div>
                    ${linkedRecovery ? `
                      <span class="badge" style="background: #EBF3FC; color: #1967D2; font-weight: 700;">
                        ${linkedRecovery.responseStatus}
                      </span>
                    ` : `
                      <span class="badge" style="background: #FFF3CD; color: #856404; font-weight: 700;">
                        No Active Recovery
                      </span>
                    `}
                  </div>

                  ${linkedRecovery ? `
                    <div style="margin-top: 6px; font-size: 12px; color: var(--color-midnight);">
                      Strategy: <strong>${linkedRecovery.recoveryStrategy}</strong> • Requested Carrier: <strong>${linkedRecovery.requestedCarrierName || 'In-Fleet'}</strong>
                      ${linkedRecovery.proposedRoute ? ` • Route: <em>${linkedRecovery.proposedRoute}</em>` : ''}
                      ${linkedRecovery.assignedVehicleId ? ` • Vehicle: <strong>${linkedRecovery.assignedVehicleId}</strong> (${linkedRecovery.assignedDriverName || 'Driver Assigned'})` : ''}
                    </div>
                    <div style="font-size: 11px; color: var(--color-muted-sage); margin-top: 3px;">
                      Expected ETA Impact: <strong>${linkedRecovery.expectedEtaImpact}</strong> • Notes: ${linkedRecovery.operationalNotes}
                    </div>
                    <div style="margin-top: 8px;">
                      <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('analyst_recoveries')">
                        Manage Recovery Execution & Carrier Actions →
                      </button>
                    </div>
                  ` : `
                    <div style="margin-top: 6px; font-size: 12px; color: var(--color-charcoal);">
                      Immediate operational recovery strategy has not been initiated for this incident.
                    </div>
                    <div style="margin-top: 8px;">
                      <button class="btn btn-primary btn-sm" onclick="AnalystInvestigationView.openRecoveryForm('Re-route')">
                        Initiate Emergency Recovery Request →
                      </button>
                    </div>
                  `}
                </div>

                <!-- Incident Live Coordination Notes Stream + Composer -->
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: var(--color-midnight); margin-bottom: 8px;">
                    Incident Command Notes & Coordination Log
                  </div>

                  <!-- Composer Form -->
                  <div class="coordination-note-composer mb-3">
                    <textarea 
                      id="war-room-note-input" 
                      placeholder="Add an operational coordination note (e.g. 'Spoke with carrier dispatch - replacement reefer unit departing Lake Knot Hub...')..."
                    ></textarea>
                    <div style="display: flex; justify-content: flex-end;">
                      <button class="btn btn-primary btn-sm" onclick="AnalystWarRoomView.addNote()">
                        Log Coordination Note
                      </button>
                    </div>
                  </div>

                  <!-- Notes History Feed -->
                  <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
                    ${(activeIncident.coordinationNotes || []).map(note => `
                      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <strong style="color: var(--color-royal-navy);">${note.author || 'Analyst'}</strong>
                          <span style="font-size: 11px; color: var(--color-muted-sage);">${AnalystDashboardView.formatTime(note.timestamp)} (${note.timestamp.slice(0, 10)})</span>
                        </div>
                        <div style="color: var(--color-midnight); line-height: 1.4;">${note.note}</div>
                      </div>
                    `).join('')}

                    ${(!activeIncident.coordinationNotes || activeIncident.coordinationNotes.length === 0) ? `
                      <div style="padding: 14px; text-align: center; color: var(--color-muted-sage); font-size: 12px; background: #F8FAFC; border-radius: 6px;">
                        No coordination notes recorded yet. Log the first note above.
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        `}
      </div>
    `;
  },

  selectIncident(incidentId) {
    this.selectedIncidentId = incidentId;
    if (window.App && App.currentView === 'analyst_war_room') {
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

  addNote() {
    const input = document.getElementById('war-room-note-input');
    if (!input || !input.value.trim()) {
      UI.showToast('Please type a coordination note before submitting.', 'error');
      return;
    }

    try {
      const currentUser = window.BRIDGES_AUTH.getCurrentUser();
      const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Lead Analyst)";
      window.BRIDGES_STORE.addCoordinationNote(this.selectedIncidentId, input.value.trim(), author);
      input.value = '';
      UI.showToast('Operational coordination note logged to incident record.', 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalystWarRoomView = AnalystWarRoomView;
