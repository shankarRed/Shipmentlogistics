/**
 * BRIDGES Control Tower - UI Utilities & Shared Components
 * Toasts, modal managers, status badge renderers, date formatters, and table helpers
 */

const UI = {
  // Toast notifications
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let iconSvg = Icons.info(16);
    if (type === 'success') iconSvg = Icons.check(16);
    if (type === 'error') iconSvg = Icons.alertTriangle(16);

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">${Icons.x(14)}</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Confirmation Modal
  confirm({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', confirmType = 'danger', onConfirm }) {
    const modalEl = document.getElementById('app-confirm-modal');
    if (!modalEl) {
      if (window.confirm(message)) onConfirm();
      return;
    }

    const titleEl = modalEl.querySelector('.modal-title');
    const bodyEl = modalEl.querySelector('.modal-body');
    const confirmBtn = modalEl.querySelector('#confirm-modal-action-btn');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = `<p class="confirm-message">${message}</p>`;

    if (confirmBtn) {
      confirmBtn.textContent = confirmText;
      confirmBtn.className = `btn btn-${confirmType}`;
      
      // Replace button clone to clean old event listeners
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

      newBtn.onclick = () => {
        UI.closeModal('app-confirm-modal');
        if (typeof onConfirm === 'function') onConfirm();
      };
    }

    UI.openModal('app-confirm-modal');
  },

  openModal(modalId, title, content, sizeClass = '') {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const dialog = modal.querySelector('.modal-dialog');
    if (dialog) {
      dialog.classList.remove('modal-dialog-sm', 'modal-dialog-md', 'modal-dialog-lg', 'modal-dialog-xl');
      if (sizeClass) {
        if (sizeClass.startsWith('modal-dialog-')) {
          dialog.classList.add(sizeClass);
          dialog.style.maxWidth = '';
        } else {
          dialog.style.maxWidth = sizeClass;
        }
      } else {
        dialog.style.maxWidth = '';
      }
    }

    if (title !== undefined && title !== null) {
      const titleEl = modal.querySelector('.modal-title');
      if (titleEl) titleEl.textContent = title;
    }
    if (content !== undefined && content !== null) {
      const bodyEl = modal.querySelector('.modal-body');
      if (bodyEl) bodyEl.innerHTML = content;
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    const dialog = modal.querySelector('.modal-dialog');
    if (dialog) {
      dialog.classList.remove('modal-dialog-sm', 'modal-dialog-md', 'modal-dialog-lg', 'modal-dialog-xl');
      dialog.style.maxWidth = '';
    }
  },

  // Formatter for status badges matching prompt palette
  renderStatusBadge(status) {
    const s = (status || '').toLowerCase();
    let badgeClass = 'badge-neutral';

    if (s === 'active' || s === 'delivered' || s === 'resolved' || s === 'closed') {
      badgeClass = 'badge-success';
    } else if (s === 'on route' || s === 'loading') {
      badgeClass = 'badge-primary';
    } else if (s === 'delayed' || s === 'critical' || s === 'inactive') {
      badgeClass = 'badge-danger';
    } else if (s === 'maintenance' || s === 'high' || s === 'under investigation') {
      badgeClass = 'badge-warning';
    } else if (s === 'medium') {
      badgeClass = 'badge-secondary';
    } else if (s === 'low') {
      badgeClass = 'badge-muted';
    }

    return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${status}</span>`;
  },

  // Role badge formatter
  renderRoleBadge(role) {
    let cls = 'badge-role-default';
    if (role === 'Administrator') cls = 'badge-role-admin';
    if (role === 'Control Tower Analyst') cls = 'badge-role-analyst';
    if (role === 'Carrier Operations User') cls = 'badge-role-carrier';
    if (role === 'Dispatcher / Transport Planner') cls = 'badge-role-planner';
    if (role === 'Warehouse Supervisor') cls = 'badge-role-warehouse';
    if (role === 'Customer Service') cls = 'badge-role-support';

    return `<span class="badge ${cls}">${role}</span>`;
  },

  // Severity badge formatter with exact hex palette
  renderSeverityBadge(severity) {
    const sev = (severity || '').toLowerCase();
    let color = '#8A9995'; // Muted sage
    let bg = '#F0F3F4';
    let label = severity;

    if (sev === 'critical') {
      color = '#EA341F'; // Signal red
      bg = '#FDEBE9';
    } else if (sev === 'high') {
      color = '#8C2527'; // Deep red
      bg = '#F7EAEA';
    } else if (sev === 'medium') {
      color = '#424989'; // Slate indigo
      bg = '#ECEEF8';
    } else if (sev === 'low') {
      color = '#8A9995'; // Muted sage
      bg = '#F3F5F5';
    }

    return `<span class="severity-badge" style="color: ${color}; background-color: ${bg}; border-color: ${color}33;">
      <span class="severity-dot" style="background-color: ${color};"></span>
      ${label}
    </span>`;
  },

  // Date/Time formatter
  formatDate(isoString, includeTime = true) {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      
      if (!includeTime) return `${yyyy}-${mm}-${dd}`;

      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return isoString;
    }
  },

  // Empty state renderer
  renderEmptyState(title, description, actionHtml = '') {
    return `
      <div class="empty-state-panel">
        <div class="empty-state-icon">
          ${Icons.search(32)}
        </div>
        <h4 class="empty-state-title">${title}</h4>
        <p class="empty-state-desc">${description}</p>
        ${actionHtml ? `<div class="empty-state-action">${actionHtml}</div>` : ''}
      </div>
    `;
  }
};

window.UI = UI;
