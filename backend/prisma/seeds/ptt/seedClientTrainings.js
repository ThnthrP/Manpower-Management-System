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

async function seedPTTClientTrainings() {
  console.log("🚀 Seeding PTT Client Trainings...");

  const CONTRACT_CODE = "PTT-2025";

  const TRAININGS = [
    // ======================================================
    // PTT
    // ======================================================

    ["HR Orientation"],

    ["Job Description"],

    ["Basic Safety Training"],

    ["Offshore Sea Survival Skills & Emegency / HUET"],

    ["New offshore"],

    ["Refresh Offshore"],

    ["Safety Awareness at PTT"],

    ["Lifting Supervisor"],

    ["Working at Height and Rescue"],

    ["Building Electrical Installation"],

    ["Fitter Training"],

    ["Hydraulic Tool Basics and Safety"],

    ["N-vision Pressure Calibrator Operation Training and Hydro test system"],

    ["Machine and Tool Safety"],

    ["Permit to work System (PTW) for ERP-PRP"],

    ["Harzop CARD System (HOC) ERP & PRP"],

    ["Occupational Safety Officer at Supervisory Level"],

    ["Occupational Safety Officer at Professional Level"],

    ["Painting & Blasting (International/Dimet/Jotun) / Sand Blasting"],

    ["Welding"],

    ["Basic Scaffolding"],

    ["Scaffolding Inspector"],

    ["Crane Operator License (Class A, B+, B, C)"],

    ["Rigging, Slinging & Banksman"],
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

  console.log("✅ Done seeding PTT Client Trainings");
}

seedPTTClientTrainings()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
