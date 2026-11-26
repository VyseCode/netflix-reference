import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/netflix_ref";
const dbName = new URL(URI).pathname.replace(/^\//, "").split("?")[0] || "netflix_ref";
if (dbName !== "netflix_ref") {
  throw new Error(`Refusing to seed database "${dbName}"; expected netflix_ref`);
}

const objectId = () => new mongoose.Types.ObjectId();
const schemas = {
  User: new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, lowercase: true },
      password: { type: String, select: false },
      activeProfile: mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true },
  ),
  Profile: new mongoose.Schema(
    {
      account: mongoose.Schema.Types.ObjectId,
      name: String,
      avatarColor: String,
      kids: Boolean,
      maxRating: Number,
    },
    { timestamps: true },
  ),
  Title: new mongoose.Schema(
    {
      type: String,
      title: String,
      genres: [String],
      year: Number,
      rating: Number,
      maturity: Number,
      cast: [String],
      description: String,
      thumbnailUrl: String,
      durationMinutes: Number,
      trendingScore: Number,
      addedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
  Season: new mongoose.Schema(
    {
      title: mongoose.Schema.Types.ObjectId,
      seasonNumber: Number,
      year: Number,
      episodeCount: { type: Number, default: 0 },
    },
    { timestamps: true },
  ),
  Episode: new mongoose.Schema(
    {
      season: mongoose.Schema.Types.ObjectId,
      title: mongoose.Schema.Types.ObjectId,
      episodeNumber: Number,
      name: String,
      description: String,
      durationMinutes: Number,
      thumbnailUrl: String,
    },
    { timestamps: true },
  ),
  WatchlistItem: new mongoose.Schema(
    {
      profile: mongoose.Schema.Types.ObjectId,
      title: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
  Reaction: new mongoose.Schema(
    {
      profile: mongoose.Schema.Types.ObjectId,
      title: mongoose.Schema.Types.ObjectId,
      value: String,
    },
    { timestamps: true },
  ),
  Progress: new mongoose.Schema(
    {
      profile: mongoose.Schema.Types.ObjectId,
      title: mongoose.Schema.Types.ObjectId,
      episode: { type: mongoose.Schema.Types.ObjectId, default: null },
      positionSeconds: Number,
      durationSeconds: Number,
      completed: Boolean,
    },
    { timestamps: true },
  ),
};

schemas.Profile.index({ account: 1, name: 1 }, { unique: true });
schemas.Profile.index({ account: 1, createdAt: 1 });
schemas.Title.index({ type: 1, addedAt: -1 });
schemas.Title.index({ trendingScore: -1 });
schemas.Title.index({ rating: -1 });
schemas.Title.index({ genres: 1, rating: -1 });
schemas.Title.index({ year: -1 });
schemas.Title.index({ maturity: 1, rating: -1 });
schemas.Title.index(
  { title: "text", genres: "text", cast: "text", description: "text" },
  { weights: { title: 6, genres: 3, cast: 2, description: 1 }, name: "title_text" },
);
schemas.Season.index({ title: 1, seasonNumber: 1 }, { unique: true });
schemas.Episode.index({ season: 1, episodeNumber: 1 }, { unique: true });
schemas.Episode.index({ title: 1 });
schemas.WatchlistItem.index({ profile: 1, title: 1 }, { unique: true });
schemas.WatchlistItem.index({ profile: 1, addedAt: -1 });
schemas.Reaction.index({ profile: 1, title: 1 }, { unique: true });
schemas.Reaction.index({ profile: 1, value: 1 });
schemas.Progress.index({ profile: 1, title: 1 }, { unique: true });
schemas.Progress.index({ profile: 1, updatedAt: -1 });

const M = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, mongoose.model(name, schema)]),
);

const t = (type, title, genres, year, rating, maturity, cast, description, durationMinutes, poster, trendingScore) => ({
  type, title, genres, year, rating, maturity, cast, description,
  thumbnailUrl: `/posters/${poster}.svg`, durationMinutes, trendingScore,
});

