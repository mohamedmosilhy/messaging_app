import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

const SEED_PASSWORD = "Test12345";
const TEST_USER_EMAIL = "mohamed@example.com";
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MAX_LENGTH_MESSAGE = `Maximum-length message: ${"x".repeat(976)}`;

type SeedUser = {
  username: string;
  email: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  joinedDaysAgo: number;
};

type SeedMessage = {
  from: string;
  content: string;
  at: Date;
};

const now = new Date();
now.setMilliseconds(0);

const ago = (milliseconds: number) => new Date(now.getTime() - milliseconds);

const usersData: SeedUser[] = [
  {
    username: "mohamed",
    email: TEST_USER_EMAIL,
    displayName: "Mohamed Mosilhy",
    bio: "Full-stack developer building useful products one careful commit at a time.",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    joinedDaysAgo: 420,
  },
  {
    username: "layla_hassan",
    email: "layla.hassan@example.com",
    displayName: "Layla Hassan",
    bio: "Product designer. Cairo, coffee, and tiny details.",
    avatarUrl: "https://i.pravatar.cc/300?img=47",
    joinedDaysAgo: 390,
  },
  {
    username: "youssef_adel",
    email: "youssef.adel@example.com",
    displayName: "Youssef Adel",
    bio: "Backend engineer working with TypeScript and PostgreSQL.",
    avatarUrl: "https://i.pravatar.cc/300?img=11",
    joinedDaysAgo: 365,
  },
  {
    username: "salma_nabil",
    email: "salma.nabil@example.com",
    displayName: "Salma Nabil",
    bio: "Frontend developer and accessibility advocate.",
    avatarUrl: "https://i.pravatar.cc/300?img=45",
    joinedDaysAgo: 330,
  },
  {
    username: "omar_fathy",
    email: "omar.fathy@example.com",
    displayName: "Omar Fathy",
    bio: "Mobile engineer. Usually debugging something.",
    avatarUrl: "https://i.pravatar.cc/300?img=14",
    joinedDaysAgo: 300,
  },
  {
    username: "nour_samy",
    email: "nour.samy@example.com",
    displayName: "Nour Samy",
    bio: null,
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    joinedDaysAgo: 280,
  },
  {
    username: "karim_mansour",
    email: "karim.mansour@example.com",
    displayName: "Karim Mansour",
    bio: "DevOps, observability, and calm incident response.",
    avatarUrl: "https://i.pravatar.cc/300?img=13",
    joinedDaysAgo: 260,
  },
  {
    username: "hana_amin",
    email: "hana.amin@example.com",
    displayName: "Hana Amin",
    bio: "Technical writer making complicated things feel simple.",
    avatarUrl: null,
    joinedDaysAgo: 240,
  },
  {
    username: "adam_waleed",
    email: "adam.waleed@example.com",
    displayName: "Adam Waleed",
    bio: "QA engineer. If it can break, I will probably find it.",
    avatarUrl: "https://i.pravatar.cc/300?img=8",
    joinedDaysAgo: 220,
  },
  {
    username: "dina_ashraf",
    email: "dina.ashraf@example.com",
    displayName: "Dina Ashraf",
    bio: "Data analyst, amateur baker.",
    avatarUrl: "https://i.pravatar.cc/300?img=44",
    joinedDaysAgo: 190,
  },
  {
    username: "rami_khaled",
    email: "rami.khaled@example.com",
    displayName: "Rami Khaled",
    bio: "Engineering manager interested in healthy teams.",
    avatarUrl: "https://i.pravatar.cc/300?img=15",
    joinedDaysAgo: 170,
  },
  {
    username: "farah_tarek",
    email: "farah.tarek@example.com",
    displayName: "Farah Tarek",
    bio: "New here — say hello!",
    avatarUrl: "https://i.pravatar.cc/300?img=49",
    joinedDaysAgo: 14,
  },
  {
    username: "ahmed_ali",
    email: "ahmed.ali@example.com",
    displayName: "Ahmed Ali",
    bio: "Open-source contributor.",
    avatarUrl: "https://i.pravatar.cc/300?img=5",
    joinedDaysAgo: 210,
  },
  {
    username: "sara_ibrahim",
    email: "sara.ibrahim@example.com",
    displayName: "Sara Ibrahim",
    bio: "UI illustrator.",
    avatarUrl: "https://i.pravatar.cc/300?img=48",
    joinedDaysAgo: 205,
  },
];

