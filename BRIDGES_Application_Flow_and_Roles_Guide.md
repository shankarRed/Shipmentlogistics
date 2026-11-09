# BRIDGES — Shipment Exception Control Tower
## Complete Application Flow, Role Governance & Page Architecture Guide

---

## 1. System Overview & Core Architecture

**BRIDGES** is an enterprise-grade multimodal logistics Control Tower and shipment exception mitigation platform. It links real-time IoT and GPS telemetry to operational decision-makers across the logistics chain:
- **Central Logistics Analysts:** Monitor exceptions and lead War Room collaboration.
- **Transport Dispatchers:** Optimize highway corridors and issue recovery tenders.
- **Field Motor Carriers:** Accept tenders, assign relief tractors and certified drivers, and confirm ePOD delivery.
- **Warehouse Supervisors:** Schedule dock doors, verify thermal pre-checks, and execute gate handovers.
- **Customer Service:** Proactively advise shippers using AI communication copilots.
- **Enterprise Shippers:** Self-service tracking with sanitized milestones and 24/7 AI assistance.
- **System Administrators:** Configure SLA rules, notification templates, AI gates, and audit trails.

---

## 2. Role Governance & Credentials Matrix

All demo accounts share the password **`1`**. Users can switch roles directly using these credentials or via the profile switcher at the bottom-left of the sidebar:

| Role Name | Default User | Login Email | Password | Tenant / Workspace Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Bima Ary | `admin@gmail.com` | `1` | Global Platform Governance & Configuration |
| **Control Tower Analyst** | Sarah Lin | `cta@gmail.com` | `1` | Global Telemetry, Exceptions & War Room |
| **Dispatcher / Transport Planner** | Elena Rostova | `dispatcher@gmail.com` | `1` | Continental Route Corridors & Carrier Tenders |
| **Carrier Operations User** | Marcus Vance | `carrier@gmail.com` | `1` | Bridges Global Logistics (`CAR-01` Tenant) |
| **Warehouse Supervisor** | Carlos Mendoza | `warehouse@gmail.com` | `1` | Dallas Central Hub (`WH-DAL-01` Facility) |
| **Customer Service** | Clara Hughes | `cs@gmail.com` | `1` | Customer Care, Accounts & Sanitized Comms |
| **Customer / Enterprise Shipper** | Sarah Jenkins | `customer@gmail.com` | `1` | BioPharma Health Alliance (`CUST-BIO-01`) |

---

## 3. Detailed Role Breakdown: Pages & Key Actions

### 1. Administrator (`admin@gmail.com` / `1`)
* **Mission:** Global system health, carrier governance, user access management, SLA rules, and immutable audit logs.
* **Pages & Screens:**
  * **Dashboard (`#/dashboard`):** 4 Top KPIs (12,847 Total Shipments, 426 Active Deliveries, 87.3% Utilization, 94.8% OTD%), warehouse capacity progress bars, and the **500-Carrier Real-World Live Telemetry Map** powered by Esri World Streets.
  * **User & Access (`#/users`):** Manage enterprise user directory, assign role access levels, deactivate compromised credentials, and monitor user last-login activity.
  * **Carrier Management (`#/carriers`):** Review carrier directory, fleet capacity tracking, on-time delivery scorecards, safety ratings, and insurance compliance.
  * **Resource Overview (`#/resources`):** Fleet equipment register (Trucks, Reefers, Air Charters, Vessels), assigned drivers, and live speed telemetry.
  * **Analytics & Reports (`#/analytics`):** Operational intelligence: route deviation frequencies, resolution time distributions, carrier dispute rates, and carbon emissions.
  * **Exception History (`#/exceptions`):** Global audit log of closed deviations, root cause breakdowns (Traffic, Mechanical, Weather, Customs), and resolution cost variance.
  * **SLA & Rules (`#/sla_rules`):** Configure SLA resolution deadlines, breach countdown rules, grace periods, penalty schedules, and automated resolution rules.
  * **Notification Templates (`#/notifications_config`):** Manage multi-channel alert templates (In-App, SMS, Email) with dynamic variable interpolation (`{shipmentId}`, `{carrierName}`, `{approvedETA}`).
  * **AI & Approvals (`#/ai_config`):** Configure predictive intelligence model architecture, prediction horizons, and mandatory human review gates for carrier swaps.
  * **Audit Log (`#/audit`):** Immutable security audit trail recording user logins, password changes, data updates, and rule modifications.

