import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedContracts() {
  console.log("🚀 Seeding Contracts...");

  // =========================================================
  // Clients
  // =========================================================

  const erawan = await prisma.client.findUnique({
    where: { code: "ERAWAN" },
  });

  const chevron = await prisma.client.findUnique({
    where: { code: "CHEVRON" },
  });

  const ptt = await prisma.client.findUnique({
    where: { code: "PTT" },
  });

  const valeura = await prisma.client.findUnique({
    where: { code: "VALEURA" },
  });

  if (!erawan || !chevron || !ptt || !valeura) {
    throw new Error("Some clients not found");
  }

  // =========================================================
  // Contracts
  // =========================================================

  const CONTRACTS = [
    // =========================
    // Erawan
    // =========================
    {
      name: "Erawan Offshore 2026",
      contractNo: "ER-2026",
      clientId: erawan.id,
    },

    // =========================
    // Chevron
    // =========================
    {
      name: "Chevron Matrix 2025",
      contractNo: "CHV-2025",
      clientId: chevron.id,
    },

    // =========================
    // PTT
    // =========================
    {
      name: "PTT Matrix 2025",
      contractNo: "PTT-2025",
      clientId: ptt.id,
    },

    // =========================
    // Valeura
    // =========================
    {
      name: "Valeura Matrix 2024",
      contractNo: "VAL-2024",
      clientId: valeura.id,
    },
  ];

  // =========================================================
  // Upsert
  // =========================================================

  for (const contract of CONTRACTS) {
    await prisma.contract.upsert({
      where: {
        clientId_contractNo: {
          clientId: contract.clientId,
          contractNo: contract.contractNo,
        },
      },

      update: {
        name: contract.name,
      },

      create: {
        ...contract,
        isActive: true,
      },
    });

    console.log(`✔ ${contract.name}`);
  }

  console.log("✅ Done seeding Contracts");
}

seedContracts()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