const titles = [
  t("movie", "Midnight Courier", ["Thriller", "Action"], 2024, 7.8, 16, ["Nora Vale", "Elias Renton"], "A night courier discovers the package she is carrying is linked to her own disappearance.", 104, "nocturne", 880),
  t("movie", "The Salt Road", ["Adventure", "Drama"], 2022, 8.1, 13, ["Meera Rao", "Tomas Berg"], "Two estranged siblings cross a salt flat to honour a promise made to their father.", 118, "dunes", 610),
  t("movie", "Orbit Nine", ["Sci-Fi", "Thriller"], 2025, 8.4, 13, ["Imani Cole", "Julian Frost"], "A station engineer hears a voice from a ship that vanished thirty years ago.", 127, "orbit", 940),
  t("movie", "Little Furnace", ["Drama"], 2023, 7.4, 16, ["Ada Whitlock"], "A baker in a declining town fights to keep her grandmother's oven alive.", 96, "ember", 340),
  t("movie", "Paper Tigers", ["Comedy", "Crime"], 2021, 7.0, 13, ["Dev Kapoor", "Rosa Marin"], "Two amateur magicians witness a heist and must act like they belong.", 101, "monolith", 420),
  t("movie", "Blue Hour", ["Romance", "Drama"], 2020, 7.6, 13, ["Lena Park", "Owen Hale"], "A photographer and a lighthouse keeper keep missing each other by one tide.", 109, "tide", 510),
  t("movie", "The Long Quiet", ["Horror", "Mystery"], 2024, 6.9, 16, ["Sofia Reyes", "Callum Vale"], "A sound engineer inherits a cabin where silence is never truly silent.", 98, "canopy", 700),
  t("movie", "Glasshouse", ["Drama", "Mystery"], 2019, 7.9, 16, ["Marta Lindqvist", "Arun Mehta"], "A widow returns to the greenhouse where her husband vanished and finds fresh footprints.", 112, "prism", 390),
  t("movie", "Copper Sky", ["Adventure", "History"], 2026, 8.0, 13, ["Ravi Menon", "Edith Rowan"], "A balloonist crosses an uncharted continent to deliver a letter that cannot wait.", 121, "horizon", 905),
  t("movie", "Static Bloom", ["Sci-Fi", "Drama"], 2023, 7.5, 13, ["Yuki Tanaka", "Peter Osei"], "A botanist discovers plants that grow in response to radio signals.", 107, "signal", 560),
  t("movie", "Widow's Clock", ["Mystery", "Thriller"], 2018, 7.2, 16, ["Helen Barrow"], "Every night at 2:14 a clock stops and a neighbour disappears by morning.", 94, "monolith", 280),
  t("movie", "Tenement Rhythm", ["Music", "Drama"], 2022, 8.2, 13, ["Malik Johnson", "Clara Voss"], "A percussionist turns a housing block's everyday noises into a symphony.", 103, "signal", 460),
  t("movie", "The Cartographer", ["Adventure", "History"], 2021, 7.7, 13, ["Ana Ferreira", "Theo March"], "A mapmaker must redraw a border that is about to erase her village.", 116, "dunes", 350),
  t("movie", "Nightjar", ["Thriller"], 2025, 7.3, 16, ["Ruth Okafor", "Daniel Kade"], "An insomnia researcher becomes the unwilling subject of her own study.", 99, "nocturne", 760),
  t("movie", "Fern Hollow", ["Animation", "Family"], 2024, 8.3, 0, ["Ivy Chen", "Ben Rogers"], "A young fox must reunite the forest before the first frost seals the valleys.", 88, "canopy", 890),
  t("movie", "The Understudy", ["Drama", "Comedy"], 2020, 7.1, 13, ["Gwen Bell", "Nico Silva"], "A permanent understudy gets the lead on the night the theatre loses its roof.", 102, "ember", 300),
  t("movie", "Depths of Tidewater", ["Documentary"], 2023, 8.6, 7, ["Ruth Okafor"], "Six months with the divers who are rebuilding a drowned coastal town.", 84, "tide", 520),
  t("movie", "Redline", ["Action", "Sport"], 2022, 7.4, 13, ["Kai Nakamura", "Sofia Reyes"], "A disgraced racer returns for one final climb up a mountain pass.", 108, "ember", 480),
  t("movie", "A Small Inheritance", ["Comedy", "Drama"], 2019, 7.8, 13, ["Priya Nair", "Owen Hale"], "Three cousins inherit a failing cinema and cannot agree on what to screen.", 100, "orbit", 310),
  t("movie", "The Glass Meridian", ["Sci-Fi", "Adventure"], 2026, 8.5, 13, ["Imani Cole", "Tomas Berg"], "Explorers follow a line of glass across a desert that shifts every night.", 132, "prism", 960),
  t("movie", "Hollow Season", ["Horror", "Drama"], 2021, 6.8, 16, ["Marta Lindqvist"], "A harvest festival reveals a secret a town has kept for decades.", 101, "canopy", 410),
  t("movie", "Brass & Bone", ["Music", "History"], 2018, 7.9, 13, ["Malik Johnson", "Edith Rowan"], "A jazz band tours a country on the edge of political collapse.", 115, "monolith", 260),
  t("movie", "The Quiet Archivist", ["Mystery", "Drama"], 2024, 8.0, 13, ["Ana Ferreira", "Julian Frost"], "An archivist uncovers a file that rewrites her family's official history.", 110, "circuit", 730),
  t("movie", "Paper Boats", ["Animation", "Drama"], 2022, 8.1, 7, ["Ivy Chen", "Ravi Menon"], "Two children send messages down a river and learn what travels farther than expected.", 82, "tide", 540),
  t("movie", "Cold Fuel", ["Action", "Thriller"], 2025, 7.2, 16, ["Nora Vale", "Kai Nakamura"], "A winter convoy driver must choose between the cargo and the strangers on the road.", 106, "circuit", 810),
  t("movie", "The Half-Life of Summer", ["Romance"], 2023, 7.7, 13, ["Lena Park", "Dev Kapoor"], "Two former classmates meet again in the town they both promised never to revisit.", 97, "horizon", 470),
  t("movie", "Signal Fire", ["Adventure", "Family"], 2021, 7.5, 7, ["Clara Voss", "Ben Rogers"], "A scout troop learns to read the mountains after a storm cuts off the valley.", 91, "signal", 380),
  t("movie", "Vessel", ["Drama", "History"], 2020, 8.0, 13, ["Meera Rao", "Helen Barrow"], "A ship's cook records the final voyage of a vessel nobody expected to return.", 113, "vessel", 330),
  t("movie", "Copper Canyon", ["Western", "Drama"], 2019, 7.3, 16, ["Elias Renton", "Rosa Marin"], "A retired marshal returns to settle a debt that was never written down.", 119, "dunes", 240),
  t("movie", "The Furnace Room", ["Thriller", "Mystery"], 2026, 7.9, 16, ["Ada Whitlock", "Daniel Kade"], "A building inspector finds a room that does not exist on any floor plan.", 102, "ember", 930),
  t("movie", "Lantern Bay", ["Romance", "Comedy"], 2022, 7.6, 13, ["Priya Nair", "Owen Hale"], "Two rival innkeepers are forced to share a lighthouse for one summer.", 95, "horizon", 500),
  t("movie", "Ghost Frequency", ["Horror", "Sci-Fi"], 2024, 6.7, 16, ["Callum Vale", "Yuki Tanaka"], "A radio astronomer picks up a broadcast from a station that was never built.", 93, "nocturne", 690),
  t("movie", "Brightwater", ["Documentary", "Sport"], 2023, 8.4, 7, ["Kai Nakamura"], "A community pool team trains for a championship in a town with no pool.", 81, "tide", 450),
  t("movie", "The Ninth Garden", ["Fantasy", "Adventure"], 2025, 8.2, 13, ["Ivy Chen", "Theo March"], "A gardener discovers that the ninth garden grows the things people have forgotten.", 122, "canopy", 870),
  t("movie", "Low Tide, High Stakes", ["Crime", "Comedy"], 2021, 7.1, 13, ["Dev Kapoor", "Gwen Bell"], "A failed fishing trip turns into the strangest robbery in harbour history.", 88, "vessel", 290),
  t("movie", "Night Composer", ["Music", "Thriller"], 2020, 7.8, 16, ["Clara Voss", "Julian Frost"], "A concert pianist realises her new score contains instructions for a crime.", 108, "prism", 360),
  t("movie", "The Borrowed Valley", ["Drama", "History"], 2018, 7.9, 13, ["Ana Ferreira", "Tomas Berg"], "A valley is promised to two families and only one deed can be true.", 116, "dunes", 220),
  t("movie", "Frostline", ["Action", "Adventure"], 2024, 7.5, 13, ["Nora Vale", "Meera Rao"], "Rescue pilots race a storm front to reach a stranded research team.", 110, "circuit", 780),
  t("movie", "Marigold", ["Drama", "Romance"], 2022, 7.4, 13, ["Sofia Reyes", "Peter Osei"], "A florist and a nurse keep meeting at the end of the same long shift.", 92, "ember", 430),
  t("movie", "Deep Field", ["Documentary", "Sci-Fi"], 2026, 8.7, 7, ["Imani Cole"], "Telescopes open a twelve-year window into the earliest light we can see.", 86, "orbit", 970),
  t("movie", "The Back Room", ["Mystery", "Crime"], 2019, 7.3, 16, ["Helen Barrow", "Arun Mehta"], "A private investigator keeps finding the same face in unrelated cases.", 101, "monolith", 270),
  t("movie", "Small Hours", ["Drama"], 2025, 7.6, 16, ["Ada Whitlock", "Rosa Marin"], "Four night-shift workers share one diner and very little sleep.", 99, "nocturne", 740),
  t("movie", "River of Stone", ["Adventure", "Fantasy"], 2023, 8.0, 13, ["Ravi Menon", "Ivy Chen"], "A raft journey becomes a search for the source of a petrified river.", 124, "tide", 590),
  t("movie", "The Last Broadcast", ["Thriller", "Drama"], 2021, 7.7, 16, ["Malik Johnson", "Gwen Bell"], "A radio host takes one caller too many during the last show of his career.", 96, "signal", 400),
  t("movie", "Overland", ["Action", "Adventure"], 2020, 7.2, 13, ["Elias Renton", "Kai Nakamura"], "Two couriers drive a fragile cargo across a country without working roads.", 107, "dunes", 320),
  t("movie", "Sunroom", ["Drama", "Family"], 2024, 8.1, 7, ["Meera Rao", "Ben Rogers"], "A family gathers in a sunroom to decide the fate of a house they all love.", 94, "horizon", 630),
  t("movie", "Static Theatre", ["Sci-Fi", "Comedy"], 2026, 7.5, 13, ["Yuki Tanaka", "Dev Kapoor"], "A community play accidentally becomes the first contact event of the century.", 103, "prism", 900),

  t("series", "Harbor Lights", ["Drama", "Mystery"], 2021, 8.4, 16, ["Ruth Okafor", "Owen Hale"], "A harbour master investigates a smuggling ring while protecting her missing brother's daughter.", 52, "tide", 870),
  t("series", "The Assembly", ["Sci-Fi", "Thriller"], 2025, 8.7, 16, ["Imani Cole", "Daniel Kade"], "A night-shift factory team discovers the product they assemble is not what the label says.", 48, "circuit", 980),
  t("series", "Small Claims", ["Comedy"], 2020, 8.0, 13, ["Priya Nair", "Gwen Bell"], "A small-town mediation court handles cases too strange for the official courts.", 28, "monolith", 430),
  t("series", "Wildwood Chronicles", ["Animation", "Adventure"], 2023, 8.5, 0, ["Ivy Chen", "Ben Rogers"], "Four friends map a forest that rearranges itself every full moon.", 24, "canopy", 910),
  t("series", "The Late Shift", ["Comedy", "Drama"], 2022, 7.9, 16, ["Malik Johnson", "Clara Voss"], "A late-night radio host and her crew keep a city awake through its hardest nights.", 30, "nocturne", 500),
  t("series", "Frontier Kitchen", ["Documentary"], 2024, 8.2, 7, ["Ravi Menon"], "Chefs cook with foraged ingredients in six remote kitchens.", 34, "ember", 640),
  t("series", "Glass City", ["Crime", "Thriller"], 2021, 8.3, 16, ["Sofia Reyes", "Julian Frost"], "A detective follows missing persons through a city that never stops building.", 55, "prism", 780),
  t("series", "The Observatory", ["Sci-Fi", "Drama"], 2026, 8.8, 13, ["Imani Cole", "Tomas Berg"], "An isolated observatory receives a signal twelve years before it was sent.", 50, "orbit", 990),
  t("series", "Second Act", ["Drama", "Music"], 2019, 7.7, 13, ["Edith Rowan", "Nico Silva"], "Former performers return to the stage in a theatre with nothing left to lose.", 42, "horizon", 340),
  t("series", "The Archivist's Daughter", ["Mystery", "History"], 2023, 8.1, 13, ["Ana Ferreira", "Helen Barrow"], "A historian follows a ledger across three countries to find her mother's past.", 46, "circuit", 600),
  t("series", "Tidewalkers", ["Adventure", "Fantasy"], 2022, 8.0, 13, ["Meera Rao", "Kai Nakamura"], "A coastal clan navigates a world that appears only at low tide.", 47, "tide", 560),
  t("series", "Night School", ["Thriller", "Mystery"], 2024, 7.8, 16, ["Callum Vale", "Ada Whitlock"], "Adult education students realise none of them enrolled voluntarily.", 44, "nocturne", 720),
  t("series", "Copper Valley", ["Drama", "Western"], 2020, 7.6, 16, ["Elias Renton", "Rosa Marin"], "A mining town changes hands and nobody agrees on who owns the water.", 49, "dunes", 300),
  t("series", "Open Water", ["Documentary", "Sport"], 2025, 8.3, 7, ["Ruth Okafor"], "A swim team trains in the sea through a winter no one thought they'd survive.", 36, "tide", 830),
  t("series", "The Print Room", ["Mystery", "Drama"], 2021, 7.9, 13, ["Marta Lindqvist", "Arun Mehta"], "A newspaper archive hides a pattern that only the new intern can see.", 43, "monolith", 370),
  t("series", "Aster", ["Sci-Fi", "Adventure"], 2026, 8.6, 13, ["Yuki Tanaka", "Imani Cole"], "A survey crew finds a moon that answers questions nobody asked.", 51, "orbit", 950),
  t("series", "Corner Store", ["Comedy", "Family"], 2022, 8.1, 7, ["Dev Kapoor", "Ivy Chen"], "A neighbourhood shop becomes the centre of a very small, very loud universe.", 26, "horizon", 470),
  t("series", "The Hollow Coast", ["Horror", "Mystery"], 2023, 7.5, 16, ["Sofia Reyes", "Gwen Bell"], "A seasonal town empties out and something else moves in.", 45, "canopy", 660),
  t("series", "Maestro", ["Music", "Drama"], 2024, 8.2, 16, ["Malik Johnson", "Clara Voss"], "A conductor rebuilds an orchestra after a scandal empties the hall.", 54, "ember", 710),
  t("series", "The Tall Grass", ["Crime", "Drama"], 2019, 7.8, 16, ["Ruth Okafor", "Elias Renton"], "A rural investigator works a case that the county would rather forget.", 48, "signal", 250),
  t("series", "Paper Kingdom", ["Animation", "Family"], 2025, 8.4, 0, ["Ivy Chen", "Ben Rogers"], "A kingdom made of folded paper learns to survive its first rain.", 23, "prism", 920),
  t("series", "Field Notes", ["Documentary", "History"], 2021, 8.0, 7, ["Ana Ferreira"], "Archaeologists revisit sites they misread as young students.", 33, "dunes", 390),
  t("series", "The Exchange", ["Thriller", "Crime"], 2026, 8.5, 16, ["Nora Vale", "Daniel Kade"], "A currency trader notices a pattern that predicts real-world events.", 53, "circuit", 960),
  t("series", "Blue Ridge", ["Romance", "Drama"], 2023, 7.7, 13, ["Lena Park", "Owen Hale"], "Two doctors return to the valley where they first met and first disagreed.", 41, "vessel", 520),
];

