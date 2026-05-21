import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Helper: create / update TrainingStandard
 */
async function createTrainingStandard(
  trainingName,
  source,
  trainingHours,
  validityDays,
  isNoExpiry,
) {
  const training = await prisma.globalTraining.findFirst({
    where: {
      name: trainingName,
    },
  });

  if (!training) {
    throw new Error(`❌ Training not found: ${trainingName}`);
  }

  const existing = await prisma.trainingStandard.findFirst({
    where: {
      globalTrainingId: training.id,
      source,
    },
  });

  if (existing) {
    return prisma.trainingStandard.update({
      where: {
        id: existing.id,
      },

      data: {
        trainingHours,
        validityDays,
        isNoExpiry,
      },
    });
  }

  return prisma.trainingStandard.create({
    data: {
      globalTrainingId: training.id,
      source,
      trainingHours,
      validityDays,
      isNoExpiry,
    },
  });
}

/**
 * Main Seeder
 */
async function main() {
  console.log("🚀 Seeding TrainingStandard...");

  const MONTH = 30;
  const YEAR = 365;

  const DAY_HOURS = 8;

  const DATA = [
    // ======================================================
    // Chevron
    // ======================================================

    [
      "Occupational Safety Officer at Supervisory Level",
      "CONTRACTOR",
      2 * DAY_HOURS,
      null,
      true,
    ],
    [
      "Occupational Safety Officer at Professional Level",
      "CONTRACTOR",
      null,
      null,
      true,
    ],
    ["Fitting", null, 2 * DAY_HOURS, null, true],
    [
      "Painting & Blasting (International/Dimet/Jotun) / Sand Blasting",
      null,
      2 * DAY_HOURS,
      2 * YEAR,
      false,
    ],
    ["Welding", null, 2 * DAY_HOURS, 3 * YEAR, false],
    ["Operator Knowledge (C1 level)", null, null, null, true],
    ["Basic IE (Pneumatic)", null, null, null, true],
    ["Basic Mech (Fitting)", null, null, null, true],
    ["Mech for Maintenance", null, null, null, true],
    ["IE for Maintenance", null, null, null, true],
    ["IE - Swaglog", null, null, null, true],
    ["MS Office", null, null, null, true],
    ["Electrical Certification by Laws", null, null, null, true],
    [
      "Basic Rigging (include crane signal and slinging techniques)",
      null,
      null,
      null,
      true,
    ],
    ["Basic Scaffolding", "TPTI", 5 * DAY_HOURS, 3 * YEAR, false],
    ["Scaffolding Inspector", "TPTI", 3 * DAY_HOURS, 3 * YEAR, false],
    [
      "Basic Crane Operator (Comply with API RP2D or equivalent)",
      null,
      null,
      null,
      true,
    ],
    ["T-BOSIET", "TPTI", null, 4 * YEAR, false],
    ["Helideck Crew Member (HCM)", null, null, null, true],
    ["Fire Watch", "TPTI", 1 * DAY_HOURS, 3 * YEAR, false],
    ["Rope Access Lead", null, null, null, true],
    ["Rope Access", null, null, null, true],
    ["Insulation", null, null, null, true],
    ["Marine Support", null, null, null, true],
    [
      "Working At Height - Combined Course & Rescue (Use Fall Protection System)",
      null,
      null,
      null,
      true,
    ],
    ["Confined Space Entry (by laws)", null, null, null, true],
    ["Qualified Gas Tester (QGT)", null, null, null, true],
    [
      "Crane Operator License (Class A, B+, B, C)",
      null,
      1 * DAY_HOURS,
      4 * YEAR,
      false,
    ],
    ["PLE & CCU Inspection & Certification", null, null, null, true],
    ["Advanced First Aid Training", null, null, null, true],
    ["Emergency Response Team (ERT)", null, null, null, true],
    ["JDE / Ariba / FECON", null, null, null, true],
    ["HAZMAT", null, null, null, true],
    ["IHE Coordinator", null, null, null, true],
    ["Dangerous Goods", null, null, null, true],
    ["MSW Process Overview", null, null, null, true],
    ["Bypassing Critical Protection (BCP)", null, null, null, true],
    ["Confined Space Entry Standard", null, null, null, true],
    ["Electrical Standard", null, null, null, true],
    ["Hazard Analysis Procedure", null, null, null, true],
    ["Hot Work Standard", null, null, null, true],
    ["Isolation of Hazardous Energy (IHE)", null, null, null, true],
    ["Lifting and Rigging Standard", null, null, null, true],
    ["Permit to Work Procedure", null, null, null, true],
    ["Working At Height Standard", null, null, null, true],
    ["Stop Work Authority Application", null, null, null, true],
    ["SIMOPs", null, null, null, true],
    ["HazCom", null, null, null, true],
    [
      "Safety Orientation - Incident Reporting, BBS, HazOb, SWC",
      null,
      null,
      null,
      true,
    ],

    // ======================================================
    // Erawan
    // ======================================================

    ["Site SSHE Induction", "COMPANY_ELEARNING", null, null, true],
    ["Basic Fire Fighting", "CONTRACTOR", null, null, true],
    ["First Aid Basic", "CONTRACTOR", null, null, true],
    [
      "Basic Safety Observation Card (BBS)",
      "COMPANY_ELEARNING",
      null,
      null,
      true,
    ],
    [
      "Fundamental Risk Assessment & Job Safety Analysis (JSA)",
      "COMPANY_ELEARNING",
      null,
      null,
      true,
    ],
    ["Permit to Work (PTW)", "COMPANY_ELEARNING", null, 5 * YEAR, false],
    [
      "Waste Management / Additional Mandatory",
      "COMPANY_ELEARNING",
      null,
      null,
      true,
    ],
    [
      "Incident Investigation & Root Cause Analysis",
      "CONTRACTOR",
      null,
      5 * YEAR,
      false,
    ],
    ["Chemical Safety Management", "COMPANY_ELEARNING", null, null, true],
    ["High Pressure Gas Cylinder Handling", "CONTRACTOR", null, null, true],
    ["Authorized Gas Tester", "COMPANY_ELEARNING", null, 3 * YEAR, false],
    [
      "Arsenic, Benzene, Hydrogen Sulfide & Mercury Awareness",
      "COMPANY_ELEARNING",
      null,
      5 * YEAR,
      false,
    ],
    ["Flanged Joint Management", "TPTI", null, 3 * YEAR, false],
    ["Advanced Scaffolding", "TPTI", null, 4 * YEAR, false],
    ["Rigging, Slinging & Banksman", "TPTI", 2 * DAY_HOURS, 2 * YEAR, false],
    ["Basic Working at Height & Rescue", "TPTI", null, 3 * YEAR, false],
    ["Blaster and Painter", "CONTRACTOR", null, 1 * YEAR, false],
    ["Painting Certificate Level 1", "CONTRACTOR", null, 4 * YEAR, false],
    ["Painting Certificate Level 2", "CONTRACTOR", null, 5 * YEAR, false],
    ["Basic Hazardous Area Classification", "CONTRACTOR", null, null, true],
    [
      "Advanced Hazardous Area Classification",
      "COMPANY_ELEARNING",
      null,
      5 * YEAR,
      false,
    ],
    ["Basic Electrical Safety", "CONTRACTOR", null, 5 * YEAR, false],
    ["Machine and Electrical Work Safety", "CONTRACTOR", null, 3 * YEAR, false],
    [
      "Tubing Installation Certification (SWAGELOK & Parker)",
      "CONTRACTOR",
      null,
      5 * YEAR,
      false,
    ],
    [
      "Tubing Installation Certification (Parker)",
      "CONTRACTOR",
      null,
      5 * YEAR,
      false,
    ],
    ["Pressure Testing", "CONTRACTOR", null, 5 * YEAR, false],
    ["ASME IX (Piping)", "CONTRACTOR", null, 5 * YEAR, false],
    ["AWS D1.1 (Structure)", "CONTRACTOR", null, 5 * YEAR, false],
    ["API 1104 (Pipeline)", "CONTRACTOR", null, 5 * YEAR, false],
    ["Welding Inspector", "CONTRACTOR", null, 5 * YEAR, false],
    ["Rigging & Slinging by TPTI", "TPTI", null, 5 * YEAR, false],
    [
      "Safe Lifting Operation Level 1",
      "COMPANY_ELEARNING",
      null,
      5 * YEAR,
      false,
    ],
    ["Crane Operator License by PTTEP", "TPTI", null, 2 * YEAR, false],
    ["Basic Offshore Crane Operator", "TPTI", null, 3 * YEAR, false],
    ["Crane Operator (4 roles)", "CONTRACTOR", null, 2 * YEAR, false],
    ["Drops Awareness", "COMPANY_ELEARNING", null, null, true],
    ["Hand and Power Tool Safety", "COMPANY_ELEARNING", null, null, true],
    ["Manual Handling & Lifting", "COMPANY_ELEARNING", null, null, true],
    ["Security Awareness", "COMPANY_ELEARNING", null, 5 * YEAR, false],
    ["SSHE Leadership", "COMPANY_ELEARNING", null, null, true],
    ["Fatigue Management", "CONTRACTOR", null, 6 * MONTH, false],
    ["Process Safety Awareness", "COMPANY_ELEARNING", null, null, true],
    ["Health & Hygiene Inspections", "COMPANY_ELEARNING", null, null, true],
    [
      "Management of Change (MOC) Awareness",
      "COMPANY_ELEARNING",
      null,
      null,
      true,
    ],
    ["Chemical Safety Management", "COMPANY_ELEARNING", null, null, true],
    [
      "Oxygen-Fuel Gas Welding & Cutting",
      "COMPANY_ELEARNING",
      null,
      5 * YEAR,
      false,
    ],
    ["Explosive & Flammable Chemicals", "COMPANY_ELEARNING", null, null, true],
    ["Rope Access Level 1", "CONTRACTOR", null, 5 * YEAR, false],
    ["Lockout/Tagout (LOTO)", "COMPANY_ELEARNING", null, null, true],
    [
      "Incident Management & Basic Incident Investigation",
      "COMPANY_ELEARNING",
      null,
      null,
      true,
    ],
    [
      "Confined Space Entry & Breathing Apparatus",
      "CONTRACTOR",
      null,
      5 * YEAR,
      false,
    ],
    [
      "Radiation Safety Officer Level 1 / G: 16",
      "CONTRACTOR",
      null,
      null,
      true,
    ],
    ["Helicopter Pre-Fight Briefing / G: 23", "CONTRACTOR", null, null, true],
    ["Intensive First Aid / G: 28", "CONTRACTOR", null, 3 * YEAR, false],
    [
      "Load Secure and Safe Latching / G: 31",
      "CONTRACTOR",
      null,
      3 * YEAR,
      false,
    ],
    [
      "Advance Safety Observation Card / Additional Mandatory",
      "CONTRACTOR",
      null,
      null,
      true,
    ],
    [
      "Safe Handling of dangerous goods and / Additional Mandatory chemicals",
      "CONTRACTOR",
      null,
      2 * YEAR,
      false,
    ],
    [
      "Load securing and latching / Additional Mandatory",
      "CONTRACTOR",
      null,
      null,
      true,
    ],
    ["API, ASTM, AWS, ASME", "CONTRACTOR", null, 3 * YEAR, false],
    ["API, ASME, AWS", "CONTRACTOR", null, 3 * YEAR, false],
    ["API /AWS / ASME", "CONTRACTOR", null, 3 * YEAR, false],
    ["WPS", "CONTRACTOR", null, 3 * YEAR, false],
    ["Knowledge NDT methods", "CONTRACTOR", null, 5 * YEAR, false],
    ["PLC (Programmable Controller)", "CONTRACTOR", null, 3 * YEAR, false],
    ["Pneumatic", "CONTRACTOR", null, 3 * YEAR, false],
    ["PCN RI - Retest", "CONTRACTOR", null, 4 * YEAR, false],

    // ======================================================
    // PTT
    // ======================================================

    ["HR Orientation", "COMPANY_ELEARNING", 6, null, true],
    ["Job Description", "COMPANY_ELEARNING", 0.5, null, true],
    ["Basic Safety Training", "COMPANY_ELEARNING", 6, null, true],
    [
      "Offshore Sea Survival Skills & Emegency / HUET",
      "TPTI",
      3 * DAY_HOURS,
      4 * YEAR,
      false,
    ],
    ["New offshore", "COMPANY_ELEARNING", 6, 6 * MONTH, false],
    ["Refresh Offshore", "COMPANY_ELEARNING", 4, 6 * MONTH, false],
    ["Safety Awareness at PTT", "COMPANY_ELEARNING", 2, 28, false],
    ["Lifting Supervisor", "COMPANY_ELEARNING", 2 * DAY_HOURS, 2 * YEAR, false],
    ["Working at Height and Rescue", null, 3 * DAY_HOURS, 3 * YEAR, false],
    ["Building Electrical Installation", null, 4 * DAY_HOURS, 5 * YEAR, false],
    ["Fitter Training", null, 3 * DAY_HOURS, 3 * YEAR, false],
    ["Hydraulic Tool Basics and Safety", null, 1 * DAY_HOURS, null, true],
    [
      "N-vision Pressure Calibrator Operation Training and Hydro test system",
      null,
      1 * DAY_HOURS,
      null,
      true,
    ],
    ["Machine and Tool Safety", null, 1 * DAY_HOURS, null, true],
    [
      "Permit to work System (PTW) for ERP-PRP",
      null,
      1 * DAY_HOURS,
      null,
      true,
    ],
    ["Harzop CARD System (HOC) ERP & PRP", null, 1 * DAY_HOURS, null, true],

    // ======================================================
    // Valeura
    // ======================================================

    ["Safety Awareness at Mubadala", "COMPANY_ELEARNING", 2, null, true],
    ["Fire watcher Awareness", "COMPANY_ELEARNING", 4, null, true],
    ["HSSE requirement for contractor", "COMPANY_ELEARNING", null, null, true],
  ];

  for (const [name, source, trainingHours, validityDays, isNoExpiry] of DATA) {
    try {
      await createTrainingStandard(
        name,
        source,
        trainingHours,
        validityDays,
        isNoExpiry,
      );

      console.log(`✔ ${name} (${source})`);
    } catch (err) {
      console.error(`❌ ${name}:`, err.message);
    }
  }

  console.log("✅ Done TrainingStandard");
}

/**
 * Run
 */
main()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
