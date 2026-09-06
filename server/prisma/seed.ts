import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, "seedData");

function load<T>(fileName: string): T[] {
  return JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8"),
  ) as T[];
}

// ---------------------------------------------------------------------------
// Property insert (plain Prisma API — no special columns)
// ---------------------------------------------------------------------------
async function insertProperty(prop: any) {
  const {
    address,
    city,
    state,
    country,
    postalCode,
    coordinates: _coordinates,
    ...rest
  } = prop;

  await prisma.property.create({
    data: {
      ...rest,
      address,
      city,
      state,
      country,
      postalCode,
    },
  });
}

// ---------------------------------------------------------------------------
// Generic upsert helper for simple models (no special columns)
// ---------------------------------------------------------------------------
async function seedModel(modelKey: string, records: any[]) {
  const model = (prisma as any)[modelKey];
  if (!model) throw new Error(`Prisma model "${modelKey}" not found`);

  let inserted = 0;
  let skipped = 0;
  for (const record of records) {
    try {
      await model.create({ data: record });
      inserted++;
    } catch (err: any) {
      // P2002 = unique constraint violation → record already exists, skip
      if (err?.code === "P2002") {
        skipped++;
      } else {
        console.error(`  Error seeding ${modelKey}:`, err?.message ?? err);
      }
    }
  }
  console.log(`  ${modelKey}: ${inserted} inserted, ${skipped} skipped`);
}

// ---------------------------------------------------------------------------
// Wipe all tables in reverse dependency order
// ---------------------------------------------------------------------------
async function clearAll() {
  console.log("Clearing existing data…");
  await prisma.favorite.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.property.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.user.deleteMany();
  console.log("Done.\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  await clearAll();

  // 1. Users (auth table — must come before profile rows)
  console.log("Seeding users…");
  await seedModel("user", load("user.json"));

  // 2. Manager profiles
  console.log("Seeding managers…");
  await seedModel("manager", load("manager.json"));

  // 3. Tenant profiles
  console.log("Seeding tenants…");
  await seedModel("tenant", load("tenant.json"));

  // 4. Properties
  console.log("Seeding properties…");
  const properties = load<any>("property.json");
  for (const prop of properties) {
    try {
      await insertProperty(prop);
      process.stdout.write(".");
    } catch (err: any) {
      console.error(
        `\n  Error inserting property ${prop.id}:`,
        err?.message ?? err,
      );
    }
  }
  console.log(`\n  property: ${properties.length} inserted`);

  // 5. Leases
  console.log("Seeding leases…");
  await seedModel("lease", load("lease.json"));

  // 6. Applications
  console.log("Seeding applications…");
  await seedModel("application", load("application.json"));

  // 7. Payments
  console.log("Seeding payments…");
  await seedModel("payment", load("payment.json"));

  // 8. Favorites
  console.log("Seeding favorites…");
  await seedModel("favorite", load("favorite.json"));

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
