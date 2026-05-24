/**
 * Run this script ONCE before running "prisma migrate dev"
 * Purpose: Remove duplicate Company/Skill records that block unique constraints
 *
 * Usage:
 *   node prisma/scripts/fixDuplicatesAndMigrate.js
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing duplicate records...\n");

  // ── Deduplicate Company.name ─────────────────────────────
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });
  const seenNames = new Map();
  const dupCompanyIds = [];

  for (const c of companies) {
    if (seenNames.has(c.name)) {
      dupCompanyIds.push(c.id);
    } else {
      seenNames.set(c.name, c.id);
    }
  }

  if (dupCompanyIds.length > 0) {
    console.log(`Found ${dupCompanyIds.length} duplicate company record(s) — deleting...`);
    await prisma.company.deleteMany({ where: { id: { in: dupCompanyIds } } });
    console.log("  ✅ Duplicate companies removed");
  } else {
    console.log("  ✅ No duplicate companies");
  }

  // ── Deduplicate Skill.name ───────────────────────────────
  const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
  const seenSkills = new Map();
  const dupSkillIds = [];

  for (const s of skills) {
    if (seenSkills.has(s.name)) {
      dupSkillIds.push(s.id);
    } else {
      seenSkills.set(s.name, s.id);
    }
  }

  if (dupSkillIds.length > 0) {
    console.log(`Found ${dupSkillIds.length} duplicate skill record(s) — deleting...`);
    await prisma.skill.deleteMany({ where: { id: { in: dupSkillIds } } });
    console.log("  ✅ Duplicate skills removed");
  } else {
    console.log("  ✅ No duplicate skills");
  }

  console.log("\n✅ Done. Now run:  npx prisma migrate dev --name add_phase2_5_models\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
