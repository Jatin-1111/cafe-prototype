/**
 * Refections Cafe menu.
 *
 * Prices marked below come from the cafe's published listings; the rest are
 * representative of their range (roughly ₹1,000 for two) and sit in the
 * cuisines they actually serve — Italian, Continental, Chinese, North Indian,
 * coffee and desserts. Swap this file for the real card before any client
 * review; nothing else in the app needs to change.
 */

import type { ShotKey } from "@/data/media";

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
  /** Minutes at the pass. Falls back to the category default when unset. */
  prepMinutes?: number;
  /** A shot in the photography manifest, shown on the ordering screen. */
  photo?: ShotKey;
};

export type CategoryId = "coffee" | "small" | "mains" | "sweet";

/** Rough minutes at the pass, used for the guest's ETA. Deliberately honest rather than optimistic. */
export const CATEGORY_PREP_MINUTES: Record<CategoryId, number> = {
  coffee: 4,
  small: 9,
  mains: 15,
  sweet: 5,
};

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  {
    id: "coffee",
    name: "Coffee & Cold",
    blurb: "Hot, iced, and the thick shakes people come back for.",
  },
  {
    id: "small",
    name: "Starters",
    blurb: "Fries, eggs and the things that arrive first.",
  },
  {
    id: "mains",
    name: "Pizza & Pasta",
    blurb: "Hand-stretched bases, sauces made the same morning.",
  },
  {
    id: "sweet",
    name: "Desserts",
    blurb: "Worth leaving room for.",
  },
];

