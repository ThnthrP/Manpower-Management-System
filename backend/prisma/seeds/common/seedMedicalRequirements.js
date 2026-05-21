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

  if (!erawan) {
    throw new Error("Client not found: ERAWAN");
  }

  // ======================================================
  // Requirements
  // ======================================================

  const REQUIREMENTS = [
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

    console.log(`✔ ${req.name}`);
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
