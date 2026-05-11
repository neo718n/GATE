const R2 = "https://pub-f2dcb2bc241340699d740b25ab172313.r2.dev/marketing/china-camp";

export type ChinaCampPhoto = {
  src: string;
  alt: string;
  category: "campus" | "classroom" | "lecture-hall" | "computer-lab" | "auditorium" | "dormitory" | "facility" | "canteen";
};

export const CHINA_CAMP_PHOTOS = {
  campusAerial: { src: `${R2}/campus-1.jpg`, alt: "Xidian University Hangzhou campus aerial view", category: "campus" },
  campusLandmark: { src: `${R2}/campus-2.jpg`, alt: "Xidian University Hangzhou — main building and library", category: "campus" },

  classroom1: { src: `${R2}/classroom-1.jpg`, alt: "Modern multimedia classroom at Xidian University", category: "classroom" },
  classroom2: { src: `${R2}/classroom-2.jpg`, alt: "Multimedia classroom with smart displays", category: "classroom" },
  classroom3: { src: `${R2}/classroom-3.jpg`, alt: "Multimedia classroom — tiered seating", category: "classroom" },
  classroom4: { src: `${R2}/classroom-4.jpg`, alt: "Multimedia classroom — collaborative layout", category: "classroom" },
  classroom5: { src: `${R2}/classroom-5.jpg`, alt: "Multimedia classroom — modern setup", category: "classroom" },

  lectureHall1: { src: `${R2}/lecture-hall-1.jpg`, alt: "Lecture hall — Xidian University Hangzhou Institute", category: "lecture-hall" },
  lectureHall2: { src: `${R2}/lecture-hall-2.jpg`, alt: "Lecture hall — Xidian University", category: "lecture-hall" },
  lectureHall3: { src: `${R2}/lecture-hall-3.jpg`, alt: "Lecture hall — Xidian University", category: "lecture-hall" },

  computerLab1: { src: `${R2}/computer-lab-1.jpg`, alt: "Computer laboratory at Xidian University Hangzhou", category: "computer-lab" },
  computerLab2: { src: `${R2}/computer-lab-2.jpg`, alt: "Computer laboratory — individual workstations", category: "computer-lab" },

  dormitoryRoom: { src: `${R2}/dormitory-room.jpg`, alt: "Student dormitory — 4-person room", category: "dormitory" },
  dormBathroom: { src: `${R2}/dorm-facility-1.jpg`, alt: "Modern bathroom facility — student dormitory", category: "facility" },
  dormShower: { src: `${R2}/dorm-facility-2.jpg`, alt: "Shower facility — student dormitory", category: "facility" },
  laundry: { src: `${R2}/laundry.jpg`, alt: "On-campus laundry facility", category: "facility" },

  canteenMain: { src: `${R2}/canteen-1.jpg`, alt: "Main student canteen at Xidian University", category: "canteen" },
  canteenSecondary: { src: `${R2}/canteen-2.jpg`, alt: "Student dining hall — Xidian University", category: "canteen" },
} as const satisfies Record<string, ChinaCampPhoto>;

export const PHOTO_GALLERY: ChinaCampPhoto[] = [
  CHINA_CAMP_PHOTOS.campusAerial,
  CHINA_CAMP_PHOTOS.campusLandmark,
  CHINA_CAMP_PHOTOS.lectureHall1,
  CHINA_CAMP_PHOTOS.classroom1,
  CHINA_CAMP_PHOTOS.computerLab1,
  CHINA_CAMP_PHOTOS.canteenMain,
  CHINA_CAMP_PHOTOS.dormitoryRoom,
  CHINA_CAMP_PHOTOS.lectureHall2,
];