export const menu: MenuItem[] = [
  // ---------- Coffee & Cold ----------
  {
    id: "m-cappuccino",
    prepMinutes: 3,
    name: "Cappuccino",
    description: "Double shot, steamed thick, dusted with cocoa",
    price: 169,
    category: "coffee",
    veg: true,
    tags: ["bestseller"],
    options: [{ label: "Milk", choices: ["Full cream", "Skimmed", "Oat"] }],
  },
  {
    id: "m-latte",
    prepMinutes: 3,
    name: "Café Latte",
    description: "Long and milky, the quiet one",
    price: 189,
    category: "coffee",
    veg: true,
    options: [
      { label: "Milk", choices: ["Full cream", "Skimmed", "Oat"] },
      { label: "Sugar", choices: ["Regular", "Less", "None"] },
    ],
  },
  {
    id: "m-cold-coffee",
    prepMinutes: 5,
    name: "Thick Cold Coffee",
    description: "Blended with ice cream, served tall",
    note: "The one that goes on every table in the room by four in the afternoon.",
    price: 239,
    category: "coffee",
    veg: true,
    tags: ["bestseller"],
  },
  {
    id: "m-cold-brew",
    prepMinutes: 2,
    name: "Cold Brew",
    description: "Steeped overnight, poured over ice",
    price: 219,
    category: "coffee",
    veg: true,
    options: [{ label: "Milk", choices: ["Black", "Splash of milk"] }],
  },
  {
    id: "m-oreo-shake",
    name: "Oreo Thick Shake",
    description: "Cookies blended through, cream on top",
    price: 259,
    category: "coffee",
    veg: true,
  },
  {
    id: "m-masala-chai",
    name: "Masala Chai",
    description: "Ginger and cardamom, pounded fresh",
    price: 119,
    category: "coffee",
    veg: true,
    options: [{ label: "Strength", choices: ["Regular", "Kadak"] }],
  },
  {
    id: "m-virgin-mojito",
    name: "Virgin Mojito",
    description: "Lime, mint, crushed ice, soda",
    price: 199,
    category: "coffee",
    veg: true,
    options: [{ label: "Flavour", choices: ["Classic", "Green apple", "Watermelon"] }],
  },

  // ---------- Starters ----------
  {
    id: "m-classic-fries",
    prepMinutes: 7,
    name: "Classic Fries",
    description: "Salted, crisp, serves one to two",
    price: 219,
    category: "small",
    veg: true,
  },
  {
    id: "m-peri-fries",
    prepMinutes: 7,
    name: "Peri Peri Fries",
    description: "Tossed hot, serves one to two",
    price: 263,
    category: "small",
    veg: true,
    tags: ["bestseller", "spicy"],
  },
  {
    id: "m-masala-omelette",
    name: "Masala Omelette",
    description: "Onion, chilli, coriander, buttered toast",
    price: 263,
    category: "small",
    veg: false,
  },
  {
    id: "m-cheese-omelette",
    name: "Cheese Omelette",
    description: "Folded soft, toast on the side",
    price: 285,
    category: "small",
    veg: false,
  },
  {
    id: "m-chicken-omelette",
    name: "Chicken Omelette",
    description: "Shredded chicken, herbs, toast",
    price: 318,
    category: "small",
    veg: false,
  },
  {
    id: "m-chilli-paneer",
    name: "Chilli Paneer",
    description: "Dry, wok-tossed, capsicum and spring onion",
    price: 329,
    category: "small",
    veg: true,
    tags: ["spicy"],
    options: [{ label: "Style", choices: ["Dry", "Gravy"] }],
  },
  {
    id: "m-sliders",
    prepMinutes: 14,
    photo: "sliders",
    name: "Tricolour Sliders",
    description: "Three mini burgers, wedges, dip",
    note: "Saffron, white and green buns, which is as patriotic as the kitchen gets.",
    price: 389,
    category: "small",
    veg: false,
    tags: ["new"],
  },
  {
    id: "m-nachos",
    name: "Loaded Nachos",
    description: "Cheese sauce, olives, jalapeño, salsa",
    price: 329,
    category: "small",
    veg: true,
    options: [{ label: "Add", choices: ["As is", "Chicken"] }],
  },
  {
    id: "m-garlic-bread",
    name: "Cheese Garlic Bread",
    description: "Pull-apart, herb butter, chilli flakes",
    price: 239,
    category: "small",
    veg: true,
  },

  // ---------- Pizza & Pasta ----------
  {
    id: "m-margherita",
    prepMinutes: 12,
    name: "Margherita",
    description: "San Marzano sauce, mozzarella, basil",
    note: "Hand-stretched thin base. Ten minutes, and worth the wait.",
    price: 349,
    category: "mains",
    veg: true,
    tags: ["bestseller"],
    options: [{ label: "Base", choices: ["Thin crust", "Cheese burst"] }],
  },
  {
    id: "m-farmhouse",
    prepMinutes: 14,
    photo: "pizza",
    name: "Farmhouse Pizza",
    description: "Onion, capsicum, corn, olives, mushroom",
    price: 429,
    category: "mains",
    veg: true,
    options: [{ label: "Base", choices: ["Thin crust", "Cheese burst"] }],
  },
  {
    id: "m-bbq-chicken-pizza",
    prepMinutes: 16,
    name: "BBQ Chicken Pizza",
    description: "Smoked chicken, red onion, barbecue drizzle",
    price: 489,
    category: "mains",
    veg: false,
  },
  {
    id: "m-alfredo",
    prepMinutes: 13,
    name: "Alfredo Pasta",
    description: "Cream, parmesan, cracked pepper",
    price: 399,
    category: "mains",
    veg: true,
    tags: ["bestseller"],
    options: [
      { label: "Pasta", choices: ["Penne", "Fettuccine"] },
      { label: "Add", choices: ["As is", "Chicken", "Mushroom"] },
    ],
  },
  {
    id: "m-arrabbiata",
    name: "Penne Arrabbiata",
    description: "Tomato, garlic, dried chilli",
    price: 369,
    category: "mains",
    veg: true,
    tags: ["spicy"],
  },
  {
    id: "m-pink-sauce",
    name: "Pink Sauce Pasta",
    description: "Half tomato, half cream, all of it rich",
    price: 419,
    category: "mains",
    veg: true,
    options: [{ label: "Add", choices: ["As is", "Chicken"] }],
  },
  {
    id: "m-hakka-noodles",
    name: "Hakka Noodles",
    description: "Wok-tossed, julienned vegetables",
    price: 299,
    category: "mains",
    veg: true,
    options: [{ label: "Add", choices: ["Veg", "Chicken", "Paneer"] }],
  },
  {
    id: "m-panini",
    prepMinutes: 11,
    photo: "panini",
    name: "Grilled Veg Panini",
    description: "Char-grilled vegetables, melted cheese, pressed hot",
    note: "Broccoli, courgette and peppers off the grill, stacked in a pressed roll with a chilli dip.",
    price: 309,
    category: "mains",
    veg: true,
    tags: ["bestseller"],
    options: [{ label: "Filling", choices: ["Grilled veg", "Chicken"] }],
  },
  {
    id: "m-burger",
    prepMinutes: 13,
    photo: "burger",
    name: "Crispy Chicken Burger",
    description: "Fried chicken, slaw, cheese, house sauce",
    price: 359,
    category: "mains",
    veg: false,
    tags: ["bestseller"],
    options: [{ label: "Side", choices: ["Classic fries", "Peri peri fries"] }],
  },

  // ---------- Desserts ----------
  {
    id: "m-brownie",
    prepMinutes: 6,
    name: "Hot Brownie & Ice Cream",
    description: "Warm, dense, vanilla melting over it",
    price: 279,
    category: "sweet",
    veg: true,
    tags: ["bestseller"],
  },
  {
    id: "m-tiramisu",
    prepMinutes: 2,
    name: "Tiramisu",
    description: "Coffee-soaked, mascarpone, cocoa",
    price: 319,
    category: "sweet",
    veg: true,
  },
  {
    id: "m-cheesecake",
    prepMinutes: 2,
    name: "Blueberry Cheesecake",
    description: "Baked, biscuit base, berry compote",
    price: 329,
    category: "sweet",
    veg: true,
    tags: ["new"],
  },
  {
    id: "m-choco-lava",
    prepMinutes: 7,
    name: "Choco Lava Cake",
    description: "Two pieces, molten centre",
    price: 229,
    category: "sweet",
    veg: true,
  },
];

export const menuById = new Map(menu.map((item) => [item.id, item]));

export function itemsIn(category: CategoryId) {
  return menu.filter((item) => item.category === category);
}

/** Minutes at the pass for one item. */
export function prepMinutesFor(item: MenuItem): number {
  return item.prepMinutes ?? CATEGORY_PREP_MINUTES[item.category];
}

/** The four items the ordering screen leads with — the ones we have photographs of. */
export const popular = menu.filter((item) => item.photo);

export function formatINR(paise: number) {
  return `₹${paise.toLocaleString("en-IN")}`;
}

/** Signature items pulled onto the home page. Order matches the photo set. */
export const signatures = [
  "m-farmhouse",
  "m-sliders",
  "m-panini",
  "m-burger",
].map((id) => menuById.get(id)!);
