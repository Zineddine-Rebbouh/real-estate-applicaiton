import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";

const SEED_DATA_DIR = path.join(__dirname, "seedData");
const NOW = new Date("2026-09-08T12:00:00.000Z");

const SHARED_PASSWORD = "Habitat2026!";
const PASSWORD_HASH = bcrypt.hashSync(SHARED_PASSWORD, 12);

function uuid(): string {
  return crypto.randomUUID();
}

function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSample<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ---------------------------------------------------------------------------
// Constants & Allowed Enums (Strictly matching schema.prisma)
// ---------------------------------------------------------------------------
const PROPERTY_TYPES = [
  "Rooms", "Tinyhouse", "Apartment", "Villa", "Townhouse",
  "Cottage", "House", "Condo", "Studio", "Loft"
] as const;

const AMENITIES = [
  "WasherDryer", "AirConditioning", "Dishwasher", "HighSpeedInternet",
  "HardwoodFloors", "WalkInClosets", "Microwave", "Refrigerator",
  "Pool", "Gym", "Parking", "PetsAllowed", "WiFi"
] as const;

const HIGHLIGHTS = [
  "HighSpeedInternetAccess", "WasherDryer", "AirConditioning", "Heating",
  "SmokeFree", "CableReady", "SatelliteTV", "DoubleVanities", "TubShower",
  "Intercom", "SprinklerSystem", "RecentlyRenovated", "CloseToTransit",
  "GreatView", "QuietNeighborhood"
] as const;

// 10 distinct US metropolitan areas with real coordinates and neighborhoods
const CITIES = [
  {
    city: "Seattle",
    state: "WA",
    country: "United States",
    postalCode: "98101",
    lat: 47.6062,
    lng: -122.3321,
    neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Belltown", "Queen Anne", "South Lake Union"],
    streets: ["Pine St", "Pike St", "Broadway Ave", "Westlake Ave", "1st Ave", "Dexter Ave N"]
  },
  {
    city: "Los Angeles",
    state: "CA",
    country: "United States",
    postalCode: "90012",
    lat: 34.0522,
    lng: -118.2437,
    neighborhoods: ["Downtown LA", "Silver Lake", "Venice", "Hollywood", "Koreatown", "Westwood"],
    streets: ["Grand Ave", "Sunset Blvd", "Abbot Kinney Blvd", "Wilshire Blvd", "Spring St", "Figueroa St"]
  },
  {
    city: "Santa Monica",
    state: "CA",
    country: "United States",
    postalCode: "90401",
    lat: 34.0195,
    lng: -118.4912,
    neighborhoods: ["Ocean Park", "Downtown Santa Monica", "Mid-City", "Wilshire Montana"],
    streets: ["Ocean Ave", "Montana Ave", "Main St", "Santa Monica Blvd", "Lincoln Blvd"]
  },
  {
    city: "Pasadena",
    state: "CA",
    country: "United States",
    postalCode: "91101",
    lat: 34.1478,
    lng: -118.1445,
    neighborhoods: ["Old Pasadena", "Playhouse Village", "Madison Heights", "Bungalow Heaven"],
    streets: ["Colorado Blvd", "Green St", "Lake Ave", "Fair Oaks Ave", "Los Robles Ave"]
  },
  {
    city: "Austin",
    state: "TX",
    country: "United States",
    postalCode: "78701",
    lat: 30.2672,
    lng: -97.7431,
    neighborhoods: ["Downtown Austin", "South Congress (SoCo)", "East Austin", "Zilker", "Mueller", "Clarksville"],
    streets: ["Congress Ave", "Rainey St", "E 6th St", "Barton Springs Rd", "Guadalupe St", "Lamar Blvd"]
  },
  {
    city: "Chicago",
    state: "IL",
    country: "United States",
    postalCode: "60601",
    lat: 41.8781,
    lng: -87.6298,
    neighborhoods: ["The Loop", "Lincoln Park", "Wicker Park", "West Loop", "Lakeview", "River North"],
    streets: ["Michigan Ave", "Halsted St", "Milwaukee Ave", "Randolph St", "Clark St", "State St"]
  },
  {
    city: "New York",
    state: "NY",
    country: "United States",
    postalCode: "10001",
    lat: 40.7128,
    lng: -74.0060,
    neighborhoods: ["Chelsea", "Greenwich Village", "Williamsburg", "DUMBO", "Astoria", "Upper West Side"],
    streets: ["7th Ave", "Bedford Ave", "Bleecker St", "Broadway", "Hudson St", "Washington St"]
  },
  {
    city: "Denver",
    state: "CO",
    country: "United States",
    postalCode: "80202",
    lat: 39.7392,
    lng: -104.9903,
    neighborhoods: ["LoDo", "RiNo", "Capitol Hill", "Highlands", "Cherry Creek", "Baker"],
    streets: ["Larimer St", "Blake St", "Colfax Ave", "Tejon St", "16th St Mall", "Speer Blvd"]
  },
  {
    city: "Miami",
    state: "FL",
    country: "United States",
    postalCode: "33130",
    lat: 25.7617,
    lng: -80.1918,
    neighborhoods: ["Brickell", "Wynwood", "South Beach", "Coconut Grove", "Design District", "Edgewater"],
    streets: ["Brickell Ave", "Biscayne Blvd", "NW 2nd Ave", "Ocean Dr", "Grand Ave", "Coral Way"]
  },
  {
    city: "Boston",
    state: "MA",
    country: "United States",
    postalCode: "02108",
    lat: 42.3601,
    lng: -71.0589,
    neighborhoods: ["Back Bay", "Beacon Hill", "South End", "Seaport", "Cambridge", "North End"],
    streets: ["Boylston St", "Newbury St", "Charles St", "Tremont St", "Seaport Blvd", "Hanover St"]
  },
  {
    city: "Atlanta",
    state: "GA",
    country: "United States",
    postalCode: "30303",
    lat: 33.7490,
    lng: -84.3880,
    neighborhoods: ["Midtown", "Inman Park", "Buckhead", "Old Fourth Ward", "West Midtown", "Virginia-Highland"],
    streets: ["Peachtree St", "Highland Ave", "Ponce de Leon Ave", "North Ave", "Piedmont Ave"]
  },
  {
    city: "Portland",
    state: "OR",
    country: "United States",
    postalCode: "97201",
    lat: 45.5152,
    lng: -122.6784,
    neighborhoods: ["Pearl District", "Alberta Arts", "Hawthorne", "Northwest Nob Hill", "Division", "South Waterfront"],
    streets: ["NW 23rd Ave", "NE Alberta St", "SE Hawthorne Blvd", "NW 10th Ave", "Burnside St"]
  }
];

