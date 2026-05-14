// Civ 6 data — factual references to game content (civilization names, leader names,
// map types, DLC names). UI styling is original, not lifted from the game.

// DLC packs. Base is always implicitly on.
window.DLCS = [
  { id: "rf",    name: "Rise and Fall",           kind: "Expansion",  short: "R&F" },
  { id: "gs",    name: "Gathering Storm",         kind: "Expansion",  short: "GS"  },
  { id: "viking",name: "Vikings Scenario Pack",   kind: "Scenario",   short: "VIK" },
  { id: "poland",name: "Poland Civilization Pack",kind: "Civ Pack",   short: "POL" },
  { id: "aus",   name: "Australia Civ Pack",      kind: "Civ Pack",   short: "AUS" },
  { id: "perm",  name: "Persia & Macedon Pack",   kind: "Civ Pack",   short: "P&M" },
  { id: "nub",   name: "Nubia Civ Pack",          kind: "Civ Pack",   short: "NUB" },
  { id: "khid",  name: "Khmer & Indonesia Pack",  kind: "Civ Pack",   short: "K&I" },
  { id: "maya",  name: "Maya & Gran Colombia",    kind: "NFP Pack",   short: "NFP1"},
  { id: "eth",   name: "Ethiopia Pack",           kind: "NFP Pack",   short: "NFP2"},
  { id: "byzgaul",name:"Byzantium & Gaul Pack",   kind: "NFP Pack",   short: "NFP3"},
  { id: "bab",   name: "Babylon Pack",            kind: "NFP Pack",   short: "NFP4"},
  { id: "viet",  name: "Vietnam & Kublai Pack",   kind: "NFP Pack",   short: "NFP5"},
  { id: "port",  name: "Portugal Pack",           kind: "NFP Pack",   short: "NFP6"},
  { id: "ldr",   name: "Leader Pass",             kind: "Add-on",     short: "LDR" }
];

