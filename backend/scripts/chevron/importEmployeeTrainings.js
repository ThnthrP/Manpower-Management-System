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
  "../../../training_record_from_hr/Employee Training Offshore-Chevron 31-3-2026.xlsx",
);

const TRAINING_MAPPING_FILE = path.join(
  __dirname,
  "../../../training_record_from_hr/importChevron.xlsx",
);

const CLIENT_NAME = "Chevron";

const SHEET_NAME = "Record";

const COMPANY_NAME = "EXPERTEAM";

// ============================================================
// Excel Structure
// ============================================================

const COL = {
  FULL_NAME_EN: 2, // C
  FULL_NAME_TH: 3, // D
  POSITION: 4, // E

  MEDICAL_HOSP: 6, // G
  MEDICAL_ISSUE: 7, // H
  MEDICAL_EXP: 8, // I
  MEDICAL_OK: 10, // K

  TRAINING_START: 24, // Y
};

const ROW = {
  TRAINING_NAME: 4, // row 5
  TRAINING_FIELD: 6, // row 7

  EMPLOYEE_START: 7, // row 8
  EMPLOYEE_END: 162, // row 163
};

// ============================================================
// Constants
// ============================================================

const SKIP_VALUES = new Set(["N/A", "n/a", null, undefined, ""]);

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
    .replace(/[()]/g, "")
    .replace(/\//g, " ")
    .replace(/&/g, "and")
    .replace(/-/g, " ")
    .replace(/,/g, " ")
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

// function getTrainingStatus(statusValue, expiryDate) {
function getTrainingStatus(statusValue, expiryDate, completedDate) {
  //   if (!statusValue && !expiryDate) {
  //     return null;
  //   }
  if (!statusValue && !expiryDate && !completedDate) {
    return null;
  }

  if (typeof statusValue === "string") {
    const lower = statusValue.toLowerCase();

    if (lower.includes("if required")) {
      return "if_required";
    }

    if (lower.includes("pass")) {
      return "completed";
    }

    if (lower.includes("fail")) {
      return "failed";
    }
  }

  if (!expiryDate) {
    return "completed";
  }

  if (completedDate) {
    return "completed";
  }

  if (expiryDate.getFullYear() >= NO_EXPIRY_YEAR) {
    return "completed";
  }

  const now = new Date();

  if (expiryDate < now) {
    return "overdue";
  }

  const soon = new Date();

  soon.setDate(soon.getDate() + 90);

  if (expiryDate < soon) {
    return "due_soon";
  }

  return "completed";
}

function isEmployeeRow(row) {
  const name = row[COL.FULL_NAME_EN];

  if (!name || typeof name !== "string") {
    return false;
  }

  if (name.startsWith("=")) {
    return false;
  }

  return name.trim().length > 3;
}

// ============================================================
// Main
// ============================================================

async function importEmployeeTrainings() {
  console.log("🚀 Importing Chevron Employee Trainings...");

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
  // Build Training Layout
  // ==========================================================

  const trainingLayout = [];

  const headerRow = rows[ROW.TRAINING_NAME];

  const fieldRow = rows[ROW.TRAINING_FIELD];

  for (let col = COL.TRAINING_START; col < headerRow.length; col++) {
    const trainingNameRaw = headerRow[col];

    const fieldNameRaw = fieldRow[col];

    const trainingName = cleanText(trainingNameRaw);

    const fieldName = cleanText(fieldNameRaw);

    if (!trainingName || !fieldName) {
      continue;
    }

    const canonicalName = mapTrainingName(trainingName, TRAINING_NAME_MAP);

    let existing = trainingLayout.find((t) => t.trainingName === trainingName);

    if (!existing) {
      existing = {
        trainingName,
        canonicalName,

        completedCol: null,
        expiryCol: null,
        statusCol: null,
      };

      trainingLayout.push(existing);
    }

    const lower = fieldName.toLowerCase();

    if (lower.includes("completed")) {
      existing.completedCol = col;
    }

    if (lower.includes("expire")) {
      existing.expiryCol = col;
    }

    if (lower.includes("status")) {
      existing.statusCol = col;
    }
  }

  console.log(`📚 Trainings found: ${trainingLayout.length}`);

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

      const fullName = cleanText(row[COL.FULL_NAME_EN]);

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

        const medicalRequirement = await prisma.medicalRequirement.findFirst({
          where: {
            clientId: client.id,

            name: {
              contains: "Medical Check",
            },
          },
        });

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
                medicalStatusRaw?.toLowerCase() === "pass"
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
                medicalStatusRaw?.toLowerCase() === "pass"
                  ? medicalExpiryDate && medicalExpiryDate < new Date()
                    ? "overdue"
                    : "passed"
                  : "failed",
            },
          });

          console.log(`   💉 Medical Checkup`);
        }
      } catch (err) {
        console.log(`❌ Medical Error: ${err.message}`);
      }

      // ======================================================
      // Trainings
      // ======================================================

      for (const training of trainingLayout) {
        try {
          const canonicalName = training.canonicalName;

          if (!canonicalName) {
            console.log(`⚠ No mapping: "${training.trainingName}"`);

            continue;
          }

          const globalTraining = globalTrainingMap[canonicalName];

          if (!globalTraining) {
            console.log(`⚠ Global training not found: ${canonicalName}`);

            continue;
          }

          const clientTraining = clientTrainingMap[canonicalName];

          const completedDate = parseDate(row[training.completedCol]);

          const expiryDate = parseDate(row[training.expiryCol]);

          const rawStatus = cleanText(row[training.statusCol]);

          //   const status = getTrainingStatus(rawStatus, expiryDate);
          const status = getTrainingStatus(
            rawStatus,
            expiryDate,
            completedDate,
          );

          const remindDays = 30;

          const remindDate = expiryDate
            ? new Date(expiryDate.getTime() - remindDays * 24 * 60 * 60 * 1000)
            : null;

          if (!status && !completedDate && !expiryDate) {
            continue;
          }

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
                employee: {
                  connect: {
                    id: employee.id,
                  },
                },

                globalTraining: {
                  connect: {
                    id: globalTraining.id,
                  },
                },

                ...(clientTraining && {
                  clientTraining: {
                    connect: {
                      id: clientTraining.id,
                    },
                  },
                }),

                contractId: contract.id,

                completedDate,
                expiryDate,

                remindDate,
                remindDays,

                status,

                source: "excel_import",

                sourceFile: FILE_PATH,

                isLatest: true,

                version: existing.version + 1,
              },
            });
          } else {
            await prisma.employeeTraining.create({
              data: {
                employee: {
                  connect: {
                    id: employee.id,
                  },
                },

                globalTraining: {
                  connect: {
                    id: globalTraining.id,
                  },
                },

                ...(clientTraining && {
                  clientTraining: {
                    connect: {
                      id: clientTraining.id,
                    },
                  },
                }),

                contractId: contract.id,

                completedDate,
                expiryDate,

                remindDate,
                remindDays,

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
