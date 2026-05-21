import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createClientTraining(
  contractCode,
  trainingName,
  completionPeriodCode = null,
  nameAlias = null,
) {
  // ======================================================
  // Contract
  // ======================================================

  const contract = await prisma.contract.findFirst({
    where: {
      contractNo: contractCode,
    },
  });

  if (!contract) {
    throw new Error(`❌ Contract not found: ${contractCode}`);
  }

  // ======================================================
  // Global Training
  // ======================================================

  const globalTraining = await prisma.globalTraining.findFirst({
    where: {
      name: trainingName,
    },
  });

  if (!globalTraining) {
    throw new Error(`❌ Global training not found: ${trainingName}`);
  }

  // ======================================================
  // Training Standard
  // ======================================================

  const trainingStandard = await prisma.trainingStandard.findFirst({
    where: {
      globalTrainingId: globalTraining.id,
    },
  });

  if (!trainingStandard) {
    throw new Error(`❌ Training standard not found: ${trainingName}`);
  }

  // ======================================================
  // Upsert
  // ======================================================

  await prisma.clientTraining.upsert({
    where: {
      globalTrainingId_contractId: {
        globalTrainingId: globalTraining.id,
        contractId: contract.id,
      },
    },

    update: {
      completionPeriodCode,
      nameAlias,
      trainingStandardId: trainingStandard.id,
    },

    create: {
      globalTrainingId: globalTraining.id,
      contractId: contract.id,

      completionPeriodCode,
      nameAlias,

      trainingStandardId: trainingStandard.id,
    },
  });

  console.log(`✔ ${trainingName}`);
}

async function seedValeuraClientTrainings() {
  console.log("🚀 Seeding Valeura Client Trainings...");

  const CONTRACT_CODE = "VAL-2024";

  const TRAININGS = [
    // ======================================================
    // Valeura
    // ======================================================

    ["Occupational Safety Officer at Supervisory Level"],

    ["Occupational Safety Officer at Professional Level"],

    ["Fitting"],

    ["Painting & Blasting (International/Dimet/Jotun) / Sand Blasting"],

    ["Welding"],

    ["Basic Scaffolding"],

    ["Scaffolding Inspector"],

    ["Fire Watch"],

    ["Crane Operator License (Class A, B+, B, C)"],

    ["Rigging, Slinging & Banksman"],

    ["Tubing Installation Certification (SWAGELOK & Parker)"],

    ["HR Orientation"],

    ["Job Description"],

    ["Offshore Sea Survival Skills & Emegency / HUET"],

    ["New offshore"],

    ["Refresh Offshore"],

    ["Working at Height and Rescue"],

    ["Building Electrical Installation"],

    ["Safety Awareness at Mubadala"],

    ["Fire watcher Awareness"],

    ["HSSE requirement for contractor"],
  ];

  for (const [trainingName, completionPeriodCode, nameAlias] of TRAININGS) {
    try {
      await createClientTraining(
        CONTRACT_CODE,
        trainingName,
        completionPeriodCode,
        nameAlias,
      );
    } catch (err) {
      console.error(`❌ ${trainingName}: ${err.message}`);
    }
  }

  console.log("✅ Done seeding Valeura Client Trainings");
}

seedValeuraClientTrainings()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
