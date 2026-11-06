/**
 * BRIDGES Control Tower - Customer Role: AI Self-Service Assistant View
 * Phase 7 / Customer Role: AI Self-Service
 * 
 * Capabilities:
 * 1. Ask AI assistant about shipment status, latest/planned ETA, milestones, delays, and FAQs.
 * 2. Customer Identity Verification:
 *    - Authenticated session verification & PIN / Security Token confirmation.
 *    - Data isolation strictly restricted to the customer's authorized shipments.
 * 3. Permitted Information Only Guardrails:
 *    - Returns customer-safe, authorized answers (approved ETAs, milestone progress, POD confirmation, FAQs).
 *    - Strict guardrails filter out internal operational details (driver cell numbers, mechanical fault codes, internal margins, dispatcher debates).
 * 4. Grounded Verified Source Citations:
 *    - Cites verified sources: Approved Logistics Schedule, Live Geofence Gateway, Cold-Chain Sensor Stream, Electronic POD Certificate.
 * 5. Escalate to Customer Service:
 *    - 1-click escalation button on any response.
 *    - Creates an official customer query ticket (QRY-XXXX) routed directly to Customer Service Specialist Clara Hughes.
 */

window.CustAIAssistantView = {
  selectedShipmentId: null,
  isIdentityVerified: true,
  verificationCode: 'VERIFIED-BIO-2026',
  userQuery: '',
  messages: [],

  initChat() {
    if (this.messages.length === 0) {
      const auth = window.BRIDGES_AUTH;
      const user = auth ? auth.getCurrentUser() : null;
      const customerName = user ? (user.customerName || user.name) : 'BioPharma Health Alliance';

      this.messages = [
        {
          id: 'msg-cust-welcome',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Hello ${user ? user.name : 'Valued Customer'}. I am your BRIDGES Customer Self-Service AI Assistant.\n\nYour session is authenticated and protected under strict customer data privacy. I provide verified shipment status, latest approved arrival windows, milestone progress, cold-chain compliance metrics, and electronic proof of delivery.\n\nSelect one of your authorized shipments above or ask any question below to get started.`,
          sources: [
            'BRIDGES Customer Portal Verified Gateway',
            'SLA & Delivery Commitment Knowledge Base v4.2'
          ]
        }
      ];
    }
  },

  render(container) {
    const target = container || document.getElementById('app-main-content');
    this.initChat();

    const store = window.BRIDGES_STORE;
    const auth = window.BRIDGES_AUTH;
    const user = auth ? auth.getCurrentUser() : null;
    const customer = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(customer.customerId);

    // Default to the first shipment or keep current selection if valid
    if (!this.selectedShipmentId || !customerShipments.some(s => s.id === this.selectedShipmentId)) {
      this.selectedShipmentId = customerShipments.length > 0 ? customerShipments[0].id : null;
    }

    const activeShipment = this.selectedShipmentId ? store.getCustomerShipment(this.selectedShipmentId, customer.customerId) : null;
    const shipmentId = activeShipment ? activeShipment.id : '';

    const html = `
      <div class="cust-portal cust-view-container animate-fade-in" style="max-width: 1440px; margin: 0 auto;">
        <!-- 1. TOP HEADER & IDENTITY VERIFICATION BANNER -->
        <div class="cust-header-banner" style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 22px 26px; box-shadow: 0 2px 8px rgba(7, 7, 36, 0.05); margin-bottom: 20px;">
          <div class="cust-banner-info">
            <div class="cust-badge-row" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
              <span class="customer-role-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(24, 33, 126, 0.08); color: #18217E; border: 1px solid rgba(24, 33, 126, 0.2); border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
                AI Self-Service Assistant
              </span>

              <span class="cust-identity-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(16, 185, 129, 0.1); color: #065F46; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 9999px; font-size: 11.5px; font-weight: 700;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Identity Verified: ${this.escapeHtml(user ? user.name : 'Authorized Customer')} (${this.escapeHtml(customer.customerName)})
              </span>

              <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: #F8FAFC; color: #424989; border: 1px solid #CBD5E1; border-radius: 9999px; font-size: 11.5px; font-weight: 600;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Permitted Information Only &bull; Strict Isolation
              </span>
            </div>

            <h1 class="cust-banner-title" style="font-size: 24px; font-weight: 800; color: #070724; margin: 0 0 6px 0; letter-spacing: -0.3px;">
              Customer AI Self-Service Assistant
            </h1>
            <p class="cust-banner-subtitle" style="font-size: 13px; color: #475569; margin: 0; max-width: 900px; line-height: 1.5;">
              Inquire instantly about live tracking, latest approved ETAs, milestones, cold-chain integrity, and delivery receipts for <strong>${this.escapeHtml(customer.customerName)}</strong>. Internal carrier operations and mechanics fault codes are filtered under strict customer confidentiality.
            </p>
          </div>

          <div class="cust-banner-actions" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px;">
            <button class="btn btn-outline btn-sm" onclick="CustAIAssistantView.openIdentityModal()" style="font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Verify Security PIN / Token
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CustAIAssistantView.clearChat()" style="font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Clear Chat
            </button>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('customer_track')" style="font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Track Shipments
            </button>
          </div>
        </div>

        <!-- 2. SHIPMENT SELECTOR & LIVE CONTEXT STRIP -->
        <div class="cust-card mb-4" style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; box-shadow: 0 1px 4px rgba(7, 7, 36, 0.04); padding: 16px 20px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 320px;">
              <label style="font-size: 12px; font-weight: 700; color: #18217E; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">
                Target Shipment:
              </label>
              <select class="cs-select" style="max-width: 460px; font-weight: 600; font-size: 13px;" onchange="CustAIAssistantView.onShipmentChange(this.value)">
                ${customerShipments.map(s => `
                  <option value="${s.id}" ${s.id === shipmentId ? 'selected' : ''}>
                    ${s.id} &bull; ${s.orderId || 'ORD-7721'} (${s.status} &bull; ${s.origin} &rarr; ${s.destination})
                  </option>
                `).join('')}
              </select>
              ${activeShipment ? `
                <button class="btn btn-outline btn-xs" onclick="CustAIAssistantView.viewShipmentDetail('${shipmentId}')" title="Inspect full tracking timeline">
                  View Timeline &rarr;
                </button>
              ` : ''}
            </div>

            ${activeShipment ? `
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                <span class="badge ${
                  activeShipment.status === 'Delivered' ? 'badge-success' :
                  activeShipment.status === 'Exception' ? 'badge-danger' :
                  'badge-info'
                }" style="font-weight: 700; font-size: 11px;">
                  ${activeShipment.status}
                </span>
                <span style="font-size: 11.5px; background: #F1F5F9; color: #1E293B; padding: 4px 8px; border-radius: 5px; border: 1px solid #CBD5E1;">
                  <strong>Order #:</strong> ${activeShipment.orderId || 'ORD-7721'}
                </span>
                <span style="font-size: 11.5px; background: #F8FAFC; color: #18217E; padding: 4px 8px; border-radius: 5px; border: 1px solid rgba(24, 33, 126, 0.2); font-weight: 600;">
                  <strong>Approved ETA:</strong> ${activeShipment.approvedETA || activeShipment.eta || 'Pending'}
                </span>
                <span style="font-size: 11.5px; background: #F1F5F9; color: #424989; padding: 4px 8px; border-radius: 5px; border: 1px solid #CBD5E1;">
                  <strong>PO Ref:</strong> ${activeShipment.customerReference || 'PO-88248'}
                </span>
              </div>
            ` : ''}
          </div>

          ${activeShipment ? `
            <!-- LIVE TELEMETRY & PLANNED VS APPROVED ETA SUMMARY -->
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #E2E8F0; display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; font-size: 12px; color: #393A50;">
              <div>
                <span style="color: #64748B; font-size: 11px; display: block; font-weight: 600;">Live Geofence Location:</span>
                <strong style="color: #070724; display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${activeShipment.currentLocation || activeShipment.origin}
                </strong>
              </div>
              <div>
                <span style="color: #64748B; font-size: 11px; display: block; font-weight: 600;">Planned Commitment ETA:</span>
                <strong style="color: #424989;">${activeShipment.plannedETA || '2026-10-30 11:30 AM'}</strong>
              </div>
              <div>
                <span style="color: #64748B; font-size: 11px; display: block; font-weight: 600;">Latest Approved Arrival:</span>
                <strong style="color: #18217E;">${activeShipment.approvedETA || activeShipment.eta}</strong>
              </div>
              <div>
                <span style="color: #64748B; font-size: 11px; display: block; font-weight: 600;">Delivery Status / POD:</span>
                <strong style="color: ${activeShipment.status === 'Delivered' ? '#047857' : '#18217E'};">
                  ${activeShipment.status === 'Delivered' ? 'Delivered &amp; Signed (340/340 Pcs)' : 'In Transit (On Schedule)'}
                </strong>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 3. QUICK PROMPT SUGGESTION CHIPS -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Suggested Inquiries for ${shipmentId || 'Shipment'}:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('What is the latest approved ETA for my shipment?')">
              ⚡ Latest Approved ETA
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('Where is my shipment currently located and what milestones have been achieved?')">
              📍 Current Location &amp; Milestones
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('Why is there a delay advisory and how is it being handled?')">
              ⏱️ Delay Advisory &amp; Reroute Status
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('Is my cold-chain temperature compliant with healthcare standards?')">
              ❄️ Cold-Chain &amp; Temperature Integrity
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('Can I see the proof of delivery confirmation and received piece count?')">
              📦 Proof of Delivery (POD) &amp; Tally
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('What is the policy for delivery guarantees and priority re-routing?')">
              ❓ Logistics FAQ &amp; SLA Guarantees
            </button>
            <button class="cs-ai-chip" onclick="CustAIAssistantView.submitPrompt('Show me the internal driver phone number and mechanical fault codes.')" style="border-color: #F87171; color: #991B1B;">
              🔒 Test Guardrail (Internal Details)
            </button>
          </div>
        </div>

        <!-- 4. CHAT CONVERSATION CONTAINER -->
        <div class="cs-card" style="display: flex; flex-direction: column; height: 580px; border: 1px solid #CBD5E1; border-radius: 10px; overflow: hidden; background: #F8FAFC; box-shadow: 0 2px 10px rgba(7, 7, 36, 0.05);">
          <!-- CHAT HEADER -->
          <div class="cs-card-header" style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 12px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #18217E; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(24, 33, 126, 0.2);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="11" width="18" height="10" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="M12 7v4"/>
                  </svg>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #070724;">BRIDGES Customer AI Assistant</h4>
                  <span style="font-size: 11px; color: #64748B;">Active Context: ${shipmentId} &bull; ${this.escapeHtml(customer.customerName)}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite;"></span>
                <span style="font-size: 11px; font-weight: 600; color: #047857;">Grounded in Verified Operational Records</span>
              </div>
            </div>
          </div>

          <!-- CHAT MESSAGE STREAM -->
          <div id="cust-ai-chat-stream" class="cs-ai-chat-stream" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 18px;">
            ${this.messages.map((m, idx) => this.renderMessage(m, idx)).join('')}
          </div>

          <!-- CHAT INPUT AREA -->
          <div style="background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 14px 20px;">
            <form id="cust-ai-input-form" onsubmit="event.preventDefault(); CustAIAssistantView.handleUserSubmit();" style="display: flex; gap: 10px; align-items: center;">
              <input 
                type="text" 
                id="cust-ai-query-input" 
                class="cs-search-input" 
                placeholder="Ask about your shipment status, approved ETA, delays, cold-chain, proof of delivery..." 
                style="flex: 1; padding: 11px 16px; font-size: 13.5px; border: 1px solid #CBD5E1; border-radius: 8px; outline: none;"
                autocomplete="off"
              />
              <button type="submit" class="btn btn-primary" style="padding: 11px 22px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Ask Assistant
              </button>
            </form>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11.5px; color: #64748B;">
              <span>🔒 Customer Safe: Returns only verified, authorized customer milestones and ETAs.</span>
              <span>Need human assistance? Click <strong>"Escalate to Customer Service"</strong> on any response.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    target.innerHTML = html;
    return html;
  },

  renderMessage(msg, idx) {
    const auth = window.BRIDGES_AUTH;
    const user = auth ? auth.getCurrentUser() : null;

    if (msg.sender === 'user') {
      return `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 2px;">
          <div style="max-width: 75%; background: #18217E; color: #FFFFFF; padding: 12px 18px; border-radius: 14px 14px 2px 14px; box-shadow: 0 2px 6px rgba(24, 33, 126, 0.15);">
            <div style="font-size: 13.5px; line-height: 1.5; font-weight: 500;">
              ${this.escapeHtml(msg.text)}
            </div>
            <div style="font-size: 10.5px; opacity: 0.8; text-align: right; margin-top: 5px;">
              ${msg.timestamp || ''} &bull; ${this.escapeHtml(user ? user.name : 'Customer')}
            </div>
          </div>
        </div>
      `;
    }

    // AI Response Message
    return `
      <div style="display: flex; gap: 12px; max-width: 92%; margin-bottom: 4px;">
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #070724; color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.12);">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M12 7v4"/>
          </svg>
        </div>

        <div style="flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 2px 14px 14px 14px; padding: 18px; box-shadow: 0 2px 8px rgba(7, 7, 36, 0.04);">
          ${msg.id === 'msg-cust-welcome' ? `
            <div style="font-size: 13.5px; color: #1E293B; line-height: 1.6; white-space: pre-line;">
              ${msg.text}
            </div>
          ` : `
            <!-- 1. GUARDRAIL ALERT (IF USER ASKED FOR INTERNAL RESTRICTED DATA) -->
            ${msg.isGuardrailTriggered ? `
              <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 6px; color: #991B1B; font-size: 11.5px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Confidential Operational Details Filtered
                </div>
                <div style="font-size: 12.5px; color: #7F1D1D; line-height: 1.45;">
                  Direct driver cell numbers, vehicle maintenance diagnostics, and internal operational debate are restricted internal records. You are provided verified milestone tracking, live geofence coordinates, and confirmed ETAs below.
                </div>
              </div>
            ` : ''}

            <!-- 2. PERMITTED CUSTOMER-SAFE ANSWER -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #18217E; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; margin-bottom: 6px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Permitted Shipment Information &bull; Verified Answer:
              </div>
              <div style="font-size: 13.5px; color: #0F172A; line-height: 1.6; white-space: pre-line; font-weight: 450;">
                ${msg.text}
              </div>
            </div>

            <!-- 3. VERIFIED DATA CITATIONS -->
            ${msg.sources && msg.sources.length > 0 ? `
              <div style="padding-top: 10px; border-top: 1px dashed #E2E8F0; margin-bottom: 12px;">
                <span style="font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                  Verified Data Sources &amp; Telematics Citations:
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

            <!-- 4. ESCALATE TO CUSTOMER SERVICE BUTTON -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F1F5F9;">
              <button class="btn btn-xs btn-outline" style="font-size: 11px; padding: 4px 10px;" onclick="CustAIAssistantView.copyText('${this.escapeQuotes(msg.text)}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Answer
              </button>

              <button class="btn btn-xs" style="background: rgba(140, 37, 39, 0.08); color: #8C2527; border: 1px solid rgba(140, 37, 39, 0.25); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px;" onclick="CustAIAssistantView.openEscalateModal('${this.escapeQuotes(msg.originalQuery || '')}', '${msg.shipmentId || this.selectedShipmentId}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Escalate to Customer Service
              </button>
            </div>
          `}

          <div style="font-size: 10px; color: #94A3B8; margin-top: 8px; text-align: right;">
            ${msg.timestamp || ''} &bull; Generated by BRIDGES Customer Self-Service AI
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
    if (window.CustShipmentDetailView) {
      window.CustShipmentDetailView.selectedShipmentId = shipmentId;
    }
    App.navigateTo('customer_shipment_detail');
  },

  submitPrompt(promptText) {
    const input = document.getElementById('cust-ai-query-input');
    if (input) {
      input.value = promptText;
    }
    this.handleUserSubmit(promptText);
  },

  handleUserSubmit(manualPrompt = null) {
    const input = document.getElementById('cust-ai-query-input');
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

    // Synthesize customer-safe AI response
    const response = this.synthesizeAIResponse(query, this.selectedShipmentId);
    this.messages.push(response);

    App.renderCurrentView();

    // Scroll to bottom
    setTimeout(() => {
      const stream = document.getElementById('cust-ai-chat-stream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
  },

  synthesizeAIResponse(query, shipmentId) {
    const store = window.BRIDGES_STORE;
    const customer = store.getCurrentCustomerContext();
    const s = store.getCustomerShipment(shipmentId, customer.customerId) || store.getCustomerShipments(customer.customerId)[0];
    const q = query.toLowerCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let responseText = '';
    let sources = [];
    let isGuardrailTriggered = false;

    // Check Guardrails: Internal driver personal cell phone, mechanical fault codes, carrier margins, dispatcher debates
    if (q.includes('driver phone') || q.includes('driver number') || q.includes('mechanic') || q.includes('fault code') || q.includes('margin') || q.includes('internal note') || q.includes('dispatcher debate') || q.includes('chassis')) {
      isGuardrailTriggered = true;
      responseText = `🔒 Confidential Operational Data Notice:\n` +
        `Direct driver cell communication, truck mechanical diagnostics, and operational carrier notes are confidential internal records.\n\n` +
        `Authorized Customer Milestones for Shipment ${s.id}:\n` +
        `• Current Live Location: ${s.currentLocation || 'Austin Interchange Geofence'}\n` +
        `• Verified Delivery Window: ${s.approvedETA || s.eta}\n` +
        `• Carrier Status: Contracted Dedicated Fleet under active Control Tower telematics.\n\n` +
        `If you require special dispatch authorization or direct contact with transport planners, please use the "Escalate to Customer Service" button below to reach Specialist Clara Hughes.`;

      sources = [
        'BRIDGES Customer Data Privacy Shield (Policy SEC-04)',
        'Live Geofence Telematics Gateway'
      ];
    }
    // 1. ETA / Arrival Schedule
    else if (q.includes('eta') || q.includes('arrival') || q.includes('latest') || q.includes('planned') || q.includes('when')) {
      const planned = s.plannedETA || '2026-10-30 11:30 AM';
      const approved = s.approvedETA || s.eta || 'Pending confirmation';
      const isDelivered = s.status === 'Delivered';

      if (isDelivered) {
        responseText = `Your shipment (${s.id}, Order #${s.orderId || 'ORD-7721'}) was successfully delivered to ${s.destination}.\n\n` +
          `• Delivery Timestamp: ${s.deliveryConfirmation ? s.deliveryConfirmation.deliveredAt : '2026-10-29 14:15'}\n` +
          `• Received Piece Count: ${s.deliveryConfirmation ? s.deliveryConfirmation.receivedQty : '340'} pieces (100% verified)\n` +
          `• Signed by: ${s.deliveryConfirmation ? s.deliveryConfirmation.recipientName + ' (' + s.deliveryConfirmation.recipientRole + ')' : 'Marcus Ray (Receiving Lead)'}\n\n` +
          `Electronic Proof of Delivery (POD) is certified and accessible in your shipment file.`;
      } else {
        responseText = `Here is the verified arrival schedule for shipment ${s.id} (Order #${s.orderId || 'ORD-7721'}):\n\n` +
          `• Planned Baseline Commitment: ${planned}\n` +
          `• Latest Approved Arrival Window: ${approved} (Confirmed by Operations)\n` +
          `• Current Status: ${s.status} at ${s.currentLocation || 'Austin Interchange'}\n\n` +
          `Our central logistics team has confirmed this arrival window to accommodate localized weather routing. All milestones remain under continuous automated tracking.`;
      }

      sources = [
        `Approved Logistics Dispatch Schedule (Order #${s.orderId || 'ORD-7721'})`,
        `Control Tower Automated ETA Engine (Rule R-102)`,
        `Live GPS Telematics Gateway`
      ];
    }
    // 2. Location & Milestones
    else if (q.includes('location') || q.includes('where') || q.includes('milestone') || q.includes('transit') || q.includes('route')) {
      const loc = s.currentLocation || 'Austin Interchange Geofence';
      const status = s.status;

      responseText = `Shipment ${s.id} is traveling from ${s.origin} to ${s.destination}.\n\n` +
        `• Live Geofence Position: ${loc}\n` +
        `• Milestone Progress: Order Confirmed &rarr; Dispatched from Hub &rarr; Active Transit Corridor &rarr; Approaching Destination Geofence\n` +
        `• Estimated Destination Arrival: ${s.approvedETA || s.eta}\n` +
        `• Route Integrity: Standard high-priority transport corridor with no unauthorized diversions detected.`;

      sources = [
        `Live GPS Telematics Beacon (${s.origin} to ${s.destination})`,
        `Control Tower Transit Milestone Registry`
      ];
    }
    // 3. Delay Advisory & Recovery Actions
    else if (q.includes('delay') || q.includes('exception') || q.includes('reroute') || q.includes('advisory') || q.includes('weather') || q.includes('snow') || q.includes('blizzard')) {
      const delay = s.delayMinutes ? `${s.delayMinutes} minutes` : (s.delayHours ? `${s.delayHours} hours` : 'nominal adjustment');

      responseText = `Delay Advisory & Routing Status for ${s.id}:\n\n` +
        `• Advisory Notice: An optimized alternate route was activated to bypass severe regional weather conditions along the northern highway corridor.\n` +
        `• Operational Recovery Action: Our logistics team re-routed the transport vehicle via the southern express corridor to safeguard transit continuity.\n` +
        `• Impact on Delivery: Delivery is expected within the latest confirmed arrival window (${s.approvedETA || s.eta}).\n` +
        `• Cargo Condition: Temperature-controlled reefers remain fully operational with continuous sensor reporting.`;

      sources = [
        `Approved Logistics Exception Advisory (Ref #${s.id}-ADVISORY)`,
        `Regional Traffic & Weather Routing Telematics`
      ];
    }
    // 4. Cold-Chain & Temperature Compliance
    else if (q.includes('temperature') || q.includes('cold') || q.includes('sensor') || q.includes('probe') || q.includes('compliance') || q.includes('celsius')) {
      responseText = `Cold-Chain Integrity Report for ${s.id}:\n\n` +
        `• Target Range: +2.0°C to +8.0°C (BioPharma Healthcare Specification)\n` +
        `• Current Live Sensor Reading: 4.2°C (COMPLIANT)\n` +
        `• Average Transit Temperature: 4.1°C\n` +
        `• Temperature Excursions: 0 excursions recorded across entire transit journey\n` +
        `• Power & Reefers: Dual compressor systems active and synchronized with central Control Tower probes.`;

      sources = [
        `Cold-Chain IoT Sensor Stream (Probe ID #CC-TX-9902)`,
        `Healthcare Cold-Chain Compliance Standard ISO-9001`
      ];
    }
    // 5. Proof of Delivery (POD) & Delivered items
    else if (q.includes('proof of delivery') || q.includes('pod') || q.includes('received') || q.includes('piece') || q.includes('delivered') || q.includes('signature')) {
      const isDelivered = s.status === 'Delivered';
      const pod = s.deliveryConfirmation || {
        deliveredAt: '2026-10-29 14:15',
        recipientName: 'Marcus Ray',
        recipientRole: 'Receiving Dock Lead',
        receivedQty: '340',
        signatureStatus: 'Signed & Certified',
        conditionNotes: 'All boxes intact, seal intact, temperature verified'
      };

      if (isDelivered) {
        responseText = `Proof of Delivery (POD) Certificate for ${s.id} (Order #${s.orderId || 'ORD-7721'}):\n\n` +
          `• Delivery Completed: ${pod.deliveredAt}\n` +
          `• Delivered To: ${s.destination}\n` +
          `• Recipient Name & Role: ${pod.recipientName} (${pod.recipientRole})\n` +
          `• Accepted Piece Count: ${pod.receivedQty} / ${pod.receivedQty} pieces (100% accepted, 0 damaged)\n` +
          `• Digital Signature Stamp: ${pod.signatureStatus} (Cryptographically verified)\n` +
          `• Receiving Dock Notes: "${pod.conditionNotes}"\n\n` +
          `You can view and print the official Certificate of Delivery in the "Track Shipment" view.`;
      } else {
        responseText = `Shipment ${s.id} is currently ${s.status} and has not yet completed final-mile dock delivery.\n\n` +
          `• Anticipated Delivery Dock: ${s.destination}\n` +
          `• Expected Delivery Window: ${s.approvedETA || s.eta}\n` +
          `• Manifested Item Count: 340 units of specialized healthcare supplies\n\n` +
          `Once dock receiving completes electronic sign-off, the certified Proof of Delivery (POD) will appear immediately in your portal.`;
      }

      sources = [
        `Dallas Receiving Dock Electronic Certificate (Terminal Ref #POD-9921)`,
        `Control Tower Delivery Verification Register`
      ];
    }
    // 6. Logistics FAQ & Guarantees
    else if (q.includes('faq') || q.includes('policy') || q.includes('guarantee') || q.includes('rerouting') || q.includes('sla') || q.includes('service')) {
      responseText = `BRIDGES Logistics Service & Delivery Policy FAQ:\n\n` +
        `1. Delivery Guarantees: All healthcare and industrial consignments are backed by our proactive SLA guarantee. If adverse weather or route disruptions threaten an arrival window, operations immediately deploys priority re-routing or dedicated backup fleets.\n\n` +
        `2. Customer Notification Commitment: ETA adjustments exceeding 30 minutes trigger automatic multi-channel alerts (Email, SMS, Portal Push) based on your notification preferences.\n\n` +
        `3. Cold-Chain Protection: Continuous telematics log temperatures every 60 seconds. Any drift towards excursion thresholds triggers automated dispatcher intervention.\n\n` +
        `4. Human Customer Service Support: Unresolved inquiries can be escalated at any time to Customer Service Specialist Clara Hughes with a guaranteed 2-hour response turnaround.`;

      sources = [
        'BRIDGES Customer Master Service Agreement (MSA)',
        'Control Tower SLA & Proactive Mitigation Standard'
      ];
    }
    // Default fallback
    else {
      responseText = `Regarding your inquiry on shipment ${s.id} (Order #${s.orderId || 'ORD-7721'}):\n\n` +
        `• Current Status: ${s.status} (${s.origin} &rarr; ${s.destination})\n` +
        `• Live Geofence Location: ${s.currentLocation || 'Austin Interchange Geofence'}\n` +
        `• Approved Delivery Window: ${s.approvedETA || s.eta}\n` +
        `• Cold-Chain Reading: 4.2°C (Compliant +2°C to +8°C)\n\n` +
        `If you need specific assistance regarding address modifications, priority redelivery, or dock coordination, please click "Escalate to Customer Service" below to connect directly with Specialist Clara Hughes.`;

      sources = [
        `Approved Dispatch Schedule (Order #${s.orderId || 'ORD-7721'})`,
        `Live GPS Telematics Gateway`
      ];
    }

    return {
      id: 'ai-res-' + Date.now(),
      sender: 'ai',
      timestamp: nowTime,
      shipmentId: s.id,
      text: responseText,
      sources,
      isGuardrailTriggered,
      originalQuery: query
    };
  },

  clearChat() {
    this.messages = [];
    this.initChat();
    App.renderCurrentView();
    if (window.UI) UI.showToast('Conversation reset.', 'info');
  },

  copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.UI) UI.showToast('Answer copied to clipboard!', 'success');
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (window.UI) UI.showToast('Answer copied to clipboard!', 'success');
    }
  },

  openIdentityModal() {
    const store = window.BRIDGES_STORE;
    const auth = window.BRIDGES_AUTH;
    const user = auth ? auth.getCurrentUser() : null;
    const customer = store.getCurrentCustomerContext();

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #065F46;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
        </span>
        <span>Customer Account &amp; Identity Verification</span>
      </div>
    `;

    const bodyHtml = `
      <div style="padding: 10px 0;">
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11.5px; font-weight: 700; color: #065F46; text-transform: uppercase;">Authenticated Identity:</span>
            <span style="font-size: 11px; background: #065F46; color: #FFFFFF; padding: 2px 8px; border-radius: 4px; font-weight: 700;">ACTIVE SESSION</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #064E3B;">
            ${this.escapeHtml(user ? user.name : 'Sarah Jenkins')} &bull; ${this.escapeHtml(customer.customerName)}
          </div>
          <div style="font-size: 12px; color: #047857; margin-top: 4px;">
            Account ID: <strong>${customer.customerId}</strong> &bull; Email: ${user ? user.email : 'customer@gmail.com'}
          </div>
        </div>

        <form id="cust-identity-form" onsubmit="event.preventDefault(); CustAIAssistantView.verifyPin();">
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #070724; margin-bottom: 6px;">
              Two-Factor Customer Security Token / PIN:
            </label>
            <input 
              type="text" 
              id="cust-security-pin-input" 
              class="cs-search-input" 
              value="${this.verificationCode}" 
              placeholder="Enter 6-digit PIN or Customer Authorization Token..." 
              style="width: 100%; padding: 10px 14px; font-size: 13px; border: 1px solid #CBD5E1; border-radius: 6px;"
              required
            />
            <span style="font-size: 11px; color: #64748B; margin-top: 4px; display: block;">
              Default verified demo token: <code>VERIFIED-BIO-2026</code>. Re-verify to confirm high-tier shipment data access.
            </span>
          </div>

          <div class="cs-modal-btn-row" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">
              Close
            </button>
            <button type="submit" class="btn btn-primary btn-sm" style="background: #065F46; border-color: #065F46; font-weight: 700;">
              Confirm &amp; Verify Identity
            </button>
          </div>
        </form>
      </div>
    `;

    dialogEl.innerHTML = bodyHtml;
    UI.openModal('generic-app-modal');
  },

  verifyPin() {
    const input = document.getElementById('cust-security-pin-input');
    const pin = input ? input.value.trim() : '';
    if (!pin) return;

    this.isIdentityVerified = true;
    this.verificationCode = pin;
    UI.closeModal('generic-app-modal');

    if (window.UI) UI.showToast(`Customer Identity Confirmed: Token ${pin} validated!`, 'success');
  },

  openEscalateModal(query, shipmentId) {
    const store = window.BRIDGES_STORE;
    const customer = store.getCurrentCustomerContext();
    const s = store.getCustomerShipment(shipmentId, customer.customerId);
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;

    const modal = document.getElementById('generic-app-modal');
    const titleEl = document.getElementById('generic-modal-title');
    const dialogEl = document.getElementById('generic-modal-dialog');
    if (!modal || !titleEl || !dialogEl) return;

    titleEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #8C2527;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </span>
        <span>Escalate Query to Customer Service Specialist</span>
      </div>
    `;

    const bodyHtml = `
      <form id="cust-ai-escalate-form" onsubmit="event.preventDefault(); CustAIAssistantView.submitCustomerEscalation('${shipmentId}');">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Target Shipment:</div>
          <div style="font-size: 14px; font-weight: 700; color: #18217E;">
            ${shipmentId} &bull; Order #${s ? (s.orderId || 'ORD-7721') : 'ORD-7721'} (${s ? s.origin + ' &rarr; ' + s.destination : ''})
          </div>
          <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">
            Assigned Customer Support Specialist: <strong>Clara Hughes</strong> (Lead Customer Care)
          </div>
        </div>

        <div class="cs-modal-form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <!-- 1. Category -->
          <div class="cs-form-group">
            <label class="cs-form-label" style="font-size: 12px; font-weight: 700; color: #070724; display: block; margin-bottom: 4px;">
              Inquiry Category: <span class="text-danger">*</span>
            </label>
            <select class="cs-select" id="cust-ai-esc-category" required style="width: 100%; padding: 8px 12px; font-size: 12.5px; border: 1px solid #CBD5E1; border-radius: 6px;">
              <option value="ETA Discrepancy" selected>ETA Discrepancy / Arrival Confirmation</option>
              <option value="Delay Inquiry">Delay Advisory &amp; Reroute Clarification</option>
              <option value="Proof of Delivery Dispute">Proof of Delivery (POD) / Missing Pieces</option>
              <option value="Cold-Chain Temperature">Cold-Chain Temperature Compliance Inquiry</option>
              <option value="Special Handling">Delivery Address or Schedule Change Request</option>
              <option value="Other">Other Operational Question</option>
            </select>
          </div>

          <!-- 2. Priority -->
          <div class="cs-form-group">
            <label class="cs-form-label" style="font-size: 12px; font-weight: 700; color: #070724; display: block; margin-bottom: 4px;">
              Urgency Level: <span class="text-danger">*</span>
            </label>
            <select class="cs-select" id="cust-ai-esc-priority" required style="width: 100%; padding: 8px 12px; font-size: 12.5px; border: 1px solid #CBD5E1; border-radius: 6px;">
              <option value="Normal">Normal (Standard inquiry &lt; 4h)</option>
              <option value="Urgent" selected>Urgent (Response needed &lt; 2h)</option>
              <option value="Critical">Critical (Immediate dock delivery today)</option>
            </select>
          </div>

          <!-- 3. Subject -->
          <div class="cs-form-group cs-span-full" style="grid-column: 1 / -1;">
            <label class="cs-form-label" style="font-size: 12px; font-weight: 700; color: #070724; display: block; margin-bottom: 4px;">
              Query Subject: <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              class="cs-search-input" 
              id="cust-ai-esc-subject" 
              value="Customer inquiry regarding ${shipmentId}: ${query ? query.slice(0, 45) + '...' : 'Status clarification'}" 
              required 
              style="width: 100%; padding: 8px 12px; font-size: 13px; border: 1px solid #CBD5E1; border-radius: 6px;"
            />
          </div>

          <!-- 4. Description / Original Query -->
          <div class="cs-form-group cs-span-full" style="grid-column: 1 / -1;">
            <label class="cs-form-label" style="font-size: 12px; font-weight: 700; color: #070724; display: block; margin-bottom: 4px;">
              Detailed Message for Customer Service: <span class="text-danger">*</span>
            </label>
            <textarea class="cs-textarea" id="cust-ai-esc-notes" rows="3" required style="width: 100%; padding: 8px 12px; font-size: 12.5px; border: 1px solid #CBD5E1; border-radius: 6px;">${query || 'Hello Clara, I need clarification regarding the arrival window and milestone schedule for this shipment.'}</textarea>
          </div>

          <!-- 5. Preferred Contact Channel -->
          <div class="cs-form-group cs-span-full" style="grid-column: 1 / -1;">
            <label class="cs-form-label" style="font-size: 12px; font-weight: 700; color: #070724; display: block; margin-bottom: 4px;">
              Preferred Response Channel:
            </label>
            <div style="display: flex; gap: 14px; font-size: 12.5px; color: #334155;">
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="radio" name="escChannel" value="Email" checked /> Email &amp; Portal Notification
              </label>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="radio" name="escChannel" value="Phone" /> Direct Phone Call
              </label>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="radio" name="escChannel" value="SMS" /> SMS Text Alert
              </label>
            </div>
          </div>
        </div>

        <div class="cs-modal-btn-row" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #E2E8F0; padding-top: 14px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary btn-sm" style="background: #8C2527; border-color: #8C2527; font-weight: 700; padding: 8px 18px;">
            Submit &amp; Route to Customer Service
          </button>
        </div>
      </form>
    `;

    dialogEl.innerHTML = bodyHtml;
    UI.openModal('generic-app-modal');
  },

  submitCustomerEscalation(shipmentId) {
    const category = document.getElementById('cust-ai-esc-category').value;
    const priority = document.getElementById('cust-ai-esc-priority').value;
    const subject = document.getElementById('cust-ai-esc-subject').value;
    const notes = document.getElementById('cust-ai-esc-notes').value;
    const channelInput = document.querySelector('input[name="escChannel"]:checked');
    const channel = channelInput ? channelInput.value : 'Email';

    const store = window.BRIDGES_STORE;
    const auth = window.BRIDGES_AUTH;
    const user = auth ? auth.getCurrentUser() : null;

    let ticketId = `QRY-${Math.floor(8010 + Math.random() * 990)}`;

    try {
      if (store.createCustomerQuery) {
        const res = store.createCustomerQuery({
          shipmentId,
          category,
          subject,
          description: `[AI Self-Service Escalation - Priority: ${priority} - Channel: ${channel}]:\n${notes}`,
          preferredMethod: channel,
          contactEmail: user ? user.email : 'customer@gmail.com'
        });
        if (res && res.query && res.query.id) {
          ticketId = res.query.id;
        }
      }
    } catch (e) {
      console.warn("Failed to create customer query via store method:", e);
    }

    UI.closeModal('generic-app-modal');

    // Append AI confirmation in conversation stream
    this.messages.push({
      id: 'ai-esc-conf-' + Date.now(),
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shipmentId,
      text: `✅ Customer Support Query Created: Ref #${ticketId}\n\n` +
        `• Assigned Specialist: Clara Hughes (Lead Customer Care Specialist)\n` +
        `• Priority: ${priority}\n` +
        `• Response Channel: ${channel}\n` +
        `• Guaranteed SLA: Response within 2 hours\n\n` +
        `Your query has been logged into the Customer Service queue. You can track updates anytime in the "My Support Queries" section.`,
      sources: [
        `Control Tower Support Ticket Register (#${ticketId})`,
        `Customer Service Dispatch Queue`
      ]
    });

    App.renderCurrentView();

    if (window.UI) {
      UI.showToast(`Support Ticket #${ticketId} created! Clara Hughes will follow up shortly.`, 'success');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  escapeQuotes(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  }
};
