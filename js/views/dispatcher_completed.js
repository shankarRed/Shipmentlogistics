/**
 * BRIDGES Control Tower - Completed Recoveries Archive (US-57 / Section 17)
 * Operational archive of completed recovery operations with final delivery outcomes,
 * SLA reconciliation, carrier performance tracking, and complete audit trails.
 */

const DispatcherCompletedView = {
  strategyFilter: 'All',
  searchQuery: '',

  render() {
    const allRequests = window.BRIDGES_STORE.getRecoveryRequests();
    
    // Completed requests
    const completedList = allRequests.filter(r => r.responseStatus === 'Completed' || r.responseStatus === 'Delivered');

    const filtered = completedList.filter(r => {
      if (this.strategyFilter !== 'All' && r.recoveryStrategy !== this.strategyFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const mId = r.id.toLowerCase().includes(q);
        const mShip = r.shipmentId.toLowerCase().includes(q);
        const mExc = r.exceptionId.toLowerCase().includes(q);
        const mCarrier = (r.requestedCarrierName || '').toLowerCase().includes(q);
        if (!mId && !mShip && !mExc && !mCarrier) return false;
      }
      return true;
    });

    return `
      <div class="analyst-page-container animate-fade-in">
        <!-- HEADER -->
        <div class="page-action-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 class="page-heading">Completed Recoveries Archive</h2>
              <span class="badge badge-success">${filtered.length} Completed</span>
            </div>
            <p class="page-subheading">
              Permanent operational archive of resolved deviations, confirmed carrier handovers, and final delivery confirmations.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('dispatcher_dashboard')">
            Back to Dashboard
          </button>
        </div>

        <!-- SEARCH & FILTER BAR -->
        <div class="panel" style="margin-bottom: 16px; padding: 12px 14px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input type="text" 
                     class="search-input" 
                     style="width: 100%; padding: 6px 10px 6px 30px; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px;"
                     placeholder="Search request ID, shipment, carrier..." 
                     value="${this.searchQuery}"
                     oninput="DispatcherCompletedView.handleSearch(this.value)">
              <span style="position: absolute; left: 9px; top: 7px; color: #94A3B8;">${Icons.search(13)}</span>
            </div>

            <select class="planning-select" style="width: auto; padding: 5px 8px; font-size: 11.5px;" onchange="DispatcherCompletedView.setStrategyFilter(this.value)">
              <option value="All" ${this.strategyFilter === 'All' ? 'selected' : ''}>All Recovery Strategies</option>
              <option value="Re-route" ${this.strategyFilter === 'Re-route' ? 'selected' : ''}>Re-route</option>
              <option value="Alternate Carrier" ${this.strategyFilter === 'Alternate Carrier' ? 'selected' : ''}>Alternate Carrier</option>
              <option value="Expedite" ${this.strategyFilter === 'Expedite' ? 'selected' : ''}>Expedite</option>
              <option value="Split Shipment" ${this.strategyFilter === 'Split Shipment' ? 'selected' : ''}>Split Shipment</option>
            </select>
          </div>
        </div>

        <!-- TABLE OF COMPLETED RECOVERIES -->
        <div class="panel" style="padding: 0; overflow: hidden;">
          ${filtered.length === 0 ? `
            <div class="analyst-empty-state">
              <div class="empty-state-icon-wrap">${Icons.check(24)}</div>
              <div class="empty-state-title">No Completed Recoveries Found</div>
              <div class="empty-state-sub">Completed recovery records will be archived here once delivery confirmation is satisfied.</div>
            </div>
          ` : `
            <div class="table-container" style="box-shadow: none; border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Recovery ID</th>
                    <th>Shipment / Exception</th>
                    <th>Strategy Used</th>
                    <th>Assigned Carrier</th>
                    <th>Assigned Vehicle / Driver</th>
                    <th>Final Confirmed ETA</th>
                    <th>Delivery Outcome</th>
                    <th>SLA Outcome</th>
                    <th>Completion Time</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(rec => {
                    const shipment = window.BRIDGES_STORE.getShipment(rec.shipmentId);
                    const isDelivered = shipment && shipment.status === 'Delivered';

                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${rec.id}</div>
                          <div style="font-size: 10px; color: var(--color-muted-sage);">${new Date(rec.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <div style="font-weight: 700; color: var(--color-royal-navy); font-size: 11.5px;">${rec.shipmentId}</div>
                          <div style="font-size: 10.5px; color: var(--color-charcoal);">${rec.exceptionId}</div>
                        </td>
                        <td>
                          <span class="badge badge-secondary" style="font-weight: 700;">
                            ${rec.recoveryStrategy}
                          </span>
                        </td>
                        <td>
                          <div style="font-size: 11.5px; font-weight: 600; color: var(--color-midnight);">${rec.requestedCarrierName || 'Bridges Global'}</div>
                        </td>
                        <td>
                          <div style="font-size: 11.5px; font-weight: 600; color: var(--color-midnight);">${rec.assignedVehicleId || 'FR-33'}</div>
                          <div style="font-size: 10px; color: var(--color-charcoal);">${rec.assignedDriverName || 'Driver Handover'}</div>
                        </td>
                        <td>
                          <div style="font-weight: 700; font-size: 11.5px; color: var(--color-midnight);">${rec.revisedEta}</div>
                          <div style="font-size: 10px; color: #1E8E3E;">${rec.expectedEtaImpact || 'On Schedule'}</div>
                        </td>
                        <td>
                          <span class="badge badge-success">
                            ${isDelivered ? 'Delivered Confirmed' : 'Recovery Fulfilled'}
                          </span>
                        </td>
                        <td>
                          <span class="badge badge-success">
                            SLA Satisfied
                          </span>
                        </td>
                        <td>
                          <div style="font-size: 11px; color: var(--color-charcoal);">
                            ${new Date(rec.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-secondary btn-sm" onclick="DispatcherCompletedView.openDetailModal('${rec.id}')" style="padding: 4px 8px;">
                            Inspect Dossier
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
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val;
    App.renderCurrentView();
  },

  setStrategyFilter(val) {
    this.strategyFilter = val;
    App.renderCurrentView();
  },

  openDetailModal(requestId) {
    const req = window.BRIDGES_STORE.getRecoveryRequest(requestId);
    if (!req) return;

    const modalHtml = `
      <div style="padding: 10px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--color-light-blue-grey);">
          <div>
            <div style="font-weight: 800; font-size: 15px; color: var(--color-midnight);">${req.id}</div>
            <div style="font-size: 11.5px; color: var(--color-muted-sage);">
              Strategy: <strong>${req.recoveryStrategy}</strong> · Exception: <strong>${req.exceptionId}</strong> (${req.shipmentId})
            </div>
          </div>
          <span class="badge badge-success">Completed & Confirmed</span>
        </div>

        <div class="meta-kv-grid" style="margin-bottom: 14px;">
          <div class="meta-kv-item">
            <span class="meta-kv-label">Executing Carrier</span>
            <span class="meta-kv-value">${req.requestedCarrierName || 'N/A'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Assigned Vehicle</span>
            <span class="meta-kv-value">${req.assignedVehicleId || 'N/A'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Assigned Driver</span>
            <span class="meta-kv-value">${req.assignedDriverName || 'N/A'}</span>
          </div>
          <div class="meta-kv-item">
            <span class="meta-kv-label">Final Arrival ETA</span>
            <span class="meta-kv-value" style="color: #1E8E3E; font-weight: 800;">${req.revisedEta}</span>
          </div>
        </div>

        <div style="background: #F8FAFB; border: 1px solid var(--color-light-blue-grey); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px;">
          <div style="font-weight: 700; color: var(--color-midnight); margin-bottom: 2px;">Handover & Resolution Summary</div>
          <div style="color: var(--color-charcoal);">${req.operationalNotes}</div>
        </div>

        <div>
          <div style="font-size: 11.5px; font-weight: 700; color: var(--color-midnight); margin-bottom: 6px;">Complete Recovery Execution Timeline</div>
          <div class="timeline-stream">
            ${(req.timeline || []).map(t => `
              <div class="timeline-node">
                <div class="timeline-node-dot" style="background: #1E8E3E; border-color: #1E8E3E;"></div>
                <div class="timeline-node-content">
                  <div class="timeline-node-header">
                    <span class="timeline-node-author">${t.actor}</span>
                    <span class="timeline-node-time">${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div class="timeline-node-text">${t.note || t.action}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--color-light-blue-grey);">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Completed Recovery Archive — ${req.id}`, modalHtml);
  }
};

window.DispatcherCompletedView = DispatcherCompletedView;
