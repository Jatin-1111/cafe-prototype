export type MenuTag = "bestseller" | "new" | "seasonal" | "contains-nuts" | "spicy";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  veg: boolean;
  tags?: MenuTag[];
  /** Longer note shown on the public menu only — the table screen stays terse. */
  note?: string;
  /** Options a guest can pick at the table. Prototype keeps these free. */
  options?: { label: string; choices: string[] }[];
};

export type CategoryId = "brew" | "chai" | "plates" | "sweet";

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  {
    id: "brew",
    name: "Coffee",
    blurb: "Single estate, roasted upstairs every Tuesday.",
  },
  {
    id: "chai",
    name: "Chai & Cold",
    blurb: "The half of the counter that never changes.",
  },
  {
    id: "plates",
    name: "All-Day Plates",
    blurb: "Served from open to close. No breakfast cut-off.",
  },
  {
    id: "sweet",
    name: "Bakery",
    blurb: "Baked at six, gone by five.",
  },
];

export const menu: MenuItem[] = [
  // ---------- Coffee ----------
  {
    id: "m-cold-brew",
    name: "Malabar Cold Brew",
    description: "18-hour steep, Chikmagalur beans",
    note: "Steeped overnight in copper, served over a single large cube so it opens up slowly rather than watering down.",
    price: 280,
    category: "brew",
    veg: true,
    tags: ["bestseller"],
    options: [{ label: "Milk", choices: ["Black", "Splash of milk", "Oat"] }],
  },
  {
    id: "m-kesar-cortado",
    name: "Kesar Pista Cortado",
    description: "Saffron milk, double ristretto",
    note: "Kashmiri saffron bloomed in warm milk for ten minutes, cut with a double ristretto and a dust of pistachio.",
    price: 260,
    category: "brew",
    veg: true,
    tags: ["bestseller", "contains-nuts"],
  },
  {
    id: "m-filter",
    name: "Steel Tumbler Filter",
    description: "Thick decoction, chicory 20%, frothed the long way",
    note: "The house standard. Brass drip filter, poured back and forth between tumbler and dabarah until it stands up on its own.",
    price: 140,
    category: "brew",
    veg: true,
    options: [{ label: "Sweetness", choices: ["Regular", "Less sugar", "No sugar"] }],
  },
  {
    id: "m-espresso",
    name: "Madhya Marg Espresso",
    description: "House blend, 1:2 in 28 seconds",
    price: 160,
    category: "brew",
    veg: true,
  },
  {
    id: "m-flat-white",
    name: "Flat White",
    description: "Double ristretto, 140ml, no foam to speak of",
    price: 240,
    category: "brew",
    veg: true,
    options: [{ label: "Milk", choices: ["Full cream", "Oat", "Almond"] }],
  },
  {
    id: "m-coorg-pour",
    name: "Coorg Pour-Over",
    description: "Rotating single estate, V60, 300ml",
    note: "Ask what is on today. It changes every few weeks and the counter will tell you more than you asked for.",
    price: 320,
    category: "brew",
    veg: true,
    tags: ["seasonal"],
  },

  // ---------- Chai & Cold ----------
  {
    id: "m-doodh-patti",
    name: "Kulhad Doodh Patti",
    description: "Boiled down thick, served in clay",
    note: "No water, all milk, boiled until it turns the colour of old teak. The kulhads come from a potter in Manimajra.",
    price: 90,
    category: "chai",
    veg: true,
    tags: ["bestseller"],
    options: [{ label: "Strength", choices: ["Regular", "Kadak"] }],
  },
  {
    id: "m-kahwa",
    name: "Kashmiri Kahwa",
    description: "Green tea, saffron, crushed almond",
    price: 120,
    category: "chai",
    veg: true,
    tags: ["contains-nuts"],
  },
  {
    id: "m-masala-chai",
    name: "Ginger Masala Chai",
    description: "Pounded fresh, not from a powder",
    price: 110,
    category: "chai",
    veg: true,
    options: [{ label: "Strength", choices: ["Regular", "Kadak"] }],
  },
  {
    id: "m-rose-cold",
    name: "Rose & Cardamom Cold Coffee",
    description: "Blended thick, gulkand at the bottom",
    price: 290,
    category: "chai",
    veg: true,
    tags: ["new"],
  },
  {
    id: "m-shikanji",
    name: "Masala Shikanji",
    description: "Lime, black salt, roasted jeera, soda",
    price: 120,
    category: "chai",
    veg: true,
    options: [{ label: "Style", choices: ["Salted", "Sweet", "Both"] }],
  },

  // ---------- All-Day Plates ----------
  {
    id: "m-bun-makkhan",
    name: "Bun Makkhan",
    description: "Salted white butter, half an inch of it",
    note: "Buns arrive from a Sector 22 bakery every morning at six. Butter is churned here on Sundays.",
    price: 120,
    category: "plates",
    veg: true,
    tags: ["bestseller"],
  },
  {
    id: "m-kulcha-toastie",
    name: "Amritsari Kulcha Toastie",
    description: "Potato-onion masala, amul cheese, iron press",
    price: 340,
    category: "plates",
    veg: true,
    tags: ["spicy"],
    options: [{ label: "Heat", choices: ["Regular", "Extra chilli"] }],
  },
  {
    id: "m-bhurji",
    name: "Anda Bhurji on Sourdough",
    description: "Soft-scrambled, coriander, green chilli",
    price: 380,
    category: "plates",
    veg: false,
    tags: ["bestseller", "spicy"],
  },
  {
    id: "m-keema-kulcha",
    name: "Keema Kulcha",
    description: "Slow-cooked mutton, two butter kulche",
    note: "Four hours on low heat. We stop serving it when the pot is done, which is usually around eight.",
    price: 420,
    category: "plates",
    veg: false,
  },
  {
    id: "m-pulao",
    name: "Kashmiri Pulao",
    description: "Barberries, saffron rice, crisp onion",
    price: 460,
    category: "plates",
    veg: true,
    options: [{ label: "Add", choices: ["As is", "Chicken", "Paneer"] }],
  },
  {
    id: "m-chilli-cheese",
    name: "Chilli Cheese Toast",
    description: "Three cheeses, green chilli, grill-blistered",
    price: 260,
    category: "plates",
    veg: true,
    tags: ["spicy"],
  },

  // ---------- Bakery ----------
  {
    id: "m-basque",
    name: "Gur Basque Cheesecake",
    description: "Doraha jaggery, burnt top, served room temp",
    note: "The gur comes in from Doraha for about ten weeks a year. When it runs out, this comes off the board.",
    price: 380,
    category: "sweet",
    veg: true,
    tags: ["bestseller", "seasonal"],
  },
  {
    id: "m-pinni-cake",
    name: "Pinni Cake",
    description: "Roasted atta, ghee, gur, almond",
    price: 160,
    category: "sweet",
    veg: true,
    tags: ["contains-nuts"],
  },
  {
    id: "m-khari-rusk",
    name: "Khari & Rusk",
    description: "Four pieces, for dunking",
    price: 130,
    category: "sweet",
    veg: true,
  },
  {
    id: "m-thandai-tart",
    name: "Thandai Custard Tart",
    description: "Fennel, rose, melon seed, torched",
    price: 290,
    category: "sweet",
    veg: true,
    tags: ["new", "contains-nuts"],
  },
];

export const menuById = new Map(menu.map((item) => [item.id, item]));

export function itemsIn(category: CategoryId) {
  return menu.filter((item) => item.category === category);
}

export function formatINR(paise: number) {
  return `₹${paise.toLocaleString("en-IN")}`;
}

/** Signature items pulled onto the home page. Order matches the photo set. */
export const signatures = [
  "m-cold-brew",
  "m-doodh-patti",
  "m-bhurji",
  "m-basque",
].map((id) => menuById.get(id)!);
