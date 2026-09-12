const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;

function utcDateInCurrentMonth(offset) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = ((now.getUTCDate() - 1 + offset) % daysInMonth + daysInMonth) % daysInMonth + 1;
  return new Date(Date.UTC(year, month, day));
}

function isoWeek(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  return Math.ceil((((value - yearStart) / DAY_MS) + 1) / 7);
}

const questionTemplates = [
  ["daily-new-01", "<6mo", 0, "What kind of date sounds best this week?", ["Cozy night in", "New food spot", "Scenic walk", "Playful activity"]],
  ["daily-new-02", "<6mo", 1, "Which small gesture feels sweetest?", ["Morning message", "Warm hug", "Favorite snack", "Helpful favor"]],
  ["daily-new-03", "<6mo", 2, "What would be fun to learn about each other next?", ["Childhood stories", "Dream destinations", "Everyday quirks", "Hidden talents"]],
  ["daily-new-04", "<6mo", 3, "Which setting makes conversation flow easiest?", ["Quiet cafe", "Long walk", "Dinner table", "Car ride"]],
  ["daily-new-05", "<6mo", 4, "What shared treat should we pick soon?", ["Dessert run", "Lazy brunch", "Movie snacks", "Fancy drinks"]],
  ["daily-new-06", "<6mo", 5, "Which compliment brightens your day most?", ["You look great", "You make me laugh", "I admire you", "I feel good with you"]],
  ["daily-new-07", "<6mo", 6, "What pace suits a free afternoon together?", ["Fully spontaneous", "One simple plan", "A loose itinerary", "Everything booked"]],
  ["daily-new-08", "<6mo", 7, "Which photo would be nicest to take together?", ["Silly selfie", "Scenic portrait", "Candid moment", "Dressed-up shot"]],
  ["daily-new-09", "<6mo", 8, "What kind of surprise feels most fun?", ["Tiny gift", "Secret date plan", "Unexpected visit", "Favorite food"]],
  ["daily-new-10", "<6mo", 9, "Which sound best fits our time together?", ["Shared playlist", "Easy laughter", "Quiet comfort", "City buzz"]],
  ["daily-new-11", "<6mo", 10, "What would make our next morning extra nice?", ["Slow breakfast", "Good-morning walk", "Coffee delivery", "Sleeping in"]],
  ["daily-new-12", "<6mo", 11, "Which mini-adventure should we try first?", ["Local market", "Museum visit", "Nature trail", "Arcade night"]],
  ["daily-new-13", "<6mo", 12, "What is your favorite way to end a date?", ["Dessert stop", "Lingering chat", "Short walk", "Big goodbye hug"]],
  ["daily-new-14", "<6mo", 13, "Which thing is most fun to choose together?", ["A restaurant", "A movie", "A playlist", "A day trip"]],
  ["daily-new-15", "<6mo", 14, "What kind of message is nicest to receive?", ["Funny update", "Thinking of you", "Sweet compliment", "Future plan"]],
  ["daily-new-16", "<6mo", 15, "Which season would be most fun for a getaway?", ["Spring", "Summer", "Autumn", "Winter"]],
  ["daily-new-17", "<6mo", 16, "What should our ideal picnic include?", ["Homemade bites", "Takeout favorites", "Fruit and sweets", "Just drinks"]],
  ["daily-new-18", "<6mo", 17, "Which playful challenge sounds best?", ["Trivia round", "Cooking contest", "Photo challenge", "Board game"]],
  ["daily-new-19", "<6mo", 18, "What helps you feel most welcomed on a date?", ["A warm greeting", "A clear plan", "Easy questions", "A thoughtful detail"]],
  ["daily-new-20", "<6mo", 19, "Which everyday moment would you happily share?", ["Grocery run", "Lunch break", "Evening commute", "Weekend errands"]],
  ["daily-new-21", "<6mo", 20, "What kind of humor makes us laugh most?", ["Silly jokes", "Clever wordplay", "Funny stories", "Playful teasing"]],
  ["daily-new-22", "<6mo", 21, "Where would a relaxed catch-up feel best?", ["At home", "By the water", "In a park", "At a cafe"]],
  ["daily-new-23", "<6mo", 22, "Which shared first would be most memorable?", ["Concert", "Road trip", "Cooking class", "Holiday outing"]],
  ["daily-new-24", "<6mo", 23, "What makes time together feel unhurried?", ["Phones away", "No fixed ending", "A quiet place", "A simple plan"]],
  ["daily-new-25", "<6mo", 24, "Which snack best belongs on our next date?", ["Popcorn", "Ice cream", "Fresh pastries", "Savory bites"]],
  ["daily-new-26", "<6mo", 25, "What would be cutest to remember from this season?", ["Our first photo", "An inside joke", "A favorite place", "A sweet message"]],
  ["daily-new-27", "<6mo", 26, "Which energy should our next date have?", ["Calm", "Curious", "Playful", "Romantic"]],
  ["daily-new-28", "<6mo", 27, "What would you enjoy showing your partner?", ["A favorite place", "A beloved movie", "A simple recipe", "A personal hobby"]],
  ["daily-new-29", "<6mo", 28, "Which plan sounds best after a long day?", ["Quick dinner", "Quiet cuddle", "Short stroll", "Funny show"]],
  ["daily-new-30", "<6mo", 29, "What would make this month feel special together?", ["One great date", "More little check-ins", "A new tradition", "A shared keepsake"]],

  ["daily-growing-01", "6-12mo", 0, "What helps us reconnect after a busy week?", ["Long conversation", "Cooking together", "Screen-free walk", "Movie night"]],
  ["daily-growing-02", "6-12mo", 1, "Which shared routine would be nicest to build?", ["Morning check-ins", "Weekly dates", "Meal planning", "Shared hobby"]],
  ["daily-growing-03", "6-12mo", 2, "Where should our next mini-adventure lead?", ["By the water", "Lively neighborhood", "Quiet nature trail", "Great food town"]],
  ["daily-growing-04", "6-12mo", 3, "Which part of our rhythm feels most natural?", ["Making plans", "Relaxing together", "Staying in touch", "Being playful"]],
  ["daily-growing-05", "6-12mo", 4, "What kind of shared goal sounds enjoyable?", ["Save for a trip", "Learn a skill", "Get more active", "Create something"]],
  ["daily-growing-06", "6-12mo", 5, "Which evening ritual would you choose?", ["Tea and talk", "Neighborhood walk", "One show together", "Music while cooking"]],
  ["daily-growing-07", "6-12mo", 6, "What should we celebrate more often?", ["Small wins", "Personal milestones", "Funny moments", "Quiet progress"]],
  ["daily-growing-08", "6-12mo", 7, "Which shared space sounds most inviting?", ["Cozy reading corner", "Bright kitchen", "Balcony garden", "Game table"]],
  ["daily-growing-09", "6-12mo", 8, "What is the best kind of weekend balance?", ["Plans and rest", "Mostly adventure", "Mostly downtime", "Completely spontaneous"]],
  ["daily-growing-10", "6-12mo", 9, "Which memory deserves a repeat?", ["Favorite meal", "Best day trip", "Coziest evening", "Funniest date"]],
  ["daily-growing-11", "6-12mo", 10, "How should we refresh a familiar date night?", ["New location", "Dress up", "Add a surprise", "Swap who plans"]],
  ["daily-growing-12", "6-12mo", 11, "What kind of teamwork feels most satisfying?", ["Finishing errands", "Planning a trip", "Making a meal", "Solving a puzzle"]],
  ["daily-growing-13", "6-12mo", 12, "Which conversation starter sounds most fun?", ["Dream home", "Perfect holiday", "Favorite era", "Unexpected talent"]],
  ["daily-growing-14", "6-12mo", 13, "What would make a shared playlist better?", ["Old favorites", "New discoveries", "Dance songs", "Calm tracks"]],
  ["daily-growing-15", "6-12mo", 14, "Which low-key date deserves more attention?", ["Bookstore browse", "Coffee walk", "Cook at home", "Sunset drive"]],
  ["daily-growing-16", "6-12mo", 15, "What kind of encouragement lands best?", ["You can do this", "I am proud of you", "I am here", "Take your time"]],
  ["daily-growing-17", "6-12mo", 16, "Which tradition would be fun to start?", ["Monthly photo", "Seasonal outing", "Birthday breakfast", "Yearly playlist"]],
  ["daily-growing-18", "6-12mo", 17, "What makes a trip feel like ours?", ["Local food", "Lots of photos", "Slow mornings", "One bold activity"]],
  ["daily-growing-19", "6-12mo", 18, "Which home-cooked meal mood sounds best?", ["Comfort classic", "New recipe", "Breakfast dinner", "Build-your-own plates"]],
  ["daily-growing-20", "6-12mo", 19, "What kind of update do you enjoy sharing first?", ["Good news", "Funny moment", "New idea", "Daily detail"]],
  ["daily-growing-21", "6-12mo", 20, "Which shared purchase would bring the most joy?", ["Picnic blanket", "Board game", "Kitchen gadget", "Instant camera"]],
  ["daily-growing-22", "6-12mo", 21, "What would make Sunday feel especially restful?", ["Late breakfast", "No alarms", "Outdoor time", "Early cozy night"]],
  ["daily-growing-23", "6-12mo", 22, "Which way of keeping memories suits us?", ["Photo album", "Ticket box", "Shared journal", "Video clips"]],
  ["daily-growing-24", "6-12mo", 23, "What should we make more room for?", ["Laughter", "New experiences", "Deep chats", "Quiet company"]],
  ["daily-growing-25", "6-12mo", 24, "Which double-date activity sounds easiest?", ["Casual dinner", "Game night", "Outdoor picnic", "Live show"]],
  ["daily-growing-26", "6-12mo", 25, "What kind of plan feels most thoughtful?", ["Favorite-place visit", "Surprise meal", "Restful day", "New experience"]],
  ["daily-growing-27", "6-12mo", 26, "Which weather makes the best couple day?", ["Bright sunshine", "Gentle rain", "Cool breeze", "Snowy skies"]],
  ["daily-growing-28", "6-12mo", 27, "What would be fun to master as a duo?", ["Signature dish", "Dance steps", "Travel planning", "Team game"]],
  ["daily-growing-29", "6-12mo", 28, "Which tiny check-in feels most caring?", ["Made it home?", "How is your day?", "Need anything?", "Thinking of you"]],
  ["daily-growing-30", "6-12mo", 29, "What should our next shared countdown be for?", ["Weekend plan", "Special dinner", "Short getaway", "Concert night"]],

  ["daily-lasting-01", "1yr+", 0, "Which part of our life together feels most rewarding?", ["Shared routines", "Mutual support", "Our memories", "Everyday laughter"]],
  ["daily-lasting-02", "1yr+", 1, "What would make an ordinary evening feel special?", ["Early-date remake", "Favorite meal", "Old photos", "Future trip plans"]],
  ["daily-lasting-03", "1yr+", 2, "What deserves more protected time together?", ["Unhurried talks", "Play and laughter", "Quiet rest", "New experiences"]],
  ["daily-lasting-04", "1yr+", 3, "Which familiar ritual still feels sweetest?", ["Hello kiss", "Shared meal", "Bedtime chat", "Weekend coffee"]],
  ["daily-lasting-05", "1yr+", 4, "What kind of new chapter sounds exciting?", ["Fresh hobby", "Big journey", "Home project", "New tradition"]],
  ["daily-lasting-06", "1yr+", 5, "Which story about us do you retell most?", ["How we met", "Funniest mishap", "Best adventure", "Sweet surprise"]],
  ["daily-lasting-07", "1yr+", 6, "What makes our home time feel warmest?", ["Favorite music", "Good food", "Soft lighting", "Easy conversation"]],
  ["daily-lasting-08", "1yr+", 7, "Which past date would you happily recreate?", ["First date", "Birthday outing", "Simple picnic", "Special dinner"]],
  ["daily-lasting-09", "1yr+", 8, "What should we put on the calendar soon?", ["Day off together", "Dinner out", "Friend gathering", "Nature escape"]],
  ["daily-lasting-10", "1yr+", 9, "Which shared skill has grown the most?", ["Planning", "Listening", "Making each other laugh", "Relaxing together"]],
  ["daily-lasting-11", "1yr+", 10, "What is our best cure for a dull day?", ["Favorite takeout", "Spontaneous outing", "Music and dancing", "Comedy night"]],
  ["daily-lasting-12", "1yr+", 11, "Which future memory sounds loveliest?", ["Big celebration", "Dream trip", "Quiet holiday", "Shared achievement"]],
  ["daily-lasting-13", "1yr+", 12, "What makes a celebration feel personal to us?", ["Meaningful gift", "Favorite meal", "Handwritten note", "Shared experience"]],
  ["daily-lasting-14", "1yr+", 13, "Which everyday task is better as a team?", ["Cooking", "Shopping", "Tidying", "Planning"]],
  ["daily-lasting-15", "1yr+", 14, "What kind of photo captures us best?", ["Laughing candid", "Travel snapshot", "Cozy selfie", "Celebration portrait"]],
  ["daily-lasting-16", "1yr+", 15, "Which conversation could fill a whole evening?", ["Travel dreams", "Old memories", "Creative ideas", "Future home"]],
  ["daily-lasting-17", "1yr+", 16, "What would make our next holiday feel fresh?", ["New destination", "New tradition", "Slower schedule", "Friends joining"]],
  ["daily-lasting-18", "1yr+", 17, "Which surprise would feel most delightful now?", ["Planned day out", "Thoughtful note", "Favorite treat", "Unexpected free time"]],
  ["daily-lasting-19", "1yr+", 18, "What shared comfort do you value most?", ["Quiet presence", "Familiar jokes", "Reliable routines", "Warm affection"]],
  ["daily-lasting-20", "1yr+", 19, "Which small upgrade would brighten daily life?", ["Better breakfasts", "Evening walks", "Cozy corner", "Shared calendar"]],
  ["daily-lasting-21", "1yr+", 20, "What kind of date helps us feel playful?", ["Arcade visit", "Karaoke", "Mini golf", "Cooking challenge"]],
  ["daily-lasting-22", "1yr+", 21, "Which part of a getaway matters most?", ["Beautiful place", "Good food", "Slow pace", "Fun activities"]],
  ["daily-lasting-23", "1yr+", 22, "What would be meaningful to create together?", ["Photo book", "Garden", "Signature recipe", "Travel map"]],
  ["daily-lasting-24", "1yr+", 23, "Which reminder of our early days feels nicest?", ["Old messages", "First photos", "Favorite song", "Meaningful place"]],
  ["daily-lasting-25", "1yr+", 24, "What kind of weekend would recharge us best?", ["Staycation", "Country escape", "City adventure", "Friends and food"]],
  ["daily-lasting-26", "1yr+", 25, "Which quality makes our partnership shine?", ["Kindness", "Humor", "Curiosity", "Steadiness"]],
  ["daily-lasting-27", "1yr+", 26, "What should we say yes to more often?", ["Last-minute plans", "Slow mornings", "Creative projects", "Little celebrations"]],
  ["daily-lasting-28", "1yr+", 27, "Which shared favorite never gets old?", ["A certain meal", "A beloved show", "A special place", "An inside joke"]],
  ["daily-lasting-29", "1yr+", 28, "What would make the next year memorable?", ["Meaningful trip", "Shared project", "New routine", "More photos"]],
  ["daily-lasting-30", "1yr+", 29, "Which simple plan feels most like us?", ["Cook and talk", "Wander somewhere", "Invite friends over", "Curl up together"]],
];

