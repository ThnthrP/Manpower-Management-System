import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedClients() {
  console.log("🚀 Seeding Clients...");

  const CLIENTS = [
    {
      name: "Chevron",
      code: "CHEVRON",
    },
    {
      name: "Erawan",
      code: "ERAWAN",
    },
    {
      name: "PTT",
      code: "PTT",
    },
    {
      name: "Valeura",
      code: "VALEURA",
    },
  ];

  for (const client of CLIENTS) {
    await prisma.client.upsert({
      where: {
        code: client.code,
      },
      update: {
        name: client.name,
      },
      create: {
        name: client.name,
        code: client.code,
      },
    });

    console.log(`✔ ${client.name}`);
  }

  console.log("✅ Done seeding Clients");
}

seedClients()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
