/**
 * BRIDGES Control Tower - Customer Service Shipment Detail View
 * Phase 6: Customer-safe shipment view with latest approved ETA, pending review indicator,
 * customer communication history, milestones, and operational escalation trigger.
 */

window.CSShipmentDetailView = {
  selectedShipmentId: null,

  render() {
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();

    // Default to first shipment if none selected or not found
    if (!this.selectedShipmentId || !allShipments.find(s => s.id === this.selectedShipmentId)) {
      this.selectedShipmentId = allShipments.length > 0 ? allShipments[0].id : null;
    }

    const shipment = allShipments.find(s => s.id === this.selectedShipmentId);

    if (!shipment) {
      return `
        <div class="cs-view-container animate-fade-in">
          <div class="cs-card text-center py-5">
            <h3 class="text-dark">No Shipment Selected</h3>
            <p class="text-muted">Please select a shipment from the search page.</p>
            <button class="btn btn-primary btn-sm mt-3" onclick="App.navigateTo('cs_shipments')">
              Go to Shipment Search
            </button>
          </div>
        </div>
      `;
    }

    // Related Communications for this shipment
    const communications = store.getCommunications({ shipmentId: shipment.id });

    // Related Escalations for this shipment
    const escalations = (store.getEscalations ? store.getEscalations() : []).filter(e => e.shipmentId === shipment.id);

    // Milestones (derive from shipment events or default milestones)
    const milestones = shipment.milestones || [
      { name: 'Order Received & Dispatched', time: '14 Oct 08:30 AM', status: 'Completed' },
      { name: 'Departed Hub Terminal', time: '14 Oct 10:15 AM', status: 'Completed' },
      { name: 'Linehaul Checkpoint Pass', time: '14 Oct 02:40 PM', status: 'Completed' },
      { name: 'Exception Identified & Managed', time: shipment.lastOperationalUpdate || '15 Oct 09:12 AM', status: shipment.exceptionId ? 'Action Taken' : 'Completed' },
      { name: 'Out for Final Delivery', time: 'Pending Dispatch', status: shipment.status === 'Out for Delivery' ? 'In Progress' : 'Pending' },
      { name: 'Consignee Delivery Signature', time: shipment.approvedETA || 'Pending', status: 'Pending' }
    ];

    const hasPendingReview = shipment.etaApprovalStatus === 'Pending Review' && shipment.proposedETA;

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BREADCRUMB & SHIPMENT SWITCHER -->
        <div class="cs-detail-topbar">
          <div class="cs-breadcrumb">
            <span class="cs-bread-link" onclick="App.navigateTo('cs_shipments')">Shipments</span>
            <span class="cs-bread-sep">&rsaquo;</span>
            <span class="cs-bread-active">${shipment.id}</span>
          </div>

          <div class="cs-switcher-group">
            <label class="cs-switcher-label">Switch Shipment:</label>
            <select class="cs-select cs-switcher-select" onchange="CSShipmentDetailView.selectShipment(this.value)">
              ${allShipments.map(s => `
                <option value="${s.id}" ${s.id === shipment.id ? 'selected' : ''}>
                  ${s.id} — ${s.customerName || 'Customer'} (${s.status})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- MAIN HEADER BANNER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Customer Service Perspective
              </span>
              <span class="badge ${
                shipment.status === 'In Transit' ? 'badge-primary' :
                shipment.status === 'Delayed' || shipment.status === 'At Risk' ? 'badge-danger' :
                shipment.status === 'Out for Delivery' ? 'badge-warning' :
                shipment.status === 'Delivered' ? 'badge-success' : 'badge-neutral'
              }">
                ${shipment.status}
              </span>
              <span class="cs-status-pill ${
                shipment.customerUpdateStatus === 'Action Required' ? 'status-action-required' :
                shipment.customerUpdateStatus === 'Under Review' ? 'status-under-review' :
                'status-up-to-date'
              }">
                Customer Outreach: ${shipment.customerUpdateStatus || 'Up to Date'}
              </span>
            </div>
            <h1 class="cs-banner-title">${shipment.id} &bull; ${shipment.customerName || 'Customer Shipment'}</h1>
            <p class="cs-banner-subtitle">
              Order Ref: <strong>${shipment.orderId || 'ORD-N/A'}</strong> &bull; Customer Ref: <strong>${shipment.customerReference || 'CR-N/A'}</strong> &bull; Consignee: <strong>${shipment.consigneeName || 'Consignee'}</strong>
            </p>
          </div>

          <!-- CORE ACTIONS -->
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSShipmentDetailView.askAI('${shipment.id}')" style="border-color: #424989; color: #18217E; font-weight: 700;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Ask AI Assistant
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CSShipmentDetailView.openAddNoteModal('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              + Add Call/Note
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CSShipmentDetailView.openFeedbackModal('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Feedback / Complaint
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CSShipmentDetailView.openEscalationModal('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Raise Escalation
            </button>
            <button class="btn btn-primary btn-sm" onclick="CSShipmentDetailView.draftCustomerUpdate('${shipment.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Draft Update
            </button>
          </div>
        </div>

        <!-- ETA COMPARISON CALLOUT BOX (PROMINENT APPROVED VS PROPOSED) -->
        <div class="cs-eta-comparison-card ${hasPendingReview ? 'comparison-alert' : ''}">
          <div class="cs-eta-box-header">
            <div class="cs-eta-box-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Delivery Commitments & Estimated Time of Arrival</span>
            </div>
            <span class="cs-approval-pill ${shipment.etaApprovalStatus === 'Approved' ? 'approval-approved' : 'approval-pending'}">
              ETA Operational Status: ${shipment.etaApprovalStatus || 'Approved'}
            </span>
          </div>

          <div class="cs-eta-box-grid">
            <!-- 1. LATEST APPROVED ETA (CUSTOMER-FACING) -->
            <div class="cs-eta-metric-col confirmed-eta-col">
              <div class="cs-eta-col-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                LATEST APPROVED ETA (CUSTOMER-SAFE)
              </div>
              <div class="cs-eta-large-value">${shipment.approvedETA || shipment.eta || 'TBD'}</div>
              <div class="cs-eta-col-help text-success">
                Authorized for customer quotation & SLA reporting.
              </div>
            </div>

            <!-- 2. PROPOSED ETA (INTERNAL OPERATIONAL) -->
            <div class="cs-eta-metric-col ${hasPendingReview ? 'proposed-eta-alert' : 'proposed-eta-normal'}">
              <div class="cs-eta-col-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                PROPOSED OPERATIONAL ETA
              </div>
              <div class="cs-eta-large-value ${hasPendingReview ? 'text-warning' : 'text-muted'}">
                ${shipment.proposedETA || 'No deviation proposed'}
              </div>
              <div class="cs-eta-col-help ${hasPendingReview ? 'text-danger font-semibold' : 'text-muted'}">
                ${hasPendingReview ? 
                  '⚠️ Pending review by Dispatcher / Control Tower. DO NOT present as confirmed to customer.' : 
                  'Operational trajectory matches approved commitment.'
                }
              </div>
            </div>

            <!-- 3. SLA COMMITMENT & RISK -->
            <div class="cs-eta-metric-col sla-eta-col">
              <div class="cs-eta-col-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M7 11h10"/>
                </svg>
                SLA STATUS & COMMITMENT
              </div>
              <div class="cs-eta-large-value" style="font-size: 18px; color: ${shipment.slaRisk === 'Critical SLA Breach' ? '#EA341F' : shipment.slaRisk === 'High Risk' ? '#D97706' : '#18217E'};">
                ${shipment.slaRisk || 'On Schedule'}
              </div>
              <div class="cs-eta-col-help">
                Target: ${shipment.slaDeadline || 'End of Business'} &bull; Last update: ${shipment.lastOperationalUpdate || '10m ago'}
              </div>
            </div>
          </div>
        </div>

        <!-- 2-COLUMN LAYOUT -->
        <div class="cs-detail-layout">
          <!-- LEFT COLUMN: Shipment Details, Carrier/Vehicle, Recovery Action, Customer Info -->
          <div class="cs-detail-col">
            <!-- 1. Customer & Consignee Permitted Information -->
            <div class="cs-card">
              <div class="cs-card-header">
                <h3 class="cs-card-title">Customer & Consignee Profile</h3>
                <span class="cs-privacy-badge">Authorized CS View</span>
              </div>
              <div class="cs-card-body">
                <div class="cs-info-grid">
                  <div class="cs-info-item">
                    <span class="cs-info-label">Customer Account</span>
                    <strong class="cs-info-value">${shipment.customerName || 'Global Enterprise'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Customer Reference</span>
                    <strong class="cs-info-value">${shipment.customerReference || 'CR-REF-992'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Order Reference</span>
                    <strong class="cs-info-value">${shipment.orderId || 'ORD-N/A'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Consignee Name</span>
                    <strong class="cs-info-value">${shipment.consigneeName || 'Regional Distribution Hub'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Primary Contact</span>
                    <strong class="cs-info-value">${shipment.customerContact || 'Logistics Coordinator'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Contact Email</span>
                    <span class="cs-info-value text-primary">${shipment.customerEmail || 'orders@customer.com'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Contact Phone</span>
                    <span class="cs-info-value">${shipment.customerPhone || '+1 (555) 019-2834'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Live Transit Location</span>
                    <span class="cs-info-value" style="color: #18217E; font-weight: 700;">${shipment.currentLocation || 'Interstate Transit Corridor'}</span>
                  </div>
                  <div class="cs-info-item cs-info-full">
                    <span class="cs-info-label">Destination Address</span>
                    <span class="cs-info-value">${shipment.destination || 'Dallas Central Logistics Hub, TX'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. CARRIER & VEHICLE DETAILS (REQUIRED FOR CS VISIBILITY) -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Carrier & Vehicle Fleet Details</h3>
                  <p class="cs-card-subtitle">Active linehaul operator, equipment registration & driver telematics</p>
                </div>
                <span class="badge badge-primary">Active Resource</span>
              </div>
              <div class="cs-card-body">
                <div class="cs-info-grid">
                  <div class="cs-info-item">
                    <span class="cs-info-label">Carrier Partner</span>
                    <strong class="cs-info-value">${(shipment.carrierDetails && shipment.carrierDetails.carrierName) || shipment.carrierName || 'Apex Logistics Group'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Carrier Dispatch Phone</span>
                    <span class="cs-info-value">${(shipment.carrierDetails && shipment.carrierDetails.phone) || '+1 (800) 555-0199'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Vehicle Registration</span>
                    <strong class="cs-info-value" style="font-family: monospace; color: #18217E;">${(shipment.carrierDetails && shipment.carrierDetails.vehiclePlate) || 'TX-TRK-8821'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Vehicle Equipment Type</span>
                    <span class="cs-info-value">${(shipment.carrierDetails && shipment.carrierDetails.vehicleType) || '53ft Enclosed Dry Van'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Assigned Driver</span>
                    <strong class="cs-info-value">${(shipment.carrierDetails && shipment.carrierDetails.driverName) || shipment.driverName || 'Marcus Vance'}</strong>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Driver Contact</span>
                    <span class="cs-info-value">${(shipment.carrierDetails && shipment.carrierDetails.driverPhone) || '+1 (214) 555-0182'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Security Tamper Seal</span>
                    <span class="cs-info-value" style="font-family: monospace;">${(shipment.carrierDetails && shipment.carrierDetails.sealNumber) || 'SL-99482-B'}</span>
                  </div>
                  <div class="cs-info-item">
                    <span class="cs-info-label">Sensor Telemetry & Temperature</span>
                    <span class="cs-info-value" style="color: #10B981; font-weight: 700;">${shipment.temperature || '+4.2°C (Compliant)'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. RECOVERY ACTION & OPERATIONAL MITIGATION (REQUIRED FOR CS VISIBILITY) -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Operational Recovery Action & Mitigation</h3>
                  <p class="cs-card-subtitle">Active mitigation enacted by Dispatch and Control Tower</p>
                </div>
                <span class="badge ${shipment.hasException ? 'badge-warning' : 'badge-success'}">
                  ${(shipment.recoveryAction && shipment.recoveryAction.status) || (shipment.hasException ? 'Recovery Active' : 'Nominal Transit')}
                </span>
              </div>
              <div class="cs-card-body">
                <div style="background: #F8FAFB; border: 1px solid #E5EBEE; border-left: 3px solid #18217E; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <strong style="color: #18217E; font-size: 13px;">${(shipment.recoveryAction && shipment.recoveryAction.planTitle) || 'Dynamic Arterial Re-route'}</strong>
                    <span style="font-size: 11px; color: #424989;">Lead: ${(shipment.recoveryAction && shipment.recoveryAction.dispatcherInCharge) || 'Elena Rostova (Lead Dispatcher)'}</span>
                  </div>
                  <p style="font-size: 12px; color: #393A50; line-height: 1.45; margin: 0;">
                    ${(shipment.recoveryAction && shipment.recoveryAction.strategy) || 'Active route optimization and dock arrival rescheduling underway.'}
                  </p>
                  <div style="margin-top: 8px; font-size: 11px; color: #10B981; font-weight: 600;">
                    Mitigation Outcome: ${(shipment.recoveryAction && shipment.recoveryAction.mitigationImpact) || 'Maintains customer delivery SLA window.'}
                  </div>
                </div>

                <div class="cs-safe-callout">
                  <div class="cs-callout-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18217E" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <div class="cs-callout-text">
                    <h4 class="cs-callout-heading">Approved Customer Statement (Vetted for CSR Quotation)</h4>
                    <p class="cs-callout-body">
                      "${shipment.customerSafeExceptionSummary || 'Shipment is proceeding through standard network routing with ongoing monitoring.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. DELIVERY CONFIRMATION & PROOF OF DELIVERY (POD) -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Delivery Confirmation & Proof of Delivery (POD)</h3>
                  <p class="cs-card-subtitle">Receiving quantities, damage inspection & consignee signature</p>
                </div>
                ${shipment.deliveryConfirmation ? `
                  <span class="badge badge-success">Delivered & Verified</span>
                ` : `
                  <span class="badge badge-neutral">Pending Delivery</span>
                `}
              </div>
              <div class="cs-card-body">
                ${shipment.deliveryConfirmation ? `
                  <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                      <div style="font-size: 12px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 5px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Official Delivery Signed & Recorded
                      </div>
                      <span style="font-size: 11px; color: #15803D;">${shipment.deliveryConfirmation.deliveredAt}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; background: white; padding: 10px; border-radius: 6px; border: 1px solid #DCFCE7;">
                      <div>
                        <span style="font-size: 10.5px; color: #166534; font-weight: 600; display: block;">Received Qty</span>
                        <strong style="font-size: 16px; color: #15803D;">${shipment.deliveryConfirmation.receivedQty} pcs</strong>
                      </div>
                      <div>
                        <span style="font-size: 10.5px; color: #991B1B; font-weight: 600; display: block;">Damaged Qty</span>
                        <strong style="font-size: 16px; color: ${shipment.deliveryConfirmation.damagedQty > 0 ? '#DC2626' : '#15803D'};">${shipment.deliveryConfirmation.damagedQty} pcs</strong>
                      </div>
                      <div>
                        <span style="font-size: 10.5px; color: #374151; font-weight: 600; display: block;">Rejected Qty</span>
                        <strong style="font-size: 16px; color: #374151;">${shipment.deliveryConfirmation.rejectedQty} pcs</strong>
                      </div>
                    </div>

                    <div style="font-size: 11.5px; color: #14532D; margin-bottom: 8px;">
                      Sign-off Recipient: <strong>${shipment.deliveryConfirmation.recipientName}</strong> (${shipment.deliveryConfirmation.recipientRole}) &bull; <span style="font-weight: 600;">Status: Verified Digital POD</span>
                    </div>

                    <div style="font-size: 11px; color: #166534; line-height: 1.4; margin-bottom: 10px;">
                      Inspection Notes: "${shipment.deliveryConfirmation.conditionNotes || 'Cartons intact, temperatures within nominal threshold.'}"
                    </div>

                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-secondary btn-xs" onclick="CSShipmentDetailView.openPodPreview('${shipment.id}')" style="background: white; border-color: #86EFAC; color: #166534; font-weight: 700;">
                        📄 View Proof of Delivery (POD) Receipt
                      </button>
                    </div>
                  </div>
                ` : `
                  <div style="text-align: center; padding: 20px; color: #8A9995; background: #F8FAFB; border-radius: 6px; border: 1px dashed #E5EBEE;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom: 6px;">
                      <rect width="18" height="18" x="3" y="3" rx="2"/>
                      <polyline points="9 11 12 14 22 4"/>
                    </svg>
                    <div style="font-size: 12px; font-weight: 700; color: #393A50;">Delivery Confirmation Pending</div>
                    <p style="font-size: 11px; margin: 4px auto 0; max-width: 320px;">
                      Shipment is currently in transit. Receiving count tally, physical condition inspection, and digital consignee signature will be captured at ${shipment.destination || 'destination dock'}.
                    </p>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Shipment Milestones, Notes, and Communications -->
          <div class="cs-detail-col">
            <!-- 1. Tracking Milestones -->
            <div class="cs-card">
              <div class="cs-card-header">
                <h3 class="cs-card-title">Tracking Milestones & Chain of Custody</h3>
                <span class="text-muted text-xs">Route: ${shipment.origin ? shipment.origin.split(',')[0] : 'Origin'} &rarr; ${shipment.destination ? shipment.destination.split(',')[0] : 'Dest'}</span>
              </div>
              <div class="cs-card-body">
                <div class="cs-timeline">
                  ${milestones.map((m, idx) => `
                    <div class="cs-timeline-item ${m.status === 'Completed' || m.status === 'completed' ? 'timeline-completed' : m.status === 'Action Taken' || m.status === 'incident' ? 'timeline-action' : m.status === 'In Progress' || m.status === 'in_progress' ? 'timeline-current' : 'timeline-pending'}">
                      <div class="cs-timeline-marker"></div>
                      <div class="cs-timeline-content">
                        <div class="cs-timeline-title-row">
                          <strong class="cs-timeline-title">${m.name}</strong>
                          <span class="cs-timeline-time">${m.time || 'Pending'}</span>
                        </div>
                        <span class="cs-timeline-status-tag tag-${(m.status || 'pending').toLowerCase().replace(/\s+/g, '-')}">
                          ${m.status}
                        </span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 2. CUSTOMER COMMUNICATION NOTES & CALL LOGS (REQUIRED) -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Customer Interaction & Call Notes</h3>
                  <p class="cs-card-subtitle">Phone conversation logs, customer inquiries, and agreed actions</p>
                </div>
                <button class="btn btn-primary btn-xs" onclick="CSShipmentDetailView.openAddNoteModal('${shipment.id}')">
                  + Add Note
                </button>
              </div>
              <div class="cs-card-body p-0">
                ${(() => {
                  const notes = store.getCommunicationNotes ? store.getCommunicationNotes(shipment.id) : [];
                  if (notes.length === 0) {
                    return `
                      <div class="p-3 text-center text-muted text-xs">
                        No internal customer notes logged for this shipment. Click '+ Add Note' to log an inquiry or call.
                      </div>
                    `;
                  }
                  return `
                    <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
                      ${notes.map(n => `
                        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">
                          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 11px; font-weight: 700; color: #18217E;">${n.channel || 'Phone Call'} &bull; ${n.contactPerson || 'Customer'}</span>
                            <span style="font-size: 10px; color: #64748B;">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style="font-size: 11.5px; color: #334155; line-height: 1.4; margin-bottom: 6px;">
                            ${n.note}
                          </div>
                          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748B;">
                            <span>Logged by: <strong>${n.author}</strong></span>
                            <span style="background: rgba(24,33,126,0.08); color: #18217E; padding: 1px 6px; border-radius: 4px; font-weight: 600;">Sentiment: ${n.sentiment || 'Neutral'}</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  `;
                })()}
              </div>
            </div>

            <!-- 3. CUSTOMER FEEDBACK & COMPLAINTS (REQUIRED) -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Customer Feedback & Complaint Escalations</h3>
                  <p class="cs-card-subtitle">Satisfaction ratings, customer feedback, and escalated complaints</p>
                </div>
                <button class="btn btn-secondary btn-xs" onclick="CSShipmentDetailView.openFeedbackModal('${shipment.id}')">
                  + Record Feedback
                </button>
              </div>
              <div class="cs-card-body p-0">
                ${(() => {
                  const feedbackList = store.getCustomerFeedback ? store.getCustomerFeedback(shipment.id) : [];
                  if (feedbackList.length === 0) {
                    return `
                      <div class="p-3 text-center text-muted text-xs">
                        No customer feedback or complaints logged yet. Click '+ Record Feedback' to document client sentiment.
                      </div>
                    `;
                  }
                  return `
                    <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">
                      ${feedbackList.map(f => `
                        <div style="background: ${f.isComplaint ? '#FEF2F2' : '#F8FAFC'}; border: 1px solid ${f.isComplaint ? '#FECACA' : '#E2E8F0'}; border-radius: 6px; padding: 10px;">
                          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 11px; font-weight: 700; color: ${f.isComplaint ? '#991B1B' : '#18217E'};">
                              ${f.isComplaint ? '⚠️ Customer Complaint Escalated' : '⭐ Customer Feedback'}
                            </span>
                            <span style="font-size: 11px; font-weight: 700; color: #D97706;">
                              ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                            </span>
                          </div>
                          <div style="font-size: 11.5px; color: #334155; line-height: 1.4; margin-bottom: 6px;">
                            "${f.feedbackText}"
                          </div>
                          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748B;">
                            <span>Customer: <strong>${f.author || f.customerName}</strong></span>
                            <span style="font-weight: 600; color: ${f.isComplaint ? '#B91C1C' : '#18217E'};">Sentiment: ${f.sentiment}</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  `;
                })()}
              </div>
            </div>

            <!-- 4. Customer Communications Log -->
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Dispatched Customer Notifications</h3>
                  <p class="cs-card-subtitle">Automated and manual outreach audit trail</p>
                </div>
                <button class="btn btn-outline btn-xs" onclick="CSShipmentDetailView.draftCustomerUpdate('${shipment.id}')">
                  + Compose New
                </button>
              </div>
              <div class="cs-card-body p-0">
                ${communications.length === 0 ? `
                  <div class="p-4 text-center text-muted">
                    <p class="text-sm">No communications have been dispatched for this shipment yet.</p>
                    <button class="btn btn-primary btn-xs mt-2" onclick="CSShipmentDetailView.draftCustomerUpdate('${shipment.id}')">
                      Draft First Notification
                    </button>
                  </div>
                ` : `
                  <div class="cs-comms-list">
                    ${communications.map(c => `
                      <div class="cs-comm-item" onclick="CSDashboardView.openMessageModal('${c.id}')">
                        <div class="cs-comm-item-top">
                          <span class="cs-channel-badge ${c.channel === 'Email' ? 'channel-email' : 'channel-sms'}">
                            ${c.channel}
                          </span>
                          <span class="cs-comm-template">${c.template || c.templateName || 'Notification'}</span>
                          <span class="cs-comm-status-badge ${c.status === 'Sent' ? 'comm-sent' : c.status === 'Failed' ? 'badge-danger' : c.status === 'Awaiting Review' ? 'comm-review' : 'comm-draft'}">
                            ${c.status}
                          </span>
                        </div>
                        <div class="cs-comm-snippet">
                          ${c.subject ? `<strong>${c.subject}</strong> — ` : ''}
                          ${(c.body || c.message || '').substring(0, 110)}${(c.body || c.message || '').length > 110 ? '...' : ''}
                        </div>
                        <div class="cs-comm-item-bottom">
                          <span>To: <strong>${c.recipient}</strong></span>
                          <span>${c.sentAt || c.createdAt}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectShipment(id) {
    this.selectedShipmentId = id;
    App.renderCurrentView();
  },

  draftCustomerUpdate(shipmentId) {
    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_compose');
  },

  viewHistory(shipmentId) {
    if (window.CSHistoryView) {
      window.CSHistoryView.searchQuery = shipmentId;
    }
    App.navigateTo('cs_history');
  },

  askAI(shipmentId) {
    if (window.CSAIAssistantView) {
      window.CSAIAssistantView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_ai_assistant');
  },

  openEscalationModal(shipmentId) {
    if (window.CSEscalationsView) {
      window.CSEscalationsView.openNewEscalationModal(shipmentId);
    } else {
      App.navigateTo('cs_escalations');
    }
  },

  openAddNoteModal(shipmentId) {
    if (window.CSShipmentsView && window.CSShipmentsView.openAddNoteModal) {
      window.CSShipmentsView.openAddNoteModal(shipmentId);
    }
  },

  openFeedbackModal(shipmentId) {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(shipmentId);
    if (!shipment) return;

    UI.openModal('generic-app-modal', `Customer Feedback & Complaint Recording — ${shipment.id}`, `
      <form id="cs-feedback-form" onsubmit="event.preventDefault(); CSShipmentDetailView.saveFeedback('${shipment.id}');">
        <div style="font-size: 12px; color: #393A50; margin-bottom: 14px; background: #F8FAFB; border: 1px solid #E5EBEE; border-radius: 6px; padding: 10px;">
          <div>Customer: <strong>${shipment.customerName}</strong> &bull; Order: <strong>${shipment.orderId}</strong> &bull; Ref: <strong>${shipment.customerReference}</strong></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Satisfaction Rating (1 to 5 Stars)</label>
            <select id="feedback-rating" class="cs-select" style="width: 100%; padding: 6px 10px; font-size: 12px;">
              <option value="5">⭐⭐⭐⭐⭐ 5 - Highly Satisfied</option>
              <option value="4">⭐⭐⭐⭐ 4 - Satisfied</option>
              <option value="3" selected>⭐⭐⭐ 3 - Neutral / Acceptable</option>
              <option value="2">⭐⭐ 2 - Dissatisfied</option>
              <option value="1">⭐ 1 - Highly Dissatisfied / Critical Issue</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Sentiment Classification</label>
            <select id="feedback-sentiment" class="cs-select" style="width: 100%; padding: 6px 10px; font-size: 12px;">
              <option value="Positive">Positive</option>
              <option value="Neutral" selected>Neutral</option>
              <option value="Concerned">Concerned</option>
              <option value="Frustrated / Escalated">Frustrated / Escalated</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 12px; padding: 10px; background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 6px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #9B2C2C; cursor: pointer;">
            <input type="checkbox" id="feedback-is-complaint" onchange="document.getElementById('complaint-fields').style.display = this.checked ? 'block' : 'none';">
            Escalate as Formal Customer Complaint to Operations
          </label>
          <div id="complaint-fields" style="display: none; margin-top: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <label style="display: block; font-size: 10.5px; font-weight: 600; color: #9B2C2C; margin-bottom: 2px;">Complaint Category</label>
                <select id="complaint-category" class="cs-select" style="width: 100%; padding: 4px 8px; font-size: 11px;">
                  <option value="Delivery Delay Beyond SLA">Delivery Delay Beyond SLA</option>
                  <option value="Missing Status Updates">Missing Status Updates</option>
                  <option value="Damaged Cargo / Temperature Risk">Damaged Cargo / Temperature Risk</option>
                  <option value="Carrier Conduct Issue">Carrier Conduct Issue</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 10.5px; font-weight: 600; color: #9B2C2C; margin-bottom: 2px;">Complaint Urgency</label>
                <select id="complaint-severity" class="cs-select" style="width: 100%; padding: 4px 8px; font-size: 11px;">
                  <option value="Critical">Critical (Executive Attention / SLA Penalty)</option>
                  <option value="High" selected>High (Same-Day Operations Action)</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display: block; font-size: 10.5px; font-weight: 600; color: #9B2C2C; margin-bottom: 2px;">Requested Remediation</label>
              <input type="text" id="complaint-resolution" class="login-input" placeholder="e.g. Expedited replacement reefer, SLA rebate, or account manager callback" style="padding: 5px 8px; font-size: 11px;">
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #070724; margin-bottom: 4px;">Customer Feedback / Complaint Description</label>
          <textarea id="feedback-text" class="login-input" rows="3" placeholder="Enter customer feedback or detailed complaint statement verbatim..." required style="padding: 8px 10px; font-size: 12px; width: 100%; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #E5EBEE; padding-top: 12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save &amp; Record</button>
        </div>
      </form>
    `);
  },

  saveFeedback(shipmentId) {
    const rating = parseInt(document.getElementById('feedback-rating')?.value || '3', 10);
    const sentiment = document.getElementById('feedback-sentiment')?.value;
    const isComplaint = document.getElementById('feedback-is-complaint')?.checked;
    const complaintCategory = document.getElementById('complaint-category')?.value;
    const complaintSeverity = document.getElementById('complaint-severity')?.value;
    const requestedResolution = document.getElementById('complaint-resolution')?.value;
    const feedbackText = document.getElementById('feedback-text')?.value;

    if (!feedbackText || !feedbackText.trim()) {
      UI.showToast('Please enter feedback text.', 'error');
      return;
    }

    const result = window.BRIDGES_STORE.logCustomerFeedback(shipmentId, {
      rating,
      sentiment,
      isComplaint,
      complaintCategory,
      complaintSeverity,
      requestedResolution,
      feedbackText: feedbackText.trim()
    });

    UI.closeModal('generic-app-modal');
    if (result.escalation) {
      UI.showToast(`Customer complaint logged and escalated (${result.escalation.escalation.id}) to Operations.`, 'warning');
    } else {
      UI.showToast(`Customer feedback recorded for ${shipmentId}.`, 'success');
    }
    App.renderCurrentView();
  },

  openPodPreview(shipmentId) {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(shipmentId);
    if (!shipment || !shipment.deliveryConfirmation) return;
    const pod = shipment.deliveryConfirmation;

    UI.openModal('generic-app-modal', `Verified Proof of Delivery (POD) — ${shipment.id}`, `
      <div style="padding: 6px 0;">
        <div style="border: 2px solid #10B981; border-radius: 8px; padding: 16px; background: #F0FDF4; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #BBF7D0; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #166534;">BRIDGES ELECTRONIC PROOF OF DELIVERY</div>
              <div style="font-size: 11px; color: #15803D;">Official Clean Receipt & Custody Transfer Certificate</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; background: #15803D; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700;">DIGITALLY VERIFIED</span>
              <div style="font-size: 11px; color: #166534; margin-top: 3px;">${pod.deliveredAt}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; margin-bottom: 12px;">
            <div>Shipment Ref: <strong>${shipment.id}</strong></div>
            <div>Order Reference: <strong>${shipment.orderId}</strong></div>
            <div>Customer Reference: <strong>${shipment.customerReference}</strong></div>
            <div>Carrier Fleet: <strong>${(shipment.carrierDetails && shipment.carrierDetails.carrierName) || 'Apex Logistics'}</strong></div>
            <div>Receiving Facility: <strong>${pod.destinationAddress}</strong></div>
            <div>Tamper Seal Verified: <strong>${(shipment.carrierDetails && shipment.carrierDetails.sealNumber) || 'SL-99482-B'} (Intact)</strong></div>
          </div>

          <div style="background: white; border: 1px solid #DCFCE7; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
            <div style="font-weight: 700; color: #166534; font-size: 12px; margin-bottom: 6px;">Cargo Receiving Tally:</div>
            <div style="display: flex; gap: 20px; font-size: 12px;">
              <div>Good Pieces Received: <strong style="color: #15803D;">${pod.receivedQty}</strong></div>
              <div>Damaged Cartons: <strong style="color: ${pod.damagedQty > 0 ? '#DC2626' : '#15803D'};">${pod.damagedQty}</strong></div>
              <div>Rejected Cartons: <strong>${pod.rejectedQty}</strong></div>
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 6px;">Condition: "${pod.conditionNotes}"</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #86EFAC; padding-top: 10px;">
            <div>
              <div style="font-size: 10.5px; color: #166534;">Consignee Authorized Signatory:</div>
              <div style="font-size: 14px; font-weight: 700; color: #14532D; font-family: cursive;">${pod.recipientName}</div>
              <div style="font-size: 10px; color: #64748B;">Role: ${pod.recipientRole}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10.5px; color: #166534;">Attached PDF: <strong>${pod.podDocument}</strong></span>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close Preview</button>
        </div>
      </div>
    `);
  }
};
