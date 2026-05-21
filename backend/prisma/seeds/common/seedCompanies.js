import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCompanies() {
  console.log("🚀 Seeding Companies...");

  const COMPANIES = [
    {
      name: "EXPERTEAM",
      type: "main",
    },

    {
      name: "CES",
      type: "subcontractor",
    },
  ];

  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: {
        name: company.name,
      },

      update: {
        type: company.type,
      },

      create: {
        name: company.name,
        type: company.type,
      },
    });

    console.log(`✔ ${company.name}`);
  }

  console.log("✅ Done seeding Companies");
}

seedCompanies()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
