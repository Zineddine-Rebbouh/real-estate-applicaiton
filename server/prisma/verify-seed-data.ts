import fs from "fs";
import path from "path";

const SEED_DATA_DIR = path.join(__dirname, "seedData");
const CLIENT_PUBLIC_DIR = path.join(__dirname, "../../client/public");
const NOW = new Date("2026-09-08T12:00:00.000Z");

const PROPERTY_TYPES = new Set([
  "Rooms", "Tinyhouse", "Apartment", "Villa", "Townhouse",
  "Cottage", "House", "Condo", "Studio", "Loft"
]);

const AMENITY_ENUMS = new Set([
  "WasherDryer", "AirConditioning", "Dishwasher", "HighSpeedInternet",
  "HardwoodFloors", "WalkInClosets", "Microwave", "Refrigerator",
  "Pool", "Gym", "Parking", "PetsAllowed", "WiFi"
]);

const HIGHLIGHT_ENUMS = new Set([
  "HighSpeedInternetAccess", "WasherDryer", "AirConditioning", "Heating",
  "SmokeFree", "CableReady", "SatelliteTV", "DoubleVanities", "TubShower",
  "Intercom", "SprinklerSystem", "RecentlyRenovated", "CloseToTransit",
  "GreatView", "QuietNeighborhood"
]);

const APPLICATION_STATUSES = new Set(["Pending", "Approved", "Denied", "Withdrawn"]);
const PAYMENT_STATUSES = new Set(["Pending", "Paid", "PartiallyPaid", "Overdue"]);
const PAYMENT_METHOD_TYPES = new Set(["Card", "Bank"]);
const MAINTENANCE_STATUSES = new Set(["Open", "InProgress", "Resolved"]);
const TOUR_TYPES = new Set(["InPerson", "Video"]);
const TOUR_STATUSES = new Set(["Pending", "Confirmed", "Declined"]);
const ROLES = new Set(["TENANT", "MANAGER"]);

