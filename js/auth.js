/**
 * BRIDGES Control Tower - Authentication Module
 * Manages Administrator session, authentication state, and role gating
 */

const AUTH_STORAGE_KEY = 'BRIDGES_AUTH_USER_v1';

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.authListeners = [];
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading auth session:', e);
    }
    return null;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentCarrierId() {
    if (this.currentUser) {
      if (this.currentUser.carrierId) return this.currentUser.carrierId;
      if (this.currentUser.role === 'Carrier Operations User') return 'CAR-01';
    }
    return 'CAR-01';
  }

  getCurrentCarrierName() {
    if (this.currentUser) {
      if (this.currentUser.carrierName) return this.currentUser.carrierName;
      if (this.currentUser.role === 'Carrier Operations User') return 'Bridges Global Logistics';
    }
    return 'Bridges Global Logistics';
  }

  getCurrentWarehouseId() {
    if (this.currentUser) {
      if (this.currentUser.warehouseId) return this.currentUser.warehouseId;
      if (this.currentUser.role === 'Warehouse Supervisor') return 'WH-DAL-01';
    }
    return 'WH-DAL-01';
  }

  getCurrentCustomerId() {
    if (this.currentUser) {
      if (this.currentUser.customerId) return this.currentUser.customerId;
      if (this.currentUser.role === 'Customer') return 'CUST-BIO-01';
    }
    return 'CUST-BIO-01';
  }

  onAuthChange(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error('Auth listener error:', e); }
    });
  }

  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Find matching user profile in store or determine alias
    let matched = null;
    if (window.BRIDGES_STORE) {
      const users = window.BRIDGES_STORE.getUsers() || [];
      matched = users.find(u => (
        u.email.toLowerCase() === cleanEmail ||
        (cleanEmail === 'admin@gmail.com' && u.role === 'Administrator') ||
        ((cleanEmail === 'cta@gmail.com' || cleanEmail === 'analyst@gmail.com') && u.role === 'Control Tower Analyst') ||
        (cleanEmail === 'dispatcher@gmail.com' && u.role === 'Dispatcher / Transport Planner') ||
        (cleanEmail === 'carrier@gmail.com' && u.role === 'Carrier Operations User') ||
        (cleanEmail === 'warehouse@gmail.com' && u.role === 'Warehouse Supervisor') ||
        (cleanEmail === 'cs@gmail.com' && u.role === 'Customer Service') ||
        (cleanEmail === 'customer@gmail.com' && u.role === 'Customer')
      ));
    }

    // Fallback known accounts if store not yet loaded
    if (!matched) {
      if (cleanEmail === 'admin@gmail.com') {
        matched = { id: "USR-101", name: "Bima Ary", email: "admin@gmail.com", role: "Administrator", status: "Active" };
      } else if (cleanEmail === 'cta@gmail.com' || cleanEmail === 'analyst@gmail.com') {
        matched = { id: "USR-102", name: "Sarah Lin", email: "cta@gmail.com", role: "Control Tower Analyst", status: "Active" };
      } else if (cleanEmail === 'dispatcher@gmail.com') {
        matched = { id: "USR-104", name: "Elena Rostova", email: "dispatcher@gmail.com", role: "Dispatcher / Transport Planner", status: "Active" };
      } else if (cleanEmail === 'carrier@gmail.com') {
        matched = { id: "USR-103", name: "Marcus Vance", email: "carrier@gmail.com", role: "Carrier Operations User", carrierId: "CAR-01", status: "Active" };
      } else if (cleanEmail === 'warehouse@gmail.com') {
        matched = { id: "USR-105", name: "Carlos Mendoza", email: "warehouse@gmail.com", role: "Warehouse Supervisor", warehouseId: "WH-DAL-01", status: "Active" };
      } else if (cleanEmail === 'cs@gmail.com') {
        matched = { id: "USR-106", name: "Clara Hughes", email: "cs@gmail.com", role: "Customer Service", status: "Active" };
      } else if (cleanEmail === 'customer@gmail.com') {
        matched = { id: "USR-109", name: "Sarah Jenkins", email: "customer@gmail.com", role: "Customer", customerId: "CUST-BIO-01", customerName: "BioPharma Health Alliance", status: "Active" };
      }
    }

    if (!matched) {
      if (window.BRIDGES_STORE && window.BRIDGES_STORE.logLogin) {
        window.BRIDGES_STORE.logLogin({ email: cleanEmail, role: 'Guest' }, "Failed (Unknown User)", "127.0.0.1 (Local Session)", "User email not found in system directory.");
      }
      return {
        success: false,
        error: "Invalid email or password. Use: admin@gmail.com / 1, cta@gmail.com / 1, dispatcher@gmail.com / 1, carrier@gmail.com / 1, warehouse@gmail.com / 1, cs@gmail.com / 1, or customer@gmail.com / 1"
      };
    }

    // 1. Gating: Check Account Activation Status
    if (matched.status === 'Inactive') {
      if (window.BRIDGES_STORE && window.BRIDGES_STORE.logLogin) {
        window.BRIDGES_STORE.logLogin(matched, "Blocked (Account Inactive)", "127.0.0.1 (Local Session)", "Login attempt blocked: User account has been deactivated by an Administrator.");
      }
      return {
        success: false,
        error: `User account "${matched.name}" is Inactive. Please contact the Control Tower Administrator to restore access.`
      };
    }

    // 2. Gating: Check Associated Carrier Status (US-59)
    if (matched.carrierId && window.BRIDGES_STORE) {
      const carrier = window.BRIDGES_STORE.getCarrier(matched.carrierId);
      if (carrier && carrier.status === 'Inactive') {
        if (window.BRIDGES_STORE.logLogin) {
          window.BRIDGES_STORE.logLogin(matched, "Blocked (Carrier Inactive)", "127.0.0.1 (Local Session)", `Login blocked: Carrier organization "${carrier.name}" is Inactive.`);
        }
        return {
          success: false,
          error: `Carrier organization "${carrier.name}" is Inactive. Operational access is suspended.`
        };
      }
    }

    // 3. Credential Check (standard password "1" across all demo users)
    if (cleanPass !== '1') {
      if (window.BRIDGES_STORE && window.BRIDGES_STORE.logLogin) {
        window.BRIDGES_STORE.logLogin(matched, "Failed (Bad Password)", "127.0.0.1 (Local Session)", "Invalid password credentials provided.");
      }
      return {
        success: false,
        error: "Incorrect password. Please enter password '1' to authenticate."
      };
    }

    // Build complete authenticated session user
    const carrierObj = (matched.carrierId && window.BRIDGES_STORE) ? window.BRIDGES_STORE.getCarrier(matched.carrierId) : null;
    const sessionUser = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      phone: matched.phone || '+1 (555) 019-2834',
      status: matched.status,
      carrierId: matched.carrierId || null,
      carrierName: carrierObj ? carrierObj.name : null,
      warehouseId: matched.warehouseId || (matched.role === 'Warehouse Supervisor' ? 'WH-DAL-01' : null),
      warehouseName: matched.warehouseName || (matched.role === 'Warehouse Supervisor' ? 'Dallas Central Logistics Hub' : null),
      customerId: matched.customerId || (matched.role === 'Customer' ? 'CUST-BIO-01' : null),
      customerName: matched.customerName || (matched.role === 'Customer' ? 'BioPharma Health Alliance' : null),
      title: matched.role === 'Administrator' ? 'Bridges Coordinator'
        : matched.role === 'Control Tower Analyst' ? 'Lead Control Tower Analyst'
        : matched.role === 'Dispatcher / Transport Planner' ? 'Lead Transport Dispatcher'
        : matched.role === 'Carrier Operations User' ? 'Fleet Operations Manager'
        : matched.role === 'Warehouse Supervisor' ? 'Warehouse Shift Supervisor'
        : matched.role === 'Customer Service' ? 'Senior Customer Care Specialist'
        : 'Director of Supply Chain Logistics',
      avatar: matched.role === 'Administrator'
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
        : matched.role === 'Control Tower Analyst'
        ? "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120"
        : matched.role === 'Dispatcher / Transport Planner'
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
        : matched.role === 'Carrier Operations User'
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
        : matched.role === 'Warehouse Supervisor'
        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
        : matched.role === 'Customer Service'
        ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=120"
        : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
      lastLogin: new Date().toISOString()
    };

    this.currentUser = sessionUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

    // Audit and persistent login history recording
    if (window.BRIDGES_STORE) {
      if (window.BRIDGES_STORE.logLogin) {
        window.BRIDGES_STORE.logLogin(sessionUser, "Success", "127.0.0.1 (Local Session)", `${sessionUser.name} (${sessionUser.role})`);
      }
      window.BRIDGES_STORE.logAudit("User Login", "System", sessionUser.id, `${sessionUser.name} (${sessionUser.role})`);
    }

    this.notify();
    return { success: true, user: sessionUser };
  }

  switchCustomerAccount(customerId, customerName, contactName) {
    if (this.currentUser && this.currentUser.role === 'Customer') {
      this.currentUser.customerId = customerId;
      this.currentUser.customerName = customerName;
      if (contactName) this.currentUser.name = contactName;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      if (window.BRIDGES_STORE) {
        window.BRIDGES_STORE.logAudit("Customer Account Switched", "Portal", customerId, `Switched customer account context to ${customerName} (${customerId}).`);
      }
      this.notify();
    }
  }

  updateCurrentUser(updatedFields) {
    if (!this.currentUser) {
      return { success: false, error: "No active user session." };
    }

    // Merge updated fields into current user object
    this.currentUser = {
      ...this.currentUser,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } catch (e) {
      console.warn("Error updating session storage:", e);
    }

    // Sync with BRIDGES_STORE user record if present
    if (window.BRIDGES_STORE) {
      try {
        const users = window.BRIDGES_STORE.getUsers() || [];
        const idx = users.findIndex(u => u.id === this.currentUser.id || u.email.toLowerCase() === this.currentUser.email.toLowerCase());
        if (idx !== -1) {
          users[idx] = {
            ...users[idx],
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
          window.BRIDGES_STORE.set('users', users);
        }
        window.BRIDGES_STORE.logAudit("Profile Updated", "User Profile", this.currentUser.id, `User details modified for ${this.currentUser.name} (${this.currentUser.email}).`);
      } catch (err) {
        console.warn("Error syncing user profile to store:", err);
      }
    }

    this.notify();
    return { success: true, user: this.currentUser };
  }

  logout() {
    if (this.currentUser && window.BRIDGES_STORE) {
      window.BRIDGES_STORE.logAudit("User Logout", "System", "Session Ended", `${this.currentUser.name} (${this.currentUser.role}) signed out of session.`);
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }
}

// Global Auth instance
window.BRIDGES_AUTH = new AuthManager();
