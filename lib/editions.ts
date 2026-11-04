// Every GATE program year lives here. Adding a new year = one entry in
// EDITIONS: it gets its own page at /<slug>, a row in the header year
// switcher, a sitemap entry and an Event in the structured data.
//
// Public copy avoids "olympiad"/"competition" wording (see the China
// repositioning). The one exception is OLYMPIAD_FAQ, which answers that
// search intent by framing G.A.T.E. as "more than an olympiad".

import { OLYMPIAD_FAQ } from "@/lib/site";
import { CHINA_CAMP_PHOTOS } from "@/lib/marketing/china-camp-photos";
import { GALLERY_PHOTOS } from "@/lib/marketing/hangzhou-media";

export type Season = "winter" | "summer";

export type EditionSubject = {
  name: string;
  /** Lowest and highest grade the subject is offered to. */
  grades: [number, number];
};

export type EditionPhoto = { src: string; alt: string };

export type EditionDay = {
  title: string;
  place: string;
  items: string[];
  photo?: EditionPhoto;
  /** Short calendar label, e.g. "18 Aug". */
  date?: string;
};

export type JourneyPoint = { name: string; coords: [number, number] /* lat, lng */ };

export type Destination = JourneyPoint & {
  day: string;
  image: EditionPhoto;
  body: string;
  highlights: string[];
  /** Approximate road distance, shown as context. */
  distance?: string;
};

export type Edition = {
  slug: string;
  year: number;
  season: Season;
  /** Full name, e.g. "GATE Winter 2027". */
  name: string;
  city: string;
  country: string;
  host: string;
  /** ISO dates (local event dates, no time). */
  startDate: string;
  endDate: string;
  dateLabel: string;
  shortDateLabel: string;
  grades: [number, number];
  subjects: EditionSubject[];
  tagline: string;
  summary: string;
  heroImage: EditionPhoto;
  highlights: { title: string; body: string; image?: EditionPhoto }[];
  /** Host university story shown in the zoom-in section. */
  hostStory?: { body: string; image: EditionPhoto; facts: [string, string][] };
  /** Use the Hangzhou footage instead of a still hero image. */
  heroVideo?: boolean;
  /** Published tuition per participant. */
  price?: {
    amount: number;
    currency: "USD";
    label: string;
    /** Day online applications opened (ISO date); schema.org Offer validFrom. */
    validFrom?: string;
  };
  /** Host university logo (shown in the footer while this year is current). */
  hostLogo?: string;
  /** Places on the route, in visiting order, for the journey map. */
  journey?: { start: JourneyPoint; stops: Destination[] };
  itinerary: EditionDay[];
  includes: string[];
  notIncluded: string[];
  stay?: { name: string; body: string; photos: EditionPhoto[] };
  gallery: EditionPhoto[];
  faqs: { q: string; a: string }[];
};

const IMG_2027 = "/editions/2027-winter";
const IMG_2026 = "/editions/2026-summer";

