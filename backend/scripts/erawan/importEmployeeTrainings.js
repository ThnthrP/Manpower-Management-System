import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Config
// ============================================================

const FILE_PATH = path.join(
  __dirname,
  "../../../training_record_from_hr/Employee Training Offshore-Erawan 31-3-2026.xlsx",
);

const TRAINING_MAPPING_FILE = path.join(
  __dirname,
  "../../../training_record_from_hr/importErawan.xlsx",
);

const CLIENT_NAME = "Erawan";

const SHEET_NAME = "Erawan 26-3-26";

const COMPANY_NAME = "EXPERTEAM";

// ============================================================
// Excel Structure
// ============================================================

const COL = {
  FULL_NAME_EN: 2,
  FULL_NAME_TH: 3,
  POSITION: 4,

  MEDICAL_HOSP: 6,
  MEDICAL_ISSUE: 7,
  MEDICAL_EXP: 8,
  MEDICAL_OK: 9,
  MEDICAL_CONFINED_SPACE: 10,

  TRAINING_START: 14, // O
  TRAINING_END: 69, // BR
};

const ROW = {
  TRAINING_HEADER: 2, // row 3

  EMPLOYEE_START: 57, // row 58
  EMPLOYEE_END: 291, // row 292
};

// ============================================================
// Constants
// ============================================================

const SKIP_VALUES = new Set(["N/A", "n/a", null, undefined]);

const NO_EXPIRY_YEAR = 2099;

// ============================================================
// Helpers
// ============================================================

function cleanText(value) {
  if (!value) return null;

  return String(value).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

// ============================================================
// Training Mapping
// ============================================================

function buildTrainingMap(sheet) {
  const map = new Map();

  for (let row = 2; row <= 500; row++) {
    const globalTrainingRaw = sheet[`A${row}`]?.v;

    const excelTrainingRaw = sheet[`B${row}`]?.v;

    const globalTraining = cleanText(globalTrainingRaw);

    const excelTraining = cleanText(excelTrainingRaw);

    if (!globalTraining || !excelTraining) {
      continue;
    }

    map.set(excelTraining, globalTraining);
  }

  return map;
}

function normalizeTrainingName(text) {
  if (!text) return "";

  return cleanText(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\/g:\s*\d+/gi, "")
    .replace(/\(including.*?\)/gi, "")
    .replace(/additional mandatory/gi, "")
    .replace(/[()]/g, "")
    .replace(/\//g, " ")
    .replace(/&/g, "and")
    .replace(/-/g, " ")
    .replace(/,/g, " ")
    .replace(/\(\d+\s*คะแนน\)/gi, "")
    .replace(/\/g\.\d+/gi, "")
    .replace(/\(\d+\s*คะแนน\)/gi, "")
    .trim();
}

function mapTrainingName(excelName, trainingMap) {
  if (!excelName) {
    return null;
  }

  const normalizedExcel = normalizeTrainingName(excelName);

  // ======================================================
  // Special Cases
  // ======================================================

  if (normalizedExcel.includes("rigging slinging")) {
    return "Rigging, Slinging & Banksman";
  }

  // ======================================================
  // Normal Matching
  // ======================================================

  for (const [excelTraining, globalTraining] of trainingMap.entries()) {
    const normalizedMap = normalizeTrainingName(excelTraining);

    if (
      normalizedExcel.includes(normalizedMap) ||
      normalizedMap.includes(normalizedExcel)
    ) {
      return globalTraining;
    }
  }

  return null;
}

// ============================================================
// Date Helpers
// ============================================================

function parseDate(val) {
  if (!val) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) {
      return null;
    }

    return val;
  }

  if (typeof val === "number") {
    const excelEpoch = new Date(1899, 11, 30);

    return new Date(excelEpoch.getTime() + val * 86400000);
  }

  if (typeof val === "string") {
    if (val.startsWith("=")) {
      return null;
    }

    const parts = val.split("/");

    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);

      return new Date(y, m - 1, d);
    }

    const parsed = new Date(val);

    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function getTrainingStatus(val) {
  if (!val || SKIP_VALUES.has(val)) {
    return null;
  }

  if (typeof val === "string") {
    const lower = val.toLowerCase();

    if (lower === "if required") {
      return "if_required";
    }

    if (val.startsWith("=")) {
      return null;
    }
  }

  const date = parseDate(val);

  if (!date) {
    return null;
  }

  if (date.getFullYear() >= NO_EXPIRY_YEAR) {
    return "completed";
  }

  const now = new Date();

  if (date < now) {
    return "overdue";
  }

  const soon = new Date();

  soon.setDate(soon.getDate() + 90);

  if (date < soon) {
    return "due_soon";
  }

  return "completed";
}

function isEmployeeRow(row) {
  const name = row[COL.FULL_NAME_TH];

  if (!name || typeof name !== "string") {
    return false;
  }

  if (name.startsWith("=")) {
    return false;
  }

  return name.trim().includes(" ");
}

// ============================================================
// Main
// ============================================================

