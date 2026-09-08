import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Querying database table row counts...\n");

  const [
    users,
    managers,
    tenants,
    properties,
    leases,
    applications,
    payments,
    favorites,
    reviews,
    inviteCodes,
    paymentMethods,
    maintenance,
    tours,
    messages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.manager.count(),
    prisma.tenant.count(),
    prisma.property.count(),
    prisma.lease.count(),
    prisma.application.count(),
    prisma.payment.count(),
    prisma.favorite.count(),
    prisma.review.count(),
    prisma.managerInviteCode.count(),
    prisma.paymentMethod.count(),
    prisma.maintenanceRequest.count(),
    prisma.tourRequest.count(),
    prisma.contactMessage.count(),
  ]);

  const counts = {
    "User": users,
    "Manager": managers,
    "Tenant": tenants,
    "Property": properties,
    "Lease": leases,
    "Application": applications,
    "Payment": payments,
    "Favorite": favorites,
    "Review": reviews,
    "ManagerInviteCode": inviteCodes,
    "PaymentMethod": paymentMethods,
    "MaintenanceRequest": maintenance,
    "TourRequest": tours,
    "ContactMessage": messages,
  };

  console.table(counts);

  // Quick sanity check on auth: verify bcrypt compare against Habitat2026!
  const bcrypt = await import("bcrypt");
  const testUser = await prisma.user.findFirst();
  if (testUser) {
    const passwordMatch = await bcrypt.compare("Habitat2026!", testUser.passwordHash);
    console.log(`\nPassword verification for test user (${testUser.email}): ${passwordMatch ? "PASS" : "FAIL"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

