export type IconName = "calendar" | "pin" | "fee" | "subjects";

export type MetaRow = {
  icon: IconName;
  label: string;
  value: string;
};

export type BrochureCopy = {
  backCover: {
    subtitle: string;
    scanLabel: string;
    websiteLabel: string;
    website: string;
    emailLabel: string;
    email: string;
    operatedByLabel: string;
    operatedBy: string;
    copyright: string;
  };
  hero: {
    editionBadge: string;
    titleLine1: string;
    titleLine2: string;
    tagline: string;
    partnershipLabel: string;
    partnershipName: string;
    partnershipSubname: string;
    partnershipChinese: string;
  };
  about: {
    title: string;
    body: string;
  };
  atGlance: {
    title: string;
    eventLabel: string;
    eventSummary: string;
  };
  event: {
    tag: string;
    titleTop: string;
    titleBottom: string;
    meta: MetaRow[];
    includedTitle: string;
    included: string[];
    eligibilityTitle: string;
    eligibility: string;
  };
  enroll: {
    tag: string;
    title: string;
    steps: { number: string; title: string; text: string }[];
    keyDatesTitle: string;
    keyDates: { label: string; date: string }[];
    ctaUrl: string;
    contactLabel: string;
    email: string;
  };
};

export const COPY_EN: BrochureCopy = {
  backCover: {
    subtitle: "Academic Programs · 2026",
    scanLabel: "SCAN TO ENROLL",
    websiteLabel: "WEBSITE",
    website: "gate-assessment.org",
    emailLabel: "EMAIL",
    email: "info@gate-assessment.org",
    operatedByLabel: "OPERATED BY",
    operatedBy: "Chongqing Xinshijie\nTechnology Service Co., LTD",
    copyright: "© 2026 GATE ACADEMIC PROGRAMS",
  },
  hero: {
    editionBadge: "2026 EDITION",
    titleLine1: "Academic",
    titleLine2: "Programs",
    tagline: "One programme.\nOne academic journey.",
    partnershipLabel: "HOSTED IN PARTNERSHIP WITH",
    partnershipName: "Xidian University",
    partnershipSubname: "Hangzhou Institute of Technology",
    partnershipChinese: "西安电子科技大学 · 杭州研究院",
  },
  about: {
    title: "ABOUT THE PROGRAMME",
    body: "GATE Academic Programs offer school students rigorous, internationally-benchmarked opportunities to develop their academic abilities in mathematics and English — open to grades 1 through 12.\n\nThe 2026 Hangzhou Academic Training Camp takes place at Xidian University's Hangzhou campus, combining structured academic coursework with on-campus workshops and cultural exchange.\n\nOutstanding participants receive a letter of academic distinction. All participants leave with a Certificate of Completion issued under the GATE 2026 programme.",
  },
  atGlance: {
    title: "AT A GLANCE",
    eventLabel: "HANGZHOU ACADEMIC TRAINING CAMP",
    eventSummary: "July 19 – 25, 2026 · 7 days · USD 1,000",
  },
  event: {
    tag: "Programme",
    titleTop: "Hangzhou Academic",
    titleBottom: "Training Camp",
    meta: [
      { icon: "subjects", label: "SUBJECTS", value: "Mathematics · English" },
      { icon: "calendar", label: "DATE", value: "July 19 – 25, 2026 · 7 days" },
      { icon: "pin", label: "VENUE", value: "Xidian University, Hangzhou" },
      { icon: "fee", label: "FEE", value: "USD 1,000 · all-inclusive" },
    ],
    includedTitle: "WHAT'S INCLUDED",
    included: [
      "Daily lectures by university faculty",
      "Problem-solving workshops in small groups",
      "On-campus dormitory accommodation",
      "All meals at the university canteen",
      "Lecture-hall and computer-lab access",
      "Cultural excursions in Hangzhou",
    ],
    eligibilityTitle: "ELIGIBILITY",
    eligibility:
      "Open to school students, grades 1 – 12. No prior participation in other GATE programmes is required.",
  },
  enroll: {
    tag: "ENROLL",
    title: "How to participate",
    steps: [
      {
        number: "01",
        title: "VISIT THE WEBSITE",
        text: "Scan the QR code or open gate-assessment.org in your browser.",
      },
      {
        number: "02",
        title: "CREATE AN ACCOUNT",
        text: "Register as a participant and complete the enrolment form.",
      },
      {
        number: "03",
        title: "CONFIRM ENROLMENT",
        text: "Submit the programme fee to receive your official acceptance.",
      },
    ],
    keyDatesTitle: "KEY DATES",
    keyDates: [
      { label: "HANGZHOU CAMP — REGISTRATION CLOSES", date: "June 30, 2026" },
    ],
    ctaUrl: "GATE-ASSESSMENT.ORG",
    contactLabel: "Questions?",
    email: "info@gate-assessment.org",
  },
};

