export const cafe = {
  name: "Kahani",
  fullName: "Kahani Coffee House",
  tagline: "Every cup has one",
  established: 2019,
  city: "Chandigarh",
  sector: "Sector 9",
  address: {
    line1: "House 214, Sector 9-B",
    line2: "Chandigarh 160009",
    maps: "https://maps.google.com/?q=Sector+9B+Chandigarh",
  },
  phone: "+91 172 466 2190",
  email: "hello@kahanicoffee.in",
  instagram: "@kahanicoffeehouse",

  story: {
    lead: "A 1960s Sector 9 house, reopened around a crate of chairs nobody wanted.",
    body: [
      "Kahani started at a government surplus auction. Twenty-two teak-and-cane chairs — the kind Pierre Jeanneret drew for this city, and the city later sold off by the truckload — went for less than it cost to move them. Buying them meant we suddenly had to build a room around them.",
      "So we did, in a Sector 9 house with the concrete left exactly as it was poured. Terrazzo relaid to the pattern that was already there, the brick jaali kept where it stood, and a ceiling fan that is loud in a way we have decided is character.",
      "The coffee is the part we did not inherit. Beans come from three estates in Chikmagalur and Coorg, roasted here every Tuesday on a 12kg drum, and pulled by people we trained ourselves. Old room, new cup.",
    ],
  },

  hours: [
    { days: "Monday — Thursday", open: "8:00 am", close: "10:30 pm" },
    { days: "Friday — Saturday", open: "8:00 am", close: "11:30 pm" },
    { days: "Sunday", open: "8:30 am", close: "10:30 pm" },
  ],

  notes: [
    "Filter refills are free until noon",
    "No laptops on weekends after 1 pm",
    "Parking is on the service lane behind",
    "The corner table is first-come, always",
  ],

  tables: 12,
} as const;

export type Cafe = typeof cafe;