// Leaders — each is a (leader, civilization, requiredDlc?, tag?). tag is small lore tag.
// requiredDlc null = base game. "ldr" means Leader Pass alt leader.
window.LEADERS = [
  // ── BASE GAME ──────────────────────────────────────────────
  { id: "roosevelt",    leader: "Theodore Roosevelt",    civ: "America",   dlc: null,    tag: "Rough Rider" },
  { id: "saladin",      leader: "Saladin",               civ: "Arabia",    dlc: null,    tag: "The Righteous" },
  { id: "montezuma",    leader: "Montezuma",             civ: "Aztec",     dlc: null,    tag: "Tlatoani" },
  { id: "pedro",        leader: "Pedro II",              civ: "Brazil",    dlc: null,    tag: "The Magnanimous" },
  { id: "qin",          leader: "Qin Shi Huang",         civ: "China",     dlc: null,    tag: "First Emperor" },
  { id: "cleopatra",    leader: "Cleopatra",             civ: "Egypt",     dlc: null,    tag: "Mediterranean's Bride" },
  { id: "victoria",     leader: "Victoria",              civ: "England",   dlc: null,    tag: "Empress of the Seas" },
  { id: "catherine",    leader: "Catherine de Medici",   civ: "France",    dlc: null,    tag: "Black Queen" },
  { id: "barbarossa",   leader: "Frederick Barbarossa",  civ: "Germany",   dlc: null,    tag: "Holy Roman Emperor" },
  { id: "pericles",     leader: "Pericles",              civ: "Greece",    dlc: null,    tag: "Soul of Athens" },
  { id: "gorgo",        leader: "Gorgo",                 civ: "Greece",    dlc: null,    tag: "Queen of Sparta" },
  { id: "gandhi",       leader: "Gandhi",                civ: "India",     dlc: null,    tag: "Mahatma" },
  { id: "hojo",         leader: "Hojo Tokimune",         civ: "Japan",     dlc: null,    tag: "Defender of Japan" },
  { id: "mvemba",       leader: "Mvemba a Nzinga",       civ: "Kongo",     dlc: null,    tag: "Manikongo" },
  { id: "trajan",       leader: "Trajan",                civ: "Rome",      dlc: null,    tag: "Optimus Princeps" },
  { id: "peter",        leader: "Peter",                 civ: "Russia",    dlc: null,    tag: "The Great" },
  { id: "tomyris",      leader: "Tomyris",               civ: "Scythia",   dlc: null,    tag: "The Insatiable" },
  { id: "philip",       leader: "Philip II",             civ: "Spain",     dlc: null,    tag: "El Prudente" },
  { id: "gilgamesh",    leader: "Gilgamesh",             civ: "Sumeria",   dlc: null,    tag: "King of Uruk" },
  { id: "harald",       leader: "Harald Hardrada",       civ: "Norway",    dlc: null,    tag: "Last of the Vikings" },
  { id: "jadwiga",      leader: "Jadwiga",               civ: "Poland",    dlc: "poland",tag: "Saint-King" },
  { id: "curtin",       leader: "John Curtin",           civ: "Australia", dlc: "aus",   tag: "Prime Minister" },
  { id: "cyrus",        leader: "Cyrus",                 civ: "Persia",    dlc: "perm",  tag: "King of Kings" },
  { id: "alexander",    leader: "Alexander",             civ: "Macedon",   dlc: "perm",  tag: "Megas Alexandros" },
  { id: "amani",        leader: "Amanitore",             civ: "Nubia",     dlc: "nub",   tag: "Kandake" },
  { id: "jayavarman",   leader: "Jayavarman VII",        civ: "Khmer",     dlc: "khid",  tag: "Bhuddist Devotee" },
  { id: "gitarja",      leader: "Dyah Gitarja",          civ: "Indonesia", dlc: "khid",  tag: "Daughter of the Sea" },

  // ── RISE AND FALL ──────────────────────────────────────────
  { id: "chandragupta", leader: "Chandragupta",          civ: "India",     dlc: "rf",    tag: "Chakravartin" },
  { id: "poundmaker",   leader: "Poundmaker",            civ: "Cree",      dlc: "rf",    tag: "Peace Chief" },
  { id: "tamar",        leader: "Tamar",                 civ: "Georgia",   dlc: "rf",    tag: "Mep'e Mep'eta" },
  { id: "shaka",        leader: "Shaka",                 civ: "Zulu",      dlc: "rf",    tag: "Bayede Nkosi" },
  { id: "robert",       leader: "Robert the Bruce",      civ: "Scotland",  dlc: "rf",    tag: "Highland King" },
  { id: "wilhelmina",   leader: "Wilhelmina",            civ: "Dutch",     dlc: "rf",    tag: "Stadtholder" },
  { id: "seondeok",     leader: "Seondeok",              civ: "Korea",     dlc: "rf",    tag: "Sacred Bone" },
  { id: "lautaro",      leader: "Lautaro",               civ: "Mapuche",   dlc: "rf",    tag: "Toqui" },
  { id: "genghis",      leader: "Genghis Khan",          civ: "Mongolia",  dlc: "rf",    tag: "Khan of Khans" },

  // ── GATHERING STORM ────────────────────────────────────────
  { id: "laurier",      leader: "Wilfrid Laurier",       civ: "Canada",    dlc: "gs",    tag: "Sunny Ways" },
  { id: "matthias",     leader: "Matthias Corvinus",     civ: "Hungary",   dlc: "gs",    tag: "The Just" },
  { id: "pachacuti",    leader: "Pachacuti",             civ: "Inca",      dlc: "gs",    tag: "Earth-Shaker" },
  { id: "mansa",        leader: "Mansa Musa",            civ: "Mali",      dlc: "gs",    tag: "Lord of the Mines" },
  { id: "kupe",         leader: "Kupe",                  civ: "Māori",     dlc: "gs",    tag: "Voyaging Father" },
  { id: "suleiman",     leader: "Suleiman",              civ: "Ottoman",   dlc: "gs",    tag: "The Magnificent" },
  { id: "dido",         leader: "Dido",                  civ: "Phoenicia", dlc: "gs",    tag: "Queen of Carthage" },
  { id: "kristina",     leader: "Kristina",              civ: "Sweden",    dlc: "gs",    tag: "Minerva of the North" },
  { id: "eleanor",      leader: "Eleanor of Aquitaine",  civ: "England",   dlc: "gs",    tag: "Lady of the Court" },
  { id: "eleanor_fr",   leader: "Eleanor of Aquitaine",  civ: "France",    dlc: "gs",    tag: "Lady of the Court" },

  // ── NEW FRONTIER PASS ──────────────────────────────────────
  { id: "ladysix",      leader: "Lady Six Sky",          civ: "Maya",      dlc: "maya",  tag: "Lady of Naranjo" },
  { id: "bolivar",      leader: "Simón Bolívar",         civ: "Gran Colombia", dlc: "maya", tag: "El Libertador" },
  { id: "menelik",      leader: "Menelik II",            civ: "Ethiopia",  dlc: "eth",   tag: "Negus Negast" },
  { id: "basil",        leader: "Basil II",              civ: "Byzantium", dlc: "byzgaul", tag: "Bulgar-Slayer" },
  { id: "ambiorix",     leader: "Ambiorix",              civ: "Gaul",      dlc: "byzgaul", tag: "King of the Eburones" },
  { id: "hammurabi",    leader: "Hammurabi",             civ: "Babylon",   dlc: "bab",   tag: "Lawgiver" },
  { id: "batrieu",      leader: "Bà Triệu",              civ: "Vietnam",   dlc: "viet",  tag: "Lady Triệu" },
  { id: "kublai_china", leader: "Kublai Khan",           civ: "China",     dlc: "viet",  tag: "Khagan of the Yuan" },
  { id: "kublai_mongol",leader: "Kublai Khan",           civ: "Mongolia",  dlc: "viet",  tag: "Khagan of the Yuan" },
  { id: "joao",         leader: "João III",              civ: "Portugal",  dlc: "port",  tag: "O Piedoso" },

  // ── LEADER PASS (alt leaders) ──────────────────────────────
  { id: "abraham",      leader: "Abraham Lincoln",       civ: "America",   dlc: "ldr",   tag: "Honest Abe" },
  { id: "tr_bm",        leader: "Teddy Roosevelt (Bull Moose)", civ: "America", dlc: "ldr", tag: "Rough Rider" },
  { id: "sejong",       leader: "Sejong",                civ: "Korea",     dlc: "ldr",   tag: "Hangul's Father" },
  { id: "nader",        leader: "Nader Shah",            civ: "Persia",    dlc: "ldr",   tag: "Napoleon of Persia" },
  { id: "elizabeth",    leader: "Elizabeth",             civ: "England",   dlc: "ldr",   tag: "The Virgin Queen" },
  { id: "tokugawa",     leader: "Tokugawa",              civ: "Japan",     dlc: "ldr",   tag: "Shōgun of Edo" },
  { id: "ramses",       leader: "Ramses II",             civ: "Egypt",     dlc: "ldr",   tag: "Builder-King" },
  { id: "julius",       leader: "Julius Caesar",         civ: "Rome",      dlc: "ldr",   tag: "Dictator Perpetuo" },
  { id: "napoleon_a",   leader: "Napoleon (Ambition)",   civ: "France",    dlc: "ldr",   tag: "L'Empereur" },
  { id: "napoleon_m",   leader: "Napoleon (Magnificence)",civ: "France",   dlc: "ldr",   tag: "L'Empereur" },
  { id: "qin_unifier",  leader: "Qin Shi Huang (Unifier)", civ: "China",   dlc: "ldr",   tag: "First Emperor" },
  { id: "ludwig",       leader: "Ludwig II",             civ: "Germany",   dlc: "ldr",   tag: "The Swan King" },
  { id: "catherine_dt", leader: "Catherine the Great",   civ: "Russia",    dlc: "ldr",   tag: "Matushka" },
  { id: "hatshepsut",   leader: "Hatshepsut",            civ: "Egypt",     dlc: "ldr",   tag: "Foremost of Women" },
  { id: "tokimune_jp",  leader: "Hojo Tokimune (Bushido)",civ: "Japan",    dlc: "ldr",   tag: "Defender of Japan" }
];

