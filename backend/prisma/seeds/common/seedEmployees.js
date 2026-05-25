import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Training statuses for realistic data
const addDays = (d, n) => new Date(new Date(d).setDate(d.getDate() + n));
const today = new Date();

async function seedEmployees() {
  console.log("👷 Seeding test employees...\n");

  // ── Lookup companies ────────────────────────────────────────
  const [ces, experteam, yard2] = await Promise.all([
    prisma.company.findFirst({ where: { name: "CES" } }),
    prisma.company.findFirst({ where: { name: "EXPERTEAM" } }),
    prisma.company.findFirst({ where: { name: "YARD2" } }),
  ]);

  if (!ces || !experteam || !yard2) {
    throw new Error("Companies not found — run seed.js first");
  }

  // ── Lookup positions ────────────────────────────────────────
  const pos = {};
  const posNames = [
    "Rigger / Scaffolder",
    "Safety Officer",
    "Welder, Regular",
    "Pipe Fitter A",
    "Mechanic",
    "Helper",
    "Foreman",
    "Supervisor",
    "Painter",
    "Fire Watcher",
  ];
  for (const name of posNames) {
    const p = await prisma.position.findFirst({ where: { name } });
    if (p) pos[name] = p.id;
  }

  // ── Lookup global trainings ─────────────────────────────────
  const gt = {};
  const gtNames = ["T-BOSIET", "Basic Rigging (include crane signal and slinging techniques)", "Basic Scaffolding", "Fire Watch", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", "Confined Space Entry (by laws)", "Qualified Gas Tester (QGT)"];
  for (const name of gtNames) {
    const g = await prisma.globalTraining.findFirst({ where: { name } });
    if (g) gt[name] = g.id;
  }

  // ── Employee data ───────────────────────────────────────────
  const EMPLOYEES = [
    // ── CES ──────────────────────────────────────────────────
    { empCode: "CES001", fullName: "Somchai Buakhaw",      fullNameTH: "สมชาย บัวขาว",      companyId: ces.id,       positionId: pos["Rigger / Scaffolder"], division: "Scaffold&Paint", isOffshore: true,  status: "active" },
    { empCode: "CES002", fullName: "Prasert Khamchan",     fullNameTH: "ประเสริฐ คำจันทร์",  companyId: ces.id,       positionId: pos["Welder, Regular"],     division: "Mechanical",    isOffshore: true,  status: "active" },
    { empCode: "CES003", fullName: "Wanchai Srisuwan",     fullNameTH: "วันชัย ศรีสุวรรณ",   companyId: ces.id,       positionId: pos["Safety Officer"],      division: "Safety",        isOffshore: false, status: "active" },
    { empCode: "CES004", fullName: "Narong Phetcharat",    fullNameTH: "ณรงค์ เพชรรัตน์",    companyId: ces.id,       positionId: pos["Pipe Fitter A"],       division: "Mechanical",    isOffshore: true,  status: "active" },
    { empCode: "CES005", fullName: "Kanchana Rattanawan",  fullNameTH: "กาญจนา รัตนวรรณ",   companyId: ces.id,       positionId: pos["Helper"],              division: "Scaffold&Paint", isOffshore: false, status: "active" },
    { empCode: "CES006", fullName: "Thanat Somboon",       fullNameTH: "ธนัท สมบูรณ์",       companyId: ces.id,       positionId: pos["Foreman"],             division: "Mechanical",    isOffshore: true,  status: "inactive" },

    // ── EXPERTEAM ─────────────────────────────────────────────
    { empCode: "EXP001", fullName: "Anuwat Thongchai",     fullNameTH: "อนุวัฒน์ ทองชัย",    companyId: experteam.id, positionId: pos["Mechanic"],            division: "Maintenance",   isOffshore: true,  status: "active" },
    { empCode: "EXP002", fullName: "Supachai Phromma",     fullNameTH: "สุภาชัย พรหมมา",     companyId: experteam.id, positionId: pos["Rigger / Scaffolder"], division: "Scaffold&Paint", isOffshore: true,  status: "active" },
    { empCode: "EXP003", fullName: "Rattana Kaewkham",     fullNameTH: "รัตนา แก้วคำ",       companyId: experteam.id, positionId: pos["Supervisor"],          division: "Engineering",   isOffshore: false, status: "active" },
    { empCode: "EXP004", fullName: "Nattapong Srithong",   fullNameTH: "ณัฐพงศ์ ศรีทอง",    companyId: experteam.id, positionId: pos["Painter"],             division: "Scaffold&Paint", isOffshore: true,  status: "active" },
    { empCode: "EXP005", fullName: "Warisa Chaiwan",       fullNameTH: "วาริสา ชัยวรรณ",     companyId: experteam.id, positionId: pos["Fire Watcher"],        division: "Safety",        isOffshore: false, status: "onleave" },

    // ── YARD2 ─────────────────────────────────────────────────
    { empCode: "YD2001", fullName: "Prayuth Mangkorn",     fullNameTH: "ประยุทธ มังกร",       companyId: yard2.id,     positionId: pos["Rigger / Scaffolder"], division: "Yard Ops",      isOffshore: true,  status: "active" },
    { empCode: "YD2002", fullName: "Chaiwat Klahan",       fullNameTH: "ชัยวัฒน์ กล้าหาญ",   companyId: yard2.id,     positionId: pos["Welder, Regular"],     division: "Fabrication",   isOffshore: true,  status: "active" },
    { empCode: "YD2003", fullName: "Thidarat Sookdee",     fullNameTH: "ธิดารัตน์ สุขดี",    companyId: yard2.id,     positionId: pos["Safety Officer"],      division: "SSHE",          isOffshore: false, status: "active" },
    { empCode: "YD2004", fullName: "Krit Saengjan",        fullNameTH: "กฤต แสงจันทร์",      companyId: yard2.id,     positionId: pos["Pipe Fitter A"],       division: "Fabrication",   isOffshore: true,  status: "active" },
    { empCode: "YD2005", fullName: "Monthon Phakdee",      fullNameTH: "มนต์ทอน ภักดี",      companyId: yard2.id,     positionId: pos["Helper"],              division: "Yard Ops",      isOffshore: false, status: "active" },
  ];

  const created = [];
  for (const emp of EMPLOYEES) {
    const record = await prisma.employee.upsert({
      where: { empCode: emp.empCode },
      update: {},
      create: emp,
    });
    created.push(record);
    console.log(`  ✔ ${emp.empCode} — ${emp.fullName} (${emp.companyId === ces.id ? "CES" : emp.companyId === experteam.id ? "EXPERTEAM" : "YARD2"})`);
  }

  // ── Training records ────────────────────────────────────────
  console.log("\n📋 Seeding training records...");

  const BOSIET     = gt["T-BOSIET"];
  const RIGGING    = gt["Basic Rigging (include crane signal and slinging techniques)"];
  const SCAFFOLD   = gt["Basic Scaffolding"];
  const FIREWATCH  = gt["Fire Watch"];
  const WAH        = gt["Working At Height - Combined Course & Rescue (Use Fall Protection System)"];
  const CSE        = gt["Confined Space Entry (by laws)"];
  const QGT        = gt["Qualified Gas Tester (QGT)"];

  // Helper: upsert training record
  const addTraining = async (employeeId, globalTrainingId, status, completedDate, expiryDate) => {
    if (!globalTrainingId) return;
    const existing = await prisma.employeeTraining.findFirst({
      where: { employeeId, globalTrainingId, isLatest: true },
    });
    if (existing) return;
    await prisma.employeeTraining.create({
      data: {
        employeeId,
        globalTrainingId,
        rawTrainingName: "",
        status,
        completedDate,
        expiryDate,
        isLatest: true,
      },
    });
  };

  // CES001 — Rigger offshore: BOSIET valid, Rigging valid, WAH due_soon
  const c1 = created.find((e) => e.empCode === "CES001");
  if (c1) {
    await addTraining(c1.id, BOSIET,   "completed", addDays(today, -300), addDays(today, 65));
    await addTraining(c1.id, RIGGING,  "completed", addDays(today, -200), addDays(today, 165));
    await addTraining(c1.id, SCAFFOLD, "completed", addDays(today, -180), addDays(today, 185));
    await addTraining(c1.id, WAH,      "due_soon",  addDays(today, -350), addDays(today, 15));
  }

  // CES002 — Welder: BOSIET overdue, Rigging valid
  const c2 = created.find((e) => e.empCode === "CES002");
  if (c2) {
    await addTraining(c2.id, BOSIET,  "overdue",   addDays(today, -800), addDays(today, -100));
    await addTraining(c2.id, RIGGING, "completed", addDays(today, -100), addDays(today, 265));
  }

  // CES003 — Safety: QGT, CSE valid
  const c3 = created.find((e) => e.empCode === "CES003");
  if (c3) {
    await addTraining(c3.id, QGT,      "completed", addDays(today, -90),  addDays(today, 275));
    await addTraining(c3.id, CSE,      "completed", addDays(today, -120), addDays(today, 245));
    await addTraining(c3.id, FIREWATCH,"completed", addDays(today, -60),  addDays(today, 305));
  }

  // EXP001 — Mechanic: BOSIET valid, Rigging pending
  const e1 = created.find((e) => e.empCode === "EXP001");
  if (e1) {
    await addTraining(e1.id, BOSIET,  "completed", addDays(today, -200), addDays(today, 165));
    await addTraining(e1.id, RIGGING, "pending",   null, null);
  }

  // EXP002 — Rigger: full set
  const e2 = created.find((e) => e.empCode === "EXP002");
  if (e2) {
    await addTraining(e2.id, BOSIET,   "completed", addDays(today, -180), addDays(today, 185));
    await addTraining(e2.id, RIGGING,  "completed", addDays(today, -150), addDays(today, 215));
    await addTraining(e2.id, SCAFFOLD, "due_soon",  addDays(today, -360), addDays(today, 5));
    await addTraining(e2.id, WAH,      "completed", addDays(today, -100), addDays(today, 265));
  }

  // YD2001 — Rigger yard: BOSIET valid, Scaffold valid, WAH valid
  const y1 = created.find((e) => e.empCode === "YD2001");
  if (y1) {
    await addTraining(y1.id, BOSIET,   "completed", addDays(today, -250), addDays(today, 115));
    await addTraining(y1.id, SCAFFOLD, "completed", addDays(today, -120), addDays(today, 245));
    await addTraining(y1.id, WAH,      "completed", addDays(today, -90),  addDays(today, 275));
    await addTraining(y1.id, RIGGING,  "completed", addDays(today, -300), addDays(today, 65));
  }

  // YD2002 — Welder yard: BOSIET overdue
  const y2 = created.find((e) => e.empCode === "YD2002");
  if (y2) {
    await addTraining(y2.id, BOSIET,  "overdue",   addDays(today, -600), addDays(today, -200));
    await addTraining(y2.id, RIGGING, "completed", addDays(today, -80),  addDays(today, 285));
  }

  // YD2003 — Safety: CSE, QGT, FireWatch
  const y3 = created.find((e) => e.empCode === "YD2003");
  if (y3) {
    await addTraining(y3.id, CSE,       "completed", addDays(today, -50),  addDays(today, 315));
    await addTraining(y3.id, QGT,       "completed", addDays(today, -70),  addDays(today, 295));
    await addTraining(y3.id, FIREWATCH, "due_soon",  addDays(today, -355), addDays(today, 10));
  }

  console.log("\n✅ Employee seed complete");
  console.log(`   CES: 6 คน | EXPERTEAM: 5 คน | YARD2: 5 คน`);
}

seedEmployees()
  .catch((e) => { console.error("💥", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