export const EDITIONS: Edition[] = [
  {
    slug: "2027-winter",
    year: 2027,
    season: "winter",
    name: "GATE Winter 2027",
    city: "Shaoxing",
    country: "China",
    host: "Shaoxing University",
    hostLogo: "/partners/shaoxing-university.png",
    price: { amount: 1300, currency: "USD", label: "$1,300", validFrom: "2026-11-02" },
    startDate: "2027-01-03",
    endDate: "2027-01-10",
    dateLabel: "3–10 January 2027",
    shortDateLabel: "Jan 3–10",
    grades: [1, 12],
    subjects: [
      { name: "Mathematics", grades: [1, 12] },
      { name: "English", grades: [1, 12] },
      { name: "Physics", grades: [7, 12] },
      { name: "Chemistry", grades: [7, 12] },
      { name: "Informatics", grades: [7, 12] },
    ],
    tagline: "An academic week at Shaoxing University, China",
    summary:
      "Seven days that combine an international academic assessment graded by university professors, life on a Chinese university campus founded in 1909, and three remarkable cities: Shaoxing, Shanghai and Yiwu.",
    heroImage: {
      src: `${IMG_2027}/uni-aerial.jpg`,
      alt: "Aerial view of Shaoxing University campus",
    },
    highlights: [
      {
        title: "Measure your level internationally",
        image: { src: `${IMG_2027}/exam.jpg`, alt: "Academic assessment in a university exam hall" },
        body: "Papers in Mathematics, English, Physics, Chemistry or Informatics, graded by professors of Shaoxing University, with personal feedback on strengths and areas to grow.",
      },
      {
        title: "Experience university life",
        image: { src: `${IMG_2027}/lecture.jpg`, alt: "Professors' lecture at Shaoxing University" },
        body: "Opening ceremony, a guided campus tour, the Fengze River Auditorium and a lecture by professors of the School of Mathematical & Information Sciences, with a live Q&A.",
      },
      {
        title: "Discover China",
        image: { src: `${IMG_2027}/canal.jpg`, alt: "Shaoxing canals and black-awning boats" },
        body: "Shaoxing's canals and black-awning boats, the Shanghai Bund and Yu Garden, and Yiwu, the world's largest small-commodity market.",
      },
    ],
    journey: {
      start: { name: "Hangzhou Xiaoshan Airport", coords: [30.23, 120.43] },
      stops: [
        {
          name: "Shaoxing University",
          coords: [30.02, 120.61],
          day: "Days 2 & 5",
          image: { src: `${IMG_2027}/uni-aerial.jpg`, alt: "Shaoxing University campus" },
          body: "Founded in 1909. The opening ceremony, the assessment in a supervised exam hall, the closing ceremony and a professors' lecture all take place on the Hedong and Nanshan campuses.",
          highlights: ["Opening & closing ceremonies", "Fengze River Auditorium", "Professors' lecture & Q&A"],
          distance: "≈ 30 km from the airport",
        },
        {
          name: "Shaoxing water town",
          coords: [29.99, 120.57],
          day: "Day 3",
          image: { src: `${IMG_2027}/canal.jpg`, alt: "Shaoxing canals and black-awning boats" },
          body: "Stone bridges, canals and the famous black-awning boats — the old China from paintings, in a 2,500-year-old city on the water and the hometown of the writer Lu Xun.",
          highlights: ["Black-awning boats", "Stone bridges & canals", "Lu Xun's hometown"],
        },
        {
          name: "Oriental Neverland",
          coords: [30.1, 120.47],
          day: "Day 3",
          image: { src: `${IMG_2027}/neverland.jpg`, alt: "Oriental Neverland resort, Shaoxing" },
          body: "An 18-billion-yuan resort on the edge of Shaoxing: thrilling rides in Cool Play Kingdom and family fun in Mountain Kingdom.",
          highlights: ["Cool Play Kingdom", "Mountain Kingdom"],
        },
        {
          name: "Shanghai",
          coords: [31.23, 121.47],
          day: "Day 4",
          image: { src: `${IMG_2027}/bund.jpg`, alt: "The Bund and Lujiazui skyline, Shanghai" },
          body: "China's past and future in one day: 52 historic buildings on the Bund facing the Lujiazui skyline, a Ming-dynasty garden, and old Shanghai under the plane trees.",
          highlights: ["The Bund & Lujiazui", "Yu Garden", "Wukang Road", "Nanjing Road"],
          distance: "≈ 200 km from Shaoxing",
        },
        {
          name: "Yiwu",
          coords: [29.31, 120.07],
          day: "Day 6",
          image: { src: `${IMG_2027}/yiwu.jpg`, alt: "Yiwu International Trade City" },
          body: "Yiwu International Trade City — the world's largest small-commodity market, with 6.4 million m² and more than 70,000 booths. A living lesson in how global trade works.",
          highlights: ["6.4 million m²", "70,000+ booths", "Global trade, up close"],
          distance: "≈ 120 km from Shaoxing",
        },
      ],
    },
    hostStory: {
      body: "A comprehensive public university in Zhejiang Province, in Shaoxing — a 2,500-year-old city on the water and the hometown of the writer Lu Xun. The program uses two campuses: Hedong and Nanshan.",
      image: { src: `${IMG_2027}/uni-aerial.jpg`, alt: "Aerial view of Shaoxing University campus" },
      facts: [
        ["1909", "Year founded"],
        ["2", "Campuses on the program"],
        ["2,500", "Years of Shaoxing history"],
      ],
    },
    itinerary: [
      {
        title: "Arrival",
        photo: { src: `${IMG_2027}/airport.jpg`, alt: "Arrival at Hangzhou Xiaoshan International Airport" },
        place: "Hangzhou Xiaoshan Airport → Shaoxing",
        items: ["Airport pick-up and private transfer to the hotel", "Welcome dinner with fellow participants"],
      },
      {
        title: "Opening & assessment",
        photo: { src: `${IMG_2027}/exam.jpg`, alt: "Academic assessment in a university exam hall" },
        place: "Shaoxing University",
        items: ["Opening ceremony, campus tour, group photo", "Academic assessment in a supervised university exam hall"],
      },
      {
        title: "City on the water",
        photo: { src: `${IMG_2027}/canal.jpg`, alt: "Shaoxing canals and black-awning boats" },
        place: "Shaoxing",
        items: ["Shaoxing water town: stone bridges, canals, black-awning boats", "Oriental Neverland resort"],
      },
      {
        title: "Past and future",
        photo: { src: `${IMG_2027}/bund.jpg`, alt: "The Bund and Lujiazui skyline, Shanghai" },
        place: "Shanghai",
        items: ["The Bund & Lujiazui", "Yu Garden, Wukang Road, Nanjing Road"],
      },
      {
        title: "Recognition",
        photo: { src: `${IMG_2027}/ceremony.jpg`, alt: "Closing ceremony and certificates" },
        place: "Shaoxing University",
        items: ["Closing ceremony: results, awards and official certificates", "Professors' lecture with live Q&A"],
      },
      {
        title: "Global trade",
        photo: { src: `${IMG_2027}/yiwu.jpg`, alt: "Yiwu International Trade City" },
        place: "Yiwu",
        items: ["Yiwu International Trade City: 6.4 million m², 70,000+ booths"],
      },
      {
        title: "Departure",
        photo: { src: `${IMG_2027}/parents.jpg`, alt: "Participants returning home" },
        place: "Hangzhou Xiaoshan Airport",
        items: ["Breakfast, check-out and private transfer to the airport"],
      },
    ],
    includes: [
      "Academic assessment graded by university professors, certificate and diagnostic report",
      "Gold, silver and bronze medals, place certificates and prizes for 1st–3rd place in every subject and grade band",
      "Accommodation at the 4-star Yintai Hotel Shaoxing",
      "Daily meals throughout the program, including the welcome dinner",
      "Airport pick-up and drop-off, and all transport within the program",
      "Excursions: Shaoxing, Oriental Neverland, Shanghai and Yiwu",
      "Visa support if a visa is required",
      "Travel accident and medical insurance in China for the program dates",
    ],
    notIncluded: ["International airfare", "Visa fees", "Personal expenses"],
    stay: {
      name: "Yintai Hotel Shaoxing",
      body: "A comfortable, central 4-star hotel with spacious twin rooms and an on-site restaurant, so participants rest well between the assessment and excursions.",
      photos: [
        { src: `${IMG_2027}/hotel-facade.jpg`, alt: "Yintai Hotel Shaoxing exterior" },
        { src: `${IMG_2027}/hotel-room.jpg`, alt: "Twin room at Yintai Hotel Shaoxing" },
        { src: `${IMG_2027}/hotel-dining.jpg`, alt: "Restaurant at Yintai Hotel Shaoxing" },
        { src: `${IMG_2027}/hotel-atrium.jpg`, alt: "Atrium lobby at Yintai Hotel Shaoxing" },
      ],
    },
    gallery: [
      { src: `${IMG_2027}/cover.jpg`, alt: "GATE Winter 2027 at Shaoxing University" },
      { src: `${IMG_2027}/lecture.jpg`, alt: "Professors' lecture at Shaoxing University" },
      { src: `${IMG_2027}/dinner.jpg`, alt: "Welcome dinner with fellow participants" },
      { src: `${IMG_2027}/neverland.jpg`, alt: "Oriental Neverland resort, Shaoxing" },
      { src: `${IMG_2027}/wukang.jpg`, alt: "Wukang Road, Shanghai" },
      { src: `${IMG_2027}/nanjing.jpg`, alt: "Nanjing Road, Shanghai" },
    ],
    faqs: [
      OLYMPIAD_FAQ,
      {
        q: "Who can take part?",
        a: "Students in Grades 1–12 from any country. Mathematics and English are open to all grades; Physics, Chemistry and Informatics are open to Grades 7–12.",
      },
      {
        q: "Where and when does it take place?",
        a: "At Shaoxing University in Shaoxing, Zhejiang Province, China, from 3 to 10 January 2027. Arrival and departure are through Hangzhou Xiaoshan International Airport.",
      },
      {
        q: "How much does it cost?",
        a: "$1,300 per participant. This covers the assessment, accommodation, meals, transfers, excursions, visa support, travel accident and medical insurance, the certificate and diagnostic report. International airfare, visa fees and personal expenses are not included.",
      },
      {
        q: "What is included?",
        a: "The academic assessment and grading, a certificate and diagnostic report for everyone, medals and prizes for 1st–3rd place, 4-star hotel accommodation, daily meals, airport transfers, all program transport, excursions to Shaoxing, Oriental Neverland, Shanghai and Yiwu, visa support, and travel accident and medical insurance in China. International airfare and visa fees are not included.",
      },
      {
        q: "Who grades the papers?",
        a: "Papers are graded by professors of Shaoxing University. Every participant receives a diagnostic report and a certificate. In every subject and grade band, 1st, 2nd and 3rd place receive gold, silver and bronze medals, a Certificate of Distinction, High Achievement or Merit, and prizes.",
      },
    ],
  },
  {
    slug: "2026-summer",
    year: 2026,
    season: "summer",
    name: "GATE Summer 2026",
    city: "Hangzhou",
    country: "China",
    host: "Xidian University · Hangzhou Institute of Technology",
    hostLogo: "/partners/xidian-university.png",
    startDate: "2026-08-18",
    endDate: "2026-08-24",
    dateLabel: "18–24 August 2026",
    shortDateLabel: "Aug 18–24",
    grades: [1, 11],
    subjects: [
      { name: "Mathematics", grades: [1, 11] },
      { name: "English", grades: [1, 11] },
    ],
    tagline: "Seven days at Xidian University, Hangzhou",
    summary:
      "In August 2026, students from across the region spent seven days at Xidian University, Hangzhou: lectures, a diagnostic assessment in Mathematics and English, the Hangzhou cultural program and a closing ceremony.",
    heroImage: {
      src: "https://pub-f2dcb2bc241340699d740b25ab172313.r2.dev/marketing/hangzhou-gallery/moment-01.jpg",
      alt: "GATE students during the Hangzhou week",
    },
    heroVideo: true,
    highlights: [
      {
        title: "Faculty lectures",
        body: "Specialized lectures by Xidian University professors in modern lecture halls, with small-group workshops and collaborative problem-solving.",
        image: { src: `${IMG_2026}/lecture.jpg`, alt: "Lecture at Xidian University during GATE Summer 2026" },
      },
      {
        title: "Diagnostic assessment",
        body: "Mathematics and English papers calibrated to five grade bands, followed by a personal performance report for every participant.",
        image: { src: `${IMG_2026}/exam.jpg`, alt: "GATE participants writing the assessment in Hangzhou" },
      },
      {
        title: "Hangzhou cultural program",
        body: "West Lake, historic Hangzhou and the Grand Canal — a UNESCO city of academic heritage — between study days.",
        image: { src: `${IMG_2026}/westlake.jpg`, alt: "West Lake, Hangzhou" },
      },
    ],
    hostStory: {
      body: "One of China's leading institutions in information technology, electronics and the foundational sciences. The Hangzhou campus sits on the bank of the Qiantang River, with modern educational facilities.",
      image: CHINA_CAMP_PHOTOS.campusAerial,
      facts: [
        ["1931", "Xidian University founded"],
        ["7", "Days on campus"],
        ["2", "Subjects assessed"],
      ],
    },
    itinerary: [
      { title: "Arrival", date: "18 Aug", place: "Hangzhou", photo: { src: `${IMG_2026}/skyline.jpg`, alt: "Hangzhou skyline" }, items: ["Airport transfer", "Dormitory check-in", "Welcome dinner", "Campus tour at sunset"] },
      { title: "Opening", date: "19 Aug", place: "Xidian University", photo: { src: `${IMG_2026}/lecture.jpg`, alt: "Opening lecture" }, items: ["Opening ceremony", "Faculty introduction", "Diagnostic Assessment — Part 1", "Welcome lecture"] },
      { title: "Intensive I", date: "20 Aug", place: "Xidian University", photo: { src: `${IMG_2026}/exam.jpg`, alt: "Assessment session" }, items: ["Morning workshop", "Diagnostic Assessment — Part 2", "Library study hours"] },
      { title: "Intensive II", date: "21 Aug", place: "Xidian University", photo: { src: `${IMG_2026}/group.jpg`, alt: "Participants together on campus" }, items: ["Lecture series (3 sessions)", "Group problem-solving", "Evening cultural program"] },
      { title: "Hangzhou", date: "22 Aug", place: "West Lake", photo: { src: `${IMG_2026}/westlake.jpg`, alt: "West Lake, Hangzhou" }, items: ["West Lake excursion", "Historical sites tour", "Networking dinner with Chinese students"] },
      { title: "Capstone", date: "23 Aug", place: "Xidian University", photo: { src: `${IMG_2026}/certs.jpg`, alt: "Certificates at the ceremony" }, items: ["Capstone seminar with faculty panel", "Individual academic consultation", "Performance report distribution", "Awards ceremony"] },
      { title: "Departure", date: "24 Aug", place: "Hangzhou", photo: { src: `${IMG_2026}/pagoda.jpg`, alt: "Pagoda in Hangzhou" }, items: ["Closing ceremony", "Certificate distribution", "Group photo", "Airport transfer"] },
    ],
    includes: [
      "Accommodation in 4-person dormitory",
      "Three meals daily at university canteen",
      "All lectures, workshops, and materials",
      "Full campus access (library, study halls, sports)",
      "Diagnostic assessment + personalized report",
      "Certificate of Completion + Experience certificate",
      "Hangzhou cultural excursion",
      "Local airport transfer (arrival & departure)",
      "Travel accident and medical insurance in China for the program dates",
    ],
    notIncluded: ["International airfare to Hangzhou", "Visa application fees", "Personal expenses"],
    stay: {
      name: "On-campus accommodation",
      body: "Participants lived on the Xidian University campus: 4-person dormitory rooms with study areas, the main canteen, modern bathrooms and on-site laundry.",
      photos: [
        CHINA_CAMP_PHOTOS.dormitoryRoom,
        CHINA_CAMP_PHOTOS.canteenMain,
        CHINA_CAMP_PHOTOS.dormBathroom,
        CHINA_CAMP_PHOTOS.laundry,
      ],
    },
    gallery: [
      ...GALLERY_PHOTOS,
      { src: `${IMG_2026}/bridge.jpg`, alt: "Stone bridge in Hangzhou" },
      { src: `${IMG_2026}/night.jpg`, alt: "Hangzhou at night" },
      { src: `${IMG_2026}/dinner.jpg`, alt: "Dinner together during the Hangzhou week" },
      { src: `${IMG_2026}/skyline.jpg`, alt: "Hangzhou skyline" },
      CHINA_CAMP_PHOTOS.campusLandmark,
    ],
    // FAQs live in components/site/editions/summer-2026.tsx because one
    // answer points at whichever year is current.
    faqs: [],
  },
];

function byStartDesc(a: Edition, b: Edition) {
  return b.startDate.localeCompare(a.startDate);
}

/** Newest first — the order used by the switcher and footer. */
export function getEditions(): Edition[] {
  return [...EDITIONS].sort(byStartDesc);
}

export function getEdition(slug: string): Edition | undefined {
  return EDITIONS.find((e) => e.slug === slug);
}

export function isPast(edition: Edition, now: Date = new Date()): boolean {
  return new Date(`${edition.endDate}T23:59:59Z`) < now;
}

/**
 * The edition the homepage features: the soonest one that hasn't ended yet,
 * falling back to the most recent one once everything is in the past.
 */
export function getCurrentEdition(now: Date = new Date()): Edition {
  const upcoming = EDITIONS.filter((e) => !isPast(e, now)).sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  return upcoming[0] ?? getEditions()[0];
}

export function seasonLabel(season: Season): string {
  return season === "winter" ? "Winter" : "Summer";
}
