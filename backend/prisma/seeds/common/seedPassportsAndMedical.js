import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const addDays = (n) => new Date(Date.now() + n * 86400000);

async function seedPassportsAndMedical() {
  console.log("🗂️  Seeding passports, medical checks & extra trainings...\n");

  // ── Fetch employees ─────────────────────────────────────────
  const emps = await prisma.employee.findMany({
    select: { id: true, empCode: true, fullName: true, isOffshore: true },
  });

  if (emps.length === 0) {
    throw new Error("No employees found — run seedEmployees.js first");
  }

  const byCode = Object.fromEntries(emps.map((e) => [e.empCode, e]));

  // ── PASSPORTS ───────────────────────────────────────────────
  console.log("🛂 Passports...");
  const PASSPORTS = [
    // CES
    { empCode: "CES001", passportNo: "AA123456", expiryDate: addDays(365),  issuedCountry: "TH" },
    { empCode: "CES002", passportNo: "AB234567", expiryDate: addDays(60),   issuedCountry: "TH" }, // ใกล้หมด
    { empCode: "CES003", passportNo: "AC345678", expiryDate: addDays(-30),  issuedCountry: "TH" }, // หมดแล้ว
    { empCode: "CES004", passportNo: "AD456789", expiryDate: addDays(500),  issuedCountry: "TH" },
    { empCode: "CES005", passportNo: "AE567890", expiryDate: addDays(730),  issuedCountry: "TH" },
    { empCode: "CES006", passportNo: "AF678901", expiryDate: addDays(45),   issuedCountry: "TH" }, // ใกล้หมด
    // EXPERTEAM
    { empCode: "EXP001", passportNo: "BA123456", expiryDate: addDays(400),  issuedCountry: "TH" },
    { empCode: "EXP002", passportNo: "BB234567", expiryDate: addDays(-15),  issuedCountry: "TH" }, // หมดแล้ว
    { empCode: "EXP003", passportNo: "BC345678", expiryDate: addDays(600),  issuedCountry: "TH" },
    { empCode: "EXP004", passportNo: "BD456789", expiryDate: addDays(75),   issuedCountry: "TH" }, // ใกล้หมด
    { empCode: "EXP005", passportNo: "BE567890", expiryDate: addDays(180),  issuedCountry: "TH" },
    // YARD2
    { empCode: "YD2001", passportNo: "CA123456", expiryDate: addDays(270),  issuedCountry: "TH" },
    { empCode: "YD2002", passportNo: "CB234567", expiryDate: addDays(-60),  issuedCountry: "TH" }, // หมดแล้ว
    { empCode: "YD2003", passportNo: "CC345678", expiryDate: addDays(800),  issuedCountry: "TH" },
    { empCode: "YD2004", passportNo: "CD456789", expiryDate: addDays(30),   issuedCountry: "TH" }, // ใกล้หมดมาก
    { empCode: "YD2005", passportNo: "CE567890", expiryDate: addDays(450),  issuedCountry: "TH" },
  ];

  for (const p of PASSPORTS) {
    const emp = byCode[p.empCode];
    if (!emp) { console.log(`  ⚠️  ${p.empCode} not found`); continue; }
    await prisma.employeePassport.upsert({
      where: { employeeId: emp.id },
      update: { passportNo: p.passportNo, expiryDate: p.expiryDate },
      create: {
        employeeId: emp.id,
        passportNo: p.passportNo,
        expiryDate: p.expiryDate,
        issuedCountry: p.issuedCountry,
      },
    });
    const days = Math.ceil((p.expiryDate - Date.now()) / 86400000);
    const tag = days < 0 ? "❌ หมดแล้ว" : days <= 90 ? "⚠️  ใกล้หมด" : "✅";
    console.log(`  ${tag} ${p.empCode} — ${p.passportNo} (${days} วัน)`);
  }

  // ── MEDICAL CHECKS ──────────────────────────────────────────
  console.log("\n🏥 Medical checks...");
  const MEDICAL = [
    // CES — offshore workers
    { empCode: "CES001", checkType: "Medical Check up (Offshore)", expiryDate: addDays(200),  status: "passed" },
    { empCode: "CES002", checkType: "Medical Check up (Offshore)", expiryDate: addDays(-20),  status: "failed" }, // หมดแล้ว
    { empCode: "CES004", checkType: "Medical Check up (Offshore)", expiryDate: addDays(45),   status: "passed" },
    { empCode: "CES003", checkType: "Confined Space Medical",      expiryDate: addDays(300),  status: "passed" },
    { empCode: "CES006", checkType: "Medical Check up (Offshore)", expiryDate: addDays(350),  status: "passed" },
    // EXPERTEAM
    { empCode: "EXP001", checkType: "Medical Check up (Offshore)", expiryDate: addDays(180),  status: "passed" },
    { empCode: "EXP002", checkType: "Medical Check up (Offshore)", expiryDate: addDays(-45),  status: "failed" }, // หมดแล้ว
    { empCode: "EXP004", checkType: "Medical Check up (Offshore)", expiryDate: addDays(60),   status: "passed" },
    // YARD2
    { empCode: "YD2001", checkType: "Medical Check up (Offshore)", expiryDate: addDays(150),  status: "passed" },
    { empCode: "YD2002", checkType: "Medical Check up (Offshore)", expiryDate: addDays(250),  status: "passed" },
    { empCode: "YD2004", checkType: "Medical Check up (Offshore)", expiryDate: addDays(80),   status: "passed" },
    { empCode: "YD2003", checkType: "Drug Test",                   expiryDate: addDays(365),  status: "passed" },
  ];

  for (const m of MEDICAL) {
    const emp = byCode[m.empCode];
    if (!emp) continue;
    const existing = await prisma.medicalCheck.findFirst({
      where: { employeeId: emp.id, checkType: m.checkType },
    });
    if (!existing) {
      await prisma.medicalCheck.create({
        data: {
          employeeId: emp.id,
          checkType: m.checkType,
          issuedDate: addDays(-30),
          expiryDate: m.expiryDate,
          status: m.status,
        },
      });
    }
    const days = Math.ceil((m.expiryDate - Date.now()) / 86400000);
    const tag = days < 0 ? "❌" : days <= 90 ? "⚠️ " : "✅";
    console.log(`  ${tag} ${m.empCode} — ${m.checkType}`);
  }

  // ── FIX rawTrainingName for existing training records ────────
  console.log("\n🔧 Fixing rawTrainingName on existing records...");
  const trainings = await prisma.employeeTraining.findMany({
    where: { rawTrainingName: "" },
    include: { globalTraining: { select: { name: true } } },
  });
  for (const t of trainings) {
    if (t.globalTraining?.name) {
      await prisma.employeeTraining.update({
        where: { id: t.id },
        data: { rawTrainingName: t.globalTraining.name },
      });
    }
  }
  console.log(`  Fixed ${trainings.length} records`);

  // ── EXTRA TRAINING RECORDS ───────────────────────────────────
  console.log("\n📋 Extra training records...");

  const gtNames = [
    "H2S Safety",
    "Manual Handling",
    "Basic First Aid",
    "OPITO Basic Offshore Safety Induction and Emergency Training (BOSIET)",
    "Fire Fighting",
  ];

  // Fetch global trainings (partial match)
  const extraGT = {};
  for (const name of gtNames) {
    const g = await prisma.globalTraining.findFirst({
      where: { name: { contains: name.split(" ")[0], mode: "insensitive" } },
    });
    if (g) extraGT[name] = g;
  }

  // Add a few raw (non-global) training records for variety
  const rawTrainings = [
    { empCode: "CES001", name: "Manual Handling Safety",         expiryDate: addDays(200),  status: "completed" },
    { empCode: "CES001", name: "Basic First Aid",                expiryDate: addDays(-10),  status: "overdue"   },
    { empCode: "CES002", name: "H2S Awareness",                  expiryDate: addDays(300),  status: "completed" },
    { empCode: "CES003", name: "Fire Fighting (Advanced)",       expiryDate: addDays(180),  status: "completed" },
    { empCode: "CES004", name: "Basic First Aid",                expiryDate: addDays(30),   status: "due_soon"  },
    { empCode: "CES004", name: "H2S Awareness",                  expiryDate: addDays(400),  status: "completed" },
    { empCode: "CES005", name: "Manual Handling Safety",         expiryDate: addDays(250),  status: "completed" },
    { empCode: "CES006", name: "Basic First Aid",                expiryDate: addDays(130),  status: "completed" },
    { empCode: "EXP001", name: "H2S Awareness",                  expiryDate: addDays(100),  status: "completed" },
    { empCode: "EXP001", name: "Fire Fighting",                  expiryDate: addDays(-50),  status: "overdue"   },
    { empCode: "EXP002", name: "Basic First Aid",                expiryDate: addDays(200),  status: "completed" },
    { empCode: "EXP003", name: "Manual Handling Safety",         expiryDate: addDays(350),  status: "completed" },
    { empCode: "EXP004", name: "H2S Awareness",                  expiryDate: addDays(-20),  status: "overdue"   },
    { empCode: "EXP005", name: "Basic First Aid",                expiryDate: addDays(90),   status: "due_soon"  },
    { empCode: "YD2001", name: "Manual Handling Safety",         expiryDate: addDays(320),  status: "completed" },
    { empCode: "YD2001", name: "Basic First Aid",                expiryDate: addDays(50),   status: "due_soon"  },
    { empCode: "YD2002", name: "H2S Awareness",                  expiryDate: addDays(280),  status: "completed" },
    { empCode: "YD2003", name: "Fire Fighting (Advanced)",       expiryDate: addDays(400),  status: "completed" },
    { empCode: "YD2004", name: "Basic First Aid",                expiryDate: addDays(-80),  status: "overdue"   },
    { empCode: "YD2005", name: "Manual Handling Safety",         expiryDate: addDays(210),  status: "completed" },
  ];

  let addedCount = 0;
  for (const r of rawTrainings) {
    const emp = byCode[r.empCode];
    if (!emp) continue;
    const existing = await prisma.employeeTraining.findFirst({
      where: { employeeId: emp.id, rawTrainingName: r.name, isLatest: true },
    });
    if (!existing) {
      await prisma.employeeTraining.create({
        data: {
          employeeId: emp.id,
          rawTrainingName: r.name,
          expiryDate: r.expiryDate,
          status: r.status,
          isLatest: true,
        },
      });
      addedCount++;
    }
  }
  console.log(`  Added ${addedCount} extra training records`);

  console.log("\n✅ Seed complete!");
  console.log(`   Passports: ${PASSPORTS.length} | Medical: ${MEDICAL.length} | Extra trainings: ${addedCount}`);
}

seedPassportsAndMedical()
  .catch((e) => { console.error("💥", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