const alexProfiles = [
  ["alex_adams", "Alex Adams"],
  ["alex_bennett", "Alex Bennett"],
  ["alex_brooks", "Alex Brooks"],
  ["alex_carter", "Alex Carter"],
  ["alex_chen", "Alex Chen"],
  ["alex_clarke", "Alex Clarke"],
  ["alex_cooper", "Alex Cooper"],
  ["alex_davis", "Alex Davis"],
  ["alex_diaz", "Alex Diaz"],
  ["alex_evans", "Alex Evans"],
  ["alex_foster", "Alex Foster"],
  ["alex_garcia", "Alex Garcia"],
  ["alex_green", "Alex Green"],
  ["alex_hall", "Alex Hall"],
  ["alex_hughes", "Alex Hughes"],
  ["alex_james", "Alex James"],
  ["alex_johnson", "Alex Johnson"],
  ["alex_kim", "Alex Kim"],
  ["alex_lee", "Alex Lee"],
  ["alex_martin", "Alex Martin"],
  ["alex_morgan", "Alex Morgan"],
  ["alex_patel", "Alex Patel"],
] as const;

for (const [index, [username, displayName]] of alexProfiles.entries()) {
  usersData.push({
    username,
    email: `${username}@example.com`,
    displayName,
    bio:
      index % 3 === 0
        ? "Software professional testing a new messaging app."
        : null,
    avatarUrl:
      index % 4 === 0
        ? `https://i.pravatar.cc/300?img=${20 + (index % 30)}`
        : null,
    joinedDaysAgo: 120 - index,
  });
}

function dialogue(
  start: Date,
  intervalMinutes: number,
  entries: Array<[from: string, content: string]>,
): SeedMessage[] {
  return entries.map(([from, content], index) => ({
    from,
    content,
    at: new Date(start.getTime() + index * intervalMinutes * MINUTE),
  }));
}

const laylaMessages = dialogue(ago(9 * DAY), 11, [
  ["layla_hassan", "Morning! I reviewed the new conversation screen."],
  ["mohamed", "Great timing. What stood out first?"],
  [
    "layla_hassan",
    "The layout feels clean, but the empty state could be warmer.",
  ],
  ["mohamed", "Agreed. Maybe a short prompt to search for someone?"],
  ["layla_hassan", "Exactly, with one clear action instead of a blank panel."],
  ["mohamed", "I’ll sketch that into the dashboard today."],
  ["layla_hassan", "Also, long display names need a little more room."],
  ["mohamed", "Good catch. I can truncate them without hiding the username."],
  [
    "layla_hassan",
    "That sounds right. The username is useful context in search.",
  ],
  ["mohamed", "How does the message spacing feel?"],
  ["layla_hassan", "Comfortable on desktop. Mobile could be slightly tighter."],
  ["mohamed", "I’ll use a smaller gap below the tablet breakpoint."],
  ["layla_hassan", "Perfect. Are avatars optional in the API?"],
  ["mohamed", "Yes, so I added initials as the fallback."],
  [
    "layla_hassan",
    "Nice. That will make incomplete profiles look intentional.",
  ],
  ["mohamed", "I’m testing a few incomplete profiles in the seed data."],
  ["layla_hassan", "Smart. Add an extra-long bio too, near the allowed limit."],
  ["mohamed", "Noted. I want the test data to expose layout issues early."],
  [
    "layla_hassan",
    "The conversation list also needs clear selected-state contrast.",
  ],
  ["mohamed", "I’m trying a soft blue background with a stronger left edge."],
  ["layla_hassan", "Send me a screenshot when it is ready."],
  ["mohamed", "Will do after I finish cursor pagination."],
  ["layla_hassan", "How many messages are you loading per page?"],
  ["mohamed", "Twenty, with one extra row to detect the next page."],
  [
    "layla_hassan",
    "Good. This thread should be long enough to test three pages.",
  ],
  ["mohamed", "That is exactly why we are talking so much 😄"],
  ["layla_hassan", "Finally, a practical reason for a long design review."],
  ["mohamed", "I also added stable ordering for identical timestamps."],
  ["layla_hassan", "Can the seed create two messages at the same instant?"],
  ["mohamed", "Yes. I’ll make a pair share a timestamp."],
  [
    "layla_hassan",
    "Then pagination should never duplicate or skip either one.",
  ],
  ["mohamed", "Right, the message ID acts as the tie-breaker."],
  ["layla_hassan", "I checked the profile settings form as well."],
  ["mohamed", "Anything confusing there?"],
  [
    "layla_hassan",
    "No, but previewing the avatar URL would be a nice follow-up.",
  ],
  ["mohamed", "I’ll keep that outside this pass and finish the core flow."],
  ["layla_hassan", "Makes sense. Core behavior first."],
  ["mohamed", "The blocked-user scenarios are ready too."],
  ["layla_hassan", "Do old messages stay visible after someone is blocked?"],
  ["mohamed", "Yes. Blocking stops new contact but preserves history."],
  ["layla_hassan", "That is the behavior users will expect."],
  ["mohamed", "I’m doing a final pass on realistic timestamps now."],
  [
    "layla_hassan",
    "Great. Relative dates make the list much easier to inspect.",
  ],
  ["mohamed", "The build is clean so far."],
  ["layla_hassan", "Nice work. Send the final test notes when you’re done."],
  ["mohamed", "Will do — thanks for the thorough review!"],
]);

