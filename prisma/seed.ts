import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
async function main() {
  await prisma.message.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
  const passwordHash = await bcrypt.hash("medo_123", 10);
  const usersData = [
    {
      username: "mohamed",
      email: "mohamed@example.com",
      displayName: "Mohamed Mosilhy",
      bio: "Full Stack Developer",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
    {
      username: "john",
      email: "john@example.com",
      displayName: "John Smith",
      bio: "Backend Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
    {
      username: "jane",
      email: "jane@example.com",
      displayName: "Jane Doe",
      bio: "Frontend Developer",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
    {
      username: "ahmed",
      email: "ahmed@example.com",
      displayName: "Ahmed Ali",
      bio: "Coffee Lover",
      avatarUrl: "https://i.pravatar.cc/150?img=4",
    },
    {
      username: "ali",
      email: "ali@example.com",
      displayName: "Ali Hassan",
      bio: "Open Source",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
    },
    {
      username: "omar",
      email: "omar@example.com",
      displayName: "Omar Mohamed",
      bio: "Software Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=6",
    },
    {
      username: "sara",
      email: "sara@example.com",
      displayName: "Sara Ahmed",
      bio: "UI Designer",
      avatarUrl: "https://i.pravatar.cc/150?img=7",
    },
    {
      username: "mariam",
      email: "mariam@example.com",
      displayName: "Mariam Ibrahim",
      bio: "React Developer",
      avatarUrl: "https://i.pravatar.cc/150?img=8",
    },
    {
      username: "youssef",
      email: "youssef@example.com",
      displayName: "Youssef Adel",
      bio: "Mobile Developer",
      avatarUrl: "https://i.pravatar.cc/150?img=9",
    },
    {
      username: "mostafa",
      email: "mostafa@example.com",
      displayName: "Mostafa Khaled",
      bio: "Tech Enthusiast",
      avatarUrl: "https://i.pravatar.cc/150?img=10",
    },
  ];
  const users: Record<string, any> = {};
  for (const user of usersData) {
    const created = await prisma.user.create({
      data: { ...user, passwordHash },
    });
    users[user.username] = created;
  }
  async function createDirectConversation(
    firstUser: string,
    secondUser: string,
    messageCount: number,
  ) {
    const participantKey = [users[firstUser].id, users[secondUser].id]
      .sort()
      .join(":");
    const conversation = await prisma.conversation.create({
      data: { type: "DIRECT", participantKey },
    });
    await prisma.participation.createMany({
      data: [
        { userId: users[firstUser].id, conversationId: conversation.id },
        { userId: users[secondUser].id, conversationId: conversation.id },
      ],
    });
    let lastMessage = null;
    for (let i = 1; i <= messageCount; i++) {
      lastMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: i % 2 === 0 ? users[firstUser].id : users[secondUser].id,
          content: `Message ${i} between ${firstUser} and ${secondUser}`,
        },
      });
    }
    if (lastMessage) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageId: lastMessage.id,
          lastMessageAt: lastMessage.createdAt,
        },
      });
    }
    return conversation;
  }
  await createDirectConversation("mohamed", "john", 35);
  await createDirectConversation("mohamed", "jane", 5);
  await createDirectConversation("mohamed", "omar", 0);
  await createDirectConversation("john", "ahmed", 20);
  await prisma.block.create({
    data: { blockerId: users.mohamed.id, blockedId: users.ahmed.id },
  });
  await prisma.block.create({
    data: { blockerId: users.sara.id, blockedId: users.mohamed.id },
  });
  console.log("✅ Database seeded successfully.");
}
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
