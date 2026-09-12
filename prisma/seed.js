// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
const { catalogVersion, items: catalogItems } = require("./item-catalog");

const prisma = new PrismaClient();

const today = new Date();
today.setHours(0, 0, 0, 0);

const buckets = ["0-6mo", "6-12mo", "1yr+"];

const dailyQuestionTemplates = {
  "0-6mo": [
    { q: "Ideal first-date activity?", options: ["Coffee", "Dinner", "Hike", "Movie night"] },
    { q: "Best way to say good morning?", options: ["Text", "Voice note", "Meme", "Surprise visit"] },
    { q: "Favorite shared snack?", options: ["Popcorn", "Pizza", "Ice cream", "Fruit"] },
    { q: "Which pet fits us best?", options: ["Dog", "Cat", "Rabbit", "Plant"] },
    { q: "Emoji that describes us?", options: ["❤️", "🔥", "🥰", "🤗"] },
    { q: "Weekend vibe?", options: ["Lazy at home", "Adventure", "Brunch out", "Projects"] },
    { q: "Song mood for us?", options: ["Pop", "Indie", "R&B", "Classics"] },
    { q: "First trip together?", options: ["Beach", "Mountains", "City", "Road trip"] },
    { q: "Best gift?", options: ["Flowers", "Book", "Handwritten note", "Experience"] },
    { q: "Preferred way to end a date?", options: ["Walk", "Dessert", "Stargazing", "Call"] },
  ],
  "6-12mo": [
    { q: "How do we handle disagreements?", options: ["Talk it out", "Cool off", "Joke", "Hug"] },
    { q: "Love language?", options: ["Words", "Touch", "Acts of service", "Gifts", "Time"] },
    { q: "Household chore split?", options: ["Equal", "Specialize", "Rotate", "Outsource"] },
    { q: "Social battery as a couple?", options: ["Homebodies", "Party pair", "Balanced", "Depends"] },
    { q: "Best double-date idea?", options: ["Game night", "Tasting", "Hiking", "Concert"] },
    { q: "How do we celebrate wins?", options: ["Dinner out", "Dance", "Gift", "Quiet night"] },
    { q: "Comfort show?", options: ["Sitcom", "Reality", "Documentary", "Anime"] },
    { q: "Stress relief together?", options: ["Walk", "Cook", "Cuddle", "Gaming"] },
    { q: "Important value?", options: ["Honesty", "Loyalty", "Growth", "Fun"] },
    { q: "Perfect Sunday?", options: ["Brunch", "Nature", "Projects", "Movie marathon"] },
  ],
  "1yr+": [
    { q: "Biggest dream together?", options: ["Travel", "Home", "Family", "Career"] },
    { q: "Tradition we should keep?", options: ["Anniversary trips", "Weekly dates", "Holiday rituals", "Game nights"] },
    { q: "Most proud moment?", options: ["Moving in", "Travel", "Hard times", "Growth"] },
    { q: "Where do we see us in 5 years?", options: ["New city", "Same home", "Adventure", "Settled"] },
    { q: "Relationship strength?", options: ["Trust", "Laughter", "Support", "Passion"] },
    { q: "Next big goal?", options: ["Travel", "Save", "Renovate", "Learn"] },
    { q: "Favorite shared memory?", options: ["Trip", "Move-in", "Proposal", "Everyday joys"] },
    { q: "Way to keep spark alive?", options: ["Surprises", "Dates", "Letters", "New hobbies"] },
    { q: "Family tradition to start?", options: ["Cooking together", "Annual trip", "Volunteering", "Photos"] },
    { q: "One word for our bond?", options: ["Solid", "Playful", "Deep", "Adventurous"] },
  ],
};

const weeklyThemeTemplates = {
  "0-6mo": [
    { title: "First Impressions", prompt: "What was your first impression of your partner, and how has it changed?" },
    { title: "Tiny Joys", prompt: "Describe a small moment this week that made you smile." },
    { title: "Growing Closer", prompt: "What is one thing you are learning about each other?" },
    { title: "Next Adventure", prompt: "What would you love to experience together soon?" },
  ],
  "6-12mo": [
    { title: "Teamwork", prompt: "What challenge did you face together recently and how did you handle it?" },
    { title: "Love Languages", prompt: "How does your partner make you feel loved day-to-day?" },
    { title: "Rituals", prompt: "What routine or habit makes you feel connected?" },
    { title: "Communication", prompt: "What is one thing you want to communicate better?" },
  ],
  "1yr+": [
    { title: "Shared History", prompt: "Reflect on a favorite memory from the past year together." },
    { title: "Values", prompt: "What value matters most to us as a couple right now?" },
    { title: "Dreams", prompt: "What dream are you quietly excited about for our future?" },
    { title: "Gratitude", prompt: "What are you most grateful for in this relationship?" },
  ],
};

