/**
 * BRIDGES Control Tower - Contact Customer Service View
 * Phase 7: External customer support request form. Validates customer shipment
 * ownership, creates shared query in store, and routes to Customer Service role.
 */

window.CustContactView = {
  preselectedShipmentId: null,
  submittedQuery: null,

  render(container) {
    const store = window.BRIDGES_STORE;
    const ctx = store.getCurrentCustomerContext();
    const customerShipments = store.getCustomerShipments(ctx.customerId);
    const user = window.BRIDGES_AUTH.getCurrentUser();

    const html = `
      <div class="cust-view-container animate-fade-in">
        <!-- HEADER BANNER -->
        <div class="cust-header-banner">
          <div class="cust-banner-info">
            <div class="cust-badge-row">
              <span class="customer-role-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Customer Support Gateway
              </span>
              <span class="customer-account-tag">
                ${ctx.customerName}
              </span>
            </div>
            <h1 class="cust-banner-title">Contact Customer Service</h1>
            <p class="cust-banner-subtitle">
              Submit a delivery inquiry or request operational assistance. Our Customer Care team will review your query and respond directly.
            </p>
          </div>
          <div class="cust-banner-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('customer_queries')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              View My Submitted Queries
            </button>
          </div>
        </div>

        ${this.submittedQuery ? `
          <!-- SUBMISSION CONFIRMATION NOTICE -->
          <div class="cust-card" style="border-left: 4px solid #10B981; margin-bottom: 24px;">
            <div class="cust-card-body" style="padding: 20px;">
              <div style="display: flex; align-items: flex-start; gap: 14px;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 16px; font-weight: 800; color: #070724; margin: 0 0 4px 0;">Query Registered Successfully!</h3>
                  <p style="font-size: 13px; color: #393A50; margin: 0 0 10px 0;">
                    Your inquiry has been logged as Reference <strong style="color: #18217E;">${this.submittedQuery.id}</strong> and routed to the Customer Service team.
                  </p>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary btn-xs" onclick="CustContactView.openSubmittedQuery('${this.submittedQuery.id}')">
                      View Query Conversation &rsaquo;
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="CustContactView.resetForm()">
                      Submit Another Query
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- FORM CARD -->
        <div class="cust-card cust-form-card">
          <div class="cust-card-header">
            <div class="cust-card-title-group">
              <h3 class="cust-card-title">New Assistance Request</h3>
              <p class="cust-card-subtitle">All fields marked with an asterisk (*) are required</p>
            </div>
          </div>
          <div class="cust-card-body">
            <form id="cust-contact-form" onsubmit="event.preventDefault(); CustContactView.submitQuery();">
              <!-- 1. SHIPMENT SELECTOR (ONLY CURRENT CUSTOMER'S SHIPMENTS) -->
              <div class="cust-form-group">
                <label class="cust-form-label">Associated Shipment: <span style="color: #EA341F;">*</span></label>
                <select class="cust-form-select" id="cust-query-shipment" required>
                  <option value="">Select one of your authorized shipments...</option>
                  ${customerShipments.map(s => `
                    <option value="${s.id}" ${this.preselectedShipmentId === s.id ? 'selected' : ''}>
                      ${s.id} — ${s.cargoType || 'Cargo'} &rarr; ${s.destination.split(',')[0]} (${s.status})
                    </option>
                  `).join('')}
                </select>
                <span style="font-size: 11px; color: #8A9995; margin-top: 3px; display: block;">
                  Only shipments belonging to <strong>${ctx.customerName}</strong> can be selected.
                </span>
              </div>

              <!-- 2. CATEGORY -->
              <div class="cust-form-group">
                <label class="cust-form-label">Query Category: <span style="color: #EA341F;">*</span></label>
                <select class="cust-form-select" id="cust-query-category" required>
                  <option value="Delivery Delay">Delivery Delay Advisory Inquiry</option>
                  <option value="ETA Clarification">ETA Clarification / Confirmation</option>
                  <option value="Shipment Tracking">Shipment Milestone Tracking Assistance</option>
                  <option value="Delivery Attempt Issue">Delivery Attempt or Access Issue</option>
                  <option value="Delivery Confirmation">Proof of Delivery Confirmation</option>
                  <option value="Damaged or Missing Shipment">Damaged or Discrepant Cargo Report</option>
                  <option value="Other">Other Customer Service Inquiry</option>
                </select>
              </div>

              <!-- 3. SUBJECT -->
              <div class="cust-form-group">
                <label class="cust-form-label">Subject: <span style="color: #EA341F;">*</span></label>
                <input 
                  type="text" 
                  class="cust-form-input" 
                  id="cust-query-subject" 
                  placeholder="Brief summary of your question (e.g., Requesting confirmed delivery window)..." 
                  required 
                />
              </div>

              <!-- 4. DESCRIPTION -->
              <div class="cust-form-group">
                <label class="cust-form-label">Inquiry Description: <span style="color: #EA341F;">*</span></label>
                <textarea 
                  class="cust-form-textarea" 
                  id="cust-query-description" 
                  rows="4" 
                  placeholder="Please describe your question or issue in detail..." 
                  required
                ></textarea>
              </div>

              <!-- 5. PREFERRED RESPONSE METHOD & CONTACT INFO -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="cust-form-group">
                  <label class="cust-form-label">Preferred Response Channel:</label>
                  <select class="cust-form-select" id="cust-query-channel">
                    <option value="Email" selected>Email</option>
                    <option value="Portal Message">Portal Message (My Queries)</option>
                    <option value="Phone">Phone Callback</option>
                  </select>
                </div>

                <div class="cust-form-group">
                  <label class="cust-form-label">Contact Email:</label>
                  <input 
                    type="email" 
                    class="cust-form-input" 
                    id="cust-query-email" 
                    value="${user ? user.email : 'customer@organization.com'}" 
                    required 
                  />
                </div>
              </div>

              <!-- DEDUPLICATION & PRIVACY NOTICE -->
              <div style="padding: 10px 12px; background: #F8FAFC; border: 1px solid #E5EBEE; border-radius: 6px; margin-bottom: 20px; font-size: 11.5px; color: #424989;">
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 2px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Customer Service Dispatch Integration
                </div>
                Submitted queries are registered immediately in the shared Control Tower database and assigned to the on-duty Customer Service team.
              </div>

              <!-- BUTTONS -->
              <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.navigateTo('customer_home')">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Submit Query
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    if (container) container.innerHTML = html;
    return html;
  },

  submitQuery() {
    const store = window.BRIDGES_STORE;
    const shipmentId = document.getElementById('cust-query-shipment').value;
    const category = document.getElementById('cust-query-category').value;
    const subject = document.getElementById('cust-query-subject').value;
    const description = document.getElementById('cust-query-description').value;
    const preferredMethod = document.getElementById('cust-query-channel').value;
    const contactEmail = document.getElementById('cust-query-email').value;

    if (!shipmentId || !subject.trim() || !description.trim()) {
      UI.showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      const res = store.createCustomerQuery({
        shipmentId,
        category,
        subject,
        description,
        preferredMethod,
        contactEmail
      });

      this.submittedQuery = res.query;
      UI.showToast(`Query ${res.query.id} created successfully and sent to Customer Service.`, 'success');
      App.renderCurrentView();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openSubmittedQuery(queryId) {
    if (window.CustQueriesView) {
      window.CustQueriesView.selectedQueryId = queryId;
    }
    this.submittedQuery = null;
    App.navigateTo('customer_queries');
  },

  resetForm() {
    this.submittedQuery = null;
    this.preselectedShipmentId = null;
    App.renderCurrentView();
  }
};