function load<T>(filename: string): T[] {
  const filePath = path.join(SEED_DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file missing: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
}

export async function verifySeedData() {
  console.log("==================================================");
  console.log("   HABITAT SEED DATA SELF-CHECK VERIFICATION     ");
  console.log("==================================================");

  let errorCount = 0;
  function reportError(msg: string) {
    console.error(`  ❌ ERROR: ${msg}`);
    errorCount++;
  }

  // 1. Load all files
  const users = load<any>("user.json");
  const managers = load<any>("manager.json");
  const tenants = load<any>("tenant.json");
  const properties = load<any>("property.json");
  const leases = load<any>("lease.json");
  const applications = load<any>("application.json");
  const payments = load<any>("payment.json");
  const favorites = load<any>("favorite.json");
  const reviews = load<any>("review.json");
  const inviteCodes = load<any>("invite-codes.json");
  const paymentMethods = load<any>("payment-method.json");
  const maintenance = load<any>("maintenance.json");
  const tours = load<any>("tour.json");
  const messages = load<any>("message.json");

  console.log(`Loaded 14 files:`);
  console.log(`  - users: ${users.length}`);
  console.log(`  - managers: ${managers.length}`);
  console.log(`  - tenants: ${tenants.length}`);
  console.log(`  - properties: ${properties.length}`);
  console.log(`  - leases: ${leases.length}`);
  console.log(`  - applications: ${applications.length}`);
  console.log(`  - payments: ${payments.length}`);
  console.log(`  - favorites: ${favorites.length}`);
  console.log(`  - reviews: ${reviews.length}`);
  console.log(`  - inviteCodes: ${inviteCodes.length}`);
  console.log(`  - paymentMethods: ${paymentMethods.length}`);
  console.log(`  - maintenance: ${maintenance.length}`);
  console.log(`  - tours: ${tours.length}`);
  console.log(`  - messages: ${messages.length}`);
  console.log("--------------------------------------------------");

  // ID Maps
  const userMap = new Map(users.map((u) => [u.id, u]));
  const managerMap = new Map(managers.map((m) => [m.id, m]));
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));
  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const leaseMap = new Map(leases.map((l) => [l.id, l]));

  // 2. Uniqueness Checks
  console.log("Checking uniqueness constraints...");
  const userEmails = new Set<string>();
  users.forEach((u) => {
    if (userEmails.has(u.email)) reportError(`Duplicate user email: ${u.email}`);
    userEmails.add(u.email);
    if (!ROLES.has(u.role)) reportError(`Invalid role on user ${u.id}: ${u.role}`);
  });

  const codes = new Set<string>();
  inviteCodes.forEach((ic) => {
    if (codes.has(ic.code)) reportError(`Duplicate invite code: ${ic.code}`);
    codes.add(ic.code);
    if (ic.usedByUserId && !userMap.has(ic.usedByUserId)) {
      reportError(`Invite code ${ic.code} usedByUserId not found: ${ic.usedByUserId}`);
    }
  });

  const reviewKeys = new Set<string>();
  reviews.forEach((r) => {
    const key = `${r.propertyId}_${r.tenantId}`;
    if (reviewKeys.has(key)) reportError(`Duplicate review for (propertyId, tenantId): ${key}`);
    reviewKeys.add(key);
  });

  const favoriteKeys = new Set<string>();
  favorites.forEach((f) => {
    const key = `${f.tenantId}_${f.propertyId}`;
    if (favoriteKeys.has(key)) reportError(`Duplicate favorite for (tenantId, propertyId): ${key}`);
    favoriteKeys.add(key);
  });

  // 3. Foreign Key Checks
  console.log("Checking foreign keys across all records...");
  managers.forEach((m) => {
    if (!userMap.has(m.userId)) reportError(`Manager ${m.id} userId not found: ${m.userId}`);
  });

  tenants.forEach((t) => {
    if (!userMap.has(t.userId)) reportError(`Tenant ${t.id} userId not found: ${t.userId}`);
  });

  properties.forEach((p) => {
    if (!managerMap.has(p.managerId)) reportError(`Property ${p.id} managerId not found: ${p.managerId}`);
  });

  leases.forEach((l) => {
    if (!propertyMap.has(l.propertyId)) reportError(`Lease ${l.id} propertyId not found: ${l.propertyId}`);
    if (!tenantMap.has(l.tenantId)) reportError(`Lease ${l.id} tenantId not found: ${l.tenantId}`);
  });

  applications.forEach((a) => {
    if (!propertyMap.has(a.propertyId)) reportError(`Application ${a.id} propertyId not found: ${a.propertyId}`);
    if (!tenantMap.has(a.tenantId)) reportError(`Application ${a.id} tenantId not found: ${a.tenantId}`);
    if (a.leaseId && !leaseMap.has(a.leaseId)) reportError(`Application ${a.id} leaseId not found: ${a.leaseId}`);
  });

  payments.forEach((p) => {
    if (!leaseMap.has(p.leaseId)) reportError(`Payment ${p.id} leaseId not found: ${p.leaseId}`);
  });

  favorites.forEach((f) => {
    if (!tenantMap.has(f.tenantId)) reportError(`Favorite ${f.id} tenantId not found: ${f.tenantId}`);
    if (!propertyMap.has(f.propertyId)) reportError(`Favorite ${f.id} propertyId not found: ${f.propertyId}`);
  });

  reviews.forEach((r) => {
    if (!propertyMap.has(r.propertyId)) reportError(`Review ${r.id} propertyId not found: ${r.propertyId}`);
    if (!tenantMap.has(r.tenantId)) reportError(`Review ${r.id} tenantId not found: ${r.tenantId}`);
  });

  paymentMethods.forEach((pm) => {
    if (!tenantMap.has(pm.tenantId)) reportError(`PaymentMethod ${pm.id} tenantId not found: ${pm.tenantId}`);
  });

  maintenance.forEach((m) => {
    if (!propertyMap.has(m.propertyId)) reportError(`Maintenance ${m.id} propertyId not found: ${m.propertyId}`);
    if (!tenantMap.has(m.tenantId)) reportError(`Maintenance ${m.id} tenantId not found: ${m.tenantId}`);
    if (m.leaseId && !leaseMap.has(m.leaseId)) reportError(`Maintenance ${m.id} leaseId not found: ${m.leaseId}`);
  });

  tours.forEach((tr) => {
    if (!propertyMap.has(tr.propertyId)) reportError(`TourRequest ${tr.id} propertyId not found: ${tr.propertyId}`);
    if (!tenantMap.has(tr.tenantId)) reportError(`TourRequest ${tr.id} tenantId not found: ${tr.tenantId}`);
  });

  messages.forEach((cm) => {
    if (!propertyMap.has(cm.propertyId)) reportError(`ContactMessage ${cm.id} propertyId not found: ${cm.propertyId}`);
    if (!tenantMap.has(cm.tenantId)) reportError(`ContactMessage ${cm.id} tenantId not found: ${cm.tenantId}`);
  });

  // 4. Enums Validation
  console.log("Checking enum validity across all tables...");
  properties.forEach((p) => {
    if (!PROPERTY_TYPES.has(p.propertyType)) {
      reportError(`Invalid propertyType on property ${p.id}: ${p.propertyType}`);
    }
    p.amenities.forEach((a: string) => {
      if (!AMENITY_ENUMS.has(a)) reportError(`Invalid amenity on property ${p.id}: ${a}`);
    });
    p.highlights.forEach((h: string) => {
      if (!HIGHLIGHT_ENUMS.has(h)) reportError(`Invalid highlight on property ${p.id}: ${h}`);
    });
  });

  applications.forEach((a) => {
    if (!APPLICATION_STATUSES.has(a.status)) reportError(`Invalid status on application ${a.id}: ${a.status}`);
  });

  payments.forEach((p) => {
    if (!PAYMENT_STATUSES.has(p.paymentStatus)) reportError(`Invalid status on payment ${p.id}: ${p.paymentStatus}`);
    if ((p.paymentStatus === "Paid" || p.paymentStatus === "PartiallyPaid") && !p.paymentDate) {
      reportError(`Payment ${p.id} has status ${p.paymentStatus} but no paymentDate`);
    }
    if ((p.paymentStatus === "Pending" || p.paymentStatus === "Overdue") && p.paymentDate !== null) {
      reportError(`Payment ${p.id} has status ${p.paymentStatus} but non-null paymentDate`);
    }
  });

  paymentMethods.forEach((pm) => {
    if (!PAYMENT_METHOD_TYPES.has(pm.type)) reportError(`Invalid payment method type on ${pm.id}: ${pm.type}`);
  });

  maintenance.forEach((m) => {
    if (!MAINTENANCE_STATUSES.has(m.status)) reportError(`Invalid status on maintenance ${m.id}: ${m.status}`);
  });

  tours.forEach((tr) => {
    if (!TOUR_TYPES.has(tr.tourType)) reportError(`Invalid tourType on tour ${tr.id}: ${tr.tourType}`);
    if (!TOUR_STATUSES.has(tr.status)) reportError(`Invalid status on tour ${tr.id}: ${tr.status}`);
    if (tr.preferredDate.length > 60) reportError(`preferredDate too long on tour ${tr.id}: ${tr.preferredDate}`);
    if (tr.preferredTime.length > 60) reportError(`preferredTime too long on tour ${tr.id}: ${tr.preferredTime}`);
  });

  // 5. Photo URLs Verification
  console.log("Checking photoUrls against client/public/ assets...");
  properties.forEach((p) => {
    if (!Array.isArray(p.photoUrls) || p.photoUrls.length === 0) {
      reportError(`Property ${p.id} has empty photoUrls`);
    }
    p.photoUrls.forEach((url: string) => {
      // Remove leading slash to get relative file path in client/public
      const filename = url.startsWith("/") ? url.slice(1) : url;
      const fullPath = path.join(CLIENT_PUBLIC_DIR, filename);
      if (!fs.existsSync(fullPath)) {
        reportError(`Property ${p.id} references missing photo: ${url} (looked in ${fullPath})`);
      }
    });
  });

  // 6. Application Domain Rules
  console.log("Checking application domain rules...");
  // A. One pending application max per (tenant, property)
  const pendingApps = new Set<string>();
  applications.forEach((a) => {
    if (a.status === "Pending") {
      const pair = `${a.tenantId}_${a.propertyId}`;
      if (pendingApps.has(pair)) {
        reportError(`Tenant ${a.tenantId} has multiple pending applications for property ${a.propertyId}`);
      }
      pendingApps.add(pair);
    }
  });

  // B. Non-overlapping leases per tenant
  const tenantLeasesMap = new Map<string, any[]>();
  leases.forEach((l) => {
    const list = tenantLeasesMap.get(l.tenantId) ?? [];
    list.push(l);
    tenantLeasesMap.set(l.tenantId, list);
  });

  tenantLeasesMap.forEach((tenantLeases, tenantId) => {
    for (let i = 0; i < tenantLeases.length; i++) {
      const l1 = tenantLeases[i];
      const start1 = new Date(l1.startDate).getTime();
      const end1 = new Date(l1.endDate).getTime();
      if (start1 >= end1) {
        reportError(`Lease ${l1.id} has startDate >= endDate`);
      }
      for (let j = i + 1; j < tenantLeases.length; j++) {
        const l2 = tenantLeases[j];
        const start2 = new Date(l2.startDate).getTime();
        const end2 = new Date(l2.endDate).getTime();
        // Overlap: start1 <= end2 && end1 >= start2
        if (start1 <= end2 && end1 >= start2) {
          reportError(`Overlapping leases for tenant ${tenantId}: ${l1.id} and ${l2.id}`);
        }
      }
    }
  });

  // C. Review eligibility: reviewer must have a lease with startDate <= NOW on that property
  reviews.forEach((r) => {
    const matchingLease = leases.find(
      (l) => l.tenantId === r.tenantId && l.propertyId === r.propertyId && new Date(l.startDate) <= NOW
    );
    if (!matchingLease) {
      reportError(`Review ${r.id} by tenant ${r.tenantId} on property ${r.propertyId} has no qualifying lease history!`);
    }
    if (r.rating < 1 || r.rating > 5) {
      reportError(`Review ${r.id} has invalid rating: ${r.rating}`);
    }
  });

  // D. Maintenance requests: resident eligibility
  maintenance.forEach((m) => {
    const matchingLease = leases.find(
      (l) => l.tenantId === m.tenantId && l.propertyId === m.propertyId && new Date(l.startDate) <= NOW
    );
    if (!matchingLease) {
      reportError(`Maintenance ${m.id} by tenant ${m.tenantId} on property ${m.propertyId} has no lease history!`);
    }
  });

  console.log("--------------------------------------------------");
  if (errorCount === 0) {
    console.log("✅ ALL CHECKS PASSED: 0 errors found!");
    console.log("   - Foreign keys: 100% valid");
    console.log("   - Enums: 100% valid (schema-matched)");
    console.log("   - Photos: 100% resolve to client/public/");
    console.log("   - Unique constraints: 100% satisfied");
    console.log("   - Domain rules (non-overlap, reviews, statuses): 100% satisfied");
    console.log("==================================================");
  } else {
    console.error(`❌ Verification failed with ${errorCount} errors!`);
    console.log("==================================================");
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("verify-seed-data.ts")) {
  verifySeedData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

