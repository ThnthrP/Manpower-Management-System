// [ใหม่] Seed Employee Training Records จาก Excel (Erawan)
// อ่านจาก: <project_root>/training_record_from_hr/importErawanEmployees.xlsx
//
// Excel format (row 1 = header):
//   A = empCode         รหัสพนักงาน (e.g. CES001)
//   B = trainingName    ชื่อ training (ตรงกับ GlobalTraining.name)
//   C = completedDate   วันที่ผ่าน (DD/MM/YYYY หรือ Excel date serial)
//   D = expiryDate      วันหมดอายุ  (DD/MM/YYYY หรือ Excel date serial) — ว่างได้
//   E = certNo          เลขที่ใบรับรอง — optional
//
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE_PATH = path.join(
  __dirname,
  "../../../../training_record_from_hr/importErawanEmployees.xlsx",
);

const CONTRACT_CODE = "ER-2026";

// ── Date helper ───────────────────────────────────────────────────
// Excel stores dates as serial numbers (days since 1900-01-01)
// or as formatted strings. Handle both.
function parseDate(raw) {
  if (!raw) return null;
  if (typeof raw === "number") {
    // Excel serial date
    return xlsx.SSF.parse_date_code(raw);
  }
  const s = String(raw).trim();
  if (!s) return null;
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = s.split(/[\/\-]/);
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    const year = y < 100 ? y + 2000 : y;
    return new Date(year, m - 1, d);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ── Status helper ─────────────────────────────────────────────────
function calcStatus(expiryDate) {
  if (!expiryDate) return "pending";
  const diff = expiryDate - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days < 0)   return "overdue";
  if (days <= 60) return "due_soon";
  return "completed";
}

// ─────────────────────────────────────────────────────────────────
async function seedEmployeeTrainings() {
  console.log("📋 Seeding Erawan Employee Training Records...");

  // ── Contract ──────────────────────────────────────────────────
  const contract = await prisma.contract.findFirst({ where: { contractNo: CONTRACT_CODE } });
  if (!contract) throw new Error(`Contract not found: ${CONTRACT_CODE}`);

  // ── Employees (lookup by empCode) ─────────────────────────────
  const empList = await prisma.employee.findMany({ select: { id: true, empCode: true } });
  const byCode = Object.fromEntries(empList.map((e) => [e.empCode.trim(), e]));

  // ── Global Trainings (lookup by name) ─────────────────────────
  const gtList = await prisma.globalTraining.findMany({ select: { id: true, name: true } });
  const byName = Object.fromEntries(gtList.map((g) => [g.name.trim(), g]));

  // ── Client Trainings for this contract ───────────────────────
  const ctList = await prisma.clientTraining.findMany({
    where: { contractId: contract.id },
    select: { id: true, name: true, globalTrainingId: true },
  });
  const ctByName = Object.fromEntries(ctList.map((c) => [c.name.trim(), c]));

  // ── Read Excel ────────────────────────────────────────────────
  const workbook = xlsx.readFile(FILE_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const dataRows = rows.slice(1);

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const empCode      = String(row[0] || "").trim();
    const trainingName = String(row[1] || "").replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim();
    const completedRaw = row[2];
    const expiryRaw    = row[3];

    if (!empCode || !trainingName) { skipped++; continue; }

    const emp = byCode[empCode];
    if (!emp) {
      console.log(`  ⚠ Row ${i + 2}: empCode not found — ${empCode}`);
      skipped++;
      continue;
    }

    const completedDate = parseDate(completedRaw);
    const expiryDate    = parseDate(expiryRaw);
    const status        = calcStatus(expiryDate);

    // Resolve global training — check direct name match first, then client training mapping
    let globalTrainingId = null;
    let clientTrainingId = null;

    const gt = byName[trainingName];
    if (gt) {
      globalTrainingId = gt.id;
    } else {
      const ct = ctByName[trainingName];
      if (ct) {
        clientTrainingId = ct.id;
        globalTrainingId = ct.globalTrainingId ?? null;
      }
    }

    try {
      // Upsert: ถ้ามีแล้ว (isLatest=true, empCode+training) → update; ถ้าไม่มี → create
      const existing = await prisma.employeeTraining.findFirst({
        where: {
          employeeId: emp.id,
          rawTrainingName: trainingName,
          isLatest: true,
        },
      });

      if (existing) {
        await prisma.employeeTraining.update({
          where: { id: existing.id },
          data: {
            completedDate,
            expiryDate,
            status,
            globalTrainingId,
            clientTrainingId,
            contractId: contract.id,
            source: "hr_import",
          },
        });
      } else {
        await prisma.employeeTraining.create({
          data: {
            employeeId: emp.id,
            rawTrainingName: trainingName,
            globalTrainingId,
            clientTrainingId,
            contractId: contract.id,
            completedDate,
            expiryDate,
            status,
            isLatest: true,
            source: "hr_import",
            sourceFile: "importErawanEmployees.xlsx",
          },
        });
      }

      const tag = status === "overdue" ? "❌" : status === "due_soon" ? "⚠️ " : "✅";
      console.log(`  ${tag} ${empCode} — ${trainingName}`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ Row ${i + 2}: ${err.message}`);
      skipped++;
    }
  }

  console.log("\n================================");
  console.log("✅ Employee Training Seed Completed (Erawan)");
  console.log(`✔ Inserted/Updated: ${inserted}`);
  console.log(`⚠ Skipped: ${skipped}`);
}

seedEmployeeTrainings()
  .catch((err) => {
    console.error("💥 Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