const MANAGER_NAMES = [
  { name: "Eleanor Vance", email: "eleanor.vance@habitat-properties.com", phone: "+1 (555) 234-5678" },
  { name: "Mateo Rodriguez", email: "mateo.rodriguez@urbanapts.net", phone: "+1 (555) 345-6789" },
  { name: "Amina Al-Mansoor", email: "amina.mansoor@summitrealty.com", phone: "+1 (555) 456-7890" },
  { name: "David Chen", email: "david.chen@pacificliving.io", phone: "+1 (555) 567-8901" },
  { name: "Sarah Jenkins", email: "sarah.jenkins@beaconmgmt.com", phone: "+1 (555) 678-9012" },
  { name: "Kenji Takahashi", email: "kenji.takahashi@zenithhomes.com", phone: "+1 (555) 789-0123" },
  { name: "Priya Sharma", email: "priya.sharma@lotusliving.org", phone: "+1 (555) 890-1234" },
  { name: "Marcus Washington", email: "marcus.washington@metrogroup.com", phone: "+1 (555) 901-2345" },
  { name: "Elena Rostova", email: "elena.rostova@auroragroup.net", phone: "+1 (555) 112-2334" },
  { name: "Kwame Osei", email: "kwame.osei@heritageapts.com", phone: "+1 (555) 223-3445" },
  { name: "Sofia Delgado", email: "sofia.delgado@solarestates.com", phone: "+1 (555) 334-4556" },
  { name: "Liam O'Connor", email: "liam.oconnor@shamrockprops.com", phone: "+1 (555) 445-5667" },
  { name: "Fatima Zahra", email: "fatima.zahra@oasisresidential.com", phone: "+1 (555) 556-6778" },
  { name: "Henrik Lindqvist", email: "henrik.lindqvist@nordicliving.se", phone: "+1 (555) 667-7889" },
  { name: "Nkechi Adeleke", email: "nkechi.adeleke@lagosprime.com", phone: "+1 (555) 778-8990" },
  { name: "Julian Rossi", email: "julian.rossi@veronaassets.it", phone: "+1 (555) 889-9001" },
  { name: "Mei-Ling Zhou", email: "meiling.zhou@dynastymgmt.cn", phone: "+1 (555) 990-0112" },
  { name: "Fresh Manager Demo", email: "fresh.manager@habitat-demo.com", phone: "+1 (555) 000-9999" }
];

const TENANT_NAMES = [
  "Aarav Patel", "Aaliyah Jackson", "Alejandro Morales", "Ananya Rao", "Beatriz Santos",
  "Brendan Gallagher", "Carlos Mendez", "Chioma Eze", "Daisuke Sato", "Damian Kowalski",
  "Devon Washington", "Dmitri Volkov", "Emiko Tanaka", "Emmanuel Adeyemi", "Esmeralda Gomez",
  "Farhan Akhtar", "Fatou Sow", "Gabriel Silva", "Grace O'Malley", "Hana Al-Hassan",
  "Hiroshi Yamamoto", "Imani Brooks", "Ingrid Bergman", "Jaden Miller", "Javier Hernandez",
  "Jin-Woo Park", "Kareem Abdul-Jabbar", "Katrina Novak", "Keanu Reeves", "Layla Mahmoud",
  "Leila Farouk", "Lucas Moreau", "Mai Nguyen", "Malik Johnson", "Maria Fernandez",
  "Maya Angelou", "Min-Ho Choi", "Nasir Jones", "Nia Long", "Omar Sy",
  "Padma Lakshmi", "Rafael Nadal", "Ravi Shankar", "Rocio Duran", "Samira Khan",
  "Siddharth Roy", "Siobhan Roy", "Sunita Williams", "Tariq Ramadan", "Thabo Mbeki",
  "Thiago Alcantara", "Valeria Rossi", "Vikram Seth", "Waleed Aly", "Xiomara Castro",
  "Yasmin Benoit", "Youssef En-Nesyri", "Zainab Salbi", "Zinedine Zidane", "Fresh Tenant Demo"
];

