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
  "../../../training_record_from_hr/Employee Training Offshore-Chevron 31-3-2026.xlsx",
);

const SHEET_NAME = "Record";

// =========================================================
// Helpers
// =========================================================

function cleanText(value) {
  if (!value) return null;

  return String(value).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeName(name) {
  if (!name) return null;

  return cleanText(name)?.replace(/\s+/g, " ")?.trim();
}

function normalizePosition(positionName) {
  if (!positionName) return null;

  let name = cleanText(positionName);

  // =======================================================
  // Normalize spacing
  // =======================================================

  if (name === "Rigger/Scaffolder") {
    return "Rigger / Scaffolder";
  }

  if (name === "CPP Crane Assistant / Rigger/Scaffolder") {
    return "CPP Crane Assistant / Rigger / Scaffolder";
  }

  if (name === "Construction Utility Foreman (Painter/Scaffolder)") {
    return "Construction Utility Foreman (Painter / Scaffolder)";
  }

  if (name === "Rigger/Scaffolder + Rope Access Lead level") {
    return "Rigger / Scaffolder + Rope Access Lead Level";
  }

  if (name === "Rigger/Scaffolder + Rope Access Technician level") {
    return "Rigger / Scaffolder + Rope Access Technician Level";
  }

  if (name === "Rigger/Scaffolder (Skill Mechanic)") {
    return "Rigger / Scaffolder (Skill Mechanic)";
  }

  return name;
}

function isEmployeeRow(fullNameEN, positionName) {
  if (!fullNameEN || !positionName) {
    return false;
  }

  if (typeof fullNameEN !== "string") {
    return false;
  }

  const name = fullNameEN.trim();

  if (!name) {
    return false;
  }

  return true;
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
  // Upsert
  // =======================================================

  await prisma.employee.upsert({
    where: {
      empCode: employeeCode,
    },

    update: {
      fullName: fullNameEN,
      fullNameTH,
      companyId: company.id,
      positionId: position.id,
    },

    create: {
      empCode: employeeCode,
      fullName: fullNameEN,
      fullNameTH,
      companyId: company.id,
      positionId: position.id,
    },
  });

  console.log(`✔ ${employeeCode} | ${fullNameEN}`);
}

// =========================================================
// Main
// =========================================================

async function importEmployees() {
  console.log("🚀 Importing Chevron Employees...");

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

  for (let row = 8; row <= 1000; row++) {
    try {
      // ===================================================
      // Columns
      // ===================================================

      const fullNameENRaw = sheet[`C${row}`]?.v;

      const fullNameTHRaw = sheet[`D${row}`]?.v;

      const positionRaw = sheet[`E${row}`]?.v;

      // ===================================================
      // Clean
      // ===================================================

      const fullNameEN = normalizeName(fullNameENRaw);

      const fullNameTH = normalizeName(fullNameTHRaw);

      const positionName = normalizePosition(positionRaw);

      // ===================================================
      // Skip invalid rows
      // ===================================================

      if (!isEmployeeRow(fullNameEN, positionName)) {
        continue;
      }

      // ===================================================
      // Employee Code
      // ===================================================

      const employeeCode = `CHV-${String(runningNumber).padStart(4, "0")}`;

      // ===================================================
      // Create
      // ===================================================

      await createEmployee({
        employeeCode,
        fullNameEN,
        fullNameTH,
        positionName,
        companyName: COMPANY_NAME,
      });

      runningNumber++;
    } catch (err) {
      console.error(`❌ Row ${row}: ${err.message}`);
    }
  }

  console.log("✅ Done importing Chevron Employees");
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
