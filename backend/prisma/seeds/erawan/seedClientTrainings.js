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

async function seedErawanClientTrainings() {
  console.log("🚀 Seeding Erawan Client Trainings...");

  const CONTRACT_CODE = "ER-2026";

  const TRAININGS = [
    // ======================================================
    // Erawan
    // ======================================================

    ["Site SSHE Induction"],

    ["Basic Fire Fighting"],

    ["First Aid Basic"],

    ["Basic Safety Observation Card (BBS)"],

    ["Fundamental Risk Assessment & Job Safety Analysis (JSA)"],

    ["Permit to Work (PTW)"],

    ["Waste Management / Additional Mandatory"],

    ["Incident Investigation & Root Cause Analysis"],

    ["High Pressure Gas Cylinder Handling"],

    ["Authorized Gas Tester"],

    ["Arsenic, Benzene, Hydrogen Sulfide & Mercury Awareness"],

    ["Flanged Joint Management"],

    ["Advanced Scaffolding"],

    ["Rigging, Slinging & Banksman"],

    ["Basic Working at Height & Rescue"],

    ["Blaster and Painter"],

    ["Painting Certificate Level 1"],

    ["Painting Certificate Level 2"],

    ["Basic Hazardous Area Classification"],

    ["Advanced Hazardous Area Classification"],

    ["Basic Electrical Safety"],

    ["Machine and Electrical Work Safety"],

    ["Tubing Installation Certification (SWAGELOK & Parker)"],

    ["Tubing Installation Certification (Parker)"],

    ["Pressure Testing"],

    ["ASME IX (Piping)"],

    ["AWS D1.1 (Structure)"],

    ["API 1104 (Pipeline)"],

    ["Welding Inspector"],

    ["Rigging & Slinging by TPTI"],

    ["Safe Lifting Operation Level 1"],

    ["Crane Operator License by PTTEP"],

    ["Basic Offshore Crane Operator"],

    ["Crane Operator (4 roles)"],

    ["Drops Awareness"],

    ["Hand and Power Tool Safety"],

    ["Manual Handling & Lifting"],

    ["Security Awareness"],

    ["SSHE Leadership"],

    ["Fatigue Management"],

    ["Process Safety Awareness"],

    ["Health & Hygiene Inspections"],

    ["Management of Change (MOC) Awareness"],

    ["Chemical Safety Management"],

    ["Oxygen-Fuel Gas Welding & Cutting"],

    ["Explosive & Flammable Chemicals"],

    ["Rope Access Level 1"],

    ["Lockout/Tagout (LOTO)"],

    ["Incident Management & Basic Incident Investigation"],

    ["Confined Space Entry & Breathing Apparatus"],

    ["Radiation Safety Officer Level 1 / G: 16"],

    ["Helicopter Pre-Fight Briefing / G: 23"],

    ["Intensive First Aid / G: 28"],

    ["Load Secure and Safe Latching / G: 31"],

    ["Advance Safety Observation Card / Additional Mandatory"],

    ["Safe Handling of dangerous goods and / Additional Mandatory chemicals"],

    ["Load securing and latching / Additional Mandatory"],

    ["API, ASTM, AWS, ASME"],

    ["API, ASME, AWS"],

    ["API /AWS / ASME"],

    ["WPS"],

    ["Knowledge NDT methods"],

    ["PLC (Programmable Controller)"],

    ["Pneumatic"],

    ["PCN RI - Retest"],

    ["Occupational Safety Officer at Supervisory Level"],

    ["Occupational Safety Officer at Professional Level"],

    ["Basic Scaffolding"],

    ["Scaffolding Inspector"],

    ["Basic Crane Operator (Comply with API RP2D or equivalent)"],

    ["T-BOSIET"],

    ["Fire Watch"],
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

  console.log("✅ Done seeding Erawan Client Trainings");
}

seedErawanClientTrainings()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
