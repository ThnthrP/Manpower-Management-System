/**
 * seedPositionRequirements.js
 * Links Position → ClientTraining → Contract with requirementType
 * Based on Chevron Matrix 2025 and PTT Matrix 2025
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function upsertReq(positionName, trainingName, contractCode, reqType) {
  const [position, contract] = await Promise.all([
    prisma.position.findFirst({ where: { name: positionName } }),
    prisma.contract.findFirst({ where: { contractNo: contractCode } }),
  ]);

  if (!position) { console.warn(`  ⚠ Position not found: ${positionName}`); return; }
  if (!contract) { console.warn(`  ⚠ Contract not found: ${contractCode}`); return; }

  const clientTraining = await prisma.clientTraining.findFirst({
    where: { contractId: contract.id, name: trainingName },
  });

  if (!clientTraining) { console.warn(`  ⚠ ClientTraining not found: ${trainingName} (${contractCode})`); return; }

  await prisma.positionRequirement.upsert({
    where: {
      positionId_clientTrainingId_contractId: {
        positionId: position.id,
        clientTrainingId: clientTraining.id,
        contractId: contract.id,
      },
    },
    update: { requirementType: reqType },
    create: {
      positionId: position.id,
      clientTrainingId: clientTraining.id,
      contractId: contract.id,
      requirementType: reqType,
      sourceMatrixCode: reqType.charAt(0).toUpperCase(),
      sourceMatrixSheet: contractCode,
    },
  });
}

async function main() {
  console.log("📋 Seeding Position Requirements...\n");

  // ── CHEVRON (CHV-2025) ──────────────────────────────────────

  const CHV = "CHV-2025";

  console.log("  Chevron — Rigger / Scaffolder");
  await upsertReq("Rigger / Scaffolder", "T-BOSIET",                                                     CHV, "required");
  await upsertReq("Rigger / Scaffolder", "Basic Rigging (include crane signal and slinging techniques)", CHV, "required");
  await upsertReq("Rigger / Scaffolder", "Basic Scaffolding",                                            CHV, "required");
  await upsertReq("Rigger / Scaffolder", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", CHV, "required");
  await upsertReq("Rigger / Scaffolder", "Fire Watch",                                                   CHV, "required");
  await upsertReq("Rigger / Scaffolder", "Confined Space Entry (by laws)",                               CHV, "assigned");

  console.log("  Chevron — Painter");
  await upsertReq("Painter", "T-BOSIET",                                                     CHV, "required");
  await upsertReq("Painter", "Painting & Blasting (International/Dimet/Jotun) / Sand Blasting", CHV, "required");
  await upsertReq("Painter", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", CHV, "required");
  await upsertReq("Painter", "Fire Watch",                                                    CHV, "required");

  console.log("  Chevron — Welder, Regular");
  await upsertReq("Welder, Regular", "T-BOSIET",     CHV, "required");
  await upsertReq("Welder, Regular", "Welding",       CHV, "required");
  await upsertReq("Welder, Regular", "Fire Watch",    CHV, "required");
  await upsertReq("Welder, Regular", "Confined Space Entry (by laws)", CHV, "assigned");

  console.log("  Chevron — Safety Officer / HES specialist");
  await upsertReq("Safety Officer / HES specialist", "T-BOSIET",                             CHV, "required");
  await upsertReq("Safety Officer / HES specialist", "Occupational Safety Officer at Supervisory Level", CHV, "required");
  await upsertReq("Safety Officer / HES specialist", "Qualified Gas Tester (QGT)",            CHV, "required");
  await upsertReq("Safety Officer / HES specialist", "Confined Space Entry (by laws)",        CHV, "required");
  await upsertReq("Safety Officer / HES specialist", "Fire Watch",                            CHV, "required");
  await upsertReq("Safety Officer / HES specialist", "Advanced First Aid Training",           CHV, "required");

  console.log("  Chevron — Pipe Fitter A");
  await upsertReq("Pipe Fitter A", "T-BOSIET",                                               CHV, "required");
  await upsertReq("Pipe Fitter A", "Fitting",                                                CHV, "required");
  await upsertReq("Pipe Fitter A", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", CHV, "required");
  await upsertReq("Pipe Fitter A", "Confined Space Entry (by laws)",                         CHV, "assigned");

  console.log("  Chevron — Fire Watcher");
  await upsertReq("Fire Watcher", "T-BOSIET",   CHV, "required");
  await upsertReq("Fire Watcher", "Fire Watch",  CHV, "required");
  await upsertReq("Fire Watcher", "Qualified Gas Tester (QGT)", CHV, "required");

  console.log("  Chevron — Scaffolding Inspector");
  await upsertReq("Scaffolding Subject Matter Expertise (SME)", "T-BOSIET",               CHV, "required");
  await upsertReq("Scaffolding Subject Matter Expertise (SME)", "Basic Scaffolding",       CHV, "required");
  await upsertReq("Scaffolding Subject Matter Expertise (SME)", "Scaffolding Inspector",   CHV, "required");
  await upsertReq("Scaffolding Subject Matter Expertise (SME)", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", CHV, "required");

  // ── PTT (PTT-2025) ─────────────────────────────────────────

  const PTT = "PTT-2025";

  console.log("\n  PTT — Rigger");
  await upsertReq("Rigger", "T-BOSIET",                                                      PTT, "required");
  await upsertReq("Rigger", "Basic Rigging (include crane signal and slinging techniques)",  PTT, "required");
  await upsertReq("Rigger", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", PTT, "required");

  console.log("  PTT — Welder");
  await upsertReq("Welder", "T-BOSIET",   PTT, "required");
  await upsertReq("Welder", "Welding",     PTT, "required");

  console.log("  PTT — Safety Officer");
  await upsertReq("Safety Officer", "T-BOSIET",                                             PTT, "required");
  await upsertReq("Safety Officer", "Occupational Safety Officer at Supervisory Level",      PTT, "required");
  await upsertReq("Safety Officer", "Qualified Gas Tester (QGT)",                           PTT, "required");
  await upsertReq("Safety Officer", "Confined Space Entry (by laws)",                       PTT, "required");

  console.log("  PTT — Scaffolder");
  await upsertReq("Scaffolder", "T-BOSIET",          PTT, "required");
  await upsertReq("Scaffolder", "Basic Scaffolding",  PTT, "required");
  await upsertReq("Scaffolder", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", PTT, "required");

  console.log("  PTT — Crane Operator");
  await upsertReq("Crane Operator", "T-BOSIET",                                             PTT, "required");
  await upsertReq("Crane Operator", "Basic Crane Operator (Comply with API RP2D or equivalent)", PTT, "required");
  await upsertReq("Crane Operator", "Crane Operator License (Class A, B+, B, C)",           PTT, "required");
  await upsertReq("Crane Operator", "Working At Height - Combined Course & Rescue (Use Fall Protection System)", PTT, "required");

  console.log("  PTT — Fitter");
  await upsertReq("Fitter", "T-BOSIET",  PTT, "required");
  await upsertReq("Fitter", "Fitting",    PTT, "required");

  const total = await prisma.positionRequirement.count();
  console.log(`\n✅ Done — ${total} PositionRequirements total`);
}

main()
  .catch((e) => { console.error("💥", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