// All the categorical options the randomizer can roll.
// Each list is ORDERED from "least intense" to "most intense" where meaningful.
window.OPTIONS = {
  mapType: [
    "Continents", "Pangaea", "Archipelago", "Fractal", "Small Continents",
    "Island Plates", "Highlands", "Inland Sea", "Lakes", "Primordial",
    "Seven Seas", "Shuffle", "Terra", "Tilted Axis", "Wetlands"
  ],
  mapSize: ["Duel", "Tiny", "Small", "Standard", "Large", "Huge"],
  difficulty: [
    "Settler", "Chieftain", "Warlord", "Prince",
    "King", "Emperor", "Immortal", "Deity"
  ],
  gameSpeed: ["Online", "Quick", "Standard", "Epic", "Marathon"],
  startEra:  ["Ancient", "Classical", "Medieval", "Renaissance",
              "Industrial", "Modern", "Atomic", "Information"],
  resources: ["Sparse", "Standard", "Abundant"],
  worldAge:  ["New", "Standard", "Old"],
  temperature:["Hot", "Standard", "Cold"],
  rainfall:  ["Arid", "Standard", "Wet"],
  seaLevel:  ["Low", "Standard", "High"],
  disasterIntensity: ["0 — Calm", "1 — Mild", "2 — Standard", "3 — Severe", "4 — Apocalyptic"],
  cityStates: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]
};

// Game modes — multi-select, each is a yes/no with lock.
window.GAME_MODES = [
  { id: "apocalypse",  name: "Apocalypse",                 dlc: "byzgaul" },
  { id: "heroes",      name: "Heroes & Legends",           dlc: "viet"    },
  { id: "monopolies",  name: "Monopolies & Corporations",  dlc: "port"    },
  { id: "secret",      name: "Secret Societies",           dlc: "maya"    },
  { id: "dramatic",    name: "Dramatic Ages",              dlc: "eth"     },
  { id: "shuffle",     name: "Tech & Civic Shuffle",       dlc: "bab"     },
  { id: "barbclans",   name: "Barbarian Clans",            dlc: "eth"     },
  { id: "zombies",     name: "Zombie Defense",             dlc: "viet"    }
];

window.VICTORY_TYPES = [
  { id: "science",    name: "Science"    },
  { id: "culture",    name: "Culture"    },
  { id: "domination", name: "Domination" },
  { id: "religious",  name: "Religious"  },
  { id: "diplomatic", name: "Diplomatic", dlc: "gs" },
  { id: "score",      name: "Score"      }
];
