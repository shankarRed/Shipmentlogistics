/**
 * BRIDGES Control Tower - Customer Service Communication Workspace View
 * Phase 6: Focused workspace for composing, reviewing, previewing, and dispatching
 * customer-safe notifications via Email or SMS using 5 pre-built templates.
 */

window.CSComposeView = {
  selectedShipmentId: null,
  selectedTemplate: 'Delivery May Be Delayed',
  selectedChannel: 'Email', // 'Email' or 'SMS'
  recipient: '',
  subject: '',
  body: '',
  editingCommId: null,

  initForShipment(shipmentId) {
    this.selectedShipmentId = shipmentId;
    this.loadTemplate(this.selectedTemplate);
  },

  render() {
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();

    if (!this.selectedShipmentId || !allShipments.find(s => s.id === this.selectedShipmentId)) {
      this.selectedShipmentId = allShipments.length > 0 ? allShipments[0].id : null;
    }

    const shipment = allShipments.find(s => s.id === this.selectedShipmentId) || {};

    // Check if an existing draft exists for this shipment
    const existingDraft = store.getCommunications({ shipmentId: shipment.id })
      .find(c => c.status === 'Draft' || c.status === 'Awaiting Review');

    // Pre-populate if not already loaded
    if (!this.recipient) {
      if (existingDraft) {
        this.editingCommId = existingDraft.id;
        this.selectedChannel = existingDraft.channel || 'Email';
        this.selectedTemplate = existingDraft.template || 'ETA Updated';
        this.recipient = existingDraft.recipient || shipment.customerEmail || 'orders@customer.com';
        this.subject = existingDraft.subject || '';
        this.body = existingDraft.body || '';
      } else {
        this.loadTemplate(this.selectedTemplate, false);
      }
    }

    const hasPendingReview = shipment.etaApprovalStatus === 'Pending Review' && shipment.proposedETA;

    return `
      <div class="cs-view-container animate-fade-in">
        <!-- TOP BREADCRUMB -->
        <div class="cs-detail-topbar">
          <div class="cs-breadcrumb">
            <span class="cs-bread-link" onclick="App.navigateTo('cs_queue')">Communication Queue</span>
            <span class="cs-bread-sep">&rsaquo;</span>
            <span class="cs-bread-active">Communication Workspace</span>
          </div>

          <div class="cs-switcher-group">
            <label class="cs-switcher-label">Target Shipment:</label>
            <select class="cs-select cs-switcher-select" onchange="CSComposeView.onShipmentChange(this.value)">
              ${allShipments.map(s => `
                <option value="${s.id}" ${s.id === shipment.id ? 'selected' : ''}>
                  ${s.id} — ${s.customerName || 'Customer'} (${s.customerUpdateStatus || 'Update Needed'})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- SHIPMENT CONTEXT SUMMARY STRIP -->
        <div class="cs-context-strip">
          <div class="cs-context-item">
            <span class="cs-context-label">Shipment Reference:</span>
            <strong>${shipment.id}</strong>
          </div>
          <div class="cs-context-item">
            <span class="cs-context-label">Customer Account:</span>
            <strong>${shipment.customerName || 'Customer'}</strong>
          </div>
          <div class="cs-context-item">
            <span class="cs-context-label">Customer Ref:</span>
            <span>${shipment.customerReference || 'N/A'}</span>
          </div>
          <div class="cs-context-item">
            <span class="cs-context-label">Consignee:</span>
            <span>${shipment.consigneeName || 'Consignee'}</span>
          </div>
          <div class="cs-context-item">
            <span class="cs-context-label">Latest Approved ETA:</span>
            <span class="cs-approved-eta-badge">${shipment.approvedETA || shipment.eta || 'TBD'}</span>
          </div>
          <div class="cs-context-item">
            <span class="cs-context-label">Disruption Status:</span>
            <span class="badge ${shipment.exceptionId ? 'badge-danger' : 'badge-success'}">
              ${shipment.exceptionType || 'Nominal Transit'}
            </span>
          </div>
        </div>

        ${hasPendingReview ? `
          <div class="cs-warning-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <strong>Pending Operational Review Notice:</strong>
              A proposed ETA of <strong>${shipment.proposedETA}</strong> is awaiting operational review by the Control Tower / Dispatcher.
              Per protocol, <strong>DO NOT</strong> quote the unapproved time to the customer. Strictly quote the latest approved ETA (<strong>${shipment.approvedETA || 'TBD'}</strong>).
            </div>
          </div>
        ` : ''}

        <!-- 2-COLUMN WORKSPACE: LEFT COMPOSER, RIGHT PREVIEW -->
        <div class="cs-compose-layout">
          <!-- LEFT: FORM & CONTROLS -->
          <div class="cs-compose-form-panel">
            <div class="cs-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Compose Customer Notification</h3>
                  <p class="cs-card-subtitle">Select a pre-built template or customize the customer-safe message</p>
                </div>
                ${this.editingCommId ? `
                  <span class="cs-comm-status-badge comm-draft">Editing Draft ${this.editingCommId}</span>
                ` : `
                  <span class="cs-comm-status-badge comm-draft">New Notification</span>
                `}
              </div>

              <div class="cs-card-body">
                <!-- 1. TEMPLATE SELECTOR BUTTONS -->
                <div class="cs-form-group">
                  <label class="cs-form-label">Select Message Template (5 Certified Templates):</label>
                  <div class="cs-template-btn-grid">
                    ${[
                      'ETA Updated',
                      'Delivery May Be Delayed',
                      'Shipment Under Resolution',
                      'Shipment Resolved',
                      'Status Confirmation'
                    ].map(tpl => `
                      <button 
                        type="button" 
                        class="cs-template-btn ${this.selectedTemplate === tpl ? 'active' : ''}" 
                        onclick="CSComposeView.selectTemplate('${tpl}')"
                      >
                        <span class="cs-tpl-dot"></span>
                        ${tpl}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- 2. CHANNEL TOGGLE (EMAIL VS SMS) -->
                <div class="cs-form-group">
                  <label class="cs-form-label">Simulated Delivery Channel:</label>
                  <div class="cs-channel-toggle-row">
                    <button 
                      type="button" 
                      class="cs-channel-toggle-btn ${this.selectedChannel === 'Email' ? 'active' : ''}"
                      onclick="CSComposeView.selectChannel('Email')"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      Email Notification
                    </button>
                    <button 
                      type="button" 
                      class="cs-channel-toggle-btn ${this.selectedChannel === 'SMS' ? 'active' : ''}"
                      onclick="CSComposeView.selectChannel('SMS')"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      SMS Text Alert
                    </button>
                  </div>
                </div>

                <!-- 3. RECIPIENT -->
                <div class="cs-form-group">
                  <label class="cs-form-label">${this.selectedChannel === 'Email' ? 'Customer Email Recipient' : 'Customer Mobile Number'}:</label>
                  <input 
                    type="text" 
                    class="cs-input" 
                    id="cs-recipient-input"
                    value="${this.recipient}" 
                    placeholder="${this.selectedChannel === 'Email' ? 'client@organization.com' : '+1 (555) 019-2834'}"
                    oninput="CSComposeView.onRecipientChange(this.value)"
                  />
                </div>

                <!-- 4. SUBJECT (If Email) -->
                ${this.selectedChannel === 'Email' ? `
                  <div class="cs-form-group">
                    <label class="cs-form-label">Subject Line:</label>
                    <input 
                      type="text" 
                      class="cs-input" 
                      id="cs-subject-input"
                      value="${this.subject}" 
                      placeholder="BRIDGES Shipment Update — ${shipment.id}"
                      oninput="CSComposeView.onSubjectChange(this.value)"
                    />
                  </div>
                ` : ''}

                <!-- 5. MESSAGE BODY -->
                <div class="cs-form-group">
                  <div class="cs-body-label-row">
                    <label class="cs-form-label">Customer-Safe Message Body:</label>
                    ${this.selectedChannel === 'SMS' ? `
                      <span class="cs-char-counter ${this.body.length > 160 ? 'counter-warning' : ''}">
                        ${this.body.length} / 160 chars
                      </span>
                    ` : ''}
                  </div>
                  <textarea 
                    class="cs-textarea" 
                    id="cs-body-input"
                    rows="${this.selectedChannel === 'Email' ? '9' : '5'}" 
                    oninput="CSComposeView.onBodyChange(this.value)"
                  >${this.body}</textarea>
                </div>

                <!-- SAFETY & COMPLIANCE BANNER -->
                <div class="cs-safety-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <div>
                    <strong>Customer Safety Protocol Active:</strong>
                    Internal AI reasoning, sensitive driver/carrier notes, and cost recoveries are prevented from being included in customer messaging.
                  </div>
                </div>

                <!-- BUTTONS ROW -->
                <div class="cs-compose-actions mt-4">
                  <div class="cs-actions-left">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="App.navigateTo('cs_queue')">
                      Cancel
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="CSComposeView.saveDraft()">
                      Save Draft
                    </button>
                  </div>
                  <div class="cs-actions-right">
                    <button type="button" class="btn btn-outline btn-sm" onclick="CSComposeView.requestReview()">
                      Submit for Review
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="CSComposeView.sendSimulatedMessage()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Send Simulated Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: LIVE REALISTIC CUSTOMER PREVIEW -->
          <div class="cs-compose-preview-panel">
            <div class="cs-card cs-preview-card">
              <div class="cs-card-header">
                <div class="cs-card-title-group">
                  <h3 class="cs-card-title">Live Customer Preview</h3>
                  <p class="cs-card-subtitle">Exact presentation delivered to customer inbox or mobile device</p>
                </div>
                <span class="cs-preview-badge">${this.selectedChannel} Live Preview</span>
              </div>

              <div class="cs-card-body">
                ${this.selectedChannel === 'Email' ? `
                  <!-- EMAIL PREVIEW FRAME -->
                  <div class="cs-email-mockup">
                    <!-- EMAIL CLIENT HEADER -->
                    <div class="cs-email-client-header">
                      <div class="cs-email-header-row">
                        <span class="cs-email-label">From:</span>
                        <span>BRIDGES Control Tower &lt;updates@bridges.io&gt;</span>
                      </div>
                      <div class="cs-email-header-row">
                        <span class="cs-email-label">To:</span>
                        <span>${this.recipient || shipment.customerEmail || 'orders@customer.com'}</span>
                      </div>
                      <div class="cs-email-header-row">
                        <span class="cs-email-label">Subject:</span>
                        <strong>${this.subject || 'BRIDGES Shipment Status'}</strong>
                      </div>
                    </div>

                    <!-- EMAIL BRANDED BODY -->
                    <div class="cs-email-canvas">
                      <div class="cs-email-brand-bar">
                        <div class="cs-email-brand-logo">BRIDGES</div>
                        <span class="cs-email-brand-tag">Shipment Exception Control Tower</span>
                      </div>

                      <div class="cs-email-tracking-card">
                        <div class="cs-email-track-num">
                          <span>Tracking Reference:</span>
                          <strong>${shipment.id}</strong>
                        </div>
                        <div class="cs-email-track-meta">
                          <span>Customer Ref: ${shipment.customerReference || 'N/A'}</span>
                          <span>Order: ${shipment.orderId || 'N/A'}</span>
                        </div>
                      </div>

                      <div class="cs-email-eta-box">
                        <span class="cs-email-eta-label">LATEST APPROVED ESTIMATED ARRIVAL:</span>
                        <div class="cs-email-eta-time">${shipment.approvedETA || shipment.eta || 'Pending Operational Confirmation'}</div>
                        <span class="cs-email-eta-sub">Destination: ${shipment.destination || 'Delivery Terminal'}</span>
                      </div>

                      <div class="cs-email-text-content">
                        ${(this.body || 'No message content drafted.').replace(/\n/g, '<br>')}
                      </div>

                      <div class="cs-email-footer">
                        <p>This is an automated status update from the BRIDGES Shipment Exception Control Tower.</p>
                        <p>For urgent questions, please reference Tracking ID <strong>${shipment.id}</strong>.</p>
                      </div>
                    </div>
                  </div>
                ` : `
                  <!-- SMS PHONE MOCKUP -->
                  <div class="cs-phone-mockup">
                    <div class="cs-phone-speaker"></div>
                    <div class="cs-phone-screen">
                      <div class="cs-sms-header">
                        <div class="cs-sms-avatar">B</div>
                        <div class="cs-sms-contact">
                          <div class="cs-sms-name">BRIDGES Alert</div>
                          <div class="cs-sms-number">${this.recipient || shipment.customerPhone || '+1 (555) 019-2834'}</div>
                        </div>
                      </div>

                      <div class="cs-sms-thread">
                        <div class="cs-sms-date">Today &bull; Verified SMS Gateway</div>
                        <div class="cs-sms-bubble">
                          ${(this.body || 'BRIDGES Alert: Your shipment is in transit.').replace(/\n/g, '<br>')}
                          <div class="cs-sms-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>
                    <div class="cs-phone-home-bar"></div>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectTemplate(tplName) {
    this.selectedTemplate = tplName;
    this.loadTemplate(tplName, true);
  },

  selectChannel(channel) {
    this.selectedChannel = channel;
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(this.selectedShipmentId) || {};
    if (channel === 'Email') {
      this.recipient = shipment.customerEmail || 'orders@customer.com';
    } else {
      this.recipient = shipment.customerPhone || '+1 (555) 019-2834';
    }
    this.loadTemplate(this.selectedTemplate, true);
  },

  onShipmentChange(shipmentId) {
    this.selectedShipmentId = shipmentId;
    this.editingCommId = null;
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(shipmentId) || {};
    if (this.selectedChannel === 'Email') {
      this.recipient = shipment.customerEmail || 'orders@customer.com';
    } else {
      this.recipient = shipment.customerPhone || '+1 (555) 019-2834';
    }
    this.loadTemplate(this.selectedTemplate, true);
  },

  onRecipientChange(val) {
    this.recipient = val;
    this.updatePreview();
  },

  onSubjectChange(val) {
    this.subject = val;
    this.updatePreview();
  },

  onBodyChange(val) {
    this.body = val;
    this.updatePreview();
  },

  updatePreview() {
    // Rerender to show live update without losing focus
    const bodyInput = document.getElementById('cs-body-input');
    const subjInput = document.getElementById('cs-subject-input');
    const recipInput = document.getElementById('cs-recipient-input');

    if (bodyInput) this.body = bodyInput.value;
    if (subjInput) this.subject = subjInput.value;
    if (recipInput) this.recipient = recipInput.value;

    // Fast update preview element
    const previewText = document.querySelector('.cs-email-text-content');
    if (previewText) previewText.innerHTML = this.body.replace(/\n/g, '<br>');
    const smsBubble = document.querySelector('.cs-sms-bubble');
    if (smsBubble) {
      smsBubble.innerHTML = `${this.body.replace(/\n/g, '<br>')}<div class="cs-sms-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
    }
    const counter = document.querySelector('.cs-char-counter');
    if (counter) {
      counter.textContent = `${this.body.length} / 160 chars`;
      counter.classList.toggle('counter-warning', this.body.length > 160);
    }
  },

  loadTemplate(tplName, doRerender = true) {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(this.selectedShipmentId) || {};
    const approvedEta = shipment.approvedETA || shipment.eta || 'Pending Operational Confirmation';
    const customer = shipment.customerName || 'Valued Customer';
    const consignee = shipment.consigneeName || 'Destination Terminal';
    const ref = shipment.customerReference || shipment.orderId || shipment.id;
    const safeSummary = shipment.customerSafeExceptionSummary || 'operational transit adjustments under active coordination';

    if (this.selectedChannel === 'Email') {
      if (!this.recipient) this.recipient = shipment.customerEmail || 'orders@customer.com';

      switch (tplName) {
        case 'ETA Updated':
          this.subject = `BRIDGES Delivery Schedule Update — Shipment ${shipment.id} (Ref: ${ref})`;
          this.body = `Dear ${customer} Team,\n\nPlease be advised that our Logistics Control Tower has confirmed an approved schedule adjustment for Shipment ${shipment.id} (Customer Ref: ${ref}).\n\nLatest Approved Delivery Window: ${approvedEta}\nConsignee Destination: ${consignee}\n\nCurrent Status Note:\n${safeSummary}.\n\nOur operations team is actively monitoring progress through our milestone tracking gateway. We will alert you immediately if any additional updates occur.\n\nBest regards,\nCustomer Care Operations\nBRIDGES Control Tower`;
          break;

        case 'Delivery May Be Delayed':
          this.subject = `Advisory: Potential Delivery Window Adjustment — Shipment ${shipment.id}`;
          this.body = `Dear ${customer} Logistics Team,\n\nWe are proactively contacting you regarding Shipment ${shipment.id} (Ref: ${ref}).\n\nOur dispatch monitoring has identified route conditions that may impact the delivery schedule. Our current latest approved ETA remains ${approvedEta}.\n\nOperational Status:\n${safeSummary}.\n\nOur transport planners are managing the route to mitigate schedule impact. Should an updated ETA be officially authorized by operations, we will communicate the confirmed time promptly.\n\nThank you for your partnership,\nBRIDGES Customer Support Team`;
          break;

        case 'Shipment Under Resolution':
          this.subject = `Operational Notice: Active Resolution in Progress — Shipment ${shipment.id}`;
          this.body = `Dear ${customer} Team,\n\nThis message confirms that our Central Control Tower is actively resolving an operational transit event for Shipment ${shipment.id}.\n\nApproved Commitment Window: ${approvedEta}\nConsignee: ${consignee}\n\nResolution Overview:\n${safeSummary}.\n\nCorrective procedures are underway with our logistics operations to maintain chain of custody and expedite delivery. We will issue a confirmed status update upon milestone completion.\n\nSincerely,\nCustomer Care Specialist\nBRIDGES Control Tower`;
          break;

        case 'Shipment Resolved':
          this.subject = `Resolution Confirmed: Shipment ${shipment.id} Back on Schedule`;
          this.body = `Dear ${customer} Team,\n\nWe are pleased to inform you that operational resolution has been completed for Shipment ${shipment.id} (Customer Ref: ${ref}).\n\nThe shipment has resumed active transit toward ${consignee}.\n\nConfirmed Approved ETA: ${approvedEta}\nStatus: Transit Proceeding Normally\n\nThank you for your patience during this resolution.\n\nBest regards,\nBRIDGES Logistics Operations`;
          break;

        case 'Status Confirmation':
        default:
          this.subject = `BRIDGES Shipment Status Confirmation — ${shipment.id}`;
          this.body = `Dear ${customer} Team,\n\nThis is a scheduled confirmation regarding Shipment ${shipment.id} (Order Ref: ${shipment.orderId || 'N/A'}, Customer Ref: ${ref}).\n\nLatest Approved ETA: ${approvedEta}\nDestination: ${consignee}\nCurrent Milestone Status: In Active Transit\n\nEverything is proceeding in accordance with approved logistics parameters.\n\nWarm regards,\nCustomer Service Team\nBRIDGES Control Tower`;
          break;
      }
    } else {
      // SMS Channel (Concise & customer safe)
      if (!this.recipient) this.recipient = shipment.customerPhone || '+1 (555) 019-2834';
      this.subject = '';

      switch (tplName) {
        case 'ETA Updated':
          this.body = `BRIDGES Alert: Approved ETA for shipment ${shipment.id} is confirmed for ${approvedEta}. Ref: ${ref}. Track at bridges.io.`;
          break;

        case 'Delivery May Be Delayed':
          this.body = `BRIDGES Notice: Shipment ${shipment.id} is experiencing transit delays. Current approved ETA: ${approvedEta}. Monitoring in progress.`;
          break;

        case 'Shipment Under Resolution':
          this.body = `BRIDGES Update: Operational resolution in progress for shipment ${shipment.id}. Latest approved arrival: ${approvedEta}.`;
          break;

        case 'Shipment Resolved':
          this.body = `BRIDGES Update: Shipment ${shipment.id} has resumed active transit. Approved ETA remains ${approvedEta}.`;
          break;

        case 'Status Confirmation':
        default:
          this.body = `BRIDGES Confirmation: Shipment ${shipment.id} is in transit to ${consignee}. Approved ETA: ${approvedEta}.`;
          break;
      }
    }

    if (doRerender) {
      App.renderCurrentView();
    }
  },

  saveDraft() {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(this.selectedShipmentId) || {};

    if (!this.recipient.trim()) {
      UI.showToast('Please specify a customer recipient.', 'error');
      return;
    }

    const commData = {
      id: this.editingCommId || undefined,
      shipmentId: shipment.id,
      customerName: shipment.customerName || 'Customer',
      template: this.selectedTemplate,
      channel: this.selectedChannel,
      recipient: this.recipient,
      subject: this.subject,
      body: this.body,
      status: 'Draft',
      createdBy: 'Clara Hughes'
    };

    const saved = store.saveCommunication(commData);
    this.editingCommId = saved.id;
    UI.showToast(`Saved draft communication ${saved.id} for shipment ${shipment.id}.`, 'success');
    App.renderCurrentView();
  },

  requestReview() {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(this.selectedShipmentId) || {};

    if (!this.recipient.trim() || !this.body.trim()) {
      UI.showToast('Please enter both recipient and message body before requesting review.', 'error');
      return;
    }

    const commData = {
      id: this.editingCommId || undefined,
      shipmentId: shipment.id,
      customerName: shipment.customerName || 'Customer',
      template: this.selectedTemplate,
      channel: this.selectedChannel,
      recipient: this.recipient,
      subject: this.subject,
      body: this.body,
      status: 'Awaiting Review',
      createdBy: 'Clara Hughes'
    };

    const saved = store.saveCommunication(commData);
    this.editingCommId = saved.id;
    UI.showToast(`Communication ${saved.id} submitted for supervisor review.`, 'info');
    App.renderCurrentView();
  },

  sendSimulatedMessage() {
    const store = window.BRIDGES_STORE;
    const shipment = store.getShipment(this.selectedShipmentId) || {};

    if (!this.recipient.trim()) {
      UI.showToast('Please specify a customer recipient.', 'error');
      return;
    }
    if (!this.body.trim()) {
      UI.showToast('Message body cannot be empty.', 'error');
      return;
    }

    UI.confirm({
      title: 'Send Simulated Customer Notification',
      message: `Dispatch simulated ${this.selectedChannel} message to <strong>${this.recipient}</strong> for Shipment <strong>${shipment.id}</strong>?<br><br><span class="text-xs text-muted">This updates the shared customer communication history, marks outreach as 'Up to Date', and appends a customer communication milestone.</span>`,
      confirmText: 'Dispatch Notification',
      confirmType: 'primary',
      onConfirm: () => {
        // Save first
        const commData = {
          id: this.editingCommId || undefined,
          shipmentId: shipment.id,
          customerName: shipment.customerName || 'Customer',
          template: this.selectedTemplate,
          channel: this.selectedChannel,
          recipient: this.recipient,
          subject: this.subject,
          body: this.body,
          status: 'Draft',
          createdBy: 'Clara Hughes'
        };
        const saved = store.saveCommunication(commData);

        // Send simulated
        const sent = store.sendSimulatedCommunication(saved.id);
        if (sent) {
          UI.showToast(`Simulated ${sent.channel} notification sent to ${sent.recipient} (${sent.id}).`, 'success');
          // Reset workspace state
          this.editingCommId = null;
          this.recipient = '';
          this.subject = '';
          this.body = '';
          // Return to queue or history
          App.navigateTo('cs_history');
        } else {
          UI.showToast('Failed to dispatch simulated message.', 'error');
        }
      }
    });
  }
};
