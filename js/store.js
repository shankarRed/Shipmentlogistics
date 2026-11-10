/**
 * BRIDGES Control Tower - Data Layer & Persistence Store (localStorage)
 * Strictly data-driven: all KPIs, analytics, tables, and relationships derive from here.
 */

const STORAGE_KEY = 'BRIDGES_CONTROL_TOWER_DATA_v1';
const AUTH_KEY = 'BRIDGES_AUTH_USER_v1';

// Initial realistic enterprise seed data
const SEED_DATA = {
  settings: {
    appName: "BRIDGES — Shipment Exception Control Tower",
    delayWarningHours: 2,
    slaBreachHours: 4,
    dwellAlertHours: 6,
    exceptionCategories: [
      "Route Delay",
      "Temperature Breach",
      "Missed Pickup",
      "Excessive Dwell Time",
      "Customs Hold",
      "Mechanical Breakdown",
      "Documentation Defect"
    ],
    severityLevels: [
      { id: "Critical", label: "Critical Alert", color: "#EA341F" },
      { id: "High", label: "High Severity", color: "#8C2527" },
      { id: "Medium", label: "Medium Impact", color: "#424989" },
      { id: "Low", label: "Low Priority", color: "#8A9995" }
    ],
    timeZone: "UTC (Coordinated Universal Time)",
    refreshInterval: 30,
    subscription: {
      planId: "enterprise-elite",
      planName: "Enterprise Logistics Elite",
      status: "Active",
      billingCycle: "Annual",
      price: "$2,400 / month",
      renewalDate: "2027-01-15",
      features: [
        "Unlimited real-time telemetry streaming (IoT / GPS)",
        "Automated AI-driven exception recovery workflows",
        "Dedicated multi-modal carrier integration APIs",
        "99.99% Control Tower uptime SLA guarantee",
        "Custom branded customer tracking portals",
        "24/7 Priority Mission-Critical Support"
      ],
      quotas: {
        activeShipments: { used: 412, limit: 1000, unit: "shipments" },
        carrierIntegrations: { used: 18, limit: 25, unit: "connected carriers" },
        apiCallsThisMonth: { used: 482100, limit: 1000000, unit: "API requests" },
        userSeats: { used: 8, limit: 15, unit: "analyst & admin seats" }
      },
      paymentMethod: {
        brand: "MasterCard",
        last4: "8824",
        expiry: "09/28",
        holder: "Bima Ary - Enterprise Tech Corp"
      },
      invoices: [
        { id: "INV-2026-004", date: "2026-04-01", amount: "$2,400.00", status: "Paid" },
        { id: "INV-2026-003", date: "2026-03-01", amount: "$2,400.00", status: "Paid" },
        { id: "INV-2026-002", date: "2026-02-01", amount: "$2,400.00", status: "Paid" },
        { id: "INV-2026-001", date: "2026-01-01", amount: "$2,400.00", status: "Paid" }
      ]
    },
    theme: {
      mode: "light",
      accentColor: "#18217E"
    }
  },

  // Phase 1 - Administrator SLA Rules & Deadlines (US-SLA-01)
  slaRules: [
    {
      id: "SLA-RULE-01",
      name: "Critical Cold-Chain Biopharma",
      tier: "Tier 1 Strategic",
      modality: "All",
      pickupDeadlineHours: 1.0,
      deliveryDeadlineHours: 12.0,
      gracePeriodMinutes: 15,
      delayPenaltyPerHour: 1200,
      maxPenaltyCap: 25000,
      targetCompliancePct: 99.5,
      description: "Strict temperature-controlled biologics requiring urgent dispatch within 1 hour."
    },
    {
      id: "SLA-RULE-02",
      name: "Express Priority Next-Flight-Out",
      tier: "Tier 1 Strategic",
      modality: "Air",
      pickupDeadlineHours: 2.0,
      deliveryDeadlineHours: 8.0,
      gracePeriodMinutes: 20,
      delayPenaltyPerHour: 850,
      maxPenaltyCap: 15000,
      targetCompliancePct: 98.0,
      description: "Emergency manufacturing components and critical mission air express."
    },
    {
      id: "SLA-RULE-03",
      name: "Standard Dedicated Ground Freight",
      tier: "Tier 2 Commercial",
      modality: "Ground",
      pickupDeadlineHours: 4.0,
      deliveryDeadlineHours: 36.0,
      gracePeriodMinutes: 45,
      delayPenaltyPerHour: 250,
      maxPenaltyCap: 6000,
      targetCompliancePct: 95.0,
      description: "Interstate full truckload (FTL) and linehaul cargo transit."
    },
    {
      id: "SLA-RULE-04",
      name: "Maritime Ocean Container & Drayage",
      tier: "Tier 2 Commercial",
      modality: "Sea",
      pickupDeadlineHours: 12.0,
      deliveryDeadlineHours: 72.0,
      gracePeriodMinutes: 90,
      delayPenaltyPerHour: 450,
      maxPenaltyCap: 18000,
      targetCompliancePct: 92.0,
      description: "Intermodal port drayage and container terminal vessel transfers."
    },
    {
      id: "SLA-RULE-05",
      name: "Regional Economy LTL Consolidation",
      tier: "Standard",
      modality: "Ground",
      pickupDeadlineHours: 6.0,
      deliveryDeadlineHours: 48.0,
      gracePeriodMinutes: 60,
      delayPenaltyPerHour: 150,
      maxPenaltyCap: 3000,
      targetCompliancePct: 90.0,
      description: "Non-critical consolidated freight with flexible transit windows."
    }
  ],

  // Phase 1 - Grace Periods
  gracePeriods: {
    pickupGraceMinutes: 20,
    checkpointGraceMinutes: 30,
    deliveryGraceMinutes: 45,
    excessiveDwellToleranceHours: 4.0
  },

  // Phase 1 - Financial Penalties
  penalties: {
    standardDelayPerHour: 250,
    criticalDelayPerHour: 1200,
    missedPickupFee: 500,
    portDemurragePerHour: 450,
    thermalBreachDamage: 25000,
    lateDeliveryInvoiceCapPct: 25
  },

  // Phase 1 - Automated Exception Detection Rules
  exceptionDetectionRules: [
    {
      id: "ED-01",
      name: "Predicted ETA Breach Buffer",
      category: "Route Delay",
      triggerCondition: "Predicted ETA > SLA Deadline + Grace Period",
      thresholdValue: 30,
      thresholdUnit: "Minutes",
      assignedSeverity: "High",
      autoAction: "Ingest to Intervention Queue",
      active: true
    },
    {
      id: "ED-02",
      name: "Refrigeration Thermal Excursion",
      category: "Temperature Breach",
      triggerCondition: "Chamber Temp > +8.0°C or < +2.0°C for > 10m",
      thresholdValue: 10,
      thresholdUnit: "Minutes",
      assignedSeverity: "Critical",
      autoAction: "Immediate War Room Incident Creation",
      active: true
    },
    {
      id: "ED-03",
      name: "Unscheduled En-Route Dwell",
      category: "Excessive Dwell Time",
      triggerCondition: "Speed < 5 km/h at non-terminal coordinate",
      thresholdValue: 45,
      thresholdUnit: "Minutes",
      assignedSeverity: "Medium",
      autoAction: "Telemetry Ping & Driver Query Alert",
      active: true
    },
    {
      id: "ED-04",
      name: "Route Corridor Divergence",
      category: "Route Delay",
      triggerCondition: "Deviation distance from planned path",
      thresholdValue: 25,
      thresholdUnit: "Kilometers",
      assignedSeverity: "High",
      autoAction: "Trigger Re-route Calculation",
      active: true
    },
    {
      id: "ED-05",
      name: "Missed Scheduled Gate Pickup",
      category: "Missed Pickup",
      triggerCondition: "Current Time > Scheduled Window without Inbound Scan",
      thresholdValue: 60,
      thresholdUnit: "Minutes",
      assignedSeverity: "High",
      autoAction: "Escalate to Transport Dispatcher",
      active: true
    },
    {
      id: "ED-06",
      name: "Customs EDI 350 Hold Code",
      category: "Customs Hold",
      triggerCondition: "Automated customs broker rejection flag",
      thresholdValue: 1,
      thresholdUnit: "Code Event",
      assignedSeverity: "Medium",
      autoAction: "Notify Customer Service Documentation Desk",
      active: true
    }
  ],

  // Phase 1 - Severity Classification Rules
  severityRules: {
    criticalCriteria: {
      minCargoValue: 500000,
      minDelayHours: 4.0,
      requireColdChainViolation: true,
      requireHazardousMaterial: true
    },
    highCriteria: {
      minCargoValue: 150000,
      minDelayHours: 2.0,
      customerTier: "Tier 1 Strategic"
    },
    mediumCriteria: {
      minCargoValue: 50000,
      minDelayHours: 1.0
    },
    lowCriteria: {
      maxDelayHours: 1.0,
      recoverableEta: true
    }
  },

  // Phase 1 - Low-Severity Auto-Resolution Rules
  autoResolutionRules: [
    {
      id: "AR-01",
      name: "Transient Traffic Clearance",
      exceptionType: "Route Delay",
      condition: "Vehicle resumes highway speed (>60 km/h) for 15+ mins and revised ETA is within SLA commitment",
      maxRetryAttempts: 3,
      autoCloseAction: "Mark Resolved & Notify Analyst",
      active: true
    },
    {
      id: "AR-02",
      name: "Terminal Dwell Resumed",
      exceptionType: "Excessive Dwell Time",
      condition: "Gate out scan completed and odometer telemetry updates within 30 mins of dwell alert",
      maxRetryAttempts: 2,
      autoCloseAction: "Close Dwell Exception with Timestamp Record",
      active: true
    },
    {
      id: "AR-03",
      name: "Digital Customs Clearance",
      exceptionType: "Customs Hold",
      condition: "EDI 315 electronic status updates to 'Cleared' / 'Released' without manual customs inspection",
      maxRetryAttempts: 1,
      autoCloseAction: "Auto-Close Exception & Release Port Hold",
      active: true
    },
    {
      id: "AR-04",
      name: "Minor Sensor Telemetry Restored",
      exceptionType: "Documentation Defect",
      condition: "Missing telemetry packet re-synchronizes with full historical buffer backfill",
      maxRetryAttempts: 2,
      autoCloseAction: "Clear Data Flag & Archive Record",
      active: true
    }
  ],

  // Phase 1 - Notification Configuration Templates
  notificationTemplates: [
    {
      id: "NT-001",
      name: "Critical Exception Incident Alert",
      triggerEvent: "Exception Detected",
      audience: "Analyst & Dispatcher",
      channels: ["In-App", "Email", "SMS"],
      subjectTemplate: "CRITICAL: {exceptionType} detected on {shipmentId} ({carrierName})",
      bodyTemplate: "A {severity} exception has been detected on shipment {shipmentId} ({orderRef}). Current location: {location}. Estimated business impact: {estimatedImpact}. SLA deadline: {slaDeadline}. Immediate intervention required.",
      active: true,
      updatedAt: "2026-03-20T08:00:00Z"
    },
    {
      id: "NT-002",
      name: "Customer Delivery Window Reschedule",
      triggerEvent: "ETA Changed",
      audience: "Customer",
      channels: ["In-App", "Email"],
      subjectTemplate: "Delivery Update for Order {orderRef} — New Estimated Arrival",
      bodyTemplate: "Dear {customerName}, your shipment {shipmentId} ({orderRef}) from {origin} to {destination} has encountered a transit deviation. Your updated arrival window is now confirmed for {approvedETA}. Track real-time progress via your customer portal.",
      active: true,
      updatedAt: "2026-03-21T10:30:00Z"
    },
    {
      id: "NT-003",
      name: "Carrier Recovery Request Notification",
      triggerEvent: "Recovery Requested",
      audience: "Carrier Operations",
      channels: ["In-App", "Webhook"],
      subjectTemplate: "Urgent Recovery Request {recoveryId}: Action Required for {shipmentId}",
      bodyTemplate: "Bridges Control Tower has submitted a recovery directive ({recoveryStrategy}) for shipment {shipmentId}. Reason: {recoveryReason}. Please accept or propose revision within 30 minutes in your Carrier Portal.",
      active: true,
      updatedAt: "2026-03-22T14:15:00Z"
    },
    {
      id: "NT-004",
      name: "Low-Severity Auto-Resolution Confirmation",
      triggerEvent: "Auto-Resolved",
      audience: "Control Tower Analyst",
      channels: ["In-App"],
      subjectTemplate: "Auto-Resolved: {exceptionId} on {shipmentId} cleared by rule {ruleId}",
      bodyTemplate: "Minor deviation {exceptionId} ({exceptionType}) has satisfied automated resolution criteria ({resolutionCondition}). Shipment ETA restored within SLA bounds. Audit entry logged.",
      active: true,
      updatedAt: "2026-03-22T16:00:00Z"
    },
    {
      id: "NT-005",
      name: "Proof of Delivery (POD) Sign-off Notice",
      triggerEvent: "Delivery Confirmed",
      audience: "Customer & Consignee",
      channels: ["Email", "SMS"],
      subjectTemplate: "Shipment Delivered: {orderRef} signed at {destination}",
      bodyTemplate: "Your shipment {shipmentId} was successfully delivered on {deliveredTime}. Receiver sign-off recorded by driver {driverName}. View and download digital Proof of Delivery document online.",
      active: true,
      updatedAt: "2026-03-23T09:00:00Z"
    },
    {
      id: "NT-006",
      name: "Executive Operational Escalation",
      triggerEvent: "Incident Escalated",
      audience: "Administrator",
      channels: ["In-App", "Email", "SMS"],
      subjectTemplate: "EXECUTIVE ESCALATION: {escalationReason} ({shipmentId})",
      bodyTemplate: "Incident on shipment {shipmentId} has been escalated to Management by {escalatedBy}. Potential penalty exposure: {penaltyExposure}. Actions attempted: {actionsAttempted}. Direct management intervention required.",
      active: true,
      updatedAt: "2026-03-23T11:45:00Z"
    }
  ],

  // Phase 1 - AI & Approval Configuration
  aiConfig: {
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
  },

  // Phase 1 - Role-Based Access Control (RBAC) Permissions Matrix
  rolePermissions: {
    "Administrator": {
      userManagement: "Full Access",
      carrierGovernance: "Full Access",
      exceptionTriage: "Full Access",
      recoveryPlanning: "Full Access",
      slaRulesConfig: "Full Access",
      notificationConfig: "Full Access",
      aiApprovalConfig: "Full Access",
      analyticsReports: "Full Access"
    },
    "Control Tower Analyst": {
      userManagement: "Denied",
      carrierGovernance: "Read Only",
      exceptionTriage: "Full Access",
      recoveryPlanning: "Full Access",
      slaRulesConfig: "Read Only",
      notificationConfig: "Read Only",
      aiApprovalConfig: "Read Only",
      analyticsReports: "Full Access"
    },
    "Dispatcher / Transport Planner": {
      userManagement: "Denied",
      carrierGovernance: "Read & Write",
      exceptionTriage: "Read Only",
      recoveryPlanning: "Full Access",
      slaRulesConfig: "Read Only",
      notificationConfig: "Read Only",
      aiApprovalConfig: "Read & Write",
      analyticsReports: "Read Only"
    },
    "Carrier Operations User": {
      userManagement: "Denied",
      carrierGovernance: "Read Only",
      exceptionTriage: "Read Only",
      recoveryPlanning: "Read & Write",
      slaRulesConfig: "Denied",
      notificationConfig: "Denied",
      aiApprovalConfig: "Denied",
      analyticsReports: "Denied"
    },
    "Warehouse Supervisor": {
      userManagement: "Denied",
      carrierGovernance: "Read Only",
      exceptionTriage: "Read & Write",
      recoveryPlanning: "Denied",
      slaRulesConfig: "Denied",
      notificationConfig: "Denied",
      aiApprovalConfig: "Denied",
      analyticsReports: "Read Only"
    },
    "Customer Service": {
      userManagement: "Denied",
      carrierGovernance: "Denied",
      exceptionTriage: "Read Only",
      recoveryPlanning: "Read Only",
      slaRulesConfig: "Denied",
      notificationConfig: "Read & Write",
      aiApprovalConfig: "Denied",
      analyticsReports: "Read Only"
    },
    "Customer": {
      userManagement: "Denied",
      carrierGovernance: "Denied",
      exceptionTriage: "Denied",
      recoveryPlanning: "Denied",
      slaRulesConfig: "Denied",
      notificationConfig: "Denied",
      aiApprovalConfig: "Denied",
      analyticsReports: "Read Only"
    }
  },

  // Phase 1 - Login & Session History Records
  loginHistory: [
    {
      id: "LOG-1001",
      userId: "USR-101",
      userName: "Bima Ary",
      email: "admin@gmail.com",
      role: "Administrator",
      timestamp: "2026-03-24T08:00:00Z",
      ipAddress: "192.168.1.101 (Dallas Ops HQ)",
      userAgent: "Chrome 128 / Windows 11",
      status: "Success",
      sessionDuration: "Active"
    },
    {
      id: "LOG-1002",
      userId: "USR-102",
      userName: "Sarah Lin",
      email: "cta@gmail.com",
      role: "Control Tower Analyst",
      timestamp: "2026-03-24T08:15:00Z",
      ipAddress: "192.168.1.105 (Dallas Ops HQ)",
      userAgent: "Chrome 128 / Windows 11",
      status: "Success",
      sessionDuration: "4h 25m"
    },
    {
      id: "LOG-1003",
      userId: "USR-104",
      userName: "Elena Rostova",
      email: "dispatcher@gmail.com",
      role: "Dispatcher / Transport Planner",
      timestamp: "2026-03-24T08:30:00Z",
      ipAddress: "192.168.1.112 (Dallas Ops HQ)",
      userAgent: "Firefox 130 / macOS Sonoma",
      status: "Success",
      sessionDuration: "4h 10m"
    },
    {
      id: "LOG-1004",
      userId: "USR-103",
      userName: "Marcus Vance",
      email: "carrier@gmail.com",
      role: "Carrier Operations User",
      timestamp: "2026-03-24T09:00:00Z",
      ipAddress: "172.56.21.88 (BGL Dispatch Portal)",
      userAgent: "Chrome 128 / Windows 11",
      status: "Success",
      sessionDuration: "3h 40m"
    },
    {
      id: "LOG-1005",
      userId: "USR-108",
      userName: "Jordan Bell",
      email: "jordan.bell@apexfreight.net",
      role: "Carrier Operations User",
      timestamp: "2026-03-24T09:12:00Z",
      ipAddress: "198.51.100.42 (Apex Haulers Gateway)",
      userAgent: "Edge 128 / Windows 10",
      status: "Blocked (Account Inactive)",
      sessionDuration: "—"
    },
    {
      id: "LOG-1006",
      userId: "USR-105",
      userName: "Carlos Mendoza",
      email: "warehouse@gmail.com",
      role: "Warehouse Supervisor",
      timestamp: "2026-03-24T09:30:00Z",
      ipAddress: "10.0.4.15 (Dallas Hub Dock Terminal)",
      userAgent: "Zebra Android Touch Mobile",
      status: "Success",
      sessionDuration: "3h 10m"
    },
    {
      id: "LOG-1007",
      userId: "USR-106",
      userName: "Clara Hughes",
      email: "cs@gmail.com",
      role: "Customer Service",
      timestamp: "2026-03-24T09:45:00Z",
      ipAddress: "192.168.1.120 (Care Ops Desk)",
      userAgent: "Safari 17 / macOS Sonoma",
      status: "Success",
      sessionDuration: "2h 55m"
    },
    {
      id: "LOG-1008",
      userId: "USR-109",
      userName: "Sarah Jenkins",
      email: "customer@gmail.com",
      role: "Customer",
      timestamp: "2026-03-24T10:05:00Z",
      ipAddress: "203.0.113.19 (BioPharma Corp VPN)",
      userAgent: "Chrome 128 / Windows 11",
      status: "Success",
      sessionDuration: "1h 45m"
    }
  ],

  // Phase 1 - Carrier Documents & Compliance Certifications
  carrierDocuments: [
    {
      id: "DOC-CAR-01-01",
      carrierId: "CAR-01",
      docType: "Master Services Agreement (MSA)",
      title: "BGL Enterprise Logistics Master Agreement 2026-2028",
      issueDate: "2026-01-01",
      expiryDate: "2028-01-01",
      status: "Verified",
      fileRef: "MSA-BGL-2026-Signed.pdf",
      uploadedBy: "Bima Ary (Administrator)"
    },
    {
      id: "DOC-CAR-01-02",
      carrierId: "CAR-01",
      docType: "Fleet Cargo Liability Insurance",
      title: "Certificate of Commercial Auto & Cargo Liability ($10M)",
      issueDate: "2026-01-15",
      expiryDate: "2027-01-15",
      status: "Verified",
      fileRef: "COI-BGL-10M-Coverage.pdf",
      uploadedBy: "Bima Ary (Administrator)"
    },
    {
      id: "DOC-CAR-01-03",
      carrierId: "CAR-01",
      docType: "HazMat Transportation Permit",
      title: "USDOT Hazardous Materials Safety Permit (HMSP)",
      issueDate: "2025-06-01",
      expiryDate: "2026-06-01",
      status: "Verified",
      fileRef: "USDOT-HMSP-88219.pdf",
      uploadedBy: "Amara Chen (Carrier Rep)"
    },
    {
      id: "DOC-CAR-02-01",
      carrierId: "CAR-02",
      docType: "Master Services Agreement (MSA)",
      title: "Apex Freight Master Carriage Agreement",
      issueDate: "2026-01-15",
      expiryDate: "2027-01-15",
      status: "Verified",
      fileRef: "MSA-Apex-2026.pdf",
      uploadedBy: "Bima Ary (Administrator)"
    },
    {
      id: "DOC-CAR-02-02",
      carrierId: "CAR-02",
      docType: "Fleet Cargo Liability Insurance",
      title: "Commercial Motor Vehicle Cargo Policy ($5M)",
      issueDate: "2026-01-10",
      expiryDate: "2027-01-10",
      status: "Verified",
      fileRef: "Apex-Cargo-Insurance-5M.pdf",
      uploadedBy: "David O'Connor"
    },
    {
      id: "DOC-CAR-03-01",
      carrierId: "CAR-03",
      docType: "Good Distribution Practice (GDP) Pharma",
      title: "European GDP Cold-Chain Certification for Pharmaceuticals",
      issueDate: "2025-09-01",
      expiryDate: "2026-09-01",
      status: "Verified",
      fileRef: "GDP-Nordic-Cold-2025.pdf",
      uploadedBy: "Astrid Lindholm"
    },
    {
      id: "DOC-CAR-04-01",
      carrierId: "CAR-04",
      docType: "Ocean Maritime Bill of Lading & Terminal Permit",
      title: "Pacific Marine Port Terminal Operating License",
      issueDate: "2025-11-01",
      expiryDate: "2026-11-01",
      status: "Verified",
      fileRef: "Pacific-Marine-Port-License.pdf",
      uploadedBy: "Kenji Sato"
    },
    {
      id: "DOC-CAR-05-01",
      carrierId: "CAR-05",
      docType: "Air Carrier Operating Certificate",
      title: "FAA Part 121 Cargo Air Carrier Certificate",
      issueDate: "2025-04-10",
      expiryDate: "2027-04-10",
      status: "Verified",
      fileRef: "FAA-Part121-SkyLink.pdf",
      uploadedBy: "Leila Haddad"
    }
  ],

  carriers: (typeof window !== 'undefined' && window.CARRIERS_500_SEED && window.CARRIERS_500_SEED.length >= 500)
    ? window.CARRIERS_500_SEED
    : [
    {
      id: "CAR-01",
      name: "Bridges Global Logistics",
      contactPerson: "Amara Chen",
      email: "achen@bridges-global.com",
      phone: "+1 (555) 234-8901",
      operatingRegion: "Trans-Continental North",
      carrierType: "Ground",
      status: "Active",
      rating: 4.9,
      createdAt: "2026-01-10T08:00:00Z",
      updatedAt: "2026-03-12T10:30:00Z"
    },
    {
      id: "CAR-02",
      name: "Apex Freight Systems",
      contactPerson: "David O'Connor",
      email: "operations@apexfreight.net",
      phone: "+1 (555) 871-3320",
      operatingRegion: "Central Corridor & Midwest",
      carrierType: "Ground",
      status: "Active",
      rating: 4.6,
      createdAt: "2026-01-15T09:15:00Z",
      updatedAt: "2026-02-28T14:20:00Z"
    },
    {
      id: "CAR-03",
      name: "Nordic Cold Chain Express",
      contactPerson: "Astrid Lindholm",
      email: "dispatch@nordic-cold.eu",
      phone: "+44 20 7946 0912",
      operatingRegion: "Northern Coast & Cold Corridors",
      carrierType: "Ground",
      status: "Active",
      rating: 4.8,
      createdAt: "2026-02-01T11:00:00Z",
      updatedAt: "2026-03-05T16:45:00Z"
    },
    {
      id: "CAR-04",
      name: "Pacific Marine Cargo Line",
      contactPerson: "Kenji Sato",
      email: "k.sato@pacificmarine.jp",
      phone: "+1 (555) 439-0021",
      operatingRegion: "Pacific Ocean Coastal Ports",
      carrierType: "Sea",
      status: "Active",
      rating: 4.5,
      createdAt: "2026-02-10T14:30:00Z",
      updatedAt: "2026-03-20T09:00:00Z"
    },
    {
      id: "CAR-05",
      name: "SkyLink Aviation Cargo",
      contactPerson: "Leila Haddad",
      email: "cargo-ops@skylink-air.com",
      phone: "+1 (555) 612-4490",
      operatingRegion: "Inter-Regional Air Hubs",
      carrierType: "Air",
      status: "Active",
      rating: 4.9,
      createdAt: "2026-02-18T10:00:00Z",
      updatedAt: "2026-03-15T12:00:00Z"
    },
    {
      id: "CAR-06",
      name: "Vanguard Regional Haulers",
      contactPerson: "Ronald Sterling",
      email: "info@vanguardhaul.com",
      phone: "+1 (555) 321-9988",
      operatingRegion: "Southern Desert Belt",
      carrierType: "Ground",
      status: "Inactive",
      rating: 3.8,
      createdAt: "2025-11-20T08:00:00Z",
      updatedAt: "2026-01-25T17:15:00Z"
    }
  ],

  users: [
    {
      id: "USR-101",
      name: "Bima Ary",
      email: "admin@gmail.com",
      phone: "+1 (555) 019-2834",
      role: "Administrator",
      status: "Active",
      carrierId: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z"
    },
    {
      id: "USR-102",
      name: "Sarah Lin",
      email: "cta@gmail.com",
      phone: "+1 (555) 234-5678",
      role: "Control Tower Analyst",
      status: "Active",
      carrierId: null,
      createdAt: "2026-01-12T10:00:00Z",
      updatedAt: "2026-02-10T15:30:00Z"
    },
    {
      id: "USR-103",
      name: "Marcus Vance",
      email: "carrier@gmail.com",
      phone: "+1 (555) 345-6789",
      role: "Carrier Operations User",
      status: "Active",
      carrierId: "CAR-01",
      createdAt: "2026-01-18T09:00:00Z",
      updatedAt: "2026-02-15T11:20:00Z"
    },
    {
      id: "USR-104",
      name: "Elena Rostova",
      email: "dispatcher@gmail.com",
      phone: "+1 (555) 456-7890",
      role: "Dispatcher / Transport Planner",
      status: "Active",
      carrierId: null,
      createdAt: "2026-01-22T13:40:00Z",
      updatedAt: "2026-02-18T09:15:00Z"
    },
    {
      id: "USR-105",
      name: "Carlos Mendoza",
      email: "warehouse@gmail.com",
      phone: "+1 (555) 567-8901",
      role: "Warehouse Supervisor",
      warehouseId: "WH-DAL-01",
      warehouseName: "Dallas Central Logistics Hub",
      status: "Active",
      carrierId: null,
      createdAt: "2026-02-05T08:30:00Z",
      updatedAt: "2026-02-05T08:30:00Z"
    },
    {
      id: "USR-106",
      name: "Clara Hughes",
      email: "c.hughes@bridges.io",
      phone: "+1 (555) 678-9012",
      role: "Customer Service",
      status: "Active",
      carrierId: null,
      createdAt: "2026-02-14T11:00:00Z",
      updatedAt: "2026-03-01T14:00:00Z"
    },
    {
      id: "USR-107",
      name: "Dmitri Volkov",
      email: "d.volkov@nordic-cold.eu",
      phone: "+44 20 7946 0881",
      role: "Carrier Operations User",
      status: "Active",
      carrierId: "CAR-03",
      createdAt: "2026-02-20T10:15:00Z",
      updatedAt: "2026-02-20T10:15:00Z"
    },
    {
      id: "USR-108",
      name: "Jordan Bell",
      email: "jordan.bell@apexfreight.net",
      phone: "+1 (555) 789-0123",
      role: "Carrier Operations User",
      status: "Inactive",
      carrierId: "CAR-02",
      createdAt: "2026-01-25T16:00:00Z",
      updatedAt: "2026-03-02T12:00:00Z"
    },
    {
      id: "USR-109",
      name: "Sarah Jenkins",
      email: "customer@gmail.com",
      phone: "+1 (555) 890-1234",
      role: "Customer",
      customerId: "CUST-BIO-01",
      customerName: "BioPharma Health Alliance",
      status: "Active",
      carrierId: null,
      createdAt: "2026-02-18T14:00:00Z",
      updatedAt: "2026-02-18T14:00:00Z"
    }
  ],

  resources: [
    {
      id: "AT-77",
      type: "Vehicle",
      category: "Air Unit",
      model: "Bridges Cargo Aircraft",
      plateNumber: "N-770BR",
      carrierId: "CAR-05",
      capacity: "12.7T",
      status: "Active", // Matches reference image "Active"
      currentLocation: "West Of Capital Knot Airfield",
      assignedDriverId: "DRV-02",
      createdAt: "2026-01-20T10:00:00Z",
      updatedAt: "2026-03-24T11:00:00Z"
    },
    {
      id: "BR-42",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Logistics Van",
      plateNumber: "WA-4288-LK",
      carrierId: "CAR-01",
      capacity: "3.5T",
      status: "Inactive", // Matches reference image "Inactive"
      currentLocation: "Capital Knot Distribution Hub",
      assignedDriverId: null,
      createdAt: "2026-01-22T08:00:00Z",
      updatedAt: "2026-03-18T14:30:00Z"
    },
    {
      id: "ST-09",
      type: "Vehicle",
      category: "Sea Unit",
      model: "Bridges Cargo Vessel",
      plateNumber: "IMO-992144",
      carrierId: "CAR-04",
      capacity: "48.5T",
      status: "Active", // Matches reference image "Active"
      currentLocation: "Lake Knot Port Terminal",
      assignedDriverId: "DRV-03",
      createdAt: "2026-01-25T12:00:00Z",
      updatedAt: "2026-03-22T09:00:00Z"
    },
    {
      id: "FR-33",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Transport Truck",
      plateNumber: "OR-3301-MK",
      carrierId: "CAR-01",
      capacity: "24.0T",
      status: "Maintenance", // Matches reference image "Maintenance"
      currentLocation: "South Knot Maintenance Depot",
      assignedDriverId: null,
      createdAt: "2026-02-01T09:00:00Z",
      updatedAt: "2026-03-20T16:00:00Z"
    },
    {
      id: "FR-23",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Transport Truck",
      plateNumber: "CA-2311-CK",
      carrierId: "CAR-01",
      capacity: "22.5T",
      status: "Active", // On Route in reference image
      currentLocation: "Capital Knot Highway Route 4",
      assignedDriverId: "DRV-01",
      createdAt: "2026-02-05T10:00:00Z",
      updatedAt: "2026-03-24T12:30:00Z"
    },
    {
      id: "CC-81",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Nordic Reefer Semi-Trailer",
      plateNumber: "EU-8199-NC",
      carrierId: "CAR-03",
      capacity: "18.0T",
      status: "Active",
      currentLocation: "Mountain Knot Cold Hub",
      assignedDriverId: "DRV-04",
      createdAt: "2026-02-12T11:00:00Z",
      updatedAt: "2026-03-23T15:20:00Z"
    },
    {
      id: "BG-12",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Heavy Freight Semi",
      plateNumber: "CA-1290-BG",
      carrierId: "CAR-01",
      capacity: "26.0T",
      status: "Available",
      currentLocation: "Capital Knot Logistics Hub",
      assignedDriverId: null,
      createdAt: "2026-02-15T08:00:00Z",
      updatedAt: "2026-03-24T08:00:00Z"
    },
    {
      id: "BG-55",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Climate Reefer Van",
      plateNumber: "CA-5510-RF",
      carrierId: "CAR-01",
      capacity: "5.5T",
      status: "Available",
      currentLocation: "Capital Knot Logistics Hub",
      assignedDriverId: null,
      createdAt: "2026-02-18T09:00:00Z",
      updatedAt: "2026-03-24T09:00:00Z"
    },
    {
      id: "BG-90",
      type: "Vehicle",
      category: "Ground Unit",
      model: "Bridges Urban Cargo Van",
      plateNumber: "CA-9044-UV",
      carrierId: "CAR-01",
      capacity: "2.8T",
      status: "Inactive",
      currentLocation: "West Staging Yard",
      assignedDriverId: null,
      createdAt: "2026-01-10T10:00:00Z",
      updatedAt: "2026-03-01T10:00:00Z"
    },

    // Drivers
    {
      id: "DRV-01",
      type: "Driver",
      name: "Ethan Cole",
      phone: "+1 (555) 761-0921",
      licenseNumber: "CDL-9981-A",
      carrierId: "CAR-01",
      status: "Active",
      currentVehicleId: "FR-23",
      createdAt: "2026-01-15T09:00:00Z",
      updatedAt: "2026-03-24T12:00:00Z"
    },
    {
      id: "DRV-02",
      type: "Driver",
      name: "Olivia Hayes",
      phone: "+1 (555) 832-1104",
      licenseNumber: "ATP-4410-C",
      carrierId: "CAR-05",
      status: "Active",
      currentVehicleId: "AT-77",
      createdAt: "2026-01-18T10:30:00Z",
      updatedAt: "2026-03-24T11:00:00Z"
    },
    {
      id: "DRV-03",
      type: "Driver",
      name: "Lucas Reed",
      phone: "+1 (555) 604-9823",
      licenseNumber: "MAR-7702-M",
      carrierId: "CAR-04",
      status: "Active",
      currentVehicleId: "ST-09",
      createdAt: "2026-01-20T14:00:00Z",
      updatedAt: "2026-03-22T09:00:00Z"
    },
    {
      id: "DRV-04",
      type: "Driver",
      name: "Norman Reedus",
      phone: "+1 (555) 919-4455",
      licenseNumber: "CDL-1029-B",
      carrierId: "CAR-01",
      status: "Available",
      currentVehicleId: null,
      createdAt: "2026-02-01T08:00:00Z",
      updatedAt: "2026-03-24T10:00:00Z"
    },
    {
      id: "DRV-05",
      type: "Driver",
      name: "Ana Brooks",
      phone: "+1 (555) 441-2309",
      licenseNumber: "CDL-5520-X",
      carrierId: "CAR-01",
      status: "Available",
      currentVehicleId: null,
      createdAt: "2026-02-10T11:00:00Z",
      updatedAt: "2026-03-20T16:00:00Z"
    },
    {
      id: "DRV-06",
      type: "Driver",
      name: "Liam Patel",
      phone: "+1 (555) 312-8822",
      licenseNumber: "CDL-6611-C",
      carrierId: "CAR-01",
      status: "Available",
      currentVehicleId: null,
      createdAt: "2026-02-20T08:00:00Z",
      updatedAt: "2026-03-24T08:00:00Z"
    },
    {
      id: "DRV-07",
      type: "Driver",
      name: "Sofia Rossi",
      phone: "+1 (555) 723-9911",
      licenseNumber: "CDL-7744-M",
      carrierId: "CAR-01",
      status: "Off Duty",
      currentVehicleId: null,
      createdAt: "2026-02-22T09:00:00Z",
      updatedAt: "2026-03-24T09:00:00Z"
    },
    {
      id: "DRV-08",
      type: "Driver",
      name: "Darius Vance",
      phone: "+1 (555) 880-1234",
      licenseNumber: "CDL-8820-K",
      carrierId: "CAR-01",
      status: "Inactive",
      currentVehicleId: null,
      createdAt: "2026-01-15T08:00:00Z",
      updatedAt: "2026-02-28T12:00:00Z"
    }
  ],

  shipments: [
    {
      id: "BRG-2848",
      orderReference: "ORD-98248",
      origin: "West Of Capital Knot",
      destination: "Capital Knot Hub",
      carrierId: "CAR-05",
      vehicleId: "AT-77",
      driverName: "Olivia Hayes",
      cargoType: "High-Priority Medical Kits",
      cargoValue: "$485,000",
      customerTier: "Tier 1 Strategic",
      status: "Loading",
      currentLocation: "West Of Capital Knot Airfield",
      departureTime: "2026-03-24T14:00:00Z",
      estArrival: "2026-03-24T18:30:00Z",
      originalETA: "2026-03-24T18:30:00Z",
      predictedETA: "2026-03-24T18:30:00Z",
      deliveryCommitment: "2026-03-24T19:00:00Z",
      slaDeadline: "2026-03-24T19:30:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: null,
      onTime: null,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T08:30:00Z", status: "completed" },
        { name: "Manifest Verified", time: "2026-03-24T10:15:00Z", status: "completed" },
        { name: "Aircraft Ramp Loading", time: "2026-03-24T13:45:00Z", status: "in_progress" },
        { name: "En Route Sky Corridor", time: null, status: "pending" },
        { name: "Capital Knot Arrival", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "West Of Capital Knot", status: "active", icon: "origin" },
        { name: "North Airway Waypoint A", status: "pending", icon: "waypoint" },
        { name: "Capital Knot Airfield", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T08:30:00Z"
    },
    {
      id: "BRG-2847",
      orderReference: "ORD-98247",
      origin: "Capital Knot Hub",
      destination: "Lake Knot Hub",
      carrierId: "CAR-01",
      vehicleId: "FR-23",
      driverName: "Ethan Cole",
      cargoType: "Industrial Electronics & Sensors",
      cargoValue: "$340,000",
      customerTier: "Tier 1 Strategic",
      status: "Delayed",
      currentLocation: "Highway Route 4 MP 112",
      departureTime: "2026-03-24T11:30:00Z",
      estArrival: "2026-03-24T13:45:00Z",
      originalETA: "2026-03-24T12:30:00Z",
      predictedETA: "2026-03-24T13:45:00Z",
      deliveryCommitment: "2026-03-24T13:00:00Z",
      slaDeadline: "2026-03-24T13:30:00Z",
      slaRisk: "High",
      estimatedPenalty: "$18,500",
      actualArrival: null,
      onTime: false,
      hasException: true,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T09:00:00Z", status: "completed" },
        { name: "Departed Hub", time: "2026-03-24T11:30:00Z", status: "completed" },
        { name: "Checkpoint Alpha", time: "2026-03-24T12:10:00Z", status: "completed" },
        { name: "Detour Transit", time: "2026-03-24T12:45:00Z", status: "in_progress" },
        { name: "Lake Knot Terminal", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "Capital Knot Hub", status: "completed", icon: "origin" },
        { name: "Highway 4 MP 112 (Rockslide)", status: "incident", icon: "alert" },
        { name: "Valley 3 Bypass (Re-route)", status: "active", icon: "reroute" },
        { name: "Lake Knot Hub", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T09:00:00Z"
    },
    {
      id: "BRG-2846",
      orderReference: "ORD-98246",
      origin: "Capital Knot Hub",
      destination: "Lake Knot Hub",
      carrierId: "CAR-04",
      vehicleId: "ST-09",
      driverName: "Lucas Reed",
      cargoType: "Containerized Port Freight",
      cargoValue: "$920,000",
      customerTier: "Tier 1 Strategic",
      status: "Delayed",
      currentLocation: "Lake Knot Sea Berth 3",
      departureTime: "2026-03-24T06:00:00Z",
      estArrival: "2026-03-24T14:45:00Z",
      originalETA: "2026-03-24T12:00:00Z",
      predictedETA: "2026-03-24T14:45:00Z",
      deliveryCommitment: "2026-03-24T13:00:00Z",
      slaDeadline: "2026-03-24T13:30:00Z",
      slaRisk: "Critical",
      estimatedPenalty: "$14,200",
      actualArrival: null,
      onTime: false,
      hasException: true,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T05:30:00Z", status: "completed" },
        { name: "Vessel Departed", time: "2026-03-24T06:00:00Z", status: "completed" },
        { name: "Harbor Approach", time: "2026-03-24T11:00:00Z", status: "completed" },
        { name: "Berth Docking Queue", time: "2026-03-24T11:45:00Z", status: "in_progress" },
        { name: "Container Discharged", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "Capital Knot Maritime Basin", status: "completed", icon: "origin" },
        { name: "Coastal Straits", status: "completed", icon: "waypoint" },
        { name: "Lake Knot Port Berth 3 (Tide Delay)", status: "incident", icon: "alert" },
        { name: "Lake Knot Freight Hub", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T05:30:00Z"
    },
    {
      id: "BRG-2845",
      orderReference: "ORD-98245",
      origin: "South Knot Hub",
      destination: "Mountain Knot Hub",
      carrierId: "CAR-01",
      vehicleId: "FR-23",
      driverName: "Norman Reedus",
      cargoType: "Solar Battery Storage Cells",
      cargoValue: "$175,000",
      customerTier: "Tier 2 Commercial",
      status: "On Route",
      currentLocation: "South Valley Highway MP 45",
      departureTime: "2026-03-24T12:00:00Z",
      estArrival: "2026-03-24T16:25:00Z",
      originalETA: "2026-03-24T16:25:00Z",
      predictedETA: "2026-03-24T16:25:00Z",
      deliveryCommitment: "2026-03-24T17:00:00Z",
      slaDeadline: "2026-03-24T17:30:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: null,
      onTime: null,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T10:15:00Z", status: "completed" },
        { name: "Depot Departure", time: "2026-03-24T12:00:00Z", status: "completed" },
        { name: "Transit Checkpoint", time: "2026-03-24T13:30:00Z", status: "in_progress" },
        { name: "Mountain Knot Arrival", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "South Knot Hub", status: "completed", icon: "origin" },
        { name: "South Valley Highway", status: "active", icon: "waypoint" },
        { name: "Mountain Knot Hub", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T10:15:00Z"
    },
    {
      id: "BRG-2844",
      orderReference: "ORD-98244",
      origin: "South Knot Hub",
      destination: "Capital Knot Hub",
      carrierId: "CAR-01",
      vehicleId: "FR-33",
      driverName: "Ana Brooks",
      cargoType: "Structural Composite Beams",
      cargoValue: "$82,000",
      customerTier: "Tier 3 Standard",
      status: "Delivered",
      currentLocation: "Capital Knot Hub",
      departureTime: "2026-03-22T08:00:00Z",
      estArrival: "2026-03-23T14:30:00Z",
      originalETA: "2026-03-23T14:30:00Z",
      predictedETA: "2026-03-23T14:15:00Z",
      deliveryCommitment: "2026-03-23T15:00:00Z",
      slaDeadline: "2026-03-23T16:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: "2026-03-23T14:15:00Z",
      onTime: true,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-22T07:00:00Z", status: "completed" },
        { name: "Departed", time: "2026-03-22T08:00:00Z", status: "completed" },
        { name: "In Transit", time: "2026-03-22T14:00:00Z", status: "completed" },
        { name: "Delivered", time: "2026-03-23T14:15:00Z", status: "completed" }
      ],
      routeWaypoints: [
        { name: "South Knot Hub", status: "completed", icon: "origin" },
        { name: "Capital Knot Hub", status: "completed", icon: "destination" }
      ],
      createdAt: "2026-03-22T07:00:00Z"
    },
    {
      id: "BRG-2843",
      orderReference: "ORD-98243",
      origin: "Lake Knot Hub",
      destination: "Mountain Knot Hub",
      carrierId: "CAR-03",
      vehicleId: "CC-81",
      driverName: "Norman Reedus",
      cargoType: "Biopharma Vaccine Lot #44",
      cargoValue: "$650,000",
      customerTier: "Tier 1 Strategic",
      status: "Delayed",
      currentLocation: "Mountain Pass 7 Cryo Corridor",
      departureTime: "2026-03-23T10:00:00Z",
      estArrival: "2026-03-24T18:30:00Z",
      originalETA: "2026-03-24T14:00:00Z",
      predictedETA: "2026-03-24T18:30:00Z",
      deliveryCommitment: "2026-03-24T15:00:00Z",
      slaDeadline: "2026-03-24T15:30:00Z",
      slaRisk: "Critical",
      estimatedPenalty: "$85,000",
      actualArrival: null,
      onTime: false,
      hasException: true,
      milestones: [
        { name: "Order Placed", time: "2026-03-23T09:00:00Z", status: "completed" },
        { name: "Cold Unit Departed", time: "2026-03-23T10:00:00Z", status: "completed" },
        { name: "Thermal Excursion Detected", time: "2026-03-24T08:00:00Z", status: "incident" },
        { name: "Emergency Transfer", time: "2026-03-24T10:30:00Z", status: "in_progress" },
        { name: "Mountain Knot Medical", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "Lake Knot Hub", status: "completed", icon: "origin" },
        { name: "Mountain Pass 7 (+4.8°C Spike)", status: "incident", icon: "alert" },
        { name: "Mountain Knot Medical Depot", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-23T09:00:00Z"
    },
    {
      id: "BRG-2842",
      orderReference: "ORD-98242",
      origin: "Capital Knot Hub",
      destination: "South Knot Hub",
      carrierId: "CAR-02",
      vehicleId: "BR-42",
      driverName: "Ethan Cole",
      cargoType: "Agricultural Machinery Parts",
      cargoValue: "$95,000",
      customerTier: "Tier 2 Commercial",
      status: "Delivered",
      currentLocation: "South Knot Hub",
      departureTime: "2026-03-21T07:00:00Z",
      estArrival: "2026-03-22T12:00:00Z",
      originalETA: "2026-03-22T12:00:00Z",
      predictedETA: "2026-03-22T11:40:00Z",
      deliveryCommitment: "2026-03-22T13:00:00Z",
      slaDeadline: "2026-03-22T14:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: "2026-03-22T11:40:00Z",
      onTime: true,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-21T06:00:00Z", status: "completed" },
        { name: "Departed", time: "2026-03-21T07:00:00Z", status: "completed" },
        { name: "Delivered", time: "2026-03-22T11:40:00Z", status: "completed" }
      ],
      routeWaypoints: [
        { name: "Capital Knot Hub", status: "completed", icon: "origin" },
        { name: "South Knot Hub", status: "completed", icon: "destination" }
      ],
      createdAt: "2026-03-21T06:00:00Z"
    },
    {
      id: "BRG-2841",
      orderReference: "ORD-98241",
      origin: "Mountain Knot Hub",
      destination: "Lake Knot Hub",
      carrierId: "CAR-01",
      vehicleId: "FR-23",
      driverName: "Ana Brooks",
      cargoType: "High Precision Lab Instruments",
      cargoValue: "$310,000",
      customerTier: "Tier 1 Strategic",
      status: "Delivered",
      currentLocation: "Lake Knot Hub",
      departureTime: "2026-03-20T09:00:00Z",
      estArrival: "2026-03-21T18:00:00Z",
      originalETA: "2026-03-21T18:00:00Z",
      predictedETA: "2026-03-21T19:25:00Z",
      deliveryCommitment: "2026-03-21T18:30:00Z",
      slaDeadline: "2026-03-21T19:00:00Z",
      slaRisk: "Medium",
      estimatedPenalty: "$3,200",
      actualArrival: "2026-03-21T19:25:00Z",
      onTime: false,
      hasException: true,
      milestones: [
        { name: "Order Placed", time: "2026-03-20T08:00:00Z", status: "completed" },
        { name: "Departed", time: "2026-03-20T09:00:00Z", status: "completed" },
        { name: "Blizzard Detour", time: "2026-03-20T14:00:00Z", status: "completed" },
        { name: "Delivered", time: "2026-03-21T19:25:00Z", status: "completed" }
      ],
      routeWaypoints: [
        { name: "Mountain Knot Hub", status: "completed", icon: "origin" },
        { name: "Valley 3 Detour", status: "completed", icon: "reroute" },
        { name: "Lake Knot Hub", status: "completed", icon: "destination" }
      ],
      createdAt: "2026-03-20T08:00:00Z"
    },
    {
      id: "BRG-2840",
      orderReference: "ORD-98240",
      origin: "West Of Capital Knot",
      destination: "South Knot Hub",
      carrierId: "CAR-05",
      vehicleId: "AT-77",
      driverName: "Olivia Hayes",
      cargoType: "Emergency Power Inverters",
      cargoValue: "$125,000",
      customerTier: "Tier 2 Commercial",
      status: "Delivered",
      currentLocation: "South Knot Hub",
      departureTime: "2026-03-19T13:00:00Z",
      estArrival: "2026-03-19T19:00:00Z",
      originalETA: "2026-03-19T19:00:00Z",
      predictedETA: "2026-03-19T18:45:00Z",
      deliveryCommitment: "2026-03-19T20:00:00Z",
      slaDeadline: "2026-03-19T21:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: "2026-03-19T18:45:00Z",
      onTime: true,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-19T12:00:00Z", status: "completed" },
        { name: "Flight Departed", time: "2026-03-19T13:00:00Z", status: "completed" },
        { name: "Delivered", time: "2026-03-19T18:45:00Z", status: "completed" }
      ],
      routeWaypoints: [
        { name: "West Of Capital Knot", status: "completed", icon: "origin" },
        { name: "South Knot Hub", status: "completed", icon: "destination" }
      ],
      createdAt: "2026-03-19T12:00:00Z"
    },
    {
      id: "BRG-2839",
      orderReference: "ORD-98239",
      origin: "Capital Knot Hub",
      destination: "Mountain Knot Hub",
      carrierId: "CAR-03",
      vehicleId: "CC-81",
      driverName: "Norman Reedus",
      cargoType: "Insulin & Plasma Samples",
      cargoValue: "$410,000",
      customerTier: "Tier 1 Strategic",
      status: "Delivered",
      currentLocation: "Mountain Knot Hub",
      departureTime: "2026-03-18T08:30:00Z",
      estArrival: "2026-03-19T14:00:00Z",
      originalETA: "2026-03-19T14:00:00Z",
      predictedETA: "2026-03-19T13:50:00Z",
      deliveryCommitment: "2026-03-19T15:00:00Z",
      slaDeadline: "2026-03-19T16:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: "2026-03-19T13:50:00Z",
      onTime: true,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-18T07:45:00Z", status: "completed" },
        { name: "Departed", time: "2026-03-18T08:30:00Z", status: "completed" },
        { name: "Delivered", time: "2026-03-19T13:50:00Z", status: "completed" }
      ],
      routeWaypoints: [
        { name: "Capital Knot Hub", status: "completed", icon: "origin" },
        { name: "Mountain Knot Hub", status: "completed", icon: "destination" }
      ],
      createdAt: "2026-03-18T07:45:00Z"
    },
    {
      id: "BRG-2849",
      orderReference: "ORD-98249",
      origin: "South Knot Hub",
      destination: "Dallas Central Logistics Hub",
      carrierId: "CAR-01",
      vehicleId: "BG-12",
      driverName: "Norman Reedus",
      cargoType: "Precision Telemetry Sensors & Cables",
      cargoValue: "$145,000",
      customerTier: "Tier 1 Strategic",
      status: "On Route",
      currentLocation: "Dallas Interstate Corridor MP 18",
      departureTime: "2026-03-24T09:00:00Z",
      estArrival: "2026-03-24T16:00:00Z",
      originalETA: "2026-03-24T16:00:00Z",
      predictedETA: "2026-03-24T16:00:00Z",
      deliveryCommitment: "2026-03-24T17:30:00Z",
      slaDeadline: "2026-03-24T18:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: null,
      onTime: null,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T07:00:00Z", status: "completed" },
        { name: "Departed Hub", time: "2026-03-24T09:00:00Z", status: "completed" },
        { name: "Interstate Transit", time: "2026-03-24T11:30:00Z", status: "in_progress" },
        { name: "Dallas Inbound Dock 04", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "South Knot Hub", status: "completed", icon: "origin" },
        { name: "Dallas Central Logistics Hub", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T07:00:00Z"
    },
    {
      id: "BRG-2850",
      orderReference: "ORD-98250",
      origin: "Dallas Central Logistics Hub",
      destination: "Chicago O'Hare Freight Depot",
      carrierId: "CAR-01",
      vehicleId: "BG-55",
      driverName: "Ana Brooks",
      cargoType: "Biomedical Reagents & Cold Culture",
      cargoValue: "$210,000",
      customerTier: "Tier 1 Strategic",
      status: "Ready for Pickup",
      currentLocation: "Dallas Central Hub Staging Aisle 3",
      departureTime: "2026-03-24T17:00:00Z",
      estArrival: "2026-03-25T08:30:00Z",
      originalETA: "2026-03-25T08:30:00Z",
      predictedETA: "2026-03-25T08:30:00Z",
      deliveryCommitment: "2026-03-25T10:00:00Z",
      slaDeadline: "2026-03-25T11:00:00Z",
      slaRisk: "None",
      estimatedPenalty: "$0",
      actualArrival: null,
      onTime: null,
      hasException: false,
      milestones: [
        { name: "Order Placed", time: "2026-03-24T08:30:00Z", status: "completed" },
        { name: "Warehouse Picking", time: "2026-03-24T10:00:00Z", status: "in_progress" },
        { name: "Dock Loading", time: null, status: "pending" },
        { name: "Chicago Arrival", time: null, status: "pending" }
      ],
      routeWaypoints: [
        { name: "Dallas Central Logistics Hub", status: "active", icon: "origin" },
        { name: "Chicago O'Hare Freight Depot", status: "pending", icon: "destination" }
      ],
      createdAt: "2026-03-24T08:30:00Z"
    }
  ],

  exceptions: [
    // 1. High-severity Port Berth Delay (Unassigned - Open for Analyst ownership!)
    {
      id: "EXC-1048",
      shipmentId: "BRG-2846",
      carrierId: "CAR-04",
      type: "Route Delay",
      severity: "High",
      rootCause: "Port Gate Congestion & High Tide Berth Delay",
      status: "Open",
      assignedAnalyst: null,
      autoResolved: false,
      autoActionTaken: null,
      location: "Lake Knot Port Berth Gate 3",
      detectionTime: "2026-03-24T07:15:00Z",
      predictedETA: "2026-03-24T14:45:00Z",
      slaRisk: "High",
      estimatedBusinessImpact: "$14,200 contractual demurrage penalty",
      timeline: [
        { timestamp: "2026-03-24T07:15:00Z", actor: "System (TMS Rule Engine)", action: "Exception Detected", note: "Predicted arrival exceeds SLA breach buffer by 1h 15m." },
        { timestamp: "2026-03-24T07:20:00Z", actor: "System", action: "Queue Ingestion", note: "Routed to Intervention Queue. Awaiting Analyst ownership." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      createdAt: "2026-03-24T07:15:00Z",
      resolvedAt: null,
      finalOutcome: null
    },

    // 2. Critical Cold Chain Temperature Excursion (Assigned to Sarah Lin - In Investigation)
    {
      id: "EXC-1047",
      shipmentId: "BRG-2843",
      carrierId: "CAR-03",
      type: "Temperature Breach",
      severity: "Critical",
      rootCause: "Secondary Compressor Inverter Fluctuation (+4.8°C spike)",
      status: "Investigating",
      assignedAnalyst: "Sarah Lin (Control Tower)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Mountain Pass 7 Cryo Corridor",
      detectionTime: "2026-03-24T08:00:00Z",
      predictedETA: "2026-03-24T18:30:00Z",
      slaRisk: "Critical",
      estimatedBusinessImpact: "$85,000 biopharma lot spoilage risk",
      timeline: [
        { timestamp: "2026-03-24T08:00:00Z", actor: "System (IoT Sensor)", action: "Temperature Alert", note: "Internal temperature rose above -18°C threshold to -13.2°C." },
        { timestamp: "2026-03-24T08:15:00Z", actor: "Sarah Lin (Control Tower)", action: "Ownership Taken", note: "Assigned high-urgency biopharma investigation to primary analyst." },
        { timestamp: "2026-03-24T08:30:00Z", actor: "Sarah Lin (Control Tower)", action: "War Room Escalation", note: "Escalated to War Room. Evaluating Alternate Carrier emergency flight transfer." }
      ],
      coordinationNotes: [
        { timestamp: "2026-03-24T08:45:00Z", author: "Sarah Lin", note: "Driver Norman Reedus checked auxiliary generator. Compressor motor stator overheated." },
        { timestamp: "2026-03-24T09:15:00Z", author: "Sarah Lin", note: "Coordinating with SkyLink Aviation for emergency airstrip transload at Mountain Airstrip." }
      ],
      recoveryRequestId: "REC-2002",
      createdAt: "2026-03-24T08:00:00Z",
      resolvedAt: null,
      finalOutcome: null
    },

    // 3. High-severity Rockslide Detour (Recovery in Progress!)
    {
      id: "EXC-1049",
      shipmentId: "BRG-2847",
      carrierId: "CAR-01",
      type: "Route Delay",
      severity: "High",
      rootCause: "Rockslide blockage on Highway 4; planned arterial impassable",
      status: "Recovery in Progress",
      assignedAnalyst: "Sarah Lin (Control Tower)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Highway Route 4 MP 112",
      detectionTime: "2026-03-24T09:30:00Z",
      predictedETA: "2026-03-24T13:45:00Z",
      slaRisk: "High",
      estimatedBusinessImpact: "$18,500 delayed delivery penalty",
      timeline: [
        { timestamp: "2026-03-24T09:30:00Z", actor: "System (GPS Telematics)", action: "Route Stoppage Alert", note: "Vehicle FR-23 velocity dropped to 0 km/h for 25 mins." },
        { timestamp: "2026-03-24T09:35:00Z", actor: "Sarah Lin (Control Tower)", action: "Ownership Taken", note: "Confirmed Highway Patrol rockfall closure." },
        { timestamp: "2026-03-24T09:45:00Z", actor: "Sarah Lin (Control Tower)", action: "Recovery Request Initiated", note: "Requested Re-route authorization via Valley 3 bypass (REC-2001)." },
        { timestamp: "2026-03-24T10:15:00Z", actor: "Carrier Dispatch", action: "Recovery Accepted", note: "Bridges Global Logistics accepted Valley 3 route. Revised ETA 13:45." }
      ],
      coordinationNotes: [
        { timestamp: "2026-03-24T09:40:00Z", author: "Sarah Lin", note: "Valley 3 road surface is dry and open for heavy freight up to 24 tons." }
      ],
      recoveryRequestId: "REC-2001",
      createdAt: "2026-03-24T09:30:00Z",
      resolvedAt: null,
      finalOutcome: null
    },

    // 4. Low-Severity Auto-Resolved Exception #1 (Dwell buffer applied automatically)
    {
      id: "EXC-1050",
      shipmentId: "BRG-2848",
      carrierId: "CAR-05",
      type: "Excessive Dwell Time",
      severity: "Low",
      rootCause: "Minor gate queue congestion during morning shift change (18 min dwell)",
      status: "Resolved",
      assignedAnalyst: "System Rule Engine",
      autoResolved: true,
      autoActionTaken: "Applied automated 20-minute ramp boarding grace buffer; notified air-cargo ground crew.",
      location: "West Of Capital Knot Airfield Gate 4",
      detectionTime: "2026-03-24T08:45:00Z",
      predictedETA: "2026-03-24T18:30:00Z",
      slaRisk: "Low",
      estimatedBusinessImpact: "Minimal (< $250 internal buffer)",
      timeline: [
        { timestamp: "2026-03-24T08:45:00Z", actor: "System (Sensor Engine)", action: "Dwell Threshold Exceeded", note: "Dwell reached 18 minutes at security gate." },
        { timestamp: "2026-03-24T08:46:00Z", actor: "System (Automation Rule #14)", action: "Auto-Resolution", note: "Low-severity gate buffer rule triggered. Applied 20-minute operational grace." },
        { timestamp: "2026-03-24T09:05:00Z", actor: "System (GPS Telematics)", action: "Gate Cleared", note: "Unit boarded ramp. Departure schedule normalized." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      createdAt: "2026-03-24T08:45:00Z",
      resolvedAt: "2026-03-24T09:05:00Z",
      finalOutcome: "Dwell cleared within threshold; aircraft departed on schedule with zero ETA deviation."
    },

    // 5. Low-Severity Auto-Resolved Exception #2 (Telemetry glitch verified nominal)
    {
      id: "EXC-1051",
      shipmentId: "BRG-2845",
      carrierId: "CAR-01",
      type: "Temperature Breach",
      severity: "Low",
      rootCause: "Cellular handoff packet drop between towers 12 and 14 causing sensor ping drop",
      status: "Resolved",
      assignedAnalyst: "System Rule Engine",
      autoResolved: true,
      autoActionTaken: "Triggered dual-sensor secondary poll; verified continuous -21.4°C baseline with zero thermal drift.",
      location: "South Valley Highway MP 45",
      detectionTime: "2026-03-24T10:30:00Z",
      predictedETA: "2026-03-24T16:25:00Z",
      slaRisk: "Low",
      estimatedBusinessImpact: "$0 (False Alert)",
      timeline: [
        { timestamp: "2026-03-24T10:30:00Z", actor: "System (Sensor Telemetry)", action: "Telemetry Drop", note: "Single-packet sensor heartbeat timeout." },
        { timestamp: "2026-03-24T10:31:00Z", actor: "System (Diagnostics Rule #07)", action: "Telemetry Verified", note: "Redundant probe responded with verified -21.4°C nominal reading." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      createdAt: "2026-03-24T10:30:00Z",
      resolvedAt: "2026-03-24T10:31:00Z",
      finalOutcome: "Telemetry re-established; cargo thermal compliance certified with unbroken record."
    },

    // 6. Resolved Historical Exceptions (History US-16 / US-41 to US-43)
    {
      id: "EXC-1046",
      shipmentId: "BRG-2841",
      carrierId: "CAR-01",
      type: "Route Delay",
      severity: "Medium",
      rootCause: "Severe Blizzard & Mountain Pass 7 Closure",
      status: "Closed",
      assignedAnalyst: "Sarah Lin (Control Tower)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Mountain Pass 7 North Slope",
      detectionTime: "2026-03-20T12:00:00Z",
      predictedETA: "2026-03-21T19:25:00Z",
      slaRisk: "Medium",
      estimatedBusinessImpact: "$3,200 contractual delay penalty",
      timeline: [
        { timestamp: "2026-03-20T12:00:00Z", actor: "System", action: "Exception Detected", note: "Weather service declared Pass 7 closed." },
        { timestamp: "2026-03-20T12:30:00Z", actor: "Sarah Lin (Control Tower)", action: "Re-route Initiated", note: "Authorized alternate southern detour route through Valley 3." },
        { timestamp: "2026-03-21T06:30:00Z", actor: "Carrier Dispatch", action: "Detour Cleared", note: "Shipment cleared Valley 3 without incident." },
        { timestamp: "2026-03-21T19:25:00Z", actor: "Sarah Lin (Control Tower)", action: "Closed", note: "Delivered safely; client signed weather exception waiver." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Severe Blizzard & Mountain Pass 7 Closure",
        recoveryStrategy: "Re-route",
        summary: "Authorized southern detour route through Valley 3. Adjusted ETA by +1h 25m with customer notice.",
        deliveryOutcome: "Delivered with Delay",
        slaOutcome: "Waived (Weather)",
        finalEta: "2026-03-21T19:25:00Z",
        closedBy: "Sarah Lin (Control Tower)",
        closedAt: "2026-03-21T20:00:00Z"
      },
      createdAt: "2026-03-20T12:00:00Z",
      resolvedAt: "2026-03-21T06:30:00Z",
      finalOutcome: "Shipment arrived safely with zero cargo damage; client agreed to weather waiver."
    },
    {
      id: "EXC-1045",
      shipmentId: "BRG-2838",
      carrierId: "CAR-03",
      type: "Temperature Breach",
      severity: "Critical",
      rootCause: "Dry Ice Depletion in Tertiary Chamber during transfer",
      status: "Closed",
      assignedAnalyst: "Dmitri Volkov (Carrier Ops)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Lake Knot Cryo Depot",
      detectionTime: "2026-03-17T14:20:00Z",
      predictedETA: "2026-03-17T18:00:00Z",
      slaRisk: "Critical",
      estimatedBusinessImpact: "$45,000 pharmaceutical spoilage risk",
      timeline: [
        { timestamp: "2026-03-17T14:20:00Z", actor: "System", action: "Temperature Alert", note: "Tertiary chamber thermal sensor reached -15°C." },
        { timestamp: "2026-03-17T14:35:00Z", actor: "Dmitri Volkov", action: "Expedite Replenishment", note: "Emergency dry ice replenishment at Lake Knot Cryo Depot." },
        { timestamp: "2026-03-17T15:45:00Z", actor: "QA Inspector", action: "Integrity Certified", note: "Thermal stability verified within 18 minutes." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Dry Ice Depletion in Tertiary Chamber during transfer",
        recoveryStrategy: "Expedite",
        summary: "Emergency rapid replenishment protocol engaged at Lake Knot Cryo Depot. Verified thermal stability within 18 minutes.",
        deliveryOutcome: "Delivered",
        slaOutcome: "Preserved",
        finalEta: "2026-03-17T18:00:00Z",
        closedBy: "Dmitri Volkov (Carrier Ops)",
        closedAt: "2026-03-17T16:00:00Z"
      },
      createdAt: "2026-03-17T14:20:00Z",
      resolvedAt: "2026-03-17T15:45:00Z",
      finalOutcome: "Thermal integrity certified intact by QA Inspector; pharma lot released without quarantine."
    },
    {
      id: "EXC-1044",
      shipmentId: "BRG-2835",
      carrierId: "CAR-01",
      type: "Mechanical Breakdown",
      severity: "High",
      rootCause: "Turbocharger hose failure on Highway 10",
      status: "Closed",
      assignedAnalyst: "Marcus Vance (Carrier Ops)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Highway 10 Exit 44",
      detectionTime: "2026-03-15T09:10:00Z",
      predictedETA: "2026-03-15T15:30:00Z",
      slaRisk: "High",
      estimatedBusinessImpact: "$12,000 late arrival penalty",
      timeline: [
        { timestamp: "2026-03-15T09:10:00Z", actor: "Driver", action: "Breakdown Reported", note: "Loss of engine power on grade." },
        { timestamp: "2026-03-15T09:40:00Z", actor: "Marcus Vance", action: "Alternate Carrier / Tractor Swap", note: "Dispatched standby tractor FR-23 for trailer transload." },
        { timestamp: "2026-03-15T11:20:00Z", actor: "Marcus Vance", action: "Transit Resumed", note: "Transload completed in 35 minutes." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Turbocharger hose failure on Highway 10",
        recoveryStrategy: "Alternate Carrier",
        summary: "Dispatched standby tractor unit FR-23; transloaded trailer in 35 minutes; original unit towed for maintenance.",
        deliveryOutcome: "Delivered",
        slaOutcome: "Preserved",
        finalEta: "2026-03-15T15:30:00Z",
        closedBy: "Marcus Vance (Carrier Ops)",
        closedAt: "2026-03-15T12:00:00Z"
      },
      createdAt: "2026-03-15T09:10:00Z",
      resolvedAt: "2026-03-15T11:20:00Z",
      finalOutcome: "Delivery resumed with only 45-minute total deviation; SLA target achieved."
    },
    {
      id: "EXC-1043",
      shipmentId: "BRG-2832",
      carrierId: "CAR-02",
      type: "Customs Hold",
      severity: "Medium",
      rootCause: "Harmonized Tariff Schedule code discrepancy on export manifest",
      status: "Closed",
      assignedAnalyst: "Clara Hughes (Customer Service)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Capital Knot Customs Terminal",
      detectionTime: "2026-03-12T16:00:00Z",
      predictedETA: "2026-03-13T16:00:00Z",
      slaRisk: "Medium",
      estimatedBusinessImpact: "$5,500 terminal storage and broker fees",
      timeline: [
        { timestamp: "2026-03-12T16:00:00Z", actor: "Customs Broker", action: "Hold Placed", note: "HTS code tariff mismatch." },
        { timestamp: "2026-03-13T09:00:00Z", actor: "Clara Hughes", action: "Document Rectification", note: "Expedited digital re-certification via EDI 315." },
        { timestamp: "2026-03-13T10:15:00Z", actor: "Customs Broker", action: "Hold Released", note: "Full clearance granted." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Harmonized Tariff Schedule code discrepancy on export manifest",
        recoveryStrategy: "Operational Intervention",
        summary: "Expedited digital re-certification via EDI 315; submitted revised broker clearance documents.",
        deliveryOutcome: "Delivered",
        slaOutcome: "Preserved",
        finalEta: "2026-03-13T16:00:00Z",
        closedBy: "Clara Hughes (Customer Service)",
        closedAt: "2026-03-13T11:00:00Z"
      },
      createdAt: "2026-03-12T16:00:00Z",
      resolvedAt: "2026-03-13T10:15:00Z",
      finalOutcome: "Customs released container with zero penalty fees; departed on following scheduled feeder."
    },
    {
      id: "EXC-1042",
      shipmentId: "BRG-2830",
      carrierId: "CAR-04",
      type: "Excessive Dwell Time",
      severity: "Low",
      rootCause: "Terminal yard crane mechanical outage causing 5-hour loading delay",
      status: "Closed",
      assignedAnalyst: "Sarah Lin (Control Tower)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Lake Knot Terminal Yard",
      detectionTime: "2026-03-10T11:45:00Z",
      predictedETA: "2026-03-11T12:00:00Z",
      slaRisk: "Low",
      estimatedBusinessImpact: "$1,800 yard staging surcharge",
      timeline: [
        { timestamp: "2026-03-10T11:45:00Z", actor: "Terminal System", action: "Dwell Alert", note: "Yard crane 2 offline." },
        { timestamp: "2026-03-10T13:00:00Z", actor: "Sarah Lin", action: "Repositioning", note: "Repositioned container to Berth 4 automated gantry." },
        { timestamp: "2026-03-10T17:30:00Z", actor: "Terminal System", action: "Loaded", note: "Vessel departed within acceptable tide window." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Terminal yard crane mechanical outage causing 5-hour loading delay",
        recoveryStrategy: "Re-route",
        summary: "Repositioned container to Berth 4 automated gantry queue; priority loading authorized.",
        deliveryOutcome: "Delivered",
        slaOutcome: "Preserved",
        finalEta: "2026-03-11T12:00:00Z",
        closedBy: "Sarah Lin (Control Tower)",
        closedAt: "2026-03-10T18:00:00Z"
      },
      createdAt: "2026-03-10T11:45:00Z",
      resolvedAt: "2026-03-10T17:30:00Z",
      finalOutcome: "Vessel departed within acceptable tide window; arrival ETA unaffected."
    },
    {
      id: "EXC-1041",
      shipmentId: "BRG-2828",
      carrierId: "CAR-05",
      type: "Missed Pickup",
      severity: "High",
      rootCause: "Shipper loading dock power surge and automated conveyor trip",
      status: "Closed",
      assignedAnalyst: "Elena Rostova (Lead Analyst)",
      autoResolved: false,
      autoActionTaken: null,
      location: "Capital Knot West Industrial Park",
      detectionTime: "2026-03-08T08:30:00Z",
      predictedETA: "2026-03-08T19:00:00Z",
      slaRisk: "High",
      estimatedBusinessImpact: "$9,500 emergency air charter surcharge",
      timeline: [
        { timestamp: "2026-03-08T08:30:00Z", actor: "Shipper Portal", action: "Pickup Failed", note: "Dock conveyor power loss." },
        { timestamp: "2026-03-08T09:15:00Z", actor: "Elena Rostova", action: "Expedite Dispatch", note: "Scheduled priority afternoon pickup window with dedicated sprinter team." },
        { timestamp: "2026-03-08T13:00:00Z", actor: "SkyLink Ops", action: "Loaded Flight SK-401", note: "Pallets loaded onto flight SK-401; same-day delivery fulfilled." }
      ],
      coordinationNotes: [],
      recoveryRequestId: null,
      finalResolution: {
        rootCause: "Shipper loading dock power surge and automated conveyor trip",
        recoveryStrategy: "Expedite",
        summary: "Scheduled priority afternoon pickup window with dedicated air-cargo sprinter team.",
        deliveryOutcome: "Delivered",
        slaOutcome: "Preserved",
        finalEta: "2026-03-08T19:00:00Z",
        closedBy: "Elena Rostova (Lead Analyst)",
        closedAt: "2026-03-08T14:00:00Z"
      },
      createdAt: "2026-03-08T08:30:00Z",
      resolvedAt: "2026-03-08T13:00:00Z",
      finalOutcome: "Pallets loaded onto flight SK-401; same-day delivery fulfilled."
    }
  ],

  // Phase 2: Shipment Events Log (US-19 to US-22)
  shipmentEvents: [
    {
      id: "EVT-9001",
      shipmentId: "BRG-2846",
      eventType: "ETA changed",
      timestamp: "2026-03-24T07:15:00Z",
      reportedLocation: "Lake Knot Port Berth Gate 3",
      sourceSystem: "TMS",
      processingStatus: "Exception Created",
      relatedExceptionId: "EXC-1048",
      details: "Berth congestion and tide delay increased ETA by +2h 45m"
    },
    {
      id: "EVT-9002",
      shipmentId: "BRG-2843",
      eventType: "Temperature out of range",
      timestamp: "2026-03-24T08:00:00Z",
      reportedLocation: "Mountain Pass 7 Cryo Corridor",
      sourceSystem: "IoT Sensor",
      processingStatus: "Exception Created",
      relatedExceptionId: "EXC-1047",
      details: "Reefer chamber internal probe registered +4.8°C spike above safe storage envelope"
    },
    {
      id: "EVT-9003",
      shipmentId: "BRG-2847",
      eventType: "Excessive dwell time",
      timestamp: "2026-03-24T09:30:00Z",
      reportedLocation: "Highway Route 4 MP 112",
      sourceSystem: "GPS/Telematics",
      processingStatus: "Exception Created",
      relatedExceptionId: "EXC-1049",
      details: "Vehicle stationary for > 25 minutes due to Highway Patrol rockslide barrier"
    },
    {
      id: "EVT-9004",
      shipmentId: "BRG-2848",
      eventType: "Shipment departed",
      timestamp: "2026-03-24T13:45:00Z",
      reportedLocation: "West Of Capital Knot Airfield",
      sourceSystem: "Carrier Tracking",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: "Air unit AT-77 cleared gate security and entered ramp loading zone"
    },
    {
      id: "EVT-9005",
      shipmentId: "BRG-2845",
      eventType: "Shipment arrived at checkpoint",
      timestamp: "2026-03-24T13:30:00Z",
      reportedLocation: "South Valley Highway MP 45",
      sourceSystem: "GPS/Telematics",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: "Passed telemetry milestone on schedule. Speed 68 km/h"
    },
    {
      id: "EVT-9006",
      shipmentId: "BRG-2844",
      eventType: "Delivery completed",
      timestamp: "2026-03-23T14:15:00Z",
      reportedLocation: "Capital Knot Hub Dock 2",
      sourceSystem: "TMS",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: "Receiver signed digital bill of lading with zero freight exceptions"
    }
  ],

  // Phase 2: Recovery Requests (US-27, US-33 to US-40)
  recoveryRequests: [
    {
      id: "REC-2001",
      exceptionId: "EXC-1049",
      shipmentId: "BRG-2847",
      recoveryStrategy: "Re-route",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Highway Route 4 blocked by rockfall; planned arterial impassable for 4+ hours",
      operationalNotes: "Driver Ethan Cole confirmed clear passage via South Valley Connector 3. Weight verified within bridge limits.",
      expectedEtaImpact: "-45m recovery versus static waiting",
      proposedRoute: "Valley Arterial 3 Bypass around rockslide sector to Lake Knot Hub",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "Accepted",
      assignedVehicleId: "FR-23",
      assignedDriverName: "Ethan Cole",
      revisedEta: "2026-03-24T13:45:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T09:45:00Z", actor: "Sarah Lin (Analyst)", action: "Recovery Request Initiated", note: "Proposed Re-route via Valley Arterial 3." },
        { timestamp: "2026-03-24T10:15:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Request Accepted", note: "Approved bypass route. Driver Ethan Cole authorized." }
      ],
      createdAt: "2026-03-24T09:45:00Z",
      updatedAt: "2026-03-24T10:15:00Z"
    },
    {
      id: "REC-2002",
      exceptionId: "EXC-1047",
      shipmentId: "BRG-2843",
      recoveryStrategy: "Alternate Carrier",
      requestedCarrierId: "CAR-05",
      requestedCarrierName: "SkyLink Aviation Cargo",
      reasonForRecovery: "Ground unit CC-81 compressor inverter failure; urgent air transfer needed to salvage vaccine lot",
      operationalNotes: "Requesting SkyLink priority charter flight SK-402 from Mountain Knot Airstrip to Lake Knot Medical.",
      expectedEtaImpact: "-3h 20m expedited transit",
      proposedRoute: null,
      splitDetails: null,
      expediteUrgency: "Emergency (Critical Cold Chain)",
      responseStatus: "Pending Carrier Response",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T14:30:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T10:00:00Z", actor: "Sarah Lin (Analyst)", action: "Recovery Request Initiated", note: "Requested SkyLink Aviation Cargo emergency air transfer." }
      ],
      createdAt: "2026-03-24T10:00:00Z",
      updatedAt: "2026-03-24T10:00:00Z"
    },
    {
      id: "REC-2003",
      exceptionId: "EXC-1046",
      shipmentId: "BRG-2846",
      recoveryStrategy: "Expedite",
      requestedCarrierId: "CAR-04",
      requestedCarrierName: "Pacific Marine Cargo Line",
      reasonForRecovery: "Customs declaration document revision delay at Port of Lake Knot Berth 3",
      operationalNotes: "Requested priority berth discharge slot and immediate customs clearance inspection.",
      expectedEtaImpact: "-1h 45m port turnaround",
      proposedRoute: null,
      splitDetails: null,
      expediteUrgency: "High (Port Clearance Priority)",
      responseStatus: "Rejected",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T20:15:00Z",
      rejectionReason: "No expedited vessel departure slots available before 22:00 UTC; container capacity booked.",
      timeline: [
        { timestamp: "2026-03-24T08:30:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Submitted expedite request to Pacific Marine." },
        { timestamp: "2026-03-24T09:15:00Z", actor: "Carrier Dispatch (CAR-04)", action: "Recovery Rejected", note: "Rejected: No expedited vessel departure slots available before 22:00 UTC; container capacity booked." }
      ],
      createdAt: "2026-03-24T08:30:00Z",
      updatedAt: "2026-03-24T09:15:00Z"
    },
    {
      id: "REC-2004",
      exceptionId: "EXC-1044",
      shipmentId: "BRG-2844",
      recoveryStrategy: "Re-route",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Expressway lane construction closure at South Knot Highway",
      operationalNotes: "Diverted truck FR-33 to Highway 9 Bypass around construction corridor.",
      expectedEtaImpact: "-30m recovery",
      proposedRoute: "Highway 9 Outer Beltway to Capital Knot Hub",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "Completed",
      assignedVehicleId: "FR-33",
      assignedDriverName: "Ana Brooks",
      revisedEta: "2026-03-24T17:45:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T07:15:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Approved bypass route." },
        { timestamp: "2026-03-24T07:30:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Recovery Accepted", note: "Assigned vehicle FR-33, driver Ana Brooks." },
        { timestamp: "2026-03-24T08:00:00Z", actor: "Dispatcher / Transport Planner", action: "Dispatch Confirmation", note: "Vehicle en route." },
        { timestamp: "2026-03-24T17:45:00Z", actor: "Control Tower", action: "Recovery Completed", note: "Delivery completed on schedule." }
      ],
      createdAt: "2026-03-24T07:15:00Z",
      updatedAt: "2026-03-24T17:45:00Z"
    },
    {
      id: "REC-2005",
      exceptionId: "EXC-1045",
      shipmentId: "BRG-2848",
      recoveryStrategy: "Expedite",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Critical manufacturing line part delay; assembly plant shutdown in 5 hours",
      operationalNotes: "Expedite shipment via dedicated express vehicle directly from Capital Knot Hub to Lake Knot Plant.",
      expectedEtaImpact: "-2h 30m turnaround",
      proposedRoute: "Direct Inter-city Arterial Express Route A-1",
      splitDetails: null,
      expediteUrgency: "Critical (Plant Line Shutdown)",
      responseStatus: "Pending Carrier Response",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T15:30:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T11:00:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Urgent expedite request sent to Bridges Global Logistics." }
      ],
      createdAt: "2026-03-24T11:00:00Z",
      updatedAt: "2026-03-24T11:00:00Z"
    },
    {
      id: "REC-2006",
      exceptionId: "EXC-1042",
      shipmentId: "BRG-2842",
      recoveryStrategy: "Re-route",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Severe flash flood warning on West Alpine Corridor; bridge closed to heavy freight",
      operationalNotes: "Dispatcher proposes detour via Southern Foothill Parkway Bypass.",
      expectedEtaImpact: "+45m detour, ensures 100% safe transit",
      proposedRoute: "Southern Foothill Parkway Detour via South Knot Connector",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "Pending Carrier Response",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T18:00:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T11:15:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Proposed re-route due to Alpine flood warning." }
      ],
      createdAt: "2026-03-24T11:15:00Z",
      updatedAt: "2026-03-24T11:15:00Z"
    },
    {
      id: "REC-2007",
      exceptionId: "EXC-1048",
      shipmentId: "BRG-2845",
      recoveryStrategy: "Split Shipment",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Total shipment weight exceeds single bridge clearance (32T); split required into two portions",
      operationalNotes: "Portion 1 (18T Critical Core Parts) to Capital Knot Facility A; Portion 2 (14T Secondary Fixtures) to Facility B.",
      expectedEtaImpact: "Portion 1: -1h, Portion 2: on standard schedule",
      proposedRoute: "Direct dual-corridor haulage",
      splitDetails: {
        portion1: { id: "BRG-2845-P1", cargo: "Core Powertrain Assemblies", weight: "18.0T", destination: "Lake Knot Facility A", assignedVehicleId: null, assignedDriverId: null, status: "Awaiting Assignment", deliveryStatus: "Pending" },
        portion2: { id: "BRG-2845-P2", cargo: "Secondary Mounting Brackets", weight: "14.0T", destination: "Lake Knot Facility B", assignedVehicleId: null, assignedDriverId: null, status: "Awaiting Assignment", deliveryStatus: "Pending" }
      },
      expediteUrgency: null,
      responseStatus: "Pending Carrier Response",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T16:00:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T10:30:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Split request created for 32T overweight shipment." }
      ],
      createdAt: "2026-03-24T10:30:00Z",
      updatedAt: "2026-03-24T10:30:00Z"
    },
    {
      id: "REC-2008",
      exceptionId: "EXC-1041",
      shipmentId: "BRG-2841",
      recoveryStrategy: "Alternate Carrier",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Primary carrier vehicle electrical harness failure; alternate carrier assigned",
      operationalNotes: "Carrier accepted recovery. Awaiting vehicle and driver assignment.",
      expectedEtaImpact: "-1h 15m recovery",
      proposedRoute: "Standard Interstate Corridor",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "Accepted",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: "2026-03-24T15:00:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T09:00:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Assigned alternate carrier." },
        { timestamp: "2026-03-24T09:30:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Recovery Accepted", note: "Accepted recovery. Preparing vehicle and driver assignment." }
      ],
      createdAt: "2026-03-24T09:00:00Z",
      updatedAt: "2026-03-24T09:30:00Z"
    },
    {
      id: "REC-2009",
      exceptionId: "EXC-1049",
      shipmentId: "BRG-2847",
      recoveryStrategy: "Re-route",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Highway Route 4 rockfall detour",
      operationalNotes: "Vehicle BG-12 & Driver Norman Reedus assigned. Expected pickup 13:00, delivery 17:00.",
      expectedEtaImpact: "-45m recovery",
      proposedRoute: "Valley Arterial 3 Bypass",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "Accepted",
      assignedVehicleId: "BG-12",
      assignedDriverId: "DRV-04",
      assignedDriverName: "Norman Reedus",
      expectedPickupTime: "2026-03-24T13:00:00Z",
      expectedDeliveryTime: "2026-03-24T17:00:00Z",
      revisedEta: "2026-03-24T17:00:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T09:45:00Z", actor: "Sarah Lin (Analyst)", action: "Recovery Request Initiated", note: "Re-route proposed." },
        { timestamp: "2026-03-24T10:15:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Recovery Accepted", note: "Accepted recovery." },
        { timestamp: "2026-03-24T10:30:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Resources Assigned", note: "Assigned Vehicle BG-12 and Driver Norman Reedus. Ready for Dispatch." }
      ],
      createdAt: "2026-03-24T09:45:00Z",
      updatedAt: "2026-03-24T10:30:00Z"
    },
    {
      id: "REC-2010",
      exceptionId: "EXC-1044",
      shipmentId: "BRG-2844",
      recoveryStrategy: "Re-route",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "Expressway construction detour",
      operationalNotes: "Dispatched and currently in transit along bypass.",
      expectedEtaImpact: "-30m recovery",
      proposedRoute: "Highway 9 Outer Beltway",
      splitDetails: null,
      expediteUrgency: null,
      responseStatus: "In Progress",
      assignedVehicleId: "FR-23",
      assignedDriverId: "DRV-01",
      assignedDriverName: "Ethan Cole",
      expectedPickupTime: "2026-03-24T10:00:00Z",
      expectedDeliveryTime: "2026-03-24T16:30:00Z",
      dispatchedAt: "2026-03-24T11:00:00Z",
      revisedEta: "2026-03-24T16:30:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T07:15:00Z", actor: "Elena Rostova (Dispatcher)", action: "Recovery Request Initiated", note: "Approved bypass route." },
        { timestamp: "2026-03-24T07:30:00Z", actor: "Carrier Dispatch (CAR-01)", action: "Recovery Accepted", note: "Assigned vehicle FR-23, driver Ethan Cole." },
        { timestamp: "2026-03-24T11:00:00Z", actor: "Carrier Operations (CAR-01)", action: "Dispatch Confirmed", note: "Vehicle dispatched on recovery route." }
      ],
      createdAt: "2026-03-24T07:15:00Z",
      updatedAt: "2026-03-24T11:00:00Z"
    },
    {
      id: "REC-2011",
      exceptionId: "EXC-1042",
      shipmentId: "BRG-2842",
      recoveryStrategy: "Expedite",
      requestedCarrierId: "CAR-01",
      requestedCarrierName: "Bridges Global Logistics",
      reasonForRecovery: "High priority temperature-sensitive delivery completed to destination bay",
      operationalNotes: "Arrived at destination receiving dock. Awaiting recipient sign-off.",
      expectedEtaImpact: "On Schedule",
      proposedRoute: "Direct Arterial",
      splitDetails: null,
      expediteUrgency: "High",
      responseStatus: "In Progress",
      assignedVehicleId: "BG-55",
      assignedDriverId: "DRV-05",
      assignedDriverName: "Ana Brooks",
      expectedPickupTime: "2026-03-24T08:00:00Z",
      expectedDeliveryTime: "2026-03-24T13:00:00Z",
      dispatchedAt: "2026-03-24T08:30:00Z",
      revisedEta: "2026-03-24T13:00:00Z",
      rejectionReason: null,
      timeline: [
        { timestamp: "2026-03-24T08:00:00Z", actor: "Dispatcher", action: "Recovery Initiated", note: "Expedite shipment." },
        { timestamp: "2026-03-24T08:15:00Z", actor: "Carrier Dispatch", action: "Assigned & Dispatched", note: "Vehicle BG-55 dispatched with driver Ana Brooks." },
        { timestamp: "2026-03-24T12:45:00Z", actor: "Driver Ana Brooks", action: "Arrived at Destination", note: "Vehicle docked at Receiving Bay 4. Awaiting POD sign-off." }
      ],
      createdAt: "2026-03-24T08:00:00Z",
      updatedAt: "2026-03-24T12:45:00Z"
    }
  ],

  // Phase 3 & 6: Operational Escalations (US-56 & Customer Service)
  escalations: [
    {
      id: "ESC-4001",
      exceptionId: "EXC-1043",
      shipmentId: "BRG-2843",
      category: "Delivery Commitment at Risk",
      escalationReason: "Critical SLA Risk — Cryo Refrigeration Telemetry Failure",
      reason: "Critical SLA Risk — Cryo Refrigeration Telemetry Failure",
      businessImpact: "SLA Breach Penalty: $8,400. High-value temperature sensitive biologics at critical risk of thermal spoilage.",
      customerImpact: "SLA Breach Penalty: $8,400. Biopharma lot at critical risk of thermal degradation.",
      currentRecoveryStatus: "Carrier Rejected",
      actionsAttempted: "Requested alternate cold chain transport from Nordic Cold Chain Express. Request rejected due to zero reefer chassis availability at Mountain Pass sector.",
      requestedIntervention: "Authorize emergency budget for chartered air freight or dedicated specialized reefer contractor dispatch.",
      requestedAction: "Authorize emergency budget for chartered air freight or dedicated specialized reefer contractor dispatch.",
      priority: "Critical",
      assignedRole: "Dispatcher / Transport Planner",
      assignedUser: "Elena Rostova",
      status: "Escalated to Management",
      latestResponse: "Under executive review with Regional Carrier Governance for chartered air dispatch.",
      deadline: "2026-03-24T15:00:00Z",
      escalatedBy: "Elena Rostova (Dispatcher)",
      createdBy: "Elena Rostova (Dispatcher)",
      createdAt: "2026-03-24T12:30:00Z",
      updatedAt: "2026-03-24T14:00:00Z",
      timeline: [
        { timestamp: "2026-03-24T12:30:00Z", author: "Elena Rostova (Dispatcher)", note: "Escalation initiated following carrier rejection on cold-chain recovery request." },
        { timestamp: "2026-03-24T13:15:00Z", author: "Operations Director", note: "Under executive review with Regional Carrier Governance." }
      ]
    },
    {
      id: "ESC-4002",
      exceptionId: "EXC-1046",
      shipmentId: "BRG-2846",
      category: "Delivery Commitment at Risk",
      escalationReason: "Customs & Port Berth Hold — Hazardous Chemical Seal Variance",
      reason: "Customs & Port Berth Hold — Hazardous Chemical Seal Variance",
      businessImpact: "Demurrage penalty accumulating at $450/hr. Tier 1 Automotive Assembly line shutdown threatened.",
      customerImpact: "Demurrage penalty accumulating at $450/hr. Assembly line shutdown threatened.",
      currentRecoveryStatus: "Rejected",
      actionsAttempted: "Submitted expedite request REC-2003 to Pacific Marine; rejected due to zero vessel slots.",
      requestedIntervention: "Expedited customs broker intervention and Port Authority liaison escalation.",
      requestedAction: "Expedited customs broker intervention and Port Authority liaison escalation.",
      priority: "High",
      assignedRole: "Dispatcher / Transport Planner",
      assignedUser: "Elena Rostova",
      status: "Under Review",
      latestResponse: "Port Authority clearance variance escalated to senior customs broker.",
      deadline: "2026-03-24T14:00:00Z",
      escalatedBy: "Elena Rostova (Dispatcher)",
      createdBy: "Elena Rostova (Dispatcher)",
      createdAt: "2026-03-24T10:15:00Z",
      updatedAt: "2026-03-24T11:00:00Z",
      timeline: [
        { timestamp: "2026-03-24T10:15:00Z", author: "Elena Rostova (Dispatcher)", note: "Port Authority clearance variance escalated." }
      ]
    },
    {
      id: "ESC-4003",
      exceptionId: "EXC-1048",
      shipmentId: "BRG-2846",
      category: "ETA Confirmation Required",
      escalationReason: "Consignee requires confirmed discharge window before 15:00 shift change",
      reason: "Consignee urgent query: Global Maritime requires confirmed discharge window before shift turnover at 15:00.",
      businessImpact: "Port demurrage penalty accumulating; receiving crew availability at risk.",
      customerImpact: "Customer warehouse staffing shift change at 15:00; overtime fees apply if arrival slips without notice.",
      currentRecoveryStatus: "In Progress",
      actionsAttempted: "Contacted Port Terminal coordinator; awaiting berth clearance confirmation.",
      requestedIntervention: "Confirm whether proposed ETA 16:15 will be approved by operations or if priority berth discharge is scheduled.",
      requestedAction: "Confirm whether proposed ETA 16:15 will be approved by operations or if priority berth discharge is scheduled.",
      priority: "High",
      assignedRole: "Control Tower Analyst",
      assignedUser: "Sarah Lin",
      status: "Under Review",
      latestResponse: "Analyst reviewing vessel berth schedule with port drayage dispatch.",
      deadline: "2026-03-24T13:30:00Z",
      escalatedBy: "Clara Hughes (Customer Service)",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:00:00Z",
      updatedAt: "2026-03-24T11:30:00Z",
      timeline: [
        { timestamp: "2026-03-24T11:00:00Z", author: "Clara Hughes (Customer Service)", note: "Escalation raised: Customer requested ETA confirmation before 13:30." },
        { timestamp: "2026-03-24T11:30:00Z", author: "Sarah Lin (Analyst)", note: "Reviewing berth approach with Pacific Marine operations." }
      ]
    },
    {
      id: "ESC-4004",
      exceptionId: "EXC-1049",
      shipmentId: "BRG-2847",
      category: "Delivery Commitment at Risk",
      escalationReason: "Highway 4 detour delay impacting delivery commitment. Customer requests updated driver ETA check.",
      reason: "Highway 4 detour delay impacting delivery commitment. Customer requests updated driver ETA check.",
      businessImpact: "Production downtime risk at Lake Knot plant if components arrive later than 14:00.",
      customerImpact: "Production assembly team awaiting sensors. Plant line downtime risk if delayed past 14:00.",
      currentRecoveryStatus: "Recovery in Progress",
      actionsAttempted: "Verified telematics speed on Valley 3 bypass.",
      requestedIntervention: "Confirm driver Ethan Cole progress through detour corridor.",
      requestedAction: "Confirm driver Ethan Cole progress through detour corridor.",
      priority: "High",
      assignedRole: "Dispatcher / Transport Planner",
      assignedUser: "Elena Rostova",
      status: "In Progress",
      latestResponse: "Dispatcher contacted carrier dispatch: vehicle FR-23 currently 38km from destination.",
      deadline: "2026-03-24T12:30:00Z",
      escalatedBy: "Clara Hughes (Customer Service)",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:15:00Z",
      updatedAt: "2026-03-24T11:45:00Z",
      timeline: [
        { timestamp: "2026-03-24T11:15:00Z", author: "Clara Hughes (Customer Service)", note: "Escalation raised: Customer requested driver progress confirmation." },
        { timestamp: "2026-03-24T11:45:00Z", author: "Elena Rostova (Dispatcher)", note: "Checked GPS telemetry. Vehicle FR-23 is moving smoothly on Valley 3 bypass." }
      ]
    }
  ],

  // Phase 4: Carrier Disruptions (US-72, US-73)
  disruptions: [
    {
      id: "DIS-1001",
      carrierId: "CAR-01",
      shipmentId: "BRG-2848",
      recoveryRequestId: "REC-2005",
      disruptionType: "Vehicle Breakdown",
      occurrenceTime: "2026-03-24T10:45:00Z",
      location: "Highway Route 4, Mile Marker 42",
      description: "Auxiliary coolant hose failure caused engine overheating alert. Vehicle safely pulled onto hard shoulder.",
      operationalImpact: "+1h 30m estimated delay while roadside service team replaces hose.",
      revisedEta: "2026-03-24T16:45:00Z",
      immediateAction: "Mobile technical rescue truck dispatched from Capital Knot Hub Depot.",
      reportedBy: "Marcus Vance (Carrier Operations)",
      status: "Under Review",
      createdAt: "2026-03-24T10:50:00Z",
      updatedAt: "2026-03-24T10:50:00Z"
    },
    {
      id: "DIS-1002",
      carrierId: "CAR-01",
      shipmentId: "BRG-2844",
      recoveryRequestId: "REC-2010",
      disruptionType: "Route Disruption",
      occurrenceTime: "2026-03-24T11:20:00Z",
      location: "Highway 9 Outer Beltway Crossing",
      description: "Local utility emergency gas main inspection closed right lane. Traffic backed up 2.4 km.",
      operationalImpact: "+25m dwell in slow transit zone.",
      revisedEta: "2026-03-24T16:55:00Z",
      immediateAction: "Driver advised to proceed through single lane bypass slowly; dispatch notified.",
      reportedBy: "Ethan Cole (Driver / Carrier CAR-01)",
      status: "Resolved",
      createdAt: "2026-03-24T11:25:00Z",
      updatedAt: "2026-03-24T11:45:00Z"
    }
  ],

  // Phase 4: Carrier In-App Notifications (US-19, US-60)
  notifications: [
    {
      id: "NOTIF-301",
      carrierId: "CAR-01",
      type: "New Recovery Request",
      title: "New Expedite Request REC-2005",
      message: "Dispatcher Elena Rostova submitted an Expedite recovery request for shipment BRG-2848.",
      targetView: "carrier_requests",
      targetId: "REC-2005",
      read: false,
      timestamp: "2026-03-24T11:00:00Z"
    },
    {
      id: "NOTIF-302",
      carrierId: "CAR-01",
      type: "Re-route Proposal",
      title: "Re-route Proposal for BRG-2842",
      message: "Detour proposed via Southern Foothill Parkway due to Alpine flash flooding.",
      targetView: "carrier_requests",
      targetId: "REC-2006",
      read: false,
      timestamp: "2026-03-24T11:15:00Z"
    },
    {
      id: "NOTIF-303",
      carrierId: "CAR-01",
      type: "Split Request",
      title: "Split Shipment Allocation BRG-2845",
      message: "Overweight bridge restriction requires splitting shipment into 2 portions.",
      targetView: "carrier_requests",
      targetId: "REC-2007",
      read: false,
      timestamp: "2026-03-24T10:30:00Z"
    },
    {
      id: "NOTIF-304",
      carrierId: "CAR-01",
      type: "Dispatch Ready",
      title: "Assignment Complete for BRG-2847",
      message: "Vehicle BG-12 & Driver Norman Reedus assigned. Ready for Dispatch Confirmation.",
      targetView: "carrier_execution",
      targetId: "REC-2009",
      read: true,
      timestamp: "2026-03-24T10:00:00Z"
    }
  ],

  auditLogs: [
    {
      id: "AUD-1014",
      timestamp: "2026-03-24T12:30:00Z",
      action: "Resource Status Updated",
      module: "Resources",
      affectedRecord: "Vehicle FR-23 (CA-2311-CK)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Updated vehicle status to Active (On Route) and assigned driver Ethan Cole."
    },
    {
      id: "AUD-1013",
      timestamp: "2026-03-24T10:15:00Z",
      action: "Exception Under Review",
      module: "System",
      affectedRecord: "EXC-1047 (Shipment BRG-2843)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Critical Cold Chain temperature escalation assigned to lead analyst."
    },
    {
      id: "AUD-1012",
      timestamp: "2026-03-23T15:20:00Z",
      action: "User Updated",
      module: "Users",
      affectedRecord: "USR-104 (Elena Rostova)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Promoted user permissions and reaffirmed role as Dispatcher / Transport Planner."
    },
    {
      id: "AUD-1011",
      timestamp: "2026-03-22T09:00:00Z",
      action: "Carrier Status Updated",
      module: "Carriers",
      affectedRecord: "CAR-04 (Pacific Marine Cargo Line)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Annual safety compliance audit completed; renewed Active status."
    },
    {
      id: "AUD-1010",
      timestamp: "2026-03-20T16:00:00Z",
      action: "Resource Maintenance Scheduled",
      module: "Resources",
      affectedRecord: "Vehicle FR-33 (OR-3301-MK)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Marked vehicle status as Maintenance for scheduled brake & axle servicing."
    },
    {
      id: "AUD-1009",
      timestamp: "2026-03-18T14:00:00Z",
      action: "User Deactivated",
      module: "Users",
      affectedRecord: "USR-108 (Jordan Bell)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Carrier Operations user account deactivated per Apex Freight quarterly roster update. Preserved historical activity."
    },
    {
      id: "AUD-1008",
      timestamp: "2026-03-15T12:00:00Z",
      action: "Carrier Registered",
      module: "Carriers",
      affectedRecord: "CAR-05 (SkyLink Aviation Cargo)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Onboarded new Air Express carrier partner for cross-regional logistics."
    },
    {
      id: "AUD-1007",
      timestamp: "2026-03-10T11:00:00Z",
      action: "Configuration Updated",
      module: "Settings",
      affectedRecord: "SLA Configuration",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Standardized SLA breach threshold to 4.0 hours and delay warning to 2.0 hours."
    },
    {
      id: "AUD-1006",
      timestamp: "2026-03-05T08:30:00Z",
      action: "User Created",
      module: "Users",
      affectedRecord: "USR-107 (Dmitri Volkov)",
      actingUser: "admin@gmail.com (Administrator)",
      details: "Created Carrier Operations User linked to Nordic Cold Chain Express (CAR-03)."
    }
  ],

  // ==========================================
  // Phase 5: Warehouse Supervisor Master Data
  // ==========================================
  warehouses: [
    {
      id: "WH-DAL-01",
      name: "Dallas Central Logistics Hub",
      code: "DAL-01",
      city: "Dallas, TX",
      address: "1400 Logistics Pkwy, Dallas, TX 75261",
      type: "Central Distribution Center & Cross-Dock",
      operatingHours: "24/7 Operations",
      capacity: "120,000 sq ft • 8 Active Docks",
      dockCount: 8,
      status: "Operational",
      manager: "Carlos Mendoza",
      hubs: ["Dallas Central Logistics Hub", "Capital Knot Hub", "Capital Knot Distribution Hub"]
    },
    {
      id: "WH-ORD-01",
      name: "Chicago O'Hare Freight Depot",
      code: "ORD-01",
      city: "Chicago, IL",
      address: "8800 Cargo Rd, Chicago, IL 60666",
      type: "Regional Freight Consolidation",
      operatingHours: "06:00 - 22:00",
      capacity: "85,000 sq ft • 6 Docks",
      dockCount: 6,
      status: "Operational",
      manager: "David O'Connor",
      hubs: ["Lake Knot Hub"]
    },
    {
      id: "WH-LAX-01",
      name: "Los Angeles Port Gateway",
      code: "LAX-01",
      city: "Los Angeles, CA",
      address: "420 Harbor Blvd, San Pedro, CA 90731",
      type: "Maritime Intermodal Gateway",
      operatingHours: "24/7 Operations",
      capacity: "150,000 sq ft • 10 Docks",
      dockCount: 10,
      status: "Operational",
      manager: "Kenji Sato",
      hubs: ["South Knot Hub"]
    }
  ],

  docks: [
    { id: "DOCK-01", warehouseId: "WH-DAL-01", code: "Bay 01", type: "Dry Van & Freight", capability: "Standard Ground Freight", status: "Available", currentShipmentId: null, currentCarrier: null, timeSlot: null, maxTonnage: 40 },
    { id: "DOCK-02", warehouseId: "WH-DAL-01", code: "Bay 02", type: "Refrigerated / Reefer", capability: "Cold Chain (-25°C to +4°C)", status: "Occupied", currentShipmentId: "BRG-2847", currentCarrier: "Bridges Global Logistics", timeSlot: "10:00 - 12:30", maxTonnage: 35 },
    { id: "DOCK-03", warehouseId: "WH-DAL-01", code: "Bay 03", type: "Heavy Freight & Flatbed", capability: "Heavy Machinery & Oversize", status: "Reserved", currentShipmentId: "BRG-2846", currentCarrier: "Pacific Marine Cargo Line", timeSlot: "13:00 - 15:30", maxTonnage: 50 },
    { id: "DOCK-04", warehouseId: "WH-DAL-01", code: "Bay 04", type: "Rapid Cross-dock", capability: "Air Cargo & Fast Transfer", status: "Available", currentShipmentId: null, currentCarrier: null, timeSlot: null, maxTonnage: 20 },
    { id: "DOCK-05", warehouseId: "WH-DAL-01", code: "Bay 05", type: "Inbound Receiving Bay", capability: "Container Discharge & Receiving", status: "Occupied", currentShipmentId: "BRG-2848", currentCarrier: "SkyLink Aviation Cargo", timeSlot: "11:00 - 13:30", maxTonnage: 45 },
    { id: "DOCK-06", warehouseId: "WH-DAL-01", code: "Bay 06", type: "Outbound Staging Bay", capability: "High-Volume Pallet Staging", status: "Available", currentShipmentId: null, currentCarrier: null, timeSlot: null, maxTonnage: 35 },
    { id: "DOCK-07", warehouseId: "WH-DAL-01", code: "Bay 07", type: "Hazardous / HazMat Bay", capability: "HazMat & Chemical Containment", status: "Maintenance", currentShipmentId: null, currentCarrier: null, timeSlot: null, maxTonnage: 30 },
    { id: "DOCK-08", warehouseId: "WH-DAL-01", code: "Bay 08", type: "Express Parcel & Van Bay", capability: "Sprinter & Courier Vans", status: "Available", currentShipmentId: null, currentCarrier: null, timeSlot: null, maxTonnage: 10 }
  ],

  dockAppointments: [
    {
      id: "APT-6001",
      dockId: "DOCK-02",
      warehouseId: "WH-DAL-01",
      shipmentId: "BRG-2847",
      direction: "Outbound",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "CA-2311-CK",
      driverName: "Ethan Cole",
      timeSlot: "10:00 - 12:30",
      date: "2026-03-24",
      appointmentStatus: "Occupied",
      readinessStatus: "Ready",
      notes: "Loading completed; awaiting final driver handover sign-off."
    },
    {
      id: "APT-6002",
      dockId: "DOCK-05",
      warehouseId: "WH-DAL-01",
      shipmentId: "BRG-2848",
      direction: "Inbound",
      carrierId: "CAR-05",
      carrierName: "SkyLink Aviation Cargo",
      vehiclePlate: "N-770BR",
      driverName: "Olivia Hayes",
      timeSlot: "11:00 - 13:30",
      date: "2026-03-24",
      appointmentStatus: "Occupied",
      readinessStatus: "In Progress",
      notes: "Medical kit delivery arrived; receiving verification underway."
    },
    {
      id: "APT-6003",
      dockId: "DOCK-03",
      warehouseId: "WH-DAL-01",
      shipmentId: "BRG-2846",
      direction: "Outbound",
      carrierId: "CAR-04",
      carrierName: "Pacific Marine Cargo Line",
      vehiclePlate: "IMO-992144",
      driverName: "Lucas Reed",
      timeSlot: "13:00 - 15:30",
      date: "2026-03-24",
      appointmentStatus: "Scheduled",
      readinessStatus: "Blocked",
      notes: "Blocked: Consignee export declaration stamp missing."
    },
    {
      id: "APT-6004",
      dockId: "DOCK-01",
      warehouseId: "WH-DAL-01",
      shipmentId: "BRG-2842",
      direction: "Outbound",
      carrierId: "CAR-02",
      carrierName: "Apex Freight Systems",
      vehiclePlate: "WA-4288-LK",
      driverName: "Ethan Cole",
      timeSlot: "14:00 - 16:00",
      date: "2026-03-24",
      appointmentStatus: "Scheduled",
      readinessStatus: "Ready",
      notes: "Agricultural machinery parts staged."
    },
    {
      id: "APT-6005",
      dockId: "DOCK-04",
      warehouseId: "WH-DAL-01",
      shipmentId: "BRG-2849",
      direction: "Inbound",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "CA-1290-BG",
      driverName: "Norman Reedus",
      timeSlot: "16:00 - 18:00",
      date: "2026-03-24",
      appointmentStatus: "Scheduled",
      readinessStatus: "Ready",
      notes: "Scheduled transfer arrival from regional hub."
    }
  ],

  warehouseReadiness: [
    {
      id: "WHR-BRG-2847",
      shipmentId: "BRG-2847",
      warehouseId: "WH-DAL-01",
      overallStatus: "Ready",
      blockedReason: null,
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "Verified against manifest ORD-98247" },
        requiredDocs: { status: "Ready", label: "Required documents available", mandatory: true, notes: "BOL & HAZMAT clearance attached" },
        cargoInventory: { status: "Ready", label: "Cargo or inventory ready", mandatory: true, notes: "230 units staged at Bay 2" },
        pickingCompleted: { status: "Ready", label: "Picking completed", mandatory: true, notes: "Pick task complete (100%)" },
        packingCompleted: { status: "Ready", label: "Packing completed", mandatory: true, notes: "Pack inspection passed, barcoded" },
        dockAvailable: { status: "Ready", label: "Suitable dock available", mandatory: true, notes: "Dock 02 assigned" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "Bridges Global Logistics - FR-23 / Ethan Cole" },
        operationalConstraints: { status: "Ready", label: "Operational constraints reviewed", mandatory: false, notes: "No routing conflicts" }
      },
      updatedAt: "2026-03-24T10:30:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "WHR-BRG-2848",
      shipmentId: "BRG-2848",
      warehouseId: "WH-DAL-01",
      overallStatus: "In Progress",
      blockedReason: null,
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "Inbound manifest ORD-98248 verified" },
        requiredDocs: { status: "Ready", label: "Required documents available", mandatory: true, notes: "Air waybill & cold storage cert validated" },
        cargoInventory: { status: "In Progress", label: "Cargo or inventory ready", mandatory: true, notes: "Carton #4 secondary QA inspection underway" },
        pickingCompleted: { status: "Not Applicable", label: "Picking completed", mandatory: true, notes: "Inbound receiving shipment" },
        packingCompleted: { status: "Not Applicable", label: "Packing completed", mandatory: true, notes: "Inbound receiving shipment" },
        dockAvailable: { status: "Ready", label: "Suitable dock available", mandatory: true, notes: "Dock 05 Receiving Bay assigned" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "SkyLink Aviation - AT-77 / Olivia Hayes" },
        operationalConstraints: { status: "Ready", label: "Operational constraints reviewed", mandatory: false, notes: "Cold chain handling protocol in effect" }
      },
      updatedAt: "2026-03-24T11:45:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "WHR-BRG-2846",
      shipmentId: "BRG-2846",
      warehouseId: "WH-DAL-01",
      overallStatus: "Blocked",
      blockedReason: "Required documents missing: export declaration certificate not certified by customs broker.",
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "Verified against ORD-98246" },
        requiredDocs: { status: "Blocked", label: "Required documents available", mandatory: true, notes: "Consignee commercial export declaration missing customs stamps" },
        cargoInventory: { status: "Ready", label: "Cargo or inventory ready", mandatory: true, notes: "180 container units staged at Dock 03" },
        pickingCompleted: { status: "Ready", label: "Picking completed", mandatory: true, notes: "180/180 units picked" },
        packingCompleted: { status: "In Progress", label: "Packing completed", mandatory: true, notes: "120/180 packed; 60 remaining" },
        dockAvailable: { status: "Ready", label: "Suitable dock available", mandatory: true, notes: "Dock 03 Reserved" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "Pacific Marine Cargo Line - ST-09 / Lucas Reed" },
        operationalConstraints: { status: "Ready", label: "Operational constraints reviewed", mandatory: false, notes: "Port berth schedule aligned" }
      },
      updatedAt: "2026-03-24T10:15:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "WHR-BRG-2842",
      shipmentId: "BRG-2842",
      warehouseId: "WH-DAL-01",
      overallStatus: "Ready",
      blockedReason: null,
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "Order ORD-98242" },
        requiredDocs: { status: "Ready", label: "Required documents available", mandatory: true, notes: "Delivery manifest complete" },
        cargoInventory: { status: "Ready", label: "Cargo or inventory ready", mandatory: true, notes: "150 units loaded" },
        pickingCompleted: { status: "Ready", label: "Picking completed", mandatory: true, notes: "Completed" },
        packingCompleted: { status: "Ready", label: "Packing completed", mandatory: true, notes: "Completed" },
        dockAvailable: { status: "Ready", label: "Suitable dock available", mandatory: true, notes: "Dock 01 Assigned" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "Apex Freight Systems - BR-42 / Ethan Cole" },
        operationalConstraints: { status: "Ready", label: "Operational constraints reviewed", mandatory: false, notes: "Clear for ground transit" }
      },
      updatedAt: "2026-03-24T12:00:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "WHR-BRG-2849",
      shipmentId: "BRG-2849",
      warehouseId: "WH-DAL-01",
      overallStatus: "In Progress",
      blockedReason: null,
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "ORD-98249 transfer order" },
        requiredDocs: { status: "Ready", label: "Required documents available", mandatory: true, notes: "Transfer manifest valid" },
        cargoInventory: { status: "In Progress", label: "Cargo or inventory ready", mandatory: true, notes: "In transit, expected 16:00" },
        pickingCompleted: { status: "Not Applicable", label: "Picking completed", mandatory: true, notes: "Inbound transfer" },
        packingCompleted: { status: "Not Applicable", label: "Packing completed", mandatory: true, notes: "Inbound transfer" },
        dockAvailable: { status: "Ready", label: "Suitable dock available", mandatory: true, notes: "Dock 04 Cross-dock scheduled" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "Bridges Global Logistics - BG-12 / Norman Reedus" },
        operationalConstraints: { status: "Ready", label: "Operational constraints reviewed", mandatory: false, notes: "Standard cross-dock sequence" }
      },
      updatedAt: "2026-03-24T09:30:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "WHR-BRG-2850",
      shipmentId: "BRG-2850",
      warehouseId: "WH-DAL-01",
      overallStatus: "Not Started",
      blockedReason: null,
      checklist: {
        shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: "ORD-98250" },
        requiredDocs: { status: "In Progress", label: "Required documents available", mandatory: true, notes: "Awaiting temperature logsheet template" },
        cargoInventory: { status: "In Progress", label: "Cargo or inventory ready", mandatory: true, notes: "Staged at Aisle 3 cold room" },
        pickingCompleted: { status: "Not Started", label: "Picking completed", mandatory: true, notes: "Pick task pending allocation" },
        packingCompleted: { status: "Not Started", label: "Packing completed", mandatory: true, notes: "Awaiting pick completion" },
        dockAvailable: { status: "Not Started", label: "Suitable dock available", mandatory: true, notes: "Dock not yet assigned" },
        carrierDetails: { status: "Ready", label: "Carrier and vehicle details available", mandatory: true, notes: "Bridges Global Logistics - BG-55 / Ana Brooks" },
        operationalConstraints: { status: "Not Started", label: "Operational constraints reviewed", mandatory: false, notes: "Refrigerated van temperature check needed" }
      },
      updatedAt: "2026-03-24T08:30:00Z",
      updatedBy: "Carlos Mendoza"
    }
  ],

  pickingPacking: [
    {
      id: "PKP-BRG-2847",
      shipmentId: "BRG-2847",
      warehouseId: "WH-DAL-01",
      pickingStatus: "Completed",
      packingStatus: "Completed",
      items: [
        { sku: "SKU-EL-901", name: "Industrial Electronics & Sensors", requiredQty: 180, pickedQty: 180, packedQty: 180, unit: "units", location: "Aisle 4, Bay B-12", condition: "Good" },
        { sku: "SKU-SN-440", name: "Fiber Optic Interface Modules", requiredQty: 50, pickedQty: 50, packedQty: 50, unit: "units", location: "Aisle 2, Bin C-04", condition: "Good" }
      ],
      totalRequired: 230,
      totalPicked: 230,
      totalPacked: 230,
      deadline: "2026-03-24T12:00:00Z",
      blockers: [],
      operationalNotes: "Items verified against QA checklist. Zero variance recorded.",
      updatedAt: "2026-03-24T10:00:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "PKP-BRG-2846",
      shipmentId: "BRG-2846",
      warehouseId: "WH-DAL-01",
      pickingStatus: "Completed",
      packingStatus: "In Progress",
      items: [
        { sku: "SKU-CT-810", name: "Containerized Port Freight Casings", requiredQty: 120, pickedQty: 120, packedQty: 120, unit: "units", location: "Aisle 7, Bay D-01", condition: "Good" },
        { sku: "SKU-CT-812", name: "Heavy Duty Locking Fasteners", requiredQty: 60, pickedQty: 60, packedQty: 0, unit: "units", location: "Aisle 7, Bay D-05", condition: "Good" }
      ],
      totalRequired: 180,
      totalPicked: 180,
      totalPacked: 120,
      deadline: "2026-03-24T13:30:00Z",
      blockers: ["Packing Incomplete (60 fasteners remaining)"],
      operationalNotes: "Packing line 2 active. 60 units undergoing anti-corrosive shrink wrapping.",
      updatedAt: "2026-03-24T10:45:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "PKP-BRG-2842",
      shipmentId: "BRG-2842",
      warehouseId: "WH-DAL-01",
      pickingStatus: "Completed",
      packingStatus: "Completed",
      items: [
        { sku: "SKU-AG-301", name: "Agricultural Machinery Rotary Gears", requiredQty: 100, pickedQty: 100, packedQty: 100, unit: "units", location: "Aisle 5, Bay E-11", condition: "Good" },
        { sku: "SKU-AG-305", name: "Hydraulic Pump Gaskets", requiredQty: 50, pickedQty: 50, packedQty: 50, unit: "units", location: "Aisle 5, Bin B-02", condition: "Good" }
      ],
      totalRequired: 150,
      totalPicked: 150,
      totalPacked: 150,
      deadline: "2026-03-24T13:00:00Z",
      blockers: [],
      operationalNotes: "Palletized on Euro-pallets with strapping.",
      updatedAt: "2026-03-24T11:15:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "PKP-BRG-2849",
      shipmentId: "BRG-2849",
      warehouseId: "WH-DAL-01",
      pickingStatus: "In Progress",
      packingStatus: "Not Started",
      items: [
        { sku: "SKU-TL-101", name: "Telemetry Signal Repeaters", requiredQty: 60, pickedQty: 45, packedQty: 0, unit: "units", location: "Aisle 3, Bin A-08", condition: "Good" },
        { sku: "SKU-TL-109", name: "Shielded Core Cables (50m)", requiredQty: 30, pickedQty: 0, packedQty: 0, unit: "units", location: "Aisle 3, Rack C-02", condition: "Good" }
      ],
      totalRequired: 90,
      totalPicked: 45,
      totalPacked: 0,
      deadline: "2026-03-24T15:30:00Z",
      blockers: [],
      operationalNotes: "Picker assigned. Batch pick underway.",
      updatedAt: "2026-03-24T10:15:00Z",
      updatedBy: "Carlos Mendoza"
    },
    {
      id: "PKP-BRG-2850",
      shipmentId: "BRG-2850",
      warehouseId: "WH-DAL-01",
      pickingStatus: "Not Started",
      packingStatus: "Not Started",
      items: [
        { sku: "SKU-BM-702", name: "Biomedical Culture Vials", requiredQty: 80, pickedQty: 0, packedQty: 0, unit: "units", location: "Cold Storage Room 2", condition: "Good" },
        { sku: "SKU-BM-710", name: "Dry Ice Cryo Overpacks", requiredQty: 40, pickedQty: 0, packedQty: 0, unit: "units", location: "Cold Storage Room 2", condition: "Good" }
      ],
      totalRequired: 120,
      totalPicked: 0,
      totalPacked: 0,
      deadline: "2026-03-24T16:00:00Z",
      blockers: [],
      operationalNotes: "Awaiting cold-pack preparation before picking from freezers.",
      updatedAt: "2026-03-24T08:30:00Z",
      updatedBy: "Carlos Mendoza"
    }
  ],

  loadingRecords: [
    {
      id: "LOD-BRG-2847",
      shipmentId: "BRG-2847",
      warehouseId: "WH-DAL-01",
      dockId: "DOCK-02",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "CA-2311-CK",
      driverName: "Ethan Cole",
      status: "Ready for Handover",
      loadingProgress: 100,
      totalLoadedUnits: 230,
      damageReported: false,
      damageDetails: null,
      prerequisitesSatisfied: true,
      dispatchReadinessValidated: true,
      startedAt: "2026-03-24T10:45:00Z",
      completedAt: "2026-03-24T11:20:00Z",
      handoverReadyAt: "2026-03-24T11:25:00Z",
      notes: "Pallet securement straps verified. Cargo seal #SL-88491 attached."
    },
    {
      id: "LOD-BRG-2846",
      shipmentId: "BRG-2846",
      warehouseId: "WH-DAL-01",
      dockId: "DOCK-03",
      carrierId: "CAR-04",
      carrierName: "Pacific Marine Cargo Line",
      vehiclePlate: "IMO-992144",
      driverName: "Lucas Reed",
      status: "Awaiting Loading",
      loadingProgress: 0,
      totalLoadedUnits: 0,
      damageReported: false,
      damageDetails: null,
      prerequisitesSatisfied: false,
      dispatchReadinessValidated: false,
      startedAt: null,
      completedAt: null,
      handoverReadyAt: null,
      notes: "Loading blocked: Packing incomplete (60 units) and export documentation missing."
    },
    {
      id: "LOD-BRG-2842",
      shipmentId: "BRG-2842",
      warehouseId: "WH-DAL-01",
      dockId: "DOCK-01",
      carrierId: "CAR-02",
      carrierName: "Apex Freight Systems",
      vehiclePlate: "WA-4288-LK",
      driverName: "Ethan Cole",
      status: "Loading Completed",
      loadingProgress: 100,
      totalLoadedUnits: 150,
      damageReported: false,
      damageDetails: null,
      prerequisitesSatisfied: true,
      dispatchReadinessValidated: true,
      startedAt: "2026-03-24T11:30:00Z",
      completedAt: "2026-03-24T12:15:00Z",
      handoverReadyAt: "2026-03-24T12:20:00Z",
      notes: "Pallets stowed and locked in place with load bars."
    },
    {
      id: "LOD-BRG-2850",
      shipmentId: "BRG-2850",
      warehouseId: "WH-DAL-01",
      dockId: null,
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "BG-55",
      driverName: "Ana Brooks",
      status: "Awaiting Loading",
      loadingProgress: 0,
      totalLoadedUnits: 0,
      damageReported: false,
      damageDetails: null,
      prerequisitesSatisfied: false,
      dispatchReadinessValidated: false,
      startedAt: null,
      completedAt: null,
      handoverReadyAt: null,
      notes: "Awaiting picking and packing completion before loading can commence."
    }
  ],

  carrierHandovers: [
    {
      id: "HND-BRG-2847",
      shipmentId: "BRG-2847",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "CA-2311-CK",
      driverName: "Ethan Cole",
      dockId: "DOCK-02",
      loadingStatus: "Loading Completed",
      plannedDeparture: "2026-03-24T11:30:00Z",
      cargoVerificationStatus: "Verified & Sealed",
      sealNumber: "SL-88491",
      handoverStatus: "Ready for Handover",
      proofReference: "BOL-DAL-98247-C",
      notes: "Manifest verified, seal intact. Ready for driver signature.",
      handoverTimestamp: null,
      handoverSignee: null,
      blockerReason: null
    },
    {
      id: "HND-BRG-2846",
      shipmentId: "BRG-2846",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-04",
      carrierName: "Pacific Marine Cargo Line",
      vehiclePlate: "IMO-992144",
      driverName: "Lucas Reed",
      dockId: "DOCK-03",
      loadingStatus: "Awaiting Loading",
      plannedDeparture: "2026-03-24T14:45:00Z",
      cargoVerificationStatus: "Pending Documentation",
      sealNumber: null,
      handoverStatus: "Handover Blocked",
      proofReference: null,
      notes: "Handover blocked: Export declaration customs stamp missing.",
      handoverTimestamp: null,
      handoverSignee: null,
      blockerReason: "Consignee commercial export declaration missing customs stamps."
    },
    {
      id: "HND-BRG-2842",
      shipmentId: "BRG-2842",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-02",
      carrierName: "Apex Freight Systems",
      vehiclePlate: "WA-4288-LK",
      driverName: "Ethan Cole",
      dockId: "DOCK-01",
      loadingStatus: "Loading Completed",
      plannedDeparture: "2026-03-24T14:00:00Z",
      cargoVerificationStatus: "Verified & Sealed",
      sealNumber: "SL-88440",
      handoverStatus: "Handover In Progress",
      proofReference: "BOL-DAL-98242-P",
      notes: "Driver on site reviewing bill of lading.",
      handoverTimestamp: null,
      handoverSignee: null,
      blockerReason: null
    },
    {
      id: "HND-BRG-2844",
      shipmentId: "BRG-2844",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "OR-3301-MK",
      driverName: "Ana Brooks",
      dockId: "DOCK-06",
      loadingStatus: "Loading Completed",
      plannedDeparture: "2026-03-22T08:00:00Z",
      cargoVerificationStatus: "Verified & Handed Over",
      sealNumber: "SL-88402",
      handoverStatus: "Handed Over",
      proofReference: "BOL-DAL-98244-SIGNED",
      notes: "Physical handover completed. Carrier departed on route.",
      handoverTimestamp: "2026-03-22T08:15:00Z",
      handoverSignee: "Ana Brooks (Driver)",
      blockerReason: null
    }
  ],

  diversionRequests: [
    {
      id: "DIV-3001",
      shipmentId: "BRG-2843",
      originalDestination: "Mountain Knot Hub",
      proposedDiversionDestination: "Dallas Central Logistics Hub (WH-DAL-01)",
      diversionReason: "Reefer compressor failure on Highway 4; urgent cold storage transload needed to preserve $650,000 vaccine lot.",
      currentCarrier: "Nordic Cold Chain Express (CAR-03)",
      carrierId: "CAR-03",
      vehicleId: "CC-81",
      driverName: "Norman Reedus",
      latestEta: "2026-03-24T16:00:00Z",
      expectedArrival: "2026-03-24T16:00:00Z",
      status: "Pending Review",
      receivingReadiness: "Standby - Cold Bay Reserved",
      assignedDock: "DOCK-02",
      receivingInstructions: "Prepare cryogenic staging bay at Dock 02; verify probe calibration before unloading.",
      rejectionReason: null,
      receivedQuantity: 0,
      expectedQuantity: 120,
      receivingNotes: "",
      createdAt: "2026-03-24T09:15:00Z",
      reviewedAt: null,
      reviewedBy: null
    },
    {
      id: "DIV-3002",
      shipmentId: "BRG-2845",
      originalDestination: "Mountain Knot Hub",
      proposedDiversionDestination: "Dallas Central Logistics Hub (WH-DAL-01)",
      diversionReason: "Mountain Pass 7 rockslide closure; rerouted to Dallas Central for cross-dock reconsolidation.",
      currentCarrier: "Bridges Global Logistics (CAR-01)",
      carrierId: "CAR-01",
      vehicleId: "FR-23",
      driverName: "Norman Reedus",
      latestEta: "2026-03-24T17:30:00Z",
      expectedArrival: "2026-03-24T17:30:00Z",
      status: "Accepted",
      receivingReadiness: "Ready - Dock 04 Pre-assigned",
      assignedDock: "DOCK-04",
      receivingInstructions: "Direct to rapid cross-dock Bay 04; transfer to outbound Chicago trailer.",
      rejectionReason: null,
      receivedQuantity: 0,
      expectedQuantity: 80,
      receivingNotes: "Cross-dock crew notified.",
      createdAt: "2026-03-24T10:00:00Z",
      reviewedAt: "2026-03-24T10:30:00Z",
      reviewedBy: "Carlos Mendoza"
    }
  ],

  warehouseBlockers: [
    {
      id: "WB-5001",
      shipmentId: "BRG-2846",
      warehouseId: "WH-DAL-01",
      blockerType: "Missing documentation",
      severity: "High",
      description: "Consignee commercial export declaration missing customs stamps. Carrier cannot accept handover without certified copy.",
      detectedTime: "2026-03-24T10:15:00Z",
      status: "Open",
      responsibleParty: "Trade Compliance / Shipper",
      requiredAction: "Re-issue stamped export declaration from Trade Compliance.",
      threatensDeliveryCommitment: true,
      linkedShipmentExceptionId: "EXC-1048",
      resolutionNotes: null,
      resolvedAt: null,
      createdBy: "Carlos Mendoza"
    },
    {
      id: "WB-5002",
      shipmentId: "BRG-2848",
      warehouseId: "WH-DAL-01",
      blockerType: "Cargo discrepancy",
      severity: "Medium",
      description: "Carton #4 damaged in transit; outer seal torn. Contents undergoing secondary QA inspection.",
      detectedTime: "2026-03-24T11:45:00Z",
      status: "Open",
      responsibleParty: "Warehouse QA / Inbound Receiving",
      requiredAction: "QA inspection and quarantine sign-off.",
      threatensDeliveryCommitment: false,
      linkedShipmentExceptionId: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdBy: "Carlos Mendoza"
    },
    {
      id: "WB-5003",
      shipmentId: "BRG-2850",
      warehouseId: "WH-DAL-01",
      blockerType: "Picking delay",
      severity: "Low",
      description: "Aisle 6 automated stacker sensor fault delayed pallet retrieval by 35 minutes.",
      detectedTime: "2026-03-24T08:30:00Z",
      status: "Resolved",
      responsibleParty: "Maintenance Engineering",
      requiredAction: "Sensor reset and line cleared.",
      threatensDeliveryCommitment: false,
      linkedShipmentExceptionId: null,
      resolutionNotes: "Stacker crane sensor recalibrated; picking resumed normally.",
      resolvedAt: "2026-03-24T09:15:00Z",
      createdBy: "Carlos Mendoza"
    }
  ],

  warehouseActivity: [
    {
      id: "WACT-8001",
      timestamp: "2026-03-24T11:25:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2847",
      action: "Loading Completed",
      previousStatus: "Loading In Progress",
      newStatus: "Ready for Handover",
      notes: "Loaded 230 units (8 pallets) at Dock 02. Seal #SL-88491 attached."
    },
    {
      id: "WACT-8002",
      timestamp: "2026-03-24T10:45:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2847",
      action: "Loading Commenced",
      previousStatus: "Awaiting Loading",
      newStatus: "Loading In Progress",
      notes: "Prerequisites satisfied: Picking and packing 100% complete. Staged at Dock 02."
    },
    {
      id: "WACT-8003",
      timestamp: "2026-03-24T10:30:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2845",
      action: "Diversion Accepted",
      previousStatus: "Pending Review",
      newStatus: "Accepted",
      notes: "Accepted diverted shipment from Mountain Pass. Pre-assigned Dock 04."
    },
    {
      id: "WACT-8004",
      timestamp: "2026-03-24T10:15:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2846",
      action: "Warehouse Blocker Reported",
      previousStatus: "In Progress",
      newStatus: "Blocked",
      notes: "Reported missing customs export stamps on commercial invoice. Handover blocked."
    },
    {
      id: "WACT-8005",
      timestamp: "2026-03-24T10:00:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2847",
      action: "Packing Confirmed",
      previousStatus: "In Progress",
      newStatus: "Completed",
      notes: "Packing completed for 230 units. Barcodes scanned and verified."
    },
    {
      id: "WACT-8006",
      timestamp: "2026-03-24T09:15:00Z",
      user: "Carlos Mendoza",
      warehouse: "Dallas Central Logistics Hub (WH-DAL-01)",
      shipmentId: "BRG-2850",
      action: "Warehouse Blocker Resolved",
      previousStatus: "Blocked",
      newStatus: "Resolved",
      notes: "Stacker crane sensor recalibrated; picking resumed."
    }
  ],

  etaChangeAlerts: [
    {
      id: "ETA-ALT-101",
      shipmentId: "BRG-2847",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-01",
      carrierName: "Bridges Global Logistics",
      vehiclePlate: "CA-2311-CK",
      vehicleType: "40ft Refrigerated Trailer (Reefer)",
      driverName: "Ethan Cole",
      driverPhone: "+1 (214) 555-0182",
      currentDockId: "DOCK-02",
      originalETA: "2026-03-24T12:30:00Z",
      revisedETA: "2026-03-24T13:45:00Z",
      delayMinutes: 75,
      reason: "Highway 4 rockslide transit detour and checkpoint inspection delay",
      proposedDockSlot: "14:00 - 15:30",
      status: "Pending Response",
      timestamp: "2026-03-24T12:15:00Z",
      supervisorResponse: null
    },
    {
      id: "ETA-ALT-102",
      shipmentId: "BRG-2848",
      warehouseId: "WH-DAL-01",
      carrierId: "CAR-05",
      carrierName: "SkyLink Aviation Cargo",
      vehiclePlate: "N-770BR",
      vehicleType: "Air Cargo Sprinter Van",
      driverName: "Olivia Hayes",
      driverPhone: "+1 (214) 555-0199",
      currentDockId: "DOCK-05",
      originalETA: "2026-03-24T11:00:00Z",
      revisedETA: "2026-03-24T11:35:00Z",
      delayMinutes: 35,
      reason: "Air cargo ramp sorting queue at DFW airside transit gate",
      proposedDockSlot: "11:45 - 13:15",
      status: "Acknowledged",
      timestamp: "2026-03-24T10:45:00Z",
      supervisorResponse: "Bay 5 staged for immediate pallet intake."
    }
  ],

  warehouseReceivingRecords: [
    {
      id: "REC-9001",
      shipmentId: "BRG-2848",
      warehouseId: "WH-DAL-01",
      dockId: "DOCK-05",
      carrierName: "SkyLink Aviation Cargo",
      vehiclePlate: "N-770BR",
      expectedQty: 150,
      receivedQty: 148,
      damagedQty: 2,
      rejectedQty: 0,
      discrepancyCount: -2,
      conditionOutcome: "Minor Packaging Damage Quarantined",
      discrepancyNotes: "Carton #4 outer box crushed during air transport. Quarantined for secondary QA review.",
      inspectionDocs: [
        { name: "SkyLink_Inbound_Tally_Report.pdf", size: "340 KB", uploadedAt: "2026-03-24T11:40:00Z" },
        { name: "Damaged_Carton_Photo_Bay5.jpg", size: "1.2 MB", uploadedAt: "2026-03-24T11:42:00Z" }
      ],
      completedAt: "2026-03-24T11:45:00Z",
      supervisorSignoff: "Carlos Mendoza",
      deliveryCompleted: true
    }
  ],

  // Phase 6: Customer Service Communications (Prototypes & History)
  communications: [
    {
      id: "COM-6001",
      shipmentId: "BRG-2847",
      customerName: "Apex Dynamics Corp",
      consigneeName: "Lake Knot Industrial Receiver",
      customerReference: "PO-88247-AD",
      orderReference: "ORD-98247",
      templateId: "delivery_delayed",
      templateName: "Delivery May Be Delayed",
      channel: "Email",
      recipient: "m.chen@apexdynamics.com",
      subject: "BRIDGES Notice: Delivery Update for Shipment BRG-2847 (PO-88247-AD)",
      message: "Dear Apex Dynamics Logistics Team,\n\nWe are actively monitoring your shipment BRG-2847 (Order ORD-98247 / Ref PO-88247-AD) from Capital Knot Hub to Lake Knot Hub. Due to regional roadway conditions and an active arterial detour, your estimated arrival has been revised. Your latest approved delivery estimate is 2026-03-24 13:45 UTC. Our transport operations team is actively coordinating this transit, and we will keep you updated as milestones are reached.\n\nSincerely,\nBRIDGES Customer Care",
      status: "Sent",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T10:00:00Z",
      sentAt: "2026-03-24T10:05:00Z",
      approvedEtaUsed: "2026-03-24T13:45:00Z",
      simulationNote: "Simulated customer communication within demo environment"
    },
    {
      id: "COM-6002",
      shipmentId: "BRG-2846",
      customerName: "Global Maritime Energy",
      consigneeName: "Lake Knot Port Receiving Dock",
      customerReference: "PO-77246-GM",
      orderReference: "ORD-98246",
      templateId: "eta_updated",
      templateName: "ETA Updated",
      channel: "Email",
      recipient: "operations@globalmaritime.org",
      subject: "BRIDGES Update: Revised ETA for Shipment BRG-2846",
      message: "Dear Global Maritime Team,\n\nPlease be advised that the latest approved ETA for shipment BRG-2846 (Order ORD-98246) is 2026-03-24 14:45 UTC. Berth queue delays at the marine terminal are currently being actively addressed by transport operations. We will provide further confirmation upon discharge.\n\nBRIDGES Customer Care",
      status: "Awaiting Review",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:15:00Z",
      sentAt: null,
      approvedEtaUsed: "2026-03-24T14:45:00Z",
      simulationNote: "Simulated customer communication within demo environment"
    },
    {
      id: "COM-6003",
      shipmentId: "BRG-2843",
      customerName: "CryoBio Research Institute",
      consigneeName: "Mountain Knot Cryo Vaults",
      customerReference: "REF-BIO-98243",
      orderReference: "ORD-98243",
      templateId: "under_resolution",
      templateName: "Shipment Under Resolution",
      channel: "SMS",
      recipient: "+1 (555) 492-3811",
      subject: null,
      message: "BRIDGES Alert: Shipment BRG-2843 (REF-BIO-98243) is currently undergoing priority cold-chain monitoring. Approved delivery estimate: 2026-03-24 18:30 UTC. Further status update in 30 mins.",
      status: "Draft",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:30:00Z",
      sentAt: null,
      approvedEtaUsed: "2026-03-24T18:30:00Z",
      simulationNote: "Simulated customer communication within demo environment"
    },
    {
      id: "COM-6004",
      shipmentId: "BRG-2844",
      customerName: "Zenith Electronics Corp",
      consigneeName: "Capital Knot Hub Dock 2",
      customerReference: "PO-44244-ZE",
      orderReference: "ORD-98244",
      templateId: "shipment_resolved",
      templateName: "Shipment Resolved",
      channel: "Email",
      recipient: "k.sato@zenith.jp",
      subject: "BRIDGES Confirmation: Shipment BRG-2844 Delivery Completed",
      message: "Dear Zenith Electronics Logistics,\n\nWe are pleased to confirm that your shipment BRG-2844 (Order ORD-98244) has been successfully delivered and signed for at Capital Knot Hub. Thank you for your partnership.\n\nBRIDGES Customer Care",
      status: "Sent",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-23T14:30:00Z",
      sentAt: "2026-03-23T14:35:00Z",
      approvedEtaUsed: "2026-03-23T14:15:00Z",
      simulationNote: "Simulated customer communication within demo environment"
    },
    {
      id: "COM-6005",
      shipmentId: "BRG-2848",
      customerName: "BioPharma Health Alliance",
      consigneeName: "Capital Knot Medical Center",
      customerReference: "CR-BIO-449",
      orderReference: "ORD-98248",
      templateId: "delivery_delayed",
      templateName: "Delivery May Be Delayed",
      channel: "SMS",
      recipient: "+1 (555) 234-8890",
      subject: null,
      message: "BRIDGES Alert: Flight ramp loading delay on BRG-2848. Latest approved delivery window: 19:30 UTC. Contact CS for live queries.",
      status: "Failed",
      failureReason: "Telecom SMS Gateway Timeout: Handset unreachable (Error 504)",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:45:00Z",
      sentAt: null,
      approvedEtaUsed: "2026-03-24T19:30:00Z",
      simulationNote: "Failed SMS transmission awaiting supervisor retry"
    },
    {
      id: "COM-6006",
      shipmentId: "BRG-2843",
      customerName: "CryoBio Research Institute",
      consigneeName: "Mountain Knot Cryo Vaults",
      customerReference: "REF-BIO-98243",
      orderReference: "ORD-98243",
      templateId: "delivery_delayed",
      templateName: "Delivery May Be Delayed",
      channel: "Email",
      recipient: "logistics@cryobio-institute.org",
      subject: "BRIDGES Delivery Notice: Precautionary Transfer for Lot #44",
      message: "Dear CryoBio Team, our monitoring detected a thermal spike on Mountain Pass 7. Vehicle swap executed. Approved ETA remains 18:30 UTC.",
      status: "Failed",
      failureReason: "SMTP Delivery Error: Remote mail exchange server temporarily down (451 4.4.1)",
      createdBy: "Clara Hughes (Customer Service)",
      createdAt: "2026-03-24T11:20:00Z",
      sentAt: null,
      approvedEtaUsed: "2026-03-24T18:30:00Z",
      simulationNote: "Failed Email transmission awaiting supervisor retry"
    }
  ],

  customerCommunicationNotes: [
    {
      id: "CNOTE-101",
      shipmentId: "BRG-2847",
      customerName: "Apex Dynamics Corp",
      contactPerson: "Marcus Chen (Logistics Director)",
      channel: "Inbound Phone Call",
      sentiment: "Inquiring / Neutral",
      note: "Customer phoned requesting confirmation on whether Valley 3 bypass causes missed evening shift. Reassured that latest approved ETA (13:45 UTC) arrives well before their 15:00 dock shift change.",
      author: "Clara Hughes (Customer Service)",
      timestamp: "2026-03-24T11:40:00Z"
    },
    {
      id: "CNOTE-102",
      shipmentId: "BRG-2848",
      customerName: "BioPharma Health Alliance",
      contactPerson: "Sarah Jenkins (VP Supply Chain)",
      channel: "Outbound Follow-up Call",
      sentiment: "Satisfied",
      note: "Proactive outreach to explain flight ramp loading delay. Customer appreciated advance notification and confirmed surgical team is scheduled for 20:00 UTC.",
      author: "Clara Hughes (Customer Service)",
      timestamp: "2026-03-24T12:15:00Z"
    },
    {
      id: "CNOTE-103",
      shipmentId: "BRG-2843",
      customerName: "CryoBio Research Institute",
      contactPerson: "Dr. Elena Rostova",
      channel: "Portal Ticket Direct",
      sentiment: "Anxious / Sensitive",
      note: "Urgent check on vaccine cold-chain stability. Provided live telemetry logger report (+4.2°C). Customer logged acknowledgment.",
      author: "Clara Hughes (Customer Service)",
      timestamp: "2026-03-24T10:15:00Z"
    }
  ],

  customerFeedback: [
    {
      id: "CFEED-201",
      shipmentId: "BRG-2844",
      customerName: "Zenith Electronics Corp",
      rating: 5,
      sentiment: "Positive",
      isComplaint: false,
      feedbackText: "Outstanding communication during delivery. Packaging arrived in pristine condition and signed on time.",
      author: "Kenji Sato",
      timestamp: "2026-03-23T15:00:00Z"
    },
    {
      id: "CFEED-202",
      shipmentId: "BRG-2847",
      customerName: "Apex Dynamics Corp",
      rating: 3,
      sentiment: "Concerned / Neutral",
      isComplaint: false,
      feedbackText: "Appreciated the proactive detour update, though we would prefer 2-hour advance notice on arterial delays.",
      author: "Marcus Chen",
      timestamp: "2026-03-24T12:30:00Z"
    }
  ],

  // Phase 7: Customer Portal Seed Queries
  customerQueries: [
    {
      id: "QRY-7001",
      customerId: "CUST-BIO-01",
      customerName: "BioPharma Health Alliance",
      shipmentId: "BRG-2843",
      category: "Delivery Delay",
      subject: "Urgent: Temperature Alert & Schedule Confirmation for Lot #44",
      description: "We noted a thermal deviation alert on our Cryo Corridor transit. Could you please confirm if product viability was maintained and whether the 18:30 approved ETA remains firm?",
      preferredMethod: "Email",
      contactEmail: "s.jenkins@biopharma.org",
      contactPhone: "+1 (555) 234-8890",
      status: "In Progress",
      createdAt: "2026-03-24T09:15:00Z",
      updatedAt: "2026-03-24T09:40:00Z",
      messages: [
        {
          id: "MSG-7001-1",
          author: "Sarah Jenkins",
          role: "Customer",
          time: "2026-03-24T09:15:00Z",
          text: "We noted a thermal deviation alert on our Cryo Corridor transit. Could you please confirm if product viability was maintained and whether the 18:30 approved ETA remains firm?"
        },
        {
          id: "MSG-7001-2",
          author: "Clara Hughes",
          role: "Customer Service",
          time: "2026-03-24T09:40:00Z",
          text: "Hello Sarah, our Control Tower cold-chain monitoring team has verified that product temperature remained within specification during the precautionary vehicle transfer. Your latest approved delivery estimate remains 18:30 today."
        }
      ]
    },
    {
      id: "QRY-7002",
      customerId: "CUST-BIO-01",
      customerName: "BioPharma Health Alliance",
      shipmentId: "BRG-2848",
      category: "ETA Clarification",
      subject: "Flight Departure Confirmation — Medical Kits (PO-88248-BP)",
      description: "Requesting confirmation that air ramp loading completed at West Of Capital Knot and flight corridor slot is secured.",
      preferredMethod: "Portal Message",
      contactEmail: "s.jenkins@biopharma.org",
      contactPhone: "+1 (555) 234-8890",
      status: "Open",
      createdAt: "2026-03-24T12:30:00Z",
      updatedAt: "2026-03-24T12:30:00Z",
      messages: [
        {
          id: "MSG-7002-1",
          author: "Sarah Jenkins",
          role: "Customer",
          time: "2026-03-24T12:30:00Z",
          text: "Requesting confirmation that air ramp loading completed at West Of Capital Knot and flight corridor slot is secured."
        }
      ]
    },
    {
      id: "QRY-7003",
      customerId: "CUST-APEX-02",
      customerName: "Apex Dynamics Corp",
      shipmentId: "BRG-2847",
      category: "Delivery Delay",
      subject: "Inquiry on Rockslide Detour Delay (ORD-98247)",
      description: "Can you provide more detail on the expected arrival time at Lake Knot following the detour?",
      preferredMethod: "Email",
      contactEmail: "m.chen@apexdynamics.com",
      contactPhone: "+1 (555) 871-2244",
      status: "Open",
      createdAt: "2026-03-24T11:00:00Z",
      updatedAt: "2026-03-24T11:00:00Z",
      messages: [
        {
          id: "MSG-7003-1",
          author: "Marcus Chen",
          role: "Customer",
          time: "2026-03-24T11:00:00Z",
          text: "Can you provide more detail on the expected arrival time at Lake Knot following the detour?"
        }
      ]
    }
  ],

  // Control Tower Analyst: Inbound Message Monitoring & Integration Error Handling
  inboundMessages: [
    {
      id: "MSG-IN-501",
      timestamp: "2026-03-24T12:45:10Z",
      source: "TMS (SAP TM)",
      protocol: "EDI 214",
      messageType: "Shipment Status Update",
      shipmentId: "BRG-2843",
      status: "Processed",
      payload: JSON.stringify({
        isa: "ISA*00*          *00*          *ZZ*SAPTM          *ZZ*BRIDGES_CT     *260324*1245*U*00401*000000501*0*P*>~",
        gs: "GS*QM*SAPTM*BRIDGES_CT*20260324*1245*501*X*004010~",
        b10: "B10*REF-BIO-98243*BRG-2843*CAR-03~",
        lx: "LX*1~",
        at7: "AT7*D1*NS***20260324*1230*LT~",
        ms1: "MS1*Mountain Pass Route 4*CO~"
      }, null, 2),
      details: "EDI 214 status update parsed successfully; milestone and GPS location synced.",
      notes: ["Auto-processed into active event stream."]
    },
    {
      id: "MSG-IN-502",
      timestamp: "2026-03-24T12:40:00Z",
      source: "IoT Reefer Sensors",
      protocol: "MQTT / Telematics",
      messageType: "Cryo Telemetry Excursion",
      shipmentId: "BRG-2847",
      status: "Processed",
      payload: JSON.stringify({
        sensorId: "SENS-CRYO-902",
        shipmentId: "BRG-2847",
        vehicleId: "FR-23",
        probeA_temp_c: 4.8,
        probeB_temp_c: 4.9,
        ambient_temp_c: 28.5,
        reeferBatteryPct: 64,
        compressorRpm: 2100,
        timestamp: "2026-03-24T12:40:00Z",
        alertStatus: "WARNING_EXCURSION"
      }, null, 2),
      details: "Reefer temperature +4.8°C excursion exceeds upper limit +4.0°C. Alert triggered.",
      notes: ["Analyst monitoring secondary dry ice reserve."]
    },
    {
      id: "MSG-IN-503",
      timestamp: "2026-03-24T12:35:15Z",
      source: "ERP (Oracle NetSuite)",
      protocol: "REST Webhook",
      messageType: "Order Manifest Ingestion",
      shipmentId: "BRG-2848",
      status: "Processed",
      payload: JSON.stringify({
        orderId: "ORD-99248",
        customer: "BioPharma Health Alliance",
        consignee: "Capital Knot Medical Center",
        skuList: [
          { sku: "MED-VACC-01", qty: 500, tempClass: "2-8C" },
          { sku: "MED-CRYO-04", qty: 200, tempClass: "Dry Ice" }
        ],
        totalGrossWeightKg: 840.5
      }, null, 2),
      details: "Order lines verified and linked to customer billing profile.",
      notes: []
    },
    {
      id: "MSG-IN-504",
      timestamp: "2026-03-24T12:30:22Z",
      source: "Carrier Gateway (Apex)",
      protocol: "EDI 204",
      messageType: "Tender Acceptance",
      shipmentId: "BRG-2845",
      status: "Error - Schema Validation",
      payload: JSON.stringify({
        error: "Missing mandatory Segment AT5 (Weight Qualification & Unit of Measure)",
        rawSegment: "B2**CAR-02**12000*PP~",
        expectedFormat: "AT5*G*L*12000*LB~",
        sourceIp: "172.56.88.12"
      }, null, 2),
      details: "Schema validation failure: Missing weight measurement unit in segment AT5.",
      notes: ["Analyst contacted Apex EDI coordinator. Reprocess pending payload correction."]
    },
    {
      id: "MSG-IN-505",
      timestamp: "2026-03-24T12:25:05Z",
      source: "Customs Automated Broker API",
      protocol: "JSON REST",
      messageType: "Customs Hold Notification",
      shipmentId: "BRG-2846",
      status: "Error - Tariff Code Invalid",
      payload: JSON.stringify({
        entryNumber: "CBP-2026-991823",
        portCode: "2704 (Los Angeles)",
        declarationId: "DEC-8819",
        flaggedTariffCode: "HTS-9018.99.00",
        rejectionReason: "Tariff specification requires 10-digit statistical subdivision for surgical electronic equipment."
      }, null, 2),
      details: "Customs declaration rejected: HTSUS code incomplete. Broker document revision requested.",
      notes: ["Broker notified to upload 10-digit statistical amendment."]
    },
    {
      id: "MSG-IN-506",
      timestamp: "2026-03-24T12:20:00Z",
      source: "GPS MQTT Broker",
      protocol: "MQTT / Telematics",
      messageType: "Vehicle Geo Ping",
      shipmentId: "BRG-2848",
      status: "Duplicate Ignored",
      payload: JSON.stringify({
        vehicleId: "N-770BR",
        lat: 32.7767,
        lng: -96.7970,
        speedMph: 0,
        engineHours: 4120,
        timestamp: "2026-03-24T12:20:00Z"
      }, null, 2),
      details: "Identical telematics coordinate received within 30 seconds. De-duplicated automatically.",
      notes: []
    },
    {
      id: "MSG-IN-507",
      timestamp: "2026-03-24T12:10:45Z",
      source: "Carrier Portal Webhook",
      protocol: "REST Webhook",
      messageType: "Driver Handover Scan",
      shipmentId: "BRG-2844",
      status: "Error - Unknown Carrier",
      payload: JSON.stringify({
        scanEvent: "DOCK_DEPARTURE",
        reportedCarrierCode: "CAR-99-UNKNOWN",
        badgeNumber: "DRV-BADGE-8841",
        timestamp: "2026-03-24T12:10:45Z"
      }, null, 2),
      details: "Reported carrier identifier 'CAR-99-UNKNOWN' does not exist in master carrier registry.",
      notes: ["Flagged for dispatcher carrier code verification."]
    }
  ],

  // Control Tower Analyst: Data Quality Management
  dataQualityIssues: [
    {
      id: "DQI-101",
      shipmentId: "BRG-2844",
      category: "Missing GPS Telemetry",
      severity: "High",
      field: "currentLocation / GPS Coords",
      currentValue: "None (Last ping > 120m ago)",
      expectedFormat: "Active Lat/Lng coordinate ping every 10 mins",
      status: "Open",
      assignedAnalyst: "Sarah Lin",
      suppressExceptionDetection: true,
      notes: "Carrier tracking transponder lost battery power. Driver requested to reboot device.",
      requestedCorrectionAt: "2026-03-24T11:45:00Z",
      correctionTarget: "Carrier Dispatch (Apex Freight)",
      createdAt: "2026-03-24T11:30:00Z"
    },
    {
      id: "DQI-102",
      shipmentId: "BRG-2846",
      category: "Incomplete Customs Classification",
      severity: "High",
      field: "customsTariffCode",
      currentValue: "HTS-9018.99",
      expectedFormat: "10-digit HTSUS (e.g. 9018.99.2000)",
      status: "Open",
      assignedAnalyst: "Sarah Lin",
      suppressExceptionDetection: false,
      notes: "Broker document missing sub-heading classification.",
      requestedCorrectionAt: "2026-03-24T12:00:00Z",
      correctionTarget: "Customs Broker (Pacific Freight Forwarders)",
      createdAt: "2026-03-24T11:50:00Z"
    },
    {
      id: "DQI-103",
      shipmentId: "BRG-2845",
      category: "Missing Receiving Contact Info",
      severity: "Medium",
      field: "customerContactPhone",
      currentValue: "Empty",
      expectedFormat: "E.164 phone format (+1 XXX XXX-XXXX)",
      status: "Open",
      assignedAnalyst: null,
      suppressExceptionDetection: false,
      notes: "Delivery site gate security requires phone number for pre-clearance.",
      requestedCorrectionAt: null,
      correctionTarget: "Customer Service / Consignee",
      createdAt: "2026-03-24T12:15:00Z"
    },
    {
      id: "DQI-104",
      shipmentId: "BRG-2842",
      category: "Conflicting ETA Telemetry",
      severity: "High",
      field: "predictedETA",
      currentValue: "Carrier: 14:30 | GPS Model: 18:00 (+3.5h variance)",
      expectedFormat: "Synchronized ETA within ±30 min tolerance",
      status: "Under Review",
      assignedAnalyst: "Sarah Lin",
      suppressExceptionDetection: false,
      notes: "Traffic jam in corridor not accounted for in carrier legacy TMS push.",
      requestedCorrectionAt: "2026-03-24T12:20:00Z",
      correctionTarget: "Lead Transport Dispatcher",
      createdAt: "2026-03-24T12:18:00Z"
    }
  ],

  dataQualityHistory: [
    {
      id: "DQH-201",
      issueId: "DQI-098",
      shipmentId: "BRG-2848",
      field: "consigneeAddressZip",
      oldValue: "7526",
      correctedValue: "75261",
      correctedBy: "Sarah Lin (Analyst)",
      timestamp: "2026-03-24T10:15:00Z",
      resolution: "Corrected postal zip code to match Capital Knot terminal hub manifest."
    },
    {
      id: "DQH-202",
      issueId: "DQI-099",
      shipmentId: "BRG-2847",
      field: "temperatureSafeMin",
      oldValue: "0°C",
      correctedValue: "2°C",
      correctedBy: "Sarah Lin (Analyst)",
      timestamp: "2026-03-24T09:30:00Z",
      resolution: "Updated pharma cold chain parameter to strict 2°C - 8°C European standard."
    }
  ],

  // Control Tower Analyst: Shipment Onboarding Batches
  onboardedBatches: [
    {
      id: "BATCH-2026-04",
      fileName: "BioPharma_Spring_Manifest_Q2.csv",
      fileSize: "284 KB",
      totalRecords: 18,
      validRecords: 18,
      errorRecords: 0,
      linkedCustomer: "BioPharma Health Alliance",
      linkedCarrier: "Bridges Global Logistics",
      linkedWarehouse: "Dallas Central Logistics Hub",
      status: "Imported",
      importedAt: "2026-03-24T08:00:00Z",
      importedBy: "Sarah Lin (Control Tower Analyst)"
    }
  ],

  // Dispatcher / Transport Planner: High-Impact Exception Approvals
  exceptionApprovals: [
    {
      id: "APP-801",
      exceptionId: "EXC-1049",
      shipmentId: "BRG-2847",
      customerName: "Apex Dynamics Corp",
      cargoDescription: "Automotive Precision Sub-Assemblies",
      severity: "Critical",
      priority: "P1",
      deviationReason: "Interstate 80 Severe Landslide & Debris Flow",
      financialImpact: "$14,500 Direct Cross-Dock & Air Bridge",
      penaltyRisk: "$8,200 Tier-1 Assembly Delay Penalty",
      aiRecommendation: "Engage Alternate Carrier (Falcon Express) via Northern Corridor Bypass. Minimizes delay to 45m and salvages $8,200 penalty.",
      aiConfidence: "94%",
      proposedStrategy: "Alternate Carrier",
      proposedCarrier: "Falcon Express",
      status: "Pending Approval",
      submittedBy: "Sarah Lin (Control Tower Analyst)",
      submittedAt: "2026-03-24T12:30:00Z",
      decisionDeadline: "2026-03-24T14:30:00Z",
      approvalConditions: [],
      notes: "Expense crosses the $10,000 threshold. Fast-track approval needed to guarantee loading dock turnaround."
    },
    {
      id: "APP-802",
      exceptionId: "EXC-1048",
      shipmentId: "BRG-2848",
      customerName: "BioPharma Health Alliance",
      cargoDescription: "Temperature-Sensitive Oncology Vaccines (2°C-8°C)",
      severity: "High",
      priority: "P1",
      deviationReason: "Reefer Compressor Frequency Fluctuation (+6.8°C Spike)",
      financialImpact: "$38,000 High-Value Biological Cargo at Risk",
      penaltyRisk: "$12,000 Clinical Trial Breach Penalty",
      aiRecommendation: "Expedite delivery with direct dedicated reefer van swap at Dallas Logistics Junction.",
      aiConfidence: "97%",
      proposedStrategy: "Expedite",
      proposedCarrier: "Bridges Global Logistics",
      status: "Pending Approval",
      submittedBy: "Marcus Vance (Lead Dispatcher)",
      submittedAt: "2026-03-24T13:00:00Z",
      decisionDeadline: "2026-03-24T14:00:00Z",
      approvalConditions: [],
      notes: "Immediate executive sign-off required for emergency temp-controlled sprint tractor."
    },
    {
      id: "APP-800",
      exceptionId: "EXC-1046",
      shipmentId: "BRG-2846",
      customerName: "Global Maritime Energy",
      cargoDescription: "Subsea Turbine Hydraulic Actuators",
      severity: "Medium",
      priority: "P2",
      deviationReason: "Port Terminal Berth Queue and Tide Delay",
      financialImpact: "$4,200 Demurrage Fee",
      penaltyRisk: "$2,500 Vessel Staging Fee",
      aiRecommendation: "Wait-and-Monitor with 45-minute berth queue telemetry alerts; buffer absorbs delay.",
      aiConfidence: "89%",
      proposedStrategy: "Wait-and-Monitor",
      proposedCarrier: "Swift Logistics",
      status: "Approved",
      submittedBy: "Elena Rostova",
      decidedBy: "David Kim (Regional Operations Manager)",
      decidedAt: "2026-03-24T11:15:00Z",
      approvalConditions: ["Hourly terminal gate status polling", "Immediate diversion if queue exceeds 3.5h"],
      decisionNotes: "Approved conditional on hourly gate checks and proactive notification to customer dispatch."
    }
  ],

  // Complete Approval & Decision Overrides Audit History
  approvalAuditHistory: [
    {
      id: "AUD-701",
      timestamp: "2026-03-24T11:15:00Z",
      action: "Recovery Approved",
      exceptionId: "EXC-1046",
      shipmentId: "BRG-2846",
      authorizedBy: "David Kim (Regional Operations Manager)",
      previousValue: "Pending Approval",
      newValue: "Approved (Wait-and-Monitor)",
      conditions: ["Hourly terminal gate status polling", "Immediate diversion if queue exceeds 3.5h"],
      rationale: "Terminal congestion is clearing per harbor master feed; avoid unnecessary $3,000 reroute cost."
    },
    {
      id: "AUD-700",
      timestamp: "2026-03-24T09:40:00Z",
      action: "Decision Override: Severity Downgrade",
      exceptionId: "EXC-1044",
      shipmentId: "BRG-2844",
      authorizedBy: "Marcus Vance (Transport Dispatcher)",
      previousValue: "Severity: High | Priority: P1",
      newValue: "Severity: Medium | Priority: P2",
      conditions: ["Monitor driver rest period completion", "Confirm departure by 13:00"],
      rationale: "Driver hours of service reset completed earlier than forecasted. Buffer intact."
    }
  ]
};

// Customer metadata map for all 12 core shipments with customerId partitioning
const CUSTOMER_METADATA_MAP = {
  "BRG-2848": {
    customerId: "CUST-BIO-01",
    customerName: "BioPharma Health Alliance",
    consigneeName: "Capital Knot Medical Center",
    customerReference: "PO-88248-BP",
    customerContact: "Sarah Jenkins (s.jenkins@biopharma.org | +1 555-234-8890)",
    approvedETA: "2026-03-24T18:30:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Ramp loading and flight security verification proceeding on schedule.",
    lastCustomerContact: "2026-03-24T10:15:00Z",
    lastOperationalUpdate: "2026-03-24T13:45:00Z"
  },
  "BRG-2847": {
    customerId: "CUST-APEX-02",
    customerName: "Apex Dynamics Corp",
    consigneeName: "Lake Knot Industrial Receiver",
    customerReference: "PO-88247-AD",
    customerContact: "Marcus Chen (m.chen@apexdynamics.com | +1 555-871-2244)",
    approvedETA: "2026-03-24T13:45:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Update Required",
    customerSafeExceptionSummary: "Transit delay due to regional roadway obstruction. Active detour route engaged.",
    lastCustomerContact: "2026-03-24T10:05:00Z",
    lastOperationalUpdate: "2026-03-24T12:45:00Z"
  },
  "BRG-2846": {
    customerId: "CUST-GME-03",
    customerName: "Global Maritime Energy",
    consigneeName: "Lake Knot Port Receiving Dock",
    customerReference: "PO-77246-GM",
    customerContact: "David O'Connor (operations@globalmaritime.org | +1 555-321-4455)",
    approvedETA: "2026-03-24T14:45:00Z",
    proposedETA: "2026-03-24T16:15:00Z",
    etaApprovalStatus: "Pending Review",
    customerUpdateStatus: "Update Required",
    customerSafeExceptionSummary: "Port terminal gate and berth queue experiencing high tide congestion. Discharging pending.",
    lastCustomerContact: null,
    lastOperationalUpdate: "2026-03-24T11:45:00Z"
  },
  "BRG-2845": {
    customerId: "CUST-GME-03",
    customerName: "Global Maritime Energy",
    consigneeName: "South Knot Assembly Plant",
    customerReference: "PO-55245-TT",
    customerContact: "Helena Rostova (h.rostova@terratech.com | +1 555-667-1234)",
    approvedETA: "2026-03-24T16:00:00Z",
    proposedETA: "2026-03-24T17:30:00Z",
    etaApprovalStatus: "Pending Review",
    customerUpdateStatus: "Update Required",
    customerSafeExceptionSummary: "Corridor transport split coordination in progress for oversized cargo weight compliance.",
    lastCustomerContact: "2026-03-24T09:30:00Z",
    lastOperationalUpdate: "2026-03-24T13:30:00Z"
  },
  "BRG-2844": {
    customerId: "CUST-APEX-02",
    customerName: "Apex Dynamics Corp",
    consigneeName: "Capital Knot Hub Dock 2",
    customerReference: "PO-44244-ZE",
    customerContact: "Kenji Sato (k.sato@zenith.jp | +1 555-901-7722)",
    approvedETA: "2026-03-23T14:15:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Delivered in full to receiving facility.",
    lastCustomerContact: "2026-03-23T14:35:00Z",
    lastOperationalUpdate: "2026-03-23T14:15:00Z"
  },
  "BRG-2843": {
    customerId: "CUST-BIO-01",
    customerName: "BioPharma Health Alliance",
    consigneeName: "Mountain Knot Cryo Vaults",
    customerReference: "REF-BIO-98243",
    customerContact: "Dr. Evelyn Reed (e.reed@cryobio.org | +1 555-492-3811)",
    approvedETA: "2026-03-24T18:30:00Z",
    proposedETA: "2026-03-24T19:30:00Z",
    etaApprovalStatus: "Pending Review",
    customerUpdateStatus: "Update Required",
    customerSafeExceptionSummary: "Reefer temperature telemetry alert under active investigation by cold-chain logistics team.",
    lastCustomerContact: "2026-03-24T08:30:00Z",
    lastOperationalUpdate: "2026-03-24T10:00:00Z"
  },
  "BRG-2842": {
    customerId: "CUST-GME-03",
    customerName: "Global Maritime Energy",
    consigneeName: "South Knot Distribution Hub",
    customerReference: "PO-33242-AA",
    customerContact: "Ronald Sterling (r.sterling@alpineagri.com | +1 555-112-9988)",
    approvedETA: "2026-03-24T18:00:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Precautionary mountain route detour due to regional weather advisories.",
    lastCustomerContact: "2026-03-24T11:45:00Z",
    lastOperationalUpdate: "2026-03-24T12:00:00Z"
  },
  "BRG-2841": {
    customerId: "CUST-BIO-01",
    customerName: "BioPharma Health Alliance",
    consigneeName: "Lake Knot Research Center",
    customerReference: "PO-22241-VS",
    customerContact: "Astrid Lindholm (a.lindholm@vanguardsci.eu | +44 20 7946 0192)",
    approvedETA: "2026-03-21T18:00:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Delivered to recipient on March 21.",
    lastCustomerContact: "2026-03-21T19:30:00Z",
    lastOperationalUpdate: "2026-03-21T19:25:00Z"
  },
  "BRG-2840": {
    customerId: "CUST-GME-03",
    customerName: "Global Maritime Energy",
    consigneeName: "South Knot Power Station",
    customerReference: "PO-11240-PG",
    customerContact: "Leila Haddad (l.haddad@pacificgrid.com | +1 555-442-9910)",
    approvedETA: "2026-03-19T19:00:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Delivered on schedule on March 19.",
    lastCustomerContact: "2026-03-19T19:00:00Z",
    lastOperationalUpdate: "2026-03-19T18:45:00Z"
  },
  "BRG-2839": {
    customerId: "CUST-GME-03",
    customerName: "Global Maritime Energy",
    consigneeName: "Mountain Knot Hospital",
    customerReference: "PO-00239-NP",
    customerContact: "Dmitri Volkov (d.volkov@nordicplasma.eu | +44 20 7946 0881)",
    approvedETA: "2026-03-19T14:00:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Up to Date",
    customerSafeExceptionSummary: "Delivered in full on March 19.",
    lastCustomerContact: "2026-03-19T14:00:00Z",
    lastOperationalUpdate: "2026-03-19T13:50:00Z"
  },
  "BRG-2849": {
    customerId: "CUST-APEX-02",
    customerName: "Apex Dynamics Corp",
    consigneeName: "Dallas Central Logistics Hub",
    customerReference: "PO-99249-OT",
    customerContact: "Amara Chen (achen@omnitech.com | +1 555-234-8901)",
    approvedETA: "2026-03-24T16:00:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Not Required",
    customerSafeExceptionSummary: "On schedule along Dallas Interstate Corridor.",
    lastCustomerContact: null,
    lastOperationalUpdate: "2026-03-24T11:30:00Z"
  },
  "BRG-2850": {
    customerId: "CUST-BIO-01",
    customerName: "BioPharma Health Alliance",
    consigneeName: "Chicago O'Hare Freight Depot",
    customerReference: "PO-99250-CB",
    customerContact: "Jordan Bell (jbell@chicagobio.org | +1 555-789-0123)",
    approvedETA: "2026-03-25T08:30:00Z",
    proposedETA: null,
    etaApprovalStatus: "Approved",
    customerUpdateStatus: "Not Required",
    customerSafeExceptionSummary: "Warehouse staging and departure scheduled for 17:00.",
    lastCustomerContact: null,
    lastOperationalUpdate: "2026-03-24T10:00:00Z"
  }
};

// Enrich SEED_DATA.shipments with customer metadata
if (SEED_DATA && Array.isArray(SEED_DATA.shipments)) {
  SEED_DATA.shipments.forEach(s => {
    const meta = CUSTOMER_METADATA_MAP[s.id];
    if (meta) {
      Object.assign(s, meta);
    }
  });
}

class Store {
  constructor() {
    this.data = this.loadData();
    this.listeners = [];
  }

  // Subscribe to store updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.data); } catch (e) { console.error('Store listener error:', e); }
    });
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        let changed = false;
        if (!parsed.shipmentEvents || parsed.shipmentEvents.length === 0) {
          parsed.shipmentEvents = JSON.parse(JSON.stringify(SEED_DATA.shipmentEvents));
          changed = true;
        }
        if (!parsed.recoveryRequests || parsed.recoveryRequests.length === 0) {
          parsed.recoveryRequests = JSON.parse(JSON.stringify(SEED_DATA.recoveryRequests));
          changed = true;
        }
        if (Array.isArray(parsed.auditLogs)) {
          parsed.auditLogs.forEach(l => {
            if (l && l.details && typeof l.details === 'string' && (l.details.includes('authenticated via credentials') || l.details.includes('authenticated successfully'))) {
              l.details = l.details.replace(/\s*authenticated via credentials\.?/gi, '').replace(/\s*authenticated successfully\.?/gi, '').trim() || l.affectedRecord || '—';
              changed = true;
            }
          });
        }
        // Ensure Phase 2 exceptions exist
        if (!parsed.exceptions.find(e => e.id === 'EXC-1049')) {
          const p2Exceptions = SEED_DATA.exceptions.filter(e => ['EXC-1049', 'EXC-1050', 'EXC-1051'].includes(e.id));
          parsed.exceptions.unshift(...JSON.parse(JSON.stringify(p2Exceptions)));
          changed = true;
        }
        // Backfill shipments with Phase 2 fields if missing
        if (Array.isArray(parsed.shipments)) {
          parsed.shipments.forEach(s => {
            const seedMatch = SEED_DATA.shipments.find(seedS => seedS.id === s.id);
            if (seedMatch) {
              if (!s.orderReference) { s.orderReference = seedMatch.orderReference; changed = true; }
              if (!s.cargoValue) { s.cargoValue = seedMatch.cargoValue; changed = true; }
              if (!s.customerTier) { s.customerTier = seedMatch.customerTier; changed = true; }
              if (!s.currentLocation) { s.currentLocation = seedMatch.currentLocation; changed = true; }
              if (!s.routeWaypoints) { s.routeWaypoints = seedMatch.routeWaypoints; changed = true; }
              if (!s.milestones) { s.milestones = seedMatch.milestones; changed = true; }
              if (!s.originalETA) { s.originalETA = seedMatch.originalETA; changed = true; }
              if (!s.predictedETA) { s.predictedETA = seedMatch.predictedETA; changed = true; }
              if (!s.deliveryCommitment) { s.deliveryCommitment = seedMatch.deliveryCommitment; changed = true; }
              if (!s.slaDeadline) { s.slaDeadline = seedMatch.slaDeadline; changed = true; }
              if (s.slaRisk === undefined) { s.slaRisk = seedMatch.slaRisk; changed = true; }
              if (s.estimatedPenalty === undefined) { s.estimatedPenalty = seedMatch.estimatedPenalty; changed = true; }

              // Customer Service & Customer Portal fields backfill
              const meta = typeof CUSTOMER_METADATA_MAP !== 'undefined' ? CUSTOMER_METADATA_MAP[s.id] : null;
              if (meta) {
                if (s.customerId !== meta.customerId) { s.customerId = meta.customerId; changed = true; }
                if (s.customerName !== meta.customerName) { s.customerName = meta.customerName; changed = true; }
                if (!s.consigneeName) { s.consigneeName = meta.consigneeName; changed = true; }
                if (!s.customerReference) { s.customerReference = meta.customerReference; changed = true; }
                if (!s.customerContact) { s.customerContact = meta.customerContact; changed = true; }
                if (!s.approvedETA) { s.approvedETA = meta.approvedETA; changed = true; }
                if (s.proposedETA === undefined) { s.proposedETA = meta.proposedETA; changed = true; }
                if (!s.etaApprovalStatus) { s.etaApprovalStatus = meta.etaApprovalStatus; changed = true; }
                if (!s.customerUpdateStatus) { s.customerUpdateStatus = meta.customerUpdateStatus; changed = true; }
                if (!s.customerSafeExceptionSummary) { s.customerSafeExceptionSummary = meta.customerSafeExceptionSummary; changed = true; }
                if (s.lastCustomerContact === undefined) { s.lastCustomerContact = meta.lastCustomerContact; changed = true; }
                if (!s.lastOperationalUpdate) { s.lastOperationalUpdate = meta.lastOperationalUpdate; changed = true; }
              }
            }
          });
        }
        // Backfill exceptions with Phase 2 fields if missing
        if (Array.isArray(parsed.exceptions)) {
          parsed.exceptions.forEach(e => {
            const seedMatch = SEED_DATA.exceptions.find(seedE => seedE.id === e.id);
            if (seedMatch) {
              if (!e.timeline) { e.timeline = seedMatch.timeline; changed = true; }
              if (!e.coordinationNotes) { e.coordinationNotes = seedMatch.coordinationNotes; changed = true; }
              if (!e.location) { e.location = seedMatch.location; changed = true; }
              if (!e.detectionTime) { e.detectionTime = seedMatch.detectionTime; changed = true; }
              if (!e.predictedETA) { e.predictedETA = seedMatch.predictedETA; changed = true; }
              if (e.slaRisk === undefined) { e.slaRisk = seedMatch.slaRisk; changed = true; }
              if (e.estimatedBusinessImpact === undefined) { e.estimatedBusinessImpact = seedMatch.estimatedBusinessImpact; changed = true; }
              if (e.assignedAnalyst === undefined) { e.assignedAnalyst = seedMatch.assignedAnalyst; changed = true; }
              if (e.autoResolved === undefined) { e.autoResolved = seedMatch.autoResolved; changed = true; }
              if (e.autoActionTaken === undefined) { e.autoActionTaken = seedMatch.autoActionTaken; changed = true; }
              if (seedMatch.recoveryRequestId && !e.recoveryRequestId) { e.recoveryRequestId = seedMatch.recoveryRequestId; changed = true; }
              if (seedMatch.finalResolution && !e.finalResolution) { e.finalResolution = seedMatch.finalResolution; changed = true; }
            }
          });
        }

        // Ensure Control Tower Analyst user has cta@gmail.com
        if (Array.isArray(parsed.users)) {
          const analystU = parsed.users.find(u => u.id === 'USR-102');
          if (analystU && analystU.email !== 'cta@gmail.com') {
            analystU.email = 'cta@gmail.com';
            changed = true;
          }
          const dispU = parsed.users.find(u => u.id === 'USR-104');
          if (dispU && dispU.email !== 'dispatcher@gmail.com') {
            dispU.email = 'dispatcher@gmail.com';
            changed = true;
          }
          const carrierU = parsed.users.find(u => u.id === 'USR-103');
          if (carrierU) {
            if (carrierU.email !== 'carrier@gmail.com' || carrierU.carrierId !== 'CAR-01' || carrierU.status !== 'Active') {
              carrierU.email = 'carrier@gmail.com';
              carrierU.carrierId = 'CAR-01';
              carrierU.status = 'Active';
              carrierU.role = 'Carrier Operations User';
              changed = true;
            }
          }
        }

        // Phase 3: Ensure escalations array exists
        if (!parsed.escalations || parsed.escalations.length === 0) {
          parsed.escalations = JSON.parse(JSON.stringify(SEED_DATA.escalations));
          changed = true;
        }

        // Ensure rejected and completed recovery requests exist for Dispatcher console
        if (Array.isArray(parsed.recoveryRequests) && !parsed.recoveryRequests.find(r => r.id === 'REC-2003')) {
          const extraRecs = SEED_DATA.recoveryRequests.filter(r => ['REC-2003', 'REC-2004'].includes(r.id));
          parsed.recoveryRequests.push(...JSON.parse(JSON.stringify(extraRecs)));
          changed = true;
        }

        // Phase 4: Ensure Carrier recovery requests REC-2005 through REC-2011 exist
        if (Array.isArray(parsed.recoveryRequests) && !parsed.recoveryRequests.find(r => r.id === 'REC-2005')) {
          const carrierRecs = SEED_DATA.recoveryRequests.filter(r => 
            ['REC-2005', 'REC-2006', 'REC-2007', 'REC-2008', 'REC-2009', 'REC-2010', 'REC-2011'].includes(r.id)
          );
          parsed.recoveryRequests.push(...JSON.parse(JSON.stringify(carrierRecs)));
          changed = true;
        }

        // Phase 4: Ensure carrier vehicle and driver resources exist
        if (Array.isArray(parsed.resources)) {
          const missingResources = SEED_DATA.resources.filter(seedRes => 
            !parsed.resources.find(r => r.id === seedRes.id)
          );
          if (missingResources.length > 0) {
            parsed.resources.push(...JSON.parse(JSON.stringify(missingResources)));
            changed = true;
          }
        }

        // Phase 4: Ensure disruptions array exists
        if (!parsed.disruptions || parsed.disruptions.length === 0) {
          parsed.disruptions = JSON.parse(JSON.stringify(SEED_DATA.disruptions || []));
          changed = true;
        }

        // Phase 4: Ensure notifications array exists
        if (!parsed.notifications || parsed.notifications.length === 0) {
          parsed.notifications = JSON.parse(JSON.stringify(SEED_DATA.notifications || []));
          changed = true;
        }

        // Phase 4: Ensure carrierActivity array exists
        if (!parsed.carrierActivity) {
          parsed.carrierActivity = [
            {
              id: 'ACT-1001',
              timestamp: '2026-10-15T09:30:00Z',
              carrierId: 'CAR-01',
              user: 'Marcus Vance',
              shipmentId: 'BRG-2848',
              recoveryRequestId: 'REC-2010',
              action: 'Dispatch Confirmed',
              outcome: 'Shipment dispatched via Freightliner Cascadia (BG-01) with driver Ethan Vance. En route.'
            },
            {
              id: 'ACT-1002',
              timestamp: '2026-10-15T08:15:00Z',
              carrierId: 'CAR-01',
              user: 'Marcus Vance',
              shipmentId: 'BRG-2847',
              recoveryRequestId: 'REC-2009',
              action: 'Resource Assignment',
              outcome: 'Assigned Kenworth T680 (BG-02) and driver Sarah Lin. Pickup scheduled for 09:30 AM.'
            },
            {
              id: 'ACT-1003',
              timestamp: '2026-10-14T14:45:00Z',
              carrierId: 'CAR-01',
              user: 'Marcus Vance',
              shipmentId: 'BRG-2845',
              recoveryRequestId: 'REC-2008',
              action: 'Recovery Request Accepted',
              outcome: 'Carrier accepted Alternate Carrier recovery request. Awaiting resource dispatch.'
            },
            {
              id: 'ACT-1004',
              timestamp: '2026-10-14T11:20:00Z',
              carrierId: 'CAR-01',
              user: 'Marcus Vance',
              shipmentId: 'BRG-2844',
              recoveryRequestId: 'REC-2003',
              action: 'Recovery Request Rejected',
              outcome: 'Rejected due to severe regional ice storm and driver duty limit constraints.'
            }
          ];
          changed = true;
        }

        // Ensure all 500 enterprise carriers are loaded and sync delay reasons
        if (typeof window !== 'undefined' && window.CARRIERS_500_SEED && Array.isArray(parsed.carriers)) {
          const seedMap = new Map(window.CARRIERS_500_SEED.map(c => [c.id, c]));
          if (parsed.carriers.length < 500) {
            const existingMap = new Map(parsed.carriers.map(c => [c.id, c]));
            parsed.carriers = window.CARRIERS_500_SEED.map(c => existingMap.get(c.id) || c);
            changed = true;
          }
          parsed.carriers.forEach(c => {
            const seed = seedMap.get(c.id);
            if (seed && seed.delayReason && (!c.delayReason || c.delayReason !== seed.delayReason)) {
              c.delayReason = seed.delayReason;
              c.delayCategory = seed.delayCategory;
              c.delayDuration = seed.delayDuration;
              c.delayImpact = seed.delayImpact;
              changed = true;
            }
          });
        }

        // Phase 5: Ensure warehouse master data exists
        if (!parsed.warehouses || parsed.warehouses.length === 0) {
          parsed.warehouses = JSON.parse(JSON.stringify(SEED_DATA.warehouses || []));
          changed = true;
        }
        if (!parsed.docks || parsed.docks.length === 0) {
          parsed.docks = JSON.parse(JSON.stringify(SEED_DATA.docks || []));
          changed = true;
        }
        if (!parsed.dockAppointments || parsed.dockAppointments.length === 0) {
          parsed.dockAppointments = JSON.parse(JSON.stringify(SEED_DATA.dockAppointments || []));
          changed = true;
        }
        if (!parsed.warehouseReadiness || parsed.warehouseReadiness.length === 0) {
          parsed.warehouseReadiness = JSON.parse(JSON.stringify(SEED_DATA.warehouseReadiness || []));
          changed = true;
        }
        if (!parsed.pickingPacking || parsed.pickingPacking.length === 0) {
          parsed.pickingPacking = JSON.parse(JSON.stringify(SEED_DATA.pickingPacking || []));
          changed = true;
        }
        if (!parsed.loadingRecords || parsed.loadingRecords.length === 0) {
          parsed.loadingRecords = JSON.parse(JSON.stringify(SEED_DATA.loadingRecords || []));
          changed = true;
        }
        if (!parsed.carrierHandovers || parsed.carrierHandovers.length === 0) {
          parsed.carrierHandovers = JSON.parse(JSON.stringify(SEED_DATA.carrierHandovers || []));
          changed = true;
        }
        if (!parsed.diversionRequests || parsed.diversionRequests.length === 0) {
          parsed.diversionRequests = JSON.parse(JSON.stringify(SEED_DATA.diversionRequests || []));
          changed = true;
        }
        if (!parsed.warehouseBlockers || parsed.warehouseBlockers.length === 0) {
          parsed.warehouseBlockers = JSON.parse(JSON.stringify(SEED_DATA.warehouseBlockers || []));
          changed = true;
        }
        if (!parsed.warehouseActivity || parsed.warehouseActivity.length === 0) {
          parsed.warehouseActivity = JSON.parse(JSON.stringify(SEED_DATA.warehouseActivity || []));
          changed = true;
        }
        if (!parsed.etaChangeAlerts || parsed.etaChangeAlerts.length === 0) {
          parsed.etaChangeAlerts = JSON.parse(JSON.stringify(SEED_DATA.etaChangeAlerts || []));
          changed = true;
        }
        if (!parsed.warehouseReceivingRecords) {
          parsed.warehouseReceivingRecords = JSON.parse(JSON.stringify(SEED_DATA.warehouseReceivingRecords || []));
          changed = true;
        }

        // Phase 5: Ensure USR-105 is updated with Warehouse Supervisor credentials and warehouseId
        if (Array.isArray(parsed.users)) {
          const whUser = parsed.users.find(u => u.id === 'USR-105');
          if (whUser) {
            if (whUser.email !== 'warehouse@gmail.com' || whUser.warehouseId !== 'WH-DAL-01' || whUser.name !== 'Carlos Mendoza') {
              whUser.name = 'Carlos Mendoza';
              whUser.email = 'warehouse@gmail.com';
              whUser.role = 'Warehouse Supervisor';
              whUser.warehouseId = 'WH-DAL-01';
              whUser.warehouseName = 'Dallas Central Logistics Hub';
              whUser.status = 'Active';
              changed = true;
            }
          }
        }

        // Phase 5: Ensure BRG-2849 and BRG-2850 exist in shipments
        if (Array.isArray(parsed.shipments)) {
          if (!parsed.shipments.find(s => s.id === 'BRG-2849')) {
            const whShipments = SEED_DATA.shipments.filter(s => ['BRG-2849', 'BRG-2850'].includes(s.id));
            parsed.shipments.push(...JSON.parse(JSON.stringify(whShipments)));
            changed = true;
          }
        }

        // Phase 6: Ensure communications array exists
        // Phase 6: Ensure communications array exists and includes COM-6005
        if (!parsed.communications || parsed.communications.length === 0) {
          parsed.communications = JSON.parse(JSON.stringify(SEED_DATA.communications || []));
          changed = true;
        } else if (!parsed.communications.find(c => c.id === 'COM-6005')) {
          const newComms = (SEED_DATA.communications || []).filter(c => ['COM-6005', 'COM-6006'].includes(c.id));
          parsed.communications.unshift(...JSON.parse(JSON.stringify(newComms)));
          changed = true;
        }

        if (!parsed.customerCommunicationNotes || parsed.customerCommunicationNotes.length === 0) {
          parsed.customerCommunicationNotes = JSON.parse(JSON.stringify(SEED_DATA.customerCommunicationNotes || []));
          changed = true;
        }
        if (!parsed.customerFeedback || parsed.customerFeedback.length === 0) {
          parsed.customerFeedback = JSON.parse(JSON.stringify(SEED_DATA.customerFeedback || []));
          changed = true;
        }

        // Phase 6: Ensure Customer Service seed escalations exist
        if (Array.isArray(parsed.escalations) && !parsed.escalations.find(e => e.id === 'ESC-4003')) {
          const csEscs = SEED_DATA.escalations.filter(e => ['ESC-4003', 'ESC-4004'].includes(e.id));
          parsed.escalations.push(...JSON.parse(JSON.stringify(csEscs)));
          changed = true;
        }

        // Phase 6: Ensure USR-106 is updated with Customer Service credentials
        if (Array.isArray(parsed.users)) {
          let csUser = parsed.users.find(u => u.id === 'USR-106');
          if (!csUser) {
            csUser = {
              id: "USR-106",
              name: "Clara Hughes",
              email: "cs@gmail.com",
              phone: "+1 (555) 678-9012",
              role: "Customer Service",
              status: "Active",
              carrierId: null,
              createdAt: "2026-02-14T11:00:00Z",
              updatedAt: "2026-03-01T14:00:00Z"
            };
            parsed.users.push(csUser);
            changed = true;
          } else if (csUser.email !== 'cs@gmail.com' || csUser.role !== 'Customer Service') {
            csUser.email = 'cs@gmail.com';
            csUser.role = 'Customer Service';
            changed = true;
          }

          // Phase 7: Ensure USR-107 is in users as Customer
          let custUser = parsed.users.find(u => u.id === 'USR-107');
          if (!custUser) {
            custUser = {
              id: "USR-107",
              name: "Sarah Jenkins",
              email: "customer@gmail.com",
              phone: "+1 (555) 234-8890",
              role: "Customer",
              customerId: "CUST-BIO-01",
              customerName: "BioPharma Health Alliance",
              status: "Active",
              carrierId: null,
              createdAt: "2026-02-14T11:00:00Z",
              updatedAt: "2026-03-01T14:00:00Z"
            };
            parsed.users.push(custUser);
            changed = true;
          }
        }

        // Ensure all carriers have normalized Ground, Air, Sea, Multi-Modal types
        if (Array.isArray(parsed.carriers)) {
          parsed.carriers.forEach(c => {
            const t = (c.carrierType || '').toLowerCase();
            let newType = 'Ground';
            if (t === 'air' || t.includes('air')) newType = 'Air';
            else if (t === 'sea' || t.includes('sea') || t.includes('ocean') || t.includes('port') || t.includes('marine')) newType = 'Sea';
            else if (t.includes('multi')) newType = 'Multi-Modal';
            else newType = 'Ground';
            if (c.carrierType !== newType) {
              c.carrierType = newType;
              changed = true;
            }
          });
        }

        // Phase 1 - Backfill SLA rules and Admin governance structures
        if (!parsed.slaRules || parsed.slaRules.length === 0) {
          parsed.slaRules = JSON.parse(JSON.stringify(SEED_DATA.slaRules));
          changed = true;
        }
        if (!parsed.gracePeriods) {
          parsed.gracePeriods = JSON.parse(JSON.stringify(SEED_DATA.gracePeriods));
          changed = true;
        }
        if (!parsed.penalties) {
          parsed.penalties = JSON.parse(JSON.stringify(SEED_DATA.penalties));
          changed = true;
        }
        if (!parsed.exceptionDetectionRules || parsed.exceptionDetectionRules.length === 0) {
          parsed.exceptionDetectionRules = JSON.parse(JSON.stringify(SEED_DATA.exceptionDetectionRules));
          changed = true;
        }
        if (!parsed.severityRules) {
          parsed.severityRules = JSON.parse(JSON.stringify(SEED_DATA.severityRules));
          changed = true;
        }
        if (!parsed.autoResolutionRules || parsed.autoResolutionRules.length === 0) {
          parsed.autoResolutionRules = JSON.parse(JSON.stringify(SEED_DATA.autoResolutionRules));
          changed = true;
        }
        if (!parsed.notificationTemplates || parsed.notificationTemplates.length === 0) {
          parsed.notificationTemplates = JSON.parse(JSON.stringify(SEED_DATA.notificationTemplates));
          changed = true;
        }
        if (!parsed.aiConfig) {
          parsed.aiConfig = JSON.parse(JSON.stringify(SEED_DATA.aiConfig));
          changed = true;
        }
        if (!parsed.rolePermissions) {
          parsed.rolePermissions = JSON.parse(JSON.stringify(SEED_DATA.rolePermissions));
          changed = true;
        }
        if (!parsed.loginHistory || parsed.loginHistory.length === 0) {
          parsed.loginHistory = JSON.parse(JSON.stringify(SEED_DATA.loginHistory));
          changed = true;
        }
        if (!parsed.carrierDocuments || parsed.carrierDocuments.length === 0) {
          parsed.carrierDocuments = JSON.parse(JSON.stringify(SEED_DATA.carrierDocuments));
          changed = true;
        }

        // Ensure Sarah Jenkins Customer user exists in users array
        if (Array.isArray(parsed.users) && !parsed.users.find(u => u.id === 'USR-109' || u.email === 'customer@gmail.com')) {
          parsed.users.push(JSON.parse(JSON.stringify(SEED_DATA.users.find(u => u.id === 'USR-109'))));
          changed = true;
        }

        // Control Tower Analyst backfills
        if (!parsed.inboundMessages || parsed.inboundMessages.length === 0) {
          parsed.inboundMessages = JSON.parse(JSON.stringify(SEED_DATA.inboundMessages || []));
          changed = true;
        }
        if (!parsed.dataQualityIssues || parsed.dataQualityIssues.length === 0) {
          parsed.dataQualityIssues = JSON.parse(JSON.stringify(SEED_DATA.dataQualityIssues || []));
          changed = true;
        }
        if (!parsed.dataQualityHistory || parsed.dataQualityHistory.length === 0) {
          parsed.dataQualityHistory = JSON.parse(JSON.stringify(SEED_DATA.dataQualityHistory || []));
          changed = true;
        }
        if (!parsed.onboardedBatches || parsed.onboardedBatches.length === 0) {
          parsed.onboardedBatches = JSON.parse(JSON.stringify(SEED_DATA.onboardedBatches || []));
          changed = true;
        }
        // Dispatcher approvals & decision overrides
        if (!parsed.exceptionApprovals || parsed.exceptionApprovals.length === 0) {
          parsed.exceptionApprovals = JSON.parse(JSON.stringify(SEED_DATA.exceptionApprovals || []));
          changed = true;
        }
        if (!parsed.approvalAuditHistory || parsed.approvalAuditHistory.length === 0) {
          parsed.approvalAuditHistory = JSON.parse(JSON.stringify(SEED_DATA.approvalAuditHistory || []));
          changed = true;
        }

        if (changed) {
          this.persist(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not parse localStorage, initializing seed data:', e);
    }
    // Seed and persist if not found
    this.persist(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  persist(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Error persisting to localStorage:', e);
    }
  }

  save() {
    this.persist(this.data);
    this.notify();
  }

  resetToSampleData() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.save();
    this.logAudit("Demo Dataset Reset", "System", "All Collections", "Restored standard benchmark dataset with sample logistics records.");
    return true;
  }

  clearAllData() {
    this.data = {
      settings: JSON.parse(JSON.stringify(SEED_DATA.settings)),
      carriers: [],
      users: [
        // Always preserve at least the Admin user so admin can log in and manage!
        SEED_DATA.users[0]
      ],
      resources: [],
      shipments: [],
      exceptions: [],
      auditLogs: []
    };
    this.save();
    this.logAudit("Empty State Initialized", "System", "All Records", "Administrator cleared operational records to benchmark empty states.");
    return true;
  }

  // Current Acting User for Auditing
  getCurrentAdminEmail() {
    try {
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        return `${parsed.email || 'admin@gmail.com'} (${parsed.role || 'Administrator'})`;
      }
    } catch (e) {}
    return "admin@gmail.com (Administrator)";
  }

  // Audit Logging Helper
  logAudit(action, module, affectedRecord, details) {
    let cleanDetails = details;
    if (typeof cleanDetails === 'string') {
      cleanDetails = cleanDetails.replace(/\s*authenticated via credentials\.?/gi, '').replace(/\s*authenticated successfully\.?/gi, '').trim();
    }
    const logEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      timestamp: new Date().toISOString(),
      action,
      module,
      affectedRecord,
      actingUser: this.getCurrentAdminEmail(),
      details: cleanDetails
    };
    this.data.auditLogs.unshift(logEntry);
    this.persist();
    return logEntry;
  }

  // --- USERS (US-1 to US-6) ---
  getUsers() {
    return this.data.users || [];
  }

  getUser(id) {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(userData) {
    // Validate uniqueness of email
    const existing = this.getUsers().find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      throw new Error(`A user with email "${userData.email}" already exists.`);
    }

    // Validate Carrier Operations User constraint
    if (userData.role === 'Carrier Operations User') {
      if (!userData.carrierId) {
        throw new Error('Carrier Operations Users must be associated with an active carrier organization.');
      }
      const carrier = this.getCarrier(userData.carrierId);
      if (!carrier || carrier.status !== 'Active') {
        throw new Error('The selected carrier organization is inactive or not found.');
      }
    } else {
      userData.carrierId = null; // Clean association for non-carrier roles
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      role: userData.role,
      status: userData.status || 'Active',
      carrierId: userData.carrierId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logAudit("User Created", "Users", `${newUser.id} (${newUser.name})`, `Created user with role ${newUser.role} [Status: ${newUser.status}]`);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error("User not found.");

    const current = this.data.users[userIndex];

    // Check duplicate email if changed
    if (updates.email && updates.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const conflict = this.data.users.find(u => u.id !== id && u.email.toLowerCase() === updates.email.trim().toLowerCase());
      if (conflict) {
        throw new Error(`Another user with email "${updates.email}" already exists.`);
      }
    }

    // Role-carrier validation
    const targetRole = updates.role || current.role;
    let targetCarrierId = updates.carrierId !== undefined ? updates.carrierId : current.carrierId;

    if (targetRole === 'Carrier Operations User') {
      if (!targetCarrierId) {
        throw new Error('Carrier Operations Users must be associated with an active carrier organization.');
      }
      const carrier = this.getCarrier(targetCarrierId);
      if (!carrier || carrier.status !== 'Active') {
        throw new Error('The selected carrier organization is inactive or not found.');
      }
    } else {
      targetCarrierId = null;
    }

    const updatedUser = {
      ...current,
      ...updates,
      carrierId: targetCarrierId,
      updatedAt: new Date().toISOString()
    };

    this.data.users[userIndex] = updatedUser;
    this.logAudit("User Updated", "Users", `${updatedUser.id} (${updatedUser.name})`, `Updated profile fields for role ${updatedUser.role}.`);
    this.save();
    return updatedUser;
  }

  toggleUserStatus(id) {
    const user = this.getUser(id);
    if (!user) throw new Error("User not found.");

    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    user.status = nextStatus;
    user.updatedAt = new Date().toISOString();

    this.logAudit(
      nextStatus === 'Active' ? "User Activated" : "User Deactivated",
      "Users",
      `${user.id} (${user.name})`,
      `User account status toggled to ${nextStatus}. Historical records preserved.`
    );

    this.save();
    return user;
  }

  deleteUser(id) {
    const user = this.getUser(id);
    if (!user) throw new Error("User not found.");
    if (user.email === 'admin@gmail.com') {
      throw new Error("Cannot delete the primary Administrator account.");
    }

    this.data.users = this.data.users.filter(u => u.id !== id);
    this.logAudit("User Removed", "Users", `${user.id} (${user.name})`, "Permanent removal of user record.");
    this.save();
    return true;
  }

  // --- CARRIERS (US-7 to US-11) ---
  getCarriers() {
    return this.data.carriers || [];
  }

  getActiveCarriers() {
    return this.getCarriers().filter(c => c.status === 'Active');
  }

  getCarrier(id) {
    return this.getCarriers().find(c => c.id === id);
  }

  addCarrier(carrierData) {
    const existing = this.getCarriers().find(c => c.name.toLowerCase() === carrierData.name.trim().toLowerCase());
    if (existing) {
      throw new Error(`Carrier "${carrierData.name}" already exists.`);
    }

    const carrierId = carrierData.id ? carrierData.id.trim().toUpperCase() : `CAR-${String(this.data.carriers.length + 1).padStart(2, '0')}`;
    
    // Check ID conflict
    if (this.getCarrier(carrierId)) {
      throw new Error(`Carrier ID ${carrierId} is already in use.`);
    }

    const newCarrier = {
      id: carrierId,
      name: carrierData.name.trim(),
      contactPerson: carrierData.contactPerson.trim(),
      email: carrierData.email.trim(),
      phone: carrierData.phone.trim(),
      operatingRegion: carrierData.operatingRegion.trim(),
      carrierType: carrierData.carrierType.trim(),
      status: carrierData.status || 'Active',
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.carriers.push(newCarrier);
    this.logAudit("Carrier Registered", "Carriers", `${newCarrier.id} (${newCarrier.name})`, `Registered carrier type: ${newCarrier.carrierType} in region: ${newCarrier.operatingRegion}`);
    this.save();
    return newCarrier;
  }

  updateCarrier(id, updates) {
    const index = this.data.carriers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Carrier not found.");

    const current = this.data.carriers[index];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.carriers[index] = updated;
    this.logAudit("Carrier Updated", "Carriers", `${updated.id} (${updated.name})`, `Updated carrier profile and operational attributes.`);
    this.save();
    return updated;
  }

  toggleCarrierStatus(id) {
    const carrier = this.getCarrier(id);
    if (!carrier) throw new Error("Carrier not found.");

    const nextStatus = carrier.status === 'Active' ? 'Inactive' : 'Active';
    carrier.status = nextStatus;
    carrier.updatedAt = new Date().toISOString();

    const detailMsg = nextStatus === 'Inactive'
      ? "Carrier marked Inactive. Blocked from new shipment or resource assignments while preserving historical associations."
      : "Carrier reactivated and eligible for fleet assignments.";

    this.logAudit(
      nextStatus === 'Active' ? "Carrier Activated" : "Carrier Deactivated",
      "Carriers",
      `${carrier.id} (${carrier.name})`,
      detailMsg
    );

    this.save();
    return carrier;
  }

  // --- RESOURCES: VEHICLES & DRIVERS (US-7, Resource Overview) ---
  getResources() {
    return this.data.resources || [];
  }

  getResource(id) {
    return this.getResources().find(r => r.id === id);
  }

  getVehicles() {
    return this.getResources().filter(r => r.type === 'Vehicle');
  }

  getDrivers() {
    return this.getResources().filter(r => r.type === 'Driver');
  }

  addResource(resourceData) {
    const existing = this.getResource(resourceData.id.trim().toUpperCase());
    if (existing) {
      throw new Error(`Resource with identifier "${resourceData.id}" already exists.`);
    }

    // Verify carrier
    if (resourceData.carrierId) {
      const carrier = this.getCarrier(resourceData.carrierId);
      if (!carrier) {
        throw new Error("Specified carrier does not exist.");
      }
      if (carrier.status !== 'Active') {
        throw new Error("Cannot assign resources to an Inactive carrier.");
      }
    }

    const newResource = {
      id: resourceData.id.trim().toUpperCase(),
      type: resourceData.type, // 'Vehicle' or 'Driver'
      category: resourceData.category || (resourceData.type === 'Vehicle' ? 'Ground Unit' : null),
      model: resourceData.model || '',
      plateNumber: resourceData.plateNumber || '',
      name: resourceData.name || '',
      phone: resourceData.phone || '',
      licenseNumber: resourceData.licenseNumber || '',
      carrierId: resourceData.carrierId,
      capacity: resourceData.capacity || '10.0T',
      status: resourceData.status || 'Active',
      currentLocation: resourceData.currentLocation || 'Distribution Hub',
      assignedDriverId: resourceData.assignedDriverId || null,
      currentVehicleId: resourceData.currentVehicleId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.resources.push(newResource);
    this.logAudit("Resource Added", "Resources", `${newResource.id} (${newResource.type})`, `Added ${newResource.type} linked to carrier ${newResource.carrierId}`);
    this.save();
    return newResource;
  }

  updateResource(id, updates) {
    const index = this.data.resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Resource not found.");

    const current = this.data.resources[index];
    if (updates.carrierId && updates.carrierId !== current.carrierId) {
      const carrier = this.getCarrier(updates.carrierId);
      if (!carrier || carrier.status !== 'Active') {
        throw new Error("Target carrier must exist and be Active.");
      }
    }

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.resources[index] = updated;
    this.logAudit("Resource Updated", "Resources", `${updated.id} (${updated.type})`, `Updated status/assignment to ${updated.status}.`);
    this.save();
    return updated;
  }

  deleteResource(id) {
    const resource = this.getResource(id);
    if (!resource) throw new Error("Resource not found.");

    this.data.resources = this.data.resources.filter(r => r.id !== id);
    this.logAudit("Resource Deleted", "Resources", `${resource.id} (${resource.type})`, "Resource decommissioned from fleet registry.");
    this.save();
    return true;
  }

  // --- SHIPMENTS ---
  getShipments() {
    const list = this.data.shipments || [];
    return list.map(s => this._enrichShipmentTelemetry(s));
  }

  _enrichShipmentTelemetry(s) {
    if (!s) return s;
    const isCold = (s.cargoType || '').toLowerCase().includes('medical') || 
                   (s.cargoType || '').toLowerCase().includes('pharma') || 
                   (s.cargoType || '').toLowerCase().includes('vaccine') || 
                   (s.cargoType || '').toLowerCase().includes('cold') || 
                   (s.cargoType || '').toLowerCase().includes('biopharma');
    
    // GPS Coordinates
    const defaultCoords = {
      'BRG-2848': '32.7767° N, 96.7970° W',
      'BRG-2847': '34.7465° N, 92.2896° W',
      'BRG-2846': '35.1495° N, 90.0490° W',
      'BRG-2845': '33.7490° N, 84.3880° W',
      'BRG-2844': '41.8781° N, 87.6298° W',
      'BRG-2843': '39.7392° N, 104.9903° W',
      'BRG-2842': '29.7604° N, 95.3698° W'
    };
    const gps = s.gpsCoords || defaultCoords[s.id] || '36.1627° N, 86.7816° W';
    
    // Temperature Telemetry
    let temp = s.temperature;
    if (!temp) {
      if (isCold) {
        temp = (s.hasException && s.status === 'Delayed') ? '+14.6°C (Excursion Alert)' : '+4.2°C (Cold-Chain OK)';
      } else {
        temp = 'Ambient (21.4°C)';
      }
    }

    // Customs Status
    let customs = s.customsStatus;
    if (!customs) {
      if (s.id === 'BRG-2842' || (s.hasException && (s.exceptionCategory === 'Customs Hold' || (s.rootCause && s.rootCause.toLowerCase().includes('customs'))))) {
        customs = 'Hold — Formal Broker Review (EDI 350)';
      } else {
        customs = 'Cleared / Released';
      }
    }

    // Movement History & Tracking Events
    let trackingEvents = s.trackingEvents;
    if (!trackingEvents || trackingEvents.length === 0) {
      trackingEvents = [
        { time: s.departureTime || '2026-03-24T08:30:00Z', event: 'EDI 204 Tender Accepted', location: s.origin, status: 'Completed', details: 'Carrier assigned and dispatch order acknowledged.' },
        { time: s.departureTime ? new Date(new Date(s.departureTime).getTime() + 1800000).toISOString() : '2026-03-24T09:00:00Z', event: 'Gate Out / Geofence Exit', location: s.origin + ' Terminal Gate 4', status: 'Completed', details: 'Electronic weigh-station and seal verification completed.' },
        { time: new Date().toISOString(), event: 'Live GPS Telemetry Ping', location: s.currentLocation || 'Interstate Transit Corridor', status: 'Active', details: `Coordinates: ${gps} • Speed: 58 mph • Sensor Temp: ${temp}` },
        { time: s.estArrival || '2026-03-24T18:00:00Z', event: 'Destination Inbound Notification', location: s.destination, status: 'Pending', details: 'Dock appointment window scheduled for arrival.' }
      ];
    }

    // Customer Service details
    const orderId = s.orderId || s.orderReference || 'ORD-98248';
    const customerRef = s.customerReference || (s.orderReference ? s.orderReference.replace('ORD-', 'CR-BIO-') : 'CR-BIO-449');
    const customerName = s.customerName || (s.id === 'BRG-2848' || s.id === 'BRG-2843' ? 'BioPharma Health Alliance' : s.id === 'BRG-2847' ? 'Apex Dynamics Corp' : s.id === 'BRG-2846' ? 'Global Maritime Energy' : 'Zenith Electronics Corp');
    const consigneeName = s.consigneeName || (s.destination ? s.destination.split(',')[0] + ' Receiving Hub' : 'Regional Distribution Hub');
    const approvedEta = s.approvedETA || s.estArrival || '2026-03-24 18:30 UTC';
    const proposedEta = s.proposedETA || (s.hasException && s.status === 'Delayed' ? s.estArrival : null);
    const etaApprovalStatus = s.etaApprovalStatus || (proposedEta && proposedEta !== approvedEta ? 'Pending Review' : 'Approved');
    const customerUpdateStatus = s.customerUpdateStatus || (s.hasException ? 'Action Required' : 'Up to Date');

    // Carrier & Vehicle details
    const carrierName = s.carrierName || (s.carrierId === 'CAR-01' ? 'Bridges Global Logistics' : s.carrierId === 'CAR-05' ? 'SkyLink Aviation Cargo' : s.carrierId === 'CAR-04' ? 'Lake Knot Maritime Carriers' : s.carrierId === 'CAR-03' ? 'Nordic Cold-Chain Trans' : 'Apex Logistics Group');
    const vehiclePlate = s.vehiclePlate || (s.vehicleId === 'FR-23' ? 'CA-2311-CK' : s.vehicleId === 'AT-77' ? 'N-770BR' : s.vehicleId === 'ST-09' ? 'IMO-992144' : s.vehicleId === 'CC-81' ? 'EU-8199-NC' : 'TX-TRK-8821');
    const vehicleType = s.vehicleType || (isCold ? '40ft Refrigerated Semi (Reefer)' : s.carrierId === 'CAR-05' ? 'Air Cargo Sprinter' : '53ft Enclosed Dry Van');
    const driverName = s.driverName || 'Marcus Vance';
    const driverPhone = s.driverPhone || '+1 (214) 555-0182';

    // Recovery Action
    let recoveryPlanTitle = s.recoveryPlanTitle;
    let recoveryStrategy = s.recoveryStrategy;
    if (!recoveryPlanTitle) {
      if (s.hasException && s.id === 'BRG-2847') {
        recoveryPlanTitle = 'Dynamic Arterial Re-route (Valley 3 Bypass)';
        recoveryStrategy = 'Detour via Valley 3 Bypass around rockslide MP 112; recovers 45m; dock arrival scheduled at 13:45 UTC.';
      } else if (s.hasException && s.id === 'BRG-2843') {
        recoveryPlanTitle = 'Precautionary Cold-Chain Vehicle Substitution';
        recoveryStrategy = 'Emergency transfer to backup reefer CC-81 at Mountain Pass; thermal excursion contained within +4.2°C safe window.';
      } else if (s.hasException && s.id === 'BRG-2846') {
        recoveryPlanTitle = 'Marine Berth Expedited Offloading';
        recoveryStrategy = 'Direct vessel mooring at Berth 3; pilot boat priority requested for harbor channel clearance.';
      } else if (s.hasException) {
        recoveryPlanTitle = 'Priority Operational Mitigation';
        recoveryStrategy = 'Active transport dispatcher coordination to safeguard customer delivery SLA.';
      } else {
        recoveryPlanTitle = 'Standard Network Transit';
        recoveryStrategy = 'Nominal route execution; continuous IoT telematics monitoring.';
      }
    }

    // Delivery confirmation (for delivered shipments like BRG-2844 or completed)
    let deliveryConfirmation = s.deliveryConfirmation;
    if (!deliveryConfirmation && (s.status === 'Delivered' || s.id === 'BRG-2844')) {
      deliveryConfirmation = {
        deliveredAt: s.actualArrival || '2026-03-23 14:15 UTC',
        destinationAddress: s.destination || 'Capital Knot Hub Dock 2',
        receivedQty: s.receivedQty || 240,
        damagedQty: s.damagedQty || 0,
        rejectedQty: s.rejectedQty || 0,
        discrepancyCount: 0,
        recipientName: s.signedBy || 'Dr. Aris Thorne',
        recipientRole: 'Facility Receiving Lead',
        signatureStatus: 'Verified Digital Sign-Off',
        podDocument: `POD_${s.id}_Signed.pdf`,
        podPhoto: 'pod_dock_proof.jpg',
        conditionNotes: 'All 240 cartons verified undamaged. Temp logger readouts verified nominal. Tamper seal intact.',
        isVerified: true
      };
    }

    return {
      ...s,
      orderId: orderId,
      orderReference: orderId,
      customerReference: customerRef,
      customerName: customerName,
      consigneeName: consigneeName,
      customerContact: s.customerContact || 'Logistics Coordinator',
      customerEmail: s.customerEmail || 'orders@customer.com',
      customerPhone: s.customerPhone || '+1 (555) 019-2834',
      approvedETA: approvedEta,
      proposedETA: proposedEta,
      etaApprovalStatus: etaApprovalStatus,
      customerUpdateStatus: customerUpdateStatus,
      gpsCoords: gps,
      temperature: temp,
      customsStatus: customs,
      trackingEvents: trackingEvents,
      carrierDetails: {
        carrierId: s.carrierId || "CAR-01",
        carrierName: carrierName,
        phone: s.carrierPhone || "+1 (800) 555-0199",
        email: s.carrierEmail || "dispatch@bridges-logistics.com",
        vehiclePlate: vehiclePlate,
        vehicleType: vehicleType,
        driverName: driverName,
        driverPhone: driverPhone,
        telematicsPing: "Active Telemetry (Speed: 58 mph, Sensor Online)",
        sealNumber: s.sealNumber || "SL-99482-B"
      },
      recoveryAction: {
        status: s.hasException ? "Active Recovery in Progress" : "Nominal (No Recovery Needed)",
        planTitle: recoveryPlanTitle,
        strategy: recoveryStrategy,
        mitigationImpact: s.hasException ? "Recovers 45m; maintains 99.2% on-time delivery confidence" : "On schedule",
        dispatcherInCharge: "Elena Rostova (Lead Dispatcher)",
        revisedEta: approvedEta
      },
      deliveryConfirmation: deliveryConfirmation,
      customerSafeExceptionSummary: s.customerSafeExceptionSummary || (s.hasException ? `Shipment experienced a minor operational delay due to regional conditions. Active recovery measures are underway to protect the delivery window.` : `Shipment is proceeding on schedule with nominal transit monitoring.`)
    };
  }

  getShipment(id) {
    return this.getShipments().find(s => s.id === id);
  }

  // --- EXCEPTIONS (US-16) ---
  getExceptions() {
    const list = this.data.exceptions || [];
    return list.map(e => {
      if (!e.reason) {
        e.reason = e.rootCause || e.type || 'Operational Deviation';
      }
      return e;
    });
  }

  getResolvedExceptions() {
    return this.getExceptions().filter(e => e.status === 'Resolved' || e.status === 'Closed');
  }

  getException(id) {
    const e = (this.data.exceptions || []).find(e => e.id === id);
    if (e && !e.reason) {
      e.reason = e.rootCause || e.type || 'Operational Deviation';
    }
    return e;
  }

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return (this.data.auditLogs || []).map(l => {
      if (l && l.details && typeof l.details === 'string') {
        const cleaned = l.details
          .replace(/\s*authenticated via credentials\.?/gi, '')
          .replace(/\s*authenticated successfully\.?/gi, '')
          .trim();
        return {
          ...l,
          details: cleaned || l.affectedRecord || '—'
        };
      }
      return l;
    });
  }

  // --- SETTINGS ---
  getSettings() {
    return this.data.settings || SEED_DATA.settings;
  }

  updateSettings(updates) {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.logAudit("Configuration Updated", "Settings", "Control Tower Parameters", "Saved administrative threshold, category, and display settings.");
    this.save();
    return this.data.settings;
  }

  // --- SUBSCRIPTIONS ---
  getSubscription() {
    const settings = this.getSettings();
    if (!settings.subscription) {
      settings.subscription = JSON.parse(JSON.stringify(SEED_DATA.settings.subscription));
      this.updateSettings({ subscription: settings.subscription });
    }
    return settings.subscription;
  }

  updateSubscription(updates) {
    const current = this.getSubscription();
    const updated = {
      ...current,
      ...updates
    };
    this.updateSettings({ subscription: updated });
    this.logAudit("Subscription Modified", "Billing", updated.planId || "Plan", `Subscription plan updated: ${updated.planName} (${updated.billingCycle || 'Annual'}).`);
    return updated;
  }

  // =========================================================================
  // PHASE 1: ADMINISTRATOR STORE OPERATIONS (US-SLA-01 to US-AI-05)
  // =========================================================================

  // --- SLA RULES & DEADLINES ---
  getSlaRules() {
    return this.data.slaRules || SEED_DATA.slaRules;
  }

  getSlaRule(id) {
    return this.getSlaRules().find(r => r.id === id);
  }

  addSlaRule(rule) {
    const id = `SLA-RULE-${Date.now().toString().slice(-4)}`;
    const newRule = { id, ...rule };
    if (!this.data.slaRules) this.data.slaRules = [];
    this.data.slaRules.push(newRule);
    this.logAudit("SLA Rule Created", "Rules", id, `Created SLA rule "${newRule.name}" (Deadline: ${newRule.deliveryDeadlineHours}h, Grace: ${newRule.gracePeriodMinutes}m).`);
    this.save();
    return newRule;
  }

  updateSlaRule(id, updates) {
    const rules = this.getSlaRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      rules[idx] = { ...rules[idx], ...updates };
      this.data.slaRules = rules;
      this.logAudit("SLA Rule Updated", "Rules", id, `Updated SLA parameters for "${rules[idx].name}".`);
      this.save();
      return rules[idx];
    }
    return null;
  }

  deleteSlaRule(id) {
    const target = this.getSlaRule(id);
    this.data.slaRules = this.getSlaRules().filter(r => r.id !== id);
    this.logAudit("SLA Rule Removed", "Rules", id, `Deleted SLA rule definition "${target ? target.name : id}".`);
    this.save();
    return true;
  }

  // --- GRACE PERIODS & PENALTIES ---
  getGracePeriods() {
    return this.data.gracePeriods || SEED_DATA.gracePeriods;
  }

  updateGracePeriods(updates) {
    this.data.gracePeriods = { ...this.getGracePeriods(), ...updates };
    this.logAudit("Grace Periods Updated", "Rules", "Operational Buffers", "Updated pickup, transit, and delivery grace windows.");
    this.save();
    return this.data.gracePeriods;
  }

  getPenalties() {
    return this.data.penalties || SEED_DATA.penalties;
  }

  updatePenalties(updates) {
    this.data.penalties = { ...this.getPenalties(), ...updates };
    this.logAudit("Penalties Updated", "Rules", "Financial Terms", "Updated contractual delay penalties and liquidated damages.");
    this.save();
    return this.data.penalties;
  }

  // --- EXCEPTION DETECTION RULES ---
  getExceptionDetectionRules() {
    return this.data.exceptionDetectionRules || SEED_DATA.exceptionDetectionRules;
  }

  addExceptionDetectionRule(rule) {
    const id = `ED-${Date.now().toString().slice(-4)}`;
    const newRule = { id, active: true, ...rule };
    if (!this.data.exceptionDetectionRules) this.data.exceptionDetectionRules = [];
    this.data.exceptionDetectionRules.push(newRule);
    this.logAudit("Detection Rule Created", "Rules", id, `Created exception detection rule "${newRule.name}".`);
    this.save();
    return newRule;
  }

  updateExceptionDetectionRule(id, updates) {
    const rules = this.getExceptionDetectionRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      rules[idx] = { ...rules[idx], ...updates };
      this.data.exceptionDetectionRules = rules;
      this.logAudit("Detection Rule Updated", "Rules", id, `Updated detection parameters for "${rules[idx].name}".`);
      this.save();
      return rules[idx];
    }
    return null;
  }

  deleteExceptionDetectionRule(id) {
    const target = (this.data.exceptionDetectionRules || []).find(r => r.id === id);
    this.data.exceptionDetectionRules = this.getExceptionDetectionRules().filter(r => r.id !== id);
    this.logAudit("Detection Rule Removed", "Rules", id, `Deleted detection rule "${target ? target.name : id}".`);
    this.save();
    return true;
  }

  // --- SEVERITY RULES ---
  getSeverityRules() {
    return this.data.severityRules || SEED_DATA.severityRules;
  }

  updateSeverityRules(updates) {
    this.data.severityRules = { ...this.getSeverityRules(), ...updates };
    this.logAudit("Severity Rules Updated", "Rules", "Classification Criteria", "Updated severity classification logic thresholds.");
    this.save();
    return this.data.severityRules;
  }

  // --- LOW-SEVERITY AUTO-RESOLUTION RULES ---
  getAutoResolutionRules() {
    return this.data.autoResolutionRules || SEED_DATA.autoResolutionRules;
  }

  addAutoResolutionRule(rule) {
    const id = `AR-${Date.now().toString().slice(-4)}`;
    const newRule = { id, active: true, ...rule };
    if (!this.data.autoResolutionRules) this.data.autoResolutionRules = [];
    this.data.autoResolutionRules.push(newRule);
    this.logAudit("Auto-Resolution Rule Created", "Rules", id, `Created auto-resolution rule "${newRule.name}".`);
    this.save();
    return newRule;
  }

  updateAutoResolutionRule(id, updates) {
    const rules = this.getAutoResolutionRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      rules[idx] = { ...rules[idx], ...updates };
      this.data.autoResolutionRules = rules;
      this.logAudit("Auto-Resolution Rule Updated", "Rules", id, `Modified auto-resolution criteria for "${rules[idx].name}".`);
      this.save();
      return rules[idx];
    }
    return null;
  }

  deleteAutoResolutionRule(id) {
    const target = (this.data.autoResolutionRules || []).find(r => r.id === id);
    this.data.autoResolutionRules = this.getAutoResolutionRules().filter(r => r.id !== id);
    this.logAudit("Auto-Resolution Rule Removed", "Rules", id, `Deleted auto-resolution rule "${target ? target.name : id}".`);
    this.save();
    return true;
  }

  // --- NOTIFICATION TEMPLATES ---
  getNotificationTemplates() {
    return this.data.notificationTemplates || SEED_DATA.notificationTemplates;
  }

  getNotificationTemplate(id) {
    return this.getNotificationTemplates().find(t => t.id === id);
  }

  addNotificationTemplate(tmpl) {
    const id = `NT-${Date.now().toString().slice(-4)}`;
    const newTmpl = { id, active: true, updatedAt: new Date().toISOString(), ...tmpl };
    if (!this.data.notificationTemplates) this.data.notificationTemplates = [];
    this.data.notificationTemplates.push(newTmpl);
    this.logAudit("Notification Template Created", "Notifications", id, `Created notification template "${newTmpl.name}" for trigger "${newTmpl.triggerEvent}".`);
    this.save();
    return newTmpl;
  }

  updateNotificationTemplate(id, updates) {
    const templates = this.getNotificationTemplates();
    const idx = templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      templates[idx] = { ...templates[idx], ...updates, updatedAt: new Date().toISOString() };
      this.data.notificationTemplates = templates;
      this.logAudit("Notification Template Updated", "Notifications", id, `Updated template content for "${templates[idx].name}".`);
      this.save();
      return templates[idx];
    }
    return null;
  }

  deleteNotificationTemplate(id) {
    const target = this.getNotificationTemplate(id);
    this.data.notificationTemplates = this.getNotificationTemplates().filter(t => t.id !== id);
    this.logAudit("Notification Template Deleted", "Notifications", id, `Deleted notification template "${target ? target.name : id}".`);
    this.save();
    return true;
  }

  // --- AI & APPROVAL CONFIGURATION ---
  getAIConfig() {
    return this.data.aiConfig || SEED_DATA.aiConfig;
  }

  updateAIConfig(updates) {
    this.data.aiConfig = { ...this.getAIConfig(), ...updates };
    this.logAudit("AI Configuration Updated", "AI Engine", "Recommendation Engine & Approval Limits", "Updated AI confidence thresholds, human-approval rules, and financial authorization limits.");
    this.save();
    return this.data.aiConfig;
  }

  // --- ROLE-BASED ACCESS CONTROL (RBAC) ---
  getRolePermissions() {
    return this.data.rolePermissions || SEED_DATA.rolePermissions;
  }

  updateRolePermissions(role, permissions) {
    if (!this.data.rolePermissions) this.data.rolePermissions = JSON.parse(JSON.stringify(SEED_DATA.rolePermissions));
    this.data.rolePermissions[role] = { ...this.data.rolePermissions[role], ...permissions };
    this.logAudit("Role Permissions Modified", "Users", role, `Updated role-based access permissions for role "${role}".`);
    this.save();
    return this.data.rolePermissions[role];
  }

  // --- LOGIN & SESSION HISTORY ---
  getLoginHistory() {
    return this.data.loginHistory || SEED_DATA.loginHistory;
  }

  logLogin(user, status = 'Success', ip = '127.0.0.1 (Local Session)', details = '') {
    if (!this.data.loginHistory) this.data.loginHistory = [];
    const entry = {
      id: `LOG-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      userId: user ? (user.id || 'USR-UNK') : 'UNKNOWN',
      userName: user ? (user.name || 'Unknown User') : 'Unknown User',
      email: user ? (user.email || 'unknown') : (typeof user === 'string' ? user : 'unknown'),
      role: user ? (user.role || 'Guest') : 'Guest',
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent.split(') ')[0] + ')' : 'Web Client',
      status: status, // Success | Blocked (Account Inactive) | Blocked (Carrier Inactive) | Failed (Invalid Password)
      sessionDuration: status === 'Success' ? 'Active' : '—',
      details: details
    };
    this.data.loginHistory.unshift(entry);
    if (this.data.loginHistory.length > 150) {
      this.data.loginHistory = this.data.loginHistory.slice(0, 150);
    }
    this.persist();
    return entry;
  }

  // --- CARRIER DOCUMENTS & COMPLIANCE ---
  getCarrierDocuments(carrierId) {
    const docs = this.data.carrierDocuments || SEED_DATA.carrierDocuments;
    if (carrierId) {
      return docs.filter(d => d.carrierId === carrierId);
    }
    return docs;
  }

  addCarrierDocument(doc) {
    const id = `DOC-${doc.carrierId}-${Date.now().toString().slice(-4)}`;
    const newDoc = { id, status: 'Verified', ...doc };
    if (!this.data.carrierDocuments) this.data.carrierDocuments = [];
    this.data.carrierDocuments.unshift(newDoc);
    this.logAudit("Carrier Document Uploaded", "Carriers", doc.carrierId, `Added compliance document "${newDoc.title}" (${newDoc.docType}).`);
    this.save();
    return newDoc;
  }

  updateCarrierDocument(id, updates) {
    const docs = this.getCarrierDocuments();
    const idx = docs.findIndex(d => d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates };
      this.data.carrierDocuments = docs;
      this.logAudit("Carrier Document Updated", "Carriers", docs[idx].carrierId, `Updated document status for "${docs[idx].title}".`);
      this.save();
      return docs[idx];
    }
    return null;
  }

  deleteCarrierDocument(id) {
    const doc = (this.data.carrierDocuments || []).find(d => d.id === id);
    this.data.carrierDocuments = (this.data.carrierDocuments || []).filter(d => d.id !== id);
    if (doc) {
      this.logAudit("Carrier Document Removed", "Carriers", doc.carrierId, `Deleted document "${doc.title}".`);
    }
    this.save();
    return true;
  }

  // Dynamic Calculated Statistics (No static or fake figures!)
  getMetrics() {
    const shipments = this.getShipments();
    const exceptions = this.getExceptions();
    const carriers = this.getCarriers();
    const resources = this.getResources();

    const totalShipments = shipments.length;
    const activeShipments = shipments.filter(s => s.status === 'On Route' || s.status === 'Loading' || s.status === 'Delayed').length;
    const openExceptions = exceptions.filter(e => e.status === 'Open' || e.status === 'Under Investigation' || e.status === 'Investigating' || e.status === 'Recovery in Progress').length;
    
    // On-Time Delivery % calculation: (Delivered on time / Delivered total) * 100
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered');
    const onTimeDelivered = deliveredShipments.filter(s => s.onTime === true).length;
    const onTimeDeliveryRate = deliveredShipments.length > 0 
      ? Math.round((onTimeDelivered / deliveredShipments.length) * 1000) / 10 
      : 0;

    const vehicles = resources.filter(r => r.type === 'Vehicle');
    const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
    const fleetUtilization = vehicles.length > 0 
      ? Math.round((activeVehicles / vehicles.length) * 1000) / 10 
      : 0;

    return {
      totalShipments,
      activeShipments,
      openExceptions,
      onTimeDeliveryRate,
      fleetUtilization,
      totalCarriers: carriers.length,
      activeCarriers: carriers.filter(c => c.status === 'Active').length,
      inactiveCarriers: carriers.filter(c => c.status === 'Inactive').length,
      totalVehicles: vehicles.length,
      totalDrivers: resources.filter(r => r.type === 'Driver').length
    };
  }

  // --- SHIPMENT EVENTS (US-19 to US-22) ---
  getShipmentEvents(shipmentId = null) {
    const events = this.data.shipmentEvents || [];
    if (!shipmentId) {
      return [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return events.filter(e => e.shipmentId === shipmentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addShipmentEvent(eventData) {
    if (!eventData.shipmentId) throw new Error("Shipment ID is required.");
    const shipment = this.getShipment(eventData.shipmentId);
    if (!shipment) throw new Error(`Shipment ${eventData.shipmentId} not found.`);

    if (!this.data.shipmentEvents) this.data.shipmentEvents = [];

    const now = new Date();
    const eventTime = eventData.timestamp || now.toISOString();

    // Deduplication check: prevent identical event spam within 5 minutes
    const duplicate = this.data.shipmentEvents.find(e => 
      e.shipmentId === eventData.shipmentId &&
      e.eventType === eventData.eventType &&
      e.reportedLocation === eventData.reportedLocation &&
      Math.abs(new Date(e.timestamp) - new Date(eventTime)) < 300000
    );

    if (duplicate) {
      const ignoredEvent = {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: eventData.shipmentId,
        eventType: eventData.eventType,
        timestamp: eventTime,
        reportedLocation: eventData.reportedLocation || shipment.currentLocation || "En Route",
        sourceSystem: eventData.sourceSystem || "TMS",
        processingStatus: "Duplicate Ignored",
        relatedExceptionId: duplicate.relatedExceptionId || null,
        details: `${eventData.details || 'Duplicate sensor/TMS ping'} (Duplicate Ignored within 5-min threshold)`
      };
      this.data.shipmentEvents.unshift(ignoredEvent);
      this.save();
      return ignoredEvent;
    }

    // Configurable Rule-based Exception Detection
    let processingStatus = "Processed";
    let relatedExceptionId = null;

    if (eventData.eventType === "Temperature out of range") {
      const tempVal = parseFloat(eventData.temperature || 4.5);
      const isCritical = tempVal > 4.0;
      const newExc = {
        id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipment.id,
        carrierId: shipment.carrierId,
        type: "Temperature Breach",
        severity: isCritical ? "Critical" : "High",
        rootCause: eventData.details || `Reefer thermal deviation (+${tempVal}°C excursion detected)`,
        status: "Open",
        assignedAnalyst: null,
        autoResolved: false,
        autoActionTaken: null,
        location: eventData.reportedLocation || shipment.currentLocation || "Cold Corridor MP",
        detectionTime: eventTime,
        predictedETA: shipment.predictedETA || shipment.estArrival,
        slaRisk: "Critical",
        estimatedBusinessImpact: "$75,000 thermal spoilage & pharmaceutical loss risk",
        timeline: [
          { timestamp: eventTime, actor: `System (${eventData.sourceSystem || 'IoT Sensor'})`, action: "Exception Detected", note: `Temperature excursion: +${tempVal}°C above permissible threshold.` }
        ],
        coordinationNotes: [],
        recoveryRequestId: null,
        createdAt: eventTime,
        resolvedAt: null,
        finalOutcome: null
      };

      this.data.exceptions.unshift(newExc);
      shipment.hasException = true;
      shipment.status = "Delayed";
      shipment.slaRisk = "Critical";
      processingStatus = "Exception Created";
      relatedExceptionId = newExc.id;
      this.logAudit("Exception Generated", "Events", newExc.id, `Created ${newExc.type} alert from ${eventData.sourceSystem} event.`);

    } else if (eventData.eventType === "ETA changed") {
      const delayMins = parseInt(eventData.delayMinutes || 120, 10);
      const isCritical = delayMins >= 240;
      const newExc = {
        id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipment.id,
        carrierId: shipment.carrierId,
        type: "Route Delay",
        severity: isCritical ? "Critical" : "High",
        rootCause: eventData.details || `Carrier route delay (+${delayMins} min deviation)`,
        status: "Open",
        assignedAnalyst: null,
        autoResolved: false,
        autoActionTaken: null,
        location: eventData.reportedLocation || shipment.currentLocation || "Route Corridor",
        detectionTime: eventTime,
        predictedETA: new Date(new Date(shipment.estArrival).getTime() + delayMins * 60000).toISOString(),
        slaRisk: isCritical ? "Critical" : "High",
        estimatedBusinessImpact: `$${Math.min(25000, delayMins * 120)} SLA breach penalty`,
        timeline: [
          { timestamp: eventTime, actor: `System (${eventData.sourceSystem || 'TMS'})`, action: "Exception Detected", note: `ETA modified with +${delayMins}m projected delay.` }
        ],
        coordinationNotes: [],
        recoveryRequestId: null,
        createdAt: eventTime,
        resolvedAt: null,
        finalOutcome: null
      };

      this.data.exceptions.unshift(newExc);
      shipment.hasException = true;
      shipment.status = "Delayed";
      shipment.predictedETA = newExc.predictedETA;
      shipment.slaRisk = isCritical ? "Critical" : "High";
      processingStatus = "Exception Created";
      relatedExceptionId = newExc.id;
      this.logAudit("Exception Generated", "Events", newExc.id, `Created Route Delay alert for ${shipment.id}.`);

    } else if (eventData.eventType === "Excessive dwell time") {
      const newExc = {
        id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipment.id,
        carrierId: shipment.carrierId,
        type: "Excessive Dwell Time",
        severity: "Medium",
        rootCause: eventData.details || "Stationary unit dwell exceeding operational parameter threshold",
        status: "Open",
        assignedAnalyst: null,
        autoResolved: false,
        autoActionTaken: null,
        location: eventData.reportedLocation || shipment.currentLocation || "Logistics Hub Gate",
        detectionTime: eventTime,
        predictedETA: shipment.predictedETA || shipment.estArrival,
        slaRisk: "Medium",
        estimatedBusinessImpact: "$4,500 terminal demurrage cost",
        timeline: [
          { timestamp: eventTime, actor: `System (${eventData.sourceSystem || 'GPS Telematics'})`, action: "Exception Detected", note: "Vehicle stationary in loading area beyond 35 minutes." }
        ],
        coordinationNotes: [],
        recoveryRequestId: null,
        createdAt: eventTime,
        resolvedAt: null,
        finalOutcome: null
      };

      this.data.exceptions.unshift(newExc);
      shipment.hasException = true;
      processingStatus = "Exception Created";
      relatedExceptionId = newExc.id;

    } else if (eventData.eventType === "Pickup missed") {
      const newExc = {
        id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipment.id,
        carrierId: shipment.carrierId,
        type: "Missed Pickup",
        severity: "High",
        rootCause: eventData.details || "Carrier vehicle missed scheduled shipper loading window",
        status: "Open",
        assignedAnalyst: null,
        autoResolved: false,
        autoActionTaken: null,
        location: eventData.reportedLocation || shipment.origin,
        detectionTime: eventTime,
        predictedETA: shipment.predictedETA || shipment.estArrival,
        slaRisk: "High",
        estimatedBusinessImpact: "$8,000 missed freight window fee",
        timeline: [
          { timestamp: eventTime, actor: `System (${eventData.sourceSystem || 'TMS'})`, action: "Exception Detected", note: "Pickup deadline elapsed without gate entry scan." }
        ],
        coordinationNotes: [],
        recoveryRequestId: null,
        createdAt: eventTime,
        resolvedAt: null,
        finalOutcome: null
      };

      this.data.exceptions.unshift(newExc);
      shipment.hasException = true;
      processingStatus = "Exception Created";
      relatedExceptionId = newExc.id;

    } else if (eventData.eventType === "Customs hold") {
      const newExc = {
        id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipment.id,
        carrierId: shipment.carrierId,
        type: "Customs Hold",
        severity: "Medium",
        rootCause: eventData.details || "Tariff document inspection or border customs hold",
        status: "Open",
        assignedAnalyst: null,
        autoResolved: false,
        autoActionTaken: null,
        location: eventData.reportedLocation || "Border Customs Checkpoint",
        detectionTime: eventTime,
        predictedETA: shipment.predictedETA || shipment.estArrival,
        slaRisk: "Medium",
        estimatedBusinessImpact: "$6,200 broker clearance & demurrage",
        timeline: [
          { timestamp: eventTime, actor: `System (${eventData.sourceSystem || 'TMS'})`, action: "Exception Detected", note: "Customs clearance status set to Red Line Inspection." }
        ],
        coordinationNotes: [],
        recoveryRequestId: null,
        createdAt: eventTime,
        resolvedAt: null,
        finalOutcome: null
      };

      this.data.exceptions.unshift(newExc);
      shipment.hasException = true;
      processingStatus = "Exception Created";
      relatedExceptionId = newExc.id;

    } else if (eventData.eventType === "Delivery completed") {
      shipment.status = "Delivered";
      shipment.actualArrival = eventTime;
      shipment.onTime = new Date(eventTime) <= new Date(shipment.deliveryCommitment || shipment.estArrival);
      shipment.currentLocation = shipment.destination;
      processingStatus = "Processed";
      this.logAudit("Shipment Delivered", "Shipments", shipment.id, `Confirmed delivery at ${shipment.destination}. On-time: ${shipment.onTime}`);

    } else {
      // Nominal milestone events
      if (eventData.reportedLocation) {
        shipment.currentLocation = eventData.reportedLocation;
      }
      if (eventData.eventType === "Shipment departed") {
        shipment.status = "On Route";
      }
      processingStatus = "Processed";
    }

    const newEvent = {
      id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      shipmentId: eventData.shipmentId,
      eventType: eventData.eventType,
      timestamp: eventTime,
      reportedLocation: eventData.reportedLocation || shipment.currentLocation || "En Route",
      sourceSystem: eventData.sourceSystem || "TMS",
      processingStatus,
      relatedExceptionId,
      details: eventData.details || `Logged ${eventData.eventType} event from ${eventData.sourceSystem || 'system'}`
    };

    this.data.shipmentEvents.unshift(newEvent);
    this.save();
    return newEvent;
  }

  // --- RECOVERY REQUESTS (US-27, US-33 to US-40) ---
  getRecoveryRequests(exceptionId = null) {
    const list = this.data.recoveryRequests || [];
    if (!exceptionId) {
      return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list.filter(r => r.exceptionId === exceptionId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getRecoveryRequest(id) {
    return (this.data.recoveryRequests || []).find(r => r.id === id);
  }

  createRecoveryRequest(reqData) {
    const validStrategies = ['Re-route', 'Alternate Carrier', 'Expedite', 'Split Shipment', 'Wait-and-Monitor'];
    if (!validStrategies.includes(reqData.recoveryStrategy)) {
      throw new Error(`Invalid recovery strategy. Must be one of: ${validStrategies.join(', ')}`);
    }

    if (!reqData.exceptionId) throw new Error("Linked Exception ID is required.");
    if (!reqData.shipmentId) throw new Error("Linked Shipment ID is required.");
    if (!reqData.reasonForRecovery || !reqData.reasonForRecovery.trim()) {
      throw new Error("Reason for recovery is required.");
    }
    if (!reqData.operationalNotes || !reqData.operationalNotes.trim()) {
      throw new Error("Operational notes are required.");
    }
    if (!reqData.expectedEtaImpact || !reqData.expectedEtaImpact.trim()) {
      throw new Error("Expected ETA impact is required.");
    }

    // Strategy-specific validation
    if (reqData.recoveryStrategy === 'Alternate Carrier') {
      if (!reqData.requestedCarrierId) throw new Error("Alternate Carrier selection is required.");
      const carrier = this.getCarrier(reqData.requestedCarrierId);
      if (!carrier) throw new Error("Target carrier does not exist.");
      if (carrier.status !== 'Active') {
        throw new Error(`Carrier ${carrier.name} is Inactive. You can only assign Active carriers.`);
      }
    } else if (reqData.recoveryStrategy === 'Re-route') {
      if (!reqData.proposedRoute || !reqData.proposedRoute.trim()) {
        throw new Error("Proposed alternative route details are required for Re-route strategy.");
      }
    } else if (reqData.recoveryStrategy === 'Expedite') {
      if (!reqData.expediteUrgency) {
        throw new Error("Required delivery timeframe / urgency is required for Expedite strategy.");
      }
    } else if (reqData.recoveryStrategy === 'Split Shipment') {
      if (!reqData.splitDetails || !reqData.splitDetails.portion1 || !reqData.splitDetails.portion2) {
        throw new Error("Split shipment requires defined portions and cargo allocation.");
      }
    } else if (reqData.recoveryStrategy === 'Wait-and-Monitor') {
      if (!reqData.monitoringInterval) {
        reqData.monitoringInterval = '30 Minutes';
      }
    }

    // Check for existing pending request - supersede cleanly rather than throwing blocking error
    const existingPending = (this.data.recoveryRequests || []).find(r => 
      r.exceptionId === reqData.exceptionId && 
      ['Pending Carrier Response', 'In Progress', 'Accepted'].includes(r.responseStatus)
    );
    if (existingPending) {
      existingPending.responseStatus = "Superseded";
      existingPending.rejectionReason = `Superseded by updated recovery plan (${reqData.recoveryStrategy}).`;
      existingPending.updatedAt = new Date().toISOString();
      if (!existingPending.timeline) existingPending.timeline = [];
      existingPending.timeline.push({
        timestamp: new Date().toISOString(),
        actor: reqData.submittedBy || (window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? window.BRIDGES_AUTH.getCurrentUser().name : "Control Tower"),
        action: "Recovery Plan Superseded",
        note: `Plan updated to ${reqData.recoveryStrategy}. Previous request superseded.`
      });
    }

    const carrierObj = reqData.requestedCarrierId ? this.getCarrier(reqData.requestedCarrierId) : null;
    const carrierName = carrierObj ? carrierObj.name : (reqData.requestedCarrierName || null);

    const newRequest = {
      id: `REC-${Math.floor(2000 + Math.random() * 8000)}`,
      exceptionId: reqData.exceptionId,
      shipmentId: reqData.shipmentId,
      recoveryStrategy: reqData.recoveryStrategy,
      requestedCarrierId: reqData.requestedCarrierId || null,
      requestedCarrierName: carrierName,
      reasonForRecovery: reqData.reasonForRecovery.trim(),
      operationalNotes: reqData.operationalNotes.trim(),
      expectedEtaImpact: reqData.expectedEtaImpact.trim(),
      proposedRoute: reqData.proposedRoute ? reqData.proposedRoute.trim() : null,
      splitDetails: reqData.splitDetails || null,
      expediteUrgency: reqData.expediteUrgency || null,
      monitoringInterval: reqData.monitoringInterval || null,
      responseStatus: "Pending Carrier Response",
      assignedVehicleId: null,
      assignedDriverName: null,
      revisedEta: reqData.revisedEta || "Pending Carrier Confirmation",
      rejectionReason: null,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          actor: reqData.submittedBy || (window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner"),
          action: "Recovery Request Initiated",
          note: `Initiated ${reqData.recoveryStrategy} recovery request. Reason: ${reqData.reasonForRecovery.trim()}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.data.recoveryRequests) this.data.recoveryRequests = [];
    this.data.recoveryRequests.unshift(newRequest);

    // Update exception status to Recovery in Progress
    const exception = this.getException(reqData.exceptionId);
    if (exception) {
      exception.status = "Recovery in Progress";
      exception.recoveryRequestId = newRequest.id;
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: new Date().toISOString(),
        actor: reqData.submittedBy || (window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner"),
        action: "Recovery in Progress",
        note: `Initiated ${newRequest.recoveryStrategy} recovery request (${newRequest.id}).`
      });
    }

    this.logAudit("Recovery Requested", "Recoveries", newRequest.id, `Created ${newRequest.recoveryStrategy} request linked to ${reqData.exceptionId}.`);
    this.save();
    return newRequest;
  }

  updateRecoveryStatus(requestId, newStatus, details = {}) {
    const index = (this.data.recoveryRequests || []).findIndex(r => r.id === requestId);
    if (index === -1) throw new Error("Recovery request not found.");

    const req = this.data.recoveryRequests[index];
    const prevStatus = req.responseStatus;
    req.responseStatus = newStatus;
    req.updatedAt = new Date().toISOString();

    const timestamp = new Date().toISOString();

    if (newStatus === "Accepted") {
      req.assignedVehicleId = details.vehicleId || req.assignedVehicleId || "FR-23";
      req.assignedDriverName = details.driverName || req.assignedDriverName || "Ethan Cole";
      if (details.revisedEta) req.revisedEta = details.revisedEta;
      req.timeline.push({
        timestamp,
        actor: `Carrier Dispatch (${req.requestedCarrierName || 'Carrier'})`,
        action: "Recovery Accepted",
        note: `Carrier accepted recovery. Assigned vehicle ${req.assignedVehicleId}, driver ${req.assignedDriverName}.`
      });
    } else if (newStatus === "Rejected") {
      req.rejectionReason = details.rejectionReason || "No fleet capacity available for requested window.";
      req.timeline.push({
        timestamp,
        actor: `Carrier Dispatch (${req.requestedCarrierName || 'Carrier'})`,
        action: "Recovery Rejected",
        note: `Carrier rejected request: ${req.rejectionReason}`
      });
    } else if (newStatus === "In Progress") {
      req.timeline.push({
        timestamp,
        actor: "Dispatcher / Transport Planner",
        action: "Dispatch Confirmation",
        note: details.note || "Replacement vehicle dispatched and en route to recovery corridor."
      });
    } else if (newStatus === "Completed") {
      req.timeline.push({
        timestamp,
        actor: "Control Tower",
        action: "Recovery Completed",
        note: details.note || "Recovery executed successfully. Shipment delivered or returned to schedule."
      });
      if (details.confirmDelivery) {
        const shipment = this.getShipment(req.shipmentId);
        if (shipment) {
          shipment.status = "Delivered";
          shipment.actualArrival = timestamp;
          shipment.onTime = true;
        }
      }
    } else if (newStatus === "Failed") {
      req.timeline.push({
        timestamp,
        actor: "Operations",
        action: "Recovery Failed",
        note: details.note || "Recovery execution could not be completed. Operational escalation needed."
      });
    }

    this.logAudit("Recovery Status Updated", "Recoveries", req.id, `Status transitioned from ${prevStatus} to ${newStatus}.`);
    this.save();
    return req;
  }

  cancelRecoveryRequest(requestId, reason = 'Cancelled by Control Tower') {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const now = new Date().toISOString();
    req.responseStatus = 'Cancelled';
    req.rejectionReason = reason;
    req.updatedAt = now;
    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? window.BRIDGES_AUTH.getCurrentUser().name : 'Control Tower',
      action: 'Recovery Request Cancelled',
      note: reason
    });
    const exc = this.getException(req.exceptionId);
    if (exc) {
      exc.recoveryRequestId = null;
      exc.status = 'Investigating';
    }
    this.logAudit("Recovery Cancelled", "Recoveries", req.id, `Recovery request cancelled: ${reason}`);
    this.save();
    return req;
  }

  reopenRecoveryRequest(requestId, reopenDetails = {}) {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const now = new Date().toISOString();
    const prevStatus = req.responseStatus;
    req.responseStatus = "Pending Carrier Response";
    req.updatedAt = now;
    if (reopenDetails.newCarrierId) {
      const carrier = this.getCarrier(reopenDetails.newCarrierId);
      req.requestedCarrierId = reopenDetails.newCarrierId;
      req.requestedCarrierName = carrier ? carrier.name : reopenDetails.newCarrierId;
    }
    if (reopenDetails.recoveryStrategy) req.recoveryStrategy = reopenDetails.recoveryStrategy;
    if (reopenDetails.notes) req.operationalNotes = (req.operationalNotes || '') + ' | Reopened: ' + reopenDetails.notes;
    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: reopenDetails.actor || "Control Tower Analyst",
      action: "Recovery Reopened / Resubmitted",
      note: reopenDetails.notes || `Reopened recovery from ${prevStatus}. Tender re-issued to ${req.requestedCarrierName}.`
    });
    const exc = this.getException(req.exceptionId);
    if (exc) {
      exc.status = 'Recovery in Progress';
      exc.recoveryRequestId = req.id;
    }
    this.logAudit("Recovery Reopened", "Recoveries", req.id, `Recovery reopened from ${prevStatus} to Pending Carrier Response.`);
    this.save();
    return req;
  }

  resendRecoveryRequest(requestId, notes = '') {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const now = new Date().toISOString();
    const prevStatus = req.responseStatus;
    req.responseStatus = "Pending Carrier Response";
    req.rejectionReason = null;
    req.updatedAt = now;
    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner",
      action: "Recovery Tender Resent",
      note: notes || `Recovery tender re-transmitted to carrier ${req.requestedCarrierName || 'Dispatch'}. Expiration reset to 60 minutes.`
    });
    this.logAudit("Recovery Tender Resent", "Recoveries", req.id, `Tender resent to ${req.requestedCarrierName}.`);
    this.save();
    return req;
  }

  changeRecoveryCarrier(requestId, newCarrierId, newCarrierName = '', reason = '') {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const carrier = this.getCarrier(newCarrierId);
    const targetCarrierName = carrier ? carrier.name : (newCarrierName || newCarrierId);
    const prevCarrier = req.requestedCarrierName;
    const now = new Date().toISOString();

    req.requestedCarrierId = newCarrierId;
    req.requestedCarrierName = targetCarrierName;
    req.responseStatus = "Pending Carrier Response";
    req.rejectionReason = null;
    req.assignedVehicleId = null;
    req.assignedDriverName = null;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner",
      action: "Alternate Carrier Assigned",
      note: reason || `Carrier switched from ${prevCarrier} to ${targetCarrierName}. Re-tender dispatched.`
    });

    this.logAudit("Carrier Reassigned", "Recoveries", req.id, `Switched carrier to ${targetCarrierName} (${reason || 'Post-rejection re-dispatch'}).`);
    this.save();
    return req;
  }

  reviseRecoveryRequest(requestId, revisions = {}) {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const now = new Date().toISOString();

    if (revisions.recoveryStrategy) req.recoveryStrategy = revisions.recoveryStrategy;
    if (revisions.operationalNotes) req.operationalNotes = revisions.operationalNotes;
    if (revisions.expectedEtaImpact) req.expectedEtaImpact = revisions.expectedEtaImpact;
    if (revisions.proposedRoute) req.proposedRoute = revisions.proposedRoute;
    if (revisions.expediteUrgency) req.expediteUrgency = revisions.expediteUrgency;
    if (revisions.requestedCarrierId) {
      req.requestedCarrierId = revisions.requestedCarrierId;
      const c = this.getCarrier(revisions.requestedCarrierId);
      if (c) req.requestedCarrierName = c.name;
    }

    req.responseStatus = "Pending Carrier Response";
    req.rejectionReason = null;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner",
      action: "Recovery Terms Revised",
      note: revisions.reason || "Revised recovery terms and re-submitted to carrier dispatch."
    });

    this.logAudit("Recovery Revised", "Recoveries", req.id, `Revised recovery terms: ${revisions.reason || 'Parameters updated'}.`);
    this.save();
    return req;
  }

  triggerRecoveryNotification(shipmentId, notifData = {}) {
    const shipment = this.getShipment(shipmentId);
    const now = new Date().toISOString();
    const actor = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner";

    const newNotif = {
      id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      shipmentId,
      audience: notifData.audience || "Customer & Warehouse",
      channel: notifData.channel || "Multi-Channel (Email + SMS + EDI)",
      subject: notifData.subject || `Delivery Recovery Alert for Shipment ${shipmentId}`,
      message: notifData.message || `Operational recovery in progress. Revised ETA confirmed.`,
      status: "Sent",
      timestamp: now,
      sentBy: actor
    };

    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(newNotif);

    if (shipment) {
      if (!shipment.milestones) shipment.milestones = [];
      shipment.milestones.push({
        status: "Notification Dispatched",
        timestamp: now,
        notes: `Alert sent to ${newNotif.audience} via ${newNotif.channel}: "${newNotif.subject}"`
      });
    }

    this.logAudit("Notification Sent", "Communications", shipmentId, `Sent ${newNotif.channel} alert to ${newNotif.audience}.`);
    this.save();
    return newNotif;
  }

  // --- EXCEPTION APPROVALS & DECISION OVERRIDES ---
  getExceptionApprovals(status = 'All') {
    const list = this.data.exceptionApprovals || [];
    if (!status || status === 'All') return list;
    return list.filter(a => a.status === status);
  }

  getExceptionApproval(id) {
    return (this.data.exceptionApprovals || []).find(a => a.id === id);
  }

  approveExceptionExecution(approvalId, notes = '', conditions = []) {
    const app = this.getExceptionApproval(approvalId);
    if (!app) throw new Error("Approval record not found.");
    const now = new Date().toISOString();
    const actor = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Operations Manager";

    app.status = 'Approved';
    app.decidedBy = actor;
    app.decidedAt = now;
    app.decisionNotes = notes || 'Approved for operational recovery execution.';
    if (conditions && conditions.length > 0) {
      app.approvalConditions = conditions;
    }

    // Add audit entry
    if (!this.data.approvalAuditHistory) this.data.approvalAuditHistory = [];
    this.data.approvalAuditHistory.unshift({
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      action: "Recovery Approved",
      exceptionId: app.exceptionId,
      shipmentId: app.shipmentId,
      authorizedBy: actor,
      previousValue: "Pending Approval",
      newValue: `Approved (${app.proposedStrategy})`,
      conditions: app.approvalConditions || [],
      rationale: notes || `Approved recovery execution for ${app.proposedStrategy}.`
    });

    const exc = this.getException(app.exceptionId);
    if (exc) {
      exc.status = 'Approved for Execution';
      if (!exc.timeline) exc.timeline = [];
      exc.timeline.push({
        timestamp: now,
        actor,
        action: "Recovery Execution Approved",
        note: `Approved ${app.proposedStrategy}. Conditions: ${(app.approvalConditions || []).join('; ') || 'None'}. Notes: ${notes || 'Proceed with dispatch.'}`
      });
    }

    this.logAudit("Recovery Approved", "Approvals", app.id, `Approved by ${actor}.`);
    this.save();
    return app;
  }

  rejectExceptionProposal(approvalId, reason = '') {
    const app = this.getExceptionApproval(approvalId);
    if (!app) throw new Error("Approval record not found.");
    const now = new Date().toISOString();
    const actor = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Operations Manager";

    app.status = 'Rejected';
    app.decidedBy = actor;
    app.decidedAt = now;
    app.rejectionReason = reason || 'Proposal cost exceeds allowable operating recovery threshold.';

    // Add audit entry
    if (!this.data.approvalAuditHistory) this.data.approvalAuditHistory = [];
    this.data.approvalAuditHistory.unshift({
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      action: "Recovery Proposal Rejected",
      exceptionId: app.exceptionId,
      shipmentId: app.shipmentId,
      authorizedBy: actor,
      previousValue: "Pending Approval",
      newValue: "Rejected",
      conditions: [],
      rationale: app.rejectionReason
    });

    const exc = this.getException(app.exceptionId);
    if (exc) {
      exc.status = 'Investigating';
      if (!exc.timeline) exc.timeline = [];
      exc.timeline.push({
        timestamp: now,
        actor,
        action: "Recovery Proposal Rejected",
        note: `Proposal rejected: ${app.rejectionReason}. Requires alternative recovery approach.`
      });
    }

    this.logAudit("Recovery Proposal Rejected", "Approvals", app.id, `Rejected by ${actor}: ${reason}`);
    this.save();
    return app;
  }

  requestMoreInfoForApproval(approvalId, inquiry = '') {
    const app = this.getExceptionApproval(approvalId);
    if (!app) throw new Error("Approval record not found.");
    const now = new Date().toISOString();
    const actor = window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Operations Manager";

    app.status = 'Info Requested';
    app.inquiry = inquiry || 'Please provide telematics proof and confirmation of carrier capacity.';
    app.updatedAt = now;

    const exc = this.getException(app.exceptionId);
    if (exc) {
      if (!exc.timeline) exc.timeline = [];
      exc.timeline.push({
        timestamp: now,
        actor,
        action: "More Information Requested",
        note: `Inquiry before recovery approval: ${app.inquiry}`
      });
    }

    this.logAudit("Approval Info Requested", "Approvals", app.id, `Inquiry by ${actor}: ${inquiry}`);
    this.save();
    return app;
  }

  overrideDecision(exceptionId, overrideData = {}) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");
    const now = new Date().toISOString();
    const actor = overrideData.authorizedBy || (window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser() ? `${window.BRIDGES_AUTH.getCurrentUser().name} (${window.BRIDGES_AUTH.getCurrentUser().role})` : "Dispatcher / Transport Planner");

    const prevSeverity = exc.severity;
    const prevPriority = exc.priority || 'P2';
    const newSeverity = overrideData.newSeverity || exc.severity;
    const newPriority = overrideData.newPriority || prevPriority;
    const rationale = overrideData.overrideReason || "Operational decision override applied by authorized dispatcher.";
    const conditions = overrideData.approvalConditions || [];

    exc.severity = newSeverity;
    exc.priority = newPriority;
    exc.decisionOverride = {
      overriddenBy: actor,
      overriddenAt: now,
      previousSeverity: prevSeverity,
      newSeverity,
      previousPriority: prevPriority,
      newPriority,
      rationale,
      conditions
    };

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor,
      action: "Decision Override Applied",
      note: `Severity: ${prevSeverity} → ${newSeverity} | Priority: ${prevPriority} → ${newPriority}. Rationale: ${rationale}. Conditions: ${conditions.join(', ') || 'None'}`
    });

    if (!this.data.approvalAuditHistory) this.data.approvalAuditHistory = [];
    this.data.approvalAuditHistory.unshift({
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      action: `Decision Override (${newSeverity !== prevSeverity ? 'Severity' : 'Priority'})`,
      exceptionId: exc.id,
      shipmentId: exc.shipmentId,
      authorizedBy: actor,
      previousValue: `Severity: ${prevSeverity} | Priority: ${prevPriority}`,
      newValue: `Severity: ${newSeverity} | Priority: ${newPriority}`,
      conditions,
      rationale
    });

    this.logAudit("Decision Override", "Governance", exc.id, `Severity updated to ${newSeverity}, Priority to ${newPriority}.`);
    this.save();
    return exc;
  }

  getApprovalAuditHistory() {
    return (this.data.approvalAuditHistory || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // --- EXCEPTION LIFECYCLE (US-21, US-31, US-40 to US-43) ---
  takeOwnership(exceptionId, user = null) {
    const exception = this.getException(exceptionId);
    if (!exception) throw new Error("Exception not found.");

    const analystName = user ? `${user.name} (${user.role})` : "Sarah Lin (Control Tower)";
    
    // Prevent accidental duplicate ownership
    if (exception.assignedAnalyst === analystName) {
      return exception;
    }

    exception.assignedAnalyst = analystName;
    if (exception.status === "Open") {
      exception.status = "Assigned";
    }

    if (!exception.timeline) exception.timeline = [];
    exception.timeline.push({
      timestamp: new Date().toISOString(),
      actor: analystName,
      action: "Ownership Assigned",
      note: `Analyst took operational ownership of exception ${exceptionId}.`
    });

    this.logAudit("Ownership Taken", "Exceptions", exceptionId, `Assigned to ${analystName}.`);
    this.save();
    return exception;
  }

  reassignException(exceptionId, analystName) {
    const exception = this.getException(exceptionId);
    if (!exception) throw new Error("Exception not found.");

    exception.assignedAnalyst = analystName;
    if (!exception.timeline) exception.timeline = [];
    exception.timeline.push({
      timestamp: new Date().toISOString(),
      actor: "Sarah Lin (Control Tower)",
      action: "Analyst Reassigned",
      note: `Reassigned exception to ${analystName}.`
    });

    this.logAudit("Exception Reassigned", "Exceptions", exceptionId, `Reassigned to ${analystName}.`);
    this.save();
    return exception;
  }

  reopenException(exceptionId, reason) {
    const exception = this.getException(exceptionId);
    if (!exception) throw new Error("Exception not found.");

    if (!reason || !reason.trim()) {
      throw new Error("A specific operational reason is required to reopen an exception.");
    }

    exception.status = "Reopened";
    exception.reopenReason = reason.trim();
    if (!exception.timeline) exception.timeline = [];
    exception.timeline.push({
      timestamp: new Date().toISOString(),
      actor: "Sarah Lin (Control Tower)",
      action: "Exception Reopened",
      note: `Reopened exception: ${reason.trim()}`
    });

    this.logAudit("Exception Reopened", "Exceptions", exceptionId, `Reopened: ${reason.trim()}`);
    this.save();
    return exception;
  }

  closeException(exceptionId, resolutionData) {
    const exception = this.getException(exceptionId);
    if (!exception) throw new Error("Exception not found.");

    // Closure Validation: verify delivery confirmation or recovery completion
    const shipment = this.getShipment(exception.shipmentId);
    const linkedRecovery = exception.recoveryRequestId ? this.getRecoveryRequest(exception.recoveryRequestId) : null;
    
    const isShipmentDelivered = shipment && shipment.status === "Delivered";
    const isRecoverySatisfied = linkedRecovery && ["Accepted", "Completed"].includes(linkedRecovery.responseStatus);

    if (!isShipmentDelivered && !isRecoverySatisfied && !resolutionData.overrideVerification) {
      throw new Error(
        "Cannot close exception: delivery confirmation or verified recovery completion is required before closing an operational exception."
      );
    }

    if (!resolutionData.summary || !resolutionData.summary.trim()) {
      throw new Error("Final resolution summary is required.");
    }
    if (!resolutionData.rootCause || !resolutionData.rootCause.trim()) {
      throw new Error("Final root cause classification is required.");
    }

    const timestamp = new Date().toISOString();
    exception.status = "Closed";
    exception.rootCause = resolutionData.rootCause.trim();
    exception.resolvedAt = exception.resolvedAt || timestamp;
    exception.finalResolution = {
      rootCause: resolutionData.rootCause.trim(),
      recoveryStrategy: resolutionData.recoveryStrategy || "Operational Intervention",
      summary: resolutionData.summary.trim(),
      deliveryOutcome: resolutionData.deliveryOutcome || "Delivered",
      slaOutcome: resolutionData.slaOutcome || "Preserved",
      finalEta: resolutionData.finalEta || shipment?.actualArrival || timestamp,
      additionalNotes: resolutionData.additionalNotes ? resolutionData.additionalNotes.trim() : null,
      closedBy: resolutionData.closedBy || "Sarah Lin (Control Tower)",
      closedAt: timestamp
    };

    if (!exception.timeline) exception.timeline = [];
    exception.timeline.push({
      timestamp,
      actor: resolutionData.closedBy || "Sarah Lin (Control Tower)",
      action: "Exception Closed",
      note: `Final resolution: ${resolutionData.summary.trim()}`
    });

    this.logAudit("Exception Closed", "Exceptions", exceptionId, `Closed with strategy: ${exception.finalResolution.recoveryStrategy}`);
    this.save();
    return exception;
  }

  addCoordinationNote(exceptionId, noteText, author = "Sarah Lin") {
    const exception = this.getException(exceptionId);
    if (!exception) throw new Error("Exception not found.");

    if (!noteText || !noteText.trim()) throw new Error("Note text cannot be empty.");

    const entry = {
      timestamp: new Date().toISOString(),
      author: author || "Sarah Lin",
      note: noteText.trim()
    };

    if (!exception.coordinationNotes) exception.coordinationNotes = [];
    exception.coordinationNotes.unshift(entry);

    if (!exception.timeline) exception.timeline = [];
    exception.timeline.push({
      timestamp: entry.timestamp,
      actor: entry.author,
      action: "War Room Note Added",
      note: entry.note
    });

    this.save();
    return entry;
  }

  // Dynamic Calculated Statistics for Analyst Role (US-17 to US-30)
  getAnalystMetrics() {
    const shipments = this.getShipments();
    const exceptions = this.getExceptions();
    const recoveries = this.data.recoveryRequests || [];

    // Active Shipments: On Route, Loading, Delayed
    const activeShipments = shipments.filter(s => ['On Route', 'Loading', 'Delayed'].includes(s.status)).length;

    // Open Exceptions: Open, Assigned, Investigating, Recovery in Progress, Reopened
    const openExceptions = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status)
    ).length;

    // Critical Exceptions: Open with severity === 'Critical'
    const criticalExceptions = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status) &&
      e.severity === 'Critical'
    ).length;

    // SLA at Risk: open exceptions with High or Critical SLA risk
    const slaAtRisk = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Recovery in Progress', 'Reopened'].includes(e.status) &&
      ['High', 'Critical'].includes(e.slaRisk)
    ).length;

    // Recoveries in Progress: Pending Carrier Response, Accepted, In Progress
    const recoveriesInProgress = recoveries.filter(r => 
      ['Pending Carrier Response', 'Accepted', 'In Progress'].includes(r.responseStatus)
    ).length;

    // Resolved Today: Resolved or Closed exceptions
    const resolvedToday = exceptions.filter(e => ['Resolved', 'Closed'].includes(e.status)).length;

    return {
      activeShipments,
      openExceptions,
      criticalExceptions,
      slaAtRisk,
      recoveriesInProgress,
      resolvedToday
    };
  }

  // --- ESCALATIONS (US-56) ---
  getEscalations(filter = null) {
    const list = this.data.escalations || [];
    if (!filter) return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.filter(esc => {
      if (filter.status && filter.status !== 'All' && esc.status !== filter.status) return false;
      if (filter.priority && filter.priority !== 'All' && esc.priority !== filter.priority) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getEscalation(id) {
    return (this.data.escalations || []).find(e => e.id === id);
  }

  createEscalation(data) {
    if (!data.exceptionId) throw new Error("Linked Exception ID is required.");
    if (!data.shipmentId) throw new Error("Linked Shipment ID is required.");
    if (!data.escalationReason || !data.escalationReason.trim()) throw new Error("Escalation reason is required.");
    if (!data.businessImpact || !data.businessImpact.trim()) throw new Error("Business impact is required.");
    if (!data.requestedIntervention || !data.requestedIntervention.trim()) throw new Error("Requested intervention is required.");

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Elena Rostova (Dispatcher)";

    const newEsc = {
      id: `ESC-${Math.floor(4000 + Math.random() * 6000)}`,
      exceptionId: data.exceptionId,
      shipmentId: data.shipmentId,
      escalationReason: data.escalationReason.trim(),
      businessImpact: data.businessImpact.trim(),
      currentRecoveryStatus: data.currentRecoveryStatus || "Pending Action",
      actionsAttempted: data.actionsAttempted ? data.actionsAttempted.trim() : "Initial operational triage and recovery review completed.",
      requestedIntervention: data.requestedIntervention.trim(),
      priority: data.priority || "High",
      status: "Open",
      escalatedBy: authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          author: authorName,
          note: `Escalation filed: ${data.escalationReason.trim()} [Priority: ${data.priority || 'High'}]`
        }
      ]
    };

    if (!this.data.escalations) this.data.escalations = [];
    this.data.escalations.unshift(newEsc);

    // Update exception status to Escalated if not resolved
    const exception = this.getException(data.exceptionId);
    if (exception && exception.status !== 'Resolved' && exception.status !== 'Closed') {
      exception.status = "Escalated";
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: new Date().toISOString(),
        actor: authorName,
        action: "Escalated",
        note: `Operational escalation ${newEsc.id} submitted. Reason: ${newEsc.escalationReason}`
      });
    }

    this.logAudit("Operational Escalation", "Escalations", newEsc.id, `Escalation created for ${data.exceptionId} (${data.shipmentId}). Priority: ${newEsc.priority}`);
    this.save();
    return newEsc;
  }

  updateEscalationStatus(id, newStatus, note = '') {
    const esc = this.getEscalation(id);
    if (!esc) throw new Error("Escalation record not found.");
    esc.status = newStatus;
    esc.updatedAt = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Lead Dispatcher";
    if (!esc.timeline) esc.timeline = [];
    esc.timeline.push({
      timestamp: new Date().toISOString(),
      author: authorName,
      note: note || `Escalation status transitioned to ${newStatus}.`
    });

    this.logAudit("Escalation Updated", "Escalations", esc.id, `Status transitioned to ${newStatus}.`);
    this.save();
    return esc;
  }

  // --- RECOVERY UPDATE FOR DISPATCHER ---
  updateRecoveryRequest(id, updates) {
    const req = this.getRecoveryRequest(id);
    if (!req) throw new Error("Recovery request not found.");

    Object.assign(req, updates, { updatedAt: new Date().toISOString() });
    this.logAudit("Recovery Request Updated", "Recoveries", req.id, `Updated parameters for strategy ${req.recoveryStrategy}.`);
    this.save();
    return req;
  }

  // Dynamic Calculated Statistics for Dispatcher / Planner Role (US-44 to US-57)
  getDispatcherMetrics() {
    const exceptions = this.getExceptions();
    const recoveryRequests = this.getRecoveryRequests();
    const shipments = this.getShipments();
    const escalations = this.getEscalations();

    // 1. Exceptions Requiring Action (Open, Assigned, Investigating, Recovery in Progress, Escalated)
    const actionableExceptions = exceptions.filter(e => 
      ['Open', 'Assigned', 'Investigating', 'Under Investigation', 'Recovery in Progress', 'Escalated'].includes(e.status)
    ).length;

    // 2. Critical Exceptions (severity Critical and active)
    const criticalExceptions = exceptions.filter(e => 
      e.severity === 'Critical' && e.status !== 'Resolved' && e.status !== 'Closed'
    ).length;

    // 3. Pending Carrier Responses
    const pendingCarrierResponses = recoveryRequests.filter(r => 
      r.responseStatus === 'Pending Carrier Response'
    ).length;

    // 4. Recoveries in Progress
    const recoveriesInProgress = recoveryRequests.filter(r => 
      ['In Progress', 'Accepted'].includes(r.responseStatus)
    ).length;

    // 5. SLA-at-Risk Shipments
    const slaAtRiskShipments = shipments.filter(s => 
      (s.slaRisk === true || s.status === 'Delayed') && s.status !== 'Delivered'
    ).length;

    // 6. Escalations
    const activeEscalations = escalations.filter(e => 
      e.status !== 'Resolved'
    ).length;

    // Recovery Status Overview counts
    const recoveryStatusCounts = {
      awaitingCarrier: recoveryRequests.filter(r => r.responseStatus === 'Pending Carrier Response').length,
      accepted: recoveryRequests.filter(r => r.responseStatus === 'Accepted').length,
      rejected: recoveryRequests.filter(r => r.responseStatus === 'Rejected').length,
      inProgress: recoveryRequests.filter(r => r.responseStatus === 'In Progress').length,
      completed: recoveryRequests.filter(r => r.responseStatus === 'Completed').length,
      failed: recoveryRequests.filter(r => r.responseStatus === 'Failed').length
    };

    return {
      actionableExceptions,
      criticalExceptions,
      pendingCarrierResponses,
      recoveriesInProgress,
      slaAtRiskShipments,
      activeEscalations,
      recoveryStatusCounts
    };
  }

  // ==========================================
  // PHASE 4: CARRIER OPERATIONS API (US-58 to US-78)
  // ==========================================

  getCurrentCarrierId() {
    if (typeof window !== 'undefined' && window.BRIDGES_AUTH && typeof window.BRIDGES_AUTH.getCurrentCarrierId === 'function') {
      return window.BRIDGES_AUTH.getCurrentCarrierId() || 'CAR-01';
    }
    return 'CAR-01';
  }

  getCarrierRecoveryRequests(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    const list = this.data.recoveryRequests || [];
    return list.filter(r => {
      if (r.requestedCarrierId === targetCarrierId) return true;
      const sh = this.getShipment(r.shipmentId);
      return sh && (sh.carrierId === targetCarrierId || sh.carrier === 'Bridges Global Logistics');
    }).sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
  }

  getCarrierShipments(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    const carrierObj = this.getCarrier(targetCarrierId);
    const carrierName = carrierObj ? carrierObj.name : 'Bridges Global Logistics';
    const recs = this.data.recoveryRequests || [];
    const recShipmentIds = new Set(
      recs.filter(r => r.requestedCarrierId === targetCarrierId).map(r => r.shipmentId)
    );

    return (this.data.shipments || []).filter(s => {
      return s.carrierId === targetCarrierId || 
             s.carrier === carrierName || 
             recShipmentIds.has(s.id);
    }).sort((a, b) => new Date(b.createdDate || b.date || 0) - new Date(a.createdDate || a.date || 0));
  }

  getCarrierVehicles(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    return (this.data.resources || []).filter(r => 
      r.type === 'Vehicle' && (r.carrierId === targetCarrierId || (!r.carrierId && targetCarrierId === 'CAR-01'))
    );
  }

  getCarrierDrivers(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    return (this.data.resources || []).filter(r => 
      r.type === 'Driver' && (r.carrierId === targetCarrierId || (!r.carrierId && targetCarrierId === 'CAR-01'))
    );
  }

  getCarrierDisruptions(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    return (this.data.disruptions || []).filter(d => 
      d.carrierId === targetCarrierId || (!d.carrierId && targetCarrierId === 'CAR-01')
    ).sort((a, b) => new Date(b.reportedAt || b.occurrenceTime) - new Date(a.reportedAt || a.occurrenceTime));
  }

  getCarrierNotifications(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    return (this.data.notifications || []).filter(n => 
      n.carrierId === targetCarrierId || !n.carrierId || targetCarrierId === 'CAR-01'
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  markCarrierNotificationRead(notifId) {
    const notifs = this.data.notifications || [];
    const target = notifs.find(n => n.id === notifId);
    if (target) {
      target.read = true;
      this.save();
    }
    return target;
  }

  markAllCarrierNotificationsRead(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    (this.data.notifications || []).forEach(n => {
      if (n.carrierId === targetCarrierId || !n.carrierId) {
        n.read = true;
      }
    });
    this.save();
  }

  getCarrierActivityHistory(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    return (this.data.carrierActivity || []).filter(a => 
      a.carrierId === targetCarrierId || (!a.carrierId && targetCarrierId === 'CAR-01')
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  logCarrierActivity(action, details = {}) {
    const targetCarrierId = details.carrierId || this.getCurrentCarrierId();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? user.name : 'Marcus Vance (Carrier Dispatch)';
    
    if (!this.data.carrierActivity) this.data.carrierActivity = [];

    const activityEntry = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      carrierId: targetCarrierId,
      user: authorName,
      shipmentId: details.shipmentId || null,
      recoveryRequestId: details.recoveryRequestId || null,
      action: action,
      outcome: details.outcome || ''
    };

    this.data.carrierActivity.unshift(activityEntry);
    this.save();
    return activityEntry;
  }

  getCarrierMetrics(carrierId = null) {
    const targetCarrierId = carrierId || this.getCurrentCarrierId();
    const reqs = this.getCarrierRecoveryRequests(targetCarrierId);
    const shipments = this.getCarrierShipments(targetCarrierId);
    const vehicles = this.getCarrierVehicles(targetCarrierId);
    const drivers = this.getCarrierDrivers(targetCarrierId);
    const disruptions = this.getCarrierDisruptions(targetCarrierId);

    // 1. Pending Assignment Requests
    const pendingAssignmentRequests = reqs.filter(r => r.responseStatus === 'Pending Carrier Response').length;

    // 2. Accepted Requests (awaiting resource assignment or dispatch)
    const acceptedRequests = reqs.filter(r => r.responseStatus === 'Accepted').length;

    // 3. Active Recoveries (In Progress)
    const activeRecoveries = reqs.filter(r => r.responseStatus === 'In Progress').length;

    // 4. Available Vehicles
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;

    // 5. Available Drivers
    const availableDrivers = drivers.filter(d => d.status === 'Available').length;

    // 6. Deliveries Completed
    const completedRecoveries = reqs.filter(r => r.responseStatus === 'Completed').length;
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered').length;
    const deliveriesCompleted = Math.max(completedRecoveries, deliveredShipments);

    // Dynamic Operational Alerts
    const operationalAlerts = [];

    // Alert 1: Requests awaiting response
    if (pendingAssignmentRequests > 0) {
      operationalAlerts.push({
        type: 'warning',
        title: `${pendingAssignmentRequests} Request${pendingAssignmentRequests > 1 ? 's' : ''} Awaiting Response`,
        desc: 'New recovery requests from Dispatcher require immediate review and acceptance/rejection.',
        targetPage: 'carrier_requests',
        badge: 'Action Required',
        severity: 'high'
      });
    }

    // Alert 2: Rejected requests
    const rejectedCount = reqs.filter(r => r.responseStatus === 'Rejected').length;
    if (rejectedCount > 0) {
      operationalAlerts.push({
        type: 'danger',
        title: `${rejectedCount} Request${rejectedCount > 1 ? 's' : ''} Rejected or Unserviceable`,
        desc: 'Capacity or constraint restrictions logged. Operational review flagged.',
        targetPage: 'carrier_requests',
        badge: 'Rejected',
        severity: 'critical'
      });
    }

    // Alert 3: Resource availability warnings
    if (availableVehicles <= 1 || availableDrivers <= 1) {
      operationalAlerts.push({
        type: 'danger',
        title: `Low Fleet / Driver Availability (${availableVehicles} Vehicles, ${availableDrivers} Drivers)`,
        desc: 'Carrier available reserve capacity is running low. Maintenance or rest cycles should be checked.',
        targetPage: 'carrier_vehicles',
        badge: 'Capacity Alert',
        severity: 'critical'
      });
    }

    // Alert 4: Shipment delays or SLA risks
    const delayedShipments = shipments.filter(s => s.status === 'Delayed' || s.slaRisk === true);
    if (delayedShipments.length > 0) {
      operationalAlerts.push({
        type: 'warning',
        title: `${delayedShipments.length} Active Shipment${delayedShipments.length > 1 ? 's' : ''} Delayed / SLA at Risk`,
        desc: 'Transit milestones slipping behind schedule. Milestone update or revised ETA required.',
        targetPage: 'carrier_shipments',
        badge: 'SLA Risk',
        severity: 'high'
      });
    }

    // Alert 5: Active disruptions
    const activeDisruptions = disruptions.filter(d => d.status === 'Active');
    if (activeDisruptions.length > 0) {
      operationalAlerts.push({
        type: 'danger',
        title: `${activeDisruptions.length} Active Disruption${activeDisruptions.length > 1 ? 's' : ''} Reported`,
        desc: 'Mechanical breakdown, weather hold, or highway closure requires ongoing monitoring.',
        targetPage: 'carrier_disruptions',
        badge: 'Disruption Active',
        severity: 'critical'
      });
    }

    // Alert 6: Delivery confirmations pending
    const pendingDeliveries = shipments.filter(s => 
      ['Arrived at Destination', 'Out for Delivery'].includes(s.status) && s.status !== 'Delivered'
    );
    if (pendingDeliveries.length > 0) {
      operationalAlerts.push({
        type: 'info',
        title: `${pendingDeliveries.length} Delivery Confirmation${pendingDeliveries.length > 1 ? 's' : ''} Pending`,
        desc: 'Shipments arrived at destination receiving dock. POD receipt and sign-off required.',
        targetPage: 'carrier_delivery',
        badge: 'POD Required',
        severity: 'normal'
      });
    }

    return {
      pendingAssignmentRequests,
      acceptedRequests,
      activeRecoveries,
      availableVehicles,
      availableDrivers,
      deliveriesCompleted,
      operationalAlerts
    };
  }

  // --- Carrier Request Actions (US-61, US-62, US-63) ---
  acceptRecoveryRequest(requestId, userNotes = '') {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const actionableStatuses = ['Pending Carrier Response', 'Revised', 'Info Requested'];
    if (!actionableStatuses.includes(req.responseStatus)) {
      throw new Error(`Cannot accept request in status '${req.responseStatus}'. Only pending or revised requests can be accepted.`);
    }

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";
    const now = new Date().toISOString();

    req.responseStatus = "Accepted";
    req.acceptedAt = now;
    req.acceptedBy = authorName;
    req.carrierOperationalNotes = userNotes;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Recovery Request Accepted",
      note: `Carrier accepted recovery request. ${userNotes ? 'Notes: ' + userNotes : 'Ready for vehicle and driver assignment.'}`
    });

    // Update exception timeline
    const exception = this.getException(req.exceptionId);
    if (exception) {
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Accepted Recovery",
        note: `Carrier accepted recovery request ${req.id} (${req.recoveryStrategy}). Resource assignment pending.`
      });
    }

    // Update shipment timeline
    const shipment = this.getShipment(req.shipmentId);
    if (shipment) {
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Accepted Recovery Request",
        note: `Assigned carrier confirmed capacity to execute recovery plan ${req.id}.`
      });
    }

    // Log Carrier Activity
    this.logCarrierActivity("Recovery Request Accepted", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Accepted ${req.recoveryStrategy} recovery. Awaiting fleet dispatch.`
    });

    this.logAudit("Recovery Accepted", "Carrier Recoveries", req.id, `Carrier accepted recovery request for ${req.shipmentId}.`);
    this.save();
    return req;
  }

  rejectRecoveryRequest(requestId, reason) {
    if (!reason || !reason.trim()) {
      throw new Error("A valid rejection reason is mandatory.");
    }

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    const actionableStatuses = ['Pending Carrier Response', 'Revised', 'Info Requested'];
    if (!actionableStatuses.includes(req.responseStatus)) {
      throw new Error(`Cannot reject request in status '${req.responseStatus}'. Only pending or revised requests can be rejected.`);
    }

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";
    const now = new Date().toISOString();

    req.responseStatus = "Rejected";
    req.rejectionReason = reason.trim();
    req.rejectedAt = now;
    req.rejectedBy = authorName;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Recovery Request Rejected",
      note: `Carrier rejected request. Reason: ${reason.trim()}`
    });

    // Update exception timeline
    const exception = this.getException(req.exceptionId);
    if (exception) {
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Rejected Recovery",
        note: `Carrier rejected request ${req.id}. Reason: ${reason.trim()}`
      });
    }

    // Update shipment timeline
    const shipment = this.getShipment(req.shipmentId);
    if (shipment) {
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Rejected Recovery",
        note: `Carrier declined recovery request ${req.id}: ${reason.trim()}`
      });
    }

    // Log Carrier Activity
    this.logCarrierActivity("Recovery Request Rejected", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Declined ${req.recoveryStrategy} recovery: ${reason.trim()}`
    });

    this.logAudit("Recovery Rejected", "Carrier Recoveries", req.id, `Carrier rejected recovery: ${reason.trim()}`);
    this.save();
    return req;
  }

  // --- Assign Vehicle & Driver (US-66, US-69, US-70) ---
  assignResourcesToRecovery(requestId, { vehicleId, driverId, expectedPickupTime, expectedDeliveryTime, operationalNotes = '' }) {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    if (req.responseStatus !== 'Accepted' && req.responseStatus !== 'In Progress') {
      throw new Error(`Cannot assign resources in status '${req.responseStatus}'. Request must be Accepted first.`);
    }

    if (!vehicleId) throw new Error("Vehicle selection is required.");
    if (!driverId) throw new Error("Driver selection is required.");
    if (!expectedPickupTime) throw new Error("Expected pickup time is required.");
    if (!expectedDeliveryTime) throw new Error("Expected delivery time is required.");

    const vehicle = (this.data.resources || []).find(r => r.id === vehicleId && r.type === 'Vehicle');
    if (!vehicle) throw new Error("Selected vehicle was not found.");
    if (vehicle.status !== 'Available' && vehicle.currentAssignment !== requestId) {
      throw new Error(`Vehicle ${vehicle.name} (${vehicle.plateNumber}) is currently ${vehicle.status}. Only Available vehicles can be assigned.`);
    }

    const driver = (this.data.resources || []).find(r => r.id === driverId && r.type === 'Driver');
    if (!driver) throw new Error("Selected driver was not found.");
    if (driver.status !== 'Available' && driver.currentAssignment !== requestId) {
      throw new Error(`Driver ${driver.name} is currently ${driver.status}. Only Available drivers can be assigned.`);
    }

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    // Update vehicle and driver resource states
    vehicle.status = 'Assigned';
    vehicle.currentAssignment = req.id;
    vehicle.assignedShipmentId = req.shipmentId;
    if (!vehicle.assignmentHistory) vehicle.assignmentHistory = [];
    vehicle.assignmentHistory.unshift({
      recoveryRequestId: req.id,
      shipmentId: req.shipmentId,
      assignedAt: now,
      driverName: driver.name,
      notes: operationalNotes
    });

    driver.status = 'Assigned';
    driver.currentAssignment = req.id;
    driver.assignedShipmentId = req.shipmentId;
    driver.currentVehicle = `${vehicle.name} (${vehicle.plateNumber})`;
    if (!driver.assignmentHistory) driver.assignmentHistory = [];
    driver.assignmentHistory.unshift({
      recoveryRequestId: req.id,
      shipmentId: req.shipmentId,
      assignedAt: now,
      vehicleName: vehicle.name,
      notes: operationalNotes
    });

    // Update request
    req.assignedVehicleId = vehicle.id;
    req.assignedVehiclePlate = vehicle.plateNumber;
    req.assignedVehicleName = vehicle.name;
    req.assignedDriverId = driver.id;
    req.assignedDriverName = driver.name;
    req.expectedPickupTime = expectedPickupTime;
    req.expectedDeliveryTime = expectedDeliveryTime;
    req.carrierOperationalNotes = operationalNotes;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Vehicle & Driver Assigned",
      note: `Assigned vehicle ${vehicle.name} (${vehicle.plateNumber}) and driver ${driver.name}. Pickup: ${expectedPickupTime}, Delivery: ${expectedDeliveryTime}.`
    });

    // Update shipment
    const shipment = this.getShipment(req.shipmentId);
    if (shipment) {
      shipment.assignedVehicle = `${vehicle.name} (${vehicle.plateNumber})`;
      shipment.assignedDriver = driver.name;
      shipment.expectedPickupTime = expectedPickupTime;
      shipment.expectedDeliveryTime = expectedDeliveryTime;
      if (!shipment.milestones) shipment.milestones = [];
      shipment.milestones.push({
        milestone: "Vehicle & Driver Assigned",
        timestamp: now,
        location: shipment.origin,
        notes: `Assigned ${vehicle.name} and driver ${driver.name}.`
      });
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Fleet Resources Assigned",
        note: `Carrier assigned ${vehicle.name} and driver ${driver.name}.`
      });
    }

    // Log Carrier Activity
    this.logCarrierActivity("Fleet Resources Assigned", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Bound vehicle ${vehicle.name} and driver ${driver.name}. Expected pickup: ${expectedPickupTime}.`
    });

    this.logAudit("Resources Assigned", "Carrier Recoveries", req.id, `Assigned ${vehicle.name} & driver ${driver.name} to ${req.shipmentId}.`);
    this.save();
    return req;
  }

  // --- Dispatch Confirmation (US-71) ---
  confirmDispatch(requestId, { operationalNotes = '' } = {}) {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    if (req.responseStatus !== 'Accepted') {
      throw new Error(`Cannot dispatch recovery in status '${req.responseStatus}'. Request must be in 'Accepted' state.`);
    }
    if (!req.assignedVehicleId || !req.assignedDriverName) {
      throw new Error("Cannot dispatch: Vehicle and driver assignments must be completed before dispatch.");
    }
    if (!req.expectedPickupTime || !req.expectedDeliveryTime) {
      throw new Error("Cannot dispatch: Expected pickup and delivery times are mandatory.");
    }

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    // Update request
    req.responseStatus = "In Progress";
    req.dispatchedAt = now;
    req.dispatchedBy = authorName;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Recovery Dispatched",
      note: `Fleet dispatch confirmed. Unit departed for recovery execution. ${operationalNotes ? 'Notes: ' + operationalNotes : ''}`
    });

    // Update resources to In Transit
    const vehicle = (this.data.resources || []).find(r => r.id === req.assignedVehicleId);
    if (vehicle) vehicle.status = 'In Transit';

    const driver = (this.data.resources || []).find(r => r.id === req.assignedDriverId || r.name === req.assignedDriverName);
    if (driver) driver.status = 'In Transit';

    // Update shipment operational status
    const shipment = this.getShipment(req.shipmentId);
    if (shipment) {
      shipment.status = "In Transit";
      shipment.operationalStatus = "Recovery In Transit";
      if (!shipment.milestones) shipment.milestones = [];
      shipment.milestones.push({
        milestone: "Departed",
        timestamp: now,
        location: shipment.origin,
        notes: `Carrier dispatched vehicle ${req.assignedVehiclePlate || req.assignedVehicleId}.`
      });
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Recovery Dispatched",
        note: `Carrier verified dispatch. Unit in transit with driver ${req.assignedDriverName}.`
      });
    }

    // Update Exception
    const exception = this.getException(req.exceptionId);
    if (exception) {
      exception.status = "Recovery in Progress";
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Recovery Dispatched",
        note: `Carrier confirmed dispatch of ${req.recoveryStrategy} operation.`
      });
    }

    // Log Carrier Activity
    this.logCarrierActivity("Dispatch Confirmed", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Carrier dispatched ${req.assignedVehicleName || 'vehicle'} with driver ${req.assignedDriverName}.`
    });

    this.logAudit("Dispatch Confirmed", "Carrier Recoveries", req.id, `Recovery dispatched for shipment ${req.shipmentId}.`);
    this.save();
    return req;
  }

  // --- Shipment Execution Milestones (US-71 to US-73) ---
  updateShipmentMilestone(shipmentId, milestoneName, { location = '', notes = '' } = {}) {
    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const allowedMilestones = [
      'Vehicle Assigned',
      'Driver Assigned',
      'Arrived at Pickup',
      'Pickup Completed',
      'Departed',
      'In Transit',
      'Arrived at Checkpoint',
      'Delay Reported',
      'Arrived at Destination',
      'Delivery Completed'
    ];

    if (!allowedMilestones.includes(milestoneName)) {
      throw new Error(`Invalid milestone '${milestoneName}'. Must be one of: ${allowedMilestones.join(', ')}`);
    }

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    if (!shipment.milestones) shipment.milestones = [];
    const milestoneEntry = {
      milestone: milestoneName,
      timestamp: now,
      location: location || shipment.currentLocation || shipment.origin,
      actor: authorName,
      notes: notes || ''
    };
    shipment.milestones.push(milestoneEntry);

    // Update shipment operational status
    if (milestoneName === 'Arrived at Destination') {
      shipment.status = 'Arrived at Destination';
    } else if (milestoneName === 'In Transit' || milestoneName === 'Departed' || milestoneName === 'Arrived at Checkpoint') {
      shipment.status = 'In Transit';
    } else if (milestoneName === 'Delay Reported') {
      shipment.status = 'Delayed';
      shipment.slaRisk = true;
    }

    if (location) {
      shipment.currentLocation = location;
    }

    if (!shipment.timeline) shipment.timeline = [];
    shipment.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Milestone: ${milestoneName}`,
      note: `Milestone recorded at ${milestoneEntry.location}. ${notes ? 'Notes: ' + notes : ''}`
    });

    // Log Carrier Activity
    this.logCarrierActivity(`Milestone: ${milestoneName}`, {
      shipmentId: shipment.id,
      outcome: `Recorded milestone '${milestoneName}' at ${milestoneEntry.location}.`
    });

    this.save();
    return shipment;
  }

  // --- ETA Updates (US-73) ---
  updateCarrierEta(shipmentId, { revisedEta, reason, currentLocation = '', operationalNotes = '' }) {
    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    if (!revisedEta || !revisedEta.trim()) {
      throw new Error("Revised ETA is required.");
    }
    if (!reason || !reason.trim()) {
      throw new Error("Reason for ETA revision is mandatory.");
    }

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";
    const previousEta = shipment.currentEta || shipment.eta || "Unknown";

    if (!shipment.etaHistory) shipment.etaHistory = [];
    shipment.etaHistory.push({
      timestamp: now,
      previousEta: previousEta,
      revisedEta: revisedEta.trim(),
      reason: reason.trim(),
      updatedBy: authorName,
      location: currentLocation || shipment.currentLocation,
      notes: operationalNotes
    });

    shipment.currentEta = revisedEta.trim();
    shipment.carrierConfirmedEta = revisedEta.trim();
    if (currentLocation) shipment.currentLocation = currentLocation;

    // Check SLA Risk: if revised ETA is past committedDeliveryTime
    if (shipment.committedDeliveryTime) {
      const revisedDate = new Date(revisedEta);
      const commitDate = new Date(shipment.committedDeliveryTime);
      if (!isNaN(revisedDate) && !isNaN(commitDate) && revisedDate > commitDate) {
        shipment.slaRisk = true;
        shipment.status = "Delayed";
      }
    }

    if (!shipment.timeline) shipment.timeline = [];
    shipment.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "ETA Revised by Carrier",
      note: `Carrier updated confirmed ETA from ${previousEta} to ${revisedEta}. Reason: ${reason.trim()}. ${operationalNotes ? 'Notes: ' + operationalNotes : ''}`
    });

    // Also update active recovery request if linked
    const recs = (this.data.recoveryRequests || []).filter(r => r.shipmentId === shipmentId && ['Accepted', 'In Progress'].includes(r.responseStatus));
    recs.forEach(r => {
      r.revisedEta = revisedEta.trim();
      if (!r.timeline) r.timeline = [];
      r.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Revised ETA",
        note: `ETA updated to ${revisedEta}. Reason: ${reason.trim()}`
      });
    });

    // Log Carrier Activity
    this.logCarrierActivity("ETA Updated", {
      shipmentId: shipment.id,
      outcome: `Revised ETA from ${previousEta} to ${revisedEta}. Reason: ${reason.trim()}.`
    });

    this.logAudit("Carrier ETA Update", "Carrier Operations", shipment.id, `Carrier confirmed ETA updated to ${revisedEta} (${reason.trim()}).`);
    this.save();
    return shipment;
  }

  // --- Disruption Reporting (US-72, US-73) ---
  reportDisruption({ shipmentId, recoveryRequestId = null, disruptionType, occurrenceTime, reportedLocation, description, operationalImpact, revisedEta = '', immediateActionTaken = '' }) {
    if (!shipmentId) throw new Error("Shipment ID is required.");
    if (!disruptionType) throw new Error("Disruption type is required.");
    if (!description || !description.trim()) throw new Error("Disruption description is required.");
    if (!operationalImpact) throw new Error("Operational impact assessment is required.");

    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Linked shipment not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";
    const carrierId = this.getCurrentCarrierId();

    const disruptionRecord = {
      id: `DIS-${Math.floor(1000 + Math.random() * 9000)}`,
      carrierId: carrierId,
      shipmentId: shipmentId,
      recoveryRequestId: recoveryRequestId || null,
      disruptionType: disruptionType,
      occurrenceTime: occurrenceTime || now,
      reportedLocation: reportedLocation || shipment.currentLocation || "En Route",
      description: description.trim(),
      operationalImpact: operationalImpact,
      revisedEta: revisedEta || null,
      immediateActionTaken: immediateActionTaken.trim() || "Driver safely parked on shoulder; notifying dispatch.",
      status: "Active",
      reportedAt: now,
      reportedBy: authorName
    };

    if (!this.data.disruptions) this.data.disruptions = [];
    this.data.disruptions.unshift(disruptionRecord);

    // Flag shipment for operational review
    shipment.disruptionReported = true;
    shipment.lastDisruptionType = disruptionType;
    shipment.status = "Delayed";
    shipment.slaRisk = true;
    if (revisedEta) {
      shipment.currentEta = revisedEta;
      shipment.carrierConfirmedEta = revisedEta;
    }

    if (!shipment.timeline) shipment.timeline = [];
    shipment.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Disruption Reported: ${disruptionType}`,
      note: `${description.trim()} Location: ${disruptionRecord.reportedLocation}. Impact: ${operationalImpact}. Action taken: ${disruptionRecord.immediateActionTaken}`
    });

    // If recovery request exists, add event
    if (recoveryRequestId) {
      const req = this.getRecoveryRequest(recoveryRequestId);
      if (req) {
        if (!req.timeline) req.timeline = [];
        req.timeline.push({
          timestamp: now,
          actor: authorName,
          action: `Disruption Reported: ${disruptionType}`,
          note: description.trim()
        });
      }
    }

    // Log Carrier Activity
    this.logCarrierActivity(`Disruption Reported: ${disruptionType}`, {
      shipmentId: shipment.id,
      recoveryRequestId: recoveryRequestId,
      outcome: `${disruptionType} logged at ${disruptionRecord.reportedLocation}. Impact: ${operationalImpact}.`
    });

    this.logAudit("Disruption Reported", "Carrier Operations", disruptionRecord.id, `Reported ${disruptionType} on ${shipmentId}.`);
    this.save();
    return disruptionRecord;
  }

  // --- Re-Route Request Response (US-74) ---
  respondToReroute(requestId, decision, reason = '') {
    if (decision !== 'Accepted' && decision !== 'Rejected') {
      throw new Error("Decision must be either 'Accepted' or 'Rejected'.");
    }
    if (decision === 'Rejected' && (!reason || !reason.trim())) {
      throw new Error("A rejection reason is mandatory when declining a proposed re-route.");
    }

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    req.rerouteStatus = decision;
    req.rerouteResponseReason = reason ? reason.trim() : null;
    req.rerouteRespondedAt = now;
    req.rerouteRespondedBy = authorName;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Re-Route Request ${decision}`,
      note: decision === 'Accepted' ? `Carrier confirmed accepted proposed re-route ${req.proposedRoute || ''}. Ready for execution.` : `Carrier rejected re-route: ${reason.trim()}`
    });

    this.logCarrierActivity(`Re-Route Request ${decision}`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Carrier ${decision.toLowerCase()} proposed re-route. ${reason ? 'Reason: ' + reason.trim() : ''}`
    });

    this.save();
    return req;
  }

  // --- Expedite Request Response (US-75) ---
  respondToExpedite(requestId, decision, reason = '', achievableEta = '') {
    if (decision !== 'Accepted' && decision !== 'Rejected') {
      throw new Error("Decision must be either 'Accepted' or 'Rejected'.");
    }
    if (decision === 'Rejected' && (!reason || !reason.trim())) {
      throw new Error("A rejection reason is mandatory when declining an expedite request.");
    }

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    req.expediteStatus = decision;
    req.expediteResponseReason = reason ? reason.trim() : null;
    req.expediteAchievableEta = achievableEta || req.expediteUrgency;
    req.expediteRespondedAt = now;
    req.expediteRespondedBy = authorName;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Expedite Request ${decision}`,
      note: decision === 'Accepted' ? `Carrier confirmed expedite capability. Committed ETA: ${req.expediteAchievableEta}.` : `Carrier rejected expedite: ${reason.trim()}`
    });

    this.logCarrierActivity(`Expedite Request ${decision}`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Carrier ${decision.toLowerCase()} expedite. ${reason ? 'Reason: ' + reason.trim() : 'Committed ETA: ' + req.expediteAchievableEta}`
    });

    this.save();
    return req;
  }

  // --- Split Shipment Request Response (US-76, US-77) ---
  respondToSplit(requestId, decision, reason = '', portionAssignments = []) {
    if (decision !== 'Accepted' && decision !== 'Rejected') {
      throw new Error("Decision must be either 'Accepted' or 'Rejected'.");
    }
    if (decision === 'Rejected' && (!reason || !reason.trim())) {
      throw new Error("A rejection reason is mandatory when declining a split shipment proposal.");
    }

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    req.splitStatus = decision;
    req.splitResponseReason = reason ? reason.trim() : null;
    req.splitRespondedAt = now;
    req.splitRespondedBy = authorName;

    if (decision === 'Accepted' && portionAssignments && portionAssignments.length > 0) {
      if (!req.splitDetails) req.splitDetails = {};
      portionAssignments.forEach((assign, idx) => {
        const portionKey = `portion${idx + 1}`;
        if (!req.splitDetails[portionKey]) req.splitDetails[portionKey] = {};
        Object.assign(req.splitDetails[portionKey], assign);
      });
    }

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Split Request ${decision}`,
      note: decision === 'Accepted' ? `Carrier approved split cargo allocation. Portions configured with independent fleets.` : `Carrier rejected split request: ${reason.trim()}`
    });

    this.logCarrierActivity(`Split Request ${decision}`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Carrier ${decision.toLowerCase()} split shipment plan. ${reason ? 'Reason: ' + reason.trim() : 'Split portions initialized.'}`
    });

    this.save();
    return req;
  }

  // --- Delivery Confirmation (US-78) ---
  confirmDelivery({ shipmentId, recoveryRequestId = null, outcome, actualDeliveryTime, recipientName, recipientSignatureRef, deliveryNotes, podFileName = '', podFileType = 'application/pdf', podFileSize = '1.2 MB' }) {
    const validOutcomes = ['Successful Delivery', 'Partial Delivery', 'Unsuccessful / Delivery Failed'];
    if (!validOutcomes.includes(outcome)) {
      throw new Error(`Invalid delivery outcome. Must be one of: ${validOutcomes.join(', ')}`);
    }

    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    // Validate shipment reached an eligible delivery stage (allow all active in-progress statuses)
    const eligibleStatuses = ['Arrived at Destination', 'In Transit', 'Out for Delivery', 'Delayed', 'On Route', 'Loading', 'Assigned', 'In-Transit'];
    if (!eligibleStatuses.includes(shipment.status)) {
      throw new Error(`Cannot confirm delivery for shipment in '${shipment.status}' status. Shipment must be an active in-transit consignment.`);
    }

    if (!actualDeliveryTime) throw new Error("Actual delivery date and time is required.");
    if (!recipientName || !recipientName.trim()) throw new Error("Recipient or receiving reference name is required.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    // Delivery confirmation payload
    const deliveryConfirmation = {
      outcome: outcome,
      actualDeliveryTime: actualDeliveryTime,
      recipientName: recipientName.trim(),
      recipientSignatureRef: recipientSignatureRef ? recipientSignatureRef.trim() : `SIGN-${Math.floor(10000 + Math.random() * 90000)}`,
      deliveryNotes: deliveryNotes ? deliveryNotes.trim() : '',
      podFileName: podFileName || 'Signed_Proof_Of_Delivery.pdf',
      podFileType: podFileType || 'application/pdf',
      podFileSize: podFileSize || '1.4 MB',
      confirmedAt: now,
      confirmedBy: authorName
    };

    shipment.deliveryConfirmation = deliveryConfirmation;
    shipment.deliveredDate = actualDeliveryTime;
    shipment.status = outcome === 'Successful Delivery' ? 'Delivered' : (outcome === 'Partial Delivery' ? 'Partially Delivered' : 'Delivery Failed');

    if (!shipment.milestones) shipment.milestones = [];
    shipment.milestones.push({
      milestone: 'Delivery Completed',
      timestamp: actualDeliveryTime,
      location: shipment.destination,
      actor: authorName,
      notes: `Outcome: ${outcome}. Signed by: ${recipientName}. ${deliveryNotes ? 'Notes: ' + deliveryNotes : ''}`
    });

    if (!shipment.timeline) shipment.timeline = [];
    shipment.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Delivery Confirmed (POD Recorded)",
      note: `Delivery confirmed with outcome '${outcome}'. Received by ${recipientName}. POD Document: ${deliveryConfirmation.podFileName}.`
    });

    // Update Recovery Request if linked
    let req = recoveryRequestId ? this.getRecoveryRequest(recoveryRequestId) : null;
    if (!req) {
      req = (this.data.recoveryRequests || []).find(r => r.shipmentId === shipmentId && ['Accepted', 'In Progress'].includes(r.responseStatus));
    }

    if (req) {
      req.responseStatus = outcome === 'Successful Delivery' ? 'Completed' : 'Failed';
      req.completedAt = now;
      req.completedBy = authorName;
      req.finalDeliveryOutcome = outcome;
      if (!req.timeline) req.timeline = [];
      req.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Recovery Finalized",
        note: `Carrier finalized recovery execution with outcome: ${outcome}.`
      });

      // Release resources back to Available
      if (req.assignedVehicleId) {
        const vehicle = (this.data.resources || []).find(r => r.id === req.assignedVehicleId);
        if (vehicle) {
          vehicle.status = 'Available';
          vehicle.currentAssignment = null;
        }
      }
      if (req.assignedDriverId || req.assignedDriverName) {
        const driver = (this.data.resources || []).find(r => r.id === req.assignedDriverId || r.name === req.assignedDriverName);
        if (driver) {
          driver.status = 'Available';
          driver.currentAssignment = null;
        }
      }

      // If successful, resolve linked exception
      if (outcome === 'Successful Delivery' && req.exceptionId) {
        const exception = this.getException(req.exceptionId);
        if (exception) {
          exception.status = "Resolved";
          exception.finalResolution = `Recovery shipment successfully delivered to recipient ${recipientName}. POD verified.`;
          if (!exception.timeline) exception.timeline = [];
          exception.timeline.push({
            timestamp: now,
            actor: authorName,
            action: "Exception Resolved",
            note: `Recovery shipment confirmed delivered. POD recorded.`
          });
        }
      }
    }

    // Log Carrier Activity
    this.logCarrierActivity("Delivery Confirmed", {
      shipmentId: shipment.id,
      recoveryRequestId: req ? req.id : null,
      outcome: `Confirmed ${outcome} to ${recipientName}. POD: ${deliveryConfirmation.podFileName}.`
    });

    this.logAudit("Delivery Confirmed", "Carrier Delivery", shipment.id, `Confirmed delivery outcome '${outcome}' for shipment ${shipment.id}.`);
    this.save();
    return shipment;
  }

  // --- CARRIER RECOVERY REQUEST INQUIRY (Request Information) ---
  requestCarrierInfo(requestId, inquiryCategory, inquiryDetails) {
    if (!inquiryCategory || !inquiryCategory.trim()) throw new Error("Inquiry category is required.");
    if (!inquiryDetails || !inquiryDetails.trim()) throw new Error("Inquiry details / clarification text is required.");

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    req.responseStatus = "Info Requested";
    req.inquiryCategory = inquiryCategory.trim();
    req.inquiryDetails = inquiryDetails.trim();
    req.inquiryRequestedAt = now;
    req.inquiryRequestedBy = authorName;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Clarification Requested",
      note: `Carrier requested information [${inquiryCategory.trim()}]: ${inquiryDetails.trim()}`
    });

    // Exception timeline
    const exception = this.getException(req.exceptionId);
    if (exception) {
      if (!exception.timeline) exception.timeline = [];
      exception.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Clarification Inquiry",
        note: `Carrier requested information on recovery ${req.id} (${inquiryCategory}): ${inquiryDetails.trim()}`
      });
    }

    // Control Tower Notification
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      timestamp: now,
      type: "info",
      title: `Carrier Inquiry on ${req.id}`,
      message: `Carrier requested info regarding ${inquiryCategory}: "${inquiryDetails.trim()}"`,
      read: false
    });

    this.logCarrierActivity("Clarification Requested", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Inquiry submitted [${inquiryCategory}]: ${inquiryDetails.trim()}`
    });

    this.logAudit("Carrier Inquiry", "Carrier Recoveries", req.id, `Carrier requested info on ${req.id} (${inquiryCategory}).`);
    this.save();
    return req;
  }

  // --- CARRIER PROFILE MANAGEMENT ---
  updateCarrierProfile(carrierId, profileUpdates) {
    const targetId = carrierId || this.getCurrentCarrierId();
    const carrier = (this.data.carriers || []).find(c => c.id === targetId);
    if (!carrier) throw new Error(`Carrier profile with ID ${targetId} was not found.`);

    Object.assign(carrier, {
      ...profileUpdates,
      updatedAt: new Date().toISOString()
    });

    this.logCarrierActivity("Profile Updated", {
      carrierId: targetId,
      outcome: `Company profile and operational contact settings updated.`
    });

    this.logAudit("Carrier Profile Updated", "Carrier Management", targetId, `Carrier profile updated for ${carrier.name}.`);
    this.save();
    return carrier;
  }

  // --- RE-ROUTE COUNTER-PROPOSAL & REVISED ROUTE/ETA ---
  submitRerouteCounterProposal(requestId, { revisedRoute, revisedEta, operationalNotes = '' }) {
    if (!revisedRoute || !revisedRoute.trim()) throw new Error("Revised route description / corridor is required.");
    if (!revisedEta || !revisedEta.trim()) throw new Error("Revised confirmed ETA is required.");

    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    req.rerouteStatus = "Counter-Route Proposed";
    req.proposedRoute = revisedRoute.trim();
    req.carrierCounterRoute = revisedRoute.trim();
    req.revisedEta = revisedEta.trim();
    req.carrierOperationalNotes = operationalNotes ? operationalNotes.trim() : req.carrierOperationalNotes;
    req.updatedAt = now;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Counter-Route Proposed",
      note: `Carrier provided revised route: "${revisedRoute.trim()}" with confirmed ETA: ${revisedEta.trim()}. ${operationalNotes ? 'Notes: ' + operationalNotes : ''}`
    });

    // Update shipment confirmed ETA
    const shipment = this.getShipment(req.shipmentId);
    if (shipment) {
      shipment.carrierConfirmedEta = revisedEta.trim();
      shipment.currentEta = revisedEta.trim();
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Carrier Counter-Route & Revised ETA",
        note: `Proposed detour via "${revisedRoute.trim()}" — ETA updated to ${revisedEta.trim()}.`
      });
    }

    this.logCarrierActivity("Counter-Route Submitted", {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Proposed counter-route: ${revisedRoute.trim()} (ETA: ${revisedEta.trim()}).`
    });

    this.logAudit("Route Revision", "Carrier Operations", req.id, `Carrier submitted counter-route for ${req.shipmentId}.`);
    this.save();
    return req;
  }

  // --- ROUTE-PROGRESS CHECKPOINT UPDATES ---
  sendRouteProgressUpdate(shipmentId, { checkpointName, mileMarker = '', speed = '', statusUpdate = 'On Detour Route', operationalNotes = '' }) {
    if (!shipmentId) throw new Error("Shipment ID is required.");
    if (!checkpointName || !checkpointName.trim()) throw new Error("Checkpoint / waypoint name is required.");

    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    shipment.currentLocation = checkpointName.trim();
    if (speed) shipment.currentSpeed = Number(speed) || 55;

    const progressNote = `Waypoint reached: ${checkpointName.trim()}${mileMarker ? ' (MM ' + mileMarker + ')' : ''} &bull; Speed: ${speed ? speed + ' mph' : 'Normal'} &bull; Status: ${statusUpdate}. ${operationalNotes ? 'Notes: ' + operationalNotes : ''}`;

    if (!shipment.milestones) shipment.milestones = [];
    shipment.milestones.push({
      milestone: "Route Progress Checkpoint",
      timestamp: now,
      location: checkpointName.trim(),
      actor: authorName,
      notes: progressNote
    });

    if (!shipment.timeline) shipment.timeline = [];
    shipment.timeline.push({
      timestamp: now,
      actor: authorName,
      action: "Route Progress Checkpoint Logged",
      note: progressNote
    });

    this.logCarrierActivity("Route Progress Update", {
      shipmentId: shipment.id,
      outcome: `Logged waypoint ${checkpointName.trim()} (${statusUpdate}).`
    });

    this.save();
    return shipment;
  }

  // --- SPLIT SHIPMENT PORTION ASSIGNMENT & LIFECYCLE ---
  assignSplitPortionResources(requestId, portionKey, { vehicleId, driverId, expectedPickupTime, expectedDeliveryTime, notes = '' }) {
    const req = this.getRecoveryRequest(requestId);
    if (!req) throw new Error("Recovery request not found.");
    if (!req.splitDetails) req.splitDetails = {};
    if (!req.splitDetails[portionKey]) {
      req.splitDetails[portionKey] = {
        id: `${req.shipmentId}-${portionKey.toUpperCase()}`,
        status: 'Awaiting Assignment',
        deliveryStatus: 'Pending'
      };
    }

    if (!vehicleId) throw new Error(`Vehicle selection required for ${portionKey}.`);
    if (!driverId) throw new Error(`Driver selection required for ${portionKey}.`);
    if (!expectedPickupTime) throw new Error(`Expected pickup time required for ${portionKey}.`);
    if (!expectedDeliveryTime) throw new Error(`Expected delivery time required for ${portionKey}.`);

    const vehicle = (this.data.resources || []).find(r => r.id === vehicleId && r.type === 'Vehicle');
    if (!vehicle) throw new Error("Selected vehicle not found.");
    const driver = (this.data.resources || []).find(r => r.id === driverId && r.type === 'Driver');
    if (!driver) throw new Error("Selected driver not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    // Update resource status
    vehicle.status = 'Assigned';
    vehicle.currentAssignment = `${req.id}-${portionKey}`;
    driver.status = 'Assigned';
    driver.currentAssignment = `${req.id}-${portionKey}`;

    // Update portion
    const portion = req.splitDetails[portionKey];
    portion.assignedVehicleId = vehicle.id;
    portion.assignedVehicleName = `${vehicle.name} (${vehicle.plateNumber})`;
    portion.assignedDriverId = driver.id;
    portion.assignedDriverName = driver.name;
    portion.expectedPickupTime = expectedPickupTime;
    portion.expectedDeliveryTime = expectedDeliveryTime;
    portion.status = 'Assigned';
    portion.deliveryStatus = 'Pending';
    portion.notes = notes;
    portion.updatedAt = now;

    // Check if both portions assigned, transition recovery to Accepted/Assigned
    const p1 = req.splitDetails.portion1;
    const p2 = req.splitDetails.portion2;
    if (p1 && p1.assignedVehicleId && p2 && p2.assignedVehicleId) {
      req.responseStatus = 'Accepted';
    }

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Split ${portionKey.toUpperCase()} Resources Assigned`,
      note: `Assigned vehicle ${vehicle.name} (${vehicle.plateNumber}) and driver ${driver.name} to ${portionKey}. Pickup: ${expectedPickupTime}, Delivery: ${expectedDeliveryTime}.`
    });

    this.logCarrierActivity(`Split ${portionKey.toUpperCase()} Assigned`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Assigned ${vehicle.name} / ${driver.name} to split ${portionKey}.`
    });

    this.save();
    return req;
  }

  dispatchSplitPortion(requestId, portionKey, { notes = '' } = {}) {
    const req = this.getRecoveryRequest(requestId);
    if (!req || !req.splitDetails || !req.splitDetails[portionKey]) {
      throw new Error(`Split portion ${portionKey} not found.`);
    }

    const portion = req.splitDetails[portionKey];
    if (!portion.assignedVehicleId || !portion.assignedDriverId) {
      throw new Error(`Cannot dispatch ${portionKey}: vehicle and driver must be assigned first.`);
    }

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    portion.status = 'In Transit';
    portion.dispatchedAt = now;
    req.responseStatus = 'In Progress';

    const vehicle = (this.data.resources || []).find(r => r.id === portion.assignedVehicleId);
    if (vehicle) vehicle.status = 'In Transit';
    const driver = (this.data.resources || []).find(r => r.id === portion.assignedDriverId);
    if (driver) driver.status = 'In Transit';

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Split ${portionKey.toUpperCase()} Dispatched`,
      note: `Portion ${portionKey.toUpperCase()} departed in vehicle ${portion.assignedVehicleName} with driver ${portion.assignedDriverName}. ${notes}`
    });

    this.logCarrierActivity(`Split ${portionKey.toUpperCase()} Dispatched`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Dispatched ${portionKey.toUpperCase()} with driver ${portion.assignedDriverName}.`
    });

    this.save();
    return req;
  }

  updateSplitPortionStatus(requestId, portionKey, { status, revisedEta, location = '', notes = '' }) {
    const req = this.getRecoveryRequest(requestId);
    if (!req || !req.splitDetails || !req.splitDetails[portionKey]) {
      throw new Error(`Split portion ${portionKey} not found.`);
    }

    const portion = req.splitDetails[portionKey];
    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    if (status) portion.status = status;
    if (revisedEta) portion.revisedEta = revisedEta;
    if (location) portion.currentLocation = location;

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Split ${portionKey.toUpperCase()} Status Updated`,
      note: `Status: ${status || portion.status} &bull; Confirmed ETA: ${revisedEta || portion.revisedEta || 'On schedule'} &bull; Location: ${location || 'En route'}. ${notes}`
    });

    this.logCarrierActivity(`Split ${portionKey.toUpperCase()} Status Updated`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Updated ${portionKey.toUpperCase()} to ${status || portion.status} (ETA: ${revisedEta || 'unchanged'}).`
    });

    this.save();
    return req;
  }

  confirmSplitPortionDelivery(requestId, portionKey, { actualDeliveryTime, recipientName, signatureRef = '', podFileName = '', deliveryNotes = '', outcome = 'Successful Delivery' }) {
    const req = this.getRecoveryRequest(requestId);
    if (!req || !req.splitDetails || !req.splitDetails[portionKey]) {
      throw new Error(`Split portion ${portionKey} not found.`);
    }

    if (!actualDeliveryTime) throw new Error("Actual delivery date and time is required.");
    if (!recipientName || !recipientName.trim()) throw new Error("Receiving recipient name is required.");

    const portion = req.splitDetails[portionKey];
    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Marcus Vance (Carrier Dispatch)";

    portion.status = 'Delivered';
    portion.deliveryStatus = 'Delivered';
    portion.deliveredAt = actualDeliveryTime;
    portion.recipient = recipientName.trim();
    portion.signatureRef = signatureRef || `SIGN-SPLIT-${Math.floor(1000 + Math.random() * 9000)}`;
    portion.podFileName = podFileName || `Signed_POD_${portionKey.toUpperCase()}.pdf`;
    portion.deliveryOutcome = outcome;
    portion.deliveryNotes = deliveryNotes;

    // Release portion resources back to Available
    if (portion.assignedVehicleId) {
      const v = (this.data.resources || []).find(r => r.id === portion.assignedVehicleId);
      if (v) { v.status = 'Available'; v.currentAssignment = null; }
    }
    if (portion.assignedDriverId) {
      const d = (this.data.resources || []).find(r => r.id === portion.assignedDriverId);
      if (d) { d.status = 'Available'; d.currentAssignment = null; }
    }

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      timestamp: now,
      actor: authorName,
      action: `Split ${portionKey.toUpperCase()} Delivery Confirmed`,
      note: `Delivery confirmed for ${portionKey.toUpperCase()} at ${actualDeliveryTime}. Received by ${recipientName.trim()}. POD: ${portion.podFileName}`
    });

    // Check if ALL portions are delivered
    const allPortions = Object.values(req.splitDetails);
    const allDelivered = allPortions.length > 0 && allPortions.every(p => p.deliveryStatus === 'Delivered');

    if (allDelivered) {
      req.responseStatus = 'Completed';
      req.completedAt = now;
      req.completedBy = authorName;

      const shipment = this.getShipment(req.shipmentId);
      if (shipment) {
        shipment.status = 'Delivered';
        shipment.deliveredDate = actualDeliveryTime;
        if (!shipment.milestones) shipment.milestones = [];
        shipment.milestones.push({
          milestone: "Delivery Completed",
          timestamp: actualDeliveryTime,
          location: shipment.destination,
          actor: authorName,
          notes: `All split cargo portions confirmed delivered.`
        });
      }

      if (req.exceptionId) {
        const exception = this.getException(req.exceptionId);
        if (exception) {
          exception.status = "Resolved";
          exception.finalResolution = `All split cargo portions successfully delivered and POD recorded.`;
        }
      }
    }

    this.logCarrierActivity(`Split ${portionKey.toUpperCase()} Delivered`, {
      shipmentId: req.shipmentId,
      recoveryRequestId: req.id,
      outcome: `Confirmed ${outcome} for ${portionKey.toUpperCase()} to ${recipientName.trim()}. ${allDelivered ? 'All split portions complete.' : 'Remaining portions in transit.'}`
    });

    this.logAudit("Split Delivery Confirmed", "Carrier Recoveries", req.id, `Confirmed delivery of ${portionKey.toUpperCase()} for ${req.shipmentId}.`);
    this.save();
    return req;
  }

  // --- Fleet & Driver Management CRUD (US-64 to US-69) ---
  saveCarrierVehicle(vehicleData) {
    if (!vehicleData.name || !vehicleData.name.trim()) throw new Error("Vehicle name/model is required.");
    if (!vehicleData.plateNumber || !vehicleData.plateNumber.trim()) throw new Error("Vehicle license plate identifier is required.");

    const carrierId = vehicleData.carrierId || this.getCurrentCarrierId();
    const existing = (this.data.resources || []).find(r => 
      r.type === 'Vehicle' && r.plateNumber.toLowerCase() === vehicleData.plateNumber.trim().toLowerCase() && r.id !== vehicleData.id
    );
    if (existing) {
      throw new Error(`Vehicle registration/plate '${vehicleData.plateNumber}' is already registered.`);
    }

    const now = new Date().toISOString();
    let vehicle;

    if (vehicleData.id) {
      vehicle = (this.data.resources || []).find(r => r.id === vehicleData.id && r.type === 'Vehicle');
      if (!vehicle) throw new Error("Vehicle record not found for update.");
      vehicle.name = vehicleData.name.trim();
      vehicle.plateNumber = vehicleData.plateNumber.trim();
      vehicle.vehicleType = vehicleData.vehicleType || vehicle.vehicleType || 'Semi-Trailer';
      vehicle.capacity = vehicleData.capacity || vehicle.capacity || '45,000 lbs';
      vehicle.maintenanceStatus = vehicleData.maintenanceStatus || vehicle.maintenanceStatus || 'Good';
      if (vehicleData.status) vehicle.status = vehicleData.status;
      vehicle.updatedAt = now;
    } else {
      vehicle = {
        id: `BG-${Math.floor(10 + Math.random() * 90)}`,
        name: vehicleData.name.trim(),
        type: 'Vehicle',
        vehicleType: vehicleData.vehicleType || 'Freightliner Cascadia',
        plateNumber: vehicleData.plateNumber.trim(),
        capacity: vehicleData.capacity || '45,000 lbs',
        status: vehicleData.status || 'Available',
        maintenanceStatus: vehicleData.maintenanceStatus || 'Good',
        carrierId: carrierId,
        carrierName: 'Bridges Global Logistics',
        currentAssignment: null,
        assignmentHistory: [],
        createdAt: now,
        updatedAt: now
      };
      if (!this.data.resources) this.data.resources = [];
      this.data.resources.push(vehicle);
    }

    this.logCarrierActivity(vehicleData.id ? "Vehicle Updated" : "Vehicle Registered", {
      outcome: `${vehicle.name} (${vehicle.plateNumber}) status: ${vehicle.status}.`
    });

    this.logAudit("Vehicle Fleet Updated", "Fleet Resources", vehicle.id, `Saved vehicle ${vehicle.name} (${vehicle.plateNumber}).`);
    this.save();
    return vehicle;
  }

  saveCarrierDriver(driverData) {
    if (!driverData.name || !driverData.name.trim()) throw new Error("Driver full name is required.");
    if (!driverData.phone || !driverData.phone.trim()) throw new Error("Driver contact phone is required.");

    const carrierId = driverData.carrierId || this.getCurrentCarrierId();
    const now = new Date().toISOString();
    let driver;

    if (driverData.id) {
      driver = (this.data.resources || []).find(r => r.id === driverData.id && r.type === 'Driver');
      if (!driver) throw new Error("Driver record not found for update.");
      driver.name = driverData.name.trim();
      driver.phone = driverData.phone.trim();
      driver.licenseClass = driverData.licenseClass || driver.licenseClass || 'CDL-A';
      if (driverData.status) driver.status = driverData.status;
      driver.updatedAt = now;
    } else {
      driver = {
        id: `DRV-${Math.floor(10 + Math.random() * 90)}`,
        name: driverData.name.trim(),
        type: 'Driver',
        phone: driverData.phone.trim(),
        licenseClass: driverData.licenseClass || 'CDL-A',
        status: driverData.status || 'Available',
        carrierId: carrierId,
        carrierName: 'Bridges Global Logistics',
        currentAssignment: null,
        assignmentHistory: [],
        createdAt: now,
        updatedAt: now
      };
      if (!this.data.resources) this.data.resources = [];
      this.data.resources.push(driver);
    }

    this.logCarrierActivity(driverData.id ? "Driver Updated" : "Driver Registered", {
      outcome: `Driver ${driver.name} status: ${driver.status}.`
    });

    this.logAudit("Driver Roster Updated", "Driver Resources", driver.id, `Saved driver ${driver.name}.`);
    this.save();
    return driver;
  }

  // ==========================================
  // Phase 5: Warehouse Supervisor Operations API
  // ==========================================

  getCurrentWarehouseId() {
    if (window.BRIDGES_AUTH && window.BRIDGES_AUTH.getCurrentUser()) {
      const u = window.BRIDGES_AUTH.getCurrentUser();
      if (u.warehouseId) return u.warehouseId;
    }
    return "WH-DAL-01";
  }

  getWarehouses() {
    return this.data.warehouses || [];
  }

  getWarehouse(whId) {
    const id = whId || this.getCurrentWarehouseId();
    return (this.data.warehouses || []).find(w => w.id === id) || (this.data.warehouses && this.data.warehouses[0]) || {
      id: "WH-DAL-01",
      name: "Dallas Central Logistics Hub",
      code: "DAL-01",
      city: "Dallas, TX"
    };
  }

  getWarehouseShipments(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    const wh = this.getWarehouse(targetWhId);
    const whNames = [wh.name, wh.code, "Dallas Central Logistics Hub", "Capital Knot Hub", "Capital Knot Distribution Hub", "Capital Knot Logistics Hub"].map(s => s.toLowerCase());

    const shipments = (this.data.shipments || []).filter(s => {
      // Outbound from this warehouse
      const orig = (s.origin || "").toLowerCase();
      const isOutbound = whNames.some(name => orig.includes(name)) || s.warehouseId === targetWhId || s.originWarehouseId === targetWhId;

      // Inbound to this warehouse
      const dest = (s.destination || "").toLowerCase();
      const isInbound = whNames.some(name => dest.includes(name)) || s.destinationWarehouseId === targetWhId;

      // Accepted diversions to this warehouse
      const hasAcceptedDiversion = (this.data.diversionRequests || []).some(d => 
        d.shipmentId === s.id && 
        d.proposedDiversionDestination.includes(wh.code || "DAL-01") &&
        ['Accepted', 'Awaiting Arrival', 'Arrived', 'Receiving In Progress', 'Received'].includes(d.status)
      );

      return isOutbound || isInbound || hasAcceptedDiversion;
    });

    // Enrich shipments with warehouse-specific state
    return shipments.map(s => {
      const orig = (s.origin || "").toLowerCase();
      const isOutbound = whNames.some(name => orig.includes(name)) || s.warehouseId === targetWhId || s.originWarehouseId === targetWhId;
      const direction = isOutbound ? "Outbound" : "Inbound";

      const readiness = this.getWarehouseReadiness(s.id);
      const pkp = this.getPickingPacking(s.id);
      const loading = this.getLoadingRecord(s.id);
      const handover = this.getCarrierHandover(s.id);
      const apt = (this.data.dockAppointments || []).find(a => a.shipmentId === s.id);
      const blockers = (this.data.warehouseBlockers || []).filter(b => b.shipmentId === s.id && b.status === 'Open');
      const recRecord = (this.data.warehouseReceivingRecords || []).find(r => r.shipmentId === s.id);

      // Cargo and Temperature Requirement Classification
      const cargoStr = ((s.cargoType || '') + ' ' + (s.cargoDescription || '')).toLowerCase();
      let cargoCategory = "Dry Standard Freight";
      let tempRange = "Ambient (15°C - 25°C)";
      let preChillRequired = false;
      let liveSensorTemp = "21.4°C";
      let tempBadgeClass = "badge-ambient";
      let isColdChain = false;

      if (cargoStr.includes('vaccine') || cargoStr.includes('bio') || cargoStr.includes('pharma') || cargoStr.includes('cold') || cargoStr.includes('culture')) {
        cargoCategory = "Cold-Chain Pharma & Biologicals";
        tempRange = "2°C to 8°C";
        preChillRequired = true;
        liveSensorTemp = "4.2°C";
        tempBadgeClass = "badge-coldchain";
        isColdChain = true;
      } else if (cargoStr.includes('frozen') || cargoStr.includes('seafood') || cargoStr.includes('ice')) {
        cargoCategory = "Deep Frozen Cargo";
        tempRange = "-25°C to -18°C";
        preChillRequired = true;
        liveSensorTemp = "-20.1°C";
        tempBadgeClass = "badge-frozen";
        isColdChain = true;
      } else if (cargoStr.includes('haz') || cargoStr.includes('chem') || cargoStr.includes('toxic') || cargoStr.includes('flamm')) {
        cargoCategory = "Hazardous / Regulated Materials";
        tempRange = "Climate Controlled 18°C - 22°C";
        preChillRequired = false;
        liveSensorTemp = "19.8°C";
        tempBadgeClass = "badge-hazmat";
      }

      // Schedule & Confirmed ETA Calculations
      const plannedTime = direction === 'Inbound' ? (s.plannedArrival || s.originalETA || s.estArrival) : (s.plannedDeparture || s.departureTime);
      const latestETA = s.predictedETA || s.estArrival || s.plannedArrival || plannedTime;
      let delayMinutes = 0;
      if (s.originalETA && latestETA) {
        const diffMs = new Date(latestETA) - new Date(s.originalETA);
        delayMinutes = Math.round(diffMs / 60000);
      } else if (s.status === 'Delayed') {
        delayMinutes = 45;
      }

      // Carrier & Vehicle Details
      const carrier = s.carrierId ? this.getCarrier(s.carrierId) : null;
      const carrierName = s.carrierName || (carrier ? carrier.name : "Bridges Global Logistics");
      const vehiclePlate = s.vehiclePlate || s.vehicleId || (apt ? apt.vehiclePlate : "TX-4921-HV");
      const vehicleType = s.vehicleType || (isColdChain ? "40ft Refrigerated Trailer (Reefer)" : "53ft High-Cube Dry Van");
      const driverName = s.driverName || (apt ? apt.driverName : "Ethan Cole");
      const driverPhone = s.driverPhone || "+1 (214) 555-0182";

      let nextAction = "Review operational details";
      if (blockers.length > 0) {
        nextAction = `Resolve blocker: ${blockers[0].blockerType}`;
      } else if (direction === "Outbound") {
        if (!apt) {
          nextAction = "Assign dock appointment";
        } else if (readiness.overallStatus === "Not Started") {
          nextAction = "Initiate warehouse readiness checklist";
        } else if (pkp.pickingStatus !== "Completed" && pkp.pickingStatus !== "Not Applicable") {
          nextAction = "Complete picking tasks";
        } else if (pkp.packingStatus !== "Completed" && pkp.packingStatus !== "Not Applicable") {
          nextAction = "Complete packing tasks";
        } else if (loading.status === "Awaiting Loading") {
          nextAction = "Verify prerequisites & start loading";
        } else if (loading.status === "Loading In Progress") {
          nextAction = "Complete cargo loading";
        } else if (handover.handoverStatus === "Ready for Handover") {
          nextAction = "Execute carrier handover sign-off";
        } else if (handover.handoverStatus === "Handed Over") {
          nextAction = "Handover complete (Carrier en route)";
        }
      } else {
        // Inbound
        const divReq = (this.data.diversionRequests || []).find(d => d.shipmentId === s.id);
        if (divReq && divReq.status === 'Pending Review') {
          nextAction = "Review and accept diversion request";
        } else if (!apt) {
          nextAction = "Assign receiving dock";
        } else if (s.status === 'Delivered' || s.status === 'Delivered & Received at Hub' || (divReq && divReq.status === 'Received') || recRecord) {
          nextAction = "Receiving complete & filed";
        } else {
          nextAction = "Verify inbound cargo & receive";
        }
      }

      const assignedDock = apt ? apt.dockId : (s.assignedDock || "Unassigned");
      const dockBay = this.getWarehouseDocks(targetWhId).find(d => d.id === assignedDock);

      return {
        ...s,
        direction,
        assignedDock,
        dockAssignment: assignedDock,
        dockCode: dockBay ? dockBay.code : (apt ? apt.dockId : "Unassigned"),
        dockType: dockBay ? dockBay.type : "Standard Bay",
        dockStatus: dockBay ? dockBay.status : "Available",
        readinessStatus: readiness.overallStatus || "Not Started",
        pickingStatus: pkp.pickingStatus || "Not Started",
        packingStatus: pkp.packingStatus || "Not Started",
        loadingStatus: loading.status || "Awaiting Loading",
        handoverStatus: handover.handoverStatus || "Awaiting Readiness",
        activeBlockersCount: blockers.length,
        nextRequiredAction: nextAction,
        // Enriched Cargo & Temperature Specs
        cargoCategory,
        tempRange,
        preChillRequired,
        liveSensorTemp,
        tempBadgeClass,
        isColdChain,
        // Enriched Transport Details
        carrierName,
        vehiclePlate,
        vehicleType,
        driverName,
        driverPhone,
        // Enriched Schedule Details
        plannedSchedule: plannedTime,
        latestETA,
        delayMinutes,
        isDelayed: delayMinutes > 15 || s.status === 'Delayed',
        // Inbound Receiving Record
        receivingRecord: recRecord || null
      };
    });
  }

  getWarehouseMetrics(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    const shipments = this.getWarehouseShipments(targetWhId);
    const blockers = (this.data.warehouseBlockers || []).filter(b => b.warehouseId === targetWhId && b.status === 'Open');

    let requiringActionCount = 0;
    let awaitingReadinessCount = 0;
    let pickingPackingInProgressCount = 0;
    let awaitingLoadingCount = 0;
    let dispatchesAwaitingHandoverCount = 0;

    shipments.forEach(s => {
      // 1. Awaiting readiness
      if (s.readinessStatus === 'Not Started' || s.readinessStatus === 'In Progress' || s.readinessStatus === 'Blocked') {
        awaitingReadinessCount++;
      }

      // 2. Picking / Packing in progress
      if (s.pickingStatus === 'In Progress' || s.packingStatus === 'In Progress') {
        pickingPackingInProgressCount++;
      }

      // 3. Awaiting loading
      if (s.direction === 'Outbound' && s.loadingStatus === 'Awaiting Loading' && s.readinessStatus === 'Ready') {
        awaitingLoadingCount++;
      }

      // 4. Dispatches awaiting handover
      if (s.direction === 'Outbound' && (s.handoverStatus === 'Ready for Handover' || s.handoverStatus === 'Handover In Progress')) {
        dispatchesAwaitingHandoverCount++;
      }

      // 5. Requiring action
      if (
        s.activeBlockersCount > 0 ||
        s.readinessStatus === 'Blocked' ||
        s.handoverStatus === 'Handover Blocked' ||
        s.handoverStatus === 'Ready for Handover' ||
        (s.direction === 'Outbound' && s.loadingStatus === 'Awaiting Loading' && s.readinessStatus === 'Ready') ||
        (s.direction === 'Inbound' && s.status === 'Arrived')
      ) {
        requiringActionCount++;
      }
    });

    return {
      requiringAction: requiringActionCount,
      awaitingReadiness: awaitingReadinessCount,
      pickingPackingInProgress: pickingPackingInProgressCount,
      awaitingLoading: awaitingLoadingCount,
      dispatchesAwaitingHandover: dispatchesAwaitingHandoverCount,
      warehouseBlockers: blockers.length,
      totalQueue: shipments.length
    };
  }

  getWarehouseDocks(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    return (this.data.docks || []).filter(d => d.warehouseId === targetWhId);
  }

  getDockSchedule(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    return (this.data.dockAppointments || []).filter(a => a.warehouseId === targetWhId);
  }

  assignDock(shipmentId, dockId, timeSlot, date, notes) {
    if (!shipmentId) throw new Error("Shipment ID is required.");
    if (!dockId) throw new Error("Dock ID is required.");
    if (!timeSlot) throw new Error("Time slot is required.");

    const targetWhId = this.getCurrentWarehouseId();
    const dock = (this.data.docks || []).find(d => d.id === dockId && d.warehouseId === targetWhId);
    if (!dock) throw new Error(`Dock ${dockId} not found in current warehouse.`);

    if (dock.status === 'Maintenance') {
      throw new Error(`Dock ${dock.code || dockId} is currently under Maintenance and cannot be scheduled.`);
    }

    // Validate overlap with existing appointments for same dock and date
    const apptDate = date || new Date().toISOString().split('T')[0];
    const existingAppointments = (this.data.dockAppointments || []).filter(a => 
      a.dockId === dockId && 
      a.date === apptDate && 
      a.shipmentId !== shipmentId &&
      a.appointmentStatus !== 'Completed' && 
      a.appointmentStatus !== 'Cancelled'
    );

    const hasConflict = existingAppointments.some(a => a.timeSlot === timeSlot);
    if (hasConflict) {
      throw new Error(`Dock scheduling conflict: ${dock.code || dockId} is already booked for time slot ${timeSlot} on ${apptDate}. Please select another time slot or dock.`);
    }

    const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);
    const carrier = shipment && shipment.carrierId ? this.getCarrier(shipment.carrierId) : null;
    const direction = (shipment && shipment.destination && (shipment.destination.includes("Dallas") || shipment.destination.includes("Capital Knot"))) ? "Inbound" : "Outbound";

    // Update or create appointment
    if (!this.data.dockAppointments) this.data.dockAppointments = [];
    let apt = this.data.dockAppointments.find(a => a.shipmentId === shipmentId);

    const now = new Date().toISOString();
    const prevDock = apt ? apt.dockId : null;

    if (apt) {
      apt.dockId = dockId;
      apt.timeSlot = timeSlot;
      apt.date = apptDate;
      if (notes) apt.notes = notes;
      apt.updatedAt = now;
    } else {
      apt = {
        id: `APT-${Math.floor(6000 + Math.random() * 4000)}`,
        dockId: dockId,
        warehouseId: targetWhId,
        shipmentId: shipmentId,
        direction: direction,
        carrierId: shipment ? shipment.carrierId : null,
        carrierName: carrier ? carrier.name : (shipment ? shipment.carrierName : "Carrier Unassigned"),
        vehiclePlate: shipment ? shipment.vehicleId : "Plate TBD",
        driverName: shipment ? shipment.driverName : "Driver TBD",
        timeSlot: timeSlot,
        date: apptDate,
        appointmentStatus: "Scheduled",
        readinessStatus: "In Progress",
        notes: notes || "Scheduled dock appointment.",
        createdAt: now,
        updatedAt: now
      };
      this.data.dockAppointments.push(apt);
    }

    // Update previous dock if changed
    if (prevDock && prevDock !== dockId) {
      const pD = this.data.docks.find(d => d.id === prevDock);
      if (pD && pD.currentShipmentId === shipmentId) {
        pD.status = 'Available';
        pD.currentShipmentId = null;
        pD.currentCarrier = null;
        pD.timeSlot = null;
      }
    }

    // Update assigned dock
    dock.status = 'Reserved';
    dock.currentShipmentId = shipmentId;
    dock.currentCarrier = apt.carrierName;
    dock.timeSlot = timeSlot;

    // Update shipment
    if (shipment) {
      shipment.assignedDockId = dockId;
      shipment.assignedDockCode = dock.code;
    }

    // Update readiness checklist dock check
    const readiness = this.getWarehouseReadiness(shipmentId);
    if (readiness && readiness.checklist) {
      readiness.checklist.dockAvailable = {
        status: "Ready",
        label: "Suitable dock available",
        mandatory: true,
        notes: `Assigned ${dock.code} (${dock.type}) for ${timeSlot}`
      };
      this.recalculateReadinessStatus(readiness);
    }

    this.logWarehouseActivity(
      prevDock ? "Dock Reassigned" : "Dock Assigned",
      shipmentId,
      prevDock || "Unassigned",
      `${dock.code || dockId} (${timeSlot})`,
      notes || `Dock appointment booked for ${apptDate} ${timeSlot}`
    );

    this.logAudit("Dock Assignment", "Dock Schedule", shipmentId, `Assigned dock ${dock.code} to shipment ${shipmentId} (${timeSlot}).`);
    this.save();
    return apt;
  }

  rescheduleDockAppointment(appointmentId, newDockId, newTimeSlot, newDate, reason) {
    if (!appointmentId) throw new Error("Appointment ID required.");
    if (!reason || !reason.trim()) throw new Error("Mandatory reason required for rescheduling dock appointment.");

    const apt = (this.data.dockAppointments || []).find(a => a.id === appointmentId);
    if (!apt) throw new Error("Appointment not found.");

    const prevInfo = `${apt.dockId} (${apt.timeSlot} on ${apt.date})`;
    this.assignDock(apt.shipmentId, newDockId, newTimeSlot, newDate, `Rescheduled: ${reason.trim()}`);

    apt.rescheduleReason = reason.trim();
    apt.appointmentStatus = "Scheduled";

    this.logWarehouseActivity(
      "Dock Rescheduled",
      apt.shipmentId,
      prevInfo,
      `${newDockId} (${newTimeSlot} on ${newDate})`,
      `Reason: ${reason.trim()}`
    );

    this.save();
    return apt;
  }

  updateDockStatus(dockId, newStatus, details) {
    const targetWhId = this.getCurrentWarehouseId();
    const dock = (this.data.docks || []).find(d => d.id === dockId && d.warehouseId === targetWhId);
    if (!dock) throw new Error("Dock not found.");

    const prevStatus = dock.status;
    dock.status = newStatus;

    if (newStatus === 'Available') {
      dock.currentShipmentId = null;
      dock.currentCarrier = null;
      dock.timeSlot = null;
    }

    this.logWarehouseActivity(
      "Dock Status Changed",
      dock.currentShipmentId || "N/A",
      prevStatus,
      newStatus,
      details || `Dock ${dock.code || dockId} updated to ${newStatus}`
    );

    this.save();
    return dock;
  }

  releaseDock(dockId, shipmentId) {
    const targetWhId = this.getCurrentWarehouseId();
    const dock = (this.data.docks || []).find(d => d.id === dockId && d.warehouseId === targetWhId);
    if (dock) {
      dock.status = 'Available';
      dock.currentShipmentId = null;
      dock.currentCarrier = null;
      dock.timeSlot = null;
    }

    if (shipmentId && this.data.dockAppointments) {
      const apt = this.data.dockAppointments.find(a => a.shipmentId === shipmentId && a.dockId === dockId);
      if (apt) {
        apt.appointmentStatus = 'Completed';
      }
    }

    this.logWarehouseActivity(
      "Dock Released",
      shipmentId || "N/A",
      "Occupied",
      "Available",
      `Dock ${dock ? dock.code : dockId} cleared and released for next appointment.`
    );

    this.save();
  }

  getWarehouseReadiness(shipmentId) {
    if (!this.data.warehouseReadiness) this.data.warehouseReadiness = [];
    let r = this.data.warehouseReadiness.find(item => item.shipmentId === shipmentId);
    if (!r) {
      const s = (this.data.shipments || []).find(item => item.id === shipmentId);
      r = {
        id: `WHR-${shipmentId}`,
        shipmentId: shipmentId,
        warehouseId: this.getCurrentWarehouseId(),
        overallStatus: "Not Started",
        blockedReason: null,
        checklist: {
          shipmentDetails: { status: "Ready", label: "Shipment details available", mandatory: true, notes: s ? `Order Ref: ${s.orderReference || s.id}` : "Available" },
          requiredDocs: { status: "Not Started", label: "Required documents available", mandatory: true, notes: "Awaiting physical / digital bill of lading check" },
          cargoInventory: { status: "Not Started", label: "Cargo or inventory ready", mandatory: true, notes: "Awaiting staging verification" },
          pickingCompleted: { status: "Not Started", label: "Picking completed", mandatory: true, notes: "Pick task pending" },
          packingCompleted: { status: "Not Started", label: "Packing completed", mandatory: true, notes: "Packing pending" },
          dockAvailable: { status: "Not Started", label: "Suitable dock available", mandatory: true, notes: "No dock booked yet" },
          carrierDetails: { status: s && s.carrierId ? "Ready" : "Not Started", label: "Carrier and vehicle details available", mandatory: true, notes: s && s.carrierId ? `Assigned: ${s.carrierId}` : "Carrier unassigned" },
          operationalConstraints: { status: "Not Started", label: "Operational constraints reviewed", mandatory: false, notes: "Pending review" }
        },
        updatedAt: new Date().toISOString(),
        updatedBy: "Carlos Mendoza"
      };
      this.data.warehouseReadiness.push(r);
    }
    return r;
  }

  recalculateReadinessStatus(readiness) {
    const list = readiness.checklist || {};
    const keys = Object.keys(list);

    let hasBlocked = false;
    let blockedReason = "";
    let mandatoryIncomplete = false;

    for (const k of keys) {
      const item = list[k];
      if (item.status === 'Blocked') {
        hasBlocked = true;
        blockedReason = item.notes || `Blocked check: ${item.label}`;
      } else if (item.mandatory && item.status !== 'Ready' && item.status !== 'Not Applicable') {
        mandatoryIncomplete = true;
      }
    }

    if (hasBlocked) {
      readiness.overallStatus = "Blocked";
      readiness.blockedReason = blockedReason || readiness.blockedReason || "Mandatory checklist condition blocked.";
    } else if (mandatoryIncomplete) {
      const anyStarted = keys.some(k => list[k].status === 'In Progress' || list[k].status === 'Ready');
      readiness.overallStatus = anyStarted ? "In Progress" : "Not Started";
      readiness.blockedReason = null;
    } else {
      readiness.overallStatus = "Ready";
      readiness.blockedReason = null;
    }

    readiness.updatedAt = new Date().toISOString();
  }

  updateWarehouseReadiness(shipmentId, checklistKey, newStatus, notes, blockerReason) {
    const readiness = this.getWarehouseReadiness(shipmentId);
    if (!readiness.checklist[checklistKey]) {
      throw new Error(`Invalid checklist item: ${checklistKey}`);
    }

    const effectiveReason = (blockerReason && blockerReason.trim()) || (notes && notes.trim()) || "";
    if (newStatus === 'Blocked' && !effectiveReason) {
      throw new Error("A specific reason is mandatory when marking a readiness check as Blocked.");
    }

    const prevStatus = readiness.overallStatus;
    readiness.checklist[checklistKey].status = newStatus;
    readiness.checklist[checklistKey].notes = effectiveReason || notes || "Check verified.";

    this.recalculateReadinessStatus(readiness);

    this.logWarehouseActivity(
      "Readiness Updated",
      shipmentId,
      prevStatus,
      readiness.overallStatus,
      `${readiness.checklist[checklistKey].label}: ${newStatus}. ${notes || blockerReason || ''}`
    );

    this.save();
    return readiness;
  }

  getPickingPacking(shipmentId) {
    if (!this.data.pickingPacking) this.data.pickingPacking = [];
    let p = this.data.pickingPacking.find(item => item.shipmentId === shipmentId);
    if (!p) {
      const s = (this.data.shipments || []).find(item => item.id === shipmentId);
      const isOutbound = s && (s.origin || "").toLowerCase().includes("dallas") || (s && (s.origin || "").toLowerCase().includes("capital knot"));

      p = {
        id: `PKP-${shipmentId}`,
        shipmentId: shipmentId,
        warehouseId: this.getCurrentWarehouseId(),
        pickingStatus: isOutbound ? "Not Started" : "Not Applicable",
        packingStatus: isOutbound ? "Not Started" : "Not Applicable",
        items: [
          {
            sku: `SKU-${shipmentId.replace('BRG-', 'PKG-')}-01`,
            name: s ? (s.cargoType || "Standard Freight Items") : "General Cargo Packages",
            requiredQty: 100,
            pickedQty: 0,
            packedQty: 0,
            unit: "units",
            location: "Aisle 4, Bay C-02",
            condition: "Good"
          }
        ],
        totalRequired: 100,
        totalPicked: 0,
        totalPacked: 0,
        deadline: s ? s.estArrival : new Date().toISOString(),
        blockers: [],
        operationalNotes: "Task initialized.",
        updatedAt: new Date().toISOString(),
        updatedBy: "Carlos Mendoza"
      };
      this.data.pickingPacking.push(p);
    }
    return p;
  }

  updatePickingProgress(shipmentId, sku, pickedQty, notes) {
    const task = this.getPickingPacking(shipmentId);
    const item = (task.items || []).find(i => i.sku === sku);
    if (!item) throw new Error(`Item ${sku} not found for shipment.`);

    const qty = parseInt(pickedQty, 10);
    if (isNaN(qty) || qty < 0) throw new Error("Picked quantity cannot be negative.");
    if (qty > item.requiredQty) throw new Error(`Picked quantity (${qty}) cannot exceed required quantity (${item.requiredQty}).`);

    item.pickedQty = qty;
    task.totalPicked = (task.items || []).reduce((sum, i) => sum + (i.pickedQty || 0), 0);

    const prevStatus = task.pickingStatus;
    if (task.totalPicked === task.totalRequired) {
      task.pickingStatus = "Completed";
    } else if (task.totalPicked > 0) {
      task.pickingStatus = "In Progress";
    } else {
      task.pickingStatus = "Not Started";
    }

    if (notes) task.operationalNotes = notes;
    task.updatedAt = new Date().toISOString();

    // Sync to readiness
    const readiness = this.getWarehouseReadiness(shipmentId);
    if (readiness && readiness.checklist && readiness.checklist.pickingCompleted) {
      readiness.checklist.pickingCompleted.status = task.pickingStatus === 'Completed' ? 'Ready' : (task.pickingStatus === 'In Progress' ? 'In Progress' : 'Not Started');
      readiness.checklist.pickingCompleted.notes = `Picked ${task.totalPicked}/${task.totalRequired} units`;
      this.recalculateReadinessStatus(readiness);
    }

    this.logWarehouseActivity(
      "Picking Progress Recorded",
      shipmentId,
      prevStatus,
      task.pickingStatus,
      `Picked ${qty}/${item.requiredQty} of ${item.name} (${sku}). Total picked: ${task.totalPicked}/${task.totalRequired}.`
    );

    this.save();
    return task;
  }

  updatePackingProgress(shipmentId, sku, packedQty, notes) {
    const task = this.getPickingPacking(shipmentId);
    const item = (task.items || []).find(i => i.sku === sku);
    if (!item) throw new Error(`Item ${sku} not found for shipment.`);

    const qty = parseInt(packedQty, 10);
    if (isNaN(qty) || qty < 0) throw new Error("Packed quantity cannot be negative.");
    if (qty > item.pickedQty) throw new Error(`Packed quantity (${qty}) cannot exceed already picked quantity (${item.pickedQty}). Complete picking first.`);

    item.packedQty = qty;
    task.totalPacked = (task.items || []).reduce((sum, i) => sum + (i.packedQty || 0), 0);

    const prevStatus = task.packingStatus;
    if (task.totalPacked === task.totalRequired && task.totalPicked === task.totalRequired) {
      task.packingStatus = "Completed";
    } else if (task.totalPacked > 0) {
      task.packingStatus = "In Progress";
    } else {
      task.packingStatus = "Not Started";
    }

    if (notes) task.operationalNotes = notes;
    task.updatedAt = new Date().toISOString();

    // Sync to readiness
    const readiness = this.getWarehouseReadiness(shipmentId);
    if (readiness && readiness.checklist && readiness.checklist.packingCompleted) {
      readiness.checklist.packingCompleted.status = task.packingStatus === 'Completed' ? 'Ready' : (task.packingStatus === 'In Progress' ? 'In Progress' : 'Not Started');
      readiness.checklist.packingCompleted.notes = `Packed ${task.totalPacked}/${task.totalRequired} units`;
      this.recalculateReadinessStatus(readiness);
    }

    this.logWarehouseActivity(
      "Packing Progress Recorded",
      shipmentId,
      prevStatus,
      task.packingStatus,
      `Packed ${qty}/${item.pickedQty} of ${item.name} (${sku}). Total packed: ${task.totalPacked}/${task.totalRequired}.`
    );

    this.save();
    return task;
  }

  reportCargoIssue(shipmentId, sku, issueType, quantity, description) {
    if (!description || !description.trim()) throw new Error("A description of the cargo discrepancy or damage is mandatory.");
    const task = this.getPickingPacking(shipmentId);
    const item = (task.items || []).find(i => i.sku === sku);

    if (item) {
      item.condition = issueType;
    }

    task.blockers.push(`${issueType}: ${quantity} units of ${item ? item.name : sku}. ${description.trim()}`);
    task.packingStatus = "Blocked";

    // Create warehouse blocker
    this.createWarehouseBlocker({
      shipmentId,
      blockerType: issueType === "Damaged" ? "Damaged goods" : "Cargo discrepancy",
      severity: "High",
      description: `${issueType} items reported: ${quantity} units of ${sku}. ${description.trim()}`,
      responsibleParty: "Warehouse QA / Inventory Control",
      requiredAction: "Inspect damaged lot, quarantine affected pallets, adjust pick order.",
      threatensDeliveryCommitment: true
    });

    this.save();
    return task;
  }

  getLoadingRecord(shipmentId) {
    if (!this.data.loadingRecords) this.data.loadingRecords = [];
    let l = this.data.loadingRecords.find(item => item.shipmentId === shipmentId);
    if (!l) {
      const s = (this.data.shipments || []).find(item => item.id === shipmentId);
      const apt = (this.data.dockAppointments || []).find(a => a.shipmentId === shipmentId);
      l = {
        id: `LOD-${shipmentId}`,
        shipmentId: shipmentId,
        warehouseId: this.getCurrentWarehouseId(),
        dockId: apt ? apt.dockId : null,
        carrierId: s ? s.carrierId : null,
        carrierName: s ? s.carrierName : "Carrier Unassigned",
        vehiclePlate: s ? s.vehicleId : "Plate TBD",
        driverName: s ? s.driverName : "Driver TBD",
        status: "Awaiting Loading",
        loadingProgress: 0,
        totalLoadedUnits: 0,
        damageReported: false,
        damageDetails: null,
        prerequisitesSatisfied: false,
        dispatchReadinessValidated: false,
        startedAt: null,
        completedAt: null,
        handoverReadyAt: null,
        notes: "Awaiting loading authorization."
      };
      this.data.loadingRecords.push(l);
    }
    return l;
  }

  startLoading(shipmentId) {
    const loading = this.getLoadingRecord(shipmentId);
    const pkp = this.getPickingPacking(shipmentId);
    const readiness = this.getWarehouseReadiness(shipmentId);
    const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);

    // Validate prerequisites
    const isPickingComplete = pkp.pickingStatus === 'Completed' || pkp.pickingStatus === 'Not Applicable';
    const isPackingComplete = pkp.packingStatus === 'Completed' || pkp.packingStatus === 'Not Applicable';

    if (!isPickingComplete || !isPackingComplete) {
      throw new Error("Cannot start loading: Picking and packing must both be 100% completed before loading can begin.");
    }

    if (readiness.overallStatus === 'Blocked') {
      throw new Error(`Cannot start loading: Shipment has blocked readiness checks (${readiness.blockedReason || 'Blocked'}).`);
    }

    const apt = (this.data.dockAppointments || []).find(a => a.shipmentId === shipmentId);
    if (!apt || !apt.dockId) {
      throw new Error("Cannot start loading: A valid dock appointment must be assigned before trailer loading.");
    }

    const prevStatus = loading.status;
    loading.status = "Loading In Progress";
    loading.dockId = apt.dockId;
    loading.prerequisitesSatisfied = true;
    loading.startedAt = new Date().toISOString();

    if (shipment) {
      shipment.status = "Loading";
    }

    this.logWarehouseActivity(
      "Loading Started",
      shipmentId,
      prevStatus,
      "Loading In Progress",
      `Trailer loading commenced at ${apt.dockId}. Prerequisites verified.`
    );

    this.save();
    return loading;
  }

  updateLoadingProgress(shipmentId, progressPercent, loadedUnits, notes) {
    const loading = this.getLoadingRecord(shipmentId);
    if (loading.status !== 'Loading In Progress') {
      throw new Error("Loading must be started before progress can be recorded.");
    }

    const pct = Math.max(0, Math.min(100, parseInt(progressPercent, 10)));
    loading.loadingProgress = pct;
    if (loadedUnits !== undefined) loading.totalLoadedUnits = parseInt(loadedUnits, 10) || 0;
    if (notes) loading.notes = notes;

    this.logWarehouseActivity(
      "Loading Progress Updated",
      shipmentId,
      `${loading.loadingProgress}%`,
      `${pct}%`,
      `Loaded units: ${loading.totalLoadedUnits}. ${notes || ''}`
    );

    this.save();
    return loading;
  }

  completeLoading(shipmentId, sealNumber, notes) {
    const loading = this.getLoadingRecord(shipmentId);
    const pkp = this.getPickingPacking(shipmentId);

    if (loading.status !== 'Loading In Progress' && loading.status !== 'Awaiting Loading') {
      if (loading.status === 'Loading Completed' || loading.status === 'Ready for Handover') {
        return loading;
      }
    }

    // Validate that loading prerequisites were checked
    const isPickingComplete = pkp.pickingStatus === 'Completed' || pkp.pickingStatus === 'Not Applicable';
    const isPackingComplete = pkp.packingStatus === 'Completed' || pkp.packingStatus === 'Not Applicable';
    if (!isPickingComplete || !isPackingComplete) {
      throw new Error("Cannot complete loading: Picking and packing prerequisites are incomplete.");
    }

    const now = new Date().toISOString();
    loading.status = "Ready for Handover";
    loading.loadingProgress = 100;
    loading.completedAt = now;
    loading.handoverReadyAt = now;
    loading.dispatchReadinessValidated = true;
    if (notes) loading.notes = notes;

    // Update or create carrier handover record
    const handover = this.getCarrierHandover(shipmentId);
    handover.handoverStatus = "Ready for Handover";
    handover.loadingStatus = "Loading Completed";
    if (sealNumber) handover.sealNumber = sealNumber.trim();
    if (notes) handover.notes = notes.trim();

    this.logWarehouseActivity(
      "Loading Completed",
      shipmentId,
      "Loading In Progress",
      "Ready for Handover",
      `Loading completed (100%). Seal: ${sealNumber || 'N/A'}. Ready for carrier handover confirmation.`
    );

    this.save();
    return loading;
  }

  getCarrierHandover(shipmentId) {
    if (!this.data.carrierHandovers) this.data.carrierHandovers = [];
    let h = this.data.carrierHandovers.find(item => item.shipmentId === shipmentId);
    if (!h) {
      const s = (this.data.shipments || []).find(item => item.id === shipmentId);
      const carrier = s && s.carrierId ? this.getCarrier(s.carrierId) : null;
      const apt = (this.data.dockAppointments || []).find(a => a.shipmentId === shipmentId);
      h = {
        id: `HND-${shipmentId}`,
        shipmentId: shipmentId,
        warehouseId: this.getCurrentWarehouseId(),
        carrierId: s ? s.carrierId : null,
        carrierName: carrier ? carrier.name : "Bridges Global Logistics",
        vehiclePlate: s ? s.vehicleId : "Plate TBD",
        driverName: s ? s.driverName : "Driver TBD",
        dockId: apt ? apt.dockId : null,
        loadingStatus: "Awaiting Loading",
        plannedDeparture: s ? s.departureTime : null,
        cargoVerificationStatus: "Pending Loading",
        sealNumber: null,
        handoverStatus: "Awaiting Readiness",
        proofReference: null,
        notes: "Handover pending warehouse readiness.",
        handoverTimestamp: null,
        handoverSignee: null,
        blockerReason: null
      };
      this.data.carrierHandovers.push(h);
    }
    return h;
  }

  confirmCarrierHandover(shipmentId, { carrierId, vehiclePlate, driverName, proofRef, sealNumber, notes }) {
    const handover = this.getCarrierHandover(shipmentId);
    const loading = this.getLoadingRecord(shipmentId);

    if (handover.handoverStatus === 'Handover Blocked') {
      throw new Error(`Cannot execute carrier handover: Handover is currently blocked (${handover.blockerReason || 'Unresolved blocker'}).`);
    }

    if (loading.status !== 'Ready for Handover' && loading.status !== 'Loading Completed') {
      throw new Error("Cannot execute carrier handover: Loading must be completed and marked Ready for Handover first.");
    }

    if (!proofRef || !proofRef.trim()) {
      throw new Error("A Bill of Lading or Proof of Handover document reference is required.");
    }
    if (!driverName || !driverName.trim()) {
      throw new Error("Authorized carrier driver name is required for physical handover sign-off.");
    }

    const now = new Date().toISOString();
    const prevStatus = handover.handoverStatus;

    handover.handoverStatus = "Handed Over";
    handover.cargoVerificationStatus = "Verified & Handed Over";
    handover.proofReference = proofRef.trim();
    if (carrierId) handover.carrierId = carrierId;
    if (vehiclePlate) handover.vehiclePlate = vehiclePlate;
    handover.driverName = driverName.trim();
    handover.handoverSignee = driverName.trim();
    handover.handoverTimestamp = now;
    if (sealNumber) handover.sealNumber = sealNumber.trim();
    if (notes) handover.notes = notes.trim();

    // Update loading record status
    loading.status = "Handed Over";

    // Update shared shipment record
    const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);
    if (shipment) {
      shipment.status = "Handed Over";
      shipment.currentLocation = `${this.getWarehouse(this.getCurrentWarehouseId()).name} - Dock Gate`;
    }

    // Record formal shipment event visible to Control Tower Analyst, Dispatcher, and Carrier
    this.recordShipmentEvent({
      shipmentId: shipmentId,
      eventType: "Warehouse Handover Completed",
      timestamp: now,
      reportedLocation: `${this.getWarehouse(this.getCurrentWarehouseId()).name} (${handover.dockId || 'Bay'})`,
      sourceSystem: "Warehouse Management System (WMS)",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: `Physical cargo handover executed to ${handover.carrierName} (Driver: ${driverName.trim()}, Vehicle: ${handover.vehiclePlate || 'Assigned'}). Proof: ${proofRef.trim()}. Seal: ${handover.sealNumber || 'N/A'}. Note: Final customer delivery remains carrier responsibility.`
    });

    this.logWarehouseActivity(
      "Carrier Handover Confirmed",
      shipmentId,
      prevStatus,
      "Handed Over",
      `Transferred custody to ${handover.carrierName} / ${driverName.trim()}. Ref: ${proofRef.trim()}.`
    );

    this.logAudit("Carrier Handover", "Handover Execution", shipmentId, `Custody transferred to ${handover.carrierName} (Driver: ${driverName.trim()}).`);
    this.save();
    return handover;
  }

  reportHandoverBlocker(shipmentId, reason, impact) {
    if (!reason || !reason.trim()) throw new Error("A reason is mandatory when reporting a handover blocker.");

    const handover = this.getCarrierHandover(shipmentId);
    handover.handoverStatus = "Handover Blocked";
    handover.blockerReason = reason.trim();

    this.createWarehouseBlocker({
      shipmentId,
      blockerType: "Handover failure",
      severity: "High",
      description: `Carrier handover blocked: ${reason.trim()}. Impact: ${impact || 'Shipment departure delayed.'}`,
      responsibleParty: "Carrier Governance / Warehouse Dispatch",
      requiredAction: "Coordinate with Carrier Dispatch and Dispatcher to clear discrepancy.",
      threatensDeliveryCommitment: true
    });

    this.logWarehouseActivity(
      "Handover Blocked",
      shipmentId,
      "Ready for Handover",
      "Handover Blocked",
      `Reason: ${reason.trim()}`
    );

    this.save();
    return handover;
  }

  getDiversions(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    const wh = this.getWarehouse(targetWhId);
    const whKeywords = [targetWhId, wh.code, wh.name, "Dallas"].map(k => (k || '').toLowerCase());

    return (this.data.diversionRequests || []).filter(d => {
      const dest = (d.proposedDiversionDestination || '').toLowerCase();
      return whKeywords.some(k => dest.includes(k));
    });
  }

  respondToDiversion(diversionId, decision, reason, receivingInstructions, assignedDock) {
    const div = (this.data.diversionRequests || []).find(d => d.id === diversionId);
    if (!div) throw new Error("Diversion request not found.");

    if (decision === 'Rejected') {
      if (!reason || !reason.trim()) {
        throw new Error("A specific reason is mandatory when rejecting a diversion request.");
      }
      div.status = "Rejected";
      div.rejectionReason = reason.trim();
      div.reviewedAt = new Date().toISOString();
      div.reviewedBy = "Carlos Mendoza";

      this.logWarehouseActivity(
        "Diversion Rejected",
        div.shipmentId,
        "Pending Review",
        "Rejected",
        `Rejected inbound diversion. Reason: ${reason.trim()}`
      );

      this.recordShipmentEvent({
        shipmentId: div.shipmentId,
        eventType: "Diversion Rejected by Warehouse",
        timestamp: new Date().toISOString(),
        reportedLocation: this.getWarehouse(this.getCurrentWarehouseId()).name,
        sourceSystem: "WMS Diversion Console",
        processingStatus: "Exception Created",
        relatedExceptionId: null,
        details: `Warehouse Supervisor rejected incoming diversion for shipment ${div.shipmentId}. Reason: ${reason.trim()}. Re-routing requires Dispatcher intervention.`
      });
    } else if (decision === 'Accepted') {
      div.status = "Accepted";
      div.receivingReadiness = "Ready - Receiving Staged";
      if (receivingInstructions) div.receivingInstructions = receivingInstructions.trim();
      if (assignedDock) div.assignedDock = assignedDock;
      div.reviewedAt = new Date().toISOString();
      div.reviewedBy = "Carlos Mendoza";

      // If dock assigned, update dock
      if (assignedDock) {
        try {
          this.assignDock(div.shipmentId, assignedDock, "16:00 - 18:30", new Date().toISOString().split('T')[0], `Diverted shipment receiving: ${div.diversionReason}`);
        } catch (e) {
          console.warn("Could not auto-book dock for diversion:", e.message);
        }
      }

      this.logWarehouseActivity(
        "Diversion Accepted",
        div.shipmentId,
        "Pending Review",
        "Accepted",
        `Accepted diverted shipment. Assigned dock: ${assignedDock || 'TBD'}. Instructions: ${receivingInstructions || 'Standard inbound protocol.'}`
      );

      this.recordShipmentEvent({
        shipmentId: div.shipmentId,
        eventType: "Diversion Accepted by Warehouse",
        timestamp: new Date().toISOString(),
        reportedLocation: this.getWarehouse(this.getCurrentWarehouseId()).name,
        sourceSystem: "WMS Diversion Console",
        processingStatus: "Processed",
        relatedExceptionId: null,
        details: `Dallas Central Logistics Hub accepted emergency diversion of shipment ${div.shipmentId}. Pre-assigned Dock: ${assignedDock || 'Receiving Bay'}. Expected ETA: ${div.expectedArrival || 'Today'}.`
      });
    }

    this.save();
    return div;
  }

  recordDiversionArrival(diversionId, receivingDock) {
    const div = (this.data.diversionRequests || []).find(d => d.id === diversionId);
    if (!div) throw new Error("Diversion record not found.");

    div.status = "Arrived";
    if (receivingDock) div.assignedDock = receivingDock;
    div.arrivedAt = new Date().toISOString();

    const shipment = (this.data.shipments || []).find(s => s.id === div.shipmentId);
    if (shipment) {
      shipment.status = "Arrived at Hub";
      shipment.currentLocation = `${this.getWarehouse(this.getCurrentWarehouseId()).name} - Receiving Bay`;
    }

    this.logWarehouseActivity(
      "Diverted Shipment Arrived",
      div.shipmentId,
      "Accepted",
      "Arrived",
      `Vehicle arrived at ${div.assignedDock || 'Receiving Gate'}. Ready for inspection.`
    );

    this.save();
    return div;
  }

  updateDiversionReceiving(diversionId, { status, receivedQty, notes }) {
    const div = (this.data.diversionRequests || []).find(d => d.id === diversionId);
    if (!div) throw new Error("Diversion record not found.");

    const prevStatus = div.status;
    if (status) div.status = status;
    if (receivedQty !== undefined) div.receivedQuantity = parseInt(receivedQty, 10);
    if (notes) div.receivingNotes = notes;

    if (status === 'Received') {
      div.receivedAt = new Date().toISOString();
      const shipment = (this.data.shipments || []).find(s => s.id === div.shipmentId);
      if (shipment) {
        shipment.status = "Received at Hub";
      }

      this.recordShipmentEvent({
        shipmentId: div.shipmentId,
        eventType: "Diverted Cargo Fully Received",
        timestamp: new Date().toISOString(),
        reportedLocation: this.getWarehouse(this.getCurrentWarehouseId()).name,
        sourceSystem: "WMS Receiving Terminal",
        processingStatus: "Processed",
        relatedExceptionId: null,
        details: `Shipment ${div.shipmentId} verified and fully received into warehouse inventory (${div.receivedQuantity}/${div.expectedQuantity} units checked). Staged for resolution.`
      });
    }

    this.logWarehouseActivity(
      "Diversion Receiving Updated",
      div.shipmentId,
      prevStatus,
      div.status,
      `Received units: ${div.receivedQuantity || 0}/${div.expectedQuantity || 'All'}. ${notes || ''}`
    );

    this.save();
    return div;
  }

  getWarehouseBlockers(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    return (this.data.warehouseBlockers || []).filter(b => b.warehouseId === targetWhId);
  }

  createWarehouseBlocker({ shipmentId, blockerType, severity, description, responsibleParty, requiredAction, threatensDeliveryCommitment, linkedShipmentExceptionId }) {
    if (!blockerType) throw new Error("Blocker type is required.");
    if (!description || !description.trim()) throw new Error("Description of operational blocker is required.");

    const targetWhId = this.getCurrentWarehouseId();
    if (!this.data.warehouseBlockers) this.data.warehouseBlockers = [];

    const now = new Date().toISOString();
    const blocker = {
      id: `WB-${Math.floor(5000 + Math.random() * 5000)}`,
      shipmentId: shipmentId || "GENERAL",
      warehouseId: targetWhId,
      blockerType: blockerType,
      severity: severity || "Medium",
      description: description.trim(),
      detectedTime: now,
      status: "Open",
      responsibleParty: responsibleParty || "Warehouse Operations",
      requiredAction: requiredAction || "Review and resolve blocker.",
      threatensDeliveryCommitment: !!threatensDeliveryCommitment,
      linkedShipmentExceptionId: linkedShipmentExceptionId || null,
      resolutionNotes: null,
      resolvedAt: null,
      createdBy: "Carlos Mendoza"
    };

    this.data.warehouseBlockers.unshift(blocker);

    // If linked to shipment, mark readiness as blocked
    if (shipmentId && shipmentId !== 'GENERAL') {
      const readiness = this.getWarehouseReadiness(shipmentId);
      if (readiness) {
        readiness.overallStatus = "Blocked";
        readiness.blockedReason = description.trim();
      }

      if (threatensDeliveryCommitment) {
        const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);
        if (shipment) {
          shipment.slaRisk = severity === "Critical" ? "Critical" : "High";
        }
      }
    }

    this.logWarehouseActivity(
      "Warehouse Blocker Created",
      shipmentId || "GENERAL",
      "None",
      "Blocked",
      `[${severity}] ${blockerType}: ${description.trim()}`
    );

    this.logAudit("Warehouse Blocker", "Exception Management", blocker.id, `Created ${blocker.severity} blocker for ${blocker.shipmentId}: ${blocker.description}`);
    this.save();
    return blocker;
  }

  resolveWarehouseBlocker(blockerId, resolutionNotes) {
    if (!resolutionNotes || !resolutionNotes.trim()) throw new Error("Resolution notes are required to resolve a blocker.");

    const blocker = (this.data.warehouseBlockers || []).find(b => b.id === blockerId);
    if (!blocker) throw new Error("Blocker not found.");

    blocker.status = "Resolved";
    blocker.resolutionNotes = resolutionNotes.trim();
    blocker.resolvedAt = new Date().toISOString();

    // Check if shipment has other open blockers
    if (blocker.shipmentId && blocker.shipmentId !== 'GENERAL') {
      const remainingOpen = (this.data.warehouseBlockers || []).filter(b => b.shipmentId === blocker.shipmentId && b.status === 'Open');
      if (remainingOpen.length === 0) {
        const readiness = this.getWarehouseReadiness(blocker.shipmentId);
        if (readiness) {
          this.recalculateReadinessStatus(readiness);
        }
        const handover = this.getCarrierHandover(blocker.shipmentId);
        if (handover && handover.handoverStatus === 'Handover Blocked') {
          handover.handoverStatus = "Ready for Handover";
          handover.blockerReason = null;
        }
      }
    }

    this.logWarehouseActivity(
      "Warehouse Blocker Resolved",
      blocker.shipmentId,
      "Open",
      "Resolved",
      resolutionNotes.trim()
    );

    this.logAudit("Blocker Resolved", "Exception Management", blockerId, `Resolved blocker ${blockerId}: ${resolutionNotes.trim()}`);
    this.save();
    return blocker;
  }

  getWarehouseActivity(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    return (this.data.warehouseActivity || []).filter(a => !a.warehouseId || a.warehouseId === targetWhId || a.warehouse.includes("Dallas") || a.warehouse.includes("DAL-01"));
  }

  logWarehouseActivity(action, shipmentId, prevStatus, newStatus, notes) {
    if (!this.data.warehouseActivity) this.data.warehouseActivity = [];
    const wh = this.getWarehouse(this.getCurrentWarehouseId());
    const entry = {
      id: `WACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user: "Carlos Mendoza",
      warehouse: `${wh.name} (${wh.id})`,
      warehouseId: wh.id,
      shipmentId: shipmentId || "N/A",
      action: action,
      previousStatus: prevStatus || "None",
      newStatus: newStatus || "Updated",
      notes: notes || ""
    };
    this.data.warehouseActivity.unshift(entry);
    // Keep max 200 history entries
    if (this.data.warehouseActivity.length > 200) {
      this.data.warehouseActivity = this.data.warehouseActivity.slice(0, 200);
    }
  }

  // =========================================================================
  // Warehouse Supervisor: Exception Response, Execution & Receiving Methods
  // =========================================================================

  getEtaChangeAlerts(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    if (!this.data.etaChangeAlerts) this.data.etaChangeAlerts = [];
    return this.data.etaChangeAlerts.filter(a => !a.warehouseId || a.warehouseId === targetWhId);
  }

  acknowledgeEtaAlert(alertId, notes) {
    if (!this.data.etaChangeAlerts) this.data.etaChangeAlerts = [];
    const alert = this.data.etaChangeAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error("ETA alert not found.");

    alert.status = "Acknowledged";
    alert.supervisorResponse = notes || "Acknowledged by shift supervisor.";
    alert.acknowledgedAt = new Date().toISOString();

    this.logWarehouseActivity(
      "ETA Alert Acknowledged",
      alert.shipmentId,
      "Pending Response",
      "Acknowledged",
      `Supervisor acknowledged carrier ETA revision (+${alert.delayMinutes}m). ${notes || ''}`
    );

    this.save();
    return alert;
  }

  respondToRevisedDockSlot(alertId, decision, { newDockId, newSlot, reason } = {}) {
    if (!this.data.etaChangeAlerts) this.data.etaChangeAlerts = [];
    const alert = this.data.etaChangeAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error("ETA alert not found.");

    const now = new Date().toISOString();

    if (decision === 'Accept') {
      alert.status = "Slot Accepted";
      alert.supervisorResponse = `Accepted revised dock slot ${newSlot || alert.proposedDockSlot} at ${newDockId || alert.currentDockId}.`;
      alert.reviewedAt = now;

      // Update or create dock appointment
      const targetDock = newDockId || alert.currentDockId;
      const targetSlot = newSlot || alert.proposedDockSlot;

      if (!this.data.dockAppointments) this.data.dockAppointments = [];
      let apt = this.data.dockAppointments.find(a => a.shipmentId === alert.shipmentId);
      if (apt) {
        apt.dockId = targetDock;
        apt.timeSlot = targetSlot;
        apt.notes = `Slot revised to accommodate carrier ETA delay: ${alert.reason}`;
      } else {
        apt = {
          id: `APT-${Date.now().toString().slice(-4)}`,
          dockId: targetDock,
          warehouseId: this.getCurrentWarehouseId(),
          shipmentId: alert.shipmentId,
          direction: "Inbound",
          carrierName: alert.carrierName,
          vehiclePlate: alert.vehiclePlate,
          driverName: alert.driverName,
          timeSlot: targetSlot,
          date: now.split('T')[0],
          appointmentStatus: "Scheduled",
          readinessStatus: "Ready",
          notes: `Created for revised ETA arrival: ${alert.reason}`
        };
        this.data.dockAppointments.push(apt);
      }

      // Update dock bay
      const dock = (this.data.docks || []).find(d => d.id === targetDock && d.warehouseId === this.getCurrentWarehouseId());
      if (dock) {
        dock.timeSlot = targetSlot;
        dock.currentShipmentId = alert.shipmentId;
        dock.currentCarrier = alert.carrierName;
      }

      // Sync shipment record
      const s = (this.data.shipments || []).find(x => x.id === alert.shipmentId);
      if (s) {
        s.assignedDock = targetDock;
        s.predictedETA = alert.revisedETA;
      }

      this.logWarehouseActivity(
        "Revised Dock Slot Accepted",
        alert.shipmentId,
        alert.currentDockId,
        targetDock,
        `Confirmed revised dock slot ${targetSlot} at ${targetDock}. Carrier notified.`
      );

      this.recordShipmentEvent({
        shipmentId: alert.shipmentId,
        eventType: "Dock Slot Revised by Warehouse",
        timestamp: now,
        reportedLocation: this.getWarehouse(this.getCurrentWarehouseId()).name,
        sourceSystem: "Warehouse Management System (WMS)",
        processingStatus: "Processed",
        relatedExceptionId: null,
        details: `Supervisor Carlos Mendoza accepted revised arrival window. Assigned to ${targetDock} (Slot: ${targetSlot}) due to ${alert.reason}.`
      });

    } else {
      // Reject
      if (!reason || !reason.trim()) {
        throw new Error("A specific operational reason is required to reject a revised dock slot.");
      }
      alert.status = "Slot Rejected";
      alert.rejectionReason = reason.trim();
      alert.supervisorResponse = `Rejected revised slot. Reason: ${reason.trim()}`;
      alert.reviewedAt = now;

      this.logWarehouseActivity(
        "Revised Dock Slot Rejected",
        alert.shipmentId,
        alert.currentDockId,
        "Rejected",
        `Rejected slot revision. Reason: ${reason.trim()}`
      );

      this.recordShipmentEvent({
        shipmentId: alert.shipmentId,
        eventType: "Revised Dock Slot Rejected",
        timestamp: now,
        reportedLocation: this.getWarehouse(this.getCurrentWarehouseId()).name,
        sourceSystem: "Warehouse Management System (WMS)",
        processingStatus: "Exception Created",
        relatedExceptionId: null,
        details: `Warehouse Supervisor rejected revised slot for ${alert.shipmentId}. Reason: ${reason.trim()}. Carrier and Dispatcher must coordinate alternate staging.`
      });
    }

    this.save();
    return alert;
  }

  acknowledgeWarehouseException(blockerId, notes) {
    const blocker = (this.data.warehouseBlockers || []).find(b => b.id === blockerId);
    if (!blocker) throw new Error("Blocker not found.");

    blocker.acknowledged = true;
    blocker.acknowledgedAt = new Date().toISOString();
    blocker.acknowledgedBy = "Carlos Mendoza";
    blocker.acknowledgementNotes = notes || "Acknowledged and being tracked on shift floor.";

    this.logWarehouseActivity(
      "Exception Acknowledged",
      blocker.shipmentId,
      blocker.status,
      "Acknowledged",
      `Supervisor acknowledged ${blocker.severity} blocker (${blocker.blockerType}). ${notes || ''}`
    );

    this.logAudit("Exception Acknowledged", "Warehouse Operations", blockerId, `Supervisor Carlos Mendoza acknowledged ${blocker.blockerType} for ${blocker.shipmentId}`);
    this.save();
    return blocker;
  }

  escalateWarehouseCapacity(warehouseId, { issueType, severity, capacityMetric, impactedAreas, description, mitigationAction } = {}) {
    if (!description || !description.trim()) {
      throw new Error("A description of the capacity or readiness bottleneck is mandatory.");
    }

    const wh = this.getWarehouse(warehouseId || this.getCurrentWarehouseId());
    const now = new Date().toISOString();
    const blockerId = `WB-CAP-${Math.floor(1000 + Math.random() * 9000)}`;

    const blocker = {
      id: blockerId,
      shipmentId: "FACILITY-CAPACITY",
      warehouseId: wh.id,
      blockerType: issueType || "Facility Capacity Bottleneck",
      severity: severity || "Critical",
      description: `[${wh.name}] ${description.trim()} | Metric: ${capacityMetric || 'Capacity Threshold Breached'} | Impact: ${impactedAreas || 'Dock & Staging'}`,
      detectedTime: now,
      status: "Open",
      responsibleParty: "Control Tower Operations & Lead Dispatcher",
      requiredAction: mitigationAction || "Hold inbound dispatches; divert non-critical trailers to secondary hubs.",
      threatensDeliveryCommitment: true,
      acknowledged: true,
      acknowledgedAt: now,
      acknowledgedBy: "Carlos Mendoza",
      resolutionNotes: null,
      resolvedAt: null,
      createdBy: "Carlos Mendoza"
    };

    if (!this.data.warehouseBlockers) this.data.warehouseBlockers = [];
    this.data.warehouseBlockers.unshift(blocker);

    this.logWarehouseActivity(
      "Capacity Escalated to Control Tower",
      "FACILITY-CAPACITY",
      "Normal Operations",
      "Congested / Blocked",
      `[${severity}] ${issueType}: ${description.trim()}. Mitigation: ${mitigationAction || 'Divert inbound freight'}`
    );

    this.recordShipmentEvent({
      shipmentId: "FACILITY-ALERT",
      eventType: "Warehouse Capacity Escalation",
      timestamp: now,
      reportedLocation: wh.name,
      sourceSystem: "WMS Capacity Monitor",
      processingStatus: "Escalated to War Room",
      relatedExceptionId: null,
      details: `CRITICAL FACILITY ALERT: ${wh.name} reports severe capacity hold. ${description.trim()}. Mitigation requested: ${mitigationAction || 'Hold trailers'}.`
    });

    this.logAudit("Capacity Escalation", "Facility Governance", blockerId, `Warehouse supervisor escalated ${issueType} at ${wh.name}`);
    this.save();
    return blocker;
  }

  recordWarehouseMilestone(shipmentId, milestoneType, { dockId, timestamp, sealNumber, temperature, notes, operatorName } = {}) {
    if (!shipmentId) throw new Error("Shipment ID is required.");
    if (!milestoneType) throw new Error("Milestone type is required.");

    const now = timestamp || new Date().toISOString();
    const wh = this.getWarehouse(this.getCurrentWarehouseId());
    const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);
    if (!shipment) throw new Error("Shipment not found in master records.");

    // Update shipment milestones list
    if (!shipment.milestones) shipment.milestones = [];
    shipment.milestones.push({
      name: milestoneType,
      time: now,
      dockId: dockId || shipment.assignedDock || null,
      sealNumber: sealNumber || null,
      temperature: temperature || null,
      operator: operatorName || "Carlos Mendoza",
      notes: notes || "",
      status: "completed"
    });

    // Update shipment state based on milestone
    if (milestoneType.includes("Arrival at Gate")) {
      shipment.status = "Arrived at Gate";
      shipment.actualArrival = now;
      shipment.currentLocation = `${wh.name} - Gate Check-in`;
    } else if (milestoneType.includes("Docked at Bay")) {
      shipment.status = "At Dock Bay";
      if (dockId) {
        shipment.assignedDock = dockId;
        this.updateDockStatus(dockId, "Occupied", `Occupied by ${shipmentId}`);
      }
      shipment.currentLocation = `${wh.name} - ${dockId || 'Bay'}`;
    } else if (milestoneType.includes("Receiving Commenced")) {
      shipment.status = "Receiving In Progress";
      shipment.currentLocation = `${wh.name} - Receiving Dock`;
    } else if (milestoneType.includes("Receiving Completed") || milestoneType.includes("Inbound Cargo Receiving")) {
      shipment.status = "Delivered & Received at Hub";
      shipment.currentLocation = `${wh.name} - High-Bay Staging`;
    } else if (milestoneType.includes("Pickup Readiness Certified")) {
      const readiness = this.getWarehouseReadiness(shipmentId);
      if (readiness) {
        readiness.overallStatus = "Ready";
        readiness.blockedReason = null;
      }
      shipment.readinessStatus = "Ready";
    } else if (milestoneType.includes("Loading Commenced")) {
      shipment.status = "Loading In Progress";
      const loading = this.getLoadingRecord(shipmentId);
      loading.status = "Loading In Progress";
      loading.startedAt = now;
    } else if (milestoneType.includes("Loading Completed") || milestoneType.includes("Sealed")) {
      shipment.status = "Loading Completed";
      const loading = this.getLoadingRecord(shipmentId);
      loading.status = "Ready for Handover";
      loading.loadingProgress = 100;
      if (sealNumber) {
        const handover = this.getCarrierHandover(shipmentId);
        handover.sealNumber = sealNumber;
      }
    } else if (milestoneType.includes("Dispatched") || milestoneType.includes("Carrier Departure")) {
      shipment.status = "In Transit";
      shipment.currentLocation = `${wh.name} - Outbound Rolling`;
      if (dockId) {
        this.releaseDock(dockId, shipmentId);
      }
    }

    // Broadcast formal Control Tower shipment event
    this.recordShipmentEvent({
      shipmentId: shipmentId,
      eventType: `Warehouse Milestone: ${milestoneType}`,
      timestamp: now,
      reportedLocation: `${wh.name} (${dockId || 'Facility'})`,
      sourceSystem: "Warehouse Management System (WMS)",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: `Milestone verified by supervisor: ${milestoneType}. Dock: ${dockId || 'N/A'}. Seal: ${sealNumber || 'N/A'}. Temp: ${temperature || 'Compliant'}. Notes: ${notes || 'Verified on shift floor.'}`
    });

    this.logWarehouseActivity(
      `Milestone Recorded: ${milestoneType}`,
      shipmentId,
      "Active",
      milestoneType,
      `Dock: ${dockId || 'Assigned'}, Seal: ${sealNumber || 'N/A'}, Temp: ${temperature || 'N/A'}. ${notes || ''}`
    );

    this.save();
    return shipment;
  }

  confirmCargoTransferAndColdChain(shipmentId, { coreTemperature, minTemp, maxTemp, loggerId, sealNumber, preChillVerified, driverSignature, supervisorNotes } = {}) {
    if (!coreTemperature) throw new Error("Core temperature reading is required for cold chain certification.");
    const tempNum = parseFloat(coreTemperature);
    const min = minTemp !== undefined ? parseFloat(minTemp) : 2.0;
    const max = maxTemp !== undefined ? parseFloat(maxTemp) : 8.0;

    const inRange = !isNaN(tempNum) && tempNum >= min && tempNum <= max;
    const now = new Date().toISOString();
    const wh = this.getWarehouse(this.getCurrentWarehouseId());

    // Update readiness record
    const readiness = this.getWarehouseReadiness(shipmentId);
    if (readiness && readiness.checklist) {
      if (readiness.checklist.cargoInventory) {
        readiness.checklist.cargoInventory.status = inRange ? "Ready" : "Blocked";
        readiness.checklist.cargoInventory.notes = inRange 
          ? `Cold-Chain Certified: ${tempNum}°C (Spec ${min}°C - ${max}°C). Pre-chill: ${preChillVerified ? 'Verified' : 'Bypassed'}. Logger: ${loggerId || 'SL-LOG-01'}`
          : `THERMAL EXCURSION: ${tempNum}°C outside permissible range ${min}°C to ${max}°C!`;
      }
      if (readiness.checklist.operationalConstraints) {
        readiness.checklist.operationalConstraints.status = "Ready";
        readiness.checklist.operationalConstraints.notes = `Driver Signoff: ${driverSignature || 'Verified'}. Seal: ${sealNumber || 'Verified'}`;
      }
      this.recalculateReadinessStatus(readiness);
    }

    // Update handover record
    const handover = this.getCarrierHandover(shipmentId);
    if (handover) {
      if (sealNumber) handover.sealNumber = sealNumber.trim();
      handover.coldChainCertified = inRange;
      handover.certifiedTemperature = `${tempNum}°C`;
      handover.temperatureLoggerId = loggerId || 'LOG-DATATRACE-01';
      handover.preChillVerified = !!preChillVerified;
      if (driverSignature) handover.driverName = driverSignature.trim();
    }

    if (!inRange) {
      // Create blocker for thermal breach
      this.createWarehouseBlocker({
        shipmentId,
        blockerType: "Temperature Breach",
        severity: "Critical",
        description: `Cargo transfer halted: Product core temperature ${tempNum}°C breaches specified tolerance (${min}°C to ${max}°C).`,
        responsibleParty: "Quality Assurance / Refrigeration Tech",
        requiredAction: "Isolate pallet in rapid-chill chamber, evaluate thermal stability data, alert Control Tower Analyst.",
        threatensDeliveryCommitment: true
      });
      throw new Error(`Thermal Excursion Detected: Core temperature ${tempNum}°C is outside the safe range (${min}°C to ${max}°C). Blocker created.`);
    }

    this.recordShipmentEvent({
      shipmentId: shipmentId,
      eventType: "Cold-Chain & Cargo Transfer Certified",
      timestamp: now,
      reportedLocation: wh.name,
      sourceSystem: "WMS Cryo-Sensor Telemetry",
      processingStatus: "Processed",
      relatedExceptionId: null,
      details: `Full Cold-Chain Readiness and Cargo Custody Certified. Core probe temp: ${tempNum}°C (Spec: ${min}°C - ${max}°C). Pre-chill verified. Seal: ${sealNumber || 'N/A'}. Driver signoff: ${driverSignature || 'Signed'}.`
    });

    this.logWarehouseActivity(
      "Cold-Chain Certified",
      shipmentId,
      "Inspection",
      "Certified Ready",
      `Core Temp: ${tempNum}°C. Seal: ${sealNumber || 'Verified'}. Pre-chill: ${preChillVerified ? 'Yes' : 'No'}. Signed: ${driverSignature || 'Driver'}`
    );

    this.save();
    return { certified: true, coreTemperature: tempNum, sealNumber };
  }

  confirmWarehouseReceiving(shipmentId, { receivedQty, damagedQty, rejectedQty, discrepancyNotes, inspectionDocName, conditionOutcome, confirmDeliveryCompleted } = {}) {
    if (!shipmentId) throw new Error("Shipment ID is required.");
    const wh = this.getWarehouse(this.getCurrentWarehouseId());
    const shipment = (this.data.shipments || []).find(s => s.id === shipmentId);
    if (!shipment) throw new Error("Shipment record not found.");

    const rQty = parseInt(receivedQty, 10) || 0;
    const dQty = parseInt(damagedQty, 10) || 0;
    const rejQty = parseInt(rejectedQty, 10) || 0;
    const expectedQty = parseInt(shipment.weightKg || shipment.pieces || 120, 10) || 120;
    const totalAccounted = rQty + dQty + rejQty;
    const discrepancy = totalAccounted - expectedQty;
    const now = new Date().toISOString();

    if (!this.data.warehouseReceivingRecords) this.data.warehouseReceivingRecords = [];
    const recId = `REC-${Date.now().toString().slice(-5)}`;

    const recRecord = {
      id: recId,
      shipmentId,
      warehouseId: wh.id,
      dockId: shipment.assignedDock || "Receiving Bay 05",
      carrierName: shipment.carrierName || "Motor Freight",
      vehiclePlate: shipment.vehiclePlate || shipment.vehicleId || "TX-9921",
      expectedQty,
      receivedQty: rQty,
      damagedQty: dQty,
      rejectedQty: rejQty,
      discrepancyCount: discrepancy,
      conditionOutcome: conditionOutcome || (dQty > 0 ? "Damaged Units Quarantined" : (discrepancy !== 0 ? "Piece Discrepancy Flagged" : "Passed 100% Clean")),
      discrepancyNotes: discrepancyNotes || (dQty > 0 ? `Damage reported on ${dQty} units.` : "Inbound receipt fully verified with clean manifest."),
      inspectionDocs: inspectionDocName ? [
        { name: inspectionDocName, size: "420 KB", uploadedAt: now }
      ] : [
        { name: `Inbound_Tally_Sheet_${shipmentId}.pdf`, size: "385 KB", uploadedAt: now },
        { name: `Dock_Inspection_Photo_${shipmentId}.jpg`, size: "1.4 MB", uploadedAt: now }
      ],
      completedAt: now,
      supervisorSignoff: "Carlos Mendoza",
      deliveryCompleted: !!confirmDeliveryCompleted
    };

    this.data.warehouseReceivingRecords.unshift(recRecord);

    // If delivery completed confirmed, update shipment status
    if (confirmDeliveryCompleted) {
      shipment.status = "Delivered & Received at Hub";
      shipment.actualArrival = now;
      shipment.currentLocation = `${wh.name} - Inbound High-Bay Intake`;

      this.recordShipmentEvent({
        shipmentId,
        eventType: "Inbound Delivery Completed at Warehouse",
        timestamp: now,
        reportedLocation: wh.name,
        sourceSystem: "WMS Receiving Console",
        processingStatus: "Processed",
        relatedExceptionId: null,
        details: `Official receiving completed at ${wh.name}. Good: ${rQty}, Damaged: ${dQty}, Rejected: ${rejQty}. Discrepancy: ${discrepancy}. Certified by Supervisor Carlos Mendoza.`
      });
    }

    // If damage or discrepancy found, flag an operational blocker
    if (dQty > 0 || rejQty > 0 || discrepancy !== 0) {
      this.createWarehouseBlocker({
        shipmentId,
        blockerType: dQty > 0 ? "Damaged goods" : "Cargo discrepancy",
        severity: dQty > 5 || Math.abs(discrepancy) > 5 ? "Critical" : "High",
        description: `Receiving discrepancy for ${shipmentId}: ${rQty} accepted, ${dQty} damaged, ${rejQty} rejected. Variance: ${discrepancy} units. ${discrepancyNotes || ''}`,
        responsibleParty: "Warehouse QA / Carrier Claims",
        requiredAction: "Hold damaged cargo in secure quarantine area, inspect seal history, file carrier discrepancy claim.",
        threatensDeliveryCommitment: true
      });
    }

    this.logWarehouseActivity(
      "Inbound Receiving Confirmed",
      shipmentId,
      "Inbound Transit",
      confirmDeliveryCompleted ? "Delivered & Received" : "Partially Received",
      `Received: ${rQty}, Damaged: ${dQty}, Rejected: ${rejQty}. Discrepancy: ${discrepancy}. Delivery Complete: ${confirmDeliveryCompleted ? 'Yes' : 'No'}`
    );

    this.logAudit("Receiving Confirmation", "Warehouse Inbound", recId, `Confirmed receipt of ${shipmentId} (Good: ${rQty}, Damaged: ${dQty}, Rejected: ${rejQty})`);
    this.save();
    return recRecord;
  }

  getWarehouseReceivingRecords(whId) {
    const targetWhId = whId || this.getCurrentWarehouseId();
    if (!this.data.warehouseReceivingRecords) this.data.warehouseReceivingRecords = [];
    return this.data.warehouseReceivingRecords.filter(r => !r.warehouseId || r.warehouseId === targetWhId);
  }

  // =========================================================================
  // Phase 6: Customer Service Store Methods
  // =========================================================================

  getCSMetrics() {
    const shipments = this.data.shipments || [];
    const exceptions = this.data.exceptions || [];
    const communications = this.data.communications || [];

    // Open Exceptions (operational exceptions not resolved/closed)
    const openExceptions = exceptions.filter(e => !['Resolved', 'Closed'].includes(e.status)).length;

    // Customers Requiring Updates
    const customersRequiringUpdates = shipments.filter(s => s.customerUpdateStatus === 'Update Required').length;

    // ETA Changes Requiring Review (pending operational review)
    const etaChangesRequiringReview = shipments.filter(s => s.etaApprovalStatus === 'Pending Review').length;

    // SLA-at-Risk Shipments (Critical or High SLA risk not delivered)
    const slaAtRiskShipments = shipments.filter(s => ['Critical', 'High'].includes(s.slaRisk) && s.status !== 'Delivered').length;

    // Messages Awaiting Review
    const messagesAwaitingReview = communications.filter(c => c.status === 'Awaiting Review').length;

    // Messages Sent Today (or Sent in demo lifecycle)
    const messagesSentToday = communications.filter(c => c.status === 'Sent').length;

    return {
      openExceptions,
      customersRequiringUpdates,
      etaChangesRequiringReview,
      slaAtRiskShipments,
      messagesAwaitingReview,
      messagesSentToday
    };
  }

  getCommunications(filter = {}) {
    let list = (this.data.communications || []).slice();

    // Normalize each record so body & message, template & templateName are always populated
    list.forEach(c => {
      const text = c.body !== undefined ? c.body : (c.message !== undefined ? c.message : '');
      c.body = text;
      c.message = text;
      const tmpl = c.template || c.templateName || 'Status Confirmation';
      c.template = tmpl;
      c.templateName = tmpl;
    });

    if (filter.shipmentId) {
      list = list.filter(c => c.shipmentId === filter.shipmentId);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter.channel && filter.channel !== 'All') {
      list = list.filter(c => c.channel === filter.channel);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(c => 
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.shipmentId && c.shipmentId.toLowerCase().includes(q)) ||
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.consigneeName && c.consigneeName.toLowerCase().includes(q)) ||
        (c.customerReference && c.customerReference.toLowerCase().includes(q)) ||
        (c.orderReference && c.orderReference.toLowerCase().includes(q)) ||
        (c.templateName && c.templateName.toLowerCase().includes(q)) ||
        (c.template && c.template.toLowerCase().includes(q)) ||
        (c.message && c.message.toLowerCase().includes(q)) ||
        (c.body && c.body.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));
  }

  getCommunication(id) {
    const c = (this.data.communications || []).find(c => c.id === id);
    if (c) {
      const text = c.body !== undefined ? c.body : (c.message !== undefined ? c.message : '');
      c.body = text;
      c.message = text;
      const tmpl = c.template || c.templateName || 'Status Confirmation';
      c.template = tmpl;
      c.templateName = tmpl;
    }
    return c;
  }

  saveCommunication(data) {
    if (!this.data.communications) this.data.communications = [];

    // Check if updating existing record or reusing open draft for same shipment
    let record = null;
    if (data.id) {
      record = this.data.communications.find(c => c.id === data.id);
    } else if (data.shipmentId && (data.status === 'Draft' || data.status === 'Awaiting Review')) {
      // Avoid duplicate drafts for same shipment
      record = this.data.communications.find(c => c.shipmentId === data.shipmentId && c.status === 'Draft');
    }

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Clara Hughes (Customer Service)";
    const now = new Date().toISOString();

    const shipment = this.getShipment(data.shipmentId);
    const commBody = data.body !== undefined ? data.body : (data.message !== undefined ? data.message : '');
    const commTmpl = data.template || data.templateName || 'Status Confirmation';

    if (record) {
      record.templateId = data.templateId || record.templateId;
      record.templateName = commTmpl;
      record.template = commTmpl;
      record.channel = data.channel || record.channel;
      record.recipient = data.recipient || record.recipient;
      record.subject = data.subject !== undefined ? data.subject : record.subject;
      record.message = commBody;
      record.body = commBody;
      record.status = data.status || record.status;
      record.updatedAt = now;
      if (shipment) {
        record.approvedEtaUsed = shipment.approvedETA || shipment.estArrival;
      }
    } else {
      const newId = `COM-${Math.floor(6000 + Math.random() * 3999)}`;
      record = {
        id: newId,
        shipmentId: data.shipmentId,
        customerName: shipment ? shipment.customerName : (data.customerName || 'Customer'),
        consigneeName: shipment ? shipment.consigneeName : (data.consigneeName || 'Consignee'),
        customerReference: shipment ? shipment.customerReference : (data.customerReference || 'REF-N/A'),
        orderReference: shipment ? shipment.orderReference : (data.orderReference || 'ORD-N/A'),
        templateId: data.templateId || 'status_confirmation',
        templateName: commTmpl,
        template: commTmpl,
        channel: data.channel || 'Email',
        recipient: data.recipient || (shipment ? shipment.customerContact : ''),
        subject: data.subject || (data.channel === 'Email' ? `BRIDGES Status Update: Shipment ${data.shipmentId}` : null),
        message: commBody,
        body: commBody,
        status: data.status || 'Draft',
        createdBy: authorName,
        createdAt: now,
        sentAt: data.status === 'Sent' ? now : null,
        approvedEtaUsed: shipment ? (shipment.approvedETA || shipment.estArrival) : null,
        simulationNote: 'Simulated customer communication within demo environment'
      };
      this.data.communications.unshift(record);
    }

    if (shipment) {
      if (data.status === 'Awaiting Review') {
        shipment.customerUpdateStatus = 'Update Pending Review';
      }
    }

    this.logAudit("Customer Message Saved", "Customer Service", record.id, `Saved message for ${record.shipmentId} (Status: ${record.status}, Channel: ${record.channel}).`);
    this.save();
    return record;
  }

  sendSimulatedCommunication(id) {
    const record = this.getCommunication(id);
    if (!record) throw new Error("Communication record not found.");

    const now = new Date().toISOString();
    record.status = 'Sent';
    record.sentAt = now;

    // Update shipment customer contact status
    const shipment = this.getShipment(record.shipmentId);
    if (shipment) {
      shipment.customerUpdateStatus = 'Up to Date';
      shipment.lastCustomerContact = now;

      // Add customer communication milestone or log to milestones
      if (Array.isArray(shipment.milestones)) {
        shipment.milestones.push({
          name: `Customer Notified (${record.channel})`,
          time: now,
          status: 'completed'
        });
      }
    }

    this.logAudit("Simulated Message Sent", "Customer Service", record.id, `Simulated ${record.channel} communication sent to ${record.customerName} for ${record.shipmentId}.`);
    this.save();
    return record;
  }

  createCustomerServiceEscalation(data) {
    if (!this.data.escalations) this.data.escalations = [];

    const shipment = this.getShipment(data.shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    // Prevent duplicate open escalations for the same shipment and category
    const existing = this.data.escalations.find(e => 
      e.shipmentId === data.shipmentId && 
      e.category === data.category && 
      !['Resolved', 'Closed'].includes(e.status)
    );

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Clara Hughes (Customer Service)";

    if (existing) {
      // Append note to existing escalation instead of creating duplicate
      if (!existing.timeline) existing.timeline = [];
      existing.timeline.push({
        timestamp: now,
        author: authorName,
        note: `Customer Service Follow-up: ${data.reason}. Requested action: ${data.requestedAction || 'Urgent review'}`
      });
      existing.priority = data.priority || existing.priority;
      existing.updatedAt = now;
      existing.latestResponse = `Follow-up received from Customer Service: ${data.reason.slice(0, 60)}...`;
      this.logAudit("Escalation Follow-up Added", "Escalations", existing.id, `Customer Service added follow-up to open escalation for ${existing.shipmentId}.`);
      this.save();
      return { escalation: existing, isDuplicateUpdated: true };
    }

    // Determine smart routing based on category
    let assignedRole = 'Control Tower Analyst';
    let assignedUser = 'Sarah Lin';
    if (['Delivery Commitment at Risk', 'No Recent Shipment Update', 'Carrier Assignment Inquiry'].includes(data.category)) {
      assignedRole = 'Dispatcher / Transport Planner';
      assignedUser = 'Elena Rostova';
    } else if (data.category === 'ETA Confirmation Required' || data.category === 'Exception Status Clarification') {
      assignedRole = 'Control Tower Analyst';
      assignedUser = 'Sarah Lin';
    } else if (!data.category) {
      assignedRole = 'Unassigned';
      assignedUser = 'Unassigned';
    }

    const newId = `ESC-${Math.floor(4010 + Math.random() * 990)}`;
    const newEsc = {
      id: newId,
      shipmentId: data.shipmentId,
      category: data.category || 'Other',
      priority: data.priority || 'High',
      reason: data.reason || 'Operational inquiry on behalf of customer.',
      customerImpact: data.customerImpact || 'Potential customer dissatisfaction / penalty risk.',
      requestedAction: data.requestedAction || 'Operational status update and confirmation.',
      deadline: data.deadline || null,
      assignedRole: assignedRole,
      assignedUser: assignedUser,
      status: 'Open',
      latestResponse: `Assigned to ${assignedUser} (${assignedRole}) for operational investigation.`,
      timeline: [
        {
          timestamp: now,
          author: authorName,
          note: `Escalation raised: [${data.category}] ${data.reason}. Impact: ${data.customerImpact || 'N/A'}. Action requested: ${data.requestedAction || 'Review'}`
        }
      ],
      createdBy: authorName,
      createdAt: now,
      updatedAt: now
    };

    this.data.escalations.unshift(newEsc);
    this.logAudit("Operational Escalation Raised", "Customer Service", newEsc.id, `Raised ${newEsc.priority} escalation for ${newEsc.shipmentId} routed to ${assignedRole}.`);
    this.save();
    return { escalation: newEsc, isDuplicateUpdated: false };
  }

  addEscalationComment(escalationId, comment) {
    if (!comment || !comment.trim()) throw new Error("Comment text is required.");
    const esc = (this.data.escalations || []).find(e => e.id === escalationId);
    if (!esc) throw new Error("Escalation not found.");

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Clara Hughes (Customer Service)";
    const now = new Date().toISOString();

    if (!esc.timeline) esc.timeline = [];
    esc.timeline.push({
      timestamp: now,
      author: authorName,
      note: comment.trim()
    });
    esc.latestResponse = `${authorName}: ${comment.trim().slice(0, 60)}...`;
    esc.updatedAt = now;

    this.logAudit("Escalation Comment", "Escalations", escalationId, `Added comment by ${authorName}.`);
    this.save();
    return esc;
  }

  // --- CUSTOMER SERVICE EXTENSIONS ---
  retryCommunication(id) {
    const record = this.getCommunication(id);
    if (!record) throw new Error("Communication record not found.");

    const now = new Date().toISOString();
    record.status = 'Sent';
    record.sentAt = now;
    record.failureReason = null;
    record.retriedAt = now;
    record.retriedBy = "Clara Hughes (Customer Service)";

    const shipment = this.getShipment(record.shipmentId);
    if (shipment) {
      shipment.customerUpdateStatus = 'Up to Date';
      shipment.lastCustomerContact = now;

      if (!Array.isArray(shipment.milestones)) shipment.milestones = [];
      shipment.milestones.push({
        name: `Notification Retried & Delivered (${record.channel})`,
        time: now,
        status: 'completed'
      });
    }

    this.logAudit("Communication Retried", "Customer Service", record.id, `Retried failed ${record.channel} communication to ${record.recipient} for ${record.shipmentId}. Delivery confirmed.`);
    this.save();
    return record;
  }

  getCommunicationNotes(shipmentId) {
    if (!this.data.customerCommunicationNotes) this.data.customerCommunicationNotes = [];
    if (shipmentId) {
      return this.data.customerCommunicationNotes.filter(n => n.shipmentId === shipmentId);
    }
    return this.data.customerCommunicationNotes;
  }

  addCommunicationNote(shipmentId, noteData) {
    if (!this.data.customerCommunicationNotes) this.data.customerCommunicationNotes = [];
    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Clara Hughes (Customer Service)";
    const now = new Date().toISOString();
    const newId = `CNOTE-${Math.floor(1000 + Math.random() * 8999)}`;

    const newNote = {
      id: newId,
      shipmentId: shipmentId,
      customerName: shipment.customerName || noteData.customerName || 'Customer',
      contactPerson: noteData.contactPerson || 'Customer Representative',
      channel: noteData.channel || 'Inbound Phone Call',
      sentiment: noteData.sentiment || 'Neutral',
      note: noteData.note || '',
      author: authorName,
      timestamp: now
    };

    this.data.customerCommunicationNotes.unshift(newNote);
    this.logAudit("Customer Note Logged", "Customer Service", shipmentId, `Logged ${newNote.channel} note for ${shipmentId} (Sentiment: ${newNote.sentiment}).`);
    this.save();
    return newNote;
  }

  getCustomerFeedback(shipmentId) {
    if (!this.data.customerFeedback) this.data.customerFeedback = [];
    if (shipmentId) {
      return this.data.customerFeedback.filter(f => f.shipmentId === shipmentId);
    }
    return this.data.customerFeedback;
  }

  logCustomerFeedback(shipmentId, feedbackData) {
    if (!this.data.customerFeedback) this.data.customerFeedback = [];
    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = user ? `${user.name} (${user.role})` : "Clara Hughes (Customer Service)";
    const now = new Date().toISOString();
    const newId = `CFEED-${Math.floor(2000 + Math.random() * 7999)}`;

    const newFeedback = {
      id: newId,
      shipmentId: shipmentId,
      customerName: shipment.customerName || feedbackData.customerName || 'Customer',
      rating: feedbackData.rating || 3,
      sentiment: feedbackData.sentiment || 'Neutral',
      isComplaint: Boolean(feedbackData.isComplaint),
      complaintCategory: feedbackData.complaintCategory || null,
      complaintSeverity: feedbackData.complaintSeverity || null,
      requestedResolution: feedbackData.requestedResolution || null,
      feedbackText: feedbackData.feedbackText || '',
      author: feedbackData.author || (user ? user.name : 'Customer Contact'),
      loggedBy: authorName,
      timestamp: now
    };

    this.data.customerFeedback.unshift(newFeedback);

    // If it's a complaint, automatically escalate to Operations!
    let escalation = null;
    if (newFeedback.isComplaint) {
      escalation = this.createCustomerServiceEscalation({
        shipmentId: shipmentId,
        category: 'Customer Complaint',
        priority: newFeedback.complaintSeverity === 'Critical' ? 'Critical' : 'High',
        reason: `Customer Complaint Logged: [${newFeedback.complaintCategory || 'Service Issue'}] ${newFeedback.feedbackText}`,
        customerImpact: `Client Dissatisfaction (Rating: ${newFeedback.rating}/5, Sentiment: ${newFeedback.sentiment}). Requested: ${newFeedback.requestedResolution || 'Priority resolution'}`,
        requestedAction: `Review complaint and enact mitigation: ${newFeedback.requestedResolution || 'Expedite transit & fee waiver review'}`
      });
    }

    this.logAudit("Customer Feedback Recorded", "Customer Service", shipmentId, `Recorded feedback (${newFeedback.rating}/5 stars, Complaint: ${newFeedback.isComplaint ? 'YES' : 'NO'}).`);
    this.save();
    return { feedback: newFeedback, escalation };
  }

  getCustomerServiceAlerts() {
    const shipments = this.getShipments();
    const comms = this.getCommunications();
    const escalations = (this.data.escalations || []).filter(e => e.status !== 'Resolved');
    const alerts = [];

    // 1. Failed notifications requiring retry
    const failedComms = comms.filter(c => c.status === 'Failed');
    failedComms.forEach(fc => {
      alerts.push({
        id: `ALT-FAIL-${fc.id}`,
        type: 'failed_notification',
        severity: 'Critical',
        title: `Failed Notification Dispatch (${fc.channel})`,
        message: `Notification ${fc.id} to ${fc.recipient} failed: ${fc.failureReason || 'Gateway Timeout'}. Retry required.`,
        shipmentId: fc.shipmentId,
        commId: fc.id,
        actionType: 'retry',
        actionLabel: 'Retry Dispatch',
        timestamp: fc.createdAt
      });
    });

    // 2. Critical SLA Breaches needing proactive communication
    const criticalBreaches = shipments.filter(s => s.slaRisk === 'Critical SLA Breach' || s.slaRisk === 'Critical');
    criticalBreaches.forEach(cb => {
      alerts.push({
        id: `ALT-SLA-${cb.id}`,
        type: 'sla_breach',
        severity: 'Critical',
        title: `Critical SLA Breach Risk on ${cb.id}`,
        message: `Shipment ${cb.id} (${cb.customerName}) has exceeded approved delivery tolerances. Immediate customer proactive advisory required.`,
        shipmentId: cb.id,
        actionType: 'compose',
        actionLabel: 'Draft Advisory',
        timestamp: cb.lastOperationalUpdate || new Date().toISOString()
      });
    });

    // 3. Open Customer Complaints
    const openComplaints = escalations.filter(e => e.category === 'Customer Complaint');
    openComplaints.forEach(oc => {
      alerts.push({
        id: `ALT-COMP-${oc.id}`,
        type: 'complaint',
        severity: 'High',
        title: `Customer Complaint Escalation Active (${oc.id})`,
        message: `${oc.reason.slice(0, 80)}... Assigned to ${oc.assignedRole}.`,
        shipmentId: oc.shipmentId,
        actionType: 'escalations',
        actionLabel: 'View Escalation',
        timestamp: oc.createdAt
      });
    });

    return alerts;
  }

  // =========================================================================
  // Phase 7: Customer Role Store Methods
  // =========================================================================

  getCurrentCustomerContext() {
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    if (user && user.role === 'Customer') {
      return {
        customerId: user.customerId || 'CUST-BIO-01',
        customerName: user.customerName || 'BioPharma Health Alliance'
      };
    }
    return {
      customerId: 'CUST-BIO-01',
      customerName: 'BioPharma Health Alliance'
    };
  }

  getCustomerShipments(customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const all = this.getShipments();
    return all.filter(s => s.customerId === ctx || s.customerName === ctx);
  }

  getCustomerShipment(shipmentId, customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const s = this.getShipment(shipmentId);
    if (!s) return null;
    // Strict customer-level data isolation
    if (s.customerId !== ctx && s.customerName !== ctx) {
      return null;
    }
    // Return sanitized customer-safe copy (completely isolated from internal operational debate / raw debug telemetry)
    return {
      id: s.id,
      orderId: s.orderId || s.orderReference || 'ORD-7721',
      orderReference: s.orderReference || s.orderId || 'ORD-7721',
      customerReference: s.customerReference || 'PO-88248',
      customerId: s.customerId,
      customerName: s.customerName,
      consigneeName: s.consigneeName,
      origin: s.origin,
      destination: s.destination,
      currentLocation: s.currentLocation || s.origin,
      cargoType: s.cargoType,
      status: s.status,
      plannedETA: s.deliveryCommitment || s.eta || '2026-10-29 13:00 CDT',
      approvedETA: s.approvedETA || s.estArrival || s.eta,
      proposedETA: s.proposedETA || null,
      etaApprovalStatus: s.etaApprovalStatus || 'Approved',
      deliveryCommitment: s.deliveryCommitment || s.eta,
      slaDeadline: s.slaDeadline,
      customerSafeExceptionSummary: s.customerSafeExceptionSummary,
      milestones: s.milestones || [],
      lastOperationalUpdate: s.lastOperationalUpdate,
      hasException: s.hasException,
      exceptionType: s.exceptionType,
      departureTime: s.departureTime,
      actualArrival: s.actualArrival,
      onTime: s.onTime,
      deliveryConfirmation: s.deliveryConfirmation ? {
        deliveredAt: s.deliveryConfirmation.deliveredAt,
        destinationAddress: s.deliveryConfirmation.destinationAddress || s.destination,
        receivedQty: s.deliveryConfirmation.receivedQty,
        damagedQty: s.deliveryConfirmation.damagedQty || 0,
        rejectedQty: s.deliveryConfirmation.rejectedQty || 0,
        recipientName: s.deliveryConfirmation.recipientName,
        recipientRole: s.deliveryConfirmation.recipientRole,
        signatureStatus: s.deliveryConfirmation.signatureStatus,
        conditionNotes: s.deliveryConfirmation.conditionNotes,
        isVerified: s.deliveryConfirmation.isVerified !== false
      } : (s.status === 'Delivered' ? {
        deliveredAt: s.actualArrival || '2026-10-29 11:20 CDT',
        destinationAddress: s.destination,
        receivedQty: 340,
        damagedQty: 0,
        rejectedQty: 0,
        recipientName: 'Marcus Vance',
        recipientRole: 'Dock Receiving Supervisor',
        signatureStatus: 'Digitally Signed & Stamp Verified',
        conditionNotes: 'All cartons inspected, intact and accepted in full.',
        isVerified: true
      } : null)
    };
  }

  getCustomerKPIs(customerIdOrName) {
    const shipments = this.getCustomerShipments(customerIdOrName);
    const activeShipments = shipments.filter(s => s.status !== 'Delivered').length;
    const inTransit = shipments.filter(s => ['In Transit', 'On Route', 'Loading', 'Out for Delivery'].includes(s.status)).length;
    const deliveryDelayed = shipments.filter(s => ['Delayed', 'At Risk'].includes(s.status) || s.hasException).length;
    const delivered = shipments.filter(s => s.status === 'Delivered').length;

    return {
      activeShipments,
      inTransit,
      deliveryDelayed,
      delivered
    };
  }

  getCustomerNotifications(customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const shipments = this.getCustomerShipments(ctx);
    const shipmentIds = shipments.map(s => s.id);

    // Get read IDs from localStorage
    let readIds = [];
    try {
      readIds = JSON.parse(localStorage.getItem('BRIDGES_CUSTOMER_READ_NOTIFS') || '[]');
    } catch (e) {}

    const notifs = [];

    // 1. Sent customer service communications directed to this customer
    const comms = (this.data.communications || []).filter(c => shipmentIds.includes(c.shipmentId) && c.status === 'Sent');
    comms.forEach(c => {
      notifs.push({
        id: `NOTIF-${c.id}`,
        type: c.templateName || 'Customer Service Update',
        category: 'Customer Service',
        shipmentId: c.shipmentId,
        channel: c.channel || 'Email',
        message: c.message ? (c.message.length > 140 ? c.message.slice(0, 140) + '...' : c.message) : `Update regarding shipment ${c.shipmentId}`,
        fullMessage: c.message,
        timestamp: c.sentAt || c.createdAt,
        isRead: readIds.includes(`NOTIF-${c.id}`)
      });
    });

    // 2. Multi-event automated customer notifications: ETA-change, re-route, re-carrier, expedite, split, and delivery
    shipments.forEach(s => {
      const orderRef = s.orderId || s.orderReference || 'ORD-7721';

      // (A) ETA-Change Notification
      if (s.approvedETA || s.status === 'Delayed' || s.hasException) {
        const notifId = `NOTIF-ETA-${s.id}`;
        notifs.push({
          id: notifId,
          type: 'ETA Change Alert',
          category: 'ETA Changes',
          shipmentId: s.id,
          channel: 'Email & SMS',
          message: `Delivery schedule for shipment ${s.id} (Order ${orderRef}) has been updated. Latest approved ETA: ${s.approvedETA || 'Pending confirmation'}.`,
          fullMessage: `Our logistics control tower has authorized a verified arrival window of ${s.approvedETA || s.eta} for shipment ${s.id}. All cold-chain safeguards and transit checkpoints remain active.`,
          timestamp: s.lastOperationalUpdate || s.createdAt,
          isRead: readIds.includes(notifId)
        });
      }

      // (B) Re-Route & Arterial Detour Notification
      if (s.recoveryAction && (s.recoveryAction.strategy || '').toLowerCase().includes('route') || s.id === 'BRG-2847') {
        const notifId = `NOTIF-REROUTE-${s.id}`;
        notifs.push({
          id: notifId,
          type: 'Re-Route Optimization',
          category: 'Re-route / Detour',
          shipmentId: s.id,
          channel: 'Portal Push & Email',
          message: `Route Optimization: Shipment ${s.id} re-routed via alternative arterial highway to bypass regional weather delays.`,
          fullMessage: `To safeguard transit velocity and avoid localized closures on Interstate corridors, shipment ${s.id} has been transitioned to verified alternative routing (${s.recoveryAction ? s.recoveryAction.planTitle : 'Dynamic Arterial Detour'}). ETA is confirmed for ${s.approvedETA || s.eta}.`,
          timestamp: s.lastOperationalUpdate || '2026-10-29 09:45 CDT',
          isRead: readIds.includes(notifId)
        });
      }

      // (C) Re-Carrier & Dedicated Fleet Assignment Notification
      if (s.carrierDetails || s.id === 'BRG-2848') {
        const notifId = `NOTIF-RECARRIER-${s.id}`;
        notifs.push({
          id: notifId,
          type: 'Re-Carrier / Dedicated Fleet',
          category: 'Re-carrier',
          shipmentId: s.id,
          channel: 'SMS',
          message: `Carrier Update: Dedicated vehicle ${s.carrierDetails ? s.carrierDetails.vehiclePlate : 'TX-8821-XP'} assigned to shipment ${s.id}.`,
          fullMessage: `Shipment ${s.id} is in dedicated transit with carrier partner ${s.carrierDetails ? s.carrierDetails.carrierName : 'Bridges Express'}. Vehicle registration ${s.carrierDetails ? s.carrierDetails.vehiclePlate : 'TX-8821-XP'} is transmitting continuous telemetry along authorized corridors.`,
          timestamp: '2026-10-29 10:15 CDT',
          isRead: readIds.includes(notifId)
        });
      }

      // (D) Expedite Priority Dispatch Notification
      if (s.id === 'BRG-2848' || s.priority === 'High' || s.severity === 'Critical') {
        const notifId = `NOTIF-EXPEDITE-${s.id}`;
        notifs.push({
          id: notifId,
          type: 'Expedite Priority Dispatch',
          category: 'Expedite',
          shipmentId: s.id,
          channel: 'Email & Push',
          message: `Expedited Priority: Shipment ${s.id} flagged for accelerated dock handling and direct transit priority.`,
          fullMessage: `Priority handling has been activated for shipment ${s.id}. Dock staging is pre-cleared for direct intake at destination ${s.destination}.`,
          timestamp: '2026-10-29 08:30 CDT',
          isRead: readIds.includes(notifId)
        });
      }

      // (E) Consignment Split Notification
      if (s.id === 'BRG-2846' || (s.cargoType || '').includes('Pharmaceuticals') && s.id === 'BRG-2843') {
        const notifId = `NOTIF-SPLIT-${s.id}`;
        notifs.push({
          id: notifId,
          type: 'Consignment Split Notice',
          category: 'Consignment Split',
          shipmentId: s.id,
          channel: 'Email',
          message: `Consignment Staging: Priority temperature-sensitive lot dispatched in Unit 1; balance in Unit 2.`,
          fullMessage: `To prevent temperature exposure risks during localized hub staging, shipment ${s.id} was split into two monitored consignments. Primary Unit 1 is on schedule for scheduled delivery.`,
          timestamp: '2026-10-29 07:15 CDT',
          isRead: readIds.includes(notifId)
        });
      }

      // (F) Delivery Notification & Proof of Delivery (POD)
      if (s.status === 'Delivered' || s.id === 'BRG-2844') {
        const notifId = `NOTIF-DELIV-${s.id}`;
        const recipient = s.deliveryConfirmation ? s.deliveryConfirmation.recipientName : 'Marcus Vance';
        const receivedQty = s.deliveryConfirmation ? s.deliveryConfirmation.receivedQty : 340;
        notifs.push({
          id: notifId,
          type: 'Delivery Confirmation (POD)',
          category: 'Delivered',
          shipmentId: s.id,
          channel: 'Email & SMS',
          message: `Delivered & Verified: Shipment ${s.id} (Order ${orderRef}) accepted at ${s.destination}. Signed by ${recipient}.`,
          fullMessage: `Shipment ${s.id} was successfully delivered to ${s.destination}. ${receivedQty} pieces received and verified in full. Proof of delivery digital signature has been recorded.`,
          timestamp: s.actualArrival || '2026-10-29 11:20 CDT',
          isRead: readIds.includes(notifId)
        });
      }
    });

    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getCustomerNotificationPreferences(customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const key = `BRIDGES_CUST_NOTIF_PREFS_${ctx}`;
    let prefs = null;
    try {
      prefs = JSON.parse(localStorage.getItem(key));
    } catch (e) {}

    if (!prefs) {
      prefs = {
        emailEnabled: true,
        emailAddress: 'customer@gmail.com',
        smsEnabled: true,
        smsPhone: '+1 (555) 890-1234',
        pushEnabled: true,
        notifyEtaChange: true,
        notifyReRoute: true,
        notifyReCarrier: true,
        notifyExpedite: true,
        notifySplit: true,
        notifyDelivery: true,
        frequency: 'Immediate'
      };
    }
    return prefs;
  }

  saveCustomerNotificationPreferences(customerIdOrName, newPrefs) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const key = `BRIDGES_CUST_NOTIF_PREFS_${ctx}`;
    localStorage.setItem(key, JSON.stringify(newPrefs));
    this.logAudit("Customer Notification Preferences Updated", "Customer Portal", ctx, `Updated alert channels and event subscriptions.`);
    this.notify();
    return newPrefs;
  }

  markCustomerNotificationRead(notifId) {
    let readIds = [];
    try {
      readIds = JSON.parse(localStorage.getItem('BRIDGES_CUSTOMER_READ_NOTIFS') || '[]');
    } catch (e) {}
    if (!readIds.includes(notifId)) {
      readIds.push(notifId);
      localStorage.setItem('BRIDGES_CUSTOMER_READ_NOTIFS', JSON.stringify(readIds));
      this.notify();
    }
  }

  markAllCustomerNotificationsRead(customerIdOrName) {
    const notifs = this.getCustomerNotifications(customerIdOrName);
    const readIds = notifs.map(n => n.id);
    localStorage.setItem('BRIDGES_CUSTOMER_READ_NOTIFS', JSON.stringify(readIds));
    this.notify();
  }

  getCustomerQueries(customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const queries = this.data.customerQueries || [];
    return queries.filter(q => q.customerId === ctx || q.customerName === ctx)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  getCustomerQuery(queryId, customerIdOrName) {
    const ctx = customerIdOrName || this.getCurrentCustomerContext().customerId;
    const q = (this.data.customerQueries || []).find(item => item.id === queryId);
    if (!q) return null;
    if (q.customerId !== ctx && q.customerName !== ctx) {
      return null; // Strict isolation!
    }
    return q;
  }

  createCustomerQuery(data) {
    if (!this.data.customerQueries) this.data.customerQueries = [];

    const ctx = this.getCurrentCustomerContext();
    const shipment = this.getCustomerShipment(data.shipmentId, ctx.customerId);
    if (!shipment) {
      throw new Error(`Shipment ${data.shipmentId} not found in your authorized customer account.`);
    }

    if (!data.subject || !data.subject.trim()) throw new Error("Subject is required.");
    if (!data.description || !data.description.trim()) throw new Error("Description is required.");

    // Prevent accidental duplicate submission within 30 seconds
    const recentDuplicate = this.data.customerQueries.find(q => 
      q.customerId === ctx.customerId && 
      q.shipmentId === data.shipmentId && 
      q.subject.toLowerCase() === data.subject.trim().toLowerCase() &&
      (Date.now() - new Date(q.createdAt).getTime()) < 30000
    );
    if (recentDuplicate) {
      return { query: recentDuplicate, isDuplicate: true };
    }

    const newId = `QRY-${Math.floor(7010 + Math.random() * 990)}`;
    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const senderName = user ? user.name : "Customer Representative";

    const newQuery = {
      id: newId,
      customerId: ctx.customerId,
      customerName: ctx.customerName,
      shipmentId: data.shipmentId,
      category: data.category || 'Other',
      subject: data.subject.trim(),
      description: data.description.trim(),
      preferredMethod: data.preferredMethod || 'Email',
      contactEmail: data.contactEmail || (user ? user.email : ''),
      contactPhone: data.contactPhone || '',
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `MSG-${newId}-1`,
          author: senderName,
          role: "Customer",
          time: now,
          text: data.description.trim()
        }
      ]
    };

    this.data.customerQueries.unshift(newQuery);
    this.logAudit("Customer Query Submitted", "Customer Portal", newId, `Query submitted by ${senderName} for shipment ${data.shipmentId}.`);
    this.save();
    return { query: newQuery, isDuplicate: false };
  }

  addCustomerQueryMessage(queryId, text, senderName, isCustomer = true) {
    if (!text || !text.trim()) throw new Error("Message text is required.");
    const q = (this.data.customerQueries || []).find(item => item.id === queryId);
    if (!q) throw new Error("Query not found.");

    const now = new Date().toISOString();
    const user = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = senderName || (user ? user.name : (isCustomer ? "Customer" : "Customer Service"));
    const role = isCustomer ? "Customer" : "Customer Service";

    if (!q.messages) q.messages = [];
    q.messages.push({
      id: `MSG-${queryId}-${q.messages.length + 1}`,
      author: author,
      role: role,
      time: now,
      text: text.trim()
    });

    q.updatedAt = now;
    if (isCustomer) {
      if (q.status === 'Awaiting Customer') {
        q.status = 'In Progress';
      }
    } else {
      q.status = 'Awaiting Customer';
    }

    this.logAudit("Query Follow-up Message", "Customer Portal", queryId, `Message added to ${queryId} by ${author}.`);
    this.save();
    return q;
  }

  // =========================================================================
  // CONTROL TOWER ANALYST METHODS (Shipment Onboarding, Inbound, Data Quality,
  // Manual Exceptions, Evidence, AI Support, Temperature & Customs)
  // =========================================================================

  // --- MANUAL EXCEPTION CREATION & EVIDENCE ---
  createManualException(data) {
    if (!data.shipmentId) throw new Error("Shipment ID is required.");
    const shipment = this.getShipment(data.shipmentId);
    if (!shipment) throw new Error(`Shipment ${data.shipmentId} not found.`);
    if (!data.type) throw new Error("Exception type is required.");
    if (!data.rootCause || !data.rootCause.trim()) throw new Error("Root cause hypothesis is required.");

    const id = `EXC-${Math.floor(1055 + Math.random() * 8900)}`;
    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Control Tower Analyst)";

    const evidenceList = (data.evidence || []).map((ev, idx) => ({
      id: `EV-${id}-${idx + 1}`,
      fileName: ev.fileName || "evidence_document.pdf",
      fileType: ev.fileType || "Inspection Report",
      fileSize: ev.fileSize || "1.2 MB",
      uploadedAt: now,
      uploadedBy: authorName,
      url: ev.url || "#"
    }));

    const newException = {
      id,
      shipmentId: data.shipmentId,
      carrierId: shipment.carrierId,
      type: data.type,
      severity: data.severity || "High",
      rootCause: data.rootCause.trim(),
      status: data.status || "Open",
      assignedAnalyst: authorName,
      autoResolved: false,
      autoActionTaken: null,
      location: data.location || shipment.currentLocation || "En Route Corridor",
      detectionTime: now,
      predictedETA: data.predictedETA || shipment.predictedETA || shipment.estArrival,
      slaRisk: data.slaRisk || "High",
      estimatedBusinessImpact: data.estimatedBusinessImpact || "$15,000 SLA penalty buffer",
      evidence: evidenceList,
      coordinationNotes: data.initialNote ? [
        { id: `NOTE-${id}-1`, author: authorName, timestamp: now, text: data.initialNote.trim() }
      ] : [],
      timeline: [
        {
          timestamp: now,
          actor: authorName,
          action: "Manual Exception Created",
          note: `Manual exception logged by Analyst. Type: ${data.type}, Severity: ${data.severity || 'High'}. Cause: ${data.rootCause.trim()}`
        }
      ],
      recoveryRequestId: null,
      createdAt: now,
      resolvedAt: null,
      finalOutcome: null
    };

    if (evidenceList.length > 0) {
      newException.timeline.push({
        timestamp: now,
        actor: authorName,
        action: "Evidence Attached",
        note: `Attached ${evidenceList.length} evidence file(s): ${evidenceList.map(e => e.fileName).join(', ')}`
      });
    }

    if (!this.data.exceptions) this.data.exceptions = [];
    this.data.exceptions.unshift(newException);

    // Update affected shipment status
    shipment.hasException = true;
    if (data.severity === "Critical" || data.severity === "High") {
      shipment.status = "Delayed";
      shipment.slaRisk = data.slaRisk || "Critical";
    }

    this.logAudit("Manual Exception Created", "Exceptions", id, `Created manual ${data.type} exception for shipment ${data.shipmentId} with ${evidenceList.length} evidence attachment(s).`);
    this.save();
    return newException;
  }

  attachExceptionEvidence(exceptionId, evidenceData) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");
    if (!exc.evidence) exc.evidence = [];

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Control Tower Analyst)";

    const newEvidence = {
      id: `EV-${exceptionId}-${exc.evidence.length + 1}`,
      fileName: evidenceData.fileName || "attachment.pdf",
      fileType: evidenceData.fileType || "Evidence Document",
      fileSize: evidenceData.fileSize || "1.4 MB",
      uploadedAt: now,
      uploadedBy: author,
      description: evidenceData.description || ""
    };

    exc.evidence.push(newEvidence);
    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "Evidence Attached",
      note: `Attached ${newEvidence.fileType}: "${newEvidence.fileName}". ${evidenceData.description || ''}`
    });

    this.logAudit("Evidence Attached", "Exceptions", exceptionId, `Added evidence file "${newEvidence.fileName}" to ${exceptionId}.`);
    this.save();
    return newEvidence;
  }

  // --- SHIPMENT & ORDER ONBOARDING ---
  getOnboardedBatches() {
    return this.data.onboardedBatches || [];
  }

  onboardShipmentBatch(batchPayload) {
    const records = batchPayload.records || [];
    if (records.length === 0) throw new Error("Batch contains no shipment records to onboard.");

    const now = new Date().toISOString();
    const batchId = `BATCH-${Date.now().toString().slice(-4)}`;
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const authorName = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Control Tower Analyst)";

    const newShipments = [];
    records.forEach((rec, idx) => {
      const id = rec.id || `BRG-${Math.floor(3000 + Math.random() * 6900)}`;
      const shipment = {
        id,
        orderReference: rec.orderReference || `ORD-${Math.floor(10000 + Math.random() * 89999)}`,
        origin: rec.origin || batchPayload.linkedWarehouse || "Dallas Central Logistics Hub",
        destination: rec.destination || "Capital Knot Medical Center",
        carrierId: rec.carrierId || batchPayload.linkedCarrierId || "CAR-01",
        cargoType: rec.cargoType || "Priority Express Cargo",
        cargoValue: rec.cargoValue || "$85,000",
        customerTier: rec.customerTier || "Tier 1 Strategic",
        status: rec.status || "Loading",
        currentLocation: rec.origin || batchPayload.linkedWarehouse || "Dallas Central Logistics Hub",
        departureTime: now,
        estArrival: rec.estArrival || new Date(Date.now() + 24 * 3600000).toISOString(),
        originalETA: rec.estArrival || new Date(Date.now() + 24 * 3600000).toISOString(),
        predictedETA: rec.estArrival || new Date(Date.now() + 24 * 3600000).toISOString(),
        deliveryCommitment: rec.deliveryCommitment || new Date(Date.now() + 26 * 3600000).toISOString(),
        hasException: false,
        slaRisk: "None",
        onTime: true,
        customerId: batchPayload.linkedCustomerId || "CUST-BIO-01",
        customerName: batchPayload.linkedCustomerName || "BioPharma Health Alliance",
        consigneeName: rec.destination || "Regional Distribution Facility",
        customerReference: rec.orderReference || `PO-${Math.floor(10000 + Math.random() * 89999)}`,
        customerContact: "Receiving Team (receiving@logistics.org | +1 555-019-2834)",
        approvedETA: rec.estArrival || new Date(Date.now() + 24 * 3600000).toISOString(),
        proposedETA: null,
        etaApprovalStatus: "Approved",
        customerUpdateStatus: "Not Required",
        customerSafeExceptionSummary: "Onboarded and staged for carrier loading.",
        lastCustomerContact: null,
        lastOperationalUpdate: now,
        customsStatus: rec.customsStatus || "Cleared",
        temperature: rec.temperature || "+4.2°C (Cold-Chain Verified)",
        gpsCoords: rec.gpsCoords || "32.7767° N, 96.7970° W",
        routeWaypoints: [
          { name: rec.origin || "Origin Terminal", status: "completed" },
          { name: "Transit Corridor", status: "upcoming" },
          { name: rec.destination || "Destination Hub", status: "upcoming" }
        ],
        milestones: [
          { name: "Order Ingestion & Staging", status: "completed", time: now },
          { name: "Carrier Dispatch & Loading", status: "in_progress", time: null },
          { name: "Destination Handover", status: "pending", time: null }
        ]
      };
      newShipments.push(shipment);
    });

    if (!this.data.shipments) this.data.shipments = [];
    this.data.shipments.unshift(...newShipments);

    const batchRecord = {
      id: batchId,
      fileName: batchPayload.fileName || "onboarded_manifest.csv",
      fileSize: batchPayload.fileSize || `${Math.round(records.length * 14.5)} KB`,
      totalRecords: records.length,
      validRecords: records.length,
      errorRecords: 0,
      linkedCustomer: batchPayload.linkedCustomerName || "BioPharma Health Alliance",
      linkedCarrier: batchPayload.linkedCarrierName || "Bridges Global Logistics",
      linkedWarehouse: batchPayload.linkedWarehouse || "Dallas Central Logistics Hub",
      status: "Imported",
      importedAt: now,
      importedBy: authorName,
      createdShipmentIds: newShipments.map(s => s.id)
    };

    if (!this.data.onboardedBatches) this.data.onboardedBatches = [];
    this.data.onboardedBatches.unshift(batchRecord);

    this.logAudit("Shipments Onboarded", "Onboarding", batchId, `Onboarded ${records.length} shipments from ${batchRecord.fileName}. Linked to ${batchRecord.linkedCustomer} & ${batchRecord.linkedCarrier}.`);
    this.save();
    return batchRecord;
  }

  // --- INBOUND MESSAGE MONITORING & INTEGRATION ERROR HANDLING ---
  getInboundMessages() {
    return this.data.inboundMessages || [];
  }

  retryInboundMessage(messageId) {
    const msg = (this.data.inboundMessages || []).find(m => m.id === messageId);
    if (!msg) throw new Error("Inbound message not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    msg.status = "Processed";
    msg.retriedAt = now;
    if (!msg.notes) msg.notes = [];
    msg.notes.push(`[${now.slice(11, 16)}] Retried and reprocessed successfully by ${author}. Schema validated.`);

    this.logAudit("Inbound Message Retried", "Integration", messageId, `Message ${messageId} (${msg.source}) manually reprocessed.`);
    this.save();
    return msg;
  }

  rejectInboundMessage(messageId, reason = "Rejected due to corrupted EDI envelope") {
    const msg = (this.data.inboundMessages || []).find(m => m.id === messageId);
    if (!msg) throw new Error("Inbound message not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    msg.status = "Rejected";
    msg.rejectionReason = reason;
    if (!msg.notes) msg.notes = [];
    msg.notes.push(`[${now.slice(11, 16)}] Rejected by ${author}: ${reason}`);

    this.logAudit("Inbound Message Rejected", "Integration", messageId, `Message ${messageId} rejected: ${reason}`);
    this.save();
    return msg;
  }

  ignoreInboundMessage(messageId) {
    const msg = (this.data.inboundMessages || []).find(m => m.id === messageId);
    if (!msg) throw new Error("Inbound message not found.");

    const now = new Date().toISOString();
    msg.status = "Duplicate Ignored";
    if (!msg.notes) msg.notes = [];
    msg.notes.push(`[${now.slice(11, 16)}] Flagged as duplicate and suppressed by Analyst.`);

    this.logAudit("Inbound Message Suppressed", "Integration", messageId, `Marked duplicate for ${messageId}.`);
    this.save();
    return msg;
  }

  addInboundMessageNote(messageId, noteText) {
    const msg = (this.data.inboundMessages || []).find(m => m.id === messageId);
    if (!msg) throw new Error("Inbound message not found.");
    if (!noteText || !noteText.trim()) throw new Error("Note text is required.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    if (!msg.notes) msg.notes = [];
    msg.notes.push(`[${now.slice(11, 16)}] ${author}: ${noteText.trim()}`);

    this.logAudit("Inbound Note Added", "Integration", messageId, `Note added to ${messageId}.`);
    this.save();
    return msg;
  }

  escalateInboundMessage(messageId, reason = "Repeated EDI syntax and transmission failures") {
    const msg = (this.data.inboundMessages || []).find(m => m.id === messageId);
    if (!msg) throw new Error("Inbound message not found.");

    const now = new Date().toISOString();
    const ticketId = `INC-${Math.floor(5000 + Math.random() * 4900)}`;
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    msg.escalated = true;
    msg.escalationTicket = ticketId;
    if (!msg.notes) msg.notes = [];
    msg.notes.push(`[${now.slice(11, 16)}] ESCALATED by ${author}: Ticket ${ticketId} created. Reason: ${reason}`);

    this.logAudit("Integration Failure Escalated", "Integration", messageId, `Escalated message ${messageId} under ticket ${ticketId}.`);
    this.save();
    return { message: msg, ticketId };
  }

  // --- DATA QUALITY MANAGEMENT ---
  getDataQualityIssues() {
    return this.data.dataQualityIssues || [];
  }

  getDataQualityHistory() {
    return this.data.dataQualityHistory || [];
  }

  requestDataCorrection(issueId, notes = "") {
    const issue = (this.data.dataQualityIssues || []).find(i => i.id === issueId);
    if (!issue) throw new Error("Data quality issue not found.");

    const now = new Date().toISOString();
    issue.requestedCorrectionAt = now;
    if (notes) issue.notes = notes.trim();

    this.logAudit("Data Quality Correction Requested", "Data Quality", issueId, `Dispatched correction request to ${issue.correctionTarget || 'Carrier/Partner'} for ${issue.shipmentId}.`);
    this.save();
    return issue;
  }

  toggleExceptionSuppression(shipmentId, suppress = true) {
    const shipment = this.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    shipment.suppressExceptionDetection = suppress;
    const matchingIssues = (this.data.dataQualityIssues || []).filter(i => i.shipmentId === shipmentId);
    matchingIssues.forEach(i => {
      i.suppressExceptionDetection = suppress;
    });

    this.logAudit("Exception Detection Suppressed", "Data Quality", shipmentId, `Suppression toggled to ${suppress} for shipment ${shipmentId}.`);
    this.save();
    return suppress;
  }

  assignDataQualityIssue(issueId, analystName) {
    const issue = (this.data.dataQualityIssues || []).find(i => i.id === issueId);
    if (!issue) throw new Error("Data quality issue not found.");

    issue.assignedAnalyst = analystName;
    this.logAudit("Data Quality Issue Assigned", "Data Quality", issueId, `Assigned to ${analystName}.`);
    this.save();
    return issue;
  }

  closeDataQualityIssue(issueId, resolutionNotes = "Verified and resolved in master registry", correctedValue = null) {
    const issue = (this.data.dataQualityIssues || []).find(i => i.id === issueId);
    if (!issue) throw new Error("Data quality issue not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    issue.status = "Resolved";
    issue.resolvedAt = now;
    issue.resolutionNotes = resolutionNotes;

    // Create history entry
    const historyEntry = {
      id: `DQH-${Math.floor(210 + Math.random() * 780)}`,
      issueId: issue.id,
      shipmentId: issue.shipmentId,
      field: issue.field,
      oldValue: issue.currentValue,
      correctedValue: correctedValue || "Normalized & Validated",
      correctedBy: author,
      timestamp: now,
      resolution: resolutionNotes
    };

    if (!this.data.dataQualityHistory) this.data.dataQualityHistory = [];
    this.data.dataQualityHistory.unshift(historyEntry);

    // If shipment exists and field corresponds to known property, apply fix
    const shipment = this.getShipment(issue.shipmentId);
    if (shipment) {
      if (issue.category === "Missing GPS Telemetry") {
        shipment.currentLocation = "Dallas Interstate Corridor (GPS Restored)";
      } else if (issue.category === "Incomplete Customs Classification") {
        shipment.customsStatus = "Cleared";
      }
    }

    this.logAudit("Data Quality Issue Resolved", "Data Quality", issueId, `Resolved by ${author}: ${resolutionNotes}.`);
    this.save();
    return issue;
  }

  // --- AI-ASSISTED DECISION SUPPORT (Accept / Override) ---
  acceptAIRecommendation(exceptionId, strategy) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.aiRecommendationStatus = "Accepted";
    exc.aiConfidence = exc.aiConfidence || "96% AI Decision Confidence";

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "AI Recommendation Accepted",
      note: `Analyst accepted AI recommended strategy: "${strategy}". Predictive confidence: ${exc.aiConfidence}.`
    });

    this.logAudit("AI Recommendation Accepted", "AI Decision Support", exceptionId, `Accepted "${strategy}" with confidence ${exc.aiConfidence}.`);
    this.save();
    return exc;
  }

  overrideAIRecommendation(exceptionId, chosenStrategy, reason, justification = "") {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");
    if (!reason || !reason.trim()) throw new Error("Override reason is mandatory.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.aiRecommendationStatus = "Overridden";
    exc.aiOverride = {
      chosenStrategy,
      reason: reason.trim(),
      justification: justification ? justification.trim() : "",
      overriddenBy: author,
      timestamp: now
    };

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "AI Recommendation Overridden",
      note: `Analyst overrode AI recommendation. Selected strategy: "${chosenStrategy}". Reason: ${reason.trim()} ${justification ? `(${justification.trim()})` : ''}`
    });

    this.logAudit("AI Recommendation Overridden", "AI Decision Support", exceptionId, `Overrode AI with strategy "${chosenStrategy}". Reason: ${reason}.`);
    this.save();
    return exc;
  }

  // --- TEMPERATURE & CUSTOMS HANDLING ---
  triggerInspectionTask(exceptionId, taskData = {}) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");

    const now = new Date().toISOString();
    const taskId = `INSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.inspectionTask = {
      id: taskId,
      inspectionType: taskData.inspectionType || "Core Temperature & Dry Ice Verification",
      targetLocation: taskData.targetLocation || exc.location || "Dallas Logistics Hub Dock 2",
      inspectorAssigned: taskData.inspectorAssigned || "Carlos Mendoza (Dock Supervisor)",
      urgency: taskData.urgency || "Immediate Priority (Cryo Excursion)",
      status: "Dispatched",
      createdAt: now,
      notes: taskData.notes || "Verify reefer digital datalogger and physical thermocouple core temperature."
    };

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "Inspection Task Dispatched",
      note: `Triggered physical inspection task ${taskId} assigned to ${exc.inspectionTask.inspectorAssigned}.`
    });

    this.logAudit("Inspection Task Dispatched", "Exceptions", exceptionId, `Dispatched inspection ${taskId} for ${exceptionId}.`);
    this.save();
    return exc.inspectionTask;
  }

  triggerCustomsTask(exceptionId, taskData = {}) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");

    const now = new Date().toISOString();
    const taskId = `CUST-TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.customsTask = {
      id: taskId,
      taskType: taskData.taskType || "Customs Document Upload & Broker Clearance",
      brokerName: taskData.brokerName || "Pacific Marine Customs Brokers",
      requiredDocuments: taskData.requiredDocuments || ["Commercial Invoice", "Phytosanitary Certificate", "Certificate of Origin"],
      status: "Broker Contacted",
      createdAt: now,
      notes: taskData.notes || "10-digit statistical subdivision requested by border inspector."
    };

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "Customs Broker Task Triggered",
      note: `Customs task ${taskId} issued to ${exc.customsTask.brokerName}.`
    });

    this.logAudit("Customs Task Triggered", "Exceptions", exceptionId, `Issued customs task ${taskId} for ${exceptionId}.`);
    this.save();
    return exc.customsTask;
  }

  recordCargoCondition(exceptionId, conditionData) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.cargoCondition = {
      coreTemperature: conditionData.coreTemperature || "+3.8°C",
      dryIceStatus: conditionData.dryIceStatus || "Replenished (Full 80kg)",
      packagingSeal: conditionData.packagingSeal || "Intact & Undamaged",
      sampleTested: conditionData.sampleTested !== undefined ? conditionData.sampleTested : true,
      spoilageRisk: conditionData.spoilageRisk || "Mitigated (Zero Loss)",
      inspectorNotes: conditionData.inspectorNotes || "Biopharma cold packs verified within acceptable specification.",
      recordedAt: now,
      recordedBy: author
    };

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "Cargo Condition Certified",
      note: `Recorded cargo condition: Core Temp ${exc.cargoCondition.coreTemperature}, Seal: ${exc.cargoCondition.packagingSeal}, Spoilage: ${exc.cargoCondition.spoilageRisk}.`
    });

    this.logAudit("Cargo Condition Recorded", "Exceptions", exceptionId, `Recorded cargo condition for ${exceptionId}.`);
    this.save();
    return exc.cargoCondition;
  }

  recordCustomsRelease(exceptionId, releaseData) {
    const exc = this.getException(exceptionId);
    if (!exc) throw new Error("Exception not found.");

    const now = new Date().toISOString();
    const currentUser = window.BRIDGES_AUTH ? window.BRIDGES_AUTH.getCurrentUser() : null;
    const author = currentUser ? `${currentUser.name} (${currentUser.role})` : "Sarah Lin (Analyst)";

    exc.customsRelease = {
      entryNumber: releaseData.entryNumber || "CBP-2026-991823-REL",
      releaseStatus: releaseData.releaseStatus || "Green Line Full Release",
      clearedAt: now,
      clearingBroker: releaseData.clearingBroker || "Pacific Marine Customs Brokers",
      dutyPaid: releaseData.dutyPaid || "$2,450.00",
      customsNotes: releaseData.customsNotes || "10-digit statistical subdivision verified. Electronic release issued.",
      verifiedBy: author
    };

    // Update shipment customs status
    const shipment = this.getShipment(exc.shipmentId);
    if (shipment) {
      shipment.customsStatus = "Cleared";
      if (exc.type === "Customs Hold") {
        exc.status = "Resolved";
      }
    }

    if (!exc.timeline) exc.timeline = [];
    exc.timeline.push({
      timestamp: now,
      actor: author,
      action: "Customs Clearance Verified",
      note: `Customs release registered: ${exc.customsRelease.releaseStatus} (Entry: ${exc.customsRelease.entryNumber}).`
    });

    this.logAudit("Customs Release Recorded", "Exceptions", exceptionId, `Cleared customs for ${exceptionId}.`);
    this.save();
    return exc.customsRelease;
  }

}

// Global singleton instance
window.BRIDGES_STORE = new Store();
