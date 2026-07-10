import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.user.deleteMany();
  const passwordHash = await bcrypt.hash("medo_123", 10);

  const users = [
    {
      username: "mohamed",
      email: "mohamed@example.com",
      displayName: "Mohamed",
    },
    {
      username: "john",
      email: "john@example.com",
      displayName: "John Smith",
    },
    {
      username: "jane",
      email: "jane@example.com",
      displayName: "Jane Doe",
    },
    {
      username: "ahmed",
      email: "ahmed@example.com",
      displayName: "Ahmed Ali",
    },
    {
      username: "ali",
      email: "ali@example.com",
      displayName: "Ali Hassan",
    },
    {
      username: "omar",
      email: "omar@example.com",
      displayName: "Omar Mohamed",
    },
    {
      username: "sara",
      email: "sara@example.com",
      displayName: "Sara Ahmed",
    },
    {
      username: "mariam",
      email: "mariam@example.com",
      displayName: "Mariam Ibrahim",
    },
    {
      username: "youssef",
      email: "youssef@example.com",
      displayName: "Youssef Adel",
    },
    {
      username: "mostafa",
      email: "mostafa@example.com",
      displayName: "Mostafa Khaled",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
