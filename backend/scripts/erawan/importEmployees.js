import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =========================================================
// Config
// =========================================================

const FILE_PATH = path.join(
  __dirname,
  "../../../training_record_from_hr/clean/Employee Training Offshore-Erawan 31-3-2026-CLEAN.xlsx",
);

const SHEET_NAME = "Erawan 26-3-26";

const POSITION_MAPPINGS = {
  "Rigger/Scaffolder": "Rigger / Scaffolder",

  "Scaffolding & Painting Foreman": "Scaffold & Paint Foreman",

  "Technical Assistant/Project coordinator":
    "Technical Assistant / Project Coordinator",

  "Blaster/Painter": "Blaster / Painter",

  'Crane Operator Class "A"': "Crane Operator Class A",
  'Crane Operator Class "B"': "Crane Operator Class B",
};

// =========================================================
// Helpers
// =========================================================

function cleanText(value) {
  if (!value) return null;

  return String(value).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function normalizePosition(positionName) {
  if (!positionName) return null;

  const name = cleanText(positionName);

  // ======================================================
  // Exact Match
  // ======================================================

  if (POSITION_MAPPINGS[name]) {
    return POSITION_MAPPINGS[name];
  }

  // ======================================================
  // Pattern Match
  // ======================================================

  if (name.includes("Firewatch")) {
    return "Fire Watcher";
  }

  if (name.includes("Multi-skill")) {
    return "Multi-skill: Rigger + Scaffolder + Painter + Firewatch Man Assistant";
  }

  return name;
}

// =========================================================
// Create Employee
// =========================================================

async function createEmployee({
  employeeCode,
  fullNameEN,
  fullNameTH,
  positionName,
  companyName,
}) {
  // =======================================================
  // Company
  // =======================================================

  const company = await prisma.company.findFirst({
    where: {
      name: companyName,
    },
  });

  if (!company) {
    throw new Error(`Company not found: ${companyName}`);
  }

  // =======================================================
  // Position
  // =======================================================

  const position = await prisma.position.findFirst({
    where: {
      name: positionName,
    },
  });

  if (!position) {
    throw new Error(`Position not found: ${positionName}`);
  }

  // =======================================================
  // Create Employee
  // =======================================================

  const employee = await prisma.employee.create({
    data: {
      empCode: employeeCode,

      fullName: fullNameTH,

      fullNameTH,
      fullNameEN,

      companyId: company.id,

      positionId: position.id,
    },
  });

  console.log(`✔ Created | ${employee.empCode} | ${fullNameTH}`);

  return employee;
}

// =========================================================
// Main
// =========================================================

async function importEmployees() {
  console.log("🚀 Importing Erawan Employees...");

  const COMPANY_NAME = "EXPERTEAM";

  // =======================================================
  // Workbook
  // =======================================================

  const workbook = xlsx.readFile(FILE_PATH);

  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  // =======================================================
  // Import rows
  // =======================================================

  let runningNumber = 1;

  for (let row = 58; row <= 292; row++) {
    try {
      // const fullNameRaw = sheet[`D${row}`]?.v;
      const fullNameENRaw = sheet[`C${row}`]?.v;

      const fullNameTHRaw = sheet[`D${row}`]?.v;

      const positionRaw = sheet[`E${row}`]?.v;

      const fullNameEN = cleanText(fullNameENRaw);

      const fullNameTH = cleanText(fullNameTHRaw);

      const positionName = normalizePosition(positionRaw);

      if (!fullNameTH || !positionName) {
        continue;
      }

      const employeeCode = `ERW-${String(runningNumber).padStart(4, "0")}`;

      runningNumber++;

      await createEmployee({
        employeeCode,

        fullNameEN,
        fullNameTH,

        positionName,

        companyName: COMPANY_NAME,
      });

    } catch (err) {
      console.error(`❌ Row ${row}: ${err.message}`);
    }
  }

  console.log("✅ Done importing Employees");
}

// =========================================================
// Run
// =========================================================

importEmployees()
  .catch((err) => {
    console.error("💥 Import failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
