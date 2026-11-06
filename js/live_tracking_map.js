/**
 * BRIDGES Control Tower - Real-World Live Tracking Map & Fleet Telemetry Engine
 * Powered by Leaflet.js with CartoDB Voyager / OpenStreetMap real-world geographic tile layers.
 * Features:
 * - Real-world geographic coordinates (USA continental freight corridors, interstate highways I-30, I-40, I-55, I-80, I-10, real air corridors, and deepwater sea lanes).
 * - Real cities: Dallas (DAL), Little Rock (LIT), Memphis (MEM), Chicago (CHI), Atlanta (ATL), New York (NYC), Los Angeles (LAX), Houston (HOU), Denver (DEN), Miami (MIA).
 * - 500 carrier fleet with smooth real-world GPS interpolation and calm, observable travel speeds.
 * - Active carriers travel along real highways; ONLY once reaching their destination dock do they stop moving (0 km/h), turn emerald green (#10B981), and become Available & Ready.
 * - Central city hubs remain distinct deep navy (#09104D) landmarks; arrived carriers dock in surrounding staging bays without covering the hub.
 * - Embedded small real-world map widget on dashboard + Fullscreen interactive control tower with layer toggles, search, filters, and HUD.
 */

const LiveTrackingMap = {
  // Real-world logistics hubs with true geographic coordinates [lat, lng]
  hubs: {
    DAL: { id: 'DAL', name: 'Dallas SuperCenter', code: 'DAL Hub • 3', lat: 32.7767, lng: -96.7970, city: 'Dallas, TX', type: 'Central Regional SuperHub', units: 3 },
    LIT: { id: 'LIT', name: 'Little Rock Cross-Dock', code: 'LIT Hub • 2', lat: 34.7465, lng: -92.2896, city: 'Little Rock, AR', type: 'Emergency Cross-Dock', units: 2 },
    MEM: { id: 'MEM', name: 'Memphis Intermodal Nexus', code: 'MEM Hub • 4', lat: 35.1495, lng: -90.0490, city: 'Memphis, TN', type: 'Global Air/Rail Gateway', units: 4 },
    CHI: { id: 'CHI', name: 'Chicago Freight Terminal', code: 'CHI Hub • 3', lat: 41.8781, lng: -87.6298, city: 'Chicago, IL', type: 'Intermodal Rail SuperCenter', units: 3 },
    ATL: { id: 'ATL', name: 'Atlanta Southeast Gateway', code: 'ATL Hub • 3', lat: 33.7490, lng: -84.3880, city: 'Atlanta, GA', type: 'Southeast Logistics Gateway', units: 3 },
    NYC: { id: 'NYC', name: 'New York / NJ Metro Port', code: 'NYC Hub • 4', lat: 40.7128, lng: -74.0060, city: 'New York, NY', type: 'Metropolitan Cargo Port', units: 4 },
    LAX: { id: 'LAX', name: 'Los Angeles Ocean Port', code: 'LAX Port • 5', lat: 33.7432, lng: -118.2673, city: 'Los Angeles, CA', type: 'Deepwater Pacific Port', units: 5 },
    HOU: { id: 'HOU', name: 'Houston Gulf Port', code: 'HOU Port • 4', lat: 29.7604, lng: -95.3698, city: 'Houston, TX', type: 'Gulf Intermodal Sea Port', units: 4 },
    DEN: { id: 'DEN', name: 'Denver Mountain Terminal', code: 'DEN Hub • 2', lat: 39.7392, lng: -104.9903, city: 'Denver, CO', type: 'Mountain Intermodal Gateway', units: 2 },
    MIA: { id: 'MIA', name: 'Miami Caribbean Gateway', code: 'MIA Hub • 2', lat: 25.7617, lng: -80.1918, city: 'Miami, FL', type: 'Atlantic Trade Port', units: 2 }
  },

  // Real interstate corridors & multi-modal routes
  routes: [],

  // 500 carrier tracking entities
  carriers: [],

  // API Key & Map Provider persistence
  mapApiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('bridges_map_api_key') : '') || '',
  currentTileTheme: (function() {
    if (typeof localStorage === 'undefined') return 'esri_streets';
    const saved = localStorage.getItem('bridges_map_provider');
    const key = localStorage.getItem('bridges_map_api_key');
    // If previously saved as voyager without key, upgrade to clean Esri Streets
    if (saved === 'voyager' && !key) return 'esri_streets';
    return saved || 'esri_streets';
  })(),

  // Real-world cartographic provider engine supporting API keys and zero-watermark GIS layers
  getTileConfig(themeKey) {
    const key = (this.mapApiKey || '').trim();
    const theme = themeKey || this.currentTileTheme || 'esri_streets';

    if (theme === 'esri_streets') {
      return {
        key: 'esri_streets',
        name: 'Esri World Streets (Real World, No Watermark)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; High-Detail Real World Interstate Highways &amp; Streets',
        maxZoom: 19
      };
    }
    if (theme === 'osm') {
      return {
        key: 'osm',
        name: 'OpenStreetMap (Streets)',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      };
    }
    if (theme === 'esri_satellite') {
      return {
        key: 'esri_satellite',
        name: 'Esri Satellite Imagery (Real World)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Photorealistic Earth Satellite',
        maxZoom: 19
      };
    }
    if (theme === 'esri_topo') {
      return {
        key: 'esri_topo',
        name: 'Esri World Topographic (Terrain)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri Topo',
        maxZoom: 19
      };
    }
    if (theme === 'voyager') {
      const url = key
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(key)}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      return {
        key: 'voyager',
        name: 'Carto Voyager (Light)',
        url,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19
      };
    }
    if (theme === 'dark') {
      const url = key
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(key)}`
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      return {
        key: 'dark',
        name: 'Carto Dark Matter (Night)',
        url,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19
      };
    }
    if (theme === 'mapbox') {
      const token = key || 'REDACTED';
      return {
        key: 'mapbox',
        name: 'Mapbox Streets (Token Required)',
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`,
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19
      };
    }
    return {
      key: 'esri_streets',
      name: 'Esri World Streets (Real World, No Watermark)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    };
  },

  // Leaflet map instances
  smallMap: null,
  smallTileLayer: null,
  smallCanvasLayer: null,
  smallCtx: null,

  fullscreenMap: null,
  fullscreenTileLayer: null,
  fullscreenCanvasLayer: null,
  fullscreenCtx: null,

  // Animation & simulation state
  isRunning: false,
  animationFrameId: null,
  lastTimestamp: 0,
  isFullscreen: false,

  // Interactive selection & filtering
  selectedCarrier: null,
  hoveredCarrier: null,
  followingCarrier: null,
  searchFilter: '',
  typeFilter: 'ALL',
  statusFilter: 'ALL',
  _initialized: false,

  init() {
    if (this._initialized && this.carriers && this.carriers.length > 0) {
      if (!this.isRunning) this.startSimulation();
      return;
    }
    this.buildRoutes();
    this.buildCarrierFleet();
    this._initialized = true;
    this.startSimulation();
  },

  // Great-circle Haversine formula for physical distance (km)
  getLatLngDistance(p1, p2) {
    const R = 6371;
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLng = (p2[1] - p1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  buildRoutes() {
    const H = this.hubs;
    this.routes = [
      // 1. I-30 Expressway: Dallas <-> Little Rock (Central scenario route)
      {
        id: 'R-DAL-LIT',
        name: 'Interstate 30 Corridor (Dallas ⇄ Little Rock)',
        type: 'highway',
        code: 'I-30',
        originId: 'DAL',
        destId: 'LIT',
        points: [
          [32.7767, -96.7970],
          [33.1507, -95.3013],
          [33.4255, -94.0477],
          [33.8837, -93.5607],
          [34.1209, -93.0782],
          [34.4837, -92.5532],
          [34.7465, -92.2896]
        ]
      },
      // 2. I-40 Trans-Corridor: Little Rock <-> Memphis
      {
        id: 'R-LIT-MEM',
        name: 'Interstate 40 Trans-Corridor (Little Rock ⇄ Memphis)',
        type: 'highway',
        code: 'I-40',
        originId: 'LIT',
        destId: 'MEM',
        points: [
          [34.7465, -92.2896],
          [34.8756, -91.8037],
          [34.9876, -91.1963],
          [35.1539, -90.5847],
          [35.1495, -90.0490]
        ]
      },
      // 3. I-55 Heartland Arterial: Memphis <-> Chicago
      {
        id: 'R-MEM-CHI',
        name: 'Interstate 55 Heartland Arterial (Memphis ⇄ Chicago)',
        type: 'highway',
        code: 'I-55',
        originId: 'MEM',
        destId: 'CHI',
        points: [
          [35.1495, -90.0490],
          [35.8828, -89.9234],
          [36.8778, -89.5878],
          [38.6270, -90.1994],
          [39.7817, -89.6501],
          [40.4842, -88.9937],
          [41.5250, -88.0817],
          [41.8781, -87.6298]
        ]
      },
      // 4. I-20 Southeast Arterial: Dallas <-> Atlanta
      {
        id: 'R-DAL-ATL',
        name: 'Interstate 20 Southeast Arterial (Dallas ⇄ Atlanta)',
        type: 'highway',
        code: 'I-20',
        originId: 'DAL',
        destId: 'ATL',
        points: [
          [32.7767, -96.7970],
          [32.4709, -95.3011],
          [32.5252, -93.7502],
          [32.5093, -92.1193],
          [32.2988, -90.1848],
          [32.3643, -88.7037],
          [33.5186, -86.8104],
          [33.7490, -84.3880]
        ]
      },
      // 5. I-85/I-95 East Coast Corridor: Atlanta <-> New York
      {
        id: 'R-ATL-NYC',
        name: 'Interstate 85/95 East Coast Corridor (Atlanta ⇄ New York)',
        type: 'highway',
        code: 'I-85/95',
        originId: 'ATL',
        destId: 'NYC',
        points: [
          [33.7490, -84.3880],
          [34.8526, -82.3940],
          [35.2271, -80.8431],
          [36.0726, -79.7920],
          [37.5407, -77.4360],
          [38.9072, -77.0369],
          [39.2904, -76.6122],
          [39.9526, -75.1652],
          [40.7128, -74.0060]
        ]
      },
      // 6. I-80 Great Lakes Corridor: Chicago <-> New York
      {
        id: 'R-CHI-NYC',
        name: 'Interstate 80 Great Lakes Corridor (Chicago ⇄ New York)',
        type: 'highway',
        code: 'I-80',
        originId: 'CHI',
        destId: 'NYC',
        points: [
          [41.8781, -87.6298],
          [41.6764, -86.2520],
          [41.5055, -83.6520],
          [41.4993, -81.6944],
          [41.1399, -77.4605],
          [40.9168, -74.1718],
          [40.7128, -74.0060]
        ]
      },
      // 7. I-45 Gulf Corridor: Dallas <-> Houston
      {
        id: 'R-DAL-HOU',
        name: 'Interstate 45 Gulf Corridor (Dallas ⇄ Houston)',
        type: 'highway',
        code: 'I-45',
        originId: 'DAL',
        destId: 'HOU',
        points: [
          [32.7767, -96.7970],
          [32.0954, -96.4689],
          [31.2585, -95.9922],
          [30.7235, -95.5508],
          [30.1658, -95.4613],
          [29.7604, -95.3698]
        ]
      },
      // 8. I-10 Gulf Coast Highway: Houston <-> Miami
      {
        id: 'R-HOU-MIA',
        name: 'Interstate 10 Gulf Coast Highway (Houston ⇄ Miami)',
        type: 'highway',
        code: 'I-10',
        originId: 'HOU',
        destId: 'MIA',
        points: [
          [29.7604, -95.3698],
          [30.0802, -94.1266],
          [30.2241, -92.0198],
          [29.9511, -90.0715],
          [30.4213, -87.2169],
          [30.4383, -84.2807],
          [30.3322, -81.6557],
          [28.5383, -81.3792],
          [26.7153, -80.0534],
          [25.7617, -80.1918]
        ]
      },
      // 9. I-10 / I-40 Pacific Transcon: Dallas <-> Los Angeles
      {
        id: 'R-DAL-LAX',
        name: 'Pacific Transcon Highway (Dallas ⇄ Los Angeles)',
        type: 'highway',
        code: 'I-10/I-40',
        originId: 'DAL',
        destId: 'LAX',
        points: [
          [32.7767, -96.7970],
          [32.4487, -99.7331],
          [31.8457, -102.3676],
          [31.7619, -106.4850],
          [32.2226, -110.9747],
          [33.4484, -112.0740],
          [33.6803, -114.5964],
          [34.1083, -117.2898],
          [33.7432, -118.2673]
        ]
      },
      // 10. I-80 / I-76 Mountain Gateway: Chicago <-> Denver
      {
        id: 'R-CHI-DEN',
        name: 'Interstate 80/76 Mountain Gateway (Chicago ⇄ Denver)',
        type: 'highway',
        code: 'I-80/76',
        originId: 'CHI',
        destId: 'DEN',
        points: [
          [41.8781, -87.6298],
          [41.5236, -90.5776],
          [41.5868, -93.6250],
          [41.2565, -95.9345],
          [40.8258, -96.6852],
          [41.1399, -100.7654],
          [40.4233, -104.7091],
          [39.7392, -104.9903]
        ]
      },
      // 11. Air Cargo Express Alpha: Dallas (DFW) <-> Chicago (ORD)
      {
        id: 'R-AIR-DAL-CHI',
        name: 'Air Cargo Express Alpha (Dallas/DFW ⇄ Chicago/ORD)',
        type: 'airway',
        code: 'AIR-101',
        originId: 'DAL',
        destId: 'CHI',
        points: [
          [32.8998, -97.0403],
          [36.1627, -94.1370],
          [39.0997, -94.5786],
          [41.9742, -87.9073]
        ]
      },
      // 12. Air Cargo Transcon Bravo: New York (JFK) <-> Los Angeles (LAX)
      {
        id: 'R-AIR-NYC-LAX',
        name: 'Air Cargo Transcon Bravo (New York/JFK ⇄ Los Angeles/LAX)',
        type: 'airway',
        code: 'AIR-202',
        originId: 'NYC',
        destId: 'LAX',
        points: [
          [40.6413, -73.7781],
          [41.2565, -87.0000],
          [41.1400, -104.8202],
          [37.2000, -113.0000],
          [33.9416, -118.4085]
        ]
      },
      // 13. Air Cargo Southeast: Atlanta (ATL) <-> Miami (MIA)
      {
        id: 'R-AIR-ATL-MIA',
        name: 'Air Cargo Express Charlie (Atlanta/ATL ⇄ Miami/MIA)',
        type: 'airway',
        code: 'AIR-303',
        originId: 'ATL',
        destId: 'MIA',
        points: [
          [33.6407, -84.4277],
          [30.4383, -83.5000],
          [28.0000, -81.5000],
          [25.7959, -80.2870]
        ]
      },
      // 14. Gulf Deepwater Maritime Lane: Houston Port <-> Miami Port
      {
        id: 'R-SEA-GULF',
        name: 'Gulf of Mexico Maritime Sea Lane (Houston ⇄ Miami)',
        type: 'waterway',
        code: 'SEA-GULF',
        originId: 'HOU',
        destId: 'MIA',
        points: [
          [29.7604, -95.3698],
          [29.3013, -94.7977],
          [27.8000, -92.0000],
          [26.0000, -87.5000],
          [24.5000, -82.5000],
          [25.7617, -80.1918]
        ]
      },
      // 15. North Atlantic Ocean Sea Lane: Miami Port <-> New York Harbor
      {
        id: 'R-SEA-ATLANTIC',
        name: 'North Atlantic Ocean Sea Lane (Miami ⇄ New York)',
        type: 'waterway',
        code: 'SEA-ATL',
        originId: 'MIA',
        destId: 'NYC',
        points: [
          [25.7617, -80.1918],
          [27.5000, -79.2000],
          [31.0000, -78.5000],
          [34.5000, -74.8000],
          [38.5000, -73.2000],
          [40.4000, -73.7000],
          [40.7128, -74.0060]
        ]
      }
    ];

    // Precalculate geographic segment lengths (km)
    this.routes.forEach(route => {
      route.totalLength = 0;
      route.segments = [];
      for (let i = 0; i < route.points.length - 1; i++) {
        const p1 = route.points[i];
        const p2 = route.points[i + 1];
        const dist = this.getLatLngDistance(p1, p2);
        route.segments.push({ p1, p2, dist, cumDist: route.totalLength });
        route.totalLength += dist;
      }
    });
  },

  buildCarrierFleet() {
    const seedCarriers = (window.CARRIERS_500_SEED && window.CARRIERS_500_SEED.length >= 500)
      ? window.CARRIERS_500_SEED
      : (window.BRIDGES_STORE ? window.BRIDGES_STORE.getCarriers() : []);

    const groundRoutes = this.routes.filter(r => r.type === 'highway');
    const airRoutes = this.routes.filter(r => r.type === 'airway');
    const seaRoutes = this.routes.filter(r => r.type === 'waterway');

    this.carriers = seedCarriers.map((c, index) => {
      const vType = c.vehicleType || (c.carrierType.includes('Air') ? 'Air' : c.carrierType.includes('Ocean') ? 'Sea' : c.carrierType.includes('Urban') ? 'Van' : 'Truck');

      let route;
      if (vType === 'Air') {
        route = airRoutes[index % airRoutes.length];
      } else if (vType === 'Sea') {
        route = seaRoutes[index % seaRoutes.length];
      } else if (vType === 'Van') {
        // Last-mile vans operate on regional feeder segments (Dallas, Little Rock, Atlanta, Chicago)
        const metroRoutes = [this.routes[0], this.routes[1], this.routes[6]];
        route = metroRoutes[index % metroRoutes.length];
      } else {
        route = groundRoutes[index % groundRoutes.length];
      }

      // Carriers actively travel along their routes toward destination!
      // They do NOT start as available — they travel, and only when they reach destination do they become available!
      const isInactive = c.status === 'Inactive';
      const direction = index % 2 === 0 ? 1 : -1;

      // Stagger progress evenly across the route [0.06, 0.94] so all active units are visibly traveling in transit
      let progress = ((index * 0.173) % 0.88) + 0.06;
      if (index === 7 || index === 23 || index === 45) {
        progress = 0.93; // Approaches destination dock live within ~15s
      }

      // Smooth, realistic travel speeds ("look travelling little bit slow")
      let baseSpeed = 0.0045; // progress units per second (calm, observable travel)
      if (vType === 'Air') baseSpeed = 0.0085;
      else if (vType === 'Sea') baseSpeed = 0.0028;
      else if (vType === 'Van') baseSpeed = 0.0060;

      if (c.statusDesc === 'Delayed') baseSpeed *= 0.40;
      if (isInactive) baseSpeed = 0;

      // Jitter speed slightly so identical vehicles don't stack
      const speedJitter = 0.85 + (index % 31) * 0.01;
      const speed = isInactive ? 0 : (baseSpeed * speedJitter);

      const status = isInactive ? 'Inactive' : 'Active';
      const statusDesc = isInactive ? 'Docked' : (c.statusDesc || 'On Route');
      const currentSpeed = isInactive ? 0 : (c.currentSpeed || (vType === 'Air' ? 420 : vType === 'Sea' ? 22 : 65));

      return {
        id: c.id,
        carrierIndex: index,
        name: c.name,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        carrierType: c.carrierType,
        operatingRegion: c.operatingRegion,
        rating: c.rating,
        status: status,
        statusDesc: statusDesc,
        delayReason: c.delayReason || null,
        delayCategory: c.delayCategory || null,
        delayDuration: c.delayDuration || null,
        delayImpact: c.delayImpact || null,
        vehicleId: c.vehicleId || `TRK-${index + 100}`,
        vehicleType: vType,
        driverName: c.driverName || 'Assigned Operator',
        cargo: c.cargo || 'Enterprise Freight',
        currentSpeed: currentSpeed,
        routeId: route.id,
        route: route,
        progress: progress,
        direction: direction,
        speed: speed,
        hasArrived: false,
        dockTimer: 0,
        lat: 0,
        lng: 0,
        heading: 0,
        trail: []
      };
    });

    // Initial position calculation
    this.updateCarriers(0);
  },

  updateCarriers(deltaTime) {
    this.carriers.forEach(c => {
      const isAvailable = c.hasArrived || c.status === 'Available' || (c.statusDesc && (c.statusDesc.includes('Available') || c.statusDesc.includes('Ready')));

      // If already arrived or inactive: lock in dock staging bay and DO NOT MOVE
      if (isAvailable || c.speed === 0 || c.status === 'Inactive') {
        c.speed = 0;
        c.currentSpeed = 0;
        if (!c.lat || !c.lng || c.hasArrived) {
          const destPt = c.direction === -1 ? c.route.points[0] : c.route.points[c.route.points.length - 1];
          const hub = this.getNearestHub(destPt[0], destPt[1]);
          const dockOffset = this.getDockOffset(hub, c.carrierIndex || 0);
          c.lat = destPt[0] + dockOffset.lat;
          c.lng = destPt[1] + dockOffset.lng;
        }
        c.heading = 0;
        return;
      }

      if (c.dockTimer > 0) {
        c.dockTimer -= deltaTime;
        return;
      }

      // Advance progress along geographic route
      c.progress += c.direction * c.speed * deltaTime;

      // Handle reaching destination: STOP moving, become Available & Ready, change color, lock in place
      const hasReachedDestination = (c.direction === 1 && c.progress >= 1.0) || (c.direction === -1 && c.progress <= 0.0);
      if (hasReachedDestination) {
        c.progress = c.direction === 1 ? 1.0 : 0.0;
        c.speed = 0;
        c.currentSpeed = 0;
        c.hasArrived = true;
        c.status = 'Available';
        c.statusDesc = 'Available & Ready';

        // Destination terminus point & staging bay around the hub (keeping hub distinct!)
        const destPt = c.direction === 1 
          ? c.route.points[c.route.points.length - 1] 
          : c.route.points[0];
        const hub = this.getNearestHub(destPt[0], destPt[1]);
        const dockOffset = this.getDockOffset(hub, c.carrierIndex || 0);
        c.lat = destPt[0] + dockOffset.lat;
        c.lng = destPt[1] + dockOffset.lng;
        c.heading = 0;
        c.trail = [];

        this.handleCarrierArrival(c);
        return;
      }

      // Compute (lat, lng) along geographic corridor for active carriers
      const pos = this.getPositionAlongRoute(c.route, c.progress);
      c.lat = pos.lat;
      c.lng = pos.lng;
      c.heading = c.direction === 1 ? pos.angle : pos.angle + Math.PI;

      if (c.vehicleType === 'Air' || c.statusDesc === 'Delayed') {
        c.trail.push({ lat: c.lat, lng: c.lng });
        if (c.trail.length > 8) c.trail.shift();
      }
    });

    // Update camera if following a carrier
    if (this.followingCarrier) {
      if (this.fullscreenMap) {
        this.fullscreenMap.panTo([this.followingCarrier.lat, this.followingCarrier.lng], { animate: false });
      }
    }
  },

  getPositionAlongRoute(route, progress) {
    const targetDist = Math.max(0, Math.min(1, progress)) * route.totalLength;
    for (let i = 0; i < route.segments.length; i++) {
      const seg = route.segments[i];
      if (targetDist <= seg.cumDist + seg.dist || i === route.segments.length - 1) {
        const segProgress = (targetDist - seg.cumDist) / (seg.dist || 1);
        const lat = seg.p1[0] + (seg.p2[0] - seg.p1[0]) * segProgress;
        const lng = seg.p1[1] + (seg.p2[1] - seg.p1[1]) * segProgress;
        const angle = Math.atan2(seg.p2[0] - seg.p1[0], seg.p2[1] - seg.p1[1]);
        return { lat, lng, angle };
      }
    }
    const last = route.points[route.points.length - 1];
    return { lat: last[0], lng: last[1], angle: 0 };
  },

  getNearestHub(lat, lng) {
    let closest = null;
    let minDist = Infinity;
    Object.values(this.hubs).forEach(h => {
      const dist = Math.hypot(h.lat - lat, h.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        closest = h;
      }
    });
    return closest;
  },

  getDockOffset(hub, carrierIndex) {
    if (!hub) return { lat: 0, lng: 0 };
    // Arrange in perimeter terminal staging bays around the hub (offset in degrees lat/lng)
    // so the central hub badge remains distinct and unblocked ("the carriers not the hub")
    const angle = (((carrierIndex || 0) * 53) % 360) * (Math.PI / 180);
    const radiusDeg = 0.12 + (((carrierIndex || 0) % 4) * 0.05); // ~12 to 25 km staging radius
    return {
      lat: Math.cos(angle) * radiusDeg * 0.75,
      lng: Math.sin(angle) * radiusDeg
    };
  },

  handleCarrierArrival(c) {
    if (!c) return;

    if (window.BRIDGES_STORE) {
      try {
        const storeCarrier = window.BRIDGES_STORE.getCarrier(c.id);
        if (storeCarrier) {
          storeCarrier.status = 'Active';
          storeCarrier.statusDesc = 'Available & Ready';
        }
        const storeResource = window.BRIDGES_STORE.getResource(c.vehicleId);
        if (storeResource) {
          storeResource.status = 'Active';
          storeResource.statusDesc = 'Available / Ready';
          const destHub = this.getNearestHub(c.lat, c.lng);
          if (destHub) storeResource.currentLocation = destHub.city;
        }
      } catch (e) {
        console.warn('Store sync on carrier arrival:', e);
      }
    }

    const counterActive = document.getElementById('counter-active-carriers');
    if (counterActive) {
      counterActive.textContent = this.carriers.filter(x => x.status === 'Active' && !x.hasArrived).length;
    }
    const counterAvailable = document.getElementById('counter-available-carriers');
    if (counterAvailable) {
      counterAvailable.textContent = this.carriers.filter(x => x.hasArrived || x.status === 'Available').length;
    }

    if (this.selectedCarrier && this.selectedCarrier.id === c.id) {
      this.selectCarrier(c);
    }
  },

  arriveCarrier(carrierId) {
    const c = this.carriers.find(x => x.id === carrierId);
    if (!c) return;
    c.direction = 1;
    c.progress = 1.0;
    const destPt = c.route.points[c.route.points.length - 1];
    const hub = this.getNearestHub(destPt[0], destPt[1]);
    const dockOffset = this.getDockOffset(hub, c.carrierIndex || 0);
    c.lat = destPt[0] + dockOffset.lat;
    c.lng = destPt[1] + dockOffset.lng;
    c.speed = 0;
    c.currentSpeed = 0;
    c.hasArrived = true;
    c.status = 'Available';
    c.statusDesc = 'Available & Ready';
    c.heading = 0;
    c.trail = [];
    this.handleCarrierArrival(c);
    this.selectCarrier(c);
    if (window.UI) {
      UI.showToast(`Carrier ${c.id} (${c.name}) arrived at destination dock (${hub ? hub.city : 'Terminal'}) — now Available & Ready.`, 'success');
    }
  },

  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updateCarriers(deltaTime);

      // Render small map canvas if active
      if (this.smallMap && this.smallCanvasLayer && this.smallCtx) {
        this.renderSmallCanvas();
      }

      // Render fullscreen map canvas if modal is open
      if (this.isFullscreen && this.fullscreenMap && this.fullscreenCanvasLayer && this.fullscreenCtx) {
        this.renderFullscreenCanvas();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  },

  stopSimulation() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  },

  // ==========================================
  // SMALL DASHBOARD WIDGET (Real World Map)
  // ==========================================
  attachSmallCanvas(canvasOrContainer) {
    if (!canvasOrContainer) return;
    if (!this._initialized || !this.carriers || this.carriers.length === 0) {
      this.init();
    }

    const container = document.getElementById('live-tracking-small-map') || canvasOrContainer;
    if (!container || !window.L) return;

    if (this.smallMap) {
      try {
        const curContainer = this.smallMap.getContainer();
        if (curContainer && document.body.contains(curContainer) && curContainer === container) {
          this.smallMap.invalidateSize();
          return;
        } else {
          try { this.smallMap.remove(); } catch(err) {}
          this.smallMap = null;
          this.smallCanvasLayer = null;
          this.smallCtx = null;
        }
      } catch (e) {
        this.smallMap = null;
      }
    }

    container.innerHTML = '';

    // Initialize Leaflet map focused on Central US corridor (Dallas, Little Rock, Memphis, Chicago)
    const map = L.map(container, {
      center: [35.2, -92.2],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true
    });
    this.smallMap = map;

    // Real-world cartographic tile layer
    const theme = this.getTileConfig(this.currentTileTheme);
    this.smallTileLayer = L.tileLayer(theme.url, {
      maxZoom: theme.maxZoom || 19,
      attribution: theme.attribution || '',
      subdomains: theme.subdomains || 'abc'
    }).addTo(map);

    // Draw real-world highway corridor polylines
    this.routes.forEach(r => {
      L.polyline(r.points, {
        color: r.type === 'airway' ? '#8B5CF6' : r.type === 'waterway' ? '#0284C7' : '#64748B',
        weight: r.type === 'highway' ? 3.5 : 2,
        opacity: 0.6,
        dashArray: r.type === 'airway' ? '6, 6' : r.type === 'waterway' ? '8, 8' : null
      }).addTo(map);
    });

    // Draw real city hubs
    Object.values(this.hubs).forEach(h => {
      const icon = L.divIcon({
        className: 'leaflet-hub-marker',
        html: `<div class="hub-marker-pill"><span class="hub-pill-dot"></span>${h.code}</div>`,
        iconSize: [95, 26],
        iconAnchor: [47, 13]
      });
      L.marker([h.lat, h.lng], { icon, interactive: false }).addTo(map);
    });

    // Create custom canvas overlay layer for high-performance 500 carrier rendering
    const canvas = document.createElement('canvas');
    canvas.className = 'real-world-map-canvas-layer';
    container.appendChild(canvas);
    this.smallCanvasLayer = canvas;
    this.smallCtx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (rect.width || 720) * dpr;
      canvas.height = (rect.height || 330) * dpr;
      canvas.style.width = (rect.width || 720) + 'px';
      canvas.style.height = (rect.height || 330) + 'px';
    };
    resizeCanvas();

    map.on('move moveend zoom zoomend resize', () => {
      resizeCanvas();
      this.renderSmallCanvas();
    });

    if (!this.isRunning) this.startSimulation();
  },

  renderSmallCanvas() {
    const ctx = this.smallCtx;
    const canvas = this.smallCanvasLayer;
    const map = this.smallMap;
    if (!ctx || !canvas || !map) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    this.carriers.forEach(c => {
      if (!c.lat || !c.lng) return;
      const pt = map.latLngToContainerPoint([c.lat, c.lng]);

      const isAvail = c.hasArrived || c.status === 'Available';
      let color = isAvail ? '#10B981' : (c.statusDesc === 'Delayed' ? '#EA341F' : '#1967D2');
      if (!isAvail) {
        if (c.vehicleType === 'Air') color = '#8B5CF6';
        else if (c.vehicleType === 'Sea') color = '#0284C7';
        else if (c.vehicleType === 'Van') color = '#F59E0B';
      }

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isAvail ? 6.5 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isAvail ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isAvail ? 3.5 : 2.8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (isAvail) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    ctx.restore();
  },

  // ==========================================
  // FULLSCREEN REAL-WORLD INTERACTIVE MAP
  // ==========================================
  openFullscreen() {
    if (!this._initialized || !this.carriers || this.carriers.length === 0) {
      this.init();
    }
    this.isFullscreen = true;

    let modal = document.getElementById('fullscreen-tracking-modal');
    if (modal) {
      modal.remove();
      modal = null;
    }

    const activeCount = this.carriers.filter(c => c.status === 'Active' && !c.hasArrived).length;
    const availCount = this.carriers.filter(c => c.hasArrived || c.status === 'Available').length;

    modal = document.createElement('div');
    modal.id = 'fullscreen-tracking-modal';
    modal.className = 'fullscreen-tracking-overlay animate-fade-in';
    modal.innerHTML = `
      <!-- TOP COMMAND BAR -->
      <div class="tracking-top-bar">
        <div class="tracking-bar-left">
          <div class="tracking-brand-badge">
            <span class="tracking-pulse-dot"></span>
            <span class="font-bold text-white">BRIDGES Real-World Telemetry</span>
          </div>
          <span class="tracking-stats-counter">
            <strong id="counter-active-carriers">${activeCount}</strong> In Transit • 
            <strong id="counter-available-carriers" style="color: #10B981;">${availCount}</strong> Available &amp; Ready • 
            <strong>500</strong> Monitored Carriers
          </span>
        </div>

        <div class="tracking-bar-center">
          <!-- Real-world Search box -->
          <div class="search-input-group tracking-search-box">
            <span class="icon">${Icons.search(14)}</span>
            <input type="text" id="fullscreen-tracking-search" 
              placeholder="Search carrier, vehicle, or driver (e.g. CAR-25, CAR-12, Dallas)..."
              oninput="LiveTrackingMap.handleSearch(this.value)">
          </div>

          <!-- Vehicle Type Filter -->
          <select class="tracking-filter-select" id="fullscreen-type-filter" onchange="LiveTrackingMap.handleTypeFilter(this.value)">
            <option value="ALL">All Asset Types (500)</option>
            <option value="Truck">Ground Trucks (Interstates)</option>
            <option value="Air">Air Express Jets</option>
            <option value="Sea">Maritime Vessels (Gulf/Atlantic)</option>
            <option value="Van">Last-Mile Vans</option>
          </select>

          <!-- Status Filter -->
          <select class="tracking-filter-select" id="fullscreen-status-filter" onchange="LiveTrackingMap.handleStatusFilter(this.value)">
            <option value="ALL">All Statuses (500)</option>
            <option value="Available">Available &amp; Ready (Arrived)</option>
            <option value="Moving">Active Moving (In Transit)</option>
            <option value="Delayed">Delayed / SLA Alert</option>
            <option value="Docked">Docked / Inactive</option>
          </select>

          <!-- Real World Map Layer Switcher -->
          <select class="tracking-filter-select" id="fullscreen-tile-theme" onchange="LiveTrackingMap.switchTileTheme(this.value)" style="background: rgba(15,23,42,0.85); color: #00E5FF; border-color: #00E5FF;">
            <option value="esri_streets" ${this.currentTileTheme === 'esri_streets' ? 'selected' : ''}>🌐 Real Streets (Esri — Clean)</option>
            <option value="osm" ${this.currentTileTheme === 'osm' ? 'selected' : ''}>🛣️ OpenStreetMap (Real World)</option>
            <option value="esri_satellite" ${this.currentTileTheme === 'esri_satellite' ? 'selected' : ''}>🛰️ Satellite Imagery (Real Earth)</option>
            <option value="esri_topo" ${this.currentTileTheme === 'esri_topo' ? 'selected' : ''}>🏔️ Topographic Terrain</option>
            <option value="voyager" ${this.currentTileTheme === 'voyager' ? 'selected' : ''}>🗺️ Carto Voyager (API Key)</option>
            <option value="dark" ${this.currentTileTheme === 'dark' ? 'selected' : ''}>🌑 Carto Dark (API Key)</option>
          </select>
        </div>

        <div class="tracking-bar-right">
          <!-- Real-world Map API Key Config Button -->
          <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.openApiKeyModal()" style="background: rgba(0, 229, 255, 0.12); border-color: #00E5FF; color: #00E5FF; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" title="Configure Map Provider &amp; API Key">
            🔑 Map API Key
          </button>

          <!-- Zoom Controls -->
          <div class="tracking-zoom-group">
            <button class="btn-tracking-ctrl" title="Zoom Out" onclick="LiveTrackingMap.zoomOut()">−</button>
            <span class="tracking-zoom-badge" id="tracking-zoom-level-badge">100%</span>
            <button class="btn-tracking-ctrl" title="Zoom In" onclick="LiveTrackingMap.zoomIn()">+</button>
            <button class="btn-tracking-ctrl" title="Fit All 500 Carriers" onclick="LiveTrackingMap.resetZoom()">⟲ Fit USA</button>
          </div>

          <button class="btn btn-secondary btn-sm tracking-exit-btn" onclick="LiveTrackingMap.closeFullscreen()">
            ✕ Close Fullscreen
          </button>
        </div>
      </div>

      <!-- REAL WORLD CITY QUICK JUMP BAR -->
      <div class="tracking-hub-nav">
        <span class="hub-nav-label">Real City Gateways:</span>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('DAL')">Dallas, TX</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('LIT')">Little Rock, AR</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('MEM')">Memphis, TN</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('CHI')">Chicago, IL</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('ATL')">Atlanta, GA</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('NYC')">New York, NY</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('LAX')">Los Angeles, CA</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('HOU')">Houston, TX</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('DEN')">Denver, CO</button>
        <button class="hub-nav-btn" onclick="LiveTrackingMap.panToCity('MIA')">Miami, FL</button>
      </div>

      <!-- MAP VIEWPORT CONTAINER -->
      <div class="tracking-map-viewport">
        <!-- MAIN REAL WORLD LEAFLET CONTAINER -->
        <div id="fullscreen-live-map" style="width: 100%; height: 100%;"></div>

        <!-- FLOATING TELEMETRY HUD -->
        <div id="tracking-carrier-hud" style="display: none;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    this.initFullscreenMap();
    setTimeout(() => {
      if (this.fullscreenMap) {
        this.fullscreenMap.invalidateSize();
        this.renderFullscreenCanvas();
      }
    }, 100);

    if (window.UI) {
      UI.showToast('Loaded Real-World Global Logistics Map with real interstate corridors & satellite/street data.', 'info');
    }
  },

  initFullscreenMap() {
    const container = document.getElementById('fullscreen-live-map');
    if (!container || !window.L) return;

    if (this.fullscreenMap) {
      try { this.fullscreenMap.remove(); } catch (e) {}
      this.fullscreenMap = null;
    }

    // Centered on Continental US at zoom 5
    const map = L.map(container, {
      center: [37.8, -96.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: true
    });
    this.fullscreenMap = map;

    // Attach real-world cartographic tile layer
    const theme = this.getTileConfig(this.currentTileTheme);
    this.fullscreenTileLayer = L.tileLayer(theme.url, {
      maxZoom: theme.maxZoom || 19,
      attribution: theme.attribution || '',
      subdomains: theme.subdomains || 'abc'
    }).addTo(map);

    // Draw real-world highway corridor polylines
    this.routes.forEach(r => {
      L.polyline(r.points, {
        color: r.type === 'airway' ? '#8B5CF6' : r.type === 'waterway' ? '#0284C7' : '#475569',
        weight: r.type === 'highway' ? 3.5 : 2,
        opacity: 0.65,
        dashArray: r.type === 'airway' ? '6, 6' : r.type === 'waterway' ? '8, 8' : null
      }).addTo(map);
    });

    // Draw real city hubs
    Object.values(this.hubs).forEach(h => {
      const icon = L.divIcon({
        className: 'leaflet-hub-marker',
        html: `<div class="hub-marker-pill"><span class="hub-pill-dot"></span>${h.code} (${h.city})</div>`,
        iconSize: [140, 26],
        iconAnchor: [70, 13]
      });
      L.marker([h.lat, h.lng], { icon }).addTo(map).on('click', () => {
        map.setView([h.lat, h.lng], 9);
      });
    });

    // Create high-performance Canvas overlay for 500 live carriers
    const canvas = document.createElement('canvas');
    canvas.className = 'real-world-map-canvas-layer';
    canvas.style.pointerEvents = 'none'; // Never block Leaflet pan, zoom, or map click events
    container.appendChild(canvas);
    this.fullscreenCanvasLayer = canvas;
    this.fullscreenCtx = canvas.getContext('2d');

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || window.innerWidth;
      const h = rect.height || (window.innerHeight - 98);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };
    resize();

    map.on('move moveend zoom zoomend resize', () => {
      resize();
      this.renderFullscreenCanvas();
      this.updateZoomDisplay();
    });

    window.addEventListener('resize', () => {
      if (this.isFullscreen) {
        resize();
        this.renderFullscreenCanvas();
      }
    });

    // Click on Leaflet map to accurately select carrier
    map.on('click', (e) => {
      const clickPt = e.containerPoint;
      let clicked = null;
      let minDist = 28; // Generous 28px hit radius for easy click
      for (let i = 0; i < this.carriers.length; i++) {
        const c = this.carriers[i];
        if (!c.lat || !c.lng) continue;
        const pt = map.latLngToContainerPoint([c.lat, c.lng]);
        const dist = Math.hypot(pt.x - clickPt.x, pt.y - clickPt.y);
        if (dist < minDist) {
          minDist = dist;
          clicked = c;
        }
      }
      this.selectCarrier(clicked);
      this.renderFullscreenCanvas();
    });

    // Hover tooltip & pointer cursor on Leaflet map
    map.on('mousemove', (e) => {
      const mousePt = e.containerPoint;
      let hovered = null;
      let minDist = 22;
      for (let i = 0; i < this.carriers.length; i++) {
        const c = this.carriers[i];
        if (!c.lat || !c.lng) continue;
        const pt = map.latLngToContainerPoint([c.lat, c.lng]);
        const dist = Math.hypot(pt.x - mousePt.x, pt.y - mousePt.y);
        if (dist < minDist) {
          minDist = dist;
          hovered = c;
        }
      }

      const mapContainer = map.getContainer();
      if (hovered !== this.hoveredCarrier) {
        this.hoveredCarrier = hovered;
        if (mapContainer) mapContainer.style.cursor = hovered ? 'pointer' : '';
        this.updateHoverTooltip(e.originalEvent.clientX, e.originalEvent.clientY, hovered);
        this.renderFullscreenCanvas();
      }
    });

    this.renderFullscreenCanvas();
    this.updateZoomDisplay();
  },

  switchTileTheme(themeKey) {
    this.currentTileTheme = themeKey;
    localStorage.setItem('bridges_map_provider', themeKey);
    const theme = this.getTileConfig(themeKey);

    const layerOptions = {
      maxZoom: theme.maxZoom || 19,
      attribution: theme.attribution || '',
      subdomains: theme.subdomains || 'abc'
    };
    if (theme.tileSize) layerOptions.tileSize = theme.tileSize;
    if (theme.zoomOffset) layerOptions.zoomOffset = theme.zoomOffset;

    if (this.fullscreenTileLayer && this.fullscreenMap) {
      try { this.fullscreenMap.removeLayer(this.fullscreenTileLayer); } catch (e) {}
      this.fullscreenTileLayer = L.tileLayer(theme.url, layerOptions).addTo(this.fullscreenMap);
    }
    if (this.smallTileLayer && this.smallMap) {
      try { this.smallMap.removeLayer(this.smallTileLayer); } catch (e) {}
      this.smallTileLayer = L.tileLayer(theme.url, layerOptions).addTo(this.smallMap);
    }

    const sel = document.getElementById('fullscreen-tile-theme');
    if (sel) sel.value = themeKey;
  },

  openApiKeyModal() {
    const existing = document.getElementById('map-apikey-config-modal');
    if (existing) existing.remove();

    const currentKey = this.mapApiKey || '';
    const currentTheme = this.currentTileTheme || 'esri_streets';

    const modal = document.createElement('div');
    modal.id = 'map-apikey-config-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'flex';
    modal.style.zIndex = '100000';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px; width: 92%; background: #0F172A; border: 1px solid #334155; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); color: #F8FAFC; overflow: hidden;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid #1E293B; display: flex; align-items: center; justify-content: space-between; background: #1E293B;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0, 229, 255, 0.15); display: flex; align-items: center; justify-content: center; color: #00E5FF; font-size: 16px;">
              🔑
            </div>
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #FFFFFF;">Real-World Map Provider &amp; API Key</h3>
              <p style="margin: 2px 0 0; font-size: 11px; color: #94A3B8;">Select your high-resolution geographic basemap and configure API credentials</p>
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('map-apikey-config-modal').remove()" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 18px; padding: 4px;">✕</button>
        </div>

        <div class="modal-body" style="padding: 20px; max-height: 75vh; overflow-y: auto;">
          <!-- Active Status Banner -->
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10B981; border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 10px;">
            <span style="font-size: 16px;">🌐</span>
            <div style="font-size: 12px; line-height: 1.45;">
              <strong style="color: #10B981; display: block; margin-bottom: 2px;">Real-World Geographic Maps Active — Zero Watermarks</strong>
              <span style="color: #CBD5E1;">BRIDGES uses authentic GIS real-world cartography displaying actual US Interstate corridors (I-30, I-40, I-55), state borders, and real city street networks.</span>
            </div>
          </div>

          <!-- Provider Selection -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #E2E8F0; margin-bottom: 8px;">Select Real-World Basemap Provider:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" id="map-provider-grid">
              <label style="border: 1px solid ${currentTheme === 'esri_streets' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'esri_streets' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="esri_streets" ${currentTheme === 'esri_streets' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🌐 Esri World Streets</div>
                  <div style="font-size: 10.5px; color: #10B981;">Recommended • Zero Watermark • No Key</div>
                </div>
              </label>

              <label style="border: 1px solid ${currentTheme === 'osm' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'osm' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="osm" ${currentTheme === 'osm' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🛣️ OpenStreetMap</div>
                  <div style="font-size: 10.5px; color: #10B981;">Global Streets • Zero Watermark • Free</div>
                </div>
              </label>

              <label style="border: 1px solid ${currentTheme === 'esri_satellite' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'esri_satellite' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="esri_satellite" ${currentTheme === 'esri_satellite' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🛰️ Real Satellite Imagery</div>
                  <div style="font-size: 10.5px; color: #38BDF8;">Photorealistic Earth • Zero Watermark</div>
                </div>
              </label>

              <label style="border: 1px solid ${currentTheme === 'esri_topo' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'esri_topo' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="esri_topo" ${currentTheme === 'esri_topo' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🏔️ Topographic Terrain</div>
                  <div style="font-size: 10.5px; color: #94A3B8;">Elevation Contours • No Key</div>
                </div>
              </label>

              <label style="border: 1px solid ${currentTheme === 'voyager' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'voyager' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="voyager" ${currentTheme === 'voyager' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🗺️ CartoDB Voyager</div>
                  <div style="font-size: 10.5px; color: #F59E0B;">Requires Carto API Key</div>
                </div>
              </label>

              <label style="border: 1px solid ${currentTheme === 'dark' ? '#00E5FF' : '#334155'}; background: ${currentTheme === 'dark' ? 'rgba(0,229,255,0.1)' : '#1E293B'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="radio" name="map_provider_radio" value="dark" ${currentTheme === 'dark' ? 'checked' : ''} onchange="LiveTrackingMap.previewProviderInModal(this.value)">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: #FFFFFF;">🌑 Carto Dark Matter</div>
                  <div style="font-size: 10.5px; color: #F59E0B;">Night Mode • Requires API Key</div>
                </div>
              </label>
            </div>
          </div>

          <!-- API Key Input Field -->
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label for="input-map-api-key" style="font-size: 12px; font-weight: 600; color: #E2E8F0;">Carto / Mapbox API Key (Optional):</label>
              <span style="font-size: 11px; color: #94A3B8;">Auto-saved locally</span>
            </div>
            <input type="text" id="input-map-api-key" value="${currentKey}" placeholder="e.g. your_carto_api_key or REDACTED (Leave empty for Esri / OSM)"
              style="width: 100%; box-sizing: border-box; background: #0B1120; border: 1px solid #334155; border-radius: 6px; padding: 9px 12px; color: #00E5FF; font-family: monospace; font-size: 12px;">
            <div style="font-size: 11px; color: #94A3B8; margin-top: 6px; line-height: 1.4;">
              💡 <strong>Pro Tip:</strong> <em>Esri World Streets</em> and <em>OpenStreetMap</em> are 100% free with NO API key needed and NO watermark. If you prefer CartoDB, paste your registered API key above to eliminate the Carto watermark.
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid #1E293B; display: flex; justify-content: space-between; align-items: center; background: #0B1120;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.useDefaultCleanProvider()" style="background: rgba(148,163,184,0.1); border-color: #475569; color: #E2E8F0;">
            ↺ Reset to Esri Real-World (No Key)
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('map-apikey-config-modal').remove()">
              Cancel
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="LiveTrackingMap.saveApiKeyModal()" style="background: #00E5FF; color: #0F172A; font-weight: 700; border: none; cursor: pointer;">
              ✓ Save &amp; Apply Map
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  previewProviderInModal(provider) {
    const grid = document.getElementById('map-provider-grid');
    if (!grid) return;
    const labels = grid.querySelectorAll('label');
    labels.forEach(l => {
      const radio = l.querySelector('input[type="radio"]');
      if (radio && radio.value === provider) {
        l.style.borderColor = '#00E5FF';
        l.style.background = 'rgba(0,229,255,0.1)';
      } else {
        l.style.borderColor = '#334155';
        l.style.background = '#1E293B';
      }
    });
  },

  saveApiKeyModal() {
    const keyInput = document.getElementById('input-map-api-key');
    const key = keyInput ? keyInput.value.trim() : '';
    this.mapApiKey = key;
    localStorage.setItem('bridges_map_api_key', key);

    const checked = document.querySelector('input[name="map_provider_radio"]:checked');
    const provider = checked ? checked.value : 'esri_streets';
    this.switchTileTheme(provider);

    const modal = document.getElementById('map-apikey-config-modal');
    if (modal) modal.remove();

    if (window.UI && window.UI.showToast) {
      window.UI.showToast(`Map updated to ${this.getTileConfig(provider).name}`, 'success');
    }
  },

  useDefaultCleanProvider() {
    this.mapApiKey = '';
    localStorage.removeItem('bridges_map_api_key');
    const input = document.getElementById('input-map-api-key');
    if (input) input.value = '';
    const esriRadio = document.querySelector('input[name="map_provider_radio"][value="esri_streets"]');
    if (esriRadio) {
      esriRadio.checked = true;
      this.previewProviderInModal('esri_streets');
    }
    this.switchTileTheme('esri_streets');
    const modal = document.getElementById('map-apikey-config-modal');
    if (modal) modal.remove();
    if (window.UI && window.UI.showToast) {
      window.UI.showToast('Switched to clean Esri World Streets real-world map (No Watermark)', 'success');
    }
  },

  renderFullscreenCanvas() {
    const ctx = this.fullscreenCtx;
    const canvas = this.fullscreenCanvasLayer;
    const map = this.fullscreenMap;
    if (!ctx || !canvas || !map) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const search = this.searchFilter.toLowerCase();
    const type = this.typeFilter;
    const status = this.statusFilter;

    this.carriers.forEach(c => {
      if (!c.lat || !c.lng) return;
      const pt = map.latLngToContainerPoint([c.lat, c.lng]);

      const isAvail = c.hasArrived || c.status === 'Available' || (c.statusDesc && (c.statusDesc.includes('Available') || c.statusDesc.includes('Ready')));

      let matches = true;
      if (search) {
        matches = c.id.toLowerCase().includes(search) ||
                  c.name.toLowerCase().includes(search) ||
                  c.vehicleId.toLowerCase().includes(search) ||
                  c.driverName.toLowerCase().includes(search);
      }
      if (matches && type !== 'ALL') {
        matches = c.vehicleType === type;
      }
      if (matches && status !== 'ALL') {
        if (status === 'Available') matches = isAvail;
        else if (status === 'Moving') matches = !isAvail && c.status === 'Active' && c.speed > 0;
        else if (status === 'Delayed') matches = c.statusDesc === 'Delayed';
        else if (status === 'Docked') matches = c.status === 'Inactive' || (c.speed === 0 && !isAvail);
      }

      if (search || type !== 'ALL' || status !== 'ALL') {
        if (!matches) return; // Hide non-matching units
      }

      const isSelected = this.selectedCarrier && this.selectedCarrier.id === c.id;
      const isHovered = this.hoveredCarrier && this.hoveredCarrier.id === c.id;

      // Color scheme: Green (#10B981) for Available & Ready after reaching destination
      let color = '#1967D2'; // Ground Truck Blue
      if (isAvail) {
        color = '#10B981'; // Vivid Emerald Green
      } else if (c.statusDesc === 'Delayed') {
        color = '#EA341F'; // Crimson Alert
      } else if (c.status === 'Inactive') {
        color = '#94A3B8'; // Slate Docked
      } else if (c.vehicleType === 'Air') {
        color = '#8B5CF6'; // Purple
      } else if (c.vehicleType === 'Sea') {
        color = '#0284C7'; // Cyan Teal
      } else if (c.vehicleType === 'Van') {
        color = '#F59E0B'; // Amber Orange
      }

      // Radar pulse for selected / delayed
      if (isSelected || isHovered || c.statusDesc === 'Delayed') {
        const time = performance.now() / 1000;
        const r = 12 + (Math.sin(time * 3 + (c.id.charCodeAt(4) || 0)) + 1) * 6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isAvail ? 'rgba(16, 185, 129, 0.28)' : (c.statusDesc === 'Delayed' ? 'rgba(234, 52, 31, 0.22)' : 'rgba(25, 103, 210, 0.25)');
        ctx.fill();
      }

      // Outer pin marker
      const radius = (isSelected || isHovered) ? 11 : 8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isAvail ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius - 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // For Available & Ready arrived units: draw stationary dock halo
      if (isAvail) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // Heading direction arrow (ONLY when moving!)
      if (c.speed > 0 && !isAvail) {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(c.heading);
        ctx.beginPath();
        ctx.moveTo(radius + 4, 0);
        ctx.lineTo(radius + 1, -3);
        ctx.lineTo(radius + 1, 3);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      // Label when zoomed in or selected
      const zoom = map.getZoom();
      if (zoom >= 8 || isHovered || isSelected) {
        ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
        const isDelayed = c.statusDesc === 'Delayed' || c.status === 'Delayed';
        const label = isAvail 
          ? `${c.id} · ${c.vehicleId} (Available & Ready)` 
          : isDelayed 
            ? `${c.id} · ${c.vehicleId} (Delayed)` 
            : `${c.id} · ${c.vehicleId}`;
        const m = ctx.measureText(label);
        ctx.fillStyle = isAvail ? 'rgba(6, 78, 59, 0.94)' : isDelayed ? 'rgba(153, 27, 27, 0.94)' : 'rgba(7, 7, 36, 0.88)';
        ctx.beginPath();
        ctx.roundRect(pt.x - m.width / 2 - 5, pt.y + radius + 3, m.width + 10, 16, 4);
        ctx.fill();
        ctx.fillStyle = isAvail ? '#A7F3D0' : isDelayed ? '#FECACA' : '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pt.x, pt.y + radius + 11);
      }
    });

    ctx.restore();
  },

  getCarrierDelayDetails(carrier) {
    if (!carrier) return null;
    const isDelayed = carrier.statusDesc === 'Delayed' || carrier.status === 'Delayed';
    if (!isDelayed) return null;

    if (carrier.delayReason) {
      return {
        reason: carrier.delayReason,
        category: carrier.delayCategory || 'Operational Incident',
        duration: carrier.delayDuration || '+45 mins',
        impact: carrier.delayImpact || 'Transit speed restricted'
      };
    }

    if (typeof window !== 'undefined' && window.BRIDGES_STORE) {
      const excs = window.BRIDGES_STORE.getExceptions ? window.BRIDGES_STORE.getExceptions() : [];
      const matchExc = excs.find(e => e.carrierId === carrier.id || e.vehicleId === carrier.vehicleId || (carrier.shipmentId && e.shipmentId === carrier.shipmentId));
      if (matchExc) {
        return {
          reason: matchExc.rootCause || matchExc.reason || 'Active Route Exception',
          category: matchExc.type || 'Route Deviation',
          duration: '+1h 15m',
          impact: matchExc.estimatedBusinessImpact || 'ETA revised'
        };
      }

      const disruptions = window.BRIDGES_STORE.getCarrierDisruptions ? window.BRIDGES_STORE.getCarrierDisruptions() : [];
      const matchDis = disruptions.find(d => d.carrierId === carrier.id || d.vehicleId === carrier.vehicleId);
      if (matchDis) {
        return {
          reason: `${matchDis.disruptionType} — ${matchDis.immediateActionTaken || 'Driver standby'}`,
          category: matchDis.disruptionType || 'Disruption Incident',
          duration: '+1h 30m',
          impact: matchDis.operationalImpact || 'Transit delayed'
        };
      }
    }

    const vType = carrier.vehicleType || 'Truck';
    if (vType === 'Sea') {
      return {
        reason: 'Severe Coastal Gale Warning & Harbor Approach Berth Queue',
        category: 'Maritime Weather / Port Congestion',
        duration: '+2h 15m',
        impact: 'Vessel speed reduced to 15 km/h for marine cargo stability'
      };
    } else if (vType === 'Air') {
      return {
        reason: 'Air Traffic Control (ATC) Holding Pattern & Severe Storm Cell Avoidance',
        category: 'Aviation Weather / ATC Hold',
        duration: '+1h 20m',
        impact: 'Corridor rerouting around convective weather system'
      };
    } else if (vType === 'Van') {
      return {
        reason: 'Urban Loading Zone Congestion & Metro Access Traffic Restriction',
        category: 'Metropolitan Access Restriction',
        duration: '+35 mins',
        impact: 'Vehicle queued for designated freight bay clearance'
      };
    } else {
      return {
        reason: 'Interstate Construction Corridor Bottleneck & Incident Clearance',
        category: 'Highway Corridor Congestion',
        duration: '+50 mins',
        impact: 'Traffic reduced to single lane at active highway work zone'
      };
    }
  },

  selectCarrier(carrier) {
    this.selectedCarrier = carrier;
    if (this.fullscreenMap) {
      this.renderFullscreenCanvas();
    }
    const hud = document.getElementById('tracking-carrier-hud');
    if (!hud) return;

    if (!carrier) {
      hud.style.display = 'none';
      return;
    }

    const isAvail = carrier.hasArrived || carrier.status === 'Available' || (carrier.statusDesc && (carrier.statusDesc.includes('Available') || carrier.statusDesc.includes('Ready')));
    const isDelayed = carrier.statusDesc === 'Delayed' || carrier.status === 'Delayed';
    const delayInfo = isDelayed ? this.getCarrierDelayDetails(carrier) : null;
    const destHub = this.getNearestHub(carrier.lat, carrier.lng);
    const destName = destHub ? `${destHub.name} (${destHub.city})` : 'Destination Terminal';

    hud.style.display = 'block';
    hud.innerHTML = `
      <div class="hud-card animate-fade-in">
        <div class="hud-header">
          <div class="hud-carrier-info">
            <span class="hud-carrier-id">${carrier.id}</span>
            <h4 class="hud-carrier-name">${carrier.name}</h4>
          </div>
          <button class="hud-close-btn" onclick="LiveTrackingMap.selectCarrier(null)">✕</button>
        </div>

        <div class="hud-badge-row">
          <span class="badge ${isAvail ? 'badge-success' : isDelayed ? 'badge-danger' : carrier.status === 'Active' ? 'badge-primary' : 'badge-danger'}"
                style="${isAvail ? 'background: #10B981; color: #FFFFFF; font-weight: 700; padding: 2px 8px;' : isDelayed ? 'background: #EA341F; color: #FFFFFF; font-weight: 700; padding: 2px 8px;' : ''}">
            ● ${isAvail ? 'Available & Ready' : isDelayed ? 'Delayed' : carrier.status}
          </span>
          <span class="badge badge-secondary">
            ${carrier.carrierType}
          </span>
          <span class="hud-rating">
            ★ ${carrier.rating}
          </span>
        </div>

        <div class="hud-stats-grid">
          <div class="hud-stat-box">
            <span class="hud-stat-label">Assigned Vehicle</span>
            <span class="hud-stat-value font-bold">${carrier.vehicleId} (${carrier.vehicleType})</span>
          </div>
          <div class="hud-stat-box">
            <span class="hud-stat-label">Driver / Operator</span>
            <span class="hud-stat-value">${carrier.driverName}</span>
          </div>
          <div class="hud-stat-box">
            <span class="hud-stat-label">Telemetry Speed</span>
            <span class="hud-stat-value font-bold ${isAvail ? 'text-success' : isDelayed ? 'text-danger' : 'text-navy'}">
              ${carrier.currentSpeed} km/h ${isAvail ? '(Docked & Ready)' : isDelayed ? '(Throttled)' : ''}
            </span>
          </div>
          <div class="hud-stat-box">
            <span class="hud-stat-label">Route Status</span>
            <span class="hud-stat-value ${isDelayed ? 'text-danger font-bold' : isAvail ? 'text-success font-bold' : 'text-success font-medium'}">
              ${isAvail ? `● Arrived (${destName})` : isDelayed ? '● Delayed' : '● On Route (Optimal)'}
            </span>
            ${isDelayed && delayInfo ? `
              <div style="font-size: 10px; font-weight: 700; color: #EA341F; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.3px;">
                ${delayInfo.category}
              </div>
            ` : ''}
          </div>
        </div>

        ${isDelayed && delayInfo ? `
          <div class="hud-delay-box animate-fade-in">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span class="hud-delay-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EA341F" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Delay Reason &amp; Root Cause
              </span>
              <span class="badge badge-danger" style="font-size: 9.5px; font-weight: 700; padding: 2px 6px; background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;">
                ${delayInfo.category}
              </span>
            </div>
            <div class="hud-delay-reason-text">
              ${delayInfo.reason}
            </div>
            <div class="hud-delay-meta-row">
              <span><strong>Schedule Variance:</strong> <span style="color: #DC2626; font-weight: 700;">${delayInfo.duration}</span></span>
              <span><strong>Operational Impact:</strong> <span style="font-weight: 600; color: #374151;">${delayInfo.impact}</span></span>
            </div>
          </div>
        ` : ''}

        <div class="hud-route-progress">
          <div class="hud-progress-labels">
            <span>Route: <strong>${carrier.route.name}</strong></span>
            <span><strong>${isAvail ? 100 : Math.round(carrier.progress * 100)}%</strong> ${isAvail ? 'arrived' : 'completed'}</span>
          </div>
          <div class="progress-bar-container" style="height: 6px; margin-top: 4px;">
            <div class="progress-bar-fill ${isAvail ? 'fill-emerald' : isDelayed ? 'fill-rose' : 'fill-indigo'}" 
                 style="width: ${isAvail ? 100 : carrier.progress * 100}%; ${isAvail ? 'background: #10B981;' : isDelayed ? 'background: #EA341F;' : ''}"></div>
          </div>
        </div>

        <div class="hud-cargo-box">
          <span class="text-xs text-muted block">Cargo Manifest / Fleet Status:</span>
          <span class="text-xs font-medium text-midnight">
            ${isAvail ? 'Consignment unladen. Vehicle cleared, stationary at dock, and Available for next dispatch tender.' : carrier.cargo}
          </span>
        </div>

        <div class="hud-actions-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${!isAvail ? `
            <button class="btn btn-sm" onclick="LiveTrackingMap.arriveCarrier('${carrier.id}')" 
                    style="background: #10B981; color: white; border: none; font-weight: 700; flex: 1; padding: 6px 10px;" 
                    title="Simulate reaching destination immediately and mark asset Available & Ready">
              ✓ Arrive at Destination (Set Available)
            </button>
          ` : `
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 6px; padding: 6px 10px; width: 100%; display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #065F46;">
              <span style="font-weight: 800;">✓</span>
              <span><strong>Stationary &amp; Available</strong> — Carrier reached destination dock and is ready for tender.</span>
            </div>
          `}
          <button class="btn btn-secondary btn-sm" onclick="LiveTrackingMap.followCarrier('${carrier.id}')">
            ${this.followingCarrier && this.followingCarrier.id === carrier.id ? 'Unfollow' : 'Follow Camera'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="LiveTrackingMap.navigateToCarrierProfile('${carrier.id}')">
            Carrier Registry →
          </button>
        </div>
      </div>
    `;
  },

  followCarrier(carrierId) {
    if (this.followingCarrier && this.followingCarrier.id === carrierId) {
      this.followingCarrier = null;
      if (window.UI) UI.showToast('Camera unfollowed', 'info');
    } else {
      const c = this.carriers.find(x => x.id === carrierId);
      if (c) {
        this.followingCarrier = c;
        if (this.fullscreenMap) {
          this.fullscreenMap.setView([c.lat, c.lng], 9);
        }
        if (window.UI) UI.showToast(`Tracking live asset ${c.vehicleId} (${c.name})`, 'info');
      }
    }
    this.selectCarrier(this.selectedCarrier);
  },

  navigateToCarrierProfile(carrierId) {
    this.closeFullscreen();
    if (window.App) {
      App.navigateTo('carriers');
      setTimeout(() => {
        if (window.CarriersView) {
          CarriersView.handleSearch(carrierId);
          CarriersView.viewCarrierProfile(carrierId);
        }
      }, 150);
    }
  },

  updateHoverTooltip(mouseX, mouseY, carrier) {
    let tooltip = document.getElementById('tracking-hover-tooltip');
    if (!carrier) {
      if (tooltip) tooltip.style.display = 'none';
      return;
    }
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'tracking-hover-tooltip';
      tooltip.className = 'tracking-hover-pill';
      document.body.appendChild(tooltip);
    }
    const isAvail = carrier.hasArrived || carrier.status === 'Available';
    const isDelayed = carrier.statusDesc === 'Delayed' || carrier.status === 'Delayed';
    const statusColor = isDelayed ? '#EA341F' : isAvail ? '#10B981' : '#1967D2';
    const delayInfo = isDelayed ? this.getCarrierDelayDetails(carrier) : null;

    tooltip.style.display = 'block';
    tooltip.style.left = (mouseX + 15) + 'px';
    tooltip.style.top = (mouseY + 15) + 'px';
    tooltip.innerHTML = `
      <strong>${carrier.id}</strong> · ${carrier.name}<br>
      <span style="color: ${statusColor}; font-weight: 700;">
        ● ${carrier.vehicleId} (${carrier.currentSpeed} km/h) · ${isDelayed ? 'Delayed' : carrier.statusDesc}
      </span>
      ${delayInfo ? `
        <div style="color: #EA341F; font-size: 11px; font-weight: 600; margin-top: 3px; max-width: 250px; line-height: 1.3;">
          ⚠️ Reason: ${delayInfo.reason}
        </div>
      ` : ''}
    `;
  },

  panToCity(hubKey) {
    const hub = this.hubs[hubKey];
    if (hub && this.fullscreenMap) {
      this.fullscreenMap.flyTo([hub.lat, hub.lng], 8, { duration: 1.2 });
    }
  },

  zoomIn() {
    if (this.fullscreenMap) this.fullscreenMap.zoomIn();
  },

  zoomOut() {
    if (this.fullscreenMap) this.fullscreenMap.zoomOut();
  },

  resetZoom() {
    if (this.fullscreenMap) {
      this.fullscreenMap.flyTo([37.8, -96.0], 5, { duration: 1.2 });
    }
  },

  updateZoomDisplay() {
    const badge = document.getElementById('tracking-zoom-level-badge');
    if (badge && this.fullscreenMap) {
      const z = this.fullscreenMap.getZoom();
      badge.textContent = `${Math.round((z / 5) * 100)}%`;
    }
  },

  closeFullscreen() {
    this.isFullscreen = false;
    const modal = document.getElementById('fullscreen-tracking-modal');
    if (modal) modal.style.display = 'none';
    const tooltip = document.getElementById('tracking-hover-tooltip');
    if (tooltip) tooltip.style.display = 'none';
    document.body.style.overflow = '';
  },

  handleSearch(query) {
    this.searchFilter = query.trim();
    if (this.searchFilter) {
      const q = this.searchFilter.toLowerCase();
      const match = this.carriers.find(c => 
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.vehicleId.toLowerCase().includes(q) ||
        c.driverName.toLowerCase().includes(q)
      );
      if (match) {
        this.selectCarrier(match);
        if (this.fullscreenMap) {
          this.fullscreenMap.flyTo([match.lat, match.lng], 9, { duration: 1 });
        }
      }
    }
  },

  handleTypeFilter(val) {
    this.typeFilter = val;
    if (this.fullscreenMap) this.renderFullscreenCanvas();
  },

  handleStatusFilter(val) {
    this.statusFilter = val;
    if (this.fullscreenMap) this.renderFullscreenCanvas();
  }
};

// Auto-initialize telemetry engine immediately
if (typeof window !== 'undefined') {
  window.LiveTrackingMap = LiveTrackingMap;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      LiveTrackingMap.init();
    });
  } else {
    LiveTrackingMap.init();
  }
}
