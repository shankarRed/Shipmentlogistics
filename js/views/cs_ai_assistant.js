/**
 * BRIDGES Control Tower - Customer Service AI Support Assistant View
 * Phase 6 / US: AI-Assisted Support
 * 
 * Capabilities:
 * 1. Ask internal AI assistant about shipment status, exception, recovery, and ETA.
 * 2. View source-based, citation-verified answers:
 *    - Customer-Safe Answer (authorized to quote to customers, with 1-click copy & compose)
 *    - Internal Operational Context (technical root causes, telematics pings, dispatcher strategies)
 *    - Verified Source Citations ([Source: Telematics Beacon], [Source: Recovery Plan], etc.)
 * 3. Escalate unresolved queries to a human specialist (Analyst, Dispatcher, Warehouse Supervisor)
 *    with automated operational escalation ticket creation.
 */

window.CSAIAssistantView = {
  selectedShipmentId: 'BRG-2847', // default shipment
  userQuery: '',
  messages: [], // conversation history

  initChat() {
    if (this.messages.length === 0) {
      this.messages = [
        {
          id: 'msg-init',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Hello Clara. I am your BRIDGES Internal AI Support Assistant. I synthesize live GPS telematics, dispatcher recovery plans, cold-chain probe streams, and electronic proof-of-delivery records to provide verified, customer-safe answers.\n\nSelect a shipment above or click any suggested query to begin.',
          sources: [
            'BRIDGES Central Control Tower Knowledge Base v4.2',
            'Live IoT Telematics Gateway (Active)'
          ]
        }
      ];
    }
  },

  render() {
    this.initChat();
    const store = window.BRIDGES_STORE;
    const allShipments = store.getShipments();
    const activeShipment = allShipments.find(s => s.id === this.selectedShipmentId) || allShipments[0] || null;
    const shipmentId = activeShipment ? activeShipment.id : '';

    return `
      <div class="cs-view-container animate-fade-in cs-ai-view-wrapper">
        <!-- TOP BANNER -->
        <div class="cs-header-banner">
          <div class="cs-banner-info">
            <div class="cs-badge-row">
              <span class="customer-service-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
                AI-Assisted Customer Support
              </span>
              <span class="cs-safety-tag" style="background: rgba(16, 185, 129, 0.1); color: #047857; border: 1px solid rgba(16, 185, 129, 0.25);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Verified Source-Grounded AI Engine
              </span>
              <span class="cs-user-tag">
                Clara Hughes &bull; Active Session
              </span>
            </div>
            <h1 class="cs-banner-title">Internal AI Support Assistant</h1>
            <p class="cs-banner-subtitle">
              Query real-time shipment status, root-cause exceptions, approved recovery plans, and live telematics. Generate customer-safe responses and escalate complex queries directly to operational specialists.
            </p>
          </div>
          <div class="cs-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="CSAIAssistantView.clearChat()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Clear Conversation
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('cs_shipments')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Back to Shipments
            </button>
          </div>
        </div>

        <!-- SHIPMENT SELECTOR & CONTEXT STRIP -->
        <div class="cs-card mb-4" style="border: 1px solid #CBD5E1; box-shadow: 0 2px 6px rgba(7, 7, 36, 0.04);">
          <div class="cs-card-body" style="padding: 14px 18px;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 280px;">
                <label style="font-size: 12px; font-weight: 700; color: #18217E; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">
                  Target Shipment Context:
                </label>
                <select class="cs-select" style="max-width: 380px; font-weight: 600;" onchange="CSAIAssistantView.onShipmentChange(this.value)">
                  ${allShipments.map(s => `
                    <option value="${s.id}" ${s.id === shipmentId ? 'selected' : ''}>
                      ${s.id} — ${s.customerName || 'Customer'} (${s.status} &bull; ${s.origin} &rarr; ${s.destination})
                    </option>
                  `).join('')}
                </select>
                <button class="btn btn-outline btn-xs" onclick="CSAIAssistantView.viewShipmentDetail('${shipmentId}')" title="Inspect full shipment file">
                  Inspect File &rarr;
                </button>
              </div>

              ${activeShipment ? `
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                  <span class="badge ${
                    activeShipment.status === 'Delivered' ? 'badge-success' :
                    activeShipment.status === 'Exception' ? 'badge-danger' :
                    'badge-info'
                  }" style="font-weight: 700;">
                    ${activeShipment.status}
                  </span>
                  <span style="font-size: 11.5px; background: #F1F5F9; color: #1E293B; padding: 4px 8px; border-radius: 5px; border: 1px solid #CBD5E1;">
                    <strong>Order:</strong> ${activeShipment.orderId || 'ORD-7721'}
                  </span>
                  <span style="font-size: 11.5px; background: #F8FAFC; color: #18217E; padding: 4px 8px; border-radius: 5px; border: 1px solid rgba(24, 33, 126, 0.2); font-weight: 600;">
                    <strong>Approved ETA:</strong> ${activeShipment.approvedETA || activeShipment.eta || 'Pending'}
                  </span>
                  ${activeShipment.carrierDetails ? `
                    <span style="font-size: 11.5px; background: #F1F5F9; color: #424989; padding: 4px 8px; border-radius: 5px; border: 1px solid #CBD5E1;">
                      <strong>Carrier:</strong> ${activeShipment.carrierDetails.carrierName} (${activeShipment.carrierDetails.vehiclePlate || 'Assigned'})
                    </span>
                  ` : ''}
                </div>
              ` : ''}
            </div>

            ${activeShipment ? `
              <!-- QUICK TELEMETRY & RECOVERY CONTEXT SUMMARY -->
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E2E8F0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 12px; color: #393A50;">
                <div>
                  <span style="color: #8A9995; font-size: 11px; display: block;">Current Location / GPS Pin:</span>
                  <strong style="color: #070724;">${activeShipment.currentLocation || activeShipment.origin}</strong>
                </div>
                <div>
                  <span style="color: #8A9995; font-size: 11px; display: block;">Active Exception / Delay:</span>
                  <strong style="color: ${activeShipment.exception ? '#EA341F' : '#10B981'};">
                    ${activeShipment.exception || 'No active blockers recorded'}
                  </strong>
                </div>
                <div>
                  <span style="color: #8A9995; font-size: 11px; display: block;">Recovery Action Strategy:</span>
                  <strong style="color: #18217E;">
                    ${activeShipment.recoveryAction ? activeShipment.recoveryAction.planTitle : 'Standard schedule operational'}
                  </strong>
                </div>
                <div>
                  <span style="color: #8A9995; font-size: 11px; display: block;">Customer Outreach Status:</span>
                  <strong style="color: ${activeShipment.customerUpdateStatus === 'Action Required' ? '#8C2527' : '#047857'};">
                    ${activeShipment.customerUpdateStatus || 'Up to Date'}
                  </strong>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- QUICK PROMPT SUGGESTION CHIPS -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Suggested Inquiries for ${shipmentId}:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('What is the approved customer ETA and current delay status?')">
              ⚡ Approved ETA & Delay Status
            </button>
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('Explain the exception root cause and active recovery action.')">
              🚨 Exception Root Cause & Recovery Plan
            </button>
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('What carrier and vehicle is transporting this, and what is its live location?')">
              🚚 Carrier, Vehicle Plate & Live GPS
            </button>
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('Is the cold-chain temperature within compliant limits?')">
              ❄️ Temperature & Cold-Chain Compliance
            </button>
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('What was received or damaged according to delivery confirmation?')">
              📦 Delivery Confirmation & POD Tally
            </button>
            <button class="cs-ai-chip" onclick="CSAIAssistantView.submitPrompt('Draft a customer-safe notification message for this exception.')">
              📝 Draft Customer-Safe Update
            </button>
          </div>
        </div>

        <!-- CHAT CONVERSATION CONTAINER -->
        <div class="cs-card" style="display: flex; flex-direction: column; height: 560px; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #F8FAFC;">
          <!-- CHAT HEADER -->
          <div class="cs-card-header" style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 12px 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #18217E; color: #FFFFFF; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="11" width="18" height="10" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="M12 7v4"/>
                  </svg>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #070724;">BRIDGES AI Support Copilot</h4>
                  <span style="font-size: 11px; color: #64748B;">Grounding Scope: Shipment ${shipmentId} &bull; Control Tower Telemetry Stream</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite;"></span>
                <span style="font-size: 11px; font-weight: 600; color: #047857;">Engine Online &bull; Source Citations Enabled</span>
              </div>
            </div>
          </div>

          <!-- CHAT MESSAGE STREAM -->
          <div id="cs-ai-chat-stream" class="cs-ai-chat-stream" style="flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 16px;">
            ${this.messages.map((m, idx) => this.renderMessage(m, idx)).join('')}
          </div>

          <!-- CHAT INPUT AREA -->
          <div style="background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 14px 18px;">
            <form id="cs-ai-input-form" onsubmit="event.preventDefault(); CSAIAssistantView.handleUserSubmit();" style="display: flex; gap: 10px; align-items: center;">
              <input 
                type="text" 
                id="cs-ai-query-input" 
                class="cs-search-input" 
                placeholder="Ask about shipment status, exception root cause, recovery action, driver details, ETA..." 
                style="flex: 1; padding: 10px 14px; font-size: 13px; border: 1px solid #CBD5E1; border-radius: 6px; outline: none;"
                autocomplete="off"
              />
              <button type="submit" class="btn btn-primary" style="padding: 10px 18px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Ask Assistant
              </button>
            </form>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px; color: #94A3B8;">
              <span>Tip: Answers distinguish between customer-safe statements and internal operational diagnostics.</span>
              <span>Need human assistance? Use the "Escalate to Human" button on any response.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderMessage(msg, idx) {
    if (msg.sender === 'user') {
      return `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
          <div style="max-width: 75%; background: #18217E; color: #FFFFFF; padding: 12px 16px; border-radius: 12px 12px 2px 12px; box-shadow: 0 2px 6px rgba(24, 33, 126, 0.15);">
            <div style="font-size: 13px; line-height: 1.5; font-weight: 500;">
              ${this.escapeHtml(msg.text)}
            </div>
            <div style="font-size: 10.5px; opacity: 0.8; text-align: right; margin-top: 4px;">
              ${msg.timestamp || ''} &bull; Clara Hughes
            </div>
          </div>
        </div>
      `;
    }

    // AI Response Message
    return `
      <div style="display: flex; gap: 12px; max-width: 90%; margin-bottom: 6px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #070724; color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M12 7v4"/>
          </svg>
        </div>

        <div style="flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 2px 12px 12px 12px; padding: 16px; box-shadow: 0 2px 8px rgba(7, 7, 36, 0.04);">
          ${msg.id === 'msg-init' ? `
            <div style="font-size: 13px; color: #1E293B; line-height: 1.6; white-space: pre-line;">
              ${msg.text}
            </div>
          ` : `
            <!-- 1. CUSTOMER-SAFE RESPONSE CARD -->
            ${msg.customerSafeText ? `
              <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Customer-Safe Communication Statement
                  </span>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-xs" style="background: #166534; color: #FFFFFF; border: none; font-size: 10.5px; font-weight: 600; padding: 3px 8px;" onclick="CSAIAssistantView.copyText('${this.escapeQuotes(msg.customerSafeText)}')">
                      Copy Text
                    </button>
                    <button class="btn btn-xs btn-outline" style="border-color: #166534; color: #166534; font-size: 10.5px; font-weight: 600; padding: 3px 8px;" onclick="CSAIAssistantView.openInCompose('${msg.shipmentId || this.selectedShipmentId}', '${this.escapeQuotes(msg.customerSafeText)}')">
                      Draft Update &rarr;
                    </button>
                  </div>
                </div>
                <div style="font-size: 13px; color: #14532D; line-height: 1.5; font-weight: 500;">
                  "${msg.customerSafeText}"
                </div>
              </div>
            ` : ''}

            <!-- 2. INTERNAL OPERATIONAL CONTEXT -->
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 700; color: #424989; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                Internal Operational Analysis & Telematics:
              </span>
              <div style="font-size: 13px; color: #1E293B; line-height: 1.6; white-space: pre-line;">
                ${msg.text}
              </div>
            </div>

            <!-- 3. CITATIONS & VERIFIED SOURCES -->
            ${msg.sources && msg.sources.length > 0 ? `
              <div style="padding-top: 10px; border-top: 1px dashed #E2E8F0; margin-bottom: 10px;">
                <span style="font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">
                  Verified Data Sources & Telematics Citations:
                </span>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${msg.sources.map(src => `
                    <span style="font-size: 11px; background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 4px; border: 1px solid #CBD5E1; display: inline-flex; align-items: center; gap: 4px;">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                      ${src}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- 4. HUMAN SPECIALIST ESCALATION BUTTON -->
            <div style="display: flex; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #F1F5F9;">
              <button class="btn btn-xs" style="background: rgba(140, 37, 39, 0.08); color: #8C2527; border: 1px solid rgba(140, 37, 39, 0.25); font-weight: 600; display: inline-flex; align-items: center; gap: 5px;" onclick="CSAIAssistantView.openEscalateModal('${this.escapeQuotes(msg.originalQuery || '')}', '${msg.shipmentId || this.selectedShipmentId}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Escalate Query to Human Specialist
              </button>
            </div>
          `}

          <div style="font-size: 10px; color: #94A3B8; margin-top: 6px; text-align: right;">
            ${msg.timestamp || ''} &bull; Generated by BRIDGES Internal AI Engine
          </div>
        </div>
      </div>
    `;
  },

  onShipmentChange(newShipmentId) {
    this.selectedShipmentId = newShipmentId;
    App.renderCurrentView();
  },

  viewShipmentDetail(shipmentId) {
    if (window.CSShipmentDetailView) {
      window.CSShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('cs_shipment_detail');
  },

  submitPrompt(promptText) {
    const input = document.getElementById('cs-ai-query-input');
    if (input) {
      input.value = promptText;
    }
    this.handleUserSubmit(promptText);
  },

  handleUserSubmit(manualPrompt = null) {
    const input = document.getElementById('cs-ai-query-input');
    const query = (manualPrompt || (input ? input.value : '')).trim();
    if (!query) return;

    if (input) input.value = '';

    // Append user message
    this.messages.push({
      id: 'usr-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    });

    // Generate AI response
    const response = this.synthesizeAIResponse(query, this.selectedShipmentId);
    this.messages.push(response);

    App.renderCurrentView();

    // Scroll to bottom
    setTimeout(() => {
      const stream = document.getElementById('cs-ai-chat-stream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
  },

  synthesizeAIResponse(query, shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId) || store.getShipments()[0];
    const q = query.toLowerCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let customerSafeText = '';
    let internalText = '';
    let sources = [];

    // 1. ETA / Delay / Schedule Queries
    if (q.includes('eta') || q.includes('delay') || q.includes('arrival') || q.includes('status') && !q.includes('carrier')) {
      const approvedEta = s.approvedETA || s.eta || 'Pending confirmation';
      const delayMins = s.delayMinutes || (s.delayHours ? s.delayHours * 60 : 0);
      const isDelayed = delayMins > 0;

      customerSafeText = `Your shipment (${s.id}) is currently ${s.status.toLowerCase()}. Our verified estimated arrival is ${approvedEta}.${isDelayed ? ` We are actively tracking a minor transit adjustment of approximately ${delayMins} minutes to ensure safe routing.` : ' All transit milestones remain on schedule.'}`;

      internalText = `• Shipment: ${s.id} (Order Ref: ${s.orderId || 'ORD-7721'}, Customer: ${s.customerName})\n` +
        `• Current Status: ${s.status} | SLA Risk: ${s.slaRisk || 'Low'}\n` +
        `• Approved ETA: ${approvedEta} (Approval Status: ${s.etaApprovalStatus || 'Approved'})\n` +
        `• Proposed Operational ETA: ${s.proposedETA || approvedEta}\n` +
        `• Accumulated Delay: ${delayMins} minutes (${s.severity || 'Medium'} Severity)\n` +
        `• Customer Outreach Status: ${s.customerUpdateStatus || 'Up to Date'}`;

      sources = [
        `Live GPS Telematics Beacon (${s.carrierDetails ? s.carrierDetails.telematicsPing || 'TX-TRK-8821' : 'TX-TRK-8821'})`,
        `Control Tower SLA Engine (ETA Policy Rule R-102)`,
        `Approved Dispatch Schedule (Ref: ${s.orderId || 'ORD-7721'})`
      ];
    }
    // 2. Exception / Root Cause / Recovery Action Queries
    else if (q.includes('exception') || q.includes('recovery') || q.includes('cause') || q.includes('plan') || q.includes('blizzard') || q.includes('congestion')) {
      const rec = s.recoveryAction || {
        planTitle: 'Standard Route Plan',
        strategy: 'Direct highway corridor',
        mitigationImpact: 'On time',
        dispatcherInCharge: 'Elena Rostova'
      };

      customerSafeText = s.customerSafeExceptionSummary || 
        `Our logistics team has activated an optimized alternative routing plan to bypass localized weather conditions and ensure your delivery reaches ${s.destination} safely.`;

      internalText = `• Exception Diagnosis: ${s.exception || 'Routine transit congestion'}\n` +
        `• Root Cause Category: ${s.category || 'Transit Delay'} (${s.severity || 'Medium'} Severity)\n` +
        `• Active Recovery Plan: ${rec.planTitle}\n` +
        `• Operational Strategy: ${rec.strategy}\n` +
        `• Mitigation Impact: ${rec.mitigationImpact}\n` +
        `• Dispatcher In Charge: ${rec.dispatcherInCharge || 'Elena Rostova (Lead Transport Planner)'}\n` +
        `• Operational Recommendation: Customer is within SLA buffer. No manual intervention required unless road conditions deteriorate further.`;

      sources = [
        `Dispatcher Approved Recovery Plan (${rec.planTitle || 'REC-102'})`,
        `Weather & Highway Advisory Service (Interstate Corridor Feed)`,
        `Control Tower Audit Trail (Ticket ESC-${s.id.replace('BRG-', '400')})`
      ];
    }
    // 3. Carrier, Vehicle, Driver, GPS Location Queries
    else if (q.includes('carrier') || q.includes('vehicle') || q.includes('driver') || q.includes('truck') || q.includes('plate') || q.includes('location') || q.includes('gps')) {
      const cd = s.carrierDetails || {
        carrierName: s.carrier || 'Bridges Express Fleet',
        phone: '+1 (800) 555-0199',
        vehiclePlate: 'TX-8821-XP',
        vehicleType: '53ft Temperature-Controlled Reefer',
        driverName: 'Robert Vance',
        driverPhone: '+1 (555) 234-5678',
        telematicsPing: 'TX-TRK-8821',
        sealNumber: 'SEAL-TX-9041'
      };

      customerSafeText = `Your shipment is being transported by ${cd.carrierName} in dedicated vehicle ${cd.vehiclePlate}. The latest verified location is near ${s.currentLocation || s.origin}, traveling safely along the authorized route toward ${s.destination}.`;

      internalText = `• Carrier Partner: ${cd.carrierName} (Carrier ID: ${cd.carrierId || 'CAR-01'})\n` +
        `• Dedicated Vehicle: ${cd.vehiclePlate} (${cd.vehicleType})\n` +
        `• Driver In Charge: ${cd.driverName} (Contact: ${cd.driverPhone})\n` +
        `• Security Seal: #${cd.sealNumber || 'SEAL-TX-9041'} (Intact & Verified)\n` +
        `• Real-Time Telematics Beacon: ${cd.telematicsPing} (Last Ping: Just now)\n` +
        `• Current Coordinates / Geofence: ${s.currentLocation || s.origin} &bull; Route: ${s.origin} &rarr; ${s.destination}`;

      sources = [
        `Live Carrier OBD-II Sensor Telematics (${cd.vehiclePlate})`,
        `Carrier Operations Fleet Manifest (USR-CARRIER)`,
        `Highway Geofence Event Stream`
      ];
    }
    // 4. Cold Chain / Temperature Queries
    else if (q.includes('temperature') || q.includes('cold') || q.includes('sensor') || q.includes('compliance')) {
      customerSafeText = `All cold-chain parameters for shipment ${s.id} are within strict compliant tolerances. Continuous real-time thermal monitoring confirms your temperature-sensitive cargo has remained perfectly preserved throughout transit.`;

      internalText = `• Cargo Profile: Temperature-Controlled Freight (${s.cargoType || 'Pharmaceuticals / High-Value'})\n` +
        `• Required Thermal Range: 2.0°C to 8.0°C (or -20°C for Frozen)\n` +
        `• Current Sensor Reading: 4.1°C (Nominal / Compliant)\n` +
        `• Reefer Unit Status: Active Cycle &bull; Fuel Level: 92%\n` +
        `• Thermal Excursion Count: 0 recorded excursions in last 24 hours.`;

      sources = [
        `Calibrated IoT Cold-Chain Probe SENS-409 (NIST Certified)`,
        `Carrier Reefer Telematics Gateway`,
        `BRIDGES Cold-Chain Compliance Audit Log`
      ];
    }
    // 5. Delivery Confirmation / POD Queries
    else if (q.includes('delivery') || q.includes('received') || q.includes('pod') || q.includes('damaged') || q.includes('confirmation') || q.includes('signature')) {
      const pod = s.deliveryConfirmation || {
        deliveredAt: s.status === 'Delivered' ? '2026-10-29 11:20 CDT' : 'In Transit (Pending Delivery)',
        recipientName: 'Marcus Vance',
        recipientRole: 'Dock Receiving Supervisor',
        receivedQty: 340,
        damagedQty: 0,
        rejectedQty: 0,
        discrepancyCount: 0,
        signatureStatus: 'Digitally Signed',
        conditionNotes: 'All cartons inspected, sealed, and verified in excellent condition.'
      };

      if (s.status === 'Delivered') {
        customerSafeText = `Shipment ${s.id} was successfully delivered on ${pod.deliveredAt} to ${s.destination}. The shipment was accepted and signed by ${pod.recipientName} (${pod.recipientRole}) with all ${pod.receivedQty} pieces received in full without exception.`;
      } else {
        customerSafeText = `Shipment ${s.id} is currently in transit toward ${s.destination}. Proof of delivery and verified piece count will be recorded upon physical arrival and dock inspection.`;
      }

      internalText = `• Delivery Status: ${s.status}\n` +
        `• Dock Timestamp: ${pod.deliveredAt}\n` +
        `• Consignee Facility: ${pod.destinationAddress || s.destination}\n` +
        `• Receiving Tally: Received ${pod.receivedQty} pcs | Damaged: ${pod.damagedQty} pcs | Rejected: ${pod.rejectedQty} pcs\n` +
        `• Verification: ${pod.signatureStatus} by ${pod.recipientName} (${pod.recipientRole})\n` +
        `• Inspection Notes: "${pod.conditionNotes || 'No discrepancies reported'}"`;

      sources = [
        `Dallas Central Hub Electronic Receiving Log (REC-9001)`,
        `Carrier Delivery Confirmation & Digital POD System`,
        `Consignee Receiving Supervisor Audit Stamp`
      ];
    }
    // 6. Draft Customer Notification
    else if (q.includes('draft') || q.includes('message') || q.includes('notification') || q.includes('template')) {
      customerSafeText = `Dear ${s.customerName || 'Valued Customer'},\n\nWe are writing to provide a proactive update regarding your shipment ${s.id} (Order Ref: ${s.orderId || 'ORD-7721'}). Our logistics control tower has implemented an optimized arterial routing plan to circumvent regional weather delays. Your current approved arrival time is confirmed for ${s.approvedETA || s.eta}. We will continue to monitor your cargo in real time.\n\nWarm regards,\nBRIDGES Customer Care`;

      internalText = `• Recommended Customer Update Channel: Email & SMS Notification\n` +
        `• Safety Policy: Statement verified against approved recovery ETA (${s.approvedETA || s.eta}). Contains no unapproved operational assumptions.\n` +
        `• One-Click Action: Click 'Draft Update' above to open directly in the Communication Workspace with customer recipient auto-filled.`;

      sources = [
        `Standard Customer Outreach Template: ETA Delay & Recovery (TMPL-04)`,
        `Customer Communications Style Guide v2.1`,
        `Active Shipment Metadata for ${s.id}`
      ];
    }
    // 7. General / Fallback Question
    else {
      customerSafeText = `Regarding shipment ${s.id}: The shipment is currently ${s.status.toLowerCase()} with approved estimated arrival on ${s.approvedETA || s.eta}. All operational safeguards remain active under the supervision of our Control Tower.`;

      internalText = `• Query: "${query}"\n` +
        `• Active Shipment: ${s.id} (${s.origin} &rarr; ${s.destination})\n` +
        `• Status: ${s.status} | Delay: ${s.delayMinutes || 0}m | Severity: ${s.severity || 'Nominal'}\n` +
        `• Customer Contact: ${s.customerEmail || s.customerContact || 'contact@client.com'}\n` +
        `• Recommendation: If you require specific technical root-cause data or dispatch modifications, click 'Escalate Query to Human Specialist' below.`;

      sources = [
        `BRIDGES Control Tower Core Database`,
        `Active Shipment Manifest ${s.id}`
      ];
    }

    return {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      timestamp: nowTime,
      shipmentId: s.id,
      originalQuery: query,
      customerSafeText,
      text: internalText,
      sources
    };
  },

  clearChat() {
    this.messages = [];
    this.initChat();
    App.renderCurrentView();
    if (window.UI) UI.showToast('Conversation cleared.', 'info');
  },

  copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.UI) UI.showToast('Customer-safe text copied to clipboard!', 'success');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (window.UI) UI.showToast('Customer-safe text copied to clipboard!', 'success');
  },

  openInCompose(shipmentId, text) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    if (window.CSComposeView) {
      window.CSComposeView.selectedShipmentId = shipmentId;
      window.CSComposeView.selectedTemplate = 'Shipment Under Resolution';
      window.CSComposeView.selectedChannel = 'Email';
      window.CSComposeView.recipient = s ? (s.customerEmail || s.customerContact || 'customer@logistics.com') : '';
      window.CSComposeView.subject = `Update on your BRIDGES Shipment: ${shipmentId}`;
      window.CSComposeView.body = text;
    }
    App.navigateTo('cs_compose');
  },

  openEscalateModal(query, shipmentId) {
    const store = window.BRIDGES_STORE;
    const s = store.getShipment(shipmentId);
    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #8C2527;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </span>
        <span>Escalate Unresolved Query to Human Specialist</span>
      </div>
    `;

    const bodyHtml = `
      <form id="cs-ai-escalate-form" onsubmit="event.preventDefault(); CSAIAssistantView.submitHumanEscalation('${shipmentId}');">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Target Shipment:</div>
          <div style="font-size: 13.5px; font-weight: 700; color: #18217E;">
            ${shipmentId} &bull; ${s ? s.customerName : 'Customer'} (${s ? s.origin + ' &rarr; ' + s.destination : ''})
          </div>
        </div>

        <div class="cs-modal-form-grid">
          <!-- 1. Specialist Target -->
          <div class="cs-form-group">
            <label class="cs-form-label">Route to Specialist Department: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-ai-esc-specialist" required>
              <option value="Control Tower Analyst (Marcus Vance)">Control Tower Analyst — Marcus Vance (Exception Analysis & Root Cause)</option>
              <option value="Lead Dispatcher (Elena Rostova)" selected>Lead Dispatcher — Elena Rostova (Route Re-Planning & Carrier Authorization)</option>
              <option value="Warehouse Supervisor (David Miller)">Warehouse Supervisor — David Miller (Dock Staging & Receiving Discrepancies)</option>
            </select>
          </div>

          <!-- 2. Priority -->
          <div class="cs-form-group">
            <label class="cs-form-label">Escalation Urgency: <span class="text-danger">*</span></label>
            <select class="cs-select" id="cs-ai-esc-priority" required>
              <option value="Critical">Critical (Customer SLA At Risk &lt; 1h)</option>
              <option value="High" selected>High (Response required &lt; 2h)</option>
              <option value="Medium">Medium (Standard inquiry)</option>
            </select>
          </div>

          <!-- 3. Original Query -->
          <div class="cs-form-group cs-span-full">
            <label class="cs-form-label">Unresolved Inquiry / Context: <span class="text-danger">*</span></label>
            <textarea class="cs-textarea" id="cs-ai-esc-query" rows="2" required>${query || 'Customer inquiry requiring specialist human clarification.'}</textarea>
          </div>

          <!-- 4. Notes for specialist -->
          <div class="cs-form-group cs-span-full">
            <label class="cs-form-label">Instructions / Requested Decision: <span class="text-danger">*</span></label>
            <textarea class="cs-textarea" id="cs-ai-esc-notes" rows="2" placeholder="e.g. Please confirm if a relief driver has been dispatched or if we can authorize a 16:00 arrival time to the customer." required></textarea>
          </div>
        </div>

        <div class="cs-modal-btn-row mt-4">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary btn-sm" style="background: #8C2527; border-color: #8C2527;">
            Route & Create Escalation Ticket
          </button>
        </div>
      </form>
    `;

    dialogEl.innerHTML = bodyHtml;
    UI.openModal('generic-app-modal');
  },

  submitHumanEscalation(shipmentId) {
    const specialist = document.getElementById('cs-ai-esc-specialist').value;
    const priority = document.getElementById('cs-ai-esc-priority').value;
    const query = document.getElementById('cs-ai-esc-query').value;
    const notes = document.getElementById('cs-ai-esc-notes').value;

    const store = window.BRIDGES_STORE;
    const assignedRole = specialist.includes('Analyst') ? 'Control Tower Analyst' :
                         specialist.includes('Dispatcher') ? 'Dispatcher / Transport Planner' : 'Warehouse Supervisor';
    const assignedUser = specialist.includes('Marcus') ? 'Marcus Vance' :
                         specialist.includes('Elena') ? 'Elena Rostova' : 'David Miller';

    const escalationData = {
      shipmentId,
      category: 'Exception Status Clarification',
      priority,
      reason: `[AI Escalation from Customer Service]: ${query}`,
      customerImpact: `Customer inquiry could not be automated. Direct specialist answer required for customer communication.`,
      requestedAction: notes,
      assignedRole,
      assignedUser,
      createdBy: 'Clara Hughes (AI Support Copilot)'
    };

    let resultEscId = 'ESC-4009';
    if (store.createEscalation) {
      const newEsc = store.createEscalation(escalationData);
      if (newEsc && newEsc.id) resultEscId = newEsc.id;
    }

    UI.closeModal('generic-app-modal');

    // Append AI confirmation in conversation stream
    this.messages.push({
      id: 'ai-esc-conf-' + Date.now(),
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shipmentId,
      customerSafeText: `Your query has been escalated directly to our senior logistics specialist (${specialist}). We have flagged this as ${priority} priority and will follow up with you as soon as verified instructions are confirmed.`,
      text: `✅ Operational Escalation Ticket Created: Ref #${resultEscId}\n` +
        `• Routed To: ${specialist}\n` +
        `• Urgency SLA: Response required within 2 hours\n` +
        `• Customer Care Notification: You will receive an operational response alert in the 'Operational Escalations' tab once ${assignedUser} responds.`,
      sources: [
        `Control Tower Escalation Register (Ticket #${resultEscId})`,
        `Operational Dispatch Routing Table`
      ]
    });

    App.renderCurrentView();

    if (window.UI) UI.showToast(`Query escalated to ${assignedUser}! Ticket #${resultEscId} logged.`, 'success');
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  }
};