const themeTemplates = [
  ["weekly-new-01", "<6mo", "The story so far", "What is one moment from our time together that you would happily revisit, and what made it feel special?"],
  ["weekly-new-02", "<6mo", "Little discoveries", "What is something small you have enjoyed discovering about us, and what would you still love to learn?"],
  ["weekly-new-03", "<6mo", "Our kind of fun", "When have we felt most playful or at ease together, and what could bring us more moments like that?"],
  ["weekly-new-04", "<6mo", "Looking forward", "What simple experience would you be excited for us to share in the next few weeks?"],
  ["weekly-growing-01", "6-12mo", "Growing our rhythm", "Which part of our shared rhythm feels especially good lately, and what would be nice to add?"],
  ["weekly-growing-02", "6-12mo", "Favorite chapters", "Which memory from this stage of our relationship makes you smile most, and why?"],
  ["weekly-growing-03", "6-12mo", "A team in small ways", "What everyday thing do we do well together, and how does it make life feel lighter?"],
  ["weekly-growing-04", "6-12mo", "Next on our list", "What is one place, activity, or tradition you would enjoy making part of our story next?"],
  ["weekly-lasting-01", "1yr+", "What we keep choosing", "What is something about our partnership that you appreciate in a new way these days?"],
  ["weekly-lasting-02", "1yr+", "The comfort of us", "Which ordinary moment together has become quietly meaningful, and what do you love about it?"],
  ["weekly-lasting-03", "1yr+", "Still discovering", "What is something new you would enjoy exploring together, even in a small way?"],
  ["weekly-lasting-04", "1yr+", "Our next season", "As you picture the months ahead, what feeling or experience would you like us to make more room for?"],
];

async function seedQuestions(db = prisma) {
  const questions = questionTemplates.map(([id, bucketId, offset, question, options]) => ({
    id, bucketId, question, options, date: utcDateInCurrentMonth(offset),
  }));
  const baseWeek = isoWeek();
  const weekOffsetByBucket = {};
  const themes = themeTemplates.map(([id, bucketId, title, prompt]) => {
    const offset = weekOffsetByBucket[bucketId] ?? 0;
    weekOffsetByBucket[bucketId] = offset + 1;
    return { id, bucketId, weekNumber: baseWeek + offset, title, prompt };
  });

  await db.$transaction([
    db.weeklyTheme.deleteMany({}),
    ...questions.map((data) => db.dailyQuestion.upsert({ where: { id: data.id }, update: data, create: data })),
    ...themes.map((data) => db.weeklyTheme.upsert({ where: { id: data.id }, update: data, create: data })),
  ]);
  return { questions: questions.length, themes: themes.length };
}

if (require.main === module) {
  seedQuestions()
    .then((result) => console.log(`Seeded ${result.questions} daily questions and ${result.themes} weekly themes.`))
    .finally(() => prisma.$disconnect());
}

module.exports = { seedQuestions };