---

### 2. Control Tower Analyst (`cta@gmail.com` / `1`)
* **Mission:** Real-time operations oversight, continuous telemetry monitoring, exception triage, root cause diagnostics, and collaborative War Room incident mitigation.
* **Pages & Screens:**
  * **Control Tower Dashboard (`#/analyst_dashboard`):** Operations overview, active shipment counters, open exception breakdown, and live transit corridor topology.
  * **Active Shipments (`#/analyst_shipments`):** Filter in-flight freight by priority, mode, or hub. View real-time GPS coordinates, vehicle battery, temperature, and ETA confidence.
  * **Exception Queue (`#/analyst_queue`):** Triage board sorted by severity (Critical, High, Medium) with SLA countdown timers. Example: Inspect thermal spike on `BRG-2843`.
  * **Investigation Workspace (`#/analyst_investigation`):** Deep-dive forensic tool: interactive sensor telemetry graphs, historical geofence breadcrumbs, radar overlays, and direct carrier calling.
  * **War Room (`#/analyst_war_room`):** Multi-party crisis conference: live incident chat, situation reports, recovery action proposals, and team consensus voting.
  * **Recovery Requests (`#/analyst_recoveries`):** Track field tenders: expedites, re-routes, carrier swaps, and splits submitted to transport planners.
  * **Shipment Onboarding (`#/analyst_onboarding`):** EDI/API order ingestion tool. Validate manifests, correct missing consignee addresses, and resolve mapping exceptions.

---

### 3. Dispatcher / Transport Planner (`dispatcher@gmail.com` / `1`)
* **Mission:** Field route optimization, dynamic corridor diversion planning, carrier capacity procurement, expedited spot bidding, and recovery tender dispatching.
* **Pages & Screens:**
  * **Dispatcher Dashboard (`#/dispatcher_dashboard`):** Daily dispatch overview: pending tenders, carrier acceptance rates, transit corridor delays, and vehicle load factors.
  * **Triage Queue (`#/dispatcher_queue`):** Review routing deviations needing immediate action. Example: Reroute `BRG-2842` around Alpine flash floods.
  * **Planning & Routing (`#/dispatcher_planning`):** Interactive routing tool: model alternate highway paths, calculate detour miles, evaluate fuel/toll costs, and commit new routes.
  * **Carrier Recovery Ops (`#/dispatcher_recoveries`):** Issue recovery tenders to certified partners: Expedited truck tender, carrier swap, or freight decoupling.
  * **Live Fleet Tracking (`#/dispatcher_tracking`):** Geographical tracking with highway traffic, construction zones, and carrier speed telemetry overlays.
  * **Carrier Capacity (`#/dispatcher_carriers`):** Search available regional fleets by equipment type (Flatbed, Reefer, Dry Van) and depot proximity.
  * **Approvals & Escalations (`#/dispatcher_approvals`):** Authorize high-cost diversions and emergency air charters.

---

### 4. Carrier Operations User (`carrier@gmail.com` / `1`)
* **Mission:** Manage carrier fleet assets and driver rosters, evaluate recovery tenders from the Control Tower, execute dispatches, report en-route disruptions, and capture digital proof of delivery.
* **Pages & Screens:**
  * **Carrier Dashboard (`#/carrier_dashboard`):** Tenant-isolated workspace for Bridges Global Logistics (`CAR-01`): active dispatches, driver shifts, and pending tenders.
  * **Recovery Requests (`#/carrier_requests`):** Review tenders from the Control Tower. Action buttons to **Accept Tender**, **Reject**, or submit counter-rate proposals.
  * **Active Shipments (`#/carrier_shipments`):** Freight assigned to the carrier, current corridor status, origin/destination hubs, and bill of lading documents.
  * **Vehicles & Drivers (`#/carrier_vehicles`, `#/carrier_drivers`):** Manage local vehicle roster (Tractors, Trailers, Reefers) and driver certifications, shift hours, and contact details.
  * **Dispatch Execution (`#/carrier_execution`):** Assign driver Norman Reedus to truck BG-12, complete digital pre-trip inspection, and confirm gate departure.
  * **Report Disruption (`#/carrier_disruptions`):** Driver incident self-report tool: submit breakdowns, traffic snarls, flat tires, or weather delays with photos and notes.
  * **Delivery Confirmation (`#/carrier_delivery`):** Capture recipient electronic signature, upload delivery photos, log arrival timestamp, and generate instant ePOD.

