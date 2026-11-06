/**
 * BRIDGES - Customer Role: My Queries (Page F)
 * Allows customers to view, track, and follow up on their submitted support queries.
 * Strictly isolates queries to the authenticated customer account.
 */

window.CustQueriesView = {
  activeFilter: 'all',
  searchQuery: '',
  selectedQueryId: null,

  render(container) {
    const target = container || document.getElementById('app-main-content');
    const store = window.BRIDGES_STORE;
    const auth = window.BRIDGES_AUTH;
    const customer = store.getCurrentCustomerContext();

    const queries = store.getCustomerQueries(customer.customerId);

    // Apply status filter
    let filtered = queries;
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(q => q.status.toLowerCase() === this.activeFilter.toLowerCase());
    }

    // Apply search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const qLower = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(q => 
        (q.id && q.id.toLowerCase().includes(qLower)) ||
        (q.shipmentId && q.shipmentId.toLowerCase().includes(qLower)) ||
        (q.subject && q.subject.toLowerCase().includes(qLower)) ||
        (q.category && q.category.toLowerCase().includes(qLower)) ||
        (q.description && q.description.toLowerCase().includes(qLower))
      );
    }

    // Calculate count by status
    const counts = {
      all: queries.length,
      open: queries.filter(q => q.status === 'Open').length,
      in_progress: queries.filter(q => q.status === 'In Progress').length,
      awaiting_customer: queries.filter(q => q.status === 'Awaiting Customer').length,
      resolved: queries.filter(q => q.status === 'Resolved').length
    };

    const html = `
      <div class="cust-portal">
        <!-- Customer Header Banner -->
        <div class="cust-header-banner">
          <div>
            <div class="cust-header-tagline">
              <span class="cust-pulse-dot"></span> Customer Support &amp; Queries
            </div>
            <h1 class="cust-header-title">My Support Queries</h1>
            <p class="cust-header-sub">
              Track status, review updates, and communicate directly with Customer Service regarding your shipments for 
              <strong>${this.escapeHtml(customer.customerName)}</strong>.
            </p>
          </div>
          <div class="cust-banner-badge">
            <a href="#/customer_contact" class="cust-btn cust-btn-primary" style="white-space: nowrap;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Raise New Query
            </a>
          </div>
        </div>

        <!-- Quick Summary Bar -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="cust-card" style="flex: 1; min-width: 150px; padding: 14px 18px; margin-bottom: 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8A9995; font-weight: 700; letter-spacing: 0.5px;">Total Queries</div>
            <div style="font-size: 22px; font-weight: 800; color: #070724; margin-top: 4px;">${counts.all}</div>
          </div>
          <div class="cust-card" style="flex: 1; min-width: 150px; padding: 14px 18px; margin-bottom: 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #18217E; font-weight: 700; letter-spacing: 0.5px;">Open</div>
            <div style="font-size: 22px; font-weight: 800; color: #18217E; margin-top: 4px;">${counts.open}</div>
          </div>
          <div class="cust-card" style="flex: 1; min-width: 150px; padding: 14px 18px; margin-bottom: 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #424989; font-weight: 700; letter-spacing: 0.5px;">In Progress</div>
            <div style="font-size: 22px; font-weight: 800; color: #424989; margin-top: 4px;">${counts.in_progress}</div>
          </div>
          <div class="cust-card" style="flex: 1; min-width: 150px; padding: 14px 18px; margin-bottom: 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #EA341F; font-weight: 700; letter-spacing: 0.5px;">Awaiting Your Reply</div>
            <div style="font-size: 22px; font-weight: 800; color: #EA341F; margin-top: 4px;">${counts.awaiting_customer}</div>
          </div>
          <div class="cust-card" style="flex: 1; min-width: 150px; padding: 14px 18px; margin-bottom: 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #15803d; font-weight: 700; letter-spacing: 0.5px;">Resolved</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${counts.resolved}</div>
          </div>
        </div>

        <!-- Filter and Search Row -->
        <div class="cust-card" style="padding: 16px 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <!-- Status Tabs -->
            <div class="cust-tabs" style="margin-bottom: 0; border-bottom: none;">
              <button class="cust-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
                All Queries (${counts.all})
              </button>
              <button class="cust-tab-btn ${this.activeFilter === 'open' ? 'active' : ''}" data-filter="open">
                Open (${counts.open})
              </button>
              <button class="cust-tab-btn ${this.activeFilter === 'in progress' ? 'active' : ''}" data-filter="in progress">
                In Progress (${counts.in_progress})
              </button>
              <button class="cust-tab-btn ${this.activeFilter === 'awaiting customer' ? 'active' : ''}" data-filter="awaiting customer">
                Action Needed (${counts.awaiting_customer})
              </button>
              <button class="cust-tab-btn ${this.activeFilter === 'resolved' ? 'active' : ''}" data-filter="resolved">
                Resolved (${counts.resolved})
              </button>
            </div>

            <!-- Search Field -->
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; max-width: 320px; min-width: 200px;">
              <div style="position: relative; width: 100%;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="2" style="position: absolute; left: 10px; top: 11px;">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  id="custQuerySearchInput" 
                  class="cust-form-input" 
                  placeholder="Search by ID, shipment, subject..." 
                  value="${this.escapeHtml(this.searchQuery)}"
                  style="padding-left: 32px; font-size: 13px;"
                />
              </div>
              ${this.searchQuery ? `
                <button id="custClearSearchBtn" class="cust-btn cust-btn-secondary" style="padding: 6px 10px; font-size: 12px;">
                  Clear
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Queries List -->
        ${filtered.length === 0 ? `
          <div class="cust-card cust-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8A9995" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div class="cust-empty-title">No Queries Found</div>
            <div class="cust-empty-desc">
              ${this.searchQuery || this.activeFilter !== 'all' 
                ? 'No customer queries match your selected filter or search term. Try resetting your search.' 
                : 'You have not submitted any customer service inquiries yet.'}
            </div>
            ${this.searchQuery || this.activeFilter !== 'all' ? `
              <button class="cust-btn cust-btn-secondary" id="custResetFilterBtn" style="margin-top: 14px;">
                Reset Filters
              </button>
            ` : `
              <a href="#/customer_contact" class="cust-btn cust-btn-primary" style="margin-top: 14px;">
                Submit a Query
              </a>
            `}
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${filtered.map(q => this.renderQueryCard(q)).join('')}
          </div>
        `}

        <!-- Conversation Modal Container -->
        <div id="custQueryModalBackdrop" class="cust-modal-backdrop" style="display: none;"></div>
      </div>
    `;

    if (target) {
      target.innerHTML = html;
      this.bindEvents(target);

      // If a query was previously selected (e.g. from hash query param or click), re-open modal
      if (this.selectedQueryId) {
        this.openQueryModal(this.selectedQueryId);
      }
    }
    return html;
  },

  renderQueryCard(q) {
    const statusBadges = {
      'Open': '<span class="cust-badge cust-badge-transit"><span class="cust-pulse-dot" style="background:#18217E;"></span> Open</span>',
      'In Progress': '<span class="cust-badge cust-badge-pending"><span class="cust-pulse-dot" style="background:#424989;"></span> In Progress</span>',
      'Awaiting Customer': '<span class="cust-badge cust-badge-delayed"><span class="cust-pulse-dot"></span> Action Needed</span>',
      'Resolved': '<span class="cust-badge cust-badge-delivered">Resolved</span>'
    };

    const statusBadge = statusBadges[q.status] || `<span class="cust-badge cust-badge-pending">${q.status}</span>`;

    // Messages preview
    const messages = q.messages || [];
    const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const isLatestFromAgent = latestMsg && latestMsg.role !== 'Customer';

    return `
      <div class="cust-card" style="margin-bottom: 0; padding: 18px 22px; transition: transform 0.15s ease, box-shadow 0.15s ease; border-left: 4px solid ${this.getStatusBorderColor(q.status)};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
              <span style="font-weight: 800; color: #070724; font-size: 15px;">${this.escapeHtml(q.id)}</span>
              ${statusBadge}
              <span style="font-size: 12px; color: #8A9995; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                ${this.escapeHtml(q.category || 'General')}
              </span>
              <span style="font-size: 12px; color: #8A9995;">
                Shipment: <a href="#/customer_shipment_detail?id=${this.escapeHtml(q.shipmentId)}" style="color: #18217E; font-weight: 700; text-decoration: none;">${this.escapeHtml(q.shipmentId)}</a>
              </span>
            </div>
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #070724;">
              ${this.escapeHtml(q.subject)}
            </h3>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #393A50; line-height: 1.4; max-width: 800px;">
              ${this.escapeHtml(q.description)}
            </p>
          </div>

          <div style="text-align: right; min-width: 140px;">
            <div style="font-size: 11px; color: #8A9995; margin-bottom: 8px;">
              Submitted ${this.formatDateTime(q.createdAt)}
            </div>
            <button class="cust-btn cust-btn-primary cust-view-query-btn" data-query-id="${this.escapeHtml(q.id)}" style="font-size: 12px; padding: 7px 14px;">
              View Conversation (${messages.length})
            </button>
          </div>
        </div>

        <!-- Latest Message Callout -->
        ${latestMsg ? `
          <div style="margin-top: 12px; padding: 10px 14px; background: ${isLatestFromAgent ? '#EFF6FF' : '#F8FAFC'}; border-radius: 6px; border: 1px solid ${isLatestFromAgent ? '#BFDBFE' : '#E2E8F0'}; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; color: ${isLatestFromAgent ? '#18217E' : '#393A50'};">
                ${isLatestFromAgent ? '🛡️ Customer Care Representative (' + this.escapeHtml(latestMsg.author) + ')' : '👤 You (' + this.escapeHtml(latestMsg.author) + ')'}
              </span>
              <span style="color: #8A9995; font-size: 11px;">${this.formatDateTime(latestMsg.time)}</span>
            </div>
            <div style="color: #1e293b; line-height: 1.4;">
              ${this.escapeHtml(latestMsg.text)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  getStatusBorderColor(status) {
    switch (status) {
      case 'Open': return '#18217E';
      case 'In Progress': return '#424989';
      case 'Awaiting Customer': return '#EA341F';
      case 'Resolved': return '#15803d';
      default: return '#E5EBEE';
    }
  },

  openQueryModal(queryId) {
    this.selectedQueryId = queryId;
    const store = window.BRIDGES_STORE;
    const customer = store.getCurrentCustomerContext();
    const query = store.getCustomerQuery(queryId, customer.customerId);

    const backdrop = document.getElementById('custQueryModalBackdrop');
    if (!backdrop) return;

    if (!query) {
      backdrop.innerHTML = `
        <div class="cust-modal-content" style="max-width: 500px; padding: 24px; text-align: center;">
          <h3 style="color: #EA341F; margin-top: 0;">Query Not Accessible</h3>
          <p style="color: #393A50; font-size: 14px;">This support ticket does not belong to your authorized customer account or does not exist.</p>
          <button class="cust-btn cust-btn-secondary" id="custCloseModalBtn">Close</button>
        </div>
      `;
      backdrop.style.display = 'flex';
      document.getElementById('custCloseModalBtn').onclick = () => {
        backdrop.style.display = 'none';
        this.selectedQueryId = null;
      };
      return;
    }

    const messages = query.messages || [];
    const isResolved = query.status === 'Resolved';

    backdrop.innerHTML = `
      <div class="cust-modal-content" style="max-width: 720px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: #ffffff; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);">
        <!-- Modal Header -->
        <div style="padding: 18px 24px; background: #070724; color: #ffffff; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 16px; color: #ffffff;">${this.escapeHtml(query.id)}</span>
              <span class="cust-badge ${query.status === 'Resolved' ? 'cust-badge-delivered' : (query.status === 'Awaiting Customer' ? 'cust-badge-delayed' : 'cust-badge-transit')}" style="padding: 3px 8px; font-size: 11px;">
                ${this.escapeHtml(query.status)}
              </span>
              <span style="font-size: 11px; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 3px; color: #E5EBEE;">
                ${this.escapeHtml(query.category)}
              </span>
            </div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.3;">
              ${this.escapeHtml(query.subject)}
            </h2>
            <div style="font-size: 12px; color: #E5EBEE; margin-top: 4px;">
              Related Shipment: <a href="#/customer_shipment_detail?id=${this.escapeHtml(query.shipmentId)}" style="color: #E5EBEE; font-weight: 700; text-decoration: underline;">${this.escapeHtml(query.shipmentId)}</a>
              &bull; Created ${this.formatDateTime(query.createdAt)}
            </div>
          </div>
          <button id="custCloseModalBtn" style="background: transparent; border: none; color: #ffffff; cursor: pointer; padding: 4px; display: flex;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Initial Query Description / Details Box -->
        <div style="padding: 12px 24px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>Account:</strong> ${this.escapeHtml(query.customerName)} (${this.escapeHtml(query.customerId)})
          </div>
          <div>
            <strong>Contact Info:</strong> ${this.escapeHtml(query.contactEmail || 'N/A')} ${query.contactPhone ? '&bull; ' + this.escapeHtml(query.contactPhone) : ''}
          </div>
          <div>
            <strong>Preferred Method:</strong> ${this.escapeHtml(query.preferredMethod || 'Email')}
          </div>
        </div>

        <!-- Scrollable Conversation Thread -->
        <div id="custModalMessageThread" style="flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; background: #ffffff;">
          ${messages.map(m => {
            const isMe = m.role === 'Customer';
            return `
              <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px; font-size: 11px; color: #8A9995;">
                  <span style="font-weight: 700; color: ${isMe ? '#18217E' : '#070724'};">
                    ${isMe ? '👤 You (' + this.escapeHtml(m.author) + ')' : '🛡️ Customer Care (' + this.escapeHtml(m.author) + ')'}
                  </span>
                  <span>&bull;</span>
                  <span>${this.formatDateTime(m.time)}</span>
                </div>
                <div style="
                  max-width: 80%; 
                  padding: 12px 16px; 
                  border-radius: ${isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
                  background: ${isMe ? '#18217E' : '#F1F5F9'}; 
                  color: ${isMe ? '#ffffff' : '#0f172a'};
                  font-size: 13px;
                  line-height: 1.5;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                  word-break: break-word;
                ">
                  ${this.escapeHtml(m.text)}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Follow-up Response Box -->
        <div style="padding: 16px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
          ${isResolved ? `
            <div style="padding: 10px 14px; background: #DCFCE7; border: 1px solid #86EFAC; border-radius: 6px; color: #166534; font-size: 13px; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>This query has been marked as <strong>Resolved</strong> by Customer Care. If you still require assistance, please submit a new query from the contact page.</span>
            </div>
          ` : `
            <form id="custQueryReplyForm" style="display: flex; flex-direction: column; gap: 10px;">
              <div style="font-size: 12px; font-weight: 700; color: #070724;">
                Add Follow-up Message
              </div>
              <textarea 
                id="custQueryReplyText" 
                class="cust-form-input" 
                rows="2" 
                placeholder="Type additional details, response, or clarification..." 
                required
                style="resize: vertical; min-height: 60px; font-size: 13px;"
              ></textarea>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #8A9995;">
                  Messages are sent directly to the Customer Care queue.
                </span>
                <button type="submit" id="custQueryReplySubmitBtn" class="cust-btn cust-btn-primary" style="padding: 7px 18px; font-size: 13px;">
                  Send Reply
                </button>
              </div>
            </form>
          `}
        </div>
      </div>
    `;

    backdrop.style.display = 'flex';

    // Auto-scroll to bottom of messages
    const thread = document.getElementById('custModalMessageThread');
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }

    // Modal close handlers
    document.getElementById('custCloseModalBtn').onclick = () => {
      backdrop.style.display = 'none';
      this.selectedQueryId = null;
    };

    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        backdrop.style.display = 'none';
        this.selectedQueryId = null;
      }
    };

    // Reply form handler
    const replyForm = document.getElementById('custQueryReplyForm');
    if (replyForm) {
      replyForm.onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('custQueryReplyText').value;
        if (!text || !text.trim()) return;

        const authUser = window.BRIDGES_AUTH.getCurrentUser();
        const senderName = authUser ? authUser.name : "Customer";

        try {
          store.addCustomerQueryMessage(query.id, text.trim(), senderName, true);
          // Re-render modal thread
          this.openQueryModal(query.id);
          // Also re-render list behind modal
          const mainContainer = document.getElementById('mainContent') || document.querySelector('.main-content');
          if (mainContainer) {
            this.render(mainContainer);
          }
        } catch (err) {
          alert("Error sending message: " + err.message);
        }
      };
    }
  },

  bindEvents(container) {
    // Filter tab buttons
    container.querySelectorAll('.cust-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeFilter = btn.getAttribute('data-filter');
        this.render(container);
      };
    });

    // Search input
    const searchInput = container.querySelector('#custQuerySearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
        const newInp = container.querySelector('#custQuerySearchInput');
        if (newInp) {
          newInp.focus();
          newInp.setSelectionRange(newInp.value.length, newInp.value.length);
        }
      };
    }

    // Clear search button
    const clearBtn = container.querySelector('#custClearSearchBtn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.searchQuery = '';
        this.render(container);
      };
    }

    // Reset filters button
    const resetBtn = container.querySelector('#custResetFilterBtn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.searchQuery = '';
        this.activeFilter = 'all';
        this.render(container);
      };
    }

    // Open query buttons
    container.querySelectorAll('.cust-view-query-btn').forEach(btn => {
      btn.onclick = () => {
        const queryId = btn.getAttribute('data-query-id');
        this.openQueryModal(queryId);
      };
    });
  },

  formatDateTime(isoStr) {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
