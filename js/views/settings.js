/**
 * BRIDGES Control Tower - Settings View
 * Comprehensive administrative management:
 * 1. User Profile Edit (Details, Avatar, Password, Preferences)
 * 2. Application Appearance & Theme Customization (Themes & Accent Colors)
 * 3. Subscriptions & Billing (Plans, Quotas, Credit Card, Invoices)
 * 4. System & Operational SLA Boundaries (Branding, Deviations, Taxonomy, Demo Data)
 */

const SettingsView = {
  currentTab: 'notifications', // 'sla_rules' | 'notifications'

  // Pre-configured avatar presets for instant profile photo selection
  avatarPresets: [
    { id: 'av-1', label: 'Bima Ary (Coordinator)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' },
    { id: 'av-2', label: 'Sarah Lin (Analyst)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120' },
    { id: 'av-3', label: 'Elena Hernandez (Ops Director)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120' },
    { id: 'av-4', label: 'Marcus Vance (Fleet Manager)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
    { id: 'av-5', label: 'Carlos Mendoza (Warehouse)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
    { id: 'av-6', label: 'Clara Hughes (Care Specialist)', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=120' }
  ],

  // Theme presets definitions
  themes: [
    {
      id: 'light',
      name: 'Daylight Clean (Default)',
      description: 'Crisp high-readability daylight palette tailored for multi-screen operations control towers.',
      bgCanvas: '#F8F9FA',
      bgSidebar: '#F9FAFB',
      bgHeader: '#FFFFFF',
      accentColor: '#18217E',
      textColor: '#070724'
    },
    {
      id: 'dark',
      name: 'Obsidian Dark',
      description: 'Ultra-low eye strain dark mode with midnight slate panels and high-contrast alert borders.',
      bgCanvas: '#0B0F19',
      bgSidebar: '#0E1626',
      bgHeader: '#111827',
      accentColor: '#38BDF8',
      textColor: '#F8FAFC'
    },
    {
      id: 'midnight',
      name: 'Midnight Cyber Blue',
      description: 'Deep navy command center aesthetic with vibrant cobalt glowing accents and telemetry emphasis.',
      bgCanvas: '#070D1E',
      bgSidebar: '#0A122C',
      bgHeader: '#0F172A',
      accentColor: '#2563EB',
      textColor: '#F1F5F9'
    },
    {
      id: 'emerald',
      name: 'Emerald Eco-Logistics',
      description: 'Sustainable green logistics theme highlighting eco-friendly fleet routing and carbon tracking.',
      bgCanvas: '#F0FDF4',
      bgSidebar: '#F7FEE7',
      bgHeader: '#FFFFFF',
      accentColor: '#059669',
      textColor: '#064E3B'
    },
    {
      id: 'sunset',
      name: 'Sunset Amber Industrial',
      description: 'Warm freight terminal palette inspired by trans-continental transport hubs and cargo ports.',
      bgCanvas: '#FFFBEB',
      bgSidebar: '#FEF3C7',
      bgHeader: '#FFFFFF',
      accentColor: '#EA580C',
      textColor: '#451A03'
    }
  ],

  // Curated corporate accent swatches
  accentSwatches: [
    { name: 'Royal Navy (Default)', hex: '#18217E' },
    { name: 'Electric Cobalt', hex: '#2563EB' },
    { name: 'Forest Emerald', hex: '#059669' },
    { name: 'Signal Crimson', hex: '#EA341F' },
    { name: 'Deep Violet', hex: '#7C3AED' },
    { name: 'Industrial Amber', hex: '#EA580C' }
  ],

  // Subscription plan tiers catalog
  plans: [
    {
      id: 'starter',
      name: 'Starter Fleet',
      tagline: 'Ideal for regional carriers & local dispatch hubs',
      price: '$490',
      period: '/ month (billed annually)',
      features: [
        'Up to 200 concurrent active shipments',
        'Up to 5 carrier integrations',
        'Standard GPS telemetry polling (5 min intervals)',
        '3 analyst & dispatcher seats',
        'Standard email ticket support (24h response)'
      ],
      isPopular: false
    },
    {
      id: 'professional',
      name: 'Professional Control',
      tagline: 'Multi-hub logistics networks with active exception mitigation',
      price: '$1,250',
      period: '/ month (billed annually)',
      features: [
        'Up to 500 concurrent active shipments',
        'Up to 12 carrier integrations',
        'Real-time IoT sensor & temperature alerts',
        '8 analyst, dispatcher & warehouse seats',
        'Automated diversion and recovery dispatch',
        'Business hours priority phone & chat support'
      ],
      isPopular: false
    },
    {
      id: 'enterprise-elite',
      name: 'Enterprise Logistics Elite',
      tagline: 'Mission-critical trans-continental control towers',
      price: '$2,400',
      period: '/ month (billed annually)',
      features: [
        'Up to 1,000 concurrent active shipments',
        'Up to 25 connected carrier integrations',
        'Unlimited sub-second IoT telemetry streaming',
        '15 role-gated admin & analyst seats',
        'AI-driven proactive exception recovery workflows',
        'Custom branded customer tracking portals',
        '99.99% Control Tower SLA uptime guarantee',
        '24/7 Dedicated Logistics Mission Support'
      ],
      isPopular: true
    },
    {
      id: 'sovereign',
      name: 'Global Sovereign',
      tagline: 'Global conglomerates requiring custom private cloud deployments',
      price: '$4,800',
      period: '/ month (billed annually)',
      features: [
        'Unlimited concurrent shipments & carriers',
        'Unlimited enterprise seats & customer portals',
        'Private cloud / on-premise data residency',
        'Custom bespoke AI risk model fine-tuning',
        'Dedicated Solutions Architect & Technical TAM'
      ],
      isPopular: false
    }
  ],

  switchTab(tab) {
    if (tab === 'notifications') {
      this.currentTab = 'notifications';
      if (window.App && typeof window.App.navigateTo === 'function') {
        window.App.navigateTo('notifications_config');
        return;
      }
    } else if (tab === 'ai_approval') {
      this.currentTab = 'ai_approval';
      if (window.App && typeof window.App.navigateTo === 'function') {
        window.App.navigateTo('ai_config');
        return;
      }
    } else {
      this.currentTab = 'sla_rules';
      if (window.App && typeof window.App.navigateTo === 'function') {
        window.App.navigateTo('sla_rules');
        return;
      }
    }
    if (window.App) {
      window.App.renderCurrentView();
    }
  },

  render() {
    this.currentTab = 'sla_rules';

    return `
      <div class="view-settings animate-fade-in">
        <!-- Header -->
        <div class="page-action-header">
          <div class="header-text-block">
            <h2 class="page-heading">SLA Rules &amp; Operational Boundaries</h2>
            <p class="page-subheading">Configure operational SLA resolution boundaries, deviation thresholds, and automated breach notifications.</p>
          </div>
        </div>

        <!-- Render SLA Rules Directly -->
        ${this.renderSlaRulesTab()}
      </div>
    `;
  },

  // =========================================================================
  // TAB 1: USER PROFILE & ACCOUNT DETAILS EDIT
  // =========================================================================
  renderProfileTab(user) {
    const avatarUrl = user.avatar || this.avatarPresets[0].url;

    return `
      <div class="settings-tab-content animate-fade-in">
        <!-- Hero Identity Card -->
        <div class="profile-hero-card">
          <div class="profile-hero-left">
            <div class="profile-avatar-preview-wrap">
              <img src="${avatarUrl}" alt="${user.name}" id="hero-avatar-preview" class="profile-avatar-preview-lg">
              <span class="profile-avatar-online-dot" title="Session Authenticated & Active"></span>
            </div>
            <div class="profile-hero-meta">
              <h3 id="hero-display-name">${user.name}</h3>
              <p>${user.title || user.role} &bull; <span id="hero-display-email">${user.email}</span></p>
              <div class="profile-hero-badges">
                <span class="badge badge-primary">${user.role}</span>
                <span class="badge badge-secondary">${user.department || 'Global Control Operations'}</span>
                <span class="badge badge-success">ID: ${user.id || 'USR-101'}</span>
                <span class="badge badge-muted">Online Now</span>
              </div>
            </div>
          </div>
          <div class="profile-hero-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="App.showProfileMenu()">
              ${Icons.user ? Icons.user(14) : ''} Switch Active Role
            </button>
          </div>
        </div>

        <div class="settings-sections-grid">
          <!-- Profile Information Form -->
          <div class="panel settings-card" style="grid-column: span 2;">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Personal &amp; Operational Information</h3>
                <span class="text-sm text-muted">Update your administrative profile details and public contact card across the tower.</span>
              </div>
            </div>

            <form onsubmit="SettingsView.handleSaveUserProfile(event)">
              <!-- Avatar Preset Quick-Selector -->
              <div class="mb-4">
                <label class="avatar-presets-label">Select Profile Photo Preset or Enter Custom Image URL</label>
                <div class="avatar-presets-grid">
                  ${this.avatarPresets.map(preset => `
                    <button type="button" 
                      class="avatar-preset-btn ${preset.url === avatarUrl ? 'active' : ''}" 
                      onclick="SettingsView.selectAvatarPreset('${preset.url}', this)"
                      title="${preset.label}">
                      <img src="${preset.url}" alt="${preset.label}" class="avatar-preset-img">
                    </button>
                  `).join('')}
                </div>
                <div class="form-group">
                  <label class="form-label" for="profile-avatar-url">Avatar Photo URL</label>
                  <input type="url" id="profile-avatar-url" name="avatar" class="form-control" 
                    value="${avatarUrl}" 
                    oninput="SettingsView.handleAvatarUrlInput(this.value)" 
                    placeholder="https://example.com/photo.jpg" required>
                  <span class="field-hint">Real-time image preview will update instantly above and in the sidebar.</span>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-name">Full Display Name</label>
                  <input type="text" id="profile-name" name="name" class="form-control" value="${user.name || ''}" required>
                  <span class="field-hint">Rendered in audit logs and dispatch authorizations.</span>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-email">Work Email Address</label>
                  <input type="email" id="profile-email" name="email" class="form-control" value="${user.email || ''}" required>
                  <span class="field-hint">Used for system authentication and incident alerts.</span>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-phone">Mobile / Hotline Contact</label>
                  <input type="tel" id="profile-phone" name="phone" class="form-control" value="${user.phone || '+1 (555) 019-2834'}">
                  <span class="field-hint">Used for urgent SMS exception dispatches.</span>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-title">Official Job Title</label>
                  <input type="text" id="profile-title" name="title" class="form-control" value="${user.title || 'Control Tower Coordinator'}" required>
                  <span class="field-hint">Shown in the sidebar user card and signature.</span>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-dept">Department / Division</label>
                  <select id="profile-dept" name="department" class="form-control">
                    <option value="Global Control Tower Operations" ${user.department === 'Global Control Tower Operations' ? 'selected' : ''}>Global Control Tower Operations</option>
                    <option value="Supply Chain Analytics & Intelligence" ${user.department === 'Supply Chain Analytics & Intelligence' ? 'selected' : ''}>Supply Chain Analytics & Intelligence</option>
                    <option value="Carrier Network Governance" ${user.department === 'Carrier Network Governance' ? 'selected' : ''}>Carrier Network Governance</option>
                    <option value="Incident Response & War Room" ${user.department === 'Incident Response & War Room' ? 'selected' : ''}>Incident Response & War Room</option>
                    <option value="Customer Experience & Resolution" ${user.department === 'Customer Experience & Resolution' ? 'selected' : ''}>Customer Experience & Resolution</option>
                  </select>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="profile-timezone">Personal Preferred Timezone</label>
                  <select id="profile-timezone" name="timezone" class="form-control">
                    <option value="UTC (Coordinated Universal Time)" selected>UTC (Coordinated Universal Time)</option>
                    <option value="EST (US Eastern Standard Time)">EST (US Eastern Standard Time)</option>
                    <option value="CST (US Central Standard Time)">CST (US Central Standard Time)</option>
                    <option value="PST (US Pacific Standard Time)">PST (US Pacific Standard Time)</option>
                    <option value="CET (Central European Time)">CET (Central European Time)</option>
                    <option value="SGT (Singapore Standard Time)">SGT (Singapore Standard Time)</option>
                  </select>
                </div>

                <div class="form-group col-12 mb-3">
                  <label class="form-label" for="profile-bio">Operational Responsibilities &amp; Shift Notes</label>
                  <textarea id="profile-bio" name="bio" rows="2" class="form-control" placeholder="E.g., Primary coordinator for Trans-Pacific reefer shipments, priority escalation handler.">${user.bio || 'Lead administrator overseeing multi-modal North American freight exceptions and automated SLA compliance.'}</textarea>
                </div>
              </div>

              <!-- Notification Preferences -->
              <div class="mt-4 pt-3 border-t" style="border-top: 1px solid var(--color-border);">
                <h4 class="font-bold text-sm mb-2 text-midnight">Real-time Notification Preferences</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 16px;">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" name="notifCriticalBreach" checked>
                    <span>Critical SLA breach push alerts</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" name="notifReeferTemp" checked>
                    <span>Cold-chain reefer temperature deviations</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" name="notifCarrierDisruption" checked>
                    <span>Carrier breakdown &amp; handover alerts</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" name="notifDailyDigest" checked>
                    <span>Daily executive SLA summary email</span>
                  </label>
                </div>
              </div>

              <div class="flex-between mt-4">
                <button type="submit" class="btn btn-primary" id="btn-save-profile">
                  ${Icons.check ? Icons.check(14) : ''} Save Profile Changes
                </button>
                <span class="text-xs text-muted">All updates persist locally and reflect immediately across the navigation cards.</span>
              </div>
            </form>
          </div>

          <!-- Password & Security Card -->
          <div class="panel settings-card" style="grid-column: span 2;">
            <div class="panel-header">
              <h3 class="panel-title">Security &amp; Password Management</h3>
            </div>
            <form onsubmit="SettingsView.handleUpdatePassword(event)">
              <div class="form-grid">
                <div class="form-group col-4 mb-3">
                  <label class="form-label" for="sec-current-pass">Current Password</label>
                  <input type="password" id="sec-current-pass" name="currentPassword" class="form-control" placeholder="••••••••" required>
                  <span class="field-hint">Default demo password is <strong>1</strong></span>
                </div>

                <div class="form-group col-4 mb-3">
                  <label class="form-label" for="sec-new-pass">New Password</label>
                  <input type="password" id="sec-new-pass" name="newPassword" class="form-control" placeholder="••••••••" required>
                  <span class="field-hint">Minimum 6 characters recommended</span>
                </div>

                <div class="form-group col-4 mb-3">
                  <label class="form-label" for="sec-confirm-pass">Confirm New Password</label>
                  <input type="password" id="sec-confirm-pass" name="confirmPassword" class="form-control" placeholder="••••••••" required>
                  <span class="field-hint">Must match new password exactly</span>
                </div>
              </div>

              <div class="flex-between mt-2">
                <button type="submit" class="btn btn-secondary btn-sm">
                  ${Icons.shieldCheck ? Icons.shieldCheck(14) : ''} Update Security Password
                </button>
                <span class="text-xs text-muted">Two-factor authentication (2FA) is enforced via Enterprise SSO.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleAvatarUrlInput(url) {
    const preview = document.getElementById('hero-avatar-preview');
    if (preview && url) {
      preview.src = url;
    }
  },

  selectAvatarPreset(url, btnElement) {
    const input = document.getElementById('profile-avatar-url');
    if (input) {
      input.value = url;
      this.handleAvatarUrlInput(url);
    }
    // Update active ring
    document.querySelectorAll('.avatar-preset-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
      btnElement.classList.add('active');
    }
  },

  handleSaveUserProfile(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const title = form.title.value.trim();
    const department = form.department.value;
    const timezone = form.timezone.value;
    const bio = form.bio.value.trim();
    const avatar = form.avatar.value.trim();

    if (!name || !email) {
      UI.showToast('Please provide your name and work email.', 'error');
      return;
    }

    const result = window.BRIDGES_AUTH.updateCurrentUser({
      name,
      email,
      phone,
      title,
      department,
      timezone,
      bio,
      avatar
    });

    if (result.success) {
      UI.showToast(`User details updated successfully for ${name}.`, 'success');
      // Re-render view to refresh data
      SettingsView.render();
    } else {
      UI.showToast(result.error || 'Failed to update user profile.', 'error');
    }
  },

  handleUpdatePassword(e) {
    e.preventDefault();
    const form = e.target;
    const curr = form.currentPassword.value;
    const n = form.newPassword.value;
    const c = form.confirmPassword.value;

    if (curr !== '1') {
      UI.showToast('Current password does not match (Default demo password is 1).', 'error');
      return;
    }
    if (n.length < 1) {
      UI.showToast('New password cannot be empty.', 'error');
      return;
    }
    if (n !== c) {
      UI.showToast('New password and confirmation do not match.', 'error');
      return;
    }

    form.reset();
    if (window.BRIDGES_STORE) {
      window.BRIDGES_STORE.logAudit('Password Changed', 'Security', 'User Account', 'User password updated successfully.');
    }
    UI.showToast('Password updated successfully.', 'success');
  },

  // =========================================================================
  // TAB 2: APPEARANCE & THEME CUSTOMIZATION
  // =========================================================================
  renderAppearanceTab(activeTheme, activeAccent) {
    return `
      <div class="settings-tab-content animate-fade-in">
        <div class="panel settings-card mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Application Theme Palettes</h3>
              <span class="text-sm text-muted">Select an interface theme. Changes apply immediately and persist globally across sessions.</span>
            </div>
            <span class="badge badge-primary">Active: ${this.themes.find(t => t.id === activeTheme)?.name || 'Daylight Clean'}</span>
          </div>

          <!-- 5 Theme Cards Grid -->
          <div class="theme-card-grid">
            ${this.themes.map(t => {
              const isActive = t.id === activeTheme;
              return `
                <div class="theme-card ${isActive ? 'active' : ''}" onclick="SettingsView.selectTheme('${t.id}')">
                  <div class="theme-card-active-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  
                  <!-- Miniature Mockup Preview -->
                  <div class="theme-card-preview" style="background: ${t.bgCanvas};">
                    <div class="theme-preview-sidebar" style="background: ${t.bgSidebar}; border-right: 1px solid rgba(0,0,0,0.08);">
                      <div style="padding: 6px 4px; display: flex; flex-direction: column; gap: 4px;">
                        <div style="height: 6px; width: 80%; background: ${t.accentColor}; border-radius: 2px;"></div>
                        <div style="height: 4px; width: 60%; background: rgba(100,116,139,0.3); border-radius: 2px;"></div>
                        <div style="height: 4px; width: 70%; background: rgba(100,116,139,0.3); border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div class="theme-preview-body">
                      <div class="theme-preview-topbar" style="background: ${t.bgHeader};">
                        <span class="theme-preview-topbar-dot" style="background: #EA341F;"></span>
                        <span class="theme-preview-topbar-dot" style="background: #F59E0B;"></span>
                        <span class="theme-preview-topbar-dot" style="background: #10B981;"></span>
                      </div>
                      <div class="theme-preview-canvas">
                        <div class="theme-preview-mock-card" style="background: ${t.bgHeader}; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
                        <div class="theme-preview-mock-bar" style="background: ${t.accentColor};"></div>
                      </div>
                    </div>
                  </div>

                  <h4 class="theme-card-title">${t.name}</h4>
                  <p class="theme-card-desc">${t.description}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Custom Brand Accent Color Customizer -->
        <div class="accent-picker-section">
          <div class="flex-between">
            <div>
              <h3 class="panel-title">Brand Accent Color Customizer</h3>
              <p class="text-sm text-muted">Customize the primary operational accent color (active navigation, primary buttons, badges, and focus outlines).</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.resetThemeAndAccent()">
              ${Icons.refresh ? Icons.refresh(13) : ''} Reset to Default
            </button>
          </div>

          <div class="accent-swatches-wrap">
            ${this.accentSwatches.map(swatch => {
              const isMatch = activeAccent.toLowerCase() === swatch.hex.toLowerCase();
              return `
                <div class="accent-swatch ${isMatch ? 'active' : ''}" 
                  style="background: ${swatch.hex};" 
                  title="${swatch.name} (${swatch.hex})"
                  onclick="SettingsView.selectAccent('${swatch.hex}')">
                </div>
              `;
            }).join('')}

            <!-- Custom Color Picker -->
            <div class="custom-color-input-wrap">
              <input type="color" 
                class="custom-color-picker-input" 
                id="custom-accent-picker" 
                value="${activeAccent}" 
                onchange="SettingsView.selectAccent(this.value)"
                title="Select Custom Hex Color">
              <span class="text-xs font-semibold text-midnight">Custom: <span id="custom-hex-label">${activeAccent}</span></span>
            </div>
          </div>

          <!-- Live Interactive Component Preview Box -->
          <div class="theme-live-preview-box">
            <div class="text-xs font-bold text-muted uppercase mb-2">Live Component Appearance Preview:</div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm">
                Primary Action Button
              </button>
              <button type="button" class="btn btn-secondary btn-sm">
                Secondary Button
              </button>
              <span class="badge badge-primary">
                Active Tier Badge
              </span>
              <span class="badge badge-success">
                System Optimal
              </span>
              <span class="badge badge-warning">
                Delayed (+2.5h)
              </span>
              <span class="badge badge-danger">
                SLA Breach (Critical)
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectTheme(themeId) {
    if (window.App && window.App.setTheme) {
      window.App.setTheme(themeId);
      UI.showToast(`Switched theme to "${this.themes.find(t => t.id === themeId)?.name || themeId}".`, 'success');
      App.renderCurrentView();
    }
  },

  selectAccent(colorHex) {
    if (window.App && window.App.setAccentColor) {
      window.App.setAccentColor(colorHex);
      UI.showToast(`Accent color updated to ${colorHex}.`, 'success');
      App.renderCurrentView();
    }
  },

  resetThemeAndAccent() {
    if (window.App) {
      window.App.setTheme('light');
      window.App.setAccentColor('#18217E');
      UI.showToast('Theme and accent reset to default BRIDGES palette.', 'info');
      App.renderCurrentView();
    }
  },

  // =========================================================================
  // TAB 3: SUBSCRIPTIONS, QUOTAS & BILLING
  // =========================================================================
  renderSubscriptionsTab(subscription) {
    const sub = subscription || {};
    const quotas = sub.quotas || {
      activeShipments: { used: 412, limit: 1000, unit: "shipments" },
      carrierIntegrations: { used: 18, limit: 25, unit: "connected carriers" },
      apiCallsThisMonth: { used: 482100, limit: 1000000, unit: "API requests" },
      userSeats: { used: 8, limit: 15, unit: "analyst & admin seats" }
    };
    const payment = sub.paymentMethod || {
      brand: "MasterCard",
      last4: "8824",
      expiry: "09/28",
      holder: "Bima Ary - Enterprise Tech Corp"
    };
    const invoices = sub.invoices || [];

    const shipmentsPct = Math.round((quotas.activeShipments.used / quotas.activeShipments.limit) * 100);
    const carriersPct = Math.round((quotas.carrierIntegrations.used / quotas.carrierIntegrations.limit) * 100);
    const apiPct = Math.round((quotas.apiCallsThisMonth.used / quotas.apiCallsThisMonth.limit) * 100);
    const seatsPct = Math.round((quotas.userSeats.used / quotas.userSeats.limit) * 100);

    return `
      <div class="settings-tab-content animate-fade-in">
        <!-- Active Subscription Overview Banner -->
        <div class="subscription-banner">
          <div>
            <div class="sub-banner-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>CURRENT ACTIVE PLAN: <strong>${sub.planName || 'Enterprise Logistics Elite'}</strong></span>
            </div>
            <h2 class="sub-banner-title">${sub.planName || 'Enterprise Logistics Elite'}</h2>
            <p class="sub-banner-subtitle">Next auto-renewal on <strong>${sub.renewalDate || 'January 15, 2027'}</strong> &bull; Status: <span style="color: #34D399; font-weight: 700;">Active (Good Standing)</span></p>
          </div>
          <div class="sub-banner-pricing">
            <div class="sub-price-num">${sub.price || '$2,400 / month'}</div>
            <div class="sub-price-cycle">${sub.billingCycle || 'Annual Billing'} (Saving 20% vs monthly)</div>
            <button type="button" class="btn btn-secondary btn-sm mt-2" onclick="SettingsView.promptChangePlan()" style="background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4);">
              Change Plan Tier
            </button>
          </div>
        </div>

        <!-- Resource Quotas & Usage Meters Grid -->
        <div class="quota-meters-grid">
          <!-- Meter 1: Active Shipments -->
          <div class="quota-meter-card">
            <div class="quota-header">
              <span class="quota-title">Active Shipments Quota</span>
              <span class="badge ${shipmentsPct > 90 ? 'badge-danger' : shipmentsPct > 70 ? 'badge-warning' : 'badge-success'}">${shipmentsPct}%</span>
            </div>
            <div class="quota-numbers">${quotas.activeShipments.used.toLocaleString()} <span class="text-xs text-muted">/ ${quotas.activeShipments.limit.toLocaleString()}</span></div>
            <div class="quota-bar-track">
              <div class="quota-bar-fill ${shipmentsPct > 90 ? 'danger' : shipmentsPct > 70 ? 'warn' : 'safe'}" style="width: ${shipmentsPct}%;"></div>
            </div>
            <span class="text-xs text-muted">${quotas.activeShipments.limit - quotas.activeShipments.used} shipments remaining</span>
          </div>

          <!-- Meter 2: Carrier Integrations -->
          <div class="quota-meter-card">
            <div class="quota-header">
              <span class="quota-title">Carrier Integrations</span>
              <span class="badge ${carriersPct > 90 ? 'badge-danger' : carriersPct > 70 ? 'badge-warning' : 'badge-success'}">${carriersPct}%</span>
            </div>
            <div class="quota-numbers">${quotas.carrierIntegrations.used} <span class="text-xs text-muted">/ ${quotas.carrierIntegrations.limit}</span></div>
            <div class="quota-bar-track">
              <div class="quota-bar-fill ${carriersPct > 90 ? 'danger' : carriersPct > 70 ? 'warn' : 'safe'}" style="width: ${carriersPct}%;"></div>
            </div>
            <span class="text-xs text-muted">${quotas.carrierIntegrations.limit - quotas.carrierIntegrations.used} carrier slots available</span>
          </div>

          <!-- Meter 3: Telemetry API Calls -->
          <div class="quota-meter-card">
            <div class="quota-header">
              <span class="quota-title">Monthly Telemetry API Calls</span>
              <span class="badge ${apiPct > 90 ? 'badge-danger' : apiPct > 70 ? 'badge-warning' : 'badge-success'}">${apiPct}%</span>
            </div>
            <div class="quota-numbers">${(quotas.apiCallsThisMonth.used / 1000).toFixed(1)}k <span class="text-xs text-muted">/ ${(quotas.apiCallsThisMonth.limit / 1000).toFixed(0)}k</span></div>
            <div class="quota-bar-track">
              <div class="quota-bar-fill ${apiPct > 90 ? 'danger' : apiPct > 70 ? 'warn' : 'safe'}" style="width: ${apiPct}%;"></div>
            </div>
            <span class="text-xs text-muted">IoT GPS telemetry &amp; webhooks</span>
          </div>

          <!-- Meter 4: User Seats -->
          <div class="quota-meter-card">
            <div class="quota-header">
              <span class="quota-title">Assigned User Seats</span>
              <span class="badge ${seatsPct > 90 ? 'badge-danger' : seatsPct > 70 ? 'badge-warning' : 'badge-success'}">${seatsPct}%</span>
            </div>
            <div class="quota-numbers">${quotas.userSeats.used} <span class="text-xs text-muted">/ ${quotas.userSeats.limit}</span></div>
            <div class="quota-bar-track">
              <div class="quota-bar-fill ${seatsPct > 90 ? 'danger' : seatsPct > 70 ? 'warn' : 'safe'}" style="width: ${seatsPct}%;"></div>
            </div>
            <span class="text-xs text-muted">${quotas.userSeats.limit - quotas.userSeats.used} unassigned seats</span>
          </div>
        </div>

        <!-- Plan Tier Comparison -->
        <div class="panel settings-card mb-4">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Available Subscription Plans &amp; Capabilities</h3>
              <p class="text-sm text-muted">Scale your control tower coverage as your enterprise freight volume grows.</p>
            </div>
          </div>

          <div class="plan-tier-grid">
            ${this.plans.map(p => {
              const isActivePlan = sub.planId === p.id || (p.id === 'enterprise-elite' && (!sub.planId || sub.planId === 'enterprise-elite'));
              return `
                <div class="plan-tier-card ${isActivePlan ? 'featured' : ''}">
                  ${p.isPopular ? '<span class="plan-tier-popular-tag">Active Enterprise Plan</span>' : ''}
                  <h4 class="plan-tier-name">${p.name}</h4>
                  <p class="plan-tier-desc">${p.tagline}</p>
                  <div class="plan-tier-price">${p.price} <small>${p.period}</small></div>

                  <ul class="plan-tier-features">
                    ${p.features.map(f => `
                      <li class="plan-tier-feature-item">
                        <span class="check-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        <span>${f}</span>
                      </li>
                    `).join('')}
                  </ul>

                  ${isActivePlan ? `
                    <button type="button" class="btn btn-secondary w-full" disabled style="opacity: 0.9; font-weight: 700;">
                      ${Icons.check ? Icons.check(14) : ''} Current Active Plan
                    </button>
                  ` : `
                    <button type="button" class="btn btn-primary w-full" onclick="SettingsView.selectPlan('${p.id}', '${p.name}', '${p.price} / month')">
                      Switch to ${p.name}
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Payment Method & Invoice Billing History -->
        <div class="settings-sections-grid">
          <!-- Payment Method Card -->
          <div class="panel settings-card">
            <div class="panel-header">
              <h3 class="panel-title">Payment Method &amp; Billing Entity</h3>
            </div>
            
            <div class="credit-card-preview mb-3">
              <div class="card-top-row">
                <div class="card-chip"></div>
                <div class="card-brand-logo">${payment.brand || 'MasterCard'}</div>
              </div>
              <div class="card-number-display">•••• &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ${payment.last4 || '8824'}</div>
              <div class="card-bottom-row">
                <div>
                  <div style="font-size: 9px; opacity: 0.7;">CARDHOLDER</div>
                  <div class="card-holder-name">${payment.holder || 'BIMA ARY - ENTERPRISE TECH CORP'}</div>
                </div>
                <div>
                  <div style="font-size: 9px; opacity: 0.7;">EXPIRES</div>
                  <div class="card-expiry">${payment.expiry || '09/28'}</div>
                </div>
              </div>
            </div>

            <div style="font-size: 12px; color: var(--color-charcoal); margin-bottom: 14px; line-height: 1.5;">
              <div><strong>Billing Entity:</strong> Enterprise Tech Global Inc.</div>
              <div><strong>Tax ID:</strong> US-EIN-94-3829104</div>
              <div><strong>Billing Contact:</strong> billing@bridges-control.io</div>
            </div>

            <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.promptUpdatePayment()">
              ${Icons.edit ? Icons.edit(13) : ''} Update Payment Details
            </button>
          </div>

          <!-- Billing Invoices History -->
          <div class="panel settings-card">
            <div class="panel-header">
              <h3 class="panel-title">Billing &amp; Invoice History</h3>
            </div>
            
            <div class="table-responsive">
              <table class="table data-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th class="text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoices.map(inv => `
                    <tr>
                      <td class="font-bold text-navy">${inv.id}</td>
                      <td>${inv.date}</td>
                      <td class="font-bold">${inv.amount}</td>
                      <td>
                        <span class="badge badge-success">${inv.status}</span>
                      </td>
                      <td class="text-right">
                        <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 11px;" onclick="SettingsView.downloadInvoice('${inv.id}', '${inv.amount}', '${inv.date}')">
                          Receipt
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectPlan(planId, planName, price) {
    UI.confirm({
      title: `Confirm Subscription Change`,
      message: `Are you sure you want to switch your active subscription tier to "${planName}" (${price})? Resource quotas will be adjusted immediately.`,
      confirmText: 'Confirm Plan Switch',
      confirmType: 'primary',
      onConfirm: () => {
        let quotas = {
          activeShipments: { used: 412, limit: 1000, unit: "shipments" },
          carrierIntegrations: { used: 18, limit: 25, unit: "connected carriers" },
          apiCallsThisMonth: { used: 482100, limit: 1000000, unit: "API requests" },
          userSeats: { used: 8, limit: 15, unit: "analyst & admin seats" }
        };

        if (planId === 'starter') {
          quotas = {
            activeShipments: { used: 180, limit: 200, unit: "shipments" },
            carrierIntegrations: { used: 4, limit: 5, unit: "connected carriers" },
            apiCallsThisMonth: { used: 95000, limit: 200000, unit: "API requests" },
            userSeats: { used: 3, limit: 3, unit: "analyst seats" }
          };
        } else if (planId === 'professional') {
          quotas = {
            activeShipments: { used: 320, limit: 500, unit: "shipments" },
            carrierIntegrations: { used: 10, limit: 12, unit: "connected carriers" },
            apiCallsThisMonth: { used: 310000, limit: 500000, unit: "API requests" },
            userSeats: { used: 6, limit: 8, unit: "analyst seats" }
          };
        } else if (planId === 'sovereign') {
          quotas = {
            activeShipments: { used: 412, limit: 10000, unit: "shipments" },
            carrierIntegrations: { used: 18, limit: 500, unit: "connected carriers" },
            apiCallsThisMonth: { used: 482100, limit: 10000000, unit: "API requests" },
            userSeats: { used: 8, limit: 100, unit: "analyst seats" }
          };
        }

        window.BRIDGES_STORE.updateSubscription({
          planId,
          planName,
          price,
          quotas
        });

        UI.showToast(`Plan successfully switched to ${planName}.`, 'success');
        App.renderCurrentView();
      }
    });
  },

  promptChangePlan() {
    this.currentTab = 'subscriptions';
    App.renderCurrentView();
    const grid = document.querySelector('.plan-tier-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  },

  promptUpdatePayment() {
    const sub = window.BRIDGES_STORE.getSubscription();
    const curr = sub.paymentMethod || {};

    UI.openModal('generic-app-modal', 'Update Billing Payment Method', `
      <form onsubmit="SettingsView.handleSavePayment(event)" style="padding: 6px 0;">
        <div class="form-group mb-3">
          <label class="form-label" for="pm-holder">Cardholder Name</label>
          <input type="text" id="pm-holder" name="holder" class="form-control" value="${curr.holder || ''}" required>
        </div>

        <div class="form-group mb-3">
          <label class="form-label" for="pm-number">Card Number</label>
          <input type="text" id="pm-number" name="cardNumber" class="form-control" value="•••• •••• •••• ${curr.last4 || '8824'}" required>
        </div>

        <div class="form-grid">
          <div class="form-group col-6 mb-3">
            <label class="form-label" for="pm-expiry">Expiration Date</label>
            <input type="text" id="pm-expiry" name="expiry" class="form-control" value="${curr.expiry || '09/28'}" placeholder="MM/YY" required>
          </div>

          <div class="form-group col-6 mb-3">
            <label class="form-label" for="pm-cvv">Security Code (CVC)</label>
            <input type="password" id="pm-cvv" name="cvc" class="form-control" value="824" placeholder="CVC" required>
          </div>
        </div>

        <div class="flex-between mt-3">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Payment Method</button>
        </div>
      </form>
    `);
  },

  handleSavePayment(e) {
    e.preventDefault();
    const form = e.target;
    const holder = form.holder.value.trim();
    const expiry = form.expiry.value.trim();
    const rawCard = form.cardNumber.value.replace(/\s+/g, '');
    const last4 = rawCard.slice(-4) || '8824';

    window.BRIDGES_STORE.updateSubscription({
      paymentMethod: {
        brand: 'MasterCard',
        last4,
        expiry,
        holder
      }
    });

    UI.closeModal('generic-app-modal');
    UI.showToast('Payment method updated successfully.', 'success');
    App.renderCurrentView();
  },

  downloadInvoice(invId, amount, date) {
    UI.showToast(`Generating invoice PDF receipt for ${invId}...`, 'info');
    setTimeout(() => {
      // Simulate download via dynamic anchor
      const receiptContent = `==========================================================\nBRIDGES CONTROL TOWER - ENTERPRISE SUBSCRIPTION INVOICE\n==========================================================\nInvoice ID: ${invId}\nBilling Date: ${date}\nAmount Paid: ${amount} (USD)\nStatus: PAID\nPayment Method: MasterCard ending in 8824\nBilled To: Enterprise Tech Global Inc. (Tax ID: US-EIN-94-3829104)\nPlan: Enterprise Logistics Elite\nUptime Guarantee: 99.99%\n==========================================================\nThank you for choosing BRIDGES Shipment Exception Control Tower.\n`;
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invId}-Receipt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.showToast(`Receipt ${invId} downloaded.`, 'success');
    }, 400);
  },

  // =========================================================================
  // TAB 4: SYSTEM & OPERATIONAL SLA BOUNDARIES (PRESERVED FUNCTIONALITY)
  // =========================================================================
  renderSystemTab(settings) {
    return `
      <div class="settings-tab-content animate-fade-in">
        <div class="settings-sections-grid">
          <!-- Section 1: General Application Identity -->
          <div class="panel settings-card">
            <div class="panel-header">
              <h3 class="panel-title">General Platform Identity</h3>
            </div>
            <form onsubmit="SettingsView.handleSaveGeneral(event)">
              <div class="form-group mb-3">
                <label class="form-label" for="set-app-name">Application Display Title</label>
                <input type="text" id="set-app-name" name="appName" class="form-control" value="${settings.appName || ''}" required>
                <span class="field-hint">Updates the top bar and document metadata title in real-time.</span>
              </div>

              <div class="form-group mb-3">
                <label class="form-label" for="set-timezone">Operational Time Zone</label>
                <select id="set-timezone" name="timeZone" class="form-control">
                  <option value="UTC (Coordinated Universal Time)" selected>UTC (Coordinated Universal Time)</option>
                  <option value="EST (Eastern Standard Time)">EST (Eastern Standard Time)</option>
                  <option value="PST (Pacific Standard Time)">PST (Pacific Standard Time)</option>
                  <option value="CET (Central European Time)">CET (Central European Time)</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary btn-sm">
                ${Icons.check ? Icons.check(14) : ''} Save Branding
              </button>
            </form>
          </div>

          <!-- Section 2: SLA & Delay Thresholds -->
          <div class="panel settings-card">
            <div class="panel-header">
              <h3 class="panel-title">SLA &amp; Deviation Thresholds</h3>
            </div>
            <form onsubmit="SettingsView.handleSaveSla(event)">
              <div class="form-grid">
                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="set-delay-warn">Delay Warning Threshold (Hours)</label>
                  <input type="number" step="0.5" id="set-delay-warn" name="delayWarningHours" class="form-control" value="${settings.delayWarningHours || 2}" required>
                  <span class="field-hint">Triggers yellow status flag.</span>
                </div>

                <div class="form-group col-6 mb-3">
                  <label class="form-label" for="set-sla-breach">SLA Breach Threshold (Hours)</label>
                  <input type="number" step="0.5" id="set-sla-breach" name="slaBreachHours" class="form-control" value="${settings.slaBreachHours || 4}" required>
                  <span class="field-hint">Triggers red breach alert.</span>
                </div>

                <div class="form-group col-12 mb-3">
                  <label class="form-label" for="set-dwell-alert">Excessive Dwell Time Alert (Hours)</label>
                  <input type="number" step="1" id="set-dwell-alert" name="dwellAlertHours" class="form-control" value="${settings.dwellAlertHours || 6}" required>
                  <span class="field-hint">Triggers terminal dwell warning when cargo rests stationary.</span>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-sm">
                ${Icons.check ? Icons.check(14) : ''} Update SLA Parameters
              </button>
            </form>
          </div>

          <!-- Section 3: Exception Taxonomy Categories -->
          <div class="panel settings-card col-span-2">
            <div class="panel-header">
              <div class="flex-between w-full">
                <h3 class="panel-title">Configurable Exception Categories</h3>
                <button class="btn btn-secondary btn-sm" onclick="SettingsView.promptAddCategory()">
                  ${Icons.plus ? Icons.plus(14) : ''} Add Category
                </button>
              </div>
            </div>

            <div class="category-pills-wrap">
              ${(settings.exceptionCategories || []).map(cat => `
                <div class="category-badge-chip">
                  <span>${cat}</span>
                  <button type="button" class="chip-delete-btn" onclick="SettingsView.removeCategory('${cat}')" title="Remove category">
                    ${Icons.x ? Icons.x(12) : '×'}
                  </button>
                </div>
              `).join('')}
            </div>
            <span class="field-hint mt-2 block">Categories populate dropdowns when analysts record deviations.</span>
          </div>

          <!-- Section 4: Demo Data Management (localStorage Persistence) -->
          <div class="panel settings-card col-span-2 border-danger-subtle">
            <div class="panel-header">
              <h3 class="panel-title text-danger">Dataset &amp; Environment Controls</h3>
            </div>
            <p class="text-sm text-midnight mb-3">
              BRIDGES Control Tower stores and synchronizes live enterprise operational records persistently. 
              You can re-initialize the baseline dataset or reset state for compliance auditing.
            </p>

            <div class="dataset-actions-row">
              <button class="btn btn-secondary" onclick="SettingsView.confirmReloadSampleData()">
                ${Icons.refresh ? Icons.refresh(16) : ''} Reload Benchmark Demo Dataset
              </button>
              <button class="btn btn-danger" onclick="SettingsView.confirmClearAllData()">
                ${Icons.trash ? Icons.trash(16) : ''} Reset to Clean Empty State
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveGeneral(e) {
    e.preventDefault();
    const form = e.target;
    const appName = form.appName.value.trim();
    const timeZone = form.timeZone.value;

    window.BRIDGES_STORE.updateSettings({ appName, timeZone });
    
    // Update header brand
    const headerTitle = document.getElementById('topbar-page-brand');
    if (headerTitle) headerTitle.textContent = appName;

    UI.showToast('Platform branding saved.', 'success');
  },

  handleSaveSla(e) {
    e.preventDefault();
    const form = e.target;
    const delayWarningHours = parseFloat(form.delayWarningHours.value);
    const slaBreachHours = parseFloat(form.slaBreachHours.value);
    const dwellAlertHours = parseFloat(form.dwellAlertHours.value);

    window.BRIDGES_STORE.updateSettings({
      delayWarningHours,
      slaBreachHours,
      dwellAlertHours
    });

    UI.showToast('SLA threshold parameters updated.', 'success');
  },

  promptAddCategory() {
    const newCat = window.prompt("Enter new exception category name (e.g. Hazardous Spill, Port Labor Strike):");
    if (newCat && newCat.trim()) {
      const clean = newCat.trim();
      const settings = window.BRIDGES_STORE.getSettings();
      const categories = [...(settings.exceptionCategories || [])];

      if (categories.includes(clean)) {
        UI.showToast('Category already exists.', 'error');
        return;
      }

      categories.push(clean);
      window.BRIDGES_STORE.updateSettings({ exceptionCategories: categories });
      UI.showToast(`Category "${clean}" added.`, 'success');
      App.renderCurrentView();
    }
  },

  removeCategory(cat) {
    const settings = window.BRIDGES_STORE.getSettings();
    let categories = [...(settings.exceptionCategories || [])];
    if (categories.length <= 1) {
      UI.showToast('Must preserve at least one exception category.', 'error');
      return;
    }

    categories = categories.filter(c => c !== cat);
    window.BRIDGES_STORE.updateSettings({ exceptionCategories: categories });
    UI.showToast(`Category "${cat}" removed.`, 'info');
    App.renderCurrentView();
  },

  confirmReloadSampleData() {
    UI.confirm({
      title: 'Reload Benchmark Dataset',
      message: 'This will restore the realistic benchmark dataset with sample logistics shipments, carriers, users, fleet vehicles, and exceptions. Existing edits will be re-seeded.',
      confirmText: 'Reload Benchmark Data',
      confirmType: 'primary',
      onConfirm: () => {
        window.BRIDGES_STORE.resetToSampleData();
        UI.showToast('Benchmark sample dataset restored.', 'success');
        App.renderCurrentView();
      }
    });
  },

  confirmClearAllData() {
    UI.confirm({
      title: 'Reset to Empty State',
      message: 'This will clear all operational carriers, vehicles, drivers, shipments, and exceptions to evaluate application empty states. The Administrator account will be preserved.',
      confirmText: 'Clear Operational Records',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.clearAllData();
        UI.showToast('All operational records cleared.', 'info');
        App.renderCurrentView();
      }
    });
  },

  // =========================================================================
  // TAB: SLA & RULE CONFIGURATION
  // =========================================================================
  renderSlaRulesTab() {
    const slaRules = window.BRIDGES_STORE.getSlaRules();
    const gracePeriods = window.BRIDGES_STORE.getGracePeriods();
    const penalties = window.BRIDGES_STORE.getPenalties();

    return `
      <div class="settings-tab-content animate-fade-in">
        <!-- Section 1: SLA Rules & Deadlines -->
        <div class="panel mb-4">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 class="panel-title">SLA Rules &amp; Service Delivery Deadlines</h3>
              <p class="text-xs text-muted">Define delivery and pickup deadlines, grace buffers, penalty tariffs, and target compliance commitments per transport modality.</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="SettingsView.openAddSlaRuleModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New SLA Rule
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rule ID &amp; Name</th>
                  <th>Modality</th>
                  <th>Pickup Deadline</th>
                  <th>Delivery Deadline</th>
                  <th>Grace Buffer</th>
                  <th>Penalty Rate</th>
                  <th>Target SLA</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${slaRules.map(rule => `
                  <tr>
                    <td>
                      <div class="font-bold text-navy">${rule.name}</div>
                      <span class="text-xs text-muted">${rule.id} &bull; ${rule.description || 'Standard logistics SLA'}</span>
                    </td>
                    <td>
                      <span class="badge badge-secondary">${rule.modality}</span>
                    </td>
                    <td class="font-bold">${rule.pickupDeadlineHours} hr${rule.pickupDeadlineHours === 1 ? '' : 's'}</td>
                    <td class="font-bold">${rule.deliveryDeadlineHours} hrs</td>
                    <td>
                      <span class="badge badge-success" style="font-size: 11px;">+${rule.gracePeriodMinutes} mins</span>
                    </td>
                    <td>
                      <div class="font-bold text-danger">$${rule.delayPenaltyPerHour.toLocaleString()}/hr</div>
                      <span class="text-xs text-muted">Cap: $${rule.maxPenaltyCap.toLocaleString()}</span>
                    </td>
                    <td>
                      <span class="badge badge-primary" style="font-weight: 700;">${rule.targetCompliancePct}%</span>
                    </td>
                    <td style="text-align: right;">
                      <div class="row-actions" style="display: inline-flex; justify-content: flex-end; gap: 4px;">
                        <button type="button" class="btn-icon-action" onclick="SettingsView.openEditSlaRuleModal('${rule.id}')" title="Edit SLA Rule">
                          ${Icons.edit(15)}
                        </button>
                        <button type="button" class="btn-icon-action text-danger" onclick="SettingsView.handleDeleteSlaRule('${rule.id}')" title="Delete SLA Rule">
                          ${Icons.trash(15)}
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: 2-Column Grid (Grace Periods & Penalties) -->
        <div class="dashboard-grid-2col mb-4">
          <!-- Column A: Grace Periods & Dwell Buffers -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Operational Grace Periods &amp; Buffers</h3>
                <p class="text-xs text-muted">Tolerance windows applied before dispatching automated deviation alerts or computing penalties.</p>
              </div>
            </div>
            <form onsubmit="SettingsView.handleSaveGracePeriods(event)" style="padding: 16px;">
              <div class="mb-3">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Pickup Departure Grace Buffer (Minutes)</label>
                <input type="number" name="pickupGraceMinutes" class="login-input" style="width: 100%; padding: 8px;" value="${gracePeriods.pickupGraceMinutes || 20}" required min="0" max="240">
                <span class="text-xs text-muted">Allowed delay beyond scheduled origin gate window before missed-pickup flag.</span>
              </div>
              <div class="mb-3">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">En-Route Waypoint Checkpoint Grace (Minutes)</label>
                <input type="number" name="checkpointGraceMinutes" class="login-input" style="width: 100%; padding: 8px;" value="${gracePeriods.checkpointGraceMinutes || 30}" required min="0" max="240">
                <span class="text-xs text-muted">Telemetry milestone arrival variance tolerance before route deviation alert.</span>
              </div>
              <div class="mb-3">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Final Destination Delivery Grace Buffer (Minutes)</label>
                <input type="number" name="deliveryGraceMinutes" class="login-input" style="width: 100%; padding: 8px;" value="${gracePeriods.deliveryGraceMinutes || 45}" required min="0" max="360">
                <span class="text-xs text-muted">Customer delivery SLA grace buffer before liquidated damages begin accruing.</span>
              </div>
              <div class="mb-4">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Excessive Dwell / Non-Terminal Idle Tolerance (Hours)</label>
                <input type="number" step="0.5" name="excessiveDwellToleranceHours" class="login-input" style="width: 100%; padding: 8px;" value="${gracePeriods.excessiveDwellToleranceHours || 4.0}" required min="0.5" max="24">
                <span class="text-xs text-muted">Maximum stationary vehicle idle time allowed along transit corridors before triggering dwell escalation.</span>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">
                Save Grace Period Buffers
              </button>
            </form>
          </div>

          <!-- Column B: Financial Penalties & Demurrage -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Financial Penalties &amp; Demurrage Tariffs</h3>
                <p class="text-xs text-muted">Automated contractual compensation rates debited from carrier freight settlements upon verified SLA default.</p>
              </div>
            </div>
            <form onsubmit="SettingsView.handleSavePenalties(event)" style="padding: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="mb-3">
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Standard Delay ($/hour)</label>
                  <input type="number" name="standardDelayPerHour" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.standardDelayPerHour || 250}" required min="0">
                </div>
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Critical Tier Delay ($/hour)</label>
                  <input type="number" name="criticalDelayPerHour" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.criticalDelayPerHour || 1200}" required min="0">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="mb-3">
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Missed Scheduled Pickup Fee ($)</label>
                  <input type="number" name="missedPickupFee" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.missedPickupFee || 500}" required min="0">
                </div>
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Port / Yard Demurrage ($/hour)</label>
                  <input type="number" name="portDemurragePerHour" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.portDemurragePerHour || 450}" required min="0">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Thermal Excursion Direct Damage Liability ($)</label>
                <input type="number" name="thermalBreachDamage" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.thermalBreachDamage || 25000}" required min="0">
                <span class="text-xs text-muted">Fixed carrier liability cap for spoilage of temperature-sensitive biologic cold-chain cargo.</span>
              </div>
              <div class="mb-4">
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Maximum Invoice Delay Penalty Cap (%)</label>
                <input type="number" name="lateDeliveryInvoiceCapPct" class="login-input" style="width: 100%; padding: 8px;" value="${penalties.lateDeliveryInvoiceCapPct || 25}" required min="5" max="100">
                <span class="text-xs text-muted">Aggregate penalty deduction ceiling expressed as percentage of shipment freight charge.</span>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">
                Save Penalty Schedules
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  // Modals & Handlers for SLA & Rules
  openAddSlaRuleModal() {
    const newId = `SLA-RULE-0${window.BRIDGES_STORE.getSlaRules().length + 1}`;
    UI.openModal('generic-app-modal', 'Add New SLA Commitment Rule', `
      <form onsubmit="SettingsView.handleSaveSlaRule(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${newId}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" required placeholder="e.g. Hazardous Materials Priority Expedited">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Customer Tier</label>
            <select name="tier" class="login-input">
              <option value="Tier 1 Strategic">Tier 1 Strategic</option>
              <option value="Tier 2 Commercial">Tier 2 Commercial</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Transport Modality</label>
            <select name="modality" class="login-input">
              <option value="All">All Modalities</option>
              <option value="Ground">Ground Freight</option>
              <option value="Air">Air Express</option>
              <option value="Sea">Ocean Drayage</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Pickup Deadline (Hrs)</label>
            <input type="number" step="0.5" name="pickupDeadlineHours" class="login-input" value="2.0" required min="0.5">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delivery Deadline (Hrs)</label>
            <input type="number" step="1" name="deliveryDeadlineHours" class="login-input" value="24.0" required min="1">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Grace Period (Mins)</label>
            <input type="number" name="gracePeriodMinutes" class="login-input" value="30" required min="0">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delay Penalty ($/hr)</label>
            <input type="number" name="delayPenaltyPerHour" class="login-input" value="450" required min="0">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Max Penalty Cap ($)</label>
            <input type="number" name="maxPenaltyCap" class="login-input" value="10000" required min="0">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Target SLA (%)</label>
            <input type="number" step="0.1" name="targetCompliancePct" class="login-input" value="98.5" required min="80" max="100">
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Description</label>
          <input type="text" name="description" class="login-input" placeholder="Brief context on freight class and delivery SLA">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save SLA Rule</button>
        </div>
      </form>
    `);
  },

  openEditSlaRuleModal(ruleId) {
    const rule = window.BRIDGES_STORE.getSlaRules().find(r => r.id === ruleId);
    if (!rule) return;

    UI.openModal('generic-app-modal', `Edit SLA Rule: ${rule.name}`, `
      <form onsubmit="SettingsView.handleSaveSlaRule(event, '${rule.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${rule.id}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" value="${rule.name}" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Customer Tier</label>
            <select name="tier" class="login-input">
              <option value="Tier 1 Strategic" ${rule.tier === 'Tier 1 Strategic' ? 'selected' : ''}>Tier 1 Strategic</option>
              <option value="Tier 2 Commercial" ${rule.tier === 'Tier 2 Commercial' ? 'selected' : ''}>Tier 2 Commercial</option>
              <option value="Standard" ${rule.tier === 'Standard' ? 'selected' : ''}>Standard</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Transport Modality</label>
            <select name="modality" class="login-input">
              <option value="All" ${rule.modality === 'All' ? 'selected' : ''}>All Modalities</option>
              <option value="Ground" ${rule.modality === 'Ground' ? 'selected' : ''}>Ground Freight</option>
              <option value="Air" ${rule.modality === 'Air' ? 'selected' : ''}>Air Express</option>
              <option value="Sea" ${rule.modality === 'Sea' ? 'selected' : ''}>Ocean Drayage</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Pickup Deadline (Hrs)</label>
            <input type="number" step="0.5" name="pickupDeadlineHours" class="login-input" value="${rule.pickupDeadlineHours}" required min="0.5">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delivery Deadline (Hrs)</label>
            <input type="number" step="1" name="deliveryDeadlineHours" class="login-input" value="${rule.deliveryDeadlineHours}" required min="1">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Grace Period (Mins)</label>
            <input type="number" name="gracePeriodMinutes" class="login-input" value="${rule.gracePeriodMinutes}" required min="0">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delay Penalty ($/hr)</label>
            <input type="number" name="delayPenaltyPerHour" class="login-input" value="${rule.delayPenaltyPerHour}" required min="0">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Max Penalty Cap ($)</label>
            <input type="number" name="maxPenaltyCap" class="login-input" value="${rule.maxPenaltyCap}" required min="0">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Target SLA (%)</label>
            <input type="number" step="0.1" name="targetCompliancePct" class="login-input" value="${rule.targetCompliancePct}" required min="80" max="100">
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Description</label>
          <input type="text" name="description" class="login-input" value="${rule.description || ''}">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    `);
  },

  handleSaveSlaRule(event, existingRuleId) {
    event.preventDefault();
    const form = event.target;
    const ruleData = {
      id: form.id.value,
      name: form.name.value.trim(),
      tier: (form.tier && form.tier.value) || 'Standard',
      modality: form.modality.value,
      pickupDeadlineHours: parseFloat(form.pickupDeadlineHours.value),
      deliveryDeadlineHours: parseFloat(form.deliveryDeadlineHours.value),
      gracePeriodMinutes: parseInt(form.gracePeriodMinutes.value, 10),
      delayPenaltyPerHour: parseFloat(form.delayPenaltyPerHour.value),
      maxPenaltyCap: parseFloat(form.maxPenaltyCap.value),
      targetCompliancePct: parseFloat(form.targetCompliancePct.value),
      description: form.description.value.trim()
    };

    if (existingRuleId) {
      window.BRIDGES_STORE.updateSlaRule(existingRuleId, ruleData);
      UI.showToast(`SLA Rule "${ruleData.name}" updated.`, 'success');
    } else {
      window.BRIDGES_STORE.addSlaRule(ruleData);
      UI.showToast(`SLA Rule "${ruleData.name}" added successfully.`, 'success');
    }

    UI.closeModal('generic-app-modal');
    App.renderCurrentView();
  },

  handleDeleteSlaRule(ruleId) {
    UI.confirm({
      title: 'Delete SLA Rule',
      message: `Are you sure you want to remove SLA Rule ${ruleId}? This will remove penalty rate boundaries associated with this service level.`,
      confirmText: 'Delete SLA Rule',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteSlaRule(ruleId);
        UI.showToast(`SLA Rule ${ruleId} deleted.`, 'info');
        App.renderCurrentView();
      }
    });
  },

  handleSaveGracePeriods(event) {
    event.preventDefault();
    const form = event.target;
    const updates = {
      pickupGraceMinutes: parseInt(form.pickupGraceMinutes.value, 10),
      checkpointGraceMinutes: parseInt(form.checkpointGraceMinutes.value, 10),
      deliveryGraceMinutes: parseInt(form.deliveryGraceMinutes.value, 10),
      excessiveDwellToleranceHours: parseFloat(form.excessiveDwellToleranceHours.value)
    };
    window.BRIDGES_STORE.updateGracePeriods(updates);
    UI.showToast('Grace period buffers updated successfully.', 'success');
    App.renderCurrentView();
  },

  handleSavePenalties(event) {
    event.preventDefault();
    const form = event.target;
    const updates = {
      standardDelayPerHour: parseFloat(form.standardDelayPerHour.value),
      criticalDelayPerHour: parseFloat(form.criticalDelayPerHour.value),
      missedPickupFee: parseFloat(form.missedPickupFee.value),
      portDemurragePerHour: parseFloat(form.portDemurragePerHour.value),
      thermalBreachDamage: parseFloat(form.thermalBreachDamage.value),
      lateDeliveryInvoiceCapPct: parseFloat(form.lateDeliveryInvoiceCapPct.value)
    };
    window.BRIDGES_STORE.updatePenalties(updates);
    UI.showToast('Contractual penalty schedules updated.', 'success');
    App.renderCurrentView();
  },

  handleToggleDetectionRule(ruleId) {
    const rule = window.BRIDGES_STORE.getExceptionDetectionRules().find(r => r.id === ruleId);
    if (!rule) return;
    const updatedStatus = !rule.active;
    window.BRIDGES_STORE.updateExceptionDetectionRule(ruleId, { active: updatedStatus });
    UI.showToast(`Rule ${rule.id} (${rule.name}) is now ${updatedStatus ? 'Active' : 'Disabled'}.`, 'info');
    App.renderCurrentView();
  },

  openAddDetectionRuleModal() {
    const count = window.BRIDGES_STORE.getExceptionDetectionRules().length + 1;
    const newId = `ED-0${count}`;
    UI.openModal('generic-app-modal', 'Create Automated Detection Rule', `
      <form onsubmit="SettingsView.handleSaveDetectionRule(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${newId}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" required placeholder="e.g. Excessive Border Dwell">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Exception Category</label>
            <select name="category" class="login-input">
              <option value="Route Delay">Route Delay</option>
              <option value="Temperature Breach">Temperature Breach</option>
              <option value="Excessive Dwell Time">Excessive Dwell Time</option>
              <option value="Missed Pickup">Missed Pickup</option>
              <option value="Customs Hold">Customs Hold</option>
              <option value="Documentation Defect">Documentation Defect</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Assigned Severity</label>
            <select name="assignedSeverity" class="login-input">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High" selected>High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Trigger Condition Logic</label>
          <input type="text" name="triggerCondition" class="login-input" required placeholder="e.g. Dwell Duration > Tolerance at customs border checkpoint">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Threshold Value</label>
            <input type="number" step="1" name="thresholdValue" class="login-input" value="45" required>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Threshold Unit</label>
            <input type="text" name="thresholdUnit" class="login-input" value="Minutes" required>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Automated Action on Trigger</label>
          <input type="text" name="autoAction" class="login-input" value="Ingest to Intervention Queue" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Add Detection Rule</button>
        </div>
      </form>
    `);
  },

  openEditDetectionRuleModal(ruleId) {
    const rule = window.BRIDGES_STORE.getExceptionDetectionRules().find(r => r.id === ruleId);
    if (!rule) return;

    UI.openModal('generic-app-modal', `Edit Detection Rule: ${rule.id}`, `
      <form onsubmit="SettingsView.handleSaveDetectionRule(event, '${rule.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${rule.id}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" value="${rule.name}" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Exception Category</label>
            <select name="category" class="login-input">
              <option value="Route Delay" ${rule.category === 'Route Delay' ? 'selected' : ''}>Route Delay</option>
              <option value="Temperature Breach" ${rule.category === 'Temperature Breach' ? 'selected' : ''}>Temperature Breach</option>
              <option value="Excessive Dwell Time" ${rule.category === 'Excessive Dwell Time' ? 'selected' : ''}>Excessive Dwell Time</option>
              <option value="Missed Pickup" ${rule.category === 'Missed Pickup' ? 'selected' : ''}>Missed Pickup</option>
              <option value="Customs Hold" ${rule.category === 'Customs Hold' ? 'selected' : ''}>Customs Hold</option>
              <option value="Documentation Defect" ${rule.category === 'Documentation Defect' ? 'selected' : ''}>Documentation Defect</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Assigned Severity</label>
            <select name="assignedSeverity" class="login-input">
              <option value="Low" ${rule.assignedSeverity === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Medium" ${rule.assignedSeverity === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="High" ${rule.assignedSeverity === 'High' ? 'selected' : ''}>High</option>
              <option value="Critical" ${rule.assignedSeverity === 'Critical' ? 'selected' : ''}>Critical</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Trigger Condition Logic</label>
          <input type="text" name="triggerCondition" class="login-input" value="${rule.triggerCondition}" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Threshold Value</label>
            <input type="number" step="1" name="thresholdValue" class="login-input" value="${rule.thresholdValue}" required>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Threshold Unit</label>
            <input type="text" name="thresholdUnit" class="login-input" value="${rule.thresholdUnit}" required>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Automated Action on Trigger</label>
          <input type="text" name="autoAction" class="login-input" value="${rule.autoAction}" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    `);
  },

  handleSaveDetectionRule(event, existingRuleId) {
    event.preventDefault();
    const form = event.target;
    const ruleData = {
      id: form.id.value,
      name: form.name.value.trim(),
      category: form.category.value,
      assignedSeverity: form.assignedSeverity.value,
      triggerCondition: form.triggerCondition.value.trim(),
      thresholdValue: parseFloat(form.thresholdValue.value),
      thresholdUnit: form.thresholdUnit.value.trim(),
      autoAction: form.autoAction.value.trim(),
      active: true
    };

    if (existingRuleId) {
      window.BRIDGES_STORE.updateExceptionDetectionRule(existingRuleId, ruleData);
      UI.showToast(`Detection rule ${ruleData.id} updated.`, 'success');
    } else {
      window.BRIDGES_STORE.addExceptionDetectionRule(ruleData);
      UI.showToast(`Detection rule ${ruleData.id} created.`, 'success');
    }

    UI.closeModal('generic-app-modal');
    App.renderCurrentView();
  },

  handleDeleteDetectionRule(ruleId) {
    UI.confirm({
      title: 'Delete Exception Detection Rule',
      message: `Delete automated detection rule ${ruleId}? Telemetry will no longer trigger incidents under this condition.`,
      confirmText: 'Delete Rule',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteExceptionDetectionRule(ruleId);
        UI.showToast(`Detection rule ${ruleId} removed.`, 'info');
        App.renderCurrentView();
      }
    });
  },

  handleSaveSeverityRules(event) {
    event.preventDefault();
    const form = event.target;
    const current = window.BRIDGES_STORE.getSeverityRules();
    const updates = {
      criticalCriteria: {
        ...(current.criticalCriteria || {}),
        minCargoValue: parseFloat(form.critCargoVal.value),
        minDelayHours: parseFloat(form.critDelayHrs.value)
      },
      highCriteria: {
        ...(current.highCriteria || {}),
        minCargoValue: parseFloat(form.highCargoVal.value),
        minDelayHours: parseFloat(form.highDelayHrs.value)
      },
      mediumCriteria: {
        ...(current.mediumCriteria || {}),
        minDelayHours: parseFloat(form.medDelayHrs.value)
      },
      lowCriteria: {
        ...(current.lowCriteria || {}),
        maxDelayHours: parseFloat(form.lowDelayHrs.value)
      }
    };
    window.BRIDGES_STORE.updateSeverityRules(updates);
    UI.showToast('Severity classification parameters saved.', 'success');
    App.renderCurrentView();
  },

  handleToggleAutoResolutionRule(ruleId) {
    const rule = window.BRIDGES_STORE.getAutoResolutionRules().find(r => r.id === ruleId);
    if (!rule) return;
    const updated = !rule.active;
    window.BRIDGES_STORE.updateAutoResolutionRule(ruleId, { active: updated });
    UI.showToast(`Auto-resolution rule ${rule.id} is now ${updated ? 'Active' : 'Disabled'}.`, 'info');
    App.renderCurrentView();
  },

  openAddAutoResolutionRuleModal() {
    const count = window.BRIDGES_STORE.getAutoResolutionRules().length + 1;
    const newId = `AR-0${count}`;
    UI.openModal('generic-app-modal', 'Create Low-Severity Auto-Resolution Rule', `
      <form onsubmit="SettingsView.handleSaveAutoResolutionRule(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${newId}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" required placeholder="e.g. En-Route Speed Recovery">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Exception Type Target</label>
            <select name="exceptionType" class="login-input">
              <option value="Route Delay">Route Delay</option>
              <option value="Excessive Dwell Time">Excessive Dwell Time</option>
              <option value="Customs Hold">Customs Hold</option>
              <option value="Documentation Defect">Documentation Defect</option>
              <option value="Traffic Congestion">Traffic Congestion</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Max Validation Retries</label>
            <input type="number" name="maxRetryAttempts" class="login-input" value="3" required min="1" max="10">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Resolution Condition Criteria</label>
          <input type="text" name="condition" class="login-input" required placeholder="e.g. Telemetry indicates vehicle speed > 60 km/h for 20+ mins">
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Auto-Close Action</label>
          <input type="text" name="autoCloseAction" class="login-input" value="Mark Resolved & Notify Analyst" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Create Rule</button>
        </div>
      </form>
    `);
  },

  openEditAutoResolutionRuleModal(ruleId) {
    const rule = window.BRIDGES_STORE.getAutoResolutionRules().find(r => r.id === ruleId);
    if (!rule) return;

    UI.openModal('generic-app-modal', `Edit Auto-Resolution Rule: ${rule.id}`, `
      <form onsubmit="SettingsView.handleSaveAutoResolutionRule(event, '${rule.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule ID</label>
            <input type="text" name="id" class="login-input" value="${rule.id}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Rule Name</label>
            <input type="text" name="name" class="login-input" value="${rule.name}" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Exception Type Target</label>
            <select name="exceptionType" class="login-input">
              <option value="Route Delay" ${rule.exceptionType === 'Route Delay' ? 'selected' : ''}>Route Delay</option>
              <option value="Excessive Dwell Time" ${rule.exceptionType === 'Excessive Dwell Time' ? 'selected' : ''}>Excessive Dwell Time</option>
              <option value="Customs Hold" ${rule.exceptionType === 'Customs Hold' ? 'selected' : ''}>Customs Hold</option>
              <option value="Documentation Defect" ${rule.exceptionType === 'Documentation Defect' ? 'selected' : ''}>Documentation Defect</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Max Validation Retries</label>
            <input type="number" name="maxRetryAttempts" class="login-input" value="${rule.maxRetryAttempts}" required min="1" max="10">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Resolution Condition Criteria</label>
          <input type="text" name="condition" class="login-input" value="${rule.condition}" required>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Auto-Close Action</label>
          <input type="text" name="autoCloseAction" class="login-input" value="${rule.autoCloseAction}" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    `);
  },

  handleSaveAutoResolutionRule(event, existingRuleId) {
    event.preventDefault();
    const form = event.target;
    const ruleData = {
      id: form.id.value,
      name: form.name.value.trim(),
      exceptionType: form.exceptionType.value,
      maxRetryAttempts: parseInt(form.maxRetryAttempts.value, 10),
      condition: form.condition.value.trim(),
      autoCloseAction: form.autoCloseAction.value.trim(),
      active: true
    };

    if (existingRuleId) {
      window.BRIDGES_STORE.updateAutoResolutionRule(existingRuleId, ruleData);
      UI.showToast(`Auto-resolution rule ${ruleData.id} updated.`, 'success');
    } else {
      window.BRIDGES_STORE.addAutoResolutionRule(ruleData);
      UI.showToast(`Auto-resolution rule ${ruleData.id} created.`, 'success');
    }

    UI.closeModal('generic-app-modal');
    App.renderCurrentView();
  },

  handleDeleteAutoResolutionRule(ruleId) {
    UI.confirm({
      title: 'Delete Auto-Resolution Rule',
      message: `Delete auto-resolution rule ${ruleId}? Low-severity incidents matching this condition will require manual analyst closure.`,
      confirmText: 'Delete Rule',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteAutoResolutionRule(ruleId);
        UI.showToast(`Auto-resolution rule ${ruleId} removed.`, 'info');
        App.renderCurrentView();
      }
    });
  },

  // =========================================================================
  // TAB: NOTIFICATION CONFIGURATION
  // =========================================================================
  renderNotificationsTab() {
    const templates = window.BRIDGES_STORE.getNotificationTemplates();

    return `
      <div class="settings-tab-content animate-fade-in">
        <div class="panel mb-4">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 class="panel-title">Notification Templates &amp; Messaging Automation</h3>
              <p class="text-xs text-muted">Create and manage multi-channel alert templates with dynamic placeholders for customers, carriers, dispatchers, and tower analysts.</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="SettingsView.openAddNotificationTemplateModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create New Template
            </button>
          </div>

          <!-- Templates Grid -->
          <div style="padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;">
            ${templates.map(tmpl => `
              <div style="border: 1px solid #E5EBEE; border-radius: 8px; padding: 16px; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <div class="font-bold text-navy" style="font-size: 14px;">${tmpl.name}</div>
                      <span class="text-xs text-muted">${tmpl.id} &bull; Trigger: <strong>${tmpl.triggerEvent}</strong></span>
                    </div>
                    <button type="button" class="btn btn-sm ${tmpl.active ? 'btn-primary' : 'btn-secondary'}" onclick="SettingsView.handleToggleNotificationTemplate('${tmpl.id}')" style="font-size: 10px; padding: 2px 7px;">
                      ${tmpl.active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
                    <span class="badge badge-primary" style="font-size: 10.5px;">Audience: ${tmpl.audience}</span>
                    ${(tmpl.channels || []).map(ch => `
                      <span class="badge badge-secondary" style="font-size: 10.5px;">${ch}</span>
                    `).join('')}
                  </div>

                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Subject Template:</div>
                    <div style="font-size: 11.5px; color: #334155; font-family: monospace; line-height: 1.4;">${tmpl.subjectTemplate}</div>
                  </div>

                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Message Body Excerpt:</div>
                    <div style="font-size: 11.5px; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                      ${tmpl.bodyTemplate}
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 10px; margin-top: 6px;">
                  <span class="text-xs text-muted">Updated: ${new Date(tmpl.updatedAt || Date.now()).toLocaleDateString()}</span>
                  <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.previewNotificationTemplate('${tmpl.id}')" title="Preview Interpolated Message">
                      Preview
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.testSendNotification('${tmpl.id}')" title="Simulate Immediate Dispatch">
                      Test Send
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.openEditNotificationTemplateModal('${tmpl.id}')" title="Edit Template">
                      Edit
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm text-danger" onclick="SettingsView.handleDeleteNotificationTemplate('${tmpl.id}')" title="Delete Template">
                      Del
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  handleToggleNotificationTemplate(templateId) {
    const tmpl = window.BRIDGES_STORE.getNotificationTemplate(templateId);
    if (!tmpl) return;
    const updatedStatus = !tmpl.active;
    window.BRIDGES_STORE.updateNotificationTemplate(templateId, { active: updatedStatus });
    UI.showToast(`Template ${tmpl.name} is now ${updatedStatus ? 'Active' : 'Disabled'}.`, 'info');
    App.renderCurrentView();
  },

  previewNotificationTemplate(templateId) {
    const tmpl = window.BRIDGES_STORE.getNotificationTemplate(templateId);
    if (!tmpl) return;

    // Sample dynamic mockup data for interpolation preview
    const sample = {
      shipmentId: "SHP-2026-0891",
      orderRef: "PO-77401-BIO",
      carrierName: "Bridges Global Logistics",
      exceptionType: "Thermal Excursion (+8.4°C)",
      severity: "CRITICAL",
      location: "Dallas DFW Cold-Storage Terminal",
      estimatedImpact: "Delayed 3.5 hrs (Temperature Risk)",
      slaDeadline: "2026-04-12 18:00 UTC",
      customerName: "BioPharma Health Alliance",
      origin: "Chicago Pharma Hub",
      destination: "Houston Medical Center",
      approvedETA: "2026-04-12 21:30 UTC",
      recoveryId: "REC-2026-402",
      recoveryStrategy: "Dedicated Refrigerated Van Swap",
      recoveryReason: "Chamber cooling unit compressor stall",
      ruleId: "AR-01",
      exceptionId: "EXP-9041",
      resolutionCondition: "Highway speed restored >65km/h for 20m",
      deliveredTime: "2026-04-12 19:15 UTC",
      driverName: "Robert Hayes",
      escalationReason: "Unresolved thermal breach approaching SLA deadline",
      escalatedBy: "Elena Rostova (Analyst)",
      penaltyExposure: "$15,000",
      actionsAttempted: "Secondary carrier dispatch requested"
    };

    let subject = tmpl.subjectTemplate;
    let body = tmpl.bodyTemplate;
    Object.keys(sample).forEach(k => {
      subject = subject.split(`{${k}}`).join(sample[k]);
      body = body.split(`{${k}}`).join(sample[k]);
    });

    UI.openModal('generic-app-modal', `Preview Template: ${tmpl.name}`, `
      <div style="padding: 10px 0;">
        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
          <span class="badge badge-primary">Trigger: ${tmpl.triggerEvent}</span>
          <span class="badge badge-secondary">Audience: ${tmpl.audience}</span>
          ${(tmpl.channels || []).map(c => `<span class="badge badge-secondary">${c}</span>`).join('')}
        </div>
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Rendered Subject Header:</div>
          <div style="font-size: 14px; font-weight: 700; color: #0F172A;">${subject}</div>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Rendered Message Body:</div>
          <div style="font-size: 13px; color: #1E293B; line-height: 1.6; white-space: pre-wrap;">${body}</div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); SettingsView.testSendNotification('${tmpl.id}')">Send Test Alert Now</button>
        </div>
      </div>
    `);
  },

  testSendNotification(templateId) {
    const tmpl = window.BRIDGES_STORE.getNotificationTemplate(templateId);
    if (!tmpl) return;

    UI.showToast(`Test notification for "${tmpl.name}" dispatched via [${(tmpl.channels || []).join(', ')}]!`, 'success');
  },

  openAddNotificationTemplateModal() {
    const newId = `NT-00${window.BRIDGES_STORE.getNotificationTemplates().length + 1}`;
    UI.openModal('generic-app-modal', 'Create Notification Template', `
      <form onsubmit="SettingsView.handleSaveNotificationTemplate(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Template ID</label>
            <input type="text" name="id" class="login-input" value="${newId}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Template Name</label>
            <input type="text" name="name" class="login-input" required placeholder="e.g. Carrier Handover Window Alert">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Triggering Event</label>
            <select name="triggerEvent" class="login-input">
              <option value="Exception Detected">Exception Detected</option>
              <option value="ETA Changed">ETA Changed</option>
              <option value="Recovery Requested">Recovery Requested</option>
              <option value="Auto-Resolved">Auto-Resolved</option>
              <option value="Delivery Confirmed">Delivery Confirmed</option>
              <option value="Incident Escalated">Incident Escalated</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Target Audience</label>
            <select name="audience" class="login-input">
              <option value="Customer">Customer</option>
              <option value="Carrier Operations">Carrier Operations</option>
              <option value="Analyst & Dispatcher">Analyst &amp; Dispatcher</option>
              <option value="Warehouse Supervisor">Warehouse Supervisor</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delivery Channels</label>
          <div style="display: flex; gap: 14px; font-size: 12px;">
            <label><input type="checkbox" name="channel_inapp" checked> In-App Push</label>
            <label><input type="checkbox" name="channel_email" checked> Corporate Email</label>
            <label><input type="checkbox" name="channel_sms"> SMS Gateway</label>
            <label><input type="checkbox" name="channel_webhook"> Real-time Webhook</label>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Subject Header Template</label>
          <input type="text" id="tmpl-subject-input" name="subjectTemplate" class="login-input" required placeholder="ALERT: {exceptionType} on {shipmentId}">
        </div>
        <div class="mb-2">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Insert Dynamic Parameter Tags:</label>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${['{shipmentId}', '{orderRef}', '{carrierName}', '{exceptionType}', '{severity}', '{location}', '{slaDeadline}', '{customerName}', '{approvedETA}'].map(t => `
              <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.insertTemplateTag('${t}', 'tmpl-body-input')" style="font-size: 10px; padding: 2px 6px;">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Message Body Template</label>
          <textarea id="tmpl-body-input" name="bodyTemplate" class="login-input" rows="4" style="resize: vertical; font-size: 12px; line-height: 1.4;" required placeholder="Enter message body using tags e.g. Shipment {shipmentId} has encountered {exceptionType}..."></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Template</button>
        </div>
      </form>
    `);
  },

  openEditNotificationTemplateModal(templateId) {
    const tmpl = window.BRIDGES_STORE.getNotificationTemplate(templateId);
    if (!tmpl) return;

    UI.openModal('generic-app-modal', `Edit Notification Template: ${tmpl.name}`, `
      <form onsubmit="SettingsView.handleSaveNotificationTemplate(event, '${tmpl.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Template ID</label>
            <input type="text" name="id" class="login-input" value="${tmpl.id}" readonly style="background: #F8FAFB;">
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Template Name</label>
            <input type="text" name="name" class="login-input" value="${tmpl.name}" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Triggering Event</label>
            <select name="triggerEvent" class="login-input">
              <option value="Exception Detected" ${tmpl.triggerEvent === 'Exception Detected' ? 'selected' : ''}>Exception Detected</option>
              <option value="ETA Changed" ${tmpl.triggerEvent === 'ETA Changed' ? 'selected' : ''}>ETA Changed</option>
              <option value="Recovery Requested" ${tmpl.triggerEvent === 'Recovery Requested' ? 'selected' : ''}>Recovery Requested</option>
              <option value="Auto-Resolved" ${tmpl.triggerEvent === 'Auto-Resolved' ? 'selected' : ''}>Auto-Resolved</option>
              <option value="Delivery Confirmed" ${tmpl.triggerEvent === 'Delivery Confirmed' ? 'selected' : ''}>Delivery Confirmed</option>
              <option value="Incident Escalated" ${tmpl.triggerEvent === 'Incident Escalated' ? 'selected' : ''}>Incident Escalated</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Target Audience</label>
            <select name="audience" class="login-input">
              <option value="Customer" ${tmpl.audience === 'Customer' ? 'selected' : ''}>Customer</option>
              <option value="Carrier Operations" ${tmpl.audience === 'Carrier Operations' ? 'selected' : ''}>Carrier Operations</option>
              <option value="Analyst & Dispatcher" ${tmpl.audience === 'Analyst & Dispatcher' ? 'selected' : ''}>Analyst &amp; Dispatcher</option>
              <option value="Warehouse Supervisor" ${tmpl.audience === 'Warehouse Supervisor' ? 'selected' : ''}>Warehouse Supervisor</option>
              <option value="Customer Service" ${tmpl.audience === 'Customer Service' ? 'selected' : ''}>Customer Service</option>
              <option value="Administrator" ${tmpl.audience === 'Administrator' ? 'selected' : ''}>Administrator</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Delivery Channels</label>
          <div style="display: flex; gap: 14px; font-size: 12px;">
            <label><input type="checkbox" name="channel_inapp" ${(tmpl.channels || []).includes('In-App') ? 'checked' : ''}> In-App Push</label>
            <label><input type="checkbox" name="channel_email" ${(tmpl.channels || []).includes('Email') ? 'checked' : ''}> Corporate Email</label>
            <label><input type="checkbox" name="channel_sms" ${(tmpl.channels || []).includes('SMS') ? 'checked' : ''}> SMS Gateway</label>
            <label><input type="checkbox" name="channel_webhook" ${(tmpl.channels || []).includes('Webhook') ? 'checked' : ''}> Real-time Webhook</label>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Subject Header Template</label>
          <input type="text" id="tmpl-subject-input" name="subjectTemplate" class="login-input" value="${tmpl.subjectTemplate}" required>
        </div>
        <div class="mb-2">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Insert Dynamic Parameter Tags:</label>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${['{shipmentId}', '{orderRef}', '{carrierName}', '{exceptionType}', '{severity}', '{location}', '{slaDeadline}', '{customerName}', '{approvedETA}'].map(t => `
              <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.insertTemplateTag('${t}', 'tmpl-body-input')" style="font-size: 10px; padding: 2px 6px;">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Message Body Template</label>
          <textarea id="tmpl-body-input" name="bodyTemplate" class="login-input" rows="4" style="resize: vertical; font-size: 12px; line-height: 1.4;" required>${tmpl.bodyTemplate}</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    `);
  },

  insertTemplateTag(tag, fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    const start = el.selectionStart || el.value.length;
    const end = el.selectionEnd || el.value.length;
    el.value = el.value.substring(0, start) + tag + el.value.substring(end);
    el.focus();
    el.selectionStart = el.selectionEnd = start + tag.length;
  },

  handleSaveNotificationTemplate(event, existingTemplateId) {
    event.preventDefault();
    const form = event.target;
    const channels = [];
    if (form.channel_inapp && form.channel_inapp.checked) channels.push('In-App');
    if (form.channel_email && form.channel_email.checked) channels.push('Email');
    if (form.channel_sms && form.channel_sms.checked) channels.push('SMS');
    if (form.channel_webhook && form.channel_webhook.checked) channels.push('Webhook');

    const templateData = {
      id: form.id.value,
      name: form.name.value.trim(),
      triggerEvent: form.triggerEvent.value,
      audience: form.audience.value,
      channels: channels.length > 0 ? channels : ['In-App'],
      subjectTemplate: form.subjectTemplate.value.trim(),
      bodyTemplate: form.bodyTemplate.value.trim(),
      active: true,
      updatedAt: new Date().toISOString()
    };

    if (existingTemplateId) {
      window.BRIDGES_STORE.updateNotificationTemplate(existingTemplateId, templateData);
      UI.showToast(`Template "${templateData.name}" updated.`, 'success');
    } else {
      window.BRIDGES_STORE.addNotificationTemplate(templateData);
      UI.showToast(`Template "${templateData.name}" created.`, 'success');
    }

    UI.closeModal('generic-app-modal');
    App.renderCurrentView();
  },

  handleDeleteNotificationTemplate(templateId) {
    UI.confirm({
      title: 'Delete Notification Template',
      message: `Delete template ${templateId}? Automated triggers linked to this template will no longer deliver notifications.`,
      confirmText: 'Delete Template',
      confirmType: 'danger',
      onConfirm: () => {
        window.BRIDGES_STORE.deleteNotificationTemplate(templateId);
        UI.showToast(`Notification template ${templateId} deleted.`, 'info');
        App.renderCurrentView();
      }
    });
  },

  // =========================================================================
  // TAB: AI & APPROVAL CONFIGURATION
  // =========================================================================
  renderAiApprovalTab() {
    const aiConfig = window.BRIDGES_STORE.getAIConfig();
    const carriers = window.BRIDGES_STORE.getCarriers();

    const humanApprovalOptions = [
      { key: "carrier_swap", label: "Secondary Carrier Re-assignment / Carrier Swap", desc: "Mandatory human review before switching logistics partner." },
      { key: "route_diversion_gt_50mi", label: "Route Diversion Exceeding 50 Miles / 80 Km", desc: "Long-distance deviations require dispatcher confirmation." },
      { key: "delivery_window_reschedule", label: "Customer Delivery Window Rescheduling", desc: "Changes to committed delivery arrival time pushed to customer." },
      { key: "split_shipment", label: "Freight Splitting / Multi-Vehicle Decoupling", desc: "Decoupling cargo pallets across multiple fleet units." },
      { key: "air_charter_dispatch", label: "Emergency Dedicated Air Charter Dispatch", desc: "High-value emergency air recovery charter." },
      { key: "auto_closure_override", label: "High-Severity Exception Auto-Closure Override", desc: "Automatic closure of incidents flagged High or Critical." }
    ];

    const currentHumanApprovals = aiConfig.humanApprovalRequired || [];

    return `
      <div class="settings-tab-content animate-fade-in">
        <form onsubmit="SettingsView.handleSaveAIConfig(event)">
          <!-- Section 1: AI Model Engine & Optimization Strategy -->
          <div class="panel mb-4">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">AI Recommendation Engine &amp; Strategy</h3>
                <p class="text-xs text-muted">Configure predictive intelligence model architecture, optimization objectives, and prediction horizon.</p>
              </div>
            </div>
            <div style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Underlying AI Model Engine</label>
                <select name="modelEngine" class="login-input" style="width: 100%;">
                  <option value="Google Gemini 2.5 Flash Enterprise Logistics Model" ${aiConfig.modelEngine?.includes('Gemini 2.5') ? 'selected' : ''}>Google Gemini 2.5 Flash Enterprise Logistics Model (Sub-second Ingestion)</option>
                  <option value="Gemini 1.5 Pro Control Tower Core" ${aiConfig.modelEngine?.includes('1.5 Pro') ? 'selected' : ''}>Gemini 1.5 Pro Control Tower Core (Extended Complex Context)</option>
                  <option value="Custom Fine-Tuned Llama-3 Fleet Model" ${aiConfig.modelEngine?.includes('Llama-3') ? 'selected' : ''}>Custom Fine-Tuned Llama-3 Fleet Model (On-Premises)</option>
                </select>
                <span class="text-xs text-muted">Primary generative &amp; predictive reasoning model evaluated for exception recovery suggestions.</span>
              </div>

              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Optimization Strategy Directive</label>
                <select name="optimizationStrategy" class="login-input" style="width: 100%;">
                  <option value="Balanced (Cost vs SLA Risk)" ${aiConfig.optimizationStrategy?.includes('Balanced') ? 'selected' : ''}>Balanced (Cost vs SLA Risk)</option>
                  <option value="Aggressive (Minimize SLA Breaches at Any Cost)" ${aiConfig.optimizationStrategy?.includes('Aggressive') ? 'selected' : ''}>Aggressive (Minimize SLA Breaches at Any Cost)</option>
                  <option value="Cost-Conservative (Prioritize Least-Cost Recoveries)" ${aiConfig.optimizationStrategy?.includes('Conservative') ? 'selected' : ''}>Cost-Conservative (Prioritize Least-Cost Recoveries)</option>
                  <option value="Cold-Chain Integrity First" ${aiConfig.optimizationStrategy?.includes('Cold-Chain') ? 'selected' : ''}>Cold-Chain Integrity First (Biopharmaceutical Safe)</option>
                </select>
                <span class="text-xs text-muted">Guides multi-objective trade-off scoring across recovery strategy formulation.</span>
              </div>

              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Proactive Prediction Horizon (Hours)</label>
                <input type="number" name="proactivePredictionHours" class="login-input" style="width: 100%;" value="${aiConfig.proactivePredictionHours || 4}" min="1" max="24" required>
                <span class="text-xs text-muted">Look-ahead time window for anticipated traffic, weather, and port congestion forecast.</span>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: center;">
                <label style="font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" name="continuousLearning" ${aiConfig.continuousLearning ? 'checked' : ''} style="width: 16px; height: 16px;">
                  Continuous Reinforcement Learning &amp; Outcome Feedback
                </label>
                <span class="text-xs text-muted" style="margin-left: 24px; margin-top: 2px;">
                  AI automatically refines predictive weights based on human dispatcher acceptance rate and recovery success audits.
                </span>
              </div>
            </div>
          </div>

          <!-- Section 2: Confidence Thresholds & Visual Spectrum -->
          <div class="panel mb-4">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">AI Confidence Thresholds &amp; Decision Spectrum</h3>
                <p class="text-xs text-muted">Calibrate autonomous execution boundaries vs mandatory human operator triage.</p>
              </div>
            </div>
            <div style="padding: 16px;">
              <!-- Visual Spectrum Bar -->
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px;">
                  <span style="color: #64748B;">0% (Low Confidence)</span>
                  <span style="color: #D97706;" id="review-threshold-label">Human Review Threshold (${aiConfig.humanReviewThreshold || 70}%)</span>
                  <span style="color: #059669;" id="auto-threshold-label">Autonomous Action Threshold (${aiConfig.confidenceThreshold || 85}%)</span>
                  <span style="color: #18217E;">100%</span>
                </div>
                <div style="height: 12px; border-radius: 6px; display: flex; overflow: hidden; border: 1px solid #CBD5E1;">
                  <div style="width: ${aiConfig.humanReviewThreshold || 70}%; background: #EF4444; opacity: 0.8;" title="Route to Human Queue"></div>
                  <div style="width: ${(aiConfig.confidenceThreshold || 85) - (aiConfig.humanReviewThreshold || 70)}%; background: #F59E0B; opacity: 0.85;" title="Semi-Autonomous Review"></div>
                  <div style="width: ${100 - (aiConfig.confidenceThreshold || 85)}%; background: #10B981; opacity: 0.9;" title="Autonomous Direct Execution"></div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 11px;">
                  <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444; padding: 6px 10px; border-radius: 4px;">
                    <strong>Manual Queue:</strong> AI suggestions suppressed; routed directly to Lead Dispatcher.
                  </div>
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; padding: 6px 10px; border-radius: 4px;">
                    <strong>Semi-Autonomous:</strong> AI generates recommendation; Dispatcher approval mandatory.
                  </div>
                  <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 6px 10px; border-radius: 4px;">
                    <strong>Autonomous Execution:</strong> Auto-dispatched if within financial spending limits.
                  </div>
                </div>
              </div>

              <!-- Sliders -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <label class="form-label" style="font-size: 12px; font-weight: 600;">Autonomous Action Confidence Threshold</label>
                    <span class="font-bold text-success" id="val-conf-thresh">${aiConfig.confidenceThreshold || 85}%</span>
                  </div>
                  <input type="range" name="confidenceThreshold" class="login-input" style="width: 100%; padding: 4px;" min="60" max="98" value="${aiConfig.confidenceThreshold || 85}" oninput="document.getElementById('val-conf-thresh').textContent = this.value + '%'; document.getElementById('auto-threshold-label').textContent = 'Autonomous Action (' + this.value + '%)';">
                  <span class="text-xs text-muted">Recommendations exceeding this score can execute automatically without manual click-through.</span>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <label class="form-label" style="font-size: 12px; font-weight: 600;">Human Review Triage Threshold</label>
                    <span class="font-bold text-warning" id="val-rev-thresh">${aiConfig.humanReviewThreshold || 70}%</span>
                  </div>
                  <input type="range" name="humanReviewThreshold" class="login-input" style="width: 100%; padding: 4px;" min="40" max="85" value="${aiConfig.humanReviewThreshold || 70}" oninput="document.getElementById('val-rev-thresh').textContent = this.value + '%'; document.getElementById('review-threshold-label').textContent = 'Human Review (' + this.value + '%)';">
                  <span class="text-xs text-muted">Predictions falling below this threshold are routed straight to analyst investigation with low-confidence flag.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: 2-Column Grid (Human Approvals & Financial Limits) -->
          <div class="dashboard-grid-2col mb-4">
            <!-- Column A: Human-Approval Requirements -->
            <div class="panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Mandatory Human-Approval Directives</h3>
                  <p class="text-xs text-muted">High-impact operational actions requiring explicit human supervisor sign-off regardless of AI confidence.</p>
                </div>
              </div>
              <div style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
                ${humanApprovalOptions.map(opt => `
                  <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border: 1px solid #E5EBEE; border-radius: 6px; cursor: pointer; background: ${currentHumanApprovals.includes(opt.key) ? '#F8FAFC' : '#FFFFFF'};">
                    <input type="checkbox" name="humanApproval_${opt.key}" ${currentHumanApprovals.includes(opt.key) ? 'checked' : ''} style="margin-top: 3px;">
                    <div>
                      <div class="font-bold text-navy" style="font-size: 12px;">${opt.label}</div>
                      <div class="text-xs text-muted">${opt.desc}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Column B: Financial Approval Limit Tiers -->
            <div class="panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Financial Approval Limits &amp; Delegations</h3>
                  <p class="text-xs text-muted">Monetary recovery spend thresholds governed by organizational delegation of authority.</p>
                </div>
              </div>
              <div style="padding: 16px;">
                <div class="mb-3">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">System Currency</label>
                  <select name="finCurrency" class="login-input" style="width: 100%;">
                    <option value="USD ($)">USD ($) — United States Dollar</option>
                    <option value="EUR (€)">EUR (€) — Euro</option>
                    <option value="GBP (£)">GBP (£) — British Pound</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Autonomous AI Direct Spend Ceiling ($)</label>
                  <input type="number" name="autoApproveLimit" class="login-input" style="width: 100%;" value="${aiConfig.financialApprovalLimits?.autoApproveLimit || 500}" required min="0">
                  <span class="text-xs text-muted">Maximum cost AI can commit autonomously for re-routing tolls, short drayage, or expedite fees.</span>
                </div>

                <div class="mb-3">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Transport Dispatcher Sign-off Limit ($)</label>
                  <input type="number" name="dispatcherLimit" class="login-input" style="width: 100%;" value="${aiConfig.financialApprovalLimits?.dispatcherLimit || 1500}" required min="0">
                  <span class="text-xs text-muted">Single-click approval authority for Transport Dispatchers in the Recovery Planning workspace.</span>
                </div>

                <div class="mb-3">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Operations Manager Approval Limit ($)</label>
                  <input type="number" name="operationsManagerLimit" class="login-input" style="width: 100%;" value="${aiConfig.financialApprovalLimits?.operationsManagerLimit || 5000}" required min="0">
                  <span class="text-xs text-muted">Required authorization ceiling for incident commanders and shift directors.</span>
                </div>

                <div class="mb-2">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Executive Escalation Ceiling ($)</label>
                  <input type="number" name="executiveLimit" class="login-input" style="width: 100%;" value="${aiConfig.financialApprovalLimits?.executiveLimit || 25000}" required min="0">
                  <span class="text-xs text-muted">Expenditures above this threshold automatically generate Executive Escalation tickets.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: AI Fallback & Fail-Safe Directives -->
          <div class="panel mb-4">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">AI Fallback &amp; Fail-Safe Directives</h3>
                <p class="text-xs text-muted">Deterministic fail-safe actions triggered when sensor streams drop, networks partition, or model confidence degrades.</p>
              </div>
            </div>
            <div style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Low-Confidence Fallback Directive</label>
                <input type="text" name="fallbackLowConfidence" class="login-input" style="width: 100%;" value="${aiConfig.fallbackRules?.onLowConfidence || 'Route to Lead Analyst Priority Queue with Explanation'}" required>
                <span class="text-xs text-muted">Executed when AI confidence falls below Human Review threshold.</span>
              </div>

              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">IoT Sensor / Telemetry Timeout Fallback</label>
                <input type="text" name="fallbackSensorTimeout" class="login-input" style="width: 100%;" value="${aiConfig.fallbackRules?.onSensorTimeout || 'Revert to dead-reckoning trajectory and notify dispatcher after 30m'}" required>
                <span class="text-xs text-muted">Fail-safe protocol when GPS or temperature telemetry halts unexpectedly.</span>
              </div>

              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Default Alternate Recovery Carrier</label>
                <select name="defaultAlternateCarrierId" class="login-input" style="width: 100%;">
                  ${carriers.map(c => `
                    <option value="${c.id}" ${aiConfig.fallbackRules?.defaultAlternateCarrierId === c.id ? 'selected' : ''}>
                      ${c.name} (${c.id}) &bull; ${c.carrierType}
                    </option>
                  `).join('')}
                </select>
                <span class="text-xs text-muted">Designated primary reserve carrier partner for rapid automated diversion dispatches.</span>
              </div>

              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Fallback Alert Notification Priority</label>
                <select name="fallbackNotificationPriority" class="login-input" style="width: 100%;">
                  <option value="Urgent In-App & Email to Dispatcher" selected>Urgent In-App &amp; Email to Dispatcher</option>
                  <option value="SMS Dispatcher Broadcast">SMS Dispatcher Broadcast</option>
                  <option value="Tower War Room Escalation">Tower War Room Escalation</option>
                </select>
                <span class="text-xs text-muted">Communication channel invoked during automatic failover activations.</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 24px;">
            <button type="button" class="btn btn-secondary" onclick="SettingsView.handleResetAIConfig()">
              Reset to Recommended Defaults
            </button>
            <button type="submit" class="btn btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save AI Configuration &amp; Approvals
            </button>
          </div>
        </form>
      </div>
    `;
  },

  handleSaveAIConfig(event) {
    event.preventDefault();
    const form = event.target;

    const humanApprovalKeys = [
      "carrier_swap",
      "route_diversion_gt_50mi",
      "delivery_window_reschedule",
      "split_shipment",
      "air_charter_dispatch",
      "auto_closure_override"
    ];

    const selectedApprovals = humanApprovalKeys.filter(k => form[`humanApproval_${k}`] && form[`humanApproval_${k}`].checked);

    const updates = {
      modelEngine: form.modelEngine.value,
      optimizationStrategy: form.optimizationStrategy.value,
      proactivePredictionHours: parseInt(form.proactivePredictionHours.value, 10),
      continuousLearning: form.continuousLearning.checked,
      confidenceThreshold: parseInt(form.confidenceThreshold.value, 10),
      humanReviewThreshold: parseInt(form.humanReviewThreshold.value, 10),
      humanApprovalRequired: selectedApprovals,
      financialApprovalLimits: {
        currency: form.finCurrency.value,
        autoApproveLimit: parseFloat(form.autoApproveLimit.value),
        dispatcherLimit: parseFloat(form.dispatcherLimit.value),
        operationsManagerLimit: parseFloat(form.operationsManagerLimit.value),
        executiveLimit: parseFloat(form.executiveLimit.value)
      },
      fallbackRules: {
        onLowConfidence: form.fallbackLowConfidence.value.trim(),
        onSensorTimeout: form.fallbackSensorTimeout.value.trim(),
        defaultAlternateCarrierId: form.defaultAlternateCarrierId.value,
        fallbackNotificationPriority: form.fallbackNotificationPriority.value
      }
    };

    window.BRIDGES_STORE.updateAIConfig(updates);
    UI.showToast('AI recommendation parameters & approval delegations saved.', 'success');
    App.renderCurrentView();
  },

  handleResetAIConfig() {
    UI.confirm({
      title: 'Reset AI Configuration',
      message: 'Restore standard factory defaults for AI recommendation engine, confidence thresholds (85% autonomous, 70% review), and approval delegations?',
      confirmText: 'Restore Defaults',
      confirmType: 'primary',
      onConfirm: () => {
        window.BRIDGES_STORE.updateAIConfig({
          modelEngine: "Google Gemini 2.5 Flash Enterprise Logistics Model",
          optimizationStrategy: "Balanced (Cost vs SLA Risk)",
          autonomousSuggestions: true,
          confidenceThreshold: 85,
          humanReviewThreshold: 70,
          proactivePredictionHours: 4,
          continuousLearning: true,
          humanApprovalRequired: [
            "carrier_swap",
            "route_diversion_gt_50mi",
            "delivery_window_reschedule",
            "split_shipment",
            "air_charter_dispatch",
            "auto_closure_override"
          ],
          financialApprovalLimits: {
            autoApproveLimit: 500,
            dispatcherLimit: 1500,
            operationsManagerLimit: 5000,
            executiveLimit: 25000,
            currency: "USD ($)"
          },
          fallbackRules: {
            onLowConfidence: "Route to Lead Analyst Priority Queue with Explanation",
            onSensorTimeout: "Revert to dead-reckoning trajectory and notify dispatcher after 30m",
            defaultAlternateCarrierId: "CAR-01",
            fallbackNotificationPriority: "Urgent In-App & Email to Dispatcher"
          }
        });
        UI.showToast('AI parameters restored to default configuration.', 'info');
        App.renderCurrentView();
      }
    });
  }
};

window.SettingsView = SettingsView;