---

### 5. Warehouse Supervisor (`warehouse@gmail.com` / `1`)
* **Mission:** Manage hub inbound/outbound flow, schedule dock doors, perform cold-chain pre-checks, manage cross-dock staging, and conduct security gate driver handovers.
* **Pages & Screens:**
  * **Warehouse Dashboard (`#/warehouse_dashboard`):** Dallas Central Hub (`WH-DAL-01`) overview: Dock door utilization, daily throughput, floor blockers, and scheduled trucks.
  * **Inbound & Outbound (`#/warehouse_shipments`):** Scheduled dock visits, cross-dock freight, and bay assignments.
  * **Shipment Readiness (`#/warehouse_readiness`):** Quality check: verify pre-cooling temperature for pharmaceuticals, inspect packaging seals, and confirm HAZMAT labeling.
  * **Dock Scheduling & Bays (`#/warehouse_docks`):** Real-time dock scheduler (Doors 1-8): allocate bays, monitor truck turn-around times, and clear finished bays.
  * **Picking & Staging (`#/warehouse_picking`):** Floor warehouse task list: manage forklift pick queues and staged pallets for pending departures.
  * **Loading & Handover (`#/warehouse_loading`, `#/warehouse_handover`):** Scan pallets during trailer loading, verify driver credentials at the security gate, and issue gate passes.
  * **Diverted Freight (`#/warehouse_diverted`):** Manage unexpected intake: cross-dock shipments rerouted to Dallas due to interstate closures or terminal delays.

---

### 6. Customer Service (`cs@gmail.com` / `1`)
* **Mission:** Maintain corporate account satisfaction, triage delivery deviations, compose empathetic proactive advisories, and leverage AI Copilots for customer-safe communication.
* **Pages & Screens:**
  * **CS Dashboard (`#/cs_dashboard`):** Account risk board, affected customer accounts, pending advisories, and customer satisfaction metrics.
  * **Monitored Shipments (`#/cs_shipments`):** Filter shipments by customer account (e.g. BioPharma Health Alliance) with customer-facing status indicators.
  * **Customer-Facing Detail (`#/cs_shipment_detail`):** View the exact sanitized data visible to the client (approved ETAs, verified milestones, non-blaming disruption reasons).
  * **Customer Service Queue (`#/cs_queue`):** Prioritized queue of shipments needing customer contact due to approved ETA changes or delivery reschedules.
  * **Compose Communication (`#/cs_compose`):** Multi-channel drafting (Email, SMS, Portal Notice) with dynamic variable tags (`{orderRef}`, `{approvedETA}`).
  * **CS AI Copilot (`#/cs_ai_assistant`):** AI drafting assistant: converts raw operational fault logs into professional, reassuring, non-blaming customer updates.
  * **Escalate to Operations (`#/cs_escalations`):** Direct escalation channel to Control Tower Analysts regarding critical VIP account demands.

---

### 7. Customer / Enterprise Shipper (`customer@gmail.com` / `1`)
* **Mission:** Complete self-service tracking, access confirmed arrival windows, review cold-chain compliance integrity, download ePOD delivery receipts, and interact with the 24/7 AI tracking assistant.
* **Pages & Screens:**
  * **Customer Home (`#/customer_home`):** Executive portal: Active order count, on-time delivery rate, in-transit progress bars, and recent shipments.
  * **Track Shipment (`#/customer_track`):** Interactive map tracker with geographic corridor, sanitized milestones, and approved arrival windows.
  * **Shipment Detail (`#/customer_shipment_detail`):** Full order manifest, carton/pallet breakdown, cold-chain temperature compliance status, and downloadable documentation.
  * **Notifications (`#/customer_notifications`):** Customer notification center: timely alerts regarding ETA changes, corridor detours, and delivery confirmations.
  * **Support Queries (`#/cust_queries`, `#/cust_contact`):** Submit tickets directly to customer care, track agent responses, and verify order resolutions.
  * **Customer AI Assistant (`#/cust_ai_assistant`):** 24/7 interactive chatbot answering inquiries on delivery status, warehouse receiving docks, and customs documents.

