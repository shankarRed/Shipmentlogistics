/**
 * BRIDGES Control Tower — Carrier Operations User
 * View: Delivery Confirmation & Proof of Delivery (POD) (US-78)
 * Final delivery sign-off, receiving reference, attachment metadata simulation, fleet release
 */

const CarrierDeliveryView = {
  selectedShipmentId: null,

  render() {
    const store = window.BRIDGES_STORE;
    const shipments = store.getCarrierShipments();
    
    // Eligible for delivery confirmation: all active consignments needing POD sign-off
    const eligibleShipments = shipments.filter(s => 
      ['Arrived at Destination', 'In Transit', 'Out for Delivery', 'Delayed', 'On Route', 'Loading', 'Assigned', 'In-Transit'].includes(s.status) && s.status !== 'Delivered'
    );

    // Recent delivered shipments
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered' || s.status === 'Partially Delivered');

    // Split shipment recovery requests
    const splitReqs = store.getCarrierRecoveryRequests().filter(r => r.recoveryStrategy === 'Split Shipment' && r.splitDetails);

    return `
      <div class="carrier-delivery-container animate-fade-in" style="padding: 16px 20px;">
        <!-- Header Banner -->
        <div style="background: white; border: 1px solid #E5EBEE; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(7,7,36,0.03);">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Delivery Confirmation &bull; Proof of Delivery (POD) Console</h2>
            <p style="font-size: 12px; color: #393A50; margin: 0;">
              Finalize deliveries, record receiving dock sign-offs, upload POD receipt metadata, and release fleet resources.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="CarrierDeliveryView.openDirectConfirmModal()" style="font-weight: 700; background: #059669; border-color: #059669;">
            ${Icons.delivery(14)} Quick POD Entry
          </button>
        </div>

        <!-- 2 Column Layout: Eligible Pending Deliveries vs Completed Archive -->
        <div class="carrier-dash-grid">
          <!-- Left Column: Pending Delivery Confirmations -->
          <div>
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${Icons.delivery(15)}</span>
                  <span>Shipments Awaiting Final POD Confirmation</span>
                  <span class="carrier-badge carrier-badge-pending" style="font-size: 10px;">${eligibleShipments.length} Ready</span>
                </div>
              </div>

              ${eligibleShipments.length === 0 ? `
                <div class="carrier-empty-state" style="padding: 36px 16px;">
                  <div class="carrier-empty-icon">${Icons.shieldCheck(26)}</div>
                  <div class="carrier-empty-title">All Consignments Accounted For</div>
                  <p class="carrier-empty-desc">
                    No active shipments currently staged at destination docks requiring POD sign-off.
                  </p>
                </div>
              ` : `
                <div class="table-responsive">
                  <table class="table table-hover" style="font-size: 12px; margin-bottom: 0;">
                    <thead style="background: #F8FAFB;">
                      <tr>
                        <th style="padding: 10px 12px;">Shipment ID</th>
                        <th>Corridor</th>
                        <th>Fleet Unit</th>
                        <th>Dock Arrival</th>
                        <th>Status</th>
                        <th style="text-align: right; padding-right: 12px;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${eligibleShipments.map(s => `
                        <tr>
                          <td style="padding: 10px 12px;">
                            <div style="font-weight: 700; color: #18217E;">${s.id}</div>
                            <div style="font-size: 10px; color: #8A9995;">${s.cargoType || 'Freight'}</div>
                          </td>
                          <td>
                            <div style="font-weight: 600; color: #070724;">${s.origin} &rarr; ${s.destination}</div>
                          </td>
                          <td>
                            <div style="font-size: 11.5px; color: #070724; font-weight: 600;">${s.assignedVehicle || 'Freightliner (BG-01)'}</div>
                            <div style="font-size: 10.5px; color: #424989;">${s.assignedDriver || 'Ethan Vance'}</div>
                          </td>
                          <td>
                            <div style="font-weight: 700; color: #070724;">${s.carrierConfirmedEta || s.currentEta || '14:30 EST'}</div>
                            <div style="font-size: 10px; color: #059669; font-weight: 600;">At Receiving Dock</div>
                          </td>
                          <td>
                            <span class="carrier-badge carrier-badge-accepted">
                              ${s.status}
                            </span>
                          </td>
                          <td style="text-align: right; padding-right: 12px;">
                            <button class="btn btn-primary btn-sm" onclick="CarrierDeliveryView.openDeliveryModal('${s.id}')" style="padding: 3px 9px; font-size: 11px; font-weight: 700; background: #059669; border-color: #059669;">
                              Confirm POD &rarr;
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}

              <!-- Split Shipment Portions Awaiting POD Section -->
              ${splitReqs.some(r => Object.values(r.splitDetails || {}).some(p => p.status !== 'Delivered')) ? `
                <div style="margin-top: 16px; border-top: 1px solid #E5EBEE; padding-top: 14px;">
                  <div style="font-size: 11px; font-weight: 700; color: #424989; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>✂️</span>
                    <span>Split Consignment Portions Awaiting Delivery Confirmation</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${splitReqs.flatMap(r => 
                      Object.entries(r.splitDetails || {}).map(([pKey, p]) => {
                        const isDelivered = p.status === 'Delivered';
                        return `
                          <div style="padding: 10px 12px; background: #FAF9FF; border: 1px solid #DDD6FE; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <div>
                              <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="badge" style="background: #EDE9FE; color: #424989; font-weight: 700; font-size: 10px;">${r.id} &bull; ${pKey === 'portion1' ? 'P1' : 'P2'}</span>
                                <strong style="font-size: 12px; color: #070724;">${p.cargo || 'Cargo Portion'}</strong>
                              </div>
                              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                                Dest: <strong>${p.destination}</strong> &bull; Vehicle: <strong>${p.assignedVehicleName || 'Assigned Unit'}</strong> &bull; Driver: <strong>${p.assignedDriverName || 'Driver'}</strong>
                              </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span class="carrier-badge ${isDelivered ? 'carrier-badge-completed' : 'carrier-badge-in-progress'}" style="font-size: 10px;">
                                ${p.status || 'In Transit'}
                              </span>
                              ${!isDelivered ? `
                                <button class="btn btn-primary btn-sm" onclick="CarrierExecutionView.openConfirmSplitPortionDeliveryModal('${r.id}', '${pKey}')" style="font-size: 11px; font-weight: 700; background: #059669; border-color: #059669;">
                                  Confirm POD &rarr;
                                </button>
                              ` : `
                                <span style="font-size: 11px; color: #059669; font-weight: 700;">✓ Delivered</span>
                              `}
                            </div>
                          </div>
                        `;
                      })
                    ).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Column: Recent Verified Deliveries (Archive) -->
          <div>
            <div class="carrier-card-section">
              <div class="carrier-section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${Icons.shieldCheck(15)}</span>
                  <span>Recent Verified Deliveries</span>
                  <span class="carrier-badge carrier-badge-completed" style="font-size: 10px;">${deliveredShipments.length} Verified</span>
                </div>
              </div>

              ${deliveredShipments.length === 0 ? `
                <div style="text-align: center; padding: 24px 12px; color: #8A9995; font-size: 12px;">
                  No archived delivery confirmations on record yet.
                </div>
              ` : `
                <div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                  ${deliveredShipments.map(s => {
                    const pod = s.deliveryConfirmation || {};
                    return `
                      <div style="padding: 10px 12px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                          <div>
                            <span style="font-weight: 700; color: #18217E; font-size: 12.5px;">${s.id}</span>
                            <span style="color: #8A9995; font-size: 11px;"> &bull; ${s.destination}</span>
                          </div>
                          <span class="carrier-badge carrier-badge-completed" style="font-size: 10px;">
                            ${pod.outcome || 'Delivered'}
                          </span>
                        </div>
                        <div style="font-size: 11.5px; color: #393A50; line-height: 1.4;">
                          Received by: <strong>${pod.recipientName || 'Receiving Supervisor'}</strong>
                          <span style="color: #8A9995;"> (${pod.recipientSignatureRef || 'Verified'})</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #E5EBEE; font-size: 10.5px; color: #8A9995;">
                          <span>POD: <strong style="color: #18217E;">${pod.podFileName || 'Signed_Delivery_Receipt.pdf'}</strong></span>
                          <span>${new Date(pod.confirmedAt || s.deliveredDate || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  openDirectConfirmModal() {
    const store = window.BRIDGES_STORE;
    const eligible = store.getCarrierShipments().filter(s => s.status !== 'Delivered');
    if (eligible.length > 0) {
      // Prioritize active recovery shipment BRG-2847 if present
      const target = eligible.find(s => s.id === 'BRG-2847') || eligible[0];
      this.openDeliveryModal(target.id);
    } else {
      UI.showToast("No active shipments available for delivery confirmation.", 'info');
    }
  },

  openDeliveryModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    if (!s) return;

    // Check if recovery request exists
    const rec = store.getCarrierRecoveryRequests().find(r => r.shipmentId === shipmentId && ['Accepted', 'In Progress'].includes(r.responseStatus));
    const nowIso = new Date().toISOString().slice(0, 16);

    const allActive = store.getCarrierShipments().filter(x => x.status !== 'Delivered');

    UI.openModal('generic-app-modal', `Proof of Delivery Confirmation — ${s.id}`, `
      <div style="padding: 6px 0;">
        <div style="padding: 10px 14px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; margin-bottom: 14px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-weight: 700; color: #166534; font-size: 13px;">Receiving Sign-Off &amp; Exception Resolution</div>
            ${allActive.length > 1 ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <label style="font-size: 11px; font-weight: 700; color: #166534;">Target Shipment:</label>
                <select class="carrier-form-select" style="padding: 2px 8px; font-size: 11px; font-weight: 700; width: auto;" onchange="CarrierDeliveryView.openDeliveryModal(this.value)">
                  ${allActive.map(item => `
                    <option value="${item.id}" ${item.id === s.id ? 'selected' : ''}>
                      ${item.id} (${item.status} &bull; ${item.destination})
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}
          </div>
          <div style="color: #15803D; line-height: 1.4;">
            Shipment: <strong>${s.id}</strong> &bull; Destination: <strong>${s.destination}</strong> &bull; Assigned Tractor: <strong>${s.assignedVehicle || 'Freightliner (BG-01)'}</strong>
            &bull; Driver: <strong>${s.assignedDriver || 'Ethan Vance'}</strong>
          </div>
        </div>

        <form id="carrier-delivery-form" onsubmit="event.preventDefault(); CarrierDeliveryView.submitDelivery('${s.id}', '${rec ? rec.id : ''}');">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="del-outcome">Delivery Outcome: <span style="color: #EA341F;">*</span></label>
              <select id="del-outcome" class="carrier-form-select" required onchange="CarrierDeliveryView.handleOutcomeChange(this.value)">
                <option value="Successful Delivery">Successful Delivery (100% Complete)</option>
                <option value="Partial Delivery">Partial Delivery (Piece shortage / discrepancy)</option>
                <option value="Unsuccessful / Delivery Failed">Unsuccessful / Delivery Failed (Refused / Damaged)</option>
              </select>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="del-time">Actual Delivery Date &amp; Time: <span style="color: #EA341F;">*</span></label>
              <input type="datetime-local" id="del-time" class="carrier-form-input" value="${nowIso}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="carrier-form-group">
              <label class="carrier-form-label" for="del-recipient">Recipient Signatory Name: <span style="color: #EA341F;">*</span></label>
              <input type="text" id="del-recipient" class="carrier-form-input" placeholder="e.g. David Henderson, Warehouse Lead" required>
            </div>

            <div class="carrier-form-group">
              <label class="carrier-form-label" for="del-ref">Signature / Bill of Lading Ref:</label>
              <input type="text" id="del-ref" class="carrier-form-input" value="BOL-SIGN-${Math.floor(10000 + Math.random() * 90000)}" placeholder="e.g. BOL-SIGN-84920">
            </div>
          </div>

          <div class="carrier-form-group">
            <label class="carrier-form-label" for="del-notes">Delivery Remarks &amp; Cargo Inspection Notes: <span style="color: #EA341F;">*</span></label>
            <textarea id="del-notes" class="carrier-form-textarea" rows="2" placeholder="e.g. 24 pallets received intact. Security bolt seals verified and broken in presence of dock supervisor." required></textarea>
          </div>

          <!-- Simulated POD Attachment Control -->
          <div class="carrier-form-group">
            <label class="carrier-form-label">Proof of Delivery Document (Simulated Browser Attachment):</label>
            <div class="carrier-pod-card" onclick="document.getElementById('del-file-input').click()">
              <input type="file" id="del-file-input" style="display: none;" onchange="CarrierDeliveryView.handleFileSelect(event)">
              <div id="del-file-display">
                <div style="font-size: 20px; color: #18217E; margin-bottom: 4px;">&#128196;</div>
                <div style="font-weight: 700; color: #18217E; font-size: 12.5px;">Click to attach Signed Bill of Lading / POD Receipt</div>
                <div style="font-size: 11px; color: #8A9995; margin-top: 2px;">
                  Supports PDF, JPG, PNG &bull; Securely Encrypted &amp; Stored
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 800; background: #059669; border-color: #059669;">
              Confirm Delivery &amp; Archive POD &rarr;
            </button>
          </div>
        </form>
      </div>
    `);
  },

  handleOutcomeChange(val) {
    const notesEl = document.getElementById('del-notes');
    if (notesEl && val !== 'Successful Delivery') {
      notesEl.placeholder = "MANDATORY: Provide clear explanation of piece shortages, damage, or delivery failure reason...";
    }
  },

  handleFileSelect(e) {
    const file = e.target.files[0];
    const display = document.getElementById('del-file-display');
    if (file && display) {
      display.innerHTML = `
        <div style="font-size: 20px; color: #059669; margin-bottom: 4px;">&#9989;</div>
        <div style="font-weight: 700; color: #070724; font-size: 12.5px;">${file.name}</div>
        <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">
          ${(file.size / 1024).toFixed(1)} KB &bull; Verified Digital Document Stored
        </div>
      `;
    }
  },

  submitDelivery(shipmentId, recoveryRequestId) {
    const outcome = document.getElementById('del-outcome').value;
    const actualDeliveryTime = document.getElementById('del-time').value;
    const recipientName = document.getElementById('del-recipient').value;
    const recipientSignatureRef = document.getElementById('del-ref').value;
    const deliveryNotes = document.getElementById('del-notes').value;
    const fileInput = document.getElementById('del-file-input');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    try {
      window.BRIDGES_STORE.confirmDelivery({
        shipmentId,
        recoveryRequestId: recoveryRequestId || null,
        outcome,
        actualDeliveryTime,
        recipientName,
        recipientSignatureRef,
        deliveryNotes,
        podFileName: file ? file.name : `Signed_POD_${shipmentId}.pdf`,
        podFileType: file ? file.type : 'application/pdf',
        podFileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : '1.4 MB'
      });

      UI.closeModal('generic-app-modal');
      UI.showToast(`Delivery for ${shipmentId} confirmed (${outcome}). Fleet resources released to Available.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.CarrierDeliveryView = CarrierDeliveryView;
