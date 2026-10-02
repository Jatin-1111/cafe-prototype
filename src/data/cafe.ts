/**
 * Refections Cafe, Sector 35C, Chandigarh.
 *
 * Address, phone, hours and positioning are taken from the cafe's own public
 * listings. The longer `story` copy is placeholder written from the room's
 * published photographs — it is for the owners to replace with their own
 * words before this goes anywhere real.
 */
export const cafe = {
  name: "Refections",
  fullName: "Refections Cafe",
  tagline: "A cosy corner for every craving",
  established: 2021,
  city: "Chandigarh",
  sector: "Sector 35C",
  address: {
    line1: "SCO 473-474, First Floor",
    line2: "Sector 35C, Chandigarh 160022",
    landmark: "Above 24Seven",
    maps: "https://maps.google.com/?q=Refections+Cafe+SCO+473+474+Sector+35C+Chandigarh",
  },
  phone: "+91 95184 08629",
  email: "hello@refectionscafe.in",
  instagram: "@refectionchandigarh35",

  story: {
    lead: "Tasteful food, chilled drinks, and vibes that calm the mind.",
    body: [
      "A first-floor room off the Sector 35 market, built around a row of arches. Terracotta niches behind the counter, plaster walls the colour of warm sand, and a curved jade banquette that most people photograph before they sit down.",
      "Blush florals on the chairs, speckled terrazzo underfoot, brass mesh overhead and palms in every corner. The light is soft all day and gold by evening, which is roughly when the room fills up.",
      "The menu runs wide on purpose — wood-fired pizza and creamy pasta alongside the chinese you actually want at eleven at night, and coffee that holds its own at any hour.",
    ],
  },

  /**
   * The same hours every day, so this is one row rather than three identical
   * ones. The shape stays an array for the day the weekend opens later.
   */
  hours: [{ days: "Every day", open: "11 am", close: "11 pm" }],

  notes: [
    "First floor, lift at the back",
    "Free parking in the Sector 35 market lot",
    "The jade booth seats six, and goes first",
    "Wi-Fi on the house, all day",
  ],

  /**
   * Read off the cafe's own Zomato listing on the date below. Dining rather
   * than delivery: this is a room people sit in, and it is the far larger
   * sample (3,482 against 388). Attributed on the page, because an unsourced
   * number is just a claim.
   *
   * It will drift. Re-check it, or set `rating` to null to drop the line.
   */
  acclaim: {
    rating: 4.4,
    reviews: 3482,
    source: "Zomato",
    checkedOn: "2026-10-02",
  },

  /** Added once to a takeaway order, the way most cafes here charge for boxes. */
  packingCharge: 20,

  tables: 12,
} as const;

export type Cafe = typeof cafe;
