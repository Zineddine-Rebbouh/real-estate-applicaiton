// Mint manager invite codes out-of-band — no admin UI in this pass.
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function newCode() {
  return `HAB-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function main() {
  const count = Number(process.argv[2] ?? 5);
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    console.error("Usage: tsx prisma/generate-invite-codes.ts [count 1-100]");
    process.exit(1);
  }
  const codes = Array.from({ length: count }, () => newCode());
  await prisma.managerInviteCode.createMany({ data: codes.map((code) => ({ code })) });
  console.log("Minted manager invite codes:");
  for (const code of codes) console.log(`  ${code}`);
}

main()
  .catch((e) => {
    console.error("Failed to mint invite codes:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