function toIsoDate(d: Date): string {
  return d.toISOString();
}

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function daysAhead(days: number): Date {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Main Generator
// ---------------------------------------------------------------------------
export async function generateAll() {
  console.log("Generating full seed dataset for Habitat...");

  // 1. Manager Users & Profiles (18 managers)
  const users: any[] = [];
  const managers: any[] = [];
  const inviteCodes: any[] = [];

  MANAGER_NAMES.forEach((m, idx) => {
    const userId = uuid();
    const managerId = uuid();
    const inviteCodeId = uuid();
    const codeString = `HAB-MGR-${(1001 + idx).toString()}`;
    const joinedDaysAgo = 30 + Math.floor(idx * 38);
    const createdAt = toIsoDate(daysAgo(joinedDaysAgo));

    users.push({
      id: userId,
      email: m.email,
      passwordHash: PASSWORD_HASH,
      name: m.name,
      role: "MANAGER",
      refreshTokenVersion: 0,
      currentRefreshTokenHash: null,
      createdAt,
      updatedAt: createdAt
    });

    managers.push({
      id: managerId,
      userId,
      phoneNumber: m.phone,
      createdAt,
      updatedAt: createdAt
    });

    inviteCodes.push({
      id: inviteCodeId,
      code: codeString,
      usedAt: createdAt,
      usedByUserId: userId,
      createdAt: toIsoDate(daysAgo(joinedDaysAgo + 2))
    });
  });

  // 4 Unused invite codes for manual testing
  for (let i = 1; i <= 4; i++) {
    inviteCodes.push({
      id: uuid(),
      code: `HAB-UNCLAIMED-${(2000 + i).toString()}`,
      usedAt: null,
      usedByUserId: null,
      createdAt: toIsoDate(daysAgo(10))
    });
  }

  // 2. Tenant Users & Profiles (60 tenants)
  const tenants: any[] = [];
  TENANT_NAMES.forEach((name, idx) => {
    const userId = uuid();
    const tenantId = uuid();
    const email = `${name.toLowerCase().replace(/[^a-z]/g, "")}.${idx + 1}@example.com`;
    const joinedDaysAgo = 10 + Math.floor(idx * 11);
    const createdAt = toIsoDate(daysAgo(joinedDaysAgo));
    const phone = `+1 (555) ${100 + (idx % 800)}-${(2000 + idx).toString().slice(-4)}`;

    users.push({
      id: userId,
      email,
      passwordHash: PASSWORD_HASH,
      name,
      role: "TENANT",
      refreshTokenVersion: 0,
      currentRefreshTokenHash: null,
      createdAt,
      updatedAt: createdAt
    });

    tenants.push({
      id: tenantId,
      userId,
      phoneNumber: phone,
      createdAt,
      updatedAt: createdAt
    });
  });

  // 3. Properties (Target: 105 properties)
  const properties: any[] = [];
  const propertyTemplates = [
    { title: "Modern Sunlit Studio with Skyline Views", type: "Studio", beds: 0, baths: 1, sqft: 480, price: 1450.00 },
    { title: "Charming Victorian Townhouse & Garden", type: "Townhouse", beds: 3, baths: 2, sqft: 1850, price: 3400.00 },
    { title: "Luxury Penthouse Suite — Central Park Vista", type: "Condo", beds: 3, baths: 3, sqft: 2600, price: 6250.50 },
    { title: "Cozy Garden Cottage in Historic District", type: "Cottage", beds: 2, baths: 1, sqft: 950, price: 1950.00 },
    { title: "Spacious Waterfront Villa with Private Dock", type: "Villa", beds: 4, baths: 4, sqft: 3800, price: 6850.00 },
    { title: "Industrial Loft with 14-ft Exposed Brick", type: "Loft", beds: 1, baths: 1, sqft: 1100, price: 2350.25 },
    { title: "Affordable Shared Room in Co-Living Space", type: "Rooms", beds: 1, baths: 1, sqft: 320, price: 950.00 },
    { title: "Eco-Friendly Tiny House with Solar Roof", type: "Tinyhouse", beds: 1, baths: 1, sqft: 380, price: 1150.00 },
    { title: "Contemporary Family House with 2-Car Garage", type: "House", beds: 4, baths: 3, sqft: 2900, price: 4100.00 },
    { title: "Sunny Designer Apartment by Transit Hub", type: "Apartment", beds: 2, baths: 2, sqft: 1150, price: 2450.00 }
  ];

  // Specific properties allocation across managers 0..16 (manager 17 gets 0)
  const managerPropTargets = [12, 11, 1, 1, 8, 8, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6]; // Sum = 105
  let propCount = 0;

  managerPropTargets.forEach((targetCount, mIdx) => {
    const mgr = managers[mIdx];
    for (let p = 0; p < targetCount; p++) {
      propCount++;
      const propId = uuid();
      const cityData = CITIES[propCount % CITIES.length];
      const template = propertyTemplates[propCount % propertyTemplates.length];
      const neighborhood = randomChoice(cityData.neighborhoods);
      const street = `${100 + (propCount * 37) % 8900} ${randomChoice(cityData.streets)}`;
      
      let propName = `${template.title} in ${neighborhood}`;
      let description = `Enjoy living in this well-appointed ${template.type.toLowerCase()} located in vibrant ${neighborhood}, ${cityData.city}. Features convenient access to transit, shopping, dining, and local parks. Beautiful finishes throughout with ample natural light.`;
      
      if (propCount === 7) {
        propName = "The St. James & O'Connor Estate / Residence #4B (High-Ceiling Classic)";
        description = "Intentionally long description with special characters: & / - ' \" to verify UI word wrapping, overflow clipping, and text sanitation. Features antique parquet floors, double-glazed insulated windows, smart-home climate control system, and custom cabinetry.";
      } else if (propCount === 18) {
        propName = "Budget-Friendly Student/Junior Suite — All Utilities & Fiber Included!";
        description = "Compact, hyper-efficient living space. Walking distance to campus and transit. Secure keycard entry, shared courtyard, coinless smart laundry on each floor.";
      }

      const latOffset = ((propCount % 13) - 6) * 0.008;
      const lngOffset = ((propCount % 11) - 5) * 0.008;

      const price = template.price + ((propCount * 25) % 300);
      const deposit = price;
      const appFee = 45.00 + (propCount % 20);

      const amenitiesCount = 4 + (propCount % 6);
      const chosenAmenities = randomSample(AMENITIES, amenitiesCount);
      const highlightsCount = 2 + (propCount % 4);
      const chosenHighlights = randomSample(HIGHLIGHTS, highlightsCount);

      let primaryPhoto = "/singlelisting-2.jpg";
      if (template.type === "Studio" || template.type === "Rooms" || template.type === "Tinyhouse") primaryPhoto = "/property-studio.jpg";
      else if (template.type === "Apartment" || template.type === "Condo") primaryPhoto = "/property-medium-flat.jpg";
      else if (template.type === "House" || template.type === "Villa") primaryPhoto = "/property-large-flat.jpg";
      else if (template.type === "Loft") primaryPhoto = "/singlelisting-3.jpg";
      else primaryPhoto = "/featured-listing.jpg";

      const photoUrls = [
        primaryPhoto,
        "/gallery-living-room.jpg",
        "/gallery-bedroom.jpg",
        "/gallery-kitchen.jpg"
      ];

      const postedDate = toIsoDate(daysAgo(15 + (propCount * 3) % 250));

      properties.push({
        id: propId,
        managerId: mgr.id,
        name: propName,
        description,
        pricePerMonth: Number(price.toFixed(2)),
        securityDeposit: Number(deposit.toFixed(2)),
        applicationFee: Number(appFee.toFixed(2)),
        photoUrls,
        amenities: chosenAmenities,
        highlights: chosenHighlights,
        isPetsAllowed: chosenAmenities.includes("PetsAllowed") || propCount % 2 === 0,
        isParkingIncluded: chosenAmenities.includes("Parking") || propCount % 3 === 0,
        beds: template.beds,
        baths: template.baths,
        squareFeet: template.sqft,
        propertyType: template.type,
        postedDate,
        latitude: Number((cityData.lat + latOffset).toFixed(6)),
        longitude: Number((cityData.lng + lngOffset).toFixed(6)),
        availableFrom: propCount % 5 === 0 ? toIsoDate(daysAhead(14)) : null,
        address: street,
        city: cityData.city,
        state: cityData.state,
        country: cityData.country,
        postalCode: cityData.postalCode,
        createdAt: postedDate,
        updatedAt: postedDate
      });
    }
  });

  // 4. Leases (Target: 36 leases)
  const leases: any[] = [];

  // A. 14 Ended Past Leases (Past tenants, eligible to review)
  for (let i = 0; i < 14; i++) {
    const leaseId = uuid();
    const tenant = tenants[i];
    const property = properties[i];
    // Start ~20-24 months ago, end ~8-12 months ago
    const startDays = 700 + (i * 20);
    const start = daysAgo(startDays);
    const end = daysAgo(startDays - 365); // ends ~335-595 days ago

    leases.push({
      id: leaseId,
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      rent: property.pricePerMonth,
      deposit: property.securityDeposit,
      createdAt: toIsoDate(start),
      updatedAt: toIsoDate(end)
    });
  }

  // B. 18 Currently Active Leases
  // Tenants 0..3 had ended leases and now get active leases on different properties (buffer is >150 days)
  for (let i = 0; i < 18; i++) {
    const leaseId = uuid();
    const tenant = i < 4 ? tenants[i] : tenants[14 + (i - 4)];
    const property = properties[14 + i];
    // Started 2 to 6 months ago (60 to 180 days ago)
    const startMonthsAgo = 2 + (i % 5);
    const start = daysAgo(startMonthsAgo * 30);
    const end = daysAhead((12 - startMonthsAgo) * 30);

    leases.push({
      id: leaseId,
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      rent: property.pricePerMonth,
      deposit: property.securityDeposit,
      createdAt: toIsoDate(start),
      updatedAt: toIsoDate(start)
    });
  }

  // C. 4 Near-Future Leases
  for (let i = 0; i < 4; i++) {
    const leaseId = uuid();
    const tenant = tenants[28 + i];
    const property = properties[32 + i];
    const start = daysAhead(10 + i * 7);
    const end = daysAhead(10 + i * 7 + 365);

    leases.push({
      id: leaseId,
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      rent: property.pricePerMonth,
      deposit: property.securityDeposit,
      createdAt: toIsoDate(daysAgo(5)),
      updatedAt: toIsoDate(daysAgo(5))
    });
  }

  // Sequential past leases on property 0 by 4 distinct past tenants (allows 5 reviews on property 0)
  const extraTenantsForProp0 = [tenants[40], tenants[41], tenants[42], tenants[43]];
  extraTenantsForProp0.forEach((t: any, idx: number) => {
    const extraLeaseId = uuid();
    const start = daysAgo(750 + idx * 100);
    const end = daysAgo(750 + idx * 100 - 90);
    leases.push({
      id: extraLeaseId,
      propertyId: properties[0].id,
      tenantId: t.id,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      rent: properties[0].pricePerMonth,
      deposit: properties[0].securityDeposit,
      createdAt: toIsoDate(start),
      updatedAt: toIsoDate(end)
    });
  });

  // 5. Applications (Target: 72 applications)
  const applications: any[] = [];
  const pendingPairs = new Set<string>();

  // A. 18 Approved applications
  for (let i = 0; i < 18; i++) {
    const lease = leases[14 + i];
    const tenant = tenants.find((t: any) => t.id === lease.tenantId)!;
    const user = users.find((u: any) => u.id === tenant.userId)!;
    const appDate = new Date(new Date(lease.startDate).getTime() - 14 * 24 * 60 * 60 * 1000);

    applications.push({
      id: uuid(),
      propertyId: lease.propertyId,
      tenantId: lease.tenantId,
      leaseId: lease.id,
      applicationDate: toIsoDate(appDate),
      status: "Approved",
      name: user.name,
      email: user.email,
      phoneNumber: tenant.phoneNumber,
      message: "Very interested in this property. I have excellent credit and stable employment.",
      createdAt: toIsoDate(appDate),
      updatedAt: toIsoDate(new Date(lease.startDate))
    });
  }

  // B. 38 Pending applications
  let pendingCount = 0;
  let tenantCursor = 32;
  while (pendingCount < 38) {
    const tenant = tenants[tenantCursor % (tenants.length - 1)]; // Skip fresh tenant
    const propIdx = pendingCount < 16 ? pendingCount % 4 : (pendingCount * 3) % properties.length;
    const property = properties[propIdx];
    const pairKey = `${tenant.id}_${property.id}`;

    if (!pendingPairs.has(pairKey)) {
      pendingPairs.add(pairKey);
      const user = users.find((u: any) => u.id === tenant.userId)!;
      const appDate = toIsoDate(daysAgo(1 + (pendingCount % 14)));

      applications.push({
        id: uuid(),
        propertyId: property.id,
        tenantId: tenant.id,
        leaseId: null,
        applicationDate: appDate,
        status: "Pending",
        name: user.name,
        email: user.email,
        phoneNumber: tenant.phoneNumber,
        message: pendingCount % 3 === 0
          ? "Hello, I toured recently and loved the lighting and neighborhood. Submitting my application for consideration."
          : "Looking forward to moving in if approved! I am relocating for work.",
        createdAt: appDate,
        updatedAt: appDate
      });
      pendingCount++;
    }
    tenantCursor++;
  }

  // C. 10 Denied applications
  for (let i = 0; i < 10; i++) {
    const tenant = tenants[20 + i];
    const property = properties[40 + i];
    const user = users.find((u: any) => u.id === tenant.userId)!;
    const appDate = toIsoDate(daysAgo(20 + i * 2));

    applications.push({
      id: uuid(),
      propertyId: property.id,
      tenantId: tenant.id,
      leaseId: null,
      applicationDate: appDate,
      status: "Denied",
      name: user.name,
      email: user.email,
      phoneNumber: tenant.phoneNumber,
      message: "Applying with co-signer. Please let me know if additional documentation is required.",
      createdAt: appDate,
      updatedAt: toIsoDate(daysAgo(15 + i * 2))
    });
  }

  // D. 6 Withdrawn applications
  for (let i = 0; i < 6; i++) {
    const tenant = tenants[30 + i];
    const property = properties[55 + i];
    const user = users.find((u: any) => u.id === tenant.userId)!;
    const appDate = toIsoDate(daysAgo(12 + i * 3));

    applications.push({
      id: uuid(),
      propertyId: property.id,
      tenantId: tenant.id,
      leaseId: null,
      applicationDate: appDate,
      status: "Withdrawn",
      name: user.name,
      email: user.email,
      phoneNumber: tenant.phoneNumber,
      message: "Withdrawing because I accepted another offer closer to my office.",
      createdAt: appDate,
      updatedAt: toIsoDate(daysAgo(8 + i * 3))
    });
  }

  // 6. Payments (Target: 85 payments)
  const payments: any[] = [];
  let paidCount = 0;
  let partialCount = 0;
  let pendingPayCount = 0;
  let overdueCount = 0;

  leases.forEach((lease: any, lIdx: number) => {
    const leaseStart = new Date(lease.startDate);
    const rent = lease.rent;

    if (lIdx < 14) {
      for (let m = 0; m < 3 && paidCount < 52; m++) {
        const dueDate = new Date(leaseStart.getTime() + m * 30 * 24 * 60 * 60 * 1000);
        const paymentDate = new Date(dueDate.getTime() + 1 * 24 * 60 * 60 * 1000);
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: rent,
          dueDate: toIsoDate(dueDate),
          paymentDate: toIsoDate(paymentDate),
          paymentStatus: "Paid",
          createdAt: toIsoDate(dueDate),
          updatedAt: toIsoDate(paymentDate)
        });
        paidCount++;
      }
    } else if (lIdx < 32) {
      if (paidCount < 52) {
        const d1 = new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000);
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: rent,
          dueDate: toIsoDate(d1),
          paymentDate: toIsoDate(new Date(d1.getTime() + 2 * 24 * 60 * 60 * 1000)),
          paymentStatus: "Paid",
          createdAt: toIsoDate(d1),
          updatedAt: toIsoDate(d1)
        });
        paidCount++;
      }

      if (partialCount < 10 && lIdx % 2 === 0) {
        const d2 = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
        const half = Number((rent / 2).toFixed(2));
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: half,
          dueDate: toIsoDate(d2),
          paymentDate: toIsoDate(new Date(d2.getTime() + 4 * 24 * 60 * 60 * 1000)),
          paymentStatus: "PartiallyPaid",
          createdAt: toIsoDate(d2),
          updatedAt: toIsoDate(d2)
        });
        partialCount++;
      } else if (paidCount < 52) {
        const d2 = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: rent,
          dueDate: toIsoDate(d2),
          paymentDate: toIsoDate(d2),
          paymentStatus: "Paid",
          createdAt: toIsoDate(d2),
          updatedAt: toIsoDate(d2)
        });
        paidCount++;
      }

      if (overdueCount < 8 && lIdx % 3 === 0) {
        const dOverdue = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: 0,
          dueDate: toIsoDate(dOverdue),
          paymentDate: null,
          paymentStatus: "Overdue",
          createdAt: toIsoDate(dOverdue),
          updatedAt: toIsoDate(dOverdue)
        });
        overdueCount++;
      } else if (pendingPayCount < 15) {
        const dPending = new Date(NOW.getTime() + 14 * 24 * 60 * 60 * 1000);
        payments.push({
          id: uuid(),
          leaseId: lease.id,
          amountDue: rent,
          amountPaid: 0,
          dueDate: toIsoDate(dPending),
          paymentDate: null,
          paymentStatus: "Pending",
          createdAt: toIsoDate(NOW),
          updatedAt: toIsoDate(NOW)
        });
        pendingPayCount++;
      }
    }
  });

  // Top up payments to reach exactly 85
  while (paidCount < 52 && leases.length > 0) {
    const lease = leases[paidCount % 14];
    const d = new Date(new Date(lease.startDate).getTime() + 90 * 24 * 60 * 60 * 1000);
    payments.push({
      id: uuid(),
      leaseId: lease.id,
      amountDue: lease.rent,
      amountPaid: lease.rent,
      dueDate: toIsoDate(d),
      paymentDate: toIsoDate(d),
      paymentStatus: "Paid",
      createdAt: toIsoDate(d),
      updatedAt: toIsoDate(d)
    });
    paidCount++;
  }

  while (payments.length < 85) {
    const lease = leases[payments.length % leases.length];
    const d = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000);
    payments.push({
      id: uuid(),
      leaseId: lease.id,
      amountDue: lease.rent,
      amountPaid: 0,
      dueDate: toIsoDate(d),
      paymentDate: null,
      paymentStatus: "Pending",
      createdAt: toIsoDate(NOW),
      updatedAt: toIsoDate(NOW)
    });
  }

  // 7. Favorites (Target: 52 favorites)
  const favorites: any[] = [];
  const favoritePairs = new Set<string>();

  let favCount = 0;
  for (let tIdx = 0; tIdx < 35 && favCount < 52; tIdx++) {
    const tenant = tenants[tIdx];
    const numFavs = tIdx < 5 ? 5 : 1;
    for (let f = 0; f < numFavs && favCount < 52; f++) {
      const propIdx = (tIdx * 3 + f * 7) % properties.length;
      const property = properties[propIdx];
      const pairKey = `${tenant.id}_${property.id}`;
      if (!favoritePairs.has(pairKey)) {
        favoritePairs.add(pairKey);
        favorites.push({
          id: uuid(),
          tenantId: tenant.id,
          propertyId: property.id,
          createdAt: toIsoDate(daysAgo(2 + ((favCount * 5) % 60)))
        });
        favCount++;
      }
    }
  }

  // 8. Reviews (Target: 30 reviews)
  // Invariant: ONLY tenants who have a lease with startDate <= NOW!
  // Ratings: 10x 5★, 10x 4★, 4x 3★, 3x 2★, 3x 1★
  const reviews: any[] = [];
  const reviewPairs = new Set<string>();
  const allEligibleLeases = leases.filter((l: any) => new Date(l.startDate) <= NOW);

  const reviewComments = [
    // 5 Stars (10)
    { rating: 5, comment: "Absolute dream apartment! Natural sunlight fills every room, the manager responded in under an hour for anything we needed, and move-in was seamless." },
    { rating: 5, comment: "Fantastic location right next to the metro and cafes. Quiet neighborhood and secure building access." },
    { rating: 5, comment: "Lived here for a year and loved every moment. The finishes are high-end and the amenities are maintained flawlessly." },
    { rating: 5, comment: "Clean, spacious, and very well managed. Never had an issue with noise or packages." },
    { rating: 5, comment: "Best rental experience I've had in the city. Fast maintenance and transparent billing." },
    { rating: 5, comment: "Superb property! High ceilings, great insulation, and modern appliances that actually work well." },
    { rating: 5, comment: "Management is friendly and professional. The shared garden and patio area was a wonderful perk in the summer." },
    { rating: 5, comment: "Quiet, peaceful, and well-designed layout. Highly recommended for anyone working remotely." },
    { rating: 5, comment: "Great value for the square footage. Safe building with parking included as promised." },
    { rating: 5, comment: "Five stars without question. Modern fixtures, hardwood floors in great shape, and zero surprise fees." },

    // 4 Stars (10)
    { rating: 4, comment: "Overall great apartment. Street parking can be competitive on weekends, but the unit itself is peaceful and well-insulated." },
    { rating: 4, comment: "Spacious layout and good water pressure. Minor delay during move-in walkthrough but management handled it graciously." },
    { rating: 4, comment: "Solid place to live. Heating works great in winter. Wish the gym had slightly newer equipment, but everything else is excellent." },
    { rating: 4, comment: "Really nice finishes and quiet neighbors. Trash chute was jammed once but fixed within 24 hours." },
    { rating: 4, comment: "Loved the balcony and natural light. Kitchen counter space is slightly tight if you cook elaborate meals, but otherwise top notch." },
    { rating: 4, comment: "Very communicative property manager. Great neighborhood walkability and plenty of nearby grocery stores." },
    { rating: 4, comment: "Comfortable, clean, and safe. A bit pricey, but the location and quality justify it." },
    { rating: 4, comment: "Good experience over our 12-month lease. Returned the security deposit promptly." },
    { rating: 4, comment: "Prompt maintenance responses. Building corridors are kept tidy and clean." },
    { rating: 4, comment: "Four solid stars. Reliable internet connectivity and plenty of storage space in the closets." },

    // 3 Stars (4)
    { rating: 3, comment: "Decent apartment, but street traffic noise can get loud during morning rush hour. Unit itself is okay." },
    { rating: 3, comment: "Average experience. The AC struggled a bit during heatwaves, though a tech came out twice to inspect it." },
    { rating: 3, comment: "Location is prime, but the washer/dryer in unit was smaller than expected. Rent is slightly steep for what's provided." },
    { rating: 3, comment: "Acceptable for a short stay. Thin walls between the adjacent bedroom, but management did issue reminders to quiet down." },

    // 2 Stars (3 Critical)
    { rating: 2, comment: "Disappointed with how long it took to fix the hallway heater in January. Took almost two weeks of follow-ups before a technician finally showed up." },
    { rating: 2, comment: "Walls are paper thin — could hear everything from the unit above. Also had recurring issues with the hot water pressure during peak hours." },
    { rating: 2, comment: "Parking space assigned to me was frequently blocked by delivery vans and management was slow to address it. Unit looks better in photos than in reality." },

    // 1 Star (3 Critical)
    { rating: 1, comment: "Constant plumbing leaks under the sink that were only patched rather than properly repaired. Frustrating experience dealing with ongoing water damage." },
    { rating: 1, comment: "Unresponsive management when the main building lock broke. Felt unsafe for nearly 5 days. Would not recommend leasing here." },
    { rating: 1, comment: "Horrible noise from nearby construction that was never disclosed prior to signing. Dusty windows and no rent concession offered." }
  ];

  // Distribute strictly without duplicate (propertyId, tenantId)
  // First 5 reviews go to Property 0 from the 5 distinct tenants who have leases on Property 0
  const prop0Leases = allEligibleLeases.filter((l: any) => l.propertyId === properties[0].id);
  for (let i = 0; i < 5 && i < prop0Leases.length; i++) {
    const l = prop0Leases[i];
    reviewPairs.add(`${l.propertyId}_${l.tenantId}`);
    reviews.push({
      id: uuid(),
      propertyId: l.propertyId,
      tenantId: l.tenantId,
      rating: reviewComments[i].rating,
      comment: reviewComments[i].comment,
      createdAt: toIsoDate(daysAgo(15 + i * 10)),
      updatedAt: toIsoDate(daysAgo(15 + i * 10))
    });
  }

  // Next reviews: find remaining eligible leases not yet reviewed
  let revIdx = 5;
  for (const l of allEligibleLeases) {
    if (revIdx >= reviewComments.length) break;
    const pairKey = `${l.propertyId}_${l.tenantId}`;
    if (!reviewPairs.has(pairKey)) {
      reviewPairs.add(pairKey);
      reviews.push({
        id: uuid(),
        propertyId: l.propertyId,
        tenantId: l.tenantId,
        rating: reviewComments[revIdx].rating,
        comment: reviewComments[revIdx].comment,
        createdAt: toIsoDate(daysAgo(10 + revIdx * 6)),
        updatedAt: toIsoDate(daysAgo(10 + revIdx * 6))
      });
      revIdx++;
    }
  }

  // 9. Payment Methods (Target: 26 payment methods)
  const paymentMethods: any[] = [];
  const cardBrands = ["Visa", "Mastercard", "Amex", "Discover"];
  let pmCount = 0;

  for (let tIdx = 0; tIdx < 20; tIdx++) {
    const tenant = tenants[tIdx];
    const user = users.find((u: any) => u.id === tenant.userId)!;

    if (pmCount < 18) {
      paymentMethods.push({
        id: uuid(),
        tenantId: tenant.id,
        type: "Card",
        brand: cardBrands[pmCount % cardBrands.length],
        last4: (1000 + ((pmCount * 337) % 8999)).toString(),
        expMonth: 1 + (pmCount % 12),
        expYear: 2027 + (pmCount % 5),
        accountHolder: user.name,
        gatewayCustomerId: `cus_${uuid().slice(0, 14)}`,
        gatewayPaymentMethodId: `pm_${uuid().slice(0, 14)}`,
        isDefault: true,
        createdAt: toIsoDate(daysAgo(30 + pmCount)),
        updatedAt: toIsoDate(daysAgo(30 + pmCount))
      });
      pmCount++;
    }

    if (paymentMethods.filter((p: any) => p.type === "Bank").length < 8 && tIdx % 2 === 0) {
      paymentMethods.push({
        id: uuid(),
        tenantId: tenant.id,
        type: "Bank",
        brand: "Bank",
        last4: (1000 + ((tIdx * 451) % 8999)).toString(),
        expMonth: null,
        expYear: null,
        accountHolder: user.name,
        gatewayCustomerId: `cus_${uuid().slice(0, 14)}`,
        gatewayPaymentMethodId: `pm_${uuid().slice(0, 14)}`,
        isDefault: false,
        createdAt: toIsoDate(daysAgo(20 + tIdx)),
        updatedAt: toIsoDate(daysAgo(20 + tIdx))
      });
    }
  }

  // 10. Maintenance Requests (Target: 20 requests)
  const maintenanceRequests: any[] = [];
  const maintenanceIssues = [
    { title: "Kitchen faucet dripping steadily", desc: "The cold water faucet in the kitchen continues to drip constantly even when fully shut off.", status: "Open" },
    { title: "HVAC cooling inconsistent in master bedroom", desc: "The AC unit runs but the master bedroom vent airflow is very weak compared to the living room.", status: "Open" },
    { title: "Dishwasher drainage blockage", desc: "Water pools at the bottom of the dishwasher after running a standard cycle and will not drain.", status: "Open" },
    { title: "Bathroom exhaust fan making grinding noise", desc: "The overhead exhaust fan in the main bathroom began rattling and making a harsh grinding sound.", status: "Open" },
    { title: "Deadbolt lock cylinder sticking", desc: "Front entry key sticks inside the cylinder and takes excessive force to turn.", status: "Open" },
    { title: "Water heater temperature fluctuating", desc: "Shower temperature fluctuates between scalding and lukewarm unpredictably.", status: "Open" },
    { title: "Window latch loose in guest room", desc: "The sash lock on the west-facing guest bedroom window is loose and does not latch shut.", status: "Open" },
    { title: "Balcony sliding screen door off track", desc: "The screen door jumped off its aluminum track and cannot slide smoothly.", status: "Open" },

    { title: "Garbage disposal humming but not spinning", desc: "Motor hums when the switch is flipped but the flywheel is stuck. Reset button has been pressed.", status: "InProgress" },
    { title: "Ceiling drywall water ring in hallway", desc: "Noticed a faint brownish ring on the hallway ceiling. Seems dry to the touch right now.", status: "InProgress" },
    { title: "Microwave turntable roller assembly cracked", desc: "The rotating ring beneath the glass tray cracked and causes uneven heating.", status: "InProgress" },
    { title: "Smoke detector periodic low-battery chirp", desc: "Ceiling smoke detector is chirping every 45 seconds. Battery replacement didn't clear the beep.", status: "InProgress" },
    { title: "Radiator valve slow hiss during heating cycle", desc: "The steam radiator valve hisses loudly and leaves a small puddle on the wooden floor.", status: "InProgress" },

    { title: "Refrigerator gasket seal detached", desc: "Lower corner of the magnetic door gasket was replaced with an OEM seal.", status: "Resolved" },
    { title: "Clogged shower drain", desc: "Slow drainage cleared by technician with a commercial snake; flowing normally.", status: "Resolved" },
    { title: "Dryer heating element failure", desc: "Replaced faulty thermal fuse and heating coil. Tested dry cycle successfully.", status: "Resolved" },
    { title: "Patio lighting fixture burned out", desc: "Replaced exterior weather-resistant LED fixture and tested wall switch.", status: "Resolved" },
    { title: "Loose toilet base flange", desc: "Re-waxed and bolted toilet base securely to the subfloor with new brass hardware.", status: "Resolved" },
    { title: "Door bell chime silent", desc: "Replaced chime transformer inside the breaker utility closet.", status: "Resolved" },
    { title: "Kitchen cabinet hinge detached", desc: "Re-anchored upper cabinet hinge screws into reinforced wood backing.", status: "Resolved" }
  ];

  maintenanceIssues.forEach((issue, idx) => {
    const lease = leases[idx % leases.length];
    const isPast = new Date(lease.endDate) < NOW;

    maintenanceRequests.push({
      id: uuid(),
      propertyId: lease.propertyId,
      tenantId: lease.tenantId,
      leaseId: isPast ? null : lease.id,
      title: issue.title,
      description: issue.desc,
      status: issue.status,
      createdAt: toIsoDate(daysAgo(3 + idx * 4)),
      updatedAt: toIsoDate(daysAgo(1 + idx * 2))
    });
  });

  // 11. Tour Requests (Target: 18 requests)
  const tourRequests: any[] = [];
  const tourDates = [
    { date: "Saturday, Sep 12", time: "10:30 AM" },
    { date: "Saturday, Sep 12", time: "2:00 PM" },
    { date: "Sunday, Sep 13", time: "11:00 AM" },
    { date: "Tuesday, Sep 15", time: "5:30 PM" },
    { date: "Thursday, Sep 17", time: "1:15 PM" },
    { date: "Friday, Sep 18", time: "4:00 PM" },
    { date: "Saturday, Sep 19", time: "11:30 AM" },
    { date: "Sunday, Sep 20", time: "3:00 PM" }
  ];

  for (let i = 0; i < 18; i++) {
    const tenant = tenants[25 + i];
    const user = users.find((u: any) => u.id === tenant.userId)!;
    const property = properties[10 + i];
    const slot = tourDates[i % tourDates.length];
    let status = "Pending";
    if (i >= 8 && i < 14) status = "Confirmed";
    else if (i >= 14) status = "Declined";

    tourRequests.push({
      id: uuid(),
      propertyId: property.id,
      tenantId: tenant.id,
      name: user.name,
      email: user.email,
      tourType: i % 3 === 0 ? "Video" : "InPerson",
      preferredDate: slot.date,
      preferredTime: slot.time,
      note: i % 2 === 0 ? "Looking forward to seeing the unit! Bringing my partner." : "Please let me know if virtual tour link will be sent via email.",
      status,
      createdAt: toIsoDate(daysAgo(1 + i * 2)),
      updatedAt: toIsoDate(daysAgo(1 + i * 2))
    });
  }

  // 12. Contact Messages (Target: 14 messages)
  const contactMessages: any[] = [];
  const messageTexts = [
    "Hello, is the parking space included in the monthly rent, or is there an additional monthly garage fee?",
    "Hi there, does the building allow two small domestic cats with a pet deposit?",
    "Good morning! Is this listing still accepting applications for an October 1st move-in date?",
    "Does this unit come equipped with high-speed fiber internet infrastructure or coaxial only?",
    "Are short-term or 6-month leases considered, or is a 12-month lease strictly required?",
    "Hello, is there dedicated bike storage in the building basement or courtyard?",
    "Hi, I am moving from out of state. Can we arrange a video walkthrough before I submit an application?",
    "Does the unit have central air conditioning or ductless mini-splits?",
    "Are utilities (water, sewage, trash) included in the base rent?",
    "Hello! Is the washer/dryer in-unit or shared on the floor?",
    "Can the security deposit be split across the first two months?",
    "Is there an EV charging station in the building parking structure?",
    "Hi, what is the policy regarding guest parking overnight?",
    "Hello, are there any move-in fees or elevator reservation fees?"
  ];

  for (let i = 0; i < 14; i++) {
    const tenant = tenants[15 + i];
    const user = users.find((u: any) => u.id === tenant.userId)!;
    const property = properties[20 + i];

    contactMessages.push({
      id: uuid(),
      propertyId: property.id,
      tenantId: tenant.id,
      name: user.name,
      email: user.email,
      message: messageTexts[i],
      createdAt: toIsoDate(daysAgo(1 + i * 3))
    });
  }

  // -------------------------------------------------------------------------
  // Write Output Files
  // -------------------------------------------------------------------------
  if (!fs.existsSync(SEED_DATA_DIR)) {
    fs.mkdirSync(SEED_DATA_DIR, { recursive: true });
  }

  const writeJson = (filename: string, data: any) => {
    fs.writeFileSync(path.join(SEED_DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
    console.log(`  ✓ ${filename} (${data.length} records)`);
  };

  writeJson("user.json", users);
  writeJson("manager.json", managers);
  writeJson("tenant.json", tenants);
  writeJson("property.json", properties);
  writeJson("lease.json", leases);
  writeJson("application.json", applications);
  writeJson("payment.json", payments);
  writeJson("favorite.json", favorites);
  writeJson("review.json", reviews);
  writeJson("invite-codes.json", inviteCodes);
  writeJson("payment-method.json", paymentMethods);
  writeJson("maintenance.json", maintenanceRequests);
  writeJson("tour.json", tourRequests);
  writeJson("message.json", contactMessages);

  const credsContent = `# Habitat Test Credentials

All seeded accounts share the following password:

**Shared Plaintext Password**: \`${SHARED_PASSWORD}\`

---

## Representative Manager Accounts

| Role / State | Name | Email | Properties Managed | Notes |
|---|---|---|---|---|
| **Portfolio Manager (12 properties)** | Eleanor Vance | \`eleanor.vance@habitat-properties.com\` | 12 | High volume manager dashboard, pending applications queue, inquiries |
| **Mid-tier Manager (6 properties)** | David Chen | \`david.chen@pacificliving.io\` | 6 | Balanced portfolio across Seattle & West Coast |
| **Single-Property Manager (1 property)** | Amina Al-Mansoor | \`amina.mansoor@summitrealty.com\` | 1 | Single listing overview & applications |
| **Fresh Signup Manager (0 properties)** | Fresh Manager Demo | \`fresh.manager@habitat-demo.com\` | 0 | **Empty manager dashboard state** |

---

## Representative Tenant Accounts

| State | Name | Email | Leases | Applications | Payment History | Notes |
|---|---|---|---|---|---|---|
| **Active Resident (with History)** | Aarav Patel | \`aaravpatel.1@example.com\` | 1 Past + 1 Active | 1 Approved | Paid & Partial invoices | Active residence tab, lease PDF download, payment receipt |
| **Applicant with Multiple Applications** | Keanu Reeves | \`keanureeves.29@example.com\` | 0 | 2 Pending | None | Applications list with pending statuses |
| **Past Resident with Reviews** | Devon Washington | \`devonwashington.11@example.com\` | 1 Past (Ended) | None | Full paid history | Verified past lease, review history |
| **Fresh Signup Tenant (0 activity)** | Fresh Tenant Demo | \`freshtenantdemo.60@example.com\` | 0 | 0 | 0 | **All empty dashboard states** (no residence, no billing, no favorites) |

---

## Unclaimed Manager Invite Codes (for Manual Registration Testing)

Use any of these codes to register a new manager account via \`/signup\`:

- \`HAB-UNCLAIMED-2001\`
- \`HAB-UNCLAIMED-2002\`
- \`HAB-UNCLAIMED-2003\`
- \`HAB-UNCLAIMED-2004\`
`;

  fs.writeFileSync(path.join(SEED_DATA_DIR, "README-credentials.md"), credsContent, "utf-8");
  console.log("  ✓ README-credentials.md generated");
  console.log("\nSeed data generation complete!");
}

if (process.argv[1] && process.argv[1].endsWith("generate-seed-data.ts")) {
  generateAll().catch(console.error);
}
