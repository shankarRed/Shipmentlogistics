/**
 * BRIDGES Control Tower - Inbound Message Monitoring & Integration Error Handling View
 * Real-time monitoring of multi-channel logistics data pipelines (TMS, ERP, Carrier EDI, GPS, IoT),
 * payload inspection, failure diagnostics, manual retries, duplicate suppression, and escalation.
 */

const AnalystInboundView = {
  activeTab: 'messages', // 'messages' or 'errors'
  sourceFilter: 'All',
  statusFilter: 'All',
  searchQuery: '',

  render() {
    const allMessages = window.BRIDGES_STORE ? window.BRIDGES_STORE.getInboundMessages() : [];
    
    // Split messages and errors
    const errorMessages = allMessages.filter(m => m.status.startsWith('Error') || m.status === 'Rejected');
    const processedMessages = allMessages.filter(m => m.status === 'Processed');
    const duplicateMessages = allMessages.filter(m => m.status === 'Duplicate Ignored');

    const listToDisplay = this.activeTab === 'errors' ? errorMessages : allMessages;

    // Filter
    const filtered = listToDisplay.filter(m => {
      if (this.sourceFilter !== 'All') {
        if (!m.source.toLowerCase().includes(this.sourceFilter.toLowerCase())) return false;
      }
      if (this.statusFilter !== 'All') {
        if (m.status !== this.statusFilter) return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = m.id.toLowerCase().includes(q);
        const matchShip = m.shipmentId && m.shipmentId.toLowerCase().includes(q);
        const matchType = m.messageType && m.messageType.toLowerCase().includes(q);
        const matchSource = m.source && m.source.toLowerCase().includes(q);
        const matchDetails = m.details && m.details.toLowerCase().includes(q);
        if (!matchId && !matchShip && !matchType && !matchSource && !matchDetails) return false;
      }
      return true;
    });

    return `
      <div class="view-container animate-fade-in">
        <!-- Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Inbound Message &amp; Integration Monitor</h2>
              <span class="role-indicator-pill role-analyst">Data Gateway</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Live telemetry &amp; EDI ingestion stream from TMS, ERP, carrier portals, GPS trackers, and cold-chain IoT loggers.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystInboundView.resetFilters()">
              ${Icons.refresh(13)}
              <span>Reset</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="AnalystInboundView.simulateInboundPing()">
              ${Icons.plus ? Icons.plus(13) : ''}
              <span>Simulate Inbound Transmission</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="analyst-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px;">
          <div class="analyst-kpi-card kpi-active" onclick="AnalystInboundView.switchTab('messages')">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Total Inbound Messages</span>
              <span class="analyst-kpi-badge">${allMessages.length} Total</span>
            </div>
            <div class="analyst-kpi-value">${allMessages.length}</div>
            <div class="analyst-kpi-sub">Last 24h Ingestion Stream</div>
          </div>
          <div class="analyst-kpi-card kpi-resolved">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Processed Successfully</span>
              <span class="analyst-kpi-badge" style="background: #EAF7EE; color: #1E8E3E;">98.4% Health</span>
            </div>
            <div class="analyst-kpi-value" style="color: #1E8E3E;">${processedMessages.length}</div>
            <div class="analyst-kpi-sub">Committed to Store &amp; Map</div>
          </div>
          <div class="analyst-kpi-card kpi-critical" onclick="AnalystInboundView.switchTab('errors')">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Integration Errors</span>
              <span class="analyst-kpi-badge" style="background: #FEE2E2; color: #DC2626;">${errorMessages.length} Action Needed</span>
            </div>
            <div class="analyst-kpi-value" style="color: #DC2626;">${errorMessages.length}</div>
            <div class="analyst-kpi-sub">Schema, Tariff, Syntax Failures</div>
          </div>
          <div class="analyst-kpi-card kpi-sla">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Duplicates Suppressed</span>
              <span class="analyst-kpi-badge">${duplicateMessages.length} Filtered</span>
            </div>
            <div class="analyst-kpi-value">${duplicateMessages.length}</div>
            <div class="analyst-kpi-sub">De-duplicated Telemetry</div>
          </div>
        </div>

        <!-- Operation Tabs (All Inbound Messages vs Integration Error Queue) -->
        <div class="operation-tabs-header" style="margin-bottom: 14px;">
          <div class="operation-nav-tabs">
            <button 
              class="operation-tab-btn ${this.activeTab === 'messages' ? 'active' : ''}" 
              onclick="AnalystInboundView.switchTab('messages')"
            >
              All Inbound Pipeline Messages (${allMessages.length})
            </button>
            <button 
              class="operation-tab-btn ${this.activeTab === 'errors' ? 'active' : ''}" 
              onclick="AnalystInboundView.switchTab('errors')"
              style="${errorMessages.length > 0 ? 'color: #DC2626;' : ''}"
            >
              ⚠ Integration Error Queue (${errorMessages.length})
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="analyst-filter-bar" style="margin-bottom: 16px;">
          <div class="filter-input-wrap">
            <span class="search-icon">${Icons.search(13)}</span>
            <input 
              type="text" 
              placeholder="Search by Message ID, Shipment ID, Protocol, Payload snippet..." 
              value="${this.searchQuery}" 
              oninput="AnalystInboundView.handleSearch(this.value)"
            >
          </div>

          <select class="filter-select" onchange="AnalystInboundView.handleSourceFilter(this.value)">
            <option value="All" ${this.sourceFilter === 'All' ? 'selected' : ''}>All Sources</option>
            <option value="TMS" ${this.sourceFilter === 'TMS' ? 'selected' : ''}>TMS (SAP TM)</option>
            <option value="ERP" ${this.sourceFilter === 'ERP' ? 'selected' : ''}>ERP (Oracle / NetSuite)</option>
            <option value="IoT" ${this.sourceFilter === 'IoT' ? 'selected' : ''}>IoT Reefer Sensors</option>
            <option value="Carrier" ${this.sourceFilter === 'Carrier' ? 'selected' : ''}>Carrier EDI / API</option>
            <option value="GPS" ${this.sourceFilter === 'GPS' ? 'selected' : ''}>GPS MQTT Telematics</option>
            <option value="Customs" ${this.sourceFilter === 'Customs' ? 'selected' : ''}>Customs Agency API</option>
          </select>

          ${this.activeTab === 'messages' ? `
            <select class="filter-select" onchange="AnalystInboundView.handleStatusFilter(this.value)">
              <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Processed" ${this.statusFilter === 'Processed' ? 'selected' : ''}>Processed</option>
              <option value="Error - Schema Validation" ${this.statusFilter === 'Error - Schema Validation' ? 'selected' : ''}>Schema Errors</option>
              <option value="Error - Unknown Carrier" ${this.statusFilter === 'Error - Unknown Carrier' ? 'selected' : ''}>Unknown Carrier</option>
              <option value="Error - Tariff Code Invalid" ${this.statusFilter === 'Error - Tariff Code Invalid' ? 'selected' : ''}>Tariff Code Error</option>
              <option value="Duplicate Ignored" ${this.statusFilter === 'Duplicate Ignored' ? 'selected' : ''}>Duplicate Ignored</option>
              <option value="Rejected" ${this.statusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          ` : ''}
        </div>

        <!-- Messages / Errors Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Message ID</th>
                  <th>Timestamp</th>
                  <th>Source System</th>
                  <th>Protocol / Standard</th>
                  <th>Message Type</th>
                  <th>Related Shipment</th>
                  <th>Status</th>
                  <th>Operational Diagnostic</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(m => {
                  const isError = m.status.startsWith('Error');
                  const isRejected = m.status === 'Rejected';
                  const isDuplicate = m.status === 'Duplicate Ignored';

                  return `
                    <tr style="${isError ? 'background: #FFF5F5;' : ''}">
                      <td>
                        <strong style="color: var(--color-royal-navy);">${m.id}</strong>
                        ${m.escalated ? `
                          <span class="badge badge-danger" style="font-size: 9px; margin-left: 4px;">Ticket: ${m.escalationTicket}</span>
                        ` : ''}
                      </td>
                      <td>
                        <span style="font-size: 11px; color: var(--color-charcoal);">${m.timestamp ? m.timestamp.slice(11, 19) : '--'}</span>
                        <div style="font-size: 10px; color: var(--color-muted-sage);">${m.timestamp ? m.timestamp.slice(0, 10) : ''}</div>
                      </td>
                      <td>
                        <span style="font-weight: 700; color: var(--color-midnight); font-size: 12px;">${m.source}</span>
                      </td>
                      <td>
                        <span class="badge" style="background: #EEF2F6; color: var(--color-midnight); font-size: 10.5px;">${m.protocol}</span>
                      </td>
                      <td>
                        <span style="font-size: 12px; font-weight: 600;">${m.messageType}</span>
                      </td>
                      <td>
                        ${m.shipmentId ? `
                          <a href="javascript:void(0)" onclick="AnalystShipmentsView.openDetailModal('${m.shipmentId}')" style="font-weight: 700; color: var(--color-royal-navy);">
                            ${m.shipmentId} ↗
                          </a>
                        ` : '<span style="color: #999;">--</span>'}
                      </td>
                      <td>
                        ${isError ? `
                          <span class="badge badge-danger" style="font-size: 10.5px; font-weight: 700;">⚠ ${m.status}</span>
                        ` : isRejected ? `
                          <span class="badge" style="background: #F3F4F6; color: #4B5563; font-size: 10.5px; font-weight: 700;">✕ Rejected</span>
                        ` : isDuplicate ? `
                          <span class="badge" style="background: #FEF3C7; color: #B45309; font-size: 10.5px; font-weight: 700;">Duplicate Ignored</span>
                        ` : `
                          <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-size: 10.5px; font-weight: 700;">✓ Processed</span>
                        `}
                      </td>
                      <td>
                        <div style="font-size: 11px; color: #393A50; max-width: 280px; white-space: normal; line-height: 1.3;">
                          ${m.details}
                        </div>
                        ${(m.notes || []).length > 0 ? `
                          <div style="font-size: 10px; color: #1967D2; margin-top: 3px;">
                            💬 Note: ${m.notes[m.notes.length - 1]}
                          </div>
                        ` : ''}
                      </td>
                      <td style="text-align: right; white-space: nowrap;">
                        <div style="display: inline-flex; gap: 4px;">
                          <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 10.5px;" onclick="AnalystInboundView.viewPayloadModal('${m.id}')" title="Inspect raw JSON/EDI transmission payload">
                            Payload
                          </button>

                          ${isError ? `
                            <button class="btn btn-primary btn-sm" style="padding: 2px 7px; font-size: 10.5px; background: #1E8E3E; border-color: #1E8E3E;" onclick="AnalystInboundView.retryMessage('${m.id}')" title="Reprocess & validate message">
                              Retry
                            </button>
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 10.5px; color: #DC2626;" onclick="AnalystInboundView.openErrorActionModal('${m.id}')" title="Reject, note, or escalate">
                              Handle
                            </button>
                          ` : ''}

                          ${!isError && !isDuplicate ? `
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 10.5px;" onclick="AnalystInboundView.openNoteModal('${m.id}')" title="Add investigation note">
                              Note
                            </button>
                          ` : ''}
                        </div>
                      </td>
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

  switchTab(tab) {
    this.activeTab = tab;
    this.statusFilter = 'All';
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  },

  handleSourceFilter(val) {
    this.sourceFilter = val;
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  },

  handleStatusFilter(val) {
    this.statusFilter = val;
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.sourceFilter = 'All';
    this.statusFilter = 'All';
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  },

  viewPayloadModal(messageId) {
    const msg = (window.BRIDGES_STORE ? window.BRIDGES_STORE.getInboundMessages() : []).find(m => m.id === messageId);
    if (!msg) return;

    let prettyPayload = msg.payload;
    try {
      const obj = JSON.parse(msg.payload);
      prettyPayload = JSON.stringify(obj, null, 2);
    } catch (e) {}

    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">
          <div>
            <strong>${msg.id}</strong> — Source: <strong>${msg.source}</strong> • Protocol: <strong>${msg.protocol}</strong>
          </div>
          <span class="badge" style="background: #EEF2F6;">${msg.status}</span>
        </div>

        <div style="font-size: 11px; color: #64748B;">
          Shipment Reference: <strong>${msg.shipmentId || 'None'}</strong> • Ingestion Timestamp: <strong>${msg.timestamp}</strong>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: #393A50; display: block; margin-bottom: 4px;">Raw Transmission Envelope / Payload:</label>
          <pre style="background: #070724; color: #E5EBEE; padding: 12px; border-radius: 6px; font-size: 11.5px; font-family: monospace; max-height: 280px; overflow-y: auto; white-space: pre-wrap; margin: 0;">${prettyPayload}</pre>
        </div>

        ${(msg.notes || []).length > 0 ? `
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #18217E; margin-bottom: 4px;">Investigation Notes:</div>
            ${msg.notes.map(n => `<div style="font-size: 11px; color: #393A50; margin-bottom: 2px;">• ${n}</div>`).join('')}
          </div>
        ` : ''}

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          ${msg.status.startsWith('Error') ? `
            <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); AnalystInboundView.retryMessage('${msg.id}')">Retry &amp; Reprocess</button>
          ` : ''}
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Raw Payload Inspector — ${msg.id}`, modalHtml);
  },

  retryMessage(messageId) {
    try {
      window.BRIDGES_STORE.retryInboundMessage(messageId);
      UI.showToast(`Message ${messageId} successfully retried and ingested into active registry.`, 'success');
      if (window.App && App.currentView === 'analyst_inbound') {
        App.renderCurrentView();
      }
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openErrorActionModal(messageId) {
    const msg = (window.BRIDGES_STORE ? window.BRIDGES_STORE.getInboundMessages() : []).find(m => m.id === messageId);
    if (!msg) return;

    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="background: #FFF5F5; border: 1px solid #FCA5A5; color: #DC2626; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
          <strong>Failure Diagnostic:</strong> ${msg.details}
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 700;">Add Investigation Diagnostic Note</label>
          <input type="text" id="action-investigation-note" class="form-control" placeholder="e.g. Contacted carrier partner to verify driver badge and manifest..." value="Verified payload schema with carrier integration lead.">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-secondary btn-sm" onclick="AnalystInboundView.rejectMessage('${msg.id}')" style="color: #DC2626; border-color: #FCA5A5;">
            Reject Message
          </button>
          <button class="btn btn-secondary btn-sm" onclick="AnalystInboundView.ignoreMessage('${msg.id}')" style="color: #B45309; border-color: #FCD34D;">
            Ignore as Duplicate
          </button>
        </div>

        <div style="padding-top: 10px; border-top: 1px solid #E2E8F0;">
          <button class="btn btn-danger btn-sm" style="width: 100%; font-weight: 700;" onclick="AnalystInboundView.escalateMessage('${msg.id}')">
            ${Icons.alert ? Icons.alert(13) : '⚠'} Escalate Repeated Failure to IT / Carrier Operations
          </button>
        </div>
      </div>
    `;

    UI.openModal('generic-app-modal', `Resolve Integration Error — ${msg.id}`, modalHtml);
  },

  rejectMessage(messageId) {
    const note = document.getElementById('action-investigation-note')?.value || "Rejected by Analyst";
    try {
      window.BRIDGES_STORE.rejectInboundMessage(messageId, note);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Message ${messageId} marked as Rejected.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  ignoreMessage(messageId) {
    try {
      window.BRIDGES_STORE.ignoreInboundMessage(messageId);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Message ${messageId} marked as Duplicate Ignored.`, 'info');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  escalateMessage(messageId) {
    const reason = document.getElementById('action-investigation-note')?.value || "Repeated EDI syntax and transmission failures";
    try {
      const res = window.BRIDGES_STORE.escalateInboundMessage(messageId, reason);
      UI.closeModal('generic-app-modal');
      UI.showToast(`Escalated to IT Operations under incident ticket ${res.ticketId}.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openNoteModal(messageId) {
    const noteText = prompt("Enter investigation note for message " + messageId + ":");
    if (!noteText || !noteText.trim()) return;

    try {
      window.BRIDGES_STORE.addInboundMessageNote(messageId, noteText);
      UI.showToast("Note attached to message " + messageId, "success");
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  },

  simulateInboundPing() {
    const newMsg = {
      id: `MSG-IN-${Math.floor(510 + Math.random() * 480)}`,
      timestamp: new Date().toISOString(),
      source: "Carrier Gateway (SkyLink Air)",
      protocol: "REST Webhook",
      messageType: "Flight Departure Milestone",
      shipmentId: "BRG-2848",
      status: "Processed",
      payload: JSON.stringify({
        flightNo: "SKY-402",
        aircraft: "Boeing 767-300F",
        originApt: "DFW",
        destApt: "ORD",
        departureTimestamp: new Date().toISOString(),
        cargoWeightKg: 840.5
      }, null, 2),
      details: "Real-time SkyLink flight departure telemetry received; ETA synced.",
      notes: []
    };

    if (!window.BRIDGES_STORE.data.inboundMessages) {
      window.BRIDGES_STORE.data.inboundMessages = [];
    }
    window.BRIDGES_STORE.data.inboundMessages.unshift(newMsg);
    window.BRIDGES_STORE.save();

    UI.showToast(`Inbound message ${newMsg.id} received from SkyLink Air Webhook!`, 'success');
    if (window.App && App.currentView === 'analyst_inbound') {
      App.renderCurrentView();
    }
  }
};

window.AnalystInboundView = AnalystInboundView;