// Exercise the createdAt + id tie-breaker used by message cursor pagination.
laylaMessages[28].at = laylaMessages[27].at;

const conversations: Array<{
  firstUser: string;
  secondUser: string;
  messages: SeedMessage[];
  createdAt?: Date;
  unreadCounts?: Record<string, number>;
}> = [
  {
    firstUser: "mohamed",
    secondUser: "layla_hassan",
    messages: laylaMessages,
  },
  {
    firstUser: "mohamed",
    secondUser: "youssef_adel",
    messages: dialogue(ago(3 * DAY), 18, [
      ["mohamed", "Did the database index help the message query?"],
      ["youssef_adel", "Yes, the query plan is much better now."],
      ["mohamed", "Nice. I’m using createdAt and id for the cursor."],
      ["youssef_adel", "That avoids unstable pages when timestamps match."],
      ["mohamed", "Exactly. I capped the API limit at fifty too."],
      ["youssef_adel", "Good safety rail. What is the UI default?"],
      ["mohamed", "Twenty messages per request."],
      ["youssef_adel", "Then seed at least twenty-one in one chat."],
      ["mohamed", "Already planned. I want the next-page boundary covered."],
      ["youssef_adel", "Are you updating lastMessage in the same transaction?"],
      ["mohamed", "Yes, message creation and metadata update commit together."],
      [
        "youssef_adel",
        "Perfect. Otherwise the inbox order could become stale.",
      ],
      ["mohamed", "I also normalize email and username during registration."],
      ["youssef_adel", "That will prevent duplicates with different casing."],
      ["mohamed", "Search is case-insensitive and prefix-based."],
      ["youssef_adel", "Make sure the dataset has enough shared prefixes."],
      ["mohamed", "There will be twenty-two Alex profiles."],
      ["youssef_adel", "Very specific, but excellent for pagination testing."],
      ["mohamed", "Specific test data is the best kind."],
      ["youssef_adel", "True. Ping me after you run the checks."],
      [
        "mohamed",
        "Everything passed. Thanks for helping me reason through it.",
      ],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "salma_nabil",
    messages: dialogue(ago(26 * HOUR), 7, [
      ["salma_nabil", "I tested the keyboard flow on the login page."],
      ["mohamed", "Could you reach every field and action?"],
      ["salma_nabil", "Yes. The focus order is logical."],
      ["mohamed", "How were the validation messages?"],
      [
        "salma_nabil",
        "Clear, though the invalid-email message could appear sooner.",
      ],
      ["mohamed", "I’ll review when validation runs."],
      ["salma_nabil", "The search results are keyboard accessible too."],
      ["mohamed", "Excellent. That was one of my main concerns."],
      ["salma_nabil", "I also tried a profile without an avatar."],
      ["mohamed", "Did the initials fallback render correctly?"],
      ["salma_nabil", "Yes, including at the small conversation-list size."],
      ["mohamed", "Perfect — thank you for checking accessibility."],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "omar_fathy",
    messages: dialogue(ago(7 * HOUR), 13, [
      ["mohamed", "Are we still on for coffee tomorrow?"],
      ["omar_fathy", "Absolutely. Same place around ten?"],
      ["mohamed", "Ten works for me."],
      ["omar_fathy", "Great, I’ll bring the mobile mockups."],
      ["mohamed", "Perfect. See you tomorrow ☕"],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "nour_samy",
    unreadCounts: { mohamed: 1 },
    messages: [
      {
        from: "nour_samy",
        content: "Welcome back! Your new profile looks great.",
        at: ago(2 * HOUR),
      },
    ],
  },
  {
    firstUser: "mohamed",
    secondUser: "karim_mansour",
    unreadCounts: { mohamed: 2 },
    messages: dialogue(ago(55 * MINUTE), 9, [
      ["karim_mansour", "The staging database backup completed successfully."],
      ["mohamed", "Great. Did the restore check pass too?"],
      ["karim_mansour", "Yes — backup, restore, and smoke test are all green."],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "hana_amin",
    messages: dialogue(ago(32 * MINUTE), 6, [
      [
        "mohamed",
        "I rewrote the setup notes: install dependencies, configure DATABASE_URL, run the migration, seed the database, and then start the development server. Does that sequence read clearly?",
      ],
      [
        "hana_amin",
        "Very clearly. I would also put the demo credentials directly below the seed command so nobody has to hunt for them.",
      ],
      ["mohamed", "Good idea — I’ll add a concise testing section."],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "adam_waleed",
    unreadCounts: { mohamed: 3 },
    messages: dialogue(ago(18 * MINUTE), 2, [
      ["adam_waleed", "I found one odd case: send a message with only spaces."],
      ["mohamed", "That should be rejected after trimming."],
      ["adam_waleed", "It is. I also tried a message over 1,000 characters."],
      ["mohamed", "And the maximum-length validation appeared?"],
      [
        "adam_waleed",
        "Yes. Unauthorized conversation access returns an error too.",
      ],
      ["mohamed", "Great. Anything else in the smoke test?"],
      [
        "adam_waleed",
        "Conversation ordering updates immediately after sending.",
      ],
      ["mohamed", "Excellent. That covers the main messaging path."],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "rami_khaled",
    messages: [
      {
        from: "rami_khaled",
        content: MAX_LENGTH_MESSAGE,
        at: ago(6 * DAY),
      },
    ],
  },
  {
    firstUser: "mohamed",
    secondUser: "dina_ashraf",
    createdAt: ago(5 * DAY),
    messages: [],
  },
  {
    firstUser: "mohamed",
    secondUser: "ahmed_ali",
    messages: dialogue(ago(45 * DAY), 20, [
      ["ahmed_ali", "I don’t think we should continue this conversation."],
      ["mohamed", "Understood. I’ll respect that. Take care."],
    ]),
  },
  {
    firstUser: "mohamed",
    secondUser: "sara_ibrahim",
    messages: dialogue(ago(60 * DAY), 15, [
      ["mohamed", "Thanks for sending the illustration draft."],
      [
        "sara_ibrahim",
        "You’re welcome. I’m stepping away from the project now.",
      ],
    ]),
  },
];

async function resetDatabase() {
  // Conversation.lastMessageId points back to Message, so break that reference
  // before deleting messages and conversations.
  await prisma.$transaction([
    prisma.conversation.updateMany({
      data: { lastMessageId: null, lastMessageAt: null },
    }),
    prisma.rateLimitBucket.deleteMany(),
    prisma.block.deleteMany(),
    prisma.message.deleteMany(),
    prisma.participation.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createDirectConversation(
  users: Map<string, { id: string }>,
  seed: (typeof conversations)[number],
) {
  const first = users.get(seed.firstUser);
  const second = users.get(seed.secondUser);

  if (!first || !second) {
    throw new Error(
      `Missing participant for ${seed.firstUser}/${seed.secondUser}`,
    );
  }

  const participantKey = [first.id, second.id].sort().join(":");
  const firstMessageAt = seed.messages[0]?.at ?? seed.createdAt ?? ago(DAY);

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      participantKey,
      createdAt: new Date(firstMessageAt.getTime() - 5 * MINUTE),
    },
  });

  await prisma.participation.createMany({
    data: [
      {
        userId: first.id,
        conversationId: conversation.id,
        createdAt: conversation.createdAt,
      },
      {
        userId: second.id,
        conversationId: conversation.id,
        createdAt: conversation.createdAt,
      },
    ],
  });

  if (seed.unreadCounts) {
    await Promise.all(
      Object.entries(seed.unreadCounts).map(([username, unreadCount]) => {
        const user = users.get(username);

        if (!user) {
          throw new Error(`Missing unread-count user: ${username}`);
        }

        return prisma.participation.update({
          where: {
            userId_conversationId: {
              userId: user.id,
              conversationId: conversation.id,
            },
          },
          data: { unreadCount },
        });
      }),
    );
  }

  let lastMessage: { id: string; createdAt: Date } | null = null;

  for (const [messageIndex, message] of seed.messages.entries()) {
    const sender = users.get(message.from);

    if (!sender || (sender.id !== first.id && sender.id !== second.id)) {
      throw new Error(
        `${message.from} is not a participant in this conversation.`,
      );
    }

    lastMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        clientId: `seed-${conversation.id}-${messageIndex}`,
        content: message.content,
        createdAt: message.at,
      },
      select: { id: true, createdAt: true },
    });
  }

  if (lastMessage) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageId: lastMessage.id,
        lastMessageAt: lastMessage.createdAt,
        updatedAt: lastMessage.createdAt,
      },
    });
  }
}

async function main() {
  console.log("Resetting database...");
  await resetDatabase();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.createMany({
    data: usersData.map(({ joinedDaysAgo, ...user }) => ({
      ...user,
      passwordHash,
      createdAt: ago(joinedDaysAgo * DAY),
    })),
  });

  const createdUsers = await prisma.user.findMany({
    select: { id: true, username: true },
  });
  const users = new Map(
    createdUsers.map((user) => [user.username, { id: user.id }]),
  );

  for (const conversation of conversations) {
    await createDirectConversation(users, conversation);
  }

  const mohamed = users.get("mohamed");
  const ahmed = users.get("ahmed_ali");
  const sara = users.get("sara_ibrahim");

  if (!mohamed || !ahmed || !sara) {
    throw new Error("Could not create users required for block scenarios.");
  }

  await prisma.block.createMany({
    data: [
      {
        blockerId: mohamed.id,
        blockedId: ahmed.id,
        createdAt: ago(40 * DAY),
      },
      {
        blockerId: sara.id,
        blockedId: mohamed.id,
        createdAt: ago(55 * DAY),
      },
    ],
  });

  const messageCount = conversations.reduce(
    (total, conversation) => total + conversation.messages.length,
    0,
  );

  console.log(`
Database seeded successfully.

Primary test account
  Email:    ${TEST_USER_EMAIL}
  Password: ${SEED_PASSWORD}

Secondary test account
  Email:    layla.hassan@example.com
  Password: ${SEED_PASSWORD}

Created
  ${usersData.length} users
  ${conversations.length} direct conversations
  ${messageCount} messages
  2 block relationships

Useful checks
  Search "alex" to test result pagination.
  Open Layla's chat to test three message pages.
  Search "farah" to start a brand-new conversation.
  Open Dina's empty thread to test the first-message state.
  Open Rami's thread to test a 1,000-character message.
  Nour, Karim, and Adam exercise unread badges of 1, 2, and 3.
  Ahmed is blocked by Mohamed; Sara has blocked Mohamed.
`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