const legacyItems = [
  {
    name: "Heart Pillow",
    price: 50,
    description: "A soft reminder of us.",
    color: "#f43f5e",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="22" y="25" width="24" height="8" fill="#9f3451"/><rect x="54" y="25" width="24" height="8" fill="#9f3451"/><rect x="14" y="33" width="72" height="24" fill="#d94c6b"/><rect x="22" y="57" width="56" height="8" fill="#d94c6b"/><rect x="30" y="65" width="40" height="8" fill="#d94c6b"/><rect x="38" y="73" width="24" height="8" fill="#9f3451"/><rect x="22" y="33" width="16" height="8" fill="#ff91a8"/><rect x="30" y="41" width="8" height="8" fill="#ffd1d9"/><rect x="70" y="41" width="8" height="16" fill="#b83d5a"/></svg>`,
  },
  {
    name: "Potted Plant",
    price: 40,
    description: "A little green life to grow together.",
    color: "#16a34a",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="46" y="25" width="8" height="48" fill="#347052"/><rect x="22" y="25" width="24" height="16" fill="#559b68"/><rect x="14" y="33" width="24" height="16" fill="#76b878"/><rect x="54" y="17" width="24" height="24" fill="#76b878"/><rect x="62" y="25" width="24" height="24" fill="#559b68"/><rect x="30" y="49" width="24" height="16" fill="#559b68"/><rect x="34" y="65" width="32" height="8" fill="#8e4f36"/><rect x="38" y="73" width="24" height="16" fill="#b96d46"/><rect x="42" y="73" width="16" height="8" fill="#d89a64"/><rect x="34" y="89" width="32" height="4" fill="#6f3d32"/></svg>`,
  },
  {
    name: "Reading Lamp",
    price: 80,
    description: "Warm light for cozy evenings.",
    color: "#f59e0b",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="38" y="17" width="24" height="8" fill="#9b6038"/><rect x="30" y="25" width="40" height="24" fill="#e9a84c"/><rect x="38" y="25" width="24" height="8" fill="#ffd886"/><rect x="34" y="49" width="32" height="8" fill="#b8753f"/><rect x="46" y="57" width="8" height="24" fill="#72504a"/><rect x="30" y="81" width="40" height="8" fill="#72504a"/><rect x="38" y="77" width="24" height="4" fill="#9b6d58"/><rect x="66" y="33" width="8" height="16" fill="#c77c3c"/></svg>`,
  },
  {
    name: "Cozy Rug",
    price: 70,
    description: "A foundation for our room.",
    color: "#fb7185",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><polygon points="18,29 82,29 94,73 6,73" fill="#8f5365"/><polygon points="22,33 78,33 86,65 14,65" fill="#d97883"/><rect x="22" y="41" width="56" height="8" fill="#f4b1a7"/><rect x="30" y="49" width="40" height="8" fill="#f7d2b8"/><rect x="14" y="73" width="8" height="8" fill="#8f5365"/><rect x="30" y="73" width="8" height="8" fill="#8f5365"/><rect x="46" y="73" width="8" height="8" fill="#8f5365"/><rect x="62" y="73" width="8" height="8" fill="#8f5365"/><rect x="78" y="73" width="8" height="8" fill="#8f5365"/></svg>`,
  },
  {
    name: "Comfy Sofa",
    price: 150,
    description: "Room for two.",
    color: "#818cf8",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="18" y="29" width="64" height="8" fill="#4f607f"/><rect x="14" y="37" width="72" height="32" fill="#7386a8"/><rect x="6" y="45" width="16" height="32" fill="#566887"/><rect x="78" y="45" width="16" height="32" fill="#566887"/><rect x="14" y="61" width="72" height="20" fill="#879abb"/><rect x="22" y="65" width="24" height="8" fill="#9eb0ca"/><rect x="54" y="65" width="24" height="8" fill="#9eb0ca"/><rect x="14" y="81" width="12" height="8" fill="#4a4050"/><rect x="74" y="81" width="12" height="8" fill="#4a4050"/></svg>`,
  },
  {
    name: "Wall Poster",
    price: 60,
    description: "Art for our shared space.",
    color: "#c084fc",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="22" y="10" width="56" height="80" fill="#563f52"/><rect x="28" y="16" width="44" height="68" fill="#e8b5a0"/><rect x="36" y="24" width="28" height="24" fill="#cf7184"/><rect x="44" y="20" width="12" height="32" fill="#f1cf8e"/><rect x="32" y="60" width="12" height="16" fill="#718b75"/><rect x="44" y="52" width="12" height="24" fill="#59706d"/><rect x="56" y="64" width="12" height="12" fill="#718b75"/><rect x="28" y="16" width="8" height="8" fill="#f8dcc5"/></svg>`,
  },
  {
    name: "Tiny Keyboard", price: 120, description: "A little duet waiting to happen.", color: "#72504a",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="10" y="33" width="80" height="12" fill="#4c4050"/><rect x="14" y="45" width="72" height="24" fill="#e9ddc8"/><rect x="18" y="45" width="8" height="14" fill="#544957"/><rect x="34" y="45" width="8" height="14" fill="#544957"/><rect x="50" y="45" width="8" height="14" fill="#544957"/><rect x="66" y="45" width="8" height="14" fill="#544957"/><rect x="82" y="45" width="4" height="14" fill="#544957"/><rect x="18" y="25" width="20" height="8" fill="#d17b65"/><rect x="14" y="69" width="8" height="20" fill="#72504a"/><rect x="78" y="69" width="8" height="20" fill="#72504a"/></svg>`,
  },
  {
    name: "Book Nook", price: 110, description: "Stories, keepsakes, and room to grow.", color: "#8b5e3c",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="18" y="9" width="64" height="82" fill="#704631"/><rect x="24" y="15" width="52" height="20" fill="#d7a66d"/><rect x="24" y="41" width="52" height="18" fill="#d7a66d"/><rect x="24" y="65" width="52" height="20" fill="#d7a66d"/><rect x="28" y="19" width="8" height="16" fill="#c85f62"/><rect x="38" y="23" width="8" height="12" fill="#668b78"/><rect x="48" y="17" width="8" height="18" fill="#e0b15a"/><rect x="58" y="21" width="12" height="14" fill="#7184a5"/><rect x="28" y="45" width="20" height="14" fill="#78926c"/><rect x="52" y="43" width="8" height="16" fill="#b96555"/><rect x="62" y="47" width="10" height="12" fill="#e2c78b"/><rect x="32" y="73" width="12" height="12" fill="#7184a5"/><rect x="48" y="69" width="22" height="16" fill="#c87962"/></svg>`,
  },
  {
    name: "Patchwork Bed", price: 180, description: "The coziest corner of the room.", color: "#c87962",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><polygon points="22,21 76,21 92,65 36,65" fill="#75514a"/><polygon points="20,29 72,29 86,67 34,67" fill="#f0d9bd"/><polygon points="34,45 76,45 86,67 42,67" fill="#c87962"/><rect x="28" y="29" width="22" height="16" fill="#fff0d8"/><rect x="36" y="49" width="12" height="10" fill="#e6aa86"/><rect x="48" y="49" width="12" height="10" fill="#a9aa7c"/><rect x="60" y="49" width="12" height="10" fill="#e6aa86"/><rect x="42" y="59" width="12" height="8" fill="#a9aa7c"/><rect x="54" y="59" width="12" height="8" fill="#e6aa86"/><rect x="66" y="59" width="12" height="8" fill="#a9aa7c"/><rect x="34" y="67" width="8" height="20" fill="#68473e"/><rect x="82" y="67" width="8" height="20" fill="#68473e"/></svg>`,
  },
  {
    name: "Desk Monitor", price: 140, description: "For side projects and shared playlists.", color: "#607d82",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="24" y="13" width="52" height="42" fill="#4d4853"/><rect x="30" y="19" width="40" height="28" fill="#8bb2ad"/><rect x="34" y="23" width="24" height="8" fill="#d4dfc3"/><rect x="58" y="35" width="8" height="8" fill="#efb56f"/><rect x="46" y="55" width="8" height="10" fill="#4d4853"/><rect x="38" y="65" width="24" height="6" fill="#66504a"/><rect x="10" y="71" width="80" height="10" fill="#9a6845"/><rect x="18" y="81" width="8" height="12" fill="#704936"/><rect x="74" y="81" width="8" height="12" fill="#704936"/><rect x="62" y="61" width="18" height="6" fill="#ded0b8"/></svg>`,
  },
];

