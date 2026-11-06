/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Disruption Reporting (US-72 & US-73)
 * Dedicated incident reporting form, disruption history, operational review flagging
 */

const CarrierDisruptionsView = {
  render() {
    const store = window.BRIDGES_STORE;
    const disruptions = store.getCarrierDisruptions();
    const activeDisruptions = disruptions.filter(d => d.status === 'Active');

    return `
      <div class="carrier-disruptions-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Disruption &amp; Exception Reporting &bull; Fleet Incident Console</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Log breakdowns, highway closures, temperature breaches, and en-route delays for immediate Dispatcher and Control Tower visibility.
            </p>
          </div>
          <button class="btn btn-danger btn-sm" onclick="CarrierDisruptionsView.openReportModal()" style="font-weight: 700; background: #EA341F; border-color: #EA341F;">
            ${Icons.disruption(14)} Report New Disruption
          </button>
        </div>

        <!-- 2-Column Layout: Report Form + Disruption History -->
        <div class="carrier-dash-grid">
          <!-- Left: Recent Disruptions Log -->
          <div>
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${Icons.disruption(15)}</span>
                  <span>Disruption Incident Log (${disruptions.length})</span>
                  ${activeDisruptions.length > 0 ? `
                    <span class="carrier-badge carrier-badge-rejected" style="font-size: 10px;">${activeDisruptions.length} Active Incidents</span>
                  ` : ''}
                </div>
              </div>

              ${disruptions.length === 0 ? `
                <div class="carrier-empty-state" style="padding: 36px 16px;">
                  <div class="carrier-empty-icon">${Icons.shieldCheck(26)}</div>
                  <div class="carrier-empty-title">Zero Operational Disruptions</div>
                  <p class="carrier-empty-desc">
                    All fleet units are moving on planned corridors without reported mechanical, weather, or highway deviations.
                  </p>
                </div>
              ` : `
                <div class="table-responsive">
                  <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
                    <thead style="background: #F8FAFB;">
                      <tr>
                        <th style="padding: 10px 12px;">Incident ID</th>
                        <th>Shipment</th>
                        <th>Disruption Type</th>
                        <th>Location</th>
                        <th>Operational Impact</th>
                        <th>Immediate Action</th>
                        <th>Status</th>
                        <th style="text-align: right; padding-right: 12px;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${disruptions.map(d => `
                        <tr>
                          <td style="padding: 10px 12px;">
                            <div style="font-weight: 700; color: #8C2527;">${d.id}</div>
                            <div style="font-size: 10px; color: #8A9995;">
                              ${new Date(d.occurrenceTime || d.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td>
                            <div style="font-weight: 700; color: #18217E;">${d.shipmentId}</div>
                            ${d.recoveryRequestId ? `<div style="font-size: 10px; color: #424989;">${d.recoveryRequestId}</div>` : ''}
                          </td>
                          <td>
                            <span class="carrier-badge carrier-badge-rejected" style="font-size: 10.5px;">
                              ${d.disruptionType}
                            </span>
                          </td>
                          <td>
                            <span style="font-weight: 500; color: #070724;">${d.reportedLocation || d.location || 'En Route'}</span>
                          </td>
                          <td>
                            <span style="font-size: 11px; font-weight: 600; color: #EA341F;">
                              ${d.operationalImpact}
                            </span>
                          </td>
                          <td>
                            <div style="max-width: 180px; font-size: 11px; color: #393A50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${d.immediateActionTaken || 'Driver safely parked; notifying dispatch.'}
                            </div>
                          </td>
                          <td>
                            <span class="carrier-badge ${d.status === 'Active' ? 'carrier-badge-rejected' : 'carrier-badge-completed'}">
                              ${d.status}
                            </span>
                          </td>
                          <td style="text-align: right; padding-right: 12px;">
                            <button class="btn btn-secondary btn-sm" onclick="CarrierDisruptionsView.openDetailsModal('${d.id}')" style="padding: 3px 8px; font-size: 11px;">
                              Details
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>

          <!-- Right: Guidance & Fast Report Widget -->
          <div>
            <div class="carrier-card-section" style="background: #FFFDFB; border-color: #FED7AA;">
              <div style="font-size: 12.5px; font-weight: 800; color: #C2410C; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span>${Icons.disruption(14)}</span> Operational Reporting Protocol
              </div>
              <p style="font-size: 11.5px; color: #7C2D12; line-height: 1.45; margin: 0 0 10px 0;">
                Reporting an incident generates an immediate operational deviation record. It flags the consignment for review across Dispatcher / Transport Planner and Analyst consoles without prematurely closing open exceptions.
              </p>
              <ul style="font-size: 11.5px; color: #9A3412; margin: 0 0 14px 18px; padding: 0; line-height: 1.5;">
                <li>Ensure driver and cargo safety before submitting.</li>
                <li>Enter precise highway mile marker or GPS waypoint.</li>
                <li>Provide realistic revised ETA based on recovery capacity.</li>
              </ul>
              <button class="btn btn-danger btn-sm" onclick="CarrierDisruptionsView.openReportModal()" style="width: 100%; font-weight: 700; background: #EA341F; border-color: #EA341F;">
                Launch Disruption Form &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  openReportModal(presetShipmentId = '', presetRecoveryId = '') {
    const store = window.BRIDGES_STORE;
    const shipments = store.getCarrierShipments().filter(s => s.status !== 'Delivered');

    const disruptionTypes = [
      'Vehicle Breakdown',
      'Route Disruption / Highway Closure',
      'Unexpected Line-haul Delay',
      'Missed Checkpoint / Dwell Excess',
      'Pickup Failure at Shipper',
      'Road Closure / Construction Detour',
      'Customs / Border Inspection Hold',
      'Temperature Breach / Reefer Alarm',
      'Other Operational Issue'
    ];

    const nowIso = new Date().toISOString().slice(0, 16);

    UI.openModal('generic-app-modal', 'Report En-Route Disruption / Operational Incident', `
      <div style="padding: 6px 0;">
        <form id="carrier-disruption-form" onsubmit="event.preventDefault(); CarrierDisruptionsView.submitDisruption();">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-shipment">Affected Shipment: <span style="color: #EA341F;">*</span></label>
              <select id="dis-shipment" class="carrier-form-select" required onchange="CarrierDisruptionsView.handleShipmentChange(this.value)">
                <option value="">Select active shipment...</option>
                ${shipments.map(s => `
                  <option value="${s.id}" ${presetShipmentId === s.id ? 'selected' : ''}>
                    ${s.id} &bull; ${s.origin} &rarr; ${s.destination} (${s.status})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-recovery">Linked Recovery Request ID (Optional):</label>
              <input type="text" id="dis-recovery" class="carrier-form-input" value="${presetRecoveryId}" placeholder="e.g. REC-2010">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-type">Disruption Type: <span style="color: #EA341F;">*</span></label>
              <select id="dis-type" class="carrier-form-select" required>
                ${disruptionTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-time">Occurrence Timestamp: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="dis-time" class="carrier-form-input" value="${nowIso}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-location">Reported Location / Mile Marker: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="dis-location" class="carrier-form-input" placeholder="e.g. I-80 Mile Marker 142, Des Moines IA" required>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-impact">Operational Impact: <span style="color: #EA341F;">*</span></label>
              <select id="dis-impact" class="carrier-form-select" required>
                <option value="Minor Delay (30-60m expected slip)">Minor Delay (30-60m expected slip)</option>
                <option value="Moderate Delay (1-3 hours slip)">Moderate Delay (1-3 hours slip)</option>
                <option value="Critical Delay (SLA Breach Inevitable)">Critical Delay (SLA Breach Inevitable)</option>
                <option value="Vehicle Disabled / Mechanical Rescue Needed">Vehicle Disabled / Mechanical Rescue Needed</option>
                <option value="Cargo Integrity Compromised">Cargo Integrity Compromised</option>
              </select>
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="dis-desc">Detailed Description of Disruption: <span style="color: #EA341F;">*</span></label>
            <textarea id="dis-desc" class="carrier-form-textarea" rows="3" placeholder="Describe mechanical fault, accident conditions, or root cause..." required></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-eta">Revised Confirmed ETA (if known):</label>
              <input type="text" id="dis-eta" class="carrier-form-input" placeholder="e.g. 17:30 EST (Oct 16)">
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="dis-action">Immediate Action Taken by Driver / Fleet:</label>
              <input type="text" id="dis-action" class="carrier-form-input" placeholder="e.g. Mobile service dispatched; driver parked in safe zone.">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-danger btn-sm" style="font-weight: 700; background: #EA341F; border-color: #EA341F;">
              Submit Disruption Report &rarr;
            </button>
          </div>
        </form>
      </div>
    `);
  },

  handleShipmentChange(shipmentId) {
    if (!shipmentId) return;
    const store = window.BRIDGES_STORE;
    const rec = store.getCarrierRecoveryRequests().find(r => r.shipmentId === shipmentId);
    const recInput = document.getElementById('dis-recovery');
    if (recInput && rec) {
      recInput.value = rec.id;
    }
  },

  submitDisruption() {
    const shipmentId = document.getElementById('dis-shipment').value;
    const recoveryRequestId = document.getElementById('dis-recovery').value;
    const disruptionType = document.getElementById('dis-type').value;
    const occurrenceTime = document.getElementById('dis-time').value;
    const reportedLocation = document.getElementById('dis-location').value;
    const operationalImpact = document.getElementById('dis-impact').value;
    const description = document.getElementById('dis-desc').value;
    const revisedEta = document.getElementById('dis-eta').value;
    const immediateActionTaken = document.getElementById('dis-action').value;

    try {
      const result = window.BRIDGES_STORE.reportDisruption({
        shipmentId,
        recoveryRequestId,
        disruptionType,
        occurrenceTime,
        reportedLocation,
        operationalImpact,
        description,
        revisedEta,
        immediateActionTaken
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Disruption ${result.id} successfully reported. Shared consoles alerted.`, 'warning');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openDetailsModal(disruptionId) {
    const store = window.BRIDGES_STORE;
    const d = store.getCarrierDisruptions().find(item => item.id === disruptionId);
    if (!d) return;

    UI.openModal('generic-app-modal', `Disruption Report Details — ${d.id}`, `
      <div style="padding: 4px 0;">
        <div style="padding: 10px 14px; background: #FFF1F0; border: 1px solid #FCA5A5; border-radius: 6px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 800; font-size: 14px; color: #EA341F;">${d.disruptionType}</div>
            <span class="carrier-badge carrier-badge-rejected">${d.status}</span>
          </div>
          <div style="font-size: 11px; color: #7C2D12; margin-top: 3px;">
            Reported by <strong>${d.reportedBy || 'Marcus Vance'}</strong> &bull; ${new Date(d.reportedAt || d.occurrenceTime).toLocaleString()}
          </div>
        </div>

        <div class="carrier-field-row"><span class="carrier-field-label">Shipment ID:</span><span class="carrier-field-value">${d.shipmentId}</span></div>
        <div class="carrier-field-row"><span class="carrier-field-label">Linked Recovery:</span><span class="carrier-field-value">${d.recoveryRequestId || 'None'}</span></div>
        <div class="carrier-field-row"><span class="carrier-field-label">Reported Location:</span><span class="carrier-field-value">${d.reportedLocation || d.location}</span></div>
        <div class="carrier-field-row"><span class="carrier-field-label">Operational Impact:</span><span class="carrier-field-value" style="color: #EA341F; font-weight: 700;">${d.operationalImpact}</span></div>
        <div class="carrier-field-row"><span class="carrier-field-label">Revised ETA:</span><span class="carrier-field-value">${d.revisedEta || 'Not provided'}</span></div>

        <div style="margin-top: 12px; padding: 10px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px;">
          <strong style="font-size: 11.5px; color: #393A50;">Incident Narrative:</strong>
          <p style="font-size: 12px; color: #070724; margin: 4px 0 0 0; line-height: 1.4;">${d.description}</p>
        </div>

        <div style="margin-top: 10px; padding: 10px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px;">
          <strong style="font-size: 11.5px; color: #166534;">Mitigating Action Taken:</strong>
          <p style="font-size: 12px; color: #15803D; margin: 4px 0 0 0; line-height: 1.4;">${d.immediateActionTaken || 'Driver safely parked; notifying dispatch.'}</p>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; border-top: 1px solid #E5EBEE; padding-top: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `);
  }
};

window.CarrierDisruptionsView = CarrierDisruptionsView;
