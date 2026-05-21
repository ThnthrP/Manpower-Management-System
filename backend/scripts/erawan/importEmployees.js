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
  "../../../training_record_from_hr/Employee Training Offshore-Erawan 31-3-2026-2.xlsx",
);

const SHEET_NAME = "Erawan 26-3-26";

// =========================================================
// Helpers
// =========================================================

function cleanText(value) {
  if (!value) return null;

  return String(value).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function normalizePosition(positionName) {
  if (!positionName) return null;

  let name = cleanText(positionName);

  if (name === "Rigger/Scaffolder") {
    return "Rigger / Scaffolder";
  }

  if (name === "Scaffolding & Painting Foreman") {
    return "Scaffold & Paint Foreman";
  }

  if (name === "Technical Assistant/Project coordinator") {
    return "Technical Assistant / Project Coordinator";
  }

  if (name === "Blaster/Painter") {
    return "Blaster / Painter";
  }

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

async function createEmployee(
  employeeCode,
  fullName,
  positionName,
  companyName,
) {
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
  // Upsert
  // =======================================================

  await prisma.employee.upsert({
    where: {
      empCode: employeeCode,
    },

    update: {
      fullName,
      companyId: company.id,
      positionId: position.id,
    },

    create: {
      empCode: employeeCode,
      fullName,
      companyId: company.id,
      positionId: position.id,
    },
  });

  console.log(`✔ ${employeeCode} | ${fullName}`);
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
      const fullNameRaw = sheet[`D${row}`]?.v;

      const positionRaw = sheet[`E${row}`]?.v;

      const fullName = cleanText(fullNameRaw);

      const positionName = normalizePosition(positionRaw);

      if (!fullName || !positionName) {
        continue;
      }

      const employeeCode = `ERW-${String(runningNumber).padStart(4, "0")}`;

      await createEmployee(employeeCode, fullName, positionName, COMPANY_NAME);

      runningNumber++;
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
