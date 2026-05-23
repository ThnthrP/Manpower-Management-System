import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMedicalRequirements() {
  console.log("🚀 Seeding Medical Requirements...");

  // ======================================================
  // Clients
  // ======================================================

  const erawan = await prisma.client.findUnique({
    where: {
      code: "ERAWAN",
    },
  });

  const chevron = await prisma.client.findUnique({
    where: {
      code: "CHEVRON",
    },
  });

  const ptt = await prisma.client.findUnique({
    where: {
      code: "PTT",
    },
  });

  const valeura = await prisma.client.findUnique({
    where: {
      code: "VALEURA",
    },
  });

  // ======================================================
  // Validate
  // ======================================================

  if (!erawan) {
    throw new Error("Client not found: ERAWAN");
  }

  if (!chevron) {
    throw new Error("Client not found: CHEVRON");
  }

  if (!ptt) {
    throw new Error("Client not found: PTT");
  }

  if (!valeura) {
    throw new Error("Client not found: VALEURA");
  }

  // ======================================================
  // Requirements
  // ======================================================

  const REQUIREMENTS = [
    // ====================================================
    // Erawan
    // ====================================================

    {
      clientId: erawan.id,
      name: "Medical Check",
      validityDays: 365,
    },

    {
      clientId: erawan.id,
      name: "Confined Space Entry",
      validityDays: 365,
    },

    // ====================================================
    // Chevron
    // ====================================================

    {
      clientId: chevron.id,
      name: "Medical Check",
      validityDays: 365,
    },

    {
      clientId: chevron.id,
      name: "Confined Space Entry",
      validityDays: 365,
    },

    // ====================================================
    // PTT
    // ====================================================

    {
      clientId: ptt.id,
      name: "Medical Check",
      validityDays: 365,
    },

    {
      clientId: ptt.id,
      name: "Confined Space Entry",
      validityDays: 365,
    },

    // ====================================================
    // Valeura
    // ====================================================

    {
      clientId: valeura.id,
      name: "Medical Check",
      validityDays: 365,
    },

    {
      clientId: valeura.id,
      name: "Confined Space Entry",
      validityDays: 365,
    },
  ];

  // ======================================================
  // Upsert
  // ======================================================

  for (const req of REQUIREMENTS) {
    await prisma.medicalRequirement.upsert({
      where: {
        clientId_name: {
          clientId: req.clientId,
          name: req.name,
        },
      },

      update: {
        validityDays: req.validityDays,
      },

      create: req,
    });

    console.log(`✔ ${req.name} (${req.clientId})`);
  }

  console.log("✅ Done seeding Medical Requirements");
}

seedMedicalRequirements()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