const accounts = [
  { email: "alex@reelroom.dev", name: "Alex Morgan", active: "Alex", profiles: [
    { name: "Alex", kids: false, maxRating: 18, color: "#e8a33d" },
    { name: "Mateo", kids: true, maxRating: 7, color: "#74c69d" },
    { name: "Nova", kids: false, maxRating: 16, color: "#6fc3d6" },
  ] },
  { email: "priya@reelroom.dev", name: "Priya Sharma", active: "Priya", profiles: [
    { name: "Priya", kids: false, maxRating: 18, color: "#ef8d6d" },
    { name: "Zoe", kids: true, maxRating: 13, color: "#8fd694" },
  ] },
  { email: "marcus@reelroom.dev", name: "Marcus Lee", active: "Marcus", profiles: [
    { name: "Marcus", kids: false, maxRating: 16, color: "#7fa6c4" },
    { name: "Iris", kids: false, maxRating: 13, color: "#d8b653" },
  ] },
  { email: "sofia@reelroom.dev", name: "Sofia Rodriguez", active: "Sofia", profiles: [
    { name: "Sofia", kids: false, maxRating: 18, color: "#c9d7dd" },
    { name: "Jun", kids: true, maxRating: 0, color: "#f0a94c" },
  ] },
];

const episodeNames = [
  "Opening Night", "The Long Way Round", "A Small Betrayal", "Low Water",
  "The Quiet Room", "What Was Promised", "Signal Lost", "The Return",
  "Half Measures", "Everything at Once",
];
const episodeDescriptions = [
  "A routine shift turns into the first real test of the team's loyalty.",
  "An old promise resurfaces and forces an uncomfortable choice.",
  "A clue hidden in plain sight changes the direction of the investigation.",
  "The group splits up, and each half learns something the other needs.",
  "A quiet conversation reveals what nobody was willing to say out loud.",
  "A deadline arrives earlier than anyone expected.",
  "A familiar face returns with a story that does not quite add up.",
  "A small victory comes at a cost the team will carry forward.",
];

