const R2_HERO = "https://pub-f2dcb2bc241340699d740b25ab172313.r2.dev/marketing/hangzhou-hero";
const R2_GALLERY = "https://pub-f2dcb2bc241340699d740b25ab172313.r2.dev/marketing/hangzhou-gallery";

export type HeroClip = { src: string; poster: string };

// Curated from the 24 uploaded on-site clips: only those long enough to loop
// without reading as a stutter (the discarded ones ran 0.4–2.9s). Posters are
// a frame grabbed from each clip, so the still matches what starts playing.
const CLIP_IDS = ["13", "14", "16", "17", "18", "20", "21", "22", "23"];

export const HERO_CLIPS: HeroClip[] = CLIP_IDS.map((id) => ({
  src: `${R2_HERO}/hero-${id}.mp4`,
  poster: `${R2_HERO}/poster-${id}.jpg`,
}));

// Real photos of GATE students and staff from the Hangzhou program.
export const GALLERY_PHOTOS: { src: string; alt: string }[] = [
  {
    src: `${R2_GALLERY}/moment-01.jpg`,
    alt: "GATE students in a lecture session at Xidian University, Hangzhou",
  },
  {
    src: `${R2_GALLERY}/moment-02.jpg`,
    alt: "Traditional Chinese pavilion visited during the Hangzhou cultural programme",
  },
  {
    src: `${R2_GALLERY}/moment-03.jpg`,
    alt: "GATE participants sharing a group dinner around a banquet table",
  },
  {
    src: `${R2_GALLERY}/moment-04.jpg`,
    alt: "Dishes served to participants at the university canteen",
  },
  {
    src: `${R2_GALLERY}/moment-05.jpg`,
    alt: "Students working together during a daytime session",
  },
  {
    src: `${R2_GALLERY}/moment-06.jpg`,
    alt: "Participants outside the campus buildings between sessions",
  },
  {
    src: `${R2_GALLERY}/moment-07.jpg`,
    alt: "GATE participants during the Hangzhou week",
  },
];
