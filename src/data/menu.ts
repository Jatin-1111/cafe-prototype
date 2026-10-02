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
  /**
   * Options a guest picks at the table. A choice may carry a price delta —
   * oat milk and a cheese-burst base are not free anywhere, and a model that
   * assumes they are cannot be shown to an owner.
   */
  options?: OptionGroup[];
  /** Minutes at the pass. Falls back to the category default when unset. */
  prepMinutes?: number;
  /** A shot in the photography manifest, shown on the ordering screen. */
  photo?: ShotKey;
};

export type OptionChoice = {
  name: string;
  /** Added to the item's price, in rupees. Absent means no change. */
  price?: number;
};

export type OptionGroup = { label: string; choices: OptionChoice[] };

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
    options: [{ label: "Milk", choices: [{ name: "Full cream" }, { name: "Skimmed" }, { name: "Oat", price: 40 }] }],
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
      { label: "Milk", choices: [{ name: "Full cream" }, { name: "Skimmed" }, { name: "Oat", price: 40 }] },
      { label: "Sugar", choices: [{ name: "Regular" }, { name: "Less" }, { name: "None" }] },
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
    options: [{ label: "Milk", choices: [{ name: "Black" }, { name: "Splash of milk" }] }],
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
    options: [{ label: "Strength", choices: [{ name: "Regular" }, { name: "Kadak" }] }],
  },
  {
    id: "m-virgin-mojito",
    name: "Virgin Mojito",
    description: "Lime, mint, crushed ice, soda",
    price: 199,
    category: "coffee",
    veg: true,
    options: [{ label: "Flavour", choices: [{ name: "Classic" }, { name: "Green apple" }, { name: "Watermelon" }] }],
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
    options: [{ label: "Style", choices: [{ name: "Dry" }, { name: "Gravy" }] }],
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
    options: [{ label: "Add", choices: [{ name: "As is" }, { name: "Chicken", price: 90 }] }],
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
    options: [{ label: "Base", choices: [{ name: "Thin crust" }, { name: "Cheese burst", price: 80 }] }],
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
    options: [{ label: "Base", choices: [{ name: "Thin crust" }, { name: "Cheese burst", price: 80 }] }],
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
      { label: "Pasta", choices: [{ name: "Penne" }, { name: "Fettuccine" }] },
      { label: "Add", choices: [{ name: "As is" }, { name: "Chicken", price: 90 }, { name: "Mushroom" }] },
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
    options: [{ label: "Add", choices: [{ name: "As is" }, { name: "Chicken", price: 90 }] }],
  },
  {
    id: "m-hakka-noodles",
    name: "Hakka Noodles",
    description: "Wok-tossed, julienned vegetables",
    price: 299,
    category: "mains",
    veg: true,
    options: [{ label: "Add", choices: [{ name: "Veg" }, { name: "Chicken", price: 90 }, { name: "Paneer", price: 70 }] }],
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
    options: [{ label: "Filling", choices: [{ name: "Grilled veg" }, { name: "Chicken", price: 90 }] }],
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
    options: [{ label: "Side", choices: [{ name: "Classic fries" }, { name: "Peri peri fries", price: 45 }] }],
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

/** The price of one unit with the chosen options applied. */
export function unitPrice(item: MenuItem, chosen?: Record<string, string>): number {
  if (!chosen || !item.options) return item.price;
  return item.options.reduce((total, group) => {
    const pick = group.choices.find((choice) => choice.name === chosen[group.label]);
    return total + (pick?.price ?? 0);
  }, item.price);
}

/** Just the extras, for showing a breakdown without re-deriving it. */
export function optionExtras(item: MenuItem, chosen?: Record<string, string>): number {
  return unitPrice(item, chosen) - item.price;
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