---

## 4. End-to-End Walkthrough Example: Cold-Chain Incident Lifecycle

### Step 1: IoT Detection & Automated Alerting (IoT Telematics &bull; System Store)
* Shipment **BRG-2843** (BioPharma Critical Cryo-Vaccine Consignment) is in transit from Dallas to Mountain Knot via refrigerated unit `RT-04`.
* The IoT sensor detects a temperature spike to **-14.2°C**, breaching the mandatory contract limit of **-20.0°C**. An automated Critical Exception is raised.

### Step 2: Control Tower Triage & Forensics (Analyst Sarah Lin)
* Sarah Lin receives the Critical Alert on the **Exception Queue** (`#/analyst_queue`).
* In the **Investigation Workspace** (`#/analyst_investigation`), she inspects the telematics telemetry curve and detects a secondary refrigeration compressor stall.
* She launches a **War Room** session (`#/analyst_war_room`) and flags the incident for immediate cross-dock intercept.

### Step 3: Route Re-planning & Carrier Recovery Tender (Dispatcher Elena Rostova)
* Elena Rostova opens the **Planning & Routing Workspace** (`#/dispatcher_planning`).
* She identifies an emergency rendezvous point at the Dallas Central Hub (`WH-DAL-01`), minimizing the added transit deviation to 1 hour 45 minutes.
* In **Carrier Recovery Operations** (`#/dispatcher_recoveries`), she issues Expedite Tender `REC-2005` to partner `CAR-01` (Bridges Global Logistics).

### Step 4: Carrier Tender Acceptance & Driver Dispatch (Carrier Marcus Vance)
* Marcus Vance reviews the notification in **Recovery Requests** (`#/carrier_requests`) and accepts tender `REC-2005`.
* In **Dispatch Execution** (`#/carrier_execution`), he assigns relief refrigerated truck `BG-12` and driver `Norman Reedus`, completing the pre-trip checklist and dispatching the vehicle to the Dallas hub.

### Step 5: Warehouse Hub Intake & Quality Inspection (Warehouse Carlos Mendoza)
* At Dallas Hub (`WH-DAL-01`), Carlos Mendoza sees the emergency arrival on his **Warehouse Dashboard** (`#/warehouse_dashboard`).
* In **Dock Scheduling** (`#/warehouse_docks`), he assigns Bay 2.
* In **Shipment Readiness** (`#/warehouse_readiness`), his team performs a manual temperature probe check, verifies thermal stability, transfers the vaccine pallets to truck `BG-12`, and logs driver departure in **Carrier Handover** (`#/warehouse_handover`).

### Step 6: Customer Care Advisory via AI Copilot (Customer Service Clara Hughes)
* Clara Hughes spots the revised arrival window in her **Customer Service Queue** (`#/cs_queue`).
* In the **CS AI Copilot** (`#/cs_ai_assistant`), she generates a customer-safe message explaining a "routine equipment safety swap with cold-chain stability verified" confirming a revised delivery window of 2:30 PM.
* She sends the advisory via **Compose Communication** (`#/cs_compose`).

### Step 7: Customer Self-Service Tracking & Final Delivery (Customer Sarah Jenkins &bull; Driver)
* Sarah Jenkins opens her **Customer Home** (`#/customer_home`), reviews the notification, and monitors the final leg on **Track Shipment** (`#/customer_track`).
* Upon truck arrival at Mountain Knot, driver Norman Reedus captures her digital signature and photo in **Delivery Confirmation** (`#/carrier_delivery`).
* The electronic Proof of Delivery (ePOD) is instantly archived in both portals.

### Step 8: Governance & Permanent Audit Record (Administrator Bima Ary)
* Administrator Bima Ary reviews the completed incident in **Exception History** (`#/exceptions`).
* Carrier Bridges Global Logistics receives full SLA credit in **Carrier Management** (`#/carriers`) for meeting the expedited turnaround time.
* The complete sequence is permanently written to the immutable **System Audit Log** (`#/audit`).

