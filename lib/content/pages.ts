// Inner-page content adapted from the live crosswayscarehome.co.uk pages.

export const facilities = [
  { label: "19 single bedrooms", icon: "bed" },
  { label: "3 double bedrooms", icon: "bed" },
  { label: "Ensuite facilities", icon: "home" },
  { label: "TV & telephone points in all rooms", icon: "home" },
  { label: "Lift to the first floor + chair lift", icon: "home" },
  { label: "Secure garden with a summer house", icon: "leaf" },
];

export const careTeamPride = [
  {
    title: "Our carers",
    body: "At the heart of Ferndale are our carers. We support those starting their journey and develop those who are already experienced, with excellent career opportunities and regular training to help you reach senior roles.",
  },
  {
    title: "Delivering care",
    body: "These are hugely important roles, placed in positions of great trust. Kind, patient and considerate care is vital to the wellness and happiness of those we look after, and we provide comprehensive training from first steps to specialist qualifications.",
  },
  {
    title: "Creating a caring environment",
    body: "Good care is part of a greater whole. Alongside our carers, we value the people who keep the home safe and clean, who entertain and provide gentle exercise, and who keep everything running smoothly.",
  },
  {
    title: "Catering within Ferndale",
    body: "Mealtimes are a chance to be social, so we want dining to be a pleasure from start to finish, welcoming dining areas, tasty and well-presented food, care for dietary and cultural needs, and well-timed service.",
  },
];

export const aboutSupport = [
  {
    title: "We’re here to help",
    body: "You are assured that you will be treated with respect and dignity, according to your individual needs and wishes.",
    icon: "heart",
  },
  {
    title: "Our mission",
    body: "To enable our residents to continue living as independently as possible, with 24-hour care and support.",
    icon: "shield",
  },
  {
    title: "Careers",
    body: "We are immensely proud of our staff and team at Ferndale. If you would like to join us, please see our careers page.",
    icon: "users",
    href: "/careers/",
  },
];

export const aboutTestimonial = {
  quote:
    "I was right when I recommended my friend’s mum to stay in Ferndale, she is satisfied and well looked after by the lovely staff, and the food is lovely too. Management is amazing. I will recommend this care home again and again.",
  attribution: "Gilda Ong",
  source: "Google review",
};

export const aboutAims = [
  "Enable our residents to continue living as independently as possible, with 24-hour care and support.",
  "Provide a high standard of accommodation and care.",
  "Offer a secure, relaxed and homely environment where the care, well-being and comfort of residents come first.",
  "Value every individual who comes to live at Ferndale, and treat them with respect and dignity.",
];

// Full weekly timetable, each day shares the same meal/refreshment times and
// differs only in the morning + afternoon activity slots.
export type ScheduleItem = { label: string; time: string; icon: string };

const MEAL: Record<string, ScheduleItem> = {
  tea: { label: "Early Morning Cup of Tea", time: "6:45am to 7:00am", icon: "cup" },
  breakfast: { label: "Breakfast", time: "7:30am to 8:15am", icon: "utensils" },
  coffee: { label: "Morning Coffee", time: "10:30am to 10:45am", icon: "cup" },
  lunch: { label: "Lunch", time: "12:30pm to 13:30pm", icon: "utensils" },
  afternoonTea: { label: "Afternoon Tea", time: "15:00pm to 15:15pm", icon: "cup" },
  supper: { label: "Supper", time: "17:30pm to 16:30pm", icon: "utensils" },
  drink: { label: "Evening Drink", time: "19:45pm to 20:00pm", icon: "cup" },
};

function activityIcon(label: string): string {
  const l = label.toLowerCase();
  if (/exercise|hoopla|bowls|carpet/.test(l)) return "activity";
  if (/art|craft|knit|natter/.test(l)) return "palette";
  if (/movie|film/.test(l)) return "film";
  return "puzzle";
}

const DAYS: [string, string, string][] = [
  ["Monday", "Games & Exercise", "Board Games / Puzzles"],
  ["Tuesday", "Knit & Natter", "Board Games"],
  ["Wednesday", "Arts & Crafts", "Word Search / Board Games"],
  ["Thursday", "Board Games / Puzzles", "Bingo / Quiz"],
  ["Friday", "Carpet Games / Hoopla / Bowls", "Word Search / Board Games"],
  ["Saturday", "Upwords / Board Games", "Movies / Films"],
  ["Sunday", "Uno / Board Games", "Board Games / Puzzles"],
];

export const weeklySchedule: { day: string; items: ScheduleItem[] }[] = DAYS.map(
  ([day, morning, afternoon]) => ({
    day,
    items: [
      MEAL.tea,
      MEAL.breakfast,
      { label: morning, time: "10:00am to 11:30am", icon: activityIcon(morning) },
      MEAL.coffee,
      MEAL.lunch,
      { label: afternoon, time: "15:00pm to 17:00pm", icon: activityIcon(afternoon) },
      MEAL.afternoonTea,
      MEAL.supper,
      MEAL.drink,
    ],
  }),
);

