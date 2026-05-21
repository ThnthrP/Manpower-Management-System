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

async function seedChevronClientTrainings() {
  console.log("🚀 Seeding Chevron Client Trainings...");

  const CONTRACT_CODE = "CHV-2025";

  const TRAININGS = [
    // ======================================================
    // Chevron
    // ======================================================

    ["Occupational Safety Officer at Supervisory Level"],
    
    ["Occupational Safety Officer at Professional Level"],

    ["Fitting"],

    ["Painting & Blasting (International/Dimet/Jotun) / Sand Blasting"],

    ["Welding"],

    ["Operator Knowledge (C1 level)"],

    ["Basic IE (Pneumatic)"],

    ["Basic Mech (Fitting)"],

    ["Mech for Maintenance"],

    ["IE for Maintenance"],

    ["IE - Swaglog"],

    ["MS Office"],

    ["Electrical Certification by Laws"],

    ["Basic Rigging (include crane signal and slinging techniques)"],

    ["Basic Scaffolding"],

    ["Scaffolding Inspector"],

    ["Basic Crane Operator (Comply with API RP2D or equivalent)"],

    ["T-BOSIET"],

    ["Helideck Crew Member (HCM)"],

    ["Fire Watch"],

    ["Rope Access Lead"],

    ["Rope Access"],

    ["Insulation"],

    ["Marine Support"],

    [
      "Working At Height - Combined Course & Rescue (Use Fall Protection System)",
    ],

    ["Confined Space Entry (by laws)"],

    ["Qualified Gas Tester (QGT)"],

    ["Crane Operator License (Class A, B+, B, C)"],

    ["PLE & CCU Inspection & Certification"],

    ["Advanced First Aid Training"],

    ["Emergency Response Team (ERT)"],

    ["JDE / Ariba / FECON"],

    ["HAZMAT"],

    ["IHE Coordinator"],

    ["Dangerous Goods"],

    ["MSW Process Overview"],

    ["Bypassing Critical Protection (BCP)"],

    ["Confined Space Entry Standard"],

    ["Electrical Standard"],

    ["Hazard Analysis Procedure"],

    ["Hot Work Standard"],

    ["Isolation of Hazardous Energy (IHE)"],

    ["Lifting and Rigging Standard"],

    ["Permit to Work Procedure"],

    ["Working At Height Standard"],

    ["Stop Work Authority Application"],

    ["SIMOPs"],

    ["HazCom"],

    ["Safety Orientation - Incident Reporting, BBS, HazOb, SWC"],
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

  console.log("✅ Done seeding Chevron Client Trainings");
}

seedChevronClientTrainings()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