export const COPY_RU: BrochureCopy = {
  backCover: {
    subtitle: "Академические программы · 2026",
    scanLabel: "СКАНИРУЙТЕ ДЛЯ РЕГИСТРАЦИИ",
    websiteLabel: "САЙТ",
    website: "gate-assessment.org",
    emailLabel: "EMAIL",
    email: "info@gate-assessment.org",
    operatedByLabel: "ОРГАНИЗАТОР",
    operatedBy: "Chongqing Xinshijie\nTechnology Service Co., LTD",
    copyright: "© 2026 GATE ACADEMIC PROGRAMS",
  },
  hero: {
    editionBadge: "ИЗДАНИЕ 2026",
    titleLine1: "Академические",
    titleLine2: "программы",
    tagline: "Одна программа.\nОдин академический путь.",
    partnershipLabel: "В ПАРТНЁРСТВЕ С",
    partnershipName: "Xidian University",
    partnershipSubname: "Институт технологий Ханчжоу",
    partnershipChinese: "西安电子科技大学 · 杭州研究院",
  },
  about: {
    title: "О ПРОГРАММЕ",
    body: "Академические программы GATE дают школьникам 1–11 классов возможность развить академические способности по математике и английскому языку на основе международных образовательных стандартов.\n\nУчебный лагерь 2026 года проходит в Ханчжоуском кампусе Сидяньского университета и сочетает структурированные занятия, семинары и культурный обмен.\n\nЛучшие участники получают письмо об академическом отличии. Все участники получают сертификат об окончании программы GATE 2026.",
  },
  atGlance: {
    title: "ВКРАТЦЕ",
    eventLabel: "УЧЕБНЫЙ ЛАГЕРЬ В ХАНЧЖОУ",
    eventSummary: "19 – 25 июля 2026 · 7 дней · 1 000 USD",
  },
  event: {
    tag: "Программа",
    titleTop: "Учебный лагерь",
    titleBottom: "в Ханчжоу",
    meta: [
      { icon: "subjects", label: "ПРЕДМЕТЫ", value: "Математика · Английский" },
      { icon: "calendar", label: "ДАТА", value: "19 – 25 июля 2026 · 7 дней" },
      { icon: "pin", label: "МЕСТО", value: "Xidian University, Ханчжоу" },
      { icon: "fee", label: "СТОИМОСТЬ", value: "1 000 USD · всё включено" },
    ],
    includedTitle: "ВКЛЮЧЕНО",
    included: [
      "Ежедневные лекции преподавателей университета",
      "Семинары по решению задач в малых группах",
      "Размещение в студенческом общежитии",
      "Питание в университетской столовой",
      "Доступ к лекционным залам и компьютерным лабораториям",
      "Культурные экскурсии по Ханчжоу",
    ],
    eligibilityTitle: "КТО МОЖЕТ УЧАСТВОВАТЬ",
    eligibility:
      "Открыт для школьников 1–12 классов. Предварительное участие в других программах GATE не требуется.",
  },
  enroll: {
    tag: "РЕГИСТРАЦИЯ",
    title: "Как принять участие",
    steps: [
      {
        number: "01",
        title: "ПЕРЕЙДИТЕ НА САЙТ",
        text: "Отсканируйте QR-код или откройте gate-assessment.org в браузере.",
      },
      {
        number: "02",
        title: "СОЗДАЙТЕ АККАУНТ",
        text: "Зарегистрируйтесь как участник и заполните форму зачисления.",
      },
      {
        number: "03",
        title: "ПОДТВЕРДИТЕ УЧАСТИЕ",
        text: "Оплатите участие и получите официальное подтверждение.",
      },
    ],
    keyDatesTitle: "ВАЖНЫЕ ДАТЫ",
    keyDates: [
      { label: "ЛАГЕРЬ В ХАНЧЖОУ — РЕГИСТРАЦИЯ ЗАКРЫВАЕТСЯ", date: "30 июня 2026" },
    ],
    ctaUrl: "GATE-ASSESSMENT.ORG",
    contactLabel: "Вопросы?",
    email: "info@gate-assessment.org",
  },
};