async function importEmployeeTrainings() {
  console.log("🚀 Importing Employee Trainings...");

  // ==========================================================
  // Read Employee Workbook
  // ==========================================================

  const workbook = xlsx.readFile(FILE_PATH, {
    cellDates: true,
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  // ==========================================================
  // Read Training Mapping Workbook
  // ==========================================================

  const mappingWorkbook = xlsx.readFile(TRAINING_MAPPING_FILE);

  const mappingSheet = mappingWorkbook.Sheets[mappingWorkbook.SheetNames[0]];

  const TRAINING_NAME_MAP = buildTrainingMap(mappingSheet);

  console.log(`📚 Training mappings loaded: ${TRAINING_NAME_MAP.size}`);

  // ==========================================================
  // Client
  // ==========================================================

  const client = await prisma.client.findFirst({
    where: {
      name: CLIENT_NAME,
    },
  });

  if (!client) {
    throw new Error(`Client not found: ${CLIENT_NAME}`);
  }

  // ==========================================================
  // Contract
  // ==========================================================

  const contract = await prisma.contract.findFirst({
    where: {
      clientId: client.id,
      isActive: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (!contract) {
    throw new Error(`Contract not found: ${CLIENT_NAME}`);
  }

  // ==========================================================
  // Company
  // ==========================================================

  const company = await prisma.company.findFirst({
    where: {
      name: COMPANY_NAME,
    },
  });

  if (!company) {
    throw new Error(`Company not found: ${COMPANY_NAME}`);
  }

  // ==========================================================
  // Preload Global Trainings
  // ==========================================================

  const globalTrainings = await prisma.globalTraining.findMany();

  const globalTrainingMap = {};

  for (const gt of globalTrainings) {
    globalTrainingMap[gt.name] = gt;
  }

  // ==========================================================
  // Preload Client Trainings
  // ==========================================================

  const clientTrainings = await prisma.clientTraining.findMany({
    where: {
      contractId: contract.id,
    },

    include: {
      globalTraining: true,
    },
  });

  const clientTrainingMap = {};

  for (const ct of clientTrainings) {
    clientTrainingMap[ct.globalTraining.name] = ct;
  }

  // ==========================================================
  // Build Training Column Map
  // ==========================================================

  const headerRow = rows[ROW.TRAINING_HEADER];

  const trainingColumnMap = {};

  for (let col = COL.TRAINING_START; col <= COL.TRAINING_END; col++) {
    const excelTrainingName = headerRow[col];

    if (!excelTrainingName) {
      continue;
    }

    const canonicalName = mapTrainingName(excelTrainingName, TRAINING_NAME_MAP);

    trainingColumnMap[col] = {
      excelTrainingName,
      canonicalName,
    };
  }

  // ==========================================================
  // Import Employee Trainings
  // ==========================================================

  let inserted = 0;

  let skipped = 0;

  for (
    let rowIndex = ROW.EMPLOYEE_START;
    rowIndex <= ROW.EMPLOYEE_END;
    rowIndex++
  ) {
    try {
      const row = rows[rowIndex];

      if (!isEmployeeRow(row)) {
        continue;
      }

      const fullName = row[COL.FULL_NAME_TH]?.trim();

      const employee = await prisma.employee.findFirst({
        where: {
          fullName,
          companyId: company.id,
        },
      });

      if (!employee) {
        console.log(`⚠ Employee not found: ${fullName}`);

        skipped++;

        continue;
      }

      console.log(`\n👤 ${fullName}`);

      // ======================================================
      // Medical Check
      // ======================================================

      try {
        const medicalHospital = cleanText(row[COL.MEDICAL_HOSP]);

        const medicalIssuedDate = parseDate(row[COL.MEDICAL_ISSUE]);

        const medicalExpiryDate = parseDate(row[COL.MEDICAL_EXP]);

        const medicalStatusRaw = cleanText(row[COL.MEDICAL_OK]);

        const confinedSpaceRaw = cleanText(row[COL.MEDICAL_CONFINED_SPACE]);

        const medicalRequirement = await prisma.medicalRequirement.findFirst({
          where: {
            clientId: client.id,
            name: {
              contains: "Medical Check",
            },
          },
        });

        const confinedSpaceRequirement =
          await prisma.medicalRequirement.findFirst({
            where: {
              clientId: client.id,
              name: {
                contains: "Confined Space",
              },
            },
          });

        // ====================================================
        // Main Medical Checkup
        // ====================================================

        const remindDays = 30;

        const remindDate = medicalExpiryDate
          ? new Date(
              medicalExpiryDate.getTime() - remindDays * 24 * 60 * 60 * 1000,
            )
          : null;

        if (medicalIssuedDate) {
          await prisma.medicalCheck.upsert({
            where: {
              employeeId_checkType_medicalRequirementId: {
                employeeId: employee.id,

                checkType: "Medical Checkup",

                medicalRequirementId: medicalRequirement?.id || null,
              },
            },

            update: {
              hospital: medicalHospital,

              issuedDate: medicalIssuedDate,

              expiryDate: medicalExpiryDate,

              remindDate,
              remindDays,

              status:
                medicalStatusRaw?.toLowerCase() === "yes"
                  ? medicalExpiryDate && medicalExpiryDate < new Date()
                    ? "overdue"
                    : "passed"
                  : "failed",
            },

            create: {
              employeeId: employee.id,

              medicalRequirementId: medicalRequirement?.id || null,

              checkType: "Medical Checkup",

              hospital: medicalHospital,

              issuedDate: medicalIssuedDate,

              expiryDate: medicalExpiryDate,

              remindDate,
              remindDays,

              status:
                medicalStatusRaw?.toLowerCase() === "yes"
                  ? medicalExpiryDate && medicalExpiryDate < new Date()
                    ? "overdue"
                    : "passed"
                  : "failed",
            },
          });

          console.log(`   💉 Medical Checkup`);
        }

        // ====================================================
        // Confined Space
        // ====================================================

        if (
          confinedSpaceRaw &&
          confinedSpaceRaw.toLowerCase().includes("yes")
        ) {
          await prisma.medicalCheck.upsert({
            where: {
              employeeId_checkType_medicalRequirementId: {
                employeeId: employee.id,

                checkType: "Confined Space Entry",

                medicalRequirementId: confinedSpaceRequirement?.id || null,
              },
            },

            update: {
              issuedDate: medicalIssuedDate,

              expiryDate: medicalExpiryDate,

              remindDate,
              remindDays,

              status:
                medicalExpiryDate && medicalExpiryDate < new Date()
                  ? "overdue"
                  : "passed",
            },

            create: {
              employeeId: employee.id,

              medicalRequirementId: confinedSpaceRequirement?.id || null,

              checkType: "Confined Space Entry",

              issuedDate: medicalIssuedDate,

              expiryDate: medicalExpiryDate,

              remindDate,
              remindDays,

              status:
                medicalExpiryDate && medicalExpiryDate < new Date()
                  ? "overdue"
                  : "passed",
            },
          });

          console.log(`   💉 Confined Space`);
        }
      } catch (err) {
        console.log(`❌ Medical Error: ${err.message}`);
      }

      // ======================================================
      // Loop Training Columns
      // ======================================================

      for (const [colIndex, trainingInfo] of Object.entries(
        trainingColumnMap,
      )) {
        try {
          const cellValue = row[parseInt(colIndex)];

          if (cellValue === null || cellValue === undefined) {
            continue;
          }

          const status = getTrainingStatus(cellValue);

          if (!status) {
            continue;
          }

          const canonicalName = trainingInfo.canonicalName;

          if (!canonicalName) {
            console.log(`⚠ No mapping: "${trainingInfo.excelTrainingName}"`);

            continue;
          }

          const globalTraining = globalTrainingMap[canonicalName];

          if (!globalTraining) {
            console.log(`⚠ Global training not found: ${canonicalName}`);

            continue;
          }

          const clientTraining = clientTrainingMap[canonicalName];

          const expiryDate =
            status === "if_required"
              ? null
              : (() => {
                  const parsed = parseDate(cellValue);

                  if (parsed && parsed.getFullYear() >= NO_EXPIRY_YEAR) {
                    return null;
                  }

                  return parsed;
                })();

          // ==================================================
          // Existing Latest
          // ==================================================

          const existing = await prisma.employeeTraining.findFirst({
            where: {
              employeeId: employee.id,

              globalTrainingId: globalTraining.id,

              contractId: contract.id,

              isLatest: true,
            },
          });

          if (existing) {
            await prisma.employeeTraining.update({
              where: {
                id: existing.id,
              },

              data: {
                isLatest: false,
              },
            });

            await prisma.employeeTraining.create({
              data: {
                employeeId: employee.id,

                globalTrainingId: globalTraining.id,

                clientTrainingId: clientTraining?.id || null,

                contractId: contract.id,

                expiryDate,

                status,

                source: "excel_import",

                sourceFile: FILE_PATH,

                isLatest: true,

                version: (existing.version || 1) + 1,
              },
            });
          } else {
            await prisma.employeeTraining.create({
              data: {
                employeeId: employee.id,

                globalTrainingId: globalTraining.id,

                clientTrainingId: clientTraining?.id || null,

                contractId: contract.id,

                expiryDate,

                status,

                source: "excel_import",

                sourceFile: FILE_PATH,

                isLatest: true,

                version: 1,
              },
            });
          }

          inserted++;

          console.log(`   ✔ ${canonicalName} (${status})`);
        } catch (err) {
          console.error(`❌ Training error: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`❌ Row ${rowIndex}: ${err.message}`);
    }
  }

  console.log("\n================================");

  console.log("✅ Import Completed");

  console.log(`✔ Inserted: ${inserted}`);

  console.log(`⚠ Skipped: ${skipped}`);
}

// ============================================================
// Run
// ============================================================

importEmployeeTrainings()
  .catch((err) => {
    console.error("💥 Import failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