async function main() {
  // Clean seeded content
  await prisma.currencyTransaction.deleteMany({});
  await prisma.placedItem.deleteMany({});
  await prisma.dailyAnswer.deleteMany({});
  await prisma.weeklyEntry.deleteMany({});
  await prisma.weeklyTheme.deleteMany({});
  await prisma.dailyQuestion.deleteMany({});
  await prisma.roomSlot.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.couple.deleteMany({});

  // Seed items
  for (const item of catalogItems) {
    await prisma.item.create({ data: item });
  }

  // Seed daily questions
  for (const bucket of buckets) {
    const templates = dailyQuestionTemplates[bucket];
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      await prisma.dailyQuestion.create({
        data: {
          question: t.q,
          options: t.options,
          bucketId: bucket,
          date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Seed weekly themes
  for (const bucket of buckets) {
    const templates = weeklyThemeTemplates[bucket];
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      await prisma.weeklyTheme.create({
        data: {
          weekNumber: bucketBase(bucket) + i,
          bucketId: bucket,
          title: t.title,
          prompt: t.prompt,
        },
      });
    }
  }

  console.log(`Seed complete: ${catalogVersion} items, daily questions, weekly themes`);
}

function bucketBase(bucket) {
  if (bucket === "0-6mo") return 1000;
  if (bucket === "6-12mo") return 2000;
  return 3000;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
