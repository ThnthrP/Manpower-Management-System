import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding start...");

  // 1. Roles
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "user" },
      { name: "manager" },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded");

  // 2. Get roles
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  // 3. Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 4. Create admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        roleId: adminRole.id, // 🔥 สำคัญ
      },
    });

    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });