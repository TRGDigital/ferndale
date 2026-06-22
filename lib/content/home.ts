// Home-page content adapted from the live crosswayscarehome.co.uk home page.

export const heroImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/hero/front.jpg",
  alt: "Ferndale Nursing Home, a detached house in Crawley, West Sussex, with its flower garden in bloom",
};

export const welcome = {
  heading: "Your health is our primary concern",
  paragraphs: [
    "Ferndale Nursing Home is a care home for the elderly, housed in a beautiful detached house in the exclusive area of Southgate in Crawley. We are registered to accommodate up to 28 people aged 65 and over, including married couples and partners.",
    "Our manager is Mr Ishwurduth Mannick, RMN, who has over 40 years of experience in care, and our registered provider is Ferndale Healthcare Limited.",
    "We have 18 single and 5 double bedrooms, most with en-suite facilities, and a TV and telephone are available in all rooms. A passenger lift serves all three floors.",
    "Our rooms are all individually decorated, and residents are encouraged to bring their own personal possessions to create a “home from home” feel.",
  ],
};

export const whyChooseUs = [
  {
    title: "Our Aims",
    body: "We aim to provide a high standard of accommodation and care. The Home’s policy is to provide a secure, relaxed and homely environment in which the care, well-being and comfort of our residents are of prime importance.",
  },
  {
    title: "Our Services",
    body: "All our staff work hard to ensure we provide the very best in nursing care, including 24-hour registered nursing, dementia, Alzheimer’s and Parkinson’s care and respite, plus a full programme of activities, a nutritionally balanced diet and personal attention to each resident’s wellbeing.",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  /** Swap to a real photo in /public/images/team/ as they become available. */
  photo: string;
};

const SILHOUETTE = "/images/team/silhouette.svg";
const TEAM =
  "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/team";

export const careTeam: TeamMember[] = [
  {
    name: "Ishwurduth Mannick",
    role: "Registered Manager (RMN)",
    bio: "Our registered manager is a Registered Mental Health Nurse with over 40 years of experience in care. He leads the Ferndale team with warmth and a deep commitment to person-centred nursing care.",
    photo: SILHOUETTE,
  },
  // TODO: add the rest of the Ferndale team (names, roles, bios, photos).
]