export const regularVisits = [
  { title: "Hairdressing", icon: "scissors", body: "Weekly hairdressing appointments are available upon request." },
  { title: "Singer", icon: "music", body: "Local singers regularly visit, singing classics from a bygone era." },
  { title: "Musician", icon: "music", body: "Local musicians entertain our residents with beautiful classical music." },
  { title: "Personal trainer", icon: "activity", body: "A personal trainer visits on Tuesday afternoons for a gentle armchair exercise class set to music, our residents love it." },
  { title: "Pet as Therapy (PAT)", icon: "paw", body: "A Pets as Therapy volunteer visits once a month with her gorgeous miniature long-haired dachshund." },
  { title: "Church services", icon: "church", body: "All Saints church visits on the first Sunday of the month, and the Revd Beverley Miles conducts a Wednesday service. Easter, Harvest, Remembrance Sunday and Christmas are also marked." },
  { title: "Days out", icon: "leaf", body: "Surrounded by beautiful West Sussex venues, we book trips to National Trust parks and houses, garden centres, Tilgate Park, Brighton Marina, Tulleys and Holmbush farms, and the seaside." },
  { title: "Summer BBQ", icon: "sun", body: "Fun for all the family at our annual summer BBQ, residents and family enjoy the sun and great food together." },
  { title: "Christmas", icon: "gift", body: "Carol singing from a local school or charity, and a Christmas party for residents and family to enjoy the festive season." },
];

// Accreditation badges shown under the "Your health is our primary concern"
// section (matching the live site), rehosted into Supabase Storage.
const BADGES = "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/badges";
export const welcomeImages = [
  { src: `${BADGES}/cqc-good.png`, alt: "CQC rated Good" },
  { src: `${BADGES}/food-hygiene.png`, alt: "Food Hygiene Rating" },
  { src: `${BADGES}/rnha.png`, alt: "Registered Nursing Home Association member" },
];

// ── New home-page sections (not from the old site) ──────────────────────────

export const roomsImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/rooms/room.jpg",
  alt: "A bright, comfortable resident's room at Ferndale with oak furniture and a garden view",
};

export const rooms = {
  heading: "Comfortable rooms that feel like home",
  body: "Our rooms are individually decorated, and we encourage residents to bring their own furniture and personal possessions to create a true “home from home”. We offer 19 single and 3 double bedrooms, many with ensuite facilities, and TV and telephone points in every room.",
  points: [
    "Individually decorated, personalised rooms",
    "Single & double rooms, many ensuite",
    "TV & telephone points throughout",
  ],
};

export const diningImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/dining/dining.jpg",
  alt: "A resident enjoying a freshly cooked roast dinner in the dining room at Ferndale",
};

export const dining = {
  heading: "Fresh, home-cooked food every day",
  body: "Our chef Glenn prepares nutritious, home-cooked meals on the premises daily, with a choice at every meal. Residents can dine in our communal dining room or enjoy meals in their own room, and family and friends are always welcome to join.",
  points: [
    "Cooked fresh on the premises",
    "A choice of meals every day",
    "Dine together or in your room",
  ],
};

export const gardenImage = {
  src: "https://nuxsbykzkivbjtkhheph.supabase.co/storage/v1/object/public/blog/site/garden/garden.jpg",
  alt: "The secure, colourful garden at Ferndale in summer, with flower borders, a lawn and a summer house",
};

export const garden = {
  heading: "A beautiful, secure garden to enjoy",
  body: "Set in a beautiful detached house in Lindfield, Ferndale has a lovely, secure garden with seating and a summer house. We actively encourage residents to enjoy the outdoors in the warmer months, a calm, safe place to relax with family.",
};

export const accreditations = [
  "CQC rated Good",
  "RNHA member",
  "Food Hygiene Rating",
  "carehome.co.uk recommended",
];

// Real accreditation badge images (rehosted from the live site) for the
// trust band, swap the text chips for these logos.
export const accreditationBadges = [
  { src: `${BADGES}/cqc-good.png`, alt: "CQC rated Good" },
  { src: `${BADGES}/food-hygiene.png`, alt: "Food Hygiene Rating" },
  { src: `${BADGES}/rnha.png`, alt: "Registered Nursing Home Association member" },
  { src: `${BADGES}/carehome.png`, alt: "Recommended on carehome.co.uk" },
];

export const localAreaImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/local/lindfield.jpg",
  alt: "The village pond at Lindfield, West Sussex, with period houses and summer flowers",
};

export const localArea = {
  heading: "Beautifully located in Lindfield",
  body: "Ferndale sits in the exclusive village of Lindfield, close to Haywards Heath and well connected across Mid Sussex, convenient for families visiting from across the area.",
};

export const residentReview = {
  quote:
    "Brilliant home to care for your loved ones. Our mum lived happily here for four years. They were continually helpful, kind and consistent in the great care given. The rooms are bright and airy, and throughout the COVID time they kept everyone safe.",
  attribution: "Family of a resident",
  source: "carehome.co.uk review",
};
