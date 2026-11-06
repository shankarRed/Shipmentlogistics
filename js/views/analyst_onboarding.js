/**
 * BRIDGES Control Tower - Shipment & Order Onboarding View
 * Supports file uploading (CSV, JSON, Excel), record validation, in-line error correction,
 * multi-entity linking (customers, carriers, warehouses, lanes, orders), and import execution.
 */

const AnalystOnboardingView = {
  currentBatch: null,
  activeTab: 'upload', // 'upload' or 'history'

  // Pre-configured benchmark templates
  sampleBatches: {
    pharma: [
      { id: 'BRG-3101', orderReference: 'ORD-BIO-2026-881', origin: 'Dallas Central Logistics Hub', destination: 'Mountain Knot Cryo Vaults', carrierId: 'CAR-01', cargoType: 'Cold-Chain Biologics (-20°C)', cargoValue: '$180,000', customerTier: 'Tier 1 Strategic', tempClass: 'Cryo Ultra-Low', status: 'Loading', valid: true },
      { id: 'BRG-3102', orderReference: 'ORD-BIO-2026-882', origin: 'Dallas Central Logistics Hub', destination: 'Capital Knot Medical Center', carrierId: 'CAR-05', cargoType: 'Critical Vaccines (2°C - 8°C)', cargoValue: '$95,000', customerTier: 'Tier 1 Strategic', tempClass: 'Refrigerated 2-8C', status: 'Loading', valid: true },
      { id: 'BRG-3103', orderReference: 'ORD-BIO-2026-883', origin: 'Dallas Central Logistics Hub', destination: 'Lake Knot Hospital Depot', carrierId: 'CAR-01', cargoType: 'Plasma Fractionation Kits', cargoValue: '$120,000', customerTier: 'Tier 1 Strategic', tempClass: 'Refrigerated 2-8C', status: 'Loading', valid: true },
      { id: 'BRG-3104', orderReference: 'ORD-BIO-2026-884', origin: 'Dallas Central Logistics Hub', destination: 'Chicago O\'Hare Freight Depot', carrierId: 'CAR-02', cargoType: 'Diagnostic Reagents', cargoValue: '$45,000', customerTier: 'Tier 2 Commercial', tempClass: 'Controlled Ambient', status: 'Loading', valid: false, errorField: 'carrierId', errorMessage: 'Carrier CAR-02 has pending compliance audit' },
      { id: 'BRG-3105', orderReference: 'ORD-BIO-2026-885', origin: 'Dallas Central Logistics Hub', destination: 'Los Angeles Port Gateway', carrierId: 'CAR-04', cargoType: 'Clinical Trial Batch A4', cargoValue: '$210,000', customerTier: 'Tier 1 Strategic', tempClass: 'Cryo Ultra-Low', status: 'Loading', valid: true }
    ],
    express: [
      { id: 'BRG-3201', orderReference: 'ORD-EXP-771', origin: 'Dallas Central Logistics Hub', destination: 'Capital Knot Hub', carrierId: 'CAR-01', cargoType: 'High-Precision Robotics', cargoValue: '$140,000', customerTier: 'Tier 1 Strategic', tempClass: 'Ambient', status: 'Loading', valid: true },
      { id: 'BRG-3202', orderReference: 'ORD-EXP-772', origin: 'Dallas Central Logistics Hub', destination: 'Lake Knot Industrial Park', carrierId: 'CAR-02', cargoType: 'Lithium Battery Assemblies', cargoValue: '$88,000', customerTier: 'Tier 2 Commercial', tempClass: 'HazMat Class 9', status: 'Loading', valid: false, errorField: 'orderReference', errorMessage: 'Duplicate order reference flag' }
    ]
  },

  render() {
    if (!this.currentBatch) {
      this.loadPreset('pharma');
    }

    const batches = window.BRIDGES_STORE ? window.BRIDGES_STORE.getOnboardedBatches() : [];
    const validCount = (this.currentBatch?.records || []).filter(r => r.valid).length;
    const errorCount = (this.currentBatch?.records || []).filter(r => !r.valid).length;

    return `
      <div class="view-container animate-fade-in">
        <!-- Page Header -->
        <div class="page-header mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 18px; font-weight: 800; color: var(--color-midnight); margin: 0;">Shipment &amp; Order Onboarding</h2>
              <span class="role-indicator-pill role-analyst">Ingestion Engine</span>
            </div>
            <p style="font-size: 12px; color: var(--color-charcoal); margin: 3px 0 0 0;">
              Multi-channel manifest onboarding, automated data validation, in-line defect rectification, and entity governance.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="AnalystOnboardingView.downloadSampleTemplate()">
              ${Icons.download ? Icons.download(13) : Icons.clipboard(13)}
              <span>Download CSV Template</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="AnalystOnboardingView.openImportSummaryModal()">
              ${Icons.audit ? Icons.audit(14) : Icons.check(14)}
              <span>Import History Archive</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Summary Cards -->
        <div class="analyst-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px;">
          <div class="analyst-kpi-card kpi-active">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Current Batch Records</span>
              <span class="analyst-kpi-badge">${this.currentBatch?.records?.length || 0} Total</span>
            </div>
            <div class="analyst-kpi-value">${this.currentBatch?.records?.length || 0}</div>
            <div class="analyst-kpi-sub">Parsed Manifest Rows</div>
          </div>
          <div class="analyst-kpi-card kpi-resolved">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Validated &amp; Ready</span>
              <span class="analyst-kpi-badge" style="background: #EAF7EE; color: #1E8E3E;">${validCount} Valid</span>
            </div>
            <div class="analyst-kpi-value" style="color: #1E8E3E;">${validCount}</div>
            <div class="analyst-kpi-sub">100% Schema Conformance</div>
          </div>
          <div class="analyst-kpi-card kpi-critical">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Requires Rectification</span>
              <span class="analyst-kpi-badge" style="background: #FEE2E2; color: #DC2626;">${errorCount} Flagged</span>
            </div>
            <div class="analyst-kpi-value" style="color: #DC2626;">${errorCount}</div>
            <div class="analyst-kpi-sub">Click In-line to Correct</div>
          </div>
          <div class="analyst-kpi-card kpi-recoveries">
            <div class="analyst-kpi-header">
              <span class="analyst-kpi-title">Historic Batches Ingested</span>
              <span class="analyst-kpi-badge">${batches.length} Batches</span>
            </div>
            <div class="analyst-kpi-value" style="color: #1967D2;">${batches.length}</div>
            <div class="analyst-kpi-sub">Total Successful Runs</div>
          </div>
        </div>

        <!-- Step Pipeline Indicator -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
            <div style="position: absolute; top: 14px; left: 40px; right: 40px; height: 2px; background: #E2E8F0; z-index: 1;"></div>
            
            <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #18217E; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">1</div>
              <span style="font-size: 11px; font-weight: 700; color: #070724; margin-top: 5px;">File Ingestion</span>
              <span style="font-size: 10px; color: #8A9995;">CSV / JSON / EDI</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #18217E; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">2</div>
              <span style="font-size: 11px; font-weight: 700; color: #070724; margin-top: 5px;">Field Validation</span>
              <span style="font-size: 10px; color: #8A9995;">Schema &amp; Syntax</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${errorCount > 0 ? '#DC2626' : '#1E8E3E'}; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">3</div>
              <span style="font-size: 11px; font-weight: 700; color: #070724; margin-top: 5px;">In-line Correction</span>
              <span style="font-size: 10px; color: ${errorCount > 0 ? '#DC2626' : '#1E8E3E'};">${errorCount > 0 ? `${errorCount} Issues Pending` : 'All Clear'}</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #1967D2; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">4</div>
              <span style="font-size: 11px; font-weight: 700; color: #070724; margin-top: 5px;">Entity Linking</span>
              <span style="font-size: 10px; color: #8A9995;">Customer, Carrier, Dock</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #1E8E3E; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">5</div>
              <span style="font-size: 11px; font-weight: 700; color: #070724; margin-top: 5px;">Commit to Registry</span>
              <span style="font-size: 10px; color: #8A9995;">Live Operations Sync</span>
            </div>
          </div>
        </div>

        <!-- Ingestion & Upload Container -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Dropzone & Batch Loader -->
          <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-size: 14px; font-weight: 800; color: var(--color-midnight); margin: 0;">Upload Shipment / Order File</h3>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="AnalystOnboardingView.loadPreset('pharma')" style="font-size: 11px;">
                  Load Cold-Chain Preset
                </button>
                <button class="btn btn-secondary btn-sm" onclick="AnalystOnboardingView.loadPreset('express')" style="font-size: 11px;">
                  Load High-Priority Preset
                </button>
              </div>
            </div>

            <div 
              id="onboarding-dropzone" 
              style="border: 2px dashed #C7DCFA; background: #F8FAFE; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;"
              onclick="document.getElementById('onboarding-file-input').click()"
            >
              <input type="file" id="onboarding-file-input" style="display: none;" accept=".csv,.json,.xlsx,.txt" onchange="AnalystOnboardingView.handleFileSelect(event)">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #EBF3FC; color: #18217E; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                ${Icons.upload ? Icons.upload(20) : Icons.clipboard(20)}
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #18217E;">Drag and drop shipment manifest file here, or browse</div>
              <div style="font-size: 11px; color: #8A9995; margin-top: 3px;">Supports CSV, JSON, SAP TM EDI 204/214 envelopes, and Excel manifests (Max 25MB)</div>
              <div style="margin-top: 10px; display: inline-flex; gap: 6px;">
                <span class="badge" style="background: #FFFFFF; border: 1px solid #C7DCFA; color: #18217E; font-size: 10px;">Current File: <strong>${this.currentBatch?.fileName || 'Biopharma_Q2_Manifest.csv'}</strong></span>
                <span class="badge" style="background: #FFFFFF; border: 1px solid #C7DCFA; color: #18217E; font-size: 10px;">Size: <strong>${this.currentBatch?.fileSize || '142 KB'}</strong></span>
              </div>
            </div>
          </div>

          <!-- Multi-Entity Linking Governance Panel -->
          <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); padding: 16px;">
            <h3 style="font-size: 14px; font-weight: 800; color: var(--color-midnight); margin: 0 0 10px 0;">Entity Linking Configuration</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; color: #393A50; display: block; margin-bottom: 3px;">Customer Account Link *</label>
                <select id="link-customer-select" class="form-control" style="font-size: 12px; padding: 5px 8px;">
                  <option value="CUST-BIO-01|BioPharma Health Alliance">BioPharma Health Alliance (Tier 1 Strategic)</option>
                  <option value="CUST-APEX-02|Apex Dynamics Corp">Apex Dynamics Corp (Tier 1 Strategic)</option>
                  <option value="CUST-GME-03|Global Maritime Energy">Global Maritime Energy (Tier 2 Commercial)</option>
                  <option value="CUST-OMNI-04|OmniTech Enterprise Logistics">OmniTech Enterprise Logistics (Tier 2)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; color: #393A50; display: block; margin-bottom: 3px;">Assigned Primary Carrier *</label>
                <select id="link-carrier-select" class="form-control" style="font-size: 12px; padding: 5px 8px;">
                  <option value="CAR-01|Bridges Global Logistics">Bridges Global Logistics (Fleet CAR-01)</option>
                  <option value="CAR-05|SkyLink Aviation Cargo">SkyLink Aviation Cargo (Air Express CAR-05)</option>
                  <option value="CAR-02|Apex Freight Services">Apex Freight Services (FTL CAR-02)</option>
                  <option value="CAR-03|Nordic Cold Chain Express">Nordic Cold Chain Express (Cryo CAR-03)</option>
                  <option value="CAR-04|Pacific Marine Cargo Line">Pacific Marine Cargo Line (Ocean CAR-04)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; color: #393A50; display: block; margin-bottom: 3px;">Origin Distribution Warehouse *</label>
                <select id="link-warehouse-select" class="form-control" style="font-size: 12px; padding: 5px 8px;">
                  <option value="Dallas Central Logistics Hub (WH-DAL-01)">Dallas Central Logistics Hub (WH-DAL-01)</option>
                  <option value="Chicago O'Hare Freight Depot (WH-ORD-01)">Chicago O'Hare Freight Depot (WH-ORD-01)</option>
                  <option value="Los Angeles Port Gateway (WH-LAX-01)">Los Angeles Port Gateway (WH-LAX-01)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; color: #393A50; display: block; margin-bottom: 3px;">Transport Corridor / Lane Link</label>
                <input type="text" id="link-lane-input" class="form-control" style="font-size: 12px; padding: 5px 8px;" value="Corridor 35 — Midwest Dedicated Express">
              </div>
            </div>
          </div>
        </div>

        <!-- In-Line Validation & Rectification Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px;">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-light-blue-grey); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 14px; font-weight: 800; color: var(--color-midnight);">Parsed Shipment Records &amp; Validation Status</span>
              <span style="font-size: 11px; color: var(--color-charcoal); margin-left: 8px;">Review, edit fields inline, or auto-fix errors prior to live import</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="AnalystOnboardingView.autoFixAllErrors()" ${errorCount === 0 ? 'disabled' : ''}>
                ${Icons.sparkles ? Icons.sparkles(13) : ''}
                <span>Auto-Fix Validation Errors</span>
              </button>
              <button 
                class="btn btn-primary btn-sm" 
                onclick="AnalystOnboardingView.commitImport()" 
                style="background: #1E8E3E; border-color: #1E8E3E; font-weight: 700;"
                ${errorCount > 0 ? 'title="Please rectify all errors before importing"' : ''}
              >
                ${Icons.check ? Icons.check(13) : ''}
                <span>Import ${validCount} Valid Records</span>
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Validation</th>
                  <th>Shipment ID</th>
                  <th>Order Ref</th>
                  <th>Destination Hub</th>
                  <th>Carrier</th>
                  <th>Cargo Specification</th>
                  <th>Declared Value</th>
                  <th>Customer Tier</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${(this.currentBatch?.records || []).map((rec, idx) => `
                  <tr style="${!rec.valid ? 'background: #FFF5F5;' : ''}">
                    <td>
                      ${rec.valid ? `
                        <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-size: 10px; font-weight: 700;">
                          ✓ Valid
                        </span>
                      ` : `
                        <span class="badge badge-danger" style="font-size: 10px; font-weight: 700;" title="${rec.errorMessage}">
                          ⚠ Error: ${rec.errorField}
                        </span>
                      `}
                    </td>
                    <td>
                      <strong style="color: var(--color-royal-navy);">${rec.id}</strong>
                    </td>
                    <td>
                      <span style="font-weight: 600; color: var(--color-midnight);">${rec.orderReference}</span>
                    </td>
                    <td>
                      <span>${rec.destination}</span>
                    </td>
                    <td>
                      <span class="badge" style="background: #EEF2F6; color: var(--color-midnight); font-weight: 600;">
                        ${rec.carrierId}
                      </span>
                      ${!rec.valid && rec.errorField === 'carrierId' ? `
                        <div style="font-size: 10px; color: #DC2626; margin-top: 2px;">${rec.errorMessage}</div>
                      ` : ''}
                    </td>
                    <td>
                      <div><strong>${rec.cargoType}</strong></div>
                      <div style="font-size: 10px; color: var(--color-muted-sage);">${rec.tempClass || 'Standard'}</div>
                    </td>
                    <td>
                      <span>${rec.cargoValue}</span>
                    </td>
                    <td>
                      <span class="badge" style="background: #EBF3FC; color: #1967D2;">${rec.customerTier}</span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 11px;" onclick="AnalystOnboardingView.openInlineEditModal(${idx})">
                        ${!rec.valid ? 'Rectify Error' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Batch Ingestions Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-light-blue-grey); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-light-blue-grey); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 800; color: var(--color-midnight);">Recent Onboarding Audit Batches</span>
            <span style="font-size: 11px; color: var(--color-charcoal);">${batches.length} Archived Runs</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>File Name</th>
                  <th>Ingested Records</th>
                  <th>Linked Customer</th>
                  <th>Linked Carrier</th>
                  <th>Origin Warehouse</th>
                  <th>Onboarded At</th>
                  <th>Analyst</th>
                  <th style="text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${batches.map(b => `
                  <tr>
                    <td><strong style="color: var(--color-royal-navy);">${b.id}</strong></td>
                    <td><span>${b.fileName}</span></td>
                    <td><strong>${b.validRecords}</strong> shipments</td>
                    <td><span>${b.linkedCustomer}</span></td>
                    <td><span class="badge" style="background: #EEF2F6;">${b.linkedCarrier}</span></td>
                    <td><span>${b.linkedWarehouse}</span></td>
                    <td><span style="font-size: 11px;">${b.importedAt ? b.importedAt.slice(0, 16).replace('T', ' ') : '--'}</span></td>
                    <td><span style="font-size: 11px;">${b.importedBy}</span></td>
                    <td style="text-align: right;">
                      <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-weight: 700;">✓ Ingested</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  loadPreset(presetName) {
    const list = this.sampleBatches[presetName] || this.sampleBatches.pharma;
    this.currentBatch = {
      fileName: presetName === 'pharma' ? 'BioPharma_Spring_Manifest_Q2.csv' : 'Priority_Express_Linehaul.json',
      fileSize: presetName === 'pharma' ? '184 KB' : '92 KB',
      records: JSON.parse(JSON.stringify(list))
    };
    if (window.App && App.currentView === 'analyst_onboarding') {
      App.renderCurrentView();
    }
  },

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate parsing of file
    const simulatedRecords = [
      { id: `BRG-${Math.floor(3300 + Math.random() * 400)}`, orderReference: `ORD-UPLOAD-${Math.floor(100 + Math.random() * 900)}`, origin: 'Dallas Central Logistics Hub', destination: 'Capital Knot Medical Center', carrierId: 'CAR-01', cargoType: 'Onboarded Express Cargo', cargoValue: '$115,000', customerTier: 'Tier 1 Strategic', tempClass: 'Cold-Chain 2-8C', status: 'Loading', valid: true },
      { id: `BRG-${Math.floor(3400 + Math.random() * 400)}`, orderReference: `ORD-UPLOAD-${Math.floor(100 + Math.random() * 900)}`, origin: 'Dallas Central Logistics Hub', destination: 'Lake Knot Distribution Hub', carrierId: 'CAR-05', cargoType: 'Critical Biologics', cargoValue: '$78,000', customerTier: 'Tier 1 Strategic', tempClass: 'Cryo Ultra-Low', status: 'Loading', valid: true },
      { id: `BRG-${Math.floor(3500 + Math.random() * 400)}`, orderReference: `ORD-UPLOAD-${Math.floor(100 + Math.random() * 900)}`, origin: 'Dallas Central Logistics Hub', destination: 'Chicago O\'Hare Freight Depot', carrierId: 'CAR-99', cargoType: 'Diagnostic Materials', cargoValue: '$42,000', customerTier: 'Tier 2 Commercial', tempClass: 'Ambient', status: 'Loading', valid: false, errorField: 'carrierId', errorMessage: 'Carrier CAR-99 unknown in registry' }
    ];

    this.currentBatch = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      records: simulatedRecords
    };

    UI.showToast(`File "${file.name}" ingested. Parsed ${simulatedRecords.length} records.`, 'success');
    if (window.App && App.currentView === 'analyst_onboarding') {
      App.renderCurrentView();
    }
  },

  downloadSampleTemplate() {
    const csvContent = "data:text/csv;charset=utf-8,Shipment_ID,Order_Reference,Origin,Destination,Carrier_ID,Cargo_Type,Cargo_Value,Customer_Tier,Temperature_Class\nBRG-3091,ORD-SAMPLE-01,Dallas Central Logistics Hub,Capital Knot Medical Center,CAR-01,Vaccine Vials,$95000,Tier 1 Strategic,Refrigerated 2-8C\nBRG-3092,ORD-SAMPLE-02,Dallas Central Logistics Hub,Mountain Knot Cryo Vaults,CAR-03,Biologics,-20C Cryo,$185000,Tier 1 Strategic,Cryo Ultra-Low\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "BRIDGES_Shipment_Onboarding_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    UI.showToast("Sample onboarding CSV template downloaded.", "info");
  },

  openInlineEditModal(recordIndex) {
    const rec = this.currentBatch.records[recordIndex];
    if (!rec) return;

    const modalHtml = `
      <form id="edit-onboarding-record-form" onsubmit="AnalystOnboardingView.saveRecordEdit(event, ${recordIndex})">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${!rec.valid ? `
            <div style="background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;">
              Validation Error: ${rec.errorMessage}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Shipment ID *</label>
              <input type="text" id="edit-rec-id" class="form-control" value="${rec.id}" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Order Reference *</label>
              <input type="text" id="edit-rec-order" class="form-control" value="${rec.orderReference}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Origin Terminal *</label>
              <input type="text" id="edit-rec-origin" class="form-control" value="${rec.origin}" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Destination Hub *</label>
              <input type="text" id="edit-rec-dest" class="form-control" value="${rec.destination}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Carrier Assignment *</label>
              <select id="edit-rec-carrier" class="form-control" required>
                <option value="CAR-01" ${rec.carrierId === 'CAR-01' ? 'selected' : ''}>CAR-01 (Bridges Global Logistics)</option>
                <option value="CAR-02" ${rec.carrierId === 'CAR-02' ? 'selected' : ''}>CAR-02 (Apex Freight Services)</option>
                <option value="CAR-03" ${rec.carrierId === 'CAR-03' ? 'selected' : ''}>CAR-03 (Nordic Cold Chain Express)</option>
                <option value="CAR-04" ${rec.carrierId === 'CAR-04' ? 'selected' : ''}>CAR-04 (Pacific Marine Cargo Line)</option>
                <option value="CAR-05" ${rec.carrierId === 'CAR-05' ? 'selected' : ''}>CAR-05 (SkyLink Aviation Cargo)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Declared Value *</label>
              <input type="text" id="edit-rec-value" class="form-control" value="${rec.cargoValue}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Cargo Specification *</label>
              <input type="text" id="edit-rec-cargo" class="form-control" value="${rec.cargoType}" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">Customer Priority Tier *</label>
              <select id="edit-rec-tier" class="form-control" required>
                <option value="Tier 1 Strategic" ${rec.customerTier.includes('Tier 1') ? 'selected' : ''}>Tier 1 Strategic</option>
                <option value="Tier 2 Commercial" ${rec.customerTier.includes('Tier 2') ? 'selected' : ''}>Tier 2 Commercial</option>
                <option value="Standard" ${rec.customerTier === 'Standard' ? 'selected' : ''}>Standard</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save &amp; Validate Record</button>
          </div>
        </div>
      </form>
    `;

    UI.openModal('generic-app-modal', `Edit Onboarding Record — ${rec.id}`, modalHtml);
  },

  saveRecordEdit(e, index) {
    e.preventDefault();
    const rec = this.currentBatch.records[index];
    if (!rec) return;

    rec.id = document.getElementById('edit-rec-id').value.trim();
    rec.orderReference = document.getElementById('edit-rec-order').value.trim();
    rec.origin = document.getElementById('edit-rec-origin').value.trim();
    rec.destination = document.getElementById('edit-rec-dest').value.trim();
    rec.carrierId = document.getElementById('edit-rec-carrier').value;
    rec.cargoValue = document.getElementById('edit-rec-value').value.trim();
    rec.cargoType = document.getElementById('edit-rec-cargo').value.trim();
    rec.customerTier = document.getElementById('edit-rec-tier').value;

    // Mark valid
    rec.valid = true;
    rec.errorField = null;
    rec.errorMessage = null;

    UI.closeModal('generic-app-modal');
    UI.showToast(`Record ${rec.id} corrected and validated.`, 'success');
    if (window.App && App.currentView === 'analyst_onboarding') {
      App.renderCurrentView();
    }
  },

  autoFixAllErrors() {
    if (!this.currentBatch) return;
    this.currentBatch.records.forEach(rec => {
      if (!rec.valid) {
        if (rec.errorField === 'carrierId') {
          rec.carrierId = 'CAR-01'; // Default to active primary carrier
        }
        if (rec.errorField === 'orderReference') {
          rec.orderReference = `ORD-FIXED-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        rec.valid = true;
        rec.errorField = null;
        rec.errorMessage = null;
      }
    });

    UI.showToast("All validation errors auto-rectified and aligned to standard governance schemas.", "success");
    if (window.App && App.currentView === 'analyst_onboarding') {
      App.renderCurrentView();
    }
  },

  commitImport() {
    if (!this.currentBatch) return;
    const invalid = this.currentBatch.records.filter(r => !r.valid);
    if (invalid.length > 0) {
      UI.showToast(`Cannot import batch: ${invalid.length} record(s) contain validation errors. Please rectify or click Auto-Fix.`, 'error');
      return;
    }

    const customerParts = (document.getElementById('link-customer-select')?.value || 'CUST-BIO-01|BioPharma Health Alliance').split('|');
    const carrierParts = (document.getElementById('link-carrier-select')?.value || 'CAR-01|Bridges Global Logistics').split('|');
    const warehouse = document.getElementById('link-warehouse-select')?.value || 'Dallas Central Logistics Hub (WH-DAL-01)';

    const payload = {
      fileName: this.currentBatch.fileName,
      fileSize: this.currentBatch.fileSize,
      records: this.currentBatch.records,
      linkedCustomerId: customerParts[0],
      linkedCustomerName: customerParts[1],
      linkedCarrierId: carrierParts[0],
      linkedCarrierName: carrierParts[1],
      linkedWarehouse: warehouse
    };

    try {
      const result = window.BRIDGES_STORE.onboardShipmentBatch(payload);
      UI.showToast(`Batch ${result.id} successfully onboarded! ${result.totalRecords} shipments live in registry.`, 'success');

      // Show Import Summary Modal
      const summaryHtml = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #EAF7EE; border: 1px solid #B7EB8F; padding: 12px; border-radius: 6px; color: #1E8E3E;">
            <div style="font-size: 14px; font-weight: 800;">✓ Ingestion &amp; Onboarding Successfully Completed</div>
            <div style="font-size: 11px; margin-top: 3px;">All ${result.totalRecords} manifest records have been committed to the live shipment database.</div>
          </div>

          <div class="meta-kv-grid" style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px;">
            <div class="meta-kv-item">
              <span class="meta-kv-label">Batch Identifier</span>
              <span class="meta-kv-value highlight-navy">${result.id}</span>
            </div>
            <div class="meta-kv-item">
              <span class="meta-kv-label">Records Ingested</span>
              <span class="meta-kv-value" style="color: #1E8E3E; font-weight: 700;">${result.totalRecords} Shipments</span>
            </div>
            <div class="meta-kv-item">
              <span class="meta-kv-label">Linked Customer</span>
              <span class="meta-kv-value">${result.linkedCustomer}</span>
            </div>
            <div class="meta-kv-item">
              <span class="meta-kv-label">Primary Assigned Carrier</span>
              <span class="meta-kv-value">${result.linkedCarrier}</span>
            </div>
            <div class="meta-kv-item">
              <span class="meta-kv-label">Origin Facility</span>
              <span class="meta-kv-value">${result.linkedWarehouse}</span>
            </div>
            <div class="meta-kv-item">
              <span class="meta-kv-label">Ingested By &amp; Time</span>
              <span class="meta-kv-value">${result.importedBy} (${result.importedAt.slice(11, 19)})</span>
            </div>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: #070724;">Generated Shipment Identifiers:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${result.createdShipmentIds.map(id => `
              <span class="badge" style="background: #EBF3FC; color: #18217E; font-size: 11px; font-weight: 700;">${id}</span>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('generic-app-modal')">Close</button>
            <button class="btn btn-primary btn-sm" onclick="UI.closeModal('generic-app-modal'); App.navigateTo('analyst_shipments')">
              View in Active Shipments Registry →
            </button>
          </div>
        </div>
      `;

      UI.openModal('generic-app-modal', `Onboarding Batch Summary — ${result.id}`, summaryHtml);
      App.renderCurrentView();

    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  openImportSummaryModal() {
    const batches = window.BRIDGES_STORE ? window.BRIDGES_STORE.getOnboardedBatches() : [];
    const html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 12px; color: #393A50;">Permanent audit log of all automated and manual shipment onboarding executions:</div>
        <div style="max-height: 380px; overflow-y: auto;">
          ${batches.map(b => `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #18217E; font-size: 12px;">${b.id} — ${b.fileName}</strong>
                <span class="badge" style="background: #EAF7EE; color: #1E8E3E; font-weight: 700;">${b.totalRecords} Records</span>
              </div>
              <div style="color: #555; margin-top: 3px;">
                Customer: <strong>${b.linkedCustomer}</strong> • Carrier: <strong>${b.linkedCarrier}</strong>
              </div>
              <div style="color: #8A9995; margin-top: 2px;">
                Imported by <strong>${b.importedBy}</strong> at ${b.importedAt ? b.importedAt.replace('T', ' ').slice(0, 19) : '--'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    UI.openModal('generic-app-modal', 'Historic Onboarding Batches', html);
  }
};

window.AnalystOnboardingView = AnalystOnboardingView;