let seed = 20261127;
function random() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const pick = (arr) => arr[Math.floor(random() * arr.length)];

async function main() {
  await mongoose.connect(URI, { maxPoolSize: 10, minPoolSize: 2 });
  await Promise.all(Object.values(M).map((model) => model.createIndexes()));
  await Promise.all(Object.values(M).map((model) => model.deleteMany({})));

  const hash = await bcrypt.hash("password123", 12);
  const userDocs = await M.User.insertMany(
    accounts.map((a) => ({ name: a.name, email: a.email, password: hash })),
  );

  const profileDocs = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    const created = await M.Profile.insertMany(
      account.profiles.map((p) => ({ ...p, account: userDocs[i]._id })),
    );
    const active = created.find((p) => p.name === account.active);
    await M.User.updateOne({ _id: userDocs[i]._id }, { $set: { activeProfile: active._id } });
    profileDocs.push(...created);
  }

  const createdTitles = await M.Title.insertMany(
    titles.map((title, index) => ({
      ...title,
      addedAt: new Date(Date.UTC(2026, 10, 20) - index * 36e5 * 9),
    })),
  );
  const series = createdTitles.filter((title) => title.type === "series");

  const seasonDocs = [];
  const episodeDocs = [];
  for (const show of series) {
    const count = 2 + Math.floor(random() * 3);
    for (let s = 1; s <= count; s += 1) {
      const season = {
        title: show._id,
        seasonNumber: s,
        year: show.year + s - 1,
        episodeCount: 0,
      };
      seasonDocs.push(season);
    }
  }
  const insertedSeasons = await M.Season.insertMany(seasonDocs);
  for (const season of insertedSeasons) {
    const show = series.find((s) => s._id.equals(season.title));
    const count = 6 + Math.floor(random() * 5);
    for (let e = 1; e <= count; e += 1) {
      episodeDocs.push({
        season: season._id,
        title: show._id,
        episodeNumber: e,
        name: `${pick(episodeNames)}`,
        description: pick(episodeDescriptions),
        durationMinutes: 22 + Math.floor(random() * 38),
        thumbnailUrl: show.thumbnailUrl,
      });
    }
    await M.Season.updateOne({ _id: season._id }, { $set: { episodeCount: count } });
  }
  await M.Episode.insertMany(episodeDocs);

  const watchlistDocs = [];
  const reactionDocs = [];
  const progressDocs = [];
  for (const profile of profileDocs) {
    const allowed = createdTitles.filter((title) => title.maturity <= profile.maxRating);
    const shuffled = [...allowed].sort(() => random() - 0.5);
    const wanted = 14 + Math.floor(random() * 9);
    for (const title of shuffled.slice(0, wanted)) {
      watchlistDocs.push({ profile: profile._id, title: title._id, addedAt: new Date(Date.now() - Math.floor(random() * 6e8)) });
      if (random() > 0.42) {
        reactionDocs.push({ profile: profile._id, title: title._id, value: random() > 0.2 ? "like" : "dislike" });
      }
    }
    const watched = shuffled.slice(0, 12 + Math.floor(random() * 8));
    for (const title of watched) {
      const durationSeconds = title.durationMinutes * 60;
      const completed = random() > 0.72;
      progressDocs.push({
        profile: profile._id,
        title: title._id,
        episode: null,
        positionSeconds: completed ? durationSeconds : Math.floor(durationSeconds * (0.08 + random() * 0.6)),
        durationSeconds,
        completed,
      });
    }
  }
  for (let i = 0; i < 3; i += 1) {
    watchlistDocs.push({ profile: profileDocs[i]._id, title: objectId(), addedAt: new Date() });
  }
  await M.WatchlistItem.insertMany(watchlistDocs);
  await M.Reaction.insertMany(reactionDocs);
  await M.Progress.insertMany(progressDocs);

  console.log(
    `Seeded ${userDocs.length} accounts, ${profileDocs.length} profiles, ${createdTitles.length} titles, ` +
      `${insertedSeasons.length} seasons, ${episodeDocs.length} episodes, ${watchlistDocs.length} watchlist items ` +
      `(3 stale), ${reactionDocs.length} reactions, ${progressDocs.length} progress records.`,
  );
  console.log("Demo login: alex@reelroom.dev / password123");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
