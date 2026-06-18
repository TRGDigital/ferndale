// Central registry of every photo/logo used across the marketing site.
//
// The admin "Images" tab is built from this list so the client can edit the
// alt text for any image. Saved overrides live in SiteImageAlt (keyed by src)
// and are resolved at render time by <SiteImage> (managed alt wins over the
// `alt` default here). Blog post covers are managed separately on the Posts tab.

const STORAGE =
  "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog";

export type SiteImageEntry = {
  src: string;
  /** Default alt text (used until an override is saved in the admin). */
  alt: string;
  /** Where it appears, shown in the admin to help the editor. */
  location: string;
};

const TEAM = [
  ["kelvin.jpg", "Selvarajen “Kelvin” Amoorthasamy, Registered Manager"],
  ["glenn.jpg", "Glenn Stacey, Chef"],
  ["jackie.jpg", "Jackie Thomas, Activities Coordinator"],
  ["monika.jpg", "Monika Skawinska, Care Assistant"],
  ["jan.jpg", "Jan, kitchen team"],
  ["mary.jpg", "Mary, care team"],
  ["briony.jpg", "Briony, care team"],
  ["manu.jpg", "Manu, care team"],
  ["mintu.jpg", "Mintu, care team"],
  ["murugaiyan.jpg", "Murugaiyan, care team"],
  ["sanel.jpg", "Sanel, care team"],
] as const;

export const siteImages: SiteImageEntry[] = [
  // Hero / feature photos
  { src: `${STORAGE}/site/hero/front.jpg`, alt: "Ferndale Nursing Home, a detached house in Lindfield, with its flower garden in bloom", location: "Hero — Home, About, Contact" },
  { src: `${STORAGE}/site/home/care.jpg`, alt: "A Ferndale carer holding hands and chatting with a resident enjoying a cup of tea in her room", location: "Home — The care we provide section" },
  { src: `${STORAGE}/site/rooms/room.jpg`, alt: "A bright, comfortable resident's room at Ferndale with oak furniture and a garden view", location: "Home — Rooms section" },
  { src: `${STORAGE}/site/dining/dining.jpg`, alt: "The dining room at Ferndale set for a meal", location: "Home — Dining section" },
  { src: `${STORAGE}/site/garden/garden.jpg`, alt: "The secure garden at Ferndale with a summer house", location: "Home — Garden section" },
  { src: `${STORAGE}/site/local/lindfield.jpg`, alt: "The village of Lindfield, West Sussex", location: "Home — Find us section" },
  { src: `${STORAGE}/site/about/welcome.jpg`, alt: "Inside Ferndale: the lounge, dining room and hallway, with fresh flowers throughout", location: "About — Welcome section" },
  { src: `${STORAGE}/site/about/aims.jpg`, alt: "Residents enjoying a lively chair-based activity session with the Ferndale activity leader", location: "About — Our aims section" },
  { src: `${STORAGE}/site/care-team/hero.jpg`, alt: "Ferndale carers chatting and laughing with residents over tea in the sunny lounge", location: "Care Team — hero" },
  { src: `${STORAGE}/site/activities/hero.jpg`, alt: "Residents laughing together during a balloon exercise activity in the Ferndale lounge", location: "Activities — hero" },
  { src: `${STORAGE}/site/activities/coordinator.jpg`, alt: "Residents, families and staff enjoying the annual summer BBQ in the Ferndale garden", location: "Activities — coordinator banner" },
  { src: `${STORAGE}/site/activities/weekly.jpg`, alt: "A smiling Ferndale resident in the lounge", location: "Activities — weekly timetable photo" },
  { src: `${STORAGE}/site/careers/hero.jpg`, alt: "A smiling Ferndale carer in the dining room as residents enjoy lunch together", location: "Careers — hero" },
  { src: `${STORAGE}/site/careers/team.jpg`, alt: "Two smiling Ferndale carers in uniform in the dining room", location: "Careers — application section" },

  // Accreditation badges
  { src: `${STORAGE}/site/badges/cqc-good.png`, alt: "CQC rated Good", location: "Badges — trust band & Welcome" },
  { src: `${STORAGE}/site/badges/food-hygiene.png`, alt: "Food Hygiene Rating", location: "Badges — trust band & Welcome" },
  { src: `${STORAGE}/site/badges/rnha.png`, alt: "Registered Nursing Home Association member", location: "Badges — trust band & Welcome" },
  { src: `${STORAGE}/site/badges/carehome.png`, alt: "Recommended on carehome.co.uk", location: "Badges — trust band" },

  // Team photos
  ...TEAM.map(([file, alt]) => ({
    src: `${STORAGE}/site/team/${file}`,
    alt,
    location: "Care Team — staff photo",
  })),
];
